// Sources flattened with hardhat v2.25.0 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/Counters.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (utils/Counters.sol)

/**
 * @title Counters
 * @author Matt Condon (@shrugs)
 * @dev Provides counters that can only be incremented, decremented or reset. This can be used e.g. to track the number
 * of elements in a mapping, issuing ERC721 ids, or counting request ids.
 *
 * Include with `using Counters for Counters.Counter;`
 */
library Counters {
    struct Counter {
        // This variable should never be directly accessed by users of the library: interactions must be restricted to
        // the library's function. As of Solidity v0.5.2, this cannot be enforced, though there is a proposal to add
        // this feature: see https://github.com/ethereum/solidity/issues/4637
        uint256 _value; // default: 0
    }

    function current(Counter storage counter) internal view returns (uint256) {
        return counter._value;
    }

    function increment(Counter storage counter) internal {
        unchecked {
            counter._value += 1;
        }
    }

    function decrement(Counter storage counter) internal {
        uint256 value = counter._value;
        require(value > 0, "Counter: decrement overflow");
        unchecked {
            counter._value = value - 1;
        }
    }

    function reset(Counter storage counter) internal {
        counter._value = 0;
    }
}


// File contracts/libraries/AssetManagementLib.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;

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
