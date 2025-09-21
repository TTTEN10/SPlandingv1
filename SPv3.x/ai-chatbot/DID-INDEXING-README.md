# SafePsy AI Chatbot - DID Event Indexing Service

This service provides AI-powered therapy assistance combined with real-time indexing and mirroring of DID (Decentralized Identity) events from the blockchain to a MongoDB database.

## Overview

The SafePsy AI Chatbot is a comprehensive service that combines intelligent therapy assistance with blockchain event processing. It provides both conversational AI capabilities and real-time DID event indexing for the SafePsy platform.

## Features

### AI Chatbot Capabilities
- **Intelligent Responses**: AI-powered therapy assistance
- **Privacy-First**: Encrypted conversations
- **Integration Ready**: RESTful API endpoints
- **Context Awareness**: Maintains conversation context
- **Therapy Guidelines**: Follows APA and EFPA standards

### DID Event Indexing
- **Real-time Event Listening**: Listens to DID Registry and DID Storage contract events
- **Historical Event Processing**: Processes past events for complete data synchronization
- **DID Pointer Mirroring**: Maintains a mirrored state of all DIDs in MongoDB
- **RESTful API**: Provides APIs to query events and DID pointers
- **Cron-based Sync**: Periodic synchronization to catch any missed events
- **TypeChain Integration**: Uses generated TypeScript types for type safety

## Architecture

### Core Components

1. **AI Chatbot Service**: Handles therapy conversations and AI responses
2. **DIDEventIndexer**: Core service that handles event processing
3. **EventIndexingService**: Wrapper service for initialization and management
4. **DIDModels**: MongoDB models for events and DID pointers
5. **API Routes**: REST endpoints for querying indexed data and chatbot interactions

### Data Flow

```
Blockchain Events → Event Indexer → MongoDB → API Endpoints
User Messages → AI Chatbot → Response Generation → API Endpoints
```

### Service Integration
- **Backend Integration**: Connects to SafePsy backend API
- **Database Integration**: MongoDB for conversation and event storage
- **Blockchain Integration**: Real-time event processing
- **AI Integration**: OpenAI API for intelligent responses

## Setup

### 1. Install Dependencies

```bash
npm install ethers node-cron mongoose
```

## Environment Configuration

Copy `did-indexing.env.example` to `.env` and configure:

```bash
cp did-indexing.env.example .env
```

Key configuration options:

```env
# Server Configuration
PORT=3001
NODE_ENV=production
BACKEND_URL=http://backend:3000

# AI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4
THERAPY_PROMPT=You are a professional therapist...

# Blockchain Configuration
RPC_URL=https://rpc-amoy.polygon.technology
DID_REGISTRY_ADDRESS=0x...
DID_STORAGE_ADDRESS=0x...

# Database Configuration
MONGODB_URI=mongodb://admin:safepsy_password@mongodb:27017/safepsy?authSource=admin

# Service Configuration
AUTO_START_INDEXING=true
ENABLE_CHATBOT=true
LOG_LEVEL=info
```

### 3. Start the Service

```bash
npm start
```

The service will:
1. Initialize MongoDB connection
2. Set up event listeners
3. Process historical events
4. Start real-time event monitoring

## API Endpoints

### AI Chatbot Endpoints

#### POST `/api/chat`
Send a message to the AI chatbot and receive a therapy-focused response.

**Request Body:**
```json
{
  "message": "I've been feeling anxious lately",
  "userId": "user123",
  "sessionId": "session456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "I understand that anxiety can be challenging. Let's explore some techniques that might help...",
    "sessionId": "session456",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "messageId": "msg789"
  }
}
```

#### GET `/api/chat/history/:userId`
Get conversation history for a user.

#### POST `/api/chat/session`
Start a new therapy session.

#### DELETE `/api/chat/session/:sessionId`
End a therapy session.

### Event Indexing Management

- `GET /api/did/health` - Check indexing service health
- `POST /api/did/start` - Start event indexing
- `POST /api/did/stop` - Stop event indexing

### Event Queries

- `GET /api/did/events` - Get DID events with filtering
- `GET /api/did/did/:didHash/events` - Get events for specific DID

### DID Pointer Queries

- `GET /api/did/pointers` - Get DID pointers (mirrored state)
- `GET /api/did/pointers/:didHash` - Get specific DID pointer
- `GET /api/did/owner/:owner` - Get DIDs by owner

### Statistics

- `GET /api/did/stats` - Get indexing statistics
- `GET /api/chat/stats` - Get chatbot usage statistics

## Event Types

The service indexes the following event types:

### DID Registry Events
- `DIDCreated`: New DID created
- `DIDUpdated`: DID document updated
- `DIDRevoked`: DID revoked
- `DIDTransferred`: DID ownership transferred
- `ControllerAdded`: Controller added to DID
- `ControllerRemoved`: Controller removed from DID

### DID Storage Events
- `DataStored`: Data stored for DID
- `DataUpdated`: Data updated for DID
- `DataDeleted`: Data deleted for DID
- `AccessGranted`: Access granted to data
- `AccessRevoked`: Access revoked from data

## DID Pointer Mirroring

The service maintains a mirrored state of all DIDs in the `DIDPointer` collection, which includes:

- DID metadata (hash, string, owner, document)
- Controller list
- Data type mappings
- Access control mappings
- Timestamps and activity status

This allows for fast queries without needing to reconstruct state from events.

## Monitoring

### Health Check

```bash
curl http://localhost:3001/api/did/health
```

### Statistics

```bash
curl http://localhost:3001/api/did/stats
```

## Error Handling

The service includes comprehensive error handling:

- Connection failures are retried with exponential backoff
- Event processing errors are logged but don't stop the service
- Database connection issues are handled gracefully
- Missing contract addresses are handled with warnings

## Performance Considerations

- Events are processed in batches for efficiency
- Database indexes are optimized for common query patterns
- Historical processing is limited to prevent overwhelming the RPC
- Cron jobs run every 5 minutes by default

## Troubleshooting

### Common Issues

1. **RPC Connection Errors**: Check RPC_URL configuration
2. **Contract Not Found**: Verify contract addresses are set
3. **MongoDB Connection**: Ensure MongoDB is running and accessible
4. **Missing Events**: Check if indexing is running and catch up manually

### Logs

The service provides detailed logging for:
- Event processing
- Database operations
- Error conditions
- Performance metrics

## Development

### Adding New Event Types

1. Add event handler in `DIDEventIndexer.js`
2. Update `DIDModels.js` schema if needed
3. Add API endpoints in `did.js` routes
4. Update TypeScript types in shared-types package

## Available Scripts

### Development
- `npm start` - Start production server
- `npm run dev` - Development mode with file watching
- `npm test` - Run tests
- `npm run lint` - Code linting

### Service Management
- `npm run start:indexing` - Start only event indexing
- `npm run start:chatbot` - Start only chatbot service
- `npm run stop:indexing` - Stop event indexing
- `npm run restart:indexing` - Restart event indexing

### Testing
- `npm test` - Run all tests
- `npm run test:chatbot` - Test chatbot functionality
- `npm run test:indexing` - Test event indexing
- `npm run test:integration` - Integration tests

## Production Deployment

1. Set `AUTO_START_INDEXING=true` in production
2. Configure proper RPC endpoints
3. Set up MongoDB replica set for high availability
4. Monitor service health and performance
5. Set up alerts for indexing failures
