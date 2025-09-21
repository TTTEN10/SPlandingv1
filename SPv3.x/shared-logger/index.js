const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const crypto = require('crypto');

/**
 * Privacy by Design IP Hashing Utility
 * Hash IP addresses for privacy protection
 */
const getPrivacySafeIP = (ip) => {
  const enabled = process.env.IP_HASHING_ENABLED === 'true';
  const salt = process.env.IP_SALT || 'default-privacy-salt-change-in-production';
  
  if (!enabled) {
    return 'IP_HASHING_DISABLED';
  }
  
  return crypto.createHash('sha256').update(ip + salt).digest('hex');
};

// Create logger instance
const createLogger = (serviceName = 'safepsy') => {
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: serviceName },
    transports: [
      // Console transport
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
      
      // File transport with rotation
      new DailyRotateFile({
        filename: `logs/${serviceName}-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        zippedArchive: true
      }),
      
      // Error file transport
      new DailyRotateFile({
        filename: `logs/${serviceName}-error-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: '30d',
        zippedArchive: true
      })
    ]
  });

  // Add request logging middleware
  logger.logRequest = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: getPrivacySafeIP(req.ip || req.connection?.remoteAddress || 'unknown')
      });
    });
    
    next();
  };

  // Add error logging
  logger.logError = (error, context = {}) => {
    logger.error('Application Error', {
      message: error.message,
      stack: error.stack,
      ...context
    });
  };

  return logger;
};

module.exports = { createLogger };
