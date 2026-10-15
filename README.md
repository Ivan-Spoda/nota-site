# nota-site

The landing page for [Nota](https://github.com/nota-daw/nota), the free, open-source DAW.
Implements the "Nota Site" design from `nota-design`.

Vite + React + TypeScript, built to a static `dist/`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check and build to dist/
```

## Layout

- `src/sections/` — page sections: Nav, Hero, Features, Compare, Download, Footer
- `src/features/` — the feature demos: stems, Nota Remote, the device gallery, version history, audio → MIDI, plug-ins, MCP
- `public/hero/main-window.webp` (`src/MainWindow.tsx`) — the main window in the hero, rendered headlessly from the app at 2x (the "Night Drive" demo, Lead selected), laid out at 1680 px and scaled to fit
- App screenshots come in Studio Dark (`<name>.webp`) and Studio Light (`<name>-light.webp`); `useShot()` in `src/lib/theme.ts` picks the one matching the site theme, which follows the system until the visitor picks one with the sun/moon toggle
- `public/remote/*.webp` — Nota Remote screens captured from the web app (`src/web/remote`) against its mock server on a 390 x 844 viewport at 2x
- `public/settings/downloads.webp` — Settings → Downloads rendered headlessly at 2x, with `NOTA_PLUGIN_REGISTRY` pointed at a local build of nota-plugins-registry's `index.json`
- `public/devices/` + `src/features/devices/devices.json` — device gallery images: device cards rendered headlessly from the app at 2x (the nota-docs `shots/app` harness), one view per tab or factory preset
- `src/lib/release.ts` — fetches the latest GitHub release and picks the download for the visitor's OS; falls back to the releases page offline
- `src/styles.css` — Studio Dark / Studio Light tokens (from the app's `Theme/Themes/studio-*.json`) and hover states

## Deploy

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`.
Enable it once in the repo: Settings → Pages → Source: **GitHub Actions**.
