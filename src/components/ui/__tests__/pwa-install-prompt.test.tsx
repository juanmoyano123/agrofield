/**
 * Tests for src/components/ui/pwa-install-prompt.tsx
 *
 * Validates:
 * - Hidden when no beforeinstallprompt event
 * - Shows banner when event fires
 * - Install button calls prompt()
 * - Dismiss hides and saves to localStorage
 * - Hidden in standalone mode
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PwaInstallPrompt } from '../pwa-install-prompt'
import type { BeforeInstallPromptEvent } from '../../../types/pwa'

const DISMISSED_KEY = 'agrofield-pwa-dismissed'

// Helper to create a mock BeforeInstallPromptEvent
function createInstallPromptEvent(outcome: 'accepted' | 'dismissed' = 'accepted'): BeforeInstallPromptEvent {
  const event = new Event('beforeinstallprompt') as BeforeInstallPromptEvent
  event.preventDefault = vi.fn()
  event.prompt = vi.fn().mockResolvedValue(undefined)
  ;(event as { userChoice: Promise<{ outcome: string }> }).userChoice = Promise.resolve({ outcome })
  return event
}

beforeEach(() => {
  localStorage.removeItem(DISMISSED_KEY)
  // Reset matchMedia to non-standalone
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false, // Not standalone by default
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

afterEach(() => {
  localStorage.removeItem(DISMISSED_KEY)
  vi.restoreAllMocks()
})

describe('PwaInstallPrompt — initial state', () => {
  it('renders nothing when no beforeinstallprompt event has fired', () => {
    const { container } = render(<PwaInstallPrompt />)
    expect(container.firstChild).toBeNull()
  })
})

describe('PwaInstallPrompt — showing the banner', () => {
  it('shows banner when beforeinstallprompt event fires', async () => {
    render(<PwaInstallPrompt />)

    // Fire the install prompt event
    const event = createInstallPromptEvent()
    fireEvent(window, event)

    await waitFor(() => {
      expect(screen.getByText('Instalar AgroField')).toBeInTheDocument()
    })
  })

  it('shows the install and dismiss buttons', async () => {
    render(<PwaInstallPrompt />)

    fireEvent(window, createInstallPromptEvent())

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /instalar aplicacion/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cerrar/i })).toBeInTheDocument()
    })
  })

  it('has role=dialog on the banner', async () => {
    render(<PwaInstallPrompt />)

    fireEvent(window, createInstallPromptEvent())

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })
})

describe('PwaInstallPrompt — install button', () => {
  it('calls event.prompt() when install button is clicked', async () => {
    render(<PwaInstallPrompt />)

    const event = createInstallPromptEvent('accepted')
    fireEvent(window, event)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /instalar aplicacion/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /instalar aplicacion/i }))

    await waitFor(() => {
      expect(event.prompt).toHaveBeenCalledTimes(1)
    })
  })

  it('hides banner when user accepts install', async () => {
    render(<PwaInstallPrompt />)

    const event = createInstallPromptEvent('accepted')
    fireEvent(window, event)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /instalar aplicacion/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
})

describe('PwaInstallPrompt — dismiss button', () => {
  it('hides banner when dismiss X is clicked', async () => {
    render(<PwaInstallPrompt />)

    fireEvent(window, createInstallPromptEvent())

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /cerrar/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('saves dismissed state to localStorage when X is clicked', async () => {
    render(<PwaInstallPrompt />)

    fireEvent(window, createInstallPromptEvent())

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /cerrar/i }))

    expect(localStorage.getItem(DISMISSED_KEY)).toBe('true')
  })

  it('does not show banner if previously dismissed', () => {
    // Pre-set dismissed flag
    localStorage.setItem(DISMISSED_KEY, 'true')

    render(<PwaInstallPrompt />)

    const event = createInstallPromptEvent()
    fireEvent(window, event)

    // Banner should NOT appear because it was dismissed
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('PwaInstallPrompt — standalone mode', () => {
  it('does not show when app is in standalone mode', () => {
    // Mock standalone mode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(display-mode: standalone)', // Simulate standalone
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    render(<PwaInstallPrompt />)

    const event = createInstallPromptEvent()
    fireEvent(window, event)

    // Should not show in standalone mode
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
