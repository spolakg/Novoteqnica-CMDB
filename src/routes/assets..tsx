import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { useMutation } from 'convex/react'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/assets/')({
  component: AssetDetail,
  head: () => ({ meta: [{ title: 'Asset - IT CMDB' }] }),
})

const typeIcons: Record<string, string> = {
  server: '🖥️', hyperv_host: '🔲', virtual_machine: '☁️',
  printer: '🖨️', ups: '🔋', nas: '💾', switch: '🌐',
  access_point: '📡', gateway: '🔒', firewall: '🛡️',
  workstation: '💻', other: '📦',
}
const typeLabels: Record<string, string> = {
  server: 'Server', hyperv_host: 'Hyper-V Host', virtual_machine: 'Virtuele Machine',
  printer: 'Printer', ups: 'UPS', nas: 'NAS', switch: 'Switch',
  access_point: 'Access Point', gateway: 'Gateway', firewall: 'Firewall',
  workstation: 'Workstation', other: 'Overig',
}

function AssetDetail() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: asset } = useSuspenseQuery(convexQuery(api.index.getAsset, { id }))
  const { data: comments } = useSuspenseQuery(convexQuery(api.index.listComments, { assetId: id }))
  const updateAsset = useMutation(api.index.updateAsset)
  const deleteAsset = useMutation(api.index.deleteAsset)
  const addComment = useMutation(api.index.createComment)

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [ipAddress, setIpAddress] = useState('')
  const [hostname, setHostname] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState('active')
  const [notes, setNotes] = useState('')
  const [commentText, setCommentText] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (asset) {
      setName(asset.name)
      setIpAddress(asset.ipAddress || '')
      setHostname(asset.hostname || '')
      setLocation(asset.location || '')
      setStatus(asset.status)
      setNotes(asset.notes || '')
    }
  }, [asset])

  if (!asset) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-gray-400">Asset niet gevonden</p>
        <Link to="/assets" className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Terug naar assets</Link>
      </div>
    )
  }

  const handleSave = async () => {
    await updateAsset({ id, name, ipAddress: ipAddress || undefined, hostname: hostname || undefined, location: location || undefined, status, notes: notes || undefined })
    setEditing(false)
  }

  const handleDelete = async () => {
    await deleteAsset({ id })
    navigate({ to: '/assets' })
  }

  const handleAddComment = async () => {
    if (!commentText.trim()) return
    await addComment({ assetId: id, userName: 'Admin', body: commentText })
    setCommentText('')
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link to="/assets" className="hover:text-white">Assets</Link>
        <span>/</span>
        <span className="text-white">{asset.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{typeIcons[asset.type] || '📦'}</span>
          <div>
            <h1 className="text-2xl font-bold text-white">{asset.name}</h1>
            <p className="text-gray-400">{typeLabels[asset.type] || asset.type} · {asset.hostname || asset.ipAddress || 'Geen IP'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="px-4 py-2 rounded-lg bg-gray-800 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
            {editing ? '✕ Annuleren' : '✏️ Bewerken'}
          </button>
          {confirmDelete ? (
            <div className="flex gap-2">
              <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 text-sm text-white hover:bg-red-700">✓ Bevestig</button>
              <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 rounded-lg bg-gray-800 text-sm text-gray-300 hover:bg-gray-700">Annuleren</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="px-4 py-2 rounded-lg bg-red-600/20 text-sm text-red-400 hover:bg-red-600/30">🗑️ Verwijder</button>
          )}
        </div>
      </div>

      {/* Main info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase">Algemene Gegevens</h2>
          {editing ? (
            <div className="space-y-3">
              <InputField label="Naam" value={name} onChange={setName} />
              <InputField label="IP-adres" value={ipAddress} onChange={setIpAddress} placeholder="192.168.1.10" />
              <InputField label="Hostname" value={hostname} onChange={setHostname} placeholder="sv01.cmdb.local" />
              <InputField label="Locatie" value={location} onChange={setLocation} placeholder="Datacenter A" />
              <div>
                <label className="block text-xs text-gray-400 mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                  <option value="active">Actief</option>
                  <option value="maintenance">Onderhoud</option>
                  <option value="inactive">Inactief</option>
                  <option value="retired">Afgevoerd</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Notities</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Opslaan</button>
            </div>
          ) : (
            <div className="space-y-3">
              <InfoRow label="Type" value={typeLabels[asset.type] || asset.type} />
              <InfoRow label="Status" value={asset.status} />
              <InfoRow label="IP-adres" value={asset.ipAddress || '-'} />
              <InfoRow label="Hostname" value={asset.hostname || '-'} />
              <InfoRow label="Locatie" value={asset.location || '-'} />
              <InfoRow label="Afdeling" value={asset.department || '-'} />
              {asset.notes && <InfoRow label="Notities" value={asset.notes} />}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-3">
            <h2 className="text-sm font-semibold text-gray-300 uppercase">Systeem Info</h2>
            <InfoRow label="Serienummer" value={asset.serialNumber || '-'} />
            <InfoRow label="Model" value={asset.model || '-'} />
            <InfoRow label="Fabrikant" value={asset.manufacturer || '-'} />
            <InfoRow label="OS" value={asset.operatingSystem || '-'} />
            <InfoRow label="Firmware" value={asset.firmwareVersion || '-'} />
            <InfoRow label="MAC-adres" value={asset.macAddress || '-'} />
            {asset.cpu && <InfoRow label="CPU" value={asset.cpu} />}
            {asset.ram && <InfoRow label="RAM" value={asset.ram} />}
            {asset.storage && <InfoRow label="Opslag" value={asset.storage} />}
          </div>
        </div>
      </div>

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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm text-white font-medium">{value}</span>
    </div>
  )
}

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
    </div>
  )
}