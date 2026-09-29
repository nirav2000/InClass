const CACHE="inclass-v10";
const CORE=[
  "./","./index.html","./styles.css","./manifest.webmanifest",
  "./config/app-config.js",
  "./services/auth-service.js","./services/data-service.js",
  "./data/manifest.js","./data/2026-09-25-english-plurals-y5.js","./data/2026-09-french-pets.js",
  "./app.js","./french-extension.js","./learning-tools.js","./welcome.js"
];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));