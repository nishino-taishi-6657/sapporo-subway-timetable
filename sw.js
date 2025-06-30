const CACHE_NAME = 'timetable-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/timetable.html',
  '/styles.css',
  '/script.js',
  '/timetable.js',
  '/footer.html',
  '/data/stations.json',
  '/data/sakaemachi_timetable.csv',
  '/data/kita13_timetable.csv',
  '/data/misono_timetable.csv',
  '/data/fukuzumi_timetable.csv'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
