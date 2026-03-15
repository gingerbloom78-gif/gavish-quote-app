import type { ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
  noPadding?: boolean
}

export default function AppShell({ children, noPadding }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface">
      <div className={`max-w-lg mx-auto ${noPadding ? '' : 'px-5 py-4'} pb-24`}>
        {children}
      </div>
    </div>
  )
}
