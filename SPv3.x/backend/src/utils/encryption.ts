import crypto from 'crypto';
import { ethers } from 'ethers';

/**
 * Comprehensive encryption utilities for SafePsy platform
 * Implements AES-256-GCM encryption for all client data
 */

export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  tag: string;
  keyHash: string;
}

export interface DecryptionResult {
  decryptedData: string;
  isValid: boolean;
}

export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly tagLength = 16; // 128 bits

  /**
   * Generate a random encryption key
   */
  generateKey(): string {
    return crypto.randomBytes(this.keyLength).toString('hex');
  }

  /**
   * Generate a random IV (Initialization Vector)
   */
  generateIV(): string {
    return crypto.randomBytes(this.ivLength).toString('hex');
  }

  /**
   * Derive encryption key from user's DID and password
   * Uses PBKDF2 with 100,000 iterations for key derivation
   */
  deriveKeyFromDID(didHash: string, password: string, salt?: string): string {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    const key = crypto.pbkdf2Sync(password, actualSalt, 100000, this.keyLength, 'sha256');
    return key.toString('hex');
  }

  /**
   * Encrypt data using AES-256-GCM
   * @param data - Data to encrypt
   * @param key - Encryption key (hex string)
   * @param iv - Initialization vector (optional, will be generated if not provided)
   * @returns Encryption result with encrypted data, IV, tag, and key hash
   */
  encrypt(data: string, key: string, iv?: string): EncryptionResult {
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
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   * @param encryptedData - Encrypted data
   * @param key - Decryption key (hex string)
   * @param iv - Initialization vector (hex string)
   * @param tag - Authentication tag (hex string)
   * @returns Decryption result with decrypted data and validity flag
   */
  decrypt(encryptedData: string, key: string, iv: string, tag: string): DecryptionResult {
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
   * @param conversationData - Conversation object to encrypt
   * @param userKey - User's encryption key
   * @returns Encrypted conversation data
   */
  encryptConversation(conversationData: any, userKey: string): EncryptionResult {
    const jsonData = JSON.stringify(conversationData);
    return this.encrypt(jsonData, userKey);
  }

  /**
   * Decrypt conversation data specifically
   * @param encryptedConversation - Encrypted conversation data
   * @param userKey - User's encryption key
   * @param iv - Initialization vector
   * @param tag - Authentication tag
   * @returns Decrypted conversation data
   */
  decryptConversation(encryptedConversation: string, userKey: string, iv: string, tag: string): any {
    const result = this.decrypt(encryptedConversation, userKey, iv, tag);
    if (!result.isValid) {
      throw new Error('Failed to decrypt conversation data');
    }
    return JSON.parse(result.decryptedData);
  }

  /**
   * Encrypt user profile data
   * @param profileData - User profile object to encrypt
   * @param userKey - User's encryption key
   * @returns Encrypted profile data
   */
  encryptProfile(profileData: any, userKey: string): EncryptionResult {
    const jsonData = JSON.stringify(profileData);
    return this.encrypt(jsonData, userKey);
  }

  /**
   * Decrypt user profile data
   * @param encryptedProfile - Encrypted profile data
   * @param userKey - User's encryption key
   * @param iv - Initialization vector
   * @param tag - Authentication tag
   * @returns Decrypted profile data
   */
  decryptProfile(encryptedProfile: string, userKey: string, iv: string, tag: string): any {
    const result = this.decrypt(encryptedProfile, userKey, iv, tag);
    if (!result.isValid) {
      throw new Error('Failed to decrypt profile data');
    }
    return JSON.parse(result.decryptedData);
  }

  /**
   * Encrypt therapy session data
   * @param sessionData - Therapy session object to encrypt
   * @param userKey - User's encryption key
   * @returns Encrypted session data
   */
  encryptSession(sessionData: any, userKey: string): EncryptionResult {
    const jsonData = JSON.stringify(sessionData);
    return this.encrypt(jsonData, userKey);
  }

  /**
   * Decrypt therapy session data
   * @param encryptedSession - Encrypted session data
   * @param userKey - User's encryption key
   * @param iv - Initialization vector
   * @param tag - Authentication tag
   * @returns Decrypted session data
   */
  decryptSession(encryptedSession: string, userKey: string, iv: string, tag: string): any {
    const result = this.decrypt(encryptedSession, userKey, iv, tag);
    if (!result.isValid) {
      throw new Error('Failed to decrypt session data');
    }
    return JSON.parse(result.decryptedData);
  }

  /**
   * Generate data hash for blockchain storage
   * @param encryptedData - Encrypted data
   * @param iv - Initialization vector
   * @param tag - Authentication tag
   * @returns SHA-256 hash of the encrypted data
   */
  generateDataHash(encryptedData: string, iv: string, tag: string): string {
    const combinedData = encryptedData + iv + tag;
    return crypto.createHash('sha256').update(combinedData).digest('hex');
  }

  /**
   * Verify data integrity using hash
   * @param encryptedData - Encrypted data
   * @param iv - Initialization vector
   * @param tag - Authentication tag
   * @param expectedHash - Expected hash
   * @returns True if hash matches
   */
  verifyDataIntegrity(encryptedData: string, iv: string, tag: string, expectedHash: string): boolean {
    const actualHash = this.generateDataHash(encryptedData, iv, tag);
    return actualHash === expectedHash;
  }

  /**
   * Encrypt data for DID storage
   * @param data - Data to encrypt
   * @param userKey - User's encryption key
   * @returns Object with encrypted data and hash for blockchain storage
   */
  encryptForDIDStorage(data: any, userKey: string): { encryptedData: EncryptionResult; dataHash: string } {
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
   * @param encryptedData - Encrypted data from storage
   * @param userKey - User's encryption key
   * @param iv - Initialization vector
   * @param tag - Authentication tag
   * @param expectedHash - Expected data hash for verification
   * @returns Decrypted data
   */
  decryptFromDIDStorage(encryptedData: string, userKey: string, iv: string, tag: string, expectedHash: string): any {
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
export const encryptionService = new EncryptionService();

// Export utility functions
export const generateUserKey = (didHash: string, password: string): string => {
  return encryptionService.deriveKeyFromDID(didHash, password);
};

export const encryptClientData = (data: any, userKey: string): EncryptionResult => {
  return encryptionService.encryptForDIDStorage(data, userKey);
};

export const decryptClientData = (encryptedData: string, userKey: string, iv: string, tag: string, expectedHash: string): any => {
  return encryptionService.decryptFromDIDStorage(encryptedData, userKey, iv, tag, expectedHash);
};
