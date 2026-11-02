self.APPS_PWA_CONFIG={
  cacheName:'inclass-shared-v14',
  cachePrefix:'inclass-',
  // Online requests must check for fresh lesson, notes and shared auth code.
  // The shared worker retains a cached copy as an offline fallback.
  defaultStrategy:'network-first',
  precache:["./icon.svg","./icons/icon-180.png","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png",'./','./index.html','./styles.css','./manifest.webmanifest','./config/app-config.js','./services/auth-service.js','./services/data-service.js','./data/manifest.js','./data/2026-09-25-english-plurals-y5.js','./data/2026-09-french-pets.js','./data/2026-10-05-french-opinions.js','./assets/source-sheets/2026-10-05-homework.01.b64','./assets/source-sheets/2026-10-05-homework.02.b64','./assets/source-sheets/2026-10-05-homework.03.b64','./assets/source-sheets/2026-10-05-opinions.01.b64','./assets/source-sheets/2026-10-05-opinions.02.b64','./assets/source-sheets/2026-10-05-opinions.03.b64','./assets/source-sheets/2026-10-05-opinions.04.b64','./data/2026-10-05-english-cat-vocabulary.js','./data/2026-10-05-french-opinions-v2.js','./data/2026-11-02-french-avoir.js','./french-opinions-v2.css','./french-opinions-v2.js','./french-avoir.css','./french-avoir.js','./app.js','./french-extension.js','./french-opinions-extension.js','./learning-tools.js','./pronunciation-extension.js','./welcome.js','./inclass-notes.js','./inclass-notes-sync.css','./services/family-notes.js','./services/app-monitor-notes.js','./inclass-development-feedback.js']
};
importScripts('https://nirav2000.github.io/Apps/pwa/v1/service-worker.js');
