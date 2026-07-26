/**
 * EIN WINZIGER HTTP-SERVER FÜR DEN SERVICE-WORKER-TEST
 *
 * Warum. Der Service Worker war der letzte Eintrag auf der Liste „außerhalb
 * des Harnesses". Der Grund ist eine Regel des Browsers, nicht ein Mangel der
 * App: unter `file://` gibt es `navigator.serviceWorker` schlicht nicht.
 * Also braucht der Test einen Server — und mehr als dreißig Zeilen sind das
 * nicht.
 *
 * Was er zusätzlich kann, und deshalb gibt es ihn überhaupt: Er kann die
 * ausgelieferte Seite **verändern**, ohne die Datei auf der Platte
 * anzufassen. Genau das braucht die wichtigste Prüfung — kommt nach einer
 * Änderung die neue Fassung an, oder serviert der Cache für immer die alte?
 * Das ist die unangenehmste Fehlerart einer installierten Web-App: Niemand
 * kann sie melden, weil niemand merkt, dass er eine alte Version sieht.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const TYPEN = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8'
};

export async function serve(wurzel) {
  /* Die Marke landet als <meta> in jeder ausgelieferten HTML-Seite. Der Test
     ändert sie und prüft, welche Fassung im Browser ankommt. */
  const zustand = { marke: 'A', anfragen: [], offline: false };

  const server = createServer(async (req, res) => {
    const pfad = decodeURIComponent(req.url.split('?')[0]);
    zustand.anfragen.push(pfad);
    if (zustand.offline) { res.socket.destroy(); return; }

    /* Kein Ausbruch aus der Wurzel — der Server läuft nur lokal, aber ein
       Test, der Pfad-Traversal erlaubt, lehrt die falsche Gewohnheit. */
    const rel = normalize(pfad === '/' ? '/index.html' : pfad).replace(/^(\.\.[/\\])+/, '');
    const datei = join(wurzel, rel);
    if (!datei.startsWith(wurzel)) { res.writeHead(403).end('nope'); return; }

    try {
      let inhalt = await readFile(datei);
      const typ = TYPEN[extname(datei)] || 'application/octet-stream';
      if (extname(datei) === '.html') {
        inhalt = Buffer.from(String(inhalt).replace(
          '<head>', `<head><meta name="pb-marke" content="${zustand.marke}">`));
      }
      res.writeHead(200, { 'Content-Type': typ, 'Cache-Control': 'no-store' });
      res.end(inhalt);
    } catch { res.writeHead(404).end('weg'); }
  });

  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  return {
    url: `http://127.0.0.1:${port}/`,
    zustand,
    setzeMarke(m) { zustand.marke = m; },
    /* Serverseitig „das Netz ist weg": Verbindungen werden hart getrennt.
       Realistischer als ein sauberes 503 — so verhält sich ein totes Funkloch. */
    setzeOffline(an) { zustand.offline = !!an; },
    anfragenAuf(muster) { return zustand.anfragen.filter(p => p.includes(muster)).length; },
    async stop() { await new Promise(r => server.close(r)); }
  };
}
