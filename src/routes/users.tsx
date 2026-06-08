import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { useMutation } from 'convex/react'
import { useState } from 'react'

export const Route = createFileRoute('/users')({
  component: UsersPage,
  head: () => ({ meta: [{ title: 'Gebruikers - IT CMDB' }] }),
})

const roleColors: Record<string, string> = {
  admin: 'bg-red-500/20 text-red-400',
  engineer: 'bg-blue-500/20 text-blue-400',
  readonly: 'bg-gray-500/20 text-gray-400',
}
const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  engineer: 'IT Engineer',
  readonly: 'Read Only',
}

function UsersPage() {
  const { data: users } = useSuspenseQuery(convexQuery(api.index.listUsers, {}))
  const createUser = useMutation(api.index.createUser)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('engineer')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">👥 Gebruikers</h1>
          <p className="text-gray-400 text-sm mt-1">{users.length} gebruiker{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ Nodig uit</button>
      </div>

      <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
        {users.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-gray-400">Geen gebruikers</p>
            <p className="text-gray-500 text-sm mt-1">Nodig gebruikers uit om samen te werken</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {users.map((user) => (
              <div key={user._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[user.role] || ''}`}>
                  {roleLabels[user.role] || user.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-2xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Nieuwe Gebruiker</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault()
              await createUser({ name, email, role: role as 'admin' | 'engineer' | 'readonly' })
              setShowForm(false); setName(''); setEmail(''); setRole('engineer')
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Naam</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">E-mail</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="john@bedrijf.nl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Rol</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                  <option value="admin">Administrator</option>
                  <option value="engineer">IT Engineer</option>
                  <option value="readonly">Read Only</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white">Annuleren</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Toevoegen</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}