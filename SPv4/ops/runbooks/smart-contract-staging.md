# SafePsy Smart Contract Staging & Testing Runbook

## Overview

This runbook provides comprehensive procedures for staging, testing, and deploying smart contracts in the SafePsy decentralized identity platform. The platform uses DID (Decentralized Identity) contracts deployed on Polygon networks.

## Smart Contract Architecture

### Core Contracts
- **DIDRegistry.sol**: Core DID management and registration
- **DIDStorage.sol**: Encrypted data storage and retrieval
- **IDIDRegistry.sol**: Registry interface definitions
- **IDIDStorage.sol**: Storage interface definitions

### Supported Networks
- **Polygon Amoy**: Primary testnet (Chain ID: 80002)
- **Polygon Mumbai**: Legacy testnet (Chain ID: 80001)
- **Polygon Mainnet**: Production network (Chain ID: 137)
- **Ethereum Sepolia**: Ethereum testnet (Chain ID: 11155111)

## Prerequisites

### Development Environment
- Node.js 18+
- npm 8+
- Hardhat 2.19+
- TypeScript 5+
- Git

### Required Tools
- MetaMask or Web3 wallet
- Polygon testnet tokens (MATIC)
- RPC endpoint access
- Polygonscan API key (for verification)

### Environment Setup
```bash
# Install dependencies
cd backend
npm install

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

## Staging Environment Setup

### Testnet Configuration

#### Polygon Amoy (Primary Testnet)
```bash
# Check network health
npm run check:amoy:health

# Get testnet MATIC
# Visit: https://faucet.polygon.technology/
# Select: Polygon Amoy Testnet
# Enter your wallet address
```

#### Fallback RPC Setup
```bash
# Configure fallback RPC in hardhat.config.ts
networks: {
  polygonAmoyFallback: {
    url: process.env.POLYGON_AMOY_FALLBACK_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 80002,
  }
}
```

### Staging Deployment Process

#### Step 1: Pre-Deployment Testing
```bash
# Compile contracts
npm run compile:did

# Run comprehensive tests
npm run test:did

# Run gas optimization tests
npm run gas

# Check contract sizes
npm run size
```

#### Step 2: Deploy to Staging
```bash
# Deploy to Polygon Amoy
npm run deploy:did:amoy

# Deploy with fallback RPC
npm run deploy:did:amoy:fallback

# Verify deployment
npm run verify:amoy
```

#### Step 3: Staging Verification
```bash
# Test contract functionality
npm run mint:did
npm run store:data

# Check contract state
npx hardhat console --network polygonAmoy
```

## Testing Procedures

### Unit Testing

#### Test Structure
```bash
# Run all DID tests
npm run test:did

# Run specific test files
npx hardhat test test/DIDRegistry.test.ts
npx hardhat test test/DIDStorage.test.ts

# Run with coverage
npm run test:coverage
```

#### Test Categories
- **Deployment Tests**: Contract deployment verification
- **Functionality Tests**: Core contract functions
- **Security Tests**: Access control and permissions
- **Gas Tests**: Gas optimization verification
- **Integration Tests**: Cross-contract interactions

### Integration Testing

#### Backend Integration
```bash
# Test contract integration
cd backend
npm run test:integration

# Test API endpoints
curl -X POST http://localhost:3000/api/did/create \
  -H "Content-Type: application/json" \
  -d '{"did":"did:polygon:test123"}'
```

#### Frontend Integration
```bash
# Test Web3 integration
cd frontend
npm run test:e2e

# Test wallet connection
npm run test:wallet
```

### Security Testing

#### Access Control Testing
```bash
# Test owner-only functions
npx hardhat test test/security/AccessControl.test.ts

# Test role-based permissions
npx hardhat test test/security/Roles.test.ts
```

#### Vulnerability Testing
```bash
# Run security analysis
npm audit

# Check for known vulnerabilities
npx hardhat verify --list

# Test reentrancy protection
npx hardhat test test/security/Reentrancy.test.ts
```

## Production Deployment

### Pre-Production Checklist
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Gas optimization verified
- [ ] Contract verification successful
- [ ] Documentation updated
- [ ] Emergency procedures defined

### Production Deployment Process

#### Step 1: Final Testing
```bash
# Run full test suite
npm run test

# Run security tests
npm run test:security

# Verify gas costs
npm run gas
```

#### Step 2: Deploy to Production
```bash
# Deploy to Polygon Mainnet
npm run deploy:did:polygon

# Verify on Polygonscan
npm run verify:polygon

# Update contract addresses
echo "DID_REGISTRY_ADDRESS=0x..." >> .env
echo "DID_STORAGE_ADDRESS=0x..." >> .env
```

#### Step 3: Post-Deployment Verification
```bash
# Test production contracts
npm run test:production

# Verify contract state
npx hardhat console --network polygon

# Check contract interactions
curl -X GET https://api.polygonscan.com/api?module=contract&action=getsourcecode&address=CONTRACT_ADDRESS&apikey=YOUR_API_KEY
```

## Contract Management

### Contract Upgrades

#### Proxy Pattern Implementation
```solidity
// Example upgradeable contract
contract DIDRegistryUpgradeable is Initializable, OwnableUpgradeable {
    function initialize() public initializer {
        __Ownable_init();
    }
    
    function upgrade(address newImplementation) external onlyOwner {
        // Upgrade logic
    }
}
```

#### Upgrade Process
```bash
# Deploy new implementation
npm run deploy:did:polygon

# Update proxy to new implementation
npx hardhat run scripts/upgrade-contract.ts --network polygon

# Verify upgrade
npm run verify:polygon
```

### Contract Monitoring

#### Event Monitoring
```bash
# Monitor contract events
npx hardhat console --network polygonAmoy
> const registry = await ethers.getContractAt("DIDRegistry", "CONTRACT_ADDRESS")
> registry.on("DIDRegistered", (did, owner) => console.log("DID Registered:", did, owner))
```

#### Health Checks
```bash
# Check contract health
npm run check:amoy:health

# Monitor gas usage
npm run gas:monitor

# Check contract state
npx hardhat run scripts/check-contract-state.ts --network polygonAmoy
```

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

#### Verification Failures
```bash
# Verify contract source
npm run verify:amoy

# Check constructor arguments
npx hardhat verify --constructor-args scripts/arguments.js CONTRACT_ADDRESS

# Verify with specific compiler version
npx hardhat verify --compiler-version 0.8.19 CONTRACT_ADDRESS
```

#### Test Failures
```bash
# Run tests with verbose output
npx hardhat test --verbose

# Run specific test
npx hardhat test test/DIDRegistry.test.ts --grep "should register DID"

# Debug test failures
npx hardhat test --debug
```

### Network Issues

#### RPC Endpoint Problems
```bash
# Test RPC connectivity
curl -X POST https://rpc-amoy.polygon.technology \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Switch to fallback RPC
npm run deploy:did:amoy:fallback
```

#### Gas Price Issues
```bash
# Check current gas prices
npx hardhat run scripts/check-gas-prices.ts --network polygonAmoy

# Adjust gas settings
# In hardhat.config.ts:
gasPrice: 30000000000, // 30 gwei
```

## Performance Optimization

### Gas Optimization

#### Contract Optimization
```solidity
// Use uint256 instead of uint8 for storage
uint256 public totalDIDs; // More gas efficient

// Pack structs efficiently
struct DIDData {
    address owner;      // 20 bytes
    uint32 timestamp;  // 4 bytes
    uint32 version;    // 4 bytes
    // Total: 32 bytes (1 slot)
}
```

#### Gas Testing
```bash
# Run gas analysis
npm run gas

# Optimize specific functions
npx hardhat test --gas-report --grep "registerDID"
```

### Contract Size Optimization

#### Size Reduction Techniques
```solidity
// Use libraries for common functions
library DIDUtils {
    function isValidDID(string memory did) internal pure returns (bool) {
        // Implementation
    }
}

// Use external functions when possible
function registerDID(string memory did) external onlyOwner {
    // Implementation
}
```

#### Size Monitoring
```bash
# Check contract sizes
npm run size

# Optimize contract size
npx hardhat compile --force
```

## Security Best Practices

### Access Control
- [ ] Implement role-based access control
- [ ] Use OpenZeppelin's AccessControl
- [ ] Implement multi-signature requirements for critical functions
- [ ] Regular access review and rotation

### Input Validation
- [ ] Validate all external inputs
- [ ] Implement proper error handling
- [ ] Use require statements for critical checks
- [ ] Implement circuit breakers for emergency stops

### Code Security
- [ ] Regular security audits
- [ ] Use established libraries (OpenZeppelin)
- [ ] Implement proper upgrade mechanisms
- [ ] Monitor for known vulnerabilities

## Monitoring and Alerting

### Contract Monitoring
```bash
# Set up contract monitoring
npm run monitor:contracts

# Configure alerts
# - Contract function failures
# - Unusual gas usage
# - Access control violations
# - Emergency function calls
```

### Event Monitoring
```bash
# Monitor critical events
npx hardhat run scripts/monitor-events.ts --network polygonAmoy

# Set up event-based alerts
# - DID registration events
# - Storage access events
# - Access control changes
```

## Documentation and Maintenance

### Contract Documentation
- [ ] Update contract comments
- [ ] Document function parameters
- [ ] Maintain deployment records
- [ ] Update API documentation

### Regular Maintenance
- [ ] Monthly security reviews
- [ ] Quarterly gas optimization
- [ ] Annual architecture review
- [ ] Continuous monitoring updates

## Emergency Procedures

### Contract Pause
```bash
# Emergency pause (if supported)
npx hardhat run scripts/pause-contract.ts --network polygon

# Verify pause
npx hardhat console --network polygon
> const registry = await ethers.getContractAt("DIDRegistry", "CONTRACT_ADDRESS")
> await registry.paused()
```

### Emergency Upgrade
```bash
# Deploy emergency fix
npm run deploy:did:polygon

# Execute emergency upgrade
npx hardhat run scripts/emergency-upgrade.ts --network polygon

# Verify emergency fix
npm run verify:polygon
```

## Contact Information

### Development Team
- **Smart Contract Lead**: contracts@safepsy.com
- **Security Team**: security@safepsy.com
- **DevOps Team**: devops@safepsy.com

### Emergency Contacts
- **On-Call Engineer**: +1-XXX-XXX-XXXX
- **Security Hotline**: security@safepsy.com
- **Executive Team**: exec@safepsy.com

---

**Last Updated**: $(date)
**Version**: 1.0
**Next Review**: $(date -d "+3 months")
**Approved By**: Smart Contract Lead
