import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { DIDRegistry__factory } from '../../typechain-types';

const router = Router();

// Contract instances (will be initialized in server.ts)
let didRegistry: any = null;
let provider: ethers.Provider = null;
let wallet: ethers.Wallet = null;

// Initialize contract instances
export const initializeContracts = (contractAddress: string, privateKey: string, rpcUrl: string) => {
  try {
    provider = new ethers.JsonRpcProvider(rpcUrl);
    wallet = new ethers.Wallet(privateKey, provider);
    didRegistry = DIDRegistry__factory.connect(contractAddress, wallet);
    console.log('✅ DID contracts initialized');
  } catch (error) {
    console.error('❌ Failed to initialize contracts:', error);
  }
};

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

/**
 * @route POST /api/did/mint
 * @desc Create a new DID
 * @access Private
 */
router.post('/mint', authenticateToken, [
  body('did').isString().isLength({ min: 1 }).withMessage('DID string is required'),
  body('document').isString().isLength({ min: 1 }).withMessage('DID document is required')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!didRegistry) {
      return res.status(500).json({
        success: false,
        message: 'DID Registry contract not initialized'
      });
    }

    const { did, document } = req.body;
    const userAddress = req.user.address;

    // Validate DID format
    if (!did.startsWith('did:safepsy:')) {
      return res.status(400).json({
        success: false,
        message: 'DID must start with "did:safepsy:"'
      });
    }

    // Validate JSON document
    try {
      JSON.parse(document);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'DID document must be valid JSON'
      });
    }

    // Check if DID already exists
    try {
      const didHash = await didRegistry.getDIDHash(did);
      if (didHash !== ethers.ZeroHash) {
        return res.status(409).json({
          success: false,
          message: 'DID already exists'
        });
      }
    } catch (error) {
      // DID doesn't exist, continue
    }

    // Create DID transaction
    const tx = await didRegistry.createDID(did, document);
    const receipt = await tx.wait();

    // Find the DIDCreated event
    const didCreatedEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = didRegistry.interface.parseLog(log);
        return parsed.name === 'DIDCreated';
      } catch {
        return false;
      }
    });

    if (!didCreatedEvent) {
      throw new Error('DIDCreated event not found');
    }

    const parsedEvent = didRegistry.interface.parseLog(didCreatedEvent);
    const didHash = parsedEvent.args.didHash;

    res.json({
      success: true,
      data: {
        didHash,
        did,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('DID minting error:', error);
    
    // Handle specific contract errors
    if (error.message.includes('DID already exists')) {
      return res.status(409).json({
        success: false,
        message: 'DID already exists'
      });
    }
    
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create this DID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create DID',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/did/resolve/:didHash
 * @desc Resolve a DID by its hash
 * @access Public
 */
router.get('/resolve/:didHash', async (req: Request, res: Response) => {
  try {
    const { didHash } = req.params;

    if (!didRegistry) {
      return res.status(500).json({
        success: false,
        message: 'DID Registry contract not initialized'
      });
    }

    // Validate didHash format
    if (!ethers.isHexString(didHash, 32)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid DID hash format'
      });
    }

    // Check if DID is active
    const isActive = await didRegistry.isDIDActive(didHash);
    if (!isActive) {
      return res.status(404).json({
        success: false,
        message: 'DID not found or inactive'
      });
    }

    // Get DID document
    const didDocument = await didRegistry.getDID(didHash);

    res.json({
      success: true,
      data: {
        didHash,
        did: didDocument.did,
        document: didDocument.document,
        owner: didDocument.owner,
        createdAt: didDocument.createdAt.toString(),
        updatedAt: didDocument.updatedAt.toString(),
        isActive: didDocument.isActive,
        controllers: didDocument.controllers
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('DID resolution error:', error);
    
    if (error.message.includes('DID does not exist')) {
      return res.status(404).json({
        success: false,
        message: 'DID not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to resolve DID',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/did/resolve-by-string/:did
 * @desc Resolve a DID by its string
 * @access Public
 */
router.get('/resolve-by-string/:did', async (req: Request, res: Response) => {
  try {
    const { did } = req.params;

    if (!didRegistry) {
      return res.status(500).json({
        success: false,
        message: 'DID Registry contract not initialized'
      });
    }

    // Get DID hash from string
    const didHash = await didRegistry.getDIDHash(did);
    if (didHash === ethers.ZeroHash) {
      return res.status(404).json({
        success: false,
        message: 'DID not found'
      });
    }

    // Redirect to hash-based resolution
    return res.redirect(`/api/did/resolve/${didHash}`);

  } catch (error: any) {
    console.error('DID string resolution error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to resolve DID',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route PUT /api/did/update/:didHash
 * @desc Update a DID document
 * @access Private
 */
router.put('/update/:didHash', authenticateToken, [
  body('document').isString().isLength({ min: 1 }).withMessage('DID document is required')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { didHash } = req.params;
    const { document } = req.body;

    if (!didRegistry) {
      return res.status(500).json({
        success: false,
        message: 'DID Registry contract not initialized'
      });
    }

    // Validate didHash format
    if (!ethers.isHexString(didHash, 32)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid DID hash format'
      });
    }

    // Validate JSON document
    try {
      JSON.parse(document);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'DID document must be valid JSON'
      });
    }

    // Update DID transaction
    const tx = await didRegistry.updateDID(didHash, document);
    const receipt = await tx.wait();

    res.json({
      success: true,
      data: {
        didHash,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('DID update error:', error);
    
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this DID'
      });
    }
    
    if (error.message.includes('DID does not exist')) {
      return res.status(404).json({
        success: false,
        message: 'DID not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update DID',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route DELETE /api/did/revoke/:didHash
 * @desc Revoke a DID
 * @access Private
 */
router.delete('/revoke/:didHash', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { didHash } = req.params;

    if (!didRegistry) {
      return res.status(500).json({
        success: false,
        message: 'DID Registry contract not initialized'
      });
    }

    // Validate didHash format
    if (!ethers.isHexString(didHash, 32)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid DID hash format'
      });
    }

    // Revoke DID transaction
    const tx = await didRegistry.revokeDID(didHash);
    const receipt = await tx.wait();

    res.json({
      success: true,
      data: {
        didHash,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('DID revocation error:', error);
    
    if (error.message.includes('Not DID owner')) {
      return res.status(403).json({
        success: false,
        message: 'Only the DID owner can revoke it'
      });
    }
    
    if (error.message.includes('DID does not exist')) {
      return res.status(404).json({
        success: false,
        message: 'DID not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to revoke DID',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/did/owner/:address
 * @desc Get all DIDs owned by an address
 * @access Public
 */
router.get('/owner/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!didRegistry) {
      return res.status(500).json({
        success: false,
        message: 'DID Registry contract not initialized'
      });
    }

    // Validate address format
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Ethereum address format'
      });
    }

    // Get DIDs by owner
    const didHashes = await didRegistry.getDIDByAddress(address);
    
    // Get details for each DID
    const dids = await Promise.all(
      didHashes.map(async (didHash: string) => {
        try {
          const didDoc = await didRegistry.getDID(didHash);
          return {
            didHash,
            did: didDoc.did,
            owner: didDoc.owner,
            createdAt: didDoc.createdAt.toString(),
            updatedAt: didDoc.updatedAt.toString(),
            isActive: didDoc.isActive,
            controllers: didDoc.controllers
          };
        } catch (error) {
          return null;
        }
      })
    );

    // Filter out null results
    const validDids = dids.filter(did => did !== null);

    res.json({
      success: true,
      data: {
        owner: address,
        dids: validDids,
        count: validDids.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Get DIDs by owner error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get DIDs by owner',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/did/stats
 * @desc Get DID registry statistics
 * @access Public
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    if (!didRegistry) {
      return res.status(500).json({
        success: false,
        message: 'DID Registry contract not initialized'
      });
    }

    const totalCount = await didRegistry.getTotalDIDCount();

    res.json({
      success: true,
      data: {
        totalDIDs: totalCount.toString(),
        contractAddress: await didRegistry.getAddress(),
        network: process.env.NETWORK || 'unknown'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('DID stats error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get DID statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
