// ==============================================================================
// CENTRAL API CONFIGURATION FOR SARANAM AYYAPPA ADMIN PANEL
// Governed globally by NEXT_PUBLIC_API_BASE_URL in .env / .env.local
// Changing NEXT_PUBLIC_API_BASE_URL in the .env file immediately applies
// across the entire Admin Panel without needing code edits.
// ==============================================================================

export const API_BASE_URL: string = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backendapis.saranamayyappa.in/api/v1'
).replace(/\/+$/, '');

// Base root origin (without /api/v1) for static media uploads, previews & downloads
export const API_ORIGIN: string = (
  process.env.NEXT_PUBLIC_API_ORIGIN ||
  API_BASE_URL.replace(/\/api\/v1\/?$/, '')
).replace(/\/+$/, '');

export default API_BASE_URL;
