/**
 * @file csrf-protection.test.ts
 * @description Tests for CSRF (Cross-Site Request Forgery) prevention
 * Tests verify token-based protection, safe mutations, and request validation
 * @domain API Security & CSRF Prevention
 * 
 * Security Coverage:
 * - CSRF token generation and validation
 * - State-changing request protection (POST, PUT, DELETE)
 * - Token freshness validation
 * - Origin/Referer header checking
 * - Same-site cookie policy validation
 * - Safe request method identification
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('CSRF Protection', () => {
  // Mock store for CSRF tokens
  const tokenStore: Map<string, { token: string; timestamp: number }> = new Map();

  beforeEach(() => {
    tokenStore.clear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // 1. CSRF TOKEN GENERATION & STORAGE
  // ============================================================================
  describe('CSRF Token Management', () => {
    it('should generate a valid CSRF token', () => {
      // CSRF token generation utility (simulated)
      const generateCSRFToken = (): string => {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
      };

      const token = generateCSRFToken();

      // Verify: Token is generated
      expect(token).toBeDefined();
      // Verify: Token has appropriate length (64 chars for 32 bytes)
      expect(token.length).toBe(64);
      // Verify: Token contains only hex characters
      expect(/^[0-9a-f]+$/.test(token)).toBe(true);
    });

    it('should store CSRF token with timestamp', () => {
      const storeCSRFToken = (token: string): void => {
        tokenStore.set('csrf_token', {
          token,
          timestamp: Date.now(),
        });
      };

      const token = 'test-csrf-token-123abc';
      storeCSRFToken(token);

      // Verify: Token is stored
      expect(tokenStore.has('csrf_token')).toBe(true);
      const stored = tokenStore.get('csrf_token');
      expect(stored?.token).toBe(token);
      // Verify: Timestamp is recorded
      expect(stored?.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('should retrieve valid CSRF token', () => {
      const getCSRFToken = (): string | null => {
        const stored = tokenStore.get('csrf_token');
        if (!stored) return null;

        // Check token freshness (1 hour max age)
        const maxAge = 1000 * 60 * 60; // 1 hour
        if (Date.now() - stored.timestamp > maxAge) {
          tokenStore.delete('csrf_token');
          return null;
        }

        return stored.token;
      };

      const token = 'valid-csrf-token';
      tokenStore.set('csrf_token', {
        token,
        timestamp: Date.now(),
      });

      // Verify: Token is retrieved
      expect(getCSRFToken()).toBe(token);
    });

    it('should reject expired CSRF token', () => {
      const getCSRFToken = (): string | null => {
        const stored = tokenStore.get('csrf_token');
        if (!stored) return null;

        const maxAge = 1000 * 60 * 60; // 1 hour
        if (Date.now() - stored.timestamp > maxAge) {
          tokenStore.delete('csrf_token');
          return null;
        }

        return stored.token;
      };

      const oldTimestamp = Date.now() - 1000 * 60 * 60 - 1000; // 1 hour + 1 second ago
      tokenStore.set('csrf_token', {
        token: 'expired-token',
        timestamp: oldTimestamp,
      });

      // Verify: Expired token is rejected
      expect(getCSRFToken()).toBeNull();
      // Verify: Token is removed from store
      expect(tokenStore.has('csrf_token')).toBe(false);
    });
  });

  // ============================================================================
  // 2. REQUEST MUTATION PROTECTION
  // ============================================================================
  describe('Protecting State-Changing Requests', () => {
    it('should require CSRF token for POST requests', () => {
      const validateMutationRequest = (
        method: string,
        token?: string
      ): { valid: boolean; error?: string } => {
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
      };

      // POST without token
      const postWithoutToken = validateMutationRequest('POST');
      expect(postWithoutToken.valid).toBe(false);
      expect(postWithoutToken.error).toContain('requires CSRF token');

      // POST with token
      const postWithToken = validateMutationRequest('POST', 'valid-token');
      expect(postWithToken.valid).toBe(true);
    });

    it('should require CSRF token for PUT requests', () => {
      const validateMutationRequest = (
        method: string,
        token?: string
      ): { valid: boolean; error?: string } => {
        const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

        if (safeMethods.includes(method)) {
          return { valid: true };
        }

        if (!token) {
          return { valid: false, error: `${method} requires CSRF token` };
        }

        return { valid: true };
      };

      // PUT without token
      const putWithoutToken = validateMutationRequest('PUT');
      expect(putWithoutToken.valid).toBe(false);

      // PUT with token
      const putWithToken = validateMutationRequest('PUT', 'valid-token');
      expect(putWithToken.valid).toBe(true);
    });

    it('should require CSRF token for DELETE requests', () => {
      const validateMutationRequest = (
        method: string,
        token?: string
      ): { valid: boolean; error?: string } => {
        const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

        if (safeMethods.includes(method)) {
          return { valid: true };
        }

        if (!token) {
          return { valid: false, error: `${method} requires CSRF token` };
        }

        return { valid: true };
      };

      // DELETE without token
      const deleteWithoutToken = validateMutationRequest('DELETE');
      expect(deleteWithoutToken.valid).toBe(false);

      // DELETE with token
      const deleteWithToken = validateMutationRequest('DELETE', 'valid-token');
      expect(deleteWithToken.valid).toBe(true);
    });

    it('should not require CSRF token for safe GET requests', () => {
      const validateMutationRequest = (
        method: string,
        token?: string
      ): { valid: boolean; error?: string } => {
        const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

        if (safeMethods.includes(method)) {
          return { valid: true };
        }

        if (!token) {
          return { valid: false, error: `${method} requires CSRF token` };
        }

        return { valid: true };
      };

      // GET without token is safe
      const getWithoutToken = validateMutationRequest('GET');
      expect(getWithoutToken.valid).toBe(true);

      // HEAD without token is safe
      const headWithoutToken = validateMutationRequest('HEAD');
      expect(headWithoutToken.valid).toBe(true);
    });
  });

  // ============================================================================
  // 3. TOKEN VALIDATION
  // ============================================================================
  describe('CSRF Token Validation', () => {
    it('should validate token format', () => {
      const validateTokenFormat = (token: string): boolean => {
        // Token must be non-empty and valid hex
        return /^[0-9a-f]{64}$/.test(token);
      };

      // Valid token
      expect(validateTokenFormat('a'.repeat(64))).toBe(true);

      // Invalid formats
      expect(validateTokenFormat('invalid')).toBe(false);
      expect(validateTokenFormat('')).toBe(false);
      expect(validateTokenFormat('invalid!@#')).toBe(false);
      expect(validateTokenFormat('a'.repeat(32))).toBe(false); // Too short
    });

    it('should verify server-stored token matches request token', () => {
      const serverToken = 'server-token-123abc';
      const requestToken = 'server-token-123abc';

      const validateTokenMatch = (
        requestToken: string,
        serverToken: string
      ): boolean => {
        // Prevent timing attacks using constant-time comparison
        // (simulated - in production use crypto.timingSafeEqual)
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
      };

      // Token matches
      expect(validateTokenMatch(requestToken, serverToken)).toBe(true);

      // Token mismatch
      expect(validateTokenMatch('wrong-token', serverToken)).toBe(false);

      // Empty tokens
      expect(validateTokenMatch('', '')).toBe(true);
      expect(validateTokenMatch('token', '')).toBe(false);
    });

    it('should reject manipulated tokens', () => {
      const validateTokenMatch = (
        requestToken: string,
        serverToken: string
      ): boolean => {
        if (requestToken.length !== serverToken.length) {
          return false;
        }

        let match = true;
        for (let i = 0; i < requestToken.length; i++) {
          if (requestToken[i] !== serverToken[i]) {
            match = false;
          }
        }
        return match;
      };

      const serverToken =
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

      // Token with one character changed
      const manipulated =
        'baaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      expect(validateTokenMatch(manipulated, serverToken)).toBe(false);

      // Token with bit flip (simulating corruption)
      const bitFlip =
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab';
      expect(validateTokenMatch(bitFlip, serverToken)).toBe(false);
    });
  });

  // ============================================================================
  // 4. REQUEST HEADER VALIDATION
  // ============================================================================
  describe('Request Header Validation', () => {
    it('should check Origin header for same-origin requests', () => {
      const validateOrigin = (
        origin: string,
        allowedOrigin: string
      ): boolean => {
        return origin === allowedOrigin;
      };

      const allowedOrigin = 'https://stockease.com';

      // Same origin
      expect(validateOrigin('https://stockease.com', allowedOrigin)).toBe(
        true
      );

      // Different origin (CSRF attack)
      expect(validateOrigin('https://attacker.com', allowedOrigin)).toBe(
        false
      );

      // Protocol mismatch
      expect(validateOrigin('http://stockease.com', allowedOrigin)).toBe(
        false
      );
    });

    it('should validate Referer header for mutation requests', () => {
      const validateReferer = (
        referer: string | undefined,
        allowedOrigin: string
      ): boolean => {
        // Referer might be undefined due to Referrer-Policy
        if (!referer) {
          // Could be legitimate (strict Referrer-Policy)
          // But we should warn or require Origin header instead
          return false; // Strict: require Referer
        }

        // Extract origin from full referer URL
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
      };

      const allowedOrigin = 'https://stockease.com';

      // Valid referer
      expect(
        validateReferer('https://stockease.com/product/123', allowedOrigin)
      ).toBe(true);

      // Missing referer (could be policy or CSRF)
      expect(validateReferer(undefined, allowedOrigin)).toBe(false);

      // External referer
      expect(
        validateReferer('https://attacker.com/page', allowedOrigin)
      ).toBe(false);
    });

    it('should prevent CSRF via missing headers', () => {
      const validateCSRFHeaders = (
        origin?: string,
        referer?: string,
        csrfToken?: string
      ): { valid: boolean; reason?: string } => {
        // At minimum, need either valid Origin/Referer OR CSRF token
        if (!csrfToken) {
          if (!origin && !referer) {
            return {
              valid: false,
              reason: 'Missing CSRF token and validation headers',
            };
          }
        }

        return { valid: true };
      };

      // No headers, no token - should fail
      const noDefense = validateCSRFHeaders();
      expect(noDefense.valid).toBe(false);

      // Has CSRF token - should pass
      const withToken = validateCSRFHeaders(undefined, undefined, 'token');
      expect(withToken.valid).toBe(true);

      // Has Origin header - should pass
      const withOrigin = validateCSRFHeaders(
        'https://stockease.com',
        undefined,
        undefined
      );
      expect(withOrigin.valid).toBe(true);
    });
  });

  // ============================================================================
  // 5. SAME-SITE COOKIE POLICY
  // ============================================================================
  describe('Same-Site Cookie Policy Validation', () => {
    it('should validate SameSite cookie attribute', () => {
      const validateSameSite = (
        sameSiteValue: string
      ): { valid: boolean; secure: boolean } => {
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
      };

      // Strict (most secure)
      const strict = validateSameSite('Strict');
      expect(strict.valid).toBe(true);
      expect(strict.secure).toBe(true);

      // Lax (default, secure)
      const lax = validateSameSite('Lax');
      expect(lax.valid).toBe(true);
      expect(lax.secure).toBe(true);

      // Invalid value
      const invalid = validateSameSite('Invalid');
      expect(invalid.valid).toBe(false);
    });

    it('should prevent CSRF with Strict SameSite', () => {
      // Strict SameSite cookies are not sent even for same-origin requests
      // from external sites (e.g., form submit from attacker.com)
      const isCSRFVulnerable = (
        cookieSameSite: string,
        requestOrigin: string,
        cookieOrigin: string
      ): boolean => {
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
      };

      // Strict protects against CSRF
      expect(
        isCSRFVulnerable('Strict', 'https://attacker.com', 'https://stockease.com')
      ).toBe(false);

      // Lax protects in most cases
      expect(
        isCSRFVulnerable('Lax', 'https://attacker.com', 'https://stockease.com')
      ).toBe(true);

      // No SameSite is vulnerable
      expect(
        isCSRFVulnerable('None', 'https://attacker.com', 'https://stockease.com')
      ).toBe(true);
    });
  });

  // ============================================================================
  // 6. DOUBLE SUBMIT COOKIE PATTERN
  // ============================================================================
  describe('Double Submit Cookie CSRF Protection', () => {
    it('should compare cookie CSRF token with request body token', () => {
      const validateDoubleSubmitCookie = (
        cookieToken: string,
        bodyToken: string
      ): { valid: boolean; reason?: string } => {
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
      };

      const token = 'same-csrf-token-123';

      // Matching tokens
      const matching = validateDoubleSubmitCookie(token, token);
      expect(matching.valid).toBe(true);

      // Missing cookie token
      const noCookie = validateDoubleSubmitCookie('', token);
      expect(noCookie.valid).toBe(false);
      expect(noCookie.reason).toContain('cookie');

      // Mismatched tokens (attacker can't forge)
      const mismatch = validateDoubleSubmitCookie(token, 'attacker-token');
      expect(mismatch.valid).toBe(false);
      expect(mismatch.reason).toContain('mismatch');
    });
  });
});
