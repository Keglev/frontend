/**
 * @file xss-handlers-rendering.test.tsx
 * @description XSS prevention tests for event handlers, content rendering, and form inputs
 * @domain Frontend XSS Prevention & React Security
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import {
  ONCLICK_INJECTION,
  FORM_INPUT_XSS,
  FORM_INPUT_IMG_XSS,
  ROLE_INJECTION,
  TEST_ITEMS_WITH_XSS,
} from './xss-test-data';
import {
  Button,
  ItemList,
  RoleDisplay,
  Form,
  FormHandler,
} from './xss-test-helpers';
import { assertNoScriptTags } from './xss-test-utils';

describe('XSS Prevention - Handlers, Rendering & Forms', () => {
  beforeEach(() => {
    console.warn = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // EVENT HANDLER SAFETY
  describe('Event Handler XSS Prevention', () => {
    it('should safely handle onClick with user input', () => {
      let clickedValue = '';
      const { container } = render(
        <Button
          value={ONCLICK_INJECTION}
          onClick={(val) => {
            clickedValue = val;
          }}
        />
      );
      const button = container.querySelector('button');

      // Click button - value is passed safely, not evaluated
      button?.click();
      expect(clickedValue).toBe(ONCLICK_INJECTION);
      expect(button?.getAttribute('onclick')).toBeNull();
    });

    it('should prevent code injection in event handlers', () => {
      const TestComponent: React.FC = () => {
        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
          event.target.value;

        return (
          <input
            onChange={handleChange}
            data-testid="input"
            defaultValue="safe"
          />
        );
      };

      const { container } = render(<TestComponent />);
      const input = container.querySelector('input');

      // Handler exists but doesn't evaluate input as code
      expect(input).toBeDefined();
      expect(typeof input?.onchange).not.toBe('function');
    });
  });

  // SAFE CONTENT RENDERING
  describe('Safe Content Rendering Patterns', () => {
    it('should safely render lists with user-generated content', () => {
      const { container } = render(<ItemList items={TEST_ITEMS_WITH_XSS} />);
      const listItems = container.querySelectorAll('li');

      // All items rendered safely
      expect(listItems.length).toBe(3);
      expect(listItems[0]?.textContent).toContain('<script>');
      expect(listItems[2]?.textContent).toContain('"><svg');
      assertNoScriptTags(container);
    });

    it('should safely render conditional content', () => {
      const { container } = render(<RoleDisplay role={ROLE_INJECTION} />);

      // Conditional logic works, but role is escaped
      expect(container.textContent).toContain('Role:');
      expect(container.querySelector('p')?.textContent).toContain(ROLE_INJECTION);
      assertNoScriptTags(container);
    });
  });

  // FORM INPUT SAFETY
  describe('Form Input Safety', () => {
    it('should safely handle form input values', () => {
      const { container, getByTestId } = render(<Form />);
      const input = container.querySelector('input') as HTMLInputElement;

      // Simulate user input with XSS attempt
      fireEvent.change(input, { target: { value: FORM_INPUT_XSS } });

      const output = getByTestId('output');
      expect(input.value).toBe(FORM_INPUT_XSS);
      expect(output.textContent).toBe(FORM_INPUT_XSS);
      assertNoScriptTags(container);
    });

    it('should prevent XSS in form submission data', () => {
      const { container, getByTestId } = render(<FormHandler />);
      const input = container.querySelector('input') as HTMLInputElement;
      const button = container.querySelector('button');

      // Set malicious input and submit
      fireEvent.change(input, { target: { value: FORM_INPUT_IMG_XSS } });
      fireEvent.click(button!);

      const result = getByTestId('result');
      expect(result.textContent).toBe(FORM_INPUT_IMG_XSS);
      expect(container.querySelectorAll('img').length).toBe(0);
      assertNoScriptTags(container);
    });
  });
});
