import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from '../components/layouts/auth-layout'
import { AppLayout } from '../components/layouts/app-layout'
import { ProtectedRoute } from './protected-route'
import { PublicRoute } from './public-route'
import { LoginPage } from '../pages/login-page'
import { RegisterPage } from '../pages/register-page'
import { ForgotPasswordPage } from '../pages/forgot-password-page'
import { DashboardPage } from '../pages/dashboard-page'
import { ComprasPage } from '../pages/compras-page'
import { LotesPage } from '../pages/lotes-page'
import { EventosPage } from '../pages/eventos-page'
import { StockPage } from '../pages/stock-page'
import { ProveedoresPage } from '../pages/proveedores-page'
import { NotFoundPage } from '../pages/not-found-page'

export const router = createBrowserRouter([
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
  {
    element: <ProtectedRoute />,
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
        ],
      },
    ],
  },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '*', element: <NotFoundPage /> },
])
