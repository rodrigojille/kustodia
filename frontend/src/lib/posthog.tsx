'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined') {
  // Validate PostHog key before initialization
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const isValidKey = posthogKey && 
    posthogKey !== 'your_posthog_key_here' && 
    posthogKey.length > 10 && 
    !posthogKey.includes('XXXXXXXXXX');

  if (isValidKey) {
    try {
      posthog.init(posthogKey, {
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
      });
    } catch (error) {
      console.warn('⚠️ PostHog initialization failed:', error);
    }
  } else {
    console.warn('⚠️ PostHog disabled: Invalid or placeholder API key detected. Set NEXT_PUBLIC_POSTHOG_KEY in environment variables.');
  }
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
