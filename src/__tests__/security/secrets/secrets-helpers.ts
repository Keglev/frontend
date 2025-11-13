/**
 * @file secrets-helpers.ts
 * @description Environment variable and secrets management helper functions
 * Provides utilities for validating, redacting, and securing sensitive data
 * @domain Secrets & Environment Variable Security
 */

/**
 * Validates VITE environment variables are only VITE_ prefixed
 * Vite only exposes variables starting with VITE_ to client bundles
 * Secret variables should never be VITE_ prefixed
 * @param {string[]} allKeys - All environment variable keys
 * @returns {{ valid: boolean; secretsExposed: string[] }} Validation result
 * @example
 * validateViteExposure(['VITE_API_URL', 'DATABASE_PASSWORD'])
 * // { valid: true, secretsExposed: [] }
 */
export function validateViteExposure(allKeys: string[]): {
  valid: boolean;
  secretsExposed: string[];
} {
  const secretPatterns = ['SECRET', 'PRIVATE', 'PASSWORD', 'KEY', 'TOKEN'];
  const secretsExposed: string[] = [];

  allKeys.forEach((key) => {
    const isViteExposed = key.startsWith('VITE_');
    const isSensitive = secretPatterns.some((pattern) => key.includes(pattern));

    // If both exposed AND sensitive, it's a problem
    if (isViteExposed && isSensitive) {
      secretsExposed.push(key);
    }
  });

  return {
    valid: secretsExposed.length === 0,
    secretsExposed,
  };
}

/**
 * Validates API base URL is safe (HTTPS/HTTP only, no javascript://)
 * Prevents javascript:, data:, file:// URL schemes
 * @param {string | undefined} url - URL to validate
 * @returns {{ valid: boolean; reason?: string }} Validation result with reason if invalid
 * @example
 * validateApiUrl('https://api.example.com') // { valid: true }
 * validateApiUrl('javascript:alert()') // { valid: false, reason: "..." }
 */
export function validateApiUrl(url?: string): { valid: boolean; reason?: string } {
  if (!url) {
    return { valid: false, reason: 'API URL not configured' };
  }

  try {
    const urlObj = new URL(url);

    // Verify: URL is absolute with protocol
    if (!urlObj.protocol) {
      return { valid: false, reason: 'API URL must be absolute' };
    }

    // Verify: Only HTTP/HTTPS allowed
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        valid: false,
        reason: `Invalid protocol: ${urlObj.protocol}`,
      };
    }

    // Verify: Port is valid if specified
    if (urlObj.port && isNaN(parseInt(urlObj.port))) {
      return { valid: false, reason: 'Invalid port number' };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }
}

/**
 * Redacts sensitive tokens and credentials from error messages
 * Replaces: Bearer tokens, JWT tokens, passwords, API keys, emails
 * @param {string} message - Error message to redact
 * @returns {string} Message with sensitive data replaced
 * @example
 * redactSensitiveData('Bearer my-secret-token')
 * // 'Bearer [REDACTED]'
 */
export function redactSensitiveData(message: string): string {
  let redacted = message;

  // Remove Bearer tokens
  redacted = redacted.replace(/Bearer\s+[\w-.]+/gi, 'Bearer [REDACTED]');

  // Remove generic tokens
  redacted = redacted.replace(/token['":=\s]+[\w-.]+/gi, 'token: [REDACTED]');

  // Remove passwords
  redacted = redacted.replace(/password['":=\s]+[^\s,}]+/gi, 'password: [REDACTED]');

  // Remove API keys
  redacted = redacted.replace(
    /api[_-]?key['":=\s]+[^\s,}]+/gi,
    'api_key: [REDACTED]'
  );

  // Remove emails
  redacted = redacted.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]');

  return redacted;
}

/**
 * Checks if API response contains sensitive data that should not be logged
 * Sensitive keys: password, token, secret, apiKey, privateKey
 * @param {Record<string, unknown>} data - Response data object
 * @returns {boolean} True if response is safe to log
 * @example
 * shouldLogResponse({ name: 'John' }) // true
 * shouldLogResponse({ token: 'secret' }) // false
 */
export function shouldLogResponse(data?: Record<string, unknown>): boolean {
  if (!data) return true;

  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'privateKey'];

  return !sensitiveKeys.some((key) => Object.keys(data).includes(key));
}

/**
 * Removes JWT and Bearer tokens from stack traces
 * Prevents token leakage in error logging
 * @param {string} stackTrace - Error stack trace
 * @returns {string} Stack trace with tokens removed
 * @example
 * sanitizeStackTrace('at fn() with token: eyJhbGc...')
 * // 'at fn() with token: [JWT_REDACTED]'
 */
export function sanitizeStackTrace(stackTrace: string): string {
  let sanitized = stackTrace;

  // Remove Bearer tokens
  sanitized = sanitized.replace(/Bearer\s+[\w-.]+/g, 'Bearer [REDACTED]');

  // Remove JWT tokens (format: base64.base64.base64)
  sanitized = sanitized.replace(
    /[\w-]{20,}\.[\w-]{20,}\.[\w-]{20,}/g,
    '[JWT_REDACTED]'
  );

  return sanitized;
}

/**
 * Sanitizes error messages by removing credentials from URLs
 * Also removes API keys from query parameters
 * @param {string} message - Error message potentially containing URLs
 * @returns {string} Sanitized message
 * @example
 * sanitizeErrorMessage('https://user:pass@api.com/api?api_key=secret')
 * // 'https://[REDACTED]@[HOST]/?api_key=[REDACTED]'
 */
export function sanitizeErrorMessage(message: string): string {
  let sanitized = message;

  // Remove credentials from URLs
  sanitized = sanitized.replace(
    /https?:\/\/[^@]+@[^/]+\//g,
    'https://[REDACTED]@[HOST]/'
  );

  // Remove API keys from URLs
  sanitized = sanitized.replace(/[?&]api[_-]?key=[^&\s]+/gi, '?api_key=[REDACTED]');

  return sanitized;
}

/**
 * Converts technical error to user-facing error message
 * Hides implementation details while enabling backend logging
 * @param {string} technicalError - Technical error message
 * @returns {{ message: string; shouldLog: boolean }} User message and logging flag
 * @example
 * userFacingError('ERROR: PostgreSQL database...')
 * // { message: 'An error occurred...', shouldLog: true }
 */
export function userFacingError(technicalError: string): {
  message: string;
  shouldLog: boolean;
} {
  // Patterns that reveal sensitive technical details
  const sensitivePatterns = [
    /database/i,
    /sql/i,
    /password/i,
    /token/i,
    /secret/i,
    /api_key/i,
    /\/home\//,
    /\/var\/www\//,
    /table\s+\w+/i, // SQL table names like "table users"
  ];

  const hasSensitiveDetails = sensitivePatterns.some((pattern) =>
    pattern.test(technicalError)
  );

  if (hasSensitiveDetails) {
    return {
      message: 'An error occurred. Please try again.',
      shouldLog: true, // Log to backend for investigation
    };
  }

  return {
    message: technicalError,
    shouldLog: false,
  };
}

/**
 * Validates if variable name is safe to expose to client
 * Secret keywords should not be VITE_ prefixed
 * @param {string} varName - Environment variable name
 * @returns {boolean} True if variable is safe to expose
 * @example
 * isSecretSafeVariable('VITE_API_URL') // true
 * isSecretSafeVariable('VITE_API_SECRET') // false
 */
export function isSecretSafeVariable(varName: string): boolean {
  const dangerousPatterns = [
    'SECRET',
    'PRIVATE',
    'PASSWORD',
    'API_KEY',
    'TOKEN',
  ];

  const isSensitive = dangerousPatterns.some((pattern) =>
    varName.toUpperCase().includes(pattern)
  );

  if (isSensitive) {
    // Sensitive variable should NOT be VITE_ exposed
    return !varName.startsWith('VITE_');
  }

  return true;
}

/**
 * Validates only necessary VITE_ variables are exposed
 * Allowed list: API_BASE_URL, APP_NAME, APP_VERSION, ENABLE_DEBUG
 * @param {string} varName - Variable name to check
 * @returns {boolean} True if variable is in allowed list or safe
 * @example
 * isAllowedViteVar('VITE_API_BASE_URL') // true
 * isAllowedViteVar('VITE_SECRET') // false
 */
export function isAllowedViteVar(varName: string): boolean {
  const allowedViteVars = [
    'VITE_API_BASE_URL',
    'VITE_APP_NAME',
    'VITE_APP_VERSION',
    'VITE_ENABLE_DEBUG',
  ];

  // Check if matches allowed list
  if (allowedViteVars.some((allowed) => varName === allowed)) {
    return true;
  }

  // Check if it's not a secret variable
  const isKnown =
    !['SECRET', 'PRIVATE', 'PASSWORD', 'KEY'].some((sensitive) =>
      varName.includes(sensitive)
    );

  return isKnown;
}

/**
 * Validates Docker build arguments do not expose secrets
 * Secrets visible in docker inspect, so should not be build args
 * @param {string} argName - Docker build argument name
 * @returns {boolean} True if safe to use as build arg
 * @example
 * isSecureDockerArg('VITE_API_BASE_URL') // true
 * isSecureDockerArg('GITHUB_TOKEN') // false
 */
export function isSecureDockerArg(argName: string): boolean {
  const sensitiveArgs = [
    'GITHUB_TOKEN',
    'NPM_TOKEN',
    'DOCKER_USERNAME',
    'DOCKER_PASSWORD',
    'API_SECRET',
    'DB_PASSWORD',
    'DATABASE_PASSWORD',
    'SECRET_KEY',
  ];

  return !sensitiveArgs.includes(argName);
}
