# Translation Files Structure

## Overview

Translation files are JSON files that contain all text displayed in the application. The project uses two types of translation files:

1. **en.json / de.json** - Main app UI translations
2. **help_en.json / help_de.json** - Help modal content

---

## Main Translation Files (en.json / de.json)

### File Location & Purpose

```
src/locales/
├── en.json   # English UI text
└── de.json   # German UI text
```

Used for all app interface text: buttons, labels, messages, page content.

### Main Sections

#### common
General app text used across multiple pages:
```json
{
  "common": {
    "appName": "StockEase",
    "buttons": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "close": "Close"
    },
    "status": {
      "loading": "Loading...",
      "success": "Success",
      "error": "Error"
    }
  }
}
```

#### header
Navigation bar and header elements:
```json
{
  "header": {
    "title": "StockEase",
    "menu": {
      "home": "Home",
      "dashboard": "Dashboard",
      "products": "Products"
    },
    "userMenu": {
      "profile": "Profile",
      "logout": "Logout"
    }
  }
}
```

#### login
Login page content:
```json
{
  "login": {
    "title": "Login",
    "username": "Username",
    "password": "Password",
    "rememberMe": "Remember me",
    "submit": "Sign In",
    "errors": {
      "invalidCredentials": "Invalid username or password",
      "required": "This field is required"
    }
  }
}
```

#### dashboard
Dashboard page content (user & admin):
```json
{
  "dashboard": {
    "welcome": "Welcome, {{name}}!",
    "stats": {
      "totalProducts": "Total Products",
      "totalValue": "Total Value",
      "lastUpdate": "Last Updated"
    }
  }
}
```

#### Other Sections
- **sidebar** - Side navigation menu
- **footer** - Footer content
- **buttons** - Reusable button labels
- **loading** - Loading state messages
- **error** - Error messages
- **errorBoundary** - Error fallback UI
- **addProduct** - Product addition workflow
- **changeProduct** - Product editing
- **deleteProduct** - Product deletion
- **listStock** - Stock list page
- **searchProduct** - Search functionality
- **productDetails** - Product detail view

---

## Help Content Files (help_en.json / help_de.json)

### File Location & Purpose

```
src/locales/
├── help_en.json   # English help content
└── help_de.json   # German help content
```

Used by HelpModal component to provide contextual help.

### Structure

```json
{
  "topics": {
    "login": {
      "title": "How to Log In",
      "content": "To log in, enter your username and password..."
    },
    "search": {
      "title": "Search Products",
      "content": "Use the search bar to find products by name or ID..."
    },
    "addProduct": {
      "title": "Adding a New Product",
      "content": "Click the Add Product button and fill in..."
    }
  }
}
```

### Available Help Topics

- **login** - Login instructions
- **adminDashboard** - Admin dashboard help
- **userDashboard** - User dashboard help
- **addProduct** - How to add products
- **deleteProduct** - How to delete products
- **changeProduct** - How to edit products
- **searchProduct** - How to search
- **listStock** - Stock list explanation
- **button** - Help button label
- **helpModal** - Close button label

---

## Key Organization Best Practices

### Logical Grouping

```json
{
  "login": {
    "title": "...",
    "fields": {
      "username": "...",
      "password": "..."
    },
    "buttons": {
      "submit": "...",
      "cancel": "..."
    },
    "errors": {
      "invalidCredentials": "...",
      "required": "..."
    }
  }
}
```

### Nested Structure

Keep related translations together:
```json
{
  "dashboard": {
    "userDashboard": {
      "title": "...",
      "widgets": {
        "recentProducts": "...",
        "statistics": "..."
      }
    },
    "adminDashboard": {
      "title": "...",
      "widgets": {
        "userManagement": "...",
        "analytics": "..."
      }
    }
  }
}
```

### Naming Convention

- **camelCase** for JSON keys
- **PascalCase** for display text that starts sentences
- **lowercase** for middle of sentence text
- Use **descriptive names**, not generic labels

✅ Good:
```json
{ "invalidEmailError": "Invalid email address" }
{ "unsavedChangesWarning": "You have unsaved changes" }
```

❌ Bad:
```json
{ "error1": "Invalid email address" }
{ "msg2": "You have unsaved changes" }
```

---

## Interpolation & Variables

### Simple Interpolation

```json
{
  "welcome": "Welcome, {{name}}!"
}
```

Usage:
```typescript
t('welcome', { name: 'John' })  // → "Welcome, John!"
```

### Multiple Variables

```json
{
  "productCount": "Found {{count}} products in {{category}}"
}
```

Usage:
```typescript
t('productCount', { count: 5, category: 'Electronics' })
// → "Found 5 products in Electronics"
```

---

## Pluralization

### Simple Pluralization

```json
{
  "itemCount_one": "One item",
  "itemCount_other": "{{count}} items"
}
```

Usage:
```typescript
t('itemCount', { count: 1 })   // → "One item"
t('itemCount', { count: 5 })   // → "5 items"
```

---

## Translation File Format Rules

### Valid JSON Structure
```json
{
  "section": {
    "key": "value",
    "nested": {
      "key": "value"
    }
  }
}
```

### Comments (if needed)
JSON doesn't support comments, but you can use:
```json
{
  "_comment": "Main navigation section",
  "header": { ... }
}
```

Then ignore `_comment` keys in code.

---

## Adding New Translations

### Process

1. **Add to English file** (`en.json`):
```json
{
  "newSection": {
    "newKey": "English text here"
  }
}
```

2. **Add to German file** (`de.json`):
```json
{
  "newSection": {
    "newKey": "Deutscher Text hier"
  }
}
```

3. **Use in component**:
```typescript
const { t } = useTranslation();
<p>{t('newSection.newKey')}</p>
```

4. **Test both languages**:
```typescript
const { i18n } = useTranslation();
i18n.changeLanguage('de');
// Verify German text displays
```

---

## Maintenance & Updates

### Regular Audits

Check for:
- Missing translations in German (en.json has key but de.json doesn't)
- Orphaned keys (translations not used in code)
- Outdated content

### Version Control

Always commit translation changes:
```bash
git add src/locales/
git commit -m "chore(i18n): update German translations"
```

---

## Related Documentation

- [i18n Overview](./overview.md)
- [Configuration](./configuration.md)
- [Language Detection](./language-detection.md)
- [Component Patterns](./component-patterns.md)
- [Testing i18n](./testing.md)

---

**Last Updated**: November 2025

