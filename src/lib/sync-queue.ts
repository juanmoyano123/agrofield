/**
 * Sync Queue Operations
 *
 * High-level functions for managing the offline sync queue.
 * The queue stores mutations made while offline and replays them
 * to the server once connectivity is restored.
 *
 * Retry policy:
 *   - Items start as 'pending'
 *   - On failure: attempts++ — stays 'pending' until MAX_RETRIES reached
 *   - At MAX_RETRIES: status becomes 'failed' (stops retrying automatically)
 *   - On success: status becomes 'synced'
 *   - clearSynced() removes all 'synced' items for a tenant
 *
 * Testability note:
 *   All functions accept an optional `db` parameter to allow test isolation
 *   without module mocking. Defaults to the singleton `db` from db.ts.
 *
 * F-012 additions:
 *   - getAllItems: fetch all items (all statuses) for panel display
 *   - retryFailed: reset a failed item back to pending for re-processing
 *   - discardItem: permanently remove an item from the queue
 */

import { db as defaultDb } from './db'
import type { AgroFieldDB, SyncQueueItem, SyncOperation } from './db'

/** Maximum number of automatic retry attempts before marking as failed */
export const MAX_RETRIES = 3

// ---------------------------------------------------------------------------
// Enqueue
// ---------------------------------------------------------------------------

/** Input for creating a new sync queue item */
export interface EnqueueInput {
  tableName: string
  operation: SyncOperation
  recordId: string
  payload: Record<string, unknown>
  tenantId: string
}

/**
 * Add a new mutation to the sync queue.
 * The item is created with status 'pending' and 0 attempts.
 *
 * @param input - The mutation to queue
 * @param db - Optional DB instance (defaults to singleton; override in tests)
 * @returns The auto-incremented id of the created queue item
 */
export async function enqueue(input: EnqueueInput, db: AgroFieldDB = defaultDb): Promise<number> {
  const item: Omit<SyncQueueItem, 'id'> = {
    syncId: crypto.randomUUID(),
    tableName: input.tableName,
    operation: input.operation,
    recordId: input.recordId,
    payload: input.payload,
    createdAtLocal: new Date().toISOString(),
    status: 'pending',
    attempts: 0,
    lastAttemptAt: null,
    errorMessage: null,
    tenantId: input.tenantId,
  }

  const id = await db.syncQueue.add(item as SyncQueueItem)
  return id as number
}

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

/**
 * Count items that still need to be synced (pending + failed).
 * Used to show the pending badge in the UI.
 *
 * @param tenantId - Only count items belonging to this tenant
 * @param db - Optional DB instance (defaults to singleton; override in tests)
 */
export async function getPendingCount(tenantId: string, db: AgroFieldDB = defaultDb): Promise<number> {
  const count = await db.syncQueue
    .where('tenantId')
    .equals(tenantId)
    .and(item => item.status === 'pending' || item.status === 'failed')
    .count()

  return count
}

/**
 * Get all items that should be processed in the next sync pass.
 * Only returns 'pending' items (not 'failed' — those are user-visible errors).
 * Ordered by createdAtLocal ascending (FIFO).
 *
 * @param tenantId - Only return items belonging to this tenant
 * @param db - Optional DB instance (defaults to singleton; override in tests)
 */
export async function getPendingItems(tenantId: string, db: AgroFieldDB = defaultDb): Promise<SyncQueueItem[]> {
  const items = await db.syncQueue
    .where('tenantId')
    .equals(tenantId)
    .and(item => item.status === 'pending')
    .sortBy('createdAtLocal')

  return items
}

/**
 * Get all items in the sync queue for a tenant, regardless of status.
 * Used by the sync panel to display the full history/queue state.
 * Ordered by createdAtLocal descending (newest first) and limited to 50
 * items to avoid overwhelming the UI.
 *
 * @param tenantId - Only return items belonging to this tenant
 * @param db - Optional DB instance (defaults to singleton; override in tests)
 */
export async function getAllItems(tenantId: string, db: AgroFieldDB = defaultDb): Promise<SyncQueueItem[]> {
  const items = await db.syncQueue
    .where('tenantId')
    .equals(tenantId)
    .sortBy('createdAtLocal')

  // Reverse to get newest first and limit to 50
  return items.reverse().slice(0, 50)
}

// ---------------------------------------------------------------------------
// Status transitions
// ---------------------------------------------------------------------------

/**
 * Mark a queue item as currently being synced.
 * This prevents other sync processes from picking up the same item.
 *
 * @param id - The sync queue item id
 * @param db - Optional DB instance (defaults to singleton; override in tests)
 */
export async function markSyncing(id: number, db: AgroFieldDB = defaultDb): Promise<void> {
  await db.syncQueue.update(id, {
    status: 'syncing',
    lastAttemptAt: new Date().toISOString(),
  })
}

/**
 * Mark a queue item as successfully synced.
 *
 * @param id - The sync queue item id
 * @param db - Optional DB instance (defaults to singleton; override in tests)
 */
export async function markSynced(id: number, db: AgroFieldDB = defaultDb): Promise<void> {
  await db.syncQueue.update(id, {
    status: 'synced',
  })
}

/**
 * Mark a queue item as failed.
 *
 * Retry policy:
 * - Increments attempts counter
 * - If attempts < MAX_RETRIES: status stays 'pending' (will retry)
 * - If attempts >= MAX_RETRIES: status becomes 'failed' (stops retrying)
 *
 * @param id - The sync queue item id
 * @param errorMessage - Human-readable error description
 * @param db - Optional DB instance (defaults to singleton; override in tests)
 */
export async function markFailed(
  id: number,
  errorMessage: string,
  db: AgroFieldDB = defaultDb
): Promise<void> {
  const item = await db.syncQueue.get(id)
  if (!item) return

  const newAttempts = (item.attempts ?? 0) + 1
  const newStatus = newAttempts >= MAX_RETRIES ? 'failed' : 'pending'

  await db.syncQueue.update(id, {
    status: newStatus,
    attempts: newAttempts,
    lastAttemptAt: new Date().toISOString(),
    errorMessage,
  })
}

// ---------------------------------------------------------------------------
// F-012: User-initiated actions
// ---------------------------------------------------------------------------

/**
 * Reset a failed item back to 'pending' so it will be retried on the next sync pass.
 * Clears the attempts counter and error message to give the item a fresh start.
 *
 * @param id - The sync queue item id to retry
 * @param db - Optional DB instance (defaults to singleton; override in tests)
 */
export async function retryFailed(id: number, db: AgroFieldDB = defaultDb): Promise<void> {
  await db.syncQueue.update(id, {
    status: 'pending',
    attempts: 0,
    errorMessage: null,
  })
}

/**
 * Permanently delete a queue item.
 * Used when the user explicitly wants to discard a pending or failed change.
 * This cannot be undone — the mutation will never be sent to the server.
 *
 * @param id - The sync queue item id to discard
 * @param db - Optional DB instance (defaults to singleton; override in tests)
 */
export async function discardItem(id: number, db: AgroFieldDB = defaultDb): Promise<void> {
  await db.syncQueue.delete(id)
}

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

/**
 * Remove all successfully synced items for a tenant.
 * Call this after a successful sync pass to keep the queue clean.
 *
 * @param tenantId - Only delete items belonging to this tenant
 * @param db - Optional DB instance (defaults to singleton; override in tests)
 */
export async function clearSynced(tenantId: string, db: AgroFieldDB = defaultDb): Promise<void> {
  await db.syncQueue
    .where('tenantId')
    .equals(tenantId)
    .and(item => item.status === 'synced')
    .delete()
}
