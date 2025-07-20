'use client'

import { usePostHog } from 'posthog-js/react'
import { useCallback } from 'react'

export interface ErrorContext {
  user_action?: string
  page_context?: string
  feature?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  additional_data?: Record<string, any>
}

export interface ErrorTrackingHook {
  captureError: (error: Error, context?: ErrorContext) => void
  captureMessage: (message: string, level?: 'info' | 'warning' | 'error') => void
  setUserContext: (properties: Record<string, any>) => void
}

/**
 * Custom hook for PostHog error tracking
 * Provides methods to capture errors, messages, and set user context
 */
export function useErrorTracking(): ErrorTrackingHook {
  const posthog = usePostHog()

  const captureError = useCallback((error: Error, context?: ErrorContext) => {
    if (!posthog) return

    try {
      posthog.captureException(error, {
        ...context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        user_agent: navigator.userAgent,
        stack_trace: error.stack,
        error_source: 'manual_capture'
      })

      console.error('🚨 Error captured manually:', error.message, context)
    } catch (captureError) {
      console.error('Failed to capture error:', captureError)
    }
  }, [posthog])

  const captureMessage = useCallback((message: string, level: 'info' | 'warning' | 'error' = 'info') => {
    if (!posthog) return

    try {
      posthog.capture('error_message', {
        message,
        level,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      })

      console.log(`📝 Message captured (${level}):`, message)
    } catch (error) {
      console.error('Failed to capture message:', error)
    }
  }, [posthog])

  const setUserContext = useCallback((properties: Record<string, any>) => {
    if (!posthog) return

    try {
      posthog.setPersonProperties(properties)
      console.log('👤 User context updated:', properties)
    } catch (error) {
      console.error('Failed to set user context:', error)
    }
  }, [posthog])

  return {
    captureError,
    captureMessage,
    setUserContext,
  }
}

/**
 * Error tracking utilities for common scenarios
 */
export const ErrorTrackingUtils = {
  /**
   * Track API errors
   */
  captureApiError: (posthog: any, error: Error, endpoint: string, method: string) => {
    if (!posthog) return
    
    posthog.captureException(error, {
      error_type: 'api_error',
      endpoint,
      method,
      timestamp: new Date().toISOString(),
    })
  },

  /**
   * Track payment-related errors (high priority for Kustodia)
   */
  capturePaymentError: (posthog: any, error: Error, paymentStep: string, amount?: number) => {
    if (!posthog) return
    
    posthog.captureException(error, {
      error_type: 'payment_error',
      payment_step: paymentStep,
      amount: amount || null,
      severity: 'critical',
      timestamp: new Date().toISOString(),
    })
  },

  /**
   * Track authentication errors
   */
  captureAuthError: (posthog: any, error: Error, authStep: string) => {
    if (!posthog) return
    
    posthog.captureException(error, {
      error_type: 'auth_error',
      auth_step: authStep,
      severity: 'high',
      timestamp: new Date().toISOString(),
    })
  },

  /**
   * Track blockchain/crypto errors
   */
  captureCryptoError: (posthog: any, error: Error, operation: string, network?: string) => {
    if (!posthog) return
    
    posthog.captureException(error, {
      error_type: 'crypto_error',
      crypto_operation: operation,
      network: network || 'unknown',
      severity: 'high',
      timestamp: new Date().toISOString(),
    })
  },

  /**
   * Track form validation errors
   */
  captureFormError: (posthog: any, error: Error, formName: string, fieldName?: string) => {
    if (!posthog) return
    
    posthog.captureException(error, {
      error_type: 'form_error',
      form_name: formName,
      field_name: fieldName || null,
      severity: 'medium',
      timestamp: new Date().toISOString(),
    })
  },
}
