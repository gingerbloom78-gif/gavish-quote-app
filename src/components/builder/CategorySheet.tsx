import { useState, useMemo } from 'react'
import { Check, Minus, Plus } from 'lucide-react'
import BottomSheet from '../ui/BottomSheet'
import { formatCurrency } from '../../utils/formatters'
import { getFrequentItemIds } from '../../services/storage'
import type { CatalogCategory, CatalogItem } from '../../types'

interface CategorySheetProps {
  category: CatalogCategory | null
  onClose: () => void
  onAddItems: (items: CatalogItem[], quantities: Record<string, { qty: number; price: number }>) => void
  existingItemIds: string[]
}

export default function CategorySheet({ category, onClose, onAddItems, existingItemIds }: CategorySheetProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [quantities, setQuantities] = useState<Record<string, { qty: number; price: number }>>({})

  const frequentIds = useMemo(() => new Set(getFrequentItemIds()), [])

  if (!category) return null

  // Sort: frequent items first, then alphabetical
  const sortedItems = [...category.items].sort((a, b) => {
    const aFreq = frequentIds.has(a.id) ? 1 : 0
    const bFreq = frequentIds.has(b.id) ? 1 : 0
    if (aFreq !== bFreq) return bFreq - aFreq
    return 0
  })

  const toggleItem = (itemId: string, item: CatalogItem) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
        if (!quantities[itemId]) {
          setQuantities((q) => ({
            ...q,
            [itemId]: { qty: 1, price: item.basePrice || 0 },
          }))
        }
      }
      return next
    })
  }

  const updateQty = (itemId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[itemId] || { qty: 1, price: 0 }
      const newQty = Math.max(1, current.qty + delta)
      return { ...prev, [itemId]: { ...current, qty: newQty } }
    })
  }

  const updatePrice = (itemId: string, price: number) => {
    setQuantities((prev) => {
      const current = prev[itemId] || { qty: 1, price: 0 }
      return { ...prev, [itemId]: { ...current, price } }
    })
  }

  const handleAdd = () => {
    const selectedItems = category.items.filter((i) => selected.has(i.id))
    onAddItems(selectedItems, quantities)
    setSelected(new Set())
    setQuantities({})
  }

  const alreadyInQuote = (id: string) => existingItemIds.includes(id)

  return (
    <BottomSheet isOpen={!!category} onClose={onClose} title={category.name}>
      <div className="space-y-2.5 pb-4">
        {sortedItems.map((item) => {
          const isSelected = selected.has(item.id)
          const isExisting = alreadyInQuote(item.id)
          const isFavorite = frequentIds.has(item.id)
          const q = quantities[item.id] || { qty: 1, price: item.basePrice || 0 }

          return (
            <div
              key={item.id}
              className={`rounded-2xl border-2 transition-all overflow-hidden
                ${isSelected
                  ? 'border-accent bg-accent/5 shadow-md'
                  : 'border-gray-100 bg-white'
                }`}
            >
              {/* Item header — tap to toggle */}
              <button
                onClick={() => toggleItem(item.id, item)}
                className="w-full flex items-start gap-3 p-3.5 text-right touch-feedback"
                disabled={isExisting}
              >
                {/* Checkbox */}
                <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5
                  ${isExisting
                    ? 'bg-gray-200'
                    : isSelected
                      ? 'bg-accent'
                      : 'border-2 border-gray-300'
                  }`}>
                  {(isSelected || isExisting) && <Check size={14} className="text-white" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className={`font-bold text-sm ${isExisting ? 'text-gray-400' : 'text-navy'}`}>
                      {item.title}
                    </h3>
                    {isFavorite && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
                        ⭐ נפוץ
                      </span>
                    )}
                    {isExisting && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                        כבר בהצעה
                      </span>
                    )}
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {item.bullets.slice(0, 3).map((b, i) => (
                      <li key={i} className="text-xs text-gray-500 flex gap-1">
                        <span className="text-gray-300">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                    {item.bullets.length > 3 && (
                      <li className="text-xs text-gray-400">+{item.bullets.length - 3} עוד...</li>
                    )}
                  </ul>
                  {item.basePrice && (
                    <p className="text-xs text-accent font-bold mt-1">
                      {formatCurrency(item.basePrice)} / {item.unit}
                    </p>
                  )}
                </div>
              </button>

              {/* Quantity/Price editor when selected */}
              {isSelected && (
                <div className="px-3.5 pb-3.5 pt-0 animate-fade-in">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-2.5">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-200
                                   flex items-center justify-center touch-feedback"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-bold text-sm text-navy">
                        {q.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-200
                                   flex items-center justify-center touch-feedback"
                      >
                        <Plus size={14} />
                      </button>
                      <span className="text-xs text-gray-400">{item.unit}</span>
                    </div>

                    <div className="h-6 w-px bg-gray-200" />

                    {/* Price input */}
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-xs text-gray-400">₪</span>
                      <input
                        type="number"
                        value={q.price || ''}
                        onChange={(e) => updatePrice(item.id, Number(e.target.value) || 0)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5
                                   text-sm text-navy font-bold outline-none focus:border-accent text-center"
                        placeholder="מחיר"
                      />
                    </div>

                    <span className="text-xs font-bold text-navy whitespace-nowrap">
                      = {formatCurrency(q.qty * q.price)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add button */}
      {selected.size > 0 && (
        <div className="sticky bottom-0 bg-white pt-2 pb-4 border-t border-gray-100">
          <button
            onClick={handleAdd}
            className="w-full bg-accent text-white font-bold text-base py-3.5 rounded-2xl
                       shadow-lg shadow-accent/25 touch-feedback flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            הוסף {selected.size} פריטים
          </button>
        </div>
      )}
    </BottomSheet>
  )
}
