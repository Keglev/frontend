import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
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
    ns: ['translation', 'help'], // ✅ Ensure help namespace is loaded
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // ✅ Ensure language selection persists
    },
  });

// ✅ Ensure `localStorage` is correctly updated
const storedLanguage = localStorage.getItem('language') || 'en';
if (i18n.language !== storedLanguage) {
  i18n.changeLanguage(storedLanguage);
}

window.i18next = i18n; // ✅ Attach to `window` for debugging

export default i18n;
