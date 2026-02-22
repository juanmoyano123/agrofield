/**
 * Tests for src/lib/db.ts
 *
 * Validates the Dexie database schema:
 * - DB opens successfully
 * - All required tables exist
 * - Basic CRUD on syncQueue works
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AgroFieldDB } from '../db'
import type { SyncQueueItem } from '../db'

// Use a unique DB name per test file to avoid ConstraintError from fake-indexeddb
// Each test also calls close() + delete() to reset state.
let db: AgroFieldDB
let dbCounter = 0

beforeEach(async () => {
  dbCounter++
  db = new AgroFieldDB(`AgroFieldDB-test-db-${dbCounter}`)
  await db.open()
})

afterEach(async () => {
  db.close()
  await db.delete()
})

// Extend AgroFieldDB to accept custom name for test isolation
declare module '../db' {
  interface AgroFieldDB {
    // constructor accepts optional name override in tests
  }
}

describe('AgroFieldDB — schema', () => {
  it('opens successfully', () => {
    expect(db.isOpen()).toBe(true)
  })

  it('has syncQueue table', () => {
    expect(db.syncQueue).toBeDefined()
  })

  it('has lotes table', () => {
    expect(db.lotes).toBeDefined()
  })

  it('has eventos table', () => {
    expect(db.eventos).toBeDefined()
  })

  it('has productos table', () => {
    expect(db.productos).toBeDefined()
  })

  it('has compras table', () => {
    expect(db.compras).toBeDefined()
  })
})

describe('AgroFieldDB — syncQueue CRUD', () => {
  const makeSampleItem = (): Omit<SyncQueueItem, 'id'> => ({
    syncId: `test-sync-id-${Date.now()}-${Math.random()}`,
    tableName: 'lotes',
    operation: 'create',
    recordId: 'record-001',
    payload: { nombre: 'Lote 1', superficie: 50 },
    createdAtLocal: new Date().toISOString(),
    status: 'pending',
    attempts: 0,
    lastAttemptAt: null,
    errorMessage: null,
    tenantId: 'tenant-001',
  })

  it('adds a syncQueue item and returns an id', async () => {
    const id = await db.syncQueue.add(makeSampleItem() as SyncQueueItem)
    expect(id).toBeDefined()
    expect(typeof id).toBe('number')
  })

  it('reads the added syncQueue item back', async () => {
    const item = makeSampleItem()
    const id = await db.syncQueue.add(item as SyncQueueItem)
    const fetched = await db.syncQueue.get(id as number)

    expect(fetched).toBeDefined()
    expect(fetched!.syncId).toBe(item.syncId)
    expect(fetched!.tableName).toBe('lotes')
    expect(fetched!.status).toBe('pending')
    expect(fetched!.tenantId).toBe('tenant-001')
  })

  it('updates a syncQueue item', async () => {
    const id = await db.syncQueue.add(makeSampleItem() as SyncQueueItem)
    await db.syncQueue.update(id as number, { status: 'synced' })
    const updated = await db.syncQueue.get(id as number)

    expect(updated!.status).toBe('synced')
  })

  it('deletes a syncQueue item', async () => {
    const id = await db.syncQueue.add(makeSampleItem() as SyncQueueItem)
    await db.syncQueue.delete(id as number)
    const deleted = await db.syncQueue.get(id as number)

    expect(deleted).toBeUndefined()
  })

  it('can add multiple items and count them', async () => {
    await db.syncQueue.add({ ...makeSampleItem() } as SyncQueueItem)
    await db.syncQueue.add({ ...makeSampleItem() } as SyncQueueItem)
    await db.syncQueue.add({ ...makeSampleItem() } as SyncQueueItem)

    const count = await db.syncQueue.count()
    expect(count).toBe(3)
  })
})
