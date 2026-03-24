import { Routes, Route } from 'react-router-dom'
import { MenuProvider } from './context/MenuContext'
import SideMenu from './components/layout/SideMenu'
import Dashboard from './pages/Dashboard'
import QuoteWizard from './pages/QuoteWizard'
import QuoteBuilder from './pages/QuoteBuilder'
import QuotePreview from './pages/QuotePreview'
import LiveDocumentBuilder from './pages/LiveDocumentBuilder'
import Settings from './pages/Settings'
import Clients from './pages/Clients'

export default function App() {
  return (
    <MenuProvider>
      <SideMenu />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/quote/edit/:id" element={<QuoteWizard />} />
        <Route path="/quote/build/:id" element={<QuoteBuilder />} />
        <Route path="/quote/live/:id" element={<LiveDocumentBuilder />} />
        <Route path="/quote/:id" element={<QuotePreview />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/clients" element={<Clients />} />
      </Routes>
    </MenuProvider>
  )
}
