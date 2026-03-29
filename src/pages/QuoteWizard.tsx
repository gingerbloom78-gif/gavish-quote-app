import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { useQuoteContext } from '../context/QuoteContext'
import StepIndicator from '../components/wizard/StepIndicator'
import CustomerForm from '../components/wizard/CustomerForm'
import BottomBar from '../components/layout/BottomBar'
import Header from '../components/layout/Header'
import type { Quote } from '../types'

const STEPS = ['פרטי לקוח', 'בניית הצעה']

export default function QuoteWizard() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getQuoteById, updateQuote, clients } = useQuoteContext()

  const existingQuote = useMemo(() => (id ? getQuoteById(id) : undefined), [id, getQuoteById])
  const [draft, setDraft] = useState<Quote | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (existingQuote) {
      setDraft({ ...existingQuote })
    }
  }, [existingQuote])

  if (!draft) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">טוען...</p>
      </div>
    )
  }

  const handleChange = (updates: Partial<Quote>) => {
    setDraft((prev) => (prev ? { ...prev, ...updates } : prev))
  }

  const handleContinueToBuilder = () => {
    if (!draft) return
    updateQuote(draft)
    setSaved(true)
    setTimeout(() => {
      navigate(`/quote/live/${draft.id}`)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header
        title={draft.quoteNumber ? `הצעה ${draft.quoteNumber}` : 'הצעת מחיר חדשה'}
        onBack={() => navigate(-1)}
      />

      {/* Save confirmation toast */}
      {saved && (
        <div className="fixed top-20 inset-x-0 flex justify-center z-50 animate-fade-in">
          <div className="bg-emerald-500 text-white text-sm font-bold px-5 py-2.5 rounded-2xl
                          shadow-lg flex items-center gap-2">
            <CheckCircle size={16} />
            פרטי לקוח נשמרו
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-5">
        <StepIndicator currentStep={1} steps={STEPS} />

        <div className="pb-32">
          <CustomerForm quote={draft} clients={clients} onChange={handleChange} />
        </div>
      </div>

      <BottomBar>
        <button
          onClick={handleContinueToBuilder}
          disabled={saved}
          className="w-full flex items-center justify-center gap-2 bg-accent text-white font-bold
                     text-base py-4 rounded-2xl shadow-lg shadow-accent/30 touch-feedback
                     disabled:opacity-60 transition-all"
        >
          {saved ? (
            <>
              <CheckCircle size={18} />
              נשמר, ממשיך...
            </>
          ) : (
            <>
              המשך לבניית הצעה
              <ArrowLeft size={18} />
            </>
          )}
        </button>
      </BottomBar>
    </div>
  )
}
