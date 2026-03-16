import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Phone, MapPin, Save } from 'lucide-react'
import Header from '../components/layout/Header'
import { useQuoteContext } from '../context/QuoteContext'
import BottomSheet from '../components/ui/BottomSheet'
import type { Client } from '../types'

export default function Clients() {
  const navigate = useNavigate()
  const { clients, addClient } = useQuoteContext()
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [localClients, setLocalClients] = useState<Client[]>(clients)
  const [newClient, setNewClient] = useState<Omit<Client, 'id' | 'createdAt'>>({
    name: '', phone: '', address: '',
  })

  const filtered = localClients.filter((c) =>
    c.name.includes(search) || c.phone.includes(search) || c.address.includes(search)
  )

  const handleAddClient = () => {
    if (!newClient.name.trim()) return
    const created = addClient(newClient)
    setLocalClients((prev) => [...prev, created])
    setNewClient({ name: '', phone: '', address: '' })
    setShowAdd(false)
  }

  const handleUpdateClient = (updated: Client) => {
    setLocalClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    setEditingClient(null)
  }

  const handleDeleteClient = (id: string) => {
    setLocalClients((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="min-h-screen bg-surface pb-8">
      <Header title="לקוחות" onBack={() => navigate('/')} />

      <div className="max-w-lg mx-auto px-5 mt-4">
        {/* Search + Add */}
        <div className="flex items-center gap-2 mb-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חפש לקוח..."
            className="flex-1 bg-white rounded-xl px-4 py-2.5 text-sm border border-gray-100
                       outline-none focus:border-accent placeholder:text-gray-400 shadow-sm"
          />
          <button
            onClick={() => setShowAdd(true)}
            className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center
                       shadow-md shadow-accent/20 touch-feedback shrink-0"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Client List */}
        <div className="space-y-2">
          {filtered.map((client) => (
            <div key={client.id} className="bg-white rounded-xl p-3.5 shadow-premium border border-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-navy">{client.name}</h3>
                  {client.phone && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Phone size={11} className="text-gray-400" />
                      <span className="text-xs text-gray-500" dir="ltr">{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MapPin size={11} className="text-gray-400" />
                      <span className="text-xs text-gray-500">{client.address}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditingClient(client)}
                    className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center touch-feedback"
                  >
                    <Pencil size={13} className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center touch-feedback"
                  >
                    <Trash2 size={13} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            {search ? 'לא נמצאו לקוחות' : 'אין לקוחות עדיין'}
          </div>
        )}

        {/* Add Client Sheet */}
        <BottomSheet isOpen={showAdd} onClose={() => setShowAdd(false)} title="לקוח חדש" snap="half">
          <div className="space-y-3 pb-4">
            <div>
              <label className="text-xs font-bold text-navy mb-1 block">שם *</label>
              <input value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                placeholder="שם הלקוח"
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                           outline-none focus:border-accent placeholder:text-gray-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-navy mb-1 block">טלפון</label>
              <input value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                placeholder="050-0000000" dir="ltr"
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                           outline-none focus:border-accent placeholder:text-gray-400 text-right" />
            </div>
            <div>
              <label className="text-xs font-bold text-navy mb-1 block">כתובת</label>
              <input value={newClient.address} onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                placeholder="כתובת הלקוח"
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                           outline-none focus:border-accent placeholder:text-gray-400" />
            </div>
            <button onClick={handleAddClient} disabled={!newClient.name.trim()}
              className="w-full bg-accent text-white font-bold text-base py-3.5 rounded-2xl
                         shadow-lg shadow-accent/25 touch-feedback disabled:opacity-40 flex items-center justify-center gap-2">
              <Plus size={18} /> הוסף לקוח
            </button>
          </div>
        </BottomSheet>

        {/* Edit Client Sheet */}
        <BottomSheet
          isOpen={!!editingClient}
          onClose={() => setEditingClient(null)}
          title="עריכת לקוח"
          snap="half"
        >
          {editingClient && (
            <div className="space-y-3 pb-4">
              <div>
                <label className="text-xs font-bold text-navy mb-1 block">שם</label>
                <input value={editingClient.name}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                             outline-none focus:border-accent" />
              </div>
              <div>
                <label className="text-xs font-bold text-navy mb-1 block">טלפון</label>
                <input value={editingClient.phone}
                  onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                  dir="ltr"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                             outline-none focus:border-accent text-right" />
              </div>
              <div>
                <label className="text-xs font-bold text-navy mb-1 block">כתובת</label>
                <input value={editingClient.address}
                  onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-100
                             outline-none focus:border-accent" />
              </div>
              <button onClick={() => handleUpdateClient(editingClient)}
                className="w-full bg-accent text-white font-bold text-base py-3.5 rounded-2xl
                           shadow-lg shadow-accent/25 touch-feedback flex items-center justify-center gap-2">
                <Save size={18} /> שמור שינויים
              </button>
            </div>
          )}
        </BottomSheet>
      </div>
    </div>
  )
}
