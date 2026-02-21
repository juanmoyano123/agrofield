import { Navigate, Outlet, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'

export function PublicRoute() {
  const { isAuthenticated } = useAuth()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'

  if (isAuthenticated) {
    return <Navigate to={redirect} replace />
  }

  return <Outlet />
}
