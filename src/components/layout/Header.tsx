import { useNavigate } from 'react-router-dom'
import { getGreeting } from '../../utils/formatters'
import { companySettings } from '../../data/companyInfo'
import { Settings } from 'lucide-react'

export default function Header() {
  const navigate = useNavigate()

  return (
    <header className="bg-navy text-white px-5 pt-12 pb-6">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-blue-200 text-sm">{getGreeting()},</p>
          <h1 className="text-xl font-bold">{companySettings.contactPerson}</h1>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center touch-feedback"
        >
          <Settings size={22} className="text-white" />
        </button>
      </div>
    </header>
  )
}

