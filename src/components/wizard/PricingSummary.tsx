import type { Quote } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import { companySettings } from '../../data/companyInfo'

interface PricingSummaryProps {
  quote: Quote
  onNotesChange: (notes: string) => void
}

export default function PricingSummary({ quote, onNotesChange }: PricingSummaryProps) {
  const vatPercent = Math.round(companySettings.vatRate * 100)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4">
          <h3 className="font-bold text-navy text-sm mb-4">סיכום תמחור</h3>

          {quote.lineItems.length > 0 && (
            <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
              {quote.lineItems.map((item, i) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {i + 1}. {item.title}
                    {item.quantity > 1 && (
                      <span className="text-gray-400 text-xs mr-1">
                        ({item.quantity} × {formatCurrency(item.unitPrice)})
                      </span>
                    )}
                  </span>
                  <span className="font-medium text-navy">{formatCurrency(item.lineTotal)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">סה"כ לפני מע"מ</span>
              <span className="font-medium">{formatCurrency(quote.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">מע"מ ({vatPercent}%)</span>
              <span className="font-medium">{formatCurrency(quote.vatAmount)}</span>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex items-center justify-between">
              <span className="font-bold text-navy text-base">סה"כ לתשלום</span>
              <span className="font-black text-accent text-xl">{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <label className="font-bold text-navy text-sm mb-2 block">הערות נוספות</label>
        <textarea
          value={quote.notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="הערה מיוחדת להצעה..."
          rows={3}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none
                     focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        />
      </div>

      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
        <p className="text-xs text-blue-600 font-medium mb-1">תנאים קבועים (יופיעו בהצעה)</p>
        <ul className="space-y-1">
          {companySettings.defaultNotes.map((note, i) => (
            <li key={i} className="text-xs text-blue-500/80 leading-relaxed flex items-start gap-1.5">
              <span className="mt-0.5 shrink-0">•</span>
              {note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
