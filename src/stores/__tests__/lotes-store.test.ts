import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLotesStore, getFilteredAndSortedLotes } from '../lotes-store'
import type { Lote } from '../../types'

vi.mock('../../lib/api-client', () => ({
  lotesApi: {
    getLotes: vi.fn(),
    getLoteById: vi.fn(),
    createLote: vi.fn(),
    updateLote: vi.fn(),
    deleteLote: vi.fn(),
  },
}))

import { lotesApi } from '../../lib/api-client'

const TENANT_ID = 'tenant-demo-001'

const mockLote: Lote = {
  id: 'lote-001',
  tenantId: TENANT_ID,
  nombre: 'Lote Norte',
  hectareas: 120,
  actividad: 'agricultura',
  costoTotal: 0,
  createdAt: '2026-01-10T08:00:00.000Z',
  updatedAt: '2026-01-10T08:00:00.000Z',
}

const mockLote2: Lote = {
  id: 'lote-002',
  tenantId: TENANT_ID,
  nombre: 'Lote Sur',
  hectareas: 85,
  actividad: 'ganaderia',
  costoTotal: 0,
  createdAt: '2026-01-11T09:00:00.000Z',
  updatedAt: '2026-01-11T09:00:00.000Z',
}

function resetStore() {
  useLotesStore.setState({
    lotes: [],
    isLoading: false,
    isSaving: false,
    error: null,
    successMessage: null,
    searchQuery: '',
    filterActividad: '',
    sortField: 'nombre',
    sortOrder: 'asc',
  })
}

beforeEach(() => {
  resetStore()
  vi.clearAllMocks()
})

describe('fetchLotes', () => {
  it('sets lotes on success', async () => {
    vi.mocked(lotesApi.getLotes).mockResolvedValueOnce({
      success: true,
      data: [mockLote, mockLote2],
    })

    await useLotesStore.getState().fetchLotes(TENANT_ID)

    const state = useLotesStore.getState()
    expect(state.lotes).toHaveLength(2)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('sets error on failure', async () => {
    vi.mocked(lotesApi.getLotes).mockResolvedValueOnce({
      success: false,
      error: { code: 'ERROR', message: 'Error al cargar los lotes' },
    })

    await useLotesStore.getState().fetchLotes(TENANT_ID)

    const state = useLotesStore.getState()
    expect(state.lotes).toHaveLength(0)
    expect(state.error).toBe('Error al cargar los lotes')
    expect(state.isLoading).toBe(false)
  })
})

describe('createLote', () => {
  it('adds lote to store and sets success message', async () => {
    vi.mocked(lotesApi.createLote).mockResolvedValueOnce({
      success: true,
      data: mockLote,
    })

    await useLotesStore.getState().createLote(
      { nombre: 'Lote Norte', hectareas: 120, actividad: 'agricultura' },
      TENANT_ID,
    )

    const state = useLotesStore.getState()
    expect(state.lotes).toHaveLength(1)
    expect(state.lotes[0].nombre).toBe('Lote Norte')
    expect(state.successMessage).toBe('Lote creado exitosamente')
    expect(state.isSaving).toBe(false)
  })

  it('sets error on failure', async () => {
    vi.mocked(lotesApi.createLote).mockResolvedValueOnce({
      success: false,
      error: { code: 'ERROR', message: 'Error al crear el lote' },
    })

    await useLotesStore.getState().createLote(
      { nombre: 'Lote Norte', hectareas: 120, actividad: 'agricultura' },
      TENANT_ID,
    )

    const state = useLotesStore.getState()
    expect(state.lotes).toHaveLength(0)
    expect(state.error).toBe('Error al crear el lote')
  })
})

describe('updateLote', () => {
  it('updates lote in store', async () => {
    useLotesStore.setState({ lotes: [mockLote] })
    const updatedLote = { ...mockLote, nombre: 'Lote Norte Actualizado' }

    vi.mocked(lotesApi.updateLote).mockResolvedValueOnce({
      success: true,
      data: updatedLote,
    })

    await useLotesStore.getState().updateLote('lote-001', { nombre: 'Lote Norte Actualizado' }, TENANT_ID)

    const state = useLotesStore.getState()
    expect(state.lotes[0].nombre).toBe('Lote Norte Actualizado')
    expect(state.successMessage).toBe('Lote actualizado exitosamente')
  })
})

describe('deleteLote', () => {
  it('removes lote from store', async () => {
    useLotesStore.setState({ lotes: [mockLote, mockLote2] })

    vi.mocked(lotesApi.deleteLote).mockResolvedValueOnce({ success: true })

    await useLotesStore.getState().deleteLote('lote-001', TENANT_ID)

    const state = useLotesStore.getState()
    expect(state.lotes).toHaveLength(1)
    expect(state.lotes[0].id).toBe('lote-002')
    expect(state.successMessage).toBe('Lote eliminado')
  })

  it('sets error on failure', async () => {
    useLotesStore.setState({ lotes: [mockLote] })

    vi.mocked(lotesApi.deleteLote).mockResolvedValueOnce({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Lote no encontrado' },
    })

    await useLotesStore.getState().deleteLote('lote-001', TENANT_ID)

    const state = useLotesStore.getState()
    expect(state.lotes).toHaveLength(1)
    expect(state.error).toBe('Lote no encontrado')
  })
})

describe('filter and sort selectors', () => {
  beforeEach(() => {
    useLotesStore.setState({ lotes: [mockLote, mockLote2] })
  })

  it('returns all lotes when no filters applied', () => {
    const result = getFilteredAndSortedLotes(useLotesStore.getState())
    expect(result).toHaveLength(2)
  })

  it('filters by searchQuery on nombre', () => {
    useLotesStore.setState({ searchQuery: 'norte' })
    const result = getFilteredAndSortedLotes(useLotesStore.getState())
    expect(result).toHaveLength(1)
    expect(result[0].nombre).toBe('Lote Norte')
  })

  it('filters by actividad', () => {
    useLotesStore.setState({ filterActividad: 'ganaderia' })
    const result = getFilteredAndSortedLotes(useLotesStore.getState())
    expect(result).toHaveLength(1)
    expect(result[0].actividad).toBe('ganaderia')
  })

  it('sorts by nombre ascending', () => {
    useLotesStore.setState({ sortField: 'nombre', sortOrder: 'asc' })
    const result = getFilteredAndSortedLotes(useLotesStore.getState())
    expect(result[0].nombre).toBe('Lote Norte')
    expect(result[1].nombre).toBe('Lote Sur')
  })

  it('sorts by nombre descending', () => {
    useLotesStore.setState({ sortField: 'nombre', sortOrder: 'desc' })
    const result = getFilteredAndSortedLotes(useLotesStore.getState())
    expect(result[0].nombre).toBe('Lote Sur')
    expect(result[1].nombre).toBe('Lote Norte')
  })

  it('sorts by hectareas ascending', () => {
    useLotesStore.setState({ sortField: 'hectareas', sortOrder: 'asc' })
    const result = getFilteredAndSortedLotes(useLotesStore.getState())
    expect(result[0].hectareas).toBe(85)
    expect(result[1].hectareas).toBe(120)
  })

  it('excludes soft-deleted lotes', () => {
    useLotesStore.setState({
      lotes: [
        mockLote,
        { ...mockLote2, deletedAt: '2026-02-01T00:00:00.000Z' },
      ],
    })
    const result = getFilteredAndSortedLotes(useLotesStore.getState())
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('lote-001')
  })
})

describe('UI state actions', () => {
  it('setSearchQuery updates state', () => {
    useLotesStore.getState().setSearchQuery('test')
    expect(useLotesStore.getState().searchQuery).toBe('test')
  })

  it('setFilterActividad updates state', () => {
    useLotesStore.getState().setFilterActividad('ganaderia')
    expect(useLotesStore.getState().filterActividad).toBe('ganaderia')
  })

  it('clearError resets error to null', () => {
    useLotesStore.setState({ error: 'some error' })
    useLotesStore.getState().clearError()
    expect(useLotesStore.getState().error).toBeNull()
  })

  it('clearSuccessMessage resets successMessage to null', () => {
    useLotesStore.setState({ successMessage: 'Lote creado' })
    useLotesStore.getState().clearSuccessMessage()
    expect(useLotesStore.getState().successMessage).toBeNull()
  })
})
