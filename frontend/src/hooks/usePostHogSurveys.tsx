'use client'

import { usePostHog } from 'posthog-js/react'
import { useEffect, useState } from 'react'
import type { Survey as PostHogSurvey } from 'posthog-js'

export type Survey = PostHogSurvey

export interface SurveyQuestion {
  type: 'single_choice' | 'multiple_choice' | 'open' | 'rating' | 'nps'
  question: string
  choices?: string[]
  scale?: number
  required?: boolean
}

export interface SurveyCondition {
  properties: Record<string, any>
  operator: 'exact' | 'is_not' | 'icontains' | 'regex'
}

export interface SurveyAppearance {
  backgroundColor?: string
  submitButtonColor?: string
  textColor?: string
  submitButtonText?: string
  descriptionTextColor?: string
  whiteLabel?: boolean
  displayThankYouMessage?: boolean
  thankYouMessageHeader?: string
  thankYouMessageDescription?: string
}

export interface SurveyResponse {
  surveyId: string
  responses: Record<string, any>
}

export function usePostHogSurveys() {
  const posthog = usePostHog()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [activeSurveys, setActiveSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch all available surveys
  const fetchSurveys = async () => {
    try {
      setLoading(true)
      
      // PostHog surveys use callback pattern
      if (posthog.getSurveys) {
        posthog.getSurveys((surveys: Survey[]) => {
          setSurveys(surveys || [])
        })
      }
      
      // Get surveys that match current user context
      if (posthog.getActiveMatchingSurveys) {
        posthog.getActiveMatchingSurveys((surveys: Survey[]) => {
          setActiveSurveys(surveys || [])
        })
      }
    } catch (error) {
      console.error('Error fetching surveys:', error)
      setSurveys([])
      setActiveSurveys([])
    } finally {
      setLoading(false)
    }
  }

  // Submit survey response
  const submitSurveyResponse = (surveyId: string, responses: Record<string, any>) => {
    try {
      posthog.capture('survey sent', {
        $survey_id: surveyId,
        $survey_response: responses
      })
      return true
    } catch (error) {
      console.error('Error submitting survey response:', error)
      return false
    }
  }

  // Dismiss survey
  const dismissSurvey = (surveyId: string) => {
    try {
      posthog.capture('survey dismissed', {
        $survey_id: surveyId
      })
      return true
    } catch (error) {
      console.error('Error dismissing survey:', error)
      return false
    }
  }

  // Check if user should see a specific survey
  const shouldShowSurvey = (surveyId: string): boolean => {
    return activeSurveys.some(survey => survey.id === surveyId)
  }

  // Track survey shown event
  const trackSurveyShown = (surveyId: string) => {
    posthog.capture('survey shown', {
      $survey_id: surveyId
    })
  }

  useEffect(() => {
    if (posthog) {
      fetchSurveys()
    }
  }, [posthog])

  return {
    surveys,
    activeSurveys,
    loading,
    fetchSurveys,
    submitSurveyResponse,
    dismissSurvey,
    shouldShowSurvey,
    trackSurveyShown
  }
}
