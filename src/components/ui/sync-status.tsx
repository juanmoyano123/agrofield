/**
 * SyncStatus component
 *
 * Small inline status indicator for the app header.
 * Shows a cloud/wifi icon with a concise status label.
 *
 * Only renders when there is something meaningful to show:
 *   - Offline
 *   - Pending items count
 *   - Syncing
 *   - Success
 *   - Error
 *
 * When everything is normal (online, idle, 0 pending) it renders nothing.
 */

import { useNetworkStore } from '../../stores/network-store'

export function SyncStatus() {
  const isOnline = useNetworkStore(s => s.isOnline)
  const syncStatus = useNetworkStore(s => s.syncStatus)
  const pendingCount = useNetworkStore(s => s.pendingCount)

  // Nothing to show — everything is normal
  if (isOnline && syncStatus === 'idle' && pendingCount === 0) return null

  // ---------------------------------------------------------------------------
  // Resolve display values based on current state
  // ---------------------------------------------------------------------------

  let label: string
  let colorClasses: string
  let icon: React.ReactNode

  if (!isOnline) {
    label = 'Offline'
    colorClasses = 'text-warning'
    icon = (
      // WifiOff
      <svg
        className="w-4 h-4"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
    )
  } else if (syncStatus === 'syncing') {
    label = 'Sincronizando...'
    colorClasses = 'text-blue-500'
    icon = (
      <svg
        className="w-4 h-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    )
  } else if (syncStatus === 'success') {
    label = 'Sincronizado'
    colorClasses = 'text-success'
    icon = (
      // Cloud with check
      <svg
        className="w-4 h-4"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
  } else if (syncStatus === 'error') {
    label = 'Error sync'
    colorClasses = 'text-error'
    icon = (
      <svg
        className="w-4 h-4"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    )
  } else {
    // Online + idle + pendingCount > 0
    label = `${pendingCount} pendiente${pendingCount !== 1 ? 's' : ''}`
    colorClasses = 'text-warning'
    icon = (
      // Cloud upload icon
      <svg
        className="w-4 h-4"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
      </svg>
    )
  }

  return (
    <div
      className={`hidden sm:flex items-center gap-1 text-xs font-medium ${colorClasses}`}
      aria-live="polite"
    >
      {icon}
      <span>{label}</span>
    </div>
  )
}
