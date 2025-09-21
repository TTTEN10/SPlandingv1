// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { expect } from "chai";
import { ethers } from "hardhat";
import { DIDRegistry } from "../contracts/DIDRegistry.sol";
import { DIDStorage } from "../contracts/DIDStorage.sol";

describe("DIDRegistry", function () {
    let didRegistry: DIDRegistry;
    let owner: any;
    let user1: any;
    let user2: any;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        
        const DIDRegistryFactory = await ethers.getContractFactory("DIDRegistry");
        didRegistry = await DIDRegistryFactory.deploy();
        await didRegistry.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await didRegistry.owner()).to.equal(owner.address);
        });

        it("Should initialize with correct values", async function () {
            expect(await didRegistry.getTotalDIDCount()).to.equal(0);
        });
    });

    describe("DID Creation", function () {
        it("Should create a DID successfully", async function () {
            const did = "did:safepsy:test123";
            const document = '{"@context": "https://www.w3.org/ns/did/v1", "id": "did:safepsy:test123"}';
            
            await expect(didRegistry.connect(user1).createDID(did, document))
                .to.emit(didRegistry, "DIDCreated");
        });

        it("Should revert when creating DID with empty string", async function () {
            const document = '{"test": "document"}';
            
            await expect(didRegistry.connect(user1).createDID("", document))
                .to.be.revertedWith("DID cannot be empty");
        });

        it("Should revert when creating DID with empty document", async function () {
            const did = "did:safepsy:test123";
            
            await expect(didRegistry.connect(user1).createDID(did, ""))
                .to.be.revertedWith("Document cannot be empty");
        });

        it("Should revert when creating duplicate DID", async function () {
            const did = "did:safepsy:test123";
            const document = '{"test": "document"}';
            
            await didRegistry.connect(user1).createDID(did, document);
            
            await expect(didRegistry.connect(user2).createDID(did, document))
                .to.be.revertedWith("DID already exists");
        });
    });

    describe("DID Management", function () {
        let didHash: string;
        const did = "did:safepsy:test123";
        const document = '{"@context": "https://www.w3.org/ns/did/v1", "id": "did:safepsy:test123"}';

        beforeEach(async function () {
            await didRegistry.connect(user1).createDID(did, document);
            didHash = await didRegistry.getDIDHash(did);
        });

        it("Should update DID document", async function () {
            const newDocument = '{"@context": "https://www.w3.org/ns/did/v1", "id": "did:safepsy:test123", "updated": true}';
            
            await expect(didRegistry.connect(user1).updateDID(didHash, newDocument))
                .to.emit(didRegistry, "DIDUpdated");
        });

        it("Should revoke DID", async function () {
            await expect(didRegistry.connect(user1).revokeDID(didHash))
                .to.emit(didRegistry, "DIDRevoked");
            
            expect(await didRegistry.isDIDActive(didHash)).to.be.false;
        });

        it("Should transfer DID ownership", async function () {
            await expect(didRegistry.connect(user1).transferDID(didHash, user2.address))
                .to.emit(didRegistry, "DIDTransferred");
        });
    });

    describe("Controller Management", function () {
        let didHash: string;
        const did = "did:safepsy:test123";
        const document = '{"test": "document"}';

        beforeEach(async function () {
            await didRegistry.connect(user1).createDID(did, document);
            didHash = await didRegistry.getDIDHash(did);
        });

        it("Should add controller", async function () {
            await expect(didRegistry.connect(user1).addController(didHash, user2.address))
                .to.emit(didRegistry, "ControllerAdded");
            
            expect(await didRegistry.hasControllerAccess(didHash, user2.address)).to.be.true;
        });

        it("Should remove controller", async function () {
            await didRegistry.connect(user1).addController(didHash, user2.address);
            
            await expect(didRegistry.connect(user1).removeController(didHash, user2.address))
                .to.emit(didRegistry, "ControllerRemoved");
            
            expect(await didRegistry.hasControllerAccess(didHash, user2.address)).to.be.false;
        });
    });

    describe("Access Control", function () {
        let didHash: string;
        const did = "did:safepsy:test123";
        const document = '{"test": "document"}';

        beforeEach(async function () {
            await didRegistry.connect(user1).createDID(did, document);
            didHash = await didRegistry.getDIDHash(did);
        });

        it("Should revert when non-owner tries to update DID", async function () {
            const newDocument = '{"updated": true}';
            
            await expect(didRegistry.connect(user2).updateDID(didHash, newDocument))
                .to.be.revertedWith("Not authorized");
        });

        it("Should revert when non-owner tries to revoke DID", async function () {
            await expect(didRegistry.connect(user2).revokeDID(didHash))
                .to.be.revertedWith("Not DID owner");
        });
    });

    describe("Pause Functionality", function () {
        it("Should pause and unpause contract", async function () {
            await didRegistry.pause();
            expect(await didRegistry.paused()).to.be.true;
            
            await didRegistry.unpause();
            expect(await didRegistry.paused()).to.be.false;
        });

        it("Should revert when non-owner tries to pause", async function () {
            await expect(didRegistry.connect(user1).pause())
                .to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});
