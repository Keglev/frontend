import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import en from './locales/en.json';
import de from './locales/de.json';

// Import help section translations
import helpEn from './locales/help_en.json';
import helpDe from './locales/help_de.json';

const resources = {
  en: { translation: en,
    help: helpEn,
   },
  de: { translation: de,
    help: helpDe,
   },
};

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Bind to React
  .init({
    resources,
    fallbackLng: 'en',
    ns: ['translation', 'help'],
    defaultNS: 'translation', // Default language
    interpolation: {
      escapeValue: false, // React already handles escaping
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
