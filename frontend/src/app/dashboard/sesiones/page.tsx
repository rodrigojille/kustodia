'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePostHog } from 'posthog-js/react'
import { useSessionRecording, SessionRecordingUtils } from '../../../hooks/useSessionRecording'

export default function SesionesPage() {
  const posthog = usePostHog()
  const { isRecording, startRecording, stopRecording, getSessionReplayUrl, getSessionId } = useSessionRecording()
  const [demoCounter, setDemoCounter] = useState(0)
  const [formData, setFormData] = useState({ name: '', email: '', feedback: '' })

  const handleStartDemo = () => {
    SessionRecordingUtils.captureUserFlowEvent(posthog, 'session_recording_demo_started', {
      demo_type: 'manual_interaction'
    })
    setDemoCounter(prev => prev + 1)
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Capture form interaction for session context
    SessionRecordingUtils.captureUserFlowEvent(posthog, 'demo_form_interaction', {
      field_name: field,
      form_step: 'user_input'
    })
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    SessionRecordingUtils.captureUserFlowEvent(posthog, 'demo_form_submitted', {
      form_data_length: JSON.stringify(formData).length,
      has_feedback: formData.feedback.length > 0
    })
    
    alert('¡Formulario enviado! Esto se registrará en la sesión.')
    setFormData({ name: '', email: '', feedback: '' })
  }

  const handleLogSessionInfo = () => {
    SessionRecordingUtils.logSessionInfo(posthog)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📹 Grabación de Sesiones
              </h1>
              <p className="text-gray-600">
                PostHog Session Replay - Análisis de comportamiento del usuario
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

        {/* Session Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estado de Grabación</p>
                <p className={`text-2xl font-bold ${isRecording ? 'text-red-600' : 'text-gray-400'}`}>
                  {isRecording ? '🔴 Grabando' : '⚫ Detenido'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isRecording ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <span className="text-2xl">{isRecording ? '📹' : '📷'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ID de Sesión</p>
                <p className="text-sm font-mono text-gray-800 truncate">
                  {getSessionId() || 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interacciones Demo</p>
                <p className="text-2xl font-bold text-green-600">{demoCounter}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👆</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recording Controls */}
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            🎛️ Controles de Grabación
          </h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={startRecording}
              disabled={isRecording}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <span>🔴</span>
              Iniciar Grabación
            </button>
            
            <button
              onClick={stopRecording}
              disabled={!isRecording}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <span>⏹️</span>
              Detener Grabación
            </button>
            
            <button
              onClick={handleLogSessionInfo}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>📊</span>
              Info de Sesión (Console)
            </button>
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
            <p className="font-medium text-blue-900 mb-2">💡 Información Importante:</p>
            <ul className="space-y-1 text-blue-800">
              <li>• Las grabaciones se inician automáticamente cuando están habilitadas en PostHog</li>
              <li>• Los controles manuales permiten iniciar/detener grabaciones bajo demanda</li>
              <li>• Las grabaciones capturan interacciones, clics, scrolling, y entrada de formulario</li>
              <li>• Los datos sensibles se pueden ocultar con configuraciones de privacidad</li>
            </ul>
          </div>
        </div>

        {/* Demo Interaction Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Interactive Demo */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎮 Área de Demostración Interactiva
            </h3>
            
            <div className="space-y-4">
              <button
                onClick={handleStartDemo}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                🚀 Hacer Clic Demo ({demoCounter} clics)
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">
                  🟡 Botón A
                </button>
                <button className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
                  🟣 Botón B
                </button>
              </div>
              
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Área de scroll para probar:</p>
                <div className="h-32 overflow-y-auto bg-white p-3 rounded border">
                  <p className="mb-2">Esta es una área con scroll...</p>
                  <p className="mb-2">Puedes hacer scroll aquí para generar eventos</p>
                  <p className="mb-2">PostHog capturará todos estos movimientos</p>
                  <p className="mb-2">Incluyendo clics, hover, y scroll</p>
                  <p className="mb-2">Perfecto para análisis de UX 📊</p>
                  <p className="mb-2">Y mejora de la experiencia del usuario 🚀</p>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Form */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📝 Formulario de Prueba
            </h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tu nombre completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comentarios
                </label>
                <textarea
                  value={formData.feedback}
                  onChange={(e) => handleFormChange('feedback', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="¿Qué opinas de la grabación de sesiones?"
                />
              </div>
              
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                📤 Enviar Formulario Demo
              </button>
            </form>
          </div>
        </div>

        {/* Privacy Information */}
        <div className="mt-8 bg-green-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            🔒 Privacidad y Protección de Datos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
            <div>
              <h4 className="font-medium mb-2">Datos Capturados:</h4>
              <ul className="space-y-1">
                <li>• Movimientos del ratón y clics</li>
                <li>• Navegación entre páginas</li>
                <li>• Scroll y interacciones</li>
                <li>• Entrada en formularios (configurable)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Protecciones de Privacidad:</h4>
              <ul className="space-y-1">
                <li>• Ocultación automática de campos sensibles</li>
                <li>• Respeto a configuraciones opt-out</li>
                <li>• Cumplimiento GDPR y LFPDPPP</li>
                <li>• Datos encriptados en tránsito</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
