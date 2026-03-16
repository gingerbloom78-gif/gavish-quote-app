import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layers, Plus, Pencil, Trash2, X, Check,
  ChevronDown, ChevronUp,
  Hammer, Droplets, Paintbrush, Wrench, Building,
} from 'lucide-react'
import Header from '../components/layout/Header'
import { catalog } from '../data/catalog'
import BottomSheet from '../components/ui/BottomSheet'
import type { CatalogCategory, CatalogItem } from '../types'
import { v4 as uuidv4 } from 'uuid'

const ICON_OPTIONS = [
  { name: 'Hammer',     Icon: Hammer },
  { name: 'Droplets',   Icon: Droplets },
  { name: 'Paintbrush', Icon: Paintbrush },
  { name: 'Wrench',     Icon: Wrench },
  { name: 'Building',   Icon: Building },
  { name: 'Layers',     Icon: Layers },
]

const COLOR_OPTIONS = [
  'from-amber-500 to-orange-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-red-500 to-rose-600',
  'from-violet-500 to-purple-600',
  'from-slate-500 to-gray-700',
  'from-pink-500 to-fuchsia-600',
  'from-lime-500 to-green-600',
]

export default function Settings() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-surface pb-8">
      <Header title="הגדרות" onBack={() => navigate('/')} />
      <div className="max-w-lg mx-auto px-5 mt-4">
        <CatalogTab />
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════
   CATALOG TAB — manage categories & items
   ═══════════════════════════════════════════════ */

function CatalogTab() {
  const [categories, setCategories] = useState<CatalogCategory[]>(catalog)
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<{ catId: string; item: CatalogItem } | null>(null)
  const [addingItemCatId, setAddingItemCatId] = useState<string | null>(null)
  const [addingCategory, setAddingCategory] = useState(false)

  const toggleCat = (catId: string) => {
    setExpandedCat(expandedCat === catId ? null : catId)
  }

  const handleUpdateItem = (catId: string, updatedItem: CatalogItem) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === catId
          ? { ...cat, items: cat.items.map((i) => (i.id === updatedItem.id ? updatedItem : i)) }
          : cat,
      ),
    )
    setEditingItem(null)
  }

  const handleDeleteItem = (catId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === catId
          ? { ...cat, items: cat.items.filter((i) => i.id !== itemId) }
          : cat,
      ),
    )
  }

  const handleAddItem = (catId: string, item: CatalogItem) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === catId ? { ...cat, items: [...cat.items, item] } : cat,
      ),
    )
    setAddingItemCatId(null)
  }

  const handleAddCategory = (cat: CatalogCategory) => {
    setCategories((prev) => [...prev, cat])
    setAddingCategory(false)
    setExpandedCat(cat.id)
  }

  return (
    <div className="space-y-2">
      {categories.map((cat) => {
        const isExpanded = expandedCat === cat.id
        return (
          <div key={cat.id} className="bg-white rounded-xl shadow-premium border border-gray-50 overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => toggleCat(cat.id)}
              className="w-full flex items-center gap-3 p-3.5 touch-feedback"
            >
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cat.color}
                              flex items-center justify-center`}>
                <Layers size={16} className="text-white" />
              </div>
              <div className="flex-1 text-right">
                <h3 className="font-bold text-sm text-navy">{cat.name}</h3>
                <span className="text-[10px] text-gray-400">{cat.items.length} סעיפים</span>
              </div>
              {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>

            {/* Items List */}
            {isExpanded && (
              <div className="border-t border-gray-50 animate-fade-in">
                {cat.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2.5 px-4 py-3 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-[10px] text-gray-400 bg-gray-100 w-5 h-5 rounded-full
                                    flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-navy">{item.title}</h4>
                      {item.bullets.length > 0 && (
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                          {item.bullets.slice(0, 2).join(' • ')}
                          {item.bullets.length > 2 && ` +${item.bullets.length - 2}`}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {item.basePrice && (
                          <span className="text-[10px] text-accent font-bold">₪{item.basePrice.toLocaleString()}</span>
                        )}
                        <span className="text-[10px] text-gray-400">/ {item.unit}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditingItem({ catId: cat.id, item: { ...item } })}
                        className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center touch-feedback"
                      >
                        <Pencil size={13} className="text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(cat.id, item.id)}
                        className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center touch-feedback"
                      >
                        <Trash2 size={13} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Item Button */}
                <button
                  onClick={() => setAddingItemCatId(cat.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-3 text-xs text-accent
                             font-bold touch-feedback bg-accent/5"
                >
                  <Plus size={14} />
                  הוסף סעיף חדש
                </button>
              </div>
            )}
          </div>
        )
      })}

      {/* Add Category Button */}
      <button
        onClick={() => setAddingCategory(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2
                   border-dashed border-accent/30 text-accent text-sm font-bold touch-feedback
                   hover:border-accent/60 hover:bg-accent/5 transition-colors"
      >
        <Plus size={16} />
        הוסף קטגוריה חדשה
      </button>

      {/* Edit Item Sheet */}
      <EditItemSheet
        data={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={(catId, item) => handleUpdateItem(catId, item)}
      />

      {/* Add Item Sheet */}
      <AddItemSheet
        catId={addingItemCatId}
        onClose={() => setAddingItemCatId(null)}
        onAdd={handleAddItem}
      />

      {/* Add Category Sheet */}
      <AddCategorySheet
        isOpen={addingCategory}
        onClose={() => setAddingCategory(false)}
        onAdd={handleAddCategory}
      />
    </div>
  )
}


/* ── Edit Item Sheet ── */

function EditItemSheet({
  data,
  onClose,
  onSave,
}: {
  data: { catId: string; item: CatalogItem } | null
  onClose: () => void
  onSave: (catId: string, item: CatalogItem) => void
}) {
  const [item, setItem] = useState<CatalogItem | null>(null)
  const [newBullet, setNewBullet] = useState('')

  // Sync local state with data
  if (data && (!item || item.id !== data.item.id)) {
    setItem({ ...data.item })
  }

  if (!data || !item) return null

  const handleBulletChange = (idx: number, text: string) => {
    const bullets = [...item.bullets]
    bullets[idx] = text
    setItem({ ...item, bullets })
  }

  const handleDeleteBullet = (idx: number) => {
    setItem({ ...item, bullets: item.bullets.filter((_, i) => i !== idx) })
  }

  const handleAddBullet = () => {
    if (!newBullet.trim()) return
    setItem({ ...item, bullets: [...item.bullets, newBullet.trim()] })
    setNewBullet('')
  }

  return (
    <BottomSheet isOpen={!!data} onClose={() => { onClose(); setItem(null) }} title="עריכת סעיף">
      <div className="space-y-3 pb-4">
        {/* Title */}
        <div>
          <label className="text-xs font-bold text-navy mb-1 block">שם הסעיף</label>
          <input
            value={item.title}
            onChange={(e) => setItem({ ...item, title: e.target.value })}
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                       outline-none focus:border-accent font-bold"
          />
        </div>

        {/* Price + Unit */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-bold text-navy mb-1 block">מחיר בסיס (₪)</label>
            <input
              type="number"
              value={item.basePrice || ''}
              onChange={(e) => setItem({ ...item, basePrice: Number(e.target.value) || undefined })}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                         outline-none focus:border-accent text-center font-bold"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-navy mb-1 block">יחידה</label>
            <input
              value={item.unit}
              onChange={(e) => setItem({ ...item, unit: e.target.value })}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                         outline-none focus:border-accent text-center font-bold"
            />
          </div>
        </div>

        {/* Bullets */}
        <div>
          <label className="text-xs font-bold text-navy mb-1 block">שלבי עבודה</label>
          <div className="space-y-1.5">
            {item.bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400 w-4 shrink-0">{i + 1}.</span>
                <input
                  value={b}
                  onChange={(e) => handleBulletChange(i, e.target.value)}
                  className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-xs border border-gray-100
                             outline-none focus:border-accent"
                />
                <button
                  onClick={() => handleDeleteBullet(i)}
                  className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center touch-feedback"
                >
                  <X size={12} className="text-danger" />
                </button>
              </div>
            ))}
          </div>

          {/* Add bullet */}
          <div className="flex items-center gap-1.5 mt-2">
            <input
              value={newBullet}
              onChange={(e) => setNewBullet(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddBullet()}
              placeholder="הוסף שלב..."
              className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-xs border border-gray-100
                         outline-none focus:border-accent placeholder:text-gray-400"
            />
            <button
              onClick={handleAddBullet}
              className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center touch-feedback"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={() => { onSave(data.catId, item); setItem(null) }}
          className="w-full bg-accent text-white font-bold text-base py-3.5 rounded-2xl
                     shadow-lg shadow-accent/25 touch-feedback flex items-center justify-center gap-2"
        >
          <Check size={18} /> שמור
        </button>
      </div>
    </BottomSheet>
  )
}


/* ── Add Item Sheet ── */

function AddItemSheet({
  catId,
  onClose,
  onAdd,
}: {
  catId: string | null
  onClose: () => void
  onAdd: (catId: string, item: CatalogItem) => void
}) {
  const [title, setTitle] = useState('')
  const [unit, setUnit] = useState('פריט')
  const [basePrice, setBasePrice] = useState(0)
  const [bullets, setBullets] = useState<string[]>([])
  const [newBullet, setNewBullet] = useState('')

  const handleAdd = () => {
    if (!catId || !title.trim()) return
    const item: CatalogItem = {
      id: uuidv4(),
      categoryId: catId,
      title: title.trim(),
      bullets,
      basePrice: basePrice || undefined,
      unit,
      usageCount: 0,
      isCustom: true,
    }
    onAdd(catId, item)
    // Reset
    setTitle('')
    setUnit('פריט')
    setBasePrice(0)
    setBullets([])
    setNewBullet('')
  }

  const handleAddBullet = () => {
    if (!newBullet.trim()) return
    setBullets((prev) => [...prev, newBullet.trim()])
    setNewBullet('')
  }

  return (
    <BottomSheet isOpen={!!catId} onClose={onClose} title="סעיף חדש">
      <div className="space-y-3 pb-4">
        <div>
          <label className="text-xs font-bold text-navy mb-1 block">שם הסעיף *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="לדוגמה: תיקון סדקים בתקרה"
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                       outline-none focus:border-accent placeholder:text-gray-400"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-bold text-navy mb-1 block">מחיר (₪)</label>
            <input type="number" value={basePrice || ''}
              onChange={(e) => setBasePrice(Number(e.target.value) || 0)}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                         outline-none focus:border-accent text-center font-bold" />
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-navy mb-1 block">יחידה</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                         outline-none focus:border-accent font-bold appearance-none text-center">
              {['פריט', 'מ"ר', 'מ"א', 'יום', 'שעה', 'קומה', "יח'"].map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bullets */}
        <div>
          <label className="text-xs font-bold text-navy mb-1 block">שלבי עבודה</label>
          <div className="space-y-1.5">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400 w-4 shrink-0">{i + 1}.</span>
                <span className="flex-1 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                  {b}
                </span>
                <button onClick={() => setBullets((prev) => prev.filter((_, j) => j !== i))}
                  className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center touch-feedback">
                  <X size={12} className="text-danger" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <input
              value={newBullet}
              onChange={(e) => setNewBullet(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddBullet()}
              placeholder="הוסף שלב..."
              className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-xs border border-gray-100
                         outline-none focus:border-accent placeholder:text-gray-400"
            />
            <button onClick={handleAddBullet}
              className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center touch-feedback">
              <Plus size={12} />
            </button>
          </div>
        </div>

        <button onClick={handleAdd} disabled={!title.trim()}
          className="w-full bg-accent text-white font-bold text-base py-3.5 rounded-2xl
                     shadow-lg shadow-accent/25 touch-feedback disabled:opacity-40 flex items-center justify-center gap-2">
          <Plus size={18} /> הוסף סעיף
        </button>
      </div>
    </BottomSheet>
  )
}


/* ── Add Category Sheet ── */

function AddCategorySheet({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (cat: CatalogCategory) => void
}) {
  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('Hammer')
  const [selectedColor, setSelectedColor] = useState('from-amber-500 to-orange-600')

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd({
      id: uuidv4(),
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      items: [],
    })
    setName('')
    setSelectedIcon('Hammer')
    setSelectedColor('from-amber-500 to-orange-600')
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="קטגוריה חדשה">
      <div className="space-y-4 pb-4">
        {/* Name */}
        <div>
          <label className="text-xs font-bold text-navy mb-1 block">שם הקטגוריה *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="לדוגמה: עבודות גבס"
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                       outline-none focus:border-accent placeholder:text-gray-400"
          />
        </div>

        {/* Icon picker */}
        <div>
          <label className="text-xs font-bold text-navy mb-2 block">אייקון</label>
          <div className="flex gap-2">
            {ICON_OPTIONS.map(({ name: iconName, Icon }) => (
              <button
                key={iconName}
                onClick={() => setSelectedIcon(iconName)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all touch-feedback
                  ${selectedIcon === iconName
                    ? 'bg-accent text-white shadow-lg shadow-accent/25 scale-105'
                    : 'bg-gray-100 text-gray-500'}`}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div>
          <label className="text-xs font-bold text-navy mb-2 block">צבע</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-9 h-9 rounded-xl bg-gradient-to-br transition-all touch-feedback ${color}
                  ${selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        {name.trim() && (
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${selectedColor} flex items-center justify-center`}>
              {(() => {
                const { Icon } = ICON_OPTIONS.find((o) => o.name === selectedIcon) ?? ICON_OPTIONS[0]
                return <Icon size={16} className="text-white" />
              })()}
            </div>
            <span className="font-bold text-sm text-navy">{name}</span>
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={!name.trim()}
          className="w-full bg-accent text-white font-bold text-base py-3.5 rounded-2xl
                     shadow-lg shadow-accent/25 touch-feedback disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Plus size={18} /> הוסף קטגוריה
        </button>
      </div>
    </BottomSheet>
  )
}
