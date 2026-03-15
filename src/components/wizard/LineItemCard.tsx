import { useState } from 'react'
import type { QuoteLineItem } from '../../types'
import { Copy, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

interface LineItemCardProps {
  item: QuoteLineItem
  index: number
  onChange: (item: QuoteLineItem) => void
  onDuplicate: () => void
  onDelete: () => void
}

export default function LineItemCard({ item, index, onChange, onDuplicate, onDelete }: LineItemCardProps) {
  const [expanded, setExpanded] = useState(false)

  const updateField = <K extends keyof QuoteLineItem>(key: K, value: QuoteLineItem[K]) => {
    const updated = { ...item, [key]: value }
    if (key === 'quantity' || key === 'unitPrice') {
      updated.lineTotal = Number(updated.quantity) * Number(updated.unitPrice)
    }
    onChange(updated)
  }

  const removeBullet = (bulletIndex: number) => {
    const newBullets = item.bullets.filter((_, i) => i !== bulletIndex)
    onChange({ ...item, bullets: newBullets })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center">
              {index + 1}
            </span>
            <input
              type="text"
              value={item.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="font-medium text-navy text-sm bg-transparent border-none outline-none flex-1 min-w-0"
              placeholder="כותרת הסעיף"
            />
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={onDuplicate} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <Copy size={14} className="text-gray-400" />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 size={14} className="text-red-400" />
            </button>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-gray-400 mb-3 hover:text-gray-600 transition-colors"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {item.bullets.length} פירוטי עבודה
        </button>

        {expanded && (
          <div className="space-y-1.5 mb-3 pr-2">
            {item.bullets.map((bullet, i) => (
              <div key={i} className="flex items-start gap-2 group">
                <span className="text-accent text-xs mt-0.5">•</span>
                <span className="text-xs text-gray-600 flex-1">{bullet}</span>
                <button
                  onClick={() => removeBullet(i)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 transition-opacity"
                >
                  <X size={12} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[0.6rem] text-gray-400 block mb-1">כמות</label>
            <input
              type="number"
              value={item.quantity || ''}
              onChange={(e) => updateField('quantity', Number(e.target.value) || 0)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-center
                         focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              min="0"
            />
          </div>
          <div>
            <label className="text-[0.6rem] text-gray-400 block mb-1">יחידה</label>
            <select
              value={item.unit}
              onChange={(e) => updateField('unit', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            >
              <option value="פריט">פריט</option>
              <option value='מ"ר'>מ"ר</option>
              <option value='מ"א'>מ"א</option>
              <option value="יום">יום</option>
              <option value="קומפלט">קומפלט</option>
            </select>
          </div>
          <div>
            <label className="text-[0.6rem] text-gray-400 block mb-1">מחיר (₪)</label>
            <input
              type="number"
              value={item.unitPrice || ''}
              onChange={(e) => updateField('unitPrice', Number(e.target.value) || 0)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-center
                         focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between border-t border-gray-100">
        <span className="text-xs text-gray-500">סה"כ סעיף</span>
        <span className="font-bold text-navy text-sm">{formatCurrency(item.lineTotal)}</span>
      </div>
    </div>
  )
}
