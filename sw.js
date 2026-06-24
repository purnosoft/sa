const CACHE_NAME = "study-assist-v2";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./sw.js",
  
  "./js/main.js",
  "./js/achievements.js",
  "./js/history.js",
  "./js/importExport.js",
  "./js/leveling.js",
  "./js/rewards.js",
  "./js/sounds.js",
  "./js/stopwatch.js",
  "./js/storage.js",
  "./js/timer.js",
  "./js/ui.js",
  "./js/utils.js",
  
  "./css/animations.css",
  "./css/base.css",
  "./css/components.css",
  "./css/layout.css",
  
  "./css/pages/achievements.css",
  "./css/pages/history.css",
  "./css/pages/home.css",
  "./css/pages/import.css",
  "./css/pages/menu.css",
  "./css/pages/profile.css",
  
  "./sounds/ach.wav",
  "./sounds/click.wav",
  "./sounds/error.wav",
  "./sounds/imported.wav",
  "./sounds/serror.wav",
  "./sounds/success.wav",
  "./sounds/task1.wav",
  "./sounds/task2.wav",
  "./sounds/task3.wav",
  "./sounds/updateBar.wav",
  
  "./manifest/manifest.json",
  
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/favicon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
