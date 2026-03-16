import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { useQuoteContext } from '../context/QuoteContext'
import QuoteDocument from '../components/preview/QuoteDocument'
import ShareActions from '../components/preview/ShareActions'
import Header from '../components/layout/Header'
import type { QuoteStatus } from '../types'

const A4_WIDTH = 794

export default function QuotePreview() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getQuoteById, updateQuote } = useQuoteContext()

  const quote = useMemo(() => (id ? getQuoteById(id) : undefined), [id, getQuoteById])

  const wrapperRef = useRef<HTMLDivElement>(null)
  const docRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [docHeight, setDocHeight] = useState(0)

  const measure = useCallback(() => {
    const wrapper = wrapperRef.current
    const doc = docRef.current
    if (!wrapper || !doc) return
    const available = wrapper.clientWidth - 32
    const s = Math.min(available / A4_WIDTH, 1)
    setScale(s)
    setDocHeight(doc.scrollHeight)
  }, [])

  useEffect(() => {
    measure()
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const ro = new ResizeObserver(measure)
    ro.observe(wrapper)
    return () => ro.disconnect()
  }, [measure])

  if (!quote) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">הצעת מחיר לא נמצאה</p>
      </div>
    )
  }

  const handleStatusChange = (status: QuoteStatus) => {
    updateQuote({ ...quote, status })
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header
        title="תצוגה מקדימה"
        onBack={() => navigate('/')}
        action={
          <button
            onClick={() => navigate(`/quote/edit/${quote.id}`)}
            className="w-9 h-9 rounded-full bg-white/40 flex items-center justify-center touch-feedback shadow-sm"
          >
            <Pencil size={17} className="text-[#1e3a5f]" />
          </button>
        }
      />

      <div ref={wrapperRef} className="mx-auto pt-5 px-4 overflow-hidden">
        <div
          ref={docRef}
          style={{
            width: `${A4_WIDTH}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top right',
            marginBottom: `${(scale - 1) * docHeight}px`,
          }}
        >
          <QuoteDocument quote={quote} />
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4 pb-8 mt-5">
        <ShareActions quote={quote} onStatusChange={handleStatusChange} />
      </div>
    </div>
  )
}
