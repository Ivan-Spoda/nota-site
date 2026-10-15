import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// The meta description's device count, from the gallery like the rest of the copy.
const devices = JSON.parse(readFileSync(new URL('./src/features/devices/devices.json', import.meta.url), 'utf8')) as unknown[]
const deviceCount: Plugin = { name: 'device-count', transformIndexHtml: (html) => html.replaceAll('%DEVICE_COUNT%', String(devices.length)) }

// BASE_PATH is set by the Pages workflow ("/nota-site/" for a project page, "/" for a custom domain).
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), deviceCount],
})
