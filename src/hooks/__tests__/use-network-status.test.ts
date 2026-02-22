/**
 * Tests for src/hooks/use-network-status.ts
 *
 * Validates:
 * - Initial state reflects navigator.onLine
 * - 'online' event sets isOnline to true
 * - 'offline' event sets isOnline to false
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNetworkStatus } from '../use-network-status'
import { useNetworkStore } from '../../stores/network-store'

// Reset the Zustand store before each test
beforeEach(() => {
  useNetworkStore.setState({ isOnline: true })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useNetworkStatus', () => {
  it('returns true when navigator.onLine is true', () => {
    // jsdom defaults to navigator.onLine = true
    vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(true)
    useNetworkStore.setState({ isOnline: true })

    const { result } = renderHook(() => useNetworkStatus())
    expect(result.current).toBe(true)
  })

  it('returns false when store is offline', () => {
    useNetworkStore.setState({ isOnline: false })

    const { result } = renderHook(() => useNetworkStatus())
    expect(result.current).toBe(false)
  })

  it('sets isOnline to true when online event fires', () => {
    // Start offline
    useNetworkStore.setState({ isOnline: false })

    const { result } = renderHook(() => useNetworkStatus())
    expect(result.current).toBe(false)

    // Fire the online event
    act(() => {
      window.dispatchEvent(new Event('online'))
    })

    expect(result.current).toBe(true)
    expect(useNetworkStore.getState().isOnline).toBe(true)
  })

  it('sets isOnline to false when offline event fires', () => {
    // Start online
    useNetworkStore.setState({ isOnline: true })

    const { result } = renderHook(() => useNetworkStatus())
    expect(result.current).toBe(true)

    // Fire the offline event
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    expect(result.current).toBe(false)
    expect(useNetworkStore.getState().isOnline).toBe(false)
  })

  it('removes event listeners on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useNetworkStatus())

    // Should have added 2 listeners (online, offline)
    const addedOnline = addSpy.mock.calls.some(call => call[0] === 'online')
    const addedOffline = addSpy.mock.calls.some(call => call[0] === 'offline')
    expect(addedOnline).toBe(true)
    expect(addedOffline).toBe(true)

    unmount()

    // Should have removed the same 2 listeners
    const removedOnline = removeSpy.mock.calls.some(call => call[0] === 'online')
    const removedOffline = removeSpy.mock.calls.some(call => call[0] === 'offline')
    expect(removedOnline).toBe(true)
    expect(removedOffline).toBe(true)
  })
})
