/**
 * @file i18n.ts
 * @description
 * Internationalization (i18n) configuration and initialization.
 *
 * **Features:**
 * - Multi-language support (English, German)
 * - Automatic language detection from browser/localStorage
 * - Persistent language preference storage
 * - Namespace-based translation organization
 * - Debug access via window.i18next
 *
 * **Namespaces:**
 * - `translation` - General application translations
 * - `help` - Help modal and documentation
 *
 * **Supported Languages:**
 * - `en` - English (fallback)
 * - `de` - Deutsch (German)
 *
 * **Detection Order:**
 * 1. localStorage (persisted user preference)
 * 2. Browser language settings (navigator)
 *
 * @module i18n
 * @requires i18next
 * @requires react-i18next
 * @requires i18next-browser-languagedetector
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import de from './locales/de.json';
import helpEn from './locales/help_en.json';
import helpDe from './locales/help_de.json';

declare global {
  interface Window {
    i18next: typeof i18n;
  }
}

const resources = {
  en: { translation: en, help: helpEn },
  de: { translation: de, help: helpDe },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    ns: ['translation', 'help'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

const storedLanguage = localStorage.getItem('language') || 'en';
if (i18n.language !== storedLanguage) {
  i18n.changeLanguage(storedLanguage);
}

window.i18next = i18n;

export default i18n;
