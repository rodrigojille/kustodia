import posthog from 'posthog-js'

// Initialize PostHog for client-side error tracking
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: '2025-05-24',
  // Enable automatic exception capture
  capture_pageview: false, // We handle this manually
  // Session recording is handled in layout
})

// Enable automatic exception capture
if (typeof window !== 'undefined') {
  // Override global error handlers to capture exceptions
  const originalOnError = window.onerror
  const originalOnUnhandledRejection = window.onunhandledrejection

  window.onerror = function(message, source, lineno, colno, error) {
    posthog.captureException(error || new Error(message), {
      source: 'window.onerror',
      message,
      source_file: source,
      line: lineno,
      column: colno,
    })
    
    if (originalOnError) {
      return originalOnError.apply(this, arguments)
    }
    return false
  }

  window.onunhandledrejection = function(event) {
    posthog.captureException(event.reason, {
      source: 'unhandledrejection',
      promise_rejection: true,
    })
    
    if (originalOnUnhandledRejection) {
      return originalOnUnhandledRejection.apply(this, arguments)
    }
  }
}

console.log('📊 PostHog Error Tracking initialized')
