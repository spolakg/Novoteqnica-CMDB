import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'

export const Route = createFileRoute('/troubleshooting')({
  component: TroubleshootingPage,
  validateSearch: (search: Record<string, string>) => ({
    category: search.category as string | undefined,
  }),
  head: () => ({ meta: [{ title: 'Troubleshooting - IT CMDB' }] }),
})

const categories = [
  { key: '', label: 'Alles', icon: '🔧' },
  { key: 'printers', label: 'Printers', icon: '🖨️' },
  { key: 'hyper_v', label: 'Hyper-V', icon: '🔲' },
  { key: 'unifi', label: 'UniFi', icon: '📡' },
  { key: 'network', label: 'Netwerk', icon: '🌐' },
  { key: 'vpn', label: 'VPN', icon: '🔒' },
  { key: 'backup', label: 'Backup', icon: '📦' },
]

function TroubleshootingPage() {
  const { category } = Route.useSearch()
  const { data: guides } = useSuspenseQuery(convexQuery(api.index.listTroubleshootingGuides, { category: category || undefined }))
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">🔧 Troubleshooting</h1>
        <p className="text-gray-400 text-sm mt-1">{guides.length} guide{guides.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <Link key={cat.key} to="/troubleshooting" search={cat.key ? { category: cat.key } : {}}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              (category === cat.key || (!category && !cat.key))
                ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span>{cat.icon}</span> {cat.label}
          </Link>
        ))}
      </div>

      <div className="space-y-4">
        {guides.length === 0 ? (
          <div className="rounded-xl bg-gray-900 border border-gray-800 px-6 py-12 text-center">
            <p className="text-4xl mb-3">🔧</p>
            <p className="text-gray-400">Geen troubleshooting guides</p>
            <p className="text-gray-500 text-sm mt-1">Nog geen procedures in deze categorie</p>
          </div>
        ) : guides.map((guide) => (
          <div key={guide._id} className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === guide._id ? null : guide._id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors text-left"
            >
              <div>
                <h3 className="text-sm font-semibold text-white">{guide.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{guide.problem}</p>
              </div>
              <span className="text-gray-500">{expanded === guide._id ? '▼' : '▶'}</span>
            </button>
            {expanded === guide._id && (
              <div className="px-6 pb-4 space-y-4">
                {guide.symptoms.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-300 uppercase mb-2">Symptomen</h4>
                    <ul className="space-y-1">
                      {guide.symptoms.map((s, i) => (
                        <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">⚠️</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {guide.causes.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-300 uppercase mb-2">Mogelijke Oorzaken</h4>
                    <ul className="space-y-1">
                      {guide.causes.map((c, i) => (
                        <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                          <span className="text-red-400 mt-0.5">🔴</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {guide.solutions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-300 uppercase mb-2">Oplossingen</h4>
                    <ol className="space-y-2">
                      {guide.solutions.map((s) => (
                        <li key={s.step} className="text-sm text-gray-400 flex items-start gap-2">
                          <span className="text-blue-400 font-bold mt-0.5">{s.step}.</span>
                          <span>{s.description}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}