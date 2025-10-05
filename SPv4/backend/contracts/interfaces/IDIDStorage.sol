// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IDIDStorage
 * @dev Interface for Decentralized Identity Data Storage
 * @notice Defines functionality for storing encrypted DID data
 */
interface IDIDStorage {
    // Events
    event DataStored(bytes32 indexed didHash, string indexed dataType, bytes32 dataHash);
    event DataUpdated(bytes32 indexed didHash, string indexed dataType, bytes32 newDataHash);
    event DataDeleted(bytes32 indexed didHash, string indexed dataType);
    event AccessGranted(bytes32 indexed didHash, address indexed accessor, string dataType);
    event AccessRevoked(bytes32 indexed didHash, address indexed accessor, string dataType);

    // Structs
    struct StoredData {
        bytes32 dataHash;
        string dataType;
        uint256 timestamp;
        bool isEncrypted;
        address[] authorizedAccessors;
    }

    // Functions
    function storeData(bytes32 didHash, string memory dataType, bytes32 dataHash, bool isEncrypted) external;
    function updateData(bytes32 didHash, string memory dataType, bytes32 newDataHash) external;
    function deleteData(bytes32 didHash, string memory dataType) external;
    function getData(bytes32 didHash, string memory dataType) external view returns (StoredData memory);
    function grantAccess(bytes32 didHash, address accessor, string memory dataType) external;
    function revokeAccess(bytes32 didHash, address accessor, string memory dataType) external;
    function hasAccess(bytes32 didHash, address accessor, string memory dataType) external view returns (bool);
    function getAllDataTypes(bytes32 didHash) external view returns (string[] memory);
}
