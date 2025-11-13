/**
 * XSS Test Data & Payloads
 * @description Centralized collection of test payloads and dangerous inputs for XSS testing
 */

/** Script tag injection payload */
export const SCRIPT_INJECTION = '<script>alert("xss")</script>';

/** Image tag with onerror handler */
export const IMG_ONERROR_PAYLOAD = 'Hello <img src=x onerror=alert("xss")>';

/** SVG with onload handler */
export const SVG_ONLOAD_PAYLOAD = '"><svg onload=alert("xss")>';

/** Event handler via attribute */
export const EVENT_HANDLER_INJECTION = 'Normal Title" onload="alert(\'xss\')"';

/** HTML with multiple special characters */
export const HTML_SPECIAL_CHARS = '<div class="test" & "quotes" > symbols';

/** JavaScript URL protocol */
export const JAVASCRIPT_URL = 'javascript:alert("xss")';

/** onclick attribute injection */
export const ONCLICK_INJECTION = 'onclick=alert("xss")';

/** onmouseover attribute injection */
export const ONMOUSEOVER_INJECTION = 'onmouseover=alert("xss")';

/** Data URI with embedded HTML */
export const DATA_URI_PAYLOAD = 'data:text/html,<script>alert("xss")</script>';

/** Form input XSS attempt with script tags */
export const FORM_INPUT_XSS = '"><script>alert("xss")</script>';

/** Form input XSS with img tag */
export const FORM_INPUT_IMG_XSS = '"><img src=x onerror=alert("xss")>';

/** Role-based XSS attempt */
export const ROLE_INJECTION = '<admin role=true>';

/** Collection of test items with malicious content */
export const TEST_ITEMS_WITH_XSS = [
  { id: 1, name: SCRIPT_INJECTION },
  { id: 2, name: 'Normal Item' },
  { id: 3, name: SVG_ONLOAD_PAYLOAD },
];
