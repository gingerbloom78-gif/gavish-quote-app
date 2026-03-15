import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, Users, Layers, Plus, Pencil, Trash2, X, Check,
  ChevronDown, ChevronUp, Phone, MapPin, Save,
} from 'lucide-react'
import { useQuoteContext } from '../context/QuoteContext'
import { catalog } from '../data/catalog'
import BottomSheet from '../components/ui/BottomSheet'
import type { Client, CatalogCategory, CatalogItem } from '../types'
import { v4 as uuidv4 } from 'uuid'

type Tab = 'clients' | 'catalog'

export default function Settings() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('clients')

  return (
    <div className="min-h-screen bg-surface pb-8">
      {/* Header */}
      <div className="bg-navy text-white px-5 pt-10 pb-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button onClick={() => navigate('/')} className="p-2 -mr-2 touch-feedback">
            <ArrowRight size={20} />
          </button>
          <h1 className="font-bold text-base">הגדרות</h1>
          <div className="w-9" />
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="max-w-lg mx-auto px-5 mt-4">
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
          <button
            onClick={() => setTab('clients')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold
                        transition-all ${tab === 'clients'
                          ? 'bg-accent text-white shadow-md'
                          : 'text-gray-500'}`}
          >
            <Users size={16} />
            לקוחות
          </button>
          <button
            onClick={() => setTab('catalog')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold
                        transition-all ${tab === 'catalog'
                          ? 'bg-accent text-white shadow-md'
                          : 'text-gray-500'}`}
          >
            <Layers size={16} />
            סעיפי הצעה
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-5 mt-4">
        {tab === 'clients' ? <ClientsTab /> : <CatalogTab />}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   CLIENTS TAB
   ═══════════════════════════════════════════════ */

function ClientsTab() {
  const { clients, addClient } = useQuoteContext()
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')

  // Local state for client list editing (since context doesn't expose updateClient/deleteClient directly)
  const [localClients, setLocalClients] = useState<Client[]>(clients)
  const [newClient, setNewClient] = useState<Omit<Client, 'id' | 'createdAt'>>({
    name: '', phone: '', address: '',
  })

  const filtered = localClients.filter((c) =>
    c.name.includes(search) || c.phone.includes(search) || c.address.includes(search)
  )

  const handleAddClient = () => {
    if (!newClient.name.trim()) return
    const created = addClient(newClient)
    setLocalClients((prev) => [...prev, created])
    setNewClient({ name: '', phone: '', address: '' })
    setShowAdd(false)
  }

  const handleUpdateClient = (updated: Client) => {
    setLocalClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    setEditingClient(null)
  }

  const handleDeleteClient = (id: string) => {
    setLocalClients((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div>
      {/* Search + Add */}
      <div className="flex items-center gap-2 mb-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חפש לקוח..."
          className="flex-1 bg-white rounded-xl px-4 py-2.5 text-sm border border-gray-100
                     outline-none focus:border-accent placeholder:text-gray-400 shadow-sm"
        />
        <button
          onClick={() => setShowAdd(true)}
          className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center
                     shadow-md shadow-accent/20 touch-feedback shrink-0"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Client List */}
      <div className="space-y-2">
        {filtered.map((client) => (
          <div key={client.id} className="bg-white rounded-xl p-3.5 shadow-premium border border-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-navy">{client.name}</h3>
                {client.phone && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Phone size={11} className="text-gray-400" />
                    <span className="text-xs text-gray-500" dir="ltr">{client.phone}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin size={11} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{client.address}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setEditingClient(client)}
                  className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center touch-feedback"
                >
                  <Pencil size={13} className="text-gray-400" />
                </button>
                <button
                  onClick={() => handleDeleteClient(client.id)}
                  className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center touch-feedback"
                >
                  <Trash2 size={13} className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          {search ? 'לא נמצאו לקוחות' : 'אין לקוחות עדיין'}
        </div>
      )}

      {/* Add Client Sheet */}
      <BottomSheet isOpen={showAdd} onClose={() => setShowAdd(false)} title="לקוח חדש" snap="half">
        <div className="space-y-3 pb-4">
          <div>
            <label className="text-xs font-bold text-navy mb-1 block">שם *</label>
            <input value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              placeholder="שם הלקוח"
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                         outline-none focus:border-accent placeholder:text-gray-400" />
          </div>
          <div>
            <label className="text-xs font-bold text-navy mb-1 block">טלפון</label>
            <input value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              placeholder="050-0000000" dir="ltr"
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                         outline-none focus:border-accent placeholder:text-gray-400 text-right" />
          </div>
          <div>
            <label className="text-xs font-bold text-navy mb-1 block">כתובת</label>
            <input value={newClient.address} onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
              placeholder="כתובת הלקוח"
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                         outline-none focus:border-accent placeholder:text-gray-400" />
          </div>
          <button onClick={handleAddClient} disabled={!newClient.name.trim()}
            className="w-full bg-accent text-white font-bold text-base py-3.5 rounded-2xl
                       shadow-lg shadow-accent/25 touch-feedback disabled:opacity-40 flex items-center justify-center gap-2">
            <Plus size={18} /> הוסף לקוח
          </button>
        </div>
      </BottomSheet>

      {/* Edit Client Sheet */}
      <BottomSheet
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        title="עריכת לקוח"
        snap="half"
      >
        {editingClient && (
          <div className="space-y-3 pb-4">
            <div>
              <label className="text-xs font-bold text-navy mb-1 block">שם</label>
              <input value={editingClient.name}
                onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                           outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs font-bold text-navy mb-1 block">טלפון</label>
              <input value={editingClient.phone}
                onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                dir="ltr"
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                           outline-none focus:border-accent text-right" />
            </div>
            <div>
              <label className="text-xs font-bold text-navy mb-1 block">כתובת</label>
              <input value={editingClient.address}
                onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                           outline-none focus:border-accent" />
            </div>
            <button onClick={() => handleUpdateClient(editingClient)}
              className="w-full bg-accent text-white font-bold text-base py-3.5 rounded-2xl
                         shadow-lg shadow-accent/25 touch-feedback flex items-center justify-center gap-2">
              <Save size={18} /> שמור שינויים
            </button>
          </div>
        )}
      </BottomSheet>
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
                        className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center touch-feedback"
                      >
                        <Pencil size={11} className="text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(cat.id, item.id)}
                        className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center touch-feedback"
                      >
                        <Trash2 size={11} className="text-gray-400" />
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
