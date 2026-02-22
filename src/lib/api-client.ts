import type { User, AuthTokens, LoginCredentials, RegisterData, ApiResponse, Compra, CompraFormData, NuevoProveedorData, Proveedor, Producto } from '../types'
import type { Lote, CreateLoteData, UpdateLoteData } from '../types'
import type { Evento, CreateEventoData, UpdateEventoData } from '../types'
import type { TrabajoContratista, CreateTrabajoData, UpdateTrabajoData, Contratista } from '../types'
import type { EventoRodeo, CreateEventoRodeoData, UpdateEventoRodeoData } from '../types'
import { mockLogin, mockRegister, mockRefreshToken } from './mock/auth-mock'
import { mockGetCompras, mockCreateCompra, mockGetProveedores, mockCreateProveedor, mockGetProductos } from './mock/compras-mock'
import { mockGetMovimientos } from './mock/stock-mock'
import {
  mockGetLotes,
  mockGetLoteById,
  mockCreateLote,
  mockUpdateLote,
  mockDeleteLote,
} from './mock/lotes-mock'
import {
  mockGetEventosByLote,
  mockGetAllEventos,
  mockCreateEvento,
  mockUpdateEvento,
  mockDeleteEvento,
} from './mock/eventos-mock'
import {
  mockGetTrabajos,
  mockCreateTrabajo,
  mockUpdateTrabajo,
  mockDeleteTrabajo,
  mockGetContratistas,
  mockCreateContratista,
} from './mock/contratistas-mock'
import {
  mockGetEventosRodeoByLote,
  mockCreateEventoRodeo,
  mockUpdateEventoRodeo,
  mockDeleteEventoRodeo,
} from './mock/rodeo-mock'
import { getTokens } from './token-storage'

const useMock = import.meta.env.VITE_USE_MOCK_API !== 'false'

function getAuthHeaders(): Record<string, string> {
  const tokens = getTokens()
  if (!tokens) return { 'Content-Type': 'application/json' }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${tokens.accessToken}`,
  }
}

export const authApi = {
  login: (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> => {
    if (useMock) return mockLogin(credentials)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then(r => r.json() as Promise<ApiResponse<{ user: User; tokens: AuthTokens }>>)
  },
  register: (data: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> => {
    if (useMock) return mockRegister(data)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json() as Promise<ApiResponse<{ user: User; tokens: AuthTokens }>>)
  },
  refreshToken: (refreshToken: string): Promise<ApiResponse<AuthTokens>> => {
    if (useMock) return mockRefreshToken(refreshToken)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).then(r => r.json() as Promise<ApiResponse<AuthTokens>>)
  },
}

export const lotesApi = {
  getLotes: (tenantId: string): Promise<ApiResponse<Lote[]>> => {
    if (useMock) return mockGetLotes(tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/lotes`, {
      headers: getAuthHeaders(),
    }).then(r => r.json() as Promise<ApiResponse<Lote[]>>)
  },
  getLoteById: (id: string, tenantId: string): Promise<ApiResponse<Lote>> => {
    if (useMock) return mockGetLoteById(id, tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/lotes/${id}`, {
      headers: getAuthHeaders(),
    }).then(r => r.json() as Promise<ApiResponse<Lote>>)
  },
  createLote: (data: CreateLoteData, tenantId: string): Promise<ApiResponse<Lote>> => {
    if (useMock) return mockCreateLote(data, tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/lotes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...data, tenantId }),
    }).then(r => r.json() as Promise<ApiResponse<Lote>>)
  },
  updateLote: (id: string, data: UpdateLoteData, tenantId: string): Promise<ApiResponse<Lote>> => {
    if (useMock) return mockUpdateLote(id, data, tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/lotes/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(r => r.json() as Promise<ApiResponse<Lote>>)
  },
  deleteLote: (id: string, tenantId: string): Promise<ApiResponse<void>> => {
    if (useMock) return mockDeleteLote(id, tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/lotes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(r => r.json() as Promise<ApiResponse<void>>)
  },
}

export const comprasApi = {
  getCompras: (tenantId: string): Promise<ApiResponse<Compra[]>> => {
    if (useMock) return mockGetCompras(tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/compras?tenantId=${tenantId}`)
      .then(r => r.json() as Promise<ApiResponse<Compra[]>>)
  },
  createCompra: (data: CompraFormData, tenantId: string, resolvedProveedorId: string): Promise<ApiResponse<Compra>> => {
    if (useMock) return mockCreateCompra(data, tenantId, resolvedProveedorId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/compras`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, tenantId, proveedorId: resolvedProveedorId }),
    }).then(r => r.json() as Promise<ApiResponse<Compra>>)
  },
}

export const proveedoresApi = {
  getProveedores: (tenantId: string): Promise<ApiResponse<Proveedor[]>> => {
    if (useMock) return mockGetProveedores(tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/proveedores?tenantId=${tenantId}`)
      .then(r => r.json() as Promise<ApiResponse<Proveedor[]>>)
  },
  createProveedor: (data: NuevoProveedorData, tenantId: string): Promise<ApiResponse<Proveedor>> => {
    if (useMock) return mockCreateProveedor(data, tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/proveedores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, tenantId }),
    }).then(r => r.json() as Promise<ApiResponse<Proveedor>>)
  },
}

export const productosApi = {
  getProductos: (tenantId: string): Promise<ApiResponse<Producto[]>> => {
    if (useMock) return mockGetProductos(tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/productos?tenantId=${tenantId}`)
      .then(r => r.json() as Promise<ApiResponse<Producto[]>>)
  },
  getMovimientos: (tenantId: string): Promise<ApiResponse<import('../types').StockMovimiento[]>> => {
    if (useMock) return mockGetMovimientos(tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/stock/movimientos?tenantId=${tenantId}`, {
      headers: getAuthHeaders(),
    }).then(r => r.json() as Promise<ApiResponse<import('../types').StockMovimiento[]>>)
  },
}

export const contratistasApi = {
  getContratistas: (tenantId: string): Promise<ApiResponse<Contratista[]>> => {
    if (useMock) return mockGetContratistas(tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/contratistas?tenantId=${tenantId}`, {
      headers: getAuthHeaders(),
    }).then(r => r.json() as Promise<ApiResponse<Contratista[]>>)
  },
  createContratista: (nombre: string, tenantId: string): Promise<ApiResponse<Contratista>> => {
    if (useMock) return mockCreateContratista(nombre, tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/contratistas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ nombre, tenantId }),
    }).then(r => r.json() as Promise<ApiResponse<Contratista>>)
  },
}

export const trabajosApi = {
  getTrabajos: (tenantId: string): Promise<ApiResponse<TrabajoContratista[]>> => {
    if (useMock) return mockGetTrabajos(tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/trabajos?tenantId=${tenantId}`, {
      headers: getAuthHeaders(),
    }).then(r => r.json() as Promise<ApiResponse<TrabajoContratista[]>>)
  },
  createTrabajo: (data: CreateTrabajoData, tenantId: string): Promise<ApiResponse<TrabajoContratista>> => {
    if (useMock) return mockCreateTrabajo(data, data.loteId, tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/trabajos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...data, tenantId }),
    }).then(r => r.json() as Promise<ApiResponse<TrabajoContratista>>)
  },
  updateTrabajo: (id: string, data: UpdateTrabajoData, tenantId: string): Promise<ApiResponse<TrabajoContratista>> => {
    if (useMock) return mockUpdateTrabajo(id, data, tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/trabajos/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(r => r.json() as Promise<ApiResponse<TrabajoContratista>>)
  },
  deleteTrabajo: (id: string, tenantId: string): Promise<ApiResponse<void>> => {
    if (useMock) return mockDeleteTrabajo(id, tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/trabajos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(r => r.json() as Promise<ApiResponse<void>>)
  },
}

export const rodeoApi = {
  getEventosRodeoByLote: (loteId: string, tenantId: string): Promise<ApiResponse<EventoRodeo[]>> => {
    if (useMock) return mockGetEventosRodeoByLote(loteId, tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/lotes/${loteId}/rodeo`, {
      headers: getAuthHeaders(),
    }).then(r => r.json() as Promise<ApiResponse<EventoRodeo[]>>)
  },
  createEventoRodeo: (data: CreateEventoRodeoData, loteId: string, tenantId: string): Promise<ApiResponse<EventoRodeo>> => {
    if (useMock) return mockCreateEventoRodeo(data, loteId, tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/lotes/${loteId}/rodeo`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...data, tenantId }),
    }).then(r => r.json() as Promise<ApiResponse<EventoRodeo>>)
  },
  updateEventoRodeo: (id: string, data: UpdateEventoRodeoData, tenantId: string): Promise<ApiResponse<EventoRodeo>> => {
    if (useMock) return mockUpdateEventoRodeo(id, data, tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/rodeo/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(r => r.json() as Promise<ApiResponse<EventoRodeo>>)
  },
  deleteEventoRodeo: (id: string, tenantId: string): Promise<ApiResponse<void>> => {
    if (useMock) return mockDeleteEventoRodeo(id, tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/rodeo/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(r => r.json() as Promise<ApiResponse<void>>)
  },
}

export const eventosApi = {
  getEventosByLote: (loteId: string, tenantId: string): Promise<ApiResponse<Evento[]>> => {
    if (useMock) return mockGetEventosByLote(loteId, tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/lotes/${loteId}/eventos`, {
      headers: getAuthHeaders(),
    }).then(r => r.json() as Promise<ApiResponse<Evento[]>>)
  },
  // F-005: Fetch all eventos for a tenant (cross-lote) for imputacion engine
  getAllEventos: (tenantId: string): Promise<ApiResponse<Evento[]>> => {
    if (useMock) return mockGetAllEventos(tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/eventos?tenantId=${tenantId}`, {
      headers: getAuthHeaders(),
    }).then(r => r.json() as Promise<ApiResponse<Evento[]>>)
  },
  createEvento: (data: CreateEventoData, loteId: string, tenantId: string): Promise<ApiResponse<Evento>> => {
    if (useMock) return mockCreateEvento(data, loteId, tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/lotes/${loteId}/eventos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...data, tenantId }),
    }).then(r => r.json() as Promise<ApiResponse<Evento>>)
  },
  updateEvento: (id: string, data: UpdateEventoData, tenantId: string): Promise<ApiResponse<Evento>> => {
    if (useMock) return mockUpdateEvento(id, data, tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/eventos/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(r => r.json() as Promise<ApiResponse<Evento>>)
  },
  deleteEvento: (id: string, tenantId: string): Promise<ApiResponse<void>> => {
    if (useMock) return mockDeleteEvento(id, tenantId)
    return fetch(`${import.meta.env.VITE_API_BASE_URL}/eventos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(r => r.json() as Promise<ApiResponse<void>>)
  },
}
