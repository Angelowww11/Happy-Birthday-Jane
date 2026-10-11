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

All personal text, photo captions and paths, quiz answers, the date plan, and letters live in `src/content/content.ts`. Search for `[` to find the remaining private details only Angelo can supply. The date invitation deliberately leaves the time and place undecided. Its calendar download is an all-day reminder for October 18, 2026.

The photos used by the site are organized as `public/photos/her/` and `public/photos/us/`. Each full image has a `-tiny.webp` preview for blur-up loading. To replace or add photos:

1. Put originals into `drive-photos/Jane/` or `drive-photos/Together/` locally. This folder is Git ignored.
2. Edit `SELECTED` in `scripts/prepare_photos.py`, then run `python scripts/prepare_photos.py` with Pillow installed.
3. Add matching image paths, captions, and descriptive alt text in `src/content/content.ts`.

For a permitted Nailong sticker you own, place an image at `public/assets/nailong/buddy.png` and set `nailongAsset` to `/assets/nailong/buddy.png` in `content.ts`. Without one, an original yellow buddy appears.

The site asks crawlers not to index it, but the Vercel URL is public. Avoid putting anything here that should remain secret. The opening envelope is for the experience, not authentication.

## Before sending the link

- Replace the three bracketed details in the letters with real memories and habits.
- Review every photo and caption for what Jane would be comfortable seeing publicly.
- Update the October 18 time and place when they are settled.
- Play through the letters, games, and date invitation once on a phone.
- Share the final Vercel URL with Jane.
