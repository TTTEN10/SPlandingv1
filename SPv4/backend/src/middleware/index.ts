// Export all middleware modules
export * from './auth';
export * from './wallet-auth';
export * from './did-verify';
export * from './validation';
export * from './rate-limit';

// Re-export commonly used middleware for convenience
export {
  authenticateToken,
  validateAddress,
  validateDIDHash,
  validateDIDString,
  validateDataHash,
  validateJSONDocument,
  checkContractsInitialized,
  errorHandler,
  notFoundHandler
} from './auth';

export {
  walletAuth,
  verifyWalletToken,
  requireWalletAuth,
  validateWalletOwnership,
  optionalWalletAuth,
  generateNonce,
  generateSignMessage
} from './wallet-auth';

export {
  verifyDIDFormat,
  verifyDIDOwnership,
  verifyDIDExists,
  verifyDIDNotRevoked,
  verifyDIDVerificationMethod,
  requireDIDVerification,
  validateDIDDocument,
  validateDIDFormat,
  extractDIDHash,
  generateDIDHash
} from './did-verify';

export {
  handleValidationErrors,
  validateEthereumAddress,
  validateDIDHash as validateDIDHashField,
  validateDIDString as validateDIDStringField,
  validateDataHash as validateDataHashField,
  validateJSONDocument as validateJSONDocumentField,
  validateSignature,
  validateNonce,
  validateSignMessage,
  validateEmail,
  validateURL,
  validateStringLength,
  validateNumeric,
  validateBoolean,
  validateArray,
  validateObject,
  validateDate,
  validateUUID,
  validateHexColor,
  validateIPAddress,
  validatePort,
  validateBase64,
  validateJWT,
  validateSafePsyFields,
  sanitizeInput,
  validateContentType,
  validateRequestSize
} from './validation';

export {
  rateLimitPerIP,
  rateLimitPerDID,
  rateLimitPerWallet,
  rateLimitCombined,
  strictRateLimit,
  authRateLimit,
  didOperationRateLimit,
  storageRateLimit,
  dynamicRateLimit,
  rateLimitWithWhitelist
} from './rate-limit';
