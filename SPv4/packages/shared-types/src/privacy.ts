import crypto from 'crypto';

/**
 * Privacy by Design IP Hashing Utility
 * 
 * This utility provides secure IP address hashing with the following features:
 * - Uses SHA-256 with configurable salt for IP hashing
 * - Default behavior is OFF (no IP hashing) for privacy-first approach
 * - Can be enabled via environment variable
 * - Provides consistent hashing across all services
 */

export interface IPHashingConfig {
  enabled: boolean;
  salt: string;
}

/**
 * Get IP hashing configuration from environment variables
 */
export const getIPHashingConfig = (): IPHashingConfig => {
  return {
    enabled: process.env.IP_HASHING_ENABLED === 'true',
    salt: process.env.IP_SALT || 'default-privacy-salt-change-in-production'
  };
};

/**
 * Hash an IP address using SHA-256 with salt
 * @param ip - The IP address to hash
 * @param salt - Optional salt (uses environment salt if not provided)
 * @returns Hashed IP address or original IP if hashing is disabled
 */
export const hashIP = (ip: string, salt?: string): string => {
  const config = getIPHashingConfig();
  
  // If IP hashing is disabled, return the original IP
  if (!config.enabled) {
    return ip;
  }
  
  const saltToUse = salt || config.salt;
  return crypto.createHash('sha256').update(ip + saltToUse).digest('hex');
};

/**
 * Get client IP from request with privacy protection
 * @param req - Express request object
 * @returns Hashed IP address or original IP based on configuration
 */
export const getClientIP = (req: any): string => {
  const rawIP = (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    '127.0.0.1'
  );
  
  return hashIP(rawIP);
};

/**
 * Check if IP hashing is enabled
 * @returns true if IP hashing is enabled
 */
export const isIPHashingEnabled = (): boolean => {
  return getIPHashingConfig().enabled;
};

/**
 * Get privacy-safe IP for logging purposes
 * @param ip - Raw IP address
 * @returns Hashed IP if enabled, otherwise 'IP_HASHING_DISABLED'
 */
export const getPrivacySafeIP = (ip: string): string => {
  const config = getIPHashingConfig();
  
  if (!config.enabled) {
    return 'IP_HASHING_DISABLED';
  }
  
  return hashIP(ip);
};
