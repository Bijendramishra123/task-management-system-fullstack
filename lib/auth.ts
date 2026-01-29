/**
 * Authentication utility functions
 * Handles JWT token creation, verification, and password hashing
 */

import * as crypto from 'crypto';

// JWT token types
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Hash a password using Node.js built-in crypto (simple implementation)
 * Note: For production, use bcrypt package
 * @param password - Plain text password
 * @returns Hashed password
 */
export function hashPassword(password: string): string {
  // For production, use: bcryptjs.hashSync(password, 10)
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against its hash
 * @param password - Plain text password to verify
 * @param hash - Stored hash
 * @returns True if password matches
 */
export function verifyPassword(password: string, hash: string): boolean {
  const [salt, storedHash] = hash.split(':');
  const computedHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  return computedHash === storedHash;
}

/**
 * Create a JWT token (simple implementation for demo)
 * Note: For production, use jsonwebtoken package
 * @param payload - JWT payload
 * @param expiresIn - Expiration time in seconds
 * @returns JWT token string
 */
export function createToken(
  payload: JWTPayload,
  expiresIn: number = 900 // 15 minutes default
): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
  };

  const secret = process.env.JWT_SECRET || 'default-secret';

  const headerEncoded = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadEncoded = Buffer.from(JSON.stringify(tokenPayload)).toString(
    'base64url'
  );

  const signatureInput = `${headerEncoded}.${payloadEncoded}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signatureInput)
    .digest('base64url');

  return `${signatureInput}.${signature}`;
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET || 'default-secret';
    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    const [headerEncoded, payloadEncoded, signatureProvided] = parts;
    const signatureInput = `${headerEncoded}.${payloadEncoded}`;
    const signatureComputed = crypto
      .createHmac('sha256', secret)
      .update(signatureInput)
      .digest('base64url');

    if (signatureComputed !== signatureProvided) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(payloadEncoded, 'base64url').toString()
    );

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('[v0] Token verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export function extractToken(authHeader?: string): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  return null;
}
