/**
 * useNetworkStatus hook
 *
 * Monitors browser network connectivity by listening to the
 * window 'online' and 'offline' events. Updates the network store
 * on every connectivity change.
 *
 * Usage:
 *   const isOnline = useNetworkStatus()
 */

import { useEffect } from 'react'
import { useNetworkStore } from '../stores/network-store'

/**
 * Returns the current online status and keeps it in sync with
 * browser connectivity events.
 */
export function useNetworkStatus(): boolean {
  const isOnline = useNetworkStore(s => s.isOnline)
  const setOnline = useNetworkStore(s => s.setOnline)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline])

  return isOnline
}
