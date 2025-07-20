'use client' // Error boundaries must be Client Components

import posthog from "posthog-js"
import NextError from "next/error"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Capture the error with PostHog
    posthog.captureException(error, {
      error_boundary: 'global',
      digest: error.digest,
      timestamp: new Date().toISOString(),
    })
    
    console.error('🚨 Global error captured:', error.message)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚨</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Algo salió mal!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Ocurrió un error inesperado en Kustodia. Nuestro equipo ha sido notificado automáticamente.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Intentar de nuevo
              </button>
              
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                🏠 Ir al Dashboard
              </button>
            </div>
            
            <div className="mt-6 text-xs text-gray-500">
              <p>Si el problema persiste, contacta a soporte:</p>
              <a 
                href="mailto:soporte@kustodia.mx" 
                className="text-blue-600 hover:underline"
              >
                soporte@kustodia.mx
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
