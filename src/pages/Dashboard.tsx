import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Copy, Trash2, FileText } from 'lucide-react'
import Header from '../components/layout/Header'
import { useQuoteContext } from '../context/QuoteContext'
import { formatCurrency } from '../utils/formatters'
import type { Quote } from '../types'
import { QUOTE_STATUS_CONFIG } from '../types'

export default function Dashboard() {
  const navigate = useNavigate()
  const { quotes, createNewQuote, updateQuote, setCurrentQuote, deleteQuote, duplicateQuote } = useQuoteContext()
  const [search, setSearch] = useState('')


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
    if (!window.confirm('למחוק את ההצעה? לא ניתן לשחזר.')) return
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
    <div className="min-h-screen bg-surface pb-10">
      <Header />
      <div className="max-w-lg mx-auto px-5 mt-5">

        {/* Search */}
        <div className="relative mb-5">
          <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חפש לפי שם לקוח, נושא או מספר..."
            className="w-full bg-white rounded-2xl pr-10 pl-4 py-3.5 text-sm border border-gray-100
                       outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/15
                       placeholder:text-gray-400 shadow-sm transition-shadow duration-200
                       focus:shadow-md"
          />
        </div>

        {/* Quote List heading + New Quote CTA */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-navy text-base">הצעות מחיר</h2>
          <span className="text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full">
            {sorted.length}
          </span>
        </div>

        <button
          onClick={handleNewQuote}
          className="w-full bg-gradient-to-l from-accent to-blue-500
                     text-white font-bold text-base py-4 rounded-2xl
                     shadow-lg shadow-accent/30 flex items-center justify-center gap-2
                     touch-feedback transition-all duration-200 active:scale-95 mb-4"
        >
          <Plus size={20} strokeWidth={2.5} />
          הצעת מחיר חדשה
        </button>

        <div className="space-y-3">
          {sorted.length === 0 ? (
            <div className="text-center py-14 animate-fade-in">
              <div className="w-14 h-14 bg-navy/8 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FileText size={26} className="text-navy/30" />
              </div>
              <p className="text-sm font-semibold text-navy/50">
                {search ? 'לא נמצאו תוצאות' : 'אין הצעות מחיר עדיין'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {search ? 'נסה לחפש מילת מפתח אחרת' : 'לחץ על הכפתור למעלה כדי ליצור הצעה'}
              </p>
            </div>
          ) : (
            sorted.map((q) => (
              <QuoteCardItem
                key={q.id}
                quote={q}
                onNavigate={() => navigate(`/quote/${q.id}`)}
                onEdit={() => navigate(`/quote/edit/${q.id}`)}
                onDuplicate={() => handleDuplicate(q.id)}
                onDelete={() => handleDelete(q.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Premium Quote Card ── */

interface QuoteCardItemProps {
  quote: Quote
  onNavigate: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}

const STATUS_STRIPE: Record<string, string> = {
  draft: 'bg-gray-300',
  sent: 'bg-blue-400',
  approved: 'bg-emerald-400',
  cancelled: 'bg-red-300',
}

function QuoteCardItem({ quote, onNavigate, onEdit, onDuplicate, onDelete }: QuoteCardItemProps) {
  const config = QUOTE_STATUS_CONFIG[quote.status]
  const stripe = STATUS_STRIPE[quote.status] ?? 'bg-gray-200'
  const date = new Date(quote.updatedAt).toLocaleDateString('he-IL', {
    day: 'numeric', month: 'short',
  })

  return (
    <div className="bg-white rounded-2xl shadow-premium border border-gray-50/80 overflow-hidden
                    touch-feedback animate-fade-in flex">
      {/* Status accent stripe (RTL: right edge) */}
      <div className={`w-1 flex-shrink-0 ${stripe} rounded-r-2xl`} />

      <div className="flex-1 min-w-0">
        <div className="p-4 pb-3" onClick={onNavigate}>
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

        {/* Action row */}
        <div className="flex border-t border-gray-100">
          <button onClick={onEdit}
            className="flex-1 py-2.5 text-xs text-gray-500 font-medium touch-feedback hover:text-accent hover:bg-gray-50/70 transition-colors text-center">
            ערוך
          </button>
          <div className="w-px bg-gray-100" />
          <button onClick={onNavigate}
            className="flex-1 py-2.5 text-xs text-accent font-bold touch-feedback hover:bg-accent/5 transition-colors text-center">
            צפה
          </button>
          <div className="w-px bg-gray-100" />
          <button onClick={onDuplicate}
            className="px-3 py-2.5 text-gray-400 touch-feedback hover:text-navy hover:bg-gray-50 transition-colors">
            <Copy size={14} />
          </button>
          <div className="w-px bg-gray-100" />
          <button onClick={onDelete}
            className="px-3 py-2.5 text-red-300 touch-feedback hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
