import { useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import type { Quote, QuoteLineItem, CatalogItem } from '../../types'
import { v4 as uuidv4 } from 'uuid'
import LineItemCard from './LineItemCard'
import CatalogPicker from './CatalogPicker'
import { calculateLineTotal } from '../../utils/calculations'

interface WorkItemsStepProps {
  quote: Quote
  onUpdateItems: (items: QuoteLineItem[]) => void
  onIntroTextChange: (text: string) => void
}

export default function WorkItemsStep({ quote, onUpdateItems, onIntroTextChange }: WorkItemsStepProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

  const handleAddFromCatalog = (catalogItem: CatalogItem) => {
    const newItem: QuoteLineItem = {
      id: uuidv4(),
      catalogItemId: catalogItem.id,
      title: catalogItem.title,
      bullets: [...catalogItem.bullets],
      quantity: 1,
      unit: catalogItem.unit,
      unitPrice: catalogItem.basePrice || 0,
      lineTotal: calculateLineTotal(1, catalogItem.basePrice || 0),
    }
    onUpdateItems([...quote.lineItems, newItem])
  }

  const handleAddCustom = () => {
    const newItem: QuoteLineItem = {
      id: uuidv4(),
      title: 'סעיף חדש',
      bullets: [],
      quantity: 1,
      unit: 'פריט',
      unitPrice: 0,
      lineTotal: 0,
    }
    onUpdateItems([...quote.lineItems, newItem])
  }

  const handleUpdateItem = (updatedItem: QuoteLineItem) => {
    onUpdateItems(quote.lineItems.map((li) => (li.id === updatedItem.id ? updatedItem : li)))
  }

  const handleDuplicate = (itemId: string) => {
    const original = quote.lineItems.find((li) => li.id === itemId)
    if (!original) return
    const duplicate: QuoteLineItem = { ...original, id: uuidv4() }
    onUpdateItems([...quote.lineItems, duplicate])
  }

  const handleDelete = (itemId: string) => {
    onUpdateItems(quote.lineItems.filter((li) => li.id !== itemId))
  }

  return (
    <div>
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-500 mb-1.5 block">טקסט מבוא להצעה</label>
        <input
          type="text"
          value={quote.introText}
          onChange={(e) => onIntroTextChange(e.target.value)}
          placeholder='למשל: להלן תהליך העבודה לשיקום בטונים עפ"י מפרט עבודה של חברת "סיקה"'
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm
                     focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setPickerOpen(true)}
          className="flex-1 bg-accent text-white font-medium text-sm py-3 rounded-xl
                     flex items-center justify-center gap-2 active:scale-[0.98] transition-transform
                     shadow-md shadow-accent/20"
        >
          <Plus size={18} />
          הוסף מהקטלוג
        </button>
        <button
          onClick={handleAddCustom}
          className="bg-white text-navy font-medium text-sm py-3 px-4 rounded-xl border border-gray-200
                     flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Pencil size={16} />
          חופשי
        </button>
      </div>

      {quote.lineItems.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Plus size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">לחץ "הוסף מהקטלוג" להתחיל</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quote.lineItems.map((item, index) => (
            <LineItemCard
              key={item.id}
              item={item}
              index={index}
              onChange={handleUpdateItem}
              onDuplicate={() => handleDuplicate(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}

      <CatalogPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAddFromCatalog}
      />
    </div>
  )
}
