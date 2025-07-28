import { Request, Response } from 'express';
import { User } from '../entity/User';
import { Payment } from '../entity/Payment';
import assetNFTService, { VehicleData, PropertyData } from '../services/assetNFTService';
import ormconfig from '../ormconfig';

// Helper function to serialize BigInt values for JSON responses
const serializeBigInt = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }));
};

/**
 * Create a vehicle NFT
 */
export const createVehicleNFT = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const {
      vin,
      make,
      model,
      year,
      engineNumber,
      color,
      fuelType,
      engineSize,
      currentMileage,
      isCommercial,
      plateNumber
    } = req.body;

    // Validate required fields
    if (!vin || !make || !model || !year) {
      res.status(400).json({ error: 'Missing required vehicle data: vin, make, model, year' });
      return;
    }

    // Get user wallet address
    const userRepo = ormconfig.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });
    
    if (!user || !user.wallet_address) {
      res.status(400).json({ error: 'User does not have a wallet address' });
      return;
    }
    
    console.log('[AssetNFT Controller] Creating NFT for user:', userId, 'wallet:', user.wallet_address);

    const vehicleData: VehicleData = {
      vin,
      make,
      model,
      year: parseInt(year),
      engineNumber: engineNumber || '',
      color: color || '',
      fuelType: fuelType || 'Gasoline',
      engineSize: parseInt(engineSize) || 0,
      currentMileage: parseInt(currentMileage) || 0,
      isCommercial: isCommercial === true,
      plateNumber: plateNumber || ''
    };

    const result = await assetNFTService.createVehicleNFT(vehicleData, user.wallet_address);

    console.log('[AssetNFT Controller] Vehicle NFT created:', result);

    res.json({
      success: true,
      tokenId: result.tokenId,
      transactionHash: result.transactionHash,
      message: 'Vehicle NFT created successfully'
    });

  } catch (error) {
    console.error('[AssetNFT Controller] Error creating vehicle NFT:', error);
    res.status(500).json({ 
      error: 'Failed to create vehicle NFT',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create a property NFT
 */
export const createPropertyNFT = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const {
      cadastralId,
      fullAddress,
      city,
      state,
      postalCode,
      country,
      propertyType,
      squareMeters,
      builtArea,
      bedrooms,
      bathrooms,
      parkingSpaces,
      yearBuilt,
      legalDescription
    } = req.body;

    // Validate required fields
    if (!cadastralId || !fullAddress || !city || !state || !squareMeters) {
      res.status(400).json({ error: 'Missing required property data: cadastralId, fullAddress, city, state, squareMeters' });
      return;
    }

    // Get user wallet address
    const userRepo = ormconfig.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });
    
    if (!user || !user.wallet_address) {
      res.status(400).json({ error: 'User does not have a wallet address' });
      return;
    }

    const propertyData: PropertyData = {
      cadastralId,
      fullAddress,
      city,
      state,
      postalCode: postalCode || '',
      country: country || 'Mexico',
      propertyType: parseInt(propertyType) || 0, // RESIDENTIAL_HOUSE
      squareMeters: parseInt(squareMeters),
      builtArea: parseInt(builtArea) || 0,
      bedrooms: parseInt(bedrooms) || 0,
      bathrooms: parseInt(bathrooms) || 0,
      parkingSpaces: parseInt(parkingSpaces) || 0,
      yearBuilt: parseInt(yearBuilt) || new Date().getFullYear(),
      legalDescription: legalDescription || ''
    };

    const result = await assetNFTService.createPropertyNFT(propertyData, user.wallet_address);

    console.log('[AssetNFT Controller] Property NFT created:', result);

    res.json({
      success: true,
      tokenId: result.tokenId,
      transactionHash: result.transactionHash,
      message: 'Property NFT created successfully'
    });

  } catch (error) {
    console.error('[AssetNFT Controller] Error creating property NFT:', error);
    res.status(500).json({ 
      error: 'Failed to create property NFT',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get vehicle by VIN
 */
export const getVehicleByVIN = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vin } = req.params;

    if (!vin) {
      res.status(400).json({ error: 'VIN is required' });
      return;
    }

    const vehicle = await assetNFTService.getVehicleByVIN(vin);

    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    res.json({
      success: true,
      vehicle
    });

  } catch (error) {
    console.error('[AssetNFT Controller] Error getting vehicle by VIN:', error);
    res.status(500).json({ 
      error: 'Failed to get vehicle',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get property by cadastral ID
 */
export const getPropertyByCadastralId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cadastralId } = req.params;

    if (!cadastralId) {
      res.status(400).json({ error: 'Cadastral ID is required' });
      return;
    }

    const property = await assetNFTService.getPropertyByCadastralId(cadastralId);

    if (!property) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }

    res.json({
      success: true,
      property
    });

  } catch (error) {
    console.error('[AssetNFT Controller] Error getting property by cadastral ID:', error);
    res.status(500).json({ 
      error: 'Failed to get property',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get asset metadata
 */
export const getAssetMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tokenId } = req.params;

    if (!tokenId) {
      res.status(400).json({ error: 'Token ID is required' });
      return;
    }

    const metadata = await assetNFTService.getAssetMetadata(tokenId);
    const serializedMetadata = serializeBigInt(metadata);

    res.json({
      success: true,
      metadata: serializedMetadata
    });

  } catch (error) {
    console.error('[AssetNFT Controller] Error getting asset metadata:', error);
    res.status(500).json({ 
      error: 'Failed to get asset metadata',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get asset history
 */
export const getAssetHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tokenId } = req.params;

    if (!tokenId) {
      res.status(400).json({ error: 'Token ID is required' });
      return;
    }

    const history = await assetNFTService.getAssetHistory(tokenId);

    res.json({
      success: true,
      history
    });

  } catch (error) {
    console.error('[AssetNFT Controller] Error getting asset history:', error);
    res.status(500).json({ 
      error: 'Failed to get asset history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Add vehicle maintenance record
 */
export const addVehicleMaintenance = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { tokenId } = req.params;
    const { newMileage, serviceLocation, description, supportingDocs } = req.body;

    if (!tokenId || !newMileage || !serviceLocation) {
      res.status(400).json({ error: 'Missing required fields: tokenId, newMileage, serviceLocation' });
      return;
    }

    const transactionHash = await assetNFTService.addVehicleMaintenance(
      tokenId,
      parseInt(newMileage),
      serviceLocation,
      description || 'Maintenance performed',
      supportingDocs || []
    );

    res.json({
      success: true,
      transactionHash,
      message: 'Vehicle maintenance record added successfully'
    });

  } catch (error) {
    console.error('[AssetNFT Controller] Error adding vehicle maintenance:', error);
    res.status(500).json({ 
      error: 'Failed to add vehicle maintenance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Add property appraisal
 */
export const addPropertyAppraisal = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { tokenId } = req.params;
    const { appraisalValue, appraiserName, appraisalReportHash, supportingDocs } = req.body;

    if (!tokenId || !appraisalValue || !appraiserName) {
      res.status(400).json({ error: 'Missing required fields: tokenId, appraisalValue, appraiserName' });
      return;
    }

    const transactionHash = await assetNFTService.addPropertyAppraisal(
      tokenId,
      appraisalValue,
      appraiserName,
      appraisalReportHash || '',
      supportingDocs || []
    );

    res.json({
      success: true,
      transactionHash,
      message: 'Property appraisal added successfully'
    });

  } catch (error) {
    console.error('[AssetNFT Controller] Error adding property appraisal:', error);
    res.status(500).json({ 
      error: 'Failed to add property appraisal',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Transfer asset on payment completion (called by payment webhook)
 */
export const transferAssetOnPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId, tokenId, newOwnerAddress, salePrice } = req.body;

    if (!paymentId || !tokenId || !newOwnerAddress || !salePrice) {
      res.status(400).json({ error: 'Missing required fields: paymentId, tokenId, newOwnerAddress, salePrice' });
      return;
    }

    // Verify payment exists and is completed
    const paymentRepo = ormconfig.getRepository(Payment);
    const payment = await paymentRepo.findOne({ where: { id: paymentId } });

    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    if (payment.status !== 'completed') {
      res.status(400).json({ error: 'Payment is not completed' });
      return;
    }

    const transactionHash = await assetNFTService.transferAssetOnPaymentCompletion(
      tokenId,
      newOwnerAddress,
      salePrice,
      paymentId
    );

    res.json({
      success: true,
      transactionHash,
      message: 'Asset transferred successfully'
    });

  } catch (error) {
    console.error('[AssetNFT Controller] Error transferring asset:', error);
    res.status(500).json({ 
      error: 'Failed to transfer asset',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Generate QR code for asset verification
 */
export const generateAssetQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tokenId } = req.params;

    if (!tokenId) {
      res.status(400).json({ error: 'Token ID is required' });
      return;
    }

    // Generate verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-asset/${tokenId}`;

    res.json({
      success: true,
      verificationUrl,
      qrCodeData: verificationUrl
    });

  } catch (error) {
    console.error('[AssetNFT Controller] Error generating asset QR:', error);
    res.status(500).json({ 
      error: 'Failed to generate asset QR code',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
