/**
 * localStorage-based persistence layer.
 * Ready to swap for IndexedDB, Supabase, or Firebase in the future.
 */

import type { Quote, Client, CatalogItem, QuoteTemplate, VoiceNote } from '../types'

const KEYS = {
  quotes: 'gavish_quotes',
  clients: 'gavish_clients',
  customItems: 'gavish_custom_items',
  templates: 'gavish_templates',
  voiceNotes: 'gavish_voice_notes',
  itemUsage: 'gavish_item_usage', // id → usageCount
} as const

/* ── Generic helpers ── */

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data))
}

/* ── Quotes ── */

export function loadQuotes(): Quote[] {
  return read<Quote[]>(KEYS.quotes, [])
}

export function saveQuotes(quotes: Quote[]): void {
  write(KEYS.quotes, quotes)
}

/* ── Clients ── */

export function loadClients(): Client[] {
  return read<Client[]>(KEYS.clients, [])
}

export function saveClients(clients: Client[]): void {
  write(KEYS.clients, clients)
}

/* ── Custom Catalog Items ── */

export function loadCustomItems(): CatalogItem[] {
  return read<CatalogItem[]>(KEYS.customItems, [])
}

export function saveCustomItems(items: CatalogItem[]): void {
  write(KEYS.customItems, items)
}

/* ── Templates ── */

export function loadTemplates(): QuoteTemplate[] {
  return read<QuoteTemplate[]>(KEYS.templates, [])
}

export function saveTemplates(templates: QuoteTemplate[]): void {
  write(KEYS.templates, templates)
}

/* ── Voice Notes ── */

export function loadVoiceNotes(): VoiceNote[] {
  return read<VoiceNote[]>(KEYS.voiceNotes, [])
}

export function saveVoiceNotes(notes: VoiceNote[]): void {
  write(KEYS.voiceNotes, notes)
}

/* ── Item Usage Tracking ── */

export function getItemUsage(): Record<string, number> {
  return read<Record<string, number>>(KEYS.itemUsage, {})
}

export function trackItemUsage(itemId: string): void {
  const usage = getItemUsage()
  usage[itemId] = (usage[itemId] || 0) + 1
  write(KEYS.itemUsage, usage)
}

export function getFrequentItemIds(limit = 10): string[] {
  const usage = getItemUsage()
  return Object.entries(usage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id]) => id)
}

/* ── Init: seed sample data if empty ── */

export function initStorageWithSamples(sampleQuotes: Quote[], sampleClients: Client[]): {
  quotes: Quote[]
  clients: Client[]
} {
  let quotes = loadQuotes()
  let clients = loadClients()

  if (quotes.length === 0) {
    quotes = sampleQuotes
    saveQuotes(quotes)
  }
  if (clients.length === 0) {
    clients = sampleClients
    saveClients(clients)
  }

  return { quotes, clients }
}
