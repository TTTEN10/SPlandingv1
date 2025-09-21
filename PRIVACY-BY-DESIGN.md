# Privacy by Design: IP Address Handling

## Overview

This document describes the privacy by design implementation for IP address handling across the SafePsy platform. The implementation follows the principle of **default OFF** for maximum privacy protection.

## Key Principles

1. **Default OFF**: IP hashing is disabled by default
2. **Explicit Opt-in**: Must be explicitly enabled via environment variables
3. **Secure Hashing**: Uses SHA-256 with configurable salt when enabled
4. **Consistent Implementation**: Same privacy utilities across all services

## Implementation Details

### Environment Variables

```bash
# Privacy by Design - IP Address Handling
IP_HASHING_ENABLED=false  # Default: OFF for maximum privacy
IP_SALT=default-privacy-salt-change-in-production  # Change in production!
```

### Behavior

- **When `IP_HASHING_ENABLED=false` (default)**:
  - Raw IP addresses are NOT logged
  - Placeholder `IP_HASHING_DISABLED` is used instead
  - Maximum privacy protection

- **When `IP_HASHING_ENABLED=true`**:
  - IP addresses are hashed using SHA-256 with salt
  - `ipHash = sha256(ip + SALT)`
  - Still provides privacy while enabling rate limiting

### Files Modified

#### 1. Centralized Privacy Utilities
- **File**: `SPv3.x/packages/shared-types/src/privacy.ts`
- **Purpose**: Centralized IP hashing utilities
- **Exports**: `hashIP`, `getClientIP`, `getPrivacySafeIP`, `isIPHashingEnabled`

#### 2. Rate Limiting Middleware
- **File**: `SPv3.x/backend/src/middleware/rate-limit.ts`
- **Changes**: Updated to use privacy-safe IP handling
- **Impact**: Rate limiting now respects privacy settings

#### 3. Shared Logger
- **File**: `SPv3.x/shared-logger/index.js`
- **Changes**: IP addresses are hashed before logging
- **Impact**: Logs contain privacy-safe IP information

#### 4. Landing Page API
- **Files**: 
  - `SPlandingv0.1/safepsy-landing/apps/api/src/lib/crypto.ts`
  - `SPlandingv0.1/safepsy-landing/backend/src/server.ts`
- **Changes**: Updated IP hashing to respect privacy settings
- **Impact**: Email subscriptions use privacy-safe IP handling

#### 5. Environment Configuration
- **Files**: All `env.example` files updated
- **Changes**: Added `IP_HASHING_ENABLED` and `IP_SALT` variables
- **Impact**: Clear documentation of privacy settings

## Usage Examples

### Basic IP Hashing

```typescript
import { hashIP, getClientIP } from '@safepsy/shared-types';

// Get privacy-safe IP from request
const safeIP = getClientIP(req);

// Hash a specific IP
const hashedIP = hashIP('192.168.1.1');
```

### Rate Limiting with Privacy

```typescript
import { rateLimitPerIP } from './middleware/rate-limit';

// Rate limiting automatically uses privacy-safe IPs
app.use('/api', rateLimitPerIP({
  windowMs: 15 * 60 * 1000,
  max: 100
}));
```

### Logging with Privacy

```javascript
const { createLogger } = require('@safepsy/shared-logger');

const logger = createLogger('my-service');
logger.logRequest(req, res, next); // Automatically uses privacy-safe IPs
```

## Security Considerations

1. **Salt Management**: 
   - Use a strong, unique salt in production
   - Generate with: `openssl rand -hex 32`
   - Rotate regularly

2. **Default Behavior**:
   - Default OFF ensures maximum privacy
   - Must explicitly enable IP hashing
   - Clear documentation of privacy implications

3. **Rate Limiting**:
   - Still effective with hashed IPs
   - Maintains security while protecting privacy
   - Consistent behavior across services

## Compliance

This implementation supports:

- **GDPR**: Privacy by design principles
- **CCPA**: Minimal data collection
- **SOC 2**: Data protection requirements
- **HIPAA**: Privacy safeguards (if applicable)

## Migration Guide

### For Existing Deployments

1. **Update Environment Variables**:
   ```bash
   # Add to your .env file
   IP_HASHING_ENABLED=false  # Keep disabled for maximum privacy
   IP_SALT=your-secure-salt-here
   ```

2. **Deploy Updated Code**:
   - All services will automatically use privacy-safe IP handling
   - No breaking changes to existing functionality

3. **Optional: Enable IP Hashing**:
   ```bash
   # Only if you need IP-based rate limiting
   IP_HASHING_ENABLED=true
   IP_SALT=your-production-salt
   ```

### Testing

```bash
# Test privacy settings
curl -H "X-Forwarded-For: 192.168.1.1" http://localhost:3000/api/subscribe

# Check logs - should show 'IP_HASHING_DISABLED' or hashed IP
```

## Monitoring

Monitor the following metrics:

- Rate limiting effectiveness
- Privacy compliance
- Salt rotation schedule
- Environment variable consistency

## Support

For questions about privacy implementation:

1. Check environment variables
2. Verify salt configuration
3. Review log outputs
4. Test with different IP addresses

---

**Remember**: Privacy by design means defaulting to maximum privacy protection. Only enable IP hashing if absolutely necessary for your use case.
