import { useState } from 'react'
import { MessageCircle, FileDown, Loader2 } from 'lucide-react'
import type { Quote } from '../../types'
import { companySettings } from '../../data/companyInfo'
import { formatCurrency } from '../../utils/formatters'
import { generatePdf, generatePdfBlob } from '../../utils/pdfExport'

interface LiveBuilderFABProps {
  quote: Quote
}

export default function LiveBuilderFAB({ quote }: LiveBuilderFABProps) {
  const [pdfLoading, setPdfLoading] = useState(false)
  const [waLoading, setWaLoading] = useState(false)

  const whatsappText =
    `היי ${quote.clientName},\n` +
    `מצורפת הצעת המחיר המעודכנת שלנו.\n\n` +
    `נושא: ${quote.subject}\n` +
    `סכום: ₪${quote.total.toLocaleString()}\n\n` +
    `נשמח לעמוד לרשותך,\n` +
    `${companySettings.contactPerson} - ${companySettings.name}`

  const whatsappUrl = `https://wa.me/${quote.clientPhone.replace(/[-\s]/g, '')}?text=${encodeURIComponent(whatsappText)}`

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

  const handleWhatsApp = async () => {
    setWaLoading(true)
    try {
      const blob = await generatePdfBlob(quote)
      const filename = `הצעת_מחיר_${quote.quoteNumber}_${quote.clientName || 'טיוטה'}.pdf`
      const file = new File([blob], filename, { type: 'application/pdf' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          text: whatsappText,
          title: `הצעת מחיר - ${quote.subject}`,
        })
      } else {
        window.open(whatsappUrl, '_blank')
      }
    } catch {
      // User cancelled share
    } finally {
      setWaLoading(false)
    }
  }

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-2xl px-4 py-3 flex items-center gap-3 z-30">
      {/* Total */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">סה"כ לתשלום</p>
        <p className="text-lg font-black text-navy leading-tight">{formatCurrency(quote.total)}</p>
      </div>

      {/* WhatsApp */}
      <button
        onClick={handleWhatsApp}
        disabled={waLoading}
        className="flex items-center gap-1.5 bg-emerald-500 text-white font-bold text-sm
                   py-2.5 px-4 rounded-xl shadow-md shadow-emerald-500/20
                   disabled:opacity-60 touch-feedback"
      >
        {waLoading ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
        וואטסאפ
      </button>

      {/* PDF */}
      <button
        onClick={handlePdfDownload}
        disabled={pdfLoading}
        className="flex items-center gap-1.5 bg-accent text-white font-bold text-sm
                   py-2.5 px-4 rounded-xl shadow-md shadow-accent/20
                   disabled:opacity-60 touch-feedback"
      >
        {pdfLoading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
        PDF
      </button>
    </div>
  )
}
