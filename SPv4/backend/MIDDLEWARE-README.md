# SafePsy DID Backend Middleware Documentation

This document provides comprehensive documentation for all middleware modules in the SafePsy DID Backend.

## Table of Contents

1. [Wallet Authentication Middleware](#wallet-authentication-middleware)
2. [DID Verification Middleware](#did-verification-middleware)
3. [Validation Middleware](#validation-middleware)
4. [Rate Limiting Middleware](#rate-limiting-middleware)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)

## Wallet Authentication Middleware

### Overview
The wallet authentication middleware provides secure authentication using Ethereum wallet signatures.

### Key Features
- Signature verification using ethers.js
- JWT token generation for authenticated sessions
- Nonce-based replay attack prevention
- Support for optional and required authentication

### Available Middleware

#### `walletAuth`
Authenticates a user using wallet signature verification.

```typescript
import { walletAuth } from './middleware/wallet-auth';

app.post('/api/auth/wallet', walletAuth, (req, res) => {
  // req.walletUser contains authenticated user info
  res.json({ success: true, user: req.walletUser });
});
```

**Request Body:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "signature": "0x...",
  "message": "SafePsy DID Authentication\n\nAddress: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6\nNonce: abc123...",
  "nonce": "abc123..."
}
```

#### `verifyWalletToken`
Verifies JWT token for wallet authentication.

```typescript
import { verifyWalletToken } from './middleware/wallet-auth';

app.get('/api/protected', verifyWalletToken, (req, res) => {
  // req.walletUser contains decoded token info
  res.json({ success: true, user: req.walletUser });
});
```

#### `requireWalletAuth`
Requires wallet authentication to proceed.

```typescript
import { requireWalletAuth } from './middleware/wallet-auth';

app.get('/api/user/profile', requireWalletAuth, (req, res) => {
  // Only authenticated wallet users can access
});
```

#### `validateWalletOwnership`
Validates that the authenticated wallet owns a specific address.

```typescript
import { validateWalletOwnership } from './middleware/wallet-auth';

app.get('/api/user/:address/profile', 
  verifyWalletToken,
  validateWalletOwnership('address'),
  (req, res) => {
    // Wallet owns the specified address
  }
);
```

### Utility Functions

#### `generateNonce()`
Generates a random nonce for authentication.

```typescript
import { generateNonce } from './middleware/wallet-auth';

const nonce = generateNonce();
```

#### `generateSignMessage(address, nonce)`
Generates a standardized message for wallet signing.

```typescript
import { generateSignMessage } from './middleware/wallet-auth';

const message = generateSignMessage(address, nonce);
```

## DID Verification Middleware

### Overview
The DID verification middleware provides comprehensive DID validation and verification capabilities.

### Key Features
- SafePsy DID format validation
- On-chain DID existence verification
- DID ownership verification
- DID document structure validation
- Revocation status checking

### Available Middleware

#### `verifyDIDFormat`
Validates DID format and extracts DID hash.

```typescript
import { verifyDIDFormat } from './middleware/did-verify';

app.get('/api/did/:did', verifyDIDFormat, (req, res) => {
  // req.didVerification contains DID info
  const { did, didHash } = req.didVerification;
});
```

#### `verifyDIDOwnership`
Verifies DID ownership by checking against the owner address.

```typescript
import { verifyDIDOwnership } from './middleware/did-verify';

app.get('/api/did/:did/verify', 
  verifyDIDFormat,
  verifyDIDOwnership,
  (req, res) => {
    // DID ownership verified
  }
);
```

#### `verifyDIDExists`
Verifies that a DID exists on-chain.

```typescript
import { verifyDIDExists } from './middleware/did-verify';

app.get('/api/did/:did/exists', 
  verifyDIDFormat,
  verifyDIDExists(contractInstance),
  (req, res) => {
    // DID exists on-chain
  }
);
```

#### `verifyDIDNotRevoked`
Verifies that a DID is not revoked.

```typescript
import { verifyDIDNotRevoked } from './middleware/did-verify';

app.get('/api/did/:did/status', 
  verifyDIDFormat,
  verifyDIDNotRevoked(contractInstance),
  (req, res) => {
    // DID is not revoked
  }
);
```

#### `validateDIDDocument`
Validates DID document structure according to W3C standards.

```typescript
import { validateDIDDocument } from './middleware/did-verify';

app.post('/api/did/document', 
  validateDIDDocument,
  (req, res) => {
    // Valid DID document
  }
);
```

### Utility Functions

#### `validateDIDFormat(did)`
Validates SafePsy DID format.

```typescript
import { validateDIDFormat } from './middleware/did-verify';

const isValid = validateDIDFormat('did:safepsy:abc123...');
```

#### `extractDIDHash(did)`
Extracts hash from SafePsy DID.

```typescript
import { extractDIDHash } from './middleware/did-verify';

const hash = extractDIDHash('did:safepsy:abc123...');
```

## Validation Middleware

### Overview
The validation middleware provides comprehensive input validation using express-validator.

### Key Features
- Field-specific validation rules
- Custom validation for SafePsy-specific fields
- Input sanitization
- Content type validation
- Request size validation

### Available Middleware

#### `handleValidationErrors`
Handles validation errors and returns formatted responses.

```typescript
import { handleValidationErrors } from './middleware/validation';

app.post('/api/data', 
  validateEthereumAddress('address'),
  validateJSONDocument('document'),
  handleValidationErrors,
  (req, res) => {
    // All validations passed
  }
);
```

#### Field Validation Middleware

##### `validateEthereumAddress(field)`
Validates Ethereum address format.

```typescript
import { validateEthereumAddress } from './middleware/validation';

app.post('/api/user', 
  validateEthereumAddress('address'),
  handleValidationErrors,
  (req, res) => { /* ... */ }
);
```

##### `validateDIDString(field)`
Validates SafePsy DID string format.

```typescript
import { validateDIDString } from './middleware/validation';

app.post('/api/did', 
  validateDIDString('did'),
  handleValidationErrors,
  (req, res) => { /* ... */ }
);
```

##### `validateJSONDocument(field)`
Validates JSON document structure.

```typescript
import { validateJSONDocument } from './middleware/validation';

app.post('/api/document', 
  validateJSONDocument('document'),
  handleValidationErrors,
  (req, res) => { /* ... */ }
);
```

##### `validateSignature(field)`
Validates Ethereum signature format.

```typescript
import { validateSignature } from './middleware/validation';

app.post('/api/auth', 
  validateSignature('signature'),
  handleValidationErrors,
  (req, res) => { /* ... */ }
);
```

#### Utility Middleware

##### `sanitizeInput`
Sanitizes input data to prevent XSS attacks.

```typescript
import { sanitizeInput } from './middleware/validation';

app.use(sanitizeInput);
```

##### `validateContentType(allowedTypes)`
Validates request content type.

```typescript
import { validateContentType } from './middleware/validation';

app.use(validateContentType(['application/json']));
```

##### `validateRequestSize(maxSize)`
Validates request size.

```typescript
import { validateRequestSize } from './middleware/validation';

app.use(validateRequestSize(10 * 1024 * 1024)); // 10MB
```

## Rate Limiting Middleware

### Overview
The rate limiting middleware provides comprehensive rate limiting capabilities with support for IP, DID, and wallet-based limits.

### Key Features
- Per-IP rate limiting
- Per-DID rate limiting
- Per-wallet rate limiting
- Combined rate limiting
- Custom rate limiting for specific operations
- Whitelist support

### Available Middleware

#### `rateLimitPerIP`
Rate limits requests per IP address.

```typescript
import { rateLimitPerIP } from './middleware/rate-limit';

app.use(rateLimitPerIP({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP'
}));
```

#### `rateLimitPerDID`
Rate limits requests per DID.

```typescript
import { rateLimitPerDID } from './middleware/rate-limit';

app.use(rateLimitPerDID({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  message: 'Too many requests for this DID'
}));
```

#### `rateLimitCombined`
Combines IP and DID rate limiting.

```typescript
import { rateLimitCombined } from './middleware/rate-limit';

app.use(rateLimitCombined({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxPerIP: 100,
  maxPerDID: 50,
  message: 'Rate limit exceeded'
}));
```

#### Specialized Rate Limiting

##### `authRateLimit`
Rate limiting for authentication endpoints.

```typescript
import { authRateLimit } from './middleware/rate-limit';

app.use('/api/auth', authRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 auth attempts per 15 minutes
  message: 'Too many authentication attempts'
}));
```

##### `didOperationRateLimit`
Rate limiting for DID operations.

```typescript
import { didOperationRateLimit } from './middleware/rate-limit';

app.use('/api/did', didOperationRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 DID operations per minute
  message: 'Too many DID operations'
}));
```

##### `storageRateLimit`
Rate limiting for storage operations.

```typescript
import { storageRateLimit } from './middleware/rate-limit';

app.use('/api/storage', storageRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 storage operations per 5 minutes
  message: 'Too many storage operations'
}));
```

## Usage Examples

### Complete Route with All Middleware

```typescript
import express from 'express';
import {
  verifyWalletToken,
  requireWalletAuth,
  verifyDIDFormat,
  verifyDIDOwnership,
  validateEthereumAddress,
  validateJSONDocument,
  handleValidationErrors,
  rateLimitCombined
} from './middleware';

const router = express.Router();

// Create DID with full middleware stack
router.post('/did',
  rateLimitCombined({
    windowMs: 60 * 1000, // 1 minute
    maxPerIP: 20,
    maxPerDID: 10,
    message: 'Too many DID creation requests'
  }),
  verifyWalletToken,
  requireWalletAuth,
  validateEthereumAddress('address'),
  validateJSONDocument('document'),
  handleValidationErrors,
  verifyDIDFormat,
  verifyDIDOwnership,
  async (req, res) => {
    try {
      const { did, didHash } = req.didVerification;
      const { address, document } = req.body;
      const walletUser = req.walletUser;

      // Create DID logic here
      res.json({
        success: true,
        did,
        didHash,
        owner: walletUser.address
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create DID'
      });
    }
  }
);

export default router;
```

### Authentication Flow

```typescript
import { generateNonce, generateSignMessage, walletAuth } from './middleware';

// Step 1: Get nonce for authentication
app.get('/api/auth/nonce', (req, res) => {
  const nonce = generateNonce();
  res.json({ nonce });
});

// Step 2: Authenticate with wallet signature
app.post('/api/auth/wallet', walletAuth, (req, res) => {
  res.json({
    success: true,
    user: req.walletUser,
    message: 'Authentication successful'
  });
});
```

### DID Verification Flow

```typescript
import { 
  verifyDIDFormat, 
  verifyDIDExists, 
  verifyDIDNotRevoked,
  verifyDIDOwnership 
} from './middleware';

// Verify DID exists and is not revoked
app.get('/api/did/:did/verify',
  verifyDIDFormat,
  verifyDIDExists(contractInstance),
  verifyDIDNotRevoked(contractInstance),
  verifyDIDOwnership,
  (req, res) => {
    res.json({
      success: true,
      did: req.didVerification.did,
      isValid: true,
      owner: req.didVerification.owner
    });
  }
);
```

## Best Practices

### 1. Middleware Order
Always apply middleware in the correct order:

```typescript
app.use('/api/route',
  rateLimitPerIP(),           // 1. Rate limiting first
  sanitizeInput,              // 2. Input sanitization
  validateContentType(),      // 3. Content type validation
  verifyWalletToken,          // 4. Authentication
  validateEthereumAddress(),  // 5. Field validation
  handleValidationErrors,     // 6. Validation error handling
  verifyDIDFormat,            // 7. Business logic validation
  verifyDIDOwnership,        // 8. Authorization
  (req, res) => { /* ... */ } // 9. Route handler
);
```

### 2. Error Handling
Always use the error handling middleware:

```typescript
import { errorHandler, notFoundHandler } from './middleware';

// Error handling (should be last)
app.use(errorHandler);
app.use(notFoundHandler);
```

### 3. Rate Limiting Strategy
Use appropriate rate limiting for different endpoints:

```typescript
// Strict rate limiting for sensitive operations
app.use('/api/auth', authRateLimit({ max: 5 }));

// Moderate rate limiting for regular operations
app.use('/api/did', didOperationRateLimit({ max: 20 }));

// Generous rate limiting for read operations
app.use('/api/read', rateLimitPerIP({ max: 100 }));
```

### 4. Environment Variables
Ensure all required environment variables are set:

```typescript
const requiredEnvVars = [
  'JWT_SECRET',
  'DID_REGISTRY_ADDRESS',
  'DID_STORAGE_ADDRESS',
  'PRIVATE_KEY',
  'RPC_URL'
];
```

### 5. Contract Integration
Pass contract instances to DID verification middleware:

```typescript
import { verifyDIDExists, verifyDIDNotRevoked } from './middleware';

// Initialize contracts
const didRegistry = new ethers.Contract(/* ... */);
const didStorage = new ethers.Contract(/* ... */);

// Use in middleware
app.get('/api/did/:did',
  verifyDIDFormat,
  verifyDIDExists(didRegistry),
  verifyDIDNotRevoked(didRegistry),
  (req, res) => { /* ... */ }
);
```

### 6. Testing
Test middleware combinations thoroughly:

```typescript
describe('DID Creation Endpoint', () => {
  it('should create DID with valid wallet authentication', async () => {
    const response = await request(app)
      .post('/api/did')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        document: JSON.stringify({ /* valid DID document */ })
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

This comprehensive middleware system provides robust security, validation, and rate limiting capabilities for the SafePsy DID Backend.
