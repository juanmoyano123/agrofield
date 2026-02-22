/**
 * useSync hook
 *
 * Manages the sync lifecycle:
 * 1. Reads pending queue items when online
 * 2. Processes items one by one with progress tracking
 * 3. Auto-triggers when connectivity is restored
 * 4. Refreshes pending count every 10 seconds
 *
 * In mock mode (VITE_USE_MOCK_API=true), sync simulates a 300ms
 * delay per item and always succeeds. This allows development and
 * testing without a real backend.
 *
 * Concurrency protection:
 *   Uses a ref (isSyncingRef) to prevent concurrent sync passes.
 *   React StrictMode double-invocations are handled via cleanup.
 */

import { useEffect, useRef, useCallback } from 'react'
import { useNetworkStore } from '../stores/network-store'
import { useAuthStore } from '../stores/auth-store'
import {
  getPendingItems,
  getPendingCount,
  markSyncing,
  markSynced,
  markFailed,
  clearSynced,
} from '../lib/sync-queue'

/** How long to show the success status before resetting to idle (ms) */
const SUCCESS_DISPLAY_DURATION_MS = 3000

/** Interval for refreshing the pending count (ms) */
const REFRESH_INTERVAL_MS = 10_000

/** Simulated delay per item in mock mode (ms) */
const MOCK_ITEM_DELAY_MS = 300

/**
 * Simulates syncing a single item with the server.
 * In production, this would call the actual API endpoint.
 * Returns true on success, throws on failure.
 */
async function mockSyncItem(): Promise<void> {
  await new Promise<void>(resolve => setTimeout(resolve, MOCK_ITEM_DELAY_MS))
  // In mock mode, all items succeed
}

/**
 * Hook that manages the background sync process.
 * Mount once in App.tsx — it has no return value, only side effects.
 */
export function useSync(): void {
  const isOnline = useNetworkStore(s => s.isOnline)
  const setSyncStatus = useNetworkStore(s => s.setSyncStatus)
  const setSyncProgress = useNetworkStore(s => s.setSyncProgress)
  const setPendingCount = useNetworkStore(s => s.setPendingCount)
  const setLastSyncError = useNetworkStore(s => s.setLastSyncError)

  const user = useAuthStore(s => s.user)
  const tenantId = user?.tenantId ?? ''

  /** Guards against concurrent sync passes */
  const isSyncingRef = useRef(false)

  // ---------------------------------------------------------------------------
  // refreshPendingCount — updates the badge shown in the UI
  // ---------------------------------------------------------------------------

  const refreshPendingCount = useCallback(async () => {
    if (!tenantId) return
    try {
      const count = await getPendingCount(tenantId)
      setPendingCount(count)
    } catch {
      // Silently ignore — count will refresh on next interval
    }
  }, [tenantId, setPendingCount])

  // ---------------------------------------------------------------------------
  // processQueue — main sync pass
  // ---------------------------------------------------------------------------

  const processQueue = useCallback(async () => {
    if (isSyncingRef.current || !tenantId) return
    isSyncingRef.current = true

    try {
      const items = await getPendingItems(tenantId)

      if (items.length === 0) {
        isSyncingRef.current = false
        return
      }

      setSyncStatus('syncing')
      setSyncProgress({ current: 0, total: items.length })
      setLastSyncError(null)

      let successCount = 0
      let failureCount = 0

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.id === undefined) continue

        // Update progress display before processing this item
        setSyncProgress({ current: i, total: items.length })

        try {
          await markSyncing(item.id)
          await mockSyncItem()
          await markSynced(item.id)
          successCount++
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error desconocido'
          await markFailed(item.id, message)
          failureCount++
        }
      }

      // Show final progress
      setSyncProgress({ current: items.length, total: items.length })

      // Clean up synced items
      await clearSynced(tenantId)

      // Update pending count after cleanup
      await refreshPendingCount()

      if (failureCount > 0 && successCount === 0) {
        // All failed
        setSyncStatus('error')
        setLastSyncError(`${failureCount} elemento(s) no pudieron sincronizarse`)
      } else if (failureCount > 0) {
        // Mixed results
        setSyncStatus('error')
        setLastSyncError(`${failureCount} elemento(s) fallaron, ${successCount} sincronizados`)
      } else {
        // All succeeded
        setSyncStatus('success')
        setLastSyncError(null)

        // Reset to idle after display duration
        setTimeout(() => {
          setSyncStatus('idle')
          setSyncProgress(null)
        }, SUCCESS_DISPLAY_DURATION_MS)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error de sincronizacion'
      setSyncStatus('error')
      setLastSyncError(message)
    } finally {
      isSyncingRef.current = false
    }
  }, [tenantId, setSyncStatus, setSyncProgress, setLastSyncError, refreshPendingCount])

  // ---------------------------------------------------------------------------
  // Auto-trigger when connectivity is restored
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (isOnline && tenantId) {
      void processQueue()
    }
    // Only re-run when isOnline changes — not on every processQueue reference update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, tenantId])

  // ---------------------------------------------------------------------------
  // Periodic pending count refresh (every 10 seconds)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!tenantId) return

    // Initial count load
    void refreshPendingCount()

    const interval = setInterval(() => {
      void refreshPendingCount()
    }, REFRESH_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [tenantId, refreshPendingCount])
}
