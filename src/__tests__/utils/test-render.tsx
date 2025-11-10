/**
 * Custom render function for testing React components
 * Wraps components with necessary providers (Redux, Router, i18n, etc.)
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

/**
 * Custom render function with all providers
 * Use this instead of render() in your tests
 */
export function renderWithProviders(
  ui: React.ReactElement,
  renderOptions?: Omit<RenderOptions, 'wrapper'>,
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        {/* Add providers here as needed:
            <Provider store={store}>
              <I18nextProvider i18n={i18n}>
                {children}
              </I18nextProvider>
            </Provider>
        */}
        {children}
      </BrowserRouter>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Re-export commonly used testing utilities
export { screen, waitFor, within } from '@testing-library/react';
