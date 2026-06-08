import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { useMutation } from 'convex/react'
import { useState } from 'react'

export const Route = createFileRoute('/tickets')({
  component: TicketsPage,
  head: () => ({ meta: [{ title: 'Tickets - IT CMDB' }] }),
})

function TicketsPage() {
  const { data: tickets } = useSuspenseQuery(convexQuery(api.index.listTickets, {}))
  const updateStatus = useMutation(api.index.updateTicketStatus)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('general')
  const createTicket = useMutation(api.index.createTicket)

  const statusColors: Record<string, string> = {
    open: 'bg-yellow-500/20 text-yellow-400',
    in_progress: 'bg-blue-500/20 text-blue-400',
    resolved: 'bg-green-500/20 text-green-400',
    closed: 'bg-gray-500/20 text-gray-400',
  }
  const priorityColors: Record<string, string> = {
    low: 'bg-green-500/20 text-green-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-orange-500/20 text-orange-400',
    critical: 'bg-red-500/20 text-red-400',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">🎫 Tickets</h1>
          <p className="text-gray-400 text-sm mt-1">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ Nieuw</button>
      </div>

      <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
        {tickets.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-gray-400">Geen tickets</p>
            <button onClick={() => setShowForm(true)} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Ticket aanmaken</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {tickets.map((ticket) => (
              <Link key={ticket._id} to="/tickets/$id" params={{ id: ticket._id }} className="px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors block">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{ticket.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{ticket.category} · {new Date(ticket._creationTime).toLocaleDateString('nl-NL')}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColors[ticket.priority] || ''}`}>{ticket.priority}</span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[ticket.status] || ''}`}>{ticket.status === 'in_progress' ? 'in progress' : ticket.status}</span>
                  {ticket.status === 'open' && (
                    <button onClick={(e) => { e.preventDefault(); updateStatus({ id: ticket._id, status: 'in_progress' }) }} className="text-xs text-blue-400 hover:text-blue-300">Start</button>
                  )}
                  {ticket.status === 'in_progress' && (
                    <button onClick={(e) => { e.preventDefault(); updateStatus({ id: ticket._id, status: 'resolved', resolution: 'Opgelost' }) }} className="text-xs text-green-400 hover:text-green-300">Oplossen</button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-2xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Nieuw Ticket</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault()
              await createTicket({ title, description, priority, category })
              setShowForm(false); setTitle(''); setDescription(''); setPriority('medium'); setCategory('general')
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Titel</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="Korte omschrijving" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Beschrijving</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="Detail omschrijving" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Prioriteit</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                    <option value="low">Low</option><option value="medium">Medium</option>
                    <option value="high">High</option><option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Categorie</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                    <option value="general">Algemeen</option><option value="printer">Printer</option>
                    <option value="network">Netwerk</option><option value="server">Server</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white">Annuleren</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Aanmaken</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}