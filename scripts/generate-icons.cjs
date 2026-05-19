const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Hintergrund -->
  <rect width="512" height="512" rx="96" fill="#1e293b"/>

  <!-- Fussball (weisser Kreis mit schwarzen Flecken) -->
  <circle cx="256" cy="220" r="148" fill="#ffffff"/>
  <circle cx="256" cy="220" r="148" fill="none" stroke="#334155" stroke-width="6"/>

  <!-- Mittelpentagon -->
  <polygon points="256,155 306,191 286,249 226,249 206,191"
           fill="#0f172a" stroke="#0f172a" stroke-width="3"/>

  <!-- Oberes Pentagon -->
  <polygon points="256,72 290,100 278,138 234,138 222,100"
           fill="#0f172a" stroke="#0f172a" stroke-width="3"/>

  <!-- Unten links -->
  <polygon points="140,262 168,240 200,258 194,296 156,302"
           fill="#0f172a" stroke="#0f172a" stroke-width="3"/>

  <!-- Unten rechts -->
  <polygon points="372,262 344,240 312,258 318,296 356,302"
           fill="#0f172a" stroke="#0f172a" stroke-width="3"/>

  <!-- Oben links -->
  <polygon points="136,152 162,138 188,158 178,192 146,196"
           fill="#0f172a" stroke="#0f172a" stroke-width="3"/>

  <!-- Oben rechts -->
  <polygon points="376,152 350,138 324,158 334,192 366,196"
           fill="#0f172a" stroke="#0f172a" stroke-width="3"/>

  <!-- Unten Mitte -->
  <polygon points="256,368 226,342 234,308 278,308 286,342"
           fill="#0f172a" stroke="#0f172a" stroke-width="3"/>

  <!-- WM 2026 Text -->
  <text x="256" y="432"
        font-size="58"
        text-anchor="middle"
        fill="#3b82f6"
        font-family="Arial,Helvetica,sans-serif"
        font-weight="bold">WM 2026</text>
</svg>`

const outDir = path.join(__dirname, '..', 'public')
fs.mkdirSync(outDir, { recursive: true })

const sizes = [
  { size: 512, file: 'pwa-512x512.png' },
  { size: 192, file: 'pwa-192x192.png' },
  { size: 180, file: 'apple-touch-icon.png' },
]

;(async () => {
  for (const { size, file } of sizes) {
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, file))
    console.log(`✓ ${file} (${size}x${size})`)
  }

  // favicon.ico als 32x32 PNG (Vite nutzt es als PNG)
  await sharp(Buffer.from(svg))
    .resize(32, 32)
    .png()
    .toFile(path.join(outDir, 'favicon.ico'))
  console.log('✓ favicon.ico (32x32)')

  console.log('\nAlle Icons generiert!')
})()
