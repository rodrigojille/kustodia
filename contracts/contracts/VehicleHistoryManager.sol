// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./UniversalAssetNFT.sol";

/**
 * @title VehicleHistoryManager
 * @dev Comprehensive vehicle history tracking for Mexican used car market
 * Addresses 85% information asymmetry problem
 */
contract VehicleHistoryManager is AccessControl {
    
    bytes32 public constant DEALER_ROLE = keccak256("DEALER_ROLE");
    bytes32 public constant SERVICE_PROVIDER_ROLE = keccak256("SERVICE_PROVIDER_ROLE");
    bytes32 public constant INSURANCE_ROLE = keccak256("INSURANCE_ROLE");
    bytes32 public constant GOVERNMENT_ROLE = keccak256("GOVERNMENT_ROLE");
    
    UniversalAssetNFT public immutable assetContract;
    
    // Enhanced event types for Mexican market
    enum HistoryEventType {
        CREATION,
        SALE,
        MAINTENANCE,
        ACCIDENT,
        INSURANCE_CLAIM,
        FLOOD_DAMAGE,
        THEFT_RECOVERY,
        IMPORT_RECORD,
        TITLE_TRANSFER,
        LIEN_RECORD,
        RECALL_SERVICE,
        MODIFICATION,
        INSPECTION,
        REGISTRATION_UPDATE
    }
    
    // Comprehensive history record
    struct HistoryRecord {
        HistoryEventType eventType;
        uint256 timestamp;
        address reportedBy;
        string description;
        uint256 mileage;
        uint256 cost;
        string location;
        string[] documents; // IPFS hashes
        mapping(string => string) customData;
        bool verified;
        address verifiedBy;
    }
    
    // Vehicle condition tracking
    struct VehicleCondition {
        uint8 overallRating; // 1-10 scale
        bool hasAccidentHistory;
        bool hasFloodDamage;
        bool hasTheftHistory;
        uint256 totalMaintenanceCost;
        uint256 lastInspectionDate;
        string currentConditionNotes;
    }
    
    // Storage
    mapping(uint256 => HistoryRecord[]) public vehicleHistory;
    mapping(uint256 => VehicleCondition) public vehicleConditions;
    mapping(uint256 => mapping(address => bool)) public authorizedReporters;
    
    // Events
    event HistoryRecordAdded(
        uint256 indexed tokenId,
        HistoryEventType indexed eventType,
        address indexed reportedBy,
        uint256 recordIndex
    );
    
    event RecordVerified(
        uint256 indexed tokenId,
        uint256 recordIndex,
        address verifiedBy
    );
    
    event ConditionUpdated(
        uint256 indexed tokenId,
        uint8 newRating,
        address updatedBy
    );
    
    constructor(address _assetContract) {
        assetContract = UniversalAssetNFT(_assetContract);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Add comprehensive history record
     * Addresses information asymmetry in Mexican used car market
     */
    function addHistoryRecord(
        uint256 tokenId,
        HistoryEventType eventType,
        string memory description,
        uint256 mileage,
        uint256 cost,
        string memory location,
        string[] memory documents,
        string[] memory customKeys,
        string[] memory customValues
    ) external {
        require(assetContract.ownerOf(tokenId) != address(0), "Vehicle does not exist");
        require(
            hasRole(DEALER_ROLE, msg.sender) ||
            hasRole(SERVICE_PROVIDER_ROLE, msg.sender) ||
            hasRole(INSURANCE_ROLE, msg.sender) ||
            hasRole(GOVERNMENT_ROLE, msg.sender) ||
            assetContract.ownerOf(tokenId) == msg.sender ||
            authorizedReporters[tokenId][msg.sender],
            "Not authorized to add records"
        );
        require(customKeys.length == customValues.length, "Custom data mismatch");
        
        vehicleHistory[tokenId].push();
        uint256 recordIndex = vehicleHistory[tokenId].length - 1;
        HistoryRecord storage record = vehicleHistory[tokenId][recordIndex];
        
        record.eventType = eventType;
        record.timestamp = block.timestamp;
        record.reportedBy = msg.sender;
        record.description = description;
        record.mileage = mileage;
        record.cost = cost;
        record.location = location;
        record.documents = documents;
        record.verified = false;
        
        // Add custom data
        for (uint i = 0; i < customKeys.length; i++) {
            record.customData[customKeys[i]] = customValues[i];
        }
        
        // Update vehicle condition based on event type
        _updateVehicleCondition(tokenId, eventType, cost);
        
        emit HistoryRecordAdded(tokenId, eventType, msg.sender, recordIndex);
    }
    
    /**
     * @dev Add accident record (critical for trust)
     */
    function addAccidentRecord(
        uint256 tokenId,
        string memory description,
        uint256 mileage,
        uint256 repairCost,
        string memory location,
        string[] memory photos,
        string policeReportHash,
        string insuranceClaimNumber
    ) external {
        string[] memory documents = new string[](photos.length + 1);
        for (uint i = 0; i < photos.length; i++) {
            documents[i] = photos[i];
        }
        documents[photos.length] = policeReportHash;
        
        string[] memory keys = new string[](2);
        string[] memory values = new string[](2);
        keys[0] = "policeReport";
        values[0] = policeReportHash;
        keys[1] = "insuranceClaim";
        values[1] = insuranceClaimNumber;
        
        addHistoryRecord(
            tokenId,
            HistoryEventType.ACCIDENT,
            description,
            mileage,
            repairCost,
            location,
            documents,
            keys,
            values
        );
        
        // Mark vehicle as having accident history
        vehicleConditions[tokenId].hasAccidentHistory = true;
    }
    
    /**
     * @dev Add maintenance record
     */
    function addMaintenanceRecord(
        uint256 tokenId,
        string memory serviceDescription,
        uint256 mileage,
        uint256 cost,
        string memory serviceProvider,
        string[] memory receipts,
        string[] memory partsUsed
    ) external {
        string[] memory keys = new string[](2);
        string[] memory values = new string[](2);
        keys[0] = "serviceProvider";
        values[0] = serviceProvider;
        keys[1] = "partsUsed";
        values[1] = _arrayToString(partsUsed);
        
        addHistoryRecord(
            tokenId,
            HistoryEventType.MAINTENANCE,
            serviceDescription,
            mileage,
            cost,
            serviceProvider,
            receipts,
            keys,
            values
        );
        
        // Update total maintenance cost
        vehicleConditions[tokenId].totalMaintenanceCost += cost;
    }
    
    /**
     * @dev Verify a history record (builds trust)
     */
    function verifyRecord(
        uint256 tokenId,
        uint256 recordIndex
    ) external onlyRole(GOVERNMENT_ROLE) {
        require(recordIndex < vehicleHistory[tokenId].length, "Invalid record index");
        
        HistoryRecord storage record = vehicleHistory[tokenId][recordIndex];
        record.verified = true;
        record.verifiedBy = msg.sender;
        
        emit RecordVerified(tokenId, recordIndex, msg.sender);
    }
    
    /**
     * @dev Update vehicle condition rating
     */
    function updateConditionRating(
        uint256 tokenId,
        uint8 rating,
        string memory notes
    ) external {
        require(rating >= 1 && rating <= 10, "Rating must be 1-10");
        require(
            hasRole(DEALER_ROLE, msg.sender) ||
            hasRole(SERVICE_PROVIDER_ROLE, msg.sender) ||
            assetContract.ownerOf(tokenId) == msg.sender,
            "Not authorized"
        );
        
        vehicleConditions[tokenId].overallRating = rating;
        vehicleConditions[tokenId].currentConditionNotes = notes;
        
        emit ConditionUpdated(tokenId, rating, msg.sender);
    }
    
    /**
     * @dev Get complete vehicle history (for buyers)
     */
    function getVehicleHistory(uint256 tokenId) external view returns (
        HistoryEventType[] memory eventTypes,
        uint256[] memory timestamps,
        address[] memory reporters,
        string[] memory descriptions,
        uint256[] memory mileages,
        uint256[] memory costs,
        bool[] memory verified
    ) {
        uint256 recordCount = vehicleHistory[tokenId].length;
        
        eventTypes = new HistoryEventType[](recordCount);
        timestamps = new uint256[](recordCount);
        reporters = new address[](recordCount);
        descriptions = new string[](recordCount);
        mileages = new uint256[](recordCount);
        costs = new uint256[](recordCount);
        verified = new bool[](recordCount);
        
        for (uint i = 0; i < recordCount; i++) {
            HistoryRecord storage record = vehicleHistory[tokenId][i];
            eventTypes[i] = record.eventType;
            timestamps[i] = record.timestamp;
            reporters[i] = record.reportedBy;
            descriptions[i] = record.description;
            mileages[i] = record.mileage;
            costs[i] = record.cost;
            verified[i] = record.verified;
        }
    }
    
    /**
     * @dev Get vehicle condition summary
     */
    function getVehicleCondition(uint256 tokenId) external view returns (VehicleCondition memory) {
        return vehicleConditions[tokenId];
    }
    
    /**
     * @dev Calculate trust score (1-100)
     */
    function calculateTrustScore(uint256 tokenId) external view returns (uint8) {
        VehicleCondition memory condition = vehicleConditions[tokenId];
        uint256 recordCount = vehicleHistory[tokenId].length;
        
        uint8 score = 100;
        
        // Deduct for negative history
        if (condition.hasAccidentHistory) score -= 20;
        if (condition.hasFloodDamage) score -= 30;
        if (condition.hasTheftHistory) score -= 15;
        
        // Reward for maintenance history
        if (recordCount > 5) score += 10;
        if (condition.totalMaintenanceCost > 0) score += 5;
        
        // Factor in condition rating
        if (condition.overallRating > 0) {
            score = uint8((uint256(score) + condition.overallRating * 5) / 2);
        }
        
        return score > 100 ? 100 : score;
    }
    
    /**
     * @dev Internal function to update vehicle condition
     */
    function _updateVehicleCondition(
        uint256 tokenId,
        HistoryEventType eventType,
        uint256 cost
    ) internal {
        VehicleCondition storage condition = vehicleConditions[tokenId];
        
        if (eventType == HistoryEventType.ACCIDENT) {
            condition.hasAccidentHistory = true;
            if (condition.overallRating > 3) condition.overallRating -= 2;
        } else if (eventType == HistoryEventType.FLOOD_DAMAGE) {
            condition.hasFloodDamage = true;
            if (condition.overallRating > 4) condition.overallRating -= 3;
        } else if (eventType == HistoryEventType.THEFT_RECOVERY) {
            condition.hasTheftHistory = true;
            if (condition.overallRating > 2) condition.overallRating -= 1;
        } else if (eventType == HistoryEventType.MAINTENANCE) {
            condition.totalMaintenanceCost += cost;
            // Good maintenance can improve rating
            if (condition.overallRating < 9) condition.overallRating += 1;
        }
    }
    
    /**
     * @dev Helper function to convert array to string
     */
    function _arrayToString(string[] memory array) internal pure returns (string memory) {
        if (array.length == 0) return "";
        
        string memory result = array[0];
        for (uint i = 1; i < array.length; i++) {
            result = string(abi.encodePacked(result, ",", array[i]));
        }
        return result;
    }
    
    /**
     * @dev Grant roles to market participants
     */
    function grantDealerRole(address dealer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(DEALER_ROLE, dealer);
    }
    
    function grantServiceProviderRole(address provider) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(SERVICE_PROVIDER_ROLE, provider);
    }
    
    function grantInsuranceRole(address insurance) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(INSURANCE_ROLE, insurance);
    }
}
