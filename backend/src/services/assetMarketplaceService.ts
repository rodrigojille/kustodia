import { ethers } from 'ethers';
import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import { Payment } from '../entity/Payment';
import { getCurrentNetworkConfig, isMainnetActive } from '../utils/networkConfig';
import assetNFTService from './assetNFTService';
import ormconfig from '../ormconfig';

export interface AssetCreationRequest {
  userId: string;
  assetType: 'vehicle' | 'property';
  assetData: any;
  intendedMarketplace?: string; // OpenSea, local marketplace, etc.
}

export interface AssetTransferRequest {
  tokenId: string;
  fromAddress: string;
  toAddress: string;
  salePrice: string;
  paymentId: string;
  marketplace?: string;
}

export interface ServiceProviderUpdate {
  tokenId: string;
  updateType: 'maintenance' | 'upgrade' | 'inspection' | 'appraisal' | 'mantenimiento' | 'mejora' | 'inspeccion';
  providerType: 'dealership' | 'contractor' | 'appraiser' | 'owner';
  updateData: any;
  supportingDocs?: string[];
}

// Network-aware configuration helpers
function getNetworkConfig() {
  const config = getCurrentNetworkConfig();
  const isMainnet = isMainnetActive();
  
  return {
    blockchain: isMainnet ? 'arbitrum-mainnet' : 'arbitrum-sepolia',
    explorerUrl: config.explorerUrl,
    networkName: config.networkName,
    chainId: config.chainId,
    contractAddress: config.nftCompactAddress
  };
}

function getVerificationUrl(tokenId: string): string {
  const { explorerUrl, contractAddress } = getNetworkConfig();
  return `${explorerUrl}/token/${contractAddress}?a=${tokenId}`;
}

class AssetIntegrationService {
  /**
   * Create NFT for seller before they list on any marketplace
   */
  async createAssetNFT(request: AssetCreationRequest): Promise<{ tokenId: string; transactionHash: string; marketplaceReady: boolean }> {
    try {
      console.log('[AssetIntegration] Creating NFT for user:', request.userId);

      const userRepo = ormconfig.getRepository(User);
      const user = await userRepo.findOne({ where: { id: parseInt(request.userId) } });
      
      if (!user || !user.wallet_address) {
        throw new Error('User not found or no wallet address');
      }

      let result: { tokenId: string; transactionHash: string };

      if (request.assetType === 'vehicle') {
        result = await assetNFTService.createVehicleNFT(request.assetData, user.wallet_address);
      } else if (request.assetType === 'property') {
        result = await assetNFTService.createPropertyNFT(request.assetData, user.wallet_address);
      } else {
        throw new Error('Unsupported asset type');
      }

      console.log('[AssetIntegration] NFT created for marketplace listing:', {
        tokenId: result.tokenId,
        marketplace: request.intendedMarketplace || 'any',
        owner: user.wallet_address
      });

      return {
        ...result,
        marketplaceReady: true
      };

    } catch (error) {
      console.error('[AssetIntegration] Error creating asset NFT:', error);
      throw new Error(`Failed to create asset NFT: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transfer NFT when payment is completed (works with any marketplace)
   */
  async transferAssetOnPayment(request: AssetTransferRequest): Promise<{ transactionHash: string; success: boolean }> {
    try {
      console.log('[AssetIntegration] Processing asset transfer:', request);

      // Verify payment exists and is completed
      const paymentRepo = ormconfig.getRepository(Payment);
      const payment = await paymentRepo.findOne({ where: { id: parseInt(request.paymentId) } });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'completed') {
        throw new Error('Payment must be completed before transfer');
      }

      // Transfer NFT on blockchain
      const transactionHash = await assetNFTService.transferAssetOnPaymentCompletion(
        request.tokenId,
        request.toAddress,
        request.salePrice,
        request.paymentId
      );

      console.log('[AssetIntegration] Asset transferred successfully:', {
        tokenId: request.tokenId,
        from: request.fromAddress,
        to: request.toAddress,
        transactionHash,
        marketplace: request.marketplace || 'unknown'
      });

      return {
        success: true,
        transactionHash
      };
    } catch (error) {
      console.error('[AssetIntegration] Error transferring asset:', error);
      throw new Error(`Failed to transfer asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get asset data for marketplace display
   */
  async getAssetForMarketplace(tokenId: string): Promise<any> {
    try {
      console.log('[AssetIntegration] Getting asset for marketplace:', tokenId);
      
      // Get asset data from NFT service
      const assetNFTServiceModule = await import('./assetNFTService');
      const assetNFTService = assetNFTServiceModule.default;
      const assetData = await assetNFTService.getAssetMetadata(tokenId);
      
      // TODO: Add marketplace-specific data like pricing, availability, etc.
      return {
        ...assetData,
        marketplaceReady: true,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('[AssetIntegration] Error getting asset for marketplace:', error);
      throw new Error(`Failed to get asset for marketplace: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get owned tokens from Universal Asset Contract
   */
  private async getOwnedTokens(walletAddress: string): Promise<any[]> {
    try {
      console.log('[AssetIntegration] Getting owned tokens for wallet:', walletAddress);
      
      const ethers = require('ethers');
      const networkConfig = getCurrentNetworkConfig();
      const rpcUrl = networkConfig.rpcUrl;
      const universalContractAddress = networkConfig.nftCompactAddress;
      
      if (!rpcUrl || !universalContractAddress) {
        console.log('[AssetIntegration] Missing RPC URL or contract address');
        return [];
      }
      
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Check contract exists
      const contractCode = await provider.getCode(universalContractAddress);
      if (contractCode === '0x') {
        console.log('[AssetIntegration] Contract not deployed at address:', universalContractAddress);
        return [];
      }
      
      // Contract ABI for balanceOf and ownerAssets mapping (correct functions for UniversalAssetNFTPausable)
      const minimalABI = [
        'function balanceOf(address owner) external view returns (uint256)',
        'function ownerAssets(address owner, uint256 index) external view returns (uint256)'
      ];
      
      const contract = new ethers.Contract(universalContractAddress, minimalABI, provider);
      
      // Get user's NFT balance first
      const balance = await contract.balanceOf(walletAddress);
      console.log('[AssetIntegration] User balance:', balance.toString());
      
      const ownedTokens = [];
      
      // Iterate through ownerAssets mapping to get all token IDs
      for (let i = 0; i < balance; i++) {
        try {
          const tokenId = await contract.ownerAssets(walletAddress, i);
          if (tokenId && tokenId.toString() !== '0') {
            ownedTokens.push(tokenId);
          }
        } catch (error) {
          console.error(`[AssetIntegration] Error getting token at index ${i}:`, error);
          // Continue with other tokens
        }
      }
      
      console.log('[AssetIntegration] Found owned tokens:', ownedTokens?.length || 0);
      
      return ownedTokens || [];
    } catch (error) {
      console.error('[AssetIntegration] Error getting owned tokens:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  /**
   * Get user's owned NFTs from blockchain with full metadata
   */
  async getUserAssets(userId: string): Promise<any[]> {
    try {
      console.log('[AssetIntegration] Getting assets for user ID:', userId);
      
      // Get user's wallet address
      const userRepo = ormconfig.getRepository(User);
      const user = await userRepo.findOne({ where: { id: parseInt(userId) } });
      if (!user || !user.wallet_address) {
        console.log('[AssetIntegration] User not found or no wallet address:', { userId, user: !!user, walletAddress: user?.wallet_address });
        return [];
      }

      console.log('[AssetIntegration] Found user wallet address:', user.wallet_address);

      // Get owned tokens from Universal Asset Contract
      const ownedTokens = await this.getOwnedTokens(user.wallet_address);
      console.log('[AssetIntegration] Found owned tokens:', ownedTokens?.length || 0);

      const networkConfig = getNetworkConfig();
      const universalContractAddress = networkConfig.contractAddress;

      if (!ownedTokens || ownedTokens.length === 0) {
        console.log('[AssetIntegration] No tokens found for user');
        return [];
      }

      // Get full metadata for each asset
      const assets = await Promise.all(
        ownedTokens.map(async (tokenId: any) => {
          try {
            const tokenIdString = tokenId.toString();
            console.log('[AssetIntegration] Processing token ID:', tokenIdString);
            
            // Get detailed metadata for each NFT
            const fullAssetData = await assetNFTService.getAssetMetadata(tokenIdString);
            console.log('[AssetIntegration] Full asset data for token', tokenIdString, ':', fullAssetData);
            
            // Access the nested metadata object
            const metadata = fullAssetData?.metadata || {};
            console.log('[AssetIntegration] Metadata for token', tokenIdString, ':', metadata);
            
            return {
              tokenId: tokenIdString,
              contractAddress: universalContractAddress,
              blockchain: networkConfig.blockchain,
              verificationUrl: getVerificationUrl(tokenIdString),
              kustodiaCertified: true,
              lastUpdated: new Date().toISOString(),
              metadata: metadata, // Include full metadata
              // Extract common fields for easier access
              make: metadata.make || null,
              model: metadata.model || null,
              year: metadata.year || null,
              brand: metadata.brand || null,
              type: metadata.type || null,
              condition: metadata.condition || null,
              // Vehicle specific
              vin: metadata.vin || null,
              mileage: metadata.currentMileage || metadata.mileage || null,
              // Property specific
              address: metadata.address || null,
              cadastralId: metadata.cadastralId || null,
              // Electronics/Appliances specific
              serialNumber: metadata.serialNumber || metadata.serial || null,
              warranty: metadata.warranty || null
            };
          } catch (error) {
            console.error(`[AssetIntegration] Error fetching metadata for NFT ${tokenId}:`, error);
            // Return basic asset info even if metadata fails
            return {
              tokenId: tokenId.toString(),
              contractAddress: universalContractAddress,
              blockchain: networkConfig.blockchain,
              verificationUrl: getVerificationUrl(tokenId.toString()),
              kustodiaCertified: true,
              lastUpdated: new Date().toISOString(),
              metadata: {},
              error: 'Failed to fetch metadata'
            };
          }
        })
      );

      console.log('[AssetIntegration] Returning assets with metadata:', assets.length);
      return assets;
    } catch (error) {
      console.error('[AssetIntegration] Error getting user assets:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  /**
   * Generate marketplace integration data
   */
  async generateMarketplaceData(tokenId: string): Promise<any> {
    try {
      console.log('[AssetIntegration] Starting marketplace data generation for token:', tokenId);
      
      // Get asset history (now returns enhanced object with events, summary, etc.)
      console.log('[AssetIntegration] Calling getAssetHistory...');
      const historyData: any = await assetNFTService.getAssetHistory(tokenId);
      console.log('[AssetIntegration] History data received:', historyData);
      
      // Generate OpenSea-compatible metadata with English property names to match frontend interface
      const networkConfig = getNetworkConfig();
      const marketplaceData = {
        tokenId,
        contractAddress: networkConfig.contractAddress,
        blockchain: networkConfig.blockchain,
        verificationUrl: getVerificationUrl(tokenId),
        history: historyData?.totalEvents || 0,
        lastUpdated: historyData?.lastUpdated || new Date().toISOString(),
        kustodiaCertified: true,
        // Include enhanced metadata with Spanish history for frontend display
        metadata: {
          ...historyData,
          // Map enhanced events to the format expected by frontend
          history: historyData?.events?.map((event: any, index: number) => {
            console.log(`[AssetIntegration] Processing event ${index}:`, {
              eventTypeSpanish: event.eventTypeSpanish,
              eventType: event.eventType,
              enhancedDescription: event.enhancedDescription,
              description: event.description
            });
            return {
              eventType: event.eventTypeSpanish || event.eventType, // Use Spanish translation
              description: event.enhancedDescription || event.description,
              timestamp: event.timestamp,
              authorizedBy: event.authorizedBy,
              transactionAmount: event.transactionAmount,
              supportingDocs: event.supportingDocs
            };
          }) || []
        }
      };
      
      console.log('[AssetIntegration] Generated marketplace data:', marketplaceData);
      return marketplaceData;
    } catch (error) {
      console.error('[AssetIntegration] Error generating marketplace data:', error);
      console.error('[AssetIntegration] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return null;
    }
  }

  /**
   * Handle service provider updates
   */
  async updateAssetRecord(request: ServiceProviderUpdate): Promise<{ transactionHash: string; updated: boolean }> {
    try {
      console.log('[AssetIntegration] Processing service provider update:', request.tokenId);
      
      let transactionHash: string = '';
      
      switch (request.updateType) {
        case 'maintenance':
        case 'mantenimiento':
          transactionHash = await assetNFTService.addMaintenanceRecord(request.tokenId, request.updateData);
          break;
        case 'upgrade':
        case 'mejora':
          transactionHash = await assetNFTService.addUpgradeRecord(request.tokenId, request.updateData);
          break;
        case 'inspection':
        case 'inspeccion':
          transactionHash = await assetNFTService.addInspectionRecord(request.tokenId, request.updateData);
          break;

        default:
          throw new Error(`Unknown update type: ${request.updateType}`);
      }

      console.log('[AssetIntegration] Asset record updated:', {
        tokenId: request.tokenId,
        updateType: request.updateType,
        transactionHash
      });
      
      return {
        transactionHash,
        updated: true
      };

    } catch (error) {
      console.error('[AssetIntegration] Error updating asset record:', error);
      throw new Error(`Failed to update asset record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Webhook handler for marketplace sales (OpenSea, etc.)
   */
  async handleMarketplaceSale(saleData: {
    tokenId: string;
    fromAddress: string;
    toAddress: string;
    salePrice: string;
    marketplace: string;
    transactionHash: string;
  }): Promise<boolean> {
    try {
      console.log('[AssetIntegration] Processing marketplace sale:', saleData);

      // Record the sale in our system for tracking
      // This could update our internal records or trigger notifications
      
      return true;

    } catch (error) {
      console.error('[AssetIntegration] Error handling marketplace sale:', error);
      return false;
    }
  }
}

// Create singleton instance
const assetIntegrationService = new AssetIntegrationService();

// Export singleton as default
export default assetIntegrationService;

// Export named functions for direct import by controllers
export const createAssetNFT = (request: AssetCreationRequest) => assetIntegrationService.createAssetNFT(request);
export const transferAssetOnPayment = (request: AssetTransferRequest) => assetIntegrationService.transferAssetOnPayment(request);
export const getUserAssets = (userId: string) => assetIntegrationService.getUserAssets(userId);
