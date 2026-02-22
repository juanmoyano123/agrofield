import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LotesPage } from '../lotes-page'
import type { Lote } from '../../types'

// Mock the hook
const mockUseLotes = {
  lotes: [] as Lote[],
  filteredLotes: [] as Lote[],
  isLoading: false,
  isSaving: false,
  error: null as string | null,
  successMessage: null as string | null,
  searchQuery: '',
  filterActividad: '' as '' | 'agricultura' | 'ganaderia',
  sortField: 'nombre' as 'nombre' | 'hectareas',
  sortOrder: 'asc' as 'asc' | 'desc',
  fetchLotes: vi.fn(),
  createLote: vi.fn(),
  updateLote: vi.fn(),
  deleteLote: vi.fn(),
  setSearchQuery: vi.fn(),
  setFilterActividad: vi.fn(),
  setSortField: vi.fn(),
  setSortOrder: vi.fn(),
  clearError: vi.fn(),
  clearSuccessMessage: vi.fn(),
}

vi.mock('../../hooks/use-lotes', () => ({
  useLotes: () => mockUseLotes,
}))

vi.mock('../../hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 'user-1', tenantId: 'tenant-demo-001', name: 'Test User', tenantName: 'Test Farm' },
    isAuthenticated: true,
  }),
}))

const mockLote: Lote = {
  id: 'lote-001',
  tenantId: 'tenant-demo-001',
  nombre: 'Lote Norte',
  hectareas: 120,
  actividad: 'agricultura',
  costoTotal: 0,
  createdAt: '2026-01-10T08:00:00.000Z',
  updatedAt: '2026-01-10T08:00:00.000Z',
}

function renderLotesPage() {
  return render(
    <MemoryRouter initialEntries={['/lotes']}>
      <Routes>
        <Route path="/lotes" element={<LotesPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  // Reset mock state
  mockUseLotes.lotes = []
  mockUseLotes.filteredLotes = []
  mockUseLotes.isLoading = false
  mockUseLotes.isSaving = false
  mockUseLotes.error = null
  mockUseLotes.successMessage = null
  mockUseLotes.searchQuery = ''
  mockUseLotes.filterActividad = ''
})

describe('LotesPage', () => {
  it('renders page heading', () => {
    renderLotesPage()
    expect(screen.getByRole('heading', { level: 1, name: /lotes/i })).toBeInTheDocument()
  })

  it('shows loading spinner when isLoading is true', () => {
    mockUseLotes.isLoading = true
    renderLotesPage()
    // Spinner should be in the document (aria-hidden but present in DOM)
    const spinner = document.querySelector('svg.animate-spin')
    expect(spinner).toBeTruthy()
  })

  it('renders empty state when no lotes', () => {
    renderLotesPage()
    expect(screen.getByText(/no hay lotes/i)).toBeInTheDocument()
  })

  it('renders lote cards when lotes exist', () => {
    mockUseLotes.filteredLotes = [mockLote]
    renderLotesPage()
    expect(screen.getByText('Lote Norte')).toBeInTheDocument()
    expect(screen.getByText(/120/)).toBeInTheDocument()
  })

  it('renders the "Nuevo lote" button (desktop)', () => {
    renderLotesPage()
    const buttons = screen.getAllByText(/nuevo lote/i)
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('shows error alert when error is set', () => {
    mockUseLotes.error = 'Error al cargar los lotes'
    renderLotesPage()
    expect(screen.getByText(/error al cargar los lotes/i)).toBeInTheDocument()
  })

  it('shows success alert when successMessage is set', () => {
    mockUseLotes.successMessage = 'Lote creado exitosamente'
    renderLotesPage()
    expect(screen.getByText(/lote creado exitosamente/i)).toBeInTheDocument()
  })

  it('calls fetchLotes on mount', () => {
    renderLotesPage()
    expect(mockUseLotes.fetchLotes).toHaveBeenCalledWith('tenant-demo-001')
  })

  it('calls setSearchQuery when typing in search input', async () => {
    const user = userEvent.setup()
    renderLotesPage()
    const searchInput = screen.getByPlaceholderText(/buscar por nombre/i)
    await user.type(searchInput, 'norte')
    expect(mockUseLotes.setSearchQuery).toHaveBeenCalled()
  })

  it('opens create modal when clicking Nuevo lote button', async () => {
    const user = userEvent.setup()
    renderLotesPage()
    // Click the first "Nuevo lote" button (desktop version)
    const button = screen.getAllByText(/nuevo lote/i)[0]
    await user.click(button)
    // Modal should appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('shows edit and delete buttons for each lote card', () => {
    mockUseLotes.filteredLotes = [mockLote]
    renderLotesPage()
    expect(screen.getByLabelText(`Editar ${mockLote.nombre}`)).toBeInTheDocument()
    expect(screen.getByLabelText(`Eliminar ${mockLote.nombre}`)).toBeInTheDocument()
  })

  it('shows confirm dialog when clicking delete button', async () => {
    const user = userEvent.setup()
    mockUseLotes.filteredLotes = [mockLote]
    renderLotesPage()

    const deleteBtn = screen.getByLabelText(`Eliminar ${mockLote.nombre}`)
    await user.click(deleteBtn)

    await waitFor(() => {
      expect(screen.getByText(/eliminar lote/i)).toBeInTheDocument()
    })
  })

  it('calls deleteLote when confirming deletion', async () => {
    const user = userEvent.setup()
    mockUseLotes.filteredLotes = [mockLote]
    renderLotesPage()

    // Open delete dialog
    await user.click(screen.getByLabelText(`Eliminar ${mockLote.nombre}`))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())

    // Click the Eliminar button in the confirm dialog
    const confirmBtn = screen.getByRole('button', { name: /^eliminar$/i })
    await user.click(confirmBtn)

    expect(mockUseLotes.deleteLote).toHaveBeenCalledWith(mockLote.id, 'tenant-demo-001')
  })

  it('calls setFilterActividad when changing actividad filter', async () => {
    const user = userEvent.setup()
    renderLotesPage()
    const select = screen.getByLabelText(/filtrar por actividad/i)
    await user.selectOptions(select, 'agricultura')
    expect(mockUseLotes.setFilterActividad).toHaveBeenCalledWith('agricultura')
  })

  it('shows empty state with different message when filter is active and no results', () => {
    mockUseLotes.filteredLotes = []
    mockUseLotes.searchQuery = 'inexistente'
    renderLotesPage()
    expect(screen.getByText(/no se encontraron lotes/i)).toBeInTheDocument()
  })

  it('shows badge with actividad label on lote card', () => {
    mockUseLotes.filteredLotes = [mockLote]
    renderLotesPage()
    // Multiple "Agricultura" elements exist (badge + filter option) — use getAllByText
    const elements = screen.getAllByText('Agricultura')
    expect(elements.length).toBeGreaterThanOrEqual(1)
    // The badge should be a span element
    const badge = elements.find(el => el.tagName === 'SPAN')
    expect(badge).toBeTruthy()
  })
})
