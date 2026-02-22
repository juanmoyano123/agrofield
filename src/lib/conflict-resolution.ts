/**
 * Conflict Resolution — Last-Write-Wins strategy
 *
 * When multiple updates target the same record, only the most recent one
 * should be sent to the server. Sending stale intermediate updates is both
 * wasteful and potentially dangerous (could overwrite newer server data).
 *
 * Strategy: last-write-wins (LWW)
 *   - For each (tableName, recordId) pair, keep only the update with the
 *     highest `createdAtLocal` timestamp.
 *   - Create and delete operations are always preserved as-is.
 *
 * Example:
 *   Input:  [update lote:abc at 10:00], [update lote:abc at 10:05], [create lote:xyz]
 *   Output: [update lote:abc at 10:05], [create lote:xyz]
 */

import type { SyncQueueItem } from './db'

/**
 * Collapse duplicate update operations on the same record using last-write-wins.
 *
 * Algorithm:
 * 1. Build a map of (tableName:recordId) -> most-recent SyncQueueItem for updates
 * 2. Filter the original array, keeping:
 *    - All create and delete operations
 *    - Only the winning update for each (tableName, recordId) pair
 *
 * The original item order is preserved for non-collapsed items.
 * This is important so that creates still happen before updates in the queue.
 *
 * @param items - Array of sync queue items to collapse (may be mutated in the map but not in-place)
 * @returns Filtered array with redundant updates removed
 */
export function collapseUpdates(items: SyncQueueItem[]): SyncQueueItem[] {
  // Build a winner map: key -> the item with the latest createdAtLocal
  const seen = new Map<string, SyncQueueItem>()

  for (const item of items) {
    if (item.operation === 'update') {
      const key = `${item.tableName}:${item.recordId}`
      const existing = seen.get(key)
      // Keep this item if it's newer than what we've seen (or if first seen)
      if (!existing || item.createdAtLocal > existing.createdAtLocal) {
        seen.set(key, item)
      }
    }
  }

  // Filter: keep non-updates + only the winning update for each key
  return items.filter(item => {
    if (item.operation !== 'update') return true
    const key = `${item.tableName}:${item.recordId}`
    return seen.get(key)?.id === item.id
  })
}

// ---------------------------------------------------------------------------
// Conflict notification type (for UI display)
// ---------------------------------------------------------------------------

/**
 * A notification shown to the user when a conflict was automatically resolved.
 * Displayed in the sync panel as informational — no user action required.
 */
export interface ConflictNotification {
  /** Unique ID for React key prop */
  id: string
  /** The table where the conflict occurred */
  tableName: string
  /** The record ID that had conflicting updates */
  recordId: string
  /** ISO timestamp when the conflict was resolved */
  resolvedAt: string
  /** Human-readable summary of what was resolved */
  message: string
}
