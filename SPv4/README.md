# SafePsy Platform v4 - Decentralized Identity Platform

## 🚀 Project Overview

SafePsy Platform v4 is the main application component of the SafePsy Global Platform, providing comprehensive decentralized identity management for secure therapy and mental health services. This platform includes advanced DID (Decentralized Identity) contracts, Polygon Amoy testnet integration, AI-powered therapy assistance, and enterprise-grade security features with full operational runbooks.

## 📁 Project Structure

```
SPv4/
├── ai-chatbot/          # AI-powered chatbot service with DID indexing
├── backend/             # Node.js/TypeScript backend API with smart contracts
├── frontend/            # React frontend application with shadcn/ui
├── apps/                # Additional applications
│   ├── web/             # Web application
│   └── api/             # API application
├── packages/             # Shared packages
│   └── shared-types/    # TypeScript types and contract ABIs
├── mcp-server/          # Shadcn MCP server for component management
├── ops/                 # Operational runbooks and procedures
│   └── runbooks/        # Comprehensive operational documentation
├── nginx/               # Nginx configuration
├── scripts/             # Deployment and utility scripts
├── shared-logger/       # Shared logging utilities
├── docker-compose.yml  # Production Docker orchestration
├── docker-compose.staging.yml  # Staging environment
└── docker-manage.sh    # Docker management script
```

## 🔧 Key Features

### DID Contracts
- **DIDRegistry.sol** - Core DID management contract
- **DIDStorage.sol** - Encrypted data storage contract
- **Comprehensive Testing** - Full test suite with coverage
- **Polygon Amoy Support** - Primary and fallback RPC endpoints
- **Production Ready** - Deployed on Polygon mainnet

### Backend Services
- **RESTful API** - Express.js with TypeScript
- **Web3 Integration** - Ethereum and Polygon support
- **Security Headers** - Comprehensive security implementation
- **Database Integration** - MongoDB with Redis caching
- **SIWE Authentication** - Sign-In with Ethereum
- **Event Indexing** - Real-time blockchain event processing

### Frontend Application
- **React Components** - Modern UI with responsive design
- **Web3 Wallet Integration** - MetaMask and WalletConnect support
- **DID Management** - User-friendly DID creation and management
- **Legal Pages** - Comprehensive Terms of Service and Privacy Policy
- **Shadcn/UI Integration** - Modern component library
- **MCP Server** - Programmatic component management

### AI Chatbot
- **Intelligent Responses** - AI-powered therapy assistance
- **Privacy-First** - Encrypted conversations
- **Integration Ready** - RESTful API endpoints
- **DID Event Indexing** - Real-time blockchain monitoring
- **MongoDB Integration** - Persistent conversation storage

### Operational Excellence
- **Comprehensive Runbooks** - Complete operational procedures
- **Docker Orchestration** - Production and staging environments
- **Monitoring Stack** - Prometheus, Grafana, ELK, Jaeger
- **Security Compliance** - RGPD, ISO, APA, EFPA standards
- **Automated Deployment** - CI/CD ready with rollback procedures

## 🌐 Network Support

### Testnets
- **Polygon Amoy** - Primary testnet (Chain ID: 80002)
- **Sepolia** - Ethereum testnet
- **Mumbai** - Legacy Polygon testnet

### Mainnets
- **Polygon** - Production deployment
- **Ethereum** - Mainnet support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git
- MetaMask or Web3 wallet
- Polygon testnet MATIC (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TTTEN10/SPglobalv1.git
   cd SPglobalv1/SPv4
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   
   # AI Chatbot
   cd ../ai-chatbot && npm install
   
   # MCP Server
   cd ../mcp-server && npm install
   
   # Shared Types
   cd ../packages/shared-types && npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment templates
   cp backend/env.example backend/.env
   cp ai-chatbot/env.example ai-chatbot/.env
   cp backend/polygon-amoy.env.example backend/.env
   
   # Update with your configuration
   # - Database URLs
   # - API keys
   # - Private keys (for blockchain)
   # - RPC endpoints
   ```

4. **Docker Deployment**
   ```bash
   # Production environment
   ./docker-manage.sh start production
   
   # Staging environment
   ./docker-manage.sh start staging
   
   # Check service health
   ./docker-manage.sh health production
   ```

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev          # Start development server
npm run test         # Run tests
npm run build        # Build for production
npm run compile:did  # Compile smart contracts
npm run test:did     # Test smart contracts
npm run deploy:did:amoy  # Deploy to Polygon Amoy
```

### Frontend Development
```bash
cd frontend
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
```

**Available Routes:**
- `/` - Home page with navigation
- `/tos` - Terms of Service
- `/security` - Privacy Policy & Security

### AI Chatbot Development
```bash
cd ai-chatbot
npm start            # Start chatbot service
npm test             # Run tests
npm run dev          # Development mode with file watching
```

### MCP Server Development
```bash
cd mcp-server
npm run dev          # Start with file watching
npm start            # Production mode
```

### Smart Contract Development
```bash
cd backend
npm run compile:did  # Compile DID contracts
npm run test:did     # Test DID contracts
npm run deploy:did:amoy  # Deploy to Polygon Amoy
npm run verify:amoy  # Verify contracts on Polygonscan
npm run check:amoy:health  # Check network health
```

## 📋 Available Scripts

### Docker Management
- `./docker-manage.sh start [production|staging]` - Start services
- `./docker-manage.sh stop [production|staging]` - Stop services
- `./docker-manage.sh restart [production|staging]` - Restart services
- `./docker-manage.sh build [production|staging]` - Build images
- `./docker-manage.sh logs [service]` - View logs
- `./docker-manage.sh health [production|staging]` - Health check
- `./docker-manage.sh backup [production|staging]` - Database backup

### DID Contracts
- `npm run deploy:did:amoy` - Deploy to Polygon Amoy
- `npm run deploy:did:amoy:fallback` - Deploy with fallback RPC
- `npm run deploy:did:polygon` - Deploy to Polygon mainnet
- `npm run check:amoy:health` - Check network health
- `npm run verify:amoy` - Verify contracts on Polygonscan
- `npm run test:did` - Run smart contract tests
- `npm run gas` - Gas optimization analysis

### Backend
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run test` - Run tests
- `npm run lint` - Code linting
- `npm run compile:did` - Compile smart contracts

### Frontend
- `npm start` - Development server
- `npm run build` - Production build
- `npm test` - Run tests
- `npm run lint` - Code linting

### AI Chatbot
- `npm start` - Production server
- `npm run dev` - Development with file watching
- `npm test` - Run tests

### MCP Server
- `npm start` - Production server
- `npm run dev` - Development with file watching

## 🔒 Security Features

- **Comprehensive Security Headers** - CSP, HSTS, X-Frame-Options
- **Rate Limiting** - API protection
- **Input Validation** - Request sanitization
- **Encrypted Storage** - DID data encryption
- **Access Control** - Role-based permissions
- **Privacy Compliance** - RGPD, ISO, APA, EFPA standards
- **Legal Framework** - Terms of Service and Privacy Policy

## 📊 Monitoring & Analytics

### Observability Stack
- **Prometheus** - Metrics collection and storage
- **Grafana** - Visualization and dashboards
- **ELK Stack** - Log aggregation (Elasticsearch, Logstash, Kibana)
- **Jaeger** - Distributed tracing
- **AlertManager** - Alert routing and management

### Health Checks
- Service availability monitoring
- Database connectivity checks
- Smart contract health verification
- Performance metrics tracking
- Security monitoring and alerting

### Operational Runbooks
- **[Deployment Runbook](./ops/runbooks/deploy.md)** - Complete deployment procedures
- **[Rollback Runbook](./ops/runbooks/rollback.md)** - Emergency and planned rollback
- **[Smart Contract Staging](./ops/runbooks/smart-contract-staging.md)** - Contract testing and deployment
- **[Shadcn MCP Server](./ops/runbooks/shadcn-mcp-server.md)** - MCP server operations
- **[Observability Boards](./ops/runbooks/observability-boards.md)** - Monitoring setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📋 Legal & Privacy

- **Terms of Service** - [www.safepsy.com/tos](/tos) - Comprehensive legal terms
- **Privacy Policy** - [www.safepsy.com/security](/security) - Data protection and security
- **Compliance** - RGPD, ISO, APA, EFPA standards
- **Smart Contract Security** - Advanced cryptographic protection

## 🆘 Support

### Documentation
- **Main Documentation** - This README and component-specific docs
- **API Documentation** - [Backend API README](./backend/API-README.md)
- **Legal Pages** - [Legal Pages Documentation](./frontend/LEGAL-PAGES-README.md)
- **DID Indexing** - [DID Event Indexing Service](./ai-chatbot/DID-INDEXING-README.md)
- **MCP Integration** - [Shadcn MCP Integration](./SHADCN_MCP_INTEGRATION.md)
- **Operational Runbooks** - [Operations Index](./ops/runbooks/OPERATIONS-README.md)
- **Shared Types** - [Shared Types Documentation](./packages/shared-types/SHARED-TYPES-README.md)

### Contact Information
- **General Support**: support@safepsy.com
- **Technical Issues**: tech@safepsy.com
- **Security Issues**: security@safepsy.com
- **Legal Inquiries**: legal@safepsy.com
- **Privacy Questions**: privacy@safepsy.com
- **Data Protection Officer**: dpo@safepsy.com

### Emergency Contacts
- **On-Call Engineer**: +1-XXX-XXX-XXXX
- **DevOps Lead**: devops@safepsy.com
- **Security Team**: security@safepsy.com
- **Executive Team**: exec@safepsy.com

### Communication Channels
- **GitHub Issues**: Report bugs and feature requests
- **GitHub Discussions**: Community discussions
- **Slack**: #safepsy-incidents (internal)
- **Status Page**: status.safepsy.com

## 🔗 Links

- **Repository** - https://github.com/TTTEN10/SPglobalv1
- **Documentation** - https://github.com/TTTEN10/SPglobalv1/docs
- **Issues** - https://github.com/TTTEN10/SPglobalv1/issues
- **Operational Runbooks** - https://github.com/TTTEN10/SPglobalv1/SPv4/ops/runbooks
- **Status Page** - https://status.safepsy.com
- **Website** - https://www.safepsy.com

---

**SafePsy** - Secure, Decentralized, Privacy-First Therapy Platform 🧠🔒

*Built with ❤️ for mental health professionals and their clients*