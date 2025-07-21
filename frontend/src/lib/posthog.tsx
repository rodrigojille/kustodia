'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'always', // Create profiles for all users including anonymous
    capture_pageview: true, // Enable automatic pageview capture for better tracking
    capture_pageleave: true, // Track when users leave pages
    debug: true, // Enable debug mode to see what's being sent
    autocapture: true, // Enable automatic event capture
    session_recording: {
      recordCrossOriginIframes: true
    }
    // Session recording is enabled by default when the feature is enabled in PostHog project settings
    // disable_session_recording: false // Set to true to disable session recording
  })
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
