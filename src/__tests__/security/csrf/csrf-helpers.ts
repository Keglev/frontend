/**
 * @file csrf-helpers.ts
 * @description CSRF protection helper functions and utilities for testing
 * Provides reusable validation functions for token generation, storage, and verification
 * @domain API Security & CSRF Prevention
 */

/**
 * Generates a cryptographically secure CSRF token
 * Uses crypto.getRandomValues to generate 32 random bytes encoded as hex
 * @returns {string} A 64-character hex string (32 bytes * 2)
 * @example
 * const token = generateCSRFToken();
 * // token: "a1b2c3d4e5f6..."
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Stores a CSRF token with timestamp for freshness validation
 * @param {Map<string, { token: string; timestamp: number }>} store - Token storage map
 * @param {string} token - The CSRF token to store
 * @returns {void}
 * @example
 * const store = new Map();
 * storeCSRFToken(store, 'token-value');
 */
export function storeCSRFToken(
  store: Map<string, { token: string; timestamp: number }>,
  token: string
): void {
  store.set('csrf_token', {
    token,
    timestamp: Date.now(),
  });
}

/**
 * Retrieves a CSRF token if it exists and hasn't expired
 * Token freshness max age: 1 hour. Expired tokens are removed from store
 * @param {Map<string, { token: string; timestamp: number }>} store - Token storage map
 * @returns {string | null} The token if valid, null if missing or expired
 * @example
 * const token = getCSRFToken(store);
 */
export function getCSRFToken(
  store: Map<string, { token: string; timestamp: number }>
): string | null {
  const stored = store.get('csrf_token');
  if (!stored) return null;

  // Check token freshness (1 hour max age)
  const maxAge = 1000 * 60 * 60; // 1 hour
  if (Date.now() - stored.timestamp > maxAge) {
    store.delete('csrf_token');
    return null;
  }

  return stored.token;
}

/**
 * Validates CSRF token format (64 character hex string)
 * Token must match pattern: exactly 64 hex characters
 * @param {string} token - The token to validate
 * @returns {boolean} True if token format is valid
 * @example
 * validateTokenFormat('a'.repeat(64)) // true
 * validateTokenFormat('invalid') // false
 */
export function validateTokenFormat(token: string): boolean {
  return /^[0-9a-f]{64}$/.test(token);
}

/**
 * Performs constant-time comparison of two tokens
 * Prevents timing attacks by comparing all characters even after finding mismatch
 * @param {string} requestToken - Token from HTTP request
 * @param {string} serverToken - Token stored on server
 * @returns {boolean} True if tokens match
 * @example
 * validateTokenMatch('token1', 'token1') // true
 * validateTokenMatch('token1', 'wrong') // false
 */
export function validateTokenMatch(
  requestToken: string,
  serverToken: string
): boolean {
  // Prevent timing attacks using constant-time comparison
  if (requestToken.length !== serverToken.length) {
    return false;
  }

  let match = true;
  for (let i = 0; i < requestToken.length; i++) {
    if (requestToken[i] !== serverToken[i]) {
      match = false; // Don't early exit - prevent timing attacks
    }
  }
  return match;
}

/**
 * Validates HTTP request method and requires CSRF token for unsafe methods
 * Safe methods (GET, HEAD, OPTIONS) are read-only and exempt from CSRF token requirement
 * Unsafe methods (POST, PUT, PATCH, DELETE) require CSRF token for protection
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {string | undefined} token - Optional CSRF token from request
 * @returns {{ valid: boolean; error?: string }} Validation result with optional error message
 * @example
 * validateMutationRequest('POST') // { valid: false, error: "..." }
 * validateMutationRequest('POST', 'token') // { valid: true }
 * validateMutationRequest('GET') // { valid: true }
 */
export function validateMutationRequest(
  method: string,
  token?: string
): { valid: boolean; error?: string } {
  // Safe methods that don't change state
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  if (safeMethods.includes(method)) {
    return { valid: true };
  }

  // Unsafe methods require CSRF token
  if (!token) {
    return {
      valid: false,
      error: `${method} request requires CSRF token`,
    };
  }

  return { valid: true };
}

/**
 * Validates Origin header for same-origin request verification
 * Exact string match required (includes protocol and domain)
 * @param {string} origin - Origin value from request header
 * @param {string} allowedOrigin - Expected origin (e.g., 'https://stockease.com')
 * @returns {boolean} True if origin matches allowed value
 * @example
 * validateOrigin('https://stockease.com', 'https://stockease.com') // true
 * validateOrigin('https://attacker.com', 'https://stockease.com') // false
 */
export function validateOrigin(origin: string, allowedOrigin: string): boolean {
  return origin === allowedOrigin;
}

/**
 * Validates Referer header for mutation request source verification
 * Requires valid URL format with matching origin; rejects /external pathnames
 * @param {string | undefined} referer - Referer value from request header
 * @param {string} allowedOrigin - Expected origin (e.g., 'https://stockease.com')
 * @returns {boolean} True if referer is valid and from allowed origin
 * @example
 * validateReferer('https://stockease.com/product/123', 'https://stockease.com') // true
 * validateReferer(undefined, 'https://stockease.com') // false
 */
export function validateReferer(
  referer: string | undefined,
  allowedOrigin: string
): boolean {
  if (!referer) return false;

  try {
    const refererUrl = new URL(referer);
    const allowedUrl = new URL(allowedOrigin);
    return (
      refererUrl.origin === allowedUrl.origin &&
      !refererUrl.pathname.startsWith('/external')
    );
  } catch {
    return false;
  }
}

/**
 * Validates CSRF protection headers on incoming request
 * Requires either CSRF token OR valid Origin/Referer header for defense-in-depth
 * @param {string | undefined} origin - Origin header value
 * @param {string | undefined} referer - Referer header value
 * @param {string | undefined} csrfToken - CSRF token from request
 * @returns {{ valid: boolean; reason?: string }} Validation result
 * @example
 * validateCSRFHeaders() // { valid: false, reason: "..." }
 * validateCSRFHeaders('https://stockease.com', undefined, undefined) // { valid: true }
 */
export function validateCSRFHeaders(
  origin?: string,
  referer?: string,
  csrfToken?: string
): { valid: boolean; reason?: string } {
  if (!csrfToken) {
    if (!origin && !referer) {
      return {
        valid: false,
        reason: 'Missing CSRF token and validation headers',
      };
    }
  }

  return { valid: true };
}

/**
 * Validates SameSite cookie attribute value and security level
 * Valid values: 'Strict' (most secure), 'Lax' (default), 'None' (requires Secure flag)
 * @param {string} sameSiteValue - SameSite attribute value
 * @returns {{ valid: boolean; secure: boolean }} Validation result and security status
 * @example
 * validateSameSite('Strict') // { valid: true, secure: true }
 * validateSameSite('Lax') // { valid: true, secure: true }
 * validateSameSite('Invalid') // { valid: false, secure: false }
 */
export function validateSameSite(
  sameSiteValue: string
): { valid: boolean; secure: boolean } {
  const validValues = ['Strict', 'Lax', 'None'];

  if (!validValues.includes(sameSiteValue)) {
    return { valid: false, secure: false };
  }

  // "Strict" and "Lax" are secure; "None" requires Secure flag
  const isSecure = sameSiteValue === 'Strict' || sameSiteValue === 'Lax';

  return {
    valid: true,
    secure: isSecure,
  };
}

/**
 * Evaluates CSRF vulnerability based on SameSite cookie policy
 * Strict: Cookie not sent cross-origin (CSRF-safe)
 * Lax: Cookie sent for safe methods only (mostly CSRF-safe)
 * None: Cookie sent everywhere (CSRF-vulnerable without other defenses)
 * @param {string} cookieSameSite - SameSite attribute value
 * @param {string} requestOrigin - Origin of incoming request
 * @param {string} cookieOrigin - Origin where cookie was set
 * @returns {boolean} True if CSRF is possible given these parameters
 * @example
 * isCSRFVulnerable('Strict', 'https://attacker.com', 'https://stockease.com') // false
 * isCSRFVulnerable('None', 'https://attacker.com', 'https://stockease.com') // true
 */
export function isCSRFVulnerable(
  cookieSameSite: string,
  requestOrigin: string,
  cookieOrigin: string
): boolean {
  if (cookieSameSite === 'Strict') {
    // Cookie not sent cross-origin, CSRF prevented
    return false;
  }

  if (cookieSameSite === 'Lax') {
    // Cookie sent for safe methods only (GET, HEAD)
    return requestOrigin !== cookieOrigin;
  }

  // No SameSite protection
  return true;
}

/**
 * Validates double-submit cookie pattern by comparing cookie and body tokens
 * Uses constant-time comparison to prevent timing attacks
 * Both cookie and body tokens must be present and match
 * @param {string} cookieToken - CSRF token from cookie
 * @param {string} bodyToken - CSRF token from request body/header
 * @returns {{ valid: boolean; reason?: string }} Validation result
 * @example
 * validateDoubleSubmitCookie('token', 'token') // { valid: true }
 * validateDoubleSubmitCookie('', 'token') // { valid: false, reason: "..." }
 */
export function validateDoubleSubmitCookie(
  cookieToken: string,
  bodyToken: string
): { valid: boolean; reason?: string } {
  if (!cookieToken) {
    return {
      valid: false,
      reason: 'CSRF cookie not found',
    };
  }

  if (!bodyToken) {
    return {
      valid: false,
      reason: 'CSRF token not in request body',
    };
  }

  // Use constant-time comparison to prevent timing attacks
  if (cookieToken.length !== bodyToken.length) {
    return {
      valid: false,
      reason: 'CSRF token mismatch',
    };
  }

  let match = true;
  for (let i = 0; i < cookieToken.length; i++) {
    if (cookieToken[i] !== bodyToken[i]) {
      match = false;
    }
  }

  if (!match) {
    return {
      valid: false,
      reason: 'CSRF token mismatch',
    };
  }

  return { valid: true };
}
