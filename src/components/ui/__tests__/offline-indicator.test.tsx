/**
 * Tests for src/components/ui/offline-indicator.tsx
 *
 * Validates:
 * - Hidden when online + idle + 0 pending
 * - Shows warning bar when offline
 * - Shows pending count in offline bar
 * - Shows syncing progress
 * - Shows success message
 * - Shows error message
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OfflineIndicator } from '../offline-indicator'
import { useNetworkStore } from '../../../stores/network-store'

beforeEach(() => {
  // Reset to default online/idle state
  useNetworkStore.setState({
    isOnline: true,
    syncStatus: 'idle',
    pendingCount: 0,
    syncProgress: null,
    lastSyncError: null,
  })
})

describe('OfflineIndicator — visibility', () => {
  it('renders nothing when online, idle, and 0 pending', () => {
    const { container } = render(<OfflineIndicator />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when online, idle, but has 0 pending', () => {
    useNetworkStore.setState({ isOnline: true, syncStatus: 'idle', pendingCount: 0 })
    const { container } = render(<OfflineIndicator />)
    expect(container.firstChild).toBeNull()
  })
})

describe('OfflineIndicator — offline state', () => {
  it('shows offline warning bar when offline', () => {
    useNetworkStore.setState({ isOnline: false, syncStatus: 'idle', pendingCount: 0 })
    render(<OfflineIndicator />)

    expect(screen.getByText(/Modo offline/i)).toBeInTheDocument()
  })

  it('shows pending count when offline and has pending items', () => {
    useNetworkStore.setState({ isOnline: false, syncStatus: 'idle', pendingCount: 5 })
    render(<OfflineIndicator />)

    expect(screen.getByText(/5 cambios pendientes/i)).toBeInTheDocument()
  })

  it('shows singular "cambio pendiente" when count is 1', () => {
    useNetworkStore.setState({ isOnline: false, syncStatus: 'idle', pendingCount: 1 })
    render(<OfflineIndicator />)

    expect(screen.getByText(/1 cambio pendiente/i)).toBeInTheDocument()
  })

  it('has animate-pulse class when offline', () => {
    useNetworkStore.setState({ isOnline: false, syncStatus: 'idle', pendingCount: 0 })
    render(<OfflineIndicator />)

    const bar = screen.getByRole('status')
    expect(bar.className).toContain('animate-pulse')
  })
})

describe('OfflineIndicator — syncing state', () => {
  it('shows syncing message when syncing', () => {
    useNetworkStore.setState({
      isOnline: true,
      syncStatus: 'syncing',
      pendingCount: 3,
      syncProgress: null,
    })
    render(<OfflineIndicator />)

    expect(screen.getByText(/Sincronizando/i)).toBeInTheDocument()
  })

  it('shows progress numbers when syncProgress is set', () => {
    useNetworkStore.setState({
      isOnline: true,
      syncStatus: 'syncing',
      pendingCount: 5,
      syncProgress: { current: 2, total: 5 },
    })
    render(<OfflineIndicator />)

    expect(screen.getByText(/2 de 5/i)).toBeInTheDocument()
  })
})

describe('OfflineIndicator — success state', () => {
  it('shows success message', () => {
    useNetworkStore.setState({
      isOnline: true,
      syncStatus: 'success',
      pendingCount: 0,
      syncProgress: null,
    })
    render(<OfflineIndicator />)

    expect(screen.getByText(/Todos los datos sincronizados/i)).toBeInTheDocument()
  })

  it('has role=status when showing success', () => {
    useNetworkStore.setState({ isOnline: true, syncStatus: 'success', pendingCount: 0 })
    render(<OfflineIndicator />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})

describe('OfflineIndicator — error state', () => {
  it('shows error message', () => {
    useNetworkStore.setState({
      isOnline: true,
      syncStatus: 'error',
      pendingCount: 2,
      lastSyncError: 'Network timeout',
    })
    render(<OfflineIndicator />)

    expect(screen.getByText(/Error de sincronizaci[oó]n/i)).toBeInTheDocument()
  })

  it('has role=alert when showing error', () => {
    useNetworkStore.setState({ isOnline: true, syncStatus: 'error', pendingCount: 0 })
    render(<OfflineIndicator />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})

describe('OfflineIndicator — visible when pending > 0 even if online and idle', () => {
  it('shows offline bar when online + idle + pendingCount > 0', () => {
    useNetworkStore.setState({ isOnline: true, syncStatus: 'idle', pendingCount: 3 })
    render(<OfflineIndicator />)

    // Should render something (not hidden) — the offline mode bar
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
