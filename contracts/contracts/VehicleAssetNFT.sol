// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UniversalAssetNFT.sol";

/**
 * @title VehicleAssetNFT
 * @dev Specialized contract for vehicle assets (cars, trucks, motorcycles)
 * Extends UniversalAssetNFT with vehicle-specific functionality
 */
contract VehicleAssetNFT is UniversalAssetNFT {
    
    // Vehicle-specific event types
    enum VehicleEventType {
        REGISTRATION,     // Vehicle registered with authorities
        INSPECTION,       // Safety/emissions inspection
        ACCIDENT,         // Accident reported
        MAINTENANCE,      // Regular maintenance
        REPAIR,          // Repair work done
        MODIFICATION,    // Vehicle modified
        INSURANCE_CLAIM, // Insurance claim filed
        MILEAGE_UPDATE,  // Odometer reading updated
        OWNERSHIP_CHANGE // Ownership transferred
    }
    
    // Vehicle-specific data structure
    struct VehicleData {
        string vin;              // Vehicle Identification Number
        string make;             // Manufacturer (Toyota, Ford, etc.)
        string model;            // Model name
        uint256 year;            // Manufacturing year
        string engineNumber;     // Engine serial number
        string color;            // Vehicle color
        string fuelType;         // Gasoline, Diesel, Electric, Hybrid
        uint256 engineSize;      // Engine displacement in CC
        uint256 currentMileage;  // Current odometer reading
        bool isCommercial;       // Commercial vs personal use
        string plateNumber;      // License plate number
        uint256 registrationExpiry; // Registration expiration date
    }
    
    // Storage for vehicle-specific data
    mapping(uint256 => VehicleData) public vehicleData;
    mapping(string => uint256) public vinToTokenId; // VIN -> tokenId mapping
    
    // Events
    event VehicleCreated(uint256 indexed tokenId, string vin, string make, string model, uint256 year);
    event MileageUpdated(uint256 indexed tokenId, uint256 oldMileage, uint256 newMileage, address updatedBy);
    event VehicleInspected(uint256 indexed tokenId, string inspectionType, bool passed, string certificateHash);
    event AccidentReported(uint256 indexed tokenId, string severity, string description, uint256 repairCost);
    
    constructor() {
        // Grant roles to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(KUSTODIA_ROLE, msg.sender);
    }
    
    /**
     * @dev Create a new vehicle NFT with vehicle-specific data
     */
    function createVehicle(
        string memory vin,
        address owner,
        string memory make,
        string memory model,
        uint256 year,
        string memory engineNumber,
        string memory color,
        string memory fuelType,
        uint256 engineSize,
        uint256 currentMileage,
        bool isCommercial,
        string memory plateNumber,
        string memory tokenURI
    ) external onlyRole(KUSTODIA_ROLE) returns (uint256) {
        require(bytes(vin).length > 0, "VIN cannot be empty");
        require(vinToTokenId[vin] == 0, "VIN already exists");
        require(year > 1900 && year <= block.timestamp / 365 days + 1970, "Invalid year");
        
        // Create base asset
        string[] memory metadataKeys = new string[](8);
        string[] memory metadataValues = new string[](8);
        
        metadataKeys[0] = "make";
        metadataValues[0] = make;
        metadataKeys[1] = "model";
        metadataValues[1] = model;
        metadataKeys[2] = "year";
        metadataValues[2] = _toString(year);
        metadataKeys[3] = "color";
        metadataValues[3] = color;
        metadataKeys[4] = "fuelType";
        metadataValues[4] = fuelType;
        metadataKeys[5] = "engineSize";
        metadataValues[5] = _toString(engineSize);
        metadataKeys[6] = "isCommercial";
        metadataValues[6] = isCommercial ? "true" : "false";
        metadataKeys[7] = "plateNumber";
        metadataValues[7] = plateNumber;
        
        uint256 tokenId = _createAsset(
            vin,
            AssetType.VEHICLE,
            owner,
            tokenURI,
            metadataKeys,
            metadataValues
        );
        
        // Store vehicle-specific data
        VehicleData storage vehicle = vehicleData[tokenId];
        vehicle.vin = vin;
        vehicle.make = make;
        vehicle.model = model;
        vehicle.year = year;
        vehicle.engineNumber = engineNumber;
        vehicle.color = color;
        vehicle.fuelType = fuelType;
        vehicle.engineSize = engineSize;
        vehicle.currentMileage = currentMileage;
        vehicle.isCommercial = isCommercial;
        vehicle.plateNumber = plateNumber;
        vehicle.registrationExpiry = block.timestamp + 365 days; // Default 1 year
        
        // Map VIN to token ID
        vinToTokenId[vin] = tokenId;
        
        emit VehicleCreated(tokenId, vin, make, model, year);
        return tokenId;
    }
    
    /**
     * @dev Update vehicle mileage
     * Only authorized updaters can modify mileage
     */
    function updateMileage(
        uint256 tokenId,
        uint256 newMileage,
        string memory serviceLocation,
        string[] memory supportingDocs
    ) external onlyRole(UPDATER_ROLE) {
        require(_exists(tokenId), "Vehicle does not exist");
        require(assets[tokenId].assetType == AssetType.VEHICLE, "Not a vehicle asset");
        
        VehicleData storage vehicle = vehicleData[tokenId];
        require(newMileage >= vehicle.currentMileage, "Mileage cannot decrease");
        
        uint256 oldMileage = vehicle.currentMileage;
        vehicle.currentMileage = newMileage;
        
        // Add mileage update event
        string memory description = string(abi.encodePacked(
            "Mileage updated from ",
            _toString(oldMileage),
            " to ",
            _toString(newMileage),
            " at ",
            serviceLocation
        ));
        
        string[] memory customKeys = new string[](2);
        string[] memory customValues = new string[](2);
        customKeys[0] = "oldMileage";
        customValues[0] = _toString(oldMileage);
        customKeys[1] = "serviceLocation";
        customValues[1] = serviceLocation;
        
        _addAssetEventWithCustomFields(
            tokenId,
            EventType.MAINTENANCE,
            description,
            0,
            supportingDocs,
            customKeys,
            customValues
        );
        
        emit MileageUpdated(tokenId, oldMileage, newMileage, msg.sender);
    }
    
    /**
     * @dev Record vehicle inspection
     */
    function recordInspection(
        uint256 tokenId,
        string memory inspectionType,
        bool passed,
        string memory certificateHash,
        uint256 expiryDate,
        string[] memory supportingDocs
    ) external onlyRole(UPDATER_ROLE) {
        require(_exists(tokenId), "Vehicle does not exist");
        require(assets[tokenId].assetType == AssetType.VEHICLE, "Not a vehicle asset");
        
        string memory description = string(abi.encodePacked(
            inspectionType,
            " inspection ",
            passed ? "PASSED" : "FAILED"
        ));
        
        string[] memory customKeys = new string[](3);
        string[] memory customValues = new string[](3);
        customKeys[0] = "inspectionType";
        customValues[0] = inspectionType;
        customKeys[1] = "passed";
        customValues[1] = passed ? "true" : "false";
        customKeys[2] = "expiryDate";
        customValues[2] = _toString(expiryDate);
        
        _addAssetEventWithCustomFields(
            tokenId,
            EventType.INSPECTION,
            description,
            0,
            supportingDocs,
            customKeys,
            customValues
        );
        
        emit VehicleInspected(tokenId, inspectionType, passed, certificateHash);
    }
    
    /**
     * @dev Report vehicle accident
     */
    function reportAccident(
        uint256 tokenId,
        string memory severity,
        string memory description,
        uint256 repairCost,
        string memory policeReportHash,
        string[] memory supportingDocs
    ) external onlyRole(UPDATER_ROLE) {
        require(_exists(tokenId), "Vehicle does not exist");
        require(assets[tokenId].assetType == AssetType.VEHICLE, "Not a vehicle asset");
        
        string memory eventDescription = string(abi.encodePacked(
            "Accident reported - Severity: ",
            severity,
            " - ",
            description
        ));
        
        string[] memory customKeys = new string[](3);
        string[] memory customValues = new string[](3);
        customKeys[0] = "severity";
        customValues[0] = severity;
        customKeys[1] = "repairCost";
        customValues[1] = _toString(repairCost);
        customKeys[2] = "policeReport";
        customValues[2] = policeReportHash;
        
        _addAssetEventWithCustomFields(
            tokenId,
            EventType.DAMAGE,
            eventDescription,
            repairCost,
            supportingDocs,
            customKeys,
            customValues
        );
        
        emit AccidentReported(tokenId, severity, description, repairCost);
    }
    
    /**
     * @dev Get vehicle data by token ID
     */
    function getVehicleData(uint256 tokenId) external view returns (
        string memory vin,
        string memory make,
        string memory model,
        uint256 year,
        string memory engineNumber,
        string memory color,
        string memory fuelType,
        uint256 engineSize,
        uint256 currentMileage,
        bool isCommercial,
        string memory plateNumber,
        uint256 registrationExpiry
    ) {
        require(_exists(tokenId), "Vehicle does not exist");
        require(assets[tokenId].assetType == AssetType.VEHICLE, "Not a vehicle asset");
        
        VehicleData storage vehicle = vehicleData[tokenId];
        return (
            vehicle.vin,
            vehicle.make,
            vehicle.model,
            vehicle.year,
            vehicle.engineNumber,
            vehicle.color,
            vehicle.fuelType,
            vehicle.engineSize,
            vehicle.currentMileage,
            vehicle.isCommercial,
            vehicle.plateNumber,
            vehicle.registrationExpiry
        );
    }
    
    /**
     * @dev Get vehicle by VIN
     */
    function getVehicleByVIN(string memory vin) external view returns (uint256) {
        return vinToTokenId[vin];
    }
    
    /**
     * @dev Check if vehicle has clean history (no accidents)
     */
    function hasCleanHistory(uint256 tokenId) external view returns (bool) {
        require(_exists(tokenId), "Vehicle does not exist");
        
        uint256 historyLength = assetHistory[tokenId].length;
        for (uint i = 0; i < historyLength; i++) {
            if (assetHistory[tokenId][i].eventType == EventType.DAMAGE) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * @dev Get vehicle's accident count
     */
    function getAccidentCount(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "Vehicle does not exist");
        
        uint256 accidentCount = 0;
        uint256 historyLength = assetHistory[tokenId].length;
        
        for (uint i = 0; i < historyLength; i++) {
            if (assetHistory[tokenId][i].eventType == EventType.DAMAGE) {
                accidentCount++;
            }
        }
        return accidentCount;
    }
    
    /**
     * @dev Convert uint256 to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
