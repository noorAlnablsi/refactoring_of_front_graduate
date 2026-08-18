/**
 * Central env config — single source for VITE_* variables used across the app.
 * Values come from .env / .env.local (dev) or .env.production (build).
 */

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:5000'
const DEFAULT_FRONTEND_BASE_URL = 'http://localhost:5173'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL

/** Prefer explicit env; in browser fall back to current origin (deployed SPA). */
export const FRONTEND_BASE_URL =
  import.meta.env.VITE_FRONTEND_BASE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : DEFAULT_FRONTEND_BASE_URL)
