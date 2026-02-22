import { createPortal } from 'react-dom'
import { Button } from './button'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1714]/40 p-4 animate-fade-in"
    >
      <div className="bg-surface rounded-sm shadow-warm-lg w-full max-w-sm">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-warm">
          <h2 id="confirm-dialog-title" className="text-lg font-bold text-text-primary font-display">
            {title}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-sm text-text-dim">{message}</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-warm flex gap-3 justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
