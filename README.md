# Stash

A mobile-first React app for collecting and browsing packaging, visual references, and other saved items.

## Requirements

- Node.js 20.19 or later
- npm

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open the local URL printed by Vite in your browser (usually `http://localhost:5173`).

## Production build

Create an optimized production build:

```bash
npm run build
```

Preview that build locally:

```bash
npm run preview
```

## Project structure

- `src/App.jsx` — React UI, navigation, local storage, search, and creation flows.
- `src/main.jsx` — React application entry point.
- `styles.css` — shared visual styling, including the folder glass treatment.
- `assets/` — fonts and starter item images.

Folder and item data are stored in your browser's local storage under `stash-folders-v2`.

## Background removal

The Add Item flow uses `@imgly/background-removal` by default, so removal runs directly in the browser without an API key or local server route. The model and WebAssembly runtime are downloaded on first use and then cached by the browser.

To use a hosted service or local Python backend instead, set `VITE_BG_REMOVAL_ENDPOINT` before starting or building the app. The endpoint receives `multipart/form-data` with the cropped PNG under `image`, plus `size=full` and `crop=false`. It may return an image body or JSON containing an `image`, `result`, or `url` value.
