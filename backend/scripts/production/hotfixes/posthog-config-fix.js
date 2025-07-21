// PostHog Configuration Fix
const posthogConfig = {
  // Disable PostHog in production if API key is invalid
  enabled: process.env.NODE_ENV !== 'production' || !!process.env.POSTHOG_API_KEY,
  apiKey: process.env.POSTHOG_API_KEY || 'disabled',
  options: {
    api_host: 'https://us.i.posthog.com',
    loaded: function(posthog) {
      if (process.env.NODE_ENV === 'production' && !process.env.POSTHOG_API_KEY) {
        console.warn('[PostHog] Disabled in production - no valid API key');
        posthog.opt_out_capturing();
      }
    },
    capture_pageview: false, // Disable automatic pageview capture
    disable_session_recording: true, // Disable session recording for now
  }
};

// Safe PostHog initialization
function initializePostHog() {
  if (typeof window !== 'undefined' && posthogConfig.enabled) {
    try {
      posthog.init(posthogConfig.apiKey, posthogConfig.options);
    } catch (error) {
      console.error('[PostHog] Initialization failed:', error);
    }
  }
}

export { posthogConfig, initializePostHog };