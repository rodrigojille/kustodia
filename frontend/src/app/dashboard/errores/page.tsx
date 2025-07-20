'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePostHog } from 'posthog-js/react'
import { useErrorTracking, ErrorTrackingUtils } from '../../../hooks/useErrorTracking'

export default function ErroresPage() {
  const posthog = usePostHog()
  const { captureError, captureMessage, setUserContext } = useErrorTracking()
  const [errorCount, setErrorCount] = useState(0)
  const [formData, setFormData] = useState({ amount: '', email: '' })

  // Demo error functions
  const triggerJavaScriptError = () => {
    try {
      // @ts-ignore - Intentional error for demo
      throw new Error('Error de JavaScript simulado desde el Dashboard de Errores')
    } catch (error) {
      captureError(error as Error, {
        user_action: 'demo_javascript_error',
        feature: 'error_tracking_demo',
        severity: 'medium'
      })
      setErrorCount(prev => prev + 1)
    }
  }

  const triggerAsyncError = async () => {
    try {
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Error asíncrono simulado - Promise rechazado'))
        }, 1000)
      })
    } catch (error) {
      captureError(error as Error, {
        user_action: 'demo_async_error',
        feature: 'error_tracking_demo',
        severity: 'high'
      })
      setErrorCount(prev => prev + 1)
    }
  }

  const triggerApiError = () => {
    const mockApiError = new Error('Error de API simulado: 500 Internal Server Error')
    ErrorTrackingUtils.captureApiError(posthog, mockApiError, '/api/payments', 'POST')
    setErrorCount(prev => prev + 1)
  }

  const triggerPaymentError = () => {
    const paymentError = new Error('Error de pago simulado: Transacción rechazada')
    ErrorTrackingUtils.capturePaymentError(posthog, paymentError, 'payment_processing', 1500)
    setErrorCount(prev => prev + 1)
  }

  const triggerAuthError = () => {
    const authError = new Error('Error de autenticación simulado: Token expirado')
    ErrorTrackingUtils.captureAuthError(posthog, authError, 'token_validation')
    setErrorCount(prev => prev + 1)
  }

  const triggerCryptoError = () => {
    const cryptoError = new Error('Error blockchain simulado: Gas insuficiente')
    ErrorTrackingUtils.captureCryptoError(posthog, cryptoError, 'send_transaction', 'ethereum')
    setErrorCount(prev => prev + 1)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simulate form validation error
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      const formError = new Error('Cantidad inválida en formulario de demo')
      ErrorTrackingUtils.captureFormError(posthog, formError, 'demo_payment_form', 'amount')
      setErrorCount(prev => prev + 1)
      return
    }

    captureMessage('Formulario demo enviado exitosamente', 'info')
    setFormData({ amount: '', email: '' })
  }

  const updateUserContext = () => {
    setUserContext({
      demo_user: true,
      error_testing: true,
      test_timestamp: new Date().toISOString(),
    })
  }

  // Intentionally break component (for error boundary testing)
  const triggerComponentError = () => {
    // This will cause a render error
    throw new Error('Error de componente React simulado - Error Boundary activado')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🚨 Seguimiento de Errores
              </h1>
              <p className="text-gray-600">
                PostHog Error Tracking - Detección y análisis de errores en tiempo real
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Volver al Dashboard
            </Link>
          </div>
        </div>

        {/* Error Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Errores Generados</p>
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estado PostHog</p>
                <p className="text-sm font-semibold text-green-600">
                  {posthog ? '✅ Conectado' : '❌ Desconectado'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Modo Captura</p>
                <p className="text-sm font-semibold text-blue-600">Automático + Manual</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Trigger Controls */}
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            🎛️ Generadores de Errores Demo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <button
              onClick={triggerJavaScriptError}
              className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <span>⚠️</span>
              Error JavaScript
            </button>
            
            <button
              onClick={triggerAsyncError}
              className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <span>🔄</span>
              Error Asíncrono
            </button>
            
            <button
              onClick={triggerApiError}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <span>🌐</span>
              Error API
            </button>
            
            <button
              onClick={triggerPaymentError}
              className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
            >
              <span>💳</span>
              Error Pago
            </button>
            
            <button
              onClick={triggerAuthError}
              className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <span>🔐</span>
              Error Auth
            </button>
            
            <button
              onClick={triggerCryptoError}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <span>₿</span>
              Error Crypto
            </button>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={updateUserContext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>👤</span>
              Actualizar Contexto Usuario
            </button>
            
            <button
              onClick={triggerComponentError}
              className="px-6 py-3 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors flex items-center gap-2"
            >
              <span>💥</span>
              Error Boundary (¡Cuidado!)
            </button>
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
            <p className="font-medium text-blue-900 mb-2">💡 Información sobre Error Tracking:</p>
            <ul className="space-y-1 text-blue-800">
              <li>• Los errores se capturan automáticamente con stack traces completos</li>
              <li>• Se incluye contexto del usuario, URL, y timestamp</li>
              <li>• Los errores críticos (pagos, auth) tienen prioridad alta</li>
              <li>• Error Boundary captura errores de renderizado en React</li>
            </ul>
          </div>
        </div>

        {/* Demo Form with Error Handling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📝 Formulario con Validación de Errores
            </h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad (MXN)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa 0 o valor negativo para generar error de validación
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>
              
              <button
                type="submit"
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                📤 Enviar (Prueba Validación)
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Tipos de Errores Capturados
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-red-600">🔴</span>
                <div>
                  <p className="font-medium">Errores Críticos</p>
                  <p className="text-gray-600">Pagos fallidos, fallos de seguridad</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-orange-600">🟠</span>
                <div>
                  <p className="font-medium">Errores Altos</p>
                  <p className="text-gray-600">Autenticación, blockchain, APIs</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-yellow-600">🟡</span>
                <div>
                  <p className="font-medium">Errores Medios</p>
                  <p className="text-gray-600">Validaciones, formularios</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-blue-600">🔵</span>
                <div>
                  <p className="font-medium">Errores Bajos</p>
                  <p className="text-gray-600">UI, navegación, cosmética</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy and Monitoring Info */}
        <div className="mt-8 bg-green-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            🔒 Privacidad y Monitoreo de Errores
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
            <div>
              <h4 className="font-medium mb-2">Datos Capturados:</h4>
              <ul className="space-y-1">
                <li>• Mensaje de error y stack trace</li>
                <li>• Contexto del usuario y sesión</li>
                <li>• URL y acción que causó el error</li>
                <li>• Timestamp y información del navegador</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Protecciones:</h4>
              <ul className="space-y-1">
                <li>• No se capturan datos sensibles (passwords, tokens)</li>
                <li>• Respeto a configuraciones de privacidad</li>
                <li>• Datos encriptados en tránsito</li>
                <li>• Retención limitada según políticas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
