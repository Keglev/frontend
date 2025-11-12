# i18n Testing & Validation

## Test Setup

### Testing Configuration

```typescript
// vitest.config.ts or jest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
  }
});
```

### Test Setup File

```typescript
// src/__tests__/setup.ts
import i18n from '../i18n';
import { beforeAll, afterEach } from 'vitest';

beforeAll(async () => {
  // Initialize i18n for tests
  await i18n.init({
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });
});

afterEach(() => {
  // Reset to English after each test
  i18n.changeLanguage('en');
});
```

### Importing i18n in Tests

```typescript
import { useTranslation } from 'react-i18next';
import { renderHook } from '@testing-library/react';
import i18n from '../../i18n';

// Tests can use i18n directly
```

---

## Testing Translation Keys

### Test 1: Verify Key Existence

```typescript
import { describe, it, expect } from 'vitest';
import i18n from '../../i18n';

describe('Translation Keys Exist', () => {
  it('should have header.title in English', () => {
    const translation = i18n.t('header.title');
    expect(translation).not.toBe('header.title');
    // If key doesn't exist, i18n returns the key itself
  });
  
  it('should have header.title in German', async () => {
    await i18n.changeLanguage('de');
    const translation = i18n.t('header.title');
    expect(translation).not.toBe('header.title');
  });
});
```

### Test 2: Verify Key Consistency

```typescript
describe('Translation Consistency', () => {
  it('English and German should have same keys', () => {
    const enKeys = Object.keys(flattenObject(enTranslations));
    const deKeys = Object.keys(flattenObject(deTranslations));
    
    const missingInDe = enKeys.filter(k => !deKeys.includes(k));
    const extraInDe = deKeys.filter(k => !enKeys.includes(k));
    
    expect(missingInDe).toHaveLength(0);
    expect(extraInDe).toHaveLength(0);
  });
});

// Helper to flatten nested objects
function flattenObject(obj, prefix = '') {
  let result = {};
  for (let key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object') {
      result = { ...result, ...flattenObject(obj[key], fullKey) };
    } else {
      result[fullKey] = obj[key];
    }
  }
  return result;
}
```

---

## Testing Components with Translations

### Test 3: Component Rendering with Translation

```typescript
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { describe, it, expect } from 'vitest';
import i18n from '../../i18n';
import { Header } from '../../components/Header';

describe('Header Component', () => {
  const renderWithI18n = (component) => {
    return render(
      <I18nextProvider i18n={i18n}>
        {component}
      </I18nextProvider>
    );
  };
  
  it('should render with English translations', () => {
    renderWithI18n(<Header />);
    const title = screen.getByText('Dashboard');  // English
    expect(title).toBeInTheDocument();
  });
  
  it('should render with German translations after language change', async () => {
    renderWithI18n(<Header />);
    
    // Change language
    await i18n.changeLanguage('de');
    
    const title = screen.getByText('Übersicht');  // German
    expect(title).toBeInTheDocument();
  });
});
```

### Test 4: useTranslation Hook

```typescript
import { renderHook, act } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

describe('useTranslation Hook', () => {
  it('should return translation function', () => {
    const { result } = renderHook(() => useTranslation());
    const { t } = result.current;
    
    expect(typeof t).toBe('function');
    expect(t('header.title')).toBe('Dashboard');
  });
  
  it('should update translation when language changes', async () => {
    const { result, rerender } = renderHook(() => useTranslation());
    
    expect(result.current.t('header.title')).toBe('Dashboard');
    
    await act(async () => {
      await i18n.changeLanguage('de');
    });
    
    rerender();
    expect(result.current.t('header.title')).toBe('Übersicht');
  });
  
  it('should return i18n instance', () => {
    const { result } = renderHook(() => useTranslation());
    const { i18n: i18nInstance } = result.current;
    
    expect(i18nInstance).toBeDefined();
    expect(i18nInstance.language).toBe('en');
  });
});
```

---

## Testing Interpolation

### Test 5: Variable Interpolation

```typescript
describe('Translation Interpolation', () => {
  it('should interpolate variables correctly', () => {
    const result = i18n.t('greeting', {
      name: 'John',
      app: 'StockEase'
    });
    
    expect(result).toContain('John');
    expect(result).toContain('StockEase');
  });
  
  it('should handle missing variables gracefully', () => {
    // If variables are missing, they appear in output
    const result = i18n.t('greeting', { name: 'John' });
    
    // Check that partial interpolation happened
    expect(result).toContain('John');
  });
});
```

---

## Testing Language Switching

### Test 6: Language Switcher Component

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';

describe('Language Switcher', () => {
  it('should change language when button clicked', async () => {
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );
    
    // Initial language: English
    expect(i18n.language).toBe('en');
    
    // Click German button
    const germanButton = screen.getByText('Deutsch');
    fireEvent.click(germanButton);
    
    // Language should change
    expect(i18n.language).toBe('de');
  });
  
  it('should update component text when language changes', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Header />
      </I18nextProvider>
    );
    
    // English version
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    
    // Change language
    await act(async () => {
      await i18n.changeLanguage('de');
    });
    
    // German version
    expect(screen.getByText('Übersicht')).toBeInTheDocument();
  });
});
```

---

## Testing localStorage Persistence

### Test 7: Language Persistence

```typescript
import { beforeEach, afterEach } from 'vitest';

describe('Language Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  
  afterEach(() => {
    localStorage.clear();
  });
  
  it('should save language to localStorage', async () => {
    await i18n.changeLanguage('de');
    
    const saved = localStorage.getItem('i18nextLng');
    expect(saved).toBe('de');
  });
  
  it('should restore language from localStorage on init', async () => {
    // Simulate previous session
    localStorage.setItem('i18nextLng', 'de');
    
    // Reinitialize i18n
    await i18n.init({
      lng: localStorage.getItem('i18nextLng') || 'en'
    });
    
    expect(i18n.language).toBe('de');
  });
});
```

---

## Testing Namespace Switching

### Test 8: Multiple Namespaces

```typescript
describe('i18n Namespaces', () => {
  it('should access default translation namespace', () => {
    const { result } = renderHook(() => useTranslation());
    const { t } = result.current;
    
    expect(t('header.title')).toBe('Dashboard');
  });
  
  it('should access help namespace', () => {
    const { result } = renderHook(() => useTranslation('help'));
    const { t } = result.current;
    
    const helpText = t('modal.getting_started');
    expect(helpText).toBeDefined();
    expect(helpText).not.toBe('modal.getting_started');
  });
  
  it('should use correct namespace in components', () => {
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <HelpModal isOpen={true} />
      </I18nextProvider>
    );
    
    // Help content should use 'help' namespace
    const helpTitle = screen.getByText(i18n.t('modal.title', {
      ns: 'help'
    }));
    
    expect(helpTitle).toBeInTheDocument();
  });
});
```

---

## End-to-End Testing Example

### Test 9: Complete User Flow

```typescript
describe('i18n Complete User Flow', () => {
  it('should handle complete language switch flow', async () => {
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    );
    
    // Step 1: Verify initial English content
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    
    // Step 2: Click language switcher
    const langButton = screen.getByRole('button', { name: /^🇬🇧/ });
    fireEvent.click(langButton);
    
    // Step 3: Select German
    const germanOption = screen.getByText('Deutsch');
    fireEvent.click(germanOption);
    
    // Step 4: Verify German content
    await waitFor(() => {
      expect(screen.getByText('Willkommen')).toBeInTheDocument();
    });
    
    // Step 5: Verify localStorage persisted
    expect(localStorage.getItem('i18nextLng')).toBe('de');
    
    // Step 6: Refresh and verify language persists
    // (In real e2e test with page reload)
  });
});
```

---

## Testing Best Practices

### ✅ DO:

```typescript
// Test key existence and correctness
it('should have valid translation keys', () => {
  expect(i18n.t('header.title')).not.toBe('header.title');
});

// Test multiple languages
['en', 'de'].forEach(lang => {
  it(`should support ${lang}`, () => {
    i18n.changeLanguage(lang);
    expect(i18n.language).toBe(lang);
  });
});

// Use I18nextProvider in render
const { getByText } = render(
  <I18nextProvider i18n={i18n}>
    <Component />
  </I18nextProvider>
);

// Test interpolation
it('should interpolate variables', () => {
  const result = i18n.t('greeting', { name: 'John' });
  expect(result).toContain('John');
});
```

### ❌ DON'T:

```typescript
// Don't hardcode translations in tests
expect(screen.getByText('Dashboard')).toBeInTheDocument();

// Don't skip language setup
render(<Component />);  // Missing I18nextProvider

// Don't ignore namespace switching
t('key');  // Unclear which namespace

// Don't forget to clean up
// Missing cleanup after each test
```

---

## Common Test Patterns

### Pattern 1: Snapshot Testing

```typescript
it('should render correctly in English', () => {
  i18n.changeLanguage('en');
  const { container } = render(
    <I18nextProvider i18n={i18n}>
      <Header />
    </I18nextProvider>
  );
  
  expect(container.firstChild).toMatchSnapshot();
});
```

### Pattern 2: Parametrized Testing

```typescript
describe.each([
  ['en', 'Dashboard', 'Welcome'],
  ['de', 'Übersicht', 'Willkommen']
])('Language: %s', (lang, dashTitle, welcome) => {
  it(`should show correct translations`, async () => {
    await i18n.changeLanguage(lang);
    expect(i18n.t('header.title')).toBe(dashTitle);
    expect(i18n.t('common.welcome')).toBe(welcome);
  });
});
```

### Pattern 3: Mock Translation Responses

```typescript
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => `mock-${key}`,
    i18n: { language: 'en', changeLanguage: vi.fn() }
  })
}));

it('should work with mocked translations', () => {
  const result = t('header.title');
  expect(result).toBe('mock-header.title');
});
```

---

## Related Documentation

- [i18n Overview](./overview.md)
- [Configuration](./configuration.md)
- [Translation Files](./translation-files.md)
- [Language Detection](./language-detection.md)
- [Component Patterns](./component-patterns.md)

---

**Last Updated**: November 2025

