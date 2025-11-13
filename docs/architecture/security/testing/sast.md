# Static Application Security Testing (SAST)

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Active

## Overview

Static Application Security Testing (SAST) is a white-box testing methodology that analyzes source code without execution to identify security vulnerabilities early in the development cycle. The StockEase Frontend uses **ESLint with TypeScript support** to enforce security patterns and ban dangerous code patterns.

## Table of Contents

1. [SAST Architecture](#sast-architecture)
2. [ESLint Configuration](#eslint-configuration)
3. [Security Rules & Violations](#security-rules--violations)
4. [Dangerous Code Patterns](#dangerous-code-patterns)
5. [Type Safety](#type-safety)
6. [Custom Rules](#custom-rules)
7. [Integration with Development](#integration-with-development)
8. [CI/CD Integration](#cicd-integration)

## SAST Architecture

### Analysis Approach

```
Source Code
    ↓
ESLint Parser (TypeScript)
    ↓
Rule Evaluation
    ├─ Security Rules
    ├─ Type Safety
    ├─ React Best Practices
    └─ Code Quality
    ↓
Violation Detection
    ├─ Critical (Security)
    ├─ Error (Type Safety)
    └─ Warning (Code Quality)
    ↓
Developer Feedback
    ├─ Editor Highlighting
    ├─ Build Failure
    └─ CI/CD Blocking
```

### Current ESLint Setup

**Plugins:**
- `@eslint/js` - ECMAScript linting rules
- `typescript-eslint` - TypeScript support and type-aware rules
- `eslint-plugin-react-hooks` - React Hooks patterns
- `eslint-plugin-react-refresh` - Fast Refresh safety

**Coverage:**
- All `.ts` and `.tsx` files
- Excludes: `dist/` directory (build output)

## ESLint Configuration

### Current Configuration (`eslint.config.js`)

```javascript
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  }
);
```

### Recommended Security Enhancements

To strengthen SAST coverage, the following ESLint security plugins should be considered:

#### 1. **eslint-plugin-security**
Adds security-focused rules for detecting common vulnerabilities.

**Installation:**
```bash
npm install --save-dev eslint-plugin-security
```

**Configuration Addition:**
```javascript
import security from 'eslint-plugin-security';

export default tseslint.config({
  plugins: {
    security: security,
  },
  rules: {
    'security/detect-object-injection': 'warn',
    'security/detect-unsafe-regex': 'error',
    'security/detect-non-literal-regexp': 'warn',
  },
});
```

#### 2. **eslint-plugin-no-unsanitized**
Detects DOM-based XSS vulnerabilities and unsanitized HTML operations.

**Installation:**
```bash
npm install --save-dev eslint-plugin-no-unsanitized
```

**Configuration Addition:**
```javascript
import noUnsanitized from 'eslint-plugin-no-unsanitized';

export default tseslint.config({
  plugins: {
    'no-unsanitized': noUnsanitized,
  },
  rules: {
    'no-unsanitized/method': 'error',
    'no-unsanitized/property': 'error',
  },
});
```

#### 3. **eslint-plugin-import**
Validates secure import patterns and prevents vulnerable dependencies.

**Installation:**
```bash
npm install --save-dev eslint-plugin-import
```

**Configuration Addition:**
```javascript
import importPlugin from 'eslint-plugin-import';

export default tseslint.config({
  plugins: {
    import: importPlugin,
  },
  rules: {
    'import/no-restricted-paths': [
      'error',
      { zones: [{ target: './src/api', from: './src/pages' }] },
    ],
  },
});
```

## Security Rules & Violations

### Critical Security Rules

#### 1. **Eval & Dynamic Code Execution** ❌

**Rule:** `no-eval`

**Violation Pattern:**
```typescript
// ❌ DANGEROUS: Dynamic code execution
const code = "return user.role === 'admin'";
const result = eval(code);

// ❌ DANGEROUS: Function constructor
const func = new Function('user', 'return user.role === "admin"');

// ❌ DANGEROUS: setTimeout with string
setTimeout('updateUI()', 1000);
```

**Safe Alternative:**
```typescript
// ✅ SAFE: Use proper function calls
const result = user.role === 'admin';

// ✅ SAFE: Use function references
function updateUI() { /* ... */ }
setTimeout(updateUI, 1000);

// ✅ SAFE: Use arrow functions
setTimeout(() => updateUI(), 1000);
```

**Rationale:**
- Dynamic code execution bypasses type checking
- Enables code injection attacks
- Difficult to analyze statically
- No performance benefit in modern JavaScript

---

#### 2. **innerHTML & DOM XSS** ❌

**Rule:** `no-unsanitized/property`

**Violation Pattern:**
```typescript
// ❌ DANGEROUS: Direct innerHTML assignment
element.innerHTML = userInput;
element.innerHTML = `<p>${userInput}</p>`;

// ❌ DANGEROUS: insertAdjacentHTML
element.insertAdjacentHTML('beforeend', userInput);

// ❌ DANGEROUS: outerHTML
element.outerHTML = untrustedData;
```

**Safe Alternative:**
```typescript
// ✅ SAFE: Use textContent for text
element.textContent = userInput;

// ✅ SAFE: Use createElement & appendChild
const p = document.createElement('p');
p.textContent = userInput;
element.appendChild(p);

// ✅ SAFE: React handles escaping
return <p>{userInput}</p>;

// ✅ SAFE: Use DOMPurify for intentional HTML
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(untrustedHTML);
```

**Rationale:**
- Most common DOM XSS vulnerability
- userInput can contain script tags
- React naturally escapes text content
- HTML should be pre-rendered, not dynamic

**Test Coverage:**
- `src/__tests__/security/xss/dom-based-xss.test.ts`
- `src/__tests__/security/components/error-boundary.test.ts`

---

#### 3. **dangerouslySetInnerHTML in React** ❌

**Rule:** Custom TypeScript rule (type-aware)

**Violation Pattern:**
```typescript
// ❌ DANGEROUS: dangerouslySetInnerHTML with user input
export function UserComment({ comment }: Props) {
  return <div dangerouslySetInnerHTML={{ __html: comment }} />;
}

// ❌ DANGEROUS: Dynamic HTML from API
const html = await api.getContent();
return <div dangerouslySetInnerHTML={{ __html: html }} />;
```

**Safe Alternative:**
```typescript
// ✅ SAFE: Render as text
export function UserComment({ comment }: Props) {
  return <div>{comment}</div>;
}

// ✅ SAFE: Use DOMPurify for trusted HTML
import DOMPurify from 'dompurify';

export function RichContent({ html }: Props) {
  return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
}

// ✅ SAFE: Use markdown library
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt();
const safe = DOMPurify.sanitize(md.render(input));
```

**Rationale:**
- Named `dangerously` to alert developers
- Bypasses React's automatic escaping
- Only safe with pre-rendered HTML or sanitized input
- Requires security review

---

#### 4. **Script Tag Injection** ❌

**Rule:** Custom pattern detection

**Violation Pattern:**
```typescript
// ❌ DANGEROUS: Creating script elements dynamically
const script = document.createElement('script');
script.src = userInput;
document.body.appendChild(script);

// ❌ DANGEROUS: Script content from user
const script = document.createElement('script');
script.textContent = userSuppliedCode;
document.body.appendChild(script);

// ❌ DANGEROUS: Event handler HTML attribute
const element = document.createElement('img');
element.setAttribute('onerror', userCode);
```

**Safe Alternative:**
```typescript
// ✅ SAFE: Load scripts via build configuration
// In vite.config.ts or index.html
<script src="/analytics.js"></script>

// ✅ SAFE: Use function references for event handlers
const element = document.createElement('img');
element.addEventListener('error', handleError);

// ✅ SAFE: CSP-compliant event handling
function handleError(event: Event) {
  console.error('Image failed to load');
}
```

**Test Coverage:**
- `src/__tests__/security/xss/event-handler-injection.test.ts`
- `src/__tests__/security/csp/nonce-validation.test.ts`

---

#### 5. **Unsafe Regex** ❌

**Rule:** `security/detect-unsafe-regex`

**Violation Pattern:**
```typescript
// ❌ DANGEROUS: Regex with catastrophic backtracking
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// ❌ DANGEROUS: Nested quantifiers
const pattern = /^(a+)+b$/;

// ❌ DANGEROUS: Alternation without anchors
const pattern = /(a|a)*b/;
```

**Safe Alternative:**
```typescript
// ✅ SAFE: Use built-in validation
const email = 'user@example.com';
const isValid = email.includes('@') && email.includes('.');

// ✅ SAFE: Use libraries (email-validator)
import { validate as validateEmail } from 'email-validator';
const isValid = validateEmail(email);

// ✅ SAFE: Simple bounded regex
const pattern = /^\d{1,3}$/;

// ✅ SAFE: Anchored alternation
const pattern = /^(option1|option2|option3)$/;
```

**Rationale:**
- ReDoS (Regular Expression Denial of Service) attacks
- Can cause exponential backtracking
- Input validation should use libraries or simple patterns
- Complex validation belongs on backend

---

#### 6. **Dynamic Imports from User Input** ❌

**Rule:** `security/detect-object-injection`

**Violation Pattern:**
```typescript
// ❌ DANGEROUS: Dynamic import from user input
async function loadComponent(name: string) {
  const Component = await import(`./components/${name}`);
  return Component;
}

// ❌ DANGEROUS: Object property access without keys validation
const handlers: Record<string, Function> = { /* ... */ };
const handler = handlers[userInput];
handler();
```

**Safe Alternative:**
```typescript
// ✅ SAFE: Whitelist allowed imports
async function loadComponent(name: 'Button' | 'Modal' | 'Card') {
  const componentMap = {
    Button: () => import('./components/Button'),
    Modal: () => import('./components/Modal'),
    Card: () => import('./components/Card'),
  };
  return componentMap[name]();
}

// ✅ SAFE: Enum-based mapping
enum ComponentType {
  BUTTON = 'Button',
  MODAL = 'Modal',
}
async function loadComponent(type: ComponentType) {
  const map: Record<ComponentType, () => Promise<any>> = {
    [ComponentType.BUTTON]: () => import('./Button'),
    [ComponentType.MODAL]: () => import('./Modal'),
  };
  return map[type]();
}

// ✅ SAFE: Explicit handler registration
class EventDispatcher {
  private handlers = new Map<string, Function>();
  
  register(event: string, handler: Function) {
    this.handlers.set(event, handler);
  }
  
  dispatch(event: string) {
    const handler = this.handlers.get(event);
    if (handler) handler();
  }
}
```

**Rationale:**
- Prevents path traversal attacks
- Ensures only intended modules can be loaded
- Improves code maintainability
- Enables better static analysis

---

### Data Handling Rules

#### 7. **URL Parameter Injection** ❌

**Violation Pattern:**
```typescript
// ❌ DANGEROUS: Building URLs from untrusted input
const url = `https://api.example.com/users/${userId}/posts/${postId}`;

// ❌ DANGEROUS: Query parameters without encoding
const url = `https://api.example.com/search?q=${userQuery}`;
```

**Safe Alternative:**
```typescript
// ✅ SAFE: Use URL constructor
const url = new URL('https://api.example.com/users');
url.pathname = `/users/${encodeURIComponent(userId)}/posts/${encodeURIComponent(postId)}`;

// ✅ SAFE: Use query parameter methods
const url = new URL('https://api.example.com/search');
url.searchParams.set('q', userQuery);

// ✅ SAFE: Use fetch with options
fetch('/api/users', {
  method: 'POST',
  body: JSON.stringify({ userId, postId }),
});
```

**Test Coverage:**
- `src/__tests__/security/headers/cors-origins-auth.test.ts`

---

#### 8. **Credential Exposure in Logs** ❌

**Violation Pattern:**
```typescript
// ❌ DANGEROUS: Logging auth headers
console.log('Authorization:', headers);

// ❌ DANGEROUS: Logging entire response
console.log('API Response:', apiResponse);

// ❌ DANGEROUS: Error with stack trace containing tokens
catch (error) {
  console.error('Request failed:', token, error);
}
```

**Safe Alternative:**
```typescript
// ✅ SAFE: Log only necessary information
console.log('Request method:', method);
console.log('Response status:', status);

// ✅ SAFE: Use logger with sanitization
const logger = {
  log(obj: any) {
    const sanitized = { ...obj };
    delete sanitized.token;
    delete sanitized.authorization;
    delete sanitized.password;
    console.log(sanitized);
  }
};

// ✅ SAFE: Use structured logging with redaction
import pino from 'pino';
const logger = pino({
  redact: ['*.token', '*.authorization', '*.password']
});
```

**Test Coverage:**
- `src/__tests__/security/secrets/logging-security.test.ts`

---

## Dangerous Code Patterns

### Pattern Reference Table

| Pattern | Severity | Rule | Safe Alternative |
|---------|----------|------|-------------------|
| `eval()` | Critical | `no-eval` | Function calls, switch statements |
| `.innerHTML = user` | Critical | `no-unsanitized` | `.textContent`, React JSX |
| `dangerouslySetInnerHTML` | Critical | TypeScript rule | Escape content, use libraries |
| Dynamic script loading | Critical | Custom rule | CSP, build configuration |
| `new Function()` | High | `no-eval` | Function references |
| `.insertAdjacentHTML()` | High | `no-unsanitized` | `.appendChild()` |
| Non-literal regex | Medium | `security/detect-unsafe-regex` | Input validation libraries |
| Dynamic imports | Medium | `security/detect-object-injection` | Whitelist/enum mapping |
| Unencoded URL params | High | Custom rule | URL constructor, fetch |
| Credential in logs | High | Code review | Logger sanitization |
| Event handler attributes | High | Custom rule | `addEventListener()` |
| Unvalidated API calls | Medium | Type checking | TypeScript interfaces |

## Type Safety

### TypeScript for Security

TypeScript helps prevent entire categories of security vulnerabilities through type checking.

#### Strong Typing for Auth Tokens

```typescript
// ❌ BAD: Any type allows errors
function setToken(token: any) {
  localStorage.setItem('auth', token);
}

// ✅ GOOD: Specific type with validation
interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

function setToken(token: AuthToken) {
  if (!token.accessToken || token.expiresAt < Date.now()) {
    throw new Error('Invalid token');
  }
  localStorage.setItem('auth', JSON.stringify(token));
}
```

#### Literal Types for Permissions

```typescript
// ❌ BAD: String type allows invalid values
function checkPermission(role: string) {
  return role === 'admin';
}

// ✅ GOOD: Literal union type
type UserRole = 'admin' | 'user' | 'guest';

function checkPermission(role: UserRole) {
  return role === 'admin';
}
```

#### Branded Types for Sensitive Data

```typescript
// ✅ GOOD: Branded type prevents accidental misuse
type SanitizedInput = string & { readonly _sanitized: true };

function sanitize(input: string): SanitizedInput {
  return DOMPurify.sanitize(input) as SanitizedInput;
}

function renderHTML(html: SanitizedInput) {
  // Can only be called with sanitized input
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

## Custom Rules

### Adding Custom ESLint Rules

#### Example: No Direct Window Access for Sensitive APIs

```typescript
// eslint-rules/no-window-sensitive-apis.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent direct access to sensitive window APIs',
      category: 'Security',
    },
  },
  create(context) {
    return {
      MemberExpression(node) {
        if (
          node.object.name === 'window' &&
          ['localStorage', 'sessionStorage', 'location'].includes(node.property.name)
        ) {
          context.report({
            node,
            message: `Use secure storage API instead of ${node.property.name}. Use SecureStorage utility.`,
          });
        }
      },
    };
  },
};
```

**Integration:**
```javascript
// eslint.config.js
import customRules from './eslint-rules/index.js';

export default tseslint.config({
  plugins: {
    custom: customRules,
  },
  rules: {
    'custom/no-window-sensitive-apis': 'error',
  },
});
```

## Integration with Development

### Pre-Commit Hooks

Use Husky to run ESLint before commits:

```bash
npx husky add .husky/pre-commit "npm run lint:security"
```

**In `package.json`:**
```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:security": "eslint . --rule '{\"no-eval\": \"error\", \"no-unsanitized\": \"error\"}'",
    "lint:fix": "eslint . --fix"
  }
}
```

### IDE Integration

#### VS Code

Install ESLint extension (`dbaeumer.vscode-eslint`):

```json
// .vscode/settings.json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "dbaeumer.vscode-eslint",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Code Review

Security rule violations should be reviewed during code review:

```bash
# Check for security violations only
npm run lint -- --rule 'no-eval: error, no-unsanitized: error'
```

## CI/CD Integration

### GitHub Actions

```yaml
name: SAST

on: [push, pull_request]

jobs:
  eslint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint
      - run: npm run lint:security
```

### Build Configuration

**In `vite.config.ts`:**
```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        validate: true, // Enable ESLint during build
      },
    },
  },
});
```

## Security Checklist for Code Review

When reviewing code for security vulnerabilities:

- [ ] No `eval()`, `Function()`, or `new Function()`
- [ ] No direct `.innerHTML` assignment from untrusted sources
- [ ] `dangerouslySetInnerHTML` is only used with sanitized input
- [ ] Dynamic script loading doesn't come from user input
- [ ] URL parameters are properly encoded
- [ ] Credentials are not logged to console
- [ ] Event handlers use `addEventListener()` not HTML attributes
- [ ] Regular expressions don't have catastrophic backtracking
- [ ] TypeScript types prevent invalid state
- [ ] API responses are validated before use
- [ ] Form inputs are validated client-side
- [ ] CSRF tokens are included in state-changing requests
- [ ] CORS headers are properly configured
- [ ] Sensitive data is not stored in cookies without HttpOnly flag

## Running SAST Scans

```bash
# Run ESLint with security focus
npm run lint

# Fix security violations automatically
npm run lint:fix

# Generate SAST report
npm run lint -- --format=json > sast-report.json

# Run security-only checks
npm run lint -- --rule 'no-eval: error'
```

## Related Documentation

- [Testing Strategy](strategy.md) - Unit and integration test approach
- [DAST Testing](dast.md) - Dynamic security testing
- [Security Checklists](../checklists/pr-security-review.md) - PR review checklist

## Recommended Reading

- [OWASP - Code Injection](https://owasp.org/www-community/attacks/Code_Injection)
- [CWE-95: Improper Neutralization of Directives in Dynamically Evaluated Code](https://cwe.mitre.org/data/definitions/95.html)
- [CWE-79: Improper Neutralization of Input During Web Page Generation (XSS)](https://cwe.mitre.org/data/definitions/79.html)
- [TypeScript Handbook - Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
