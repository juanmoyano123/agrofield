import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl font-bold text-border-warm-strong font-display mb-4">404</div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Página no encontrada</h1>
      <p className="text-text-muted mb-6">La página que buscás no existe o fue movida.</p>
      <Link
        to="/dashboard"
        className="text-field-green font-semibold hover:underline"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
