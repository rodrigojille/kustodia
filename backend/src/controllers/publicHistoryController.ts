import { Request, Response } from 'express';
import assetNFTService from '../services/assetNFTService';

/**
 * Public Vehicle History Controller
 * Provides public access to vehicle history for transparency and trust building
 */

/**
 * Get public vehicle history by token ID
 * @route GET /api/public/vehicle/:tokenId/history
 */
export const getPublicVehicleHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tokenId } = req.params;

    if (!tokenId) {
      res.status(400).json({ error: 'Token ID is required' });
      return;
    }

    // Validate token ID format and value
    const tokenIdNum = parseInt(tokenId);
    if (isNaN(tokenIdNum) || tokenIdNum < 0) {
      res.status(400).json({ 
        error: 'Invalid token ID',
        details: 'Token ID must be a positive integer greater than or equal to 0',
        publicAccess: true
      });
      return;
    }

    console.log('[Public History] Getting public vehicle history for token:', tokenId);

    // Get enhanced asset history
    const historyData: any = await assetNFTService.getAssetHistory(tokenId);
    
    // Get basic vehicle metadata (without sensitive owner info)
    const metadata = await assetNFTService.getAssetMetadata(tokenId);
    
    // Create public-safe vehicle info
    const publicVehicleInfo = {
      tokenId,
      make: metadata.metadata?.make || 'No especificado',
      model: metadata.metadata?.model || 'No especificado', 
      year: metadata.metadata?.year || 'No especificado',
      color: metadata.metadata?.color || 'No especificado',
      fuelType: metadata.metadata?.fuelType || 'No especificado',
      // Don't expose VIN, owner address, or other sensitive data
      isVerified: metadata.metadata ? true : false,
      contractAddress: process.env.UNIVERSAL_ASSET_CONTRACT_ADDRESS,
      blockchain: 'Arbitrum Sepolia',
      verificationUrl: `https://sepolia.arbiscan.io/token/${process.env.UNIVERSAL_ASSET_CONTRACT_ADDRESS}?a=${tokenId}`
    };

    // Create public response
    const publicResponse = {
      success: true,
      vehicle: publicVehicleInfo,
      history: historyData,
      publicAccess: true,
      disclaimer: 'Esta información es pública y verificable en blockchain. Los datos sensibles como VIN y propietario están protegidos.',
      lastUpdated: new Date().toISOString(),
      trustIndicators: {
        blockchainVerified: true,
        kustodiaVerified: historyData.verificationStatus?.percentage >= 80,
        totalVerifications: historyData.verificationStatus?.verifiedEvents || 0,
        riskLevel: historyData.summary?.riskFactors?.length > 0 ? 'Medium' : 'Low'
      }
    };

    res.json(publicResponse);

  } catch (error) {
    console.error('[Public History] Error getting public vehicle history:', error);
    res.status(500).json({ 
      error: 'Failed to get vehicle history',
      details: error instanceof Error ? error.message : 'Unknown error',
      publicAccess: true
    });
  }
};

/**
 * Get public vehicle summary (lightweight version)
 * @route GET /api/public/vehicle/:tokenId/summary
 */
export const getPublicVehicleSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tokenId } = req.params;

    if (!tokenId) {
      res.status(400).json({ error: 'Token ID is required' });
      return;
    }

    console.log('[Public History] Getting public vehicle summary for token:', tokenId);

    // Get basic metadata and history summary
    const metadata = await assetNFTService.getAssetMetadata(tokenId);
    const historyData: any = await assetNFTService.getAssetHistory(tokenId);

    const summary = {
      success: true,
      tokenId,
      vehicle: {
        make: metadata.metadata?.make || 'No especificado',
        model: metadata.metadata?.model || 'No especificado',
        year: metadata.metadata?.year || 'No especificado',
        displayName: `${metadata.metadata?.year || ''} ${metadata.metadata?.make || ''} ${metadata.metadata?.model || ''}`.trim()
      },
      stats: {
        totalEvents: historyData.summary?.totalEvents || 0,
        lastMaintenance: historyData.summary?.lastMaintenance,
        verificationScore: historyData.verificationStatus?.percentage || 0,
        trustLevel: historyData.verificationStatus?.status || 'No evaluado',
        hasRecentActivity: historyData.summary?.hasRecentActivity || false,
        riskFactors: historyData.summary?.riskFactors?.length || 0
      },
      blockchain: {
        network: 'Arbitrum Sepolia',
        contractAddress: process.env.UNIVERSAL_ASSET_CONTRACT_ADDRESS,
        verified: true
      },
      publicAccess: true
    };

    res.json(summary);

  } catch (error) {
    console.error('[Public History] Error getting public vehicle summary:', error);
    res.status(500).json({ 
      error: 'Failed to get vehicle summary',
      details: error instanceof Error ? error.message : 'Unknown error',
      publicAccess: true
    });
  }
};

/**
 * Get verification certificate for a vehicle
 * @route GET /api/public/vehicle/:tokenId/certificate
 */
export const getVehicleVerificationCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tokenId } = req.params;

    if (!tokenId) {
      res.status(400).json({ error: 'Token ID is required' });
      return;
    }

    console.log('[Public History] Generating verification certificate for token:', tokenId);

    const metadata = await assetNFTService.getAssetMetadata(tokenId);
    const historyData: any = await assetNFTService.getAssetHistory(tokenId);

    const certificate = {
      success: true,
      certificate: {
        tokenId,
        vehicleInfo: {
          make: metadata.metadata?.make || 'No especificado',
          model: metadata.metadata?.model || 'No especificado',
          year: metadata.metadata?.year || 'No especificado',
          displayName: `${metadata.metadata?.year || ''} ${metadata.metadata?.make || ''} ${metadata.metadata?.model || ''}`.trim()
        },
        verification: {
          status: historyData.verificationStatus?.status || 'No verificado',
          percentage: historyData.verificationStatus?.percentage || 0,
          verifiedEvents: historyData.verificationStatus?.verifiedEvents || 0,
          totalEvents: historyData.verificationStatus?.totalEvents || 0,
          trustScore: historyData.summary?.averageTrustScore || 0
        },
        blockchain: {
          network: 'Arbitrum Sepolia',
          contractAddress: process.env.UNIVERSAL_ASSET_CONTRACT_ADDRESS,
          tokenStandard: 'ERC-721',
          verified: true
        },
        issuer: {
          name: 'Kustodia',
          website: 'https://kustodia.mx',
          description: 'Plataforma de custodia y verificación de activos digitales'
        },
        issuedAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Valid for 1 year
        certificateId: `KUS-${tokenId}-${Date.now()}`,
        qrCode: `https://kustodia.mx/verify/${tokenId}`,
        disclaimer: 'Este certificado verifica la autenticidad del registro blockchain del vehículo. La información está sujeta a actualizaciones en tiempo real.'
      }
    };

    res.json(certificate);

  } catch (error) {
    console.error('[Public History] Error generating verification certificate:', error);
    res.status(500).json({ 
      error: 'Failed to generate certificate',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Search public vehicles by make/model/year
 * @route GET /api/public/vehicles/search
 */
export const searchPublicVehicles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { make, model, year, limit = 10 } = req.query;

    console.log('[Public History] Searching public vehicles:', { make, model, year, limit });

    // This would need to be implemented with a proper search index
    // For now, return a placeholder response
    const searchResults = {
      success: true,
      query: { make, model, year },
      results: [],
      total: 0,
      message: 'Búsqueda de vehículos públicos - Funcionalidad en desarrollo',
      publicAccess: true
    };

    res.json(searchResults);

  } catch (error) {
    console.error('[Public History] Error searching public vehicles:', error);
    res.status(500).json({ 
      error: 'Failed to search vehicles',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
