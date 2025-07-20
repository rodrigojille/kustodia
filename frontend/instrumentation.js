// Server-side error tracking for Next.js
export function register() {
  console.log('📊 PostHog Server-side Error Tracking registered')
}

export const onRequestError = async (err, request, context) => {
  // Only run in Node.js runtime (not Edge runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { getPostHogServer } = require('./lib/posthog-server')
      const posthog = await getPostHogServer()
      
      let distinctId = null
      
      // Extract user ID from PostHog cookie if available
      if (request.headers.cookie) {
        const cookieString = request.headers.cookie
        const postHogCookieMatch = cookieString.match(/ph_phc_.*?_posthog=([^;]+)/)

        if (postHogCookieMatch && postHogCookieMatch[1]) {
          try {
            const decodedCookie = decodeURIComponent(postHogCookieMatch[1])
            const postHogData = JSON.parse(decodedCookie)
            distinctId = postHogData.distinct_id
          } catch (e) {
            console.error('Error parsing PostHog cookie:', e)
          }
        }
      }

      // Capture the server-side exception
      await posthog.captureException(err, {
        distinct_id: distinctId,
        server_side: true,
        request_url: request.url,
        request_method: request.method,
        user_agent: request.headers['user-agent'],
        timestamp: new Date().toISOString(),
        context: {
          route: context?.route || 'unknown',
          runtime: process.env.NEXT_RUNTIME,
        }
      })

      console.error('🚨 Server error captured by PostHog:', err.message)
    } catch (captureError) {
      console.error('Failed to capture error with PostHog:', captureError)
    }
  }
}
