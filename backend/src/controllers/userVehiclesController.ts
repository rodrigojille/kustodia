import { Request, Response } from 'express';
import assetNFTService from '../services/assetNFTService';

/**
 * Get all vehicles owned by a specific user address
 */
export const getUserVehicles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.query;
    
    console.log('[getUserVehicles] Request received for address:', address);
    
    if (!address || typeof address !== 'string') {
      console.log('[getUserVehicles] Invalid address provided');
      res.status(400).json({
        success: false,
        error: 'User address is required'
      });
      return;
    }

    console.log('[getUserVehicles] Getting NFTs for address:', address);
    // Get all NFTs owned by the user
    const userNFTs = await assetNFTService.getUserAssets(address);
    console.log('[getUserVehicles] Raw NFTs received:', userNFTs);
    
    // Filter only vehicle NFTs and format for frontend
    const vehicles = await Promise.all(
      userNFTs.map(async (nft: any) => {
        try {
          // Get detailed metadata for each NFT
          const fullNftData = await assetNFTService.getAssetMetadata(nft.tokenId);
          console.log('[getUserVehicles] Processing NFT:', nft.tokenId, 'fullNftData:', fullNftData);
          
          // Access the nested metadata object
          const metadata = fullNftData.metadata;
          console.log('[getUserVehicles] Condition check - make:', !!metadata.make, 'model:', !!metadata.model, 'year:', !!metadata.year);
          console.log('[getUserVehicles] Values - make:', metadata.make, 'model:', metadata.model, 'year:', metadata.year);
          
          // Return if it's a vehicle (has make/model/year, VIN is optional)
          if (metadata.make && metadata.model && metadata.year) {
            console.log('[getUserVehicles] Found vehicle NFT:', nft.tokenId, 'VIN:', metadata.vin || 'No VIN');
            return {
              tokenId: nft.tokenId,
              metadata: {
                make: metadata.make || '',
                model: metadata.model || '',
                year: metadata.year || '',
                vin: metadata.vin || null, // Allow null VIN
                currentMileage: metadata.currentMileage || '0',
                color: metadata.color || '',
                plateNumber: metadata.plateNumber || '',
                fuelType: metadata.fuelType || '',
                engineSize: metadata.engineSize || '',
                engineNumber: metadata.engineNumber || '',
                isCommercial: metadata.isCommercial || 'false'
              },
              ownerAddress: address,
              createdAt: nft.createdAt || new Date().toISOString()
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching metadata for NFT ${nft.tokenId}:`, error);
          return null;
        }
      })
    );

    console.log('[getUserVehicles] Vehicles processed:', vehicles);
    // Filter out null values (non-vehicle NFTs or errors)
    const validVehicles = vehicles.filter((vehicle: any) => vehicle !== null);

    console.log('[getUserVehicles] Returning vehicles:', validVehicles);
    res.json({
      success: true,
      vehicles: validVehicles,
      count: validVehicles.length
    });

  } catch (error) {
    console.error('Error fetching user vehicles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user vehicles',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get vehicle details by token ID (for validation)
 */
export const getVehicleByTokenId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tokenId } = req.params;
    
    if (!tokenId) {
      res.status(400).json({
        success: false,
        error: 'Token ID is required'
      });
      return;
    }

    // Get NFT metadata
    const fullNftData = await assetNFTService.getAssetMetadata(tokenId);
    
    // Access the nested metadata object
    const metadata = fullNftData.metadata;
    
    // Verify it's a vehicle NFT (has make/model/year, VIN is optional)
    if (!metadata.make || !metadata.model || !metadata.year) {
      res.status(404).json({
        success: false,
        error: 'NFT is not a vehicle or does not exist'
      });
      return;
    }

    // Get owner address
    const ownerAddress = await assetNFTService.getAssetOwner(tokenId);

    const vehicle = {
      tokenId,
      metadata: {
        make: metadata.make || '',
        model: metadata.model || '',
        year: metadata.year || '',
        vin: metadata.vin || null, // Allow null VIN
        currentMileage: metadata.currentMileage || '0',
        color: metadata.color || '',
        plateNumber: metadata.plateNumber || '',
        fuelType: metadata.fuelType || '',
        engineSize: metadata.engineSize || '',
        engineNumber: metadata.engineNumber || ''
      },
      ownerAddress,
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      vehicle
    });

  } catch (error) {
    console.error('Error fetching vehicle by token ID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicle details',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
