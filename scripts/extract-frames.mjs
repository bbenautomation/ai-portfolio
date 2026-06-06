import { execFileSync } from 'child_process'
import { existsSync, mkdirSync, readdirSync } from 'fs'
import { resolve } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const INPUT  = resolve('avatar.mp4')
const OUTPUT = resolve('public/avatar-frames')

if (!existsSync(INPUT)) {
  console.error('avatar.mp4 not found in project root.')
  process.exit(1)
}

if (!existsSync(OUTPUT)) {
  mkdirSync(OUTPUT, { recursive: true })
  console.log('Created folder: public/avatar-frames')
}

let ffmpegPath
try {
  ffmpegPath = require('ffmpeg-static')
} catch {
  console.error('Run: npm install --save-dev ffmpeg-static')
  process.exit(1)
}

console.log('Extracting frames...')

execFileSync(
  ffmpegPath,
  [
    '-i',  INPUT,
    '-vf', 'fps=24',              // 24 fps — smooth animation
    '-c:v','libwebp',
    '-quality', '88',             // high quality WebP
    '-compression_level', '4',   // balanced encode speed
    '-lossless', '0',
    '-y',                         // overwrite without prompt
    `${OUTPUT}/frame-%04d.webp`,
  ],
  { stdio: 'inherit' }
)

const frames = readdirSync(OUTPUT).filter(f => f.endsWith('.webp'))
console.log(`Done! ${frames.length} frames saved to public/avatar-frames/`)
