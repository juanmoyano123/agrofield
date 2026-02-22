/**
 * PWA Type Declarations
 *
 * TypeScript types for the Web App Install Prompt API.
 * The beforeinstallprompt event is not yet in the TypeScript lib
 * so we declare it manually here.
 */

/**
 * The event fired by the browser when a PWA install is available.
 * Extends the base Event to add the prompt() method and userChoice promise.
 *
 * Spec: https://wicg.github.io/manifest-incubations/#beforeinstallpromptevent-interface
 */
export interface BeforeInstallPromptEvent extends Event {
  /** Shows the install prompt to the user */
  prompt(): Promise<void>
  /** Resolves with the user's choice after prompt() is called */
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// ---------------------------------------------------------------------------
// Augment the global WindowEventMap so TypeScript knows about this event
// ---------------------------------------------------------------------------

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}
