# Lumière — Image Hosting

A posh, luxury-themed image hosting application built with TanStack Start and Netlify. Upload any image and receive an instant shareable link with an elegant viewing page.

## Key Technologies

- **TanStack Start** — full-stack React framework with file-based routing and server functions
- **Netlify Blobs** — object storage for uploaded images
- **Tailwind CSS v4** — utility-first styling
- **Playfair Display** — serif typeface for the luxury aesthetic
- **TypeScript** — end-to-end type safety

## Features

- Drag-and-drop or click-to-browse image upload
- Supports JPEG, PNG, GIF, WebP, AVIF, and SVG (up to 20 MB)
- Live image preview before uploading
- Instant shareable page link and direct image URL after upload
- One-click copy for both link types
- Direct image download button
- Fully server-rendered with immutable cache headers on image responses

## Running Locally

```bash
npm install
netlify dev
```

Visit [http://localhost:8888](http://localhost:8888).

> Netlify Blobs requires the Netlify CLI dev server (`netlify dev`) to work locally.
