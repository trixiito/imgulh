# AGENTS.md — Lumière Architecture

## Project Overview

Lumière is a luxury image hosting application. Users upload an image, it is stored in Netlify Blobs, and they receive a shareable page link plus a direct image URL. Built with TanStack Start on Netlify.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 + CSS custom properties |
| Storage | Netlify Blobs |
| Language | TypeScript 5.x (strict mode) |
| Deployment | Netlify |

## Directory Structure

```
src/
  routes/
    __root.tsx           — HTML shell, Google Fonts (Playfair Display + Inter)
    index.tsx            — Upload page (drag-drop UI, preview, calls server function)
    view.$imageId.tsx    — Image view page with copy-link and download UI
    api/
      image/
        $imageId.ts      — API route: serves raw image bytes from Netlify Blobs
  server/
    images.functions.ts  — createServerFn: validates and stores uploaded image
  styles.css             — Global CSS variables, luxury design tokens, animations
public/
  favicon.ico
```

## Data Flow

1. Client selects a file → local FileReader preview shown
2. On submit, `uploadImage` server function (`POST`) is called with `FormData`
3. Server function reads the file buffer, generates a `crypto.randomUUID()` key, stores the `ArrayBuffer` in the `images` Netlify Blobs store with MIME type + filename metadata
4. Client navigates to `/view/<uuid>`
5. The view page renders `<img src="/api/image/<uuid>">`
6. The API route (`/api/image/$imageId`) fetches from Blobs and returns raw bytes with `Content-Type`

## Key Conventions

- **Page routes** → `.tsx` files in `src/routes/`
- **API-only routes** → `.ts` files in `src/routes/api/` with `server.handlers` export
- **Server functions (RPC)** → `src/server/*.functions.ts` using `createServerFn`
- **Use `.inputValidator()`** for typed server function inputs (`.validator()` does not exist in TanStack Start)

## Key Decisions

- **Netlify Blobs over database**: images are binary objects — Blobs is the correct primitive
- **API route for image serving**: server functions return JSON; binary responses need an HTTP route
- **Immutable cache headers**: UUIDs are stable — `max-age=31536000, immutable` is correct
- **No authentication**: public host by design

## Design System

All theming is driven by CSS custom properties in `styles.css`:
- `--gold`, `--gold-light`, `--gold-dim` — primary accent palette
- `--bg`, `--bg-surface`, `--bg-surface-hover` — dark layered backgrounds
- `--text`, `--text-muted` — warm off-white text hierarchy
- Reusable classes: `.glass-card`, `.upload-zone`, `.btn-gold`, `.btn-ghost`, `.fade-up`, `.gold-gradient`
- Typography: Playfair Display (headings) + Inter (body)
