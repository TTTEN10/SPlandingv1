// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { expect } from "chai";
import { ethers } from "hardhat";
import { DIDRegistry } from "../contracts/DIDRegistry.sol";
import { DIDStorage } from "../contracts/DIDStorage.sol";

describe("DIDStorage", function () {
    let didRegistry: DIDRegistry;
    let didStorage: DIDStorage;
    let owner: any;
    let user1: any;
    let user2: any;
    let user3: any;

    beforeEach(async function () {
        [owner, user1, user2, user3] = await ethers.getSigners();
        
        // Deploy DIDRegistry first
        const DIDRegistryFactory = await ethers.getContractFactory("DIDRegistry");
        didRegistry = await DIDRegistryFactory.deploy();
        await didRegistry.waitForDeployment();

        // Deploy DIDStorage with DIDRegistry address
        const DIDStorageFactory = await ethers.getContractFactory("DIDStorage");
        didStorage = await DIDStorageFactory.deploy(await didRegistry.getAddress());
        await didStorage.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await didStorage.owner()).to.equal(owner.address);
        });

        it("Should set the correct DID registry address", async function () {
            expect(await didStorage.didRegistry()).to.equal(await didRegistry.getAddress());
        });
    });

    describe("Data Storage", function () {
        let didHash: string;
        const did = "did:safepsy:test123";
        const document = '{"test": "document"}';
        const dataType = "profile";
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test data"));

        beforeEach(async function () {
            await didRegistry.connect(user1).createDID(did, document);
            didHash = await didRegistry.getDIDHash(did);
        });

        it("Should store data successfully", async function () {
            await expect(didStorage.connect(user1).storeData(didHash, dataType, dataHash, true))
                .to.emit(didStorage, "DataStored");
        });

        it("Should revert when storing data for non-existent DID", async function () {
            const fakeDidHash = ethers.keccak256(ethers.toUtf8Bytes("fake"));
            
            await expect(didStorage.connect(user1).storeData(fakeDidHash, dataType, dataHash, true))
                .to.be.revertedWith("DID does not exist");
        });

        it("Should revert when non-authorized user tries to store data", async function () {
            await expect(didStorage.connect(user2).storeData(didHash, dataType, dataHash, true))
                .to.be.revertedWith("Not authorized");
        });

        it("Should revert when storing data with empty data type", async function () {
            await expect(didStorage.connect(user1).storeData(didHash, "", dataHash, true))
                .to.be.revertedWith("Data type cannot be empty");
        });

        it("Should revert when storing data with empty data hash", async function () {
            await expect(didStorage.connect(user1).storeData(didHash, dataType, ethers.ZeroHash, true))
                .to.be.revertedWith("Data hash cannot be empty");
        });
    });

    describe("Data Management", function () {
        let didHash: string;
        const did = "did:safepsy:test123";
        const document = '{"test": "document"}';
        const dataType = "profile";
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test data"));

        beforeEach(async function () {
            await didRegistry.connect(user1).createDID(did, document);
            didHash = await didRegistry.getDIDHash(did);
            await didStorage.connect(user1).storeData(didHash, dataType, dataHash, true);
        });

        it("Should update data successfully", async function () {
            const newDataHash = ethers.keccak256(ethers.toUtf8Bytes("updated data"));
            
            await expect(didStorage.connect(user1).updateData(didHash, dataType, newDataHash))
                .to.emit(didStorage, "DataUpdated");
        });

        it("Should delete data successfully", async function () {
            await expect(didStorage.connect(user1).deleteData(didHash, dataType))
                .to.emit(didStorage, "DataDeleted");
        });

        it("Should revert when updating non-existent data", async function () {
            const newDataHash = ethers.keccak256(ethers.toUtf8Bytes("updated data"));
            
            await expect(didStorage.connect(user1).updateData(didHash, "nonexistent", newDataHash))
                .to.be.revertedWith("Data does not exist");
        });

        it("Should revert when deleting non-existent data", async function () {
            await expect(didStorage.connect(user1).deleteData(didHash, "nonexistent"))
                .to.be.revertedWith("Data does not exist");
        });
    });

    describe("Access Control", function () {
        let didHash: string;
        const did = "did:safepsy:test123";
        const document = '{"test": "document"}';
        const dataType = "profile";
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test data"));

        beforeEach(async function () {
            await didRegistry.connect(user1).createDID(did, document);
            didHash = await didRegistry.getDIDHash(did);
            await didStorage.connect(user1).storeData(didHash, dataType, dataHash, true);
        });

        it("Should grant access successfully", async function () {
            await expect(didStorage.connect(user1).grantAccess(didHash, user2.address, dataType))
                .to.emit(didStorage, "AccessGranted");
            
            expect(await didStorage.hasAccess(didHash, user2.address, dataType)).to.be.true;
        });

        it("Should revoke access successfully", async function () {
            await didStorage.connect(user1).grantAccess(didHash, user2.address, dataType);
            
            await expect(didStorage.connect(user1).revokeAccess(didHash, user2.address, dataType))
                .to.emit(didStorage, "AccessRevoked");
            
            expect(await didStorage.hasAccess(didHash, user2.address, dataType)).to.be.false;
        });

        it("Should revert when granting access to non-existent data", async function () {
            await expect(didStorage.connect(user1).grantAccess(didHash, user2.address, "nonexistent"))
                .to.be.revertedWith("Data does not exist");
        });

        it("Should revert when non-authorized user tries to grant access", async function () {
            await expect(didStorage.connect(user2).grantAccess(didHash, user3.address, dataType))
                .to.be.revertedWith("Not authorized");
        });
    });

    describe("Data Retrieval", function () {
        let didHash: string;
        const did = "did:safepsy:test123";
        const document = '{"test": "document"}';
        const dataType = "profile";
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test data"));

        beforeEach(async function () {
            await didRegistry.connect(user1).createDID(did, document);
            didHash = await didRegistry.getDIDHash(did);
            await didStorage.connect(user1).storeData(didHash, dataType, dataHash, true);
        });

        it("Should retrieve data successfully", async function () {
            const storedData = await didStorage.connect(user1).getData(didHash, dataType);
            expect(storedData.dataHash).to.equal(dataHash);
            expect(storedData.dataType).to.equal(dataType);
            expect(storedData.isEncrypted).to.be.true;
        });

        it("Should revert when accessing data without permission", async function () {
            await expect(didStorage.connect(user2).getData(didHash, dataType))
                .to.be.revertedWith("Access denied");
        });

        it("Should get all data types", async function () {
            const dataTypes = await didStorage.getAllDataTypes(didHash);
            expect(dataTypes.length).to.equal(1);
            expect(dataTypes[0]).to.equal(dataType);
        });

        it("Should check if data exists", async function () {
            expect(await didStorage.dataExists(didHash, dataType)).to.be.true;
            expect(await didStorage.dataExists(didHash, "nonexistent")).to.be.false;
        });
    });

    describe("Controller Access", function () {
        let didHash: string;
        const did = "did:safepsy:test123";
        const document = '{"test": "document"}';
        const dataType = "profile";
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test data"));

        beforeEach(async function () {
            await didRegistry.connect(user1).createDID(did, document);
            didHash = await didRegistry.getDIDHash(did);
            await didRegistry.connect(user1).addController(didHash, user2.address);
            await didStorage.connect(user1).storeData(didHash, dataType, dataHash, true);
        });

        it("Should allow controller to manage data", async function () {
            const newDataHash = ethers.keccak256(ethers.toUtf8Bytes("controller updated"));
            
            await expect(didStorage.connect(user2).updateData(didHash, dataType, newDataHash))
                .to.emit(didStorage, "DataUpdated");
        });

        it("Should allow controller to grant access", async function () {
            await expect(didStorage.connect(user2).grantAccess(didHash, user3.address, dataType))
                .to.emit(didStorage, "AccessGranted");
        });
    });

    describe("Pause Functionality", function () {
        it("Should pause and unpause contract", async function () {
            await didStorage.pause();
            expect(await didStorage.paused()).to.be.true;
            
            await didStorage.unpause();
            expect(await didStorage.paused()).to.be.false;
        });

        it("Should revert when non-owner tries to pause", async function () {
            await expect(didStorage.connect(user1).pause())
                .to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});
