import type { ReactNode } from 'react'

interface BottomBarProps {
  children: ReactNode
}

export default function BottomBar({ children }: BottomBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-gray-200 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="max-w-lg mx-auto flex gap-3">
        {children}
      </div>
    </div>
  )
}
