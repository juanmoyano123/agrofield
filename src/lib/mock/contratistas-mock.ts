import type { Contratista, TrabajoContratista, CreateTrabajoData, ApiResponse } from '../../types'
import { randomDelay } from './delay'

const DEMO_TENANT_ID = 'tenant-demo-001'

// In-memory store for contratistas
const mockContratistasDB: Contratista[] = [
  {
    id: 'contratista-001',
    tenantId: DEMO_TENANT_ID,
    nombre: 'Juan Diaz',
    telefono: '+54 9 341 555-0001',
    deletedAt: undefined,
    createdAt: '2026-01-05T08:00:00.000Z',
    updatedAt: '2026-01-05T08:00:00.000Z',
  },
  {
    id: 'contratista-002',
    tenantId: DEMO_TENANT_ID,
    nombre: 'Maquinas SA',
    telefono: '+54 9 341 555-0002',
    deletedAt: undefined,
    createdAt: '2026-01-06T08:00:00.000Z',
    updatedAt: '2026-01-06T08:00:00.000Z',
  },
  {
    id: 'contratista-003',
    tenantId: DEMO_TENANT_ID,
    nombre: 'Pedro Gomez',
    telefono: '+54 9 341 555-0003',
    deletedAt: undefined,
    createdAt: '2026-01-07T08:00:00.000Z',
    updatedAt: '2026-01-07T08:00:00.000Z',
  },
]

// In-memory store for trabajos
const mockTrabajosDB: TrabajoContratista[] = [
  {
    id: 'trabajo-001',
    tenantId: DEMO_TENANT_ID,
    tipo: 'arado',
    contratistaId: 'contratista-001',
    contratistaNombre: 'Juan Diaz',
    loteId: 'lote-002',
    loteNombre: 'Lote Sur',
    costo: 2500,
    fecha: '2026-01-15',
    notas: 'Arado profundo para preparación de siembra',
    estado: 'completado',
    deletedAt: undefined,
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'trabajo-002',
    tenantId: DEMO_TENANT_ID,
    tipo: 'cosecha',
    contratistaId: 'contratista-002',
    contratistaNombre: 'Maquinas SA',
    loteId: 'lote-001',
    loteNombre: 'Lote Norte',
    costo: 4500,
    fecha: '2026-02-10',
    notas: undefined,
    estado: 'programado',
    deletedAt: undefined,
    createdAt: '2026-02-01T09:00:00.000Z',
    updatedAt: '2026-02-01T09:00:00.000Z',
  },
  {
    id: 'trabajo-003',
    tenantId: DEMO_TENANT_ID,
    tipo: 'otro',
    contratistaId: 'contratista-003',
    contratistaNombre: 'Pedro Gomez',
    loteId: undefined,
    loteNombre: undefined,
    costo: 1800,
    fecha: '2026-01-20',
    notas: 'Mantenimiento general de alambrados',
    estado: 'completado',
    deletedAt: undefined,
    createdAt: '2026-01-20T11:00:00.000Z',
    updatedAt: '2026-01-20T11:00:00.000Z',
  },
  {
    id: 'trabajo-004',
    tenantId: DEMO_TENANT_ID,
    tipo: 'pulverizacion',
    contratistaId: 'contratista-001',
    contratistaNombre: 'Juan Diaz',
    loteId: 'lote-003',
    loteNombre: 'Lote Este',
    costo: 3200,
    fecha: '2026-01-28',
    notas: 'Aplicación herbicida pre-emergente',
    estado: 'completado',
    deletedAt: undefined,
    createdAt: '2026-01-28T08:30:00.000Z',
    updatedAt: '2026-01-28T08:30:00.000Z',
  },
]

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

// Contratistas CRUD

export async function mockGetContratistas(tenantId: string): Promise<ApiResponse<Contratista[]>> {
  await randomDelay()
  const contratistas = mockContratistasDB.filter(c => c.tenantId === tenantId && !c.deletedAt)
  return { success: true, data: contratistas }
}

export async function mockCreateContratista(
  nombre: string,
  tenantId: string,
): Promise<ApiResponse<Contratista>> {
  await randomDelay()
  const now = new Date().toISOString()
  const newContratista: Contratista = {
    id: generateId('contratista'),
    tenantId,
    nombre,
    telefono: undefined,
    deletedAt: undefined,
    createdAt: now,
    updatedAt: now,
  }
  mockContratistasDB.push(newContratista)
  return { success: true, data: newContratista }
}

// Trabajos CRUD

export async function mockGetTrabajos(tenantId: string): Promise<ApiResponse<TrabajoContratista[]>> {
  await randomDelay()
  const trabajos = mockTrabajosDB.filter(t => t.tenantId === tenantId && !t.deletedAt)
  return { success: true, data: trabajos }
}

export async function mockCreateTrabajo(
  data: CreateTrabajoData,
  loteId: string | undefined,
  tenantId: string,
): Promise<ApiResponse<TrabajoContratista>> {
  await randomDelay()
  const now = new Date().toISOString()
  const newTrabajo: TrabajoContratista = {
    id: generateId('trabajo'),
    tenantId,
    tipo: data.tipo,
    contratistaId: data.contratistaId,
    contratistaNombre: data.contratistaNombre,
    loteId: loteId ?? data.loteId,
    loteNombre: data.loteNombre,
    costo: data.costo,
    fecha: data.fecha,
    notas: data.notas,
    estado: data.estado,
    deletedAt: undefined,
    createdAt: now,
    updatedAt: now,
  }
  mockTrabajosDB.push(newTrabajo)
  return { success: true, data: newTrabajo }
}

export async function mockUpdateTrabajo(
  id: string,
  data: Partial<CreateTrabajoData>,
  tenantId: string,
): Promise<ApiResponse<TrabajoContratista>> {
  await randomDelay()
  const index = mockTrabajosDB.findIndex(t => t.id === id && t.tenantId === tenantId && !t.deletedAt)
  if (index === -1) {
    return { success: false, error: { code: 'NOT_FOUND', message: 'Trabajo no encontrado' } }
  }
  const existing = mockTrabajosDB[index]
  const updated: TrabajoContratista = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  }
  mockTrabajosDB[index] = updated
  return { success: true, data: updated }
}

export async function mockDeleteTrabajo(id: string, tenantId: string): Promise<ApiResponse<void>> {
  await randomDelay()
  const index = mockTrabajosDB.findIndex(t => t.id === id && t.tenantId === tenantId && !t.deletedAt)
  if (index === -1) {
    return { success: false, error: { code: 'NOT_FOUND', message: 'Trabajo no encontrado' } }
  }
  // Soft delete: set deletedAt timestamp
  mockTrabajosDB[index] = {
    ...mockTrabajosDB[index],
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return { success: true }
}
