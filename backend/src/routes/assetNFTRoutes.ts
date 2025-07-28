import { Router } from 'express';
import {
  createVehicleNFT,
  createPropertyNFT,
  getVehicleByVIN,
  getPropertyByCadastralId,
  getAssetHistory,
  getAssetMetadata,
  addVehicleMaintenance,
  addPropertyAppraisal,
  transferAssetOnPayment,
  generateAssetQR
} from '../controllers/assetNFTController';
import {
  createAssetForMarketplace,
  transferAssetOnPayment as transferOnPayment,
  getAssetForMarketplace,
  generateMarketplaceData,
  updateAssetRecord,
  getUserAssets,
  handleMarketplaceSaleWebhook
} from '../controllers/assetIntegrationController';
import {
  getUserVehicles,
  getVehicleByTokenId
} from '../controllers/userVehiclesController';
import { authenticateJWT as authenticateToken } from '../authenticateJWT';

const router = Router();

// Vehicle NFT routes
router.post('/vehicle', authenticateToken, createVehicleNFT);
router.get('/vehicle/vin/:vin', getVehicleByVIN);
router.post('/vehicle/:tokenId/maintenance', authenticateToken, addVehicleMaintenance);

// Property NFT routes
router.post('/property', authenticateToken, createPropertyNFT);
router.get('/property/cadastral/:cadastralId', getPropertyByCadastralId);
router.post('/property/:tokenId/appraisal', authenticateToken, addPropertyAppraisal);

// General asset routes
router.get('/asset/:tokenId/history', getAssetHistory);
router.get('/asset/:tokenId/metadata', getAssetMetadata);
router.get('/asset/:tokenId/qr', generateAssetQR);

// Marketplace integration routes
router.post('/create-for-marketplace', authenticateToken, createAssetForMarketplace);
router.get('/marketplace/:tokenId', getAssetForMarketplace);
router.get('/marketplace-data/:tokenId', generateMarketplaceData);
router.get('/user/assets', authenticateToken, getUserAssets);

// User vehicles routes (for digital twin selector)
router.get('/user-vehicles', authenticateToken, getUserVehicles);
router.get('/vehicle-by-token/:tokenId', getVehicleByTokenId);

// Service provider updates
router.post('/update/:tokenId', authenticateToken, updateAssetRecord);
router.post('/service-update', authenticateToken, updateAssetRecord);

// Transfer routes (for payment webhooks)
router.post('/transfer', transferAssetOnPayment);
router.post('/transfer-on-payment', transferOnPayment);

// Marketplace webhooks
router.post('/webhook/marketplace-sale', handleMarketplaceSaleWebhook);

export default router;
