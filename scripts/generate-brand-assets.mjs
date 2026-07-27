/**
 * Generate favicon (SVG + mobile PNGs) and OG image from Syne glyph paths.
 * Run: node scripts/generate-brand-assets.mjs
 */
import opentype from 'opentype.js'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(root, 'public')
const GREEN = '#c8f542'
const BG = '#08080a'
const BONE = '#f2f0eb'
const MUTED = '#8a8780'

// Prefer static ExtraBold; fall back to variable file
const fontPathCandidates = [
  path.join(root, 'scripts', 'Syne-ExtraBold.ttf'),
  path.join(root, 'scripts', 'Syne.ttf'),
]
const fontPath = fontPathCandidates.find((p) => fs.existsSync(p))
if (!fontPath) throw new Error('No Syne font found in scripts/')

const fontBuf = fs.readFileSync(fontPath)
const font = opentype.parse(
  fontBuf.buffer.slice(fontBuf.byteOffset, fontBuf.byteOffset + fontBuf.byteLength)
)
console.log('Using font:', path.basename(fontPath))

/** Positioned Syne text path (opentype returns SVG y-down when x/y set). */
function syneAt(text, fontSize, cx, baselineY) {
  const measure = font.getPath(text, 0, 0, fontSize)
  const mbb = measure.getBoundingBox()
  const width = mbb.x2 - mbb.x1
  // Place so visual center is at cx
  const x = cx - width / 2 - mbb.x1
  const p = font.getPath(text, x, baselineY, fontSize)
  return {
    d: p.toPathData(2),
    bb: p.getBoundingBox(),
    width,
  }
}

function gIconSvg(size, { solidBg = false, padRatio = 0.18 } = {}) {
  // Render G into a unit box with padding using positioned path
  const fontSize = 1000
  const measure = font.getPath('G', 0, 0, fontSize)
  const mbb = measure.getBoundingBox()
  const gw = mbb.x2 - mbb.x1
  const gh = mbb.y2 - mbb.y1
  const pad = size * padRatio
  const s = (size - pad * 2) / Math.max(gw, gh)

  // Center of glyph in font path space
  const gcx = (mbb.x1 + mbb.x2) / 2
  const gcy = (mbb.y1 + mbb.y2) / 2

  // Map font path → icon: scale around center into canvas
  const d = measure.toPathData(2)
  const bg = solidBg
    ? `<rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="${BG}"/>`
    : ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  ${bg}
  <path fill="${GREEN}" transform="translate(${size / 2} ${size / 2}) scale(${s}) translate(${-gcx} ${-gcy})" d="${d}"/>
</svg>`
}

async function writePngFromSvg(svg, outPath, width, height = width) {
  await sharp(Buffer.from(svg))
    .resize(width, height)
    .png({ compressionLevel: 9 })
    .toFile(outPath)
  console.log('Wrote', path.relative(root, outPath))
}

async function generateFavicons() {
  const favSvg = gIconSvg(32, { solidBg: false, padRatio: 0.12 })
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), favSvg)
  console.log('Wrote public/favicon.svg')

  const sizes = [
    { file: 'favicon-32.png', size: 32 },
    { file: 'favicon-48.png', size: 48 },
    { file: 'apple-touch-icon.png', size: 180 },
    { file: 'favicon-192.png', size: 192 },
    { file: 'favicon-512.png', size: 512 },
  ]

  for (const { file, size } of sizes) {
    const svg = gIconSvg(size, { solidBg: true, padRatio: 0.2 })
    await writePngFromSvg(svg, path.join(publicDir, file), size)
  }

  const manifest = {
    name: 'Gabe Mariscal',
    short_name: 'Gabe',
    description: 'Creative designer & developer portfolio',
    start_url: '/',
    display: 'standalone',
    background_color: BG,
    theme_color: BG,
    icons: [
      {
        src: '/favicon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/favicon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  }
  fs.writeFileSync(
    path.join(publicDir, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2)
  )
  console.log('Wrote public/site.webmanifest')
}

async function generateOgImage() {
  const W = 1200
  const H = 630

  const gabe = syneAt('Gabe', 118, W / 2, 290)
  const mariscal = syneAt('Mariscal', 118, W / 2, 420)

  // Green period after Mariscal
  const gap = 4
  const periodMeasure = font.getPath('.', 0, 0, 118)
  const pbb = periodMeasure.getBoundingBox()
  const periodX = mariscal.bb.x2 + gap - pbb.x1
  const period = font.getPath('.', periodX, 420, 118)

  // Re-center "Mariscal." as a unit
  const fullRight = period.getBoundingBox().x2
  const fullLeft = mariscal.bb.x1
  const fullW = fullRight - fullLeft
  const shift = W / 2 - (fullLeft + fullW / 2)

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glow1" cx="18%" cy="18%" r="55%">
      <stop offset="0%" stop-color="#2d5a8c" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${BG}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="88%" cy="82%" r="50%">
      <stop offset="0%" stop-color="${GREEN}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${BG}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow3" cx="55%" cy="42%" r="48%">
      <stop offset="0%" stop-color="#50328c" stop-opacity="0.24"/>
      <stop offset="100%" stop-color="${BG}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect width="${W}" height="${H}" fill="url(#glow1)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>
  <rect width="${W}" height="${H}" fill="url(#glow3)"/>
  <rect x="0" y="0" width="${W}" height="5" fill="${GREEN}"/>

  <text x="${W / 2}" y="118" text-anchor="middle"
    font-family="ui-monospace, SFMono-Regular, Menlo, monospace"
    font-size="17" letter-spacing="0.35em" fill="${GREEN}">PORTFOLIO</text>

  <path fill="${BONE}" d="${gabe.d}"/>
  <g transform="translate(${shift} 0)">
    <path fill="${BONE}" d="${mariscal.d}"/>
    <path fill="${GREEN}" d="${period.toPathData(2)}"/>
  </g>

  <text x="${W / 2}" y="500" text-anchor="middle"
    font-family="ui-monospace, SFMono-Regular, Menlo, monospace"
    font-size="22" letter-spacing="0.08em" fill="${MUTED}">Design that codes. Code that converts.</text>

  <text x="${W / 2}" y="560" text-anchor="middle"
    font-family="ui-monospace, SFMono-Regular, Menlo, monospace"
    font-size="20" letter-spacing="0.12em" fill="${MUTED}">gabemariscal.com</text>

  <circle cx="1120" cy="72" r="9" fill="${GREEN}"/>
</svg>`

  await writePngFromSvg(svg, path.join(publicDir, 'og-image.png'), W, H)
}

await generateFavicons()
await generateOgImage()
console.log('Done.')
