/**
 * PwaInstallPrompt component
 *
 * Intercepts the browser's 'beforeinstallprompt' event and shows
 * a bottom fixed banner inviting the user to install AgroField as a PWA.
 *
 * Behavior:
 *   - Hidden by default (no prompt event yet)
 *   - Shows when beforeinstallprompt fires AND user hasn't dismissed before
 *   - "Instalar" button: calls the deferred prompt's .prompt() method
 *   - "X" dismiss button: hides banner and saves dismissal in localStorage
 *   - Hidden when running in standalone mode (already installed)
 *
 * localStorage key: 'agrofield-pwa-dismissed'
 */

import { useState, useEffect } from 'react'
import type { BeforeInstallPromptEvent } from '../../types/pwa'

const DISMISSED_KEY = 'agrofield-pwa-dismissed'

/** Returns true if the app is running in standalone (installed PWA) mode */
function isStandaloneMode(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  )
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Don't show if already installed in standalone mode
    if (isStandaloneMode()) return

    // Don't show if user previously dismissed
    if (localStorage.getItem(DISMISSED_KEY) === 'true') return

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default mini-infobar from appearing on mobile
      e.preventDefault()
      // Store the event so we can trigger it later
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setIsVisible(false)
    }

    // Clear the deferred prompt — it can only be used once
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem(DISMISSED_KEY, 'true')
  }

  if (!isVisible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-lg p-4 flex items-center gap-3"
      role="dialog"
      aria-label="Instalar AgroField"
    >
      {/* App icon */}
      <div className="shrink-0 w-10 h-10 rounded-lg bg-field-green flex items-center justify-center">
        <span className="text-white font-bold text-sm">AF</span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900">Instalar AgroField</p>
        <p className="text-xs text-neutral-500 truncate">Acceso rapido desde tu pantalla de inicio</p>
      </div>

      {/* Install button */}
      <button
        onClick={() => void handleInstall()}
        className="shrink-0 px-4 py-2 text-sm font-semibold bg-field-green text-white rounded-md hover:bg-field-green-dark transition-colors"
        aria-label="Instalar aplicacion"
      >
        Instalar
      </button>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="shrink-0 p-1 text-neutral-400 hover:text-neutral-600 transition-colors rounded"
        aria-label="Cerrar"
      >
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
