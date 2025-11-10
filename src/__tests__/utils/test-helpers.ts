/**
 * Test Helpers
 * Utility functions for common testing patterns
 * Note: These are helper function signatures to be used with testing-library in tests
 */

/**
 * Helper to check if an element is disabled
 */
export function isElementDisabled(element: HTMLElement): boolean {
  return element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true';
}

/**
 * Helper to get form values from inputs
 */
export function getFormValues(formElement: HTMLFormElement): Record<string, string | FormDataEntryValue> {
  const formData = new FormData(formElement);
  return Object.fromEntries(formData);
}

/**
 * Mock fetch responses
 */
export function mockFetchResponse(data: unknown, status: number = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

/**
 * Mock fetch error
 */
export function mockFetchError(message: string = 'Fetch error') {
  return Promise.reject(new Error(message));
}

/**
 * Test helper patterns - use these patterns in your tests:
 *
 * CLICK BY TEXT:
 *   const element = screen.getByText('Submit');
 *   await userEvent.click(element);
 *
 * TYPE IN INPUT:
 *   const input = screen.getByLabelText('Email');
 *   await userEvent.type(input, 'test@example.com');
 *
 * WAIT FOR ELEMENT:
 *   await waitFor(() => {
 *     expect(screen.getByText('Loaded')).toBeInTheDocument();
 *   });
 *
 * CLEAR INPUT:
 *   const input = screen.getByLabelText('Email') as HTMLInputElement;
 *   await userEvent.clear(input);
 */
