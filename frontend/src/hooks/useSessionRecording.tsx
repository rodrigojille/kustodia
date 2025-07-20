'use client'

import { usePostHog } from 'posthog-js/react'
import { useCallback, useEffect, useState } from 'react'

export interface SessionRecordingControls {
  isRecording: boolean
  startRecording: () => void
  stopRecording: () => void
  getSessionReplayUrl: () => string | null
  getSessionId: () => string | null
}

/**
 * Custom hook for managing PostHog session recordings
 * Provides programmatic control over session recording functionality
 */
export function useSessionRecording(): SessionRecordingControls {
  const posthog = usePostHog()
  const [isRecording, setIsRecording] = useState(false)

  // Check recording status on mount
  useEffect(() => {
    if (posthog && posthog.sessionRecordingStarted) {
      setIsRecording(posthog.sessionRecordingStarted())
    }
  }, [posthog])

  const startRecording = useCallback(() => {
    if (posthog && posthog.startSessionRecording) {
      posthog.startSessionRecording()
      setIsRecording(true)
      console.log('📹 Session recording started')
    }
  }, [posthog])

  const stopRecording = useCallback(() => {
    if (posthog && posthog.stopSessionRecording) {
      posthog.stopSessionRecording()
      setIsRecording(false)
      console.log('⏹️ Session recording stopped')
    }
  }, [posthog])

  const getSessionReplayUrl = useCallback((): string | null => {
    if (posthog && posthog.get_session_replay_url) {
      return posthog.get_session_replay_url()
    }
    return null
  }, [posthog])

  const getSessionId = useCallback((): string | null => {
    if (posthog && posthog.get_session_id) {
      return posthog.get_session_id()
    }
    return null
  }, [posthog])

  return {
    isRecording,
    startRecording,
    stopRecording,
    getSessionReplayUrl,
    getSessionId,
  }
}

/**
 * Session recording utility functions for debugging and support
 */
export const SessionRecordingUtils = {
  /**
   * Log session information to console (for debugging)
   */
  logSessionInfo: (posthog: any) => {
    if (!posthog) return
    
    console.group('📹 PostHog Session Recording Info')
    console.log('Session ID:', posthog.get_session_id?.())
    console.log('Recording Status:', posthog.sessionRecordingStarted?.())
    console.log('Replay URL:', posthog.get_session_replay_url?.())
    console.groupEnd()
  },

  /**
   * Capture specific events during important user flows
   */
  captureUserFlowEvent: (posthog: any, eventName: string, properties?: Record<string, any>) => {
    if (!posthog) return
    
    posthog.capture(eventName, {
      ...properties,
      session_recording_enabled: posthog.sessionRecordingStarted?.() || false,
      session_id: posthog.get_session_id?.(),
      timestamp: new Date().toISOString(),
    })
  },
}
