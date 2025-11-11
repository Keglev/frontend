# Component Patterns & Usage

## useTranslation Hook

### Basic Hook Usage

```typescript
import { useTranslation } from 'react-i18next';

export const MyComponent = () => {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('key.path')}</h1>
      <p>{i18n.language}</p>
    </div>
  );
};
```

### Hook Return Value

```typescript
const { t, i18n, ready } = useTranslation();

// t: Translation function - translates keys
t('header.title')  // Get translated string

// i18n: i18next instance - access language info
i18n.language      // Current language: 'en' or 'de'
i18n.changeLanguage('de')  // Change language

// ready: Boolean - true when translations loaded
if (!ready) return <div>Loading...</div>;
```

---

## Translation Key Paths

### Key Structure in JSON

```json
{
  "common": {
    "app_name": "StockEase",
    "welcome": "Welcome"
  },
  "header": {
    "title": "Dashboard",
    "menu": "Menu"
  }
}
```

### Accessing Keys in Components

```typescript
// Dot notation for nested keys
t('common.app_name')      // "StockEase"
t('header.title')         // "Dashboard"
t('header.menu')          // "Menu"
```

### Full Reference Structure

```
en.json / de.json
├── common.*
├── header.*
├── login.*
├── dashboard.*
├── buttons.*
├── loading.*
├── error.*
├── pages.*
├── modals.*
└── validation.*
```

See [Translation Files](./translation-files.md) for complete structure.

---

## Using Namespaces

### What Are Namespaces?

Translations are organized in two namespaces:

```
locales/
├── en.json          (namespace: 'translation')
├── de.json          (namespace: 'translation')
├── help_en.json     (namespace: 'help')
└── help_de.json     (namespace: 'help')
```

### Access Default Namespace

```typescript
const { t } = useTranslation();

// Automatically uses 'translation' namespace
t('header.title')  // From en.json / de.json
```

### Access Specific Namespace

```typescript
const { t } = useTranslation('help');

// Uses 'help' namespace
t('modal.getting_started')  // From help_en.json / help_de.json
```

### Using Multiple Namespaces

```typescript
const { t: tTranslation } = useTranslation();
const { t: tHelp } = useTranslation('help');

return (
  <div>
    <h1>{tTranslation('header.title')}</h1>
    <p>{tHelp('modal.getting_started')}</p>
  </div>
);
```

---

## Common Component Patterns

### Pattern 1: Simple Text Translation

```typescript
import { useTranslation } from 'react-i18next';

export const WelcomeMessage = () => {
  const { t } = useTranslation();
  
  return (
    <h1>{t('common.welcome')}</h1>
  );
};
```

### Pattern 2: Translation with Variables (Interpolation)

```typescript
const { t } = useTranslation();

// In JSON:
// "greeting": "Hello {{name}}, welcome to {{app}}"

return (
  <h1>
    {t('greeting', {
      name: 'John',
      app: 'StockEase'
    })}
  </h1>
);
// Result: "Hello John, welcome to StockEase"
```

### Pattern 3: Conditional Translation

```typescript
const { t, i18n } = useTranslation();

return (
  <div>
    {i18n.language === 'de' 
      ? <p>Willkommen!</p>
      : <p>Welcome!</p>
    }
  </div>
);

// Better approach:
return <p>{t('common.welcome')}</p>;
```

### Pattern 4: Translation in onClick Handler

```typescript
const { t } = useTranslation();

return (
  <button onClick={() => alert(t('messages.success'))}>
    {t('buttons.save')}
  </button>
);
```

### Pattern 5: Rendering Lists with Translations

```typescript
const { t } = useTranslation();

const items = [
  { id: 1, labelKey: 'menu.dashboard' },
  { id: 2, labelKey: 'menu.products' },
  { id: 3, labelKey: 'menu.settings' }
];

return (
  <ul>
    {items.map(item => (
      <li key={item.id}>
        {t(item.labelKey)}
      </li>
    ))}
  </ul>
);
```

---

## Header Component Example

### Complete Header with Language Switcher

```typescript
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export const Header = () => {
  const { t, i18n } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    setDropdownOpen(false);
  };
  
  return (
    <header className="header">
      <div className="header-content">
        <h1>{t('header.title')}</h1>
        
        <div className="language-selector">
          <button onClick={() => setDropdownOpen(!dropdownOpen)}>
            {i18n.language === 'de' ? '🇩🇪 DE' : '🇬🇧 EN'}
          </button>
          
          {dropdownOpen && (
            <div className="dropdown">
              <button onClick={() => handleLanguageChange('en')}>
                🇬🇧 English
              </button>
              <button onClick={() => handleLanguageChange('de')}>
                🇩🇪 Deutsch
              </button>
            </div>
          )}
        </div>
      </div>
      
      <nav className="nav">
        <a href="/">{t('header.home')}</a>
        <a href="/products">{t('header.products')}</a>
        <a href="/settings">{t('header.settings')}</a>
      </nav>
    </header>
  );
};
```

---

## LoginPage Component Example

### Login Form with Translated Labels

```typescript
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export const LoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('validation.required_fields'));
      return;
    }
    
    try {
      // Login logic
    } catch (err) {
      setError(t('error.login_failed'));
    }
  };
  
  return (
    <div className="login-container">
      <h1>{t('login.title')}</h1>
      
      <form>
        <div className="form-group">
          <label>{t('login.email_label')}</label>
          <input
            type="email"
            placeholder={t('login.email_placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>{t('login.password_label')}</label>
          <input
            type="password"
            placeholder={t('login.password_placeholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <button type="button" onClick={handleLogin}>
          {t('buttons.login')}
        </button>
      </form>
    </div>
  );
};
```

---

## HelpModal Component Example

### Help Modal with Separate Namespace

```typescript
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export const HelpModal = ({ isOpen, onClose }) => {
  const { t: tHelp } = useTranslation('help');
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('getting_started');
  
  if (!isOpen) return null;
  
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{tHelp('modal.title')}</h2>
        
        <div className="tabs">
          <button
            className={activeTab === 'getting_started' ? 'active' : ''}
            onClick={() => setActiveTab('getting_started')}
          >
            {tHelp('modal.getting_started')}
          </button>
          
          <button
            className={activeTab === 'faq' ? 'active' : ''}
            onClick={() => setActiveTab('faq')}
          >
            {tHelp('modal.faq')}
          </button>
          
          <button
            className={activeTab === 'support' ? 'active' : ''}
            onClick={() => setActiveTab('support')}
          >
            {tHelp('modal.support')}
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'getting_started' && (
            <div>
              <h3>{tHelp('topics.getting_started')}</h3>
              <p>{tHelp('content.getting_started')}</p>
            </div>
          )}
          
          {activeTab === 'faq' && (
            <div>
              <h3>{tHelp('topics.faq')}</h3>
              <p>{tHelp('content.faq')}</p>
            </div>
          )}
          
          {activeTab === 'support' && (
            <div>
              <h3>{tHelp('topics.support')}</h3>
              <p>{tHelp('content.support')}</p>
            </div>
          )}
        </div>
        
        <button className="close" onClick={onClose}>
          {t('buttons.close')}
        </button>
      </div>
    </div>
  );
};
```

---

## Best Practices

### ✅ DO:

```typescript
// Use translation keys consistently
const { t } = useTranslation();
return <h1>{t('header.title')}</h1>;

// Keep keys nested logically
"header.navigation.dashboard"
"button.action.save"

// Use interpolation for variables
"welcome": "Welcome {{name}}"
t('welcome', { name: 'John' })

// Use the right namespace
const { t: tHelp } = useTranslation('help');
```

### ❌ DON'T:

```typescript
// Don't hardcode text
return <h1>Dashboard</h1>;

// Don't use vague key names
"text1", "msg", "thing"

// Don't concatenate translations
t('hello') + ' ' + t('world')  // Won't work for reordering

// Don't mix namespaces without clarity
t('key')  // Unclear which namespace
```

---

## Accessing Translation Keys Dynamically

### Dynamic Key Generation

```typescript
const { t } = useTranslation();

// If you need to build keys dynamically:
const section = 'dashboard';
const page = 'overview';
const key = 'title';

const translatedText = t(`${section}.${page}.${key}`);
// Translates: 'dashboard.overview.title'
```

### Using Object Keys

```typescript
const { t } = useTranslation();

const menuItems = {
  home: 'header.home',
  products: 'header.products',
  settings: 'header.settings'
};

return (
  <nav>
    {Object.entries(menuItems).map(([id, key]) => (
      <a key={id}>{t(key)}</a>
    ))}
  </nav>
);
```

---

## Related Documentation

- [i18n Overview](./overview.md)
- [Configuration](./configuration.md)
- [Translation Files](./translation-files.md)
- [Language Detection](./language-detection.md)
- [Testing i18n](./testing.md)

---

**Last Updated**: November 2025

