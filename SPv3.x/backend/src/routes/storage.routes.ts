import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { DIDStorage__factory } from '../../typechain-types';
import { encryptionService, encryptClientData, decryptClientData } from '../utils/encryption';

const router = Router();

// Contract instances (will be initialized in server.ts)
let didStorage: any = null;
let provider: ethers.Provider = null;
let wallet: ethers.Wallet = null;

// Initialize contract instances
export const initializeStorageContracts = (contractAddress: string, privateKey: string, rpcUrl: string) => {
  try {
    provider = new ethers.JsonRpcProvider(rpcUrl);
    wallet = new ethers.Wallet(privateKey, provider);
    didStorage = DIDStorage__factory.connect(contractAddress, wallet);
    console.log('✅ DID Storage contracts initialized');
  } catch (error) {
    console.error('❌ Failed to initialize storage contracts:', error);
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
 * @route POST /api/storage/write
 * @desc Write data pointer for a DID
 * @access Private
 */
router.post('/write', authenticateToken, [
  body('didHash').isString().withMessage('DID hash is required'),
  body('dataType').isString().isLength({ min: 1 }).withMessage('Data type is required'),
  body('data').isObject().withMessage('Data object is required'),
  body('userKey').isString().withMessage('User encryption key is required'),
  body('isEncrypted').optional().isBoolean().withMessage('isEncrypted must be a boolean')
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

    if (!didStorage) {
      return res.status(500).json({
        success: false,
        message: 'DID Storage contract not initialized'
      });
    }

    const { didHash, dataType, data, userKey, isEncrypted = true } = req.body;

    // Validate didHash format
    if (!ethers.isHexString(didHash, 32)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid DID hash format'
      });
    }

    // Validate userKey format
    if (!ethers.isHexString(userKey, 64)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user key format'
      });
    }

    // Encrypt the data if requested
    let encryptedData, dataHash;
    if (isEncrypted) {
      const encryptionResult = encryptClientData(data, userKey);
      encryptedData = encryptionResult.encryptedData;
      dataHash = encryptionResult.dataHash;
    } else {
      // For non-encrypted data, create a hash of the JSON string
      const jsonData = JSON.stringify(data);
      dataHash = ethers.keccak256(ethers.toUtf8Bytes(jsonData));
      encryptedData = {
        encryptedData: jsonData,
        iv: '',
        tag: '',
        keyHash: ''
      };
    }

    // Store data transaction
    const tx = await didStorage.storeData(didHash, dataType, dataHash, isEncrypted);
    const receipt = await tx.wait();

    // Find the DataStored event
    const dataStoredEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = didStorage.interface.parseLog(log);
        return parsed.name === 'DataStored';
      } catch {
        return false;
      }
    });

    res.json({
      success: true,
      data: {
        didHash,
        dataType,
        dataHash,
        isEncrypted,
        encryptedData: isEncrypted ? {
          iv: encryptedData.iv,
          tag: encryptedData.tag,
          keyHash: encryptedData.keyHash
        } : null,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Storage write error:', error);
    
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to write data for this DID'
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
      message: 'Failed to write data pointer',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route POST /api/storage/read-encrypted
 * @desc Read and decrypt data for a DID
 * @access Private
 */
router.post('/read-encrypted', authenticateToken, [
  body('didHash').isString().withMessage('DID hash is required'),
  body('dataType').isString().isLength({ min: 1 }).withMessage('Data type is required'),
  body('userKey').isString().withMessage('User encryption key is required'),
  body('iv').optional().isString().withMessage('IV must be a string'),
  body('tag').optional().isString().withMessage('Tag must be a string')
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

    if (!didStorage) {
      return res.status(500).json({
        success: false,
        message: 'DID Storage contract not initialized'
      });
    }

    const { didHash, dataType, userKey, iv, tag } = req.body;

    // Validate didHash format
    if (!ethers.isHexString(didHash, 32)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid DID hash format'
      });
    }

    // Validate userKey format
    if (!ethers.isHexString(userKey, 64)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user key format'
      });
    }

    // Check if data exists
    const dataExists = await didStorage.dataExists(didHash, dataType);
    if (!dataExists) {
      return res.status(404).json({
        success: false,
        message: 'Data not found'
      });
    }

    // Get data from blockchain
    const storedData = await didStorage.getData(didHash, dataType);

    // If data is encrypted, decrypt it
    let decryptedData = null;
    if (storedData.isEncrypted && iv && tag) {
      try {
        decryptedData = decryptClientData(
          storedData.encryptedData || '', // This would need to be stored separately
          userKey,
          iv,
          tag,
          storedData.dataHash
        );
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Failed to decrypt data',
          error: error instanceof Error ? error.message : 'Decryption failed'
        });
      }
    }

    res.json({
      success: true,
      data: {
        didHash,
        dataType: storedData.dataType,
        dataHash: storedData.dataHash,
        timestamp: storedData.timestamp.toString(),
        isEncrypted: storedData.isEncrypted,
        decryptedData,
        authorizedAccessors: storedData.authorizedAccessors
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Storage read encrypted error:', error);
    
    if (error.message.includes('Access denied')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this data'
      });
    }
    
    if (error.message.includes('Data does not exist')) {
      return res.status(404).json({
        success: false,
        message: 'Data not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to read encrypted data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/storage/read/:didHash/:dataType
 * @desc Read data pointer for a DID
 * @access Public (with access control)
 */
router.get('/read/:didHash/:dataType', async (req: Request, res: Response) => {
  try {
    const { didHash, dataType } = req.params;

    if (!didStorage) {
      return res.status(500).json({
        success: false,
        message: 'DID Storage contract not initialized'
      });
    }

    // Validate didHash format
    if (!ethers.isHexString(didHash, 32)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid DID hash format'
      });
    }

    // Check if data exists
    const dataExists = await didStorage.dataExists(didHash, dataType);
    if (!dataExists) {
      return res.status(404).json({
        success: false,
        message: 'Data not found'
      });
    }

    // Get data
    const storedData = await didStorage.getData(didHash, dataType);

    res.json({
      success: true,
      data: {
        didHash,
        dataType: storedData.dataType,
        dataHash: storedData.dataHash,
        timestamp: storedData.timestamp.toString(),
        isEncrypted: storedData.isEncrypted,
        authorizedAccessors: storedData.authorizedAccessors
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Storage read error:', error);
    
    if (error.message.includes('Access denied')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this data'
      });
    }
    
    if (error.message.includes('Data does not exist')) {
      return res.status(404).json({
        success: false,
        message: 'Data not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to read data pointer',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route PUT /api/storage/update
 * @desc Update data pointer for a DID
 * @access Private
 */
router.put('/update', authenticateToken, [
  body('didHash').isString().withMessage('DID hash is required'),
  body('dataType').isString().isLength({ min: 1 }).withMessage('Data type is required'),
  body('newDataHash').isString().withMessage('New data hash is required')
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

    if (!didStorage) {
      return res.status(500).json({
        success: false,
        message: 'DID Storage contract not initialized'
      });
    }

    const { didHash, dataType, newDataHash } = req.body;

    // Validate didHash format
    if (!ethers.isHexString(didHash, 32)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid DID hash format'
      });
    }

    // Validate newDataHash format
    if (!ethers.isHexString(newDataHash, 32)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid new data hash format'
      });
    }

    // Update data transaction
    const tx = await didStorage.updateData(didHash, dataType, newDataHash);
    const receipt = await tx.wait();

    res.json({
      success: true,
      data: {
        didHash,
        dataType,
        newDataHash,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Storage update error:', error);
    
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update data for this DID'
      });
    }
    
    if (error.message.includes('Data does not exist')) {
      return res.status(404).json({
        success: false,
        message: 'Data not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update data pointer',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route DELETE /api/storage/delete
 * @desc Delete data pointer for a DID
 * @access Private
 */
router.delete('/delete', authenticateToken, [
  body('didHash').isString().withMessage('DID hash is required'),
  body('dataType').isString().isLength({ min: 1 }).withMessage('Data type is required')
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

    if (!didStorage) {
      return res.status(500).json({
        success: false,
        message: 'DID Storage contract not initialized'
      });
    }

    const { didHash, dataType } = req.body;

    // Validate didHash format
    if (!ethers.isHexString(didHash, 32)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid DID hash format'
      });
    }

    // Delete data transaction
    const tx = await didStorage.deleteData(didHash, dataType);
    const receipt = await tx.wait();

    res.json({
      success: true,
      data: {
        didHash,
        dataType,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Storage delete error:', error);
    
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete data for this DID'
      });
    }
    
    if (error.message.includes('Data does not exist')) {
      return res.status(404).json({
        success: false,
        message: 'Data not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete data pointer',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/storage/types/:didHash
 * @desc Get all data types for a DID
 * @access Public
 */
router.get('/types/:didHash', async (req: Request, res: Response) => {
  try {
    const { didHash } = req.params;

    if (!didStorage) {
      return res.status(500).json({
        success: false,
        message: 'DID Storage contract not initialized'
      });
    }

    // Validate didHash format
    if (!ethers.isHexString(didHash, 32)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid DID hash format'
      });
    }

    // Get all data types
    const dataTypes = await didStorage.getAllDataTypes(didHash);

    res.json({
      success: true,
      data: {
        didHash,
        dataTypes,
        count: dataTypes.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Get data types error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get data types',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route POST /api/storage/grant-access
 * @desc Grant access to stored data
 * @access Private
 */
router.post('/grant-access', authenticateToken, [
  body('didHash').isString().withMessage('DID hash is required'),
  body('accessor').isEthereumAddress().withMessage('Valid Ethereum address required'),
  body('dataType').isString().isLength({ min: 1 }).withMessage('Data type is required')
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

    if (!didStorage) {
      return res.status(500).json({
        success: false,
        message: 'DID Storage contract not initialized'
      });
    }

    const { didHash, accessor, dataType } = req.body;

    // Validate didHash format
    if (!ethers.isHexString(didHash, 32)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid DID hash format'
      });
    }

    // Grant access transaction
    const tx = await didStorage.grantAccess(didHash, accessor, dataType);
    const receipt = await tx.wait();

    res.json({
      success: true,
      data: {
        didHash,
        accessor,
        dataType,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Grant access error:', error);
    
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to grant access for this DID'
      });
    }
    
    if (error.message.includes('Data does not exist')) {
      return res.status(404).json({
        success: false,
        message: 'Data not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to grant access',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route POST /api/storage/revoke-access
 * @desc Revoke access to stored data
 * @access Private
 */
router.post('/revoke-access', authenticateToken, [
  body('didHash').isString().withMessage('DID hash is required'),
  body('accessor').isEthereumAddress().withMessage('Valid Ethereum address required'),
  body('dataType').isString().isLength({ min: 1 }).withMessage('Data type is required')
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

    if (!didStorage) {
      return res.status(500).json({
        success: false,
        message: 'DID Storage contract not initialized'
      });
    }

    const { didHash, accessor, dataType } = req.body;

    // Validate didHash format
    if (!ethers.isHexString(didHash, 32)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid DID hash format'
      });
    }

    // Revoke access transaction
    const tx = await didStorage.revokeAccess(didHash, accessor, dataType);
    const receipt = await tx.wait();

    res.json({
      success: true,
      data: {
        didHash,
        accessor,
        dataType,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Revoke access error:', error);
    
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to revoke access for this DID'
      });
    }
    
    if (error.message.includes('Access not granted')) {
      return res.status(404).json({
        success: false,
        message: 'Access was not granted'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to revoke access',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/storage/check-access/:didHash/:accessor/:dataType
 * @desc Check if an address has access to stored data
 * @access Public
 */
router.get('/check-access/:didHash/:accessor/:dataType', async (req: Request, res: Response) => {
  try {
    const { didHash, accessor, dataType } = req.params;

    if (!didStorage) {
      return res.status(500).json({
        success: false,
        message: 'DID Storage contract not initialized'
      });
    }

    // Validate didHash format
    if (!ethers.isHexString(didHash, 32)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid DID hash format'
      });
    }

    // Validate accessor format
    if (!ethers.isAddress(accessor)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid accessor address format'
      });
    }

    // Check access
    const hasAccess = await didStorage.hasAccess(didHash, accessor, dataType);

    res.json({
      success: true,
      data: {
        didHash,
        accessor,
        dataType,
        hasAccess
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Check access error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to check access',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
