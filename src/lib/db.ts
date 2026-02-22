/**
 * AgroField IndexedDB database using Dexie.js
 *
 * This module defines the offline storage schema for AgroField.
 * All tables support multi-tenant isolation via tenantId.
 *
 * Schema version history:
 *   v1 — Initial schema: syncQueue, lotes, eventos, productos, compras
 */

import Dexie, { type EntityTable } from 'dexie'

// ---------------------------------------------------------------------------
// SyncQueue types
// ---------------------------------------------------------------------------

/** Operations that can be queued for sync */
export type SyncOperation = 'create' | 'update' | 'delete'

/** Lifecycle status of a sync queue item */
export type SyncStatus = 'pending' | 'syncing' | 'failed' | 'synced'

/**
 * Represents a change that needs to be synchronized with the server.
 * Items are created locally when offline and processed when connectivity returns.
 */
export interface SyncQueueItem {
  /** Auto-incremented primary key */
  id?: number
  /** Unique client-generated identifier for idempotency */
  syncId: string
  /** The table/resource this change applies to */
  tableName: string
  /** The type of operation */
  operation: SyncOperation
  /** ID of the record being affected */
  recordId: string
  /** The data payload to send to the server */
  payload: Record<string, unknown>
  /** ISO timestamp when this item was created locally */
  createdAtLocal: string
  /** Current sync status */
  status: SyncStatus
  /** Number of sync attempts made */
  attempts: number
  /** ISO timestamp of the last sync attempt */
  lastAttemptAt: string | null
  /** Error message from the last failed attempt */
  errorMessage: string | null
  /** Tenant this item belongs to — used for isolation */
  tenantId: string
}

// ---------------------------------------------------------------------------
// Cached entity types
// ---------------------------------------------------------------------------

/** Cached lote (field/plot) from the server */
export interface CachedLote {
  id: string
  tenantId: string
  nombre: string
  superficie?: number
  cultivo?: string
  estado?: string
  createdAt?: string
  updatedAt?: string
}

/** Cached evento (field event/activity) from the server */
export interface CachedEvento {
  id: string
  tenantId: string
  loteId: string
  tipo: string
  fecha: string
  descripcion?: string
  createdAt?: string
  updatedAt?: string
}

/** Cached producto (agrochemical/fertilizer product) from the server */
export interface CachedProducto {
  id: string
  tenantId: string
  nombre: string
  tipo: string
  unidad?: string
  createdAt?: string
  updatedAt?: string
}

/** Cached compra (purchase record) from the server */
export interface CachedCompra {
  id: string
  tenantId: string
  productoId: string
  fecha: string
  cantidad?: number
  precioUnitario?: number
  proveedor?: string
  createdAt?: string
  updatedAt?: string
}

// ---------------------------------------------------------------------------
// Database class
// ---------------------------------------------------------------------------

/**
 * AgroField Dexie database.
 *
 * Singleton instance exported as `db`.
 * Use this to interact with IndexedDB throughout the app.
 */
export class AgroFieldDB extends Dexie {
  /** Offline sync queue — tracks pending mutations */
  syncQueue!: EntityTable<SyncQueueItem, 'id'>
  /** Cached lotes */
  lotes!: EntityTable<CachedLote, 'id'>
  /** Cached eventos */
  eventos!: EntityTable<CachedEvento, 'id'>
  /** Cached productos */
  productos!: EntityTable<CachedProducto, 'id'>
  /** Cached compras */
  compras!: EntityTable<CachedCompra, 'id'>

  /**
   * @param dbName - Override the database name (used in tests for isolation)
   */
  constructor(dbName = 'AgroFieldDB') {
    super(dbName)

    this.version(1).stores({
      // syncQueue: auto-increment id, indexed by syncId, tableName, status, tenantId, createdAtLocal
      syncQueue: '++id, syncId, tableName, status, tenantId, createdAtLocal',
      // lotes: id is the primary key, indexed by tenantId and nombre
      lotes: 'id, tenantId, nombre',
      // eventos: id is the primary key, indexed by tenantId, loteId, tipo, fecha
      eventos: 'id, tenantId, loteId, tipo, fecha',
      // productos: id is the primary key, indexed by tenantId, nombre, tipo
      productos: 'id, tenantId, nombre, tipo',
      // compras: id is the primary key, indexed by tenantId, productoId, fecha
      compras: 'id, tenantId, productoId, fecha',
    })
  }
}

/** Singleton database instance — import this everywhere */
export const db = new AgroFieldDB()
