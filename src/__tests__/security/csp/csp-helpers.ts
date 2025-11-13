/**
 * CSP (Content Security Policy) Test Helpers
 *
 * Utility functions for parsing, validating, and analyzing CSP headers.
 * Centralizes common CSP validation logic used across test suites.
 *
 * @module csp-helpers.ts
 */

/**
 * Parses a CSP header string and validates its syntax.
 *
 * Checks for:
 * - Proper directive format (name followed by sources)
 * - Balanced quotes in values
 * - Valid directive structure
 *
 * @param header - The CSP header string to parse
 * @returns Object with validation status and list of errors found
 *
 * @example
 * ```ts
 * const result = parseCSPHeader("default-src 'self'; script-src 'self'");
 * // Returns: { valid: true, errors: [] }
 * ```
 */
export const parseCSPHeader = (header: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check for unmatched quotes
  const singleQuotes = (header.match(/'/g) || []).length;
  if (singleQuotes % 2 !== 0) {
    errors.push('Unmatched single quotes');
  }

  // Validate directive format: name + sources
  const directives = header.split(';').map((d) => d.trim()).filter(Boolean);
  directives.forEach((directive) => {
    if (!directive.match(/^[\w-]+(\s+[\w-'*:.]+)*$/)) {
      errors.push(`Invalid directive format: ${directive}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Evaluates the security level of a CSP policy.
 *
 * Considers restrictiveness of sources:
 * - 'none': most restrictive (100)
 * - 'self': restrictive (80)
 * - 'unsafe-inline', specific domains: moderate (50)
 * - wildcard '*': least restrictive (20)
 *
 * @param policy - The CSP directive string to evaluate
 * @returns Security score from 0-100 (higher = more secure)
 *
 * @example
 * ```ts
 * securityLevel("default-src 'self'");    // 80
 * securityLevel("default-src *");         // 20
 * ```
 */
export const securityLevel = (policy: string): number => {
  if (policy.includes("'none'")) return 100;
  if (policy.includes("'self'") && !policy.includes('*')) return 80;
  if (policy.includes('*')) return 20;
  return 50;
};

/**
 * Validates script-src directive for XSS prevention.
 *
 * Checks that script-src doesn't include unsafe patterns like:
 * - 'unsafe-eval' (allows eval())
 * - '*' (allows any script source)
 *
 * Note: 'unsafe-inline' is often unavoidable but should be minimized.
 *
 * @param directive - The script-src directive value
 * @returns true if the directive is reasonably secure
 *
 * @example
 * ```ts
 * isScriptSrcSecure("script-src 'self'");              // true
 * isScriptSrcSecure("script-src 'self' 'nonce-xyz'"); // true
 * isScriptSrcSecure("script-src 'unsafe-eval'");      // false
 * ```
 */
export const isScriptSrcSecure = (directive: string): boolean => {
  const insecurePatterns = ['unsafe-eval', '*'];
  return !insecurePatterns.some((pattern) => directive.includes(pattern));
};

/**
 * Validates and analyzes a style-src directive.
 *
 * Returns security status and any warnings found, such as:
 * - unsafe-eval usage
 * - Wildcard sources
 * - unsafe-inline usage
 *
 * @param directive - The style-src directive value
 * @returns Object with security status and warning messages
 *
 * @example
 * ```ts
 * const result = validateStyleSrc("style-src 'self' 'unsafe-inline'");
 * // Returns: { secure: false, warnings: ['unsafe-inline...'] }
 * ```
 */
export const validateStyleSrc = (directive: string): { secure: boolean; warnings: string[] } => {
  const warnings: string[] = [];

  if (directive.includes('unsafe-eval')) {
    warnings.push('unsafe-eval in style-src');
  }

  if (directive.includes('*')) {
    warnings.push('Wildcard in style-src allows any CSS origin');
  }

  if (directive.includes('unsafe-inline')) {
    warnings.push('unsafe-inline allows all inline styles');
  }

  return {
    secure: warnings.length === 0,
    warnings,
  };
};

/**
 * Determines if a CSP header name is valid.
 *
 * Valid headers:
 * - 'Content-Security-Policy' (enforce)
 * - 'Content-Security-Policy-Report-Only' (report violations without blocking)
 *
 * @param headerName - The header name to validate
 * @returns true if the header name is a valid CSP header
 *
 * @example
 * ```ts
 * isValidCSPHeaderName('Content-Security-Policy');           // true
 * isValidCSPHeaderName('Content-Security-Policy-Report-Only'); // true
 * isValidCSPHeaderName('X-Content-Security-Policy');         // false (deprecated)
 * ```
 */
export const isValidCSPHeaderName = (headerName: string): boolean => {
  const enforceHeader = 'Content-Security-Policy';
  const reportOnlyHeader = 'Content-Security-Policy-Report-Only';
  return headerName === enforceHeader || headerName === reportOnlyHeader;
};

/**
 * Validates a CSP violation report structure.
 *
 * Checks that report contains required fields:
 * - csp-report (object)
 * - violated-directive
 * - blocked-uri
 * - document-uri
 *
 * @param report - The violation report object to validate
 * @returns true if the report is valid
 *
 * @example
 * ```ts
 * const report = {
 *   'csp-report': {
 *     'violated-directive': 'script-src',
 *     'blocked-uri': 'https://evil.com/script.js',
 *     'document-uri': 'https://example.com'
 *   }
 * };
 * isValidViolationReport(report); // true
 * ```
 */
export const isValidViolationReport = (report: unknown): boolean => {
  if (typeof report !== 'object' || report === null) return false;

  const cspReport = report as Record<string, unknown>;
  if (!('csp-report' in cspReport)) return false;

  const details = cspReport['csp-report'] as Record<string, unknown>;
  return (
    'violated-directive' in details &&
    'blocked-uri' in details &&
    'document-uri' in details
  );
};

/**
 * Evaluates if script execution is allowed based on CSP and nonce.
 *
 * Rules:
 * - If CSP requires nonce (contains 'nonce-'), script must have matching nonce
 * - If no nonce requirement, script may execute based on other CSP rules
 *
 * @param cspPolicy - The CSP policy string
 * @param scriptHasNonce - Whether the script has a nonce attribute
 * @param nonceMatches - Whether the script's nonce matches CSP nonce
 * @returns true if the script would be allowed to execute
 *
 * @example
 * ```ts
 * evaluateScriptExecution("script-src 'nonce-abc'", true, true);  // true
 * evaluateScriptExecution("script-src 'nonce-abc'", false, false); // false
 * evaluateScriptExecution("script-src 'self'", true, false);       // true
 * ```
 */
export const evaluateScriptExecution = (
  cspPolicy: string,
  scriptHasNonce: boolean,
  nonceMatches: boolean
): boolean => {
  const requiresNonce = cspPolicy.includes("'nonce-");

  if (requiresNonce) {
    // Script only executes if it has matching nonce
    return scriptHasNonce && nonceMatches;
  }

  // If no nonce requirement, script executes (other CSP rules apply)
  return true;
};

/**
 * Counts occurrences of 'unsafe-inline' in a CSP policy.
 *
 * Used to track usage of insecure patterns and guide migration
 * towards nonce-based or hash-based security.
 *
 * @param policy - The CSP policy string
 * @returns Number of 'unsafe-inline' occurrences found
 *
 * @example
 * ```ts
 * countUnsafeInline("script-src 'unsafe-inline'; style-src 'unsafe-inline'"); // 2
 * countUnsafeInline("script-src 'self'"); // 0
 * ```
 */
export const countUnsafeInline = (policy: string): number => {
  const matches = policy.match(/'unsafe-inline'/g);
  return matches ? matches.length : 0;
};
