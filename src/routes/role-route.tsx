import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'
import type { UserRole } from '../types'

interface RoleRouteProps {
  allowedRoles: UserRole[]
  redirectTo: string
}

/**
 * RoleRoute — guards a group of routes by user role.
 *
 * - If the user is not authenticated, redirects to /login.
 * - If the user's role is not in allowedRoles, redirects to redirectTo.
 * - Otherwise renders the child routes via <Outlet />.
 *
 * F-013: Used to split the app into the propietario/administrador
 * AppLayout world (/dashboard, /lotes, …) and the encargado
 * CampoLayout world (/campo, /campo/historial).
 */
export function RoleRoute({ allowedRoles, redirectTo }: RoleRouteProps) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user.role)) return <Navigate to={redirectTo} replace />

  return <Outlet />
}
