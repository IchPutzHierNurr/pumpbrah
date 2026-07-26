/* --------------------------------------------------------------------------
   PUMPBRAH — Service Worker

   Der Grund für diese Datei: Die App wird ausschließlich an einem Ort benutzt,
   an dem das Netz schlecht ist. Ohne Service Worker zeigt die installierte
   App im Keller-Studio eine Browser-Fehlerseite statt des Workouts — und zwar
   genau dann, wenn man sie braucht.

   Strategie:
   * Navigation (die HTML-Seite): erst Netz, dann Cache. So kommt eine neue
     Version an, sobald Empfang da ist, und offline läuft die letzte bekannte.
     Umgekehrt (Cache first) würde ein Update erst nach dem übernächsten
     Öffnen sichtbar — bei einer App, die aus einer einzigen Datei besteht,
     wäre das jede Änderung.
   * Alles andere: erst Cache, dann Netz, und das Ergebnis wird abgelegt.

   Die App ist eine einzige HTML-Datei; es gibt keine Build-Hashes, an denen
   man eine Version erkennen könnte. Deshalb wird der Cache-Name von Hand
   erhöht, wenn sich am Caching etwas ändert — der Inhalt selbst aktualisiert
   sich über die Netz-zuerst-Regel von allein.
   -------------------------------------------------------------------------- */
const CACHE = 'pumpbrah-v1';
const CORE = ['./', './index.html'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(CORE))
      /* Ein fehlgeschlagener Vorab-Cache darf die Installation nicht
         verhindern — dann läuft die App eben online weiter. */
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  /* Fremde Hosts nicht anfassen: Firestore braucht seine eigene Fehlerlogik,
     und ein Cache-Treffer auf eine Sync-Antwort wäre schlicht falsch. */
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => hit))
  );
});
