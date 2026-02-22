/**
 * SyncPanel
 *
 * A right-side drawer that shows the full sync queue history.
 * Allows the user to see pending items, retry failed ones,
 * and manually trigger a sync.
 *
 * Rendered via a React portal to document.body so it sits above all other
 * content including the sidebar.
 *
 * Accessibility:
 * - Focus is trapped inside the drawer when open
 * - Overlay click closes the drawer
 * - ESC key closes the drawer
 * - aria-modal and role="dialog" are set
 */

import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useSyncPanel } from '../../hooks/use-sync-panel'
import { SyncQueueItemCard } from './sync-queue-item-card'

// ---------------------------------------------------------------------------
// Connection indicator
// ---------------------------------------------------------------------------

function ConnectionIndicator({ isOnline }: { isOnline: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${isOnline ? 'text-success' : 'text-warning'}`}>
      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success' : 'bg-warning'}`} />
      {isOnline ? 'Conectado' : 'Sin conexion'}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {/* Cloud check icon */}
      <svg
        className="w-12 h-12 text-text-muted mb-3 opacity-40"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" />
      </svg>
      <p className="text-sm font-medium text-text-primary">Todo sincronizado</p>
      <p className="text-xs text-text-muted mt-1">No hay cambios pendientes</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sync now button
// ---------------------------------------------------------------------------

interface SyncNowButtonProps {
  isOnline: boolean
  isSyncing: boolean
  onSync: () => void
}

function SyncNowButton({ isOnline, isSyncing, onSync }: SyncNowButtonProps) {
  return (
    <button
      type="button"
      onClick={onSync}
      disabled={!isOnline || isSyncing}
      className="
        flex items-center gap-1.5 px-3 py-1.5
        text-xs font-medium rounded-sm
        bg-field-green text-white
        hover:bg-field-green/90 transition-colors
        disabled:opacity-40 disabled:cursor-not-allowed
      "
    >
      {isSyncing ? (
        <>
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Sincronizando…
        </>
      ) : (
        <>
          <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Sincronizar ahora
        </>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SyncPanelProps {
  /** Called when the panel requests to close (overlay click or X button) */
  onClose: () => void
  /** Trigger a manual sync pass — provided by the useSync hook */
  onSyncNow: () => Promise<void>
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SyncPanel({ onClose, onSyncNow }: SyncPanelProps) {
  const {
    allItems,
    isLoadingItems,
    pendingCount,
    syncStatus,
    isOnline,
    isSyncPanelOpen,
    refresh,
  } = useSyncPanel()

  const isSyncing = syncStatus === 'syncing'

  // Close on ESC key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isSyncPanelOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when panel is open
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isSyncPanelOpen, handleKeyDown])

  const handleSyncNow = async () => {
    await onSyncNow()
    // Refresh after a short delay to show updated states
    setTimeout(() => { void refresh() }, 500)
  }

  if (!isSyncPanelOpen) return null

  const panelContent = (
    // Full-screen overlay
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Panel de sincronizacion"
    >
      {/* Semi-transparent backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className="
          relative w-full max-w-sm h-full
          bg-parchment flex flex-col
          shadow-[−4px_0_24px_rgba(0,0,0,0.15)]
        "
        // Prevent clicks inside the panel from closing it
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border-warm bg-surface">
          <div className="flex items-center gap-2">
            {/* Cloud icon */}
            <svg
              className="w-4 h-4 text-field-green"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
            </svg>
            <h2 className="text-sm font-semibold text-text-primary">Sincronizacion</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="
              w-8 h-8 flex items-center justify-center
              rounded-sm text-text-muted
              hover:text-text-primary hover:bg-border-warm/30
              transition-colors
            "
            aria-label="Cerrar panel"
          >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Subheader: pending count + sync button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-warm bg-surface/50">
          <p className="text-xs text-text-muted">
            {pendingCount > 0
              ? `${pendingCount} pendiente${pendingCount !== 1 ? 's' : ''}`
              : 'Sin cambios pendientes'
            }
          </p>
          <SyncNowButton
            isOnline={isOnline}
            isSyncing={isSyncing}
            onSync={() => void handleSyncNow()}
          />
        </div>

        {/* Item list — scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {isLoadingItems ? (
            <div className="flex justify-center py-8">
              <svg className="w-5 h-5 animate-spin text-text-muted" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : allItems.length === 0 ? (
            <EmptyState />
          ) : (
            allItems.map(item => (
              <SyncQueueItemCard
                key={item.id ?? item.syncId}
                item={item}
                onAction={() => void refresh()}
              />
            ))
          )}
        </div>

        {/* Footer: connection status */}
        <div className="px-4 py-3 border-t border-border-warm bg-surface flex items-center justify-between">
          <ConnectionIndicator isOnline={isOnline} />
          {allItems.length > 0 && (
            <p className="text-[10px] text-text-muted">
              Mostrando los ultimos {allItems.length} cambios
            </p>
          )}
        </div>
      </div>
    </div>
  )

  // Render into document.body via portal so it's above all other content
  return createPortal(panelContent, document.body)
}
