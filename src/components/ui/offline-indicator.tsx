/**
 * OfflineIndicator component
 *
 * A fixed top banner that communicates connectivity and sync status to the user.
 *
 * Visibility rules:
 *   - Hidden: online + idle + 0 pending items
 *   - Visible: offline OR syncing OR success OR error
 *
 * States:
 *   offline  — amber/warning bar with pulse animation
 *   syncing  — blue bar showing "X de Y registros"
 *   success  — green bar (shown 3s then hides)
 *   error    — red bar
 */

import { useTranslation } from 'react-i18next'
import { useNetworkStore } from '../../stores/network-store'

export function OfflineIndicator() {
  const { t } = useTranslation('common')
  const isOnline = useNetworkStore(s => s.isOnline)
  const syncStatus = useNetworkStore(s => s.syncStatus)
  const pendingCount = useNetworkStore(s => s.pendingCount)
  const syncProgress = useNetworkStore(s => s.syncProgress)

  // Determine visibility: hidden when everything is normal
  const isHidden = isOnline && syncStatus === 'idle' && pendingCount === 0
  if (isHidden) return null

  // ---------------------------------------------------------------------------
  // Shared layout classes
  // ---------------------------------------------------------------------------
  const baseClasses =
    'fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium'

  // ---------------------------------------------------------------------------
  // Syncing state
  // ---------------------------------------------------------------------------
  if (syncStatus === 'syncing') {
    return (
      <div className={`${baseClasses} bg-blue-500 text-white`} role="status" aria-live="polite">
        {/* Spinner icon */}
        <svg
          className="w-4 h-4 animate-spin shrink-0"
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
        <span>
          {syncProgress
            ? t('sync.syncingProgress', { current: syncProgress.current, total: syncProgress.total })
            : t('sync.syncing')}
        </span>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Success state
  // ---------------------------------------------------------------------------
  if (syncStatus === 'success') {
    return (
      <div className={`${baseClasses} bg-success text-white`} role="status" aria-live="polite">
        {/* Check icon */}
        <svg
          className="w-4 h-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>{t('sync.syncSuccess')}</span>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------
  if (syncStatus === 'error') {
    return (
      <div className={`${baseClasses} bg-error text-white`} role="alert" aria-live="assertive">
        {/* X icon */}
        <svg
          className="w-4 h-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        <span>{t('sync.syncError')}</span>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Offline state (default when none of the above match)
  // ---------------------------------------------------------------------------
  return (
    <div
      className={`${baseClasses} bg-warning text-neutral-900 animate-pulse`}
      role="status"
      aria-live="polite"
    >
      {/* WifiOff icon */}
      <svg
        className="w-4 h-4 shrink-0"
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
      <span>
        {pendingCount > 0
          ? t('sync.offlineWithPending', { count: pendingCount })
          : t('sync.offline')}
      </span>
    </div>
  )
}
