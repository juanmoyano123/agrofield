import { Alert } from '../ui/alert'

interface Props {
  /** Number of lotes that are missing latitude/longitude coordinates */
  count: number
}

/**
 * Displays a warning alert when some lotes have no coordinates and therefore
 * cannot be shown on the map.
 */
export function MapMissingCoordsAlert({ count }: Props) {
  if (count === 0) return null

  return (
    <Alert variant="warning">
      <strong>{count} {count === 1 ? 'lote no tiene' : 'lotes no tienen'} coordenadas.</strong>{' '}
      Editá {count === 1 ? 'el lote' : 'los lotes'} para agregarles latitud y longitud.
    </Alert>
  )
}
