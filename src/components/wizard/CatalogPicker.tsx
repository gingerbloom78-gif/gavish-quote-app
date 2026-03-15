import { useState } from 'react'
import { X, ChevronLeft, Hammer, Paintbrush, Droplets, Wrench, PaintBucket, Building } from 'lucide-react'
import { catalog } from '../../data/catalog'
import type { CatalogCategory, CatalogItem } from '../../types'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  Hammer,
  Paintbrush,
  Droplets,
  Wrench,
  PaintBucket,
  Building,
}

interface CatalogPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (item: CatalogItem) => void
}

export default function CatalogPicker({ open, onClose, onSelect }: CatalogPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<CatalogCategory | null>(null)

  if (!open) return null

  const handleSelect = (item: CatalogItem) => {
    onSelect(item)
    setSelectedCategory(null)
    onClose()
  }

  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null)
    } else {
      onClose()
    }
  }

  const getIcon = (iconName: string) => {
    const Icon = ICON_MAP[iconName]
    return Icon ? <Icon size={20} className="text-accent" /> : null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleBack} />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl max-h-[80vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <button onClick={handleBack} className="p-1">
            {selectedCategory ? (
              <ChevronLeft size={20} className="text-gray-500 rotate-180" />
            ) : (
              <X size={20} className="text-gray-500" />
            )}
          </button>
          <h3 className="font-bold text-navy text-base">
            {selectedCategory ? selectedCategory.name : 'בחר קטגוריה'}
          </h3>
          <div className="w-7" />
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-3">
          {!selectedCategory ? (
            <div className="space-y-2">
              {catalog.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className="w-full flex items-center gap-3 bg-gray-50 rounded-xl p-4
                             hover:bg-gray-100 active:scale-[0.98] transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    {getIcon(cat.icon)}
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-medium text-navy text-sm">{cat.name}</p>
                    <p className="text-xs text-gray-400">{cat.items.length} פריטים</p>
                  </div>
                  <ChevronLeft size={16} className="text-gray-300" />
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {selectedCategory.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full text-right bg-gray-50 rounded-xl p-4
                             hover:bg-gray-100 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-navy text-sm">{item.title}</p>
                    {item.basePrice && (
                      <span className="text-xs font-bold text-accent whitespace-nowrap mr-2">
                        ₪{item.basePrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1">
                    {item.bullets.slice(0, 3).map((b, i) => (
                      <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
                        <span className="text-accent mt-0.5">•</span>
                        {b}
                      </li>
                    ))}
                    {item.bullets.length > 3 && (
                      <li className="text-xs text-gray-400">...ועוד {item.bullets.length - 3} פריטים</li>
                    )}
                  </ul>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
