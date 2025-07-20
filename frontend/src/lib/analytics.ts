/**
 * Enhanced Analytics Library for Kustodia
 * Supports both Google Analytics 4 and PostHog
 * Focus on fraud prevention and payment flow tracking
 */

import posthog from 'posthog-js';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Google Analytics 4 Event Interface
interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  fraud_category?: string;
  payment_method?: string;
  user_intent?: string;
  engagement_level?: 'low' | 'medium' | 'high';
}

// PostHog Event Interface
interface PostHogEvent {
  event_name: string;
  properties: {
    [key: string]: any;
  };
}

// Unified Analytics Interface
interface KustodiaAnalyticsEvent {
  event_name: string;
  category: 'user_acquisition' | 'payment_flow' | 'fraud_prevention' | 'engagement' | 'conversion';
  properties: {
    // Common properties
    user_id?: string;
    session_id?: string;
    timestamp?: number;
    page_url?: string;
    
    // Payment flow specific
    payment_amount?: number;
    payment_method?: string; // 'spei' | 'card' | 'oxxo' | 'mercadopago' | 'crypto' | string
    custody_percentage?: number;
    custody_timeline?: string;
    transaction_type?: string; // 'real_estate' | 'automotive' | 'services' | 'marketplace' | 'other' | string
    
    // Fraud prevention specific
    fraud_category?: string; // 'real_estate' | 'automotive' | 'employment' | 'services' | 'spei_banking' | 'service_contracts' | string
    security_features_used?: string[];
    escrow_adoption?: boolean;
    
    // User behavior
    user_intent?: string; // 'venting' | 'seeking_solutions' | 'sharing_prevention' | 'warning_others' | string
    engagement_level?: 'low' | 'medium' | 'high';
    feature_discovery?: string;
    
    // Business intelligence
    mexican_market?: boolean;
    mobile_device?: boolean;
    conversion_stage?: 'awareness' | 'consideration' | 'trial' | 'purchase' | 'retention';
    
    [key: string]: any;
  };
}

// Analytics Class
class KustodiaAnalytics {
  private isGALoaded: boolean = false;
  private isPostHogLoaded: boolean = false;
  
  constructor() {
    this.initializeGA();
    this.initializePostHog();
  }

  private initializeGA() {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      this.isGALoaded = true;
    }
  }

  private initializePostHog() {
    if (typeof window !== 'undefined') {
      // Initialize PostHog - you'll need to replace with your actual project API key
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_placeholder_key', {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        // Enable/disable features based on environment
        autocapture: process.env.NODE_ENV === 'production',
        capture_pageview: false, // We'll handle page views manually
        disable_session_recording: process.env.NODE_ENV !== 'production',
        // Mexican market specific settings
        persistence: 'localStorage',
        cross_subdomain_cookie: false,
        secure_cookie: true,
        // Advanced settings for fraud prevention tracking
        property_blacklist: [], // Don't block any properties for comprehensive fraud analysis
        sanitize_properties: null,
        xhr_headers: {},
        // Session replay for debugging payment flows (production only)
        session_recording: {
          maskAllInputs: true,
          maskInputOptions: {
            password: true,
            email: false // Allow email for user identification
          }
        },
        // Feature flags for A/B testing fraud prevention messages
        bootstrap: {},
        // Custom person properties for Mexican market analysis
        loaded: (posthog) => {
          // Set up custom properties based on Reddit scraper insights
          posthog.people.set({
            mexican_market: true,
            fraud_awareness_level: 'discovering', // Will be updated based on behavior
            preferred_transaction_types: [], // Will be populated from usage
            escrow_adoption_stage: 'unaware', // Based on zero escrow awareness from scraper
            total_payments_created: 0,
            total_payment_volume: 0
          });
        }
      });
      this.isPostHogLoaded = true;
    }
  }

  // Google Analytics 4 Event Tracking
  private trackGA4Event(event: KustodiaAnalyticsEvent) {
    if (!this.isGALoaded || typeof window === 'undefined' || !window.gtag) {
      console.warn('GA4 not loaded');
      return;
    }

    const gaEvent: any = {
      event_category: event.category,
      event_label: event.properties.page_url || window.location.pathname,
      custom_map: {
        fraud_category: event.properties.fraud_category,
        payment_method: event.properties.payment_method,
        user_intent: event.properties.user_intent,
        engagement_level: event.properties.engagement_level,
        transaction_type: event.properties.transaction_type,
        mexican_market: event.properties.mexican_market,
        mobile_device: event.properties.mobile_device,
        conversion_stage: event.properties.conversion_stage
      }
    };

    // Add payment-specific data for enhanced eCommerce
    if (event.category === 'payment_flow') {
      gaEvent.value = event.properties.payment_amount;
      gaEvent.currency = 'MXN';
      gaEvent.payment_type = event.properties.payment_method;
      gaEvent.custody_percentage = event.properties.custody_percentage;
    }

    window.gtag('event', event.event_name, gaEvent);
  }

  // PostHog Event Tracking - Full Implementation
  private trackPostHogEvent(event: KustodiaAnalyticsEvent) {
    if (!this.isPostHogLoaded || typeof window === 'undefined') {
      console.warn('PostHog not loaded');
      return;
    }

    // Convert KustodiaAnalyticsEvent to PostHog format
    const postHogProperties = {
      ...event.properties,
      // Add PostHog-specific context
      event_category: event.category,
      mexican_market: event.properties.mexican_market ?? true,
      platform: 'web',
      // Enhanced fraud prevention context based on Reddit scraper insights
      fraud_detection_context: {
        category: event.properties.fraud_category,
        user_intent: event.properties.user_intent,
        transaction_type: event.properties.transaction_type,
        security_features_used: event.properties.security_features_used
      },
      // Payment flow context for conversion analysis
      payment_context: event.category === 'payment_flow' ? {
        amount: event.properties.payment_amount,
        method: event.properties.payment_method,
        custody_percentage: event.properties.custody_percentage,
        custody_timeline: event.properties.custody_timeline
      } : undefined,
      // User behavior context for product analytics
      engagement_context: {
        level: event.properties.engagement_level,
        feature_discovery: event.properties.feature_discovery,
        time_spent: event.properties.time_spent_seconds
      },
      // Business intelligence context
      business_context: {
        conversion_stage: event.properties.conversion_stage,
        mobile_device: event.properties.mobile_device,
        page_url: event.properties.page_url
      }
    };

    // Track the event in PostHog
    posthog.capture(event.event_name, postHogProperties);

    // Special handling for user identification events
    if (event.event_name === 'user_registration' || event.event_name === 'user_login') {
      const userId = event.properties.user_id || event.properties.email;
      if (userId) {
        posthog.identify(userId, {
          email: event.properties.email,
          registration_date: event.event_name === 'user_registration' ? new Date().toISOString() : undefined,
          fraud_category_interests: event.properties.fraud_category_interest ? [event.properties.fraud_category_interest] : [],
          mexican_market: true
        });
      }
    }

    // Update person properties for fraud prevention insights
    if (event.category === 'fraud_prevention') {
      posthog.people.set({
        fraud_awareness_level: 'engaged',
        last_fraud_category_viewed: event.properties.fraud_category,
        escrow_adoption_stage: event.properties.escrow_adoption ? 'adopting' : 'considering'
      });
    }

    // Track payment behavior for business intelligence
    if (event.category === 'payment_flow' || event.category === 'conversion') {
      // Get current counts and increment them
      const currentPaymentCount = posthog.get_property('total_payments_created') || 0;
      const currentPaymentVolume = posthog.get_property('total_payment_volume') || 0;
      
      posthog.people.set({
        total_payments_created: currentPaymentCount + 1,
        total_payment_volume: currentPaymentVolume + (event.properties.payment_amount || 0)
      });
      
      // Update preferred transaction types based on usage
      if (event.properties.transaction_type) {
        const currentTypes = posthog.get_property('preferred_transaction_types') || [];
        const updatedTypes = [...new Set([...currentTypes, event.properties.transaction_type])];
        posthog.people.set({
          preferred_transaction_types: updatedTypes
        });
      }
    }
  }

  // Main tracking method
  public track(event: KustodiaAnalyticsEvent) {
    // Add timestamp and session info
    event.properties.timestamp = Date.now();
    event.properties.page_url = typeof window !== 'undefined' ? window.location.href : '';
    event.properties.mobile_device = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

    // Track in both systems
    this.trackGA4Event(event);
    this.trackPostHogEvent(event);

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event);
    }
  }

  // Specialized tracking methods based on Reddit scraper insights
  
  // User Acquisition Events
  public trackUserRegistration(properties: { 
    source?: string; 
    fraud_category_interest?: string;
    mexican_market?: boolean;
  }) {
    this.track({
      event_name: 'user_registration',
      category: 'user_acquisition',
      properties: {
        ...properties,
        conversion_stage: 'awareness'
      }
    });
  }

  // Payment Flow Events (based on nuevo-flujo insights)
  public trackPaymentFlowStart(properties: { 
    transaction_type: string;
    payment_amount?: number;
  }) {
    this.track({
      event_name: 'payment_flow_start',
      category: 'payment_flow',
      properties: {
        ...properties,
        conversion_stage: 'consideration'
      }
    });
  }

  public trackPaymentMethodSelection(properties: { 
    payment_method: string;
    transaction_type: string;
    payment_amount?: number;
  }) {
    this.track({
      event_name: 'payment_method_selected',
      category: 'payment_flow',
      properties: {
        ...properties,
        conversion_stage: 'trial'
      }
    });
  }

  public trackCustodySettings(properties: { 
    custody_percentage: number;
    custody_timeline: string;
    transaction_type: string;
  }) {
    this.track({
      event_name: 'custody_settings_configured',
      category: 'payment_flow',
      properties: {
        ...properties,
        escrow_adoption: true,
        conversion_stage: 'trial'
      }
    });
  }

  public trackPaymentCompletion(properties: { 
    payment_amount: number;
    payment_method: string;
    transaction_type: string;
    custody_percentage: number;
  }) {
    this.track({
      event_name: 'payment_completed',
      category: 'conversion',
      properties: {
        ...properties,
        conversion_stage: 'purchase'
      }
    });
  }

  // Fraud Prevention Events (based on scraper insights)
  public trackFraudPreventionEngagement(properties: { 
    fraud_category: string;
    security_features_used: string[];
    user_intent?: string;
  }) {
    this.track({
      event_name: 'fraud_prevention_engagement',
      category: 'fraud_prevention',
      properties: {
        ...properties,
        engagement_level: properties.security_features_used.length > 2 ? 'high' : 'medium'
      }
    });
  }

  // Real Estate Specific (highest opportunity from scraper)
  public trackRealEstateEscrowInterest(properties: { 
    user_intent: 'seeking_solutions' | 'venting' | 'sharing_prevention';
    property_value?: number;
  }) {
    this.track({
      event_name: 'real_estate_escrow_interest',
      category: 'fraud_prevention',
      properties: {
        ...properties,
        fraud_category: 'real_estate',
        transaction_type: 'real_estate',
        engagement_level: 'high'
      }
    });
  }

  // SPEI Banking Fraud Prevention (new category from scraper)
  public trackSPEIFraudPrevention(properties: { 
    user_intent?: string;
    banking_method?: string;
  }) {
    this.track({
      event_name: 'spei_fraud_prevention',
      category: 'fraud_prevention',
      properties: {
        ...properties,
        fraud_category: 'spei_banking',
        mexican_market: true
      }
    });
  }

  // Service Contract Protection (new category from scraper)
  public trackServiceContractProtection(properties: { 
    service_type?: string;
    contract_value?: number;
    user_intent?: string;
  }) {
    this.track({
      event_name: 'service_contract_protection',
      category: 'fraud_prevention',
      properties: {
        ...properties,
        fraud_category: 'service_contracts',
        transaction_type: 'services'
      }
    });
  }

  // Page View Tracking with Enhanced Context
  public trackPageView(properties: { 
    page_title: string;
    page_url: string;
    previous_page?: string;
    time_on_page?: number;
  }) {
    this.track({
      event_name: 'page_view',
      category: 'engagement',
      properties: {
        ...properties,
        engagement_level: (properties.time_on_page || 0) > 30 ? 'high' : 'medium'
      }
    });
  }

  // Feature Discovery (important for product development)
  public trackFeatureDiscovery(properties: { 
    feature_name: string;
    discovery_method: 'navigation' | 'search' | 'recommendation' | 'onboarding';
    user_engagement?: 'clicked' | 'used' | 'ignored';
  }) {
    this.track({
      event_name: 'feature_discovery',
      category: 'engagement',
      properties: {
        ...properties,
        feature_discovery: properties.feature_name,
        engagement_level: properties.user_engagement === 'used' ? 'high' : 'medium'
      }
    });
  }
}

// Create singleton instance
const analytics = new KustodiaAnalytics();

// Export for use in components
export default analytics;

// Export types for TypeScript usage
export type { KustodiaAnalyticsEvent, GAEvent, PostHogEvent };

// Utility functions for specific scenarios
export const trackUserBehavior = {
  // High-level user journey tracking
  onboardingStep: (step: string, completed: boolean) => {
    analytics.track({
      event_name: 'onboarding_step',
      category: 'user_acquisition',
      properties: {
        step_name: step,
        step_completed: completed,
        conversion_stage: 'awareness'
      }
    });
  },

  // Dashboard engagement
  dashboardEngagement: (section: string, time_spent: number) => {
    analytics.track({
      event_name: 'dashboard_engagement',
      category: 'engagement',
      properties: {
        dashboard_section: section,
        time_spent_seconds: time_spent,
        engagement_level: time_spent > 60 ? 'high' : time_spent > 20 ? 'medium' : 'low'
      }
    });
  },

  // Based on Reddit scraper insights: zero escrow awareness
  escrowEducationEngagement: (content_type: string, engagement_type: 'view' | 'interact' | 'share') => {
    analytics.track({
      event_name: 'escrow_education_engagement',
      category: 'fraud_prevention',
      properties: {
        content_type,
        engagement_type,
        escrow_adoption: engagement_type !== 'view',
        conversion_stage: engagement_type === 'share' ? 'retention' : 'consideration'
      }
    });
  }
}
