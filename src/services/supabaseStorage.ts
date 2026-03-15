/**
 * Supabase persistence layer.
 * Mirrors the API of storage.ts but uses Supabase for all reads/writes.
 * Falls back gracefully when supabase client is null (env vars missing).
 */

import { supabase } from '../lib/supabase'
import type { Quote, Client, CatalogItem, QuoteTemplate, VoiceNote } from '../types'

/* ── Type mappers (snake_case DB ↔ camelCase TS) ── */

function rowToQuote(row: Record<string, unknown>): Quote {
  return {
    id: row.id as string,
    quoteNumber: row.quote_number as string,
    date: row.date as string,
    clientName: row.client_name as string,
    clientPhone: row.client_phone as string,
    clientAddress: row.client_address as string,
    subject: row.subject as string,
    introText: row.intro_text as string,
    status: row.status as Quote['status'],
    lineItems: row.line_items as Quote['lineItems'],
    notes: row.notes as string,
    subtotal: Number(row.subtotal),
    vatAmount: Number(row.vat_amount),
    total: Number(row.total),
    voiceNotes: (row.voice_notes as VoiceNote[]) ?? [],
    templateId: row.template_id as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function quoteToRow(q: Quote) {
  return {
    id: q.id,
    quote_number: q.quoteNumber,
    date: q.date,
    client_name: q.clientName,
    client_phone: q.clientPhone,
    client_address: q.clientAddress,
    subject: q.subject,
    intro_text: q.introText,
    status: q.status,
    line_items: q.lineItems,
    notes: q.notes,
    subtotal: q.subtotal,
    vat_amount: q.vatAmount,
    total: q.total,
    voice_notes: q.voiceNotes,
    template_id: q.templateId ?? null,
    created_at: q.createdAt,
    updated_at: q.updatedAt,
  }
}

function rowToClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string,
    address: row.address as string,
    createdAt: row.created_at as string,
  }
}

function rowToCustomItem(row: Record<string, unknown>): CatalogItem {
  return {
    id: row.id as string,
    categoryId: row.category_id as string,
    title: row.title as string,
    bullets: (row.bullets as string[]) ?? [],
    basePrice: row.base_price != null ? Number(row.base_price) : undefined,
    unit: row.unit as string,
    usageCount: Number(row.usage_count),
    lastUsed: row.last_used as string | undefined,
    isCustom: true,
  }
}

function rowToTemplate(row: Record<string, unknown>): QuoteTemplate {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    categoryId: row.category_id as string | undefined,
    lineItems: row.line_items as QuoteTemplate['lineItems'],
    createdAt: row.created_at as string,
  }
}

/* ── Quotes ── */

export async function fetchQuotes(): Promise<Quote[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(rowToQuote)
}

export async function upsertQuote(quote: Quote): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('quotes').upsert(quoteToRow(quote))
  if (error) throw error
}

export async function removeQuote(id: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('quotes').delete().eq('id', id)
  if (error) throw error
}

/* ── Clients ── */

export async function fetchClients(): Promise<Client[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(rowToClient)
}

export async function upsertClient(client: Client): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('clients').upsert({
    id: client.id,
    name: client.name,
    phone: client.phone,
    address: client.address,
    created_at: client.createdAt,
  })
  if (error) throw error
}

/* ── Custom Catalog Items ── */

export async function fetchCustomItems(): Promise<CatalogItem[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('custom_items').select('*')
  if (error) throw error
  return (data ?? []).map(rowToCustomItem)
}

export async function upsertCustomItem(item: CatalogItem): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('custom_items').upsert({
    id: item.id,
    category_id: item.categoryId,
    title: item.title,
    bullets: item.bullets,
    base_price: item.basePrice ?? null,
    unit: item.unit,
    usage_count: item.usageCount,
    last_used: item.lastUsed ?? null,
    is_custom: true,
  })
  if (error) throw error
}

export async function removeCustomItem(id: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('custom_items').delete().eq('id', id)
  if (error) throw error
}

/* ── Templates ── */

export async function fetchTemplates(): Promise<QuoteTemplate[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(rowToTemplate)
}

export async function upsertTemplate(template: QuoteTemplate): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('templates').upsert({
    id: template.id,
    name: template.name,
    description: template.description,
    category_id: template.categoryId ?? null,
    line_items: template.lineItems,
    created_at: template.createdAt,
  })
  if (error) throw error
}

export async function removeTemplate(id: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('templates').delete().eq('id', id)
  if (error) throw error
}

/* ── Item Usage ── */

export async function fetchItemUsage(): Promise<Record<string, number>> {
  if (!supabase) return {}
  const { data, error } = await supabase.from('item_usage').select('*')
  if (error) throw error
  return Object.fromEntries((data ?? []).map((r) => [r.item_id, r.usage_count]))
}

export async function incrementItemUsage(itemId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.rpc('increment_item_usage', { p_item_id: itemId })
  // Fallback: upsert if rpc not available
  if (error) {
    const current = await fetchItemUsage()
    const count = (current[itemId] ?? 0) + 1
    await supabase.from('item_usage').upsert({ item_id: itemId, usage_count: count })
  }
}
