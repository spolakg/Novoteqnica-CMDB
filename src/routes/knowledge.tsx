import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/knowledge')({
  component: KnowledgePage,
  validateSearch: (search: Record<string, string>) => ({
    category: search.category as string | undefined,
  }),
  head: () => ({ meta: [{ title: 'Kennisbank - IT CMDB' }] }),
})

const categories = [
  { key: '', label: 'Alles', icon: '📚' },
  { key: 'a_plus', label: 'A+ Hardware', icon: '🔧' },
  { key: 'network_plus', label: 'Network+', icon: '🌐' },
  { key: 'hyper_v', label: 'Hyper-V', icon: '🔲' },
  { key: 'backup', label: 'Backup', icon: '📦' },
  { key: 'unifi', label: 'UniFi', icon: '📡' },
  { key: 'vpn', label: 'VPN', icon: '🔒' },
  { key: 'printers', label: 'Printers', icon: '🖨️' },
  { key: 'ups', label: 'UPS', icon: '🔋' },
  { key: 'shared_folders', label: 'Shared Folders', icon: '📁' },
  { key: 'nas', label: 'NAS', icon: '💾' },
  { key: 'security', label: 'Security', icon: '🔐' },
  { key: 'general', label: 'Algemeen', icon: '📋' },
]

function KnowledgePage() {
  const { category } = Route.useSearch()
  const { data: articles } = useSuspenseQuery(convexQuery(api.index.listKnowledgeArticles, { category: category || undefined }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">📚 Kennisbank</h1>
        <p className="text-gray-400 text-sm mt-1">{articles.length} artikel{articles.length !== 1 ? 'en' : ''}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <Link
            key={cat.key}
            to="/knowledge"
            search={cat.key ? { category: cat.key } : {}}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              (category === cat.key || (!category && !cat.key))
                ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span>{cat.icon}</span> {cat.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.length === 0 ? (
          <div className="col-span-full rounded-xl bg-gray-900 border border-gray-800 px-6 py-12 text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-gray-400">Geen artikelen gevonden</p>
            <p className="text-gray-500 text-sm mt-1">Nog geen kennisartikelen in deze categorie</p>
          </div>
        ) : articles.map((article) => (
          <div key={article._id} className="rounded-xl bg-gray-900 border border-gray-800 p-5 hover:border-gray-700 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">{article.category}</span>
              <span className="text-xs text-gray-500">{article.viewCount} × bekeken</span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2">{article.title}</h3>
            <p className="text-xs text-gray-400 line-clamp-3">{article.content.slice(0, 150)}...</p>
            {article.tags.length > 0 && (
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {article.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{tag}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}