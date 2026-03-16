import { useNavigate } from 'react-router-dom'
import { companySettings } from '../../data/companyInfo'
import { Menu } from 'lucide-react'

export default function Header() {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50">
      {/* Light-blue gradient bar — matches PDF header */}
      <div
        className="px-5 pt-safe pb-3"
        style={{ background: 'linear-gradient(160deg, #a8d4ef 0%, #c8e6f5 50%, #dff0f9 100%)' }}
      >
        <div className="flex items-center justify-between">
          {/* Logo — always left (visual left) */}
          <img
            src={companySettings.logoUrl}
            alt={companySettings.name}
            className="h-11 w-auto object-contain"
          />

          {/* Hamburger menu — right */}
          <button
            onClick={() => navigate('/settings')}
            className="w-9 h-9 rounded-full bg-white/40 flex items-center justify-center touch-feedback shadow-sm"
          >
            <Menu size={20} className="text-[#1e3a5f]" />
          </button>
        </div>
      </div>

      {/* Wave divider — white wave over surface bg, exactly like the PDF */}
      <div className="overflow-hidden" style={{ background: 'linear-gradient(160deg, #a8d4ef 0%, #c8e6f5 50%, #dff0f9 100%)' }}>
        <svg
          viewBox="0 0 375 28"
          preserveAspectRatio="none"
          className="w-full block"
          style={{ height: 28 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,10 C60,28 120,0 187,14 C254,28 310,4 375,16 L375,28 L0,28 Z"
            fill="#f5f7fa"
          />
        </svg>
      </div>
    </header>
  )
}
