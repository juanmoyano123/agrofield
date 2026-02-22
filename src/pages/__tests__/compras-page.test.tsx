import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ComprasPage } from '../compras-page'
import type { Compra, Proveedor, Producto } from '../../types'

// --- Mock the compras store ---

const mockStore = {
  compras: [] as Compra[],
  proveedores: [] as Proveedor[],
  productos: [] as Producto[],
  isLoading: false,
  isSaving: false,
  error: null as string | null,
  fetchCompras: vi.fn(),
  fetchProveedores: vi.fn(),
  fetchProductos: vi.fn(),
  createCompra: vi.fn(),
  clearError: vi.fn(),
}

vi.mock('../../stores/compras-store', () => ({
  useComprasStore: (selector: (s: typeof mockStore) => unknown) => selector(mockStore),
}))

// --- Mock auth store (user required for fetching) ---

const authStore = {
  user: {
    id: 'user-demo-001',
    email: 'demo@agrofield.com',
    name: 'Carlos Mendez',
    role: 'propietario' as const,
    tenantId: 'tenant-demo-001',
    tenantName: 'Estancia La Esperanza',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  clearError: vi.fn(),
  checkAuth: vi.fn(),
  refreshToken: vi.fn(),
  loginAttempts: { count: 0, firstAttemptAt: null, blockedUntil: null },
  tokens: null,
}

vi.mock('../../stores/auth-store', () => ({
  useAuthStore: (selector: (s: typeof authStore) => unknown) => selector(authStore),
}))

// --- Helpers ---

const mockCompra: Compra = {
  id: 'compra-001',
  tenantId: 'tenant-demo-001',
  proveedorId: 'prov-001',
  proveedorName: 'AgroInsumos SA',
  fecha: '2026-02-21',
  numeroFactura: null,
  total: 450000,
  moneda: 'ARS',
  notas: null,
  items: [
    {
      id: 'item-001',
      compraId: 'compra-001',
      productoId: 'prod-001',
      productoName: 'Roundup 480',
      cantidad: 100,
      unidad: 'Litros',
      precioUnitario: 4500,
      subtotal: 450000,
    },
  ],
  createdAt: '2026-02-21T10:00:00.000Z',
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/compras']}>
      <ComprasPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  // Reset store state
  mockStore.compras = []
  mockStore.proveedores = []
  mockStore.productos = []
  mockStore.isLoading = false
  mockStore.isSaving = false
  mockStore.error = null
})

describe('ComprasPage', () => {
  it('renders the page heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /^compras$/i, level: 1 })).toBeInTheDocument()
  })

  it('calls fetch functions on mount', () => {
    renderPage()
    expect(mockStore.fetchCompras).toHaveBeenCalledWith('tenant-demo-001')
    expect(mockStore.fetchProveedores).toHaveBeenCalledWith('tenant-demo-001')
    expect(mockStore.fetchProductos).toHaveBeenCalledWith('tenant-demo-001')
  })

  it('shows Spinner when isLoading is true', () => {
    mockStore.isLoading = true
    renderPage()
    // The spinner is an SVG with animate-spin class; look for its aria-hidden container
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('shows empty state when compras array is empty and not loading', () => {
    mockStore.compras = []
    mockStore.isLoading = false
    renderPage()
    // Both mobile and desktop render — look for text in empty state
    expect(screen.getAllByText(/no hay compras registradas/i).length).toBeGreaterThan(0)
  })

  it('shows compra card when compras are present (mobile list)', () => {
    mockStore.compras = [mockCompra]
    mockStore.isLoading = false
    renderPage()
    // CompraCard shows the producto name
    expect(screen.getAllByText(/roundup 480/i).length).toBeGreaterThan(0)
  })

  it('shows proveedor name in compra card', () => {
    mockStore.compras = [mockCompra]
    mockStore.isLoading = false
    renderPage()
    expect(screen.getAllByText(/agroinsumos sa/i).length).toBeGreaterThan(0)
  })

  it('shows error alert when error is set', () => {
    mockStore.error = 'Error al cargar las compras'
    renderPage()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/error al cargar las compras/i)).toBeInTheDocument()
  })

  it('opens modal when FAB is clicked (mobile)', async () => {
    const user = userEvent.setup()
    renderPage()

    const fab = screen.getByLabelText(/nueva compra/i)
    await user.click(fab)

    // Modal title should appear
    expect(screen.getByText(/nueva compra/i, { selector: 'h2' })).toBeInTheDocument()
  })

  it('opens modal when header button is clicked (desktop)', async () => {
    const user = userEvent.setup()
    renderPage()

    const btn = screen.getByRole('button', { name: /\+ nueva compra/i })
    await user.click(btn)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('shows month group headers when compras are present', () => {
    mockStore.compras = [mockCompra]
    mockStore.isLoading = false
    renderPage()
    // February 2026 group header
    expect(screen.getAllByText(/febrero/i).length).toBeGreaterThan(0)
  })
})
