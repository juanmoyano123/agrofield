export type UserRole = 'propietario' | 'administrador' | 'encargado'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  tenantId: string
  tenantName: string
  createdAt: string
}

export interface Tenant {
  id: string
  name: string
  ownerId: string
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  name: string
  password: string
  confirmPassword: string
  tenantName?: string
}

export interface LoginAttempts {
  count: number
  firstAttemptAt: number | null
  blockedUntil: number | null
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  loginAttempts: LoginAttempts
}

export interface InvitationData {
  email: string
  role: 'administrador' | 'encargado'
}
