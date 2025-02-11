// src/main.tsx

/*
   Entry Point of the Application
   - Initializes the React app and attaches it to the DOM.
   - Loads essential configurations, including internationalization and global styles.
   - Uses React's StrictMode for enhanced debugging and best practices.
*/

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Import i18n configuration for multi-language support
import './i18n';

// Import global styles including Tailwind CSS
import './index.css';

// Import the main App component
import App from './App.tsx';

// Select the root element in the DOM and render the application
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

