/**
 * CampoLayout — simplified mobile-first layout for the Encargado de Campo role.
 *
 * Differs from AppLayout intentionally:
 * - No desktop sidebar (encargados work on phones in the field).
 * - Minimal header: logo + tenant name + SyncStatus + logout button.
 * - Two-tab bottom nav: Lotes (/campo) and Historial (/campo/historial).
 * - No onboarding overlay, no full sync panel — keeps the UI lean.
 *
 * F-013: Entry point for all /campo/* routes.
 */

import { NavLink, Outlet } from 'react-router-dom'
import { MapPin, Clock, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/use-auth'
import { SyncStatus } from '../ui/sync-status'

export function CampoLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      {/* ------------------------------------------------------------------ */}
      {/* Header — dark sidebar-green background, white text                  */}
      {/* ------------------------------------------------------------------ */}
      <header className="bg-sidebar text-white px-4 py-3 flex items-center justify-between">
        <div>
          <span className="font-display font-semibold text-lg">AgroField</span>
          <p className="text-xs text-white/60">{user?.tenantName}</p>
        </div>
        <div className="flex items-center gap-3">
          <SyncStatus />
          <button
            type="button"
            onClick={logout}
            aria-label="Cerrar sesión"
            className="text-white/60 hover:text-white transition-colors min-h-[44px] px-1 flex items-center"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Main content — padded bottom so the fixed nav doesn't overlap       */}
      {/* ------------------------------------------------------------------ */}
      <main className="flex-1 p-4 pb-24">
        <Outlet />
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Bottom navigation — 2 tabs                                          */}
      {/* ------------------------------------------------------------------ */}
      <nav
        aria-label="Navegación campo"
        className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border-warm flex z-40"
      >
        <NavLink
          to="/campo"
          end
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
              isActive ? 'text-field-green' : 'text-text-muted'
            }`
          }
        >
          <MapPin size={20} />
          Lotes
        </NavLink>
        <NavLink
          to="/campo/historial"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
              isActive ? 'text-field-green' : 'text-text-muted'
            }`
          }
        >
          <Clock size={20} />
          Historial
        </NavLink>
      </nav>
    </div>
  )
}
