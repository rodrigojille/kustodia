'use client';
import { useState, useEffect } from 'react';
import ABTestManager, { ABTestVariant } from '../config/abTestConfig';
import { useAnalyticsContext } from '../components/AnalyticsProvider';

interface UseABTestResult {
  variant: ABTestVariant | null;
  isLoading: boolean;
  trackEvent: (eventName: string, data?: any) => void;
}

export function useABTest(testId: string, userId?: string): UseABTestResult {
  const [variant, setVariant] = useState<ABTestVariant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { trackEvent: analyticsTrackEvent } = useAnalyticsContext();
  const abTestManager = ABTestManager.getInstance();

  useEffect(() => {
    const assignedVariant = abTestManager.assignVariant(testId, userId);
    setVariant(assignedVariant);
    setIsLoading(false);

    if (assignedVariant) {
      // Track variant assignment
      abTestManager.trackEvent(testId, assignedVariant.id, 'variant_assigned');
      analyticsTrackEvent('ab_test_variant_assigned', {
        test_id: testId,
        variant_id: assignedVariant.id,
        variant_name: assignedVariant.name,
        features: assignedVariant.features
      });
    }
  }, [testId, userId]);

  const trackEvent = (eventName: string, data?: any) => {
    if (variant) {
      abTestManager.trackEvent(testId, variant.id, eventName, data);
      analyticsTrackEvent('ab_test_event', {
        test_id: testId,
        variant_id: variant.id,
        event_name: eventName,
        event_data: data
      });
    }
  };

  return {
    variant,
    isLoading,
    trackEvent
  };
}

// Hook for feature flags based on A/B test variants
export function useFeatureFlag(testId: string, featureName: string, userId?: string): boolean {
  const { variant } = useABTest(testId, userId);
  return variant?.features.includes(featureName) || false;
}

// Hook for getting variant configuration
export function useVariantConfig(testId: string, userId?: string): any {
  const { variant } = useABTest(testId, userId);
  return variant?.config || {};
}

// Hook for conversion tracking
export function useConversionTracking(testId: string, userId?: string) {
  const { trackEvent } = useABTest(testId, userId);

  const trackConversion = (conversionType: string, value?: number, metadata?: any) => {
    trackEvent('conversion', {
      conversion_type: conversionType,
      value: value,
      metadata: metadata,
      timestamp: Date.now()
    });
  };

  const trackPageView = (pageName: string) => {
    trackEvent('page_view', {
      page_name: pageName,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : ''
    });
  };

  const trackInteraction = (element: string, action: string, value?: any) => {
    trackEvent('interaction', {
      element: element,
      action: action,
      value: value,
      timestamp: Date.now()
    });
  };

  const trackFormSubmission = (formName: string, formData?: any) => {
    trackEvent('form_submission', {
      form_name: formName,
      form_data: formData,
      timestamp: Date.now()
    });
  };

  return {
    trackConversion,
    trackPageView,
    trackInteraction,
    trackFormSubmission
  };
}

export default useABTest;
