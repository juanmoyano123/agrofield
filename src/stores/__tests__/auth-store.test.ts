import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '../auth-store'

vi.mock('../../lib/api-client', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    refreshToken: vi.fn(),
  },
}))

import { authApi } from '../../lib/api-client'
import type { User, AuthTokens } from '../../types'

const mockUser: User = {
  id: 'user-1',
  email: 'test@test.com',
  name: 'Test User',
  role: 'propietario',
  tenantId: 'tenant-1',
  tenantName: 'Test Farm',
  createdAt: '2026-01-01T00:00:00.000Z',
}

const mockTokens: AuthTokens = {
  accessToken: 'fake-access-token',
  refreshToken: 'fake-refresh-token',
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
}

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    loginAttempts: { count: 0, firstAttemptAt: null, blockedUntil: null },
  })
  localStorage.clear()
  vi.clearAllMocks()
})

describe('login', () => {
  it('sets user and isAuthenticated on success', async () => {
    vi.mocked(authApi.login).mockResolvedValueOnce({
      success: true,
      data: { user: mockUser, tokens: mockTokens },
    })

    await useAuthStore.getState().login({ email: 'test@test.com', password: 'password123' })

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(mockUser)
    expect(state.error).toBeNull()
  })

  it('sets error on failed login', async () => {
    vi.mocked(authApi.login).mockResolvedValueOnce({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Email o contraseña incorrectos' },
    })

    await useAuthStore.getState().login({ email: 'wrong@test.com', password: 'wrong' })

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.error).toBe('Email o contraseña incorrectos')
  })

  it('blocks after 5 failed attempts within 15 minutes', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Email o contraseña incorrectos' },
    })

    const store = useAuthStore.getState()
    for (let i = 0; i < 5; i++) {
      await store.login({ email: 'wrong@test.com', password: 'wrong' })
    }

    const state = useAuthStore.getState()
    expect(state.loginAttempts.blockedUntil).not.toBeNull()
    expect(state.error).toContain('bloqueada')
  })

  it('shows blocked message when blockedUntil is in future', async () => {
    useAuthStore.setState({
      loginAttempts: {
        count: 5,
        firstAttemptAt: Date.now() - 1000,
        blockedUntil: Date.now() + 30 * 60 * 1000,
      },
    })

    await useAuthStore.getState().login({ email: 'test@test.com', password: 'password' })

    expect(authApi.login).not.toHaveBeenCalled()
    expect(useAuthStore.getState().error).toContain('minutos')
  })
})

describe('logout', () => {
  it('clears user and tokens', () => {
    useAuthStore.setState({ user: mockUser, tokens: mockTokens, isAuthenticated: true })
    localStorage.setItem('AGROFIELD_AUTH_TOKENS', JSON.stringify(mockTokens))

    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.tokens).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(localStorage.getItem('AGROFIELD_AUTH_TOKENS')).toBeNull()
  })
})

describe('checkAuth', () => {
  it('restores session from valid localStorage tokens when user is in store', () => {
    useAuthStore.setState({ user: mockUser })
    localStorage.setItem('AGROFIELD_AUTH_TOKENS', JSON.stringify(mockTokens))

    useAuthStore.getState().checkAuth()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
  })

  it('clears state when tokens are expired', () => {
    const expiredTokens: AuthTokens = { ...mockTokens, expiresAt: Date.now() - 1000 }
    useAuthStore.setState({ user: mockUser, tokens: expiredTokens, isAuthenticated: true })
    localStorage.setItem('AGROFIELD_AUTH_TOKENS', JSON.stringify(expiredTokens))

    useAuthStore.getState().checkAuth()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
  })

  it('clears state when no tokens in localStorage', () => {
    useAuthStore.setState({ user: mockUser, isAuthenticated: true })

    useAuthStore.getState().checkAuth()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
  })
})
