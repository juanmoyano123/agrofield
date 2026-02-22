import type { User, AuthTokens, LoginCredentials, RegisterData, ApiResponse, Compra, CompraFormData, NuevoProveedorData, Proveedor, Producto } from '../types'
import type { Lote, CreateLoteData, UpdateLoteData } from '../types'
import { mockLogin, mockRegister, mockRefreshToken } from './mock/auth-mock'
import { mockGetCompras, mockCreateCompra, mockGetProveedores, mockCreateProveedor, mockGetProductos } from './mock/compras-mock'
import {
  mockGetLotes,
  mockGetLoteById,
  mockCreateLote,
  mockUpdateLote,
  mockDeleteLote,
} from './mock/lotes-mock'
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
}
