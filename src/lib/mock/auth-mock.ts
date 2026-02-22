import type { User, AuthTokens, LoginCredentials, RegisterData, ApiResponse } from '../../types'
import { randomDelay } from './delay'

interface StoredUser {
  id: string
  email: string
  name: string
  password: string
  role: 'propietario' | 'administrador' | 'encargado'
  tenantId: string
  tenantName: string
  createdAt: string
}

const mockUsers: StoredUser[] = [
  {
    id: 'user-demo-001',
    email: 'demo@agrofield.com',
    name: 'Carlos Mendez',
    password: 'password123',
    role: 'propietario',
    tenantId: 'tenant-demo-001',
    tenantName: 'Estancia La Esperanza',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-demo-002',
    email: 'encargado@agrofield.com',
    name: 'Roberto Gonzalez',
    password: 'password123',
    role: 'encargado' as const,
    tenantId: 'tenant-demo-001',
    tenantName: 'Estancia La Esperanza',
    createdAt: '2026-01-15T00:00:00.000Z',
  },
]

function generateFakeToken(userId: string, tenantId: string): string {
  const payload = { userId, tenantId, iat: Date.now() }
  return btoa(JSON.stringify(payload))
}

function generateTokens(userId: string, tenantId: string): AuthTokens {
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  return {
    accessToken: generateFakeToken(userId, tenantId),
    refreshToken: generateFakeToken(userId + '-refresh', tenantId),
    expiresAt: Date.now() + sevenDaysMs,
  }
}

export async function mockLogin(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
  await randomDelay()
  const storedUser = mockUsers.find(u => u.email === credentials.email)
  if (!storedUser || storedUser.password !== credentials.password) {
    return {
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Email o contraseña incorrectos' },
    }
  }
  const user: User = {
    id: storedUser.id,
    email: storedUser.email,
    name: storedUser.name,
    role: storedUser.role,
    tenantId: storedUser.tenantId,
    tenantName: storedUser.tenantName,
    createdAt: storedUser.createdAt,
  }
  const tokens = generateTokens(storedUser.id, storedUser.tenantId)
  return { success: true, data: { user, tokens } }
}

export async function mockRegister(data: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
  await randomDelay()
  const existing = mockUsers.find(u => u.email === data.email)
  if (existing) {
    return {
      success: false,
      error: { code: 'EMAIL_EXISTS', message: 'Email o contraseña incorrectos' },
    }
  }
  const userId = `user-${Date.now()}`
  const tenantId = `tenant-${Date.now()}`
  const newUser: StoredUser = {
    id: userId,
    email: data.email,
    name: data.name,
    password: data.password,
    role: 'propietario',
    tenantId,
    tenantName: data.tenantName ?? `Campo de ${data.name}`,
    createdAt: new Date().toISOString(),
  }
  mockUsers.push(newUser)
  const user: User = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    tenantId: newUser.tenantId,
    tenantName: newUser.tenantName,
    createdAt: newUser.createdAt,
  }
  const tokens = generateTokens(userId, tenantId)
  return { success: true, data: { user, tokens } }
}

export async function mockRefreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
  await randomDelay(100, 300)
  try {
    const payload = JSON.parse(atob(refreshToken)) as { userId: string; tenantId: string }
    const tokens = generateTokens(payload.userId.replace('-refresh', ''), payload.tenantId)
    return { success: true, data: tokens }
  } catch {
    return { success: false, error: { code: 'INVALID_TOKEN', message: 'Token invalido' } }
  }
}
