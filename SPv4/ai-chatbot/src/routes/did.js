const express = require('express');
const router = express.Router();
const { DIDEvent, DIDPointer } = require('../models/DIDModels');
const EventIndexingService = require('../services/EventIndexingService');

// Initialize event indexing service
const eventIndexingService = new EventIndexingService();

// Health check for event indexing
router.get('/health', async (req, res) => {
  try {
    const isRunning = eventIndexingService.isRunning();
    const indexer = eventIndexingService.getIndexer();
    
    res.json({
      status: 'healthy',
      eventIndexing: {
        isRunning,
        isInitialized: eventIndexingService.isInitialized,
        lastProcessedBlock: indexer ? indexer.lastProcessedBlock : 0,
        contractAddresses: indexer ? indexer.contractAddresses : {}
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Start event indexing
router.post('/start', async (req, res) => {
  try {
    await eventIndexingService.start();
    res.json({
      success: true,
      message: 'Event indexing started successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Stop event indexing
router.post('/stop', async (req, res) => {
  try {
    await eventIndexingService.stop();
    res.json({
      success: true,
      message: 'Event indexing stopped successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get DID events
router.get('/events', async (req, res) => {
  try {
    const { 
      didHash, 
      type, 
      owner, 
      limit = 50, 
      offset = 0,
      fromBlock,
      toBlock 
    } = req.query;

    const query = {};
    
    if (didHash) query.didHash = didHash;
    if (type) query.type = type;
    if (owner) query.owner = owner;
    if (fromBlock) query.blockNumber = { $gte: parseInt(fromBlock) };
    if (toBlock) {
      query.blockNumber = query.blockNumber || {};
      query.blockNumber.$lte = parseInt(toBlock);
    }

    const events = await DIDEvent.find(query)
      .sort({ blockNumber: -1, logIndex: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await DIDEvent.countDocuments(query);

    res.json({
      success: true,
      data: events,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get DID pointers (mirrored state)
router.get('/pointers', async (req, res) => {
  try {
    const { 
      didHash, 
      owner, 
      did,
      isActive = true,
      limit = 50, 
      offset = 0 
    } = req.query;

    const query = {};
    
    if (didHash) query.didHash = didHash;
    if (owner) query.owner = owner;
    if (did) query.did = did;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const pointers = await DIDPointer.find(query)
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await DIDPointer.countDocuments(query);

    res.json({
      success: true,
      data: pointers,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get specific DID pointer
router.get('/pointers/:didHash', async (req, res) => {
  try {
    const { didHash } = req.params;
    
    const pointer = await DIDPointer.findByDIDHash(didHash);
    
    if (!pointer) {
      return res.status(404).json({
        success: false,
        message: 'DID pointer not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: pointer,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get DIDs by owner
router.get('/owner/:owner', async (req, res) => {
  try {
    const { owner } = req.params;
    const { isActive = true } = req.query;
    
    const query = { owner };
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const pointers = await DIDPointer.find(query).sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: pointers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get events for a specific DID
router.get('/did/:didHash/events', async (req, res) => {
  try {
    const { didHash } = req.params;
    const { type, limit = 50, offset = 0 } = req.query;
    
    const query = { didHash };
    if (type) query.type = type;
    
    const events = await DIDEvent.find(query)
      .sort({ blockNumber: -1, logIndex: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await DIDEvent.countDocuments(query);

    res.json({
      success: true,
      data: events,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const totalEvents = await DIDEvent.countDocuments();
    const totalPointers = await DIDPointer.countDocuments();
    const activePointers = await DIDPointer.countDocuments({ isActive: true });
    
    const eventTypes = await DIDEvent.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentActivity = await DIDEvent.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .select('type didHash timestamp');

    res.json({
      success: true,
      data: {
        totalEvents,
        totalPointers,
        activePointers,
        inactivePointers: totalPointers - activePointers,
        eventTypes,
        recentActivity
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
