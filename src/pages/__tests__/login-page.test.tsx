import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../login-page'
import { useAuthStore } from '../../stores/auth-store'

vi.mock('../../stores/auth-store', () => {
  const store = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    loginAttempts: { count: 0, firstAttemptAt: null, blockedUntil: null },
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    clearError: vi.fn(),
    checkAuth: vi.fn(),
    refreshToken: vi.fn(),
  }
  return {
    useAuthStore: (selector: (s: typeof store) => unknown) => selector(store),
  }
})

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/registro" element={<div>Registro</div>} />
        <Route path="/recuperar-contrasena" element={<div>Recuperar</div>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LoginPage', () => {
  it('renders email and password inputs', () => {
    renderLoginPage()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
  })

  it('renders the INGRESAR button', () => {
    renderLoginPage()
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument()
  })

  it('shows register link', () => {
    renderLoginPage()
    expect(screen.getByRole('link', { name: /registrate/i })).toBeInTheDocument()
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText(/email/i), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(screen.getByText(/email válido/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for empty fields', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(screen.getByText(/email es obligatorio/i)).toBeInTheDocument()
    })
  })
})
