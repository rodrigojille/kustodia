'use client';
import { useEffect, useRef } from 'react';
import { useAnalyticsContext } from './AnalyticsProvider';

interface EnhancedAnalyticsProps {
  pageName: string;
  variant: string;
  features: string[];
  vertical: string;
}

interface InteractionEvent {
  element: string;
  action: string;
  value?: string | number;
  timestamp: number;
  scrollPosition: number;
  timeOnPage: number;
}

export default function EnhancedAnalytics({ 
  pageName, 
  variant, 
  features, 
  vertical 
}: EnhancedAnalyticsProps) {
  const { trackEvent, trackUserAction } = useAnalyticsContext();
  const startTime = useRef(Date.now());
  const interactions = useRef<InteractionEvent[]>([]);
  const scrollDepth = useRef(0);
  const maxScrollDepth = useRef(0);

  // Track page load and variant
  useEffect(() => {
    trackEvent('enhanced_page_loaded', {
      page_name: pageName,
      variant: variant,
      features: features,
      vertical: vertical,
      load_time: Date.now(),
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`
    });

    // Track time on page when user leaves
    const handleBeforeUnload = () => {
      const timeOnPage = Date.now() - startTime.current;
      trackEvent('enhanced_page_exit', {
        page_name: pageName,
        variant: variant,
        time_on_page: timeOnPage,
        max_scroll_depth: maxScrollDepth.current,
        total_interactions: interactions.current.length,
        interactions: interactions.current.slice(-10) // Last 10 interactions
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pageName, variant, features, vertical]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      scrollDepth.current = scrollPercent;
      if (scrollPercent > maxScrollDepth.current) {
        maxScrollDepth.current = scrollPercent;
        
        // Track milestone scroll depths
        if ([25, 50, 75, 90].includes(scrollPercent)) {
          trackUserAction('scroll_milestone', {
            page_name: pageName,
            variant: variant,
            scroll_depth: scrollPercent,
            time_to_reach: Date.now() - startTime.current
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pageName, variant]);

  // Track clicks and interactions
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const element = target.closest('[data-analytics]') || target;
      const elementName = element.getAttribute('data-analytics') || 
                         element.tagName.toLowerCase() + 
                         (element.className ? `.${element.className.split(' ')[0]}` : '');

      const interaction: InteractionEvent = {
        element: elementName,
        action: 'click',
        timestamp: Date.now(),
        scrollPosition: scrollDepth.current,
        timeOnPage: Date.now() - startTime.current
      };

      interactions.current.push(interaction);

      trackUserAction('element_clicked', {
        page_name: pageName,
        variant: variant,
        element: elementName,
        time_on_page: interaction.timeOnPage,
        scroll_position: interaction.scrollPosition
      });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pageName, variant]);

  // Track form interactions
  useEffect(() => {
    const handleFormInteraction = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
        const interaction: InteractionEvent = {
          element: `form.${target.name || target.id || target.type}`,
          action: event.type,
          value: target.type === 'number' ? parseFloat(target.value) || 0 : target.value,
          timestamp: Date.now(),
          scrollPosition: scrollDepth.current,
          timeOnPage: Date.now() - startTime.current
        };

        interactions.current.push(interaction);

        trackUserAction('form_interaction', {
          page_name: pageName,
          variant: variant,
          field: target.name || target.id || target.type,
          action: event.type,
          value: interaction.value,
          time_on_page: interaction.timeOnPage
        });
      }
    };

    document.addEventListener('input', handleFormInteraction);
    document.addEventListener('change', handleFormInteraction);
    document.addEventListener('focus', handleFormInteraction);
    
    return () => {
      document.removeEventListener('input', handleFormInteraction);
      document.removeEventListener('change', handleFormInteraction);
      document.removeEventListener('focus', handleFormInteraction);
    };
  }, [pageName, variant]);

  return null; // This component doesn't render anything
}

// Hook for tracking specific conversion events
export function useConversionTracking(pageName: string, variant: string) {
  const { trackEvent } = useAnalyticsContext();

  const trackCalculatorUsage = (calculatorData: any) => {
    trackEvent('calculator_conversion', {
      page_name: pageName,
      variant: variant,
      property_value: calculatorData.propertyValue,
      escrow_amount: calculatorData.escrowAmount,
      escrow_percentage: calculatorData.escrowPercentage,
      conversion_type: 'calculator_completion',
      engagement_level: 'high'
    });
  };

  const trackDocumentUpload = (documentType: string, step: number) => {
    trackEvent('document_upload_conversion', {
      page_name: pageName,
      variant: variant,
      document_type: documentType,
      upload_step: step,
      conversion_type: 'document_interaction',
      engagement_level: 'very_high'
    });
  };

  const trackDisputeEngagement = (step: number) => {
    trackEvent('dispute_preview_engagement', {
      page_name: pageName,
      variant: variant,
      dispute_step: step,
      conversion_type: 'dispute_understanding',
      engagement_level: 'medium'
    });
  };

  const trackCTAClick = (ctaType: string, additionalData?: any) => {
    trackEvent('cta_conversion', {
      page_name: pageName,
      variant: variant,
      cta_type: ctaType,
      conversion_type: 'signup_intent',
      engagement_level: 'very_high',
      ...additionalData
    });
  };

  return {
    trackCalculatorUsage,
    trackDocumentUpload,
    trackDisputeEngagement,
    trackCTAClick
  };
}

// Component for A/B testing infrastructure
interface ABTestProps {
  testName: string;
  variants: string[];
  children: (variant: string) => React.ReactNode;
}

export function ABTest({ testName, variants, children }: ABTestProps) {
  const { trackEvent } = useAnalyticsContext();
  
  // Simple hash-based variant assignment (in production, use proper A/B testing service)
  const getVariant = () => {
    const hash = Array.from(testName).reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const index = Math.abs(hash) % variants.length;
    return variants[index];
  };

  const variant = getVariant();

  useEffect(() => {
    trackEvent('ab_test_assignment', {
      test_name: testName,
      variant: variant,
      available_variants: variants
    });
  }, [testName, variant, variants]);

  return <>{children(variant)}</>;
}
