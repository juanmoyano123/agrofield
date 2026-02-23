/**
 * Application router
 *
 * Route groups:
 *
 *   /login, /registro, /recuperar-contrasena
 *     → PublicRoute → AuthLayout
 *
 *   /dashboard, /lotes, /compras, …
 *     → ProtectedRoute → RoleRoute(propietario|administrador) → AppLayout
 *     Encargados who land here are redirected to /campo.
 *
 *   /campo, /campo/historial, /campo/registrar/:loteId
 *     → ProtectedRoute → RoleRoute(encargado) → CampoLayout
 *     Non-encargados who land here are redirected to /dashboard.
 *
 *   /
 *     → HomeRedirect — smart redirect based on role.
 *
 * F-013: Added RoleRoute, HomeRedirect, CampoLayout, and the /campo group.
 */

import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AuthLayout } from '../components/layouts/auth-layout'
import { AppLayout } from '../components/layouts/app-layout'
import { CampoLayout } from '../components/layouts/campo-layout'
import { ProtectedRoute } from './protected-route'
import { PublicRoute } from './public-route'
import { RoleRoute } from './role-route'
import { HomeRedirect } from './home-redirect'
import { LoginPage } from '../pages/login-page'
import { RegisterPage } from '../pages/register-page'
import { ForgotPasswordPage } from '../pages/forgot-password-page'
import { DashboardPage } from '../pages/dashboard-page'
import { ComprasPage } from '../pages/compras-page'
import { LotesPage } from '../pages/lotes-page'
import { EventosPage } from '../pages/eventos-page'
import { StockPage } from '../pages/stock-page'
import { ProveedoresPage } from '../pages/proveedores-page'
import { ContratistasPage } from '../pages/contratistas-page'
import { NotFoundPage } from '../pages/not-found-page'
import { Spinner } from '../components/ui/spinner'
import { CampoLotesPage } from '../pages/campo/campo-lotes-page'
import { CampoRegistrarPage } from '../pages/campo/campo-registrar-page'
import { CampoHistorialPage } from '../pages/campo/campo-historial-page'

// Lazy-load MapaPage so Leaflet (~200 KB) is only fetched when the user
// navigates to /mapa, keeping the initial bundle size small.
const MapaPage = lazy(() =>
  import('../pages/mapa-page').then(m => ({ default: m.MapaPage }))
)

// F-028: Lazy-load ReporteBancarioPage to keep initial bundle lean.
const ReporteBancarioPage = lazy(() =>
  import('../pages/reporte-bancario-page').then(m => ({ default: m.ReporteBancarioPage }))
)

// F-027: Lazy-load ComparativaPage (heavier chart components)
const ComparativaPage = lazy(() =>
  import('../pages/comparativa-page').then(m => ({ default: m.ComparativaPage }))
)

// eslint-disable-next-line react-refresh/only-export-components
function MapaFallback() {
  return (
    <div className="flex justify-center py-16">
      <Spinner size="lg" />
    </div>
  )
}

export const router = createBrowserRouter([
  // ── Public routes (auth pages) ─────────────────────────────────────────────
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/registro', element: <RegisterPage /> },
          { path: '/recuperar-contrasena', element: <ForgotPasswordPage /> },
        ],
      },
    ],
  },

  // ── Protected: propietario & administrador → AppLayout ────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allowedRoles={['propietario', 'administrador']} redirectTo="/campo" />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/lotes', element: <LotesPage /> },
              { path: '/lotes/:id/eventos', element: <EventosPage /> },
              { path: '/compras', element: <ComprasPage /> },
              { path: '/proveedores', element: <ProveedoresPage /> },
              { path: '/stock', element: <StockPage /> },
              { path: '/operaciones', element: <ContratistasPage /> },
              {
                path: '/mapa',
                element: (
                  <Suspense fallback={<MapaFallback />}>
                    <MapaPage />
                  </Suspense>
                ),
              },
              // F-028: Bank/credit report — only propietario/administrador
              {
                path: '/reporte-bancario',
                element: (
                  <Suspense fallback={<MapaFallback />}>
                    <ReporteBancarioPage />
                  </Suspense>
                ),
              },
              // F-027: Comparativa entre campañas
              {
                path: '/comparativa',
                element: (
                  <Suspense fallback={<MapaFallback />}>
                    <ComparativaPage />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },
    ],
  },

  // ── Protected: encargado → CampoLayout ───────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allowedRoles={['encargado']} redirectTo="/dashboard" />,
        children: [
          {
            element: <CampoLayout />,
            children: [
              { path: '/campo', element: <CampoLotesPage /> },
              { path: '/campo/historial', element: <CampoHistorialPage /> },
              { path: '/campo/registrar/:loteId', element: <CampoRegistrarPage /> },
            ],
          },
        ],
      },
    ],
  },

  // ── Home — role-aware redirect ─────────────────────────────────────────────
  { path: '/', element: <HomeRedirect /> },

  // ── 404 ───────────────────────────────────────────────────────────────────
  { path: '*', element: <NotFoundPage /> },
])
