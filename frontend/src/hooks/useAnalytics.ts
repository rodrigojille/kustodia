/**
 * React Hook for Kustodia Analytics
 * Provides easy-to-use analytics tracking for React components
 * Based on Reddit scraper insights and fraud prevention focus
 */

'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import analytics, { trackUserBehavior } from '../lib/analytics';

// Page tracking hook
export function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousPage = useRef<string>('');
  const pageLoadTime = useRef<number>(Date.now());

  useEffect(() => {
    const currentUrl = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    // Track page view with enhanced context
    analytics.trackPageView({
      page_title: document.title,
      page_url: currentUrl,
      previous_page: previousPage.current || undefined,
      time_on_page: previousPage.current ? Date.now() - pageLoadTime.current : undefined
    });

    // Update tracking vars
    previousPage.current = currentUrl;
    pageLoadTime.current = Date.now();

    // Cleanup: track time spent on page when component unmounts
    return () => {
      const timeSpent = (Date.now() - pageLoadTime.current) / 1000;
      if (timeSpent > 5) { // Only track if user spent more than 5 seconds
        trackUserBehavior.dashboardEngagement(pathname, timeSpent);
      }
    };
  }, [pathname, searchParams]);
}

// Payment flow tracking hook (for nuevo-flujo components)
export function usePaymentFlowTracking() {
  const trackPaymentStep = (step: string, data?: any) => {
    switch (step) {
      case 'start':
        analytics.trackPaymentFlowStart({
          transaction_type: data?.transaction_type || 'general',
          payment_amount: data?.amount
        });
        break;
      
      case 'payment_method':
        analytics.trackPaymentMethodSelection({
          payment_method: data?.method,
          transaction_type: data?.transaction_type || 'general',
          payment_amount: data?.amount
        });
        break;
      
      case 'custody_settings':
        analytics.trackCustodySettings({
          custody_percentage: data?.percentage,
          custody_timeline: data?.timeline,
          transaction_type: data?.transaction_type || 'general'
        });
        break;
      
      case 'completion':
        analytics.trackPaymentCompletion({
          payment_amount: data?.amount,
          payment_method: data?.method,
          transaction_type: data?.transaction_type || 'general',
          custody_percentage: data?.percentage
        });
        break;
    }
  };

  return { trackPaymentStep };
}

// Fraud prevention tracking hook (based on Reddit scraper categories)
export function useFraudPreventionTracking() {
  const trackFraudPrevention = (category: string, action: string, data?: any) => {
    // Track based on scraper-identified high-value categories
    switch (category) {
      case 'real_estate':
        analytics.trackRealEstateEscrowInterest({
          user_intent: data?.user_intent || 'seeking_solutions',
          property_value: data?.value
        });
        break;
      
      case 'spei_banking':
        analytics.trackSPEIFraudPrevention({
          user_intent: data?.user_intent,
          banking_method: data?.method
        });
        break;
      
      case 'service_contracts':
        analytics.trackServiceContractProtection({
          service_type: data?.service_type,
          contract_value: data?.value,
          user_intent: data?.user_intent
        });
        break;
      
      default:
        analytics.trackFraudPreventionEngagement({
          fraud_category: category,
          security_features_used: data?.features || [],
          user_intent: data?.user_intent
        });
    }
  };

  const trackEscrowEducation = (content_type: string, engagement: 'view' | 'interact' | 'share') => {
    trackUserBehavior.escrowEducationEngagement(content_type, engagement);
  };

  return { trackFraudPrevention, trackEscrowEducation };
}

// Form interaction tracking hook
export function useFormTracking() {
  const trackFormStart = (formName: string, formType?: string) => {
    analytics.track({
      event_name: 'form_start',
      category: 'engagement',
      properties: {
        form_name: formName,
        form_type: formType,
        conversion_stage: 'consideration'
      }
    });
  };

  const trackFormCompletion = (formName: string, success: boolean, errors?: string[]) => {
    analytics.track({
      event_name: 'form_completion',
      category: 'conversion',
      properties: {
        form_name: formName,
        success,
        errors: errors?.join(', '),
        conversion_stage: success ? 'trial' : 'consideration'
      }
    });
  };

  const trackFieldInteraction = (formName: string, fieldName: string, interaction: 'focus' | 'blur' | 'change') => {
    analytics.track({
      event_name: 'form_field_interaction',
      category: 'engagement',
      properties: {
        form_name: formName,
        field_name: fieldName,
        interaction_type: interaction,
        engagement_level: 'medium'
      }
    });
  };

  return { trackFormStart, trackFormCompletion, trackFieldInteraction };
}

// Feature discovery tracking hook
export function useFeatureTracking() {
  const trackFeatureDiscovery = (featureName: string, method: string) => {
    analytics.trackFeatureDiscovery({
      feature_name: featureName,
      discovery_method: method as any,
      user_engagement: 'clicked'
    });
  };

  const trackFeatureUsage = (featureName: string, usageType: string, data?: any) => {
    analytics.track({
      event_name: 'feature_usage',
      category: 'engagement',
      properties: {
        feature_name: featureName,
        usage_type: usageType,
        feature_data: data,
        engagement_level: 'high'
      }
    });
  };

  return { trackFeatureDiscovery, trackFeatureUsage };
}

// Business intelligence tracking hook
export function useBusinessTracking() {
  const trackConversion = (conversionType: string, value?: number, details?: any) => {
    analytics.track({
      event_name: 'conversion',
      category: 'conversion',
      properties: {
        conversion_type: conversionType,
        conversion_value: value,
        conversion_details: details,
        conversion_stage: 'purchase',
        mexican_market: true // Kustodia focus
      }
    });
  };

  const trackUserRetention = (days: number, actions: string[]) => {
    analytics.track({
      event_name: 'user_retention',
      category: 'engagement',
      properties: {
        retention_days: days,
        actions_taken: actions,
        conversion_stage: 'retention',
        engagement_level: actions.length > 3 ? 'high' : 'medium'
      }
    });
  };

  return { trackConversion, trackUserRetention };
}

// Export main analytics hook with all functionality
export default function useAnalytics() {
  const pageTracking = usePageTracking();
  const paymentFlow = usePaymentFlowTracking();
  const fraudPrevention = useFraudPreventionTracking();
  const formTracking = useFormTracking();
  const featureTracking = useFeatureTracking();
  const businessTracking = useBusinessTracking();

  // Direct access to core analytics
  const track = analytics.track.bind(analytics);
  const trackUserRegistration = analytics.trackUserRegistration.bind(analytics);

  return {
    // Core tracking
    track,
    trackUserRegistration,
    
    // Specialized hooks
    paymentFlow,
    fraudPrevention,
    formTracking,
    featureTracking,
    businessTracking,
    
    // Individual tracking methods
    ...trackUserBehavior
  };
}
