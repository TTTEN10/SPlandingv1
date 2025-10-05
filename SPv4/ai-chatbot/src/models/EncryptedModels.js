const mongoose = require('mongoose');

// Encrypted Conversation Schema
const EncryptedConversationSchema = new mongoose.Schema({
  // User identification
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  didHash: { type: String, required: true, index: true },
  
  // Encrypted conversation data
  encryptedMessages: { type: String, required: true }, // Encrypted JSON string
  iv: { type: String, required: true }, // Initialization vector
  tag: { type: String, required: true }, // Authentication tag
  dataHash: { type: String, required: true }, // Hash for integrity verification
  
  // Session information
  sessionId: { type: String, required: true, index: true },
  sessionType: { 
    type: String, 
    enum: ['therapy', 'consultation', 'assessment', 'follow-up'],
    default: 'therapy'
  },
  
  // Metadata
  messageCount: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 }, // in minutes
  sentimentScore: { type: Number }, // -1 to 1
  riskLevel: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  
  // Timestamps
  startedAt: { type: Date, required: true },
  endedAt: { type: Date },
  lastMessageAt: { type: Date },
  
  // Consent and privacy
  consentGiven: { type: Boolean, default: false },
  consentTimestamp: { type: Date },
  dataRetentionPeriod: { type: Number, default: 30 }, // days
  
  // Access control
  authorizedAccessors: [{ type: String }], // DID addresses with access
  accessLog: [{
    accessor: String,
    accessType: { type: String, enum: ['read', 'update', 'delete'] },
    timestamp: { type: Date, default: Date.now },
    reason: String
  }],
  
  // Compliance
  gdprCompliant: { type: Boolean, default: true },
  hipaaCompliant: { type: Boolean, default: true },
  anonymized: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Encrypted User Profile Schema
const EncryptedUserProfileSchema = new mongoose.Schema({
  // User identification
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  didHash: { type: String, required: true, unique: true },
  
  // Encrypted profile data
  encryptedProfile: { type: String, required: true }, // Encrypted JSON string
  iv: { type: String, required: true }, // Initialization vector
  tag: { type: String, required: true }, // Authentication tag
  dataHash: { type: String, required: true }, // Hash for integrity verification
  
  // Profile metadata
  profileVersion: { type: Number, default: 1 },
  lastUpdated: { type: Date, default: Date.now },
  
  // Access control
  authorizedAccessors: [{ type: String }], // DID addresses with access
  
  // Compliance
  gdprCompliant: { type: Boolean, default: true },
  hipaaCompliant: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Encrypted Therapy Session Schema
const EncryptedTherapySessionSchema = new mongoose.Schema({
  // User identification
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  didHash: { type: String, required: true, index: true },
  
  // Encrypted session data
  encryptedSessionData: { type: String, required: true }, // Encrypted JSON string
  iv: { type: String, required: true }, // Initialization vector
  tag: { type: String, required: true }, // Authentication tag
  dataHash: { type: String, required: true }, // Hash for integrity verification
  
  // Session information
  sessionId: { type: String, required: true, unique: true },
  sessionType: { 
    type: String, 
    enum: ['individual', 'group', 'family', 'couples'],
    default: 'individual'
  },
  therapyType: { 
    type: String, 
    enum: ['cbt', 'dbt', 'psychodynamic', 'humanistic', 'behavioral', 'other'],
    default: 'cbt'
  },
  
  // Session metadata
  duration: { type: Number, required: true }, // in minutes
  goals: [{ type: String }], // Therapy goals
  progress: { type: Number, min: 0, max: 100 }, // Progress percentage
  notes: { type: String }, // Therapist notes (encrypted separately)
  
  // Timestamps
  scheduledAt: { type: Date, required: true },
  startedAt: { type: Date },
  endedAt: { type: Date },
  
  // Consent and privacy
  consentGiven: { type: Boolean, default: false },
  consentTimestamp: { type: Date },
  recordingConsent: { type: Boolean, default: false },
  
  // Access control
  authorizedAccessors: [{ type: String }], // DID addresses with access
  therapistDid: { type: String }, // Therapist's DID
  
  // Compliance
  gdprCompliant: { type: Boolean, default: true },
  hipaaCompliant: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Consent Management Schema
const ConsentManagementSchema = new mongoose.Schema({
  // User identification
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  didHash: { type: String, required: true, index: true },
  
  // Consent types
  dataProcessingConsent: { 
    type: Boolean, 
    required: true,
    default: false 
  },
  dataSharingConsent: { 
    type: Boolean, 
    required: true,
    default: false 
  },
  therapyConsent: { 
    type: Boolean, 
    required: true,
    default: false 
  },
  researchConsent: { 
    type: Boolean, 
    required: true,
    default: false 
  },
  marketingConsent: { 
    type: Boolean, 
    required: true,
    default: false 
  },
  
  // Consent details
  consentTimestamp: { type: Date, required: true },
  consentVersion: { type: String, required: true },
  consentText: { type: String, required: true }, // Full consent text
  consentMethod: { 
    type: String, 
    enum: ['digital_signature', 'checkbox', 'verbal', 'written'],
    required: true 
  },
  
  // Withdrawal
  withdrawnAt: { type: Date },
  withdrawalReason: { type: String },
  
  // Legal basis
  legalBasis: { 
    type: String, 
    enum: ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests'],
    required: true 
  },
  
  // Compliance
  gdprCompliant: { type: Boolean, default: true },
  hipaaCompliant: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for efficient querying
EncryptedConversationSchema.index({ userId: 1, createdAt: -1 });
EncryptedConversationSchema.index({ didHash: 1, createdAt: -1 });
EncryptedConversationSchema.index({ sessionId: 1 });
EncryptedConversationSchema.index({ riskLevel: 1 });
EncryptedConversationSchema.index({ consentGiven: 1 });

EncryptedUserProfileSchema.index({ userId: 1 });
EncryptedUserProfileSchema.index({ didHash: 1 });

EncryptedTherapySessionSchema.index({ userId: 1, createdAt: -1 });
EncryptedTherapySessionSchema.index({ didHash: 1, createdAt: -1 });
EncryptedTherapySessionSchema.index({ sessionId: 1 });
EncryptedTherapySessionSchema.index({ therapistDid: 1 });

ConsentManagementSchema.index({ userId: 1 });
ConsentManagementSchema.index({ didHash: 1 });
ConsentManagementSchema.index({ consentTimestamp: -1 });

// Static methods for EncryptedConversation
EncryptedConversationSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

EncryptedConversationSchema.statics.findByDID = function(didHash) {
  return this.find({ didHash }).sort({ createdAt: -1 });
};

EncryptedConversationSchema.statics.findBySession = function(sessionId) {
  return this.findOne({ sessionId });
};

// Static methods for EncryptedUserProfile
EncryptedUserProfileSchema.statics.findByUser = function(userId) {
  return this.findOne({ userId });
};

EncryptedUserProfileSchema.statics.findByDID = function(didHash) {
  return this.findOne({ didHash });
};

// Static methods for EncryptedTherapySession
EncryptedTherapySessionSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

EncryptedTherapySessionSchema.statics.findByDID = function(didHash) {
  return this.find({ didHash }).sort({ createdAt: -1 });
};

EncryptedTherapySessionSchema.statics.findBySession = function(sessionId) {
  return this.findOne({ sessionId });
};

// Static methods for ConsentManagement
ConsentManagementSchema.statics.findByUser = function(userId) {
  return this.findOne({ userId });
};

ConsentManagementSchema.statics.findByDID = function(didHash) {
  return this.findOne({ didHash });
};

// Create models
const EncryptedConversation = mongoose.model('EncryptedConversation', EncryptedConversationSchema);
const EncryptedUserProfile = mongoose.model('EncryptedUserProfile', EncryptedUserProfileSchema);
const EncryptedTherapySession = mongoose.model('EncryptedTherapySession', EncryptedTherapySessionSchema);
const ConsentManagement = mongoose.model('ConsentManagement', ConsentManagementSchema);

module.exports = {
  EncryptedConversation,
  EncryptedUserProfile,
  EncryptedTherapySession,
  ConsentManagement
};
