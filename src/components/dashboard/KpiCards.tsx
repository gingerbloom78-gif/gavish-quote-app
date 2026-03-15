import { DollarSign, CheckCircle2, FileText } from 'lucide-react'
import type { Quote } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface KpiCardsProps {
  quotes: Quote[]
}

export default function KpiCards({ quotes }: KpiCardsProps) {
  const totalRevenue = quotes
    .filter((q) => q.status === 'approved')
    .reduce((sum, q) => sum + q.total, 0)
  const approvedCount = quotes.filter((q) => q.status === 'approved').length
  const totalCount = quotes.length

  const cards = [
    {
      label: 'הכנסות',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      gradient: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'אושרו',
      value: String(approvedCount),
      icon: CheckCircle2,
      gradient: 'from-accent to-blue-600',
    },
    {
      label: 'סה"כ הצעות',
      value: String(totalCount),
      icon: FileText,
      gradient: 'from-navy-light to-navy',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-3.5 text-white shadow-lg`}
        >
          <card.icon size={20} className="mb-2 opacity-80" />
          <p className="text-[0.65rem] opacity-80 mb-0.5">{card.label}</p>
          <p className="text-base font-bold leading-tight">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
