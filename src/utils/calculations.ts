import type { QuoteLineItem } from '../types'
import { companySettings } from '../data/companyInfo'

export function calculateLineTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice)
}

export function calculateSubtotal(items: QuoteLineItem[]): number {
  return items.reduce((sum, item) => sum + item.lineTotal, 0)
}

export function calculateVat(subtotal: number): number {
  return Math.round(subtotal * companySettings.vatRate)
}

export function calculateTotal(subtotal: number, vatAmount: number): number {
  return subtotal + vatAmount
}

export function recalculateQuoteTotals(items: QuoteLineItem[]) {
  const subtotal = calculateSubtotal(items)
  const vatAmount = calculateVat(subtotal)
  const total = calculateTotal(subtotal, vatAmount)
  return { subtotal, vatAmount, total }
}
