'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'always',
    capture_pageview: true,
    capture_pageleave: true,
    debug: false,
    autocapture: true,
    
    // Graceful session recording - will work when possible, fail silently when not
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: {
        password: true,
        email: false
      }
    },
    
    // Keep surveys disabled to prevent loading errors
    disable_surveys: true,
    persistence: 'localStorage+cookie',
    
    // Simple loaded callback without complex retry logic
    loaded: function(posthog) {
      console.log('✅ PostHog analytics loaded and ready');
      
      // Send a test event to confirm tracking works
      posthog.capture('posthog_initialized', {
        timestamp: new Date().toISOString(),
        session_recording_available: !!posthog.sessionRecording
      });
    }
  })
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
