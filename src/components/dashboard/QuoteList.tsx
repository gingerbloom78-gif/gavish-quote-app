import { useState } from 'react'
import type { Quote, QuoteStatus } from '../../types'
import QuoteCard from './QuoteCard'

interface QuoteListProps {
  quotes: Quote[]
}

type FilterOption = 'all' | QuoteStatus

const FILTERS: { key: FilterOption; label: string }[] = [
  { key: 'all', label: 'הכל' },
  { key: 'draft', label: 'טיוטה' },
  { key: 'sent', label: 'נשלח' },
  { key: 'approved', label: 'אושר' },
  { key: 'cancelled', label: 'בוטל' },
]

export default function QuoteList({ quotes }: QuoteListProps) {
  const [filter, setFilter] = useState<FilterOption>('all')

  const filtered = filter === 'all' ? quotes : quotes.filter((q) => q.status === filter)

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-colors
              ${
                filter === f.key
                  ? 'bg-navy text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            אין הצעות מחיר להצגה
          </div>
        ) : (
          filtered.map((q) => <QuoteCard key={q.id} quote={q} />)
        )}
      </div>
    </div>
  )
}
