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
      {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
      {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousAdmin","type":"address"},{"indexed":false,"internalType":"address","name":"newAdmin","type":"address"}],"name":"AdminChanged","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"string","name":"assetId","type":"string"},{"indexed":false,"internalType":"enum AssetManagementLib.AssetType","name":"assetType","type":"uint8"},{"indexed":true,"internalType":"address","name":"owner","type":"address"}],"name":"AssetCreated","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"enum AssetManagementLib.EventType","name":"eventType","type":"uint8"},{"indexed":false,"internalType":"string","name":"description","type":"string"}],"name":"AssetEventAdded","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"AssetTransferred","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"verifier","type":"address"}],"name":"AssetVerified","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_fromTokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_toTokenId","type":"uint256"}],"name":"BatchMetadataUpdate","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"beacon","type":"address"}],"name":"BeaconUpgraded","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"version","type":"uint8"}],"name":"Initialized","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"MetadataUpdate","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},
      {"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
      {"inputs":[],"name":"KUSTODIA_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
      {"inputs":[],"name":"PAUSER_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
      {"inputs":[],"name":"UPDATER_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
      {"inputs":[],"name":"VERIFIER_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
      {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"enum AssetManagementLib.EventType","name":"eventType","type":"uint8"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"transactionAmount","type":"uint256"},{"internalType":"string[]","name":"supportingDocs","type":"string[]"}],"name":"addAssetEvent","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"assetHistory","outputs":[{"internalType":"enum AssetManagementLib.EventType","name":"eventType","type":"uint8"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"address","name":"authorizedBy","type":"address"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"transactionAmount","type":"uint256"}],"stateMutability":"view","type":"function"},
      {"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"assetIdToTokenId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
      {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"assets","outputs":[{"internalType":"string","name":"assetId","type":"string"},{"internalType":"enum AssetManagementLib.AssetType","name":"assetType","type":"uint8"},{"internalType":"address","name":"currentOwner","type":"address"},{"internalType":"uint256","name":"creationDate","type":"uint256"},{"internalType":"uint256","name":"lastUpdated","type":"uint256"},{"internalType":"bool","name":"isVerified","type":"bool"},{"internalType":"bool","name":"isActive","type":"bool"}],"stateMutability":"view","type":"function"},
      {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
      {"inputs":[{"internalType":"string","name":"assetId","type":"string"},{"internalType":"enum AssetManagementLib.AssetType","name":"assetType","type":"uint8"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"string[]","name":"metadataKeys","type":"string[]"},{"internalType":"string[]","name":"metadataValues","type":"string[]"},{"internalType":"string","name":"_tokenURI","type":"string"}],"name":"createAsset","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
      {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getAsset","outputs":[{"internalType":"string","name":"assetId","type":"string"},{"internalType":"enum AssetManagementLib.AssetType","name":"assetType","type":"uint8"},{"internalType":"address","name":"currentOwner","type":"address"},{"internalType":"uint256","name":"creationDate","type":"uint256"},{"internalType":"bool","name":"isVerified","type":"bool"},{"internalType":"bool","name":"isActive","type":"bool"}],"stateMutability":"view","type":"function"},
      {"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
      {"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
      {"inputs":[{"internalType":"address","name":"escrowAddress","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
      {"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
      {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"ownerAssets","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
      {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
      {"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
      {"inputs":[],"name":"proxiableUUID","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
      {"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
      {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
      {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
      {"inputs":[],"name":"totalAssets","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
      {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[{"internalType":"address","name":"newImplementation","type":"address"}],"name":"upgradeTo","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[{"internalType":"address","name":"newImplementation","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"stateMutability":"payable","type":"function"},
      {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"verifyAsset","outputs":[],"stateMutability":"nonpayable","type":"function"}
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

      // Check if Asset ID (VIN) already exists
      try {
        const existingTokenId = await this.universalAssetContract.assetIdToTokenId(vehicleData.vin);
        if (existingTokenId && existingTokenId.toString() !== '0') {
          throw new Error(`Asset ID (VIN) '${vehicleData.vin}' already exists as Token ID ${existingTokenId}`);
        }
      } catch (error: any) {
        // If the error is about asset already existing, throw it
        if (error.message.includes('already exists')) {
          throw error;
        }
        // Otherwise, continue (asset doesn't exist, which is what we want)
        console.log('[AssetNFT] Asset ID check passed - VIN does not exist yet');
      }

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
      
      // Check if token exists first
      const exists = await this.tokenExists(tokenId);
      if (!exists) {
        console.log('[AssetNFT] Token does not exist:', tokenId);
        return {
          events: [],
          summary: this.generateHistorySummary([]),
          verificationStatus: this.getOverallVerificationStatus([]),
          publicAccess: true
        };
      }
      
      // Since getAssetEventCount doesn't exist, iterate through assetHistory mapping
      console.log('[AssetNFT] Iterating through asset history for token:', tokenId);
      const history = [];
      let index = 0;
      const maxEvents = 1000; // Safety limit
      
      while (index < maxEvents) {
        try {
          const event = await this.universalAssetContract.assetHistory(tokenId, index);
          
          // Check if this is an empty/default event (indicates no more events)
          if (!event || event.eventType === 0 || event.eventType === '0') {
            console.log(`[AssetNFT] No more events found at index ${index} for token ${tokenId}`);
            break;
          }
          
          // Parse the event data
          const eventTypeNumber = Number(event.eventType);
          const timestamp = new Date(Number(event.timestamp) * 1000);
          const description = event.description || '';
          const transactionAmount = event.transactionAmount ? ethers.formatEther(event.transactionAmount) : '0';
          const supportingDocs = event.supportingDocs || [];
          const customFieldKeys = event.customFieldKeys || [];
          const customFieldValues = event.customFieldValues || [];
          
          // Build custom fields object
          const customFields: { [key: string]: string } = {};
          for (let i = 0; i < customFieldKeys.length && i < customFieldValues.length; i++) {
            customFields[customFieldKeys[i]] = customFieldValues[i];
          }

          // Enhanced event with Spanish translations and full metadata
          const enhancedEvent = {
            // Original data
            eventType: eventTypeNumber,
            timestamp,
            authorizedBy: '0x0000000000000000000000000000000000000000', // Not available in assetHistory
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
            isVerified: false, // Cannot determine from assetHistory
            verificationLevel: this.getVerificationLevel(eventTypeNumber, '0x0000000000000000000000000000000000000000'),
            trustScore: this.calculateTrustScore(eventTypeNumber, customFields, supportingDocs.length),
            
            // Document analysis
            documentCount: supportingDocs.length,
            hasDocuments: supportingDocs.length > 0,
            documentTypes: this.analyzeDocumentTypes(supportingDocs),
            
            // Business impact
            impactLevel: this.getImpactLevel(eventTypeNumber),
            affectsValue: this.affectsAssetValue(eventTypeNumber),
            
            // Index for ordering
            sequenceNumber: index + 1,
            isLatest: false // Will be set later
          };

          history.push(enhancedEvent);
          index++;
        } catch (eventError: any) {
          console.log(`[AssetNFT] No event at index ${index} for token ${tokenId}: ${eventError.message}`);
          break;
        }
      }
      
      // Mark the latest event
      if (history.length > 0) {
        history[history.length - 1].isLatest = true;
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

      // Check if token exists first
      const exists = await this.tokenExists(tokenId);
      if (!exists) {
        console.log('[AssetNFT] Token does not exist:', tokenId);
        return {
          tokenId,
          exists: false,
          metadata: {},
          tokenURI: '',
          owner: '0x0000000000000000000000000000000000000000',
          history: []
        };
      }

      // Get basic info that we can retrieve
      const tokenURI = await this.universalAssetContract.tokenURI(tokenId);
      const owner = await this.universalAssetContract.ownerOf(tokenId);
      
      // Get asset data using getAsset function (available in implementation ABI)
      let metadata: Record<string, any> = {};
      let assetId = '';
      let assetType = 0;
      
      try {
        const assetData = await this.universalAssetContract.getAsset(tokenId);
        console.log('[AssetNFT] Raw asset data:', assetData);
        
        // Extract asset info from getAsset response
        assetId = assetData[0] || ''; // assetId (VIN)
        assetType = assetData[1] || 0; // assetType
        // assetData[2] is currentOwner (already have from ownerOf)
        // assetData[3] is creationDate
        // assetData[4] is isVerified
        // assetData[5] is isActive
        
        console.log('[AssetNFT] Extracted asset ID (VIN):', assetId);
        console.log('[AssetNFT] Asset type:', assetType);
        
        // Start with basic contract data
        metadata = {
          vin: assetId,
          assetType: assetType,
        };
        
        // Parse TokenURI to extract detailed vehicle metadata
        if (tokenURI) {
          try {
            let tokenMetadata: any = {};
            
            // Handle base64-encoded JSON (data:application/json;base64,...)
            if (tokenURI.startsWith('data:application/json;base64,')) {
              const base64Data = tokenURI.replace('data:application/json;base64,', '');
              const jsonString = Buffer.from(base64Data, 'base64').toString('utf-8');
              tokenMetadata = JSON.parse(jsonString);
              console.log('[AssetNFT] Decoded TokenURI JSON:', tokenMetadata);
            }
            // Handle HTTPS URLs (IPFS or other metadata sources)
            else if (tokenURI.startsWith('https://')) {
              console.log('[AssetNFT] Fetching metadata from tokenURI:', tokenURI);
              // Note: In production, you'd want to fetch this metadata from IPFS
              // For now, we'll use what we have from the contract
            }
            
            // Extract vehicle attributes from tokenMetadata
            if (tokenMetadata.attributes && Array.isArray(tokenMetadata.attributes)) {
              for (const attr of tokenMetadata.attributes) {
                if (attr.trait_type === 'VIN') {
                  metadata.vin = attr.value;
                } else if (attr.trait_type === 'Marca') {
                  metadata.make = attr.value;
                } else if (attr.trait_type === 'Modelo') {
                  metadata.model = attr.value;
                } else if (attr.trait_type === 'Año') {
                  metadata.year = attr.value;
                } else if (attr.trait_type === 'Color') {
                  metadata.color = attr.value;
                } else if (attr.trait_type === 'Tipo de Combustible') {
                  metadata.fuelType = attr.value;
                } else if (attr.trait_type === 'Cilindraje') {
                  metadata.engineSize = attr.value;
                } else if (attr.trait_type === 'Kilometraje') {
                  metadata.currentMileage = attr.value;
                } else if (attr.trait_type === 'Comercial') {
                  metadata.isCommercial = attr.value === 'Sí';
                } else if (attr.trait_type === 'Placas') {
                  metadata.plateNumber = attr.value;
                }
              }
            }
            
            // Also extract name and description if available
            if (tokenMetadata.name) {
              metadata.name = tokenMetadata.name;
            }
            if (tokenMetadata.description) {
              metadata.description = tokenMetadata.description;
            }
            
            console.log('[AssetNFT] Enhanced metadata with TokenURI data:', metadata);
            
          } catch (uriError) {
            console.log('[AssetNFT] Could not parse metadata from tokenURI:', uriError);
            // Continue with basic metadata from contract
          }
        }
        
      } catch (assetError) {
        console.error('[AssetNFT] Could not retrieve asset data:', assetError);
        // Continue with empty metadata
      }
      
      console.log('[AssetNFT] Retrieved metadata object:', metadata);
      
      // Get asset history using assetHistory mapping (no getAssetEventCount available)
      console.log('[AssetNFT] Getting asset history via assetHistory mapping for token:', tokenId);
      const history = [];
      let index = 0;
      const maxEvents = 1000; // Safety limit
      
      while (index < maxEvents) {
        try {
          const event = await this.universalAssetContract.assetHistory(tokenId, index);
          
          // Check if this is an empty/default event (indicates no more events)
          if (!event || event.eventType === 0 || event.eventType === '0') {
            console.log(`[AssetNFT] No more events found at index ${index} for token ${tokenId}`);
            break;
          }
          
          // Parse the event data
          const eventTypeNumber = Number(event.eventType);
          const timestamp = new Date(Number(event.timestamp) * 1000);
          const description = event.description || '';
          const transactionAmount = event.transactionAmount ? ethers.formatEther(event.transactionAmount) : '0';
          
          history.push({
            eventType: eventTypeNumber,
            timestamp,
            authorizedBy: event.authorizedBy || '0x0000000000000000000000000000000000000000',
            description,
            transactionAmount,
            supportingDocs: event.supportingDocs || []
          });
          
          index++;
        } catch (eventError: any) {
          console.log(`[AssetNFT] No event at index ${index} for token ${tokenId}: ${eventError.message}`);
          break;
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

      // Call addAssetEvent with MAINTENANCE type (5-parameter version for deployed contract)
      const tx = await this.universalAssetContract.addAssetEvent(
        tokenId,
        3, // EventType.MAINTENANCE (0-indexed: CREATION=0, SALE=1, TRANSFER=2, MAINTENANCE=3)
        maintenanceData.description || 'Maintenance performed',
        ethers.parseEther((maintenanceData.cost || 0).toString()),
        maintenanceData.supportingDocs || []
        // Note: customFieldKeys and customFieldValues not supported in deployed contract
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
        upgradeData.supportingDocs || []
        // Note: customFieldKeys and customFieldValues not supported in deployed contract
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
   * Add inspection record to an asset
   */
  async addInspectionRecord(tokenId: string, inspectionData: any): Promise<string> {
    try {
      if (!this.universalAssetContract) {
        throw new Error('Universal Asset Contract not initialized');
      }

      console.log('[AssetNFT] Adding inspection record for token:', tokenId);
      console.log('[AssetNFT] Inspection data:', inspectionData);

      // Prepare custom fields for inspection
      const customFieldKeys = [];
      const customFieldValues = [];
      
      if (inspectionData.inspectionType) {
        customFieldKeys.push('inspectionType');
        customFieldValues.push(inspectionData.inspectionType);
      }
      if (inspectionData.inspector) {
        customFieldKeys.push('inspector');
        customFieldValues.push(inspectionData.inspector);
      }
      if (inspectionData.result) {
        customFieldKeys.push('result');
        customFieldValues.push(inspectionData.result);
      }
      if (inspectionData.certificateNumber) {
        customFieldKeys.push('certificateNumber');
        customFieldValues.push(inspectionData.certificateNumber);
      }
      if (inspectionData.expiryDate) {
        customFieldKeys.push('expiryDate');
        customFieldValues.push(inspectionData.expiryDate);
      }
      if (inspectionData.cost) {
        customFieldKeys.push('cost');
        customFieldValues.push(inspectionData.cost.toString());
      }

      // Call addAssetEvent with INSPECTION type (5-parameter version for deployed contract)
      const tx = await this.universalAssetContract.addAssetEvent(
        tokenId,
        4, // EventType.INSPECTION (0-indexed: CREATION=0, SALE=1, TRANSFER=2, MAINTENANCE=3, INSPECTION=4)
        inspectionData.description || 'Inspection performed',
        ethers.parseEther((inspectionData.cost || 0).toString()),
        inspectionData.supportingDocs || []
        // Note: customFieldKeys and customFieldValues not supported in deployed contract
      );

      const receipt = await tx.wait();
      console.log('[AssetNFT] Inspection record added successfully:', receipt.hash);
      
      return receipt.hash;
    } catch (error) {
      console.error('[AssetNFT] Error adding inspection record:', error);
      throw new Error(`Failed to add inspection record: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

      // Get user's NFT balance first
      const balance = await this.universalAssetContract.balanceOf(userAddress);
      console.log('[AssetNFT] User balance:', balance.toString());

      const userAssets = [];
      
      // Iterate through ownerAssets mapping to get all token IDs
      for (let i = 0; i < balance; i++) {
        try {
          const tokenId = await this.universalAssetContract.ownerAssets(userAddress, i);
          if (tokenId && tokenId.toString() !== '0') {
            userAssets.push({
              tokenId: tokenId.toString(),
              createdAt: new Date().toISOString() // We could get this from events if needed
            });
          }
        } catch (error) {
          console.error(`[AssetNFT] Error getting token at index ${i}:`, error);
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
   * Check if a token exists by trying to get its owner
   */
  async tokenExists(tokenId: string): Promise<boolean> {
    try {
      if (!this.universalAssetContract) {
        throw new Error('Universal Asset Contract not initialized');
      }

      console.log('[AssetNFT] Checking if token exists:', tokenId);
      
      // Try to get the owner - this will throw if token doesn't exist
      await this.universalAssetContract.ownerOf(tokenId);
      console.log('[AssetNFT] Token exists:', tokenId);
      return true;
    } catch (error) {
      console.log('[AssetNFT] Token does not exist:', tokenId, error);
      return false;
    }
  }

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

// Create singleton instance
const assetNFTService = new AssetNFTService();

// Export singleton as default
export default assetNFTService;

// Export named functions for direct import by controllers
export const getAssetHistory = (tokenId: string) => assetNFTService.getAssetHistory(tokenId);
export const getAssetMetadata = (tokenId: string) => assetNFTService.getAssetMetadata(tokenId);
export const tokenExists = (tokenId: string) => assetNFTService.tokenExists(tokenId);
export const getAsset = (tokenId: string) => assetNFTService.getAsset(tokenId);
export const getAssetOwner = (tokenId: string) => assetNFTService.getAssetOwner(tokenId);
export const getUserAssets = (userAddress: string) => assetNFTService.getUserAssets(userAddress);
export const getTokenIdByAssetId = (assetId: string) => assetNFTService.getTokenIdByAssetId(assetId);
export const createVehicleNFT = (vehicleData: any, ownerAddress: string, assetType?: number) => assetNFTService.createVehicleNFT(vehicleData, ownerAddress, assetType);
export const createPropertyNFT = (propertyData: any, ownerAddress: string, assetType?: number) => assetNFTService.createPropertyNFT(propertyData, ownerAddress, assetType);
export const addMaintenanceRecord = (tokenId: string, maintenanceData: any) => assetNFTService.addMaintenanceRecord(tokenId, maintenanceData);
export const addUpgradeRecord = (tokenId: string, upgradeData: any) => assetNFTService.addUpgradeRecord(tokenId, upgradeData);
export const addInspectionRecord = (tokenId: string, inspectionData: any) => assetNFTService.addInspectionRecord(tokenId, inspectionData);
