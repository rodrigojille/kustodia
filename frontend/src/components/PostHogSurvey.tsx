'use client'

import React, { useState, useEffect } from 'react'
import { usePostHogSurveys, Survey } from '../hooks/usePostHogSurveys'
import type { SurveyQuestion } from 'posthog-js'

interface PostHogSurveyProps {
  surveyId?: string
  trigger?: 'auto' | 'manual'
  className?: string
  showOnPage?: string[] // Show only on specific pages
}

interface SurveyComponentProps {
  survey: Survey
  onSubmit: (responses: Record<string, any>) => void
  onDismiss: () => void
}

const SurveyComponent: React.FC<SurveyComponentProps> = ({ survey, onSubmit, onDismiss }) => {
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const currentQuestion = survey.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1

  const handleResponse = (questionIndex: number, value: any) => {
    setResponses(prev => ({
      ...prev,
      [`question_${questionIndex}`]: value
    }))
  }

  const handleNext = () => {
    if (isLastQuestion) {
      onSubmit(responses)
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const renderQuestion = (question: SurveyQuestion, index: number) => {
    const value = responses[`question_${index}`]

    switch (question.type as string) {
      case 'single_choice':
        return (
          <div className="space-y-3">
            {(question as any).choices?.map((choice: string, choiceIndex: number) => (
              <label key={choiceIndex} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question_${index}`}
                  value={choice}
                  checked={value === choice}
                  onChange={(e) => handleResponse(index, e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{choice}</span>
              </label>
            ))}
          </div>
        )

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {(question as any).choices?.map((choice: string, choiceIndex: number) => (
              <label key={choiceIndex} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name={`question_${index}`}
                  value={choice}
                  checked={Array.isArray(value) && value.includes(choice)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : []
                    if (e.target.checked) {
                      handleResponse(index, [...currentValues, choice])
                    } else {
                      handleResponse(index, currentValues.filter(v => v !== choice))
                    }
                  }}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{choice}</span>
              </label>
            ))}
          </div>
        )

      case 'open':
        return (
          <textarea
            placeholder="Escribe tu respuesta aquí..."
            value={value || ''}
            onChange={(e) => handleResponse(index, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
          />
        )

      case 'rating':
        const scale = (question as any).scale || 5
        return (
          <div className="flex space-x-2 justify-center">
            {Array.from({ length: scale }, (_, i) => i + 1).map((rating) => (
              <button
                key={rating}
                onClick={() => handleResponse(index, rating)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  value === rating
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        )

      case 'nps':
        return (
          <div>
            <div className="flex justify-between mb-2 text-sm text-gray-500">
              <span>No lo recomendaría</span>
              <span>Lo recomendaría totalmente</span>
            </div>
            <div className="flex space-x-1 justify-center">
              {Array.from({ length: 11 }, (_, i) => i).map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleResponse(index, rating)}
                  className={`w-8 h-8 rounded border-2 text-sm transition-all ${
                    value === rating
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{survey.name}</h3>
            {survey.description && (
              <p className="text-gray-600 text-sm">{survey.description}</p>
            )}
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Pregunta {currentQuestionIndex + 1} de {survey.questions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / survey.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            {currentQuestion.question}
          </h4>
          {renderQuestion(currentQuestion, currentQuestionIndex)}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLastQuestion ? 'Enviar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  )
}

export const PostHogSurvey: React.FC<PostHogSurveyProps> = ({
  surveyId,
  trigger = 'auto',
  className = '',
  showOnPage = []
}) => {
  const { activeSurveys, submitSurveyResponse, dismissSurvey, trackSurveyShown } = usePostHogSurveys()
  const [showSurvey, setShowSurvey] = useState(false)
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null)

  useEffect(() => {
    if (trigger === 'auto' && activeSurveys.length > 0) {
      // Show survey based on conditions
      const surveyToShow = surveyId 
        ? activeSurveys.find(s => s.id === surveyId)
        : activeSurveys[0] // Show first matching survey

      if (surveyToShow) {
        // Check page restrictions
        if (showOnPage.length > 0) {
          const currentPath = window.location.pathname
          if (!showOnPage.some(page => currentPath.includes(page))) {
            return
          }
        }

        setCurrentSurvey(surveyToShow)
        setShowSurvey(true)
        trackSurveyShown(surveyToShow.id)
      }
    }
  }, [activeSurveys, surveyId, trigger, showOnPage, trackSurveyShown])

  const handleSubmit = (responses: Record<string, any>) => {
    if (currentSurvey) {
      const success = submitSurveyResponse(currentSurvey.id, responses)
      if (success) {
        setShowSurvey(false)
        setCurrentSurvey(null)
      }
    }
  }

  const handleDismiss = () => {
    if (currentSurvey) {
      dismissSurvey(currentSurvey.id)
      setShowSurvey(false)
      setCurrentSurvey(null)
    }
  }

  // Manual trigger button
  if (trigger === 'manual') {
    return (
      <button
        onClick={() => {
          const surveyToShow = surveyId 
            ? activeSurveys.find(s => s.id === surveyId)
            : activeSurveys[0]
          
          if (surveyToShow) {
            setCurrentSurvey(surveyToShow)
            setShowSurvey(true)
            trackSurveyShown(surveyToShow.id)
          }
        }}
        className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${className}`}
        disabled={activeSurveys.length === 0}
      >
        📋 Encuesta de Producto
      </button>
    )
  }

  // Auto trigger survey
  return (
    <>
      {showSurvey && currentSurvey && (
        <SurveyComponent
          survey={currentSurvey}
          onSubmit={handleSubmit}
          onDismiss={handleDismiss}
        />
      )}
    </>
  )
}

export default PostHogSurvey
