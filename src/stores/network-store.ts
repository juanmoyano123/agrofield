/**
 * Network Store
 *
 * Tracks the app's network connectivity and sync state.
 * This store is intentionally NOT persisted — it resets on each page load
 * because connectivity status should always reflect the current reality.
 *
 * Sync status lifecycle:
 *   idle → syncing → success (after 3s) → idle
 *   idle → syncing → error
 */

import { create } from 'zustand'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** High-level sync lifecycle status */
export type SyncStatusType = 'idle' | 'syncing' | 'success' | 'error'

/** Progress through the current sync pass */
export interface SyncProgress {
  /** How many items have been processed in this pass */
  current: number
  /** Total items to process in this pass */
  total: number
}

export interface NetworkState {
  /** Whether the browser currently has network connectivity */
  isOnline: boolean
  /** Current sync operation status */
  syncStatus: SyncStatusType
  /** Number of items pending sync (pending + failed) */
  pendingCount: number
  /** Progress for the current sync pass — null when not syncing */
  syncProgress: SyncProgress | null
  /** Human-readable error from the last failed sync attempt */
  lastSyncError: string | null
}

interface NetworkActions {
  setOnline: (isOnline: boolean) => void
  setSyncStatus: (status: SyncStatusType) => void
  setPendingCount: (count: number) => void
  setSyncProgress: (progress: SyncProgress | null) => void
  setLastSyncError: (error: string | null) => void
}

type NetworkStore = NetworkState & NetworkActions

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useNetworkStore = create<NetworkStore>()((set) => ({
  // Initial state — reads navigator.onLine to reflect current reality
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  syncStatus: 'idle',
  pendingCount: 0,
  syncProgress: null,
  lastSyncError: null,

  // Actions
  setOnline: (isOnline) => set({ isOnline }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setSyncProgress: (syncProgress) => set({ syncProgress }),
  setLastSyncError: (lastSyncError) => set({ lastSyncError }),
}))
