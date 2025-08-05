// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title AssetManagementLib
 * @dev Library for asset management functions to reduce main contract size
 */
library AssetManagementLib {
    using Counters for Counters.Counter;

    // Asset types enum
    enum AssetType {
        VEHICLE,      // Cars, trucks, motorcycles
        PROPERTY,     // Real estate, land
        MACHINERY,    // Industrial equipment, construction
        LUXURY_GOODS, // Jewelry, watches, art
        ELECTRONICS,  // Computers, phones, devices
        OTHER         // Any other high-value asset
    }

    // Event types for asset history
    enum EventType {
        CREATION,     // Asset NFT created
        TRANSFER,     // Ownership transfer
        VERIFICATION, // Asset verified by authority
        MAINTENANCE,  // Maintenance performed
        INSPECTION,   // Inspection completed
        DAMAGE,       // Damage reported
        REPAIR,       // Repair completed
        SALE,         // Asset sold
        PURCHASE,     // Asset purchased
        INSURANCE,    // Insurance event
        LEGAL,        // Legal event
        CUSTOM        // Custom event type
    }

    // Asset structure
    struct Asset {
        string assetId;           // Unique asset identifier (VIN, serial, etc.)
        AssetType assetType;      // Type of asset
        address currentOwner;     // Current owner address
        uint256 creationDate;     // When NFT was created
        uint256 lastUpdated;      // Last update timestamp
        bool isVerified;          // Verified by authority
        bool isActive;            // Asset is active
        mapping(string => string) metadata; // Flexible metadata storage
    }

    // Asset event structure
    struct AssetEvent {
        EventType eventType;      // Type of event
        uint256 timestamp;        // When event occurred
        address authorizedBy;     // Who authorized the event
        string description;       // Event description
        uint256 transactionAmount; // Associated transaction amount
        string[] supportingDocs;  // IPFS hashes of supporting documents
        mapping(string => string) customFields; // Custom event fields
    }

    /**
     * @dev Initialize asset data
     */
    function initializeAsset(
        Asset storage asset,
        string memory assetId,
        AssetType assetType,
        address owner,
        string[] memory metadataKeys,
        string[] memory metadataValues
    ) external {
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
    }

    /**
     * @dev Add event to asset history
     */
    function addEvent(
        AssetEvent storage newEvent,
        EventType eventType,
        string memory description,
        uint256 transactionAmount,
        string[] memory supportingDocs,
        address authorizedBy
    ) external {
        newEvent.eventType = eventType;
        newEvent.timestamp = block.timestamp;
        newEvent.authorizedBy = authorizedBy;
        newEvent.description = description;
        newEvent.transactionAmount = transactionAmount;
        newEvent.supportingDocs = supportingDocs;
    }

    /**
     * @dev Add custom fields to event
     */
    function addCustomFields(
        AssetEvent storage assetEvent,
        string[] memory customFieldKeys,
        string[] memory customFieldValues
    ) external {
        require(customFieldKeys.length == customFieldValues.length, "Custom fields arrays length mismatch");
        
        for (uint256 i = 0; i < customFieldKeys.length; i++) {
            assetEvent.customFields[customFieldKeys[i]] = customFieldValues[i];
        }
    }
}
