import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ethers } from 'ethers';

/**
 * Validation error handler middleware
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined
      }))
    });
  }
  
  next();
};

/**
 * Ethereum address validation
 */
export const validateEthereumAddress = (field: string = 'address') => {
  return body(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .custom((value) => {
      if (!ethers.isAddress(value)) {
        throw new Error(`${field} must be a valid Ethereum address`);
      }
      return true;
    });
};

/**
 * DID hash validation (64-character hex string)
 */
export const validateDIDHash = (field: string = 'didHash') => {
  return body(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage(`${field} must be a 64-character hex string starting with 0x`);
};

/**
 * DID string validation (SafePsy format)
 */
export const validateDIDString = (field: string = 'did') => {
  return body(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .matches(/^did:safepsy:[a-fA-F0-9]{64}$/)
    .withMessage(`${field} must follow SafePsy DID format: did:safepsy:<64-character-hash>`);
};

/**
 * Data hash validation
 */
export const validateDataHash = (field: string = 'dataHash') => {
  return body(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage(`${field} must be a 64-character hex string starting with 0x`);
};

/**
 * JSON document validation
 */
export const validateJSONDocument = (field: string = 'document') => {
  return body(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .custom((value) => {
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error(`${field} must be a valid JSON object`);
        }
        return true;
      } catch (error) {
        throw new Error(`${field} must be valid JSON`);
      }
    });
};

/**
 * Signature validation
 */
export const validateSignature = (field: string = 'signature') => {
  return body(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .matches(/^0x[a-fA-F0-9]{130}$/)
    .withMessage(`${field} must be a valid Ethereum signature (130-character hex string)`);
};

/**
 * Nonce validation
 */
export const validateNonce = (field: string = 'nonce') => {
  return body(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .matches(/^[a-fA-F0-9]{64}$/)
    .withMessage(`${field} must be a 64-character hex string`);
};

/**
 * Message validation for signing
 */
export const validateSignMessage = (field: string = 'message') => {
  return body(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .isLength({ min: 10, max: 1000 })
    .withMessage(`${field} must be between 10 and 1000 characters`);
};

/**
 * Email validation
 */
export const validateEmail = (field: string = 'email') => {
  return body(field)
    .optional()
    .isEmail()
    .withMessage(`${field} must be a valid email address`);
};

/**
 * URL validation
 */
export const validateURL = (field: string = 'url') => {
  return body(field)
    .optional()
    .isURL()
    .withMessage(`${field} must be a valid URL`);
};

/**
 * String length validation
 */
export const validateStringLength = (field: string, min: number, max: number) => {
  return body(field)
    .optional()
    .isLength({ min, max })
    .withMessage(`${field} must be between ${min} and ${max} characters`);
};

/**
 * Numeric validation
 */
export const validateNumeric = (field: string, min?: number, max?: number) => {
  let validator = body(field)
    .optional()
    .isNumeric()
    .withMessage(`${field} must be a number`);
  
  if (min !== undefined) {
    validator = validator.isFloat({ min });
  }
  if (max !== undefined) {
    validator = validator.isFloat({ max });
  }
  
  return validator.withMessage(`${field} must be between ${min || 'any'} and ${max || 'any'}`);
};

/**
 * Boolean validation
 */
export const validateBoolean = (field: string) => {
  return body(field)
    .optional()
    .isBoolean()
    .withMessage(`${field} must be a boolean value`);
};

/**
 * Array validation
 */
export const validateArray = (field: string, minLength?: number, maxLength?: number) => {
  let validator = body(field)
    .optional()
    .isArray()
    .withMessage(`${field} must be an array`);
  
  if (minLength !== undefined) {
    validator = validator.isLength({ min: minLength });
  }
  if (maxLength !== undefined) {
    validator = validator.isLength({ max: maxLength });
  }
  
  return validator.withMessage(`${field} must be an array with ${minLength || 'any'} to ${maxLength || 'any'} items`);
};

/**
 * Object validation
 */
export const validateObject = (field: string) => {
  return body(field)
    .optional()
    .isObject()
    .withMessage(`${field} must be an object`);
};

/**
 * Date validation
 */
export const validateDate = (field: string) => {
  return body(field)
    .optional()
    .isISO8601()
    .withMessage(`${field} must be a valid ISO 8601 date`);
};

/**
 * UUID validation
 */
export const validateUUID = (field: string) => {
  return body(field)
    .optional()
    .isUUID()
    .withMessage(`${field} must be a valid UUID`);
};

/**
 * Hex color validation
 */
export const validateHexColor = (field: string) => {
  return body(field)
    .optional()
    .matches(/^#[a-fA-F0-9]{6}$/)
    .withMessage(`${field} must be a valid hex color (e.g., #FF0000)`);
};

/**
 * IP address validation
 */
export const validateIPAddress = (field: string) => {
  return body(field)
    .optional()
    .isIP()
    .withMessage(`${field} must be a valid IP address`);
};

/**
 * Port number validation
 */
export const validatePort = (field: string) => {
  return body(field)
    .optional()
    .isPort()
    .withMessage(`${field} must be a valid port number (1-65535)`);
};

/**
 * Base64 validation
 */
export const validateBase64 = (field: string) => {
  return body(field)
    .optional()
    .isBase64()
    .withMessage(`${field} must be valid base64 encoded data`);
};

/**
 * JWT token validation
 */
export const validateJWT = (field: string = 'token') => {
  return body(field)
    .optional()
    .matches(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)
    .withMessage(`${field} must be a valid JWT token`);
};

/**
 * Custom validation for SafePsy specific fields
 */
export const validateSafePsyFields = () => {
  return [
    // Validate DID-related fields
    validateDIDString('did').optional(),
    validateDIDHash('didHash').optional(),
    
    // Validate authentication fields
    validateEthereumAddress('address').optional(),
    validateSignature('signature').optional(),
    validateNonce('nonce').optional(),
    validateSignMessage('message').optional(),
    
    // Validate data fields
    validateDataHash('dataHash').optional(),
    validateJSONDocument('document').optional(),
    
    // Validate metadata
    validateStringLength('name', 1, 100).optional(),
    validateStringLength('description', 0, 500).optional(),
    validateURL('website').optional(),
    validateEmail('email').optional()
  ];
};

/**
 * Sanitization middleware
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize string inputs
  const sanitizeString = (str: string): string => {
    return str.trim().replace(/[<>]/g, '');
  };

  // Recursively sanitize object
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    } else if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * Content type validation middleware
 */
export const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.get('Content-Type');
    
    if (!contentType) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type header is required'
      });
    }

    const isValidType = allowedTypes.some(type => contentType.includes(type));
    
    if (!isValidType) {
      return res.status(400).json({
        success: false,
        message: `Content-Type must be one of: ${allowedTypes.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Request size validation middleware
 */
export const validateRequestSize = (maxSize: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        message: `Request size exceeds maximum allowed size of ${maxSize} bytes`
      });
    }

    next();
  };
};
