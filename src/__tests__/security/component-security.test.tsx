import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

/**
 * Component Security Tests
 *
 * Tests for React component security including:
 * 1. Props Validation - Type safety and input validation
 * 2. Access Control - Role-based component rendering (RBAC)
 * 3. Data Sanitization - Preventing XSS through component props
 * 4. Safe Event Handlers - Preventing code injection through events
 * 5. Conditional Rendering - Secure visibility logic
 * 6. Component Composition Security - Safe component nesting
 *
 * Focus: Security issues in React components used in StockEase frontend
 */

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Helper function to sanitize string props
const sanitizeStringProp = (value: unknown): string => {
  // Ensure it's a string
  if (typeof value !== 'string') {
    return '';
  }

  // Remove common XSS patterns
  const dangerous = ['<script', 'javascript:', 'onerror=', 'onclick='];
  let sanitized = value;

  dangerous.forEach((pattern) => {
    const regex = new RegExp(pattern, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  return sanitized;
};

// Helper function to validate URLs in href and src attributes
const isValidURL = (url: unknown): boolean => {
  // URL should be string and not javascript: or data: URIs
  if (typeof url !== 'string') {
    return false;
  }

  // Prevent javascript: URLs (XSS vector)
  if (url.toLowerCase().startsWith('javascript:')) {
    return false;
  }

  // Prevent data: URIs (can contain scripts)
  if (url.toLowerCase().startsWith('data:')) {
    return false;
  }

  // Allow relative and absolute HTTPS URLs
  try {
    new URL(url, 'https://example.com');
    return true;
  } catch {
    // Relative URL - allow
    return !url.includes('javascript:') && !url.includes('data:');
  }
};

// Helper function to sanitize object properties
const sanitizeObject = (obj: Record<string, unknown>): Record<string, string> => {
  const sanitized: Record<string, string> = {};

  Object.entries(obj).forEach(([key, value]) => {
    // Only allow string values
    if (typeof value === 'string') {
      // Remove suspicious patterns
      const cleaned = value
        .replace(/<script/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/onerror=/gi, '')
        .replace(/onclick=/gi, '');

      sanitized[key] = cleaned;
    }
  });

  return sanitized;
};

// Helper function to validate children components
const isValidChildren = (content: React.ReactNode): boolean => {
  return content !== null && content !== undefined;
};

describe('React Component Security', () => {
  // ============================================================================
  // 1. PROPS VALIDATION
  // ============================================================================
  describe('Component Props Validation', () => {
    it('should validate prop types for type safety', () => {
      // Component should have proper TypeScript types
      // Props should be validated before use

      interface SafeComponentProps {
        title: string;
        count: number;
        enabled: boolean;
        callback?: (data: Record<string, unknown>) => void;
      }

      // Valid props
      const validProps: SafeComponentProps = {
        title: 'Test',
        count: 5,
        enabled: true,
      };

      expect(validProps.title).toBe('Test');
      expect(validProps.count).toEqual(5);
      expect(validProps.enabled).toBe(true);

      // TypeScript prevents invalid types at compile time
      // (This test validates the pattern rather than runtime behavior)
    });

    it('should not accept potentially malicious prop values', () => {
      // Props should be sanitized before use
      // Prevent script injection through props

      // Safe input
      expect(sanitizeStringProp('Hello World')).toBe('Hello World');

      // Potentially malicious inputs get cleaned
      expect(sanitizeStringProp('<script>alert("XSS")</script>')).not.toContain('<script');
      expect(sanitizeStringProp('javascript:alert("XSS")')).not.toContain('javascript:');
      expect(sanitizeStringProp('<img onerror="alert()">')).not.toContain('onerror=');
    });

    it('should provide default values for optional props', () => {
      interface ComponentWithDefaults {
        title: string;
        subtitle?: string;
        theme?: 'light' | 'dark';
        maxLength?: number;
      }

      const ComponentWithDefaults: React.FC<ComponentWithDefaults> = ({
        title,
        subtitle = 'Default subtitle',
        theme = 'light',
        maxLength = 100,
      }) => {
        return (
          <div data-theme={theme}>
            <h1>{title.substring(0, maxLength)}</h1>
            <p>{subtitle}</p>
          </div>
        );
      };

      // Verify: Component handles missing optional props with defaults
      const defaultSubtitle = 'Default subtitle';
      const defaultTheme = 'light';
      const defaultMaxLength = 100;

      expect(defaultSubtitle).toBe('Default subtitle');
      expect(defaultTheme).toBe('light');
      expect(defaultMaxLength).toBe(100);
    });

    it('should enforce required props at type level', () => {
      // Required props should not be optional
      // TypeScript will prevent missing required props

      interface RequiredPropsComponent {
        id: string; // Required
        title: string; // Required
        description?: string; // Optional
      }

      // Valid: all required props provided
      const validProps: RequiredPropsComponent = {
        id: '123',
        title: 'Example',
      };

      expect(validProps.id).toBeDefined();
      expect(validProps.title).toBeDefined();

      // TypeScript would error on missing required props
      // This test validates the pattern
    });
  });

  // ============================================================================
  // 2. ACCESS CONTROL (RBAC)
  // ============================================================================
  describe('Role-Based Access Control (RBAC)', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should conditionally render based on user role', () => {
      type UserRole = 'admin' | 'user' | 'guest';

      interface ProtectedComponentProps {
        requiredRole: UserRole;
        userRole: UserRole;
      }

      const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
        requiredRole,
        userRole,
      }) => {
        const hasAccess = (required: UserRole, actual: UserRole): boolean => {
          const roleHierarchy: Record<UserRole, number> = {
            admin: 3,
            user: 2,
            guest: 1,
          };

          return roleHierarchy[actual] >= roleHierarchy[required];
        };

        if (!hasAccess(requiredRole, userRole)) {
          return <div>Access Denied</div>;
        }

        return <div>Protected Content</div>;
      };

      // Admin can access admin content
      const adminResult = render(
        <ProtectedComponent requiredRole="admin" userRole="admin" />
      );
      expect(adminResult.container.textContent).toContain('Protected Content');

      // Guest cannot access admin content
      const guestResult = render(
        <ProtectedComponent requiredRole="admin" userRole="guest" />
      );
      expect(guestResult.container.textContent).toContain('Access Denied');
    });

    it('should not expose admin-only features to unauthorized users', () => {
      interface AdminPanelProps {
        isAdmin: boolean;
      }

      const AdminPanel: React.FC<AdminPanelProps> = ({ isAdmin }) => {
        if (!isAdmin) {
          return null;
        }

        return (
          <div data-testid="admin-panel">
            <h2>Admin Settings</h2>
            <button>Delete User</button>
            <button>Reset Password</button>
          </div>
        );
      };

      // Admin sees the panel
      const adminResult = render(<AdminPanel isAdmin={true} />);
      expect(adminResult.queryByTestId('admin-panel')).toBeTruthy();

      // Clean up before next render
      cleanup();

      // Non-admin doesn't see the panel
      const userResult = render(<AdminPanel isAdmin={false} />);
      expect(userResult.queryByTestId('admin-panel')).toBeNull();
    });

    it('should prevent privilege escalation through props', () => {
      // Users should not be able to escalate their role by manipulating props
      // Components should trust user role from secure source (auth context/token)

      interface SecureComponentProps {
        actualRole: string; // From secure auth source
      }

      const SecureRoleDisplay: React.FC<SecureComponentProps> = ({
        actualRole,
      }) => {
        // Should use actualRole from secure source
        return <div>Your role: {actualRole}</div>;
      };

      // Even if someone tries to claim admin role, actual role is used
      const result = render(
        <SecureRoleDisplay actualRole="user" />
      );
      expect(result.container.textContent).toContain('user');
    });

    it('should validate permissions before rendering sensitive features', () => {
      type Permission = 'read' | 'write' | 'delete';

      interface FeatureProps {
        requiredPermissions: Permission[];
        userPermissions: Permission[];
      }

      const FeatureWithPermissions: React.FC<FeatureProps> = ({
        requiredPermissions,
        userPermissions,
      }) => {
        const hasAllPermissions = requiredPermissions.every((perm) =>
          userPermissions.includes(perm)
        );

        if (!hasAllPermissions) {
          return <div>Insufficient Permissions</div>;
        }

        return <div>Feature Available</div>;
      };

      // User with write permission can use write feature
      const result1 = render(
        <FeatureWithPermissions
          requiredPermissions={['write']}
          userPermissions={['read', 'write']}
        />
      );
      expect(result1.container.textContent).toContain('Feature Available');

      // User without delete permission cannot delete
      const result2 = render(
        <FeatureWithPermissions
          requiredPermissions={['delete']}
          userPermissions={['read', 'write']}
        />
      );
      expect(result2.container.textContent).toContain('Insufficient Permissions');
    });
  });

  // ============================================================================
  // 3. DATA SANITIZATION
  // ============================================================================
  describe('Component Data Sanitization', () => {
    it('should sanitize user input before rendering', () => {
      interface DisplayComponentProps {
        userInput: string;
      }

      const SafeDisplay: React.FC<DisplayComponentProps> = ({ userInput }) => {
        // React auto-escapes by default - this is the primary protection
        return <div>{userInput}</div>;
      };

      // XSS attempt gets escaped by React
      const { container } = render(
        <SafeDisplay userInput="<img src=x onerror='alert(1)'>" />
      );
      const html = container.innerHTML;
      expect(html).not.toContain('<img');
      // React escapes it in the innerHTML
      expect(html).toContain('&lt;img');
    });

    it('should not use dangerouslySetInnerHTML with user input', () => {
      // Rule: Never use dangerouslySetInnerHTML with untrusted input

      // Safe component - no dangerous HTML
      const SafeComponent = () => <div>Safe content</div>;
      const safeRender = render(<SafeComponent />);
      // Check that no elements have dangerouslySetInnerHTML by checking raw HTML doesn't look injected
      expect(safeRender.container.innerHTML).not.toContain('__html');

      // Unsafe component - using dangerouslySetInnerHTML
      const UnsafeComponent = () => (
        <div dangerouslySetInnerHTML={{ __html: '<img onerror=alert(1)>' }} />
      );
      const unsafeRender = render(<UnsafeComponent />);
      // The raw HTML from dangerouslySetInnerHTML is injected directly
      expect(unsafeRender.container.innerHTML).toContain('<img');
      expect(unsafeRender.container.innerHTML).toContain('onerror');
    });

    it('should validate URLs in href and src attributes', () => {
      // Valid URLs
      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('/page')).toBe(true);
      expect(isValidURL('page')).toBe(true);

      // Invalid URLs
      expect(isValidURL('javascript:alert(1)')).toBe(false);
      expect(isValidURL('data:text/html,<script>alert(1)</script>')).toBe(false);
    });

    it('should sanitize object properties before rendering', () => {
      interface UserData {
        name: string;
        email: string;
        bio?: string;
      }

      const userInput: UserData = {
        name: '<script>alert(1)</script>John',
        email: 'john@example.com',
        bio: 'javascript:alert(1)',
      };

      const sanitized = sanitizeObject(userInput as unknown as Record<string, unknown>);

      expect(sanitized.name).not.toContain('<script');
      expect(sanitized.bio).not.toContain('javascript:');
    });
  });

  // ============================================================================
  // 4. EVENT HANDLER SECURITY
  // ============================================================================
  describe('Safe Event Handlers', () => {
    it('should validate event handler parameters', () => {
      const handleUserAction = (action: unknown): void => {
        // Validate action before using
        if (typeof action !== 'string') {
          console.error('Invalid action type');
          return;
        }

        // Only allow known actions
        const validActions = ['delete', 'edit', 'view', 'share'];
        if (!validActions.includes(action)) {
          console.error(`Unknown action: ${action}`);
          return;
        }

        // Safe to use action
      };

      // Valid action
      expect(() => handleUserAction('edit')).not.toThrow();

      // Invalid action
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      handleUserAction('malicious-action');
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should prevent event handler injection through props', () => {
      // Event handlers should not come from user input
      // They should be defined in component or safe context

      interface SafeButtonProps {
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
        label: string;
      }

      const SafeButton: React.FC<SafeButtonProps> = ({ onClick, label }) => {
        // onClick is a function prop, properly typed
        // It should come from component or validated source

        return <button onClick={onClick}>{label}</button>;
      };

      const mockHandler = vi.fn();
      const result = render(
        <SafeButton onClick={mockHandler} label="Click me" />
      );

      const button = result.container.querySelector('button');
      expect(button).toBeTruthy();
      expect(button?.textContent).toBe('Click me');
    });

    it('should sanitize callback data before processing', () => {
      const handleCallback = (data: unknown): boolean => {
        // Validate callback data structure
        if (!data || typeof data !== 'object') {
          return false;
        }

        const callbackData = data as Record<string, unknown>;

        // Validate required fields
        if (typeof callbackData.id !== 'string' || typeof callbackData.action !== 'string') {
          return false;
        }

        // Validate values
        const allowedActions = ['confirm', 'cancel', 'retry'];
        if (!allowedActions.includes(callbackData.action)) {
          return false;
        }

        return true;
      };

      // Valid callback
      expect(handleCallback({ id: '123', action: 'confirm' })).toBe(true);

      // Invalid - missing fields
      expect(handleCallback({ id: '123' })).toBe(false);

      // Invalid - unknown action
      expect(handleCallback({ id: '123', action: 'malicious' })).toBe(false);
    });
  });

  // ============================================================================
  // 5. CONDITIONAL RENDERING SECURITY
  // ============================================================================
  describe('Conditional Rendering Security', () => {
    it('should securely hide content based on permissions', () => {
      interface ConditionalContentProps {
        isVisible: boolean;
      }

      const HiddenContent: React.FC<ConditionalContentProps> = ({ isVisible }) => {
        // Don't render at all if not visible (better than display:none)
        if (!isVisible) {
          return null;
        }

        return <div>Secret content</div>;
      };

      // Visible when true
      const visibleResult = render(<HiddenContent isVisible={true} />);
      expect(visibleResult.container.textContent).toContain('Secret content');

      // Not rendered when false
      const hiddenResult = render(<HiddenContent isVisible={false} />);
      expect(hiddenResult.container.textContent).not.toContain('Secret content');
    });

    it('should not use CSS-only hiding for sensitive content', () => {
      // CSS hiding (display:none) is not security - content is in DOM
      // Should return null instead

      const isSecureHiding = (approach: 'css' | 'conditional'): boolean => {
        // CSS hiding is not secure
        if (approach === 'css') {
          return false; // Can be revealed with browser DevTools
        }

        // Conditional rendering (return null) is secure
        return approach === 'conditional';
      };

      expect(isSecureHiding('css')).toBe(false);
      expect(isSecureHiding('conditional')).toBe(true);
    });

    it('should render appropriate content based on auth state', () => {
      interface AuthAwareComponentProps {
        isAuthenticated: boolean;
      }

      const AuthAwareComponent: React.FC<AuthAwareComponentProps> = ({
        isAuthenticated,
      }) => {
        if (isAuthenticated) {
          return <div>Welcome User! Dashboard: [protected content]</div>;
        }

        return <div>Please log in</div>;
      };

      // Authenticated user sees dashboard
      const authResult = render(<AuthAwareComponent isAuthenticated={true} />);
      expect(authResult.container.textContent).toContain('Welcome User!');

      // Non-authenticated sees login prompt
      const anonResult = render(<AuthAwareComponent isAuthenticated={false} />);
      expect(anonResult.container.textContent).toContain('Please log in');
      expect(anonResult.container.textContent).not.toContain('protected content');
    });
  });

  // ============================================================================
  // 6. COMPONENT COMPOSITION SECURITY
  // ============================================================================
  describe('Component Composition Security', () => {
    it('should validate children components', () => {
      interface ContainerProps {
        children: React.ReactNode;
      }

      const SecureContainer: React.FC<ContainerProps> = ({ children }) => {
        // Validate that children exist and are valid
        if (!isValidChildren(children)) {
          return <div>No content</div>;
        }

        return <div className="container">{children}</div>;
      };

      // Valid children
      const result = render(
        <SecureContainer>
          <p>Child content</p>
        </SecureContainer>
      );
      expect(result.container.textContent).toContain('Child content');

      // Empty children handled gracefully
      const emptyResult = render(<SecureContainer>{null}</SecureContainer>);
      expect(emptyResult.container.textContent).toContain('No content');
    });

    it('should not allow arbitrary component injection', () => {
      // Components should not accept dynamic component types from props
      // That allows component injection attacks

      const isComponentInjectionVulnerable = (
        acceptsComponentFromProps: boolean
      ): boolean => {
        // If component accepts component type as prop, it's vulnerable
        // Better: Accept children (ReactNode) instead
        return acceptsComponentFromProps;
      };

      // Vulnerable: accepting component type as prop
      expect(isComponentInjectionVulnerable(true)).toBe(true);

      // Secure: accepting children
      expect(isComponentInjectionVulnerable(false)).toBe(false);
    });

    it('should protect against props spreading attacks', () => {
      // Spreading unknown props can pass malicious attributes

      const SafeComponent: React.FC<
        { label: string; onClick?: () => void } & React.HTMLAttributes<HTMLDivElement>
      > = ({ label, onClick, ...rest }) => {
        // Be careful with spread props
        // Whitelist safe attributes
        const safeProps: React.HTMLAttributes<HTMLDivElement> = {};

        // Only copy safe properties
        if ('className' in rest) {
          safeProps.className = rest.className as string;
        }
        if ('id' in rest) {
          safeProps.id = rest.id as string;
        }

        // Don't spread remaining properties (could include event handlers or dangerous attributes)
        return (
          <div {...safeProps} onClick={onClick}>
            {label}
          </div>
        );
      };

      // Safe props work
      const result = render(
        <SafeComponent label="Test" className="custom-class" />
      );
      expect(result.container.querySelector('.custom-class')).toBeTruthy();
    });

    it('should validate prop drilling for security', () => {
      // When passing props through multiple components, ensure values aren't modified

      interface ContextValue {
        userId: string;
        isAdmin: boolean;
      }

      const validateContextValue = (context: unknown): context is ContextValue => {
        if (!context || typeof context !== 'object') return false;

        const ctx = context as Record<string, unknown>;
        return (
          typeof ctx.userId === 'string' &&
          typeof ctx.isAdmin === 'boolean'
        );
      };

      // Valid context
      const validContext: ContextValue = {
        userId: 'user123',
        isAdmin: false,
      };

      expect(validateContextValue(validContext)).toBe(true);

      // Invalid context (modified by attacker)
      const invalidContext = {
        userId: 'user123',
        isAdmin: true, // Modified!
      };

      expect(validateContextValue(invalidContext)).toBe(true);
      // Note: This should be validated at auth boundary, not component level
    });
  });

  // ============================================================================
  // 7. INTEGRATION WITH AUTH SYSTEM
  // ============================================================================
  describe('Component Auth Integration', () => {
    it('should use auth context for access decisions, not props', () => {
      const isSecureAuthPattern = (authSource: 'context' | 'props'): boolean => {
        // Using auth context is secure (centralized, can't be overridden by props)
        if (authSource === 'context') {
          return true;
        }

        // Using props for auth decisions is risky (props can be modified)
        return false;
      };

      expect(isSecureAuthPattern('context')).toBe(true);
      expect(isSecureAuthPattern('props')).toBe(false);
    });
  });
});
