# Happy Birthday, Jane

A chapter-based birthday gift for Jane, made by Angelo. Built with Vite, React, TypeScript, Tailwind CSS, Framer Motion, and six small games. The original photos are intentionally excluded from Git; the selected, optimized WebP images are in `public/photos/`.

## Run it

```bash
npm install
npm run dev
npm run build
```

Deploy the repository to Vercel with framework preset **Vite**, build command `npm run build`, and output directory `dist`.

## Edit the personal details

All personal text, photo captions and paths, quiz answers, the October 19 date, and letters live in `src/content/content.ts`.

The photos used by the site are organized as `public/photos/her/` and `public/photos/us/`. Each full image has a `-tiny.webp` preview for blur-up loading. To replace or add photos:

1. Put originals into `drive-photos/Jane/` or `drive-photos/Together/` locally. This folder is Git ignored.
2. Edit `SELECTED` in `scripts/prepare_photos.py`, then run `python scripts/prepare_photos.py` with Pillow installed.
3. Add matching image paths, captions, and descriptive alt text in `src/content/content.ts`.

The Nailong stickers in `public/assets/nailong/` come from the small plush in one of the couple's own photos. The peony, magnolia, and mixed floral artwork in `public/assets/flowers/` were generated for this design. The main sticker path is configured as `nailongAsset` in `content.ts`.

The site asks crawlers not to index it, but the Vercel URL is public. Avoid putting anything here that should remain secret. The opening envelope is for the experience, not authentication.

## Before sending the link

- Review every photo and caption for what Jane would be comfortable seeing publicly.
- Check the October 19 countdown date before sharing.
- Play through the letters, games, and date card once on a phone.
- Share the final Vercel URL with Jane.
