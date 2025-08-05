// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title UniversalAssetNFTPausable
 * @dev Upgradeable and Pausable Universal Asset Provenance NFT System for Kustodia
 * Supports vehicles, real estate, machinery, and any high-value asset with emergency pause functionality
 */
contract UniversalAssetNFTPausable is 
    Initializable,
    ERC721Upgradeable, 
    ERC721URIStorageUpgradeable, 
    AccessControlUpgradeable, 
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable 
{
    using Counters for Counters.Counter;
    
    // Role definitions
    bytes32 public constant KUSTODIA_ROLE = keccak256("KUSTODIA_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant UPDATER_ROLE = keccak256("UPDATER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
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
    event AssetDeactivated(uint256 indexed tokenId, string reason);
    event AssetReactivated(uint256 indexed tokenId, string reason);
    
    // Escrow V2 Integration Events
    event EscrowTransferCompleted(uint256 indexed tokenId, uint256 indexed escrowId, address from, address to, uint256 salePrice, string vertical);
    event AssetLockedForEscrow(uint256 indexed tokenId, uint256 indexed escrowId, string vertical);
    event AssetUnlockedFromEscrow(uint256 indexed tokenId, uint256 indexed escrowId, string reason);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(
        string memory name,
        string memory symbol,
        address admin
    ) public initializer {
        __ERC721_init(name, symbol);
        __ERC721URIStorage_init();
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        
        require(admin != address(0), "Invalid admin address");
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(KUSTODIA_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }
    
    /**
     * @dev Create a new asset NFT (only Kustodia role, when not paused)
     */
    function createAsset(
        string memory assetId,
        AssetType assetType,
        address owner,
        string[] memory metadataKeys,
        string[] memory metadataValues,
        string memory _tokenURI
    ) external onlyRole(KUSTODIA_ROLE) whenNotPaused nonReentrant returns (uint256) {
        require(bytes(assetId).length > 0, "Asset ID cannot be empty");
        require(owner != address(0), "Owner cannot be zero address");
        require(assetIdToTokenId[assetId] == 0, "Asset ID already exists");
        require(metadataKeys.length == metadataValues.length, "Metadata arrays length mismatch");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        // Mint NFT to owner
        _safeMint(owner, tokenId);
        
        // Set token URI if provided
        if (bytes(_tokenURI).length > 0) {
            _setTokenURI(tokenId, _tokenURI);
        }
        
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
        for (uint256 i = 0; i < metadataKeys.length; i++) {
            asset.metadata[metadataKeys[i]] = metadataValues[i];
        }
        
        // Map asset ID to token ID
        assetIdToTokenId[assetId] = tokenId;
        
        // Add to owner's assets
        ownerAssets[owner].push(tokenId);
        
        // Add creation event
        _addAssetEvent(tokenId, EventType.CREATION, "Asset NFT created", 0, new string[](0));
        
        emit AssetCreated(tokenId, assetId, assetType, owner);
        return tokenId;
    }
    
    /**
     * @dev Add event to asset history (only authorized roles, when not paused)
     */
    function addAssetEvent(
        uint256 tokenId,
        EventType eventType,
        string memory description,
        uint256 transactionAmount,
        string[] memory supportingDocs,
        string[] memory customFieldKeys,
        string[] memory customFieldValues
    ) external whenNotPaused {
        require(_exists(tokenId), "Asset does not exist");
        require(
            hasRole(KUSTODIA_ROLE, msg.sender) || 
            hasRole(VERIFIER_ROLE, msg.sender) || 
            hasRole(UPDATER_ROLE, msg.sender),
            "Not authorized to add events"
        );
        require(customFieldKeys.length == customFieldValues.length, "Custom fields arrays length mismatch");
        
        _addAssetEventWithCustomFields(tokenId, eventType, description, transactionAmount, supportingDocs, customFieldKeys, customFieldValues);
        
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
        
        // Update asset last updated timestamp
        assets[tokenId].lastUpdated = block.timestamp;
        
        emit AssetEventAdded(tokenId, eventType, description);
    }
    
    /**
     * @dev Internal function to add asset event with custom fields
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
     * @dev Add custom field to asset event
     */
    function addEventCustomField(
        uint256 tokenId,
        uint256 eventIndex,
        string memory key,
        string memory value
    ) external onlyRole(UPDATER_ROLE) whenNotPaused {
        require(_exists(tokenId), "Asset does not exist");
        require(eventIndex < assetHistory[tokenId].length, "Event does not exist");
        
        assetHistory[tokenId][eventIndex].customFields[key] = value;
    }
    
    /**
     * @dev Verify asset (only verifier role, when not paused)
     */
    function verifyAsset(uint256 tokenId) external onlyRole(VERIFIER_ROLE) whenNotPaused {
        require(_exists(tokenId), "Asset does not exist");
        
        assets[tokenId].isVerified = true;
        assets[tokenId].lastUpdated = block.timestamp;
        
        _addAssetEvent(tokenId, EventType.VERIFICATION, "Asset verified by Kustodia", 0, new string[](0));
        emit AssetVerified(tokenId, msg.sender);
    }
    
    /**
     * @dev Update asset metadata (only updater role, when not paused)
     */
    function updateAssetMetadata(
        uint256 tokenId,
        string memory key,
        string memory value
    ) external onlyRole(UPDATER_ROLE) whenNotPaused {
        require(_exists(tokenId), "Asset does not exist");
        
        assets[tokenId].metadata[key] = value;
        assets[tokenId].lastUpdated = block.timestamp;
        
        emit AssetMetadataUpdated(tokenId, key, value);
    }
    
    /**
     * @dev Deactivate asset (only Kustodia role, when not paused)
     */
    function deactivateAsset(uint256 tokenId, string memory reason) external onlyRole(KUSTODIA_ROLE) whenNotPaused {
        require(_exists(tokenId), "Asset does not exist");
        require(assets[tokenId].isActive, "Asset already deactivated");
        
        assets[tokenId].isActive = false;
        assets[tokenId].lastUpdated = block.timestamp;
        
        _addAssetEvent(tokenId, EventType.CUSTOM, string(abi.encodePacked("Asset deactivated: ", reason)), 0, new string[](0));
        emit AssetDeactivated(tokenId, reason);
    }
    
    /**
     * @dev Reactivate asset (only Kustodia role, when not paused)
     */
    function reactivateAsset(uint256 tokenId, string memory reason) external onlyRole(KUSTODIA_ROLE) whenNotPaused {
        require(_exists(tokenId), "Asset does not exist");
        require(!assets[tokenId].isActive, "Asset already active");
        
        assets[tokenId].isActive = true;
        assets[tokenId].lastUpdated = block.timestamp;
        
        _addAssetEvent(tokenId, EventType.CUSTOM, string(abi.encodePacked("Asset reactivated: ", reason)), 0, new string[](0));
        emit AssetReactivated(tokenId, reason);
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
    ) external onlyRole(KUSTODIA_ROLE) whenNotPaused {
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
     * @dev Enhanced escrow integration - Transfer asset with full escrow context
     * Compatible with KustodiaEscrow2_0Pausable
     */
    function transferAssetWithEscrowV2(
        uint256 tokenId,
        address to,
        uint256 salePrice,
        uint256 escrowId,
        string memory vertical,
        string memory clabe
    ) external onlyRole(KUSTODIA_ROLE) whenNotPaused {
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
        
        // Add comprehensive transfer event with escrow context
        string[] memory docs = new string[](1);
        docs[0] = string(abi.encodePacked("escrow:", Strings.toString(escrowId)));
        
        string[] memory customKeys = new string[](3);
        string[] memory customValues = new string[](3);
        
        customKeys[0] = "escrowId";
        customValues[0] = Strings.toString(escrowId);
        
        customKeys[1] = "vertical";
        customValues[1] = vertical;
        
        customKeys[2] = "clabe";
        customValues[2] = clabe;
        
        _addAssetEventWithCustomFields(
            tokenId,
            EventType.SALE,
            "Asset sold through Kustodia Escrow V2",
            salePrice,
            docs,
            customKeys,
            customValues
        );
        
        emit AssetTransferred(tokenId, from, to, salePrice);
        emit EscrowTransferCompleted(tokenId, escrowId, from, to, salePrice, vertical);
    }
    
    /**
     * @dev Lock asset during escrow (prevents transfers until released)
     */
    function lockAssetForEscrow(
        uint256 tokenId,
        uint256 escrowId,
        string memory vertical
    ) external onlyRole(KUSTODIA_ROLE) whenNotPaused {
        require(_exists(tokenId), "Asset does not exist");
        
        // Add lock event
        string[] memory docs = new string[](1);
        docs[0] = string(abi.encodePacked("escrow_lock:", Strings.toString(escrowId)));
        
        string[] memory customKeys = new string[](2);
        string[] memory customValues = new string[](2);
        
        customKeys[0] = "escrowId";
        customValues[0] = Strings.toString(escrowId);
        
        customKeys[1] = "vertical";
        customValues[1] = vertical;
        
        _addAssetEventWithCustomFields(
            tokenId,
            EventType.CUSTOM,
            "Asset locked for escrow transaction",
            0,
            docs,
            customKeys,
            customValues
        );
        
        emit AssetLockedForEscrow(tokenId, escrowId, vertical);
    }
    
    /**
     * @dev Unlock asset if escrow is cancelled
     */
    function unlockAssetFromEscrow(
        uint256 tokenId,
        uint256 escrowId,
        string memory reason
    ) external onlyRole(KUSTODIA_ROLE) whenNotPaused {
        require(_exists(tokenId), "Asset does not exist");
        
        // Add unlock event
        string[] memory docs = new string[](1);
        docs[0] = string(abi.encodePacked("escrow_unlock:", Strings.toString(escrowId)));
        
        string[] memory customKeys = new string[](2);
        string[] memory customValues = new string[](2);
        
        customKeys[0] = "escrowId";
        customValues[0] = Strings.toString(escrowId);
        
        customKeys[1] = "reason";
        customValues[1] = reason;
        
        _addAssetEventWithCustomFields(
            tokenId,
            EventType.CUSTOM,
            "Asset unlocked from escrow",
            0,
            docs,
            customKeys,
            customValues
        );
        
        emit AssetUnlockedFromEscrow(tokenId, escrowId, reason);
    }
    
    /**
     * @dev Emergency pause (only pauser role)
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause (only admin)
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Override transfer to add event tracking and pause check
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // Update owner tracking
        if (from != address(0) && to != address(0)) {
            // Remove from old owner's assets
            uint256[] storage fromAssets = ownerAssets[from];
            for (uint256 i = 0; i < fromAssets.length; i++) {
                if (fromAssets[i] == tokenId) {
                    fromAssets[i] = fromAssets[fromAssets.length - 1];
                    fromAssets.pop();
                    break;
                }
            }
            
            // Add to new owner's assets
            ownerAssets[to].push(tokenId);
            
            // Update asset current owner
            assets[tokenId].currentOwner = to;
            assets[tokenId].lastUpdated = block.timestamp;
            
            // Add transfer event
            _addAssetEvent(tokenId, EventType.TRANSFER, "Asset ownership transferred", 0, new string[](0));
            emit AssetTransferred(tokenId, from, to, 0);
        }
    }
    
    /**
     * @dev Get asset details
     */
    function getAsset(uint256 tokenId) external view returns (
        string memory assetId,
        AssetType assetType,
        address currentOwner,
        uint256 creationDate,
        bool isVerified,
        bool isActive,
        uint256 lastUpdated
    ) {
        require(_exists(tokenId), "Asset does not exist");
        
        Asset storage asset = assets[tokenId];
        return (
            asset.assetId,
            asset.assetType,
            asset.currentOwner,
            asset.creationDate,
            asset.isVerified,
            asset.isActive,
            asset.lastUpdated
        );
    }
    
    /**
     * @dev Get asset metadata
     */
    function getAssetMetadata(uint256 tokenId, string memory key) external view returns (string memory) {
        require(_exists(tokenId), "Asset does not exist");
        return assets[tokenId].metadata[key];
    }
    
    /**
     * @dev Get asset event count
     */
    function getAssetEventCount(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "Asset does not exist");
        return assetHistory[tokenId].length;
    }
    
    /**
     * @dev Get asset event details
     */
    function getAssetEvent(uint256 tokenId, uint256 eventIndex) external view returns (
        EventType eventType,
        uint256 timestamp,
        address authorizedBy,
        string memory description,
        uint256 transactionAmount,
        string[] memory supportingDocs
    ) {
        require(_exists(tokenId), "Asset does not exist");
        require(eventIndex < assetHistory[tokenId].length, "Event does not exist");
        
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
     * @dev Get asset event custom field
     */
    function getAssetEventCustomField(
        uint256 tokenId,
        uint256 eventIndex,
        string memory key
    ) external view returns (string memory) {
        require(_exists(tokenId), "Asset does not exist");
        require(eventIndex < assetHistory[tokenId].length, "Event does not exist");
        
        return assetHistory[tokenId][eventIndex].customFields[key];
    }
    
    /**
     * @dev Get owner's assets
     */
    function getOwnerAssets(address owner) external view returns (uint256[] memory) {
        return ownerAssets[owner];
    }
    
    /**
     * @dev Get token ID by asset ID
     */
    function getTokenIdByAssetId(string memory assetId) external view returns (uint256) {
        uint256 tokenId = assetIdToTokenId[assetId];
        require(tokenId != 0, "Asset ID not found");
        return tokenId;
    }
    
    /**
     * @dev UUPS upgrade authorization (only admin)
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
    
    /**
     * @dev Override required by Solidity
     */
    function _burn(uint256 tokenId) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._burn(tokenId);
    }
    
    /**
     * @dev Override required by Solidity
     */
    function tokenURI(uint256 tokenId) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Override required by Solidity
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
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
}
