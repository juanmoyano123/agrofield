/**
 * CampoLotesPage — index page of the /campo route group.
 *
 * Displays:
 * - Personalised greeting with today's date.
 * - A list of CampoLoteCard components, one per lote in the tenant.
 * - Loading and empty states.
 *
 * Tapping "Registrar evento" on a card navigates to
 * /campo/registrar/:loteId where the encargado fills the quick-form.
 *
 * F-013: Mobile-first, no filtering/sorting — encargados only need to
 * find their lote and log an event quickly.
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/use-auth'
import { useLotes } from '../../hooks/use-lotes'
import { CampoLoteCard } from '../../components/campo/campo-lote-card'
import { Spinner } from '../../components/ui/spinner'

function getTodayLabel(): string {
  return new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function CampoLotesPage() {
  const { user } = useAuth()
  const { lotes, isLoading, fetchLotes } = useLotes()
  const navigate = useNavigate()

  // Load lotes for the current tenant on mount
  useEffect(() => {
    if (user?.tenantId) {
      fetchLotes(user.tenantId)
    }
  }, [user?.tenantId, fetchLotes])

  function handleRegistrar(loteId: string) {
    navigate(`/campo/registrar/${loteId}`)
  }

  const activeLotes = lotes.filter(l => !l.deletedAt)

  return (
    <div className="flex flex-col gap-4">
      {/* Greeting */}
      <div>
        <h1 className="text-text-primary font-display font-semibold text-xl">
          Hola, {user?.name?.split(' ')[0] ?? 'encargado'}
        </h1>
        <p className="text-text-muted text-sm capitalize">{getTodayLabel()}</p>
      </div>

      {/* Lotes list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : activeLotes.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-12">
          No hay lotes disponibles para registrar.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {activeLotes.map(lote => (
            <CampoLoteCard key={lote.id} lote={lote} onRegistrar={handleRegistrar} />
          ))}
        </div>
      )}
    </div>
  )
}
