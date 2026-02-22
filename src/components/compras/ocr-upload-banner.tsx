import { useState, useRef } from 'react'
import { mockOcrProcess } from '../../lib/mock/ocr-mock'
import type { OcrMockResult } from '../../lib/mock/ocr-mock'

type OcrStatus = 'idle' | 'processing' | 'done' | 'error'

interface OcrUploadBannerProps {
  onOcrResult: (result: OcrMockResult) => void
}

/**
 * Banner that lets the user upload a photo/PDF of a remito or factura.
 * Uses a simulated OCR process (mockOcrProcess) and calls back with extracted data.
 *
 * States:
 *  idle       — shows a dashed "Escanear remito o factura" button
 *  processing — spinner + filename while mock OCR runs (1.5–3s)
 *  done       — success alert that auto-hides after 3s
 *  error      — error alert so the user knows something failed
 */
export function OcrUploadBanner({ onOcrResult }: OcrUploadBannerProps) {
  const [status, setStatus] = useState<OcrStatus>('idle')
  const [fileName, setFileName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setStatus('processing')

    try {
      const result = await mockOcrProcess(file)
      setStatus('done')
      onOcrResult(result)
      // Auto-hide success banner after 3 seconds
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
    }

    // Reset input so the same file can be selected again if needed
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="p-3 bg-parchment rounded-sm border border-dashed border-border-warm">
      {/* Hidden file input — accepts images and PDFs */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {status === 'idle' && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="
            w-full flex items-center justify-center gap-2
            py-2 px-4 rounded-sm
            text-sm font-medium text-text-muted
            hover:text-text-primary hover:bg-white/60
            transition-colors duration-150
          "
        >
          <span>Escanear remito o factura</span>
        </button>
      )}

      {status === 'processing' && (
        <div className="flex items-center gap-2 py-1">
          {/* Simple CSS spinner */}
          <span
            className="inline-block w-4 h-4 border-2 border-border-warm border-t-text-primary rounded-full animate-spin flex-shrink-0"
            aria-hidden="true"
          />
          <span className="text-sm text-text-muted truncate">
            Procesando {fileName}...
          </span>
        </div>
      )}

      {status === 'done' && (
        <div className="flex items-center gap-2 py-1 text-sm font-medium text-green-700">
          <span aria-hidden="true">&#10003;</span>
          <span>Datos extraidos — revisa los campos</span>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-red-600">No se pudo procesar el documento</span>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="text-xs text-text-muted underline hover:text-text-primary ml-3 flex-shrink-0"
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  )
}
