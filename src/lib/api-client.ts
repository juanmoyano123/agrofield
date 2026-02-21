import type { User, AuthTokens, LoginCredentials, RegisterData, ApiResponse } from '../types'
import { mockLogin, mockRegister, mockRefreshToken } from './mock/auth-mock'

const useMock = import.meta.env.VITE_USE_MOCK_API !== 'false'

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
