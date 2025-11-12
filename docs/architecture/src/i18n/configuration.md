# i18n Configuration Setup

## Core Configuration (`src/i18n.ts`)

### Initialization Steps

```typescript
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import de from './locales/de.json';
import helpEn from './locales/help_en.json';
import helpDe from './locales/help_de.json';

// 1. Define resources
const resources = {
  en: {
    translation: en,
    help: helpEn,
  },
  de: {
    translation: de,
    help: helpDe,
  },
};

// 2. Initialize i18next
i18next
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
    debug: false,
  });

export default i18next;
```

---

## Language Detection Configuration

### Detection Order

```typescript
const detectionOptions = {
  order: ['localStorage', 'navigator'],
  caches: ['localStorage'],
};
```

**Priority**:
1. **localStorage** - User's previous choice (persisted)
2. **navigator.language** - Browser's language setting
3. **fallbackLng: 'en'** - Final fallback to English

### How It Works

```
Application Start
    ↓
LanguageDetector checks:
  1. localStorage['i18nextLng']?
     Yes → Use saved language
     No → Continue to step 2
  2. navigator.language?
     'de-DE' → Extract 'de'
     'en-US' → Extract 'en'
     No → Continue to step 3
  3. fallbackLng
     Use 'en'
    ↓
i18next initialized with selected language
    ↓
Components render with correct translations
```

---

## Resources Organization

### File Structure

```
src/locales/
├── en.json              # English UI translations
├── de.json              # German UI translations
├── help_en.json         # English help content
└── help_de.json         # German help content
```

### Namespace Configuration

```typescript
ns: ['translation', 'help']
defaultNS: 'translation'
```

This creates two namespaces:
- **translation** (default) - General app UI
- **help** - Help modal content

### Loading Translations

```typescript
// Access translation namespace (default)
const { t } = useTranslation();
t('login.title')  // Looks in 'translation' namespace

// Access help namespace explicitly
const { t: tHelp } = useTranslation('help');
tHelp('topics.search.title')  // Looks in 'help' namespace

// Or use namespace in key
const { t } = useTranslation();
t('help:topics.search.title')  // Explicitly specify 'help' namespace
```

---

## Configuration Options

### i18next.init() Options

```typescript
{
  // Resources
  resources: {
    en: { translation: {...}, help: {...} },
    de: { translation: {...}, help: {...} }
  },

  // Language settings
  fallbackLng: 'en',              // Final fallback
  supportedLngs: ['en', 'de'],    // Whitelist

  // Namespace settings
  ns: ['translation', 'help'],    // Available namespaces
  defaultNS: 'translation',       // Default namespace
  
  // Language detector settings
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage']
  },

  // Interpolation
  interpolation: {
    escapeValue: false             // React handles escaping
  },

  // Debug
  debug: false                     // Set true for debugging
}
```

---

## Using i18n in App.tsx

```typescript
import i18n from './i18n';
import { I18nextProvider } from 'react-i18next';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <div className="app">
          <Header />
          <Routes>
            {/* Routes */}
          </Routes>
        </div>
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
```

---

## Language Persistence

### Automatic Saving

When user changes language:

```typescript
const { i18n } = useTranslation();

// User clicks German button
i18n.changeLanguage('de');

// Automatically saved to localStorage
// localStorage['i18nextLng'] = 'de'
```

### Next Session

```
On page reload:
  1. LanguageDetector checks localStorage
  2. Finds 'de'
  3. Loads German translations
  4. All content displays in German
```

---

## Debug Mode

### Enable Debugging

```typescript
// In src/i18n.ts
.init({
  debug: true,  // Enable console logs
  // ...
})
```

**Console Output**:
```
i18next: initialized with language en
i18next: loaded namespace translation
i18next: loaded namespace help
i18next: changing language to de
i18next: loaded namespace translation de
```

### Verify Translation Loading

```typescript
import i18n from '@/i18n';

// Check loaded languages
console.log(i18n.language);        // Current language
console.log(i18n.languages);       // All available languages
console.log(i18n.ns);              // All namespaces

// Get specific translation
console.log(i18n.t('login.title')); // Get translation directly
```

---

## Common Configuration Patterns

### Development vs Production

```typescript
// Development (debug enabled)
const isDev = process.env.NODE_ENV === 'development';

.init({
  debug: isDev,
  fallbackLng: 'en',
  // ...
})
```

### Adding New Language

1. Add language code to `supportedLngs`:
```typescript
supportedLngs: ['en', 'de', 'fr'],
```

2. Add resources:
```typescript
const resources = {
  en: { translation: en, help: helpEn },
  de: { translation: de, help: helpDe },
  fr: { translation: fr, help: helpFr },  // New
};
```

3. Create translation files:
- `src/locales/fr.json`
- `src/locales/help_fr.json`

---

## Related Documentation

- [i18n Overview](./overview.md)
- [Translation Files](./translation-files.md)
- [Language Detection](./language-detection.md)
- [Component Patterns](./component-patterns.md)
- [Testing i18n](./testing.md)

---

**Last Updated**: November 2025

