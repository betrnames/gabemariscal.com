/**
 * Quick security smoke checks for the static portfolio build.
 * Run: node scripts/security-smoke.mjs
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
let failed = 0

function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL  ${msg}`)
    failed++
  } else {
    console.log(`OK    ${msg}`)
  }
}

// --- URL allowlist unit checks (inline mirror of safeHref rules) ---
const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:'])

function safeHref(raw) {
  if (raw == null) return '#'
  const value = String(raw).trim()
  if (!value) return '#'
  if (value === '#') return '#'
  if (value.startsWith('#')) {
    if (/^#[a-zA-Z][\w-]*$/.test(value)) return value
    return '#'
  }
  try {
    if (value.startsWith('/') && !value.startsWith('//')) {
      if (/^\/[\w./\-?=&%#]*$/.test(value) && !value.includes('..')) return value
      return '#'
    }
    if (value.startsWith('//')) return '#'
    const url = new URL(value)
    if (!SAFE_PROTOCOLS.has(url.protocol)) return '#'
    if (url.username || url.password) return '#'
    return url.toString()
  } catch {
    return '#'
  }
}

for (const [input, expected] of [
  ['javascript:alert(1)', '#'],
  ['data:text/html,x', '#'],
  ['vbscript:x', '#'],
  ['//evil.com', '#'],
  ['https://user:pass@example.com/', '#'],
  ['https://vox.chat', 'https://vox.chat/'],
  ['mailto:a@b.com', 'mailto:a@b.com'],
  ['#work', '#work'],
  ['#', '#'],
  ['/projects/x.png', '/projects/x.png'],
  ['/../etc/passwd', '#'],
]) {
  const got = safeHref(input)
  assert(got === expected, `safeHref(${JSON.stringify(input)}) => ${JSON.stringify(got)} (want ${JSON.stringify(expected)})`)
}

// --- Config presence ---
assert(existsSync(join(root, 'vercel.json')), 'vercel.json present')
assert(existsSync(join(root, 'public', '_headers')), 'public/_headers present')
assert(existsSync(join(root, 'src', 'lib', 'security.ts')), 'src/lib/security.ts present')

const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'))
const allHeaders = vercel.headers.flatMap((h) => h.headers.map((x) => x.key))
for (const key of [
  'Content-Security-Policy',
  'Strict-Transport-Security',
  'X-Content-Type-Options',
  'X-Frame-Options',
  'Referrer-Policy',
  'Permissions-Policy',
]) {
  assert(allHeaders.includes(key), `vercel.json has ${key}`)
}

const html = readFileSync(join(root, 'index.html'), 'utf8')
assert(html.includes('Content-Security-Policy'), 'index.html CSP meta')
assert(html.includes('strict-origin-when-cross-origin'), 'index.html referrer meta')
assert(!html.includes('dangerouslySetInnerHTML'), 'no dangerouslySetInnerHTML in index.html')

const app = readFileSync(join(root, 'src', 'App.tsx'), 'utf8')
assert(app.includes('safeHref'), 'App.tsx uses safeHref')
assert(app.includes('EXTERNAL_REL'), 'App.tsx uses EXTERNAL_REL')
assert(!app.includes('dangerouslySetInnerHTML'), 'App.tsx has no dangerouslySetInnerHTML')
assert(!app.includes('eval('), 'App.tsx has no eval')

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
assert(!pkg.dependencies?.three, 'unused three.js removed')
assert(!pkg.dependencies?.['@shadergradient/react'], 'unused shadergradient removed')

console.log('')
if (failed) {
  console.error(`${failed} check(s) failed`)
  process.exit(1)
}
console.log('All security smoke checks passed.')
