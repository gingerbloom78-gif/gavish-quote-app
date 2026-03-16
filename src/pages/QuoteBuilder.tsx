import { useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Hammer, Droplets, Paintbrush, Wrench, Building,
  Plus, Eye, Camera, X,
} from 'lucide-react'
import { useQuoteContext } from '../context/QuoteContext'
import { catalog } from '../data/catalog'
import CategorySheet from '../components/builder/CategorySheet'
import SelectedItemCard from '../components/builder/SelectedItemCard'
import CustomItemSheet from '../components/builder/CustomItemSheet'
import VoiceButton from '../components/builder/VoiceButton'
import EmptyState from '../components/ui/EmptyState'
import Header from '../components/layout/Header'
import { recalculateQuoteTotals } from '../utils/calculations'
import { formatCurrency } from '../utils/formatters'
import type { QuoteLineItem, CatalogItem, CatalogCategory, QuotePhoto } from '../types'
import { v4 as uuidv4 } from 'uuid'
import { trackItemUsage } from '../services/storage'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Hammer, Droplets, Paintbrush, Wrench, Building,
  PaintBucket: Paintbrush,
}

export default function QuoteBuilder() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getQuoteById, updateQuote } = useQuoteContext()

  const quote = id ? getQuoteById(id) : undefined
  const [items, setItems] = useState<QuoteLineItem[]>(quote?.lineItems || [])
  const [activeCat, setActiveCat] = useState<CatalogCategory | null>(null)
  const [showCustom, setShowCustom] = useState(false)
  const [introText, setIntroText] = useState(quote?.introText || '')
  const [notes, setNotes] = useState(quote?.notes || '')
  const [photos, setPhotos] = useState<QuotePhoto[]>(quote?.photos || [])
  const photoInputRef = useRef<HTMLInputElement>(null)
  const photoAddInputRef = useRef<HTMLInputElement>(null)

  const totals = recalculateQuoteTotals(items)

  const handleAddFromCatalog = useCallback((catalogItems: CatalogItem[], quantities: Record<string, { qty: number; price: number }>) => {
    const newItems: QuoteLineItem[] = catalogItems.map((ci) => {
      const q = quantities[ci.id] || { qty: 1, price: ci.basePrice || 0 }
      trackItemUsage(ci.id)
      return {
        id: uuidv4(),
        catalogItemId: ci.id,
        title: ci.title,
        bullets: [...ci.bullets],
        quantity: q.qty,
        unit: ci.unit,
        unitPrice: q.price,
        lineTotal: q.qty * q.price,
      }
    })
    setItems((prev) => [...prev, ...newItems])
    setActiveCat(null)
  }, [])

  const handleAddCustom = useCallback((item: Omit<QuoteLineItem, 'id' | 'lineTotal'>) => {
    const newItem: QuoteLineItem = {
      ...item,
      id: uuidv4(),
      lineTotal: item.quantity * item.unitPrice,
    }
    setItems((prev) => [...prev, newItem])
    setShowCustom(false)
  }, [])

  const handleUpdateItem = useCallback((updated: QuoteLineItem) => {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
  }, [])

  const handleDeleteItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId))
  }, [])

  const handleDuplicateItem = useCallback((itemId: string) => {
    setItems((prev) => {
      const original = prev.find((i) => i.id === itemId)
      if (!original) return prev
      return [...prev, { ...original, id: uuidv4() }]
    })
  }, [])

  const handlePhotoUpload = useCallback((files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const src = e.target?.result as string
        const img = new Image()
        img.onload = () => {
          const MAX = 1200
          const scale = Math.min(1, MAX / Math.max(img.width, img.height))
          const canvas = document.createElement('canvas')
          canvas.width = Math.round(img.width * scale)
          canvas.height = Math.round(img.height * scale)
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
          const photo: QuotePhoto = {
            id: uuidv4(),
            dataUrl,
            comment: '',
            createdAt: new Date().toISOString(),
          }
          setPhotos((prev) => [...prev, photo])
        }
        img.src = src
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const handlePhotoComment = useCallback((id: string, comment: string) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, comment } : p)))
  }, [])

  const handlePhotoDelete = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const handleSaveAndPreview = () => {
    if (quote) {
      const newTotals = recalculateQuoteTotals(items)
      updateQuote({
        ...quote,
        lineItems: items,
        introText,
        notes,
        photos,
        ...newTotals,
      })
      navigate(`/quote/${quote.id}`)
    }
  }

  const handleSave = () => {
    if (quote) {
      const newTotals = recalculateQuoteTotals(items)
      updateQuote({
        ...quote,
        lineItems: items,
        introText,
        notes,
        photos,
        ...newTotals,
      })
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-surface pb-48">
      <Header
        title={quote?.quoteNumber ? `הצעה ${quote.quoteNumber}` : 'בונה הצעה'}
        onBack={() => navigate(-1)}
        action={
          <button
            onClick={handleSave}
            className="text-xs font-bold text-[#1e3a5f] bg-white/50 px-3 py-1.5 rounded-xl touch-feedback shadow-sm"
          >
            שמור
          </button>
        }
      />

      <div className="max-w-lg mx-auto px-4">
        {/* ── Intro Text ── */}
        <div className="mt-4 mb-3">
          <input
            value={introText}
            onChange={(e) => setIntroText(e.target.value)}
            placeholder="טקסט פתיחה (אופציונלי)..."
            className="w-full bg-white rounded-xl px-4 py-3 text-sm border border-gray-100
                       focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all
                       placeholder:text-gray-400 shadow-sm"
          />
        </div>

        {/* ── Category Cards ── */}
        <h2 className="font-bold text-navy text-sm mb-2">בחר קטגוריה</h2>
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {catalog.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Hammer
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat)}
                className="relative bg-white rounded-2xl p-3.5 flex flex-col items-center gap-2
                           shadow-premium border border-gray-50 touch-feedback overflow-hidden group"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color}
                                flex items-center justify-center shadow-sm
                                group-active:scale-95 transition-transform`}>
                  <Icon size={20} className="text-white" />
                </div>
                <span className="text-xs font-bold text-navy leading-tight text-center">{cat.name}</span>
                <span className="text-[10px] text-gray-400">{cat.items.length} פריטים</span>
              </button>
            )
          })}
        </div>

        {/* ── Selected Items ── */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-navy text-sm">
            פריטים נבחרים ({items.length})
          </h2>
          <button
            onClick={() => setShowCustom(true)}
            className="text-accent text-xs font-bold flex items-center gap-1 touch-feedback"
          >
            <Plus size={14} />
            פריט מותאם
          </button>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={<Hammer size={28} />}
            title="אין פריטים עדיין"
            description="בחר קטגוריה למעלה או הוסף פריט מותאם אישית"
          />
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <SelectedItemCard
                key={item.id}
                item={item}
                index={idx + 1}
                onUpdate={handleUpdateItem}
                onDelete={handleDeleteItem}
                onDuplicate={handleDuplicateItem}
              />
            ))}
          </div>
        )}

        {/* ── Notes ── */}
        {items.length > 0 && (
          <div className="mt-4">
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הערות להצעה..."
              className="w-full bg-white rounded-xl px-4 py-3 text-sm border border-gray-100
                         focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all
                         placeholder:text-gray-400 shadow-sm"
            />
          </div>
        )}

        {/* ── Photos ── */}
        <div className="mt-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-navy text-sm">
              תמונות לצירוף ({photos.length})
            </h2>
            <label className="text-accent text-xs font-bold flex items-center gap-1 touch-feedback cursor-pointer">
              <Camera size={14} />
              הוסף תמונה
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                className="hidden"
                onChange={(e) => handlePhotoUpload(e.target.files)}
              />
            </label>
          </div>

          {photos.length === 0 ? (
            <label className="flex flex-col items-center justify-center gap-2 w-full py-8
                              border-2 border-dashed border-gray-200 rounded-xl bg-white
                              cursor-pointer touch-feedback">
              <Camera size={28} className="text-gray-300" />
              <span className="text-xs text-gray-400">לחץ להוספת תמונות מהמצלמה או הגלריה</span>
              <input
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                className="hidden"
                onChange={(e) => handlePhotoUpload(e.target.files)}
              />
            </label>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="relative">
                    <img
                      src={photo.dataUrl}
                      alt=""
                      className="w-full object-cover"
                      style={{ maxHeight: '140px' }}
                    />
                    <button
                      onClick={() => handlePhotoDelete(photo.id)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 touch-feedback"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div className="px-2 py-1.5">
                    <input
                      value={photo.comment}
                      onChange={(e) => handlePhotoComment(photo.id, e.target.value)}
                      placeholder="הוסף תיאור..."
                      className="w-full text-xs bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-100
                                 outline-none focus:border-accent placeholder:text-gray-300"
                    />
                  </div>
                </div>
              ))}
              {/* Add more tile */}
              <label className="flex flex-col items-center justify-center gap-1 min-h-[100px]
                                border-2 border-dashed border-gray-200 rounded-xl bg-white
                                cursor-pointer touch-feedback">
                <Plus size={20} className="text-gray-300" />
                <span className="text-xs text-gray-400">הוסף תמונה</span>
                <input
                  ref={photoAddInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e.target.files)}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* ── Floating Voice Button ── */}
      <VoiceButton
        onTranscript={(transcript) => {
          handleAddCustom({
            title: transcript,
            bullets: [],
            quantity: 1,
            unit: 'פריט',
            unitPrice: 0,
            catalogItemId: undefined,
          })
        }}
      />

      {/* ── Sticky Bottom Summary Bar ── */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 glass-strong border-t border-gray-200 z-40 animate-slide-up">
          <div className="max-w-lg mx-auto px-4 py-3 pb-safe">
            {/* Totals row */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>{items.length} פריטים</span>
              <div className="flex gap-3">
                <span>לפני מע״מ: {formatCurrency(totals.subtotal)}</span>
                <span>מע״מ: {formatCurrency(totals.vatAmount)}</span>
              </div>
            </div>

            {/* Total + CTAs */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-400">סה״כ</p>
                <p className="text-xl font-black text-navy">{formatCurrency(totals.total)}</p>
              </div>
              <button
                onClick={() => setShowCustom(true)}
                className="bg-white text-navy font-medium text-sm py-3 px-4 rounded-xl
                           border border-gray-200 touch-feedback"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={handleSaveAndPreview}
                className="flex items-center gap-2 bg-accent text-white font-bold text-sm
                           py-3 px-5 rounded-xl shadow-lg shadow-accent/25 touch-feedback"
              >
                <Eye size={16} />
                צפה בהצעה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Sheets ── */}
      <CategorySheet
        category={activeCat}
        onClose={() => setActiveCat(null)}
        onAddItems={handleAddFromCatalog}
        existingItemIds={items.filter((i) => i.catalogItemId).map((i) => i.catalogItemId!)}
      />

      <CustomItemSheet
        isOpen={showCustom}
        onClose={() => setShowCustom(false)}
        onAdd={handleAddCustom}
      />
    </div>
  )
}
