# SafePsy Frontend Application

## 🚀 Overview

The SafePsy Frontend is a React-based web application that provides the user interface for the SafePsy decentralized identity platform. Built with modern web technologies and privacy-by-design principles, it offers a secure and user-friendly experience for therapy and mental health services.

## 🛠 Tech Stack

### Core Technologies
- **React 18** - Modern React with concurrent features
- **TypeScript** - Full type safety implementation
- **Vite** - Fast development and building
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

### UI Components
- **shadcn/ui** - Modern component library
- **Lucide React** - Icon library
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library

### Web3 Integration
- **Ethers.js** - Ethereum library
- **MetaMask** - Wallet integration
- **WalletConnect** - Multi-wallet support
- **SIWE** - Sign-In with Ethereum

### Testing & Quality
- **Vitest** - Fast unit testing
- **React Testing Library** - Component testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── TermsOfService.tsx  # Legal terms page
│   │   ├── PrivacyPolicy.tsx   # Privacy & security page
│   │   ├── Footer.tsx          # Reusable footer
│   │   └── ...              # Other components
│   ├── contexts/           # React contexts
│   │   └── ThemeContext.tsx   # Theme management
│   ├── hooks/              # Custom React hooks
│   │   └── useWeb3.ts         # Web3 integration
│   ├── services/           # API services
│   │   └── didService.ts      # DID management
│   ├── utils/              # Utility functions
│   │   └── encryption.ts      # Client-side encryption
│   ├── types/              # TypeScript definitions
│   │   └── did.ts             # DID types
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vitest.config.ts        # Testing configuration
```

## 🔧 Key Features

### DID Management
- **DID Creation**: User-friendly DID creation interface
- **DID Resolution**: Display and manage existing DIDs
- **Document Updates**: Update DID documents
- **Access Control**: Manage DID controllers and permissions

### Web3 Integration
- **Wallet Connection**: MetaMask and WalletConnect support
- **SIWE Authentication**: Sign-In with Ethereum flow
- **Transaction Management**: Handle blockchain transactions
- **Network Switching**: Support for multiple networks

### Privacy & Security
- **Client-Side Encryption**: Encrypt data before transmission
- **Privacy Controls**: User-controlled privacy settings
- **Secure Storage**: Encrypted local storage
- **Consent Management**: Granular consent controls

### User Experience
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG AA compliance
- **Dark Mode**: Theme switching support
- **Loading States**: Smooth loading experiences

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- MetaMask or Web3 wallet
- Polygon testnet MATIC

### Installation

1. **Install dependencies**
   ```bash
   cd SPv4/frontend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   ```

3. **Configure environment**
   ```bash
   # .env
   VITE_API_URL=http://localhost:3000
   VITE_NETWORK=polygonAmoy
   VITE_CHAIN_ID=80002
   VITE_RPC_URL=https://rpc-amoy.polygon.technology
   VITE_DID_REGISTRY_ADDRESS=0x...
   VITE_DID_STORAGE_ADDRESS=0x...
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📋 Available Scripts

### Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run lint:fix          # Fix ESLint issues
npm run format            # Format with Prettier
npm run typecheck         # TypeScript type checking
```

### Testing
```bash
npm test                 # Run tests
npm run test:watch       # Watch mode testing
npm run test:coverage    # Run with coverage
npm run test:ui          # Run with UI
```

### Building
```bash
npm run build            # Production build
npm run build:analyze    # Analyze bundle size
npm run build:preview    # Preview build
```

## 🎨 Component Architecture

### UI Components
The application uses shadcn/ui components for consistent design:

```typescript
// Example component usage
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DIDCard({ did }: { did: DID }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{did.id}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => handleUpdate(did)}>
          Update DID
        </Button>
      </CardContent>
    </Card>
  )
}
```

### Web3 Integration
```typescript
// Custom hook for Web3 functionality
import { useWeb3 } from '@/hooks/useWeb3'

export function DIDManager() {
  const { account, connect, disconnect, isConnected } = useWeb3()
  
  return (
    <div>
      {isConnected ? (
        <p>Connected: {account}</p>
      ) : (
        <Button onClick={connect}>Connect Wallet</Button>
      )}
    </div>
  )
}
```

### State Management
```typescript
// Context for global state
import { createContext, useContext } from 'react'

interface AppContextType {
  user: User | null
  dids: DID[]
  setUser: (user: User | null) => void
  setDIDs: (dids: DID[]) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
```

## 🔒 Security Implementation

### Client-Side Encryption
```typescript
// Encrypt data before sending to server
import { encryptForDIDStorage } from '@/utils/encryption'

export async function storeData(data: any, userKey: string) {
  const encryptedData = encryptForDIDStorage(data, userKey)
  
  const response = await fetch('/api/storage/write', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      didHash: userDIDHash,
      dataType: 'profile',
      dataHash: encryptedData.hash,
      isEncrypted: true
    })
  })
  
  return response.json()
}
```

### Privacy Controls
```typescript
// Privacy settings management
export function PrivacySettings() {
  const [privacySettings, setPrivacySettings] = useState({
    ipHashing: false,
    analytics: false,
    cookies: false
  })
  
  return (
    <div>
      <Switch
        checked={privacySettings.ipHashing}
        onCheckedChange={(checked) => 
          setPrivacySettings(prev => ({ ...prev, ipHashing: checked }))
        }
      />
      <Label>Enable IP Hashing</Label>
    </div>
  )
}
```

## 🧪 Testing

### Component Testing
```typescript
// Example component test
import { render, screen } from '@testing-library/react'
import { DIDCard } from '@/components/DIDCard'

test('renders DID card with correct information', () => {
  const mockDID = {
    id: 'did:safepsy:123',
    document: '{"@context":"https://www.w3.org/ns/did/v1"}'
  }
  
  render(<DIDCard did={mockDID} />)
  
  expect(screen.getByText('did:safepsy:123')).toBeInTheDocument()
})
```

### Integration Testing
```typescript
// Test Web3 integration
import { renderHook } from '@testing-library/react'
import { useWeb3 } from '@/hooks/useWeb3'

test('useWeb3 hook connects to wallet', async () => {
  const { result } = renderHook(() => useWeb3())
  
  await act(async () => {
    await result.current.connect()
  })
  
  expect(result.current.isConnected).toBe(true)
})
```

## 🚀 Deployment

### Production Build
```bash
# Build for production
npm run build

# The build output will be in the 'dist' directory
# Serve with any static file server
```

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Configuration
```bash
# Production environment variables
VITE_API_URL=https://api.safepsy.com
VITE_NETWORK=polygon
VITE_CHAIN_ID=137
VITE_RPC_URL=https://polygon-rpc.com
VITE_DID_REGISTRY_ADDRESS=0x...
VITE_DID_STORAGE_ADDRESS=0x...
```

## 📊 Performance Optimization

### Code Splitting
```typescript
// Lazy load components
import { lazy, Suspense } from 'react'

const DIDManager = lazy(() => import('@/components/DIDManager'))

export function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DIDManager />
    </Suspense>
  )
}
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run build:analyze

# Check for unused dependencies
npx depcheck
```

## 🔧 Configuration

### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Wallet Connection Issues**
   ```bash
   # Clear browser cache and cookies
   # Ensure MetaMask is unlocked
   # Check network configuration
   ```

2. **Build Failures**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript Errors**
   ```bash
   # Run type checking
   npm run typecheck
   
   # Check for missing types
   npm install @types/react @types/react-dom
   ```

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

### Web3 Resources
- [Ethers.js Documentation](https://docs.ethers.org/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [SIWE Documentation](https://docs.login.xyz/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Development Guidelines
- Follow TypeScript strict mode
- Write tests for new components
- Use conventional commits
- Ensure accessibility compliance
- Maintain privacy-first principles

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🆘 Support

### Contact Information
- **Frontend Team**: frontend@safepsy.com
- **Technical Issues**: tech@safepsy.com
- **Security Issues**: security@safepsy.com

### Emergency Contacts
- **On-Call Engineer**: +1-XXX-XXX-XXXX
- **Technical Lead**: tech-lead@safepsy.com

---

**SafePsy Frontend** - Modern, Secure, User-Friendly Interface 🎨🔒