import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { createHash } from 'crypto';
import { getClientIP } from '@safepsy/shared-types';

// In-memory store for rate limiting (in production, use Redis)
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

// Note: getClientIP is now imported from @safepsy/shared-types
// This provides privacy-safe IP handling with configurable hashing

/**
 * Generate a unique key for rate limiting
 */
const generateRateLimitKey = (identifier: string, windowMs: number): string => {
  const window = Math.floor(Date.now() / windowMs);
  return `${identifier}:${window}`;
};

/**
 * Clean expired entries from rate limit store
 */
const cleanExpiredEntries = (): void => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
};

/**
 * Custom rate limit store implementation
 */
const customStore = {
  increment: (key: string, windowMs: number, max: number) => {
    cleanExpiredEntries();
    
    const now = Date.now();
    const resetTime = now + windowMs;
    
    if (!rateLimitStore[key]) {
      rateLimitStore[key] = {
        count: 1,
        resetTime
      };
      return {
        totalHits: 1,
        resetTime: new Date(resetTime)
      };
    }
    
    if (rateLimitStore[key].resetTime < now) {
      rateLimitStore[key] = {
        count: 1,
        resetTime
      };
      return {
        totalHits: 1,
        resetTime: new Date(resetTime)
      };
    }
    
    rateLimitStore[key].count++;
    
    return {
      totalHits: rateLimitStore[key].count,
      resetTime: new Date(rateLimitStore[key].resetTime)
    };
  }
};

/**
 * Rate limiting middleware per IP address
 */
export const rateLimitPerIP = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
} = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // requests per window
    message = 'Too many requests from this IP, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    skipFailedRequests,
    keyGenerator: (req: Request) => {
      return generateRateLimitKey(getClientIP(req), windowMs);
    },
    store: {
      increment: (key: string) => customStore.increment(key, windowMs, max)
    }
  });
};

/**
 * Rate limiting middleware per DID
 */
export const rateLimitPerDID = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
} = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 50, // requests per window
    message = 'Too many requests for this DID, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Extract DID from request
    const did = req.params.did || req.body.did || req.query.did;
    
    if (!did) {
      return next(); // Skip rate limiting if no DID provided
    }

    // Validate DID format
    if (!did.startsWith('did:safepsy:')) {
      return next(); // Skip rate limiting for invalid DID format
    }

    const key = generateRateLimitKey(`did:${did}`, windowMs);
    const result = customStore.increment(key, windowMs, max);

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': max.toString(),
      'X-RateLimit-Remaining': Math.max(0, max - result.totalHits).toString(),
      'X-RateLimit-Reset': result.resetTime.getTime().toString()
    });

    if (result.totalHits > max) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    next();
  };
};

/**
 * Rate limiting middleware per wallet address
 */
export const rateLimitPerWallet = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
} = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 30, // requests per window
    message = 'Too many requests for this wallet, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Extract wallet address from request
    const address = req.params.address || req.body.address || req.walletUser?.address;
    
    if (!address) {
      return next(); // Skip rate limiting if no address provided
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return next(); // Skip rate limiting for invalid address format
    }

    const key = generateRateLimitKey(`wallet:${address.toLowerCase()}`, windowMs);
    const result = customStore.increment(key, windowMs, max);

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': max.toString(),
      'X-RateLimit-Remaining': Math.max(0, max - result.totalHits).toString(),
      'X-RateLimit-Reset': result.resetTime.getTime().toString()
    });

    if (result.totalHits > max) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    next();
  };
};

/**
 * Combined rate limiting middleware (IP + DID)
 */
export const rateLimitCombined = (options: {
  windowMs?: number;
  maxPerIP?: number;
  maxPerDID?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
} = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxPerIP = 100,
    maxPerDID = 50,
    message = 'Rate limit exceeded, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = getClientIP(req);
    const did = req.params.did || req.body.did || req.query.did;
    const address = req.params.address || req.body.address || req.walletUser?.address;

    // Check IP rate limit
    const ipKey = generateRateLimitKey(`ip:${clientIP}`, windowMs);
    const ipResult = customStore.increment(ipKey, windowMs, maxPerIP);

    if (ipResult.totalHits > maxPerIP) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Check DID rate limit if DID is provided
    if (did && did.startsWith('did:safepsy:')) {
      const didKey = generateRateLimitKey(`did:${did}`, windowMs);
      const didResult = customStore.increment(didKey, windowMs, maxPerDID);

      if (didResult.totalHits > maxPerDID) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests for this DID, please try again later.',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }
    }

    // Check wallet rate limit if address is provided
    if (address && /^0x[a-fA-F0-9]{40}$/.test(address)) {
      const walletKey = generateRateLimitKey(`wallet:${address.toLowerCase()}`, windowMs);
      const walletResult = customStore.increment(walletKey, windowMs, maxPerDID);

      if (walletResult.totalHits > maxPerDID) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests for this wallet, please try again later.',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }
    }

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit-IP': maxPerIP.toString(),
      'X-RateLimit-Remaining-IP': Math.max(0, maxPerIP - ipResult.totalHits).toString(),
      'X-RateLimit-Reset': ipResult.resetTime.getTime().toString()
    });

    next();
  };
};

/**
 * Strict rate limiting for sensitive operations
 */
export const strictRateLimit = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
} = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 5, // 5 requests per minute
    message = 'Too many sensitive operations, please wait before trying again.'
  } = options;

  return rateLimitPerIP({
    windowMs,
    max,
    message,
    skipSuccessfulRequests: true,
    skipFailedRequests: false
  });
};

/**
 * Rate limiting for authentication endpoints
 */
export const authRateLimit = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
} = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 10, // 10 login attempts per 15 minutes
    message = 'Too many authentication attempts, please try again later.'
  } = options;

  return rateLimitPerIP({
    windowMs,
    max,
    message,
    skipSuccessfulRequests: true,
    skipFailedRequests: false
  });
};

/**
 * Rate limiting for DID operations
 */
export const didOperationRateLimit = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
} = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 20, // 20 DID operations per minute
    message = 'Too many DID operations, please try again later.'
  } = options;

  return rateLimitCombined({
    windowMs,
    maxPerIP: 20,
    maxPerDID: 10,
    message,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  });
};

/**
 * Rate limiting for data storage operations
 */
export const storageRateLimit = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
} = {}) => {
  const {
    windowMs = 5 * 60 * 1000, // 5 minutes
    max = 50, // 50 storage operations per 5 minutes
    message = 'Too many storage operations, please try again later.'
  } = options;

  return rateLimitCombined({
    windowMs,
    maxPerIP: 50,
    maxPerDID: 25,
    message,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  });
};

/**
 * Dynamic rate limiting based on user tier
 */
export const dynamicRateLimit = (getUserTier: (req: Request) => 'free' | 'premium' | 'enterprise') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const tier = getUserTier(req);
    
    const limits = {
      free: { windowMs: 15 * 60 * 1000, max: 100 },
      premium: { windowMs: 15 * 60 * 1000, max: 500 },
      enterprise: { windowMs: 15 * 60 * 1000, max: 2000 }
    };

    const limit = limits[tier];
    
    return rateLimitPerIP({
      ...limit,
      message: `Rate limit exceeded for ${tier} tier, please try again later.`
    })(req, res, next);
  };
};

/**
 * Rate limiting bypass for whitelisted IPs
 */
export const rateLimitWithWhitelist = (whitelist: string[], options: any = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = getClientIP(req);
    
    if (whitelist.includes(clientIP)) {
      return next(); // Skip rate limiting for whitelisted IPs
    }
    
    return rateLimitPerIP(options)(req, res, next);
  };
};
