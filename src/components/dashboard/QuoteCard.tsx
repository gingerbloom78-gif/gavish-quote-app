import { useNavigate } from 'react-router-dom'
import type { Quote } from '../../types'
import { QUOTE_STATUS_CONFIG } from '../../types'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { MapPin, Calendar, ChevronLeft } from 'lucide-react'

interface QuoteCardProps {
  quote: Quote
}

export default function QuoteCard({ quote }: QuoteCardProps) {
  const navigate = useNavigate()
  const statusConfig = QUOTE_STATUS_CONFIG[quote.status]

  return (
    <button
      onClick={() => navigate(`/quote/${quote.id}`)}
      className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-right
                 active:scale-[0.98] transition-transform duration-100"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-bold text-navy text-sm">{quote.clientName}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{quote.subject}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          <ChevronLeft size={16} className="text-gray-300" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(quote.date)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {quote.clientAddress.split(',')[0]}
          </span>
        </div>
        <span className="font-bold text-navy text-sm">{formatCurrency(quote.total)}</span>
      </div>
    </button>
  )
}
