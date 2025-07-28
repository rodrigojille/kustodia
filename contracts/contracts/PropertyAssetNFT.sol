// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UniversalAssetNFT.sol";

/**
 * @title PropertyAssetNFT
 * @dev Specialized contract for real estate assets
 * Extends UniversalAssetNFT with property-specific functionality
 */
contract PropertyAssetNFT is UniversalAssetNFT {
    
    // Property types
    enum PropertyType {
        RESIDENTIAL_HOUSE,    // Single family home
        RESIDENTIAL_CONDO,    // Condominium/apartment
        COMMERCIAL_OFFICE,    // Office building
        COMMERCIAL_RETAIL,    // Retail space
        COMMERCIAL_WAREHOUSE, // Warehouse/industrial
        LAND_RESIDENTIAL,     // Residential land
        LAND_COMMERCIAL,      // Commercial land
        LAND_AGRICULTURAL,    // Agricultural land
        MIXED_USE,           // Mixed residential/commercial
        OTHER                // Other property types
    }
    
    // Property-specific data structure
    struct PropertyData {
        string cadastralId;        // Registro Público de la Propiedad ID
        string fullAddress;        // Complete address
        string city;              // City
        string state;             // State/Province
        string postalCode;        // ZIP/Postal code
        string country;           // Country
        PropertyType propertyType; // Type of property
        uint256 squareMeters;     // Total area in square meters
        uint256 builtArea;        // Built area in square meters
        uint256 bedrooms;         // Number of bedrooms (if residential)
        uint256 bathrooms;        // Number of bathrooms
        uint256 parkingSpaces;    // Number of parking spaces
        uint256 yearBuilt;        // Year property was built
        string legalDescription;   // Legal property description
        bool hasLiens;            // Property has liens/encumbrances
        uint256 lastAppraisal;    // Last appraised value
        uint256 appraisalDate;    // Date of last appraisal
    }
    
    // Lien/Encumbrance structure
    struct PropertyLien {
        string lienType;          // Mortgage, tax lien, judgment, etc.
        uint256 amount;           // Lien amount
        address lienholder;       // Address of lienholder
        uint256 dateRecorded;     // When lien was recorded
        bool isActive;            // Whether lien is still active
        string documentHash;      // IPFS hash of lien document
    }
    
    // Storage for property-specific data
    mapping(uint256 => PropertyData) public propertyData;
    mapping(uint256 => PropertyLien[]) public propertyLiens;
    mapping(string => uint256) public cadastralIdToTokenId; // Cadastral ID -> tokenId
    mapping(uint256 => uint256[]) public propertyAppraisalHistory; // tokenId -> appraisal values
    mapping(uint256 => uint256[]) public propertyAppraisalDates;   // tokenId -> appraisal dates
    
    // Events
    event PropertyCreated(uint256 indexed tokenId, string cadastralId, PropertyType propertyType, string fullAddress);
    event PropertyAppraised(uint256 indexed tokenId, uint256 appraisalValue, address appraiser);
    event LienAdded(uint256 indexed tokenId, string lienType, uint256 amount, address lienholder);
    event LienReleased(uint256 indexed tokenId, uint256 lienIndex);
    event PropertyTransferred(uint256 indexed tokenId, address from, address to, uint256 salePrice);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(KUSTODIA_ROLE, msg.sender);
    }
    
    /**
     * @dev Create a new property NFT with property-specific data
     */
    function createProperty(
        string memory cadastralId,
        address owner,
        string memory fullAddress,
        string memory city,
        string memory state,
        string memory postalCode,
        string memory country,
        PropertyType propertyType,
        uint256 squareMeters,
        uint256 builtArea,
        uint256 bedrooms,
        uint256 bathrooms,
        uint256 parkingSpaces,
        uint256 yearBuilt,
        string memory legalDescription,
        string memory tokenURI
    ) external onlyRole(KUSTODIA_ROLE) returns (uint256) {
        require(bytes(cadastralId).length > 0, "Cadastral ID cannot be empty");
        require(cadastralIdToTokenId[cadastralId] == 0, "Cadastral ID already exists");
        require(squareMeters > 0, "Square meters must be greater than 0");
        require(yearBuilt > 1800 && yearBuilt <= block.timestamp / 365 days + 1970, "Invalid year built");
        
        // Create base asset with property metadata
        string[] memory metadataKeys = new string[](10);
        string[] memory metadataValues = new string[](10);
        
        metadataKeys[0] = "address";
        metadataValues[0] = fullAddress;
        metadataKeys[1] = "city";
        metadataValues[1] = city;
        metadataKeys[2] = "state";
        metadataValues[2] = state;
        metadataKeys[3] = "postalCode";
        metadataValues[3] = postalCode;
        metadataKeys[4] = "country";
        metadataValues[4] = country;
        metadataKeys[5] = "squareMeters";
        metadataValues[5] = _toString(squareMeters);
        metadataKeys[6] = "builtArea";
        metadataValues[6] = _toString(builtArea);
        metadataKeys[7] = "bedrooms";
        metadataValues[7] = _toString(bedrooms);
        metadataKeys[8] = "bathrooms";
        metadataValues[8] = _toString(bathrooms);
        metadataKeys[9] = "yearBuilt";
        metadataValues[9] = _toString(yearBuilt);
        
        uint256 tokenId = _createAsset(
            cadastralId,
            AssetType.PROPERTY,
            owner,
            tokenURI,
            metadataKeys,
            metadataValues
        );
        
        // Store property-specific data
        PropertyData storage property = propertyData[tokenId];
        property.cadastralId = cadastralId;
        property.fullAddress = fullAddress;
        property.city = city;
        property.state = state;
        property.postalCode = postalCode;
        property.country = country;
        property.propertyType = propertyType;
        property.squareMeters = squareMeters;
        property.builtArea = builtArea;
        property.bedrooms = bedrooms;
        property.bathrooms = bathrooms;
        property.parkingSpaces = parkingSpaces;
        property.yearBuilt = yearBuilt;
        property.legalDescription = legalDescription;
        property.hasLiens = false;
        property.lastAppraisal = 0;
        property.appraisalDate = 0;
        
        // Map cadastral ID to token ID
        cadastralIdToTokenId[cadastralId] = tokenId;
        
        emit PropertyCreated(tokenId, cadastralId, propertyType, fullAddress);
        return tokenId;
    }
    
    /**
     * @dev Add property appraisal
     */
    function addAppraisal(
        uint256 tokenId,
        uint256 appraisalValue,
        string memory appraiserName,
        string memory appraisalReportHash,
        string[] memory supportingDocs
    ) external onlyRole(UPDATER_ROLE) {
        require(_exists(tokenId), "Property does not exist");
        require(assets[tokenId].assetType == AssetType.PROPERTY, "Not a property asset");
        require(appraisalValue > 0, "Appraisal value must be greater than 0");
        
        PropertyData storage property = propertyData[tokenId];
        property.lastAppraisal = appraisalValue;
        property.appraisalDate = block.timestamp;
        
        // Store appraisal history
        propertyAppraisalHistory[tokenId].push(appraisalValue);
        propertyAppraisalDates[tokenId].push(block.timestamp);
        
        string memory description = string(abi.encodePacked(
            "Property appraised at $",
            _toString(appraisalValue),
            " by ",
            appraiserName
        ));
        
        string[] memory customKeys = new string[](2);
        string[] memory customValues = new string[](2);
        customKeys[0] = "appraiserName";
        customValues[0] = appraiserName;
        customKeys[1] = "appraisalReport";
        customValues[1] = appraisalReportHash;
        
        _addAssetEventWithCustomFields(
            tokenId,
            EventType.VERIFICATION,
            description,
            appraisalValue,
            supportingDocs,
            customKeys,
            customValues
        );
        
        emit PropertyAppraised(tokenId, appraisalValue, msg.sender);
    }
    
    /**
     * @dev Add lien/encumbrance to property
     */
    function addLien(
        uint256 tokenId,
        string memory lienType,
        uint256 amount,
        address lienholder,
        string memory documentHash
    ) external onlyRole(UPDATER_ROLE) {
        require(_exists(tokenId), "Property does not exist");
        require(assets[tokenId].assetType == AssetType.PROPERTY, "Not a property asset");
        require(amount > 0, "Lien amount must be greater than 0");
        require(lienholder != address(0), "Lienholder cannot be zero address");
        
        PropertyLien memory newLien = PropertyLien({
            lienType: lienType,
            amount: amount,
            lienholder: lienholder,
            dateRecorded: block.timestamp,
            isActive: true,
            documentHash: documentHash
        });
        
        propertyLiens[tokenId].push(newLien);
        propertyData[tokenId].hasLiens = true;
        
        string memory description = string(abi.encodePacked(
            lienType,
            " lien recorded for $",
            _toString(amount)
        ));
        
        string[] memory supportingDocs = new string[](1);
        supportingDocs[0] = documentHash;
        
        string[] memory customKeys = new string[](2);
        string[] memory customValues = new string[](2);
        customKeys[0] = "lienType";
        customValues[0] = lienType;
        customKeys[1] = "lienholder";
        customValues[1] = _addressToString(lienholder);
        
        _addAssetEventWithCustomFields(
            tokenId,
            EventType.LEGAL_ACTION,
            description,
            amount,
            supportingDocs,
            customKeys,
            customValues
        );
        
        emit LienAdded(tokenId, lienType, amount, lienholder);
    }
    
    /**
     * @dev Release/satisfy a lien
     */
    function releaseLien(
        uint256 tokenId,
        uint256 lienIndex,
        string memory releaseDocumentHash
    ) external onlyRole(UPDATER_ROLE) {
        require(_exists(tokenId), "Property does not exist");
        require(lienIndex < propertyLiens[tokenId].length, "Lien index out of bounds");
        require(propertyLiens[tokenId][lienIndex].isActive, "Lien already released");
        
        PropertyLien storage lien = propertyLiens[tokenId][lienIndex];
        lien.isActive = false;
        
        // Check if any liens remain active
        bool hasActiveLiens = false;
        for (uint i = 0; i < propertyLiens[tokenId].length; i++) {
            if (propertyLiens[tokenId][i].isActive) {
                hasActiveLiens = true;
                break;
            }
        }
        propertyData[tokenId].hasLiens = hasActiveLiens;
        
        string memory description = string(abi.encodePacked(
            lien.lienType,
            " lien released for $",
            _toString(lien.amount)
        ));
        
        string[] memory supportingDocs = new string[](1);
        supportingDocs[0] = releaseDocumentHash;
        
        _addAssetEventWithCustomFields(
            tokenId,
            EventType.LEGAL_ACTION,
            description,
            0,
            supportingDocs,
            new string[](0),
            new string[](0)
        );
        
        emit LienReleased(tokenId, lienIndex);
    }
    
    /**
     * @dev Get property data by token ID
     */
    function getPropertyData(uint256 tokenId) external view returns (
        string memory cadastralId,
        string memory fullAddress,
        string memory city,
        string memory state,
        PropertyType propertyType,
        uint256 squareMeters,
        uint256 builtArea,
        uint256 bedrooms,
        uint256 bathrooms,
        uint256 yearBuilt,
        bool hasLiens,
        uint256 lastAppraisal
    ) {
        require(_exists(tokenId), "Property does not exist");
        require(assets[tokenId].assetType == AssetType.PROPERTY, "Not a property asset");
        
        PropertyData storage property = propertyData[tokenId];
        return (
            property.cadastralId,
            property.fullAddress,
            property.city,
            property.state,
            property.propertyType,
            property.squareMeters,
            property.builtArea,
            property.bedrooms,
            property.bathrooms,
            property.yearBuilt,
            property.hasLiens,
            property.lastAppraisal
        );
    }
    
    /**
     * @dev Get property by cadastral ID
     */
    function getPropertyByCadastralId(string memory cadastralId) external view returns (uint256) {
        return cadastralIdToTokenId[cadastralId];
    }
    
    /**
     * @dev Get property liens
     */
    function getPropertyLiens(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "Property does not exist");
        return propertyLiens[tokenId].length;
    }
    
    /**
     * @dev Get specific lien details
     */
    function getLienDetails(uint256 tokenId, uint256 lienIndex) external view returns (
        string memory lienType,
        uint256 amount,
        address lienholder,
        uint256 dateRecorded,
        bool isActive,
        string memory documentHash
    ) {
        require(_exists(tokenId), "Property does not exist");
        require(lienIndex < propertyLiens[tokenId].length, "Lien index out of bounds");
        
        PropertyLien storage lien = propertyLiens[tokenId][lienIndex];
        return (
            lien.lienType,
            lien.amount,
            lien.lienholder,
            lien.dateRecorded,
            lien.isActive,
            lien.documentHash
        );
    }
    
    /**
     * @dev Get appraisal history
     */
    function getAppraisalHistory(uint256 tokenId) external view returns (
        uint256[] memory values,
        uint256[] memory dates
    ) {
        require(_exists(tokenId), "Property does not exist");
        return (
            propertyAppraisalHistory[tokenId],
            propertyAppraisalDates[tokenId]
        );
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
    
    /**
     * @dev Convert address to string
     */
    function _addressToString(address addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint(uint8(value[i + 12] >> 4))];
            str[3+i*2] = alphabet[uint(uint8(value[i + 12] & 0x0f))];
        }
        return string(str);
    }
}
