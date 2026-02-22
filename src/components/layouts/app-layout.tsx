import { useState, useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, MapPin, ShoppingCart, Package, Users, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/use-auth'
import { useNetworkStore } from '../../stores/network-store'
import { SyncStatus } from '../ui/sync-status'
import { useOnboarding } from '../../hooks/use-onboarding'
import { OnboardingOverlay } from '../onboarding/onboarding-overlay'
import { OnboardingResumeBanner } from '../onboarding/onboarding-resume-banner'

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
  {
    to: '/proveedores',
    label: 'Proveedores',
    icon: <Users size={20} />,
  },
  {
    to: '/stock',
    label: 'Stock',
    icon: <Package size={20} />,
  },
]

export function AppLayout() {
  const { user, logout } = useAuth()

  const { shouldShow, currentStep, markCompleted, markSkipped } = useOnboarding()
  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    if (shouldShow && currentStep === 0) setShowOverlay(true)
  }, [shouldShow, currentStep])

  const isOnline = useNetworkStore(s => s.isOnline)
  const syncStatus = useNetworkStore(s => s.syncStatus)
  const pendingCount = useNetworkStore(s => s.pendingCount)
  const isIndicatorVisible = !isOnline || syncStatus !== 'idle' || pendingCount > 0

  return (
    <div className={`min-h-screen bg-parchment bg-paper-texture ${isIndicatorVisible ? 'pt-8' : ''}`}>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-sidebar text-white flex-col z-30">

        {/* Logo */}
        <div className="px-6 py-6 border-b border-sidebar-border">
          <div className="w-8 h-8 border border-white/15 flex items-center justify-center mb-3">
            <svg viewBox="0 0 16 16" className="w-4 h-4 fill-none stroke-white/60" strokeWidth="1.2">
              <path d="M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7" />
              <path d="M8 4v4l3 2" />
              <circle cx="13" cy="3" r="1.5" className="fill-field-green/40 stroke-none" />
            </svg>
          </div>
          <span className="font-display font-semibold text-xl text-white tracking-wide block">AgroField</span>
          {user?.tenantName && (
            <p className="text-text-muted text-xs mt-0.5 truncate tracking-wider uppercase" style={{ letterSpacing: '0.18em' }}>
              {user.tenantName}
            </p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-5" aria-label="Navegación principal">
          <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/25 px-6 mb-2">Principal</p>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-6 py-2.5
                transition-all duration-300
                ${isActive
                  ? 'text-white'
                  : 'text-[#7A9B80] hover:text-white/90'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-field-green shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 shrink-0" />
                  )}
                  <span className="shrink-0 opacity-60">{item.icon}</span>
                  <span className="text-sm font-medium tracking-wide">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          {user && (
            <p className="text-xs text-text-muted mb-2 truncate px-2">{user.name}</p>
          )}
          <button
            type="button"
            onClick={logout}
            className="
              flex items-center gap-2 w-full
              px-3 py-2 rounded-sm text-sm text-[#7A9B80]
              hover:bg-sidebar-hover hover:text-white
              transition-all duration-300
              min-h-[44px]
            "
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden bg-surface border-b border-border-warm px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-warm-sm">
        <div className="flex items-center gap-2">
          <span className="font-display font-semibold text-lg text-field-green">AgroField</span>
          {user?.tenantName && (
            <span className="text-text-muted text-xs hidden sm:inline truncate">
              — {user.tenantName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SyncStatus />
          <button
            type="button"
            onClick={logout}
            className="text-sm text-text-muted hover:text-error transition-colors duration-300 min-h-[44px] px-2"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="md:ml-64 p-4 md:p-8 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Navegación inferior"
        className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-surface border-t border-border-warm flex justify-around items-center z-40"
      >
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1 flex-1 py-2
              text-xs font-medium transition-colors duration-300
              ${isActive ? 'text-field-green' : 'text-text-muted hover:text-text-dim'}
            `}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Onboarding overlay — shown on first visit or when manually triggered */}
      {showOverlay && (
        <OnboardingOverlay
          onComplete={() => { markCompleted(); setShowOverlay(false) }}
          onSkip={() => { markSkipped(); setShowOverlay(false) }}
          initialStep={currentStep}
        />
      )}

      {/* Resume banner — shown when tutorial was partially completed */}
      {shouldShow && !showOverlay && currentStep > 0 && (
        <OnboardingResumeBanner
          currentStep={currentStep}
          onResume={() => setShowOverlay(true)}
          onDismiss={markSkipped}
        />
      )}
    </div>
  )
}
