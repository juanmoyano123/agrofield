import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'

/**
 * HomeRedirect — smart redirect from "/" based on user role.
 *
 * - Unauthenticated users → /login
 * - encargado → /campo (mobile-first field UI)
 * - propietario / administrador → /dashboard (full app)
 *
 * F-013: Replaces the static <Navigate to="/dashboard"> that was
 * previously at the "/" route.
 */
export function HomeRedirect() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role === 'encargado') return <Navigate to="/campo" replace />
  return <Navigate to="/dashboard" replace />
}
