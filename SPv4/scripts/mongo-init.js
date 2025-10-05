const { MongoClient } = require('mongodb');

// MongoDB initialization script
async function initializeDatabase() {
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db('safepsy');
        
        // Create collections with validation
        await db.createCollection('users', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['email', 'createdAt'],
                    properties: {
                        email: {
                            bsonType: 'string',
                            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
                        },
                        did: {
                            bsonType: 'string'
                        },
                        createdAt: {
                            bsonType: 'date'
                        },
                        updatedAt: {
                            bsonType: 'date'
                        }
                    }
                }
            }
        });
        
        await db.createCollection('sessions', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['userId', 'createdAt'],
                    properties: {
                        userId: {
                            bsonType: 'objectId'
                        },
                        createdAt: {
                            bsonType: 'date'
                        },
                        endedAt: {
                            bsonType: 'date'
                        }
                    }
                }
            }
        });
        
        await db.createCollection('conversations', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['userId', 'createdAt'],
                    properties: {
                        userId: {
                            bsonType: 'objectId'
                        },
                        messages: {
                            bsonType: 'array'
                        },
                        createdAt: {
                            bsonType: 'date'
                        },
                        updatedAt: {
                            bsonType: 'date'
                        }
                    }
                }
            }
        });
        
        // Create indexes
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('users').createIndex({ did: 1 }, { unique: true, sparse: true });
        await db.collection('sessions').createIndex({ userId: 1 });
        await db.collection('sessions').createIndex({ createdAt: 1 });
        await db.collection('conversations').createIndex({ userId: 1 });
        await db.collection('conversations').createIndex({ createdAt: 1 });
        
        console.log('Database initialized successfully');
        
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    } finally {
        await client.close();
    }
}

// Run initialization
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('MongoDB initialization completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('MongoDB initialization failed:', error);
            process.exit(1);
        });
}

module.exports = { initializeDatabase };
