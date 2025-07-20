'use client'

import React from 'react'
import Link from 'next/link'
import PostHogSurvey from '../../../components/PostHogSurvey'
import { usePostHogSurveys } from '../../../hooks/usePostHogSurveys'

export default function EncuestasPage() {
  const { surveys, activeSurveys, loading } = usePostHogSurveys()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Encuestas de Producto</h1>
              <p className="text-gray-600">
                Ayúdanos a mejorar Kustodia compartiendo tu experiencia
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

        {/* Survey Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Encuestas Disponibles</p>
                <p className="text-2xl font-bold text-blue-600">{surveys.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Encuestas Activas</p>
                <p className="text-2xl font-bold text-green-600">{activeSurveys.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estado</p>
                <p className="text-sm font-semibold text-gray-900">
                  {loading ? 'Cargando...' : 'Listo'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">{loading ? '⏳' : '🎯'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Survey Trigger */}
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 mb-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🚀 Iniciar Encuesta de Producto
            </h2>
            <p className="text-gray-600 mb-6">
              Haz clic para participar en nuestra encuesta y ayudarnos a mejorar tu experiencia en Kustodia
            </p>
            
            <div className="flex justify-center gap-4">
              <PostHogSurvey 
                trigger="manual"
                className="px-8 py-3 text-lg font-medium"
              />
              
              {activeSurveys.length === 0 && (
                <div className="text-center text-gray-500 bg-gray-50 px-6 py-3 rounded-lg">
                  <p className="text-sm">
                    🔄 No hay encuestas disponibles para tu perfil en este momento
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Survey Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              💡 ¿Por qué son importantes las encuestas?
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                Mejoramos los flujos de pagos y custodia
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                Desarrollamos nuevas funciones según tus necesidades
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                Optimizamos la seguridad y experiencia de usuario
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                Personalizamos el servicio para el mercado mexicano
              </li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              🔒 Tu privacidad está protegida
            </h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                Las respuestas son completamente anónimas
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                Cumplimos con LFPDPPP y estándares internacionales
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                Solo usamos los datos para mejoras del producto
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                Puedes saltar preguntas o cancelar en cualquier momento
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Las encuestas son parte de nuestro compromiso con la mejora continua.
            <br />
            ¿Tienes sugerencias adicionales? Escríbenos a{' '}
            <a href="mailto:soporte@kustodia.mx" className="text-blue-600 hover:underline">
              soporte@kustodia.mx
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
