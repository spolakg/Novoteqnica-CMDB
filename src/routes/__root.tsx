import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  Link,
  useLocation,
} from '@tanstack/react-router'
import * as React from 'react'
import { useState, useEffect } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import appCss from '~/styles/app.css?url'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'IT CMDB & Knowledge Center' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  component: RootLayout,
})

const navigation = [
  { section: "Overzicht", items: [
    { name: "Dashboard", href: "/", icon: "📊" },
  ]},
  { section: "CMDB", items: [
    { name: "Alle Assets", href: "/assets", icon: "💻" },
    { name: "Servers", href: "/assets?type=server", icon: "🖥️" },
    { name: "Printers", href: "/assets?type=printer", icon: "🖨️" },
    { name: "UPS", href: "/assets?type=ups", icon: "🔋" },
    { name: "NAS", href: "/assets?type=nas", icon: "💾" },
    { name: "Netwerk", href: "/assets?type=switch", icon: "🌐" },
  ]},
  { section: "Beheer", items: [
    { name: "Backups", href: "/backups", icon: "📦" },
    { name: "Tickets", href: "/tickets", icon: "🎫" },
  ]},
  { section: "Kennis", items: [
    { name: "Kennisbank", href: "/knowledge", icon: "📚" },
    { name: "Troubleshooting", href: "/troubleshooting", icon: "🔧" },
  ]},
  { section: "Systeem", items: [
    { name: "Gebruikers", href: "/users", icon: "👥" },
  ]},
]

function NavLink({ item, isActive }: { item: { name: string; href: string; icon: string }; isActive: boolean }) {
  return (
    <Link
      to={item.href}
      search={item.href.includes('?') ? Object.fromEntries(new URLSearchParams(item.href.split('?')[1])) : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-blue-600/20 text-blue-400"
          : "text-gray-400 hover:bg-gray-800 hover:text-white"
      }`}
    >
      <span className="text-lg">{item.icon}</span>
      {item.name}
    </Link>
  )
}

function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const location = useLocation()

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    if (newMode) document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
  }

  const isActive = (href: string) => {
    const path = href.split('?')[0]
    const search = href.split('?')[1]
    if (search) {
      return location.pathname + location.search === href
    }
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <html className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="flex h-screen bg-gray-950 text-gray-100">
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Sidebar */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gray-900 border-r border-gray-800 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}>
            <div className="flex h-16 items-center justify-between px-6 border-b border-gray-800">
              <Link to="/" className="flex items-center gap-2">
                <span className="text-2xl">🔧</span>
                <span className="text-lg font-bold text-white">IT CMDB</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white lg:hidden">✕</button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6" style={{ height: 'calc(100vh - 140px)' }}>
              {navigation.map((section) => (
                <div key={section.section}>
                  <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{section.section}</h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href.includes('?') ? item.href.split('?')[0] : item.href}
                        search={item.href.includes('?') ? Object.fromEntries(new URLSearchParams(item.href.split('?')[1])) : undefined}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive(item.href)
                            ? "bg-blue-600/20 text-blue-400"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                        activeOptions={{ exact: item.href === '/' }}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="text-lg">{item.icon}</span>
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="border-t border-gray-800 p-4">
              <div className="flex items-center gap-3 px-3">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium">A</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">Admin</p>
                  <p className="text-xs text-gray-400 truncate">Administrator</p>
                </div>
                <button onClick={toggleDarkMode} className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white" title={darkMode ? "Light mode" : "Dark mode"}>
                  {darkMode ? "☀️" : "🌙"}
                </button>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex flex-1 flex-col min-w-0">
            <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm px-6">
              <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white lg:hidden">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex-1 max-w-xl ml-4 lg:ml-0">
                <div className="relative">
                  <input type="text" placeholder="Zoek in assets, tickets, kennisbank..."
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 pl-10 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                </div>
              </div>
              <Link to="/tickets" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                + Nieuw Ticket
              </Link>
            </header>

            <main className="flex-1 overflow-y-auto p-6">
              <Outlet />
            </main>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  )
}