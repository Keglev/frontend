// src/i18n.ts

/**
 * Initializes internationalization (i18n) for the application.
 * - Uses `i18next` for handling translations.
 * - Detects the user's preferred language via `i18next-browser-languagedetector`.
 * - Stores language preferences in `localStorage` for persistence.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import de from './locales/de.json';
import helpEn from './locales/help_en.json';
import helpDe from './locales/help_de.json';

// Extend global `window` object for debugging purposes
declare global {
  interface Window {
    i18next: typeof i18n;
  }
}

// Define available translation resources
const resources = {
  en: { translation: en, help: helpEn },
  de: { translation: de, help: helpDe },
};

i18n
  .use(LanguageDetector) // Detect user's language from browser or localStorage
  .use(initReactI18next) // Integrate with React
  .init({
    resources, // Load available translations
    fallbackLng: 'en', // Default language if no preference is found
    ns: ['translation', 'help'], // Define namespaces for translations
    defaultNS: 'translation', // Default namespace for general translations
    interpolation: {
      escapeValue: false, // Prevents escaping HTML entities (not needed for React)
    },
    detection: {
      order: ['localStorage', 'navigator'], // Check `localStorage` first, then browser settings
      caches: ['localStorage'], // Persist selected language in `localStorage`
    },
  });

// Ensure `localStorage` contains the correct language setting
const storedLanguage = localStorage.getItem('language') || 'en';
if (i18n.language !== storedLanguage) {
  i18n.changeLanguage(storedLanguage);
}

// Attach `i18next` instance to `window` for debugging in the console
window.i18next = i18n;

export default i18n;
