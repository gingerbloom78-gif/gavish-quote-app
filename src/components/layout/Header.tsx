import { useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FileText, Users, Settings, ArrowRight } from 'lucide-react'
import { companySettings } from '../../data/companyInfo'
import { useMenu } from '../../context/MenuContext'

const NAV_ITEMS = [
  { label: 'הזמנות', icon: FileText, path: '/' },
  { label: 'לקוחות', icon: Users, path: '/clients' },
  { label: 'הגדרות', icon: Settings, path: '/settings' },
]

interface HeaderProps {
  title?: string
  onBack?: () => void
  action?: React.ReactNode
}

export default function Header({ title, onBack, action }: HeaderProps = {}) {
  const { isOpen, open, close } = useMenu()
  const navigate = useNavigate()
  const location = useLocation()
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInner = !!title || !!onBack

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    open()
  }

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => close(), 300)
  }

  const handleLogoClick = () => {
    isOpen ? close() : open()
  }

  const handleNav = (path: string) => {
    navigate(path)
    close()
  }

  return (
    <header className="sticky top-0 z-50">
      <div
        className="px-4 pt-safe pb-3"
        style={{ background: 'linear-gradient(160deg, #a8d4ef 0%, #c8e6f5 50%, #dff0f9 100%)' }}
      >
        <div className="flex items-center justify-between gap-2">

          {/* LEFT: back arrow + logo with hover menu */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {onBack && (
              <button onClick={onBack} className="w-8 h-8 flex items-center justify-center touch-feedback">
                <ArrowRight size={20} className="text-[#1e3a5f]" />
              </button>
            )}

            {/* Logo hover/tap controller */}
            <div
              className="relative z-50"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={companySettings.logoUrl}
                alt="לוגו"
                onClick={handleLogoClick}
                className={`${isInner ? 'h-11' : 'h-16'} w-auto object-contain cursor-pointer touch-feedback`}
              />

              {/* Dropdown menu — pt-2 bridges the gap so hover stays active */}
              {isOpen && (
                <div
                  className="absolute top-full right-0 z-50 pt-2"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="w-44 glass-strong rounded-2xl shadow-premium border border-white/50 py-2 animate-fade-in">
                    {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
                      const isActive = location.pathname === path
                      return (
                        <button
                          key={path}
                          onClick={() => handleNav(path)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-right
                                      transition-all touch-feedback
                                      ${isActive
                                        ? 'bg-accent/20 text-accent'
                                        : 'text-[#1e3a5f] hover:bg-white/50'}`}
                        >
                          <Icon size={18} />
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CENTER: title */}
          {title ? (
            <h1 className="flex-1 text-center text-sm font-bold text-[#1e3a5f] truncate px-1">
              {title}
            </h1>
          ) : (
            <div className="flex-1" />
          )}

          {/* RIGHT: action slot */}
          {action ?? <div className="w-9 flex-shrink-0" />}

        </div>
      </div>

      {/* Wave divider */}
      <div
        className="overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #a8d4ef 0%, #c8e6f5 50%, #dff0f9 100%)' }}
      >
        <svg
          viewBox="0 0 375 28"
          preserveAspectRatio="none"
          className="w-full block"
          style={{ height: 28 }}
        >
          <path d="M0,10 C60,28 120,0 187,14 C254,28 310,4 375,16 L375,28 L0,28 Z" fill="#f5f7fa" />
        </svg>
      </div>

      {/* Mobile tap-outside backdrop */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={close} />}
    </header>
  )
}
