/**
 * EINE GEFÄLSCHTE FIRESTORE
 *
 * Warum überhaupt. Der Sync war der einzige große Teil der App, der in keinem
 * Test lief — und gleichzeitig der, in dem stille Datenverluste wohnen. Der
 * Grund war banal: `db` ist nur gesetzt, wenn das Firebase-SDK von einem CDN
 * geladen wurde. Unter `file://` ohne Netz passiert das nie, also nahm
 * `initFirebase()` immer den `catch`-Zweig und `queueCloudSave()` kehrte in
 * Zeile eins zurück. Tausende Fuzz-Runden über eine Funktion, die nichts tat.
 *
 * Warum kein echter Emulator. Die App berührt vom SDK **sieben** Methoden:
 *
 *     firebase.initializeApp · firebase.firestore
 *     db.collection(c).doc(id) → .get() · .set() · .delete() · .onSnapshot()
 *
 * Ein Double dafür ist kürzer als seine Begründung. Und es prüft das, was wir
 * besitzen — die Merge-Logik, die Tombstones, die Konfliktauflösung. Der
 * Emulator würde vor allem Googles SDK prüfen. Was das Double NICHT prüft:
 * ob das echte SDK sich so verhält wie diese Nachbildung. Das ist die bewusst
 * gewählte Lücke.
 *
 * Wo der Store liegt. In Node, nicht in der Seite. Nur so teilen ihn zwei
 * Browser-Contexts wirklich — und genau das braucht der interessante Test:
 * zwei Geräte, ein Konto.
 *
 * Warum Benachrichtigungen NICHT automatisch zugestellt werden. `onSnapshot`
 * feuert bei echtem Firestore, wann es will. Für einen Test ist das Gift: die
 * spannenden Fehler stecken in einer *bestimmten* Verschränkung von Lesen und
 * Schreiben. Deshalb sammelt `set()` die fälligen Benachrichtigungen nur ein,
 * und `flush()` stellt sie zu. Der Test bestimmt damit die Reihenfolge — und
 * kann eine Wettlaufsituation absichtlich bauen statt auf sie zu hoffen.
 */

export function createFakeFirestore() {
  const docs = new Map();        // 'sammlung/id' -> JSON-String (wie Firestore: Werte, keine Verweise)
  const vers = new Map();        // 'sammlung/id' -> Versionszähler, für Transaktionen
  const subs = [];               // { pfad, page, id }
  const pending = [];            // fällige Benachrichtigungen, wartet auf flush()
  const log = [];                // jede Operation, damit ein Test sie belegen kann
  const txs = new Map();         // laufende Transaktionen: id -> { reads, who }
  let latency = 0;               // künstliche Verzögerung in ms, für Verschränkungen
  let nextSub = 1, nextTx = 1;

  const wait = ms => new Promise(r => setTimeout(r, ms));
  const bump = path => vers.set(path, (vers.get(path) || 0) + 1);

  const api = {
    docs, log,
    /** Verzögerung für jeden get/set — macht Wettläufe reproduzierbar. */
    setLatency(ms) { latency = Math.max(0, ms | 0); },
    reset() { docs.clear(); vers.clear(); subs.length = 0; pending.length = 0; log.length = 0; latency = 0; },
    /** Wie viele onSnapshot-Beobachter hängen noch dran? (Für Abmelde-Tests.) */
    subCount() { return subs.length; },

    /** Direkter Blick in den Store, ohne über die Seite zu gehen. */
    read(path) { const s = docs.get(path); return s === undefined ? null : JSON.parse(s); },
    write(path, obj) { docs.set(path, JSON.stringify(obj)); },
    has(path) { return docs.has(path); },
    ops(kind) { return kind ? log.filter(o => o.op === kind) : log.slice(); },

    async _get(path, who) {
      if (latency) await wait(latency);
      log.push({ op: 'get', path, who, t: log.length });
      const s = docs.get(path);
      return { exists: s !== undefined, data: s === undefined ? null : s };
    },
    async _set(path, json, who) {
      if (latency) await wait(latency);
      log.push({ op: 'set', path, who, bytes: json.length, t: log.length });
      docs.set(path, json); bump(path);
      /* Jeder Beobachter außer dem Schreiber selbst bekommt eine
         Benachrichtigung — echtes Firestore ruft den eigenen Listener auch
         auf, aber dort ist es ein No-Op, weil die Daten identisch sind. */
      subs.forEach(s => { if (s.path === path && s.who !== who) pending.push({ sub: s, json }); });
      return true;
    },
    async _delete(path, who) {
      if (latency) await wait(latency);
      log.push({ op: 'delete', path, who, t: log.length });
      docs.delete(path); bump(path);
      subs.forEach(s => { if (s.path === path && s.who !== who) pending.push({ sub: s, json: null }); });
      return true;
    },
    /**
     * Eine Transaktion, wie Firestore sie meint: optimistisch. Der Rumpf läuft,
     * merkt sich die Version jedes gelesenen Dokuments, und beim Festschreiben
     * wird geprüft, ob sich seither etwas geändert hat. Wenn ja: **noch einmal
     * von vorn**, mit den neuen Daten. Genau dieses Wiederholen ist der
     * Unterschied zwischen „liest und schreibt" und „liest und schreibt, ohne
     * dass jemand dazwischenkommt" — und damit der Kern von PB-022.
     *
     * Der Rumpf kommt aus der Seite, also läuft er dort; hier fließen nur die
     * gelesenen Werte hin und die zu schreibenden zurück.
     */
    async _txBegin(who) {
      const id = nextTx++;
      txs.set(id, { reads: new Map(), who });
      log.push({ op: 'tx-begin', who, id, t: log.length });
      return id;
    },
    async _txGet(id, path) {
      if (latency) await wait(latency);
      const tx = txs.get(id);
      if (!tx) throw new Error('Unbekannte Transaktion ' + id);
      log.push({ op: 'tx-get', path, who: tx.who, t: log.length });
      tx.reads.set(path, vers.get(path) || 0);
      const s = docs.get(path);
      return { exists: s !== undefined, data: s === undefined ? null : s };
    },
    /** true = festgeschrieben, false = Konflikt, der Rumpf muss neu laufen. */
    async _txCommit(id, writes) {
      if (latency) await wait(latency);
      const tx = txs.get(id);
      if (!tx) throw new Error('Unbekannte Transaktion ' + id);
      txs.delete(id);
      for (const [path, gelesen] of tx.reads) {
        if ((vers.get(path) || 0) !== gelesen) {
          log.push({ op: 'tx-conflict', who: tx.who, t: log.length });
          return false;
        }
      }
      writes.forEach(([path, json]) => {
        docs.set(path, json); bump(path);
        subs.forEach(s => { if (s.path === path && s.who !== tx.who) pending.push({ sub: s, json }); });
      });
      log.push({ op: 'tx-commit', who: tx.who, writes: writes.length, t: log.length });
      return true;
    },
    _subscribe(path, page, who) {
      const id = nextSub++;
      subs.push({ path, page, who, id });
      return id;
    },
    _unsubscribe(id) {
      const i = subs.findIndex(s => s.id === id);
      if (i >= 0) subs.splice(i, 1);
    },

    /**
     * Stellt alle aufgelaufenen onSnapshot-Benachrichtigungen zu und wartet,
     * bis die Seiten sie verarbeitet haben. Mehrfach aufrufen, wenn eine
     * Zustellung selbst wieder einen Schreibvorgang auslöst (das tut sie:
     * startSync schreibt zurück, wenn der Merge etwas geändert hat).
     */
    async flush(runden = 3) {
      for (let r = 0; r < runden; r++) {
        if (!pending.length) break;
        const batch = pending.splice(0, pending.length);
        for (const { sub, json } of batch) {
          try {
            await sub.page.evaluate(
              ([id, data]) => window.__fsDeliver && window.__fsDeliver(id, data),
              [sub.id, json]);
          } catch { /* Seite geschlossen oder navigiert — keine Zustellung */ }
        }
        // Zurückschreiben aus dem Listener braucht einen Moment.
        await wait(60 + latency * 2);
      }
      return pending.length;
    },

    /**
     * Hängt das Double in einen Browser-Context. Zwei Dinge sind nötig:
     * (1) das echte SDK vom CDN abfangen, sonst überschreibt es die
     *     Nachbildung, sobald doch einmal Netz da ist;
     * (2) `window.firebase` setzen, BEVOR ein Skript der Seite läuft.
     */
    async install(context, who = 'A') {
      await context.route('**/firebasejs/**', route => route.abort());
      await context.exposeBinding('__fsGet', ({ }, path) => api._get(path, who));
      await context.exposeBinding('__fsSet', ({ }, [path, json]) => api._set(path, json, who));
      await context.exposeBinding('__fsDel', ({ }, path) => api._delete(path, who));
      await context.exposeBinding('__fsSub', ({ page }, path) => api._subscribe(path, page, who));
      await context.exposeBinding('__fsUnsub', ({ }, id) => api._unsubscribe(id));
      await context.exposeBinding('__txBegin', ({ }) => api._txBegin(who));
      await context.exposeBinding('__txGet', ({ }, [id, path]) => api._txGet(id, path));
      await context.exposeBinding('__txCommit', ({ }, [id, writes]) => api._txCommit(id, writes));
      await context.addInitScript(() => {
        const listeners = new Map();
        window.__fsDeliver = (id, json) => {
          const cb = listeners.get(id);
          if (!cb) return;
          cb({ exists: json !== null, data: () => (json === null ? null : JSON.parse(json)) });
        };
        const makeRef = path => ({
          __path: path,
          async get() {
            const r = await window.__fsGet(path);
            return { exists: r.exists, data: () => (r.data === null ? null : JSON.parse(r.data)) };
          },
          async set(obj) { await window.__fsSet([path, JSON.stringify(obj)]); },
          async delete() { await window.__fsDel(path); },
          onSnapshot(cb) {
            /* Die echte API gibt die Abmeldefunktion SOFORT zurück, die
               Registrierung ist aber asynchron. Also die Zusage weitergeben
               und beim Abmelden darauf warten — sonst bliebe ein Listener
               nach doLogout am Leben. */
            const p = window.__fsSub(path).then(id => { listeners.set(id, cb); return id; });
            return () => p.then(id => { listeners.delete(id); return window.__fsUnsub(id); });
          }
        });
        /* runTransaction wie im echten compat-SDK: der Rumpf kann mehrfach
           laufen. `set()` bleibt synchron (so ist die echte API), die
           Schreibvorgänge werden gesammelt und erst beim Festschreiben
           übergeben — sonst könnte man Lesen und Schreiben nicht mehr
           voneinander trennen. */
        const runTransaction = async fn => {
          for (let versuch = 0; versuch < 6; versuch++) {
            const id = await window.__txBegin();
            const writes = [];
            const t = {
              async get(ref) {
                const r = await window.__txGet([id, ref.__path]);
                return { exists: r.exists, data: () => (r.data === null ? null : JSON.parse(r.data)) };
              },
              set(ref, obj) { writes.push([ref.__path, JSON.stringify(obj)]); return t; }
            };
            const ergebnis = await fn(t);
            if (await window.__txCommit([id, writes])) return ergebnis;
          }
          throw new Error('Transaktion nach 6 Versuchen nicht festgeschrieben');
        };
        window.firebase = {
          initializeApp: () => ({ name: 'fake' }),
          firestore: () => ({
            collection: c => ({ doc: id => makeRef(c + '/' + id) }),
            runTransaction
          })
        };
        /* Damit ein nachgeladenes echtes SDK die Nachbildung nicht ersetzt. */
        try {
          Object.defineProperty(window, 'firebase',
            { value: window.firebase, writable: false, configurable: false });
        } catch { /* schon gesperrt */ }
      });
      return api;
    }
  };
  return api;
}
