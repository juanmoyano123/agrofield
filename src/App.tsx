import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { useAuthStore } from './stores/auth-store'
import { useNetworkStatus } from './hooks/use-network-status'
import { useSync } from './hooks/use-sync'
import { OfflineIndicator } from './components/ui/offline-indicator'
import { PwaInstallPrompt } from './components/ui/pwa-install-prompt'

function App() {
  const checkAuth = useAuthStore(s => s.checkAuth)

  // Initialize network monitoring — keeps network store in sync with browser events
  useNetworkStatus()

  // Initialize sync process — runs queue when online, refreshes pending count
  useSync()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <>
      {/* Offline/sync status banner — fixed top, z-50 */}
      <OfflineIndicator />

      {/* App router */}
      <RouterProvider router={router} />

      {/* PWA install prompt — fixed bottom, shown when installable */}
      <PwaInstallPrompt />
    </>
  )
}

export default App
