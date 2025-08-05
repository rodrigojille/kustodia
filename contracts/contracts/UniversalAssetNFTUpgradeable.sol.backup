// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title UniversalAssetNFTUpgradeable
 * @dev Upgradeable Universal Asset Provenance NFT System for Kustodia
 * Supports vehicles, real estate, machinery, and any high-value asset
 */
contract UniversalAssetNFTUpgradeable is 
    Initializable,
    ERC721Upgradeable, 
    ERC721URIStorageUpgradeable, 
    AccessControlUpgradeable, 
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable 
{
    using Counters for Counters.Counter;
    
    // Role definitions
    bytes32 public constant KUSTODIA_ROLE = keccak256("KUSTODIA_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant UPDATER_ROLE = keccak256("UPDATER_ROLE");
    
    Counters.Counter private _tokenIdCounter;
    
    // Asset types enum
    enum AssetType {
        VEHICLE,      // Cars, trucks, motorcycles
        PROPERTY,     // Real estate, land
        MACHINERY,    // Industrial equipment, construction
        LUXURY_GOODS, // Jewelry, watches, art
        ELECTRONICS,  // High-end electronics, servers
        AGRICULTURAL, // Tractors, farm equipment
        COMMERCIAL,   // Restaurant equipment, retail
        FURNITURE,    // Designer furniture, antiques
        COLLECTIBLE,  // Coins, memorabilia, instruments
        OTHER         // Expandable for future categories
    }
    
    // Event types for asset history
    enum EventType {
        CREATION,
        SALE,
        TRANSFER,
        MAINTENANCE,
        UPGRADE,
        INSPECTION,
        VERIFICATION,
        DAMAGE,
        REPAIR,
        INSURANCE_CLAIM,
        LEGAL_ACTION,
        REGULATORY_UPDATE,
        OTHER
    }
    
    // Asset data structure
    struct Asset {
        string assetId;
        AssetType assetType;
        address currentOwner;
        uint256 creationDate;
        bool isVerified;
        bool isActive;
        uint256 lastUpdated;
        mapping(string => string) metadata;
    }
    
    // Asset event structure
    struct AssetEvent {
        EventType eventType;
        uint256 timestamp;
        address authorizedBy;
        string description;
        uint256 transactionAmount;
        string[] supportingDocs;
        mapping(string => string) customFields;
    }
    
    // Storage mappings
    mapping(uint256 => Asset) public assets;
    mapping(uint256 => AssetEvent[]) public assetHistory;
    mapping(string => uint256) public assetIdToTokenId; // assetId -> tokenId
    mapping(address => uint256[]) public ownerAssets;   // owner -> tokenIds[]
    
    // Events
    event AssetCreated(uint256 indexed tokenId, string assetId, AssetType assetType, address owner);
    event AssetEventAdded(uint256 indexed tokenId, EventType eventType, string description);
    event AssetTransferred(uint256 indexed tokenId, address from, address to, uint256 amount);
    event AssetVerified(uint256 indexed tokenId, address verifier);
    event AssetMetadataUpdated(uint256 indexed tokenId, string key, string value);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize() public initializer {
        __ERC721_init("Kustodia Universal Asset", "KUA");
        __ERC721URIStorage_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(KUSTODIA_ROLE, msg.sender);
    }
    
    function _authorizeUpgrade(address newImplementation) internal onlyRole(DEFAULT_ADMIN_ROLE) override {}
    
    /**
     * @dev Allow NFT owners to add maintenance events to their own assets
     */
    function addAssetEventByOwner(
        uint256 tokenId,
        EventType eventType,
        string memory description,
        uint256 transactionAmount,
        string[] memory supportingDocs,
        string[] memory customFieldKeys,
        string[] memory customFieldValues
    ) external {
        require(_exists(tokenId), "Asset does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only asset owner can add events");
        require(customFieldKeys.length == customFieldValues.length, "Custom fields arrays length mismatch");
        
        _addAssetEvent(tokenId, eventType, description, transactionAmount, supportingDocs);
        
        // Add custom fields to the latest event
        uint256 eventIndex = assetHistory[tokenId].length - 1;
        AssetEvent storage latestEvent = assetHistory[tokenId][eventIndex];
        
        for (uint i = 0; i < customFieldKeys.length; i++) {
            latestEvent.customFields[customFieldKeys[i]] = customFieldValues[i];
        }
        
        emit AssetEventAdded(tokenId, eventType, description);
    }
    
    // ... (rest of the contract functions - copy from original UniversalAssetNFT.sol)
    
    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721Upgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
