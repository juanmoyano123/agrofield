import type { Lote, CreateLoteData, UpdateLoteData, ApiResponse } from '../../types'
import { randomDelay } from './delay'

// The demo tenant ID — must match auth-mock.ts
const DEMO_TENANT_ID = 'tenant-demo-001'

// In-memory store for lotes
const mockLotesDB: Lote[] = [
  {
    id: 'lote-001',
    tenantId: DEMO_TENANT_ID,
    nombre: 'Lote Norte',
    ubicacion: 'Sector norte del campo',
    hectareas: 120,
    actividad: 'agricultura',
    latitud: -34.6037,
    longitud: -58.3816,
    costoTotal: 0,
    ultimoEvento: undefined,
    deletedAt: undefined,
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'lote-002',
    tenantId: DEMO_TENANT_ID,
    nombre: 'Lote Sur',
    ubicacion: 'Sector sur del campo',
    hectareas: 85,
    actividad: 'ganaderia',
    latitud: -34.6137,
    longitud: -58.3916,
    costoTotal: 0,
    ultimoEvento: undefined,
    // F-021: Livestock demo data
    cabezas: 180,
    raza: 'Angus',
    tipoProduccion: 'cria',
    categoriaAnimal: 'Vacas de cria',
    deletedAt: undefined,
    createdAt: '2026-01-11T09:00:00.000Z',
    updatedAt: '2026-01-11T09:00:00.000Z',
  },
  {
    id: 'lote-003',
    tenantId: DEMO_TENANT_ID,
    nombre: 'Lote Este',
    ubicacion: undefined,
    hectareas: 200,
    actividad: 'agricultura',
    latitud: undefined,
    longitud: undefined,
    costoTotal: 0,
    ultimoEvento: undefined,
    deletedAt: undefined,
    createdAt: '2026-01-12T10:00:00.000Z',
    updatedAt: '2026-01-12T10:00:00.000Z',
  },
]

function generateId(): string {
  return `lote-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

export async function mockGetLotes(tenantId: string): Promise<ApiResponse<Lote[]>> {
  await randomDelay()
  const lotes = mockLotesDB.filter(l => l.tenantId === tenantId && !l.deletedAt)
  return { success: true, data: lotes }
}

export async function mockGetLoteById(id: string, tenantId: string): Promise<ApiResponse<Lote>> {
  await randomDelay(100, 300)
  const lote = mockLotesDB.find(l => l.id === id && l.tenantId === tenantId && !l.deletedAt)
  if (!lote) {
    return { success: false, error: { code: 'NOT_FOUND', message: 'Lote no encontrado' } }
  }
  return { success: true, data: lote }
}

export async function mockCreateLote(data: CreateLoteData, tenantId: string): Promise<ApiResponse<Lote>> {
  await randomDelay()
  const now = new Date().toISOString()
  const newLote: Lote = {
    id: generateId(),
    tenantId,
    nombre: data.nombre,
    ubicacion: data.ubicacion,
    hectareas: data.hectareas,
    actividad: data.actividad,
    latitud: data.latitud,
    longitud: data.longitud,
    costoTotal: 0,
    ultimoEvento: undefined,
    // F-021: Propagate livestock fields from creation data
    cabezas: data.cabezas,
    raza: data.raza,
    tipoProduccion: data.tipoProduccion,
    categoriaAnimal: data.categoriaAnimal,
    deletedAt: undefined,
    createdAt: now,
    updatedAt: now,
  }
  mockLotesDB.push(newLote)
  return { success: true, data: newLote }
}

export async function mockUpdateLote(
  id: string,
  data: UpdateLoteData,
  tenantId: string,
): Promise<ApiResponse<Lote>> {
  await randomDelay()
  const index = mockLotesDB.findIndex(l => l.id === id && l.tenantId === tenantId && !l.deletedAt)
  if (index === -1) {
    return { success: false, error: { code: 'NOT_FOUND', message: 'Lote no encontrado' } }
  }
  const existing = mockLotesDB[index]
  const updated: Lote = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  }
  mockLotesDB[index] = updated
  return { success: true, data: updated }
}

export async function mockDeleteLote(id: string, tenantId: string): Promise<ApiResponse<void>> {
  await randomDelay()
  const index = mockLotesDB.findIndex(l => l.id === id && l.tenantId === tenantId && !l.deletedAt)
  if (index === -1) {
    return { success: false, error: { code: 'NOT_FOUND', message: 'Lote no encontrado' } }
  }
  // Soft delete: set deletedAt timestamp
  mockLotesDB[index] = {
    ...mockLotesDB[index],
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return { success: true }
}

// Export the legacy mock array for backward compatibility with compras-mock
export const mockLotes = [
  { id: 'lote-001', name: 'Lote Norte', superficie: 120 },
  { id: 'lote-002', name: 'Lote Sur', superficie: 85 },
  { id: 'lote-003', name: 'Lote Este', superficie: 200 },
]
