import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { SiweMessage } from 'siwe';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = Router();

// Store challenges temporarily (in production, use Redis or database)
const challenges = new Map<string, { challenge: string; expiresAt: number }>();

// Clean up expired challenges every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of challenges.entries()) {
    if (value.expiresAt < now) {
      challenges.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * @route POST /api/auth/challenge
 * @desc Generate SIWE challenge for authentication
 * @access Public
 */
router.post('/challenge', [
  body('address').isEthereumAddress().withMessage('Valid Ethereum address required'),
  body('domain').optional().isString().withMessage('Domain must be a string'),
  body('uri').optional().isURL().withMessage('URI must be a valid URL')
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

    const { address, domain = 'safepsy.app', uri = 'https://safepsy.app' } = req.body;

    // Generate a random nonce
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // Create SIWE message
    const siweMessage = new SiweMessage({
      domain,
      address,
      statement: 'Sign in to SafePsy DID Registry',
      uri,
      version: '1',
      chainId: process.env.CHAIN_ID || '1',
      nonce
    });

    const message = siweMessage.prepareMessage();

    // Store challenge with expiration (5 minutes)
    challenges.set(address.toLowerCase(), {
      challenge: message,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        message,
        nonce,
        domain,
        uri,
        chainId: process.env.CHAIN_ID || '1'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Challenge generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate challenge',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route POST /api/auth/verify
 * @desc Verify SIWE signature and issue JWT token
 * @access Public
 */
router.post('/verify', [
  body('message').isString().withMessage('Message is required'),
  body('signature').isString().withMessage('Signature is required')
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

    const { message, signature } = req.body;

    // Parse the SIWE message
    const siweMessage = new SiweMessage(message);
    
    // Verify the signature
    const fields = await siweMessage.verify({ signature });
    
    if (!fields.success) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature',
        error: fields.error?.message || 'Signature verification failed'
      });
    }

    const { address, nonce } = fields.data;

    // Check if challenge exists and is valid
    const storedChallenge = challenges.get(address.toLowerCase());
    if (!storedChallenge) {
      return res.status(401).json({
        success: false,
        message: 'No valid challenge found for this address'
      });
    }

    if (storedChallenge.expiresAt < Date.now()) {
      challenges.delete(address.toLowerCase());
      return res.status(401).json({
        success: false,
        message: 'Challenge has expired'
      });
    }

    // Verify nonce matches
    if (nonce !== storedChallenge.challenge.split('\n').find(line => line.startsWith('Nonce:'))?.split(': ')[1]) {
      return res.status(401).json({
        success: false,
        message: 'Invalid nonce'
      });
    }

    // Remove used challenge
    challenges.delete(address.toLowerCase());

    // Generate JWT token
    const token = jwt.sign(
      {
        address: address.toLowerCase(),
        nonce,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        address: address.toLowerCase(),
        expiresIn: '24h'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify signature',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route POST /api/auth/refresh
 * @desc Refresh JWT token
 * @access Private
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      // Generate new token
      const newToken = jwt.sign(
        {
          address: decoded.address,
          nonce: crypto.randomBytes(16).toString('hex'),
          iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        data: {
          token: newToken,
          address: decoded.address,
          expiresIn: '24h'
        },
        timestamp: new Date().toISOString()
      });

    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current authenticated user info
 * @access Private
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      res.json({
        success: true,
        data: {
          address: decoded.address,
          iat: decoded.iat,
          exp: decoded.exp
        },
        timestamp: new Date().toISOString()
      });

    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify authentication',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
