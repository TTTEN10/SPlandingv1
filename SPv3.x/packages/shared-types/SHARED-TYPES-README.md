# SafePsy Shared Types Package

## Overview

The SafePsy Shared Types package provides TypeScript type definitions, contract ABIs, and shared utilities across the SafePsy ecosystem. This package ensures type safety and consistency between frontend, backend, and smart contract interactions.

## Package Structure

```
packages/shared-types/
├── src/
│   ├── @openzeppelin/          # OpenZeppelin contract types
│   ├── contracts/              # SafePsy contract types
│   │   ├── DIDRegistry.ts      # DID Registry contract types
│   │   ├── DIDStorage.ts       # DID Storage contract types
│   │   └── interfaces/         # Contract interface types
│   ├── factories/              # Contract factory types
│   ├── common.ts               # Common type definitions
│   └── index.ts                # Main export file
├── abis/                       # Contract ABIs
│   ├── DIDRegistry.json        # DID Registry ABI
│   └── DIDStorage.json         # DID Storage ABI
├── dist/                       # Compiled JavaScript output
├── package.json                # Package configuration
└── tsconfig.json              # TypeScript configuration
```

## Features

### Type Safety
- **Contract Types**: Full TypeScript types for all smart contracts
- **Event Types**: Typed event definitions for blockchain events
- **Function Types**: Type-safe contract function calls
- **Parameter Validation**: Compile-time parameter checking

### Contract Integration
- **ABI Definitions**: Complete Application Binary Interfaces
- **Factory Types**: Contract factory type definitions
- **Interface Types**: Contract interface implementations
- **Event Filtering**: Typed event filtering capabilities

### Shared Utilities
- **Common Types**: Shared type definitions across services
- **Validation Types**: Input validation type definitions
- **API Types**: REST API type definitions
- **Error Types**: Standardized error type definitions

## Installation

### From NPM (if published)
```bash
npm install @safepsy/shared-types
```

### Local Development
```bash
cd packages/shared-types
npm install
npm run build
```

### Linking for Development
```bash
# In shared-types directory
npm link

# In other packages
npm link @safepsy/shared-types
```

## Usage

### Importing Types
```typescript
import {
  DIDRegistry,
  DIDStorage,
  DIDCreatedEvent,
  DIDUpdatedEvent,
  DIDPointer,
  DIDEvent
} from '@safepsy/shared-types';
```

### Contract Factory Usage
```typescript
import { DIDRegistry__factory } from '@safepsy/shared-types';

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const didRegistry = DIDRegistry__factory.connect(
  CONTRACT_ADDRESS,
  wallet
);

// Type-safe contract interaction
const tx = await didRegistry.createDID(
  "did:safepsy:123",
  JSON.stringify(didDocument)
);
```

### Event Handling
```typescript
import { DIDCreatedEvent } from '@safepsy/shared-types';

// Type-safe event listening
didRegistry.on("DIDCreated", (didHash: string, did: string, owner: string, event: DIDCreatedEvent) => {
  console.log(`DID created: ${did} by ${owner}`);
});
```

### API Types
```typescript
import { 
  CreateDIDRequest, 
  CreateDIDResponse,
  DIDResolutionResponse,
  ErrorResponse 
} from '@safepsy/shared-types';

// Type-safe API calls
const createDID = async (request: CreateDIDRequest): Promise<CreateDIDResponse> => {
  const response = await fetch('/api/did/mint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  
  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
};
```

## Available Scripts

### Development
- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Watch mode for development
- `npm run clean` - Clean build artifacts
- `npm run lint` - Code linting
- `npm run lint:fix` - Fix linting issues

### Testing
- `npm test` - Run tests
- `npm run test:watch` - Watch mode testing
- `npm run test:coverage` - Run tests with coverage

### Publishing
- `npm run prepublishOnly` - Build before publishing
- `npm publish` - Publish to NPM registry
- `npm run version` - Update version and create tag

## Type Definitions

### Contract Types

#### DIDRegistry Contract
```typescript
export interface DIDRegistry {
  createDID(did: string, document: string): Promise<ContractTransaction>;
  updateDID(didHash: string, newDocument: string): Promise<ContractTransaction>;
  revokeDID(didHash: string): Promise<ContractTransaction>;
  transferDID(didHash: string, newOwner: string): Promise<ContractTransaction>;
  addController(didHash: string, controller: string): Promise<ContractTransaction>;
  removeController(didHash: string, controller: string): Promise<ContractTransaction>;
  resolveDID(didHash: string): Promise<DIDResolutionResult>;
  getDIDOwner(didHash: string): Promise<string>;
  getDIDControllers(didHash: string): Promise<string[]>;
}
```

#### DIDStorage Contract
```typescript
export interface DIDStorage {
  storeData(didHash: string, dataType: string, dataHash: string): Promise<ContractTransaction>;
  updateData(didHash: string, dataType: string, newDataHash: string): Promise<ContractTransaction>;
  deleteData(didHash: string, dataType: string): Promise<ContractTransaction>;
  grantAccess(didHash: string, accessor: string, dataType: string): Promise<ContractTransaction>;
  revokeAccess(didHash: string, accessor: string, dataType: string): Promise<ContractTransaction>;
  readData(didHash: string, dataType: string): Promise<DataPointer>;
  checkAccess(didHash: string, accessor: string, dataType: string): Promise<boolean>;
}
```

### Event Types

#### DID Events
```typescript
export interface DIDCreatedEvent {
  didHash: string;
  did: string;
  owner: string;
  document: string;
  timestamp: number;
}

export interface DIDUpdatedEvent {
  didHash: string;
  newDocument: string;
  timestamp: number;
}

export interface DIDRevokedEvent {
  didHash: string;
  timestamp: number;
}

export interface DIDTransferredEvent {
  didHash: string;
  fromOwner: string;
  toOwner: string;
  timestamp: number;
}
```

#### Storage Events
```typescript
export interface DataStoredEvent {
  didHash: string;
  dataType: string;
  dataHash: string;
  timestamp: number;
}

export interface DataUpdatedEvent {
  didHash: string;
  dataType: string;
  newDataHash: string;
  timestamp: number;
}

export interface AccessGrantedEvent {
  didHash: string;
  accessor: string;
  dataType: string;
  timestamp: number;
}
```

### API Types

#### Request Types
```typescript
export interface CreateDIDRequest {
  did: string;
  document: string;
}

export interface UpdateDIDRequest {
  didHash: string;
  newDocument: string;
}

export interface StoreDataRequest {
  didHash: string;
  dataType: string;
  dataHash: string;
  isEncrypted: boolean;
}

export interface GrantAccessRequest {
  didHash: string;
  accessor: string;
  dataType: string;
}
```

#### Response Types
```typescript
export interface CreateDIDResponse {
  success: boolean;
  data: {
    didHash: string;
    did: string;
    transactionHash: string;
    blockNumber: number;
    gasUsed: string;
  };
}

export interface DIDResolutionResponse {
  success: boolean;
  data: {
    didHash: string;
    did: string;
    document: string;
    owner: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    controllers: string[];
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  timestamp: string;
}
```

### Common Types

#### DID Document
```typescript
export interface DIDDocument {
  "@context": string | string[];
  id: string;
  created?: string;
  updated?: string;
  controller?: string | string[];
  verificationMethod?: VerificationMethod[];
  authentication?: string | VerificationMethod[];
  assertionMethod?: string | VerificationMethod[];
  keyAgreement?: string | VerificationMethod[];
  capabilityInvocation?: string | VerificationMethod[];
  capabilityDelegation?: string | VerificationMethod[];
  service?: Service[];
}

export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyMultibase?: string;
  publicKeyJwk?: JsonWebKey;
}

export interface Service {
  id: string;
  type: string;
  serviceEndpoint: string | string[];
}
```

#### Data Types
```typescript
export interface DIDPointer {
  didHash: string;
  did: string;
  owner: string;
  document: string;
  controllers: string[];
  dataTypes: string[];
  accessControl: Record<string, string[]>;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface DataPointer {
  didHash: string;
  dataType: string;
  dataHash: string;
  timestamp: string;
  isEncrypted: boolean;
  authorizedAccessors: string[];
}

export interface DIDEvent {
  id: string;
  type: string;
  didHash: string;
  data: any;
  timestamp: string;
  blockNumber: number;
  transactionHash: string;
}
```

## Configuration

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Package Configuration
```json
{
  "name": "@safepsy/shared-types",
  "version": "1.0.0",
  "description": "Shared TypeScript types for SafePsy platform",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist", "abis"],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "ethers": "^6.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
```

## Integration Examples

### Backend Integration
```typescript
// backend/src/types/index.ts
import { 
  DIDRegistry, 
  DIDStorage, 
  CreateDIDRequest,
  CreateDIDResponse 
} from '@safepsy/shared-types';

export class DIDService {
  private didRegistry: DIDRegistry;
  private didStorage: DIDStorage;

  async createDID(request: CreateDIDRequest): Promise<CreateDIDResponse> {
    const tx = await this.didRegistry.createDID(request.did, request.document);
    const receipt = await tx.wait();
    
    return {
      success: true,
      data: {
        didHash: receipt.logs[0].topics[1],
        did: request.did,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      }
    };
  }
}
```

### Frontend Integration
```typescript
// frontend/src/services/didService.ts
import { 
  DIDRegistry__factory,
  CreateDIDRequest,
  CreateDIDResponse 
} from '@safepsy/shared-types';

export class DIDService {
  private contract: DIDRegistry;

  async createDID(request: CreateDIDRequest): Promise<CreateDIDResponse> {
    try {
      const tx = await this.contract.createDID(request.did, request.document);
      const receipt = await tx.wait();
      
      return {
        success: true,
        data: {
          didHash: receipt.logs[0].topics[1],
          did: request.did,
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
```

## Maintenance

### Version Management
- **Semantic Versioning**: Follow semver for version updates
- **Breaking Changes**: Major version bumps for breaking changes
- **Feature Additions**: Minor version bumps for new features
- **Bug Fixes**: Patch version bumps for bug fixes

### Update Procedures
1. **Update Types**: Modify type definitions as needed
2. **Update Tests**: Ensure all types are properly tested
3. **Build Package**: Compile TypeScript to JavaScript
4. **Version Bump**: Update package version
5. **Publish**: Publish to NPM registry
6. **Update Dependencies**: Update consuming packages

### Quality Assurance
- **Type Coverage**: Ensure 100% type coverage
- **Documentation**: Keep documentation current
- **Testing**: Comprehensive test coverage
- **Linting**: Consistent code style

## Contact Information

### Development Team
- **Types Lead**: types@safepsy.com
- **Backend Team**: backend@safepsy.com
- **Frontend Team**: frontend@safepsy.com

### Emergency Contacts
- **On-Call Engineer**: +1-XXX-XXX-XXXX
- **Technical Lead**: tech-lead@safepsy.com
- **Package Manager**: packages@safepsy.com

---

**Last Updated**: $(date)
**Version**: 1.0
**Next Review**: $(date -d "+3 months")
**Approved By**: Types Lead
