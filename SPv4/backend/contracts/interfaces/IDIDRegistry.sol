// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IDIDRegistry
 * @dev Interface for Decentralized Identity Registry
 * @notice Defines the core functionality for managing DIDs
 */
interface IDIDRegistry {
    // Events
    event DIDCreated(bytes32 indexed didHash, address indexed owner, string did);
    event DIDUpdated(bytes32 indexed didHash, string newDocument);
    event DIDRevoked(bytes32 indexed didHash);
    event DIDTransferred(bytes32 indexed didHash, address indexed newOwner);
    event ControllerAdded(bytes32 indexed didHash, address indexed controller);
    event ControllerRemoved(bytes32 indexed didHash, address indexed controller);

    // Structs
    struct DIDDocument {
        string did;
        address owner;
        string document;
        uint256 createdAt;
        uint256 updatedAt;
        bool isActive;
        address[] controllers;
    }

    // Functions
    function createDID(string memory did, string memory document) external returns (bytes32);
    function updateDID(bytes32 didHash, string memory newDocument) external;
    function revokeDID(bytes32 didHash) external;
    function transferDID(bytes32 didHash, address newOwner) external;
    function addController(bytes32 didHash, address controller) external;
    function removeController(bytes32 didHash, address controller) external;
    function getDID(bytes32 didHash) external view returns (DIDDocument memory);
    function isDIDActive(bytes32 didHash) external view returns (bool);
    function hasControllerAccess(bytes32 didHash, address controller) external view returns (bool);
    function getDIDByAddress(address owner) external view returns (bytes32[] memory);
}
