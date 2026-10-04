self.APPS_PWA_CONFIG={
  cacheName:'inclass-shared-v1',
  cachePrefix:'inclass-',
  defaultStrategy:'cache-first',
  precache:['./','./index.html','./styles.css','./manifest.webmanifest','./config/app-config.js','./services/auth-service.js','./services/data-service.js','./data/manifest.js','./data/2026-09-25-english-plurals-y5.js','./data/2026-09-french-pets.js','./app.js','./french-extension.js','./learning-tools.js','./pronunciation-extension.js','./welcome.js']
};
importScripts('https://nirav2000.github.io/Apps/pwa/v1/service-worker.js');
