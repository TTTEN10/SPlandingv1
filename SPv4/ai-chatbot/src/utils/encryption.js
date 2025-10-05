const crypto = require('crypto');

/**
 * Comprehensive encryption utilities for SafePsy platform
 * Implements AES-256-GCM encryption for all client data
 */

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
    this.tagLength = 16; // 128 bits
  }

  /**
   * Generate a random encryption key
   */
  generateKey() {
    return crypto.randomBytes(this.keyLength).toString('hex');
  }

  /**
   * Generate a random IV (Initialization Vector)
   */
  generateIV() {
    return crypto.randomBytes(this.ivLength).toString('hex');
  }

  /**
   * Derive encryption key from user's DID and password
   * Uses PBKDF2 with 100,000 iterations for key derivation
   */
  deriveKeyFromDID(didHash, password, salt) {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    const key = crypto.pbkdf2Sync(password, actualSalt, 100000, this.keyLength, 'sha256');
    return key.toString('hex');
  }

  /**
   * Encrypt data using AES-256-GCM
   * @param {string} data - Data to encrypt
   * @param {string} key - Encryption key (hex string)
   * @param {string} iv - Initialization vector (optional, will be generated if not provided)
   * @returns {Object} Encryption result with encrypted data, IV, tag, and key hash
   */
  encrypt(data, key, iv) {
    try {
      const keyBuffer = Buffer.from(key, 'hex');
      const ivBuffer = iv ? Buffer.from(iv, 'hex') : crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, keyBuffer);
      cipher.setAAD(Buffer.from('safepsy-did-encryption', 'utf8'));

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      // Generate key hash for verification
      const keyHash = crypto.createHash('sha256').update(keyBuffer).digest('hex');

      return {
        encryptedData: encrypted,
        iv: ivBuffer.toString('hex'),
        tag: tag.toString('hex'),
        keyHash: keyHash
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   * @param {string} encryptedData - Encrypted data
   * @param {string} key - Decryption key (hex string)
   * @param {string} iv - Initialization vector (hex string)
   * @param {string} tag - Authentication tag (hex string)
   * @returns {Object} Decryption result with decrypted data and validity flag
   */
  decrypt(encryptedData, key, iv, tag) {
    try {
      const keyBuffer = Buffer.from(key, 'hex');
      const ivBuffer = Buffer.from(iv, 'hex');
      const tagBuffer = Buffer.from(tag, 'hex');

      const decipher = crypto.createDecipher(this.algorithm, keyBuffer);
      decipher.setAAD(Buffer.from('safepsy-did-encryption', 'utf8'));
      decipher.setAuthTag(tagBuffer);

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return {
        decryptedData: decrypted,
        isValid: true
      };
    } catch (error) {
      return {
        decryptedData: '',
        isValid: false
      };
    }
  }

  /**
   * Encrypt conversation data specifically
   * @param {Object} conversationData - Conversation object to encrypt
   * @param {string} userKey - User's encryption key
   * @returns {Object} Encrypted conversation data
   */
  encryptConversation(conversationData, userKey) {
    const jsonData = JSON.stringify(conversationData);
    return this.encrypt(jsonData, userKey);
  }

  /**
   * Decrypt conversation data specifically
   * @param {string} encryptedConversation - Encrypted conversation data
   * @param {string} userKey - User's encryption key
   * @param {string} iv - Initialization vector
   * @param {string} tag - Authentication tag
   * @returns {Object} Decrypted conversation data
   */
  decryptConversation(encryptedConversation, userKey, iv, tag) {
    const result = this.decrypt(encryptedConversation, userKey, iv, tag);
    if (!result.isValid) {
      throw new Error('Failed to decrypt conversation data');
    }
    return JSON.parse(result.decryptedData);
  }

  /**
   * Encrypt user profile data
   * @param {Object} profileData - User profile object to encrypt
   * @param {string} userKey - User's encryption key
   * @returns {Object} Encrypted profile data
   */
  encryptProfile(profileData, userKey) {
    const jsonData = JSON.stringify(profileData);
    return this.encrypt(jsonData, userKey);
  }

  /**
   * Decrypt user profile data
   * @param {string} encryptedProfile - Encrypted profile data
   * @param {string} userKey - User's encryption key
   * @param {string} iv - Initialization vector
   * @param {string} tag - Authentication tag
   * @returns {Object} Decrypted profile data
   */
  decryptProfile(encryptedProfile, userKey, iv, tag) {
    const result = this.decrypt(encryptedProfile, userKey, iv, tag);
    if (!result.isValid) {
      throw new Error('Failed to decrypt profile data');
    }
    return JSON.parse(result.decryptedData);
  }

  /**
   * Encrypt therapy session data
   * @param {Object} sessionData - Therapy session object to encrypt
   * @param {string} userKey - User's encryption key
   * @returns {Object} Encrypted session data
   */
  encryptSession(sessionData, userKey) {
    const jsonData = JSON.stringify(sessionData);
    return this.encrypt(jsonData, userKey);
  }

  /**
   * Decrypt therapy session data
   * @param {string} encryptedSession - Encrypted session data
   * @param {string} userKey - User's encryption key
   * @param {string} iv - Initialization vector
   * @param {string} tag - Authentication tag
   * @returns {Object} Decrypted session data
   */
  decryptSession(encryptedSession, userKey, iv, tag) {
    const result = this.decrypt(encryptedSession, userKey, iv, tag);
    if (!result.isValid) {
      throw new Error('Failed to decrypt session data');
    }
    return JSON.parse(result.decryptedData);
  }

  /**
   * Generate data hash for blockchain storage
   * @param {string} encryptedData - Encrypted data
   * @param {string} iv - Initialization vector
   * @param {string} tag - Authentication tag
   * @returns {string} SHA-256 hash of the encrypted data
   */
  generateDataHash(encryptedData, iv, tag) {
    const combinedData = encryptedData + iv + tag;
    return crypto.createHash('sha256').update(combinedData).digest('hex');
  }

  /**
   * Verify data integrity using hash
   * @param {string} encryptedData - Encrypted data
   * @param {string} iv - Initialization vector
   * @param {string} tag - Authentication tag
   * @param {string} expectedHash - Expected hash
   * @returns {boolean} True if hash matches
   */
  verifyDataIntegrity(encryptedData, iv, tag, expectedHash) {
    const actualHash = this.generateDataHash(encryptedData, iv, tag);
    return actualHash === expectedHash;
  }

  /**
   * Encrypt data for DID storage
   * @param {Object} data - Data to encrypt
   * @param {string} userKey - User's encryption key
   * @returns {Object} Object with encrypted data and hash for blockchain storage
   */
  encryptForDIDStorage(data, userKey) {
    const jsonData = JSON.stringify(data);
    const encryptedData = this.encrypt(jsonData, userKey);
    const dataHash = this.generateDataHash(encryptedData.encryptedData, encryptedData.iv, encryptedData.tag);
    
    return {
      encryptedData,
      dataHash
    };
  }

  /**
   * Decrypt data from DID storage
   * @param {string} encryptedData - Encrypted data from storage
   * @param {string} userKey - User's encryption key
   * @param {string} iv - Initialization vector
   * @param {string} tag - Authentication tag
   * @param {string} expectedHash - Expected data hash for verification
   * @returns {Object} Decrypted data
   */
  decryptFromDIDStorage(encryptedData, userKey, iv, tag, expectedHash) {
    // Verify data integrity first
    if (!this.verifyDataIntegrity(encryptedData, iv, tag, expectedHash)) {
      throw new Error('Data integrity verification failed');
    }

    const result = this.decrypt(encryptedData, userKey, iv, tag);
    if (!result.isValid) {
      throw new Error('Failed to decrypt data from DID storage');
    }

    return JSON.parse(result.decryptedData);
  }
}

// Export singleton instance
const encryptionService = new EncryptionService();

// Export utility functions
const generateUserKey = (didHash, password) => {
  return encryptionService.deriveKeyFromDID(didHash, password);
};

const encryptClientData = (data, userKey) => {
  return encryptionService.encryptForDIDStorage(data, userKey);
};

const decryptClientData = (encryptedData, userKey, iv, tag, expectedHash) => {
  return encryptionService.decryptFromDIDStorage(encryptedData, userKey, iv, tag, expectedHash);
};

module.exports = {
  EncryptionService,
  encryptionService,
  generateUserKey,
  encryptClientData,
  decryptClientData
};
