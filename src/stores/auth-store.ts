import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LoginCredentials, RegisterData, AuthState } from '../types'
import { authApi } from '../lib/api-client'
import { saveTokens, getTokens, clearTokens, isTokenExpired, isTokenNearExpiry } from '../lib/token-storage'

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const BLOCK_DURATION_MS = 30 * 60 * 1000

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  checkAuth: () => void
  clearError: () => void
}

type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginAttempts: {
    count: 0,
    firstAttemptAt: null,
    blockedUntil: null,
  },
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (credentials) => {
        const { loginAttempts } = get()
        const now = Date.now()

        if (loginAttempts.blockedUntil !== null && now < loginAttempts.blockedUntil) {
          const minutesLeft = Math.ceil((loginAttempts.blockedUntil - now) / 60000)
          set({ error: `Demasiados intentos. Intentá de nuevo en ${minutesLeft} minutos.` })
          return
        }

        if (loginAttempts.blockedUntil !== null && now >= loginAttempts.blockedUntil) {
          set({ loginAttempts: { count: 0, firstAttemptAt: null, blockedUntil: null } })
        }

        set({ isLoading: true, error: null })

        const response = await authApi.login(credentials)

        if (!response.success || !response.data) {
          const { loginAttempts: current } = get()
          const newCount = current.count + 1
          const firstAttemptAt = current.firstAttemptAt ?? now

          const withinWindow = (now - firstAttemptAt) < RATE_LIMIT_WINDOW_MS
          const shouldBlock = newCount >= RATE_LIMIT_MAX && withinWindow

          if (!withinWindow) {
            set({
              isLoading: false,
              error: response.error?.message ?? 'Email o contraseña incorrectos',
              loginAttempts: { count: 1, firstAttemptAt: now, blockedUntil: null },
            })
          } else {
            set({
              isLoading: false,
              error: shouldBlock
                ? 'Demasiados intentos. Tu cuenta fue bloqueada por 30 minutos.'
                : response.error?.message ?? 'Email o contraseña incorrectos',
              loginAttempts: {
                count: newCount,
                firstAttemptAt,
                blockedUntil: shouldBlock ? now + BLOCK_DURATION_MS : null,
              },
            })
          }
          return
        }

        const { user, tokens } = response.data
        saveTokens(tokens)
        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          loginAttempts: { count: 0, firstAttemptAt: null, blockedUntil: null },
        })
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        const response = await authApi.register(data)
        if (!response.success || !response.data) {
          set({
            isLoading: false,
            error: response.error?.message ?? 'Error al crear la cuenta. Intentá de nuevo.',
          })
          return
        }
        const { user, tokens } = response.data
        saveTokens(tokens)
        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      },

      logout: () => {
        clearTokens()
        set({ ...initialState })
      },

      refreshToken: async () => {
        const { tokens } = get()
        if (!tokens) return
        const response = await authApi.refreshToken(tokens.refreshToken)
        if (response.success && response.data) {
          saveTokens(response.data)
          set({ tokens: response.data })
        } else {
          get().logout()
        }
      },

      checkAuth: () => {
        const tokens = getTokens()
        const { user } = get()
        if (!tokens) {
          set({ isAuthenticated: false, user: null, tokens: null })
          return
        }
        if (isTokenExpired(tokens)) {
          clearTokens()
          set({ isAuthenticated: false, user: null, tokens: null })
          return
        }
        if (isTokenNearExpiry(tokens)) {
          void get().refreshToken()
        }
        if (user) {
          set({ isAuthenticated: true, tokens })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'agrofield-auth',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        loginAttempts: state.loginAttempts,
      }),
    }
  )
)
