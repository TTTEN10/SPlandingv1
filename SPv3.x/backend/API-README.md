# SafePsy DID Backend API

This backend provides REST API endpoints for managing Decentralized Identities (DIDs) and their associated data storage using smart contracts. It includes comprehensive middleware, security features, and integration with the SafePsy ecosystem.

## Features

- **SIWE Authentication**: Sign-In with Ethereum authentication flow
- **DID Management**: Create, resolve, update, and revoke DIDs
- **Data Storage**: Write, read, update, and delete data pointers
- **Access Control**: Grant and revoke access to stored data
- **Smart Contract Integration**: Direct interaction with DIDRegistry and DIDStorage contracts
- **Event Indexing**: Real-time blockchain event processing
- **Security Middleware**: Rate limiting, validation, and authentication
- **Comprehensive Testing**: Full test suite with coverage
- **Production Ready**: Docker support and deployment scripts

## Architecture

### Core Components
- **Express.js Server**: RESTful API with TypeScript
- **Smart Contracts**: DIDRegistry and DIDStorage contracts
- **Middleware Stack**: Authentication, validation, rate limiting
- **Database Integration**: MongoDB with Redis caching
- **Event Processing**: Real-time blockchain event indexing
- **Security Layer**: Comprehensive security headers and validation

### Middleware Stack
- **Authentication**: JWT and SIWE-based authentication
- **Rate Limiting**: API protection and abuse prevention
- **Validation**: Request body and parameter validation
- **Security Headers**: Helmet.js security implementation
- **CORS**: Cross-origin resource sharing configuration
- **Compression**: Response compression for performance

### Smart Contract Integration
- **DIDRegistry**: Core DID management contract
- **DIDStorage**: Encrypted data storage contract
- **TypeChain**: Type-safe contract interactions
- **Event Listening**: Real-time event processing
- **Gas Optimization**: Efficient transaction handling

## API Endpoints

### Authentication (`/api/auth`)

#### POST `/api/auth/challenge`
Generate SIWE challenge for authentication.

**Request Body:**
```json
{
  "address": "0x...",
  "domain": "safepsy.app",
  "uri": "https://safepsy.app"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "safepsy.app wants you to sign in with your Ethereum account:...",
    "nonce": "...",
    "domain": "safepsy.app",
    "uri": "https://safepsy.app",
    "chainId": "80002"
  }
}
```

#### POST `/api/auth/verify`
Verify SIWE signature and issue JWT token.

**Request Body:**
```json
{
  "message": "safepsy.app wants you to sign in with your Ethereum account:...",
  "signature": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "address": "0x...",
    "expiresIn": "24h"
  }
}
```

#### POST `/api/auth/refresh`
Refresh JWT token.

**Headers:** `Authorization: Bearer <token>`

#### GET `/api/auth/me`
Get current authenticated user info.

**Headers:** `Authorization: Bearer <token>`

### DID Management (`/api/did`)

#### POST `/api/did/mint`
Create a new DID.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "did": "did:safepsy:123",
  "document": "{\"@context\":\"https://www.w3.org/ns/did/v1\",\"id\":\"did:safepsy:123\"}"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "didHash": "0x...",
    "did": "did:safepsy:123",
    "transactionHash": "0x...",
    "blockNumber": 12345,
    "gasUsed": "123456"
  }
}
```

#### GET `/api/did/resolve/:didHash`
Resolve a DID by its hash.

**Response:**
```json
{
  "success": true,
  "data": {
    "didHash": "0x...",
    "did": "did:safepsy:123",
    "document": "{\"@context\":\"https://www.w3.org/ns/did/v1\"}",
    "owner": "0x...",
    "createdAt": "1234567890",
    "updatedAt": "1234567890",
    "isActive": true,
    "controllers": ["0x..."]
  }
}
```

#### GET `/api/did/resolve-by-string/:did`
Resolve a DID by its string (redirects to hash-based resolution).

#### PUT `/api/did/update/:didHash`
Update a DID document.

**Headers:** `Authorization: Bearer <token>`

#### DELETE `/api/did/revoke/:didHash`
Revoke a DID.

**Headers:** `Authorization: Bearer <token>`

#### GET `/api/did/owner/:address`
Get all DIDs owned by an address.

#### GET `/api/did/stats`
Get DID registry statistics.

### Data Storage (`/api/storage`)

#### POST `/api/storage/write`
Write data pointer for a DID.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "didHash": "0x...",
  "dataType": "profile",
  "dataHash": "0x...",
  "isEncrypted": true
}
```

#### GET `/api/storage/read/:didHash/:dataType`
Read data pointer for a DID.

**Response:**
```json
{
  "success": true,
  "data": {
    "didHash": "0x...",
    "dataType": "profile",
    "dataHash": "0x...",
    "timestamp": "1234567890",
    "isEncrypted": true,
    "authorizedAccessors": ["0x..."]
  }
}
```

#### PUT `/api/storage/update`
Update data pointer for a DID.

**Headers:** `Authorization: Bearer <token>`

#### DELETE `/api/storage/delete`
Delete data pointer for a DID.

**Headers:** `Authorization: Bearer <token>`

#### GET `/api/storage/types/:didHash`
Get all data types for a DID.

#### POST `/api/storage/grant-access`
Grant access to stored data.

**Headers:** `Authorization: Bearer <token>`

#### POST `/api/storage/revoke-access`
Revoke access to stored data.

**Headers:** `Authorization: Bearer <token>`

#### GET `/api/storage/check-access/:didHash/:accessor/:dataType`
Check if an address has access to stored data.

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=production
FRONTEND_URL=http://localhost:80

# Database Configuration
MONGODB_URI=mongodb://admin:safepsy_password@mongodb:27017/safepsy?authSource=admin
REDIS_URL=redis://redis:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Blockchain Configuration
NETWORK=polygonAmoy
CHAIN_ID=80002
RPC_URL=https://rpc-amoy.polygon.technology
FALLBACK_RPC_URL=https://polygon-amoy.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your-private-key-here

# Contract Addresses
DID_REGISTRY_ADDRESS=0x...
DID_STORAGE_ADDRESS=0x...

# SIWE Configuration
SIWE_DOMAIN=safepsy.app
SIWE_URI=https://safepsy.app

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
CORS_ORIGIN=http://localhost:80

# Monitoring Configuration
ENABLE_METRICS=true
LOG_LEVEL=info
```

## Installation and Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile Smart Contracts
```bash
npm run compile:did
```

### 3. Deploy Contracts
```bash
# Deploy to Polygon Amoy testnet
npm run deploy:did:amoy

# Deploy to Polygon mainnet
npm run deploy:did:polygon

# Verify contracts
npm run verify:amoy
```

### 4. Update Environment Configuration
Update contract addresses in `.env` file after deployment.

### 5. Start the Server
```bash
# Development
npm run dev

# Production
npm run build
npm start

# Docker
docker-compose up -d backend
```

### 6. Run Tests
```bash
# Run all tests
npm run test

# Run smart contract tests
npm run test:did

# Run with coverage
npm run test:coverage
```

## Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server

### Smart Contracts
- `npm run compile:did` - Compile DID contracts
- `npm run test:did` - Test smart contracts
- `npm run deploy:did:amoy` - Deploy to Polygon Amoy
- `npm run deploy:did:polygon` - Deploy to Polygon mainnet
- `npm run verify:amoy` - Verify contracts on Polygonscan
- `npm run check:amoy:health` - Check network health
- `npm run gas` - Gas optimization analysis

### Testing
- `npm run test` - Run all tests
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Code linting
- `npm run lint:fix` - Fix linting issues

### Utilities
- `npm run clean` - Clean build artifacts
- `npm run size` - Check contract sizes

## Security Features

### Authentication & Authorization
- **SIWE Integration**: Sign-In with Ethereum authentication
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: 1000 requests per 15 minutes per IP
- **CORS Protection**: Configurable allowed origins
- **Input Validation**: Comprehensive request validation

### Security Headers
- **Helmet.js**: Security headers implementation
- **CSP**: Content Security Policy
- **HSTS**: HTTP Strict Transport Security
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME type sniffing protection

### Smart Contract Security
- **Access Control**: Role-based permissions
- **Input Validation**: Contract parameter validation
- **Gas Optimization**: Efficient transaction handling
- **Event Monitoring**: Real-time security monitoring

### Data Protection
- **Encryption**: AES-256 encryption for sensitive data
- **Privacy Compliance**: RGPD, ISO, APA, EFPA standards
- **Data Retention**: Configurable retention policies
- **Audit Logging**: Comprehensive audit trails

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Health Check

The server provides comprehensive health check endpoints:

### Basic Health Check (`/health`)
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "safepsy-did-backend",
  "version": "1.0.0",
  "network": "polygonAmoy",
  "uptime": "2d 5h 30m",
  "memory": {
    "used": "45.2MB",
    "free": "1.2GB"
  }
}
```

### Detailed Health Check (`/health/detailed`)
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "safepsy-did-backend",
  "version": "1.0.0",
  "network": "polygonAmoy",
  "database": {
    "mongodb": "connected",
    "redis": "connected"
  },
  "contracts": {
    "didRegistry": "0x...",
    "didStorage": "0x...",
    "network": "polygonAmoy"
  },
  "metrics": {
    "requests": 1234,
    "errors": 5,
    "uptime": "2d 5h 30m"
  }
}
```

## Monitoring and Observability

### Metrics Endpoint (`/metrics`)
Prometheus-compatible metrics endpoint for monitoring:
- Request counts and response times
- Error rates and status codes
- Database connection status
- Smart contract interaction metrics
- Memory and CPU usage

### Logging
- **Structured Logging**: JSON-formatted logs
- **Log Levels**: DEBUG, INFO, WARN, ERROR
- **Request Logging**: All API requests logged
- **Error Tracking**: Comprehensive error logging
- **Audit Logging**: Security and compliance logging

### Integration with Observability Stack
- **Prometheus**: Metrics collection
- **Grafana**: Visualization and dashboards
- **ELK Stack**: Log aggregation and analysis
- **Jaeger**: Distributed tracing
- **AlertManager**: Alert routing and management
