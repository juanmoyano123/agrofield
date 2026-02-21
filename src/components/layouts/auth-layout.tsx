import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect width="40" height="40" rx="8" fill="#2D5F36" />
              <path
                d="M20 8C13.373 8 8 13.373 8 20s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S10 25.523 10 20 14.477 10 20 10z"
                fill="white"
                opacity="0.3"
              />
              <path
                d="M20 14l-8 8h5v6h6v-6h5l-8-8z"
                fill="white"
              />
            </svg>
            <span className="font-display font-bold text-2xl text-neutral-900">AgroField</span>
          </div>
          <p className="text-neutral-500 text-sm">Gestión integral para tu campo</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
