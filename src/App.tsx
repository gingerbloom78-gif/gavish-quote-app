import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import QuoteWizard from './pages/QuoteWizard'
import QuoteBuilder from './pages/QuoteBuilder'
import QuotePreview from './pages/QuotePreview'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/quote/edit/:id" element={<QuoteWizard />} />
      <Route path="/quote/build/:id" element={<QuoteBuilder />} />
      <Route path="/quote/:id" element={<QuotePreview />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}
