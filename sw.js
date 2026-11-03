/* --------------------------------------------------------------------------
   PUMPBRAH — Service Worker

   Der Grund für diese Datei: Die App wird ausschließlich an einem Ort benutzt,
   an dem das Netz schlecht ist. Ohne Service Worker zeigt die installierte
   App im Keller-Studio eine Browser-Fehlerseite statt des Workouts — und zwar
   genau dann, wenn man sie braucht.

   Strategie:
   * Navigation (die HTML-Seite): erst Netz, aber höchstens 2,5 s. So kommt
     eine neue Version an, sobald Empfang da ist, und ohne Netz läuft sofort
     die letzte bekannte. Hängt das Netz (Keller: ein Balken, keine Antwort),
     startet nach 2,5 s die gespeicherte Fassung; die Antwort aus dem Netz
     legt sich nebenher in den Cache und gilt ab dem nächsten Öffnen.
     Umgekehrt (Cache first) würde ein Update erst nach dem übernächsten
     Öffnen sichtbar — bei einer App, die aus einer einzigen Datei besteht,
     wäre das jede Änderung.
   * Alles andere: erst Cache, dann Netz, und das Ergebnis wird abgelegt.
   * Fremde Hosts (Schriften, Firebase) fasst er nicht an: Schriftdateien
     liegen bewusst nicht im Cache, bis sie da sind, gilt die Systemschrift.

   Die App ist eine einzige HTML-Datei; es gibt keine Build-Hashes, an denen
   man eine Version erkennen könnte. Deshalb wird der Cache-Name von Hand
   erhöht, wenn sich am Caching etwas ändert — der Inhalt selbst aktualisiert
   sich über die Netz-zuerst-Regel von allein.
   -------------------------------------------------------------------------- */
const CACHE = 'pumpbrah-v2';
/* Längste Wartezeit aufs Netz, bevor die gespeicherte Seite startet. */
const NETZ_GRENZE = 2500;
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
    const gespeichert = () => caches.match(req).then(hit => hit || caches.match('./index.html'));
    /* Die Netzantwort landet immer im Cache, auch wenn sie zu spät für
       dieses Öffnen kommt — waitUntil hält den Worker dafür am Leben. Nur
       eine gute Antwort ersetzt die gespeicherte Fassung. */
    const netz = fetch(req).then(res => {
      if (res.ok) {
        const copy = res.clone();
        event.waitUntil(caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}));
      }
      return res;
    });
    event.waitUntil(netz.catch(() => {}));
    event.respondWith(new Promise(antworte => {
      let fertig = false;
      const gib = res => { if (!fertig && res) { fertig = true; antworte(res); } };
      /* Nach der Grenze die gespeicherte Fassung — gibt es keine (erster
         Besuch), bleibt es beim Warten aufs Netz. */
      const uhr = setTimeout(() => gespeichert().then(gib).catch(() => {}), NETZ_GRENZE);
      netz.then(res => { clearTimeout(uhr); gib(res); },
        () => { clearTimeout(uhr); gespeichert().then(hit => gib(hit || Response.error()), () => gib(Response.error())); });
    }));
    return;
  }

  event.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => {
      /* Hier stand `.catch(() => hit)` — und `hit` ist in diesem Zweig
         zwangsläufig leer, sonst wären wir gar nicht hier. `respondWith`
         bekam also `undefined`, was der Browser als Netzwerkfehler behandelt:
         zufällig das richtige Verhalten, aber aus dem falschen Grund und
         ohne erkennbare Absicht. Jetzt steht da eine echte Antwort. */
      return new Response('', { status: 504, statusText: 'offline, nicht im Cache' });
    }))
  );
});
