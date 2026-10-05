self.APPS_PWA_CONFIG={
  cacheName:'inclass-shared-v6',
  cachePrefix:'inclass-',
  defaultStrategy:'cache-first',
  precache:['./','./index.html','./styles.css','./manifest.webmanifest','./config/app-config.js','./services/auth-service.js','./services/data-service.js','./data/manifest.js','./data/2026-09-25-english-plurals-y5.js','./data/2026-09-french-pets.js','./data/2026-10-05-french-opinions.js','./assets/source-sheets/2026-10-05-homework.01.b64','./assets/source-sheets/2026-10-05-homework.02.b64','./assets/source-sheets/2026-10-05-homework.03.b64','./assets/source-sheets/2026-10-05-opinions.01.b64','./assets/source-sheets/2026-10-05-opinions.02.b64','./assets/source-sheets/2026-10-05-opinions.03.b64','./assets/source-sheets/2026-10-05-opinions.04.b64','./app.js','./french-extension.js','./french-opinions-extension.js','./learning-tools.js','./pronunciation-extension.js','./welcome.js']
};
importScripts('https://nirav2000.github.io/Apps/pwa/v1/service-worker.js');
