import { BookOpen, PenLine } from 'lucide-react'
import BottomSheet from '../ui/BottomSheet'

interface AddItemTypeSheetProps {
  isOpen: boolean
  onClose: () => void
  onSelectCatalog: () => void
  onSelectCustom: () => void
}

export default function AddItemTypeSheet({ isOpen, onClose, onSelectCatalog, onSelectCustom }: AddItemTypeSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="הוסף פריט">
      <div className="flex flex-col gap-3 pb-6">
        <button
          onClick={onSelectCatalog}
          className="w-full flex items-center gap-4 bg-accent text-white font-bold py-4 px-5 rounded-2xl
                     shadow-lg shadow-accent/25 touch-feedback"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <BookOpen size={20} />
          </div>
          <div className="text-right flex-1">
            <p className="text-base">מקטלוג</p>
            <p className="text-xs font-normal opacity-80">בחר מרשימת הפריטים המוכנים</p>
          </div>
        </button>

        <button
          onClick={onSelectCustom}
          className="w-full flex items-center gap-4 bg-navy/8 text-navy font-bold py-4 px-5 rounded-2xl
                     border border-navy/10 touch-feedback"
        >
          <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center flex-shrink-0">
            <PenLine size={20} />
          </div>
          <div className="text-right flex-1">
            <p className="text-base">פריט מותאם</p>
            <p className="text-xs font-normal opacity-60">הגדר פריט חדש בעצמך</p>
          </div>
        </button>
      </div>
    </BottomSheet>
  )
}
