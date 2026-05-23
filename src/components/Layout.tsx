import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen overflow-hidden bg-surface-400">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-[min(90vw,18rem)] flex-shrink-0">
            <Sidebar mobile onClose={() => setSidebarOpen(false)} />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 text-ink-300 hover:text-ink-50"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-surface-300/95 border-b border-surface-50 backdrop-blur-sm">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-ink-300 hover:text-gold-400">
            <Menu size={20} />
          </button>
          <p className="font-display text-gold-400 text-lg">Barberia Roman</p>
          <div className="w-8" />
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto p-4 pb-6 md:p-6 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
