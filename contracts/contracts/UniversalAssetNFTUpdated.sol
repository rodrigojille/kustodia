// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Add this function to UniversalAssetNFT.sol

/**
 * @dev Allow NFT owners to add maintenance events to their own assets
 * This separates ownership from contract deployment permissions
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

/**
 * @dev Allow authorized service providers to add events (existing function)
 * Requires UPDATER_ROLE granted by contract admin
 */
function addAssetEventByServiceProvider(
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
    
    emit AssetEventAdded(tokenId, eventType, description);
}
