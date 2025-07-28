import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../authenticateJWT';
import assetIntegrationService, { AssetCreationRequest, AssetTransferRequest, ServiceProviderUpdate } from '../services/assetMarketplaceService';

/**
 * Utility function to safely serialize objects containing BigInt values
 */
const serializeBigInt = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }));
};

/**
 * Create NFT for seller before listing on marketplace
 */
export const createAssetForMarketplace = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { assetType, assetData, intendedMarketplace } = req.body;

    if (!assetType || !assetData) {
      res.status(400).json({ error: 'Missing required fields: assetType, assetData' });
      return;
    }

    const request: AssetCreationRequest = {
      userId,
      assetType,
      assetData,
      intendedMarketplace
    };

    const result = await assetIntegrationService.createAssetNFT(request);

    console.log('[Integration Controller] Asset NFT created for marketplace:', result);

    // Convert BigInt tokenId to string for JSON serialization
    let tokenIdString: string;
    if (result.tokenId != null && typeof result.tokenId === 'bigint') {
      tokenIdString = (result.tokenId as bigint).toString();
    } else {
      tokenIdString = String(result.tokenId || '0');
    }

    res.json({
      success: true,
      tokenId: tokenIdString,
      transactionHash: result.transactionHash,
      marketplaceReady: result.marketplaceReady,
      message: `${assetType} NFT created and ready for marketplace listing`
    });

  } catch (error) {
    console.error('[Integration Controller] Error creating asset for marketplace:', error);
    res.status(500).json({ 
      error: 'Failed to create asset NFT',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Transfer asset when payment is completed (called by payment webhook)
 */
export const transferAssetOnPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tokenId, fromAddress, toAddress, salePrice, paymentId, marketplace } = req.body;

    if (!tokenId || !fromAddress || !toAddress || !salePrice || !paymentId) {
      res.status(400).json({ 
        error: 'Missing required fields: tokenId, fromAddress, toAddress, salePrice, paymentId' 
      });
      return;
    }

    const request: AssetTransferRequest = {
      tokenId,
      fromAddress,
      toAddress,
      salePrice,
      paymentId,
      marketplace
    };

    const result = await assetIntegrationService.transferAssetOnPayment(request);

    res.json({
      success: result.success,
      transactionHash: result.transactionHash,
      message: 'Asset transferred successfully'
    });

  } catch (error) {
    console.error('[Integration Controller] Error transferring asset:', error);
    res.status(500).json({ 
      error: 'Failed to transfer asset',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get asset metadata for marketplace integration
 */
export const getAssetForMarketplace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tokenId } = req.params;

    if (!tokenId) {
      res.status(400).json({ error: 'Token ID is required' });
      return;
    }

    const assetData = await assetIntegrationService.getAssetForMarketplace(tokenId);
    const serializedAssetData = serializeBigInt(assetData);

    res.json({
      success: true,
      asset: serializedAssetData
    });

  } catch (error) {
    console.error('[Integration Controller] Error getting asset for marketplace:', error);
    res.status(500).json({ 
      error: 'Failed to get asset data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Generate marketplace integration data (OpenSea compatible)
 */
export const generateMarketplaceData = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('[Integration Controller] Generating marketplace data for token ID:', req.params.tokenId);
    
    const { tokenId } = req.params;

    if (!tokenId) {
      res.status(400).json({ error: 'Token ID is required' });
      return;
    }

    const marketplaceData = await assetIntegrationService.generateMarketplaceData(tokenId);
    console.log('[Integration Controller] Found marketplace data:', marketplaceData);

    const serializedData = serializeBigInt(marketplaceData);
    console.log('[Integration Controller] Returning serialized marketplace data:', serializedData);

    res.json({
      success: true,
      marketplaceData: serializedData
    });

  } catch (error) {
    console.error('[Integration Controller] Error generating marketplace data:', error);
    res.status(500).json({ 
      error: 'Failed to generate marketplace data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update asset record (for service providers like dealerships, contractors)
 */
export const updateAssetRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Get tokenId from URL params or request body
    const tokenIdFromParams = req.params.tokenId;
    const { 
      tokenId: tokenIdFromBody, 
      updateType, 
      providerType, 
      updateData, 
      supportingDocs,
      // Spanish field names from frontend
      tipoActualizacion,
      tipoProveedor,
      detallesServicio,
      documentosSoporte
    } = req.body;
    
    const tokenId = tokenIdFromParams || tokenIdFromBody;
    
    // Use Spanish fields if English ones are not provided
    const finalUpdateType = updateType || tipoActualizacion;
    const finalProviderType = providerType || tipoProveedor;
    const finalUpdateData = updateData || detallesServicio;
    const finalSupportingDocs = supportingDocs || documentosSoporte;

    if (!tokenId || !finalUpdateType || !finalProviderType || !finalUpdateData) {
      res.status(400).json({ 
        error: 'Missing required fields: tokenId, updateType/tipoActualizacion, providerType/tipoProveedor, updateData/detallesServicio' 
      });
      return;
    }

    const request: ServiceProviderUpdate = {
      tokenId,
      updateType: finalUpdateType,
      providerType: finalProviderType,
      updateData: finalUpdateData,
      supportingDocs: finalSupportingDocs
    };

    const result = await assetIntegrationService.updateAssetRecord(request);

    res.json({
      success: result.updated,
      transactionHash: result.transactionHash,
      message: `Asset ${updateType} record updated successfully`
    });

  } catch (error) {
    console.error('[Integration Controller] Error updating asset record:', error);
    res.status(500).json({ 
      error: 'Failed to update asset record',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get user's assets from blockchain
 */
export const getUserAssets = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    console.log('[Integration Controller] Getting user assets for user:', authReq.user?.id);
    
    if (!authReq.user?.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const assets = await assetIntegrationService.getUserAssets(authReq.user.id.toString());
    console.log('[Integration Controller] Found assets:', assets?.length || 0);

    // Serialize BigInt values to strings for JSON response
    const serializedAssets = assets?.map(asset => ({
      ...asset,
      tokenId: asset.tokenId.toString()
    })) || [];

    console.log('[Integration Controller] Returning serialized assets:', serializedAssets.length);

    res.json({
      success: true,
      assets: serializedAssets
    });

  } catch (error) {
    console.error('[Integration Controller] Error getting user assets:', error);
    res.status(500).json({ 
      error: 'Failed to get user assets',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Webhook handler for marketplace sales (OpenSea, etc.)
 */
export const handleMarketplaceSaleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tokenId, fromAddress, toAddress, salePrice, marketplace, transactionHash } = req.body;

    if (!tokenId || !fromAddress || !toAddress || !salePrice || !marketplace || !transactionHash) {
      res.status(400).json({ 
        error: 'Missing required webhook data' 
      });
      return;
    }

    const success = await assetIntegrationService.handleMarketplaceSale({
      tokenId,
      fromAddress,
      toAddress,
      salePrice,
      marketplace,
      transactionHash
    });

    res.json({
      success,
      message: 'Marketplace sale processed'
    });

  } catch (error) {
    console.error('[Integration Controller] Error handling marketplace sale webhook:', error);
    res.status(500).json({ 
      error: 'Failed to process marketplace sale',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
