const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

// Remove trailing slash so we can safely append paths with a leading slash
const UPLOADS_BASE = (
  (import.meta.env.VITE_UPLOADS_BASE_URL as string | undefined) ?? `${API_URL}/uploads`
).replace(/\/$/, '');

/**
 * Resolve any image path to a full URL, handling:
 *   - absolute URLs (http / https) → returned as-is
 *   - /uploads/products/x.jpg   → UPLOADS_BASE + /products/x.jpg
 *   - uploads/products/x.jpg    → UPLOADS_BASE + /products/x.jpg
 *   - /products/x.jpg           → UPLOADS_BASE + /products/x.jpg
 *   - products/x.jpg            → UPLOADS_BASE + /products/x.jpg
 */
export function resolveImageUrl(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
  const value = String(imageUrl).trim();
  if (!value) return null;

  if (value.startsWith('http://') || value.startsWith('https://')) return value;

  // Normalize to a relative path starting with /
  let rel: string;
  if (value.startsWith('/uploads/')) {
    rel = value.slice('/uploads'.length); // → /products/x.jpg
  } else if (value.startsWith('uploads/')) {
    rel = value.slice('uploads'.length); // → /products/x.jpg
  } else if (value.startsWith('/')) {
    rel = value;
  } else {
    rel = `/${value}`;
  }

  return `${UPLOADS_BASE}${rel}`;
}

/** Backward-compatible wrapper — always returns a string (empty string when null). */
export function getImageUrl(path?: string | null): string {
  return resolveImageUrl(path) ?? '';
}
