/**
 * XSS Test Helpers & Reusable Components
 * @description Common test components and validation utilities for XSS prevention testing
 */

import React from 'react';

/**
 * UserDisplay component - renders text content safely
 * @param text - User-provided text to display
 */
export const UserDisplay: React.FC<{ text: string }> = ({ text }) => (
  <div>{text}</div>
);

/**
 * DangerousProps component - tests link and title attribute safety
 * @param href - URL to link to (may contain malicious URLs)
 * @param title - Title attribute (may contain event handler injections)
 */
export const DangerousProps: React.FC<{ href?: string; title?: string }> = ({
  href = '#',
  title = '',
}) => (
  <a href={href} title={title}>
    Link
  </a>
);

/**
 * SafeLink component - renders safe links
 * @param url - URL for the link
 * @param label - Link label text
 */
export const SafeLink: React.FC<{ url: string; label: string }> = ({
  url,
  label,
}) => <a href={url}>{label}</a>;

/**
 * ImageDisplay component - renders images with user-provided sources
 * @param src - Image source (may contain data URIs or malicious URLs)
 * @param alt - Alternative text
 */
export const ImageDisplay: React.FC<{ src: string; alt: string }> = ({
  src,
  alt,
}) => <img src={src} alt={alt} />;

/**
 * ItemList component - renders list of items with user-generated content
 * @param items - Array of items with id and name
 */
export const ItemList: React.FC<{ items: Array<{ id: number; name: string }> }> =
  ({ items }) => (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );

/**
 * RoleDisplay component - conditional rendering based on user input
 * @param role - Role string (may contain injection attempts)
 */
export const RoleDisplay: React.FC<{ role: string }> = ({ role }) => {
  const isAdmin = role.includes('admin');
  return (
    <div>
      {isAdmin ? <span>Admin Panel</span> : <span>User Panel</span>}
      <p>Role: {role}</p>
    </div>
  );
};

/**
 * Button component with onClick handler
 * @param value - Value passed to onClick handler
 */
export const Button: React.FC<{ value: string; onClick?: (val: string) => void }> =
  ({ value, onClick }) => (
    <button
      onClick={() => {
        onClick?.(value);
      }}
    >
      Click Me
    </button>
  );

/**
 * Form component with controlled input
 */
export const Form: React.FC = () => {
  const [value, setValue] = React.useState('');

  return (
    <form>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter text"
        type="text"
      />
      <div data-testid="output">{value}</div>
    </form>
  );
};

/**
 * FormHandler component - form submission handling
 */
export const FormHandler: React.FC = () => {
  const [submitted, setSubmitted] = React.useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const value = formData.get('field') as string;
    setSubmitted(value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="field" defaultValue="" />
      <button type="submit">Submit</button>
      <div data-testid="result">{submitted}</div>
    </form>
  );
};


