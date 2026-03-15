import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { useQuoteContext } from '../context/QuoteContext'
import StepIndicator from '../components/wizard/StepIndicator'
import CustomerForm from '../components/wizard/CustomerForm'
import BottomBar from '../components/layout/BottomBar'
import type { Quote } from '../types'

const STEPS = ['פרטי לקוח', 'בניית הצעה']

export default function QuoteWizard() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getQuoteById, updateQuote, clients } = useQuoteContext()

  const existingQuote = useMemo(() => (id ? getQuoteById(id) : undefined), [id, getQuoteById])
  const [draft, setDraft] = useState<Quote | null>(null)

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
    if (draft) {
      updateQuote(draft)
      navigate(`/quote/build/${draft.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-navy text-white px-5 pt-10 pb-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 -mr-2 touch-feedback">
            <ArrowRight size={20} />
          </button>
          <h1 className="font-bold text-base">
            {draft.quoteNumber ? `הצעה ${draft.quoteNumber}` : 'הצעת מחיר חדשה'}
          </h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5">
        <StepIndicator currentStep={1} steps={STEPS} />

        <div className="pb-28">
          <CustomerForm quote={draft} clients={clients} onChange={handleChange} />
        </div>
      </div>

      <BottomBar>
        <div className="flex-1" />
        <button
          onClick={handleContinueToBuilder}
          className="flex items-center justify-center gap-1 bg-accent text-white font-bold
                     text-sm py-3 px-6 rounded-xl shadow-md shadow-accent/25 touch-feedback"
        >
          המשך לבניית הצעה
          <ArrowLeft size={16} />
        </button>
      </BottomBar>
    </div>
  )
}
