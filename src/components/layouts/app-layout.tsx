/**
 * AppLayout
 *
 * Main authenticated layout:
 * - Desktop: fixed sidebar + main content area
 * - Mobile: sticky header + bottom navigation bar
 *
 * F-012 additions:
 * - Badge counter in sidebar showing pendingCount (desktop)
 * - SyncPanel drawer mounted here, controlled via useNetworkStore
 * - SyncStatus in mobile header is now clickable (inside sync-status.tsx)
 * - processQueue from useSync is passed to SyncPanel for manual trigger
 */

import { useState, useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, MapPin, ShoppingCart, Package, Users, LogOut, Hammer, Map, Cloud, FileText, GitCompareArrows } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/use-auth'
import { useNetworkStore } from '../../stores/network-store'
import { useSync } from '../../hooks/use-sync'
import { SyncStatus } from '../ui/sync-status'
import { SyncPanel } from '../ui/sync-panel'
import { LanguageSelector } from '../ui/language-selector'
import { useOnboarding } from '../../hooks/use-onboarding'
import { OnboardingOverlay } from '../onboarding/onboarding-overlay'
import { OnboardingResumeBanner } from '../onboarding/onboarding-resume-banner'
import { useStockAlertCount } from '../../hooks/use-stock-alert-count'
import { useFinanceAlertCount } from '../../hooks/use-finance-alert-count'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

// Core nav items shown in both the desktop sidebar and the mobile bottom nav
const mobileNavItems: NavItem[] = [
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
  {
    to: '/operaciones',
    label: 'Operaciones',
    icon: <Hammer size={20} />,
  },
]

// Desktop sidebar shows all items including Mapa and Reporte.
// Mapa and Reporte are intentionally excluded from the mobile bottom nav to
// avoid crowding the limited space.
const sidebarNavItems: NavItem[] = [
  ...mobileNavItems,
  {
    to: '/mapa',
    label: 'Mapa',
    icon: <Map size={20} />,
  },
  // F-028: Bank/credit report — only visible to propietario/administrador
  {
    to: '/reporte-bancario',
    label: 'Reporte',
    icon: <FileText size={20} />,
  },
  // F-027: Comparativa entre campañas
  {
    to: '/comparativa',
    label: 'Comparativa',
    icon: <GitCompareArrows size={20} />,
  },
]

export function AppLayout() {
  const { t } = useTranslation('common')
  const { user, logout } = useAuth()

  const { shouldShow, currentStep, markCompleted, markSkipped } = useOnboarding()
  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    if (shouldShow && currentStep === 0) setShowOverlay(true)
  }, [shouldShow, currentStep])

  // F-012: Get processQueue from useSync for manual sync triggering
  const { processQueue } = useSync()

  // F-018: Count of products currently below their stock threshold
  const stockAlertCount = useStockAlertCount()

  // F-022: Count of active finance alerts
  const financeAlertCount = useFinanceAlertCount()

  const isOnline = useNetworkStore(s => s.isOnline)
  const syncStatus = useNetworkStore(s => s.syncStatus)
  const pendingCount = useNetworkStore(s => s.pendingCount)
  const toggleSyncPanel = useNetworkStore(s => s.toggleSyncPanel)

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
        <nav className="flex-1 py-5 overflow-y-auto" aria-label={t('nav.principal')}>
          <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/25 px-6 mb-2">{t('nav.principal')}</p>
          {sidebarNavItems.map(item => {
            // F-018: stock badge — only shown on the Stock nav item when alerts exist
            const showStockBadge = item.to === '/stock' && stockAlertCount > 0
            // F-022: finance badge — only shown on the Dashboard nav item when finance alerts exist
            const showFinanceBadge = item.to === '/dashboard' && financeAlertCount > 0
            return (
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
                    <span className="text-sm font-medium tracking-wide flex-1">{item.label}</span>
                    {showStockBadge && (
                      <span
                        className="ml-auto bg-warning text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0"
                        aria-label={`${stockAlertCount} productos con stock bajo`}
                      >
                        {stockAlertCount > 99 ? '99+' : stockAlertCount}
                      </span>
                    )}
                    {/* F-022: finance alerts badge on Dashboard nav item */}
                    {showFinanceBadge && (
                      <span
                        className="ml-auto bg-error text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0"
                        aria-label={`${financeAlertCount} alertas financieras`}
                      >
                        {financeAlertCount > 99 ? '99+' : financeAlertCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}

          {/* F-012: Pending items badge — shows when there are unsynced changes */}
          {pendingCount > 0 && (
            <button
              type="button"
              onClick={toggleSyncPanel}
              className="
                flex items-center gap-2 w-full px-6 py-2.5 mt-1
                text-sm text-[#7A9B80]
                hover:text-white hover:bg-sidebar-hover
                rounded-sm transition-colors duration-300
              "
              aria-label={t('sync.pending', { count: pendingCount })}
            >
              {/* Indent to align with nav items */}
              <span className="w-1.5 h-1.5 shrink-0" aria-hidden="true" />
              <span className="shrink-0 opacity-60">
                <Cloud size={20} />
              </span>
              <span className="flex-1 text-left">{t('sync.pending', { count: pendingCount })}</span>
              {/* Badge circle */}
              <span
                className="ml-auto bg-warning text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            </button>
          )}
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
            {t('auth.logout')}
          </button>
          {/* F-030: Language selector in sidebar footer */}
          <div className="px-2 pt-2 border-t border-sidebar-border/40">
            <LanguageSelector variant="compact" className="text-[#7A9B80]" />
          </div>
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
          {/* SyncStatus is clickable (opens panel) via F-012 changes inside sync-status.tsx */}
          <SyncStatus />
          {/* F-030: Language selector compact for mobile header */}
          <LanguageSelector variant="compact" />
          <button
            type="button"
            onClick={logout}
            className="text-sm text-text-muted hover:text-error transition-colors duration-300 min-h-[44px] px-2"
          >
            {t('auth.logoutShort')}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="md:ml-64 p-4 md:p-8 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation — shows core items only, Mapa excluded */}
      <nav
        aria-label="Navegación inferior"
        className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-surface border-t border-border-warm flex justify-around items-center z-40"
      >
        {mobileNavItems.map(item => {
          // F-018: stock badge for mobile bottom nav
          const showStockBadge = item.to === '/stock' && stockAlertCount > 0
          // F-022: finance badge for mobile bottom nav on Dashboard item
          const showFinanceBadge = item.to === '/dashboard' && financeAlertCount > 0
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex flex-col items-center justify-center gap-1 flex-1 py-2
                text-xs font-medium transition-colors duration-300
                ${isActive ? 'text-field-green' : 'text-text-muted hover:text-text-dim'}
              `}
            >
              <span className="relative">
                {item.icon}
                {showStockBadge && (
                  <span
                    className="absolute -top-1 -right-1.5 bg-warning text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none"
                    aria-label={`${stockAlertCount} alertas de stock`}
                  >
                    {stockAlertCount > 9 ? '9+' : stockAlertCount}
                  </span>
                )}
                {/* F-022: finance badge on Dashboard icon */}
                {showFinanceBadge && (
                  <span
                    className="absolute -top-1 -right-1.5 bg-error text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none"
                    aria-label={`${financeAlertCount} alertas financieras`}
                  >
                    {financeAlertCount > 9 ? '9+' : financeAlertCount}
                  </span>
                )}
              </span>
              <span>{item.label}</span>
            </NavLink>
          )
        })}
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

      {/* F-012: Sync panel drawer — mounted at the layout level so it renders above everything */}
      <SyncPanel
        onClose={toggleSyncPanel}
        onSyncNow={processQueue}
      />
    </div>
  )
}
