// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title UniversalAssetNFT
 * @dev Universal Asset Provenance NFT System for Kustodia
 * Supports vehicles, real estate, machinery, and any high-value asset
 */
contract UniversalAssetNFT is ERC721, ERC721URIStorage, AccessControl, ReentrancyGuard {
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
        CREATION,        // Asset NFT created
        SALE,           // Asset sold
        TRANSFER,       // Ownership transferred
        MAINTENANCE,    // Service/maintenance performed
        INSPECTION,     // Official inspection
        DAMAGE,         // Damage reported
        REPAIR,         // Repair completed
        UPGRADE,        // Asset upgraded/modified
        RENTAL,         // Asset rented out
        LEASE,          // Asset leased
        INSURANCE_CLAIM,// Insurance claim filed
        LEGAL_ACTION,   // Legal action involving asset
        VERIFICATION,   // Kustodia verification
        CUSTOM          // Custom event type
    }
    
    // Asset event structure
    struct AssetEvent {
        EventType eventType;
        uint256 timestamp;
        address authorizedBy;      // Kustodia wallet that authorized
        string description;
        uint256 transactionAmount; // If it was a sale (in wei)
        string[] supportingDocs;   // IPFS hashes of documents
        mapping(string => string) customFields; // Asset-specific data
    }
    
    // Main asset structure
    struct Asset {
        string assetId;           // Universal ID (VIN, property ID, serial)
        AssetType assetType;      // Type of asset
        address currentOwner;     // Current owner's wallet
        uint256 creationDate;     // When NFT was minted
        bool isVerified;          // Kustodia verification status
        bool isActive;            // Asset is active (not destroyed/scrapped)
        uint256 lastUpdated;      // Last update timestamp
        mapping(string => string) metadata; // Flexible metadata storage
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
    
    constructor() ERC721("Kustodia Universal Asset", "KUA") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(KUSTODIA_ROLE, msg.sender);
    }
    
    /**
     * @dev Create a new asset NFT
     * Only Kustodia can mint new assets
     */
    function createAsset(
        string memory assetId,
        AssetType assetType,
        address owner,
        string memory _tokenURI,
        string[] memory metadataKeys,
        string[] memory metadataValues
    ) external onlyRole(KUSTODIA_ROLE) returns (uint256) {
        require(bytes(assetId).length > 0, "Asset ID cannot be empty");
        require(owner != address(0), "Owner cannot be zero address");
        require(assetIdToTokenId[assetId] == 0, "Asset ID already exists");
        require(metadataKeys.length == metadataValues.length, "Metadata arrays length mismatch");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Mint NFT to owner
        _safeMint(owner, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        // Initialize asset data
        Asset storage asset = assets[tokenId];
        asset.assetId = assetId;
        asset.assetType = assetType;
        asset.currentOwner = owner;
        asset.creationDate = block.timestamp;
        asset.isVerified = false;
        asset.isActive = true;
        asset.lastUpdated = block.timestamp;
        
        // Set metadata
        for (uint i = 0; i < metadataKeys.length; i++) {
            asset.metadata[metadataKeys[i]] = metadataValues[i];
        }
        
        // Map asset ID to token ID
        assetIdToTokenId[assetId] = tokenId;
        
        // Add to owner's assets
        ownerAssets[owner].push(tokenId);
        
        // Add creation event
        _addAssetEvent(
            tokenId,
            EventType.CREATION,
            "Asset NFT created",
            0,
            new string[](0)
        );
        
        emit AssetCreated(tokenId, assetId, assetType, owner);
        return tokenId;
    }
    
    /**
     * @dev Internal function to create asset - for use by child contracts
     */
    function _createAsset(
        string memory assetId,
        AssetType assetType,
        address owner,
        string memory _tokenURI,
        string[] memory metadataKeys,
        string[] memory metadataValues
    ) internal returns (uint256) {
        require(bytes(assetId).length > 0, "Asset ID cannot be empty");
        require(owner != address(0), "Owner cannot be zero address");
        require(assetIdToTokenId[assetId] == 0, "Asset ID already exists");
        require(metadataKeys.length == metadataValues.length, "Metadata arrays length mismatch");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Mint NFT to owner
        _safeMint(owner, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        // Initialize asset data
        Asset storage asset = assets[tokenId];
        asset.assetId = assetId;
        asset.assetType = assetType;
        asset.currentOwner = owner;
        asset.creationDate = block.timestamp;
        asset.isVerified = false;
        asset.isActive = true;
        asset.lastUpdated = block.timestamp;
        
        // Set metadata
        for (uint i = 0; i < metadataKeys.length; i++) {
            asset.metadata[metadataKeys[i]] = metadataValues[i];
        }
        
        // Map asset ID to token ID
        assetIdToTokenId[assetId] = tokenId;
        
        // Add to owner's assets
        ownerAssets[owner].push(tokenId);
        
        // Add creation event
        _addAssetEvent(
            tokenId,
            EventType.CREATION,
            "Asset NFT created",
            0,
            new string[](0)
        );
        
        emit AssetCreated(tokenId, assetId, assetType, owner);
        return tokenId;
    }
    
    /**
     * @dev Add an event to asset history
     * Only authorized roles can add events
     */
    function addAssetEvent(
        uint256 tokenId,
        EventType eventType,
        string memory description,
        uint256 transactionAmount,
        string[] memory supportingDocs,
        string[] memory customFieldKeys,
        string[] memory customFieldValues
    ) external onlyRole(UPDATER_ROLE) {
        require(_exists(tokenId), "Asset does not exist");
        require(customFieldKeys.length == customFieldValues.length, "Custom fields arrays length mismatch");
        
        _addAssetEvent(tokenId, eventType, description, transactionAmount, supportingDocs);
        
        // Add custom fields to the latest event
        uint256 eventIndex = assetHistory[tokenId].length - 1;
        AssetEvent storage latestEvent = assetHistory[tokenId][eventIndex];
        
        for (uint i = 0; i < customFieldKeys.length; i++) {
            latestEvent.customFields[customFieldKeys[i]] = customFieldValues[i];
        }
        
        // Update asset timestamp
        assets[tokenId].lastUpdated = block.timestamp;
        
        emit AssetEventAdded(tokenId, eventType, description);
    }
    
    /**
     * @dev Internal function to add asset event with optional custom fields
     */
    function _addAssetEventWithCustomFields(
        uint256 tokenId,
        EventType eventType,
        string memory description,
        uint256 transactionAmount,
        string[] memory supportingDocs,
        string[] memory customFieldKeys,
        string[] memory customFieldValues
    ) internal {
        require(customFieldKeys.length == customFieldValues.length, "Custom fields arrays length mismatch");
        
        AssetEvent storage newEvent = assetHistory[tokenId].push();
        newEvent.eventType = eventType;
        newEvent.timestamp = block.timestamp;
        newEvent.authorizedBy = msg.sender;
        newEvent.description = description;
        newEvent.transactionAmount = transactionAmount;
        newEvent.supportingDocs = supportingDocs;
        
        // Store custom fields in asset metadata
        for (uint i = 0; i < customFieldKeys.length; i++) {
            assets[tokenId].metadata[customFieldKeys[i]] = customFieldValues[i];
        }
        
        assets[tokenId].lastUpdated = block.timestamp;
    }
    
    /**
     * @dev Internal function to add asset event
     */
    function _addAssetEvent(
        uint256 tokenId,
        EventType eventType,
        string memory description,
        uint256 transactionAmount,
        string[] memory supportingDocs
    ) internal {
        AssetEvent storage newEvent = assetHistory[tokenId].push();
        newEvent.eventType = eventType;
        newEvent.timestamp = block.timestamp;
        newEvent.authorizedBy = msg.sender;
        newEvent.description = description;
        newEvent.transactionAmount = transactionAmount;
        newEvent.supportingDocs = supportingDocs;
    }
    
    /**
     * @dev Transfer asset with Kustodia escrow integration
     * Only Kustodia can authorize transfers
     */
    function transferAssetWithEscrow(
        uint256 tokenId,
        address to,
        uint256 salePrice,
        string memory escrowId
    ) external onlyRole(KUSTODIA_ROLE) {
        require(_exists(tokenId), "Asset does not exist");
        require(to != address(0), "Cannot transfer to zero address");
        
        address from = ownerOf(tokenId);
        
        // Update asset owner
        assets[tokenId].currentOwner = to;
        
        // Remove from old owner's assets
        _removeFromOwnerAssets(from, tokenId);
        
        // Add to new owner's assets
        ownerAssets[to].push(tokenId);
        
        // Transfer NFT
        _transfer(from, to, tokenId);
        
        // Add transfer event
        string[] memory docs = new string[](1);
        docs[0] = escrowId; // Store escrow ID as supporting document
        
        _addAssetEvent(
            tokenId,
            EventType.SALE,
            "Asset sold through Kustodia escrow",
            salePrice,
            docs
        );
        
        emit AssetTransferred(tokenId, from, to, salePrice);
    }
    
    /**
     * @dev Verify asset by authorized verifier
     */
    function verifyAsset(uint256 tokenId) external onlyRole(VERIFIER_ROLE) {
        require(_exists(tokenId), "Asset does not exist");
        
        assets[tokenId].isVerified = true;
        assets[tokenId].lastUpdated = block.timestamp;
        
        _addAssetEvent(
            tokenId,
            EventType.VERIFICATION,
            "Asset verified by Kustodia",
            0,
            new string[](0)
        );
        
        emit AssetVerified(tokenId, msg.sender);
    }
    
    /**
     * @dev Update asset metadata
     */
    function updateAssetMetadata(
        uint256 tokenId,
        string memory key,
        string memory value
    ) external onlyRole(UPDATER_ROLE) {
        require(_exists(tokenId), "Asset does not exist");
        
        assets[tokenId].metadata[key] = value;
        assets[tokenId].lastUpdated = block.timestamp;
        
        emit AssetMetadataUpdated(tokenId, key, value);
    }
    
    /**
     * @dev Get asset metadata
     */
    function getAssetMetadata(uint256 tokenId, string memory key) 
        external view returns (string memory) {
        require(_exists(tokenId), "Asset does not exist");
        return assets[tokenId].metadata[key];
    }
    
    /**
     * @dev Get asset history length
     */
    function getAssetHistoryLength(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "Asset does not exist");
        return assetHistory[tokenId].length;
    }
    
    /**
     * @dev Get asset event by index
     */
    function getAssetEvent(uint256 tokenId, uint256 eventIndex) 
        external view returns (
            EventType eventType,
            uint256 timestamp,
            address authorizedBy,
            string memory description,
            uint256 transactionAmount,
            string[] memory supportingDocs
        ) {
        require(_exists(tokenId), "Asset does not exist");
        require(eventIndex < assetHistory[tokenId].length, "Event index out of bounds");
        
        AssetEvent storage assetEvent = assetHistory[tokenId][eventIndex];
        return (
            assetEvent.eventType,
            assetEvent.timestamp,
            assetEvent.authorizedBy,
            assetEvent.description,
            assetEvent.transactionAmount,
            assetEvent.supportingDocs
        );
    }
    
    /**
     * @dev Get owner's assets
     */
    function getOwnerAssets(address owner) external view returns (uint256[] memory) {
        return ownerAssets[owner];
    }
    
    /**
     * @dev Remove token from owner's assets array
     */
    function _removeFromOwnerAssets(address owner, uint256 tokenId) internal {
        uint256[] storage ownerTokens = ownerAssets[owner];
        for (uint i = 0; i < ownerTokens.length; i++) {
            if (ownerTokens[i] == tokenId) {
                ownerTokens[i] = ownerTokens[ownerTokens.length - 1];
                ownerTokens.pop();
                break;
            }
        }
    }
    
    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
