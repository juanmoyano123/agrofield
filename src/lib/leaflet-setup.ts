/**
 * leaflet-setup.ts
 * Fixes Leaflet default marker icon paths broken by Vite's asset bundling.
 * Must be imported ONCE before any Leaflet map is rendered.
 */
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Remove the private _getIconUrl method that Leaflet uses internally to
// resolve default icon paths — Vite hashes those paths, so we replace them
// with the explicitly imported URLs below.
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

/** Default map center: center of Argentina's Pampas region */
export const DEFAULT_CENTER: [number, number] = [-34.0, -61.0]

/** Default zoom level — shows most of the Buenos Aires province */
export const DEFAULT_ZOOM = 7

/** OpenStreetMap tile URL template */
export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

/** Required attribution for OpenStreetMap tiles */
export const TILE_ATTRIBUTION = '© OpenStreetMap contributors'
