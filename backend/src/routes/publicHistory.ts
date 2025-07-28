import { Router } from 'express';
import {
  getPublicVehicleHistory,
  getPublicVehicleSummary,
  getVehicleVerificationCertificate,
  searchPublicVehicles
} from '../controllers/publicHistoryController';

const router = Router();

/**
 * Public Vehicle History Routes
 * These endpoints provide public access to vehicle history for transparency
 * No authentication required - designed for public trust and verification
 */

// Get complete public vehicle history
router.get('/vehicle/:tokenId/history', getPublicVehicleHistory);

// Get vehicle summary (lightweight)
router.get('/vehicle/:tokenId/summary', getPublicVehicleSummary);

// Get verification certificate
router.get('/vehicle/:tokenId/certificate', getVehicleVerificationCertificate);

// Search public vehicles
router.get('/vehicles/search', searchPublicVehicles);

// Health check for public API
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Kustodia Public Vehicle History API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/public/vehicle/:tokenId/history',
      'GET /api/public/vehicle/:tokenId/summary', 
      'GET /api/public/vehicle/:tokenId/certificate',
      'GET /api/public/vehicles/search'
    ]
  });
});

export default router;
