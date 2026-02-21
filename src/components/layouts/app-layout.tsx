import { Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/use-auth'
import { Button } from '../ui/button'

export function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-xl text-field-green">AgroField</span>
          {user?.tenantName && (
            <span className="text-neutral-400 text-sm hidden sm:inline">— {user.tenantName}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-neutral-600 hidden sm:inline">{user.name}</span>
          )}
          <Button variant="ghost" size="sm" onClick={logout}>
            Salir
          </Button>
        </div>
      </header>
      <main className="p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  )
}
