export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('he-IL').format(num)
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function generateQuoteNumber(): string {
  const year = new Date().getFullYear()
  const num = Math.floor(Math.random() * 900) + 100
  return `${year}-${String(num).padStart(3, '0')}`
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'בוקר טוב'
  if (hour < 17) return 'צהריים טובים'
  return 'ערב טוב'
}
