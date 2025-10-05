# SafePsy Smart Contracts Documentation

## Overview

SafePsy smart contracts provide the foundational infrastructure for decentralized identity management in the therapy and mental health domain. The contracts implement DID (Decentralized Identity) standards with enhanced security, privacy, and compliance features.

## Contract Architecture

### Core Contracts

#### DIDRegistry.sol
The primary contract for managing Decentralized Identities (DIDs).

**Key Features:**
- DID creation, update, and revocation
- Controller management and access control
- DID ownership transfer
- Event emission for off-chain indexing
- Gas optimization and security measures

**Main Functions:**
- `createDID(string memory did, string memory document)` - Create new DID
- `updateDID(bytes32 didHash, string memory newDocument)` - Update DID document
- `revokeDID(bytes32 didHash)` - Revoke DID
- `transferDID(bytes32 didHash, address newOwner)` - Transfer ownership
- `addController(bytes32 didHash, address controller)` - Add controller
- `removeController(bytes32 didHash, address controller)` - Remove controller

#### DIDStorage.sol
Contract for encrypted data storage and access control.

**Key Features:**
- Encrypted data pointer storage
- Access control and permissions
- Data type management
- Audit trails and event logging
- Privacy-preserving data sharing

**Main Functions:**
- `storeData(bytes32 didHash, string memory dataType, bytes32 dataHash)` - Store data pointer
- `updateData(bytes32 didHash, string memory dataType, bytes32 newDataHash)` - Update data
- `deleteData(bytes32 didHash, string memory dataType)` - Delete data
- `grantAccess(bytes32 didHash, address accessor, string memory dataType)` - Grant access
- `revokeAccess(bytes32 didHash, address accessor, string memory dataType)` - Revoke access

### Interface Contracts

#### IDIDRegistry.sol
Interface defining the DID Registry contract functions.

#### IDIDStorage.sol
Interface defining the DID Storage contract functions.

## Security Features

### Access Control
- **Role-based Access**: Owner and controller roles
- **Multi-signature Support**: Multiple controllers per DID
- **Permission Management**: Granular access control
- **Ownership Transfer**: Secure ownership changes

### Data Protection
- **Encryption**: AES-256 encryption for sensitive data
- **Hash Storage**: Only encrypted hashes stored on-chain
- **Privacy Preservation**: Zero-knowledge proof support
- **Data Isolation**: Separate storage per DID

### Smart Contract Security
- **Reentrancy Protection**: Guard against reentrancy attacks
- **Input Validation**: Comprehensive parameter validation
- **Gas Optimization**: Efficient gas usage patterns
- **Upgrade Safety**: Immutable core functionality

## Network Support

### Testnets
- **Polygon Amoy**: Primary testnet (Chain ID: 80002)
- **Ethereum Sepolia**: Ethereum testnet (Chain ID: 11155111)
- **Polygon Mumbai**: Legacy Polygon testnet (Chain ID: 80001)

### Mainnets
- **Polygon**: Production deployment (Chain ID: 137)
- **Ethereum**: Mainnet support (Chain ID: 1)

## Deployment Procedures

### Prerequisites
- Node.js 18+
- Hardhat 2.19+
- TypeScript 5+
- MetaMask or Web3 wallet
- Testnet tokens (MATIC)

### Environment Setup
```bash
# Copy environment template
cp polygon-amoy.env.example .env

# Configure environment variables
cat > .env << EOF
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
POLYGON_AMOY_FALLBACK_RPC_URL=https://polygon-amoy.infura.io/v3/YOUR_PROJECT_ID
POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your_private_key_here
POLYGONSCAN_API_KEY=your_polygonscan_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
EOF
```

### Compilation
```bash
# Compile contracts
npm run compile:did

# Check for compilation errors
npx hardhat compile --force
```

### Testing
```bash
# Run all tests
npm run test:did

# Run with coverage
npm run test:coverage

# Run gas analysis
npm run gas
```

### Deployment

#### Polygon Amoy Testnet
```bash
# Deploy to Polygon Amoy
npm run deploy:did:amoy

# Deploy with fallback RPC
npm run deploy:did:amoy:fallback

# Verify contracts
npm run verify:amoy
```

#### Polygon Mainnet
```bash
# Deploy to Polygon mainnet
npm run deploy:did:polygon

# Verify on Polygonscan
npm run verify:polygon
```

## Available Scripts

### Compilation
- `npm run compile:did` - Compile DID contracts
- `npm run clean` - Clean build artifacts
- `npm run size` - Check contract sizes

### Testing
- `npm run test:did` - Test smart contracts
- `npm run test:coverage` - Run tests with coverage
- `npm run gas` - Gas optimization analysis

### Deployment
- `npm run deploy:did:amoy` - Deploy to Polygon Amoy
- `npm run deploy:did:amoy:fallback` - Deploy with fallback RPC
- `npm run deploy:did:polygon` - Deploy to Polygon mainnet
- `npm run deploy:did:sepolia` - Deploy to Ethereum Sepolia

### Verification
- `npm run verify:amoy` - Verify contracts on Polygonscan
- `npm run verify:polygon` - Verify on Polygon mainnet
- `npm run verify:sepolia` - Verify on Ethereum Sepolia

### Utilities
- `npm run check:amoy:health` - Check network health
- `npm run console` - Hardhat console
- `npm run node` - Start local Hardhat node

## Contract Interaction

### Using TypeChain
```typescript
import { DIDRegistry__factory } from './typechain-types';

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const didRegistry = DIDRegistry__factory.connect(
  CONTRACT_ADDRESS,
  wallet
);

// Create a new DID
const tx = await didRegistry.createDID(
  "did:safepsy:123",
  JSON.stringify({
    "@context": "https://www.w3.org/ns/did/v1",
    "id": "did:safepsy:123"
  })
);

await tx.wait();
```

### Event Listening
```typescript
// Listen for DID creation events
didRegistry.on("DIDCreated", (didHash, did, owner, event) => {
  console.log(`DID created: ${did} by ${owner}`);
});

// Listen for DID updates
didRegistry.on("DIDUpdated", (didHash, newDocument, event) => {
  console.log(`DID updated: ${didHash}`);
});
```

## Gas Optimization

### Contract Optimization
- **Packed Structs**: Efficient storage layout
- **Batch Operations**: Multiple operations in single transaction
- **Event Optimization**: Minimal event data
- **Function Optimization**: Efficient function implementations

### Gas Analysis
```bash
# Run gas analysis
npm run gas

# Check specific function gas usage
npx hardhat test --gas-report --grep "createDID"
```

## Monitoring and Maintenance

### Contract Monitoring
- **Event Monitoring**: Real-time event tracking
- **Gas Usage**: Transaction cost monitoring
- **Error Tracking**: Failed transaction analysis
- **Performance Metrics**: Response time monitoring

### Health Checks
```bash
# Check network health
npm run check:amoy:health

# Verify contract state
npx hardhat console --network polygonAmoy
```

### Maintenance Procedures
- **Regular Audits**: Security and performance reviews
- **Gas Optimization**: Continuous optimization efforts
- **Upgrade Planning**: Future enhancement planning
- **Documentation Updates**: Keep documentation current

## Compliance and Standards

### DID Standards
- **W3C DID Core**: Core DID specification compliance
- **DID Resolution**: Standard resolution methods
- **DID Document**: Standard document format
- **DID Methods**: Custom DID method implementation

### Privacy Compliance
- **RGPD**: European data protection compliance
- **ISO 27001**: Information security management
- **APA Guidelines**: American Psychological Association
- **EFPA Standards**: European Federation of Psychologists

### Security Standards
- **Smart Contract Security**: Industry best practices
- **Access Control**: Role-based security
- **Data Encryption**: Strong encryption standards
- **Audit Trails**: Comprehensive logging

## Troubleshooting

### Common Issues

#### Deployment Failures
```bash
# Check network connectivity
npm run check:amoy:health

# Verify gas limits
npx hardhat test --gas-report

# Check contract size
npm run size
```

#### Verification Issues
```bash
# Verify with specific compiler version
npx hardhat verify --compiler-version 0.8.19 CONTRACT_ADDRESS

# Check constructor arguments
npx hardhat verify --constructor-args scripts/arguments.js CONTRACT_ADDRESS
```

#### Test Failures
```bash
# Run tests with verbose output
npx hardhat test --verbose

# Debug specific test
npx hardhat test --debug test/DIDRegistry.test.ts
```

## Development Guidelines

### Code Standards
- **Solidity Style**: Follow Solidity style guide
- **Documentation**: Comprehensive NatSpec comments
- **Testing**: 100% test coverage target
- **Security**: Security-first development approach

### Best Practices
- **Input Validation**: Validate all external inputs
- **Error Handling**: Comprehensive error management
- **Gas Efficiency**: Optimize for gas usage
- **Security**: Regular security reviews

## Contact Information

### Development Team
- **Smart Contract Lead**: contracts@safepsy.com
- **Security Team**: security@safepsy.com
- **DevOps Team**: devops@safepsy.com

### Emergency Contacts
- **On-Call Engineer**: +1-XXX-XXX-XXXX
- **Security Hotline**: security@safepsy.com
- **Technical Lead**: tech-lead@safepsy.com

---

**Last Updated**: $(date)
**Version**: 1.0
**Next Review**: $(date -d "+3 months")
**Approved By**: Smart Contract Lead
