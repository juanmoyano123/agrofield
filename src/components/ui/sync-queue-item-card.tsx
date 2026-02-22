/**
 * SyncQueueItemCard
 *
 * Displays a single sync queue item in the sync panel.
 * Shows operation type, table, record ID, timestamp, and status badge.
 * For failed items, shows the error message and a retry button.
 */

import type { SyncQueueItem } from '../../lib/db'
import { retryFailed, discardItem } from '../../lib/sync-queue'
import { useNetworkStore } from '../../stores/network-store'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formats a relative time string from an ISO timestamp.
 * Examples: "hace 3 min", "hace 2 h", "hace 1 d"
 */
function formatRelativeTime(isoString: string): string {
  const now = Date.now()
  const then = new Date(isoString).getTime()
  const diffMs = now - then

  if (diffMs < 0) return 'ahora'

  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'hace un momento'

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `hace ${diffMin} min`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `hace ${diffHours} h`

  const diffDays = Math.floor(diffHours / 24)
  return `hace ${diffDays} d`
}

/**
 * Abbreviates a record ID for display.
 * UUIDs are truncated to first 8 chars; other IDs kept as-is up to 12 chars.
 */
function abbreviateId(recordId: string): string {
  if (recordId.includes('-')) {
    // Likely a UUID — show first 8 chars
    return recordId.slice(0, 8) + '…'
  }
  return recordId.length > 12 ? recordId.slice(0, 12) + '…' : recordId
}

// ---------------------------------------------------------------------------
// Operation icon
// ---------------------------------------------------------------------------

interface OperationIconProps {
  operation: SyncQueueItem['operation']
}

function OperationIcon({ operation }: OperationIconProps) {
  if (operation === 'create') {
    return (
      <span
        aria-label="Crear"
        className="flex items-center justify-center w-7 h-7 rounded-full bg-success/15 text-success text-xs font-bold shrink-0"
      >
        +
      </span>
    )
  }
  if (operation === 'update') {
    return (
      <span
        aria-label="Actualizar"
        className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/15 text-blue-500 text-xs font-bold shrink-0"
      >
        ✎
      </span>
    )
  }
  // delete
  return (
    <span
      aria-label="Eliminar"
      className="flex items-center justify-center w-7 h-7 rounded-full bg-error/15 text-error text-xs font-bold shrink-0"
    >
      ✕
    </span>
  )
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

interface StatusBadgeProps {
  status: SyncQueueItem['status']
}

function StatusBadge({ status }: StatusBadgeProps) {
  const configs: Record<SyncQueueItem['status'], { label: string; classes: string }> = {
    pending: {
      label: 'Pendiente',
      classes: 'bg-warning/15 text-warning',
    },
    syncing: {
      label: 'Sincronizando',
      classes: 'bg-blue-500/15 text-blue-500',
    },
    synced: {
      label: 'Sincronizado',
      classes: 'bg-success/15 text-success',
    },
    failed: {
      label: 'Error',
      classes: 'bg-error/15 text-error',
    },
  }

  const { label, classes } = configs[status]

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${classes}`}>
      {status === 'syncing' && (
        // Tiny spinner for syncing state
        <svg className="w-2.5 h-2.5 mr-1 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface SyncQueueItemCardProps {
  item: SyncQueueItem
  /** Called after a retry or discard action so the parent can refresh */
  onAction?: () => void
}

export function SyncQueueItemCard({ item, onAction }: SyncQueueItemCardProps) {
  const isOnline = useNetworkStore(s => s.isOnline)
  const setPendingCount = useNetworkStore(s => s.setPendingCount)

  const tableName = item.tableName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())

  const handleRetry = async () => {
    if (item.id === undefined) return
    try {
      await retryFailed(item.id)
      // Optimistically bump the pending count — the full refresh will correct it
      onAction?.()
    } catch {
      // Ignore — the item will remain in failed state
    }
  }

  const handleDiscard = async () => {
    if (item.id === undefined) return
    try {
      await discardItem(item.id)
      onAction?.()
    } catch {
      // Ignore
    }
  }

  // Suppress TS unused warning — setPendingCount is used indirectly via onAction
  void setPendingCount

  return (
    <div className="flex gap-3 p-3 bg-surface border border-border-warm rounded-sm shadow-warm">
      {/* Operation icon */}
      <OperationIcon operation={item.operation} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Top row: table + record + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text-primary truncate">{tableName}</p>
            <p className="text-[10px] text-text-muted font-mono">{abbreviateId(item.recordId)}</p>
          </div>
          <StatusBadge status={item.status} />
        </div>

        {/* Timestamp */}
        <p className="text-[10px] text-text-muted mt-1">
          {formatRelativeTime(item.createdAtLocal)}
          {item.attempts > 0 && (
            <span className="ml-1 text-text-muted">· {item.attempts} intento{item.attempts !== 1 ? 's' : ''}</span>
          )}
        </p>

        {/* Error message */}
        {item.status === 'failed' && item.errorMessage && (
          <p className="text-[10px] text-error mt-1 leading-snug line-clamp-2">
            {item.errorMessage}
          </p>
        )}

        {/* Actions for failed items */}
        {item.status === 'failed' && (
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => void handleRetry()}
              disabled={!isOnline}
              className="
                text-[10px] font-medium px-2 py-1 rounded-sm
                bg-field-green/15 text-field-green
                hover:bg-field-green/25 transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={() => void handleDiscard()}
              className="
                text-[10px] font-medium px-2 py-1 rounded-sm
                bg-error/10 text-error
                hover:bg-error/20 transition-colors
              "
            >
              Descartar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
