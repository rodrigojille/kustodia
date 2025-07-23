'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'always',
    capture_pageview: true,
    capture_pageleave: true,
    debug: false, // Disable debug to reduce console noise
    autocapture: true,
    
    // Session recording configuration - more conservative approach
    session_recording: {
      recordCrossOriginIframes: false, // Disable cross-origin to avoid loading issues
      maskAllInputs: false,
      maskInputOptions: {
        password: true,
        email: false
      }
    },
    
    // Disable features that might cause loading issues
    disable_surveys: true, // Disable surveys to avoid loading errors
    
    // Advanced loading configuration
    persistence: 'localStorage+cookie',
    
    // Error handling
    loaded: function(posthog) {
      console.log('PostHog loaded successfully');
    },
    
    // Reduce feature loading to prevent script errors
    bootstrap: {
      distinctID: undefined
    }
  })
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
