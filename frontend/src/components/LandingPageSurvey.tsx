'use client';
import { useEffect, useState } from 'react';
import PostHogSurvey from './PostHogSurvey';
import { useAnalyticsContext } from './AnalyticsProvider';

interface LandingPageSurveyProps {
  vertical: string;
  pageName: string;
  variant?: string;
  triggerAfterSeconds?: number;
  showOnScrollPercentage?: number;
  showOnExit?: boolean;
}

export default function LandingPageSurvey({
  vertical,
  pageName,
  variant = 'default',
  triggerAfterSeconds = 30,
  showOnScrollPercentage = 75,
  showOnExit = true
}: LandingPageSurveyProps) {
  const { trackEvent } = useAnalyticsContext();
  const [showSurvey, setShowSurvey] = useState(false);
  const [hasScrolledEnough, setHasScrolledEnough] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(false);

  // Track time on page
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeElapsed(true);
      trackEvent('survey_time_trigger_reached', {
        vertical,
        page_name: pageName,
        variant,
        trigger_seconds: triggerAfterSeconds
      });
    }, triggerAfterSeconds * 1000);

    return () => clearTimeout(timer);
  }, [triggerAfterSeconds, vertical, pageName, variant, trackEvent]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      if (scrollPercent >= showOnScrollPercentage && !hasScrolledEnough) {
        setHasScrolledEnough(true);
        trackEvent('survey_scroll_trigger_reached', {
          vertical,
          page_name: pageName,
          variant,
          scroll_percentage: scrollPercent
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showOnScrollPercentage, hasScrolledEnough, vertical, pageName, variant, trackEvent]);

  // Show survey when conditions are met
  useEffect(() => {
    if ((timeElapsed || hasScrolledEnough) && !showSurvey) {
      setShowSurvey(true);
      trackEvent('survey_conditions_met', {
        vertical,
        page_name: pageName,
        variant,
        time_elapsed: timeElapsed,
        scroll_reached: hasScrolledEnough
      });
    }
  }, [timeElapsed, hasScrolledEnough, showSurvey, vertical, pageName, variant, trackEvent]);

  // Exit intent detection
  useEffect(() => {
    if (!showOnExit) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !showSurvey) {
        setShowSurvey(true);
        trackEvent('survey_exit_intent_triggered', {
          vertical,
          page_name: pageName,
          variant
        });
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [showOnExit, showSurvey, vertical, pageName, variant, trackEvent]);

  return (
    <>
      {/* Auto-trigger survey based on conditions */}
      {showSurvey && (
        <PostHogSurvey 
          trigger="auto"
          showOnPage={[`/${vertical}`, `/${pageName}`]}
          className="fixed bottom-4 right-4 z-50"
        />
      )}

      {/* Manual trigger button for testing */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-50">
          <PostHogSurvey 
            trigger="manual"
            className="bg-yellow-500 text-black text-xs px-2 py-1 rounded"
          />
        </div>
      )}
    </>
  );
}

// Hook for easy survey integration
export function useLandingPageSurvey(vertical: string, pageName: string, variant?: string) {
  const { trackEvent } = useAnalyticsContext();

  const trackSurveyInteraction = (action: string, data?: any) => {
    trackEvent('survey_interaction', {
      vertical,
      page_name: pageName,
      variant,
      action,
      ...data
    });
  };

  const trackSurveyCompletion = (responses: any) => {
    trackEvent('survey_completed', {
      vertical,
      page_name: pageName,
      variant,
      responses,
      completion_time: Date.now()
    });
  };

  return {
    trackSurveyInteraction,
    trackSurveyCompletion
  };
}

// Survey configuration for different verticals
export const VERTICAL_SURVEY_CONFIG = {
  inmobiliarias: {
    triggerAfterSeconds: 45,
    showOnScrollPercentage: 70,
    showOnExit: true,
    questions: [
      'What is your biggest concern when buying/selling property?',
      'How do you currently handle property deposits?',
      'What would make you trust a new payment platform?'
    ]
  },
  freelancer: {
    triggerAfterSeconds: 30,
    showOnScrollPercentage: 80,
    showOnExit: true,
    questions: [
      'What is your biggest challenge with client payments?',
      'How do you currently protect your work?',
      'What payment features are most important to you?'
    ]
  },
  marketplaces: {
    triggerAfterSeconds: 35,
    showOnScrollPercentage: 75,
    showOnExit: true,
    questions: [
      'What is your main concern with online purchases?',
      'How do you currently handle disputes?',
      'What would increase your confidence in marketplace transactions?'
    ]
  },
  b2b: {
    triggerAfterSeconds: 60,
    showOnScrollPercentage: 85,
    showOnExit: false, // B2B users are more intentional
    questions: [
      'What is your biggest challenge with B2B payments?',
      'How do you currently manage payment terms?',
      'What compliance features are most important?'
    ]
  }
};
