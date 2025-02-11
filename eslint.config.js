// eslint.config.js

import js from '@eslint/js'; // Import ESLint's standard JavaScript configurations
import globals from 'globals'; // Import global browser-related variables
import reactHooks from 'eslint-plugin-react-hooks'; // React Hooks plugin for enforcing best practices
import reactRefresh from 'eslint-plugin-react-refresh'; // Plugin for Fast Refresh in React development
import tseslint from 'typescript-eslint'; // TypeScript support for ESLint

export default tseslint.config(
  // Ignore 'dist' directory to prevent linting of built files
  { ignores: ['dist'] },

  {
    extends: [
      js.configs.recommended, // Use recommended ESLint rules for JavaScript
      ...tseslint.configs.recommended, // Use recommended TypeScript linting rules
    ],
    files: ['**/*.{ts,tsx}'], // Apply linting to all TypeScript and TSX files

    languageOptions: {
      ecmaVersion: 2020, // Set ECMAScript version for modern JavaScript features
      globals: globals.browser, // Enable browser-specific global variables (e.g., window, document)
    },

    plugins: {
      'react-hooks': reactHooks, // Enforce React Hooks rules (e.g., correct use of useEffect dependencies)
      'react-refresh': reactRefresh, // Enable Fast Refresh for React development
    },

    rules: {
      ...reactHooks.configs.recommended.rules, // Enforce recommended React Hooks rules

      'react-refresh/only-export-components': [
        'warn', // Warn if non-component exports are detected (helps Fast Refresh)
        { allowConstantExport: true }, // Allow constant values to be exported safely
      ],
    },
  }
);
