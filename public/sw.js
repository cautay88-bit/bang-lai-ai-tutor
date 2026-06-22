const CACHE_NAME = "bang-lai-v7";
const ASSETS = [
  "/",
  "/index.html",
  "/css/style.css",
  "/images/bg-pattern.svg",
  "/images/logo-car.svg",
  "/js/topics.js",
  "/js/questions.js",
  "/js/extra-questions.js",
  "/js/sahinh-questions.js",
  "/js/question-loader.js",
  "/js/storage.js",
  "/js/auth.js",
  "/js/api.js",
  "/js/app.js",
  "/manifest.webmanifest",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "/images/sa-hinh/intersection.svg",
  "/images/sa-hinh/pedestrian.svg",
  "/images/sa-hinh/roundabout.svg",
  "/images/sa-hinh/left-turn.svg",
  "/images/sa-hinh/priority-road.svg",
  "/images/sa-hinh/narrow-bridge.svg",
  "/images/sa-hinh/school-zone.svg",
  "/images/sa-hinh/highway-merge.svg",
  "/images/sa-hinh/railway.svg",
  "/images/sa-hinh/downhill.svg",
  "/images/sa-hinh/emergency.svg",
  "/images/sa-hinh/red-light-right.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.method !== "GET") return;

  // Luon lay bank moi nhat (co field image)
  if (url.pathname === "/data/bank-600.json") {
    event.respondWith(
      fetch(event.request).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return res;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Anh chinh thuc: cache sau khi tai thanh cong
  if (url.pathname.startsWith("/images/official/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached =>
          cached || fetch(event.request).then(res => {
            if (res.ok) cache.put(event.request, res.clone());
            return res;
          })
        )
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
