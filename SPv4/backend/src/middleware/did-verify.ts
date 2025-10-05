import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import crypto from 'crypto';

// Extend Request interface to include DID verification info
declare global {
  namespace Express {
    interface Request {
      didVerification?: {
        did: string;
        didHash: string;
        owner: string;
        isValid: boolean;
        verificationMethod?: string;
        publicKey?: string;
      };
    }
  }
}

/**
 * Validate DID format according to SafePsy DID specification
 */
export const validateDIDFormat = (did: string): boolean => {
  // SafePsy DID format: did:safepsy:<hash>
  const didPattern = /^did:safepsy:[a-fA-F0-9]{64}$/;
  return didPattern.test(did);
};

/**
 * Extract hash from SafePsy DID
 */
export const extractDIDHash = (did: string): string | null => {
  if (!validateDIDFormat(did)) {
    return null;
  }
  return did.split(':')[2];
};

/**
 * Generate DID hash from address and timestamp
 */
export const generateDIDHash = (address: string, timestamp?: number): string => {
  const data = `${address.toLowerCase()}:${timestamp || Date.now()}`;
  return ethers.keccak256(ethers.toUtf8Bytes(data));
};

/**
 * Verify DID ownership by checking if the DID hash corresponds to the owner's address
 */
export const verifyDIDOwnership = async (
  did: string, 
  ownerAddress: string, 
  contractInstance?: any
): Promise<boolean> => {
  try {
    const didHash = extractDIDHash(did);
    if (!didHash) {
      return false;
    }

    // If contract instance is provided, verify on-chain
    if (contractInstance) {
      try {
        const onChainOwner = await contractInstance.getDIDOwner(didHash);
        return onChainOwner.toLowerCase() === ownerAddress.toLowerCase();
      } catch (error) {
        console.warn('On-chain DID verification failed:', error);
        // Fallback to off-chain verification
      }
    }

    // Off-chain verification: check if DID hash can be generated from owner address
    // This is a simplified check - in production, you might want more sophisticated verification
    const generatedHash = generateDIDHash(ownerAddress);
    return didHash.toLowerCase() === generatedHash.toLowerCase();
  } catch (error) {
    console.error('DID ownership verification error:', error);
    return false;
  }
};

/**
 * Middleware to verify DID format and extract information
 */
export const verifyDIDFormat = (req: Request, res: Response, next: NextFunction) => {
  const { did } = req.params;
  
  if (!did) {
    return res.status(400).json({
      success: false,
      message: 'DID parameter is required'
    });
  }

  if (!validateDIDFormat(did)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid DID format. Expected format: did:safepsy:<64-character-hash>'
    });
  }

  const didHash = extractDIDHash(did);
  if (!didHash) {
    return res.status(400).json({
      success: false,
      message: 'Failed to extract DID hash'
    });
  }

  // Attach DID verification info to request
  req.didVerification = {
    did,
    didHash,
    owner: '', // Will be populated by subsequent middleware
    isValid: true
  };

  next();
};

/**
 * Middleware to verify DID ownership
 */
export const verifyDIDOwnership = (req: Request, res: Response, next: NextFunction) => {
  if (!req.didVerification) {
    return res.status(400).json({
      success: false,
      message: 'DID verification required. Use verifyDIDFormat middleware first.'
    });
  }

  const { did, didHash } = req.didVerification;
  const ownerAddress = req.params.owner || req.body.owner || req.walletUser?.address;

  if (!ownerAddress) {
    return res.status(400).json({
      success: false,
      message: 'Owner address is required for DID verification'
    });
  }

  // Verify ownership (this would typically involve contract calls)
  verifyDIDOwnership(did, ownerAddress)
    .then((isValid) => {
      if (!isValid) {
        return res.status(403).json({
          success: false,
          message: 'DID ownership verification failed'
        });
      }

      // Update DID verification info
      req.didVerification!.owner = ownerAddress.toLowerCase();
      req.didVerification!.isValid = true;

      next();
    })
    .catch((error) => {
      console.error('DID ownership verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal error during DID verification'
      });
    });
};

/**
 * Middleware to verify DID exists on-chain
 */
export const verifyDIDExists = (contractInstance?: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.didVerification) {
      return res.status(400).json({
        success: false,
        message: 'DID verification required. Use verifyDIDFormat middleware first.'
      });
    }

    if (!contractInstance) {
      console.warn('No contract instance provided for DID existence verification');
      next();
      return;
    }

    try {
      const { didHash } = req.didVerification;
      
      // Check if DID exists on-chain
      const exists = await contractInstance.doesDIDExist(didHash);
      
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'DID does not exist on-chain'
        });
      }

      next();
    } catch (error) {
      console.error('DID existence verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal error during DID existence verification'
      });
    }
  };
};

/**
 * Middleware to verify DID is not revoked
 */
export const verifyDIDNotRevoked = (contractInstance?: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.didVerification) {
      return res.status(400).json({
        success: false,
        message: 'DID verification required. Use verifyDIDFormat middleware first.'
      });
    }

    if (!contractInstance) {
      console.warn('No contract instance provided for DID revocation verification');
      next();
      return;
    }

    try {
      const { didHash } = req.didVerification;
      
      // Check if DID is revoked
      const isRevoked = await contractInstance.isDIDRevoked(didHash);
      
      if (isRevoked) {
        return res.status(410).json({
          success: false,
          message: 'DID has been revoked'
        });
      }

      next();
    } catch (error) {
      console.error('DID revocation verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal error during DID revocation verification'
      });
    }
  };
};

/**
 * Middleware to verify DID verification method
 */
export const verifyDIDVerificationMethod = (req: Request, res: Response, next: NextFunction) => {
  if (!req.didVerification) {
    return res.status(400).json({
      success: false,
      message: 'DID verification required. Use verifyDIDFormat middleware first.'
    });
  }

  const { verificationMethod, publicKey } = req.body;

  if (verificationMethod && !['Ed25519VerificationKey2020', 'EcdsaSecp256k1VerificationKey2019'].includes(verificationMethod)) {
    return res.status(400).json({
      success: false,
      message: 'Unsupported verification method'
    });
  }

  if (publicKey && !publicKey.startsWith('0x')) {
    return res.status(400).json({
      success: false,
      message: 'Public key must be in hex format starting with 0x'
    });
  }

  // Update DID verification info
  req.didVerification.verificationMethod = verificationMethod;
  req.didVerification.publicKey = publicKey;

  next();
};

/**
 * Middleware to require valid DID verification
 */
export const requireDIDVerification = (req: Request, res: Response, next: NextFunction) => {
  if (!req.didVerification || !req.didVerification.isValid) {
    return res.status(401).json({
      success: false,
      message: 'Valid DID verification required'
    });
  }
  next();
};

/**
 * Middleware to validate DID document structure
 */
export const validateDIDDocument = (req: Request, res: Response, next: NextFunction) => {
  const { document } = req.body;

  if (!document) {
    return res.status(400).json({
      success: false,
      message: 'DID document is required'
    });
  }

  try {
    const parsedDoc = typeof document === 'string' ? JSON.parse(document) : document;

    // Validate required DID document fields
    if (!parsedDoc['@context']) {
      return res.status(400).json({
        success: false,
        message: 'DID document must include @context'
      });
    }

    if (!parsedDoc.id) {
      return res.status(400).json({
        success: false,
        message: 'DID document must include id'
      });
    }

    if (!parsedDoc.verificationMethod || !Array.isArray(parsedDoc.verificationMethod)) {
      return res.status(400).json({
        success: false,
        message: 'DID document must include verificationMethod array'
      });
    }

    // Validate verification methods
    for (const vm of parsedDoc.verificationMethod) {
      if (!vm.id || !vm.type || !vm.publicKeyMultibase) {
        return res.status(400).json({
          success: false,
          message: 'Each verification method must include id, type, and publicKeyMultibase'
        });
      }
    }

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid DID document JSON format'
    });
  }
};
