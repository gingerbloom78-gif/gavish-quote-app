import { useState, useEffect } from 'react'
import { Plus, Save, Check } from 'lucide-react'
import BottomSheet from '../ui/BottomSheet'
import type { QuoteLineItem } from '../../types'

interface CustomItemSheetProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (item: Omit<QuoteLineItem, 'id' | 'lineTotal'>) => void
  initialValues?: QuoteLineItem
  onUpdate?: (item: QuoteLineItem) => void
  mode?: 'add' | 'edit'
}

const UNITS = ['פריט', 'מ"ר', 'מ"א', 'יום', 'שעה', 'קומה', 'יח\'']

export default function CustomItemSheet({ isOpen, onClose, onAdd, initialValues, onUpdate, mode = 'add' }: CustomItemSheetProps) {
  const [title, setTitle] = useState('')
  const [bullets, setBullets] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('פריט')
  const [unitPrice, setUnitPrice] = useState(0)
  const [saveForReuse, setSaveForReuse] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialValues) {
        setTitle(initialValues.title)
        setBullets(initialValues.bullets.join('\n'))
        setQuantity(initialValues.quantity)
        setUnit(initialValues.unit)
        setUnitPrice(initialValues.unitPrice)
      } else {
        setTitle('')
        setBullets('')
        setQuantity(1)
        setUnit('פריט')
        setUnitPrice(0)
        setSaveForReuse(false)
      }
    }
  }, [isOpen, mode, initialValues])

  const handleSubmit = () => {
    if (!title.trim()) return

    if (mode === 'edit' && initialValues && onUpdate) {
      onUpdate({
        ...initialValues,
        title: title.trim(),
        bullets: bullets.split('\n').filter(Boolean),
        quantity,
        unit,
        unitPrice,
        lineTotal: quantity * unitPrice,
      })
      onClose()
    } else {
      onAdd({
        title: title.trim(),
        bullets: bullets.split('\n').filter(Boolean),
        quantity,
        unit,
        unitPrice,
        catalogItemId: undefined,
      })
      // Reset for next item
      setTitle('')
      setBullets('')
      setQuantity(1)
      setUnit('פריט')
      setUnitPrice(0)
      setSaveForReuse(false)
    }
  }

  const isEdit = mode === 'edit'

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={isEdit ? 'עריכת פריט' : 'פריט מותאם אישית'}>
      <div className="space-y-4 pb-6">
        {/* Title */}
        <div>
          <label className="text-xs font-bold text-navy mb-1 block">שם הפריט *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="לדוגמה: איטום גג רעפים"
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                       outline-none focus:border-accent focus:ring-2 focus:ring-accent/20
                       placeholder:text-gray-400"
          />
        </div>

        {/* Bullets */}
        <div>
          <label className="text-xs font-bold text-navy mb-1 block">פירוט עבודה (שורה לכל שלב)</label>
          <textarea
            value={bullets}
            onChange={(e) => setBullets(e.target.value)}
            placeholder="ניקוי השטח&#10;יישום פריימר&#10;שכבת איטום"
            rows={3}
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                       outline-none focus:border-accent focus:ring-2 focus:ring-accent/20
                       placeholder:text-gray-400 resize-none"
          />
        </div>

        {/* Quantity + Unit Row */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-bold text-navy mb-1 block">כמות</label>
            <input
              type="number"
              value={quantity || ''}
              onChange={(e) => setQuantity(Number(e.target.value) || 0)}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                         outline-none focus:border-accent text-center font-bold"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-navy mb-1 block">יחידה</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                         outline-none focus:border-accent font-bold appearance-none text-center"
            >
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="text-xs font-bold text-navy mb-1 block">מחיר ליחידה (₪)</label>
          <input
            type="number"
            value={unitPrice || ''}
            onChange={(e) => setUnitPrice(Number(e.target.value) || 0)}
            placeholder="0"
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                       outline-none focus:border-accent text-center font-bold text-lg"
          />
        </div>

        {/* Total preview */}
        {quantity > 0 && unitPrice > 0 && (
          <div className="bg-accent/5 rounded-xl p-3 text-center animate-fade-in">
            <span className="text-xs text-gray-500">סה״כ: </span>
            <span className="text-lg font-black text-accent">
              ₪{(quantity * unitPrice).toLocaleString()}
            </span>
          </div>
        )}

        {/* Save for reuse toggle — add mode only */}
        {!isEdit && (
          <button
            onClick={() => setSaveForReuse(!saveForReuse)}
            className="flex items-center gap-2 w-full touch-feedback"
          >
            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors
              ${saveForReuse ? 'bg-accent' : 'border-2 border-gray-300'}`}>
              {saveForReuse && <Save size={12} className="text-white" />}
            </div>
            <span className="text-xs text-gray-600">שמור לשימוש עתידי</span>
          </button>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="w-full bg-accent text-white font-bold text-base py-3.5 rounded-2xl
                     shadow-lg shadow-accent/25 touch-feedback flex items-center justify-center gap-2
                     disabled:opacity-40 disabled:shadow-none"
        >
          {isEdit ? (
            <>
              <Check size={18} />
              שמור שינויים
            </>
          ) : (
            <>
              <Plus size={18} />
              הוסף פריט
            </>
          )}
        </button>
      </div>
    </BottomSheet>
  )
}
