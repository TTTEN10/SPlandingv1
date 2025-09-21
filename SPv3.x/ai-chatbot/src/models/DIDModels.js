const mongoose = require('mongoose');

// DID Event Schema
const DIDEventSchema = new mongoose.Schema({
  // Event identification
  blockNumber: { type: Number, required: true, index: true },
  transactionHash: { type: String, required: true, index: true },
  logIndex: { type: Number, required: true },
  timestamp: { type: Number, required: true, index: true },
  contractAddress: { type: String, required: true },
  eventName: { type: String, required: true },
  
  // Event type
  type: { 
    type: String, 
    required: true,
    enum: [
      'DIDCreated',
      'DIDUpdated', 
      'DIDRevoked',
      'DIDTransferred',
      'ControllerAdded',
      'ControllerRemoved',
      'DataStored',
      'DataUpdated',
      'DataDeleted',
      'AccessGranted',
      'AccessRevoked'
    ],
    index: true
  },
  
  // DID-specific fields
  didHash: { type: String, index: true },
  did: { type: String },
  owner: { type: String },
  newOwner: { type: String },
  controller: { type: String },
  
  // Document fields
  newDocument: { type: String },
  
  // Data-specific fields
  dataType: { type: String },
  dataHash: { type: String },
  newDataHash: { type: String },
  accessor: { type: String },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  processedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
DIDEventSchema.index({ didHash: 1, timestamp: -1 });
DIDEventSchema.index({ type: 1, timestamp: -1 });
DIDEventSchema.index({ blockNumber: 1, logIndex: 1 }, { unique: true });

// Event Indexer Config Schema
const EventIndexerConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// DID Pointer Schema for mirroring DID state
const DIDPointerSchema = new mongoose.Schema({
  didHash: { type: String, required: true, unique: true },
  did: { type: String, required: true },
  owner: { type: String, required: true },
  document: { type: String },
  createdAt: { type: Number },
  updatedAt: { type: Number },
  isActive: { type: Boolean, default: true },
  controllers: [{ type: String }],
  
  // Data storage references
  dataTypes: [{ type: String }],
  dataHashes: { type: Map, of: String }, // dataType -> dataHash mapping
  
  // Access control
  accessControl: { 
    type: Map, 
    of: { 
      type: Map, 
      of: Boolean 
    } 
  }, // didHash -> accessor -> dataType -> hasAccess
  
  // Metadata
  lastEventBlock: { type: Number },
  lastEventTimestamp: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for DID Pointer
DIDPointerSchema.index({ didHash: 1 });
DIDPointerSchema.index({ owner: 1 });
DIDPointerSchema.index({ did: 1 });
DIDPointerSchema.index({ isActive: 1 });

// Static methods for DID Pointer
DIDPointerSchema.statics.findByOwner = function(owner) {
  return this.find({ owner, isActive: true });
};

DIDPointerSchema.statics.findByDID = function(did) {
  return this.findOne({ did, isActive: true });
};

DIDPointerSchema.statics.findByDIDHash = function(didHash) {
  return this.findOne({ didHash });
};

// Instance methods for DID Pointer
DIDPointerSchema.methods.updateFromEvent = function(event) {
  switch (event.type) {
    case 'DIDCreated':
      this.did = event.did;
      this.owner = event.owner;
      this.document = event.newDocument;
      this.createdAt = event.timestamp;
      this.updatedAt = event.timestamp;
      this.isActive = true;
      this.controllers = [];
      break;
      
    case 'DIDUpdated':
      this.document = event.newDocument;
      this.updatedAt = event.timestamp;
      break;
      
    case 'DIDRevoked':
      this.isActive = false;
      this.updatedAt = event.timestamp;
      break;
      
    case 'DIDTransferred':
      this.owner = event.newOwner;
      this.updatedAt = event.timestamp;
      break;
      
    case 'ControllerAdded':
      if (!this.controllers.includes(event.controller)) {
        this.controllers.push(event.controller);
      }
      this.updatedAt = event.timestamp;
      break;
      
    case 'ControllerRemoved':
      this.controllers = this.controllers.filter(c => c !== event.controller);
      this.updatedAt = event.timestamp;
      break;
      
    case 'DataStored':
      if (!this.dataTypes.includes(event.dataType)) {
        this.dataTypes.push(event.dataType);
      }
      if (!this.dataHashes) {
        this.dataHashes = new Map();
      }
      this.dataHashes.set(event.dataType, event.dataHash);
      this.updatedAt = event.timestamp;
      break;
      
    case 'DataUpdated':
      if (this.dataHashes) {
        this.dataHashes.set(event.dataType, event.newDataHash);
      }
      this.updatedAt = event.timestamp;
      break;
      
    case 'DataDeleted':
      this.dataTypes = this.dataTypes.filter(dt => dt !== event.dataType);
      if (this.dataHashes) {
        this.dataHashes.delete(event.dataType);
      }
      this.updatedAt = event.timestamp;
      break;
      
    case 'AccessGranted':
      if (!this.accessControl) {
        this.accessControl = new Map();
      }
      if (!this.accessControl.has(event.accessor)) {
        this.accessControl.set(event.accessor, new Map());
      }
      this.accessControl.get(event.accessor).set(event.dataType, true);
      this.updatedAt = event.timestamp;
      break;
      
    case 'AccessRevoked':
      if (this.accessControl && this.accessControl.has(event.accessor)) {
        this.accessControl.get(event.accessor).set(event.dataType, false);
      }
      this.updatedAt = event.timestamp;
      break;
  }
  
  this.lastEventBlock = event.blockNumber;
  this.lastEventTimestamp = event.timestamp;
};

// Create models
const DIDEvent = mongoose.model('DIDEvent', DIDEventSchema);
const EventIndexerConfig = mongoose.model('EventIndexerConfig', EventIndexerConfigSchema);
const DIDPointer = mongoose.model('DIDPointer', DIDPointerSchema);

module.exports = {
  DIDEvent,
  EventIndexerConfig,
  DIDPointer
};
