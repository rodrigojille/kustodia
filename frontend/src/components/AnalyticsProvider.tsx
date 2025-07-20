/**
 * Comprehensive Analytics Provider for Kustodia
 * Tracks complete customer journey from landing to payment completion
 * Based on Reddit scraper insights: SPEI fraud, service contracts, real estate focus
 */

'use client';

import React, { createContext, useContext, useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import useAnalytics from '../hooks/useAnalytics';

interface AnalyticsContextType {
  trackEvent: (eventName: string, properties?: any) => void;
  trackPageView: (pageName: string, properties?: any) => void;
  trackUserAction: (action: string, properties?: any) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

function AnalyticsProviderCore({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const analytics = useAnalytics();

  // Comprehensive page tracking with customer journey mapping
  useEffect(() => {
    const currentUrl = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    // Determine page category and user intent
    const pageAnalysis = analyzePageForCustomerJourney(pathname, searchParams);
    
    // Track page view with enhanced context
    analytics.track({
      event_name: 'page_view',
      category: 'engagement',
      properties: {
        page_url: currentUrl,
        page_title: document.title,
        page_category: pageAnalysis.category,
        customer_journey_stage: pageAnalysis.journeyStage,
        fraud_focus_category: pageAnalysis.fraudCategory,
        business_value: pageAnalysis.businessValue,
        mexican_market: true, // Kustodia focus
        referrer: document.referrer || undefined,
        user_agent: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        mobile_device: window.innerWidth < 768
      }
    });

    // Track specific page interactions based on customer journey
    trackPageSpecificEvents(pageAnalysis);

  }, [pathname, searchParams, analytics]);

  // Analyze page for customer journey and business context
  const analyzePageForCustomerJourney = (path: string, params: URLSearchParams) => {
    const analysis = {
      category: 'general',
      journeyStage: 'awareness',
      fraudCategory: null as string | null,
      businessValue: 'low'
    };

    // Landing and marketing pages
    if (path === '/') {
      analysis.category = 'landing';
      analysis.journeyStage = 'awareness';
      analysis.businessValue = 'high';
    }
    
    // Authentication flow
    else if (['/login', '/register', '/verify-email', '/reset-password'].includes(path)) {
      analysis.category = 'authentication';
      analysis.journeyStage = 'consideration';
      analysis.businessValue = 'high';
    }
    
    // Industry-specific pages (based on Reddit scraper top categories)
    else if (path.includes('inmobiliarias') || path.includes('compra-venta')) {
      analysis.category = 'industry_solution';
      analysis.journeyStage = 'consideration';
      analysis.fraudCategory = 'real_estate';  // Top category from scraper (56 posts)
      analysis.businessValue = 'very_high';
    }
    else if (path.includes('freelancer')) {
      analysis.category = 'industry_solution';
      analysis.journeyStage = 'consideration';
      analysis.fraudCategory = 'service_contracts';  // New category from scraper (21 posts)
      analysis.businessValue = 'high';
    }
    else if (path.includes('marketplaces') || path.includes('ecommerce')) {
      analysis.category = 'industry_solution';
      analysis.journeyStage = 'consideration';
      analysis.fraudCategory = 'online_marketplace';
      analysis.businessValue = 'high';
    }
    else if (path.includes('b2b')) {
      analysis.category = 'industry_solution';
      analysis.journeyStage = 'consideration';
      analysis.fraudCategory = 'spei_banking';  // New category targeting Mexican businesses
      analysis.businessValue = 'very_high';
    }

    // Blog content (educational - zero escrow awareness opportunity)
    else if (path.includes('blog')) {
      analysis.category = 'educational_content';
      analysis.journeyStage = 'awareness';
      analysis.businessValue = 'medium';
      
      // Specific fraud categories from blog URL
      if (path.includes('inmobiliarias')) analysis.fraudCategory = 'real_estate';
      else if (path.includes('freelancer')) analysis.fraudCategory = 'service_contracts';
      else if (path.includes('marketplace')) analysis.fraudCategory = 'online_marketplace';
      else if (path.includes('b2b')) analysis.fraudCategory = 'spei_banking';
    }

    // Dashboard and payment flow
    else if (path.includes('dashboard')) {
      analysis.category = 'platform_usage';
      analysis.journeyStage = 'retention';
      analysis.businessValue = 'very_high';
      
      // Payment creation flow
      if (path.includes('nuevo-flujo') || path.includes('crear-pago') || path.includes('pagos/nuevo')) {
        analysis.category = 'payment_creation';
        analysis.journeyStage = 'trial';
        analysis.businessValue = 'very_high';
      }
      // Active payment management
      else if (path.includes('pagos/') && path !== '/dashboard/pagos') {
        analysis.category = 'payment_management';
        analysis.journeyStage = 'purchase';
        analysis.businessValue = 'very_high';
      }
    }

    // Legal and compliance
    else if (['/terminos', '/privacidad', '/cookies', '/riesgos', '/seguridad'].includes(path)) {
      analysis.category = 'legal_compliance';
      analysis.journeyStage = 'consideration';
      analysis.businessValue = 'medium';
    }

    return analysis;
  };

  // Track page-specific events for customer journey optimization
  const trackPageSpecificEvents = (pageAnalysis: any) => {
    const { category, journeyStage, fraudCategory, businessValue } = pageAnalysis;

    // High-value page entry tracking
    if (businessValue === 'very_high') {
      analytics.track({
        event_name: 'high_value_page_entry',
        category: 'conversion',
        properties: {
          page_category: category,
          journey_stage: journeyStage,
          fraud_focus: fraudCategory,
          potential_revenue: category === 'payment_creation' ? 'high' : 'medium'
        }
      });
    }

    // Industry solution interest (based on scraper insights)
    if (category === 'industry_solution' && fraudCategory) {
      analytics.fraudPrevention.trackFraudPrevention(fraudCategory, 'solution_page_visit', {
        user_intent: 'seeking_solutions',  // Primary intent from scraper analysis
        engagement_level: 'high'
      });
    }

    // Educational content engagement (zero escrow awareness opportunity)
    if (category === 'educational_content') {
      analytics.fraudPrevention.trackEscrowEducation('blog_content', 'view');
    }

    // Payment flow entry tracking
    if (category === 'payment_creation') {
      analytics.paymentFlow.trackPaymentStep('start', {
        transaction_type: fraudCategory || 'general',
        source_page: pathname
      });
    }
  };

  // Context methods for components to use
  const contextValue: AnalyticsContextType = {
    trackEvent: (eventName: string, properties?: any) => {
      analytics.track({
        event_name: eventName,
        category: 'engagement',
        properties: properties || {}
      });
    },

    trackPageView: (pageName: string, properties?: any) => {
      analytics.track({
        event_name: 'manual_page_view',
        category: 'engagement',
        properties: {
          page_name: pageName,
          ...properties
        }
      });
    },

    trackUserAction: (action: string, properties?: any) => {
      analytics.track({
        event_name: 'user_action',
        category: 'engagement',
        properties: {
          action_type: action,
          ...properties
        }
      });
    }
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// Wrapper component with Suspense boundary
export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnalyticsProviderCore>{children}</AnalyticsProviderCore>
    </Suspense>
  );
}
