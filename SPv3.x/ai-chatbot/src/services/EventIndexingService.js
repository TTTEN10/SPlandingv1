const DIDEventIndexer = require('./DIDEventIndexer');

class EventIndexingService {
  constructor() {
    this.indexer = new DIDEventIndexer();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      if (this.isInitialized) {
        console.log('⚠️ Event indexing service already initialized');
        return;
      }

      console.log('🚀 Initializing DID Event Indexing Service...');
      await this.indexer.initialize();
      this.isInitialized = true;
      console.log('✅ DID Event Indexing Service initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Event Indexing Service:', error);
      throw error;
    }
  }

  async start() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('🚀 Starting DID Event Indexing Service...');
      await this.indexer.startIndexing();
      console.log('✅ DID Event Indexing Service started successfully');
      
    } catch (error) {
      console.error('❌ Failed to start Event Indexing Service:', error);
      throw error;
    }
  }

  async stop() {
    try {
      console.log('🛑 Stopping DID Event Indexing Service...');
      await this.indexer.stopIndexing();
      console.log('✅ DID Event Indexing Service stopped successfully');
      
    } catch (error) {
      console.error('❌ Failed to stop Event Indexing Service:', error);
      throw error;
    }
  }

  getIndexer() {
    return this.indexer;
  }

  isRunning() {
    return this.indexer.isRunning;
  }
}

module.exports = EventIndexingService;
