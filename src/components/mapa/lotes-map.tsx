import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import type { Lote } from '../../types'
import { DEFAULT_CENTER, DEFAULT_ZOOM, TILE_URL, TILE_ATTRIBUTION } from '../../lib/leaflet-setup'
import { LoteMarker } from './lote-marker'

interface FitBoundsHelperProps {
  lotes: Lote[]
}

/**
 * Internal helper component that calls map.fitBounds() whenever the lotes
 * list changes. Must be rendered inside a <MapContainer> to access the map
 * instance via useMap().
 */
function FitBoundsHelper({ lotes }: FitBoundsHelperProps) {
  const map = useMap()

  useEffect(() => {
    if (lotes.length === 0) return

    const bounds = lotes.map(l => [l.latitud!, l.longitud!] as [number, number])
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [lotes, map])

  return null
}

interface LotesMapProps {
  /** Only lotes with valid latitud and longitud should be passed here */
  lotes: Lote[]
}

/**
 * Full-page Leaflet map showing all lotes that have coordinates.
 * Automatically fits the viewport to include all markers on mount.
 */
export function LotesMap({ lotes }: LotesMapProps) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)] rounded-sm border border-border-warm z-0"
      style={{ zIndex: 0 }}
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      <FitBoundsHelper lotes={lotes} />
      {lotes.map(lote => (
        <LoteMarker key={lote.id} lote={lote} />
      ))}
    </MapContainer>
  )
}
