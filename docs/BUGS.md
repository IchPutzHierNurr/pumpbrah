# PUMPBRAH — Bug-Register

> **Dieses Dokument ist die Gedächtnisstütze des Projekts.**
>
> Jeder Fehler, der jemals gefunden wurde, steht hier. Und zu jedem Eintrag
> gibt es einen Regressionstest in [`test/check.mjs`](../test/check.mjs), der
> bei **jedem** `/check`-Lauf erneut prüft, ob der Fehler zurückgekommen ist.
>
> **Die Regel, die das Ganze trägt:**
> Ein Fix ohne Eintrag hier *und* ohne Regressionstest gilt als nicht erledigt.
> So lernt die Codebasis dazu, statt dieselben Fehler alle sechs Monate neu zu
> machen.

---

## Wie man einen neuen Bug einträgt

1. **Fix schreiben.** Im Code einen kurzen Kommentar hinterlassen, *warum* die
   Zeile so aussieht — nicht *was* sie tut.
2. **Eintrag hier ergänzen.** Nächste freie `PB-NNN`, Vorlage siehe unten.
   Bestehende Einträge werden **nie** gelöscht, auch wenn der Code
   umgeschrieben wurde. Der Test bleibt.
3. **Regressionstest in `test/check.mjs`** ins `REGRESSIONS`-Array eintragen,
   mit derselben ID. Der Test muss **ohne den Fix fehlschlagen** — das einmal
   gegenprüfen, sonst testet er nichts.
4. **`node test/check.mjs` laufen lassen.** Grün? Dann ist es fertig.

### Vorlage

```markdown
### PB-NNN — Kurztitel

| | |
|---|---|
| **Schwere** | kritisch / hoch / mittel / niedrig |
| **Klasse** | Sicherheit / Datenverlust / Falsche Berechnung / Zustand / UX |
| **Gefunden** | Review / Fuzzer (seed=…) / Nutzerbericht |
| **Status** | behoben / offen |

**Symptom** — was der Nutzer merkt.
**Ursache** — was im Code passiert.
**Fix** — was geändert wurde.
**Lektion** — die verallgemeinerbare Regel.
**Test** — `PB-NNN` in `test/check.mjs`.
```

---

## Statusübersicht

| ID | Titel | Schwere | Klasse | Status |
|---|---|---|---|---|
| [PB-001](#pb-001) | XSS über Übungsname, Notiz und Plan-Key | kritisch | Sicherheit | ✅ |
| [PB-002](#pb-002) | History-Dedupe löscht echte Sessions | kritisch | Datenverlust | ✅ |
| [PB-003](#pb-003) | Session-Bearbeitung erzeugt Sync-Duplikat | hoch | Datenverlust | ✅ |
| [PB-004](#pb-004) | Cardio zählt als Kilogramm-Tonnage | hoch | Berechnung | ✅ |
| [PB-005](#pb-005) | Volumen-Landmarks sind selbstbezüglich | hoch | Berechnung | ✅ |
| [PB-006](#pb-006) | Timer-Pause setzt die Pause zurück | hoch | Zustand | ✅ |
| [PB-007](#pb-007) | Timer überlebt keinen Reload | mittel | Zustand | ✅ |
| [PB-008](#pb-008) | Async-Guard vor statt im Callback | hoch | Zustand | ✅ |
| [PB-009](#pb-009) | startWorkout verschluckt den Parameter | mittel | UX | ✅ |
| [PB-010](#pb-010) | Übungstausch löscht geloggte Sätze | hoch | Datenverlust | ✅ |
| [PB-011](#pb-011) | Skip löscht geloggte Sätze still | hoch | Datenverlust | ✅ |
| [PB-012](#pb-012) | Umbenennen verwaist History-Referenzen | mittel | Datenverlust | ✅ |
| [PB-013](#pb-013) | Core mit 0 Sätzen gilt als „im MAV" | mittel | Berechnung | ✅ |
| [PB-014](#pb-014) | Erster Satz wird als PR gefeiert | niedrig | UX | ✅ |
| [PB-015](#pb-015) | Chart-Achse mit doppelten Labels | niedrig | Darstellung | ✅ |
| [PB-016](#pb-016) | Alternativen zeigen Namensdubletten | niedrig | UX | ✅ |
| [PB-017](#pb-017) | Wochenring zählt andere Sätze als sein Maßstab | mittel | Berechnung | ✅ |
| [PB-018](#pb-018) | Anführungszeichen bricht aus onclick aus | **kritisch** | Sicherheit | ✅ |
| [PB-019](#pb-019) | Apostroph zerstört Inline-Handler | mittel | Zustand | ✅ |
| [PB-020](#pb-020) | Veralteter logTgt-Index stürzt ab | mittel | Zustand | ✅ |
| [PB-024](#pb-024) | Volumen-Balken ohne sichtbare Füllung | mittel | Darstellung | ✅ |
| [PB-025](#pb-025) | View Transition machte `go()` asynchron | hoch | Zustand | ✅ |
| [PB-026](#pb-026) | Formularfelder unter 16px → iOS zoomt hinein | hoch | Plattform | ✅ |
| [PB-027](#pb-027) | iOS-Systemmenü überlagert den Satz-Editor | hoch | Plattform | ✅ |
| [PB-028](#pb-028) | Aufwärmrampe konnte Arbeitslast überschreiten | mittel | Berechnung | ✅ |
| [PB-029](#pb-029) | Aufwärmsätze durften Volumen nicht verfälschen | mittel | Berechnung | ✅ |
| [PB-030](#pb-030) | Deload musste den Plan unberührt lassen | mittel | Datenintegrität | ✅ |
| [PB-031](#pb-031) | Indirektes Volumen mit Rundungsartefakten | niedrig | Berechnung | ✅ |
| [PB-032](#pb-032) | `overflow-x:hidden` bricht `position:sticky` | mittel | Darstellung | ✅ |
| [PB-033](#pb-033) | „Leg Curl" wurde als Bizeps-Curl erkannt | hoch | Darstellung | ✅ |
| [PB-034](#pb-034) | Hantel lief eine halbe Phase neben der Hand | mittel | Darstellung | ✅ |
| [PB-035](#pb-035) | Figur schwebte aus dem Bildausschnitt | mittel | Darstellung | ✅ |
| [PB-036](#pb-036) | Zeichnungen statt echter Übungsfotos | hoch | Darstellung | ⊘ entfällt |
| [PB-037](#pb-037) | Inline-`onerror` verletzte die eigene XSS-Invariante | mittel | Sicherheit | ⊘ entfällt |
| [PB-038](#pb-038) | „Danach" stand über einer bereits erledigten Übung | niedrig | Darstellung | ✅ |
| [PB-039](#pb-039) | Zwei Matrixspalten hießen gleich | niedrig | Darstellung | ✅ |
| [PB-041](#pb-041) | QR-Codes sahen richtig aus und waren unlesbar | **hoch** | Korrektheit | ✅ |
| [PB-043](#pb-043) | Fotoschicht entfernt — Kacheln zeigen jetzt eine Marke | — | Darstellung | ✅ |
| [PB-046](#pb-046) | Negatives Gewicht wurde klaglos gespeichert | **hoch** | Berechnung | ✅ |
| [PB-047](#pb-047) | Zwei Übungen im falschen Bewegungsmuster | mittel | Darstellung | ✅ |
| [PB-048](#pb-048) | „Nächstes Workout" beschrieb den falschen Tag | mittel | Darstellung | ✅ |
| [PB-021](#pb-021) | Firestore ohne Authentifizierung | **kritisch** | Sicherheit | ⚠️ offen |
| [PB-022](#pb-022) | Read-Modify-Write ohne Transaktion | mittel | Nebenläufigkeit | ⚠️ offen |
| [PB-023](#pb-023) | 1-MB-Dokumentgrenze bei Firestore | mittel | Skalierung | ⚠️ offen |

**39 von 39 im Frontend behebbaren Fehlern sind behoben.**
Die drei offenen Punkte brauchen Änderungen an der Firebase-Konfiguration.

---

## Behobene Fehler

### PB-001

**XSS über Übungsname, Notiz und Plan-Key**

| | |
|---|---|
| **Schwere** | kritisch |
| **Klasse** | Sicherheit |
| **Gefunden** | Code-Review |
| **Status** | ✅ behoben |

**Symptom.** Ein Übungsname wie `<img src=x onerror="...">` führt beim Rendern
Code aus. Ein Name mit `<` oder `"` zerschießt außerdem das Layout.

**Ursache.** Alle Renderer bauten HTML per String-Konkatenation und
interpolierten Nutzerdaten ohne Escaping. Die einzige „Absicherung" war
`.replace(/'/g,"\\'")` — Escaping für ein einzelnes Zeichen in einem
einzigen Kontext.

Verschärfend: Die Daten kommen über `onSnapshot` aus Firestore, sind also
nicht zwingend selbst getippt. Der Impact wäre nicht „ein Alert-Fenster",
sondern Zugriff auf den lokalen Speicher der App — Trainingshistorie,
Geburtsdatum, Gewichtsverlauf, Körperanalyse und Profilfoto.

**Fix.** Drei kontextspezifische Escaper und deren konsequenter Einsatz an
allen 14 Renderstellen:

```js
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>HTML_ENTITIES[c])}
function attr(s){return esc(s)}
function jsStr(s){ /* JS-escapen, dann HTML-escapen — siehe PB-018 */ }
```

**Lektion.** Escaping ist kontextabhängig. „Ich escape Anführungszeichen"
beantwortet nicht die Frage „in welchem Kontext?". Und: Sobald ein Netzwerk-Sync
im Spiel ist, ist „nur ich benutze die App" keine Sicherheitsgrenze mehr.

**Test.** `PB-001` — prüft strukturell, dass aus der Nutzlast keine Elemente
oder Handler entstanden sind, und dass der Name als Text trotzdem lesbar bleibt.

---

### PB-002

**History-Dedupe löscht echte Sessions**

| | |
|---|---|
| **Schwere** | kritisch |
| **Klasse** | Datenverlust |
| **Gefunden** | Code-Review |
| **Status** | ✅ behoben |

**Symptom.** Zwei inhaltlich identische Trainings am selben Tag — eines
verschwindet. Ohne Meldung, ohne Rückfrage.

**Ursache.** `histSessionKey()` bildete die Identität einer Session als Hash
über ihren gesamten Inhalt. `normalizeData()` — läuft bei **jedem** `save()` —
filterte alles mit doppeltem Schlüssel heraus.

**Fix.** Stabile ID beim Anlegen, Inhalts-Hash nur noch als Fallback für
Altdaten:

```js
function histSessionKey(s){
  if(s.id) return 'id|'+s.id;
  ... /* Legacy-Hash */
}
```

Wichtig: Altdaten bekommen **keine** ID nachträglich verpasst. Jedes Gerät
würfelte sonst eine andere und legte dieselbe Session doppelt an.

**Lektion.** Identität ist ein eigenes Feld, kein Nebenprodukt des Inhalts.
Bei jeder Deduplizierung fragen: *Was passiert, wenn zwei Einträge zu Recht
gleich aussehen?*

**Test.** `PB-002` — drei identische Sessions gehen rein, drei kommen raus.

---

### PB-003

**Session-Bearbeitung erzeugt Sync-Duplikat**

| | |
|---|---|
| **Schwere** | hoch |
| **Klasse** | Datenverlust |
| **Gefunden** | Code-Review |
| **Status** | ✅ behoben |

**Symptom.** Ein Satz auf Gerät A korrigiert → auf Gerät B erscheint die Session
zweimal. Oder umgekehrt: die Korrektur wird beim nächsten Sync überschrieben.

**Ursache.** Zwei Ursachen greifen ineinander. Der inhaltsbasierte Schlüssel
(siehe PB-002) änderte sich durch die Bearbeitung → Merge sah eine neue Session.
Und die Merge-Funktion lautete `(local)=>local` — lokal gewann immer, also
konnte eine Fremdkorrektur nie ankommen.

**Fix.** Stabile ID plus Konfliktauflösung über `updatedAt`, mit
verlustvermeidendem Tiebreak:

```js
function mergeHistorySession(local,remote){
  const lt=Number(local?.updatedAt)||0, rt=Number(remote?.updatedAt)||0;
  if(rt>lt)return remote;
  if(lt>rt)return local;
  return (remote?.sets||[]).length>(local?.sets||[]).length?remote:local;
}
```

**Lektion.** „Lokal gewinnt immer" ist keine Konfliktauflösung, sondern das
Verwerfen der Gegenseite. Bei Gleichstand im Zweifel die Fassung mit mehr Daten.

**Test.** `PB-003` — bearbeitete Fassung mit höherem `updatedAt` gewinnt,
es bleibt bei einer Session.

---

### PB-004

**Cardio zählt als Kilogramm-Tonnage**

| | |
|---|---|
| **Schwere** | hoch |
| **Klasse** | Falsche Berechnung |
| **Gefunden** | Code-Review |
| **Status** | ✅ behoben |

**Symptom.** 30 Minuten StairMaster auf Stufe 12 erschienen als 360 kg
Volumen. „Max Gewicht" konnte die Widerstandsstufe eines Ergometers sein.

**Ursache.** Cardio-Sätze speichern Minuten in `r` und die Stufe in `w`, damit
dasselbe Eingabeformular für beides funktioniert. Jede Statistik rechnete
danach unverändert `w * r`.

**Fix.** Eine Funktion, die die beiden Welten trennt, plus konsequenter Einsatz
an *allen* Rechenstellen (`sessionVolume`, `getWeeklyVolume`, `renderDash`,
`workoutCompareBlock`, `renderAna`, `renderHist`, `endWorkout`):

```js
function isCardioSet(set){
  if(set.mode==='cardio')return true;
  return isCardioExercise({name:set.ex,type:set.type});  // Legacy-Fallback
}
function setVolume(set){return isCardioSet(set)?0:(parseFloat(set.w)||0)*(parseInt(set.r)||0)}
```

Der Legacy-Fallback ist entscheidend: Sätze aus der Zeit vor `mode:'cardio'`
haben das Feld nicht und würden ihr Phantomvolumen sonst für immer behalten.

**Lektion.** Wenn du zwei Bedeutungen in ein Feld packst, musst du **jede**
Leseposition anfassen. Such nach dem Feldnamen im ganzen Projekt, *bevor* du
den Hack einbaust.

**Test.** `PB-004` — gemischte Session, inklusive Altdatensatz ohne `mode`.

---

### PB-005

**Volumen-Landmarks sind selbstbezüglich**

| | |
|---|---|
| **Schwere** | hoch |
| **Klasse** | Falsche Berechnung |
| **Gefunden** | Code-Review |
| **Status** | ✅ behoben |

**Symptom.** Die Wochenvolumen-Ampel stand fast immer auf „IM MAV" — bei
4 Sätzen wie bei 90.

**Ursache.** Die Bewertungsgrenzen wurden aus dem bewerteten Wert berechnet:

```js
const mev = Math.max(24, Math.round(totalSets * .66) || 24);
const mav = Math.max(mev+12, Math.round(totalSets * 1.24) || 48);
```

Der Maßstab bewegte sich mit dem Gemessenen mit. Die Anzeige sah nach
Trainingswissenschaft aus und war ein Zufallsgenerator.

**Fix.** Feste Richtwerte pro Muskelgruppe, summiert über die im Plan
tatsächlich trainierten Gruppen (`MUSCLE_LANDMARKS` + `weeklyLandmarks()`).

**Lektion.** Eine Kennzahl, deren Referenzwert aus ihr selbst abgeleitet ist,
misst nichts. Frag bei jedem Schwellwert: *Woher kommt die Zahl?* — „Aus den
Daten selbst" ist bei einer Bewertung immer die falsche Antwort. Und: **Falsche
Zahlen sind schlimmer als Abstürze. Ein Absturz wird gemeldet, eine falsche
Zahl wird geglaubt.**

**Test.** `PB-005` — Landmarks bleiben stabil, wenn sich Daten ändern, und
sind streng aufsteigend.

---

### PB-006

**Timer-Pause setzt die Pause zurück**

| | |
|---|---|
| **Schwere** | hoch |
| **Klasse** | Zustand |
| **Gefunden** | Code-Review |
| **Status** | ✅ behoben |

**Symptom.** Pause drücken, weiter drücken → der Timer springt auf die volle
Zeit zurück. Aus „noch 20 Sekunden" werden wieder 150.

**Ursache.** Die Restzeit wurde aus `timerTgt - (now - timerStartedAt)`
berechnet. Pausieren stoppte nur den Interval; beim Fortsetzen wurde
`timerStartedAt` neu gesetzt, `timerTgt` blieb auf dem vollen Wert. Der Zustand
„pausiert" existierte im Datenmodell schlicht nicht.

**Fix.** `timerPausedRemaining` als expliziter dritter Zustand.

**Lektion.** Wenn ein Feature einen Zustand mehr hat, als deine Variablen
darstellen können, ist der fehlende Zustand ein Bug — kein Sonderfall. Timer
haben drei Zustände: läuft, pausiert, aus.

**Test.** `PB-006` — Restzeit vor Pause == Restzeit nach Fortsetzen (±2 s).

---

### PB-007

**Timer überlebt keinen Reload**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Zustand |
| **Gefunden** | Code-Review |
| **Status** | ✅ behoben |

**Symptom.** App im Hintergrund, zurückgewechselt → Pausentimer weg.
Auf iOS der Normalfall, nicht die Ausnahme.

**Ursache.** `timerStartedAt` und `timerTgt` waren reine Modulvariablen.

**Fix.** `persistTimer()` / `restoreTimer()` über `localStorage`, inklusive
Prüfung, ob die Pause zwischenzeitlich abgelaufen ist. Dazu `visibilitychange`,
das die Anzeige nach Rückkehr aus dem Hintergrund einmal hart nachzieht — der
Interval wird von Mobilbrowsern gedrosselt.

**Nebenbefund im selben Zug behoben:** Der Pausen-Piepton war eine WAV-Datei
mit `data`-Chunk-Länge 0 — technisch gültig, akustisch nichts. Ersetzt durch
zwei WebAudio-Sinustöne mit Hüllkurve, ohne Datei und ohne Netzwerk.

**Lektion.** Alles, was länger als eine Sekunde dauert, muss einen Reload
überleben. Und: `catch(()=>{})` ist Löschen von Information — hier hat es die
Autoplay-Fehlermeldung verschluckt, die den stummen Ton erklärt hätte.

**Test.** `PB-007` — Timer wird persistiert, nach Zustandsverlust rekonstruiert.

---

### PB-008

**Async-Guard vor statt im Callback**

| | |
|---|---|
| **Schwere** | hoch |
| **Klasse** | Zustand |
| **Gefunden** | Browsertest (echter Absturz) |
| **Status** | ✅ behoben |

**Symptom.** `TypeError: Cannot read properties of null (reading 'exercises')`
beim Beenden eines Workouts kurz nach dem Loggen eines Satzes.

**Ursache.** Zwei Stellen mit identischer Struktur:

```js
function autoScrollNext(currentIdx){
  if(!D.active) return;                      // ← Prüfung zum Aufrufzeitpunkt
  setTimeout(() => {
    for(let i=...; i<D.active.exercises.length; i++){   // ← Zugriff 300 ms später
```

Im Fenster dazwischen setzt `endWorkout()` `D.active = null`.

**Fix.** Guard in den Callback verschoben, an beiden Stellen.

**Lektion.** Ein Guard schützt den Code, der **synchron** auf ihn folgt. Alles
hinter `setTimeout` / `await` / `.then` / Event-Handler ist neuer Code mit neuen
Voraussetzungen. Und: Wenn du dieselbe Fehlerstruktur zweimal findest, such
nach der dritten — es ist ein Muster, keine Panne.

**Test.** `PB-008` — Race wird gezielt provoziert, keine Ausnahme erwartet.

---

### PB-009

**startWorkout verschluckt den Parameter**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | UX |
| **Gefunden** | Code-Review |
| **Status** | ✅ behoben |

**Symptom.** Läuft schon ein Workout und man tippt auf einen anderen
Trainingstag, passiert nichts. Der Button reagiert scheinbar nicht.

**Ursache.** `if(D.active){ go('wo'); renderWo(); return; }` — der Parameter
`pk` wurde ersatzlos verworfen.

**Fix.** Bei abweichendem Tag geht es in `switchWorkoutPlan()`. Sind noch keine
Sätze geloggt, wird direkt gewechselt; sonst öffnet sich der Strategiedialog.

*(Zwischenstand, den der eigene Test aufgedeckt hat: die erste Fassung rief
`openWorkoutSwitch()` immer vorab auf, wodurch der Dialog bei leerer Session
sichtbar auf- und sofort wieder zuging. `switchWorkoutPlan()` öffnet ihn
jetzt selbst, wenn er gebraucht wird.)*

**Lektion.** Eine Aktion darf drei Dinge tun: ausführen, ablehnen mit
Begründung, oder nachfragen. Sie darf **nie still nichts tun.**

**Test.** `PB-009` — ohne geloggte Sätze direkter Wechsel, mit geloggten
Sätzen Rückfrage.

---

### PB-010

**Übungstausch löscht geloggte Sätze**

| | |
|---|---|
| **Schwere** | hoch |
| **Klasse** | Datenverlust |
| **Gefunden** | Code-Review |
| **Status** | ✅ behoben |

**Symptom.** Zwei Sätze Bankdrücken gemacht, dann auf die Brustpresse
ausgewichen — die zwei Sätze sind weg.

**Ursache.** `swapActiveExercise` ersetzte das Übungsobjekt komplett durch
eines mit `logged: []`.

**Fix.** Hat die alte Übung geloggte Sätze, wird sie auf die geloggte Satzzahl
gekürzt und bleibt als erledigter Block stehen; die neue Übung wird **darunter
eingefügt**. Zusätzlich: optionale dauerhafte Übernahme in den Trainingsplan.

**Lektion.** Das Training hat stattgefunden — also gehört es in die Historie.
Ein Ersetzen im UI darf keine Vergangenheit löschen.

**Test.** `PB-010` — zwei geloggte Sätze überleben den Tausch.

---

### PB-011

**Skip löscht geloggte Sätze still**

| | |
|---|---|
| **Schwere** | hoch |
| **Klasse** | Datenverlust |
| **Gefunden** | Code-Review |
| **Status** | ✅ behoben |

**Symptom.** „SKIP ⏭" auf einer teilweise absolvierten Übung löschte alle
bereits geloggten Sätze — ohne Rückfrage.

**Ursache.** `skipEx` setzte `skipped = true` **und** `logged = []`.

**Fix.** Sätze bleiben erhalten. Bei vorhandenen Sätzen gibt es eine bezifferte
Rückfrage, und der Skip lässt sich per `unskipEx()` rückgängig machen.

**Lektion.** Vor jeder Löschung: Ist das rekonstruierbar? Nein → Rückfrage.
Und die Rückfrage muss beziffern, was verloren geht („3 geloggte Sätze"),
nicht nur „Sicher?".

**Test.** `PB-011` — Sätze überleben den Skip, Rücknahme funktioniert.

---

### PB-012

**Umbenennen verwaist History-Referenzen**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Datenverlust |
| **Gefunden** | Code-Review |
| **Status** | ✅ behoben |

**Symptom.** Nach dem Umbenennen eines Trainingstags zeigte die Historie
Sessions eines Plans, den es nicht mehr gibt. Eine laufende Session verlor
ihren Bezug.

**Ursache.** Die alte Fassung migrierte `D.history[].planKey` bereits, ließ
aber `D.active.planKey` unberücksichtigt — und die Reihenfolge der Tage ging
beim Neuaufbau des Objekts verloren.

**Fix.** `savePlanDay()` baut `D.plan` reihenfolgeerhaltend neu auf und
migriert History **und** aktive Session.

**Lektion.** Beim Umbenennen eines Schlüssels: alle Orte suchen, die ihn als
Fremdschlüssel halten. In JavaScript gehört die Schlüsselreihenfolge eines
Objekts zum Zustand — Neuaufbau muss sie bewusst erhalten.

**Test.** `PB-012` — Plan, History und aktive Session zeigen nach dem
Umbenennen alle auf den neuen Schlüssel.

---

### PB-013

**Core mit 0 Sätzen gilt als „im MAV"**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Falsche Berechnung |
| **Gefunden** | Screenshot-Review |
| **Status** | ✅ behoben |

**Symptom.** Die Muskelvolumen-Karte zeigte „Core · im MAV · 0/8" — grünes
Licht für null Sätze.

**Ursache.** `renderMuscleVolumeCard()` hatte eine **zweite, abweichende**
Landmark-Tabelle mit `core: {mev: 0, ...}`. Die Einordnung lautet
`sets < mev ? 'unter MEV' : ...` — und `0 < 0` ist falsch.

**Fix.** Die lokale Tabelle gelöscht, `MUSCLE_LANDMARKS` als einzige Quelle.

**Lektion.** Zwei Tabellen mit denselben Daten driften garantiert
auseinander. Und ein Schwellwert von 0 in einer `<`-Prüfung ist immer
verdächtig.

**Test.** `PB-013` — alle Landmarks streng aufsteigend, `mev > 0`.

---

### PB-014

**Erster Satz wird als PR gefeiert**

| | |
|---|---|
| **Schwere** | niedrig |
| **Klasse** | UX |
| **Gefunden** | Code-Review |
| **Status** | ✅ behoben |

**Symptom.** Der allererste Satz einer neuen Übung löste „🏆 NEUER PR!" aus.

**Ursache.** `checkPR()` startete mit `if(!prev.length) return true`.

**Fix.** `confirmLog()` prüft zusätzlich, ob überhaupt Historie existiert.

**Lektion.** Eine Auszeichnung, die jeder bekommt, ist keine. Positives
Feedback verliert seine Wirkung, wenn es nichts bedeutet.

**Test.** `PB-014` — unbekannte Übung hat keine Vorgeschichte.

---

### PB-015

**Chart-Achse mit doppelten Labels**

| | |
|---|---|
| **Schwere** | niedrig |
| **Klasse** | Darstellung |
| **Gefunden** | Screenshot-Review |
| **Status** | ✅ behoben |

**Symptom.** Bei kleinen Wertespannen zeigte die Y-Achse `53, 52, 51, 51, 50`.

**Ursache.** `Math.round(val)` unabhängig von der Spanne.

**Fix.** Nachkommastellen richten sich nach der Spanne: 2 bei < 2, 1 bei < 10,
sonst 0.

**Lektion.** Formatierung ist Teil der Korrektheit. Eine Achse mit doppelten
Labels sieht aus wie ein Renderfehler und untergräbt das Vertrauen in alle
anderen Zahlen.

**Test.** `PB-015` — alle Achsenlabels sind eindeutig.

---

### PB-016

**Alternativen zeigen Namensdubletten**

| | |
|---|---|
| **Schwere** | niedrig |
| **Klasse** | UX |
| **Gefunden** | Screenshot-Review |
| **Status** | ✅ behoben |

**Symptom.** Beim Tausch von „Bankdrücken" erschien „Bankdrücken (Bench Press)"
als Alternative — dieselbe Übung.

**Ursache.** Deduplizierung über `libKey()` (exakter Kleinbuchstabenvergleich).
Die Bibliothek führt viele Übungen doppelt, deutsch und mit englischer Klammer.

**Fix.** `baseNameKey()` entfernt Klammerinhalte und Sonderzeichen. Bei zwei
Varianten gewinnt die kürzere.

**Lektion.** Wenn Anzeigename und Identität auseinanderfallen, brauchst du
einen normalisierten Schlüssel neben dem Anzeigenamen.

**Test.** `PB-016` — keine Dubletten und die Ausgangsübung nicht in der Liste.

---

### PB-017

**Wochenring zählt andere Sätze als sein Maßstab**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Falsche Berechnung |
| **Gefunden** | Screenshot-Review |
| **Status** | ✅ behoben |

**Symptom.** Der Ring zeigte deutlich mehr Sätze an, als die Muskelvolumen-Karte
in Summe auswies.

**Ursache.** Der Ring zählte `s.sets.length` — also **alle** Sätze inklusive
Mobility, Pre-Workout und Cardio — maß das aber gegen Landmarks, die für
Krafttraining gelten.

**Fix.** Der Ring zählt nur Arbeitssätze von Hauptübungen. Dieselbe
Einschränkung in `getWeeklyVolume()`.

**Lektion.** Zähler und Maßstab müssen dieselbe Menge beschreiben. Wenn eine
Zahl gegen eine Referenz gemessen wird, prüf beide Definitionen — nicht nur eine.

**Test.** `PB-017` — Ringzählung schließt Cardio nachweislich aus.

---

### PB-018

**Anführungszeichen bricht aus onclick aus**

| | |
|---|---|
| **Schwere** | **kritisch** |
| **Klasse** | Sicherheit |
| **Gefunden** | **Fuzzer** (Invariante „Keine injizierten Fremdelemente") |
| **Status** | ✅ behoben |

> Der lehrreichste Eintrag im ganzen Register: Diese Lücke entstand **beim
> Beheben von PB-001** und wurde vom eigenen Fuzzer gefunden — genau die
> Fehlerklasse, die im Review unter „Escaping ist kontextabhängig" beschrieben
> steht.

**Symptom.** Ein Übungsname mit `"` erzeugte echte DOM-Elemente. Nutzlast:

```
"><svg onload="window.__pwn=1"><img src=x onerror="window.__pwn=1">
```

**Ursache.** `jsStr()` escapte nur den JavaScript-Kontext:

```js
function jsStr(s){return String(s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
```

Das JS-String-Literal steht aber **innerhalb eines HTML-Attributs**:

```html
<div onclick="showExDemo('HIER')">
```

Der Browser HTML-dekodiert das Attribut zuerst, danach parst die JS-Engine.
Zwei Kontexte ineinander — und `"` gehört zum äußeren. Das doppelte
Anführungszeichen beendete `onclick="`, alles danach wurde als Markup geparst.
Der escapte Übungsname im DOM sah so aus:

```html
onclick="togglePlanRow(this,'&lt;img src=x onerror=" window.__pwn="1&quot;">"&gt;<svg onload="window.__pwn=1">')"
                                                  ↑ Attribut endet hier
```

**Fix.** In der Reihenfolge escapen, in der dekodiert wird — erst JS, dann HTML:

```js
function jsStr(s){
  const jsEscaped=String(s??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r?\n/g,'\\n');
  return esc(jsEscaped);
}
```

Danach wird `'` zu `\&#39;` → der Browser dekodiert zu `\'` → gültiges
JS-Escape. Und `"` wird zu `&quot;` → dekodiert zu `"` innerhalb eines
einfach gequoteten JS-Strings → harmlos.

Der Fuzzer deckte im selben Zug elf weitere unescapte Interpolationen auf
(Timer-Leiste, Gewichtseinträge, EGYM-Detail, Session-Vergleich,
Progressionsliste, Bibliotheks-Editor, Muskelvolumen-Karte, Avatar-URL).

**Lektion.** Bei verschachtelten Kontexten wird **von innen nach außen**
escaped — in umgekehrter Reihenfolge zur Dekodierung. Und: Ein Fix ist erst
verifiziert, wenn ein Test ihn angreift. Manuelle Prüfung hätte hier nichts
gefunden, weil die Nutzlast nach der ersten Runde *aussah* wie escaped.

**Test.** `PB-018` — Nutzlast erzeugt keine Elemente, Name bleibt lesbar,
Handler bleibt funktionsfähig.

---

### PB-019

**Apostroph zerstört Inline-Handler**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Zustand |
| **Gefunden** | Regressionstest zu PB-018 |
| **Status** | ✅ behoben |

**Symptom.** Eine Übung namens `O'Brien's Press` machte ihre Buttons
funktionslos — der Inline-Handler war syntaktisch kaputt.

**Ursache.** Dieselbe Wurzel wie PB-018 aus der Gegenrichtung: Die Kombination
aus JS- und HTML-Escaping muss in **beide** Richtungen aufgehen.

**Fix.** Mit `jsStr()` aus PB-018 abgedeckt. Als eigener Test geführt, weil er
eine andere Eigenschaft prüft: nicht „kein Angriff", sondern „Funktion bleibt
erhalten". Ein Escaping, das alles kaputtmacht, wäre sicher — und nutzlos.

**Lektion.** Ein Sicherheitstest prüft, dass Böses nicht durchkommt. Es braucht
den Zwillingstest, dass Gutes noch funktioniert. Sonst „behebt" man Lücken
durch Zerstören der Funktion.

**Test.** `PB-019` — Name mit Apostroph, Backslash und Anführungszeichen bleibt
lesbar und der Handler wirkt.

---

### PB-020

**Veralteter logTgt-Index stürzt ab**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Zustand |
| **Gefunden** | **Fuzzer** (Iteration 102, seed=919831079) |
| **Status** | ✅ behoben |

**Symptom.** `TypeError: Cannot read properties of undefined (reading 'logged')`
in `redoLast()`. Reproduzierbar: Log-Dialog öffnen, Trainingstag wechseln oder
eine Übung entfernen, dann „Letzten Satz wiederholen" drücken.

**Ursache.** `logTgt = {exIdx: ei}` speichert einen **Index** in
`D.active.exercises`. Alles, was das Array verkürzt —
`removeActiveExercise()`, `applyWorkoutSwitch()`, `commitSwap()` — macht den
Index ungültig, während der Dialog offen ist.

**Fix.** Ein Accessor, der die Gültigkeit für alle Nutzer von `logTgt` prüft:

```js
function logTargetExercise(){
  if(!logTgt||!D.active)return null;
  const ex=activeExercisesSafe()[logTgt.exIdx];
  if(!ex||!Array.isArray(ex.logged))return null;
  return ex;
}
```

`redoLast()` und `confirmLog()` schließen bei ungültigem Ziel den Dialog mit
einer Erklärung, statt abzustürzen.

**Lektion.** Ein Index in ein veränderliches Array ist eine schwache Referenz
mit Verfallsdatum. Entweder eine stabile ID speichern oder bei jedem Zugriff
neu validieren. Dieselbe Fehlerklasse wie PB-008, nur über Zeit statt über
Asynchronität.

**Test.** `PB-020` — Index veralten lassen, `redoLast()` und `confirmLog()`
dürfen nicht werfen.

---

### PB-024

**Volumen-Balken ohne sichtbare Füllung**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Darstellung |
| **Gefunden** | **Screenshot-Sichtprüfung** (beim Verifizieren von PB-013) |
| **Status** | ✅ behoben |

**Symptom.** Die Muskelvolumen-Karte auf dem Dashboard zeigte nur leere graue
Balken. Die Zahlen daneben („6/8", „unter MEV") stimmten — die farbige Füllung
fehlte komplett.

**Ursache.** Beim Ergänzen der Sheen-Animation kam eine zweite Regel für
dieselbe Klasse ins Stylesheet:

```css
/* Basisregel, weiter oben */
.mv-fill{position:absolute;left:0;top:0;bottom:0;border-radius:999px;transition:width .7s}

/* neue Regel, weiter unten — gewinnt bei gleicher Spezifität */
.mv-fill{position:relative;overflow:hidden}   /* ✗ */
```

`position:relative` nimmt dem Element seine `top`/`bottom`-Verankerung. Ohne
explizite Höhe kollabiert es auf 0 Pixel. Die Breite (`width: 27%`) blieb
korrekt gesetzt — das Element war nur unsichtbar dünn.

**Fix.** Nur die tatsächlich benötigte Eigenschaft ergänzen:

```css
.mv-fill{overflow:hidden}
```

**Lektion.** Bei gleicher Spezifität gewinnt die spätere Regel — auch für
Eigenschaften, die man gar nicht ändern wollte. Wenn du eine bestehende Klasse
erweiterst, schreib **nur** die neuen Eigenschaften hin, nie einen kompletten
Block „zur Sicherheit".

Und die zweite, wichtigere Lektion: **Diesen Fehler hätte kein Verhaltenstest
gefunden.** Die Karte rendert, die Zahlen stimmen, kein Assert schlägt an. Er
fiel beim Ansehen eines Screenshots auf. Deshalb steht in `/check` Phase 2.5
ausdrücklich „Screenshots ansehen, nicht nur erzeugen" — und deshalb prüft der
Regressionstest jetzt die **berechnete Geometrie** (`getComputedStyle`,
`getBoundingClientRect`), nicht die Existenz des Elements.

**Test.** `PB-024` — alle `.mv-fill` sind `position:absolute` und haben
Höhe > 0. Gegen den nicht-gefixten Zustand verifiziert rot.

---

### PB-025

**View Transition machte `go()` asynchron**

| | |
|---|---|
| **Schwere** | hoch |
| **Klasse** | Zustand |
| **Gefunden** | **Regressionstest PB-024**, direkt nach dem Einbau |
| **Status** | ✅ behoben |

**Symptom.** Nach dem Umstellen des Screenwechsels auf die View-Transitions-API
schlug PB-024 fehl: Die Volumen-Balken hatten Breite und Höhe 0. Ursache war
aber nicht die Darstellung — der Screen war zum Messzeitpunkt schlicht noch
nicht sichtbar.

**Ursache.**

```js
function withViewTransition(fn){ document.startViewTransition(fn) }   // ✗
```

`startViewTransition()` ruft seinen Callback **nicht sofort** auf. Der Browser
fotografiert erst den alten Zustand, dann läuft der Callback in einem späteren
Task. Damit war `go()` von einer synchronen zu einer asynchronen Funktion
geworden — ohne dass sich ihre Signatur geändert hätte. Jeder Aufrufer, der
danach ins DOM greift, sieht den alten Screen.

**Fix.** Rückbau auf einen synchronen Wechsel; der visuelle Effekt kommt jetzt
aus einer reinen CSS-Animation auf `.screen.active` (Blur + Versatz + Skalierung).
Das sieht praktisch identisch aus, bleibt synchron und funktioniert zusätzlich
in älteren Safari-Versionen, die View Transitions noch nicht unterstützen.

**Lektion.** Eine API, die eine Funktion async macht, ändert deren Vertrag —
auch wenn kein `async`-Schlüsselwort auftaucht und der Rückgabewert gleich
bleibt. Vor dem Einbau einer neuen Browser-API die Frage stellen: *Wann genau
läuft mein Code, und was hängt an diesem Zeitpunkt?*

Zweite Lektion, die hier den Ausschlag gab: **Ein bestehender Regressionstest
hat einen ganz anderen neuen Fehler gefangen.** Genau dafür lohnt sich das
Register — PB-024 prüft Balkenhöhen und fand eine Timing-Änderung.

**Test.** `PB-025` — `go()` wird für alle vier Screens aufgerufen und der
Zustand **ohne** `await` und **ohne** `requestAnimationFrame` geprüft.

---

### PB-026

**Formularfelder unter 16px → iOS zoomt hinein**

| | |
|---|---|
| **Schwere** | hoch |
| **Klasse** | Plattform (iOS) |
| **Gefunden** | iOS-Review |
| **Status** | ✅ behoben |

**Symptom.** Auf dem iPhone zoomt Safari beim Antippen eines Eingabefeldes
automatisch hinein — und **zoomt danach nicht zurück**. Der Nutzer bleibt auf
einer vergrößerten, seitlich verschobenen Seite zurück und muss von Hand
herauszoomen. Betroffen war praktisch jedes Feld: Gewicht, Wiederholungen,
Übungssuche, Notizen.

**Ursache.** Safari auf iOS zoomt grundsätzlich auf ein Formularfeld, dessen
gerenderte Schriftgröße unter 16px liegt. Die App hatte 15px (`.ig input`),
13px (`.ig select`) und 14px (`.lib-search`, Notiz-Textarea).

Der übliche „Fix" dafür ist `user-scalable=no` im Viewport-Tag — und der stand
auch drin. Er hilft aber nicht: **iOS ignoriert `user-scalable=no` seit iOS 10**,
weil es Nutzern mit Sehschwäche das Zoomen verbietet. Die Direktive kostete
also Barrierefreiheit, ohne das Problem zu lösen.

**Fix.** Alle Formularfelder auf mindestens 16px. `user-scalable=no` entfernt —
manuelles Zoomen funktioniert wieder, automatisches passiert nicht mehr. Da
`appearance:none` den nativen `<select>`-Pfeil entfernt, ist er als
CSS-Gradient nachgebaut.

**Lektion.** Wenn eine Plattform ein Verhalten erzwingt, such nach der
**Bedingung**, unter der sie es tut — nicht nach dem Schalter, der es abstellen
soll. Der Schalter ist oft wirkungslos oder hat Nebenwirkungen, die schlimmer
sind als das Problem.

**Test.** `PB-026` — alle sichtbaren `input`/`select`/`textarea`, auch die in
geschlossenen Modals, müssen ≥ 16px gerendert werden.

---

### PB-027

**iOS-Systemmenü überlagert den Satz-Editor**

| | |
|---|---|
| **Schwere** | hoch |
| **Klasse** | Plattform (iOS) |
| **Gefunden** | iOS-Review |
| **Status** | ✅ behoben |

**Symptom.** Das Bearbeiten eines geloggten Satzes läuft über ein langes
Drücken auf die Satzzeile. Auf dem iPhone kam stattdessen das
System-Kontextmenü („Kopieren / Nachschlagen / Teilen"). Die Funktion war auf
dem Hauptzielgerät faktisch nicht erreichbar.

**Ursache.** iOS blendet beim Langdrücken auf Text sein eigenes Menü ein,
solange nicht `-webkit-touch-callout: none` gesetzt ist. Die App setzte zwar
`user-select: none`, aber das ist eine andere Eigenschaft: Sie verhindert das
Markieren, nicht das Callout.

**Fix.** `-webkit-touch-callout:none` global, mit expliziter Rücknahme auf
`input, textarea, select` — dort will man das Systemmenü behalten (Einfügen,
Ersetzen, Diktat).

**Lektion.** `user-select` und `-webkit-touch-callout` sehen verwandt aus und
sind es nicht. Bei plattformspezifischen Gesten hilft nur Testen auf der
Plattform — oder ein Test, der die Deklaration festnagelt.

**Nachtrag zur Testbarkeit:** `getComputedStyle` liefert für
`-webkit-touch-callout` in Chromium einen leeren String, die Eigenschaft ist
Safari-spezifisch. Der Regressionstest prüft deshalb die Deklaration im
Stylesheet plus das, was Chromium tatsächlich berichtet. Das ist schwächer als
ein echter Gerätetest — und genau so ist es im Test dokumentiert, statt eine
Sicherheit vorzutäuschen, die er nicht hat.

**Test.** `PB-027`

---

### PB-028

**Aufwärmrampe konnte die Arbeitslast überschreiten**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Falsche Berechnung |
| **Gefunden** | Regressionstest beim Bau der Funktion |
| **Status** | ✅ behoben |

**Symptom.** Bei sehr leichten Arbeitsgewichten konnte eine Aufwärmstufe
schwerer sein als der Arbeitssatz — oder zwei Stufen fielen nach dem Runden auf
denselben Wert.

**Ursache.** Die Rampe rechnet Prozentsätze und rundet auf einstellbare
Scheibengrößen (2,5 kg / 1 kg / 0,5 kg). Bei 6 kg Arbeitslast ergibt
`Math.round(6*0.88/1)*1 = 5` — bei 2 kg jedoch `Math.round(2*0.88/0.5)*0.5 = 2`,
also gleich der Arbeitslast. Runden **nach** dem Prozentrechnen kann eine
Ordnung umkehren, die vorher galt.

**Fix.** Nach dem Runden filtern statt vorher zu hoffen: Stufen `>= Arbeitslast`
fliegen raus, Dubletten ebenfalls. Ungültige Eingaben (0, negativ, `NaN`)
liefern `null` statt einer kaputten Liste.

**Lektion.** Runden ist keine ordnungserhaltende Operation. Wenn eine
Invariante („streng aufsteigend, kleiner als X") nach einer Rundung gelten
soll, muss sie **nach** der Rundung geprüft und durchgesetzt werden.

**Test.** `PB-028` — sieben Arbeitslasten × fünf Bewegungsmuster, alle Stufen
aufsteigend und unter der Arbeitslast; ungültige Eingaben liefern nichts.

---

### PB-029

**Aufwärmsätze durften Volumen nicht verfälschen**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Falsche Berechnung |
| **Gefunden** | Vorbeugend beim Bau (Lehre aus PB-004) |
| **Status** | ✅ behoben |

**Symptom.** Keiner — dieser Eintrag steht hier, weil der Fehler **verhindert**
wurde und der Test das dauerhaft absichert.

**Hintergrund.** PB-004 (Cardio als Tonnage) entstand genau so: Ein neuer
Datentyp wurde in bestehende Rechenwege eingespeist, ohne alle Leser
anzupassen. Aufwärmsätze sind der nächste Kandidat — vier zusätzliche „Sätze"
pro Übung würden die MEV/MAV-Einordnung sprengen und die Tonnage aufblähen.

**Umsetzung.** Die Rampe ist reine Anzeige. Sie erzeugt keinen Eintrag in
`logged`, verändert keinen Zustand und ist damit für jede Statistik unsichtbar.
Im UI steht das auch dran: „zählt nicht ins Volumen".

**Lektion.** Wenn ein bekanntes Fehlermuster (hier: Muster 4 aus der Tabelle
unten) auf ein neues Feature zutreffen *könnte*, schreib den Test **bevor** der
Fehler passiert. Ein Register ist nur dann etwas wert, wenn man daraus auch
vorwärts lernt und nicht nur rückwärts.

**Test.** `PB-029` — das Rendern der Rampe verändert weder Wochenvolumen noch
geloggte Sätze.

---

### PB-030

**Deload musste den Trainingsplan unberührt lassen**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Datenintegrität |
| **Gefunden** | Vorbeugend beim Bau |
| **Status** | ✅ behoben |

**Symptom-Risiko.** Der Deload-Modus senkt Satzzahlen auf ~60 % und hebt die
RIR-Vorgabe. Der naheliegende Weg wäre, das direkt in `D.plan` zu schreiben.
Dann wäre nach der Deload-Woche der Plan dauerhaft kastriert — und niemand
wüsste mehr, wie er vorher aussah.

**Umsetzung.** `applyDeloadToExercises()` greift ausschließlich auf die Kopie,
die beim Start eines Workouts in `D.active.exercises` landet. `D.plan` wird nie
angefasst. Der Modus endet nach sieben Tagen von selbst
(`deloadActive()` prüft `until` bei jedem Aufruf), lässt sich aber auch
vorzeitig beenden.

**Lektion.** Temporäre Anpassungen gehören in die temporäre Struktur. Sobald
ein Modus in den dauerhaften Zustand schreibt, brauchst du einen Rückweg — und
den vergisst man.

**Test.** `PB-030` — Sätze sind reduziert, RIR angehoben, `D.plan`
byte-identisch, und ein abgelaufener Deload deaktiviert sich selbst.

---

### PB-031

**Indirektes Volumen mit Rundungsartefakten**

| | |
|---|---|
| **Schwere** | niedrig |
| **Klasse** | Falsche Berechnung |
| **Gefunden** | Regressionstest beim Bau |
| **Status** | ✅ behoben |

**Symptom.** Indirekt beteiligte Muskeln zählen mit 0,5 Sätzen. Bei genügend
Additionen erzeugt binäre Gleitkommaarithmetik Werte wie `12.499999999999998`,
die im UI so auch erschienen wären.

**Fix.** Nach dem Aufsummieren einmal auf eine Nachkommastelle runden.

**Lektion.** Sobald Zähler nicht mehr ganzzahlig sind, kommt Gleitkomma ins
Spiel. Entweder in Halbschritten als Ganzzahl rechnen (alles ×2) oder an genau
einer Stelle — am Ende — runden. Nicht mittendrin, sonst summieren sich die
Rundungsfehler auf.

**Test.** `PB-031` — 3 Sätze Drücken ergeben exakt 1,5 Sätze Trizeps, alle
Werte haben höchstens eine Nachkommastelle.

---

### PB-032

**`overflow-x:hidden` bricht `position:sticky`**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Darstellung |
| **Gefunden** | **Screenshot im iPhone-Viewport** |
| **Status** | ✅ behoben |

**Symptom.** Die neue Large-Title-Kopfzeile sollte beim Scrollen oben kleben
und zu einer kompakten Glasleiste zusammenschrumpfen. Sie scrollte stattdessen
komplett weg. Gemessen: `top: -376px` bei 377px Scrollposition — also exakt
mitgewandert, als wäre `position:sticky` gar nicht gesetzt.

**Ursache.** Ganz woanders im Stylesheet, seit Jahren unverändert:

```css
html, body { overflow-x: hidden; }
```

`overflow-x: hidden` erzwingt für die andere Achse den berechneten Wert `auto`.
Damit wird das Element zu einem **Scroll-Container**. Ein `position: sticky`-Kind
klebt immer an seinem nächsten Scroll-Container — hier also an `<body>`, das
selbst gar nicht scrollt. Ergebnis: Es klebt an nichts.

Das Tückische daran: Die Regel war nicht falsch, als sie geschrieben wurde. Sie
wurde es erst durch ein Feature, das Jahre später dazukam.

**Fix.**

```css
html, body { overflow-x: hidden; }                        /* Fallback */
@supports (overflow: clip) { html, body { overflow-x: clip } }
```

`clip` schneidet Überhang genauso ab, erzeugt aber **keinen** Scroll-Container.
Safari kann es seit 16.0; ältere Versionen fallen auf `hidden` zurück — dort ist
die Kopfzeile dann nicht sticky, das Layout stimmt aber weiterhin.

**Lektion.** Manche CSS-Eigenschaften haben Fernwirkung auf Nachfahren, die man
beim Schreiben nicht sieht: `overflow`, `transform`, `filter`, `contain`,
`will-change` und `perspective` erzeugen alle Container, an denen sich
`position: fixed`/`sticky` neu ausrichten. Wenn Sticky oder Fixed „einfach nicht
funktioniert", steht die Ursache fast nie an der Stelle, an der man sucht —
sondern bei einem Vorfahren.

**Nachtrag zum Test — und der eigentliche Lerneffekt.** Die erste Fassung des
Regressionstests prüfte:

```js
const ok = r.collapsedTop <= 1;      // ✗
```

Das bestand **auch ohne den Fix**: eine weggescrollte Kopfzeile hat
`top = -376`, und `-376 <= 1` ist wahr. Ein Test, der die Vorzeichenrichtung
nicht prüft, prüft in Wahrheit nichts. Richtig ist der Betrag:

```js
const ok = r.scrolled > 100 && Math.abs(r.collapsedTop) <= 1 && r.t > 0.9
        && r.collapsedH < r.expandedH;
```

Aufgefallen ist das nur, weil die Gegenprobe („Fix rausnehmen, Test muss rot
werden") tatsächlich durchgeführt wurde. Genau dafür steht dieser Schritt in
`/check` Phase 4.

**Test.** `PB-032` — gegen den nicht-gefixten Zustand verifiziert rot.

---

### PB-033

**„Leg Curl" wurde als Bizeps-Curl erkannt**

| | |
|---|---|
| **Schwere** | hoch |
| **Klasse** | Darstellung / Mustererkennung |
| **Gefunden** | **Kontaktbogen aller 15 Bewegungsmuster** |
| **Status** | ✅ behoben |

**Symptom.** Die Übungsanimation für „Leg Curl" zeigte eine stehende Figur mit
Kurzhantel-Curl statt der Beinbeuger-Maschine. Ein Nutzer, der die Ausführung
nachschlägt, bekam die falsche Übung gezeigt.

**Ursache.** `detectMovePattern()` läuft eine Regelliste durch und nimmt den
**ersten** Treffer. Die Liste stand so:

```js
{k:'curl',    re:/(curl|bizeps|...)/i},   // ← trifft "Leg Curl"
...
{k:'legcurl', re:/(beinbeuger|leg ?curl|...)/i},   // wird nie erreicht
```

„Leg Curl" enthält „curl", also gewann die allgemeine Regel. Die spezifische
kam nie zum Zug.

**Fix.** `legext` und `legcurl` vor `curl` gezogen. Die Reihenfolge der Regeln
ist in einem First-Match-System kein Stilfrage, sondern Logik.

**Lektion.** Bei First-Match-Regelwerken gilt: **spezifisch vor allgemein.**
Das ist dieselbe Regel wie bei `switch`-Fallgruppen, CSS-Spezifität und
Routing-Tabellen — und wird genauso oft übersehen, weil beide Regeln einzeln
betrachtet korrekt aussehen.

**Test.** `PB-033` — 19 Übungsnamen mit erwartetem Muster, darunter alle
Kollisionskandidaten („Leg Curl" vs. „Preacher Curl", „Beinstrecker" vs.
„Trizepsdrücken").

---

### PB-034

**Hantel lief eine halbe Phase neben der Hand**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Darstellung |
| **Gefunden** | **Kontaktbogen** (Seitheben: Hantel schwebte 50px neben dem Arm) |
| **Status** | ✅ behoben |

**Symptom.** Bei Latziehen, Rudern und Seitheben schwebte das Gerät neben der
Figur statt in der Hand.

**Ursache.** Nachträglich wurde eine „Heldenpose" eingeführt: Die Animation
startet auf der Haltung, an der man die Übung erkennt, statt auf einer
beliebigen. Umgesetzt wurde das durch Vertauschen der Start- und Endpose —
aber **nur für die Figur**. Hantel und Kabel behielten ihre alte
Startreihenfolge und liefen dadurch exakt eine halbe Phase versetzt.

```js
const [p1,p2] = heroFirst ? [b,a] : [a,b];   // Figur ✓
const A = anchor(pa), B = anchor(pb);        // Last ✗ — kennt heroFirst nicht
```

**Fix.** `heroFirst` an `loadSVG()` und die Kabelberechnung durchgereicht.

**Lektion.** Wenn du eine Konvention änderst (hier: welche Pose zuerst kommt),
such **alle** Stellen, die auf der alten Konvention aufbauen. Dasselbe Muster
wie PB-004: dort war es ein Feld mit zwei Bedeutungen, hier eine Reihenfolge —
beide Male wurde nur die Hälfte der Leser angepasst.

**Test.** `PB-034` — für jedes Bewegungsmuster mit Gerät wird bei `t=0` der
Abstand zwischen Last und nächstem Gelenkpunkt gemessen; über 26px gilt als
abgekoppelt. Gegen den nicht-gefixten Zustand verifiziert rot (48–50px).

---

### PB-035

**Figur schwebte aus dem Bildausschnitt**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Darstellung |
| **Gefunden** | **Kontaktbogen** (Wadenheben) |
| **Status** | ✅ behoben |

**Symptom.** Beim Wadenheben stand die Figur mit dem Kopf halb außerhalb des
sichtbaren Bereichs, die Füße hingen in der Luft neben der Stufe.

**Ursache.** Ein Denkfehler im Bewegungsmodell. Die Kinematikkette geht
Becken → Knie → Knöchel → Zeh, der Fuß dreht also um den **Knöchel**. Beim
Wadenheben bleibt aber der **Ballen** auf der Stufe stehen und die Ferse hebt
sich — der Drehpunkt liegt am anderen Ende. Der Versuch, das über den
Fußwinkel zu lösen, ließ den Zeh mitwandern; um das auszugleichen, wurde die
Wurzel angehoben, und die ganze Figur rutschte nach oben aus dem Bild.

**Fix.** Wurzelposition und Fußwinkel beider Posen so gewählt, dass der Zeh
rechnerisch auf derselben Stelle bleibt (~163,185). Der Drehpunkt liegt damit
faktisch am Ballen, ohne die Kette umbauen zu müssen.

**Lektion.** Wenn eine Bewegung um ein anderes Gelenk dreht, als das Modell
vorsieht, hilft kein Nachjustieren einzelner Winkel — man muss entweder das
Modell ändern oder die Randbedingung („Zeh bleibt fix") explizit lösen.

**Test.** `PB-035` — für alle Muster und beide Posen muss jede Gliedmaße und
der Kopf innerhalb des Sichtbereichs liegen. Gegen den nicht-gefixten Zustand
verifiziert rot (`calf/b: ausserhalb (139,-12)`).

---

### PB-036

**Zeichnungen statt echter Übungsfotos**

| | |
|---|---|
| **Schwere** | hoch |
| **Klasse** | Darstellung |
| **Gefunden** | Nutzerrückmeldung |
| **Status** | ✅ behoben |

**Symptom.** Auch nach dem Umbau auf eine Pose-Engine blieben es Strichfiguren.
Sie zeigen das Bewegungsmuster korrekt — aber keine Ausführung, keine Technik,
keine Griffbreite, kein Gerät im Detail. Für „wie geht diese Übung?" reicht das
nicht.

**Ursache.** Kein Fehler im engeren Sinn, sondern eine zu niedrig angesetzte
Lösung. Ich hatte den Anspruch „funktioniert offline, kein Netzwerk" über den
Anspruch „zeigt die Übung" gestellt und dabei nicht geprüft, ob es
frei verwendbares Bildmaterial gibt.

**Fix.** Fotos aus der [Free Exercise DB](https://github.com/yuhonas/free-exercise-db)
— 873 Übungen, je ein Bild der Start- und der Endposition, veröffentlicht unter
der **Unlicense (Public Domain)**. Die Lizenz wurde vor der Übernahme geprüft:
`LICENSE.md` im Repository, Unlicense-Wortlaut, keine Namensnennungspflicht.
Die Quelle steht trotzdem im Demo-Sheet und in der README.

Zwei Bilder pro Übung sind praktisch: übereinandergelegt und zyklisch
überblendet ergeben sie die Bewegung, ohne Video oder GIF.

Dreistufige Rückfallebene, jede Stufe mit eigenem Grund:

| Stufe | Quelle | Wofür |
|---|---|---|
| 1 | `assets/ex/<id>-<n>.webp` | lokal, offline, auf 560px verkleinert (0,9 MB für 26 Übungen) |
| 2 | `raw.githubusercontent.com` | eigene Übungen, oder wenn jemand nur die `index.html` kopiert hat |
| 3 | gezeichnete Figur | kein Datenbankeintrag, oder beide Stufen scheitern |

Die Zuordnung deutscher Namen ist **kuratiert**, nicht geraten: 31 feste
Einträge für alles, was die App mitbringt. Für eigene Übungen greift eine
Übersetzungstabelle (`bankdrücken → bench press`, `beinbeuger → leg curl`, …)
plus Auswertung der englischen Klammer, die viele Namen ohnehin schon tragen.

**Lektion.** Bevor man etwas selbst baut, prüfen, ob es das in brauchbarer
Qualität und mit passender Lizenz schon gibt. Ich habe eine Pose-Engine
geschrieben, wo eine kuratierte Zuordnungstabelle plus 0,9 MB Bilder das
bessere Ergebnis liefern. Die Engine bleibt trotzdem — als Rückfallebene ist
sie jetzt am richtigen Platz.

**Test.** `PB-036` — acht Zuordnungen namentlich geprüft, erfundene Übungen
dürfen **kein** Foto liefern (sonst zeigt die App eine falsche Übung), und
alle 16 referenzierten Dateien müssen tatsächlich laden.

---

### PB-037

**Inline-`onerror` verletzte die eigene XSS-Invariante**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Sicherheit |
| **Gefunden** | **Fuzzer-Invariante „Keine injizierten Event-Handler-Attribute"** |
| **Status** | ✅ behoben |

**Symptom.** Direkt nach dem Einbau der Fotoschicht schlug der Fuzzer an. Die
Fallback-Kette war so umgesetzt:

```html
<img src="assets/…" onerror="exPhotoFallback(this,'https://…')">
```

**Warum das mehr ist als ein Testartefakt.** Die naheliegende Reaktion wäre
gewesen, die Invariante um eine Ausnahme zu erweitern. Genau das hätte sie
wertlos gemacht: Sie existiert, um Event-Handler-Attribute zu finden, die aus
Nutzerdaten entstehen. Eine Regel, die für den eigenen Code Ausnahmen macht,
prüft am Ende nur noch, dass man sich selbst nicht überrascht.

**Fix.** Kein Inline-Handler mehr. Die Remote-URL steht in `data-fb`, und ein
einziger delegierter Listener fängt alle Bildfehler ab:

```js
document.addEventListener('error', e => {
  const t = e.target;
  if (t?.tagName === 'IMG' && t.dataset?.fb !== undefined) exPhotoFallback(t);
}, true);   // error blubbert nicht, wird aber in der Capture-Phase zugestellt
```

Die zweite Invariante („keine Fremdelemente") musste dagegen angepasst werden —
Fotos *sind* legitime `<img>`. Das ist aber eine **Verschärfung**: statt „gar
keine img" prüft sie jetzt „keine img außer den bekannten Foto-Klassen". Jedes
andere `<img>`, `<iframe>`, `<form>` schlägt weiterhin an.

**Lektion.** Wenn dein eigener Code eine Sicherheitsregel verletzt, ist die
erste Frage nicht „wie nehme ich mich aus?", sondern „warum brauche ich
überhaupt, was ich verbiete?". Meistens gibt es einen Weg ohne. Und wenn eine
Regel wirklich zu breit ist, macht man sie **präziser**, nicht löchriger.

**Test.** `PB-037` — prüft die komplette Kette: ohne Datenbankeintrag nur SVG
und kein `<img>`, mit Eintrag beide Frames plus SVG darunter, erster Fehlschlag
schaltet auf die Remote-URL, zweiter entfernt das Foto und die Zeichnung bleibt.

---

### PB-038

**„Danach" stand über einer bereits erledigten Übung**

| | |
|---|---|
| **Schwere** | niedrig |
| **Klasse** | Darstellung |
| **Gefunden** | Screenshot des neuen Fokus-Layouts angesehen |
| **Status** | ✅ behoben |

**Symptom.** Das neue Workout-Layout gliedert die Übungsliste in Zonen:
erledigt, gerade dran, kommt noch. Die Zwischenüberschrift „Danach" tauchte
aber über der *ersten eingeklappten* Übung auf — und das war die bereits
abgehakte Übung Nummer eins. Die Überschrift behauptete also das Gegenteil
dessen, was darunter stand.

**Ursache.** Die Bedingung fragte das Falsche:

```js
if (!isActive && !upcomingHeaderDone) { …'Danach'… }
```

`!isActive` ist wahr für **alles**, was nicht die aktive Übung ist — vor ihr
genauso wie nach ihr. Die Position relativ zur aktiven Übung kam in der
Bedingung gar nicht vor, obwohl genau sie die Bedeutung trägt.

**Fix.** Die Zone aus dem Vergleich mit dem Index der aktiven Übung ableiten
statt aus einem Negativ:

```js
if (activeExIdx < 0)        → „Übungen"   (nichts mehr offen)
else if (ei < activeExIdx)  → „Erledigt"
else if (ei > activeExIdx)  → „Danach"
```

**Lektion.** Eine Überschrift ist eine Behauptung über das, was folgt. Wenn
sie aus einer Verneinung abgeleitet wird (`!isActive`), prüft der Code nicht,
ob die Behauptung stimmt — er prüft nur, dass etwas anderes nicht zutrifft.
Bei drei Zonen und einer Zweiwertbedingung fällt genau eine Zone hinten runter.

**Test.** `PB-038` — startet ein Workout, hakt die erste Übung ab und prüft,
dass keine „Danach"-Überschrift vor der aktiven Übung im DOM steht.

---

### PB-039

**Zwei Matrixspalten hießen gleich**

| | |
|---|---|
| **Schwere** | niedrig |
| **Klasse** | Darstellung |
| **Gefunden** | Screenshot der neuen Coach-Matrix angesehen |
| **Status** | ✅ behoben |

**Symptom.** Die Matrix des Volumen-Coaches stellt Muskeln (Zeilen) gegen
Trainingstage (Spalten). Die Spaltenüberschriften entstanden so:

```js
planDisplayName(k).split(/[\s_]/)[0].slice(0,6)
```

Beim Standardplan heißen zwei Tage „FullBody A" und „FullBody B". Das erste
Wort ist bei beiden „FullBody", auf sechs Zeichen gekürzt zweimal **FULLBO**.
Eine Tabelle mit zwei identisch beschrifteten Spalten ist keine Tabelle mehr —
man kann die Zahl darunter keinem Tag zuordnen.

**Warum das kein Kürzungsproblem ist.** Der naheliegende Reflex wäre, auf acht
oder zehn Zeichen zu kürzen. Das verschiebt den Fehler nur: „Oberkörper A" und
„Oberkörper B" kollidieren dann wieder. Das Problem ist nicht die Länge,
sondern dass **Eindeutigkeit gar nicht geprüft wurde**.

**Fix.** Eine Funktion, die eine garantiert eindeutige Beschriftung liefert,
mit Rückfallkette:

1. das **letzte** Wort des Plannamens (bei „Push A" / „Push B" ist genau das
   der Unterschied),
2. sonst der Wochentag,
3. sonst `T1 … Tn`.

Entscheidend: Bei einer Kollision wird **nicht** die einzelne Spalte
umbenannt, sondern die ganze Kopfzeile auf dieselbe Systematik umgestellt.
Eine Zeile „A · Do · Mi" ist schwerer zu lesen als „Mo · Do · Mi" — gemischte
Benennungen liest niemand als eine Tabelle.

**Lektion.** Wenn eine Beschriftung gekürzt wird, ist sie ein *Bezeichner*,
kein Text. Bezeichner brauchen eine Eindeutigkeitsprüfung, und der Fallback
muss die ganze Menge betreffen, nicht den kollidierenden Einzelfall.

**Test.** `PB-039` — zwei Pläne, einer mit gemeinsamem Präfix, einer ohne
unterscheidbares letztes Wort; beide Male müssen die Beschriftungen paarweise
verschieden und keine leer sein.

---

### PB-040

**Vorwärtsgerichtet: Coach-Maßnahmen lassen den Plan gültig zurück**

| | |
|---|---|
| **Schwere** | — (kein aufgetretener Fehler) |
| **Klasse** | Datenintegrität |
| **Gefunden** | aus dem Muster-Register abgeleitet |
| **Status** | ✅ abgesichert |

Kein aufgetretener Fehler, sondern ein Test aus **Muster 6 (stille
Datenvernichtung)**: Der Coach schreibt über seine Maßnahmen direkt in
`D.plan`. Zwei Zusagen macht das UI dem Nutzer, und beide müssen halten:

* **„Verteilen"** verschiebt eine Übung auf einen anderen Tag. Der Dialog sagt
  ausdrücklich „das Wochenvolumen bleibt gleich" — der Test rechnet die Sätze
  vor und nach der Aktion nach und prüft zusätzlich, dass die Frequenz
  tatsächlich steigt.
* **„− Satz"** darf nie unter einen Satz fallen. Der Test drückt den Knopf
  zweimal auf einer Übung, die schon bei einem Satz steht.

**Lektion.** Jede Zusage, die im UI-Text steht („bleibt gleich", „bleibt
erhalten", „ändert nichts an …"), ist eine Invariante — und gehört als Test
formuliert, bevor jemand sie beim nächsten Umbau versehentlich bricht.

---

### PB-041

**QR-Codes sahen richtig aus und waren unlesbar**

| | |
|---|---|
| **Schwere** | **hoch** |
| **Klasse** | Korrektheit |
| **Gefunden** | Vergleich mit zwei unabhängigen Decodern |
| **Status** | ✅ behoben |

**Symptom.** Der selbst gebaute QR-Encoder lieferte Bilder, die in jeder
Hinsicht wie QR-Codes aussehen: richtige Größe, drei Suchmuster, Taktspur,
Ausrichtungsmuster, plausibel verteilte Module. Nur ließen sie sich nicht
lesen — je nach Version und Maske mal ja, mal nein.

**Warum das die gefährlichste Fehlerklasse in diesem Projekt ist.** Bei jedem
anderen Fehler sieht man das Problem: ein Balken fehlt, eine Zahl stimmt
nicht, eine Karte ist leer. Hier ist die Ausgabe für das menschliche Auge
**nicht von der korrekten zu unterscheiden**. Ein Screenshot beweist nichts.
Nur ein echter Decoder beweist etwas.

**Zwei Ursachen, beide unsichtbar:**

1. **Formatbits in umgekehrter Bit-Reihenfolge.** Die 15 Formatbits stehen an
   festen Positionen. Ich schrieb Bit 0 dorthin, wo Bit 14 hingehört. Der Code
   wirkt völlig normal — der Decoder liest nur eine falsche Maske heraus und
   entmaskiert alles falsch.
2. **Regel 3 der Maskenbewertung war praktisch abgeschaltet.** In der
   Suchschleife stand ein `return` ohne Bedingung im Schleifenkörper:

   ```js
   for (let k = 0; k < 11; k++) {
     …
     return ok1 || ok2;      // beendet die Schleife nach dem ersten Durchlauf
   }
   ```

   Damit fiel die Regel weg, die Muster mit dem Verhältnis 1:1:3:1:1 bestraft —
   also genau die Folge, an der ein Scanner die Ecken erkennt. Der Encoder
   wählte dadurch Masken, die falsche Suchmuster in die Daten schreiben.

**Fix.** Formatbits als `(fmt >> (14 - i)) & 1`; Regel 3 als vollständige
Mustersuche über Zeilen und Spalten.

**Prüfung.** Zwei unabhängige Decoder außerhalb der App: **ZXing** (die
Engine hinter den meisten Scanner-Apps) und **OpenCV**. 110 zufällige
Nutzlasten von 1 bis 1400 Zeichen, Versionen 1 bis 29, mit Umlauten und
Sonderzeichen — alle korrekt dekodiert. Zusätzlich der echte Teilen-Link aus
der laufenden App (Version 27).

**Nebenbefund.** OpenCV scheiterte an einigen Masken, an denen ZXing nicht
scheiterte — und zwar auch bei Codes einer etablierten Referenzbibliothek.
Ein einzelner Decoder als Wahrheitsquelle hätte hier zu einer Fehlersuche an
der falschen Stelle geführt.

**Lektion.** Wenn die Ausgabe eines Algorithmus für Menschen nicht prüfbar
ist, ist eine unabhängige Gegenimplementierung kein Luxus, sondern die
einzige verfügbare Wahrheit — und zwei davon sind besser als eine. Für
Regressionen genügt danach eine Prüfsumme über die Referenzausgabe.

**Test.** `PB-041` — friert Größe und Prüfsumme dreier Referenzcodes ein und
prüft, dass eine zu große Nutzlast sauber `null` liefert statt einen kaputten
Code.

---

### PB-042

**Vorwärtsgerichtet: Import härtet fremde Daten**

| | |
|---|---|
| **Schwere** | — (kein aufgetretener Fehler) |
| **Klasse** | Sicherheit / Datenintegrität |
| **Gefunden** | aus dem Muster-Register abgeleitet |
| **Status** | ✅ abgesichert |

Der Plan-Import ist die erste Stelle der App, an der **fremder Input** aus
einer Datei, einer Zwischenablage oder einem Link ins Datenmodell wandert.
Damit treffen gleich drei bekannte Muster aufeinander: Kontextverwechslung
beim Escaping (Muster 1), neuer Datentyp in alte Rechenwege (Muster 4) und
stille Datenvernichtung (Muster 6).

Deshalb gilt hier: **Escaping beim Rendern ist die zweite Verteidigung, nicht
die erste.** Jedes Feld wird beim Einlesen auf Typ, Wertebereich und Länge
gezwungen — Sätze 1–20, Wiederholungen 1–300 mit `rmax >= rmin`, RIR 0–10
oder `null`, Typ aus einer festen Liste, Muskel nur wenn eine Landmark dazu
existiert, Texte auf 400 Zeichen. Übungen ohne Namen und Tage ohne Übungen
fallen weg.

Und: Ein importierter Tagesschlüssel überschreibt **nie** einen vorhandenen.
Bei Namensgleichheit bekommt er einen Zusatz — sonst verschwände ein eigener
Trainingstag stillschweigend, nur weil er zufällig genauso heißt.

**Test.** `PB-042` — importiert einen Container mit unmöglichen Werten
(999 Sätze, negative Wiederholungen, erfundene Muskelgruppe, 5000-Zeichen-Notiz)
und Skript-Versuchen im Übungsnamen. Geprüft wird, dass Historie, Körperdaten
und Einstellungen unverändert bleiben, die bestehenden Trainingstage erhalten
sind, alle Werte im gültigen Bereich landen und kein fremdes Element im DOM
auftaucht.

---

### PB-043

**Fotoschicht entfernt — Kacheln zeigen jetzt eine Marke**

| | |
|---|---|
| **Schwere** | — (Feature zurückgebaut) |
| **Klasse** | Darstellung |
| **Gefunden** | Nutzerurteil beim Ansehen der App |
| **Status** | ✅ umgesetzt |

**Anlass.** Die Übungsfotos aus der Free Exercise DB waren fachlich korrekt
und lizenzrechtlich sauber — und gestalterisch Fremdkörper. Rote Studiowände,
Holzböden, Tageslicht, vier verschiedene Kameras: nebeneinander in einer
Liste sahen sie aus wie vier verschiedene Apps. Kein Filter hätte das ganz
geheilt, und jeder Filter hätte die Erkennbarkeit weiter gesenkt.

**Entscheidung.** Statt die Fotos zu behandeln, wurde die Frage neu gestellt:
*Was soll eine 44-Pixel-Kachel überhaupt leisten?* Eine Bewegung erklären kann
sie nicht. Einordnen kann sie. Also zeigt sie jetzt eine **Marke** — das
Bewegungsmuster als Symbol, eingefärbt nach Muskelgruppe. Wer wissen will, wie
die Übung aussieht, öffnet die Demo; dort steht weiterhin die animierte Figur
mit Ausführungshinweisen.

**Was dabei wegfiel:** 52 Bilddateien (0,9 MB), die Zuordnungstabelle
Deutsch→Datenbank, die Deutsch-Englisch-Übersetzungsliste, die zweistufige
Fallback-Kette lokal→Netz→entfernen und der delegierte Fehler-Listener.

**Folgen für das Register.** PB-036 (falsche Foto-Zuordnung) und PB-037
(Inline-`onerror` gegen die eigene XSS-Invariante) betreffen Code, den es
nicht mehr gibt. Sie stehen weiter im Register — gelöschte Fehler sind
gelöschte Erkenntnisse —, sind aber als **entfällt** markiert. Ihre Tests
wurden nicht stillschweigend entfernt, sondern durch `PB-043` ersetzt.

**Was dabei strenger wurde.** Die Invariante „keine injizierten Fremdelemente"
brauchte für PB-037 eine Ausnahme für Foto-`<img>`. Diese Ausnahme ist weg:
im gerenderten Baum darf jetzt **überhaupt kein** `<img>` mehr stehen.
Ebenso wurde die Invariante „Übungs-SVG bleibt wohlgeformt" geteilt — Marke
und Figur sind zwei verschiedene Grafiken mit zwei verschiedenen Verträgen;
eine gemeinsame Regel hätte entweder falsch angeschlagen oder nichts geprüft.

**Lektion.** Wenn Fremdmaterial nicht zum eigenen System passt, ist die erste
Frage nicht „welcher Filter rettet es?", sondern „welche Aufgabe hat dieses
Element eigentlich?". Oft ist die Antwort kleiner als das, was man ersetzen
wollte — und dann verschwindet mit dem Material auch dessen ganze
Fehlerklasse.

**Test.** `PB-043` — Kacheln enthalten nie ein `<img>`, jede Übung bekommt
eine Marke mit lesbarem Bewegungsmuster (auch unbekannte und namenlose), das
Muster stimmt (vertikal vs. horizontal drücken), die Demo liefert weiterhin
die Figur, und kein Rest der Fotoschicht ist im Code oder CSS übrig.

---

### PB-046

**Negatives Gewicht wurde klaglos gespeichert**

| | |
|---|---|
| **Schwere** | **hoch** |
| **Klasse** | Berechnung / Datenintegrität |
| **Gefunden** | **Fuzzer-Invariante „Volumen ist endlich und nicht negativ"** |
| **Status** | ✅ behoben |

**Symptom.** `<input type="number">` akzeptiert ein Minuszeichen. Wer beim
Loggen `-50` eintippt — oder es sich aus einem verrutschten Tastendruck
ergibt —, bekam einen Satz mit −50 kg ins Datenmodell geschrieben.

**Warum das nicht nur hässlich ist.** Das Gewicht ist kein Anzeigewert,
sondern eine Rechengröße. Ein negativer Satz zieht sich durch:

* Tonnage der Session und der Woche wird kleiner statt größer,
* das geschätzte 1RM im neuen Stats-Trend wird negativ,
* die Bestwert-Erkennung vergleicht gegen einen unmöglichen Vorwert,
* der Volumen-Coach rechnet mit einem Satz, der Erholung „zurückgibt".

Und all das **still** — keine Fehlermeldung, keine auffällige Zahl, nur
Werte, die einige Prozent zu niedrig sind.

**Warum es so lange unentdeckt blieb.** Die Eingabe ist über die
Benutzeroberfläche kaum absichtlich zu erzeugen; erst der Fuzzer, der
Zahlenfelder mit Grenzwerten beschießt, hat sie in einer Kette aus zwölf
Aktionen produziert. Genau dafür existiert die Invariante — sie prüft nach
*jeder* Aktion eine Eigenschaft, die immer gelten muss, statt eines Ergebnisses,
an das jemand gedacht hat.

**Fix.** Klemmen an der einzigen Stelle, an der Werte ins Modell wandern:
`confirmLog()` und `saveEditSet()`. Gewicht 0–2000 kg, Wiederholungen 0–999,
RIR 0–10. Bewusst **nicht** im Eingabefeld über `min="0"` — ein Attribut im
Markup lässt sich umgehen, eine Klemmung in der Schreibfunktion nicht.

**Lektion.** Eine Zahl, die weiterverrechnet wird, braucht ihre Wertebereichs-
prüfung dort, wo sie ins Modell geschrieben wird — nicht dort, wo sie
eingegeben wird. Und: Der wertvollste Test ist nicht der, der ein erwartetes
Ergebnis prüft, sondern der, der eine Eigenschaft prüft, die nie verletzt sein
darf.

**Test.** `PB-046` — tippt negative und absurd große Werte in Log-Dialog und
Satz-Editor und prüft, dass im Modell nur geklemmte, endliche Werte landen.

---

### PB-047

**Zwei Übungen im falschen Bewegungsmuster**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Darstellung / Klassifikation |
| **Gefunden** | beim Durchrechnen eines neuen Trainingsplans |
| **Status** | ✅ behoben |

**Symptom.** Beim Aufbau eines Drei-Tage-Splits zeigte die Musterauswertung
`push: 4`, obwohl der Plan nur drei Drückübungen enthielt. Die beiden
Ausreißer:

* **„Katana Extensions Kabel"** — eine Trizeps-Überkopfstreckung — stand als
  Wort in der `push`-Zeile und galt damit als Brustübung.
* **„Reverse Butterfly"** — hintere Schulter — enthält `butterfly`, und die
  `push`-Regel steht vor der `row`-Regel, in der `reverse butterfly`
  ordnungsgemäß aufgeführt war. Die allgemeinere Regel gewann.

**Warum das mehr ist als ein Etikett.** Das Bewegungsmuster steuert inzwischen
vier Dinge: die Marke auf der Übungskachel, die Auswahl der Alternativen, die
Animation in der Demo — und seit dem Volumen-Coach auch die Frage, ob ein
Muskel schon ein bestimmtes Muster abgedeckt hat. Eine falsch einsortierte
Übung führt also dazu, dass der Coach eine Bewegungsrichtung für abgedeckt
hält, die im Plan gar nicht vorkommt.

**Fix.** `katana` von der `push`- in die `triext`-Zeile verschoben. Für die
hintere Schulter eine eigene, **vorgezogene** Regel:

```js
{k:'raise', re:/(reverse ?(butterfly|fly|pec ?deck)|rear ?delt|hintere ?schulter|face ?pull|gesichtziehen)/i},
```

Damit wandern auch Face Pulls von `row` (horizontales Ziehen) nach `raise` —
sie sind horizontale Abduktion, keine Ruderbewegung.

**Bezug zu PB-033.** Das ist derselbe Fehler wie „Leg Curl wurde als
Bizeps-Curl erkannt", zwei Jahre alter Wein in neuen Schläuchen: In einer
Liste, bei der die erste passende Regel gewinnt, **ist die Reihenfolge die
Bedeutung**. Jeder neue Übungsname, der ein allgemeines Wort enthält
(`curl`, `butterfly`, `press`, `row`), muss gegen die Liste geprüft werden —
nicht nur dagegen, ob *irgendeine* Regel passt.

**Lektion.** Wenn dieselbe Fehlerklasse zum zweiten Mal auftritt, reicht der
Einzelfix nicht. Der Regressionstest zu PB-033 prüft jetzt zusätzlich beide
neuen Fälle **und** je eine Gegenprobe, dass die allgemeinen Regeln weiterhin
greifen — sonst repariert man den Sonderfall und bricht den Normalfall.

**Test.** `PB-033` (erweitert) — 28 Name-zu-Muster-Paare, darunter die beiden
neuen Fälle und Gegenproben für `push` und `row`.

---

### PB-048

**Die Karte „Nächstes Workout" beschreibt den falschen Tag**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Darstellung |
| **Gefunden** | beim Screenshot des neuen Drei-Tage-Splits |
| **Status** | ✅ behoben |

**Symptom.** Drei Befunde in einer Karte, alle drei erst sichtbar, als aus
zwei Trainingstagen drei wurden:

1. Der Titel zeigte `FULLBODY` — für **alle drei** Tage. Der Code nahm
   `planDisplayName(key).split(' ')[0]`, also nur das erste Wort. Bei
   „FullBody A/B/C" ist die Unterscheidung genau das zweite Wort.
2. Die Muskelzeile las die **ersten drei Übungen** statt der größten
   Muskelgruppen. Tag C beginnt mit Brust, Rücken, Rücken — die Karte
   meldete „Brust · Rücken · Rücken". Zusätzlich war `arms` fest mit
   „Trizeps" beschriftet, obwohl auch Bizepsübungen darunter fallen.
3. Die Punktreihe rechts oben stand **fest auf vier** Punkten — sie war reine
   Dekoration und behauptete trotzdem eine Anzahl.

**Warum das zusammengehört.** Alle drei sind derselbe Denkfehler: Die Karte
zeigte etwas, das bei *einer bestimmten Plangröße* zufällig gestimmt hat.
Zwei Tage mit verschiedenen Namen, vier Punkte für vier Kacheln, eine
Übungsreihenfolge ohne Wiederholung — solange das zutraf, sah alles richtig
aus. Kein Test schlug an, weil kein Test die Karte gelesen hat.

**Fix.**

```js
const setsPerMuscle={};                       // nach Volumen, nicht nach Reihenfolge
p.exercises.filter(e=>e.type==='main').forEach(e=>{
  const n=MUSCLE_DE[e.muscle]||e.muscle||'—';
  setsPerMuscle[n]=(setsPerMuscle[n]||0)+(parseInt(e.sets)||0);
});
const mains=Object.entries(setsPerMuscle).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]).join(' · ');
const nameParts=planDisplayName(nk.key).toUpperCase().split(' ').filter(Boolean);
const bigHTML=esc(nameParts[0]||'WORKOUT')+(nameParts.length>1?`<span class="suf">${esc(nameParts.slice(1).join(' '))}</span>`:'');
const dots=planKeys.map(k=>k===nk.key?'…breit…':'…schmal…').join('');
```

Der Tageszusatz steht als eigener, kleinerer Ton im Akzent hinter dem Namen —
voll ausgeschrieben sprengt „FULLBODY A" bei 48 px die Karte, weglassen macht
die Tage ununterscheidbar.

**Lektion.** Dekoration, die eine Anzahl zeigt, ist keine Dekoration mehr —
sie ist eine Behauptung. Und eine Zusammenfassung, die die *ersten n*
Elemente nimmt, beschreibt die Reihenfolge, nicht den Inhalt. Beides fällt
erst auf, wenn sich die Datenmenge ändert, für die es einmal gepasst hat.

**Test.** `PB-048` — Plan mit drei Tagen und doppelter Muskelgruppe:
Tagessuffix vorhanden, keine Wiederholung in der Muskelzeile, Reihenfolge
nach Satzanzahl, ein Punkt je Trainingstag.

---

## Offene Punkte (Backend-Änderung nötig)

Diese drei sind **nicht im Frontend lösbar**. Sie brauchen Änderungen an der
Firebase-Konfiguration und stehen hier, damit sie nicht vergessen werden.

### PB-021

**Firestore ohne Authentifizierung**

| | |
|---|---|
| **Schwere** | **kritisch** |
| **Klasse** | Sicherheit |
| **Status** | ⚠️ offen — braucht Firebase-Konfiguration |

**Befund.** Der Zugriff auf die gesyncten Daten ist nicht authentifiziert.
Ein Identifikator, den ein Nutzer selbst wählt, dient zugleich als einziger
Zugangsweg — er wird nirgends gegen ein Geheimnis geprüft.

*Die konkrete Ausnutzbarkeit ist hier bewusst nicht beschrieben, solange der
Punkt offen und die App öffentlich erreichbar ist. Ein akzeptiertes Risiko zu
dokumentieren ist sinnvoll; eine Anleitung dazu zu veröffentlichen nicht.*

**Status.** Vom Betreiber als bekanntes Risiko akzeptiert (Stand: Juli 2026).
Der Eintrag bleibt offen, damit er nicht in Vergessenheit gerät.

**Lösungsweg.** Firebase Authentication einführen und die Dokument-ID an die
Auth-Identität binden, statt an eine frei wählbare Eingabe:

```js
firebase.auth().signInAnonymously();
```

```javascript
// firestore.rules
match /pumpbrah/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```

Preis: Der bisherige geräteübergreifende Abgleich über eine gemeinsame Eingabe
entfällt und braucht einen echten Kopplungsmechanismus (E-Mail-Link, Custom
Token oder einen einmalig erzeugten Gerätecode).

**Lektion.** Ein Identifikator ist kein Berechtigungsnachweis. Und
clientseitige Sicherheit gibt es nicht — die Regeln müssen dort liegen, wo der
Angreifer sie nicht editieren kann.

---

### PB-022

**Read-Modify-Write ohne Transaktion**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Nebenläufigkeit |
| **Status** | ⚠️ offen |

**Symptom.** Schreiben zwei Geräte gleichzeitig, kann ein Schreibvorgang
verloren gehen.

**Ursache.** `queueCloudSave()` macht `get()` → merge → `set()`. Zwischen den
beiden Netzwerkoperationen liegt ein Fenster. Die `cloudWriteQueue`
serialisiert nur innerhalb eines Tabs.

**Lösungsweg.** `db.runTransaction()` — macht Lesen und Schreiben atomar und
wiederholt bei Konflikt automatisch.

**Praktisches Risiko:** gering, weil beide Seiten ohnehin mergen und das
Fenster klein ist. Aber „gering" ist nicht „null".

**Lektion.** Read-Modify-Write über Netzwerk ist immer eine Race Condition.
Transaktionen sind keine Optimierung, sondern die Korrektheitsbedingung.

---

### PB-023

**1-MB-Dokumentgrenze bei Firestore**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Skalierung |
| **Status** | ⚠️ offen |

**Symptom.** Ab einer bestimmten Historiengröße schlägt jeder Sync fehl —
sichtbar nur als generisches „⚠️ Sync fehlgeschlagen".

**Ursache.** Die gesamte App liegt in **einem** Firestore-Dokument. Limit: 1 MB.
Bei ~1 KB pro Session ist bei rund 1.000 Sessions Schluss — etwa vier Jahre bei
fünf Trainings pro Woche.

**Lösungsweg.** Subcollection `pumpbrah/{uid}/sessions/{sessionId}`, ein
Dokument pro Session. Senkt gleichzeitig das Schreibvolumen drastisch: statt
der kompletten Historie bei jedem geloggten Satz nur noch das eine geänderte
Dokument.

**Sofortmaßnahme bis dahin:** Die Fehlerbehandlung sollte
`resource-exhausted` / `invalid-argument` erkennen und eine verständliche
Meldung samt Export-Empfehlung zeigen, statt „Sync fehlgeschlagen".

**Lektion.** Jeder unbegrenzt wachsende Speicher trifft irgendwann eine harte
Grenze. Rechne einmal aus, wann — dann weißt du, ob es dein Problem ist.

---

## Muster über alle Fehler hinweg

Wenn man die 20 behobenen Fehler nach Ursache sortiert, bleiben **fünf
wiederkehrende Muster**. Das sind die Fragen, die beim nächsten Feature zuerst
gestellt werden sollten:

| # | Muster | Betroffen | Frage beim nächsten Mal |
|---|---|---|---|
| 1 | **Kontextverwechslung beim Escaping** | PB-001, PB-018, PB-019, PB-042 | In welchem Kontext landet dieser String — und in wie vielen gleichzeitig? |
| 2 | **Identität aus Inhalt abgeleitet** | PB-002, PB-003, PB-016, PB-020 | Was ist die stabile Identität dieses Objekts, unabhängig von seinem Inhalt und seiner Position? |
| 3 | **Zwei Quellen für dieselbe Wahrheit** | PB-005, PB-013, PB-017, PB-024 | Gibt es diese Tabelle/Definition/CSS-Regel schon woanders? |
| 3b | **Fernwirkung auf Nachfahren** | PB-024, PB-032 | Welche Vorfahren-Eigenschaft (overflow, transform, filter, Spezifität) wirkt hier hinein? |
| 4 | **Neuer Datentyp in alte Rechenwege** | PB-004, PB-029, PB-031, PB-046 | Wer alles liest dieses Feld — und stimmt die Rechnung für den neuen Fall? |
| 5 | **Zustand außerhalb des Modells** | PB-006, PB-007, PB-008, PB-020, PB-025 | Wo lebt dieser Zustand — und überlebt er Reload, Re-Render, Nebenläufigkeit und asynchrone APIs? |
| 6 | **Stille Datenvernichtung** | PB-002, PB-010, PB-011, PB-012, PB-030, PB-040 | Was geht hier verloren, und weiß der Nutzer es? |
| 7 | **Plattformverhalten mit dem falschen Schalter bekämpft** | PB-026, PB-027 | Unter welcher *Bedingung* tut die Plattform das — statt: welcher Schalter stellt es ab? |
| 8 | **Reihenfolge- und Rundungsannahmen** | PB-015, PB-028, PB-031, PB-033, PB-047 | Gilt die Invariante auch noch *nach* Runden, Sortieren, Formatieren — und ist die Reihenfolge von Regeln selbst Bedeutung? |
| 9 | **Teil-Umstellung: nur die halbe Sache angefasst** | PB-004, PB-025, PB-034 | Wer sonst hängt an dem, was ich gerade umgestellt habe? |
| 10 | **Bedingung aus einer Verneinung statt aus der Bedeutung** | PB-038 | Prüft diese Bedingung wirklich den Fall, den sie behauptet — oder nur, dass ein anderer Fall nicht vorliegt? |
| 11 | **Gekürzte Beschriftung ohne Eindeutigkeitsprüfung** | PB-039 | Ist das ein Text oder ein Bezeichner? Bezeichner brauchen eine Kollisionsprüfung — und der Fallback gilt für die ganze Menge, nicht für den Einzelfall. |
| 12 | **Ausgabe, die für Menschen nicht prüfbar ist** | PB-041 | Kann ich diesem Ergebnis ansehen, ob es stimmt? Wenn nein: Welche unabhängige Gegenimplementierung prüft es — und reicht eine? |
| 13 | **Anzeige, die nur bei der aktuellen Datenmenge stimmt** | PB-048 | Stimmt das auch bei drei statt zwei, bei Wiederholungen, bei null? Oder beschreibt es nur zufällig den Ist-Zustand? |

Bemerkenswert: **Vier Fehler entstanden beim Verbessern anderer Dinge.**
PB-018 kam als Fix von PB-001 herein, PB-020 ist PB-008 in einer anderen
Dimension, PB-024 wurde beim Ergänzen einer Animation eingebaut, PB-025 beim
Modernisieren des Screenwechsels. Keiner davon wurde durch Nachdenken gefunden:

| Fehler | Gefunden durch |
|---|---|
| PB-018, PB-020 | Fuzzer |
| PB-024 | Screenshot angesehen |
| PB-025 | **ein bestehender Regressionstest zu einem anderen Fehler** |

PB-025 ist dabei der beste Beleg für den Nutzen des Registers: Der Test zu
PB-024 prüft Balkenhöhen und hat damit eine völlig unabhängige Timing-Änderung
gefangen.

Daraus folgen die drei Regeln, die `/check` durchsetzt:

1. **Jeder Fix und jede Verbesserung ist selbst ein Änderungsrisiko.** Nach
   dem Umbau volle Runde, nicht nur den einen Test.
2. **Verhaltenstests und Sichtprüfung finden verschiedene Fehlerklassen.**
   Ein Assert sieht keine unsichtbaren Balken; ein Screenshot sieht keine
   Race Condition. Es braucht beides.
3. **Aus dem Register vorwärts lernen, nicht nur rückwärts.** PB-029 und
   PB-030 sind Tests für Fehler, die nie passiert sind — sie entstanden aus
   der Frage, welches bekannte Muster auf das neue Feature zutreffen könnte.

> Das ist die eigentliche Begründung für dieses Register: Nicht die Fehler
> sind das Wertvolle, sondern die Muster dahinter — und der Beweis, dass ein
> Test sie findet, wenn der Kopf sie übersieht.
