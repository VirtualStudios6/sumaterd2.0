// Genera los iconos PNG de la PWA / app Android a partir del logo oficial.
// Uso: node scripts/generate-icons.mjs
import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'

const source = 'public/brand/logo.png'
const out = 'public/icons'
const white = { r: 255, g: 255, b: 255, alpha: 1 }

// `inset` es la fracción del lienzo que ocupa el logo. Los iconos maskable
// necesitan que el contenido quede dentro de la zona segura central (80 %).
const variants = [
  { file: 'icon-192.png', size: 192, inset: 0.86 },
  { file: 'icon-512.png', size: 512, inset: 0.86 },
  { file: 'maskable-512.png', size: 512, inset: 0.66 },
  { file: 'maskable-192.png', size: 192, inset: 0.66 },
  { file: 'apple-touch-icon.png', size: 180, inset: 0.8 },
  { file: 'favicon-48.png', size: 48, inset: 0.96 },
]

await mkdir(out, { recursive: true })
const trimmed = await sharp(source).trim({ threshold: 12 }).toBuffer()

for (const { file, size, inset } of variants) {
  const inner = Math.round(size * inset)
  const logo = await sharp(trimmed)
    .resize(inner, inner, { fit: 'contain', background: { ...white, alpha: 0 } })
    .toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: white } })
    .composite([{ input: logo, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(`${out}/${file}`)
  console.log(`✓ ${out}/${file}`)
}

// Gráfico destacado de Google Play (1024x500).
const featureLogo = await sharp(trimmed)
  .resize(420, 380, { fit: 'contain', background: { ...white, alpha: 0 } })
  .toBuffer()
await sharp({ create: { width: 1024, height: 500, channels: 4, background: white } })
  .composite([{ input: featureLogo, gravity: 'center' }])
  .png()
  .toFile('store/feature-graphic.png')
console.log('✓ store/feature-graphic.png')
