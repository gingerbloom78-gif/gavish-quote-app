import { useState } from 'react'
import { Trash2, Copy, ChevronDown, ChevronUp, GripVertical, Plus, X, Pencil } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'
import type { QuoteLineItem } from '../../types'

interface SelectedItemCardProps {
  item: QuoteLineItem
  index: number
  onUpdate: (item: QuoteLineItem) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}

export default function SelectedItemCard({ item, index, onUpdate, onDelete, onDuplicate }: SelectedItemCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingBulletIdx, setEditingBulletIdx] = useState<number | null>(null)
  const [newBulletText, setNewBulletText] = useState('')
  const [showAddBullet, setShowAddBullet] = useState(false)

  const handleFieldChange = (field: keyof QuoteLineItem, value: string | number) => {
    const updated = { ...item, [field]: value }
    if (field === 'quantity' || field === 'unitPrice') {
      updated.lineTotal = (field === 'quantity' ? Number(value) : item.quantity)
        * (field === 'unitPrice' ? Number(value) : item.unitPrice)
    }
    onUpdate(updated)
  }

  const handleUpdateBullet = (idx: number, text: string) => {
    const newBullets = [...item.bullets]
    newBullets[idx] = text
    onUpdate({ ...item, bullets: newBullets })
  }

  const handleDeleteBullet = (idx: number) => {
    const newBullets = item.bullets.filter((_, i) => i !== idx)
    onUpdate({ ...item, bullets: newBullets })
    setEditingBulletIdx(null)
  }

  const handleAddBullet = () => {
    if (!newBulletText.trim()) return
    onUpdate({ ...item, bullets: [...item.bullets, newBulletText.trim()] })
    setNewBulletText('')
    setShowAddBullet(false)
  }

  const handleMoveBullet = (idx: number, direction: 'up' | 'down') => {
    const newBullets = [...item.bullets]
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= newBullets.length) return
    ;[newBullets[idx], newBullets[targetIdx]] = [newBullets[targetIdx], newBullets[idx]]
    onUpdate({ ...item, bullets: newBullets })
  }

  return (
    <div className="bg-white rounded-2xl shadow-premium border border-gray-50 overflow-hidden animate-scale-in">
      {/* Main Row */}
      <div className="flex items-start gap-2.5 p-3.5">
        {/* Drag handle + index */}
        <div className="flex flex-col items-center gap-0.5 pt-1 flex-shrink-0">
          <GripVertical size={14} className="text-gray-300" />
          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 w-5 h-5 rounded-full
                          flex items-center justify-center">{index}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <input
              value={item.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
              autoFocus
              className="w-full font-bold text-sm text-navy bg-gray-50 rounded-lg px-2 py-1
                         border border-accent/30 outline-none"
            />
          ) : (
            <button
              className="font-bold text-sm text-navy text-right flex items-center gap-1 group"
              onClick={() => setEditingTitle(true)}
            >
              {item.title}
              <Pencil size={11} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}

          {/* Quick numbers row */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleFieldChange('quantity', Number(e.target.value) || 0)}
                className="w-14 bg-gray-50 rounded-lg px-2 py-1.5 text-xs font-bold text-navy
                           text-center border border-gray-100 outline-none focus:border-accent"
              />
              <span className="text-[10px] text-gray-400">{item.unit}</span>
            </div>
            <span className="text-gray-300">×</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-400">₪</span>
              <input
                type="number"
                value={item.unitPrice}
                onChange={(e) => handleFieldChange('unitPrice', Number(e.target.value) || 0)}
                className="w-20 bg-gray-50 rounded-lg px-2 py-1.5 text-xs font-bold text-navy
                           text-center border border-gray-100 outline-none focus:border-accent"
              />
            </div>
            <span className="text-gray-300">=</span>
            <span className="text-sm font-black text-accent whitespace-nowrap">
              {formatCurrency(item.lineTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable bullets — fully editable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-gray-400
                   border-t border-gray-50 touch-feedback"
      >
        {expanded ? (
          <>הסתר פירוט <ChevronUp size={12} /></>
        ) : (
          <>הצג פירוט ({item.bullets.length}) <ChevronDown size={12} /></>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-3 animate-fade-in">
          <ul className="space-y-1.5">
            {item.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-1.5 group">
                <span className="text-gray-300 shrink-0 text-xs mt-1 w-4 text-left">{i + 1}.</span>

                {editingBulletIdx === i ? (
                  <div className="flex-1 flex flex-col gap-1">
                    <input
                      value={b}
                      onChange={(e) => handleUpdateBullet(i, e.target.value)}
                      onBlur={() => setEditingBulletIdx(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingBulletIdx(null)}
                      autoFocus
                      className="w-full text-xs text-navy bg-gray-50 rounded-lg px-2 py-1.5
                                 border border-accent/30 outline-none"
                    />
                    <div className="flex items-center gap-1">
                      {i > 0 && (
                        <button
                          onMouseDown={(e) => { e.preventDefault(); handleMoveBullet(i, 'up') }}
                          className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded"
                        >↑</button>
                      )}
                      {i < item.bullets.length - 1 && (
                        <button
                          onMouseDown={(e) => { e.preventDefault(); handleMoveBullet(i, 'down') }}
                          className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded"
                        >↓</button>
                      )}
                      <div className="flex-1" />
                      <button
                        onMouseDown={(e) => { e.preventDefault(); handleDeleteBullet(i) }}
                        className="text-[10px] text-danger bg-red-50 px-1.5 py-0.5 rounded flex items-center gap-0.5"
                      >
                        <Trash2 size={9} /> מחק
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="flex-1 text-xs text-gray-500 text-right hover:text-navy transition-colors
                               cursor-pointer flex items-center gap-1"
                    onClick={() => setEditingBulletIdx(i)}
                  >
                    <span className="flex-1">{b}</span>
                    <Pencil size={9} className="text-gray-300 opacity-0 group-hover:opacity-100
                                                transition-opacity shrink-0" />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Add new bullet */}
          {showAddBullet ? (
            <div className="mt-2 flex items-center gap-2 animate-fade-in">
              <input
                value={newBulletText}
                onChange={(e) => setNewBulletText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddBullet()}
                placeholder="הוסף שלב חדש..."
                autoFocus
                className="flex-1 text-xs bg-gray-50 rounded-lg px-2.5 py-2
                           border border-accent/30 outline-none placeholder:text-gray-400"
              />
              <button
                onClick={handleAddBullet}
                className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center
                           touch-feedback shrink-0"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={() => { setShowAddBullet(false); setNewBulletText('') }}
                className="w-7 h-7 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center
                           touch-feedback shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddBullet(true)}
              className="mt-2 text-xs text-accent font-bold flex items-center gap-1 touch-feedback"
            >
              <Plus size={12} />
              הוסף שלב
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex border-t border-gray-50">
        <button
          onClick={() => onDuplicate(item.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5
                     text-xs text-gray-400 touch-feedback hover:text-accent"
        >
          <Copy size={13} />
          שכפל
        </button>
        <div className="w-px bg-gray-50" />
        <button
          onClick={() => onDelete(item.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5
                     text-xs text-gray-400 touch-feedback hover:text-danger"
        >
          <Trash2 size={13} />
          מחק
        </button>
      </div>
    </div>
  )
}
