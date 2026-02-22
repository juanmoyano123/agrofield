import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, MapPin, ShoppingCart, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/use-auth'
import { useNetworkStore } from '../../stores/network-store'
import { SyncStatus } from '../ui/sync-status'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    to: '/lotes',
    label: 'Lotes',
    icon: <MapPin size={20} />,
  },
  {
    to: '/compras',
    label: 'Compras',
    icon: <ShoppingCart size={20} />,
  },
]

export function AppLayout() {
  const { user, logout } = useAuth()

  // Determine if offline indicator is visible to add top padding
  const isOnline = useNetworkStore(s => s.isOnline)
  const syncStatus = useNetworkStore(s => s.syncStatus)
  const pendingCount = useNetworkStore(s => s.pendingCount)
  const isIndicatorVisible = !isOnline || syncStatus !== 'idle' || pendingCount > 0

  return (
    <div className={`min-h-screen bg-neutral-50 ${isIndicatorVisible ? 'pt-8' : ''}`}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-earth-brown text-white flex-col z-30">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[#8B6B47]">
          <span className="font-display font-bold text-xl text-white">AgroField</span>
          {user?.tenantName && (
            <p className="text-[#C9A97A] text-xs mt-0.5 truncate">{user.tenantName}</p>
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 py-4" aria-label="Navegación principal">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3
                border-l-4 transition-colors duration-200
                ${isActive
                  ? 'bg-[#8B6B47] border-l-success text-white'
                  : 'border-transparent hover:bg-[#8B6B47] hover:border-l-warning text-[#E8D5B7]'
                }
              `}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="px-4 py-4 border-t border-[#8B6B47]">
          {user && (
            <p className="text-xs text-[#C9A97A] mb-3 truncate">{user.name}</p>
          )}
          <button
            type="button"
            onClick={logout}
            className="
              flex items-center gap-2 w-full
              px-3 py-2 rounded-md text-sm text-[#E8D5B7]
              hover:bg-[#8B6B47] hover:text-white
              transition-colors duration-200
              min-h-[44px]
            "
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-lg text-field-green">AgroField</span>
          {user?.tenantName && (
            <span className="text-neutral-400 text-xs hidden sm:inline truncate">
              — {user.tenantName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Sync status between user name and logout button */}
          <SyncStatus />
          <button
            type="button"
            onClick={logout}
            className="text-sm text-neutral-600 hover:text-error transition-colors duration-200 min-h-[44px] px-2"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Main content — offset for sidebar on desktop */}
      <main className="md:ml-64 p-4 md:p-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Navegación inferior"
        className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-neutral-200 flex justify-around items-center z-40"
      >
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1 flex-1 py-2
              text-xs font-medium transition-colors duration-200
              ${isActive ? 'text-field-green' : 'text-neutral-500 hover:text-neutral-700'}
            `}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
