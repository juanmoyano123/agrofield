import { useAuth } from '../hooks/use-auth'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-neutral-900">
          Bienvenido, {user?.name ?? 'usuario'}
        </h1>
        {user?.tenantName && (
          <p className="text-neutral-500 mt-1">{user.tenantName}</p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 text-center">
        <div className="text-6xl mb-4">🌾</div>
        <h2 className="text-xl font-semibold text-neutral-700 mb-2">Dashboard en construcción</h2>
        <p className="text-neutral-500 text-sm">
          Las funcionalidades del dashboard estarán disponibles próximamente.
        </p>
      </div>
    </div>
  )
}
