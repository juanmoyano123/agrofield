import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { OnboardingProgress } from './onboarding-progress'
import { OnboardingStep } from './onboarding-step'

interface StepConfig {
  icon: string
  title: string
  description: string
  actionLabel?: string
  actionPath?: string
}

const STEPS: StepConfig[] = [
  {
    icon: '🌾',
    title: 'Bienvenido a AgroField',
    description: 'Llevá el control de tu campo en minutos. Te mostramos cómo en 3 pasos simples.',
  },
  {
    icon: '📍',
    title: 'Paso 1: Creá tu primer lote',
    description: 'Un lote es una parcela de tu campo. Registrá su nombre, hectáreas y cultivo para imputar costos.',
    actionLabel: 'Ir a Lotes',
    actionPath: '/lotes',
  },
  {
    icon: '🛒',
    title: 'Paso 2: Registrá tus compras',
    description: 'Cada vez que comprés insumos, registralo acá. El sistema actualiza el stock automáticamente.',
    actionLabel: 'Ir a Compras',
    actionPath: '/compras',
  },
  {
    icon: '🗓️',
    title: 'Paso 3: Registrá eventos de campo',
    description: 'Siembra, fumigación, cosecha... cada actividad en un lote queda en el historial.',
    actionLabel: '¡Listo, empezar!',
  },
]

interface OnboardingOverlayProps {
  onComplete: () => void
  onSkip: () => void
  initialStep?: number
}

export function OnboardingOverlay({ onComplete, onSkip, initialStep = 0 }: OnboardingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const navigate = useNavigate()

  const step = STEPS[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === STEPS.length - 1

  const goNext = () => {
    if (isLast) {
      onComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const goPrev = () => {
    if (!isFirst) {
      setCurrentStep(prev => prev - 1)
    }
  }

  // Handle action button: navigate to path if provided, else complete
  const handleAction = () => {
    if (step.actionPath) {
      navigate(step.actionPath)
      // Move to next step so next time overlay shows it resumes after this step
      if (!isLast) {
        setCurrentStep(prev => prev + 1)
      }
      onComplete()
    } else {
      // Last step without path: mark as completed
      onComplete()
    }
  }

  const content = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Tutorial de bienvenida"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1A1714]/60"
        onClick={onSkip}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-surface border border-border-warm rounded-sm shadow-warm flex flex-col">

        {/* Progress dots */}
        <div className="pt-6 px-6">
          <OnboardingProgress totalSteps={STEPS.length} currentStep={currentStep} />
        </div>

        {/* Step content */}
        <div className="px-6">
          <OnboardingStep
            icon={step.icon}
            title={step.title}
            description={step.description}
            actionLabel={step.actionLabel}
            onAction={step.actionLabel ? handleAction : undefined}
          />
        </div>

        {/* Navigation footer */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          {/* Prev / Next row */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={isFirst}
              className="
                px-4 py-2.5 rounded-sm text-sm font-medium
                border border-border-warm text-text-dim
                hover:text-text-primary hover:border-text-dim
                transition-all duration-300
                disabled:opacity-0 disabled:pointer-events-none
                min-h-[44px]
              "
            >
              Anterior
            </button>

            <button
              type="button"
              onClick={goNext}
              className="
                flex-1 px-4 py-2.5 rounded-sm text-sm font-medium
                bg-field-green text-white
                hover:bg-field-green/90
                transition-all duration-300
                min-h-[44px]
              "
            >
              {isLast ? 'Finalizar' : 'Siguiente'}
            </button>
          </div>

          {/* Skip link */}
          <button
            type="button"
            onClick={onSkip}
            className="
              text-xs text-text-muted text-center
              hover:text-text-dim
              transition-colors duration-300
              py-1
            "
          >
            Saltear tutorial
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
