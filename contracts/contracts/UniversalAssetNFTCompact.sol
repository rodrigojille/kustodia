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
import "./libraries/AssetManagementLib.sol";

/**
 * @title UniversalAssetNFTCompact
 * @dev Compact Upgradeable and Pausable Universal Asset Provenance NFT System
 */
contract UniversalAssetNFTCompact is 
    Initializable,
    ERC721Upgradeable, 
    ERC721URIStorageUpgradeable, 
    AccessControlUpgradeable, 
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable 
{
    using Counters for Counters.Counter;
    using AssetManagementLib for AssetManagementLib.Asset;
    using AssetManagementLib for AssetManagementLib.AssetEvent;

    // Role definitions
    bytes32 public constant KUSTODIA_ROLE = keccak256("KUSTODIA_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant UPDATER_ROLE = keccak256("UPDATER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    Counters.Counter private _tokenIdCounter;
    
    // Core mappings
    mapping(uint256 => AssetManagementLib.Asset) public assets;
    mapping(uint256 => AssetManagementLib.AssetEvent[]) public assetHistory;
    mapping(string => uint256) public assetIdToTokenId;
    mapping(address => uint256[]) public ownerAssets;
    
    // Events
    event AssetCreated(uint256 indexed tokenId, string assetId, AssetManagementLib.AssetType assetType, address indexed owner);
    event AssetEventAdded(uint256 indexed tokenId, AssetManagementLib.EventType eventType, string description);
    event AssetVerified(uint256 indexed tokenId, address indexed verifier);
    event AssetTransferred(uint256 indexed tokenId, address indexed from, address indexed to);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address escrowAddress) public initializer {
        __ERC721_init("Kustodia Universal Asset", "KUA");
        __ERC721URIStorage_init();
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(KUSTODIA_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _grantRole(UPDATER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        
        // Grant roles to escrow contract
        if (escrowAddress != address(0)) {
            _grantRole(KUSTODIA_ROLE, escrowAddress);
        }
    }

    /**
     * @dev Create new asset NFT (compact version using library)
     */
    function createAsset(
        string memory assetId,
        AssetManagementLib.AssetType assetType,
        address owner,
        string[] memory metadataKeys,
        string[] memory metadataValues,
        string memory _tokenURI
    ) external onlyRole(KUSTODIA_ROLE) whenNotPaused nonReentrant returns (uint256) {
        require(bytes(assetId).length > 0, "Asset ID cannot be empty");
        require(owner != address(0), "Owner cannot be zero address");
        require(assetIdToTokenId[assetId] == 0, "Asset ID already exists");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _safeMint(owner, tokenId);
        if (bytes(_tokenURI).length > 0) {
            _setTokenURI(tokenId, _tokenURI);
        }
        
        // Use library for asset initialization
        AssetManagementLib.initializeAsset(
            assets[tokenId],
            assetId,
            assetType,
            owner,
            metadataKeys,
            metadataValues
        );
        
        assetIdToTokenId[assetId] = tokenId;
        ownerAssets[owner].push(tokenId);
        
        // Add creation event using library
        AssetManagementLib.AssetEvent storage newEvent = assetHistory[tokenId].push();
        AssetManagementLib.addEvent(
            newEvent,
            AssetManagementLib.EventType.CREATION,
            "Asset NFT created",
            0,
            new string[](0),
            msg.sender
        );
        
        emit AssetCreated(tokenId, assetId, assetType, owner);
        return tokenId;
    }

    /**
     * @dev Add event to asset history (compact version)
     */
    function addAssetEvent(
        uint256 tokenId,
        AssetManagementLib.EventType eventType,
        string memory description,
        uint256 transactionAmount,
        string[] memory supportingDocs
    ) external onlyRole(KUSTODIA_ROLE) whenNotPaused {
        require(_exists(tokenId), "Asset does not exist");
        
        AssetManagementLib.AssetEvent storage newEvent = assetHistory[tokenId].push();
        AssetManagementLib.addEvent(
            newEvent,
            eventType,
            description,
            transactionAmount,
            supportingDocs,
            msg.sender
        );
        
        assets[tokenId].lastUpdated = block.timestamp;
        emit AssetEventAdded(tokenId, eventType, description);
    }

    /**
     * @dev Verify asset (only verifiers)
     */
    function verifyAsset(uint256 tokenId) external onlyRole(VERIFIER_ROLE) whenNotPaused {
        require(_exists(tokenId), "Asset does not exist");
        assets[tokenId].isVerified = true;
        assets[tokenId].lastUpdated = block.timestamp;
        emit AssetVerified(tokenId, msg.sender);
    }

    /**
     * @dev Pause contract (emergency stop)
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Get asset basic info
     */
    function getAsset(uint256 tokenId) external view returns (
        string memory assetId,
        AssetManagementLib.AssetType assetType,
        address currentOwner,
        uint256 creationDate,
        bool isVerified,
        bool isActive
    ) {
        require(_exists(tokenId), "Asset does not exist");
        AssetManagementLib.Asset storage asset = assets[tokenId];
        return (
            asset.assetId,
            asset.assetType,
            asset.currentOwner,
            asset.creationDate,
            asset.isVerified,
            asset.isActive
        );
    }

    /**
     * @dev Get total number of assets
     */
    function totalAssets() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Override required by Solidity
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        if (from != address(0) && to != address(0)) {
            assets[tokenId].currentOwner = to;
            assets[tokenId].lastUpdated = block.timestamp;
            emit AssetTransferred(tokenId, from, to);
        }
    }

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
     * @dev Authorize upgrade (only admin)
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
