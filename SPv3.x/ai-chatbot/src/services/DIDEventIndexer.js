const { ethers } = require('ethers');
const cron = require('node-cron');
const mongoose = require('mongoose');
const { DIDEvent, EventIndexerConfig, DIDPointer } = require('../models/DIDModels');

// Import shared types (we'll copy the necessary files)
const DIDRegistryABI = require('../../packages/shared-types/abis/DIDRegistry.json');
const DIDStorageABI = require('../../packages/shared-types/abis/DIDStorage.json');

class DIDEventIndexer {
  constructor() {
    this.provider = null;
    this.didRegistryContract = null;
    this.didStorageContract = null;
    this.isRunning = false;
    this.lastProcessedBlock = 0;
    this.contractAddresses = {
      DIDRegistry: process.env.DID_REGISTRY_ADDRESS,
      DIDStorage: process.env.DID_STORAGE_ADDRESS
    };
  }

  async initialize() {
    try {
      // Initialize provider
      const rpcUrl = process.env.RPC_URL || process.env.POLYGON_AMOY_URL || 'http://localhost:8545';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Initialize contracts
      if (this.contractAddresses.DIDRegistry) {
        this.didRegistryContract = new ethers.Contract(
          this.contractAddresses.DIDRegistry,
          DIDRegistryABI,
          this.provider
        );
      }

      if (this.contractAddresses.DIDStorage) {
        this.didStorageContract = new ethers.Contract(
          this.contractAddresses.DIDStorage,
          DIDStorageABI,
          this.provider
        );
      }

      // Initialize MongoDB connection
      await this.initializeDatabase();

      // Load last processed block
      await this.loadLastProcessedBlock();

      console.log('✅ DID Event Indexer initialized successfully');
      console.log(`📡 RPC URL: ${rpcUrl}`);
      console.log(`📋 DID Registry: ${this.contractAddresses.DIDRegistry || 'Not set'}`);
      console.log(`💾 DID Storage: ${this.contractAddresses.DIDStorage || 'Not set'}`);
      
    } catch (error) {
      console.error('❌ Failed to initialize DID Event Indexer:', error);
      throw error;
    }
  }

  async initializeDatabase() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/safepsy';
      await mongoose.connect(mongoUri);
      console.log('📊 Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  async loadLastProcessedBlock() {
    try {
      const config = await EventIndexerConfig.findOne({ key: 'lastProcessedBlock' });
      this.lastProcessedBlock = config ? config.value : 0;
      console.log(`📦 Last processed block: ${this.lastProcessedBlock}`);
    } catch (error) {
      console.error('❌ Failed to load last processed block:', error);
      this.lastProcessedBlock = 0;
    }
  }

  async saveLastProcessedBlock(blockNumber) {
    try {
      await EventIndexerConfig.findOneAndUpdate(
        { key: 'lastProcessedBlock' },
        { value: blockNumber },
        { upsert: true }
      );
      this.lastProcessedBlock = blockNumber;
    } catch (error) {
      console.error('❌ Failed to save last processed block:', error);
    }
  }

  async startIndexing() {
    if (this.isRunning) {
      console.log('⚠️ Event indexing is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting DID event indexing...');

    // Process historical events first
    await this.processHistoricalEvents();

    // Set up real-time event listening
    this.setupEventListeners();

    // Set up cron job for periodic sync (every 5 minutes)
    cron.schedule('*/5 * * * *', async () => {
      console.log('⏰ Running periodic event sync...');
      await this.processNewEvents();
    });

    console.log('✅ Event indexing started successfully');
  }

  async processHistoricalEvents() {
    try {
      console.log('📚 Processing historical events...');
      
      const currentBlock = await this.provider.getBlockNumber();
      const fromBlock = this.lastProcessedBlock || Math.max(0, currentBlock - 10000); // Last 10k blocks
      
      console.log(`📊 Processing blocks ${fromBlock} to ${currentBlock}`);

      // Process DID Registry events
      if (this.didRegistryContract) {
        await this.processRegistryEvents(fromBlock, currentBlock);
      }

      // Process DID Storage events
      if (this.didStorageContract) {
        await this.processStorageEvents(fromBlock, currentBlock);
      }

      await this.saveLastProcessedBlock(currentBlock);
      console.log('✅ Historical events processing completed');
      
    } catch (error) {
      console.error('❌ Error processing historical events:', error);
    }
  }

  async processRegistryEvents(fromBlock, toBlock) {
    try {
      const events = await this.didRegistryContract.queryFilter({}, fromBlock, toBlock);
      
      for (const event of events) {
        await this.processRegistryEvent(event);
      }
      
      console.log(`📋 Processed ${events.length} DID Registry events`);
    } catch (error) {
      console.error('❌ Error processing registry events:', error);
    }
  }

  async processStorageEvents(fromBlock, toBlock) {
    try {
      const events = await this.didStorageContract.queryFilter({}, fromBlock, toBlock);
      
      for (const event of events) {
        await this.processStorageEvent(event);
      }
      
      console.log(`💾 Processed ${events.length} DID Storage events`);
    } catch (error) {
      console.error('❌ Error processing storage events:', error);
    }
  }

  async processRegistryEvent(event) {
    try {
      const block = await event.getBlock();
      const timestamp = block.timestamp;

      const eventData = {
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.logIndex,
        timestamp: timestamp,
        contractAddress: event.address,
        eventName: event.fragment.name
      };

      switch (event.fragment.name) {
        case 'DIDCreated':
          await this.handleDIDCreated(event, eventData);
          break;
        case 'DIDUpdated':
          await this.handleDIDUpdated(event, eventData);
          break;
        case 'DIDRevoked':
          await this.handleDIDRevoked(event, eventData);
          break;
        case 'DIDTransferred':
          await this.handleDIDTransferred(event, eventData);
          break;
        case 'ControllerAdded':
          await this.handleControllerAdded(event, eventData);
          break;
        case 'ControllerRemoved':
          await this.handleControllerRemoved(event, eventData);
          break;
        default:
          console.log(`⚠️ Unknown registry event: ${event.fragment.name}`);
      }
    } catch (error) {
      console.error('❌ Error processing registry event:', error);
    }
  }

  async processStorageEvent(event) {
    try {
      const block = await event.getBlock();
      const timestamp = block.timestamp;

      const eventData = {
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.logIndex,
        timestamp: timestamp,
        contractAddress: event.address,
        eventName: event.fragment.name
      };

      switch (event.fragment.name) {
        case 'DataStored':
          await this.handleDataStored(event, eventData);
          break;
        case 'DataUpdated':
          await this.handleDataUpdated(event, eventData);
          break;
        case 'DataDeleted':
          await this.handleDataDeleted(event, eventData);
          break;
        case 'AccessGranted':
          await this.handleAccessGranted(event, eventData);
          break;
        case 'AccessRevoked':
          await this.handleAccessRevoked(event, eventData);
          break;
        default:
          console.log(`⚠️ Unknown storage event: ${event.fragment.name}`);
      }
    } catch (error) {
      console.error('❌ Error processing storage event:', error);
    }
  }

  // Event handlers
  async handleDIDCreated(event, eventData) {
    const [didHash, owner, did] = event.args;
    
    const didEvent = new DIDEvent({
      ...eventData,
      type: 'DIDCreated',
      didHash: didHash,
      owner: owner,
      did: did
    });

    await didEvent.save();
    
    // Update DID pointer
    await this.updateDIDPointer(didEvent);
    
    console.log(`✅ DID Created: ${did} (${didHash})`);
  }

  async handleDIDUpdated(event, eventData) {
    const [didHash, newDocument] = event.args;
    
    const didEvent = new DIDEvent({
      ...eventData,
      type: 'DIDUpdated',
      didHash: didHash,
      newDocument: newDocument
    });

    await didEvent.save();
    
    // Update DID pointer
    await this.updateDIDPointer(didEvent);
    
    console.log(`✅ DID Updated: ${didHash}`);
  }

  async handleDIDRevoked(event, eventData) {
    const [didHash] = event.args;
    
    const didEvent = new DIDEvent({
      ...eventData,
      type: 'DIDRevoked',
      didHash: didHash
    });

    await didEvent.save();
    
    // Update DID pointer
    await this.updateDIDPointer(didEvent);
    
    console.log(`✅ DID Revoked: ${didHash}`);
  }

  async handleDIDTransferred(event, eventData) {
    const [didHash, newOwner] = event.args;
    
    const didEvent = new DIDEvent({
      ...eventData,
      type: 'DIDTransferred',
      didHash: didHash,
      newOwner: newOwner
    });

    await didEvent.save();
    
    // Update DID pointer
    await this.updateDIDPointer(didEvent);
    
    console.log(`✅ DID Transferred: ${didHash} -> ${newOwner}`);
  }

  async handleControllerAdded(event, eventData) {
    const [didHash, controller] = event.args;
    
    const didEvent = new DIDEvent({
      ...eventData,
      type: 'ControllerAdded',
      didHash: didHash,
      controller: controller
    });

    await didEvent.save();
    
    // Update DID pointer
    await this.updateDIDPointer(didEvent);
    
    console.log(`✅ Controller Added: ${controller} for ${didHash}`);
  }

  async handleControllerRemoved(event, eventData) {
    const [didHash, controller] = event.args;
    
    const didEvent = new DIDEvent({
      ...eventData,
      type: 'ControllerRemoved',
      didHash: didHash,
      controller: controller
    });

    await didEvent.save();
    
    // Update DID pointer
    await this.updateDIDPointer(didEvent);
    
    console.log(`✅ Controller Removed: ${controller} from ${didHash}`);
  }

  async handleDataStored(event, eventData) {
    const [didHash, dataType, dataHash] = event.args;
    
    const didEvent = new DIDEvent({
      ...eventData,
      type: 'DataStored',
      didHash: didHash,
      dataType: dataType,
      dataHash: dataHash
    });

    await didEvent.save();
    
    // Update DID pointer
    await this.updateDIDPointer(didEvent);
    
    console.log(`✅ Data Stored: ${dataType} for ${didHash}`);
  }

  async handleDataUpdated(event, eventData) {
    const [didHash, dataType, newDataHash] = event.args;
    
    const didEvent = new DIDEvent({
      ...eventData,
      type: 'DataUpdated',
      didHash: didHash,
      dataType: dataType,
      newDataHash: newDataHash
    });

    await didEvent.save();
    
    // Update DID pointer
    await this.updateDIDPointer(didEvent);
    
    console.log(`✅ Data Updated: ${dataType} for ${didHash}`);
  }

  async handleDataDeleted(event, eventData) {
    const [didHash, dataType] = event.args;
    
    const didEvent = new DIDEvent({
      ...eventData,
      type: 'DataDeleted',
      didHash: didHash,
      dataType: dataType
    });

    await didEvent.save();
    
    // Update DID pointer
    await this.updateDIDPointer(didEvent);
    
    console.log(`✅ Data Deleted: ${dataType} for ${didHash}`);
  }

  async handleAccessGranted(event, eventData) {
    const [didHash, accessor, dataType] = event.args;
    
    const didEvent = new DIDEvent({
      ...eventData,
      type: 'AccessGranted',
      didHash: didHash,
      accessor: accessor,
      dataType: dataType
    });

    await didEvent.save();
    
    // Update DID pointer
    await this.updateDIDPointer(didEvent);
    
    console.log(`✅ Access Granted: ${accessor} for ${dataType} in ${didHash}`);
  }

  async handleAccessRevoked(event, eventData) {
    const [didHash, accessor, dataType] = event.args;
    
    const didEvent = new DIDEvent({
      ...eventData,
      type: 'AccessRevoked',
      didHash: didHash,
      accessor: accessor,
      dataType: dataType
    });

    await didEvent.save();
    
    // Update DID pointer
    await this.updateDIDPointer(didEvent);
    
    console.log(`✅ Access Revoked: ${accessor} for ${dataType} in ${didHash}`);
  }

  setupEventListeners() {
    if (this.didRegistryContract) {
      this.didRegistryContract.on('DIDCreated', async (didHash, owner, did, event) => {
        const block = await event.getBlock();
        await this.handleDIDCreated(event, {
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          logIndex: event.logIndex,
          timestamp: block.timestamp,
          contractAddress: event.address,
          eventName: 'DIDCreated'
        });
      });

      this.didRegistryContract.on('DIDUpdated', async (didHash, newDocument, event) => {
        const block = await event.getBlock();
        await this.handleDIDUpdated(event, {
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          logIndex: event.logIndex,
          timestamp: block.timestamp,
          contractAddress: event.address,
          eventName: 'DIDUpdated'
        });
      });

      // Add other event listeners as needed...
    }

    if (this.didStorageContract) {
      this.didStorageContract.on('DataStored', async (didHash, dataType, dataHash, event) => {
        const block = await event.getBlock();
        await this.handleDataStored(event, {
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          logIndex: event.logIndex,
          timestamp: block.timestamp,
          contractAddress: event.address,
          eventName: 'DataStored'
        });
      });

      // Add other storage event listeners as needed...
    }
  }

  async processNewEvents() {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      const fromBlock = this.lastProcessedBlock + 1;
      
      if (fromBlock <= currentBlock) {
        console.log(`📊 Processing new events from block ${fromBlock} to ${currentBlock}`);
        
        if (this.didRegistryContract) {
          await this.processRegistryEvents(fromBlock, currentBlock);
        }
        
        if (this.didStorageContract) {
          await this.processStorageEvents(fromBlock, currentBlock);
        }
        
        await this.saveLastProcessedBlock(currentBlock);
      }
    } catch (error) {
      console.error('❌ Error processing new events:', error);
    }
  }

  async stopIndexing() {
    this.isRunning = false;
    console.log('🛑 DID event indexing stopped');
  }

  // Update DID pointer based on event
  async updateDIDPointer(event) {
    try {
      let didPointer = await DIDPointer.findOne({ didHash: event.didHash });
      
      if (!didPointer) {
        // Create new DID pointer
        didPointer = new DIDPointer({
          didHash: event.didHash,
          did: event.did || '',
          owner: event.owner || '',
          document: event.newDocument || '',
          createdAt: event.timestamp,
          updatedAt: event.timestamp,
          isActive: true,
          controllers: [],
          dataTypes: [],
          dataHashes: new Map(),
          accessControl: new Map()
        });
      }
      
      // Update pointer based on event
      didPointer.updateFromEvent(event);
      
      await didPointer.save();
      
    } catch (error) {
      console.error('❌ Error updating DID pointer:', error);
    }
  }
}

module.exports = DIDEventIndexer;
