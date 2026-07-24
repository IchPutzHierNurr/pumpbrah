# PUMPBRAH — Code-Review als Lerndokument

> Geschrieben so, wie ein Senior-Engineer ein Review führt: nicht „das ist falsch",
> sondern **„das ist die Fehlerklasse, so erkennst du sie beim nächsten Mal selbst"**.
> Jeder Abschnitt hat dieselbe Struktur: *Was war da → Warum ist das ein Problem →
> Wie sieht die Reparatur aus → Die übertragbare Lektion.*

**Reviewgegenstand:** `index.html`, Single-File-Web-App, ~2.500 Zeilen (HTML + CSS + JS),
Vanilla JS ohne Build-Schritt, Firestore als Sync-Backend.

---

## Inhaltsverzeichnis

1. [Das Gesamturteil](#1-das-gesamturteil)
2. [Architektur: die Single-File-Entscheidung](#2-architektur-die-single-file-entscheidung)
3. [Sicherheit: XSS in einer App, die syncht](#3-sicherheit-xss-in-einer-app-die-syncht)
4. [Die offene Datenbank](#4-die-offene-datenbank)
5. [Datenmodell und Identität](#5-datenmodell-und-identität)
6. [Sync und Merge: CRDT-Denken für Arme](#6-sync-und-merge-crdt-denken-für-arme)
7. [Die Zeit-Bugs](#7-die-zeit-bugs)
8. [Zahlen, die niemand geprüft hat](#8-zahlen-die-niemand-geprüft-hat)
9. [Die Fehlerklasse „Guard an der falschen Stelle"](#9-die-fehlerklasse-guard-an-der-falschen-stelle)
10. [Rendering und Performance](#10-rendering-und-performance)
11. [UX-Schulden, die wie Code-Schulden wirken](#11-ux-schulden-die-wie-code-schulden-wirken)
12. [Was richtig gut gemacht war](#12-was-richtig-gut-gemacht-war)
13. [Checkliste zum Mitnehmen](#13-checkliste-zum-mitnehmen)
14. [Nachtrag: der Plattform-Pass](#14-nachtrag-der-plattform-pass)

---

## 1. Das Gesamturteil

Die App ist **substanziell besser als die meisten Hobby-Projekte**. Sie hat ein
durchdachtes Designsystem, ein echtes Merge-Verfahren für Multi-Device-Sync inklusive
Tombstones, defensive Normalisierung der Daten beim Laden und eine Domänenlogik
(RIR, e1RM, Deload-Erkennung), die zeigt, dass der Autor weiß, worüber er schreibt.

Und trotzdem: Es waren **Bugs drin, die einen Nutzer echte Daten kosten** und
**mindestens eine Lücke, über die ein Fremder Code in deinem Browser ausführen kann.**

Das ist typisch und lehrreich. Die Fehler sitzen nicht dort, wo der Autor
nachgedacht hat — sie sitzen genau an den Nahtstellen zwischen zwei Dingen,
über die *einzeln* nachgedacht wurde:

- Cardio funktioniert. Statistik funktioniert. Cardio *in* der Statistik: kaputt.
- Dedupe funktioniert. Bearbeiten funktioniert. Bearbeiten *nach* Sync: Duplikate.
- `D.active` prüfen funktioniert. `setTimeout` funktioniert. Der Guard *vor* dem Timeout: nutzlos.

> **Lektion 0 — die wichtigste im ganzen Dokument:**
> Bugs entstehen selten in Funktionen. Sie entstehen zwischen ihnen.
> Wenn du reviewst, such nicht nach falschem Code — such nach **Annahmen, die
> eine Funktion über eine andere trifft, ohne sie durchzusetzen.**

---

## 2. Architektur: die Single-File-Entscheidung

**Was da war:** Alles in einer `index.html`. 590 Zeilen CSS, 1.500 Zeilen JS,
globale Funktionen, `onclick="..."`-Attribute im Markup, ein globales `D`-Objekt
als gesamter Anwendungszustand.

**Das ist keine Sünde.** Für eine persönliche App ohne Build-Pipeline ist es sogar
richtig: keine `node_modules`, kein Bundler, kein Deployment-Schritt. Datei auf
den Webserver, fertig. Sie funktioniert per `file://` und offline.

**Wo es weh tut:** Nicht in der Dateigröße — in den **impliziten Kopplungen**.

```js
// Diese Funktion setzt voraus, dass es global ein D gibt,
// dass D.active existiert, dass D.active.exercises ein Array ist,
// dass ein DOM-Element #wo-c existiert und dass renderWo() danach
// aufgerufen wird, damit man das Ergebnis sieht.
function skipEx(ei){ D.active.exercises[ei].skipped=true; ... }
```

Vier ungeprüfte Annahmen in einer Zeile. Bei 200 solcher Funktionen wächst die
Anzahl möglicher Fehlerpfade nicht linear, sondern kombinatorisch.

**Die Reparatur** war *nicht* „bau es in React um". Sondern: **Zugriffe kanalisieren.**

```js
function activeExercisesSafe(){
  if(!D.active)return[];
  if(!Array.isArray(D.active.exercises))D.active.exercises=[];
  return D.active.exercises;
}
```

Jetzt gibt es **eine** Stelle, an der die Invariante „exercises ist ein Array"
durchgesetzt wird. Aufrufer, die `activeExercisesSafe()[ei]` benutzen und auf
`undefined` prüfen, sind strukturell sicher.

> **Lektion 1:** Du brauchst kein Framework, um Kopplung zu reduzieren.
> Du brauchst *Zugangspunkte*. Wenn 20 Funktionen `D.active.exercises` direkt
> anfassen, hast du 20 Orte für denselben Nullpointer. Wenn sie alle durch
> eine Accessor-Funktion gehen, hast du einen.

> **Lektion 1b:** Single-File ist eine legitime Architektur — aber nur, wenn du
> die Struktur, die dir ein Modulsystem geschenkt hätte, **bewusst per Konvention
> nachbaust**: nummerierte Abschnitte, Accessor-Funktionen, klare Namensräume.
> Genau das machen die neuen `/* === N. ABSCHNITT === */`-Blöcke in der Datei.

---

## 3. Sicherheit: XSS in einer App, die syncht

Das ist der schwerwiegendste Fund. Ich nehme mir dafür Platz.

### Was da war

Jeder Renderer baute HTML per String-Konkatenation:

```js
h += `<div class="exr-n">${ex.name}</div>`;
h += `<div class="exr-note">${ex.note}</div>`;
h += `<button onclick="showExHist('${ex.name.replace(/'/g,"\\'")}')">📈</button>`;
```

Die einzige „Absicherung" war `.replace(/'/g,"\\'")` — ein Escaping für
**einfache Anführungszeichen in JavaScript-Strings**. Das schützt gegen genau
ein Zeichen in genau einem Kontext.

### Warum das ein echtes Problem ist

Man denkt schnell: *„Das sind doch meine eigenen Übungsnamen, ich schreibe
mir doch selbst kein `<script>` rein."* Drei Gründe, warum das nicht trägt:

**a) Es gibt drei Kontexte, nicht einen.** Derselbe String landet in
HTML-Text, in einem HTML-Attribut und in einem JS-String-Literal. Jeder
braucht ein anderes Escaping:

| Zielkontext | Gefährliche Zeichen | Beispiel-Payload |
|---|---|---|
| HTML-Text | `< > &` | `<img src=x onerror=alert(1)>` |
| HTML-Attribut | `" ' < > &` | `" onmouseover="alert(1)` |
| JS-String in `onclick` | `' " \ Zeilenumbruch` | `');alert(1);//` |

Ein Übungsname wie `Fliegende "breit"` zerlegt schon ohne böse Absicht das
Attribut. Ein Name mit `<` (etwa `Rudern <60°`) zerschießt das Markup.

**b) Die Daten kommen aus dem Netz.** Das ist der Punkt, der die Sache von
„unschön" zu „Sicherheitslücke" hebt:

```js
unsubscribe = ref.onSnapshot(doc => {
  const remote = doc.data();     // ← Fremde Daten
  D = mergeSyncedData(remote);   // ← werden zu deinem State
  renderAll();                   // ← und landen ungefiltert im DOM
});
```

Alles, was in dem Firestore-Dokument steht, wird gerendert. Und wer in dieses
Dokument schreiben darf, siehe nächster Abschnitt: **jeder.**

**c) Der Impact ist nicht „ein Alert-Fenster".** Ein Skript im Seitenkontext
liest `localStorage.pb_data` (deine komplette Trainingshistorie, Geburtsdatum,
Gewichtsverlauf, EGYM-Körperanalyse mit Körperfett und Phasenwinkel), liest
`D.ui.avatar` (dein Profilfoto als Data-URL) und kann alles per `fetch()`
irgendwohin schicken. Das ist ein Gesundheitsdatenleck.

### Die Reparatur

```js
const HTML_ENTITIES={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>HTML_ENTITIES[c])}
function attr(s){return esc(s)}                       // gleiche Menge, eigener Name
function jsStr(s){return String(s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
```

Drei Funktionen, drei Kontexte. `esc()` deckt HTML-Text **und** Attribute ab,
weil es `"` und `'` mit einschließt — das ist der pragmatische Kompromiss,
der die häufigste Verwechslung (Text-Escaping in ein Attribut kippen) entschärft.

Dann konsequent überall:

```js
h += `<div class="exr-n">${esc(ex.name)}</div>`;
h += `<button onclick="showExHist('${jsStr(ex.name)}')">📈</button>`;
h += `<span title="${attr(s.note)}">📝</span>`;
```

**Verifiziert** im Browsertest mit einer echten Payload:

```js
D.plan['XSS_Test'].exercises.push(normalizeExercise({
  name: '<img src=x onerror="window.__pwned=1">Böse "Übung"', ...
}));
renderPlan();
// → window.__pwned bleibt undefined, im DOM steht &lt;img …
```

### Warum `esc()` und nicht `textContent`?

`textContent` ist sicherer, weil es gar keinen HTML-Parser anwirft. Aber es
funktioniert nur für einzelne Knoten, nicht für „ich baue 40 Zeilen Markup als
String". Der ehrliche Trade-off lautet:

- **Neubau auf der grünen Wiese** → `textContent` / Template-Element / Framework.
- **Bestehende String-Renderer härten** → eine `esc()`-Funktion und Disziplin.

Weg zwei ist hier richtig, weil er den Diff klein hält. Aber er ist nur so gut
wie die Konsequenz: **eine vergessene Interpolation reicht.**

> **Lektion 2:** Escaping ist kontextabhängig. „Ich escape Anführungszeichen"
> ist keine Antwort auf „welchen Kontext?".

> **Lektion 3:** Frag bei jedem `innerHTML`: *Woher kommt dieser String, im
> schlimmsten Fall?* Wenn irgendein Pfad von außen dorthin führt — Netzwerk,
> Datei-Import, URL-Parameter, geteilter Speicher — ist es fremde Eingabe.

> **Lektion 4:** „Nur ich benutze die App" ist keine Sicherheitsgrenze,
> sobald ein Netzwerk-Sync im Spiel ist.

---

## 4. Die offene Datenbank

Direkt anschließend, weil es Punkt 3 erst scharf macht:

```js
function doLogin(){
  const code = document.getElementById('sync-code').value.trim().toLowerCase();
  syncCode = code;
  db.collection('pumpbrah').doc(code).get()...
}
```

Der „Sync-Code" ist der **Vorname**, kleingeschrieben. Kein Passwort, keine
Firebase Authentication, kein Token. Das Firestore-Dokument heißt schlicht
`pumpbrah/chris`.

Damit gilt: Wer `chris` errät, bekommt alle Daten — und **kann sie überschreiben**,
sofern die Firestore-Security-Rules auf „offen" stehen. Und das tun sie
per Default in einem Projekt, das ohne Auth arbeitet: eine Regel wie
`allow read, write: if true;` ist die einzige, unter der dieser Code überhaupt
funktioniert.

Der API-Key im Quelltext ist dabei **nicht** das Problem — Firebase-Web-API-Keys
sind öffentlich by design, sie identifizieren das Projekt, sie autorisieren nicht.
Das Problem ist das **Fehlen von Regeln dahinter.**

**Das lässt sich nicht im Frontend reparieren.** Deshalb steht es hier als
dokumentierter Befund mit konkretem Weg:

```js
// Minimalinvasiv, ohne Login-UI-Umbau: anonyme Firebase-Auth,
// Dokument-ID = auth.uid statt Vorname.
firebase.auth().signInAnonymously();

// firestore.rules
match /pumpbrah/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```

Der Preis: Der „gleicher Name = gleiche Daten"-Trick über Geräte hinweg fällt weg
und muss durch einen echten Kopplungsmechanismus ersetzt werden (E-Mail-Link,
Custom Token, oder ein einmalig generierter Geräte-Kopplungscode).

> **Lektion 5:** Ein Identifikator ist kein Berechtigungsnachweis.
> „Wer den Namen kennt, darf rein" ist Autorisierung durch Obskurität —
> und Vornamen sind nicht obskur.

> **Lektion 6:** Client-seitige Sicherheit gibt es nicht. Die Regeln müssen
> dort liegen, wo der Angreifer sie nicht editieren kann: auf dem Server.

---

## 5. Datenmodell und Identität

### Der Bug, der Trainingsdaten gelöscht hat

```js
function histSessionKey(s){
  const sets = s.sets.map(histSetKey).sort();
  return 'v2|' + dateKey(s.date) + '|' + s.planKey + '|' + s.duration + '|' + sets.join('¦');
}

// in normalizeData(), bei jedem einzelnen Laden und Speichern:
const seen = new Set();
D.history = D.history.filter(sess => {
  const k = histSessionKey(sess);
  if (seen.has(k)) return false;    // ← Session wird gelöscht
  seen.add(k); return true;
});
```

Die Identität einer Session war ein **Hash über ihren gesamten Inhalt**.
Zwei Konsequenzen, beide schlecht:

**(a) Echter Datenverlust.** Zwei kurze, inhaltlich identische Sessions am
selben Tag — morgens 3×10 Bankdrücken, abends nochmal 3×10 Bankdrücken —
haben denselben Hash. Eine davon wird beim nächsten `save()` **stillschweigend
gelöscht**. Kein Toast, kein Log, keine Rückfrage. Sie ist einfach weg.

**(b) Sync-Duplikate.** Korrigierst du auf Gerät A einen einzigen Satz von
60 kg auf 62,5 kg, ändert sich der Hash. Beim Merge sieht Gerät B einen
*neuen, unbekannten* Schlüssel — und legt eine zweite Session an, statt die
bestehende zu aktualisieren. Ein Tippfehler wird zu einem Geistertraining.

Das ist dieselbe Ursache mit zwei Gesichtern: **Inhalt ≠ Identität.**

### Die Reparatur

```js
function newSessionId(){return 'S'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)}

function histSessionKey(s){
  if(s.id) return 'id|'+s.id;                 // Neue Sessions: stabile ID
  const sets = ...; return 'v2|'+...;         // Altdaten: Hash als Fallback
}
```

Zwei Feinheiten, die den Unterschied zwischen „funktioniert" und
„funktioniert auch in einem halben Jahr" machen:

**Erstens: Altdaten bekommen *keine* ID nachträglich verpasst.**
Die naheliegende Zeile wäre gewesen:

```js
D.history.forEach(s => { if(!s.id) s.id = newSessionId() });   // ✗ FALSCH
```

Das sieht harmlos aus und ist eine Datenkatastrophe: Gerät A würfelt
`S1a2b-x9k`, Gerät B würfelt für **dieselbe Session** `S1a2b-q3m`. Beim
nächsten Sync sind es zwei verschiedene Sessions. Jede Migration von
„kein Schlüssel" zu „Schlüssel" muss **deterministisch oder zentral** sein —
zufällig geht nur dort, wo die Zeile genau einmal im ganzen System läuft.

**Zweitens: Bei gleicher ID braucht es eine Konfliktregel.**

```js
function mergeHistorySession(local,remote){
  const lt=Number(local?.updatedAt)||0, rt=Number(remote?.updatedAt)||0;
  if(rt>lt)return remote;
  if(lt>rt)return local;
  return (remote?.sets||[]).length>(local?.sets||[]).length?remote:local;  // Tiebreak
}
```

Vorher lautete die Merge-Funktion schlicht `(local)=>local` — lokal gewinnt
immer. Damit wäre jede Korrektur auf einem Zweitgerät beim nächsten Sync
weggeputzt worden. Der Tiebreak über die Satzanzahl ist bewusst
**verlustvermeidend**: bei identischem Zeitstempel gewinnt die Fassung mit
*mehr* Daten. Im Zweifel lieber ein Satz zu viel als ein Satz zu wenig.

> **Lektion 7:** Identität ist ein eigenes Feld, kein Nebenprodukt des Inhalts.
> Sobald etwas editierbar oder wiederholbar ist, braucht es eine ID.

> **Lektion 8:** Bei jeder Deduplizierung: *Was passiert, wenn zwei Einträge
> zu Recht gleich aussehen?* Wenn die Antwort „einer verschwindet" ist und du
> das nicht bewusst willst, ist der Schlüssel falsch.

> **Lektion 9:** ID-Migrationen brauchen Determinismus. Zufalls-IDs für
> Bestandsdaten in verteilten Systemen erzeugen garantiert Duplikate.

---

## 6. Sync und Merge: CRDT-Denken für Arme

Hier verdient der Autor ausdrücklich Lob. Das ist der anspruchsvollste Teil
der App und größtenteils richtig gedacht.

**Was gut ist:**

```js
function mergeArrayByKey(localArr, remoteArr, keyFn, mergeFn, preferRemote){ ... }
```

Ein generischer Merge über Schlüsselfunktionen, wiederverwendet für Gewichte,
EGYM-Messungen, Bibliothek und Historie. Das ist die richtige Abstraktion.

**Und die Tombstones sind richtig erkannt:**

```js
function addTombstone(kind,key){
  if(key&&!D.deleted[kind].includes(key))D.deleted[kind].push(key);
  if(D.deleted[kind].length>400)D.deleted[kind]=D.deleted[kind].slice(-400);
}
```

Das Problem, das sie lösen, ist subtil und wird von den meisten
Selbstbau-Syncs übersehen: **Löschen ist in einem Merge nicht darstellbar.**
Gerät A löscht Session X. Gerät B kennt X noch. Beim Merge steht A vor
„ich habe X nicht, B hat X" — ununterscheidbar von „B hat X neu angelegt".
Ohne Grabstein kommt jede gelöschte Session beim nächsten Sync zurück.
Der Autor hat das gesehen und gelöst.

**Was ich anders machen würde:**

**a) Die 400er-Kappung ist eine stille Bombe.**
`slice(-400)` wirft die ältesten Grabsteine weg. Wenn ein Gerät zwei Monate
offline war und in der Zwischenzeit 400+ Löschungen passiert sind, kommen
die ältesten gelöschten Einträge zurück. Das ist ein bewusster Trade-off
gegen unbegrenztes Wachstum — aber er gehört dokumentiert. Die saubere
Variante ist ein **Zeitstempel pro Grabstein** und eine Kappung nach Alter
(„älter als 90 Tage"), nicht nach Anzahl. Dann ist die Regel überprüfbar:
„Wer länger als 90 Tage offline war, muss neu synchronisieren."

**b) Das Read-Modify-Write-Fenster.**

```js
cloudWriteQueue = cloudWriteQueue.then(() => ref.get()).then(doc => {
  const merged = doc.exists ? mergeSyncedSnapshot(localSnapshot, doc.data()) : localSnapshot;
  return ref.set(cloudSafeSnapshot(merged));     // ← nicht atomar
});
```

Zwischen `get()` und `set()` liegt eine Netzwerk-Rundreise. Schreibt ein
zweites Gerät genau in diesem Fenster, wird dessen Schreibvorgang
überschrieben. Die `cloudWriteQueue` serialisiert nur **innerhalb eines
Tabs** — nicht zwischen Geräten.

Firestore hat dafür `runTransaction()`, das exakt dieses Problem löst
(Lesen und Schreiben werden atomar, bei Konflikt wird automatisch wiederholt):

```js
db.runTransaction(async tx => {
  const doc = await tx.get(ref);
  tx.set(ref, cloudSafeSnapshot(doc.exists ? merge(local, doc.data()) : local));
});
```

In der Praxis ist das Fenster klein und beide Geräte mergen ohnehin — das
Risiko ist also gering. Aber „gering" ist nicht „null", und das Wissen darum,
*warum* `runTransaction` existiert, ist die eigentliche Lektion.

**c) Ein Dokument für alles.** Firestore-Dokumente sind auf **1 MB** begrenzt.
Die Historie wächst monoton. Bei ~1 KB pro Session ist bei rund 1.000 Sessions
Schluss — etwa vier Jahre bei fünf Trainings pro Woche. Danach schlägt jeder
Schreibvorgang fehl, und der Fehlerpfad landet in einem generischen
`toast('⚠️ Sync fehlgeschlagen')`. Die saubere Lösung ist eine Subcollection
(ein Dokument pro Session), was gleichzeitig das Schreibvolumen drastisch senkt:
statt der kompletten Historie bei jedem geloggten Satz nur noch das eine
geänderte Dokument.

> **Lektion 10:** Löschen ist in verteilten Systemen kein Zustand, sondern ein
> *Ereignis*. Es braucht eine eigene Repräsentation.

> **Lektion 11:** Read-Modify-Write über Netzwerk ist immer eine Race Condition.
> Transaktionen oder Compare-and-Swap sind keine Optimierung, sondern die
> Korrektheitsbedingung.

> **Lektion 12:** Jeder unbegrenzt wachsende Speicher trifft irgendwann eine
> harte Grenze. Rechne einmal aus, wann — dann weißt du, ob es dein Problem ist.

---

## 7. Die Zeit-Bugs

Drei Fehler im Pausentimer, alle drei aus derselben Wurzel: **Zustand wurde
aus zwei Variablen rekonstruiert, statt explizit geführt zu werden.**

```js
let timerStartedAt = 0, timerTgt = 0;
function getTimerRemaining(){ return Math.max(0, timerTgt - getTimerElapsed()) }
```

Das ist elegant, solange der Timer nur läuft oder nicht läuft. Es bricht,
sobald es einen dritten Zustand gibt: **pausiert**.

### Bug 1: Pause verliert die Restzeit

```js
function startTmr(){
  if(timerInt){ clearInterval(timerInt); timerInt=null; renderWo(); return }  // Pause
  timerStartedAt = Date.now();                                                // Weiter
  ...
}
```

Pausieren stoppt nur den Interval. Beim Fortsetzen wird `timerStartedAt` neu
gesetzt — `timerTgt` steht aber unverändert auf 150. Aus „noch 20 Sekunden"
werden wieder volle 150 Sekunden. Bei zehn Sätzen pro Training ist das eine
Funktion, die man einmal ausprobiert und dann nie wieder anfasst.

**Reparatur:** Die Restzeit beim Pausieren einfrieren.

```js
if(timerInt){
  timerPausedRemaining = getTimerRemaining();     // ← Zustand explizit sichern
  clearInterval(timerInt); timerInt=null; timerStartedAt=0;
  persistTimer(); renderWo(); return;
}
if(timerPausedRemaining>0){ timerTgt=timerPausedRemaining; timerPausedRemaining=0 }
```

Verifiziert im Test: `beforePause: 70 → frozen: 70 → afterResume: 70`.

### Bug 2: Der Timer überlebt keinen Reload

`timerStartedAt` und `timerTgt` sind reine Modulvariablen. iOS wirft
Hintergrund-Tabs aggressiv aus dem Speicher. Zurückwechseln = Timer weg,
mitten in der Pause.

**Reparatur:** in `localStorage` spiegeln, beim Start rekonstruieren — inklusive
Prüfung, ob die Pause zwischenzeitlich abgelaufen ist.

### Bug 3: Der Ton war immer stumm

```js
new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=')
```

Das ist ein gültiger WAV-Header mit `data`-Chunk-Länge **0**. Also: null Samples.
Technisch korrekt, akustisch nichts. Dazu kommt: `.play()` ohne vorherige
Nutzerinteraktion wird von Autoplay-Policies ohnehin blockiert — und der
`.catch(()=>{})` schluckt genau die Fehlermeldung, die einem das gesagt hätte.

**Reparatur:** WebAudio, zwei Sinustöne mit Hüllkurve. Läuft ohne Asset, ohne
Netzwerk, und der `AudioContext` wird nach dem Ton wieder geschlossen, statt
sich pro Satz einen neuen anzusammeln.

> **Lektion 13:** Wenn ein Feature einen Zustand mehr hat, als deine Variablen
> darstellen können, ist der fehlende Zustand ein Bug — kein Sonderfall.
> Timer haben *drei* Zustände: läuft, pausiert, aus.

> **Lektion 14:** `catch(()=>{})` ist Löschen von Information. Wenn du einen
> Fehler wirklich ignorieren willst, schreib hin, *welchen* und *warum*.

> **Lektion 15:** Alles, was länger als eine Sekunde dauert, muss einen
> Reload überleben. Auf Mobilgeräten ist „Tab wird entladen" der Normalfall.

---

## 8. Zahlen, die niemand geprüft hat

### Der zirkuläre Volumen-Maßstab

```js
function buildWeekGauge(totalSets){
  const mev = Math.max(24, Math.round(totalSets * .66) || 24);
  const mav = Math.max(mev+12, Math.round(totalSets * 1.24) || 48);
  const mrv = Math.max(mav+18, Math.round(totalSets * 1.56) || 72);
```

Lies das zweimal. Die **Bewertungsmaßstäbe werden aus dem bewerteten Wert
berechnet.** MEV ist immer 66 % dessen, was du gemacht hast; MAV immer 124 %.

Ergebnis: `totalSets` ist strukturell fast immer zwischen MEV und MAV.
Bei 30 Sätzen: MEV 20, MAV 37 → „IM MAV". Bei 90 Sätzen: MEV 59, MAV 112 →
ebenfalls „IM MAV". Die Anzeige ist ein **Zufallsgenerator mit
Wissenschafts-Anmutung** — sie sieht aus wie eine Einordnung und ist keine.

Das ist die gefährlichste Sorte Bug: kein Absturz, kein Fehler im Log, die
Zahlen sehen plausibel aus. Nur die Aussage ist bedeutungslos. Und weil ein
Nutzer sein Training danach ausrichtet, ist der Schaden real.

**Reparatur:** Feste Richtwerte pro Muskelgruppe, aufsummiert über das, was
der Plan tatsächlich trainiert:

```js
const MUSCLE_LANDMARKS={chest:{mev:8,mav:16,mrv:22}, back:{mev:10,mav:18,mrv:25}, ...};
function weeklyLandmarks(){
  return plannedMuscleGroups().reduce((a,m)=>{ ... }, {mev:0,mav:0,mrv:0});
}
```

### Cardio als Tonnage

Cardio-Sätze speichern **Minuten in `r`** und die **Widerstandsstufe in `w`**:

```js
const entry = cardio ? {w:b, r:Math.round(a), rir, note, mode:'cardio'} : {w:a, r:b, rir, note};
```

Ein cleverer Hack, um dasselbe Formular für beides zu benutzen. Nur rechnet
*jede* Statistik danach `w * r` als Kilogramm-Volumen:

- 30 Minuten StairMaster auf Stufe 12 → **360 kg Phantom-Tonnage**
- „Max Gewicht" konnte die Widerstandsstufe sein
- Der Ø-RIR mischte Kraft- und Cardio-RIR

**Reparatur:** eine Funktion, die die beiden Welten trennt, und konsequenter
Einsatz an *allen* Rechenstellen:

```js
function isCardioSet(set){
  if(set.mode==='cardio')return true;
  return isCardioExercise({name:set.ex,type:set.type});   // Fallback für Altdaten
}
function setVolume(set){return isCardioSet(set)?0:(parseFloat(set.w)||0)*(parseInt(set.r)||0)}
```

Der Legacy-Fallback ist wichtig: Sätze, die vor Einführung von `mode:'cardio'`
geloggt wurden, haben das Feld nicht. Ohne die Namenserkennung bliebe deren
Phantomvolumen für immer in der Historie.

**Zwei zusätzliche Präzisierungen aus demselben Gedanken:**
Volumen zählt jetzt nur `type==='main'` — Mobility und Pre-Workout sind kein
Hypertrophie-Reiz und haben in einer MEV/MAV-Einordnung nichts verloren. Und
der Wochenring zählt dieselbe Menge wie die Landmarks, gegen die er misst;
vorher zählte er *alle* Sätze inklusive Mobility gegen Kraft-Landmarks.

### Die kleinen Geschwister

- **`checkPR` beim allerersten Satz:** `if(!prev.length)return true` → dein
  erster Satz war immer ein „🏆 NEUER PR!". Ein PR gegen nichts ist keiner.
- **Achsenbeschriftung:** `Math.round(val)` bei einer Wertespanne von 2,5 kg
  erzeugte `53, 52, 51, 51, 50` — doppelte und irreführende Labels. Jetzt
  passt sich die Nachkommastelle an die Spanne an.
- **Epley ohne Obergrenze:** `calc1RM(w,r) = w*(1+r/30)` ist bis ~10
  Wiederholungen brauchbar. Bei einer 60-Sekunden-Plank (`r=60`) liefert die
  Formel den dreifachen Wert. (Dokumentiert, nicht geändert — die Formel wird
  nur an Stellen angezeigt, die Cardio bereits ausschließen.)

> **Lektion 16:** Eine Kennzahl, deren Referenzwert aus ihr selbst abgeleitet
> ist, misst nichts. Frag bei jedem Schwellwert: *Woher kommt die Zahl?*
> „Aus den Daten selbst" ist bei einer Bewertung immer die falsche Antwort.

> **Lektion 17:** Wenn du zwei Bedeutungen in ein Feld packst, musst du
> **jede** Leseposition anfassen. Such nach dem Feldnamen im ganzen Projekt,
> bevor du den Hack einbaust — nicht danach.

> **Lektion 18:** Falsche Zahlen sind schlimmer als Abstürze. Ein Absturz wird
> gemeldet. Eine falsche Zahl wird geglaubt.

---

## 9. Die Fehlerklasse „Guard an der falschen Stelle"

Der lehrreichste Fund, weil er im Test **tatsächlich zugeschlagen hat**.

```js
function autoScrollNext(currentIdx){
  if(!D.active) return;                          // ← Guard hier
  setTimeout(() => {
    for(let i=currentIdx+1; i<D.active.exercises.length; i++){   // ← Zugriff 300ms später
```

Der Guard prüft `D.active` **zum Aufrufzeitpunkt**. Der Rumpf läuft
**300 Millisekunden später**. In diesem Fenster kann der Nutzer „Workout
beenden" gedrückt haben — `endWorkout()` setzt `D.active = null`.

Ergebnis: `TypeError: Cannot read properties of null (reading 'exercises')`.
Genau diese Meldung stand im Testlauf.

Es war zweimal dieselbe Struktur an zwei Stellen. Das ist der Hinweis, dass
es kein Ausrutscher ist, sondern ein **Denkmuster**: „Ich habe oben geprüft,
also gilt es." Bei synchronem Code stimmt das. Sobald `setTimeout`,
`Promise.then`, `requestAnimationFrame` oder ein Event-Handler dazwischen
liegen, ist die Prüfung wertlos.

**Reparatur — Guard in den Callback:**

```js
setTimeout(() => {
  if(!D.active || !Array.isArray(D.active.exercises)) return;   // ← hier gehört er hin
  ...
}, 300);
```

> **Lektion 19:** Ein Guard schützt den Code, der **synchron** auf ihn folgt.
> Alles hinter `setTimeout` / `await` / `.then` / Event-Handler ist neuer Code
> mit neuen Voraussetzungen und braucht eine eigene Prüfung.

> **Lektion 20:** Wenn du dieselbe Fehlerstruktur zweimal findest, such nach
> der dritten. Es ist ein Muster, keine Panne.

---

## 10. Rendering und Performance

### Quadratische Komplexität im heißesten Pfad

```js
function getAllSets(name){
  const arr=[];
  D.history.forEach(s => s.sets.forEach(set => { if(set.ex===name) arr.push(...) }));
  return arr;
}
```

Voller Scan über die gesamte Historie. Aufgerufen wird das:

```js
D.active.exercises.forEach((ex,ei) => {
  const hist = getAllSets(ex.name);    // ← pro Übung ein Komplettscan
```

Bei 12 Übungen und 500 Sessions à 20 Sätzen sind das **120.000 Vergleiche
pro Render** — und `renderWo()` läuft nach jedem geloggten Satz.

Heute unmerklich, weil die Historie klein ist. In zwei Jahren merkbar.
Die Reparatur ist ein Index, der bei `save()` invalidiert wird:

```js
let __setsByExercise=null;
function setsIndex(){
  if(__setsByExercise)return __setsByExercise;
  __setsByExercise=new Map();
  D.history.forEach(s=>(s.sets||[]).forEach(set=>{
    if(!__setsByExercise.has(set.ex))__setsByExercise.set(set.ex,[]);
    __setsByExercise.get(set.ex).push({...set,date:s.date});
  }));
  return __setsByExercise;
}
```

**Bewusst nicht umgesetzt.** Ein Cache ohne wasserdichte Invalidierung ist
gefährlicher als ein langsamer Scan: Jede Stelle, die `D.history` verändert
(und davon gibt es viele — Merge, Import, Löschen, Sync-Snapshot), müsste den
Cache leeren. Eine vergessene Stelle zeigt veraltete Daten an, und das fällt
niemandem auf. Für diese Datenmenge ist die Optimierung noch nicht ihren
Korrektheitspreis wert. **Notiert, gemessen, aufgeschoben** — das ist eine
legitime Entscheidung, solange sie bewusst getroffen und dokumentiert ist.

### Renderer, die den Zustand wegwerfen

```js
h += `<div class="exr" onclick="this.parentElement.classList.toggle('open')">`
```

Der Aufklapp-Zustand lebte nur im DOM. Jedes `renderPL()` — also jedes
Speichern, jedes Sortieren, jedes Bearbeiten — klappte alles wieder zu.

**Reparatur:** Zustand aus dem DOM in eine `Set` heben:

```js
let openPlanRows=new Set();
function togglePlanRow(el,name){
  el.parentElement.classList.toggle('open');
  if(openPlanRows.has(name))openPlanRows.delete(name); else openPlanRows.add(name);
}
```

> **Lektion 21:** Das DOM ist keine Zustandsablage. Alles, was einen
> Re-Render überleben soll, gehört ins Modell.

> **Lektion 22:** Optimiere erst, wenn du gemessen hast. Aber **schreib auf,
> was du gefunden hast** — sonst findest du es in zwei Jahren unter Zeitdruck
> nochmal.

---

## 11. UX-Schulden, die wie Code-Schulden wirken

### `prompt()` als Formular

```js
function renamePlanDay(){
  const newName = prompt('Neuer Name für '+curTab+':', curTab);
  const newDay  = prompt('Wochentag(e):', D.plan[curTab].day||'');
```

Zwei modale Browserdialoge hintereinander. Auf iOS blockieren die den
Main-Thread, sehen aus wie eine Fehlermeldung, erlauben keine Mehrfachauswahl
und lassen sich nicht gestalten. Es *funktionierte* — es war nur unbenutzbar.
Das ist die Beobachtung hinter „Trainingsplan ändern funktioniert nicht schön
und smart".

Ersetzt durch ein Modal mit Wochentag-Chips, das gleichzeitig **Anlegen,
Umbenennen und Duplizieren** bedient — ein Dialog, drei Modi, statt drei
halbfertiger Pfade.

### Die Funktion, die deine Eingabe verschluckt

```js
function startWorkout(pk){
  if(D.active){ go('wo'); renderWo(); return; }    // ← pk wird ignoriert
```

Läuft schon ein Workout, verschwindet der übergebene Trainingstag ersatzlos.
Für den Nutzer sah es aus, als hätte der Button nicht reagiert. Kein Toast,
keine Erklärung.

**Das ist ein Interaktionsprinzip, kein Detail:** Eine Aktion darf drei Dinge
tun — ausführen, ablehnen mit Begründung, oder nachfragen. Sie darf **nie
still nichts tun.**

Jetzt: Wechsel-Dialog mit drei Strategien und expliziter Ansage, was mit den
geloggten Sätzen passiert (Anhängen / nur Geloggtes behalten / komplett ersetzen).

### Datenverlust ohne Rückfrage

```js
function skipEx(ei){ D.active.exercises[ei].skipped=true; D.active.exercises[ei].logged=[]; }
```

Übung überspringen löschte kommentarlos alle bereits geloggten Sätze.
Ebenso: Übung tauschen. Beides jetzt mit Rückfrage; beim Tausch bleiben
geloggte Sätze sogar erhalten — die alte Übung wird auf die geloggte Satzzahl
gekürzt und als erledigter Block stehen gelassen, die neue kommt darunter.
**Das Training hat stattgefunden, also gehört es in die Historie.**

> **Lektion 23:** Eine Aktion, die still nichts tut, ist ein Bug — auch wenn
> kein Code kaputt ist.

> **Lektion 24:** Vor jeder Löschung: Ist das rekonstruierbar? Nein →
> Rückfrage. Und die Rückfrage muss beziffern, was verloren geht („3 geloggte
> Sätze"), nicht nur „Sicher?".

---

## 12. Was richtig gut gemacht war

Ein Review, das nur Fehler auflistet, ist unehrlich. Diese Entscheidungen
waren stark:

**`normalizeData()` als Eingangstor.** Jeder Ladepfad — localStorage, Firestore,
Datei-Import — läuft durch dieselbe Normalisierung. Kaputte Daten werden
repariert statt zu crashen. Das ist der Grund, warum die App trotz der
Schemaänderungen an vielen Stellen robust bleibt. Es ist genau das Muster,
das ein Schema-Validator in einer größeren App leisten würde.

**Tombstones.** Siehe Abschnitt 6. Die meisten Selbstbau-Syncs haben sie nicht,
und ihre Nutzer wundern sich, warum gelöschte Einträge zurückkommen.

**`prefers-reduced-motion` von Anfang an.** In einer App, die stark auf
Animation setzt, war das schon vor dem Makeover berücksichtigt. Das ist
Barrierefreiheit, an die selbst professionelle Teams oft erst nach dem
ersten Beschwerde-Ticket denken.

**Semantische Farben getrennt vom Akzent.** `--red`/`--green`/`--orange` folgen
dem Theme *nicht* — sie behalten ihre Ampelbedeutung, egal welcher Akzent
gewählt ist. Der Kommentar im CSS erklärt sogar warum. Das ist Designsystem-
Denken auf professionellem Niveau.

**Die Domänenlogik.** RIR-Erfassung, doppelte Progression, MEV/MAV/MRV,
Deload-Erkennung aus mehreren Signalen — das ist eine App, die von jemandem
gebaut wurde, der die Sache versteht. Die Umsetzung hatte Fehler; das Konzept
war richtig.

---

## 13. Checkliste zum Mitnehmen

Die 24 Lektionen, verdichtet auf das, was man beim nächsten Review wirklich fragt:

**Sicherheit**
- [ ] Jede Interpolation in `innerHTML` escaped — und zwar **kontextgerecht**?
- [ ] Kann ein String aus dem Netz / einer Datei bis hierher gelangen?
- [ ] Ist der Identifikator ein Berechtigungsnachweis? (Dann ist er falsch.)
- [ ] Liegen die Zugriffsregeln serverseitig?

**Daten**
- [ ] Hat jedes editierbare Objekt eine ID, die vom Inhalt unabhängig ist?
- [ ] Was passiert bei einer Deduplizierung mit zwei *zu Recht* gleichen Einträgen?
- [ ] Ist jede Migration deterministisch über alle Geräte?
- [ ] Wann trifft der wachsende Speicher seine harte Grenze? (Rechne es aus.)

**Zustand**
- [ ] Hat das Feature mehr Zustände, als deine Variablen darstellen können?
- [ ] Überlebt alles Langlaufende einen Reload?
- [ ] Liegt Zustand im DOM, der einen Re-Render überleben soll?
- [ ] Sitzt jeder Guard **im** asynchronen Callback, nicht davor?

**Zahlen**
- [ ] Woher kommt jeder Schwellwert? (Nicht: aus den bewerteten Daten.)
- [ ] Wenn ein Feld zwei Bedeutungen trägt: sind **alle** Leser angepasst?
- [ ] Gibt es einen Legacy-Pfad für Daten von vor der Änderung?

**Interaktion**
- [ ] Tut irgendeine Aktion still nichts?
- [ ] Beziffert jede Löschabfrage, was verloren geht?
- [ ] Verschluckt eine Funktion ihre Parameter in einem Sonderfall?

**Plattform**
- [ ] Erzwingt die Plattform hier ein Verhalten — und kennst du die *Bedingung* dafür?
- [ ] Sind Formularfelder ≥ 16px (sonst zoomt iOS)?
- [ ] Kollidiert eine eigene Geste mit einer System-Geste (Langdrücken, Wischen, Pull-to-Refresh)?
- [ ] Macht eine neu eingebaute Browser-API eine bisher synchrone Funktion asynchron?

**Und die eine Frage über allem:**
- [ ] *Welche Annahme trifft diese Funktion über eine andere, ohne sie durchzusetzen?*

---

## 14. Nachtrag: der Plattform-Pass

Nach dem ersten Durchgang kam ein zweiter, der ausschließlich auf iOS und
Darstellung geschaut hat. Er brachte eine Fehlerklasse zutage, die im ersten
Review komplett gefehlt hat — weil sie im Code korrekt aussieht und erst auf
dem Gerät auffällt.

### Der Schalter, der nichts tut

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
```

`user-scalable=no` steht in vielen Web-Apps. Der Grund ist meistens dieser:
Beim Antippen eines Eingabefelds zoomt iOS Safari hinein und zoomt nicht
zurück. Das sieht kaputt aus, also schaltet man Zoomen ab.

Zwei Probleme damit:

1. **Es funktioniert nicht.** iOS ignoriert `user-scalable=no` seit iOS 10,
   weil Apple das Zoom-Verbot als Barriere einstuft.
2. **Es kostet trotzdem etwas.** Auf Android und in manchen In-App-Browsern
   greift es sehr wohl — dort können Nutzer mit Sehschwäche dann nicht mehr
   zoomen.

Die eigentliche Bedingung ist eine andere: **Safari zoomt genau dann, wenn ein
Formularfeld mit weniger als 16px gerendert wird.** Die App hatte 15px, 14px
und 13px. Alle auf 16px gesetzt → das Verhalten ist weg, und Zoomen von Hand
funktioniert wieder.

> **Lektion 25:** Wenn eine Plattform ein Verhalten erzwingt, such nach der
> **Bedingung**, unter der sie es tut — nicht nach dem Schalter, der es abstellen
> soll. Der Schalter ist oft wirkungslos und hat Nebenwirkungen, die schlimmer
> sind als das Problem.

### Zwei Eigenschaften, die verwandt aussehen

Das Bearbeiten eines geloggten Satzes läuft über langes Drücken. Auf dem
iPhone kam stattdessen das System-Kontextmenü. Die App setzte:

```css
* { -webkit-user-select: none; user-select: none }   /* verhindert Markieren */
```

Was fehlte:

```css
* { -webkit-touch-callout: none }                    /* verhindert das Callout */
```

Das sind zwei verschiedene Dinge. `user-select` steuert Textmarkierung,
`-webkit-touch-callout` das Langdrück-Menü. Die Kernfunktion der Workout-Ansicht
war auf dem Hauptzielgerät faktisch nicht erreichbar — und im Code sah alles
richtig aus.

> **Lektion 26:** Plattformspezifische Gesten kann man nicht durch Lesen
> verifizieren. Entweder auf dem Gerät testen oder die Deklaration durch einen
> Test festnageln — und dann ehrlich dokumentieren, dass der Test schwächer ist
> als ein Gerätetest.

### Die moderne API, die den Vertrag ändert

Für weichere Screenwechsel lag die View-Transitions-API nahe:

```js
function withViewTransition(fn){ document.startViewTransition(fn) }
```

Sieht harmlos aus. Ist es nicht: `startViewTransition()` ruft seinen Callback
**nicht sofort** auf, sondern erst nachdem der Browser den alten Zustand
erfasst hat. Damit war `go()` von synchron auf asynchron gewechselt — ohne
`async`, ohne geänderte Signatur, ohne dass irgendetwas im Aufrufcode danach
aussah.

Gefunden hat das ein bestehender Regressionstest zu einem **völlig anderen**
Fehler (PB-024, unsichtbare Volumen-Balken): Er maß Balkenhöhen und bekam
plötzlich 0, weil der Screen zum Messzeitpunkt noch gar nicht sichtbar war.

Rückbau auf synchron; der visuelle Effekt kommt jetzt aus einer CSS-Animation
und funktioniert obendrein in älteren Safari-Versionen.

> **Lektion 27:** Eine API, die deine Funktion asynchron macht, ändert deren
> Vertrag — auch ohne `async`-Schlüsselwort. Frag vor dem Einbau: *Wann genau
> läuft mein Code, und wer verlässt sich auf den bisherigen Zeitpunkt?*

> **Lektion 28:** Der beste Beleg für den Nutzen einer Regressionssuite ist
> nicht, dass sie alte Fehler fängt. Es ist, dass sie **neue** fängt, die mit
> dem ursprünglichen Fehler nichts zu tun haben.

### Und einmal andersherum: Tests vor dem Fehler

Beim Bau der Aufwärmrampe war die Frage nicht „funktioniert das", sondern:
*Welches bekannte Muster aus dem Register könnte hier zuschlagen?*

Muster 4 — „neuer Datentyp in alte Rechenwege" — passte sofort. Genau so war
PB-004 entstanden (Cardio als Kilogramm-Tonnage). Vier Aufwärmsätze pro Übung
hätten die MEV/MAV-Einordnung gesprengt.

Also wurde die Rampe von vornherein als reine Anzeige gebaut, die keinen
Zustand schreibt — und der Test dazu (PB-029) sichert das ab, obwohl der
Fehler nie passiert ist. Dasselbe bei PB-030: Der Deload-Modus schreibt
bewusst nur in die Workout-Kopie, nie in `D.plan`.

> **Lektion 29:** Ein Fehlerregister ist nur halb so viel wert, wenn man daraus
> nur rückwärts lernt. Die andere Hälfte ist die Frage vor jedem neuen Feature:
> *Welches Muster hier drin könnte auf das zutreffen, was ich gerade baue?*

---

## Anhang: Der Diff in Zahlen

| Kategorie | Befunde | behoben |
|---|---:|---:|
| Sicherheit (XSS-Vektoren) | 26 Renderstellen | 26 |
| Datenverlust | 5 | 5 |
| Falsche Berechnungen | 10 | 10 |
| Zustandsfehler (Timer, Async-Guards, Index-Referenzen) | 6 | 6 |
| Plattformfehler (iOS) | 2 | 2 |
| Stille Fehlbedienung (UX) | 5 | 5 |
| Darstellung | 3 | 3 |
| Dokumentierte Restrisiken (Backend nötig) | 3 | 0 |
| Bewusst aufgeschoben (Performance) | 2 | 0 |

Davon entstanden **vier Fehler beim Beheben oder Verbessern anderer Dinge**
(PB-018, PB-020, PB-024, PB-025). Zwei weitere Einträge (PB-029, PB-030) sind
Tests für Fehler, die durch die Frage „welches bekannte Muster trifft hier zu?"
gar nicht erst passiert sind.

Die drei offenen Punkte — fehlende Firestore-Auth, Read-Modify-Write ohne
Transaktion, 1-MB-Dokumentgrenze — sind **nicht im Frontend lösbar** und in
[`BUGS.md`](./BUGS.md) mit konkretem Lösungsweg als offen geführt.
