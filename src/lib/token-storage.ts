import type { AuthTokens } from '../types'

const STORAGE_KEY = 'AGROFIELD_AUTH_TOKENS'

export function saveTokens(tokens: AuthTokens): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
}

export function getTokens(): AuthTokens | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthTokens
  } catch {
    return null
  }
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function isTokenExpired(tokens: AuthTokens): boolean {
  return Date.now() >= tokens.expiresAt
}

export function isTokenNearExpiry(tokens: AuthTokens, thresholdMs = 24 * 60 * 60 * 1000): boolean {
  return Date.now() >= tokens.expiresAt - thresholdMs
}
