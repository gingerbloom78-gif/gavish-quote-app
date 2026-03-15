import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
        {icon}
      </div>
      <h3 className="font-bold text-navy text-base mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 mb-4 max-w-[280px]">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-accent text-white font-bold text-sm py-2.5 px-6 rounded-xl
                     shadow-md shadow-accent/20 touch-feedback"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
