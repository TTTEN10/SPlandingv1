const express = require('express');
const { body, validationResult } = require('express-validator');
const { EncryptedConversation, EncryptedUserProfile, EncryptedTherapySession, ConsentManagement } = require('../models/EncryptedModels');
const { encryptionService } = require('../utils/encryption');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  // In a real implementation, you would verify the JWT token here
  // For now, we'll assume the token is valid and extract user info
  try {
    // Decode token to get user information
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

/**
 * @route POST /api/chat/encrypted
 * @desc Store encrypted conversation data
 * @access Private
 */
router.post('/encrypted', authenticateToken, [
  body('conversationData').isObject().withMessage('Conversation data is required'),
  body('userKey').isString().withMessage('User encryption key is required'),
  body('sessionId').isString().withMessage('Session ID is required'),
  body('sessionType').optional().isIn(['therapy', 'consultation', 'assessment', 'follow-up']).withMessage('Invalid session type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { conversationData, userKey, sessionId, sessionType = 'therapy' } = req.body;
    const userId = req.user.userId;
    const didHash = req.user.didHash;

    // Validate user key format
    if (!/^[a-fA-F0-9]{64}$/.test(userKey)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user key format'
      });
    }

    // Check consent
    const consent = await ConsentManagement.findByUser(userId);
    if (!consent || !consent.dataProcessingConsent) {
      return res.status(403).json({
        success: false,
        message: 'Data processing consent required'
      });
    }

    // Encrypt conversation data
    const encryptedResult = encryptionService.encryptConversation(conversationData, userKey);
    
    // Create encrypted conversation record
    const encryptedConversation = new EncryptedConversation({
      userId,
      didHash,
      encryptedMessages: encryptedResult.encryptedData,
      iv: encryptedResult.iv,
      tag: encryptedResult.tag,
      dataHash: encryptionService.generateDataHash(
        encryptedResult.encryptedData,
        encryptedResult.iv,
        encryptedResult.tag
      ),
      sessionId,
      sessionType,
      messageCount: conversationData.messages ? conversationData.messages.length : 0,
      startedAt: new Date(),
      consentGiven: true,
      consentTimestamp: new Date(),
      authorizedAccessors: [didHash] // User has access to their own data
    });

    await encryptedConversation.save();

    res.json({
      success: true,
      data: {
        conversationId: encryptedConversation._id,
        sessionId,
        messageCount: encryptedConversation.messageCount,
        encryptedAt: encryptedConversation.createdAt,
        dataHash: encryptedConversation.dataHash
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Encrypted conversation storage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store encrypted conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/chat/encrypted/:conversationId
 * @desc Retrieve and decrypt conversation data
 * @access Private
 */
router.get('/encrypted/:conversationId', authenticateToken, [
  body('userKey').isString().withMessage('User encryption key is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { conversationId } = req.params;
    const { userKey } = req.body;
    const userId = req.user.userId;

    // Validate user key format
    if (!/^[a-fA-F0-9]{64}$/.test(userKey)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user key format'
      });
    }

    // Find encrypted conversation
    const encryptedConversation = await EncryptedConversation.findById(conversationId);
    if (!encryptedConversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check access permissions
    if (encryptedConversation.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    // Verify data integrity
    const expectedHash = encryptionService.generateDataHash(
      encryptedConversation.encryptedMessages,
      encryptedConversation.iv,
      encryptedConversation.tag
    );

    if (expectedHash !== encryptedConversation.dataHash) {
      return res.status(400).json({
        success: false,
        message: 'Data integrity verification failed'
      });
    }

    // Decrypt conversation data
    const decryptedData = encryptionService.decryptConversation(
      encryptedConversation.encryptedMessages,
      userKey,
      encryptedConversation.iv,
      encryptedConversation.tag
    );

    // Log access
    encryptedConversation.accessLog.push({
      accessor: req.user.didHash,
      accessType: 'read',
      timestamp: new Date(),
      reason: 'User requested conversation data'
    });
    await encryptedConversation.save();

    res.json({
      success: true,
      data: {
        conversationId: encryptedConversation._id,
        sessionId: encryptedConversation.sessionId,
        sessionType: encryptedConversation.sessionType,
        conversationData: decryptedData,
        messageCount: encryptedConversation.messageCount,
        startedAt: encryptedConversation.startedAt,
        lastMessageAt: encryptedConversation.lastMessageAt,
        riskLevel: encryptedConversation.riskLevel
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Encrypted conversation retrieval error:', error);
    
    if (error.message.includes('Failed to decrypt')) {
      return res.status(400).json({
        success: false,
        message: 'Failed to decrypt conversation data'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve encrypted conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/chat/encrypted/user/:userId
 * @desc Get all encrypted conversations for a user
 * @access Private
 */
router.get('/encrypted/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.userId;

    // Check if user is requesting their own data
    if (userId !== requestingUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to other users\' conversations'
      });
    }

    // Find all encrypted conversations for the user
    const conversations = await EncryptedConversation.findByUser(userId);

    // Return metadata only (not decrypted data)
    const conversationMetadata = conversations.map(conv => ({
      conversationId: conv._id,
      sessionId: conv.sessionId,
      sessionType: conv.sessionType,
      messageCount: conv.messageCount,
      startedAt: conv.startedAt,
      lastMessageAt: conv.lastMessageAt,
      riskLevel: conv.riskLevel,
      createdAt: conv.createdAt
    }));

    res.json({
      success: true,
      data: {
        userId,
        conversations: conversationMetadata,
        totalConversations: conversations.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('User conversations retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route DELETE /api/chat/encrypted/:conversationId
 * @desc Delete encrypted conversation
 * @access Private
 */
router.delete('/encrypted/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    // Find encrypted conversation
    const encryptedConversation = await EncryptedConversation.findById(conversationId);
    if (!encryptedConversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check access permissions
    if (encryptedConversation.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    // Log deletion access
    encryptedConversation.accessLog.push({
      accessor: req.user.didHash,
      accessType: 'delete',
      timestamp: new Date(),
      reason: 'User requested conversation deletion'
    });

    // Delete the conversation
    await EncryptedConversation.findByIdAndDelete(conversationId);

    res.json({
      success: true,
      data: {
        conversationId,
        deletedAt: new Date()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Encrypted conversation deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete encrypted conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route POST /api/chat/consent
 * @desc Manage user consent for data processing
 * @access Private
 */
router.post('/consent', authenticateToken, [
  body('dataProcessingConsent').isBoolean().withMessage('Data processing consent is required'),
  body('dataSharingConsent').isBoolean().withMessage('Data sharing consent is required'),
  body('therapyConsent').isBoolean().withMessage('Therapy consent is required'),
  body('researchConsent').isBoolean().withMessage('Research consent is required'),
  body('consentVersion').isString().withMessage('Consent version is required'),
  body('consentText').isString().withMessage('Consent text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      dataProcessingConsent,
      dataSharingConsent,
      therapyConsent,
      researchConsent,
      consentVersion,
      consentText
    } = req.body;

    const userId = req.user.userId;
    const didHash = req.user.didHash;

    // Check if consent already exists
    let consent = await ConsentManagement.findByUser(userId);
    
    if (consent) {
      // Update existing consent
      consent.dataProcessingConsent = dataProcessingConsent;
      consent.dataSharingConsent = dataSharingConsent;
      consent.therapyConsent = therapyConsent;
      consent.researchConsent = researchConsent;
      consent.consentVersion = consentVersion;
      consent.consentText = consentText;
      consent.consentTimestamp = new Date();
    } else {
      // Create new consent
      consent = new ConsentManagement({
        userId,
        didHash,
        dataProcessingConsent,
        dataSharingConsent,
        therapyConsent,
        researchConsent,
        consentVersion,
        consentText,
        consentTimestamp: new Date(),
        consentMethod: 'digital_signature',
        legalBasis: 'consent'
      });
    }

    await consent.save();

    res.json({
      success: true,
      data: {
        userId,
        didHash,
        consentGiven: dataProcessingConsent,
        consentTimestamp: consent.consentTimestamp,
        consentVersion: consent.consentVersion
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Consent management error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to manage consent',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/chat/consent/:userId
 * @desc Get user consent status
 * @access Private
 */
router.get('/consent/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.userId;

    // Check if user is requesting their own consent data
    if (userId !== requestingUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to other users\' consent data'
      });
    }

    const consent = await ConsentManagement.findByUser(userId);
    
    if (!consent) {
      return res.status(404).json({
        success: false,
        message: 'No consent data found'
      });
    }

    res.json({
      success: true,
      data: {
        userId: consent.userId,
        didHash: consent.didHash,
        dataProcessingConsent: consent.dataProcessingConsent,
        dataSharingConsent: consent.dataSharingConsent,
        therapyConsent: consent.therapyConsent,
        researchConsent: consent.researchConsent,
        consentTimestamp: consent.consentTimestamp,
        consentVersion: consent.consentVersion,
        withdrawnAt: consent.withdrawnAt
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Consent retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve consent data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
