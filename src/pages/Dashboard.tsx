import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Copy, Trash2, MoreVertical, FileText } from 'lucide-react'
import Header from '../components/layout/Header'
import KpiCards from '../components/dashboard/KpiCards'
import { useQuoteContext } from '../context/QuoteContext'
import { formatCurrency } from '../utils/formatters'
import type { Quote } from '../types'
import { QUOTE_STATUS_CONFIG } from '../types'

export default function Dashboard() {
  const navigate = useNavigate()
  const { quotes, createNewQuote, updateQuote, setCurrentQuote, deleteQuote, duplicateQuote } = useQuoteContext()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const handleNewQuote = () => {
    const newQuote = createNewQuote()
    updateQuote(newQuote)
    setCurrentQuote(newQuote)
    navigate(`/quote/edit/${newQuote.id}`)
  }

  const filtered = quotes.filter(
    (q) =>
      q.clientName.includes(search) ||
      q.subject.includes(search) ||
      q.quoteNumber.includes(search),
  )

  const handleDuplicate = (id: string) => {
    const dup = duplicateQuote(id)
    setMenuOpen(null)
    navigate(`/quote/edit/${dup.id}`)
  }

  const handleDelete = (id: string) => {
    deleteQuote(id)
    setMenuOpen(null)
  }

  const statusOrder: Record<string, number> = { draft: 0, sent: 1, approved: 2, cancelled: 3 }
  const sorted = [...filtered].sort((a, b) => {
    const sa = statusOrder[a.status] ?? 9
    const sb = statusOrder[b.status] ?? 9
    if (sa !== sb) return sa - sb
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  return (
    <div className="min-h-screen bg-surface pb-8">
      <Header />
      <div className="max-w-lg mx-auto px-5 -mt-1">
        <KpiCards quotes={quotes} />

        {/* New Quote CTA */}
        <button
          onClick={handleNewQuote}
          className="w-full bg-accent hover:bg-accent-light text-white font-bold text-base
                     py-4 rounded-2xl shadow-lg shadow-accent/25 flex items-center justify-center gap-2
                     touch-feedback mt-5 mb-5"
        >
          <Plus size={20} strokeWidth={2.5} />
          הצעת מחיר חדשה
        </button>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חפש לפי שם לקוח, נושא או מספר..."
            className="w-full bg-white rounded-xl pr-10 pl-4 py-3 text-sm border border-gray-100
                       outline-none focus:border-accent focus:ring-2 focus:ring-accent/20
                       placeholder:text-gray-400 shadow-sm"
          />
        </div>

        {/* Quote List */}
        <h2 className="font-bold text-navy text-sm mb-3">
          הצעות מחיר ({sorted.length})
        </h2>

        <div className="space-y-2.5">
          {sorted.map((q) => (
            <QuoteCardItem
              key={q.id}
              quote={q}
              menuOpen={menuOpen === q.id}
              onToggleMenu={() => setMenuOpen(menuOpen === q.id ? null : q.id)}
              onNavigate={() => navigate(`/quote/${q.id}`)}
              onEdit={() => navigate(`/quote/edit/${q.id}`)}
              onDuplicate={() => handleDuplicate(q.id)}
              onDelete={() => handleDelete(q.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Premium Quote Card ── */

interface QuoteCardItemProps {
  quote: Quote
  menuOpen: boolean
  onToggleMenu: () => void
  onNavigate: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}

function QuoteCardItem({ quote, menuOpen, onToggleMenu, onNavigate, onEdit, onDuplicate, onDelete }: QuoteCardItemProps) {
  const config = QUOTE_STATUS_CONFIG[quote.status]
  const date = new Date(quote.updatedAt).toLocaleDateString('he-IL', {
    day: 'numeric', month: 'short',
  })

  return (
    <div className="bg-white rounded-2xl shadow-premium border border-gray-50 overflow-hidden
                    touch-feedback animate-fade-in">
      <div className="p-4" onClick={onNavigate}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-bold text-sm text-navy truncate">{quote.clientName || 'ללא שם'}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                {config.label}
              </span>
            </div>
            <p className="text-xs text-gray-400 truncate">{quote.subject || 'ללא נושא'}</p>
          </div>
          <div className="text-left flex-shrink-0 mr-3">
            <p className="text-sm font-black text-navy">{formatCurrency(quote.total)}</p>
            <p className="text-[10px] text-gray-400">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <FileText size={11} />
          <span>{quote.quoteNumber}</span>
          <span>•</span>
          <span>{quote.lineItems.length} פריטים</span>
        </div>
      </div>

      {/* Action menu */}
      <div className="relative">
        <div className="flex border-t border-gray-50">
          <button onClick={onEdit}
            className="flex-1 py-2.5 text-xs text-gray-500 font-medium touch-feedback hover:text-accent text-center">
            ערוך
          </button>
          <div className="w-px bg-gray-50" />
          <button onClick={onNavigate}
            className="flex-1 py-2.5 text-xs text-accent font-bold touch-feedback text-center">
            צפה
          </button>
          <div className="w-px bg-gray-50" />
          <button
            onClick={(e) => { e.stopPropagation(); onToggleMenu() }}
            className="px-4 py-2.5 text-gray-400 touch-feedback"
          >
            <MoreVertical size={14} />
          </button>
        </div>

        {menuOpen && (
          <div className="absolute left-2 bottom-full mb-1 bg-white rounded-xl shadow-lg border border-gray-100
                          z-10 overflow-hidden animate-scale-in min-w-[140px]"
               onClick={(e) => e.stopPropagation()}>
            <button onClick={onDuplicate}
              className="w-full flex items-center gap-2 px-4 py-3 text-xs text-navy hover:bg-gray-50 touch-feedback">
              <Copy size={13} /> שכפל הצעה
            </button>
            <button onClick={onDelete}
              className="w-full flex items-center gap-2 px-4 py-3 text-xs text-danger hover:bg-red-50 touch-feedback">
              <Trash2 size={13} /> מחק
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
