import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { useMutation } from 'convex/react'
import { useState } from 'react'

export const Route = createFileRoute('/tickets/')({
  component: TicketDetail,
  head: () => ({ meta: [{ title: 'Ticket - IT CMDB' }] }),
})

const priorityColors: Record<string, string> = {
  low: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-red-500/20 text-red-400',
}
const statusColors: Record<string, string> = {
  open: 'bg-yellow-500/20 text-yellow-400',
  in_progress: 'bg-blue-500/20 text-blue-400',
  resolved: 'bg-green-500/20 text-green-400',
  closed: 'bg-gray-500/20 text-gray-400',
}

function TicketDetail() {
  const { id } = Route.useParams()
  const navigate = useNavigate()

  const { data: tickets } = useSuspenseQuery(convexQuery(api.index.listTickets, {}))
  const ticket = tickets.find((t) => t._id === id)
  const { data: comments } = useSuspenseQuery(convexQuery(api.index.listComments, { ticketId: id }))

  const updateStatus = useMutation(api.index.updateTicketStatus)
  const createComment = useMutation(api.index.createComment)
  const deleteTicket = useMutation(api.index.deleteTicket)

  const [commentText, setCommentText] = useState('')
  const [resolution, setResolution] = useState('')
  const [showResolve, setShowResolve] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-gray-400">Ticket niet gevonden</p>
        <Link to="/tickets" className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Terug naar tickets</Link>
      </div>
    )
  }

  const handleAddComment = async () => {
    if (!commentText.trim()) return
    await createComment({ ticketId: id, userName: 'Admin', body: commentText })
    setCommentText('')
  }

  const handleResolve = async () => {
    await updateStatus({ id, status: 'resolved', resolution: resolution || 'Opgelost' })
    setShowResolve(false)
  }

  const handleDelete = async () => {
    await deleteTicket({ id })
    navigate({ to: '/tickets' })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link to="/tickets" className="hover:text-white">Tickets</Link>
        <span>/</span>
        <span className="text-white">{ticket.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">{ticket.title}</h1>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColors[ticket.priority] || ''}`}>{ticket.priority}</span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[ticket.status] || ''}`}>{ticket.status === 'in_progress' ? 'in progress' : ticket.status}</span>
          </div>
          <p className="text-gray-400 text-sm">{ticket.category} · {new Date(ticket._creationTime).toLocaleString('nl-NL')}</p>
        </div>
        <div className="flex gap-2">
          {ticket.status === 'open' && (
            <button onClick={() => updateStatus({ id, status: 'in_progress' })}
              className="px-4 py-2 rounded-lg bg-blue-600 text-sm text-white hover:bg-blue-700">Start verwerking</button>
          )}
          {ticket.status === 'in_progress' && (
            <button onClick={() => setShowResolve(true)}
              className="px-4 py-2 rounded-lg bg-green-600 text-sm text-white hover:bg-green-700">Markeer opgelost</button>
          )}
          {confirmDelete ? (
            <div className="flex gap-2">
              <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 text-sm text-white hover:bg-red-700">✓ Bevestig verwijder</button>
              <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 rounded-lg bg-gray-800 text-sm text-gray-300">Annuleren</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="px-4 py-2 rounded-lg bg-red-600/20 text-sm text-red-400 hover:bg-red-600/30">🗑️</button>
          )}
        </div>
      </div>

      {/* Beschrijving */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-300 uppercase mb-3">Beschrijving</h2>
        <p className="text-sm text-gray-300 whitespace-pre-wrap">{ticket.description}</p>
      </div>

      {/* Oplossing */}
      {ticket.resolution && (
        <div className="rounded-xl bg-green-900/20 border border-green-500/20 p-6">
          <h2 className="text-sm font-semibold text-green-400 uppercase mb-3">✅ Oplossing</h2>
          <p className="text-sm text-green-300 whitespace-pre-wrap">{ticket.resolution}</p>
        </div>
      )}

      {/* Resolve modal */}
      {showResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-2xl w-full max-w-md mx-4 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Ticket oplossen</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Oplossing / Notitie</label>
              <textarea value={resolution} onChange={(e) => setResolution(e.target.value)} rows={3}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="Wat was de oplossing?" />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowResolve(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Annuleren</button>
              <button onClick={handleResolve} className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">Oplossen</button>
            </div>
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-300 uppercase mb-4">💬 Reacties ({comments.length})</h2>
        <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
          {comments.length === 0 && <p className="text-gray-500 text-sm">Nog geen reacties</p>}
          {comments.map((c) => (
            <div key={c._id} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {c.userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{c.userName}</span>
                  <span className="text-xs text-gray-500">{new Date(c._creationTime).toLocaleString('nl-NL')}</span>
                </div>
                <p className="text-sm text-gray-300 mt-0.5">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleAddComment() }} className="flex gap-3">
          <input value={commentText} onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            placeholder="Schrijf een reactie..." />
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Plaats</button>
        </form>
      </div>
    </div>
  )
}