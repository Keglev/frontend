/**
 * XSS Test Assertions & Utilities
 * @description Helper functions for validating XSS prevention in tests
 */

/**
 * Validates that element contains escaped HTML entities
 * @param innerHTML - Inner HTML to check
 * @param pattern - Pattern that should be escaped
 */
export function assertEscaped(innerHTML: string, pattern: string): void {
  expect(innerHTML).toContain(`&lt;${pattern}`);
  expect(innerHTML).not.toContain(`<${pattern}`);
}

/**
 * Validates that no dangerous tags exist in DOM
 * @param container - DOM container to check
 * @param tags - Tag names to verify absence of
 */
export function assertNoScriptTags(
  container: Element,
  tags: string[] = ['script', 'img']
): void {
  tags.forEach((tag) => {
    expect(container.querySelectorAll(tag).length).toBe(0);
  });
}
