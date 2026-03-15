import { useState } from 'react'
import type { Quote } from '../../types'
import { companySettings } from '../../data/companyInfo'
import { MessageCircle, FileDown, Send, Loader2 } from 'lucide-react'
import { generatePdf } from '../../utils/pdfExport'
import { QUOTE_STATUS_CONFIG } from '../../types'

interface ShareActionsProps {
  quote: Quote
  onStatusChange: (status: Quote['status']) => void
}

export default function ShareActions({ quote, onStatusChange }: ShareActionsProps) {
  const [pdfLoading, setPdfLoading] = useState(false)

  const whatsappMessage = encodeURIComponent(
    `היי ${quote.clientName},\n` +
    `מצורפת הצעת המחיר המעודכנת שלנו.\n\n` +
    `נושא: ${quote.subject}\n` +
    `סכום: ₪${quote.total.toLocaleString()}\n\n` +
    `נשמח לעמוד לרשותך,\n` +
    `${companySettings.contactPerson} - ${companySettings.name}`
  )

  const whatsappUrl = `https://wa.me/${quote.clientPhone.replace(/[-\s]/g, '')}?text=${whatsappMessage}`

  const handlePdfDownload = async () => {
    setPdfLoading(true)
    try {
      await generatePdf(quote)
    } catch (err) {
      console.error('PDF generation failed:', err)
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white
                     font-bold text-sm py-3.5 rounded-xl active:scale-[0.98] transition-all shadow-md shadow-emerald-500/20"
        >
          <MessageCircle size={18} />
          שלח בוואטסאפ
        </a>
        <button
          onClick={handlePdfDownload}
          disabled={pdfLoading}
          className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-white
                     font-bold text-sm py-3.5 rounded-xl active:scale-[0.98] transition-all shadow-md shadow-accent/20
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pdfLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              מייצר...
            </>
          ) : (
            <>
              <FileDown size={18} />
              הורד PDF
            </>
          )}
        </button>
      </div>

      {quote.status === 'draft' && (
        <button
          onClick={() => onStatusChange('sent')}
          className="w-full flex items-center justify-center gap-2 bg-white text-navy font-medium text-sm
                     py-3 rounded-xl border border-gray-200 active:scale-[0.98] transition-transform"
        >
          <Send size={16} />
          סמן כנשלח
        </button>
      )}

      {quote.status === 'sent' && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onStatusChange('approved')}
            className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 font-medium
                       text-sm py-3 rounded-xl border border-emerald-200 active:scale-[0.98] transition-transform"
          >
            סמן כאושר
          </button>
          <button
            onClick={() => onStatusChange('cancelled')}
            className="flex items-center justify-center gap-2 bg-red-50 text-red-600 font-medium
                       text-sm py-3 rounded-xl border border-red-200 active:scale-[0.98] transition-transform"
          >
            בטל הצעה
          </button>
        </div>
      )}

      {quote.status !== 'draft' && (
        <div className="text-center">
          <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full
            ${QUOTE_STATUS_CONFIG[quote.status].bg} ${QUOTE_STATUS_CONFIG[quote.status].color}`}>
            סטטוס: {QUOTE_STATUS_CONFIG[quote.status].label}
          </span>
        </div>
      )}
    </div>
  )
}
