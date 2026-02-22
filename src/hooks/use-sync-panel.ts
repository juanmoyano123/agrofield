/**
 * useSyncPanel hook
 *
 * Provides all data and actions needed by the SyncPanel drawer component.
 * Uses useState + useEffect to subscribe to Dexie changes (instead of
 * dexie-react-hooks which is not installed in this project).
 *
 * Live updates: the panel refreshes its item list every time the
 * pendingCount changes in the network store, which happens every 10s
 * and after every sync pass. This keeps the display reasonably fresh.
 */

import { useState, useEffect, useCallback } from 'react'
import { db } from '../lib/db'
import type { SyncQueueItem } from '../lib/db'
import { useNetworkStore } from '../stores/network-store'
import { useAuthStore } from '../stores/auth-store'

/**
 * Hook that aggregates all state for the SyncPanel component.
 *
 * Returns:
 * - allItems: last 50 sync queue items (all statuses), newest first
 * - pendingCount, syncStatus, isOnline — from network store
 * - isSyncPanelOpen, toggleSyncPanel — drawer open/close
 * - refresh — manually refresh the item list
 */
export function useSyncPanel() {
  const [allItems, setAllItems] = useState<SyncQueueItem[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(false)

  const user = useAuthStore(s => s.user)
  const tenantId = user?.tenantId ?? ''

  const pendingCount = useNetworkStore(s => s.pendingCount)
  const syncStatus = useNetworkStore(s => s.syncStatus)
  const isOnline = useNetworkStore(s => s.isOnline)
  const isSyncPanelOpen = useNetworkStore(s => s.isSyncPanelOpen)
  const toggleSyncPanel = useNetworkStore(s => s.toggleSyncPanel)

  // ---------------------------------------------------------------------------
  // Load items from Dexie
  // ---------------------------------------------------------------------------

  const refresh = useCallback(async () => {
    if (!tenantId) {
      setAllItems([])
      return
    }

    setIsLoadingItems(true)
    try {
      // Fetch all items, newest first, capped at 50
      const items = await db.syncQueue
        .where('tenantId')
        .equals(tenantId)
        .sortBy('createdAtLocal')

      setAllItems(items.reverse().slice(0, 50))
    } catch {
      // Silently ignore — the panel will just show an empty list
      setAllItems([])
    } finally {
      setIsLoadingItems(false)
    }
  }, [tenantId])

  // ---------------------------------------------------------------------------
  // Refresh when panel opens or pendingCount changes (after sync pass)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (isSyncPanelOpen) {
      void refresh()
    }
  }, [isSyncPanelOpen, refresh])

  // Also refresh when pendingCount changes (sync completed or new items queued)
  useEffect(() => {
    if (isSyncPanelOpen) {
      void refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCount])

  // Also refresh when syncStatus transitions to 'success' or 'error'
  useEffect(() => {
    if (isSyncPanelOpen && (syncStatus === 'success' || syncStatus === 'error')) {
      void refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncStatus])

  return {
    allItems,
    isLoadingItems,
    pendingCount,
    syncStatus,
    isOnline,
    isSyncPanelOpen,
    toggleSyncPanel,
    refresh,
  }
}
