/**
 * Client-side URL / link hardening.
 * React already escapes text nodes; these helpers block dangerous href schemes
 * (javascript:, data:, vbscript:) if project data is ever edited or loaded remotely.
 */

const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:'])

/**
 * Returns a safe href or '#' if the URL uses a disallowed scheme.
 * Allows same-page hash anchors (e.g. #work).
 */
export function safeHref(raw: string | undefined | null): string {
  if (raw == null) return '#'
  const value = String(raw).trim()
  if (!value) return '#'

  // In-page anchors only (e.g. #work). Bare "#" is a no-op placeholder.
  if (value === '#') return '#'
  if (value.startsWith('#')) {
    if (/^#[a-zA-Z][\w-]*$/.test(value)) return value
    return '#'
  }

  try {
    // Relative paths (same origin) — block protocol-relative //evil.com
    if (value.startsWith('/') && !value.startsWith('//')) {
      // Only allow simple path + optional query/hash, no backslashes
      if (/^\/[\w./\-?=&%#]*$/.test(value) && !value.includes('..')) {
        return value
      }
      return '#'
    }

    if (value.startsWith('//')) return '#'

    const url = new URL(value)
    if (!SAFE_PROTOCOLS.has(url.protocol)) return '#'

    // Block credentials in URL (https://user:pass@host)
    if (url.username || url.password) return '#'

    return url.toString()
  } catch {
    return '#'
  }
}

export function isExternalHref(href: string): boolean {
  try {
    if (href.startsWith('#') || href.startsWith('/')) return false
    const url = new URL(href)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/** Safe rel attribute for external anchors — blocks reverse tabnabbing */
export const EXTERNAL_REL = 'noopener noreferrer' as const
