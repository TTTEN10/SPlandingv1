import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Extend Request interface to include wallet user
declare global {
  namespace Express {
    interface Request {
      walletUser?: {
        address: string;
        signature: string;
        message: string;
        nonce: string;
        iat: number;
        exp: number;
      };
    }
  }
}

/**
 * Generate a random nonce for wallet authentication
 */
export const generateNonce = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate a message for wallet signing
 */
export const generateSignMessage = (address: string, nonce: string): string => {
  return `SafePsy DID Authentication\n\nAddress: ${address}\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;
};

/**
 * Middleware to verify wallet signature and authenticate user
 */
export const walletAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address, signature, message, nonce } = req.body;

    // Validate required fields
    if (!address || !signature || !message || !nonce) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: address, signature, message, nonce'
      });
    }

    // Validate Ethereum address format
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Ethereum address format'
      });
    }

    // Verify signature
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return res.status(401).json({
          success: false,
          message: 'Invalid signature - address mismatch'
        });
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature format'
      });
    }

    // Verify message contains expected nonce and address
    const expectedMessage = generateSignMessage(address, nonce);
    if (message !== expectedMessage) {
      return res.status(401).json({
        success: false,
        message: 'Invalid message format'
      });
    }

    // Generate JWT token for authenticated wallet user
    const token = jwt.sign(
      {
        address: address.toLowerCase(),
        signature,
        message,
        nonce,
        type: 'wallet'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Attach wallet user info to request
    req.walletUser = {
      address: address.toLowerCase(),
      signature,
      message,
      nonce,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    // Add token to response headers
    res.setHeader('Authorization', `Bearer ${token}`);

    next();
  } catch (error) {
    console.error('Wallet auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during wallet authentication'
    });
  }
};

/**
 * Middleware to verify JWT token for wallet authentication
 */
export const verifyWalletToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Wallet authentication token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    if (decoded.type !== 'wallet') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type - wallet token required'
      });
    }

    req.walletUser = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired wallet token'
    });
  }
};

/**
 * Middleware to require wallet authentication
 */
export const requireWalletAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.walletUser) {
    return res.status(401).json({
      success: false,
      message: 'Wallet authentication required'
    });
  }
  next();
};

/**
 * Middleware to validate wallet ownership of a specific address
 */
export const validateWalletOwnership = (addressParam: string = 'address') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const targetAddress = req.params[addressParam] || req.body[addressParam];
    
    if (!targetAddress) {
      return res.status(400).json({
        success: false,
        message: `Missing ${addressParam} parameter`
      });
    }

    if (!req.walletUser) {
      return res.status(401).json({
        success: false,
        message: 'Wallet authentication required'
      });
    }

    if (req.walletUser.address.toLowerCase() !== targetAddress.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Wallet does not own the specified address'
      });
    }

    next();
  };
};

/**
 * Middleware to check if wallet is authenticated (optional)
 */
export const optionalWalletAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      if (decoded.type === 'wallet') {
        req.walletUser = decoded;
      }
    } catch (error) {
      // Token is invalid, but we continue without authentication
      console.warn('Invalid wallet token in optional auth:', error);
    }
  }

  next();
};
