import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

type ModalSize = 'sm' | 'md' | 'lg'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: ModalSize
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Focus trap: focus the dialog container on open
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus()
    }
  }, [isOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    // Only close if clicking on the backdrop itself, not on the modal content
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleBackdropClick}
      className="
        fixed inset-0 z-50
        flex items-end sm:items-center justify-center
        bg-[#1A1714]/40
        animate-fade-in
        p-0 sm:p-4
      "
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`
          relative w-full ${sizeClasses[size]}
          bg-surface rounded-t-xl sm:rounded-sm
          shadow-warm-lg
          flex flex-col
          max-h-[90vh] sm:max-h-[85vh]
          outline-none
          animate-slide-up sm:animate-fade-in
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-warm shrink-0">
          <h2 id="modal-title" className="text-lg font-bold text-text-primary font-display">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="
              w-8 h-8 flex items-center justify-center
              rounded-sm text-text-muted
              hover:bg-parchment hover:text-text-dim
              transition-colors duration-300
              cursor-pointer
            "
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
