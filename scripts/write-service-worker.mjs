import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');

async function filesIn(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = await Promise.all(entries.map(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? filesIn(file) : Promise.resolve([file]);
  }));
  return results.flat();
}

const files = (await filesIn(dist)).filter(file => path.basename(file) !== 'sw.js').sort();
const assets = files.map(file => `/${path.relative(dist, file).split(path.sep).join('/')}`);
const hash = createHash('sha256');
for (const file of files) {
  hash.update(path.relative(dist, file));
  hash.update(await readFile(file));
}
const cacheName = `jane-birthday-${hash.digest('hex').slice(0, 12)}`;
const source = `const CACHE_NAME = ${JSON.stringify(cacheName)};
const PRECACHE = ${JSON.stringify(['/', ...assets])};

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names => Promise.all(names.filter(name => name.startsWith('jane-birthday-') && name !== CACHE_NAME).map(name => caches.delete(name)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put('/', copy)));
      }
      return response;
    }).catch(() => caches.match('/').then(cached => cached || caches.match('/index.html'))));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)));
    }
    return response;
  })));
});
`;
await writeFile(path.join(dist, 'sw.js'), source);
console.log(`Offline cache prepared for ${assets.length} files (${cacheName}).`);
