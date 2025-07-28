'use client';

import { useEffect } from 'react';

interface MarketplaceAnalyticsProps {
  vehicleId?: string;
  trustScore?: number;
  verificationStatus?: string;
  eventType?: 'view' | 'interact' | 'convert';
  category?: 'vehicle_history' | 'trust_score' | 'nft_creation' | 'marketplace';
}

export default function MarketplaceAnalytics({
  vehicleId,
  trustScore,
  verificationStatus,
  eventType = 'view',
  category = 'marketplace'
}: MarketplaceAnalyticsProps) {
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      // Track marketplace engagement
      window.gtag('event', 'marketplace_engagement', {
        event_category: category,
        event_label: eventType,
        custom_parameters: {
          vehicle_id: vehicleId || 'unknown',
          trust_score: trustScore || 0,
          verification_status: verificationStatus || 'unverified',
          timestamp: new Date().toISOString()
        }
      });

      // Track trust-focused metrics
      if (trustScore && trustScore > 0) {
        window.gtag('event', 'trust_score_view', {
          event_category: 'Trust Metrics',
          event_label: `Score: ${trustScore}`,
          value: trustScore,
          custom_parameters: {
            score_range: trustScore >= 80 ? 'high' : trustScore >= 60 ? 'medium' : 'low',
            vehicle_id: vehicleId
          }
        });
      }

      // Track verification status engagement
      if (verificationStatus) {
        window.gtag('event', 'verification_status_view', {
          event_category: 'Verification',
          event_label: verificationStatus,
          custom_parameters: {
            vehicle_id: vehicleId,
            is_verified: verificationStatus === 'verified'
          }
        });
      }
    }
  }, [vehicleId, trustScore, verificationStatus, eventType, category]);

  return null; // This is a tracking component, no UI
}

// Helper functions for tracking specific marketplace events
export const trackVehicleView = (vehicleId: string, trustScore: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'vehicle_view', {
      event_category: 'Vehicle Marketplace',
      event_label: `Vehicle ${vehicleId}`,
      value: trustScore,
      custom_parameters: {
        vehicle_id: vehicleId,
        trust_score: trustScore,
        view_timestamp: new Date().toISOString()
      }
    });
  }
};

export const trackTrustScoreInteraction = (vehicleId: string, trustScore: number, action: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'trust_score_interaction', {
      event_category: 'Trust Engagement',
      event_label: action,
      value: trustScore,
      custom_parameters: {
        vehicle_id: vehicleId,
        trust_score: trustScore,
        action: action,
        score_tier: trustScore >= 80 ? 'premium' : trustScore >= 60 ? 'standard' : 'basic'
      }
    });
  }
};

export const trackNFTCreationIntent = (vehicleData: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'nft_creation_intent', {
      event_category: 'NFT Creation',
      event_label: 'User Intent',
      custom_parameters: {
        vehicle_make: vehicleData?.make || 'unknown',
        vehicle_model: vehicleData?.model || 'unknown',
        vehicle_year: vehicleData?.year || 'unknown',
        has_maintenance_history: vehicleData?.hasMaintenanceHistory || false
      }
    });
  }
};

export const trackMarketplaceConversion = (vehicleId: string, conversionType: 'sale_started' | 'nft_created' | 'payment_initiated') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'marketplace_conversion', {
      event_category: 'Conversions',
      event_label: conversionType,
      custom_parameters: {
        vehicle_id: vehicleId,
        conversion_type: conversionType,
        conversion_timestamp: new Date().toISOString()
      }
    });
  }
};
