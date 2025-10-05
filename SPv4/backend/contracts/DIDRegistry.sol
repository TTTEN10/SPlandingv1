// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IDIDRegistry.sol";

/**
 * @title DIDRegistry
 * @dev Decentralized Identity Registry Contract
 * @notice Manages DID creation, updates, revocation, and controller access
 */
contract DIDRegistry is IDIDRegistry, ReentrancyGuard, Ownable, Pausable {
    using Counters for Counters.Counter;

    // State variables
    Counters.Counter private _didCounter;
    
    // Mappings
    mapping(bytes32 => DIDDocument) private _didDocuments;
    mapping(address => bytes32[]) private _ownerToDIDs;
    mapping(string => bytes32) private _didStringToHash;
    mapping(bytes32 => mapping(address => bool)) private _controllerAccess;

    // Constants
    bytes32 public constant DID_PREFIX = keccak256("did:safepsy:");
    
    // Modifiers
    modifier onlyDIDOwner(bytes32 didHash) {
        require(_didDocuments[didHash].owner == msg.sender, "Not DID owner");
        _;
    }

    modifier onlyDIDController(bytes32 didHash) {
        require(
            _didDocuments[didHash].owner == msg.sender || 
            _controllerAccess[didHash][msg.sender],
            "Not authorized"
        );
        _;
    }

    modifier didExists(bytes32 didHash) {
        require(_didDocuments[didHash].isActive, "DID does not exist");
        _;
    }

    modifier didNotExists(string memory did) {
        require(_didStringToHash[did] == bytes32(0), "DID already exists");
        _;
    }

    constructor() {
        _didCounter.increment(); // Start from 1
    }

    /**
     * @dev Create a new DID
     * @param did The DID string (e.g., "did:safepsy:123")
     * @param document The DID document JSON string
     * @return didHash The hash of the created DID
     */
    function createDID(string memory did, string memory document) 
        external 
        override 
        whenNotPaused 
        nonReentrant 
        didNotExists(did)
        returns (bytes32) 
    {
        require(bytes(did).length > 0, "DID cannot be empty");
        require(bytes(document).length > 0, "Document cannot be empty");
        
        bytes32 didHash = keccak256(abi.encodePacked(DID_PREFIX, did));
        
        // Create DID document
        _didDocuments[didHash] = DIDDocument({
            did: did,
            owner: msg.sender,
            document: document,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            isActive: true,
            controllers: new address[](0)
        });

        // Update mappings
        _ownerToDIDs[msg.sender].push(didHash);
        _didStringToHash[did] = didHash;
        _controllerAccess[didHash][msg.sender] = true;

        emit DIDCreated(didHash, msg.sender, did);
        return didHash;
    }

    /**
     * @dev Update a DID document
     * @param didHash The hash of the DID to update
     * @param newDocument The new DID document JSON string
     */
    function updateDID(bytes32 didHash, string memory newDocument) 
        external 
        override 
        onlyDIDController(didHash) 
        didExists(didHash) 
        whenNotPaused 
        nonReentrant 
    {
        require(bytes(newDocument).length > 0, "Document cannot be empty");
        
        DIDDocument storage didDoc = _didDocuments[didHash];
        didDoc.document = newDocument;
        didDoc.updatedAt = block.timestamp;

        emit DIDUpdated(didHash, newDocument);
    }

    /**
     * @dev Revoke a DID
     * @param didHash The hash of the DID to revoke
     */
    function revokeDID(bytes32 didHash) 
        external 
        override 
        onlyDIDOwner(didHash) 
        didExists(didHash) 
        whenNotPaused 
        nonReentrant 
    {
        DIDDocument storage didDoc = _didDocuments[didHash];
        didDoc.isActive = false;
        didDoc.updatedAt = block.timestamp;

        // Clear controller access
        for (uint256 i = 0; i < didDoc.controllers.length; i++) {
            _controllerAccess[didHash][didDoc.controllers[i]] = false;
        }

        emit DIDRevoked(didHash);
    }

    /**
     * @dev Transfer ownership of a DID
     * @param didHash The hash of the DID to transfer
     * @param newOwner The new owner address
     */
    function transferDID(bytes32 didHash, address newOwner) 
        external 
        override 
        onlyDIDOwner(didHash) 
        didExists(didHash) 
        whenNotPaused 
        nonReentrant 
    {
        require(newOwner != address(0), "Invalid new owner");
        require(newOwner != msg.sender, "Cannot transfer to self");

        DIDDocument storage didDoc = _didDocuments[didHash];
        
        // Remove from old owner's list
        bytes32[] storage oldOwnerDIDs = _ownerToDIDs[msg.sender];
        for (uint256 i = 0; i < oldOwnerDIDs.length; i++) {
            if (oldOwnerDIDs[i] == didHash) {
                oldOwnerDIDs[i] = oldOwnerDIDs[oldOwnerDIDs.length - 1];
                oldOwnerDIDs.pop();
                break;
            }
        }

        // Update ownership
        didDoc.owner = newOwner;
        didDoc.updatedAt = block.timestamp;
        
        // Clear old controller access and set new owner access
        _controllerAccess[didHash][msg.sender] = false;
        _controllerAccess[didHash][newOwner] = true;

        // Add to new owner's list
        _ownerToDIDs[newOwner].push(didHash);

        emit DIDTransferred(didHash, newOwner);
    }

    /**
     * @dev Add a controller to a DID
     * @param didHash The hash of the DID
     * @param controller The controller address to add
     */
    function addController(bytes32 didHash, address controller) 
        external 
        override 
        onlyDIDOwner(didHash) 
        didExists(didHash) 
        whenNotPaused 
        nonReentrant 
    {
        require(controller != address(0), "Invalid controller");
        require(!_controllerAccess[didHash][controller], "Controller already exists");

        DIDDocument storage didDoc = _didDocuments[didHash];
        didDoc.controllers.push(controller);
        _controllerAccess[didHash][controller] = true;

        emit ControllerAdded(didHash, controller);
    }

    /**
     * @dev Remove a controller from a DID
     * @param didHash The hash of the DID
     * @param controller The controller address to remove
     */
    function removeController(bytes32 didHash, address controller) 
        external 
        override 
        onlyDIDOwner(didHash) 
        didExists(didHash) 
        whenNotPaused 
        nonReentrant 
    {
        require(_controllerAccess[didHash][controller], "Controller does not exist");

        DIDDocument storage didDoc = _didDocuments[didHash];
        
        // Remove from controllers array
        for (uint256 i = 0; i < didDoc.controllers.length; i++) {
            if (didDoc.controllers[i] == controller) {
                didDoc.controllers[i] = didDoc.controllers[didDoc.controllers.length - 1];
                didDoc.controllers.pop();
                break;
            }
        }

        _controllerAccess[didHash][controller] = false;

        emit ControllerRemoved(didHash, controller);
    }

    /**
     * @dev Get DID document by hash
     * @param didHash The hash of the DID
     * @return The DID document
     */
    function getDID(bytes32 didHash) 
        external 
        view 
        override 
        returns (DIDDocument memory) 
    {
        require(_didDocuments[didHash].isActive, "DID does not exist");
        return _didDocuments[didHash];
    }

    /**
     * @dev Check if a DID is active
     * @param didHash The hash of the DID
     * @return True if the DID is active
     */
    function isDIDActive(bytes32 didHash) external view override returns (bool) {
        return _didDocuments[didHash].isActive;
    }

    /**
     * @dev Check if an address has controller access to a DID
     * @param didHash The hash of the DID
     * @param controller The controller address
     * @return True if the address has controller access
     */
    function hasControllerAccess(bytes32 didHash, address controller) 
        external 
        view 
        override 
        returns (bool) 
    {
        return _controllerAccess[didHash][controller];
    }

    /**
     * @dev Get all DIDs owned by an address
     * @param owner The owner address
     * @return Array of DID hashes
     */
    function getDIDByAddress(address owner) 
        external 
        view 
        override 
        returns (bytes32[] memory) 
    {
        return _ownerToDIDs[owner];
    }

    /**
     * @dev Get DID hash by DID string
     * @param did The DID string
     * @return The DID hash
     */
    function getDIDHash(string memory did) external view returns (bytes32) {
        return _didStringToHash[did];
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

    /**
     * @dev Get total number of DIDs created
     * @return Total count
     */
    function getTotalDIDCount() external view returns (uint256) {
        return _didCounter.current() - 1;
    }
}
