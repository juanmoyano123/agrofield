import { useState, useEffect } from 'react'

const ONBOARDING_KEY = 'agrofield-onboarding'

interface OnboardingStoredState {
  completed: boolean
  currentStep: number
  dismissedAt: string | null
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingStoredState | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(ONBOARDING_KEY)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(raw ? JSON.parse(raw) : null)
  }, [])

  const save = (next: OnboardingStoredState) => {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(next))
    setState(next)
  }

  const shouldShow = state === null || !state.completed
  const currentStep = state?.currentStep ?? 0

  return {
    shouldShow,
    currentStep,
    markCompleted: () =>
      save({ completed: true, currentStep, dismissedAt: null }),
    markSkipped: () =>
      save({ completed: true, currentStep, dismissedAt: new Date().toISOString() }),
    updateStep: (step: number) =>
      save({ completed: false, currentStep: step, dismissedAt: null }),
    reset: () => {
      localStorage.removeItem(ONBOARDING_KEY)
      setState(null)
    },
  }
}
