import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import type { Quote, QuoteLineItem, Client } from '../types'
import { v4 as uuidv4 } from 'uuid'
import { recalculateQuoteTotals } from '../utils/calculations'
import { generateQuoteNumber, getTodayISO } from '../utils/formatters'
import {
  loadQuotes, saveQuotes,
  loadClients, saveClients,
  initStorageWithSamples,
} from '../services/storage'
import {
  fetchQuotes, upsertQuote, removeQuote,
  fetchClients, upsertClient,
} from '../services/supabaseStorage'
import { supabase } from '../lib/supabase'

interface QuoteContextType {
  quotes: Quote[]
  clients: Client[]
  currentQuote: Quote | null
  setCurrentQuote: (quote: Quote | null) => void
  createNewQuote: () => Quote
  updateQuote: (quote: Quote) => void
  deleteQuote: (id: string) => void
  duplicateQuote: (id: string) => Quote
  addLineItem: (quoteId: string, item: Omit<QuoteLineItem, 'id' | 'lineTotal'>) => void
  updateLineItem: (quoteId: string, item: QuoteLineItem) => void
  removeLineItem: (quoteId: string, itemId: string) => void
  duplicateLineItem: (quoteId: string, itemId: string) => void
  getQuoteById: (id: string) => Quote | undefined
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client
}

const QuoteContext = createContext<QuoteContextType | null>(null)

const sampleClients: Client[] = [
  { id: 'c1', name: 'משה כהן', phone: '050-1112233', address: 'רחוב הרצל 15, תל אביב', createdAt: '2026-03-01T10:00:00Z' },
  { id: 'c2', name: 'דוד לוי', phone: '052-4445566', address: 'שדרות בן גוריון 8, חיפה', createdAt: '2026-03-01T10:00:00Z' },
]

const sampleQuotes: Quote[] = [
  {
    id: 'q1',
    quoteNumber: '2026-001',
    date: '2026-03-01',
    clientName: 'משה כהן',
    clientPhone: '050-1112233',
    clientAddress: 'רחוב הרצל 15, תל אביב',
    subject: 'הצעת מחיר - איטום מרפסות',
    introText: 'להלן תהליך העבודה לאיטום מרפסות עפ"י מפרט עבודה של חברת "סיקה"',
    status: 'approved',
    lineItems: [
      {
        id: 'li1', catalogItemId: 'wp-1', title: 'איטום מרפסת',
        bullets: ['ניקוי יסודי ושטיפת המשטח', 'תיקון סדקים ומילוי חורים', 'יישום פריימר על כל השטח', 'יישום שכבת איטום ביטומנית', 'שכבת איטום שנייה', 'בדיקת איטום בהצפה'],
        quantity: 2, unit: 'פריט', unitPrice: 4500, lineTotal: 9000,
      },
      {
        id: 'li2', catalogItemId: 'cr-1', title: 'תיקון בטון מתפורר במרפסת',
        bullets: ['ניקוי והסרת בטון מתפורר', 'חשיפת ברזלי זיון וניקויים מחלודה', 'מילוי והשלמה בתערובת תיקון בטון'],
        quantity: 1, unit: 'פריט', unitPrice: 3500, lineTotal: 3500,
      },
    ],
    notes: '',
    voiceNotes: [],
    subtotal: 12500, vatAmount: 2250, total: 14750,
    createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'q2',
    quoteNumber: '2026-002',
    date: '2026-03-05',
    clientName: 'דוד לוי',
    clientPhone: '052-4445566',
    clientAddress: 'שדרות בן גוריון 8, חיפה',
    subject: 'הצעת מחיר - צביעת חזית בניין',
    introText: 'להלן תהליך העבודה לצביעת חזית בניין',
    status: 'sent',
    lineItems: [
      {
        id: 'li3', catalogItemId: 'fp-1', title: 'צביעת חזית בניין',
        bullets: ['שטיפת לחץ של כל החזית', 'מילוי סדקים וחורים', 'יישום שכבת יסוד', 'שתי שכבות צבע חוץ אקרילי'],
        quantity: 450, unit: 'מ"ר', unitPrice: 85, lineTotal: 38250,
      },
    ],
    notes: 'כולל הקמת פיגומים',
    voiceNotes: [],
    subtotal: 38250, vatAmount: 6885, total: 45135,
    createdAt: '2026-03-05T14:00:00Z', updatedAt: '2026-03-05T14:00:00Z',
  },
  {
    id: 'q3',
    quoteNumber: '2026-003',
    date: '2026-03-10',
    clientName: 'משה כהן',
    clientPhone: '050-1112233',
    clientAddress: 'רחוב הרצל 15, תל אביב',
    subject: 'הצעת מחיר - תיקוני סדקים',
    introText: 'להלן תהליך העבודה לתיקוני סדקים בקירות חוץ',
    status: 'draft',
    lineItems: [
      {
        id: 'li4', catalogItemId: 'ckr-1', title: 'תיקון סדקים בקירות חוץ',
        bullets: ['פתיחת הסדק לצורת V', 'ניקוי מאבק ופסולת', 'מילוי באלסטומר גמיש', 'צביעה בהתאמה לקיר'],
        quantity: 15, unit: 'מ"א', unitPrice: 1800, lineTotal: 27000,
      },
    ],
    notes: '',
    voiceNotes: [],
    subtotal: 27000, vatAmount: 4860, total: 31860,
    createdAt: '2026-03-10T09:00:00Z', updatedAt: '2026-03-10T09:00:00Z',
  },
]

export function QuoteProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage, seeding sample data if empty
  const [isReady, setIsReady] = useState(false)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null)

  useEffect(() => {
    if (supabase) {
      // Load from Supabase
      Promise.all([fetchQuotes(), fetchClients()]).then(([q, c]) => {
        // Seed sample data into Supabase if empty
        const quotes = q.length > 0 ? q : sampleQuotes
        const clients = c.length > 0 ? c : sampleClients
        if (q.length === 0) sampleQuotes.forEach((sq) => upsertQuote(sq))
        if (c.length === 0) sampleClients.forEach((sc) => upsertClient(sc))
        setQuotes(quotes)
        setClients(clients)
        setIsReady(true)
      }).catch((err) => {
        console.error('Supabase load failed, falling back to localStorage', err)
        const { quotes: q2, clients: c2 } = initStorageWithSamples(sampleQuotes, sampleClients)
        setQuotes(q2)
        setClients(c2)
        setIsReady(true)
      })
    } else {
      // No Supabase configured — use localStorage
      const { quotes: q, clients: c } = initStorageWithSamples(sampleQuotes, sampleClients)
      setQuotes(q)
      setClients(c)
      setIsReady(true)
    }
  }, [])

  // Sync changed quotes to Supabase (tracks updatedAt to avoid redundant writes)
  const prevQuotesRef = useRef<Quote[]>([])
  useEffect(() => {
    if (!isReady) return
    if (supabase) {
      const prevMap = new Map(prevQuotesRef.current.map((q) => [q.id, q]))
      quotes.forEach((q) => {
        const old = prevMap.get(q.id)
        if (!old || old.updatedAt !== q.updatedAt) {
          upsertQuote(q).catch(console.error)
        }
      })
    } else {
      saveQuotes(quotes)
    }
    prevQuotesRef.current = quotes
  }, [quotes, isReady])

  useEffect(() => {
    if (isReady && !supabase) saveClients(clients)
  }, [clients, isReady])

  const createNewQuote = useCallback((): Quote => {
    const now = new Date().toISOString()
    const newQuote: Quote = {
      id: uuidv4(),
      quoteNumber: generateQuoteNumber(),
      date: getTodayISO(),
      clientName: '',
      clientPhone: '',
      clientAddress: '',
      subject: '',
      introText: '',
      status: 'draft',
      lineItems: [],
      notes: '',
      voiceNotes: [],
      subtotal: 0,
      vatAmount: 0,
      total: 0,
      createdAt: now,
      updatedAt: now,
    }
    return newQuote
  }, [])

  const updateQuote = useCallback((updatedQuote: Quote) => {
    const now = new Date().toISOString()
    const withTimestamp = { ...updatedQuote, updatedAt: now }
    setQuotes((prev) => {
      const exists = prev.find((q) => q.id === updatedQuote.id)
      if (exists) {
        return prev.map((q) => (q.id === updatedQuote.id ? withTimestamp : q))
      }
      return [withTimestamp, ...prev]
    })
  }, [])

  const deleteQuote = useCallback((id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id))
    removeQuote(id).catch(console.error)
  }, [])

  const duplicateQuote = useCallback((id: string): Quote => {
    const original = quotes.find((q) => q.id === id)
    if (!original) throw new Error('Quote not found')
    const now = new Date().toISOString()
    const dup: Quote = {
      ...original,
      id: uuidv4(),
      quoteNumber: generateQuoteNumber(),
      date: getTodayISO(),
      status: 'draft',
      lineItems: original.lineItems.map((li) => ({ ...li, id: uuidv4() })),
      voiceNotes: [],
      createdAt: now,
      updatedAt: now,
    }
    setQuotes((prev) => [dup, ...prev])
    return dup
  }, [quotes])

  const addLineItem = useCallback(
    (quoteId: string, item: Omit<QuoteLineItem, 'id' | 'lineTotal'>) => {
      const newItem: QuoteLineItem = {
        ...item,
        id: uuidv4(),
        lineTotal: item.quantity * item.unitPrice,
      }
      setQuotes((prev) =>
        prev.map((q) => {
          if (q.id !== quoteId) return q
          const lineItems = [...q.lineItems, newItem]
          const totals = recalculateQuoteTotals(lineItems)
          return { ...q, lineItems, ...totals, updatedAt: new Date().toISOString() }
        }),
      )
    },
    [],
  )

  const updateLineItem = useCallback((quoteId: string, updatedItem: QuoteLineItem) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q
        const lineItems = q.lineItems.map((li) => (li.id === updatedItem.id ? updatedItem : li))
        const totals = recalculateQuoteTotals(lineItems)
        return { ...q, lineItems, ...totals, updatedAt: new Date().toISOString() }
      }),
    )
  }, [])

  const removeLineItem = useCallback((quoteId: string, itemId: string) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q
        const lineItems = q.lineItems.filter((li) => li.id !== itemId)
        const totals = recalculateQuoteTotals(lineItems)
        return { ...q, lineItems, ...totals, updatedAt: new Date().toISOString() }
      }),
    )
  }, [])

  const duplicateLineItem = useCallback((quoteId: string, itemId: string) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q
        const original = q.lineItems.find((li) => li.id === itemId)
        if (!original) return q
        const duplicate: QuoteLineItem = { ...original, id: uuidv4() }
        const lineItems = [...q.lineItems, duplicate]
        const totals = recalculateQuoteTotals(lineItems)
        return { ...q, lineItems, ...totals, updatedAt: new Date().toISOString() }
      }),
    )
  }, [])

  const getQuoteById = useCallback(
    (id: string) => quotes.find((q) => q.id === id),
    [quotes],
  )

  const addClient = useCallback((client: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = { ...client, id: uuidv4(), createdAt: new Date().toISOString() }
    setClients((prev) => [...prev, newClient])
    upsertClient(newClient).catch(console.error)
    return newClient
  }, [])

  if (!isReady) return null

  return (
    <QuoteContext.Provider
      value={{
        quotes,
        clients,
        currentQuote,
        setCurrentQuote,
        createNewQuote,
        updateQuote,
        deleteQuote,
        duplicateQuote,
        addLineItem,
        updateLineItem,
        removeLineItem,
        duplicateLineItem,
        getQuoteById,
        addClient,
      }}
    >
      {children}
    </QuoteContext.Provider>
  )
}

export function useQuoteContext() {
  const ctx = useContext(QuoteContext)
  if (!ctx) throw new Error('useQuoteContext must be used within QuoteProvider')
  return ctx
}
