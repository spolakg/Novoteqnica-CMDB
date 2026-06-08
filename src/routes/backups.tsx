import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/backups')({
  component: BackupsPage,
  head: () => ({ meta: [{ title: 'Backups - IT CMDB' }] }),
})

function BackupsPage() {
  const { data: backups } = useSuspenseQuery(convexQuery(api.index.listBackups, {}))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">📦 Backups</h1>
        <p className="text-gray-400 text-sm mt-1">{backups.length} backup{backups.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
        {backups.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-400">Geen backups geregistreerd</p>
            <p className="text-gray-500 text-sm mt-1">Backups verschijnen hier zodra ze zijn aangemaakt via een asset</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {backups.map((backup) => (
              <div key={backup._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-white">{backup.backupType}</p>
                  <p className="text-xs text-gray-400">{backup.frequency} · Asset: {backup.assetId}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  backup.status === 'success' ? 'bg-green-500/20 text-green-400' :
                  backup.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>{backup.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}