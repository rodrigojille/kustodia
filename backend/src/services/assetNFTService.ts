import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { getCurrentNetworkConfig } from '../utils/networkConfig';
import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import { Payment } from '../entity/Payment';

// Asset types enum (matches smart contract)
export enum AssetType {
  VEHICLE = 0,      // Cars, trucks, motorcycles
  PROPERTY = 1,     // Real estate, land
  MACHINERY = 2,    // Industrial equipment, construction
  LUXURY_GOODS = 3, // Jewelry, watches, art
  ELECTRONICS = 4,  // High-end electronics, servers
  AGRICULTURAL = 5, // Tractors, farm equipment
  COMMERCIAL = 6,   // Restaurant equipment, retail
  FURNITURE = 7,    // Designer furniture, antiques
  COLLECTIBLE = 8,  // Coins, memorabilia, instruments
  OTHER = 9         // Expandable for future categories
}

// Load actual compiled contract ABI based on network
const getUniversalAssetABI = () => {
  try {
    // Get current network to determine which contract ABI to use
    const networkConfig = getCurrentNetworkConfig();
    const isMainnet = networkConfig.chainId === 42161; // Arbitrum Mainnet
    
    if (isMainnet) {
      // Mainnet uses UniversalAssetNFTPausable
      const contractArtifact = require('../artifacts/contracts/UniversalAssetNFTPausable.sol/UniversalAssetNFTPausable.json');
      console.log('[AssetNFT] Loading UniversalAssetNFTPausable ABI for mainnet');
      return contractArtifact.abi;
    } else {
      // Testnet uses UniversalAssetNFTCompact
      const contractArtifact = require('../artifacts/contracts/UniversalAssetNFTCompact.sol/UniversalAssetNFTCompact.json');
      console.log('[AssetNFT] Loading UniversalAssetNFTCompact ABI for testnet');
      return contractArtifact.abi;
    }
  } catch (error) {
    console.warn('[AssetNFT] Could not load compiled ABI, falling back to minimal ABI:', error instanceof Error ? error.message : String(error));
    // Fallback minimal ABI with CORRECT parameter order for both contracts
    return [
      "function createAsset(string assetId, uint8 assetType, address owner, string[] metadataKeys, string[] metadataValues, string _tokenURI) external returns (uint256)",
      "function addAssetEvent(uint256 tokenId, uint8 eventType, string description, uint256 transactionAmount, string[] supportingDocs, string[] customFieldKeys, string[] customFieldValues) external",
      "function verifyAsset(uint256 tokenId) external",
      "function updateAssetMetadata(uint256 tokenId, string key, string value) external",
      "function getAssetMetadata(uint256 tokenId, string key) external view returns (string)",
      "function getAssetHistoryLength(uint256 tokenId) external view returns (uint256)",
      "function getAssetEvent(uint256 tokenId, uint256 eventIndex) external view returns (uint8, uint256, address, string, uint256, string[])",
      "function getOwnerAssets(address owner) external view returns (uint256[])",
      "function ownerOf(uint256 tokenId) external view returns (address)",
      "function tokenURI(uint256 tokenId) external view returns (string)",
      "function assetIdToTokenId(string assetId) external view returns (uint256)",
      "function getAsset(uint256 tokenId) external view returns (string, uint8, address, bool, uint256, string)"
    ];
  }
};

const UNIVERSAL_ASSET_ABI = getUniversalAssetABI();

const VEHICLE_ASSET_ABI = [
  "function createVehicle(string vin, address owner, string make, string model, uint256 year, string engineNumber, string color, string fuelType, uint256 engineSize, uint256 currentMileage, bool isCommercial, string plateNumber, string tokenURI) external returns (uint256)",
  "function updateMileage(uint256 tokenId, uint256 newMileage, string serviceLocation, string[] supportingDocs) external",
  "function recordInspection(uint256 tokenId, string inspectionType, bool passed, string certificateHash, uint256 expiryDate, string[] supportingDocs) external",
  "function reportAccident(uint256 tokenId, string severity, string description, uint256 repairCost, string policeReportHash, string[] supportingDocs) external",
  "function getVehicleData(uint256 tokenId) external view returns (string, string, string, uint256, string, string, string, uint256, uint256, bool, string, uint256)",
  "function getVehicleByVIN(string vin) external view returns (uint256)",
  "function hasCleanHistory(uint256 tokenId) external view returns (bool)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function getOwnerAssets(address owner) external view returns (uint256[])"
];

const PROPERTY_ASSET_ABI = [
  "function createProperty(string cadastralId, address owner, string fullAddress, string city, string state, string postalCode, string country, uint8 propertyType, uint256 squareMeters, uint256 builtArea, uint256 bedrooms, uint256 bathrooms, uint256 parkingSpaces, uint256 yearBuilt, string legalDescription, string tokenURI) external returns (uint256)",
  "function addAppraisal(uint256 tokenId, uint256 appraisalValue, string appraiserName, string appraisalReportHash, string[] supportingDocs) external",
  "function addLien(uint256 tokenId, string lienType, uint256 amount, address lienholder, string documentHash) external",
  "function releaseLien(uint256 tokenId, uint256 lienIndex, string releaseDocumentHash) external",
  "function getPropertyData(uint256 tokenId) external view returns (string, string, string, string, uint8, uint256, uint256, uint256, uint256, uint256, bool, uint256)",
  "function getPropertyByCadastralId(string cadastralId) external view returns (uint256)"
];

// Event types enum (matches smart contract)
export enum EventType {
  CREATION = 0,
  SALE = 1,
  TRANSFER = 2,
  MAINTENANCE = 3,
  INSPECTION = 4,
  DAMAGE = 5,
  REPAIR = 6,
  UPGRADE = 7,
  RENTAL = 8,
  LEASE = 9,
  INSURANCE_CLAIM = 10,
  LEGAL_ACTION = 11,
  VERIFICATION = 12,
  CUSTOM = 13
}

export interface VehicleData {
  vin: string;
  make: string;
  model: string;
  year: number;
  engineNumber: string;
  color: string;
  fuelType: string;
  engineSize: number;
  currentMileage: number;
  isCommercial: boolean;
  plateNumber: string;
}

export interface PropertyData {
  cadastralId: string;
  fullAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  propertyType: number; // PropertyType enum
  squareMeters: number;
  builtArea: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  yearBuilt: number;
  legalDescription: string;
}

class AssetNFTService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private universalAssetContract: ethers.Contract;
  private vehicleAssetContract: ethers.Contract | null;
  private propertyAssetContract: ethers.Contract | null;

  constructor() {
    try {
      // Get network configuration
      const networkConfig = getCurrentNetworkConfig();
      
      // Initialize blockchain connection
      this.provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
      
      // Initialize Kustodia wallet for contract interactions
      const privateKey = networkConfig.privateKey;
      if (!privateKey || privateKey === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        console.warn('[AssetNFT] KUSTODIA_PRIVATE_KEY not configured - NFT functionality will be disabled');
        return;
      }
      this.wallet = new ethers.Wallet(privateKey, this.provider);

      // Initialize contract instances
      const universalAssetAddress = networkConfig.nftCompactAddress;

      if (!universalAssetAddress || universalAssetAddress === '0x0000000000000000000000000000000000000000') {
        console.warn('[AssetNFT] Universal Asset Contract address not configured - NFT functionality will be disabled');
        return;
      }

      this.universalAssetContract = new ethers.Contract(universalAssetAddress, UNIVERSAL_ASSET_ABI, this.wallet);
      
      // Vehicle and Property contracts are not needed - Universal handles everything
      this.vehicleAssetContract = null;
      this.propertyAssetContract = null;
      
      console.log('[AssetNFT] Service initialized successfully');
      console.log('[AssetNFT] Using UNIVERSAL ASSET CONTRACT ONLY:');
      console.log('[AssetNFT]   Universal:', universalAssetAddress);
      console.log('[AssetNFT]   Note: Vehicle and Property contracts not needed - Universal handles all asset types');
    } catch (error) {
      console.error('[AssetNFT] Error initializing service:', error);
      console.warn('[AssetNFT] NFT functionality will be disabled');
    }
  }

  /**
   * Create a vehicle NFT
   */
  async createVehicleNFT(vehicleData: VehicleData, ownerAddress: string, assetType: number = 0): Promise<{ tokenId: string; transactionHash: string }> {
    try {
      if (!this.universalAssetContract) {
        throw new Error('Universal NFT service not initialized - contracts not deployed');
      }
      
      console.log('[AssetNFT] Creating vehicle NFT for VIN:', vehicleData.vin, 'owner:', ownerAddress);
      console.log('[AssetNFT] Using UNIVERSAL contract address:', this.universalAssetContract.target);

      // Generate metadata URI
      const tokenURI = await this.generateVehicleMetadataURI(vehicleData);

      // Prepare metadata for Universal Asset Contract
      const metadataKeys = ['make', 'model', 'year', 'vin', 'engineNumber', 'color', 'fuelType', 'engineSize', 'currentMileage', 'isCommercial', 'plateNumber'];
      const metadataValues = [
        vehicleData.make,
        vehicleData.model,
        vehicleData.year.toString(),
        vehicleData.vin,
        vehicleData.engineNumber,
        vehicleData.color,
        vehicleData.fuelType,
        vehicleData.engineSize.toString(),
        vehicleData.currentMileage.toString(),
        vehicleData.isCommercial.toString(),
        vehicleData.plateNumber
      ];

      // Use Universal Asset Contract to create NFT (this actually mints!)
      // FIXED: Parameter order matches actual contract ABI
      const tx = await this.universalAssetContract.createAsset(
        vehicleData.vin,        // assetId (VIN)
        assetType,              // assetType (0=VEHICLE, 1=PROPERTY, etc.)
        ownerAddress,           // owner
        metadataKeys,          // metadataKeys
        metadataValues,        // metadataValues
        tokenURI               // _tokenURI (moved to last position)
      );

      const receipt = await tx.wait();
      
      // Extract token ID from Transfer event (ERC-721 standard)
      let tokenId = '0';
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.universalAssetContract.interface.parseLog(log);
          if (parsedLog?.name === 'Transfer' && parsedLog.args[0] === '0x0000000000000000000000000000000000000000') {
            // This is a mint (from zero address)
            tokenId = parsedLog.args[2]?.toString();
            break;
          }
        } catch (e) {
          // Skip logs that can't be parsed
          continue;
        }
      }

      console.log('[AssetNFT] Vehicle NFT created with Universal contract:', { tokenId, transactionHash: receipt.hash });

      return {
        tokenId: tokenId || '0',
        transactionHash: receipt.hash
      };
    } catch (error) {
      console.error('[AssetNFT] Error creating vehicle NFT:', error);
      throw new Error(`Failed to create vehicle NFT: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a property NFT using Universal Asset Contract
   */
  async createPropertyNFT(propertyData: PropertyData, ownerAddress: string, assetType: number = AssetType.PROPERTY): Promise<{ tokenId: string; transactionHash: string }> {
    try {
      if (!this.universalAssetContract) {
        throw new Error('Universal NFT service not initialized - contracts not deployed');
      }
      
      console.log('[AssetNFT] Creating property NFT for cadastral ID:', propertyData.cadastralId, 'owner:', ownerAddress);
      console.log('[AssetNFT] Using UNIVERSAL contract address:', this.universalAssetContract.target);

      // Generate metadata URI
      const tokenURI = await this.generatePropertyMetadataURI(propertyData);

      // Prepare metadata for Universal Asset Contract
      const metadataKeys = ['address', 'city', 'state', 'country', 'postalCode', 'propertyType', 'bedrooms', 'bathrooms', 'squareMeters', 'builtArea', 'yearBuilt', 'cadastralId'];
      const metadataValues = [
        propertyData.fullAddress,
        propertyData.city,
        propertyData.state,
        propertyData.country,
        propertyData.postalCode,
        propertyData.propertyType.toString(),
        propertyData.bedrooms?.toString() || '0',
        propertyData.bathrooms?.toString() || '0',
        propertyData.squareMeters?.toString() || '0',
        propertyData.builtArea?.toString() || '0',
        propertyData.yearBuilt?.toString() || '0',
        propertyData.cadastralId
      ];

      // Use Universal Asset Contract to create NFT
      const tx = await this.universalAssetContract.createAsset(
        propertyData.cadastralId, // assetId (Cadastral ID)
        assetType,                // assetType (1=PROPERTY)
        ownerAddress,             // owner
        metadataKeys,            // metadataKeys
        metadataValues,          // metadataValues
        tokenURI                 // _tokenURI (moved to last position)
      );

      const receipt = await tx.wait();
      
      // Extract token ID from Transfer event (ERC-721 standard)
      let tokenId = '0';
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.universalAssetContract.interface.parseLog(log);
          if (parsedLog?.name === 'Transfer' && parsedLog.args[0] === '0x0000000000000000000000000000000000000000') {
            // This is a mint (from zero address)
            tokenId = parsedLog.args[2]?.toString();
            break;
          }
        } catch (e) {
          // Skip logs that can't be parsed
          continue;
        }
      }

      console.log('[AssetNFT] Property NFT created with Universal contract:', { tokenId, transactionHash: receipt.hash });

      return {
        tokenId: tokenId || '0',
        transactionHash: receipt.hash
      };
    } catch (error) {
      console.error('[AssetNFT] Error creating property NFT:', error);
      throw new Error(`Failed to create property NFT: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transfer asset when payment is completed
   */
  async transferAssetOnPaymentCompletion(
    tokenId: string,
    newOwnerAddress: string,
    salePrice: string,
    paymentId: string
  ): Promise<string> {
    try {
      console.log('[AssetNFT] Transferring asset on payment completion:', {
        tokenId,
        newOwnerAddress,
        salePrice,
        paymentId
      });

      const salePriceWei = ethers.parseEther(salePrice);

      const tx = await this.universalAssetContract.transferAssetWithEscrow(
        tokenId,
        newOwnerAddress,
        salePriceWei,
        paymentId // Use payment ID as escrow ID
      );

      const receipt = await tx.wait();
      console.log('[AssetNFT] Asset transferred:', receipt.hash);

      return receipt.hash;
    } catch (error) {
      console.error('[AssetNFT] Error transferring asset:', error);
      throw new Error(`Failed to transfer asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add maintenance record to vehicle
   */
  async addVehicleMaintenance(
    tokenId: string,
    newMileage: number,
    serviceLocation: string,
    description: string,
    supportingDocs: string[] = []
  ): Promise<string> {
    try {
      console.log('[AssetNFT] Adding vehicle maintenance:', { tokenId, newMileage, serviceLocation });
      
      // NOTE: This function is deprecated - use addMaintenanceRecord instead
      throw new Error('addVehicleMaintenance is deprecated. Use addMaintenanceRecord instead.');
    } catch (error) {
      console.error('[AssetNFT] Error adding vehicle maintenance:', error);
      throw new Error(`Failed to add vehicle maintenance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add property appraisal
   */
  async addPropertyAppraisal(
    tokenId: string,
    appraisalValue: string,
    appraiserName: string,
    appraisalReportHash: string,
    supportingDocs: string[] = []
  ): Promise<string> {
    try {
      console.log('[AssetNFT] Adding property appraisal:', { tokenId, appraisalValue, appraiserName });
      
      // NOTE: This function is deprecated - use addInspectionRecord instead
      throw new Error('addPropertyAppraisal is deprecated. Use addInspectionRecord instead.');
    } catch (error) {
      console.error('[AssetNFT] Error adding property appraisal:', error);
      throw new Error(`Failed to add property appraisal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get vehicle data by VIN
   */
  async getVehicleByVIN(vin: string): Promise<any> {
    try {
      // NOTE: This function is deprecated - use getAssetMetadata with Universal contract instead
      throw new Error('getVehicleByVIN is deprecated. Use getAssetMetadata instead.');
    } catch (error) {
      console.error('[AssetNFT] Error getting vehicle by VIN:', error);
      throw new Error(`Failed to get vehicle: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get property data by cadastral ID
   */
  async getPropertyByCadastralId(cadastralId: string): Promise<any> {
    try {
      // NOTE: This function is deprecated - use getAssetMetadata with Universal contract instead
      throw new Error('getPropertyByCadastralId is deprecated. Use getAssetMetadata instead.');
    } catch (error) {
      console.error('[AssetNFT] Error getting property by cadastral ID:', error);
      throw new Error(`Failed to get property: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get enhanced asset history with Spanish translations and full metadata
   */
  async getAssetHistory(tokenId: string): Promise<any> {
    try {
      if (!this.universalAssetContract) {
        throw new Error('Universal Asset Contract not initialized');
      }

      console.log('[AssetNFT] Getting enhanced asset history for token:', tokenId);
      
      const historyLength = Number(await this.universalAssetContract.getAssetHistoryLength(tokenId));
      const history = [];

      for (let i = 0; i < historyLength; i++) {
        const event = await this.universalAssetContract.getAssetEvent(tokenId, i);
        
        // Parse the 6 fields returned by getAssetEvent:
        // [eventType, timestamp, authorizedBy, description, transactionAmount, supportingDocs]
        const eventTypeNumber = Number(event[0]);
        const timestamp = new Date(Number(event[1]) * 1000);
        const authorizedBy = event[2];
        const description = event[3];
        const transactionAmount = ethers.formatEther(event[4]);
        const supportingDocs = event[5] || [];
        
        // For now, custom fields are empty since the contract doesn't support them yet
        const customFields: { [key: string]: string } = {};

        // Enhanced event with Spanish translations and full metadata
        const enhancedEvent = {
          // Original data
          eventType: eventTypeNumber,
          timestamp,
          authorizedBy,
          description,
          transactionAmount,
          supportingDocs,
          customFields,
          
          // Enhanced Spanish translations and metadata
          eventTypeSpanish: this.getEventTypeSpanish(eventTypeNumber),
          eventIcon: this.getEventIcon(eventTypeNumber),
          eventColor: this.getEventColor(eventTypeNumber),
          formattedDate: this.formatDateSpanish(timestamp),
          formattedTime: this.formatTimeSpanish(timestamp),
          relativeTime: this.getRelativeTimeSpanish(timestamp),
          
          // Enhanced descriptions
          enhancedDescription: this.getEnhancedDescription(eventTypeNumber, description, customFields),
          technicalDetails: this.getTechnicalDetails(eventTypeNumber, customFields, transactionAmount),
          
          // Trust and verification indicators
          isVerified: authorizedBy !== '0x0000000000000000000000000000000000000000',
          verificationLevel: this.getVerificationLevel(eventTypeNumber, authorizedBy),
          trustScore: this.calculateTrustScore(eventTypeNumber, customFields, supportingDocs.length),
          
          // Document analysis
          documentCount: supportingDocs.length,
          hasDocuments: supportingDocs.length > 0,
          documentTypes: this.analyzeDocumentTypes(supportingDocs),
          
          // Business impact
          impactLevel: this.getImpactLevel(eventTypeNumber),
          affectsValue: this.affectsAssetValue(eventTypeNumber),
          
          // Index for ordering
          sequenceNumber: i + 1,
          isLatest: i === historyLength - 1
        };

        history.push(enhancedEvent);
      }

      // Sort by timestamp (newest first) and add additional metadata
      const sortedHistory = history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      // Add summary statistics
      const summary = this.generateHistorySummary(sortedHistory);
      
      console.log(`[AssetNFT] Retrieved ${sortedHistory.length} enhanced history events for token ${tokenId}`);
      
      return {
        events: sortedHistory,
        summary,
        totalEvents: sortedHistory.length,
        lastUpdated: sortedHistory.length > 0 ? sortedHistory[0].timestamp : null,
        verificationStatus: this.getOverallVerificationStatus(sortedHistory)
      };
      
    } catch (error) {
      console.error('[AssetNFT] Error getting enhanced asset history:', error);
      throw new Error(`Failed to get asset history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }



  /**
   * Generate vehicle metadata URI using IPFS
   */
  private async generateVehicleMetadataURI(vehicleData: VehicleData): Promise<string> {
    try {
      // Import IPFS service
      const ipfsService = (await import('./ipfsService')).default;
      
      // Upload vehicle image to IPFS
      const imageUrl = await ipfsService.uploadVehicleImage(vehicleData);
      
      const metadata = {
        name: `${vehicleData.make} ${vehicleData.model} (${vehicleData.year})`,
        description: `Gemelo Digital Vehicular certificado por Kustodia. VIN: ${vehicleData.vin}`,
        image: imageUrl,
        external_url: `https://kustodia.mx/verify/${vehicleData.vin}`,
        attributes: [
          { trait_type: "VIN", value: vehicleData.vin },
        { trait_type: "Marca", value: vehicleData.make },
        { trait_type: "Modelo", value: vehicleData.model },
        { trait_type: "Año", value: vehicleData.year.toString() },
        { trait_type: "Color", value: vehicleData.color },
        { trait_type: "Tipo de Combustible", value: vehicleData.fuelType },
        { trait_type: "Cilindraje", value: vehicleData.engineSize?.toString() || "N/A" },
        { trait_type: "Kilometraje", value: vehicleData.currentMileage?.toString() || "0" },
        { trait_type: "Comercial", value: vehicleData.isCommercial ? "Sí" : "No" },
        { trait_type: "Placas", value: vehicleData.plateNumber || "N/A" }
      ],
      kustodia: {
        assetType: "vehicle",
        verified: true,
        createdAt: new Date().toISOString(),
        blockchain: "Arbitrum",
        contract: process.env.UNIVERSAL_ASSET_CONTRACT_ADDRESS
      }
    };

    // Upload metadata to IPFS
    const metadataName = `${vehicleData.make}-${vehicleData.model}-${vehicleData.year}-${vehicleData.vin}`;
    return await ipfsService.uploadMetadata(metadata, metadataName);
    
  } catch (error) {
    console.error('[AssetNFT] Error generating vehicle metadata URI:', error);
    // Fallback to base64 if IPFS fails
    const fallbackMetadata = {
      name: `${vehicleData.make} ${vehicleData.model} (${vehicleData.year})`,
      description: `Gemelo Digital Vehicular - VIN: ${vehicleData.vin}`,
      image: 'https://via.placeholder.com/400x300/667eea/ffffff?text=Kustodia+Vehicle+NFT',
      attributes: [
        { trait_type: "VIN", value: vehicleData.vin },
        { trait_type: "Marca", value: vehicleData.make },
        { trait_type: "Modelo", value: vehicleData.model },
        { trait_type: "Año", value: vehicleData.year.toString() }
      ]
    };
    return `data:application/json;base64,${Buffer.from(JSON.stringify(fallbackMetadata)).toString('base64')}`;
    }
  }

  /**
   * Generate property metadata URI
   */
  private async generatePropertyMetadataURI(propertyData: PropertyData): Promise<string> {
    const metadata = {
      name: `Propiedad ${propertyData.propertyType} - ${propertyData.city}`,
      description: `Gemelo Digital de Propiedad - ID Catastral: ${propertyData.cadastralId}`,
      image: `https://kustodia.mx/api/property-image/${propertyData.cadastralId}`, // Placeholder
      external_url: `https://kustodia.mx/verify/${propertyData.cadastralId}`,
      attributes: [
        { trait_type: "ID Catastral", value: propertyData.cadastralId },
        { trait_type: "Dirección", value: propertyData.fullAddress },
        { trait_type: "Ciudad", value: propertyData.city },
        { trait_type: "Estado", value: propertyData.state },
        { trait_type: "Tipo de Propiedad", value: propertyData.propertyType },
        { trait_type: "Metros Cuadrados", value: propertyData.squareMeters?.toString() || "N/A" },
        { trait_type: "Área Construida", value: propertyData.builtArea?.toString() || "N/A" },
        { trait_type: "Recámaras", value: propertyData.bedrooms?.toString() || "N/A" },
        { trait_type: "Baños", value: propertyData.bathrooms?.toString() || "N/A" },
        { trait_type: "Año de Construcción", value: propertyData.yearBuilt?.toString() || "N/A" }
      ],
      kustodia: {
        assetType: "property",
        verified: true,
        createdAt: new Date().toISOString(),
        blockchain: "Arbitrum",
        contract: process.env.PROPERTY_ASSET_CONTRACT_ADDRESS
      }
    };

    // TODO: Upload to IPFS and return IPFS hash
    return `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`;
  }

  /**
   * Get asset metadata from Universal Asset Contract
   */
  async getAssetMetadata(tokenId: string): Promise<any> {
    try {
      if (!this.universalAssetContract) {
        throw new Error('Universal Asset Contract not initialized');
      }

      console.log('[AssetNFT] Getting asset metadata for token:', tokenId);

      // Get basic info that we can retrieve
      const tokenURI = await this.universalAssetContract.tokenURI(tokenId);
      const owner = await this.universalAssetContract.ownerOf(tokenId);
      
      // Get vehicle metadata by calling individual keys
      // These are the keys we stored when creating the vehicle NFT
      const metadataKeys = ['make', 'model', 'year', 'vin', 'engineNumber', 'color', 'fuelType', 'engineSize', 'currentMileage', 'isCommercial', 'plateNumber'];
      const metadata: Record<string, any> = {};
      
      for (const key of metadataKeys) {
        try {
          const value = await this.universalAssetContract.getAssetMetadata(tokenId, key);
          console.log(`[AssetNFT] Key '${key}' raw value:`, value);
          if (value && value.trim() !== '') {
            metadata[key] = value;
            console.log(`[AssetNFT] Key '${key}' stored as:`, value);
          } else {
            console.log(`[AssetNFT] Key '${key}' is empty or null`);
          }
        } catch (keyError) {
          console.log(`[AssetNFT] Could not retrieve metadata for key '${key}':`, keyError);
          // Continue with other keys
        }
      }
      
      console.log('[AssetNFT] Retrieved metadata object:', metadata);
      
      // Get asset history
      const historyLength = await this.universalAssetContract.getAssetHistoryLength(tokenId);
      const history = [];

      for (let i = 0; i < historyLength; i++) {
        try {
          const event = await this.universalAssetContract.getAssetEvent(tokenId, i);
          history.push({
            eventType: event[0],
            timestamp: new Date(Number(event[1]) * 1000),
            authorizedBy: event[2],
            description: event[3],
            transactionAmount: ethers.formatEther(event[4]),
            supportingDocs: event[5]
          });
        } catch (eventError) {
          console.log(`[AssetNFT] Could not retrieve event ${i}:`, eventError);
          // Continue with other events
        }
      }

      return {
        tokenId: tokenId.toString(),
        assetId: `asset_${tokenId}`, // We don't have access to the actual assetId
        assetType: 'vehicle', // Assume vehicle for now
        owner,
        tokenURI,
        createdAt: new Date(), // We don't have access to creation date
        lastUpdated: new Date(), // We don't have access to last updated
        metadata, // This contains the actual car data (make, model, year, etc.)
        history
      };
    } catch (error) {
      console.error('[AssetNFT] Error getting asset metadata:', error);
      throw new Error(`Failed to get asset metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add maintenance record to an asset
   */
  async addMaintenanceRecord(tokenId: string, maintenanceData: any): Promise<string> {
    try {
      if (!this.universalAssetContract) {
        throw new Error('Universal Asset Contract not initialized');
      }

      console.log('[AssetNFT] Adding maintenance record for token:', tokenId);
      console.log('[AssetNFT] Maintenance data:', maintenanceData);

      // Prepare custom fields for maintenance
      const customFieldKeys = [];
      const customFieldValues = [];
      
      if (maintenanceData.serviceType) {
        customFieldKeys.push('serviceType');
        customFieldValues.push(maintenanceData.serviceType);
      }
      if (maintenanceData.provider) {
        customFieldKeys.push('provider');
        customFieldValues.push(maintenanceData.provider);
      }
      if (maintenanceData.mileage) {
        customFieldKeys.push('mileage');
        customFieldValues.push(maintenanceData.mileage.toString());
      }
      if (maintenanceData.cost) {
        customFieldKeys.push('cost');
        customFieldValues.push(maintenanceData.cost.toString());
      }

      // Call addAssetEvent with MAINTENANCE type
      const tx = await this.universalAssetContract.addAssetEvent(
        tokenId,
        3, // EventType.MAINTENANCE (0-indexed: CREATION=0, SALE=1, TRANSFER=2, MAINTENANCE=3)
        maintenanceData.description || 'Maintenance performed',
        ethers.parseEther((maintenanceData.cost || 0).toString()),
        maintenanceData.supportingDocs || [],
        customFieldKeys,
        customFieldValues
      );

      const receipt = await tx.wait();
      console.log('[AssetNFT] Maintenance record added successfully:', receipt.hash);
      
      return receipt.hash;
    } catch (error) {
      console.error('[AssetNFT] Error adding maintenance record:', error);
      throw new Error(`Failed to add maintenance record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add upgrade/modification record to an asset
   */
  async addUpgradeRecord(tokenId: string, upgradeData: any): Promise<string> {
    try {
      if (!this.universalAssetContract) {
        throw new Error('Universal Asset Contract not initialized');
      }

      console.log('[AssetNFT] Adding upgrade record for token:', tokenId);

      const customFieldKeys = [];
      const customFieldValues = [];
      
      if (upgradeData.upgradeType) {
        customFieldKeys.push('upgradeType');
        customFieldValues.push(upgradeData.upgradeType);
      }
      if (upgradeData.provider) {
        customFieldKeys.push('provider');
        customFieldValues.push(upgradeData.provider);
      }
      if (upgradeData.cost) {
        customFieldKeys.push('cost');
        customFieldValues.push(upgradeData.cost.toString());
      }

      const tx = await this.universalAssetContract.addAssetEvent(
        tokenId,
        7, // EventType.UPGRADE
        upgradeData.description || 'Asset upgraded',
        ethers.parseEther((upgradeData.cost || 0).toString()),
        upgradeData.supportingDocs || [],
        customFieldKeys,
        customFieldValues
      );

      const receipt = await tx.wait();
      console.log('[AssetNFT] Upgrade record added successfully:', receipt.hash);
      
      return receipt.hash;
    } catch (error) {
      console.error('[AssetNFT] Error adding upgrade record:', error);
      throw new Error(`Failed to add upgrade record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all assets owned by a user
   */
  async getUserAssets(userAddress: string): Promise<Array<{ tokenId: string; createdAt?: string }>> {
    try {
      if (!this.universalAssetContract) {
        throw new Error('Universal Asset Contract not initialized');
      }

      console.log('[AssetNFT] Getting assets for user:', userAddress);

      // Use getOwnerAssets function from Universal Asset Contract
      const ownedTokenIds = await this.universalAssetContract.getOwnerAssets(userAddress);
      
      console.log('[AssetNFT] Raw owned token IDs:', ownedTokenIds);

      const userAssets = [];
      
      // Convert BigNumber token IDs to strings
      for (const tokenId of ownedTokenIds) {
        try {
          userAssets.push({
            tokenId: tokenId.toString(),
            createdAt: new Date().toISOString() // We could get this from events if needed
          });
        } catch (error) {
          console.error(`[AssetNFT] Error processing token ID ${tokenId}:`, error);
          // Continue with other tokens
        }
      }

      console.log('[AssetNFT] Found', userAssets.length, 'assets for user:', userAssets);
      return userAssets;
    } catch (error) {
      console.error('[AssetNFT] Error getting user assets:', error);
      throw new Error(`Failed to get user assets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get asset owner
   */
  async getAssetOwner(tokenId: string): Promise<string> {
    try {
      if (!this.universalAssetContract) {
        throw new Error('Universal Asset Contract not initialized');
      }

      const owner = await this.universalAssetContract.ownerOf(tokenId);
      return owner;
    } catch (error) {
      console.error('[AssetNFT] Error getting asset owner:', error);
      throw new Error(`Failed to get asset owner: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add inspection record to an asset
   */
  async addInspectionRecord(tokenId: string, inspectionData: any): Promise<string> {
    try {
      if (!this.universalAssetContract) {
        throw new Error('Universal Asset Contract not initialized');
      }

      console.log('[AssetNFT] Adding inspection record for token:', tokenId);

      const customFieldKeys = [];
      const customFieldValues = [];
      
      if (inspectionData.inspectorName) {
        customFieldKeys.push('inspector');
        customFieldValues.push(inspectionData.inspectorName);
      }
      if (inspectionData.result) {
        customFieldKeys.push('result');
        customFieldValues.push(inspectionData.result);
      }
      if (inspectionData.score) {
        customFieldKeys.push('score');
        customFieldValues.push(inspectionData.score.toString());
      }

      const tx = await this.universalAssetContract.addAssetEvent(
        tokenId,
        4, // EventType.INSPECTION
        inspectionData.description || 'Asset inspected',
        0,
        inspectionData.supportingDocs || [],
        customFieldKeys,
        customFieldValues
      );

      const receipt = await tx.wait();
      console.log('[AssetNFT] Inspection record added successfully:', receipt.hash);
      
      return receipt.hash;
    } catch (error) {
      console.error('[AssetNFT] Error adding inspection record:', error);
      throw new Error(`Failed to add inspection record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // ENHANCED HISTORY HELPER FUNCTIONS
  // ============================================================================

  /**
   * Get Spanish translation for event types
   */
  private getEventTypeSpanish(eventType: number): string {
    const eventTypeMap: { [key: number]: string } = {
      0: 'Creación del NFT',
      1: 'Venta',
      2: 'Transferencia',
      3: 'Mantenimiento',
      4: 'Inspección',
      5: 'Daño Reportado',
      6: 'Reparación',
      7: 'Mejora/Actualización',
      8: 'Renta',
      9: 'Arrendamiento',
      10: 'Reclamo de Seguro',
      11: 'Acción Legal',
      12: 'Verificación Kustodia',
      13: 'Evento Personalizado'
    };
    return eventTypeMap[eventType] || `Evento Tipo ${eventType}`;
  }

  /**
   * Get icon for event types
   */
  private getEventIcon(eventType: number): string {
    const iconMap: { [key: number]: string } = {
      0: '🆕', // Creation
      1: '💰', // Sale
      2: '🔄', // Transfer
      3: '🔧', // Maintenance
      4: '🔍', // Inspection
      5: '⚠️', // Damage
      6: '🛠️', // Repair
      7: '⬆️', // Upgrade
      8: '🏠', // Rental
      9: '📋', // Lease
      10: '🛡️', // Insurance
      11: '⚖️', // Legal
      12: '✅', // Verification
      13: '📝'  // Custom
    };
    return iconMap[eventType] || '📄';
  }

  /**
   * Get color theme for event types
   */
  private getEventColor(eventType: number): string {
    const colorMap: { [key: number]: string } = {
      0: '#10B981', // Green - Creation
      1: '#F59E0B', // Amber - Sale
      2: '#3B82F6', // Blue - Transfer
      3: '#8B5CF6', // Purple - Maintenance
      4: '#06B6D4', // Cyan - Inspection
      5: '#EF4444', // Red - Damage
      6: '#F97316', // Orange - Repair
      7: '#84CC16', // Lime - Upgrade
      8: '#6366F1', // Indigo - Rental
      9: '#EC4899', // Pink - Lease
      10: '#14B8A6', // Teal - Insurance
      11: '#DC2626', // Red - Legal
      12: '#059669', // Emerald - Verification
      13: '#6B7280'  // Gray - Custom
    };
    return colorMap[eventType] || '#6B7280';
  }

  /**
   * Format date in Spanish
   */
  private formatDateSpanish(date: Date): string {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} de ${month} de ${year}`;
  }

  /**
   * Format time in Spanish
   */
  private formatTimeSpanish(date: Date): string {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Get relative time in Spanish
   */
  private getRelativeTimeSpanish(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 365) {
      const years = Math.floor(diffDays / 365);
      return `hace ${years} año${years > 1 ? 's' : ''}`;
    } else if (diffDays > 30) {
      const months = Math.floor(diffDays / 30);
      return `hace ${months} mes${months > 1 ? 'es' : ''}`;
    } else if (diffDays > 0) {
      return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return 'hace un momento';
    }
  }

  /**
   * Get enhanced description with context
   */
  private getEnhancedDescription(eventType: number, description: string, customFields: { [key: string]: string }): string {
    let enhanced = description;

    switch (eventType) {
      case 0: // Creation
        enhanced = `Gemelo digital creado y registrado en blockchain. ${description}`;
        break;
      case 1: // Sale
        if (customFields.salePrice) {
          enhanced = `Venta realizada por $${customFields.salePrice} MXN. ${description}`;
        }
        break;
      case 3: // Maintenance
        if (customFields.serviceProvider) {
          enhanced = `Mantenimiento realizado por ${customFields.serviceProvider}. ${description}`;
        }
        if (customFields.newMileage) {
          enhanced += ` Kilometraje actualizado: ${customFields.newMileage} km.`;
        }
        break;
      case 4: // Inspection
        if (customFields.inspector && customFields.result) {
          enhanced = `Inspección realizada por ${customFields.inspector} con resultado: ${customFields.result}. ${description}`;
        }
        break;
      case 7: // Upgrade
        if (customFields.upgradeType && customFields.cost) {
          enhanced = `Mejora tipo ${customFields.upgradeType} con costo de $${customFields.cost} MXN. ${description}`;
        }
        break;
    }

    return enhanced;
  }

  /**
   * Get technical details for transparency
   */
  private getTechnicalDetails(eventType: number, customFields: { [key: string]: string }, transactionAmount: string): any {
    const details: any = {
      eventTypeCode: eventType,
      blockchainVerified: true,
      customData: customFields
    };

    if (parseFloat(transactionAmount) > 0) {
      details.transactionValue = `${transactionAmount} ETH`;
      details.hasMonetaryValue = true;
    }

    // Add specific technical details based on event type
    switch (eventType) {
      case 3: // Maintenance
        details.serviceType = 'Mantenimiento Vehicular';
        details.affectsWarranty = customFields.affectsWarranty === 'true';
        break;
      case 4: // Inspection
        details.inspectionType = 'Inspección Oficial';
        details.certificationLevel = customFields.certificationLevel || 'Estándar';
        break;
      case 7: // Upgrade
        details.upgradeCategory = customFields.upgradeType || 'General';
        details.valueImpact = customFields.valueImpact || 'Neutral';
        break;
    }

    return details;
  }

  /**
   * Get verification level
   */
  private getVerificationLevel(eventType: number, authorizedBy: string): string {
    if (authorizedBy === '0x0000000000000000000000000000000000000000') {
      return 'No Verificado';
    }

    // Check if it's a Kustodia authorized address (you'd maintain a list)
    const isKustodiaAuthorized = true; // Simplified for now
    
    if (isKustodiaAuthorized) {
      return 'Verificado por Kustodia';
    }

    return 'Verificado por Tercero';
  }

  /**
   * Calculate trust score - Vehicle Care Oriented Logic
   * Higher scores for better vehicle maintenance and care
   */
  private calculateTrustScore(eventType: number, customFields: { [key: string]: string }, documentCount: number): number {
    let score = 60; // Higher base score for vehicle care

    // STRONG bonus for documentation (proves care and transparency)
    score += Math.min(documentCount * 15, 40); // Increased from 10 to 15 points per document

    // Bonus for detailed maintenance records
    score += Math.min(Object.keys(customFields).length * 8, 25); // Increased from 5 to 8 points

    // Vehicle Care Oriented Event Scoring
    switch (eventType) {
      case 0: // Creation - Good baseline
        score += 15;
        break;
      case 3: // Maintenance - EXCELLENT for vehicle care!
        score += 25; // Increased from 15 - maintenance shows responsible ownership
        if (customFields.serviceProvider === 'Agencia/Concesionario') {
          score += 10; // Bonus for official service
        }
        if (customFields.cost && parseFloat(customFields.cost) > 1000) {
          score += 5; // Bonus for significant investment in vehicle care
        }
        break;
      case 4: // Inspection - EXCELLENT for transparency
        score += 30; // Increased from 25 - inspections show proactive care
        break;
      case 6: // Repair - Good, shows maintenance
        score += 20; // Repairs show responsible ownership
        break;
      case 7: // Upgrade - Excellent, adds value
        score += 25; // Upgrades show investment in vehicle
        break;
      case 12: // Verification - Perfect
        score += 35; // Highest trust for verification
        break;
      case 5: // Damage - Neutral (transparency is good, but damage affects trust)
        score += 5; // Small bonus for transparency, but damage is concerning
        break;
      case 11: // Legal issues - Negative impact
        score -= 10; // Legal issues reduce trust
        break;
    }

    // Bonus for recent activity (shows ongoing care)
    const hasRecentActivity = true; // You could check if event is within last 6 months
    if (hasRecentActivity && [3, 4, 6, 7].includes(eventType)) {
      score += 5; // Bonus for recent maintenance/inspection activity
    }

    return Math.min(score, 100);
  }

  /**
   * Analyze document types
   */
  private analyzeDocumentTypes(supportingDocs: string[]): string[] {
    const types: string[] = [];
    
    supportingDocs.forEach(doc => {
      if (doc.includes('receipt') || doc.includes('factura')) {
        types.push('Factura/Recibo');
      } else if (doc.includes('photo') || doc.includes('imagen')) {
        types.push('Fotografía');
      } else if (doc.includes('certificate') || doc.includes('certificado')) {
        types.push('Certificado');
      } else if (doc.includes('report') || doc.includes('reporte')) {
        types.push('Reporte Técnico');
      } else {
        types.push('Documento');
      }
    });

    return [...new Set(types)]; // Remove duplicates
  }

  /**
   * Get impact level - Vehicle Care Perspective
   * Positive maintenance should have positive impact
   */
  private getImpactLevel(eventType: number): string {
    const impactMap: { [key: number]: string } = {
      0: 'Alto',      // Creation - High positive impact
      1: 'Alto',      // Sale - High impact on ownership
      2: 'Alto',      // Transfer - High impact on ownership
      3: 'Alto',      // Maintenance - HIGH POSITIVE impact (vehicle care!)
      4: 'Alto',      // Inspection - HIGH POSITIVE impact (transparency!)
      5: 'Alto',      // Damage - High negative impact
      6: 'Alto',      // Repair - High positive impact (fixing issues)
      7: 'Alto',      // Upgrade - High positive impact (value addition)
      8: 'Bajo',      // Rental - Low impact
      9: 'Medio',     // Lease - Medium impact
      10: 'Alto',     // Insurance - High impact
      11: 'Alto',     // Legal - High negative impact
      12: 'Alto',     // Verification - High positive impact
      13: 'Bajo'      // Custom
    };
    return impactMap[eventType] || 'Bajo';
  }

  /**
   * Check if event affects asset value
   */
  private affectsAssetValue(eventType: number): boolean {
    const valueAffectingEvents = [1, 3, 5, 6, 7, 10, 11]; // Sale, Maintenance, Damage, Repair, Upgrade, Insurance, Legal
    return valueAffectingEvents.includes(eventType);
  }

  /**
   * Generate history summary
   */
  private generateHistorySummary(history: any[]): any {
    const summary = {
      totalEvents: history.length,
      eventTypes: {} as { [key: string]: number },
      lastMaintenance: null as Date | null,
      totalMaintenanceCost: 0,
      verificationCount: 0,
      averageTrustScore: 0,
      hasRecentActivity: false,
      riskFactors: [] as string[],
      valueEvents: 0
    };

    let totalTrustScore = 0;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    history.forEach(event => {
      // Count event types
      const eventTypeSpanish = event.eventTypeSpanish;
      summary.eventTypes[eventTypeSpanish] = (summary.eventTypes[eventTypeSpanish] || 0) + 1;

      // Track maintenance
      if (event.eventType === 3) {
        if (!summary.lastMaintenance || event.timestamp > summary.lastMaintenance) {
          summary.lastMaintenance = event.timestamp;
        }
        if (event.customFields.cost) {
          summary.totalMaintenanceCost += parseFloat(event.customFields.cost) || 0;
        }
      }

      // Count verifications
      if (event.eventType === 12 || event.isVerified) {
        summary.verificationCount++;
      }

      // Calculate average trust score
      totalTrustScore += event.trustScore;

      // Check recent activity
      if (event.timestamp > thirtyDaysAgo) {
        summary.hasRecentActivity = true;
      }

      // Identify risk factors
      if (event.eventType === 5) { // Damage
        summary.riskFactors.push('Historial de daños');
      }
      if (event.eventType === 11) { // Legal
        summary.riskFactors.push('Problemas legales');
      }
      if (event.trustScore < 60) {
        summary.riskFactors.push('Eventos con baja confiabilidad');
      }

      // Count value-affecting events
      if (event.affectsValue) {
        summary.valueEvents++;
      }
    });

    summary.averageTrustScore = history.length > 0 ? Math.round(totalTrustScore / history.length) : 0;
    summary.riskFactors = [...new Set(summary.riskFactors)]; // Remove duplicates

    return summary;
  }

  /**
   * Get overall verification status
   */
  private getOverallVerificationStatus(history: any[]): any {
    const verifiedEvents = history.filter(event => event.isVerified).length;
    const verificationPercentage = history.length > 0 ? Math.round((verifiedEvents / history.length) * 100) : 0;
    
    let status = 'Bajo';
    let color = '#EF4444';
    
    if (verificationPercentage >= 80) {
      status = 'Excelente';
      color = '#10B981';
    } else if (verificationPercentage >= 60) {
      status = 'Bueno';
      color = '#F59E0B';
    } else if (verificationPercentage >= 40) {
      status = 'Regular';
      color = '#F97316';
    }

    return {
      status,
      percentage: verificationPercentage,
      color,
      verifiedEvents,
      totalEvents: history.length
    };
  }

  // ============================================================================
  // ASSET CONSULTATION FUNCTIONS
  // ============================================================================

  /**
   * Get basic asset information from contract
   */
  async getAsset(tokenId: string): Promise<any> {
    try {
      if (!this.universalAssetContract) {
        throw new Error('Universal Asset Contract not initialized');
      }

      console.log('[AssetNFT] Getting basic asset info for token:', tokenId);
      
      // Check if token exists first
      try {
        await this.universalAssetContract.ownerOf(tokenId);
      } catch (error) {
        console.log('[AssetNFT] Token does not exist:', tokenId);
        return null;
      }

      // Get basic asset data using getAsset function
      const assetData = await this.universalAssetContract.getAsset(tokenId);
      
      // Parse the returned data: [assetId, assetType, owner, verified, createdAt, tokenURI]
      const [assetId, assetType, owner, verified, createdAt, tokenURI] = assetData;
      
      return {
        tokenId: tokenId.toString(),
        assetId,
        assetType: Number(assetType),
        owner,
        verified,
        createdAt: new Date(Number(createdAt) * 1000),
        tokenURI
      };
    } catch (error) {
      console.error('[AssetNFT] Error getting asset:', error);
      throw new Error(`Failed to get asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get token ID by asset ID
   */
  async getTokenIdByAssetId(assetId: string): Promise<string | null> {
    try {
      if (!this.universalAssetContract) {
        throw new Error('Universal Asset Contract not initialized');
      }

      console.log('[AssetNFT] Getting token ID for asset ID:', assetId);
      
      const tokenId = await this.universalAssetContract.assetIdToTokenId(assetId);
      
      // Check if token ID is valid (not 0)
      if (tokenId.toString() === '0') {
        console.log('[AssetNFT] Asset ID not found:', assetId);
        return null;
      }
      
      return tokenId.toString();
    } catch (error) {
      console.error('[AssetNFT] Error getting token ID by asset ID:', error);
      throw new Error(`Failed to get token ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if token exists
   */
  async tokenExists(tokenId: string): Promise<boolean> {
    try {
      if (!this.universalAssetContract) {
        throw new Error('Universal Asset Contract not initialized');
      }

      try {
        await this.universalAssetContract.ownerOf(tokenId);
        return true;
      } catch (error) {
        return false;
      }
    } catch (error) {
      console.error('[AssetNFT] Error checking token existence:', error);
      return false;
    }
  }

  /**
   * Get asset event count (for history)
   */
  async getAssetEventCount(tokenId: string): Promise<number> {
    try {
      if (!this.universalAssetContract) {
        throw new Error('Universal Asset Contract not initialized');
      }

      // Check if token exists first
      const exists = await this.tokenExists(tokenId);
      if (!exists) {
        console.log('[AssetNFT] Token does not exist, returning 0 events:', tokenId);
        return 0;
      }

      console.log('[AssetNFT] Getting event count for token:', tokenId);
      
      const count = await this.universalAssetContract.getAssetEventCount(tokenId);
      return Number(count);
    } catch (error) {
      console.error('[AssetNFT] Error getting asset event count:', error);
      // Return 0 instead of throwing to handle gracefully
      return 0;
    }
  }

  /**
   * Get asset event by index
   */
  async getAssetEvent(tokenId: string, eventIndex: number): Promise<any> {
    try {
      if (!this.universalAssetContract) {
        throw new Error('Universal Asset Contract not initialized');
      }

      // Check if token exists first
      const exists = await this.tokenExists(tokenId);
      if (!exists) {
        console.log('[AssetNFT] Token does not exist:', tokenId);
        return null;
      }

      console.log('[AssetNFT] Getting event', eventIndex, 'for token:', tokenId);
      
      const event = await this.universalAssetContract.getAssetEvent(tokenId, eventIndex);
      
      // Parse the event data based on contract return format
      return {
        eventType: Number(event[0]),
        timestamp: new Date(Number(event[1]) * 1000),
        authorizedBy: event[2],
        description: event[3],
        transactionAmount: ethers.formatEther(event[4]),
        supportingDocs: event[5] || []
      };
    } catch (error) {
      console.error('[AssetNFT] Error getting asset event:', error);
      throw new Error(`Failed to get asset event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new AssetNFTService();
