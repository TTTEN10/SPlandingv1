import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Import all middleware
import {
  // Authentication middleware
  authenticateToken,
  walletAuth,
  verifyWalletToken,
  requireWalletAuth,
  
  // DID verification middleware
  verifyDIDFormat,
  verifyDIDOwnership,
  requireDIDVerification,
  
  // Validation middleware
  handleValidationErrors,
  validateEthereumAddress,
  validateDIDString,
  validateJSONDocument,
  sanitizeInput,
  validateContentType,
  validateRequestSize,
  
  // Rate limiting middleware
  rateLimitPerIP,
  rateLimitPerDID,
  rateLimitCombined,
  authRateLimit,
  didOperationRateLimit,
  storageRateLimit,
  
  // Error handling
  errorHandler,
  notFoundHandler
} from './middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import didRoutes, { initializeContracts } from './routes/did.routes';
import storageRoutes, { initializeStorageContracts } from './routes/storage.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet());
app.use(compression());

// Content type validation
app.use(validateContentType(['application/json']));

// Request size validation (10MB max)
app.use(validateRequestSize(10 * 1024 * 1024));

// Input sanitization
app.use(sanitizeInput);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiting
app.use(rateLimitPerIP({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later.'
}));

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'safepsy-did-backend',
    version: '1.0.0',
    network: process.env.NETWORK || 'unknown'
  });
});

// Authentication routes with specific rate limiting
app.use('/api/auth', 
  authRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 auth attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later.'
  }),
  authRoutes
);

// DID routes with DID-specific rate limiting
app.use('/api/did',
  didOperationRateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 DID operations per minute
    message: 'Too many DID operations, please try again later.'
  }),
  didRoutes
);

// Storage routes with storage-specific rate limiting
app.use('/api/storage',
  storageRateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50, // 50 storage operations per 5 minutes
    message: 'Too many storage operations, please try again later.'
  }),
  storageRoutes
);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use(notFoundHandler);

// Initialize contracts
const initializeBackend = async () => {
  try {
    // Check required environment variables
    const requiredEnvVars = [
      'DID_REGISTRY_ADDRESS',
      'DID_STORAGE_ADDRESS',
      'PRIVATE_KEY',
      'RPC_URL',
      'JWT_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars);
      console.log('Please check your .env file');
      process.exit(1);
    }

    // Initialize DID Registry contract
    initializeContracts(
      process.env.DID_REGISTRY_ADDRESS!,
      process.env.PRIVATE_KEY!,
      process.env.RPC_URL!
    );

    // Initialize DID Storage contract
    initializeStorageContracts(
      process.env.DID_STORAGE_ADDRESS!,
      process.env.PRIVATE_KEY!,
      process.env.RPC_URL!
    );

    console.log('✅ Backend initialization completed');
  } catch (error) {
    console.error('❌ Failed to initialize backend:', error);
    process.exit(1);
  }
};

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 SafePsy DID Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 Network: ${process.env.NETWORK || 'unknown'}`);
  
  // Initialize contracts
  await initializeBackend();
  
  console.log('✅ SafePsy DID Backend ready');
});

export default app;
