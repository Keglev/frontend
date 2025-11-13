/**
 * @file security-headers-helpers.ts
 * @description HTTP security header validation helper functions
 * Provides utilities for validating security headers and their configurations
 * @domain Web Security & HTTP Headers
 */

/**
 * Validates X-Frame-Options header value
 * Prevents clickjacking attacks by controlling whether page can be framed
 * Valid values: DENY (no framing) or SAMEORIGIN (same-origin only)
 * @param {string} value - Header value to validate
 * @returns {boolean} True if value is valid
 * @example
 * isValidFrameOptions('DENY') // true
 * isValidFrameOptions('ALLOW-FROM') // false (deprecated)
 */
export function isValidFrameOptions(value: string): boolean {
  const validValues = ['DENY', 'SAMEORIGIN'];
  return validValues.includes(value);
}

/**
 * Checks if page can be safely framed based on X-Frame-Options policy
 * @param {string} headerValue - X-Frame-Options value (DENY or SAMEORIGIN)
 * @param {string} frameOrigin - Origin attempting to frame the page
 * @param {string} pageOrigin - Origin of the page being framed
 * @returns {boolean} True if framing is allowed under the policy
 * @example
 * canBeSafelyFramed('DENY', 'https://attacker.com', 'https://example.com') // false
 * canBeSafelyFramed('SAMEORIGIN', 'https://example.com', 'https://example.com') // true
 */
export function canBeSafelyFramed(
  headerValue: string,
  frameOrigin: string,
  pageOrigin: string
): boolean {
  if (headerValue === 'DENY') {
    return false; // No framing allowed
  }

  if (headerValue === 'SAMEORIGIN') {
    return frameOrigin === pageOrigin; // Only same-origin framing
  }

  return false;
}

/**
 * Validates X-Content-Type-Options header value
 * Prevents MIME type sniffing by enforcing strict Content-Type
 * Only valid value: nosniff
 * @param {string} value - Header value to validate
 * @returns {boolean} True if value is nosniff
 * @example
 * isValidMimeTypeOption('nosniff') // true
 * isValidMimeTypeOption('') // false
 */
export function isValidMimeTypeOption(value: string): boolean {
  return value === 'nosniff';
}

/**
 * Parses Strict-Transport-Security header and validates parameters
 * Format: max-age=<seconds>; includeSubDomains; preload
 * @param {string} header - HSTS header value
 * @returns {{ maxAge: number; includeSubDomains: boolean; preload: boolean }} Parsed values
 * @example
 * parseHSTS('max-age=31536000; includeSubDomains; preload')
 * // { maxAge: 31536000, includeSubDomains: true, preload: true }
 */
export function parseHSTS(header: string): {
  maxAge: number;
  includeSubDomains: boolean;
  preload: boolean;
} {
  const maxAgeMatch = header.match(/max-age=(\d+)/);
  const includeSubDomains = header.includes('includeSubDomains');
  const preload = header.includes('preload');

  return {
    maxAge: maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0,
    includeSubDomains,
    preload,
  };
}

/**
 * Validates HSTS configuration for preload list eligibility
 * Requirements: max-age >= 1 year, includeSubDomains, preload directive
 * @param {string} header - HSTS header value
 * @returns {boolean} True if eligible for HSTS preload list
 * @example
 * isEligibleForPreload('max-age=31536000; includeSubDomains; preload') // true
 */
export function isEligibleForPreload(header: string): boolean {
  const parsed = parseHSTS(header);
  const minAge = 31536000; // 1 year in seconds
  return parsed.maxAge >= minAge && parsed.includeSubDomains && parsed.preload;
}

/**
 * Checks if Referrer-Policy is secure (not exposing excessive information)
 * Recommends: no-referrer, strict-origin, strict-origin-when-cross-origin
 * Avoids: unsafe-url, no-referrer-when-downgrade
 * @param {string} policy - Referrer-Policy value
 * @returns {boolean} True if policy is secure
 * @example
 * isSecureReferrerPolicy('strict-origin-when-cross-origin') // true
 * isSecureReferrerPolicy('unsafe-url') // false
 */
export function isSecureReferrerPolicy(policy: string): boolean {
  const recommendedPolicies = [
    'no-referrer',
    'strict-no-referrer',
    'strict-origin',
    'strict-origin-when-cross-origin',
    'same-origin',
  ];
  return recommendedPolicies.includes(policy);
}

/**
 * Chooses appropriate Referrer-Policy based on content type
 * Sensitive content (auth, user data) gets stricter policy
 * @param {string} contentType - Type of content (authentication, user-data, public, etc.)
 * @returns {string} Recommended Referrer-Policy value
 * @example
 * choosePolicyForContent('authentication') // 'strict-origin-when-cross-origin'
 * choosePolicyForContent('public') // 'same-origin'
 */
export function choosePolicyForContent(contentType: string): string {
  const sensitiveTypes = ['authentication', 'user-data', 'api-key', 'payment'];

  if (sensitiveTypes.includes(contentType)) {
    return 'strict-origin-when-cross-origin'; // Strictest: don't leak path/query
  }

  return 'same-origin'; // Default for general content
}

/**
 * Formats Permissions-Policy header from policy object
 * Format: feature1=(self), feature2=(), feature3=(self "https://example.com")
 * @param {Record<string, string[]>} policies - Feature policies keyed by feature name
 * @returns {string} Formatted Permissions-Policy header value
 * @example
 * formatPermissionsPolicy({ geolocation: ['(self)'], camera: [] })
 * // 'geolocation=((self)), camera=()'
 */
export function formatPermissionsPolicy(policies: Record<string, string[]>): string {
  return Object.entries(policies)
    .map(([feature, allowedOrigins]) => {
      if (allowedOrigins.length === 0) {
        return `${feature}=()`;
      }

      const origins = allowedOrigins.map((o) => (o === '(self)' ? o : `"${o}"`));
      return `${feature}=(${origins.join(' ')})`;
    })
    .join(', ');
}

/**
 * Validates X-XSS-Protection header value
 * Should be: 1; mode=block (enable protection and block on detection)
 * Never set to 0 (disabled protection)
 * @param {string} headerValue - Header value to validate
 * @returns {boolean} True if header enables XSS protection
 * @example
 * isXSSProtected('1; mode=block') // true
 * isXSSProtected('0') // false
 */
export function isXSSProtected(headerValue: string): boolean {
  return headerValue.startsWith('1') && headerValue.includes('mode=block');
}

/**
 * Determines if response should be cached based on content type and auth status
 * Sensitive/authenticated responses should not be cached
 * @param {string} contentType - HTTP Content-Type header value
 * @param {boolean} isAuthenticated - Whether response is for authenticated request
 * @returns {boolean} True if caching is appropriate
 * @example
 * shouldCacheResponse('text/css', false) // true (public, static)
 * shouldCacheResponse('application/json', true) // false (authenticated)
 */
export function shouldCacheResponse(contentType: string, isAuthenticated: boolean): boolean {
  // Don't cache authenticated responses
  if (isAuthenticated) {
    return false;
  }

  // Don't cache dynamic/API responses
  const uncacheableTypes = ['application/json', 'application/x-www-form-urlencoded'];
  return !uncacheableTypes.includes(contentType);
}

/**
 * Validates response headers for consistency and security
 * Checks for conflicting header values (e.g., HSTS with max-age=0)
 * @param {Record<string, string>} headers - Response headers as key-value pairs
 * @returns {boolean} True if all headers are consistent and valid
 * @example
 * validateHeaderConsistency({
 *   'X-Frame-Options': 'DENY',
 *   'Strict-Transport-Security': 'max-age=31536000'
 * }) // true
 */
export function validateHeaderConsistency(headers: Record<string, string>): boolean {
  // Check for HSTS trying to disable (max-age=0)
  if (headers['Strict-Transport-Security']?.includes('max-age=0')) {
    return false; // Conflict: trying to disable HSTS
  }

  // Check for negative max-age
  const hstsMatch = headers['Strict-Transport-Security']?.match(/max-age=(-?\d+)/);
  if (hstsMatch && parseInt(hstsMatch[1], 10) < 0) {
    return false;
  }

  // Check for conflicting frame options
  const frameOptions = headers['X-Frame-Options'];
  if (frameOptions && !isValidFrameOptions(frameOptions)) {
    return false;
  }

  return true;
}

/**
 * Checks if all critical security headers are present in response
 * Critical headers: X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, Permissions-Policy
 * @param {Map<string, string>} headers - Response headers
 * @returns {{ missing: string[]; present: string[] }} Lists of missing and present headers
 * @example
 * checkCriticalHeaders(new Map([['X-Frame-Options', 'DENY']]))
 * // { missing: ['X-Content-Type-Options', ...], present: ['X-Frame-Options'] }
 */
export function checkCriticalHeaders(headers: Map<string, string>): {
  missing: string[];
  present: string[];
} {
  const requiredHeaders = [
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Strict-Transport-Security',
    'Referrer-Policy',
    'Permissions-Policy',
  ];

  const present = requiredHeaders.filter((header) => headers.has(header) && headers.get(header));
  const missing = requiredHeaders.filter((header) => !present.includes(header));

  return { missing, present };
}
