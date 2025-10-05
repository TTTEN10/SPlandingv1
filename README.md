# SafePsy Global Platform (SPglobalv1)

## 🚀 Project Overview

SafePsy Global Platform is a comprehensive decentralized identity-based therapy and mental health platform that combines cutting-edge blockchain technology with AI-powered therapy assistance. The platform implements privacy-by-design principles, enterprise-grade security, and full compliance with international data protection regulations.

## 📁 Project Structure

```
SPglobalv1/
├── SPlandingv1/                    # Landing page and marketing site
│   └── safepsy-landing/            # Production-ready landing page
│       ├── apps/                   # Applications workspace
│       │   ├── web/                # Vite + React + TypeScript frontend
│       │   └── api/               # Express + TypeScript backend
│       ├── frontend/              # Legacy frontend (reference)
│       ├── backend/               # Legacy backend (reference)
│       ├── tests/                 # Integration tests
│       └── public/                # Shared static assets
├── SPv4/                          # Main platform application
│   ├── ai-chatbot/               # AI-powered therapy assistant
│   ├── backend/                  # Node.js/TypeScript backend with smart contracts
│   ├── frontend/                 # React frontend with shadcn/ui
│   ├── apps/                     # Additional applications
│   │   ├── web/                  # Web application
│   │   └── api/                  # API application
│   ├── packages/                 # Shared packages
│   │   └── shared-types/         # TypeScript types and contract ABIs
│   ├── mcp-server/              # Shadcn MCP server for component management
│   ├── ops/                      # Operational runbooks and procedures
│   │   └── runbooks/            # Comprehensive operational documentation
│   ├── nginx/                    # Nginx configuration
│   ├── scripts/                  # Deployment and utility scripts
│   └── shared-logger/           # Shared logging utilities
├── PRIVACY-BY-DESIGN.md          # Privacy implementation guide
└── README.md                     # This file
```

## 🔧 Key Features

### 🌐 Landing Page (SPlandingv1)
- **Modern Web Stack**: Vite + React 18 + TypeScript + Tailwind CSS
- **Privacy by Design**: Default OFF IP hashing, configurable privacy protection
- **Accessibility**: WCAG AA compliant with semantic HTML and ARIA labels
- **Testing**: Comprehensive test coverage with Vitest and React Testing Library
- **Analytics**: Optional Plausible integration (privacy-friendly)
- **Security**: Rate limiting, input validation, and secure headers

### 🧠 Main Platform (SPv4)
- **DID Contracts**: DIDRegistry.sol and DIDStorage.sol for decentralized identity management
- **AI Chatbot**: Intelligent therapy assistance with DID event indexing
- **Backend API**: RESTful API with smart contract integration and SIWE authentication
- **Frontend**: React application with shadcn/ui components and Web3 integration
- **Shared Types**: TypeScript type definitions and contract ABIs
- **MCP Server**: Shadcn component management server
- **Operational Excellence**: Comprehensive runbooks and monitoring

### 🔒 Security & Privacy
- **Encryption**: AES-256-GCM encryption for all client data
- **DID-Based Access Control**: Decentralized identity-based permissions
- **Privacy by Design**: Built-in privacy protections throughout the system
- **Compliance**: GDPR, HIPAA, ISO 27001, APA, and EFPA standards
- **Consent Management**: Granular consent controls with withdrawal mechanisms

## 🌐 Network Support

### Testnets
- **Polygon Amoy**: Primary testnet (Chain ID: 80002)
- **Ethereum Sepolia**: Ethereum testnet (Chain ID: 11155111)
- **Polygon Mumbai**: Legacy Polygon testnet (Chain ID: 80001)

### Mainnets
- **Polygon**: Production deployment (Chain ID: 137)
- **Ethereum**: Mainnet support (Chain ID: 1)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Git
- MetaMask or Web3 wallet
- Polygon testnet MATIC (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SPglobalv1
   ```

2. **Set up Landing Page (SPlandingv1)**
   ```bash
   cd SPlandingv1/safepsy-landing
   npm install
   cd apps/web && npm install
   cd ../api && npm install
   
   # Set up environment variables
   cp env.example .env
   cp apps/web/env.example apps/web/.env
   cp apps/api/env.example apps/api/.env
   
   # Initialize database
   cd apps/api
   npx prisma generate
   npx prisma db push
   ```

3. **Set up Main Platform (SPv4)**
   ```bash
   cd SPv4
   
   # Install dependencies for all components
   cd backend && npm install
   cd ../frontend && npm install
   cd ../ai-chatbot && npm install
   cd ../mcp-server && npm install
   cd ../packages/shared-types && npm install
   
   # Set up environment variables
   cp backend/env.example backend/.env
   cp ai-chatbot/env.example ai-chatbot/.env
   cp backend/polygon-amoy.env.example backend/.env
   ```

4. **Start Development Servers**

   **Landing Page:**
   ```bash
   cd SPlandingv1/safepsy-landing
   npm run dev
   # Frontend: http://localhost:3000
   # Backend: http://localhost:3001
   ```

   **Main Platform:**
   ```bash
   cd SPv4
   
   # Backend
   cd backend && npm run dev
   
   # Frontend
   cd ../frontend && npm start
   
   # AI Chatbot
   cd ../ai-chatbot && npm start
   ```

### Docker Deployment

**Landing Page:**
```bash
cd SPlandingv1/safepsy-landing
docker-compose up --build
```

**Main Platform:**
```bash
cd SPv4
./docker-manage.sh start production
```

## 📋 Available Scripts

### Landing Page (SPlandingv1/safepsy-landing)
```bash
npm run dev              # Start both frontend and backend
npm run build            # Build both applications
npm run test             # Run all tests
npm run lint             # Lint all code
npm run format           # Format all code
npm run typecheck        # Type check all code
```

### Main Platform (SPv4)
```bash
# Backend
cd backend
npm run dev              # Development server
npm run build            # Production build
npm run test             # Run tests
npm run compile:did      # Compile smart contracts
npm run deploy:did:amoy  # Deploy to Polygon Amoy

# Frontend
cd frontend
npm start                # Development server
npm run build            # Production build
npm test                 # Run tests

# AI Chatbot
cd ai-chatbot
npm start                # Production server
npm run dev              # Development with file watching
npm test                 # Run tests

# MCP Server
cd mcp-server
npm start                # Production server
npm run dev              # Development with file watching
```

## 🔒 Security Features

### Authentication & Authorization
- **SIWE Integration**: Sign-In with Ethereum authentication
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: API protection and abuse prevention
- **CORS Protection**: Configurable allowed origins
- **Input Validation**: Comprehensive request validation

### Data Protection
- **AES-256-GCM Encryption**: All client data encrypted
- **DID-Based Access Control**: Decentralized identity-based permissions
- **Privacy by Design**: Built-in privacy protections
- **Consent Management**: Granular consent controls
- **Audit Logging**: Comprehensive audit trails

### Smart Contract Security
- **Access Control**: Role-based permissions
- **Input Validation**: Contract parameter validation
- **Gas Optimization**: Efficient transaction handling
- **Event Monitoring**: Real-time security monitoring

## 📊 Monitoring & Analytics

### Observability Stack
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **ELK Stack**: Log aggregation (Elasticsearch, Logstash, Kibana)
- **Jaeger**: Distributed tracing
- **AlertManager**: Alert routing and management

### Health Checks
- Service availability monitoring
- Database connectivity checks
- Smart contract health verification
- Performance metrics tracking
- Security monitoring and alerting

## 📚 Documentation

### Core Documentation
- **[Landing Page README](./SPlandingv1/safepsy-landing/README.md)** - Landing page documentation
- **[Main Platform README](./SPv4/README.md)** - Main platform documentation
- **[Privacy by Design](./PRIVACY-BY-DESIGN.md)** - Privacy implementation guide

### Component Documentation
- **[API Documentation](./SPv4/backend/API-README.md)** - Backend API documentation
- **[Smart Contracts](./SPv4/backend/SMART-CONTRACTS-README.md)** - Smart contract documentation
- **[AI Chatbot](./SPv4/ai-chatbot/DID-INDEXING-README.md)** - AI chatbot and DID indexing
- **[Shared Types](./SPv4/packages/shared-types/SHARED-TYPES-README.md)** - Shared TypeScript types
- **[Operations](./SPv4/ops/runbooks/OPERATIONS-README.md)** - Operational runbooks

### Security & Compliance
- **[Security Documentation](./SPv4/SECURITY.md)** - Security architecture and implementation
- **[DPIA](./SPv4/DPIA-SafePsy-Platform.md)** - Data Protection Impact Assessment
- **[Encryption Summary](./SPv4/ENCRYPTION-IMPLEMENTATION-SUMMARY.md)** - Encryption implementation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Write tests for new features
- Use conventional commits
- Ensure accessibility compliance
- Maintain privacy-first principles
- **Privacy by Design**: Default to maximum privacy protection
- **Test Privacy Features**: Include tests for both enabled/disabled privacy modes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

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

- **Repository**: https://github.com/TTTEN10/SPglobalv1
- **Documentation**: https://github.com/TTTEN10/SPglobalv1/docs
- **Issues**: https://github.com/TTTEN10/SPglobalv1/issues
- **Status Page**: https://status.safepsy.com
- **Website**: https://www.safepsy.com

---

**SafePsy Global Platform** - Secure, Decentralized, Privacy-First Therapy Platform 🧠🔒

*Built with ❤️ for mental health professionals and their clients*
