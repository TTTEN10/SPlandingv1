// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./interfaces/IDIDStorage.sol";
import "./interfaces/IDIDRegistry.sol";

/**
 * @title DIDStorage
 * @dev Decentralized Identity Data Storage Contract
 * @notice Manages encrypted data storage and access control for DIDs
 */
contract DIDStorage is IDIDStorage, ReentrancyGuard, Ownable, Pausable {
    // State variables
    IDIDRegistry public immutable didRegistry;
    
    // Mappings
    mapping(bytes32 => mapping(string => StoredData)) private _storedData;
    mapping(bytes32 => string[]) private _didDataTypes;
    mapping(bytes32 => mapping(address => mapping(string => bool))) private _accessControl;

    // Events
    event StorageInitialized(address indexed didRegistry);

    // Modifiers
    modifier onlyDIDOwnerOrController(bytes32 didHash) {
        IDIDRegistry.DIDDocument memory didDoc = didRegistry.getDID(didHash);
        require(
            didDoc.owner == msg.sender || 
            didRegistry.hasControllerAccess(didHash, msg.sender),
            "Not authorized"
        );
        _;
    }

    modifier didExists(bytes32 didHash) {
        require(didRegistry.isDIDActive(didHash), "DID does not exist");
        _;
    }

    modifier hasDataAccess(bytes32 didHash, string memory dataType) {
        require(
            _accessControl[didHash][msg.sender][dataType] ||
            _storedData[didHash][dataType].authorizedAccessors.length == 0, // Public data
            "Access denied"
        );
        _;
    }

    constructor(address _didRegistry) {
        require(_didRegistry != address(0), "Invalid DID registry address");
        didRegistry = IDIDRegistry(_didRegistry);
        emit StorageInitialized(_didRegistry);
    }

    /**
     * @dev Store encrypted data for a DID
     * @param didHash The hash of the DID
     * @param dataType The type of data being stored
     * @param dataHash The hash of the encrypted data
     * @param isEncrypted Whether the data is encrypted
     */
    function storeData(
        bytes32 didHash, 
        string memory dataType, 
        bytes32 dataHash, 
        bool isEncrypted
    ) 
        external 
        override 
        onlyDIDOwnerOrController(didHash) 
        didExists(didHash) 
        whenNotPaused 
        nonReentrant 
    {
        require(bytes(dataType).length > 0, "Data type cannot be empty");
        require(dataHash != bytes32(0), "Data hash cannot be empty");

        // Check if data type already exists
        bool dataTypeExists = false;
        for (uint256 i = 0; i < _didDataTypes[didHash].length; i++) {
            if (keccak256(bytes(_didDataTypes[didHash][i])) == keccak256(bytes(dataType))) {
                dataTypeExists = true;
                break;
            }
        }

        // Add data type if it doesn't exist
        if (!dataTypeExists) {
            _didDataTypes[didHash].push(dataType);
        }

        // Store the data
        _storedData[didHash][dataType] = StoredData({
            dataHash: dataHash,
            dataType: dataType,
            timestamp: block.timestamp,
            isEncrypted: isEncrypted,
            authorizedAccessors: new address[](0)
        });

        emit DataStored(didHash, dataType, dataHash);
    }

    /**
     * @dev Update stored data for a DID
     * @param didHash The hash of the DID
     * @param dataType The type of data to update
     * @param newDataHash The new hash of the encrypted data
     */
    function updateData(
        bytes32 didHash, 
        string memory dataType, 
        bytes32 newDataHash
    ) 
        external 
        override 
        onlyDIDOwnerOrController(didHash) 
        didExists(didHash) 
        whenNotPaused 
        nonReentrant 
    {
        require(bytes(dataType).length > 0, "Data type cannot be empty");
        require(newDataHash != bytes32(0), "Data hash cannot be empty");
        require(_storedData[didHash][dataType].dataHash != bytes32(0), "Data does not exist");

        StoredData storage data = _storedData[didHash][dataType];
        data.dataHash = newDataHash;
        data.timestamp = block.timestamp;

        emit DataUpdated(didHash, dataType, newDataHash);
    }

    /**
     * @dev Delete stored data for a DID
     * @param didHash The hash of the DID
     * @param dataType The type of data to delete
     */
    function deleteData(bytes32 didHash, string memory dataType) 
        external 
        override 
        onlyDIDOwnerOrController(didHash) 
        didExists(didHash) 
        whenNotPaused 
        nonReentrant 
    {
        require(bytes(dataType).length > 0, "Data type cannot be empty");
        require(_storedData[didHash][dataType].dataHash != bytes32(0), "Data does not exist");

        // Clear access control
        address[] memory accessors = _storedData[didHash][dataType].authorizedAccessors;
        for (uint256 i = 0; i < accessors.length; i++) {
            _accessControl[didHash][accessors[i]][dataType] = false;
        }

        // Remove data type from list
        string[] storage dataTypes = _didDataTypes[didHash];
        for (uint256 i = 0; i < dataTypes.length; i++) {
            if (keccak256(bytes(dataTypes[i])) == keccak256(bytes(dataType))) {
                dataTypes[i] = dataTypes[dataTypes.length - 1];
                dataTypes.pop();
                break;
            }
        }

        // Delete the data
        delete _storedData[didHash][dataType];

        emit DataDeleted(didHash, dataType);
    }

    /**
     * @dev Get stored data for a DID
     * @param didHash The hash of the DID
     * @param dataType The type of data to retrieve
     * @return The stored data
     */
    function getData(bytes32 didHash, string memory dataType) 
        external 
        view 
        override 
        hasDataAccess(didHash, dataType) 
        returns (StoredData memory) 
    {
        require(_storedData[didHash][dataType].dataHash != bytes32(0), "Data does not exist");
        return _storedData[didHash][dataType];
    }

    /**
     * @dev Grant access to stored data
     * @param didHash The hash of the DID
     * @param accessor The address to grant access to
     * @param dataType The type of data to grant access to
     */
    function grantAccess(
        bytes32 didHash, 
        address accessor, 
        string memory dataType
    ) 
        external 
        override 
        onlyDIDOwnerOrController(didHash) 
        didExists(didHash) 
        whenNotPaused 
        nonReentrant 
    {
        require(accessor != address(0), "Invalid accessor");
        require(bytes(dataType).length > 0, "Data type cannot be empty");
        require(_storedData[didHash][dataType].dataHash != bytes32(0), "Data does not exist");
        require(!_accessControl[didHash][accessor][dataType], "Access already granted");

        _accessControl[didHash][accessor][dataType] = true;
        _storedData[didHash][dataType].authorizedAccessors.push(accessor);

        emit AccessGranted(didHash, accessor, dataType);
    }

    /**
     * @dev Revoke access to stored data
     * @param didHash The hash of the DID
     * @param accessor The address to revoke access from
     * @param dataType The type of data to revoke access from
     */
    function revokeAccess(
        bytes32 didHash, 
        address accessor, 
        string memory dataType
    ) 
        external 
        override 
        onlyDIDOwnerOrController(didHash) 
        didExists(didHash) 
        whenNotPaused 
        nonReentrant 
    {
        require(bytes(dataType).length > 0, "Data type cannot be empty");
        require(_accessControl[didHash][accessor][dataType], "Access not granted");

        _accessControl[didHash][accessor][dataType] = false;

        // Remove from authorized accessors list
        StoredData storage data = _storedData[didHash][dataType];
        for (uint256 i = 0; i < data.authorizedAccessors.length; i++) {
            if (data.authorizedAccessors[i] == accessor) {
                data.authorizedAccessors[i] = data.authorizedAccessors[data.authorizedAccessors.length - 1];
                data.authorizedAccessors.pop();
                break;
            }
        }

        emit AccessRevoked(didHash, accessor, dataType);
    }

    /**
     * @dev Check if an address has access to stored data
     * @param didHash The hash of the DID
     * @param accessor The address to check
     * @param dataType The type of data
     * @return True if the address has access
     */
    function hasAccess(bytes32 didHash, address accessor, string memory dataType) 
        external 
        view 
        override 
        returns (bool) 
    {
        return _accessControl[didHash][accessor][dataType];
    }

    /**
     * @dev Get all data types stored for a DID
     * @param didHash The hash of the DID
     * @return Array of data types
     */
    function getAllDataTypes(bytes32 didHash) 
        external 
        view 
        override 
        returns (string[] memory) 
    {
        return _didDataTypes[didHash];
    }

    /**
     * @dev Get data hash for a specific DID and data type
     * @param didHash The hash of the DID
     * @param dataType The type of data
     * @return The data hash
     */
    function getDataHash(bytes32 didHash, string memory dataType) 
        external 
        view 
        hasDataAccess(didHash, dataType) 
        returns (bytes32) 
    {
        require(_storedData[didHash][dataType].dataHash != bytes32(0), "Data does not exist");
        return _storedData[didHash][dataType].dataHash;
    }

    /**
     * @dev Check if data exists for a DID and data type
     * @param didHash The hash of the DID
     * @param dataType The type of data
     * @return True if data exists
     */
    function dataExists(bytes32 didHash, string memory dataType) 
        external 
        view 
        returns (bool) 
    {
        return _storedData[didHash][dataType].dataHash != bytes32(0);
    }

    /**
     * @dev Pause the contract (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
