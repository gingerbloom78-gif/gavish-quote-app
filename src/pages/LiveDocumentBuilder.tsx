import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { Eye } from 'lucide-react'
import { useQuoteContext } from '../context/QuoteContext'
import EditableQuoteDocument from '../components/preview/EditableQuoteDocument'
import AddItemTypeSheet from '../components/builder/AddItemTypeSheet'
import CategorySheet from '../components/builder/CategorySheet'
import CustomItemSheet from '../components/builder/CustomItemSheet'
import LiveBuilderFAB from '../components/builder/LiveBuilderFAB'
import BottomSheet from '../components/ui/BottomSheet'
import Header from '../components/layout/Header'
import { catalog } from '../data/catalog'
import type { QuoteLineItem, QuotePhoto, CatalogCategory, CatalogItem } from '../types'

const A4_WIDTH = 794

async function compressImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width)
          width = maxSize
        } else {
          width = Math.round((width * maxSize) / height)
          height = maxSize
        }
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.src = URL.createObjectURL(file)
  })
}

const CATEGORY_ICONS: Record<string, string> = {
  'concrete-repair': '🔨',
  'waterproofing': '💧',
  'plaster-repair': '🖌️',
  'crack-repair': '🔧',
  'facade-painting': '🎨',
  'height-work': '🏗️',
}

export default function LiveDocumentBuilder() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    getQuoteById,
    updateQuote,
    updateLineItem,
    removeLineItem,
    duplicateLineItem,
    insertLineItemAt,
    reorderLineItem,
  } = useQuoteContext()

  const quote = useMemo(() => (id ? getQuoteById(id) : undefined), [id, getQuoteById])

  // Scale state (same as QuotePreview)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const docRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [docHeight, setDocHeight] = useState(0)

  // Photo upload
  const photoInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Sheet state
  const [showAddTypeSheet, setShowAddTypeSheet] = useState(false)
  const [showCategoryList, setShowCategoryList] = useState(false)
  const [activeCat, setActiveCat] = useState<CatalogCategory | null>(null)
  const [showCustomSheet, setShowCustomSheet] = useState(false)
  const [editingItem, setEditingItem] = useState<QuoteLineItem | null>(null)
  const [insertAfterIndex, setInsertAfterIndex] = useState(-1)

  const measure = useCallback(() => {
    const wrapper = wrapperRef.current
    const doc = docRef.current
    if (!wrapper || !doc) return
    const available = wrapper.clientWidth - 32
    const s = Math.min(available / A4_WIDTH, 1)
    setScale(s)
    setDocHeight(doc.scrollHeight)
  }, [])

  useEffect(() => {
    measure()
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const ro = new ResizeObserver(measure)
    ro.observe(wrapper)
    return () => ro.disconnect()
  }, [measure])

  if (!quote) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">הצעת מחיר לא נמצאה</p>
      </div>
    )
  }

  // ── Insert / Add handlers ──────────────────────────────────────

  const handleInsertAfter = (afterIndex: number) => {
    setInsertAfterIndex(afterIndex)
    setShowAddTypeSheet(true)
  }

  const handleSelectCatalog = () => {
    setShowAddTypeSheet(false)
    setShowCategoryList(true)
  }

  const handleSelectCustom = () => {
    setShowAddTypeSheet(false)
    setEditingItem(null)
    setShowCustomSheet(true)
  }

  const handleSelectCategory = (cat: CatalogCategory) => {
    setShowCategoryList(false)
    setActiveCat(cat)
  }

  const handleAddCatalogItems = (items: CatalogItem[], quantities: Record<string, { qty: number; price: number }>) => {
    items.forEach((item, i) => {
      const qty = quantities[item.id] || { qty: 1, price: item.basePrice || 0 }
      insertLineItemAt(
        quote.id,
        {
          catalogItemId: item.id,
          title: item.title,
          bullets: item.bullets,
          quantity: qty.qty,
          unit: item.unit,
          unitPrice: qty.price,
        },
        insertAfterIndex < 0 ? -1 : insertAfterIndex + i,
      )
    })
    setActiveCat(null)
  }

  const handleAddCustomItem = (item: Omit<QuoteLineItem, 'id' | 'lineTotal'>) => {
    insertLineItemAt(quote.id, item, insertAfterIndex)
    setShowCustomSheet(false)
  }

  const handleEditItem = (item: QuoteLineItem) => {
    setEditingItem(item)
    setShowCustomSheet(true)
  }

  const handleUpdateItem = (item: QuoteLineItem) => {
    updateLineItem(quote.id, item)
    setEditingItem(null)
    setShowCustomSheet(false)
  }

  // ── Text edit handlers ──────────────────────────────────────────

  const handleUpdateIntroText = (text: string) => {
    updateQuote({ ...quote, introText: text })
  }

  const handleUpdateNotes = (text: string) => {
    updateQuote({ ...quote, notes: text })
  }

  // ── Photo handlers ──────────────────────────────────────────────

  const handleAddPhoto = () => {
    photoInputRef.current?.click()
  }

  const handleAddPhotoCamera = () => {
    cameraInputRef.current?.click()
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const newPhotos: QuotePhoto[] = []
    for (const file of files) {
      const dataUrl = await compressImage(file, 1200)
      newPhotos.push({
        id: uuidv4(),
        dataUrl,
        comment: '',
        createdAt: new Date().toISOString(),
      })
    }

    updateQuote({ ...quote, photos: [...(quote.photos || []), ...newPhotos] })
    if (e.target) e.target.value = ''
  }

  const handleDeletePhoto = (photoId: string) => {
    updateQuote({ ...quote, photos: (quote.photos || []).filter((p) => p.id !== photoId) })
  }

  const handleUpdatePhotoComment = (photoId: string, comment: string) => {
    updateQuote({
      ...quote,
      photos: (quote.photos || []).map((p) => p.id === photoId ? { ...p, comment } : p),
    })
  }

  const existingCatalogIds = quote.lineItems.map((li) => li.catalogItemId).filter(Boolean) as string[]

  return (
    <div className="min-h-screen bg-surface">
      <Header
        title={quote.quoteNumber ? `הצעה ${quote.quoteNumber}` : 'הצעת מחיר'}
        onBack={() => navigate('/')}
        action={
          <button
            onClick={() => navigate(`/quote/${quote.id}`)}
            className="w-9 h-9 rounded-full bg-white/40 flex items-center justify-center touch-feedback shadow-sm"
            title="תצוגה מקדימה"
          >
            <Eye size={17} className="text-[#1e3a5f]" />
          </button>
        }
      />

      <div ref={wrapperRef} className="mx-auto pt-5 px-4 overflow-hidden pb-28">
        <div
          ref={docRef}
          style={{
            width: `${A4_WIDTH}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top right',
            marginBottom: `${(scale - 1) * docHeight}px`,
          }}
        >
          <EditableQuoteDocument
            quote={quote}
            onUpdateItem={(item) => updateLineItem(quote.id, item)}
            onDeleteItem={(itemId) => removeLineItem(quote.id, itemId)}
            onDuplicateItem={(itemId) => duplicateLineItem(quote.id, itemId)}
            onReorderItem={(itemId, dir) => reorderLineItem(quote.id, itemId, dir)}
            onInsertAfter={handleInsertAfter}
            onEditItem={handleEditItem}
            onUpdateIntroText={handleUpdateIntroText}
            onUpdateNotes={handleUpdateNotes}
            onAddPhoto={handleAddPhoto}
            onAddPhotoCamera={handleAddPhotoCamera}
            onDeletePhoto={handleDeletePhoto}
            onUpdatePhotoComment={handleUpdatePhotoComment}
          />
        </div>
      </div>

      {/* Hidden photo file inputs */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handlePhotoChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoChange}
      />

      {/* Sticky bottom bar */}
      <LiveBuilderFAB quote={quote} />

      {/* ── Add type sheet ── */}
      <AddItemTypeSheet
        isOpen={showAddTypeSheet}
        onClose={() => setShowAddTypeSheet(false)}
        onSelectCatalog={handleSelectCatalog}
        onSelectCustom={handleSelectCustom}
      />

      {/* ── Category list sheet ── */}
      <BottomSheet
        isOpen={showCategoryList}
        onClose={() => setShowCategoryList(false)}
        title="בחר קטגוריה"
      >
        <div className="grid grid-cols-2 gap-3 pb-6">
          {catalog.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat)}
              className={`bg-gradient-to-br ${cat.color} text-white font-bold py-4 px-3 rounded-2xl
                         flex flex-col items-center gap-2 shadow-md touch-feedback`}
            >
              <span className="text-2xl">{CATEGORY_ICONS[cat.id] ?? '🔧'}</span>
              <span className="text-sm text-center leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* ── Category items sheet ── */}
      <CategorySheet
        category={activeCat}
        onClose={() => setActiveCat(null)}
        onAddItems={handleAddCatalogItems}
        existingItemIds={existingCatalogIds}
      />

      {/* ── Custom / Edit item sheet ── */}
      <CustomItemSheet
        isOpen={showCustomSheet}
        onClose={() => {
          setShowCustomSheet(false)
          setEditingItem(null)
        }}
        onAdd={handleAddCustomItem}
        initialValues={editingItem ?? undefined}
        onUpdate={handleUpdateItem}
        mode={editingItem ? 'edit' : 'add'}
      />
    </div>
  )
}
