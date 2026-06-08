import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'
import { useMutation } from 'convex/react'

export const Route = createFileRoute('/assets')({
  component: AssetsPage,
  validateSearch: (search: Record<string, string>) => ({
    type: search.type as string | undefined,
  }),
  head: () => ({ meta: [{ title: 'Assets - IT CMDB' }] }),
})

function AssetsPage() {
  const { type } = Route.useSearch()
  const { data: assets } = useSuspenseQuery(convexQuery(api.index.listAssets, { type: type || undefined }))
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [assetType, setAssetType] = useState('server')
  const [status, setStatus] = useState('active')
  const [ipAddress, setIpAddress] = useState('')
  const [location, setLocation] = useState('')
  const createAsset = useMutation(api.index.createAsset)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createAsset({ name, type: assetType, status, ipAddress: ipAddress || undefined, location: location || undefined })
    setName(''); setAssetType('server'); setStatus('active'); setIpAddress(''); setLocation('')
    setShowForm(false)
  }

  const typeLabels: Record<string, string> = {
    server: 'Server', hyperv_host: 'Hyper-V Host', virtual_machine: 'VM',
    printer: 'Printer', ups: 'UPS', nas: 'NAS', switch: 'Switch',
    access_point: 'Access Point', gateway: 'Gateway', firewall: 'Firewall',
    workstation: 'Workstation', other: 'Overig',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {type ? typeLabels[type] || type : 'Alle Assets'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{assets.length} item{assets.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ Nieuw</button>
      </div>

      {/* Type filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[{ label: 'Alles', value: '' }, { label: 'Server', value: 'server' }, { label: 'Hyper-V', value: 'hyperv_host' }, { label: 'VM', value: 'virtual_machine' }, { label: 'Printer', value: 'printer' }, { label: 'UPS', value: 'ups' }, { label: 'NAS', value: 'nas' }, { label: 'Switch', value: 'switch' }].map((t) => (
          <Link key={t.value} to="/assets" search={t.value ? { type: t.value } : {}} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${type === t.value || (!type && !t.value) ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
            {t.label}
          </Link>
        ))}
      </div>

      {/* Asset list */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
        {assets.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-400">Geen assets gevonden</p>
            <p className="text-gray-500 text-sm mt-1">Voeg je eerste asset toe</p>
            <button onClick={() => setShowForm(true)} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ Asset toevoegen</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {assets.map((asset) => (
              <Link key={asset._id} to="/assets/$id" params={{ id: asset._id }} className="px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors block">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">
                    {asset.type === 'server' || asset.type === 'hyperv_host' ? '🖥️' :
                     asset.type === 'virtual_machine' ? '☁️' :
                     asset.type === 'printer' ? '🖨️' :
                     asset.type === 'ups' ? '🔋' :
                     asset.type === 'nas' ? '💾' :
                     asset.type === 'switch' ? '🌐' :
                     asset.type === 'access_point' ? '📡' : '💻'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{asset.name}</p>
                    <p className="text-xs text-gray-400">{asset.hostname || asset.ipAddress || typeLabels[asset.type] || asset.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {asset.ipAddress && <span className="text-xs text-gray-500 hidden md:inline">{asset.ipAddress}</span>}
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    asset.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    asset.status === 'maintenance' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>{asset.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Add asset form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-2xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Nieuw Asset</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Naam</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="bv. DC01" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                  <select value={assetType} onChange={(e) => setAssetType(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                    <option value="server">Server</option>
                    <option value="hyperv_host">Hyper-V Host</option>
                    <option value="virtual_machine">VM</option>
                    <option value="printer">Printer</option>
                    <option value="ups">UPS</option>
                    <option value="nas">NAS</option>
                    <option value="switch">Switch</option>
                    <option value="access_point">Access Point</option>
                    <option value="firewall">Firewall</option>
                    <option value="workstation">Workstation</option>
                    <option value="other">Overig</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                    <option value="active">Actief</option>
                    <option value="maintenance">Onderhoud</option>
                    <option value="inactive">Inactief</option>
                    <option value="retired">Afgevoerd</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">IP-adres</label>
                  <input type="text" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="192.168.1.10" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Locatie</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="Datacenter A" />
                </div>
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