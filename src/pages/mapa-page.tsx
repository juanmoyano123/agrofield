// Activate Leaflet icon fix for Vite — must be imported before any map render
import '../lib/leaflet-setup'

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'
import { useLotes } from '../hooks/use-lotes'
import { LotesMap } from '../components/mapa/lotes-map'
import { MapMissingCoordsAlert } from '../components/mapa/map-missing-coords-alert'
import { EmptyState } from '../components/ui/empty-state'
import { Spinner } from '../components/ui/spinner'

/**
 * MapaPage — /mapa
 *
 * Displays an interactive Leaflet map showing all lotes that have coordinates.
 * Three render states:
 *   1. No lotes at all → EmptyState prompting to create lotes
 *   2. Lotes exist but none have coordinates → EmptyState + warning alert
 *   3. At least one lote has coordinates → full map with markers
 *
 * Lotes missing coordinates are excluded from the map but shown in a warning
 * alert above it so the user knows they are not represented.
 */
export function MapaPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { lotes, isLoading, fetchLotes } = useLotes()

  // Fetch lotes on mount if we have a logged-in user
  useEffect(() => {
    if (!user) return
    void fetchLotes(user.tenantId)
  }, [user, fetchLotes])

  // Partition lotes into those with and without map coordinates
  const lotesConCoords = lotes.filter(
    l => l.latitud != null && l.longitud != null
  )
  const lotesSinCoords = lotes.filter(
    l => l.latitud == null || l.longitud == null
  )

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/lotes')}
          aria-label="Volver a lotes"
          className="
            flex items-center justify-center
            w-9 h-9 rounded-sm
            border border-border-warm bg-surface
            text-text-muted hover:text-text-primary hover:bg-parchment
            transition-colors duration-200
          "
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-display tracking-tight">
            Mapa de Lotes
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Visualización geográfica de tus lotes
          </p>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {/* Content — only shown when not loading */}
      {!isLoading && (
        <>
          {/* State 1: No lotes at all */}
          {lotes.length === 0 && (
            <EmptyState
              icon="🗺️"
              title="Sin lotes"
              description="Todavía no tenés lotes registrados. Creá tu primer lote para verlo en el mapa."
              action={{ label: 'Ir a Lotes', onClick: () => navigate('/lotes') }}
            />
          )}

          {/* State 2: Lotes exist but none have coordinates */}
          {lotes.length > 0 && lotesConCoords.length === 0 && (
            <>
              <MapMissingCoordsAlert count={lotesSinCoords.length} />
              <EmptyState
                icon="📍"
                title="Sin coordenadas"
                description="Ningún lote tiene coordenadas geográficas. Editá tus lotes y agregá latitud y longitud para verlos en el mapa."
                action={{ label: 'Ir a Lotes', onClick: () => navigate('/lotes') }}
              />
            </>
          )}

          {/* State 3: At least one lote has coordinates — show map */}
          {lotesConCoords.length > 0 && (
            <>
              {/* Warning for lotes without coordinates */}
              <MapMissingCoordsAlert count={lotesSinCoords.length} />

              {/* The interactive map */}
              <LotesMap lotes={lotesConCoords} />
            </>
          )}
        </>
      )}
    </div>
  )
}
