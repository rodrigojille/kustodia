export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  weight: number; // Percentage of traffic (0-100)
  features: string[];
  config: any;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  targetMetrics: string[];
  variants: ABTestVariant[];
  targetAudience?: {
    vertical?: string[];
    userType?: string[];
    trafficSource?: string[];
  };
}

export const AB_TESTS: ABTest[] = [
  {
    id: 'real_estate_landing_v1',
    name: 'Real Estate Landing Page Optimization',
    description: 'Test different approaches to showcase payment control and dispute resolution',
    status: 'active',
    startDate: '2024-01-22',
    endDate: '2024-02-22',
    targetMetrics: ['conversion_rate', 'signup_rate', 'calculator_usage', 'time_on_page'],
    variants: [
      {
        id: 'control',
        name: 'Original Page',
        description: 'Current inmobiliarias page with basic information',
        weight: 25,
        features: ['basic_info', 'benefits_list', 'faq'],
        config: {
          showCalculator: false,
          showDocumentUpload: false,
          showDisputePreview: false,
          ctaText: 'Ver cómo funciona'
        }
      },
      {
        id: 'calculator_focus',
        name: 'Calculator-First Approach',
        description: 'Emphasize immediate CLABE generation and payment calculation',
        weight: 25,
        features: ['interactive_calculator', 'clabe_generation', 'benefits_list'],
        config: {
          showCalculator: true,
          showDocumentUpload: false,
          showDisputePreview: false,
          ctaText: 'Crear Mi Pago Seguro',
          calculatorPosition: 'hero'
        }
      },
      {
        id: 'trust_focus',
        name: 'Trust & Dispute Resolution Focus',
        description: 'Highlight dispute resolution and AI-powered trust mechanisms',
        weight: 25,
        features: ['dispute_preview', 'ai_resolution', 'trust_indicators'],
        config: {
          showCalculator: false,
          showDocumentUpload: false,
          showDisputePreview: true,
          ctaText: 'Proteger Mi Transacción',
          trustBadges: true
        }
      },
      {
        id: 'full_experience',
        name: 'Complete Experience Preview',
        description: 'Show calculator, document upload, and dispute resolution',
        weight: 25,
        features: ['interactive_calculator', 'document_upload_preview', 'dispute_preview', 'ai_resolution'],
        config: {
          showCalculator: true,
          showDocumentUpload: true,
          showDisputePreview: true,
          ctaText: 'Comenzar Proceso Completo',
          progressIndicator: true
        }
      }
    ],
    targetAudience: {
      vertical: ['real_estate', 'inmobiliarias'],
      userType: ['new_visitor', 'returning_visitor'],
      trafficSource: ['organic', 'paid', 'referral']
    }
  },
  {
    id: 'document_integration_v1',
    name: 'Document Integration Landing Pages',
    description: 'Test document upload integration during payment creation',
    status: 'draft',
    startDate: '2024-02-01',
    endDate: '2024-03-01',
    targetMetrics: ['document_upload_rate', 'conversion_rate', 'trust_score'],
    variants: [
      {
        id: 'no_documents',
        name: 'Standard Payment Flow',
        description: 'Traditional payment creation without document requirements',
        weight: 50,
        features: ['standard_payment', 'basic_verification'],
        config: {
          requireDocuments: false,
          documentPreview: false
        }
      },
      {
        id: 'progressive_documents',
        name: 'Progressive Document Integration',
        description: 'Optional document upload with incentives',
        weight: 50,
        features: ['progressive_upload', 'document_incentives', 'verification_preview'],
        config: {
          requireDocuments: false,
          documentPreview: true,
          incentives: ['reduced_fees', 'faster_processing', 'higher_limits']
        }
      }
    ]
  },
  {
    id: 'vertical_specific_v1',
    name: 'Vertical-Specific Landing Pages',
    description: 'Test industry-specific messaging and features',
    status: 'draft',
    startDate: '2024-02-15',
    endDate: '2024-03-15',
    targetMetrics: ['vertical_conversion', 'feature_adoption', 'user_satisfaction'],
    variants: [
      {
        id: 'generic_approach',
        name: 'Generic Messaging',
        description: 'One-size-fits-all approach across verticals',
        weight: 33,
        features: ['generic_benefits', 'universal_features'],
        config: {
          messaging: 'generic',
          features: 'universal'
        }
      },
      {
        id: 'vertical_specific',
        name: 'Industry-Specific Messaging',
        description: 'Tailored messaging and features per vertical',
        weight: 33,
        features: ['vertical_messaging', 'industry_features', 'specific_use_cases'],
        config: {
          messaging: 'vertical_specific',
          features: 'industry_tailored'
        }
      },
      {
        id: 'adaptive_approach',
        name: 'AI-Adaptive Messaging',
        description: 'Dynamic content based on user behavior and vertical',
        weight: 34,
        features: ['ai_messaging', 'behavioral_adaptation', 'dynamic_features'],
        config: {
          messaging: 'ai_adaptive',
          features: 'behavior_based'
        }
      }
    ]
  }
];

export const CONVERSION_EVENTS = [
  'page_loaded',
  'calculator_used',
  'document_uploaded',
  'dispute_preview_viewed',
  'cta_clicked',
  'signup_completed',
  'payment_created',
  'verification_completed'
];

export const SUCCESS_METRICS = {
  primary: [
    {
      name: 'conversion_rate',
      description: 'Percentage of visitors who sign up',
      target: 0.05, // 5%
      calculation: 'signups / page_views'
    },
    {
      name: 'calculator_usage_rate',
      description: 'Percentage of visitors who use the calculator',
      target: 0.15, // 15%
      calculation: 'calculator_uses / page_views'
    }
  ],
  secondary: [
    {
      name: 'time_on_page',
      description: 'Average time spent on page (seconds)',
      target: 120, // 2 minutes
      calculation: 'sum(time_on_page) / page_views'
    },
    {
      name: 'scroll_depth',
      description: 'Average maximum scroll depth',
      target: 75, // 75%
      calculation: 'sum(max_scroll_depth) / page_views'
    },
    {
      name: 'feature_engagement',
      description: 'Percentage of users who interact with key features',
      target: 0.25, // 25%
      calculation: 'feature_interactions / page_views'
    }
  ]
};

// Utility functions for A/B testing
export class ABTestManager {
  private static instance: ABTestManager;
  
  static getInstance(): ABTestManager {
    if (!ABTestManager.instance) {
      ABTestManager.instance = new ABTestManager();
    }
    return ABTestManager.instance;
  }

  getActiveTests(): ABTest[] {
    return AB_TESTS.filter(test => test.status === 'active');
  }

  getTestForPage(pageName: string): ABTest | null {
    return AB_TESTS.find(test => 
      test.status === 'active' && 
      test.id.includes(pageName.toLowerCase())
    ) || null;
  }

  assignVariant(testId: string, userId?: string): ABTestVariant | null {
    const test = AB_TESTS.find(t => t.id === testId);
    if (!test || test.status !== 'active') return null;

    // Use consistent assignment based on user ID or session
    const seed = userId || this.getSessionId();
    const hash = this.hashString(seed + testId);
    const randomValue = Math.abs(hash) % 100;

    let cumulativeWeight = 0;
    for (const variant of test.variants) {
      cumulativeWeight += variant.weight;
      if (randomValue < cumulativeWeight) {
        return variant;
      }
    }

    return test.variants[0]; // Fallback to first variant
  }

  trackEvent(testId: string, variantId: string, event: string, data?: any): void {
    const eventData = {
      test_id: testId,
      variant_id: variantId,
      event_name: event,
      timestamp: Date.now(),
      data: data || {}
    };

    // Store in localStorage for now (in production, send to analytics service)
    const key = `ab_test_events_${testId}`;
    const events = JSON.parse(localStorage.getItem(key) || '[]');
    events.push(eventData);
    localStorage.setItem(key, JSON.stringify(events));

    console.log('AB Test Event:', eventData);
  }

  getTestResults(testId: string): any {
    const key = `ab_test_events_${testId}`;
    const events = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Group events by variant
    const variantResults: { [key: string]: any } = {};
    
    events.forEach((event: any) => {
      if (!variantResults[event.variant_id]) {
        variantResults[event.variant_id] = {
          variant_id: event.variant_id,
          total_events: 0,
          events_by_type: {},
          conversion_rate: 0
        };
      }
      
      variantResults[event.variant_id].total_events++;
      variantResults[event.variant_id].events_by_type[event.event_name] = 
        (variantResults[event.variant_id].events_by_type[event.event_name] || 0) + 1;
    });

    // Calculate conversion rates
    Object.keys(variantResults).forEach(variantId => {
      const result = variantResults[variantId];
      const pageViews = result.events_by_type['page_loaded'] || 0;
      const conversions = result.events_by_type['signup_completed'] || 0;
      result.conversion_rate = pageViews > 0 ? conversions / pageViews : 0;
    });

    return variantResults;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('ab_test_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('ab_test_session_id', sessionId);
    }
    return sessionId;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }
}

export default ABTestManager;
