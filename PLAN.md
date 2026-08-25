# Stash implementation plan

## Goal

Build the mobile-first Stash web app from the three supplied Figma states:

1. **Stash overview** (`5:7`) — collection cards, creation controls, and global search.
2. **Create-stash state** (`22:1740`) — create a named, colour-coded folder.
3. **Global-search state** (`41:283`) — live item matches across all folders.

## Delivery plan

- [x] Audit the existing static HTML/CSS/JavaScript prototype and the Figma node context.
- [x] Preserve the existing no-build static architecture.
- [x] Rebuild the shared visual system: grid-paper background, display typography, buttons, search control, cards, and modal layers.
- [x] Implement folders (stashes), item detail viewing, and cross-stash search.
- [x] Implement local image upload with a client-side square crop/position editor; save the image and metadata to local storage.
- [x] Replace the placeholder imagery with Figma-exported assets where applicable, while uploaded images remain user supplied.
- [x] Verify JavaScript syntax and application asset paths. Browser-based visual testing could not run because no browser is connected in this session.

## Interaction model

- **Create Stash** opens a modal and stores a colour-coded folder.
- **Add Item** opens an upload form. Choosing an image shows a crop editor; saving creates an item in the active stash.
- **Search** matches folder names, item names, materials, and notes globally, and returns matching item thumbnails.
- Selecting a stash opens its collection; selecting an item opens its detail page.

## Scope note

The image tool is a local crop/position editor. Automatic foreground extraction (AI background removal) needs a separate image-processing service and is not included in this static prototype.
