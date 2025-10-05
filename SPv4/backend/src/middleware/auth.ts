import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        address: string;
        nonce: string;
        iat: number;
        exp: number;
      };
    }
  }
}

/**
 * Middleware to verify JWT token
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
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
 * Middleware to validate Ethereum address
 */
export const validateAddress = (req: Request, res: Response, next: NextFunction) => {
  const { address } = req.params;
  
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Ethereum address format'
    });
  }
  
  next();
};

/**
 * Middleware to validate DID hash
 */
export const validateDIDHash = (req: Request, res: Response, next: NextFunction) => {
  const { didHash } = req.params;
  
  if (!didHash || !/^0x[a-fA-F0-9]{64}$/.test(didHash)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid DID hash format'
    });
  }
  
  next();
};

/**
 * Middleware to validate data hash
 */
export const validateDataHash = (req: Request, res: Response, next: NextFunction) => {
  const { dataHash } = req.body;
  
  if (!dataHash || !/^0x[a-fA-F0-9]{64}$/.test(dataHash)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid data hash format'
    });
  }
  
  next();
};

/**
 * Middleware to validate DID string format
 */
export const validateDIDString = (req: Request, res: Response, next: NextFunction) => {
  const { did } = req.body;
  
  if (!did || !did.startsWith('did:safepsy:')) {
    return res.status(400).json({
      success: false,
      message: 'DID must start with "did:safepsy:"'
    });
  }
  
  next();
};

/**
 * Middleware to validate JSON document
 */
export const validateJSONDocument = (req: Request, res: Response, next: NextFunction) => {
  const { document } = req.body;
  
  if (!document) {
    return res.status(400).json({
      success: false,
      message: 'Document is required'
    });
  }
  
  try {
    JSON.parse(document);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Document must be valid JSON'
    });
  }
};

/**
 * Middleware to check if contracts are initialized
 */
export const checkContractsInitialized = (req: Request, res: Response, next: NextFunction) => {
  // This will be implemented in the route files where contracts are used
  next();
};

/**
 * Error handling middleware
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.details || err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

/**
 * 404 handler middleware
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'The requested resource was not found',
    path: req.path,
    method: req.method
  });
};
