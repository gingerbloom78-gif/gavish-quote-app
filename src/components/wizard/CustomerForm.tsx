import { useState, useRef, useEffect } from 'react'
import type { Quote, Client } from '../../types'
import { User, MapPin, FileText, Hash, Calendar } from 'lucide-react'

interface CustomerFormProps {
  quote: Quote
  clients: Client[]
  onChange: (updates: Partial<Quote>) => void
}

export default function CustomerForm({ quote, clients, onChange }: CustomerFormProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [nameQuery, setNameQuery] = useState(quote.clientName)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const filteredClients = nameQuery.length > 0
    ? clients.filter((c) => c.name.includes(nameQuery))
    : clients

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectClient = (client: Client) => {
    setNameQuery(client.name)
    onChange({
      clientName: client.name,
      clientPhone: client.phone,
      clientAddress: client.address,
    })
    setShowSuggestions(false)
  }

  const inputClass =
    'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm ' +
    'focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors'

  return (
    <div className="space-y-5">

      {/* ── Section: Client Details ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
        <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
          <User size={15} className="text-accent" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">פרטי לקוח</span>
        </div>

        {/* Client Name with autocomplete */}
        <div ref={wrapperRef} className="relative">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">שם לקוח / חברה</label>
          <div className="relative">
            <User size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={nameQuery}
              onChange={(e) => {
                setNameQuery(e.target.value)
                onChange({ clientName: e.target.value })
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="שם הלקוח"
              className={inputClass}
            />
          </div>
          {showSuggestions && filteredClients.length > 0 && (
            <div className="absolute z-20 top-full mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
              {filteredClients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectClient(c)}
                  className="w-full text-right px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                >
                  <p className="text-sm font-medium text-navy">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.address}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">כתובת הפרויקט</label>
          <div className="relative">
            <MapPin size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={quote.clientAddress}
              onChange={(e) => onChange({ clientAddress: e.target.value })}
              placeholder="רחוב, עיר"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* ── Section: Quote Details ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
        <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
          <FileText size={15} className="text-accent" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">פרטי ההצעה</span>
        </div>

        {/* Subject */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">נושא ההצעה</label>
          <div className="relative">
            <FileText size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={quote.subject}
              onChange={(e) => onChange({ subject: e.target.value })}
              placeholder="הצעת מחיר - איטום"
              className={inputClass}
            />
          </div>
        </div>

        {/* Date + Quote Number */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">תאריך</label>
            <div className="relative">
              <Calendar size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={quote.date}
                onChange={(e) => onChange({ date: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">מספר הצעה</label>
            <div className="relative">
              <Hash size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={quote.quoteNumber}
                readOnly
                dir="ltr"
                className={inputClass + ' text-left bg-gray-100 text-gray-500 cursor-not-allowed'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
