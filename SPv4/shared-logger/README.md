# SafePsy Shared Logger

## 🚀 Overview

The SafePsy Shared Logger is a centralized logging utility that provides consistent, privacy-aware logging across all SafePsy services. It implements privacy-by-design principles with configurable IP hashing and comprehensive audit logging capabilities.

## 🛠 Tech Stack

### Core Technologies
- **Node.js** - JavaScript runtime
- **Winston** - Logging library
- **Morgan** - HTTP request logger
- **Crypto** - Built-in Node.js crypto module

### Privacy Features
- **IP Hashing**: Configurable IP address hashing
- **Privacy by Design**: Default OFF for maximum privacy
- **Audit Logging**: Comprehensive audit trails
- **Data Anonymization**: Sensitive data protection

## 📁 Project Structure

```
shared-logger/
├── src/
│   ├── index.js           # Main logger module
│   ├── logger.js          # Logger configuration
│   ├── middleware.js      # Express middleware
│   ├── privacy.js         # Privacy utilities
│   └── formatters.js      # Log formatters
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## 🔧 Key Features

### Logging Levels
- **ERROR**: Error conditions
- **WARN**: Warning conditions
- **INFO**: Informational messages
- **DEBUG**: Debug-level messages
- **HTTP**: HTTP request logging

### Privacy Features
- **IP Hashing**: SHA-256 hashing with salt
- **Privacy by Design**: Default OFF IP hashing
- **Configurable Privacy**: Environment-based privacy settings
- **Audit Trails**: Complete request and action logging

### Output Formats
- **JSON**: Structured JSON logging
- **Console**: Human-readable console output
- **File**: File-based logging
- **Remote**: Remote logging support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

1. **Install dependencies**
   ```bash
   cd SPv4/shared-logger
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # .env
   LOG_LEVEL=info
   LOG_FORMAT=json
   LOG_FILE=./logs/app.log
   
   # Privacy settings
   IP_HASHING_ENABLED=false
   IP_SALT=your-secure-salt
   ```

3. **Use in your application**
   ```javascript
   const { createLogger, logRequest } = require('./shared-logger')
   
   const logger = createLogger('my-service')
   logger.info('Application started')
   ```

## 📋 Available Scripts

### Development
```bash
npm start                # Start logger service
npm run dev              # Development mode
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format with Prettier
```

### Testing
```bash
npm test                 # Run tests
npm run test:watch       # Watch mode testing
npm run test:coverage    # Run with coverage
```

## 🔧 Usage Examples

### Basic Logging
```javascript
const { createLogger } = require('./shared-logger')

const logger = createLogger('my-service')

// Different log levels
logger.error('An error occurred', { error: error.message })
logger.warn('Warning message', { data: someData })
logger.info('Informational message', { userId: 123 })
logger.debug('Debug information', { state: currentState })
```

### HTTP Request Logging
```javascript
const { logRequest } = require('./shared-logger')
const express = require('express')

const app = express()

// Use request logging middleware
app.use(logRequest)

// Or with custom options
app.use(logRequest({
  skip: (req, res) => res.statusCode < 400,
  format: 'combined'
}))
```

### Privacy-Aware Logging
```javascript
const { createLogger, getPrivacySafeIP } = require('./shared-logger')

const logger = createLogger('privacy-service')

app.use((req, res, next) => {
  const safeIP = getPrivacySafeIP(req)
  
  logger.info('Request received', {
    ip: safeIP,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent')
  })
  
  next()
})
```

## 🔒 Privacy Implementation

### IP Hashing Configuration
```javascript
// Privacy utilities
const crypto = require('crypto')

function getPrivacySafeIP(req) {
  const ipHashingEnabled = process.env.IP_HASHING_ENABLED === 'true'
  
  if (!ipHashingEnabled) {
    return 'IP_HASHING_DISABLED'
  }
  
  const clientIP = getClientIP(req)
  const salt = process.env.IP_SALT || 'default-salt'
  
  return crypto.createHash('sha256')
    .update(clientIP + salt)
    .digest('hex')
}

function getClientIP(req) {
  return req.ip ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         'unknown'
}
```

### Privacy Settings
```javascript
// Privacy configuration
const PRIVACY_CONFIG = {
  IP_HASHING_ENABLED: process.env.IP_HASHING_ENABLED === 'true',
  IP_SALT: process.env.IP_SALT || 'default-salt',
  LOG_SENSITIVE_DATA: process.env.LOG_SENSITIVE_DATA === 'true',
  AUDIT_ENABLED: process.env.AUDIT_ENABLED !== 'false'
}

// Sensitive data filtering
function sanitizeLogData(data) {
  if (!PRIVACY_CONFIG.LOG_SENSITIVE_DATA) {
    const sensitiveFields = ['password', 'token', 'key', 'secret', 'ssn', 'creditCard']
    
    sensitiveFields.forEach(field => {
      if (data[field]) {
        data[field] = '[REDACTED]'
      }
    })
  }
  
  return data
}
```

## 🎨 Logger Configuration

### Winston Configuration
```javascript
const winston = require('winston')

const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
}

// Add file transport if LOG_FILE is set
if (process.env.LOG_FILE) {
  loggerConfig.transports.push(
    new winston.transports.File({
      filename: process.env.LOG_FILE,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  )
}

const logger = winston.createLogger(loggerConfig)
```

### Custom Formatters
```javascript
// Custom log formatters
const customFormatters = {
  privacy: winston.format((info) => {
    if (info.ip) {
      info.ip = getPrivacySafeIP({ ip: info.ip })
    }
    return info
  }),
  
  audit: winston.format((info) => {
    if (info.audit) {
      info.timestamp = new Date().toISOString()
      info.service = process.env.SERVICE_NAME || 'unknown'
      info.environment = process.env.NODE_ENV || 'development'
    }
    return info
  })
}
```

## 🧪 Testing

### Unit Testing
```javascript
// Logger tests
describe('Shared Logger', () => {
  test('should create logger with correct configuration', () => {
    const logger = createLogger('test-service')
    
    expect(logger).toBeDefined()
    expect(logger.level).toBe('info')
  })
  
  test('should hash IP addresses when enabled', () => {
    process.env.IP_HASHING_ENABLED = 'true'
    process.env.IP_SALT = 'test-salt'
    
    const safeIP = getPrivacySafeIP({ ip: '192.168.1.1' })
    
    expect(safeIP).not.toBe('192.168.1.1')
    expect(safeIP).not.toBe('IP_HASHING_DISABLED')
    expect(safeIP).toHaveLength(64) // SHA-256 hash length
  })
  
  test('should return disabled message when IP hashing is off', () => {
    process.env.IP_HASHING_ENABLED = 'false'
    
    const safeIP = getPrivacySafeIP({ ip: '192.168.1.1' })
    
    expect(safeIP).toBe('IP_HASHING_DISABLED')
  })
})
```

### Integration Testing
```javascript
// HTTP logging tests
describe('HTTP Logging', () => {
  test('should log HTTP requests', async () => {
    const app = express()
    app.use(logRequest)
    app.get('/test', (req, res) => res.json({ success: true }))
    
    const response = await request(app)
      .get('/test')
      .expect(200)
    
    // Check that request was logged
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('HTTP Request'),
      expect.objectContaining({
        method: 'GET',
        url: '/test',
        statusCode: 200
      })
    )
  })
})
```

## 🚀 Deployment

### Production Configuration
```bash
# Production environment variables
LOG_LEVEL=warn
LOG_FORMAT=json
LOG_FILE=/var/log/safepsy/app.log
IP_HASHING_ENABLED=false
IP_SALT=your-production-salt
AUDIT_ENABLED=true
```

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create log directory
RUN mkdir -p /var/log/safepsy

# Start application
CMD ["node", "src/index.js"]
```

## 📊 Monitoring & Analytics

### Log Analysis
```javascript
// Log analysis utilities
const logAnalysis = {
  // Count log levels
  countLogLevels: (logs) => {
    const counts = { error: 0, warn: 0, info: 0, debug: 0 }
    logs.forEach(log => {
      if (counts[log.level] !== undefined) {
        counts[log.level]++
      }
    })
    return counts
  },
  
  // Find errors by service
  findErrorsByService: (logs) => {
    return logs
      .filter(log => log.level === 'error')
      .reduce((acc, log) => {
        const service = log.service || 'unknown'
        acc[service] = (acc[service] || 0) + 1
        return acc
      }, {})
  },
  
  // Analyze response times
  analyzeResponseTimes: (logs) => {
    const httpLogs = logs.filter(log => log.type === 'http')
    const times = httpLogs.map(log => log.responseTime).filter(t => t !== undefined)
    
    return {
      min: Math.min(...times),
      max: Math.max(...times),
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      p95: times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)]
    }
  }
}
```

### Health Monitoring
```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'shared-logger',
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    logLevel: logger.level,
    privacySettings: {
      ipHashingEnabled: process.env.IP_HASHING_ENABLED === 'true',
      auditEnabled: process.env.AUDIT_ENABLED !== 'false'
    }
  }
  
  res.json(health)
})
```

## 🔧 Configuration

### Package Configuration
```json
// package.json
{
  "name": "@safepsy/shared-logger",
  "version": "1.0.0",
  "description": "Shared logging utility for SafePsy platform",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest",
    "lint": "eslint src --ext .js",
    "lint:fix": "eslint src --ext .js --fix"
  },
  "dependencies": {
    "winston": "^3.8.0",
    "morgan": "^1.10.0",
    "express": "^4.18.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "jest": "^29.0.0",
    "eslint": "^8.0.0"
  }
}
```

### Environment Configuration
```bash
# Logging configuration
LOG_LEVEL=info
LOG_FORMAT=json
LOG_FILE=./logs/app.log

# Privacy configuration
IP_HASHING_ENABLED=false
IP_SALT=your-secure-salt
LOG_SENSITIVE_DATA=false
AUDIT_ENABLED=true

# Service configuration
SERVICE_NAME=shared-logger
NODE_ENV=production
```

## 🐛 Troubleshooting

### Common Issues

1. **Log File Permissions**
   ```bash
   # Check log directory permissions
   ls -la /var/log/safepsy/
   
   # Fix permissions
   chmod 755 /var/log/safepsy/
   chown app:app /var/log/safepsy/
   ```

2. **Privacy Configuration Issues**
   ```bash
   # Check privacy settings
   echo $IP_HASHING_ENABLED
   echo $IP_SALT
   
   # Test IP hashing
   node -e "
   const crypto = require('crypto');
   const enabled = process.env.IP_HASHING_ENABLED === 'true';
   const salt = process.env.IP_SALT || 'default-salt';
   const ip = '192.168.1.1';
   const result = enabled ? crypto.createHash('sha256').update(ip + salt).digest('hex') : 'IP_HASHING_DISABLED';
   console.log('IP hashing enabled:', enabled);
   console.log('Test IP:', ip);
   console.log('Result:', result);
   "
   ```

3. **Memory Issues**
   ```bash
   # Monitor memory usage
   ps aux | grep node
   
   # Check log file sizes
   du -sh /var/log/safepsy/*
   ```

## 📚 Resources

### Documentation
- [Winston Documentation](https://github.com/winstonjs/winston)
- [Morgan Documentation](https://github.com/expressjs/morgan)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)

### Privacy Resources
- [GDPR Guidelines](https://gdpr.eu/)
- [Privacy by Design Principles](https://www.privacybydesign.ca/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Development Guidelines
- Follow JavaScript best practices
- Write tests for new features
- Use conventional commits
- Ensure privacy compliance
- Maintain audit trail integrity

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🆘 Support

### Contact Information
- **Logger Team**: logger@safepsy.com
- **Technical Issues**: tech@safepsy.com
- **Privacy Issues**: privacy@safepsy.com

### Emergency Contacts
- **On-Call Engineer**: +1-XXX-XXX-XXXX
- **Technical Lead**: tech-lead@safepsy.com

---

**SafePsy Shared Logger** - Privacy-Aware, Centralized Logging 📝🔒
