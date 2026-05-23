import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Scissors, DollarSign, TrendingDown,
  History, FileText, LogOut, ChevronRight,
} from 'lucide-react'
import { logout } from '../lib/utils'

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Panel Principal' },
  { to: '/caja',      icon: DollarSign,      label: 'Caja del Día'    },
  { to: '/servicios', icon: Scissors,        label: 'Servicios'       },
  { to: '/gastos',    icon: TrendingDown,    label: 'Gastos'          },
  { to: '/historial', icon: History,         label: 'Historial'       },
  { to: '/reportes',  icon: FileText,        label: 'Reportes'        },
]

interface SidebarProps {
  mobile?: boolean
  onClose?: () => void
}

export default function Sidebar({ mobile, onClose }: SidebarProps) {
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside className={`flex flex-col h-full bg-surface-300 border-r border-surface-50 ${mobile ? 'w-full' : 'w-64'}`}>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-surface-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center">
            <Scissors size={16} className="text-surface-400" />
          </div>
          <div>
            <p className="font-display text-lg text-gold-400 leading-tight">BarberControl</p>
            <p className="text-xs text-ink-300 font-mono">Sistema de Gestión</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group
               ${isActive
                 ? 'bg-gold-500/10 text-gold-400 border border-gold-500/30'
                 : 'text-ink-200 hover:bg-surface-100 hover:text-ink-50 border border-transparent'
               }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-gold-400' : 'text-ink-300 group-hover:text-ink-100'} />
                <span className="flex-1 font-body">{label}</span>
                {isActive && <ChevronRight size={14} className="text-gold-500/60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-surface-50 pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm
                     text-ink-300 hover:text-red-400 hover:bg-red-900/20 transition-all duration-150"
        >
          <LogOut size={16} />
          <span className="font-body">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
