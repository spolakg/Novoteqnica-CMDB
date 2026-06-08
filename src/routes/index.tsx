import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { useMutation } from 'convex/react'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: Dashboard,
  head: () => ({ meta: [{ title: 'Dashboard - IT CMDB' }] }),
})

function Dashboard() {
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [ticketTitle, setTicketTitle] = useState('')
  const [ticketDesc, setTicketDesc] = useState('')
  const [ticketPriority, setTicketPriority] = useState('medium')
  const [ticketCategory, setTicketCategory] = useState('general')

  const { data: stats } = useSuspenseQuery(convexQuery(api.index.getDashboardStats, {}))
  const { data: recentTickets } = useSuspenseQuery(convexQuery(api.index.getRecentTickets, { limit: 5 }))
  const createTicket = useMutation(api.index.createTicket)

  const statCards = [
    { label: 'Totaal Assets', value: stats.totalAssets, icon: '💻', href: '/assets', color: 'from-blue-600 to-blue-800' },
    { label: 'Servers', value: stats.servers, icon: '🖥️', href: '/assets?type=server', color: 'from-purple-600 to-purple-800' },
    { label: 'Hyper-V', value: stats.hyperVHosts, icon: '🔲', href: '/assets?type=hyperv_host', color: 'from-cyan-600 to-cyan-800' },
    { label: 'Printers', value: stats.printers, icon: '🖨️', href: '/assets?type=printer', color: 'from-green-600 to-green-800' },
    { label: 'UPS', value: stats.ups, icon: '🔋', href: '/assets?type=ups', color: 'from-yellow-600 to-yellow-800' },
    { label: 'Switches', value: stats.switches, icon: '🌐', href: '/assets?type=switch', color: 'from-indigo-600 to-indigo-800' },
    { label: 'Access Points', value: stats.accessPoints, icon: '📡', href: '/assets?type=access_point', color: 'from-pink-600 to-pink-800' },
    { label: 'NAS', value: stats.nas, icon: '💾', href: '/assets?type=nas', color: 'from-teal-600 to-teal-800' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">IT Infrastructure Overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={card.href.includes('?') ? card.href.split('?')[0] : card.href}
            search={card.href.includes('?') ? Object.fromEntries(new URLSearchParams(card.href.split('?')[1])) : undefined}
            className={`rounded-xl bg-gradient-to-br ${card.color} p-4 text-white shadow-lg hover:opacity-90 transition-opacity`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{card.icon}</span>
              <span className="text-3xl font-bold">{card.value}</span>
            </div>
            <p className="text-sm font-medium opacity-90">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link to="/backups" className="rounded-xl bg-gray-900 border border-gray-800 p-6 hover:border-gray-700 transition-colors">
          <h2 className="text-lg font-semibold text-white mb-4">📦 Backup Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Actief</span>
              <span className="text-green-400 font-bold">{stats.activeBackups}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Mislukt</span>
              <span className={`font-bold ${stats.failedBackups > 0 ? 'text-red-400' : 'text-gray-400'}`}>{stats.failedBackups}</span>
            </div>
          </div>
        </Link>

        <Link to="/tickets" className="rounded-xl bg-gray-900 border border-gray-800 p-6 hover:border-gray-700 transition-colors">
          <h2 className="text-lg font-semibold text-white mb-4">🎫 Tickets</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Open</span>
              <span className="text-yellow-400 font-bold">{stats.openTickets}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Opgelost</span>
              <span className="text-green-400 font-bold">{stats.resolvedTickets}</span>
            </div>
          </div>
        </Link>

        <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">⚡ Snel Acties</h2>
          <div className="space-y-3">
            <button onClick={() => setShowTicketModal(true)} className="w-full text-left px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors text-sm">🎫 Nieuw incident melden</button>
            <Link to="/assets" className="block w-full text-left px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors text-sm">💻 Asset toevoegen</Link>
          </div>
        </div>
      </div>

      {/* Recent tickets */}
      <div className="rounded-xl bg-gray-900 border border-gray-800">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recente Incidenten</h2>
          <Link to="/tickets" className="text-sm text-blue-400 hover:text-blue-300">Alle tickets →</Link>
        </div>
        <div className="divide-y divide-gray-800">
          {recentTickets.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-gray-400">Geen openstaande incidenten</p>
              <p className="text-gray-500 text-sm mt-1">Nieuwe tickets verschijnen hier</p>
            </div>
          ) : recentTickets.map((ticket) => (
            <div key={ticket._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{ticket.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">{ticket.category}</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  ticket.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                  ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  ticket.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>{ticket.priority}</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  ticket.status === 'open' ? 'bg-yellow-500/20 text-yellow-400' :
                  ticket.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-green-500/20 text-green-400'
                }`}>{ticket.status === 'in_progress' ? 'in progress' : ticket.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">📚 Kennisbank</h2>
          <Link to="/knowledge" className="text-sm text-blue-400 hover:text-blue-300">Alle categorieën →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: 'A+ Hardware', icon: '🔧', href: '/knowledge?category=a_plus', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
            { name: 'Network+', icon: '🌐', href: '/knowledge?category=network_plus', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
            { name: 'Hyper-V', icon: '🔲', href: '/knowledge?category=hyper_v', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
            { name: 'UniFi', icon: '📡', href: '/knowledge?category=unifi', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
            { name: 'Backup', icon: '📦', href: '/knowledge?category=backup', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
            { name: 'Security', icon: '🔒', href: '/knowledge?category=security', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
          ].map((item) => (
            <Link
              key={item.name}
              to={item.href.split('?')[0]}
              search={{ category: item.href.split('=')[1] }}
              className={`flex items-center gap-2 rounded-lg border p-3 ${item.color} hover:opacity-80 transition-opacity`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-2xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Nieuw Incident</h2>
              <button onClick={() => setShowTicketModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault()
              await createTicket({ title: ticketTitle, description: ticketDesc, priority: ticketPriority, category: ticketCategory })
              setShowTicketModal(false)
              setTicketTitle(''); setTicketDesc('')
              setTicketPriority('medium'); setTicketCategory('general')
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Titel</label>
                <input type="text" value={ticketTitle} onChange={(e) => setTicketTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  placeholder="Korte omschrijving" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Beschrijving</label>
                <textarea value={ticketDesc} onChange={(e) => setTicketDesc(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  rows={3} placeholder="Detail omschrijving" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Prioriteit</label>
                  <select value={ticketPriority} onChange={(e) => setTicketPriority(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Categorie</label>
                  <select value={ticketCategory} onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                    <option value="general">Algemeen</option>
                    <option value="printer">Printer</option>
                    <option value="network">Netwerk</option>
                    <option value="server">Server</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowTicketModal(false)} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white">Annuleren</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Aanmaken</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}