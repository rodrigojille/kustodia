"use client" // Error boundaries must be Client Components

import posthog from "posthog-js"
import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Capture the error with PostHog including stack trace
    posthog.captureException(error, {
      error_boundary: 'app_router',
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      page_context: window.location.pathname,
    })
    
    console.error('🚨 App router error captured:', error.message, error.stack)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Error en la Aplicación
          </h1>
          
          <p className="text-gray-600">
            Ocurrió un error en esta página. El problema ha sido reportado automáticamente a nuestro equipo.
          </p>
        </div>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-sm font-semibold text-red-900 mb-2">
              Detalles del Error (Development):
            </h3>
            <p className="text-sm text-red-800 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-1">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            🔄 Reintentar
          </button>
          
          <Link
            href="/dashboard"
            className="block w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center"
          >
            🏠 Ir al Dashboard
          </Link>
          
          <Link
            href="/"
            className="block w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            🏡 Página Principal
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500 mb-2">
            ¿Necesitas ayuda inmediata?
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <a 
              href="mailto:soporte@kustodia.mx" 
              className="text-blue-600 hover:underline"
            >
              📧 Email
            </a>
            <a 
              href="tel:+529999000000" 
              className="text-blue-600 hover:underline"
            >
              📞 Teléfono
            </a>
            <Link 
              href="/ayuda" 
              className="text-blue-600 hover:underline"
            >
              ❓ Centro de Ayuda
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
