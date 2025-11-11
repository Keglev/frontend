/**
 * @file main.tsx
 * @description
 * Application entry point that initializes and renders the React application.
 *
 * **Responsibilities:**
 * - Bootstraps the React application using React 18's `createRoot`
 * - Enables React StrictMode for development and debugging
 * - Loads internationalization (i18n) configuration
 * - Imports global styles and Tailwind CSS
 * - Mounts the application to the DOM root element
 *
 * **Dependencies:**
 * - React (StrictMode, createRoot)
 * - App component (main application root)
 * - i18n.ts (internationalization setup)
 * - Tailwind CSS and global styles
 *
 * @module main
 * @requires react
 * @requires react-dom/client
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './i18n';
import './index.css';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element with id "root" not found in DOM');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

