import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowRight, Pencil } from 'lucide-react'
import { useQuoteContext } from '../context/QuoteContext'
import QuoteDocument from '../components/preview/QuoteDocument'
import ShareActions from '../components/preview/ShareActions'
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
      <div className="bg-navy text-white px-5 pt-10 pb-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button onClick={() => navigate('/')} className="p-2 -mr-2">
            <ArrowRight size={20} />
          </button>
          <h1 className="font-bold text-base">תצוגה מקדימה</h1>
          <button
            onClick={() => navigate(`/quote/edit/${quote.id}`)}
            className="p-2 -ml-2"
          >
            <Pencil size={18} />
          </button>
        </div>
      </div>

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
