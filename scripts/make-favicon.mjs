import opentype from 'opentype.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const buf = fs.readFileSync(path.join(root, 'scripts', 'Syne.ttf'))
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
const glyphPath = font.getPath('G', 0, 0, 1000)
const d = glyphPath.toPathData(2)
const bb = glyphPath.getBoundingBox()
const w = bb.x2 - bb.x1
const h = bb.y2 - bb.y1
const cx = (bb.x1 + bb.x2) / 2
const cy = (bb.y1 + bb.y2) / 2
const size = 32
const pad = 4
const s = (size - pad * 2) / Math.max(w, h)

// Font coords: y up. SVG: y down. Center letter in viewBox.
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Gabe Mariscal">
  <path
    fill="#c8f542"
    transform="translate(${size / 2} ${size / 2}) scale(${s.toFixed(6)} ${(-s).toFixed(6)}) translate(${(-cx).toFixed(2)} ${(-cy).toFixed(2)})"
    d="${d}"
  />
</svg>
`

const out = path.join(root, 'public', 'favicon.svg')
fs.writeFileSync(out, svg)
console.log('Wrote', out)
