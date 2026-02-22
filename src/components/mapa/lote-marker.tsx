import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import type { Lote } from '../../types'

interface Props {
  lote: Lote
}

/**
 * Creates a custom circular div icon for a lote marker.
 * Color depends on the lote's actividad:
 *   - agricultura → field-green (#4A7C59)
 *   - ganaderia   → copper (#B5763A)
 */
function createIcon(actividad: string): L.DivIcon {
  const color = actividad === 'agricultura' ? '#4A7C59' : '#B5763A'
  return L.divIcon({
    className: '',
    html: `<div style="
      width:14px;
      height:14px;
      border-radius:50%;
      background:${color};
      border:2px solid white;
      box-shadow:0 1px 3px rgba(0,0,0,0.3)
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  })
}

/**
 * Renders a single Leaflet marker for a lote with a styled popup.
 * Requires the lote to have valid latitud and longitud.
 */
export function LoteMarker({ lote }: Props) {
  const navigate = useNavigate()

  // Guard: should not render if coords are missing (parent filters these out)
  if (lote.latitud == null || lote.longitud == null) return null

  const actividadLabel = lote.actividad === 'agricultura' ? 'Agricultura' : 'Ganadería'
  const badgeColor = lote.actividad === 'agricultura' ? '#4A7C59' : '#B5763A'

  return (
    <Marker
      position={[lote.latitud, lote.longitud]}
      icon={createIcon(lote.actividad)}
    >
      <Popup>
        <div style={{ minWidth: '160px', fontFamily: 'DM Sans, sans-serif' }}>
          {/* Lote name */}
          <p style={{ fontWeight: 600, marginBottom: '4px', color: '#1A1714', fontSize: '14px' }}>
            {lote.nombre}
          </p>

          {/* Hectares */}
          <p style={{ fontSize: '12px', color: '#9A9088', marginBottom: '6px' }}>
            {lote.hectareas.toLocaleString('es-AR')} ha
          </p>

          {/* Actividad badge */}
          <span style={{
            display: 'inline-block',
            fontSize: '11px',
            fontWeight: 500,
            padding: '2px 8px',
            borderRadius: '2px',
            background: `${badgeColor}22`,
            color: badgeColor,
            border: `1px solid ${badgeColor}44`,
            marginBottom: '6px',
          }}>
            {actividadLabel}
          </span>

          {/* Ubicacion (optional) */}
          {lote.ubicacion && (
            <p style={{ fontSize: '12px', color: '#9A9088', marginBottom: '8px' }}>
              {lote.ubicacion}
            </p>
          )}

          {/* Link to eventos */}
          <button
            type="button"
            onClick={() => navigate(`/lotes/${lote.id}/eventos`)}
            style={{
              fontSize: '12px',
              color: '#4A7C59',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Ver eventos
          </button>
        </div>
      </Popup>
    </Marker>
  )
}
