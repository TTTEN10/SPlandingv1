import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'safepsy-did-backend',
    version: '1.0.0',
    network: process.env.NETWORK || 'unknown'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/did', didRoutes);
app.use('/api/storage', storageRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested resource was not found'
  });
});

// Initialize contracts
const initializeBackend = async () => {
  try {
    // Check required environment variables
    const requiredEnvVars = [
      'DID_REGISTRY_ADDRESS',
      'DID_STORAGE_ADDRESS',
      'PRIVATE_KEY',
      'RPC_URL'
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
