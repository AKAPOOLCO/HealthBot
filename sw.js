'use strict';

/*
 * HealthBot service worker (§6.1).
 *
 * There is nothing to fetch — HealthBot is fully offline and its CSP sets
 * connect-src 'none'. This worker's only job is to make the three files
 * that make up the app (this file, the HTML, and the manifest) durable on
 * the device by keeping them in the Cache Storage API, and to serve them
 * from that cache so the app still opens with no network at all — on a
 * plane, in a gym basement, or on iOS after the tab itself has been evicted.
 *
 * Bump CACHE_NAME on any release that changes cached file contents so the
 * old cache is cleaned up on activate; see APP_VERSION in HealthBot.html.
 */

const CACHE_NAME = 'healthbot-cache-v3.0.0';
const CACHED_FILES = [
  './HealthBot.html',
  './manifest.webmanifest',
  './sw.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CACHED_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

/* Cache-first: every request this app ever makes is for one of its own
   three local files, so there is no network fallback path to write. */
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
