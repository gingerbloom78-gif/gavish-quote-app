/* ── Company & Settings ── */

export interface CompanySettings {
  name: string
  legalName: string
  contactPerson: string
  phone: string
  email: string
  website: string
  tagline: string
  credentials: string
  taxId: string
  vatRate: number
  logoUrl?: string
  signatureUrl?: string
  defaultNotes: string[]
  legalLine: string
  certificates: Certificate[]
}

export interface Certificate {
  id: string
  title: string
  imageUrl?: string
}

/* ── Clients & Projects ── */

export interface Client {
  id: string
  name: string
  phone: string
  address: string
  createdAt: string
}

export interface Project {
  id: string
  clientId: string
  name: string
  address: string
  notes: string
  createdAt: string
}

/* ── Catalog ── */

export interface CatalogCategory {
  id: string
  name: string
  icon: string
  color: string          // tailwind bg color for the card
  items: CatalogItem[]
}

export interface CatalogItem {
  id: string
  categoryId: string
  title: string
  bullets: string[]
  basePrice?: number
  unit: string
  usageCount: number     // frequency tracking
  lastUsed?: string      // ISO date
  isCustom?: boolean     // user-created items
}

/* ── Quotes ── */

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'cancelled'

export interface Quote {
  id: string
  quoteNumber: string
  date: string
  clientName: string
  clientPhone: string
  clientAddress: string
  subject: string
  introText: string
  status: QuoteStatus
  lineItems: QuoteLineItem[]
  notes: string
  subtotal: number
  vatAmount: number
  total: number
  voiceNotes: VoiceNote[]
  templateId?: string
  createdAt: string
  updatedAt: string
}

export interface QuoteLineItem {
  id: string
  catalogItemId?: string
  title: string
  bullets: string[]
  quantity: number
  unit: string
  unitPrice: number
  lineTotal: number
}

/* ── Templates ── */

export interface QuoteTemplate {
  id: string
  name: string
  description: string
  categoryId?: string        // optional link to catalog category
  lineItems: Omit<QuoteLineItem, 'id' | 'lineTotal'>[]
  createdAt: string
}

/* ── Voice ── */

export interface VoiceNote {
  id: string
  transcript: string
  parsedItems: Partial<QuoteLineItem>[]
  audioUrl?: string
  createdAt: string
  status: 'raw' | 'parsed' | 'approved'
}

/* ── Status Config ── */

export const QUOTE_STATUS_CONFIG: Record<QuoteStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'טיוטה', color: 'text-gray-600', bg: 'bg-gray-100' },
  sent: { label: 'נשלח', color: 'text-blue-600', bg: 'bg-blue-100' },
  approved: { label: 'אושר', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  cancelled: { label: 'בוטל', color: 'text-red-600', bg: 'bg-red-100' },
}
