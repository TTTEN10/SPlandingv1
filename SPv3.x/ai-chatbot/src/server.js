const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const EventIndexingService = require('./services/EventIndexingService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
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
    service: 'ai-chatbot',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/chat', require('./src/routes/chat'));
app.use('/api/health', require('./src/routes/health'));
app.use('/api/did', require('./src/routes/did'));

// Error handling middleware
app.use((err, req, res, next) => {
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

// Initialize event indexing service
const eventIndexingService = new EventIndexingService();

// Start server
app.listen(PORT, async () => {
  console.log(`🤖 AI Chatbot service running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  
  // Initialize event indexing service
  try {
    console.log('🚀 Initializing DID Event Indexing Service...');
    await eventIndexingService.initialize();
    
    // Auto-start indexing if enabled
    if (process.env.AUTO_START_INDEXING === 'true') {
      await eventIndexingService.start();
    }
    
    console.log('✅ DID Event Indexing Service ready');
  } catch (error) {
    console.error('❌ Failed to initialize DID Event Indexing Service:', error);
    console.log('⚠️ Service will continue without event indexing');
  }
});

module.exports = app;
