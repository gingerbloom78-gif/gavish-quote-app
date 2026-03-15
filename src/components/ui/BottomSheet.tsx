import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  snap?: 'half' | 'full'
}

export default function BottomSheet({ isOpen, onClose, title, children, snap = 'full' }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const maxH = snap === 'half' ? 'max-h-[55vh]' : 'max-h-[92vh]'

  return (
    <div className="fixed inset-0 z-50 animate-fade-in" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 backdrop-dim" />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl ${maxH}
                    flex flex-col animate-slide-up shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle + Header */}
        <div className="flex-shrink-0 px-5 pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
          {title && (
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy">{title}</h2>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center
                           touch-feedback"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-safe scrollbar-none">
          {children}
        </div>
      </div>
    </div>
  )
}
