/**
 * @file csrf-mutation-protection.test.ts
 * @description Tests for CSRF protection on state-changing HTTP requests
 * Verifies POST, PUT, DELETE methods require CSRF tokens; GET is exempt
 * @domain API Security & CSRF Request Validation
 */

import { describe, it, expect } from 'vitest';
import { validateMutationRequest } from './csrf-helpers';

describe('Protecting State-Changing Requests', () => {
  /**
   * @test should require CSRF token for POST requests
   * POST is a state-changing method that must include CSRF token
   * Validates both success and failure cases
   */
  it('should require CSRF token for POST requests', () => {
    // POST without token - should fail
    const postWithoutToken = validateMutationRequest('POST');
    expect(postWithoutToken.valid).toBe(false);
    expect(postWithoutToken.error).toContain('requires CSRF token');

    // POST with token - should succeed
    const postWithToken = validateMutationRequest('POST', 'valid-token');
    expect(postWithToken.valid).toBe(true);
  });

  /**
   * @test should require CSRF token for PUT requests
   * PUT is a state-changing method (resource update) that must include CSRF token
   */
  it('should require CSRF token for PUT requests', () => {
    // PUT without token - should fail
    const putWithoutToken = validateMutationRequest('PUT');
    expect(putWithoutToken.valid).toBe(false);

    // PUT with token - should succeed
    const putWithToken = validateMutationRequest('PUT', 'valid-token');
    expect(putWithToken.valid).toBe(true);
  });

  /**
   * @test should require CSRF token for DELETE requests
   * DELETE is a state-changing method (resource removal) that must include CSRF token
   */
  it('should require CSRF token for DELETE requests', () => {
    // DELETE without token - should fail
    const deleteWithoutToken = validateMutationRequest('DELETE');
    expect(deleteWithoutToken.valid).toBe(false);

    // DELETE with token - should succeed
    const deleteWithToken = validateMutationRequest('DELETE', 'valid-token');
    expect(deleteWithToken.valid).toBe(true);
  });

  /**
   * @test should not require CSRF token for safe GET requests
   * GET, HEAD, OPTIONS are read-only safe methods exempt from CSRF requirement
   * Safe methods do not change server state and cannot be exploited by CSRF
   */
  it('should not require CSRF token for safe GET requests', () => {
    // GET without token is safe
    const getWithoutToken = validateMutationRequest('GET');
    expect(getWithoutToken.valid).toBe(true);

    // HEAD without token is safe
    const headWithoutToken = validateMutationRequest('HEAD');
    expect(headWithoutToken.valid).toBe(true);

    // OPTIONS without token is safe
    const optionsWithoutToken = validateMutationRequest('OPTIONS');
    expect(optionsWithoutToken.valid).toBe(true);
  });
});
