/**
 * Tests for src/lib/sync-queue.ts
 *
 * Validates the sync queue operations:
 * - enqueue() creates item with correct defaults
 * - getPendingCount() returns count of pending + failed
 * - getPendingItems() returns FIFO order
 * - markSynced() + clearSynced() removes items
 * - markFailed() increments attempts, becomes 'failed' at MAX_RETRIES
 * - Tenant isolation works
 *
 * Uses dependency injection (db parameter) to isolate each test.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AgroFieldDB } from '../db'
import {
  enqueue,
  getPendingCount,
  getPendingItems,
  markSyncing,
  markSynced,
  markFailed,
  clearSynced,
  MAX_RETRIES,
} from '../sync-queue'

let db: AgroFieldDB
let dbCounter = 0

beforeEach(async () => {
  dbCounter++
  db = new AgroFieldDB(`AgroFieldDB-sq-${dbCounter}`)
  await db.open()
})

afterEach(async () => {
  db.close()
  await db.delete()
})

// Convenience wrapper: all calls pass the test db instance
const eq = (input: Parameters<typeof enqueue>[0]) => enqueue(input, db)
const gpc = (tenantId: string) => getPendingCount(tenantId, db)
const gpi = (tenantId: string) => getPendingItems(tenantId, db)
const ms = (id: number) => markSyncing(id, db)
const msd = (id: number) => markSynced(id, db)
const mf = (id: number, msg: string) => markFailed(id, msg, db)
const cs = (tenantId: string) => clearSynced(tenantId, db)

const BASE_INPUT = {
  tableName: 'lotes',
  operation: 'create' as const,
  recordId: 'r1',
  payload: {},
  tenantId: 'tenant-001',
}

describe('enqueue()', () => {
  it('creates item with status pending and 0 attempts', async () => {
    const id = await eq(BASE_INPUT)
    const item = await db.syncQueue.get(id)

    expect(item).toBeDefined()
    expect(item!.status).toBe('pending')
    expect(item!.attempts).toBe(0)
    expect(item!.lastAttemptAt).toBeNull()
    expect(item!.errorMessage).toBeNull()
    expect(item!.tableName).toBe('lotes')
    expect(item!.operation).toBe('create')
    expect(item!.recordId).toBe('r1')
    expect(item!.tenantId).toBe('tenant-001')
    expect(item!.syncId).toBeTruthy()
    expect(item!.createdAtLocal).toBeTruthy()
  })

  it('generates a unique syncId for each item', async () => {
    const id1 = await eq({ ...BASE_INPUT, recordId: 'r1' })
    const id2 = await eq({ ...BASE_INPUT, recordId: 'r2' })

    const item1 = await db.syncQueue.get(id1)
    const item2 = await db.syncQueue.get(id2)
    expect(item1!.syncId).not.toBe(item2!.syncId)
  })
})

describe('getPendingCount()', () => {
  it('returns count of pending items', async () => {
    await eq({ ...BASE_INPUT, recordId: 'r1' })
    await eq({ ...BASE_INPUT, recordId: 'r2' })

    const count = await gpc('tenant-001')
    expect(count).toBe(2)
  })

  it('includes failed items in the count', async () => {
    const id1 = await eq({ ...BASE_INPUT, recordId: 'r1' })
    await eq({ ...BASE_INPUT, recordId: 'r2' })

    // Force item to failed status by exceeding MAX_RETRIES
    for (let i = 0; i < MAX_RETRIES; i++) {
      await mf(id1, 'test error')
    }

    const count = await gpc('tenant-001')
    // id1 is now 'failed', id2 is still 'pending' — both counted
    expect(count).toBe(2)
  })

  it('does not count synced items', async () => {
    const id = await eq({ ...BASE_INPUT, recordId: 'r1' })
    await msd(id)

    const count = await gpc('tenant-001')
    expect(count).toBe(0)
  })

  it('returns 0 when queue is empty', async () => {
    const count = await gpc('tenant-empty')
    expect(count).toBe(0)
  })
})

describe('getPendingItems()', () => {
  it('returns items in FIFO order (sorted by createdAtLocal)', async () => {
    // Add items with explicit timestamps to guarantee order
    await db.syncQueue.add({
      syncId: 'sync-1',
      tableName: 'lotes',
      operation: 'create',
      recordId: 'r1',
      payload: {},
      createdAtLocal: '2024-01-01T00:00:01.000Z',
      status: 'pending',
      attempts: 0,
      lastAttemptAt: null,
      errorMessage: null,
      tenantId: 'tenant-001',
    })
    await db.syncQueue.add({
      syncId: 'sync-2',
      tableName: 'lotes',
      operation: 'create',
      recordId: 'r2',
      payload: {},
      createdAtLocal: '2024-01-01T00:00:02.000Z',
      status: 'pending',
      attempts: 0,
      lastAttemptAt: null,
      errorMessage: null,
      tenantId: 'tenant-001',
    })
    await db.syncQueue.add({
      syncId: 'sync-3',
      tableName: 'lotes',
      operation: 'create',
      recordId: 'r3',
      payload: {},
      createdAtLocal: '2024-01-01T00:00:03.000Z',
      status: 'pending',
      attempts: 0,
      lastAttemptAt: null,
      errorMessage: null,
      tenantId: 'tenant-001',
    })

    const items = await gpi('tenant-001')
    expect(items).toHaveLength(3)
    expect(items[0].syncId).toBe('sync-1')
    expect(items[1].syncId).toBe('sync-2')
    expect(items[2].syncId).toBe('sync-3')
  })

  it('does not return syncing or synced items', async () => {
    const id1 = await eq({ ...BASE_INPUT, recordId: 'r1' })
    await eq({ ...BASE_INPUT, recordId: 'r2' })

    // Mark first item as syncing
    await ms(id1)

    const items = await gpi('tenant-001')
    // Only the second item should be pending
    expect(items).toHaveLength(1)
    expect(items[0].recordId).toBe('r2')
  })
})

describe('markSynced() + clearSynced()', () => {
  it('markSynced sets status to synced', async () => {
    const id = await eq({ ...BASE_INPUT, recordId: 'r1' })
    await msd(id)

    const item = await db.syncQueue.get(id)
    expect(item!.status).toBe('synced')
  })

  it('clearSynced removes synced items for the tenant', async () => {
    const id1 = await eq({ ...BASE_INPUT, recordId: 'r1' })
    const id2 = await eq({ ...BASE_INPUT, recordId: 'r2' })

    await msd(id1)
    await msd(id2)
    await cs('tenant-001')

    const count = await db.syncQueue.count()
    expect(count).toBe(0)
  })

  it('clearSynced does not remove pending items', async () => {
    const id1 = await eq({ ...BASE_INPUT, recordId: 'r1' })
    await eq({ ...BASE_INPUT, recordId: 'r2' })

    // Only sync the first item
    await msd(id1)
    await cs('tenant-001')

    const remaining = await db.syncQueue.toArray()
    expect(remaining).toHaveLength(1)
    expect(remaining[0].recordId).toBe('r2')
  })
})

describe('markFailed()', () => {
  it('increments attempts on each failure', async () => {
    const id = await eq({ ...BASE_INPUT, recordId: 'r1' })

    await mf(id, 'Network error')
    let item = await db.syncQueue.get(id)
    expect(item!.attempts).toBe(1)
    expect(item!.status).toBe('pending') // still retryable

    await mf(id, 'Network error')
    item = await db.syncQueue.get(id)
    expect(item!.attempts).toBe(2)
    expect(item!.status).toBe('pending') // still retryable
  })

  it(`becomes 'failed' status after ${MAX_RETRIES} attempts`, async () => {
    const id = await eq({ ...BASE_INPUT, recordId: 'r1' })

    for (let i = 0; i < MAX_RETRIES; i++) {
      await mf(id, 'Persistent error')
    }

    const item = await db.syncQueue.get(id)
    expect(item!.attempts).toBe(MAX_RETRIES)
    expect(item!.status).toBe('failed')
    expect(item!.errorMessage).toBe('Persistent error')
  })

  it('sets lastAttemptAt timestamp', async () => {
    const id = await eq({ ...BASE_INPUT, recordId: 'r1' })
    const before = new Date().toISOString()

    await mf(id, 'Error')

    const item = await db.syncQueue.get(id)
    expect(item!.lastAttemptAt).toBeTruthy()
    expect(item!.lastAttemptAt! >= before).toBe(true)
  })
})

describe('Tenant isolation', () => {
  it('getPendingCount only counts items for the specified tenant', async () => {
    await eq({ ...BASE_INPUT, recordId: 'r1', tenantId: 'tenant-A' })
    await eq({ ...BASE_INPUT, recordId: 'r2', tenantId: 'tenant-A' })
    await eq({ ...BASE_INPUT, recordId: 'r3', tenantId: 'tenant-B' })

    expect(await gpc('tenant-A')).toBe(2)
    expect(await gpc('tenant-B')).toBe(1)
    expect(await gpc('tenant-C')).toBe(0)
  })

  it('getPendingItems only returns items for the specified tenant', async () => {
    await eq({ ...BASE_INPUT, recordId: 'r1', tenantId: 'tenant-A' })
    await eq({ ...BASE_INPUT, recordId: 'r2', tenantId: 'tenant-B' })

    const itemsA = await gpi('tenant-A')
    const itemsB = await gpi('tenant-B')

    expect(itemsA).toHaveLength(1)
    expect(itemsA[0].recordId).toBe('r1')
    expect(itemsB).toHaveLength(1)
    expect(itemsB[0].recordId).toBe('r2')
  })

  it('clearSynced only removes synced items for the specified tenant', async () => {
    const id1 = await eq({ ...BASE_INPUT, recordId: 'r1', tenantId: 'tenant-A' })
    const id2 = await eq({ ...BASE_INPUT, recordId: 'r2', tenantId: 'tenant-B' })

    await msd(id1)
    await msd(id2)

    // Only clear tenant-A
    await cs('tenant-A')

    const remaining = await db.syncQueue.toArray()
    expect(remaining).toHaveLength(1)
    expect(remaining[0].tenantId).toBe('tenant-B')
  })
})
