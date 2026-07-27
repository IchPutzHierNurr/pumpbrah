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
| [PB-049](#pb-049) | Trizepsübung zählte auf den Bizeps | mittel | Klassifikation | ✅ |
| [PB-050](#pb-050) | Einseitige Übungen zählten einfach statt doppelt | mittel | Berechnung | ✅ |
| [PB-051](#pb-051) | Zwei Trendrechnungen widersprachen sich sichtbar | mittel | Berechnung | ✅ |
| [PB-052](#pb-052) | Onboarding warf vier von acht Antworten weg | mittel | Funktion | ✅ |
| [PB-053](#pb-053) | „Klimmzüge" zählten als Rudern | mittel | Klassifikation | ✅ |
| [PB-054](#pb-054) | Mesozyklus — Test vor dem Fehler | — | Vorbeugung | ✅ |
| [PB-055](#pb-055) | Scheibenrechner rundete den Rest, Summe ging nicht auf | niedrig | Berechnung | ✅ |
| [PB-056](#pb-056) | CSV-Export — Test vor dem Fehler | — | Vorbeugung | ✅ |
| [PB-057](#pb-057) | Supersätze — Test vor dem Fehler | — | Vorbeugung | ✅ |
| [PB-058](#pb-058) | Zeitbudget — Test vor dem Fehler | — | Vorbeugung | ✅ |
| [PB-059](#pb-059) | Autoregulation — Test vor dem Fehler | — | Vorbeugung | ✅ |
| [PB-060](#pb-060) | Stagnations-Aktionen — Test vor dem Fehler | — | Vorbeugung | ✅ |
| [PB-061](#pb-061) | „Satz loggen" passte nicht auf den Bildschirm | **hoch** | iOS / Layout | ✅ |
| [PB-062](#pb-062) | Einklappbare Abschnitte — Test vor dem Fehler | — | Vorbeugung | ✅ |
| [PB-063](#pb-063) | Der Scheibenrechner öffnete hinter dem Log-Dialog | mittel | Darstellung | ✅ |
| [PB-064](#pb-064) | Kaputter Plan-Code erzeugte eine unbehandelte Ablehnung | niedrig | Fehlerbehandlung | ✅ |
| [PB-065](#pb-065) | Supersatz-Kennung blieb allein zurück | mittel | Datenmodell | ✅ |
| [PB-066](#pb-066) | Vier weitere Sheets hatten das Tastaturproblem aus PB-061 | **hoch** | iOS / Layout | ✅ |
| [PB-067](#pb-067) | Cloud-Anmeldung — Test vor dem Fehler | — | Vorbeugung | ✅ |
| [PB-068](#pb-068) | Zwei Geräte auf einem Konto — Test vor dem Fehler | — | Vorbeugung | ✅ |
| [PB-069](#pb-069) | Gleichzeitiges Schreiben verlor einen Satz (PB-022) | **hoch** | Datenverlust | ✅ |
| [PB-070](#pb-070) | Zurücksetzen — Test vor dem Fehler | — | Vorbeugung | ✅ |
| [PB-071](#pb-071) | Der Erst-Sync beim Anmelden überschrieb fremde Sätze | **hoch** | Datenverlust | ✅ |
| [PB-072](#pb-072) | PB-061 ging in WebKit mal grün, mal rot — eine Uhr im Test | mittel | Testgüte | ✅ |
| [PB-073](#pb-073) | Der Offline-Cache registrierte sich beim neuen Nutzer nie | **hoch** | Zustand | ✅ |
| [PB-074](#pb-074) | Neue Fassung kommt an — Test vor dem Fehler | — | Vorbeugung | ✅ |
| [PB-075](#pb-075) | App läuft ohne Netz — Test vor dem Fehler | — | Vorbeugung | ✅ |
| [PB-076](#pb-076) | Die e1RM-Formel wurde nie auf ihren Wert geprüft | mittel | Testgüte | ✅ |
| [PB-077](#pb-077) | Pausenlängen ließen sich vertauschen, ohne dass es auffiel | mittel | Testgüte | ✅ |
| [PB-078](#pb-078) | Jeder geloggte Satz lud das ganze Dokument hoch | **hoch** | Effizienz | ✅ |
| [PB-021](#pb-021) | Firestore ohne Authentifizierung | **kritisch** | Sicherheit | ⚠️ offen |
| [PB-022](#pb-022) | Read-Modify-Write ohne Transaktion | mittel | Nebenläufigkeit | ✅ |
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

### PB-049

**Eine Trizepsübung zählte auf den Bizeps**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Klassifikation / Berechnung |
| **Gefunden** | im Plan eines Nutzers, nach der Aufteilung in neun Volumengruppen |
| **Status** | ✅ behoben |

**Symptom.** Eine Übung namens „Extensions Kabel" mit Muskel `arms` wurde als
**Bizepsarbeit** gezählt. Im Coach stand dadurch drei Curl-Übungen an einem
Tag, während der Trizeps unter MEV lag — beides falsch.

**Ursache.** Der Name traf **keine einzige** Regel der Mustertabelle. Danach
greift der Fallback:

```js
const byMuscle={legs:'squat',back:'row',chest:'push',shoulders:'raise',arms:'curl',core:'core'};
```

Für `arms` ist das eine Münze mit zwei gleichen Seiten: Jede unbekannte
Armübung wird ein Curl. Solange „Arme" ein gemeinsamer Topf war, fiel das
nicht auf — die Sätze landeten so oder so am selben Zähler. Mit der Trennung
in Bizeps und Trizeps (siehe `docs/EVIDENZ.md`) wurde aus einer ungenauen
Marke ein **falscher Volumenwert**.

**Fix.** `extensions?` in die `triext`-Regel aufgenommen. Sie steht hinter
`hinge`, `legext` und `legcurl`, deshalb bleiben „Leg Extension" (Quadrizeps),
„Back Extension" und „Hyperextension" (Hüftbeuge) unberührt — die
Gegenproben stehen im Test.

**Lektion.** Ein Fallback ist eine stille Annahme. Solange sein Ergebnis nur
ein Icon steuert, ist eine falsche Annahme kosmetisch. Sobald dasselbe
Ergebnis in eine Rechnung eingeht, wird sie zu einem Fehler — und zwar zu
einem, den niemand sucht, weil an der Stelle nie etwas geändert wurde.
**Wenn ein abgeleiteter Wert neue Bedeutung bekommt, gehören alle seine
Standardpfade neu geprüft.**

**Test.** `PB-033` (erweitert) — „Extensions Kabel", „Overhead Extension" und
„Rope Extensions" → `triext`; Gegenproben „Leg Extensions" → `legext`,
„Back Extension" und „Hyperextension" → `hinge`; zusätzlich zwei Proben
direkt auf `volGroupOf(…, 'arms')` → Trizeps bzw. Bizeps.


---

### PB-050

**Einseitige Übungen zählten einfach statt doppelt**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Berechnung |
| **Gefunden** | beim Bauen eines Plans, den die App selbst gegenrechnen sollte |
| **Status** | ✅ behoben |

**Symptom.** „KH Rudern einarmig 4×10" sind vier Sätze **pro Seite**, also acht
Arbeitssätze und die doppelte Arbeitszeit. Die App zählte vier.

**Das Besondere daran:** Das Evidenzblatt derselben App sagte es wörtlich —
*„Einseitige Übung — die Satzangabe gilt pro Seite. Für das Wochenvolumen
zählt sie doppelt."* Der Text war da, das `uni`-Feld im Katalog war da, und die
Rechnung ignorierte beides. Ein Fehler, der nur auffällt, wenn jemand die
eigene Erklärung gegen das eigene Ergebnis hält.

**Fix.** `isUnilateral(name,ex)` — ein explizites Feld schlägt die
Namenserkennung — und `setSides()` als gemeinsamer Faktor in beiden
Volumenpfaden (Plan und Historie) sowie in der neuen Dauerschätzung. Bei der
Zeit verdoppelt sich allerdings nur die **Arbeitszeit**, nicht die Pause: Man
macht beide Seiten und pausiert dann einmal.

**Lektion.** Wenn die App etwas über ihre eigene Rechnung behauptet, ist dieser
Satz ein Testfall. **Erklärtexte sind Spezifikation.**

**Test.** `PB-050` — Plan mit einseitiger und beidseitiger Übung: Volumen 12
statt 8, Zeitschätzung höher, aber nicht doppelt, Historie mit demselben
Maßstab, Erkennung samt Vorrang des expliziten Feldes.

---

### PB-051

**Zwei Trendrechnungen widersprachen sich — sichtbar**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Berechnung / Konsistenz |
| **Gefunden** | im Screenshot, beim Ansehen zweier Ansichten nebeneinander |
| **Status** | ✅ behoben |

**Symptom.** Dieselbe Übung, derselbe Moment: In der Stats-Liste stand
**„Bankdrücken +3,8 kg"**, im Detailblatt **„→ Stagnation"**.

**Ursache.** Zwei Funktionen für dieselbe Frage. `exerciseProgress` vergleicht
das beste e1RM der letzten drei **Einheiten** mit dem der drei davor.
`getExTrend` verglich die letzten drei **Sätze** über das rohe Gewicht, mit
einer 2-%-Schwelle. Bei zwei Sätzen pro Einheit vergleicht das anderthalb
Trainings gegen anderthalb — bei +1 kg pro Einheit bleibt der Unterschied unter
der Schwelle und heißt „Stagnation".

**Fix.** `getExTrend` delegiert an `exerciseProgress`. Eine Rechnung, eine
Wahrheit — auch für die Deload-Erkennung, die ebenfalls daran hängt.

**Lektion.** Zwei Implementierungen derselben Frage sind kein Redundanz-,
sondern ein Konsistenzproblem. Sie fallen erst auf, wenn beide Ergebnisse
**gleichzeitig sichtbar** sind — deshalb ist „zwei Ansichten nebeneinander
ansehen" eine eigene Prüfmethode.

**Test.** `PB-051` — acht Einheiten mit +1 kg und zwei Sätzen je Einheit, also
genau die Konstellation, in der die alte Rechnung scheiterte: Liste und Detail
müssen dieselbe Richtung melden.

---

### PB-052

**Das Onboarding warf vier von acht Antworten weg**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Funktion / Versprechen |
| **Gefunden** | beim Durchsehen des eigenen Codes auf offene Punkte |
| **Status** | ✅ behoben |

**Symptom.** Acht Fragen: Geschlecht, Geburtstag, Größe, Gewicht,
**Trainingsort, Tage pro Woche, Ziel, Erfahrung**. Verwendet wurden vier. Die
letzten vier landeten in `obData` und wurden nie gelesen — jeder bekam
denselben Standardplan, egal ob zweimal die Woche zu Hause oder sechsmal im
Studio.

**Fix.** Ein Generator, der gegen **dieselben Landmarks** rechnet, an denen der
Coach den Plan später misst: ein Bauplan je Tageszahl, ein Übungspool getrennt
nach Studio und Zuhause, Zielvolumen je Muskel aus Erfahrung (wo im Korridor)
und Ziel (welche Gruppe mehr bekommt). Die Satzverteilung ist ein Fixpunkt über
drei Runden, weil indirektes Volumen von den Satzzahlen abhängt, die es selbst
mitbestimmt. Ein Zeitdeckel kürzt zu lange Tage — aber nie unter MEV.

**Lektion.** Eine Frage zu stellen ist ein Versprechen. Wer die Antwort nicht
benutzt, sollte nicht fragen; wer fragt, schuldet die Wirkung.

**Test.** `PB-052` — alle 150 Kombinationen aus Tagen × Ort × Erfahrung × Ziel:
richtige Tagesanzahl, kein leerer Tag, keine Übung doppelt, kein Muskel unter
MEV oder über MRV, keine Einheit über 105 Minuten.

---

### PB-053

**„Klimmzüge" zählten als Rudern**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Klassifikation |
| **Gefunden** | durch den Test zu PB-052, an einer erzeugten Home-Variante |
| **Status** | ✅ behoben |

**Symptom.** In der Mustertabelle stand `klimmzug`. Der Plural heißt
**Klimmzüge** — mit Umlaut. Die Regel traf nicht, keine andere auch, und der
Muskel-Fallback machte aus `back` ein `row`: vertikales Ziehen wurde als
horizontales gezählt.

**Fix.** `klimmz` statt `klimmzug`. Wichtiger als der Einzelfall ist die
**strukturelle Absicherung**: Der Test fährt jetzt *jeden* Übungsnamen durch,
den die App selbst mitbringt — Bibliothek, Evidenzkatalog, Standardplan,
Onboarding-Pool, aktuell 145 Namen — und verlangt, dass für jeden eine Regel
greift. Der Fallback ist eine Notbremse für eigene Übungen des Nutzers, kein
Weg für mitgelieferte Namen.

**Lektion.** Dieselbe Fehlerklasse zum dritten Mal (PB-033, PB-047, PB-049).
Nach dem dritten Mal reicht kein Einzelfix mehr: Es braucht einen Test, der die
**ganze Menge** prüft, statt auf den nächsten Namen zu warten. Deutsche
Umlaut-Plurale sind dabei die häufigste Falle — `Klimmzug/Klimmzüge`,
`Überzug/Überzüge`.

**Test.** `PB-053` — kein mitgelieferter Übungsname fällt auf den
Muskel-Fallback zurück.

---

### PB-054

**Mesozyklus — der Test kam vor dem Fehler**

| | |
|---|---|
| **Schwere** | — (vorbeugend) |
| **Klasse** | Vorbeugung |
| **Status** | ✅ abgesichert |

Kein aufgetretener Fehler, sondern ein Test aus einem bekannten Muster:
**PB-030** („Deload reduziert Sätze, lässt den Plan aber unberührt"). Der
Mesozyklus skaliert das Volumen über Wochen — genau die Stelle, an der ein
naiver Ansatz in den Plan schreiben würde. Vier Wochen später wäre das Volumen
dann dauerhaft weg, ohne dass es jemand bemerkt.

**Test.** `PB-054` — über fünf simulierte Wochen: Sätze steigen, die
Entlastungswoche liegt darunter, der Plan bleibt zeichengleich, und ohne
laufenden Zyklus greift kein Faktor.


---

### PB-055

**Der Scheibenrechner rundete den Rest — und die Summe ging nicht mehr auf**

| | |
|---|---|
| **Schwere** | niedrig |
| **Klasse** | Berechnung / Rundung |
| **Gefunden** | vom eigenen Test, beim Durchfahren aller Gewichte von 20 bis 250 kg |
| **Status** | ✅ behoben |

**Symptom.** 21,25 kg auf einer 20-kg-Stange sind 0,625 kg pro Seite — nicht
darstellbar. Der Rechner rundete diesen Rest auf 0,63, und damit ergaben
Scheiben plus Stange 21,26 kg statt 21,25.

**Warum das zählt.** Ein Rechner, dessen Summe nicht aufgeht, ist im Studio
schlimmer als keiner: Man legt auf und wundert sich über die Differenz zum
Logbuch. Gerundet wird jetzt erst beim Anzeigen, nie in der Rechnung.

**Lektion.** Rundung gehört an die Oberfläche, nicht in die Zwischenschritte.
Der Fehler war beim Blick auf das Ergebnis unsichtbar — gefunden hat ihn erst
die Invariante „Scheiben + Stange = Zielgewicht", über den ganzen Bereich
geprüft statt an drei Beispielen.

**Test.** `PB-055` — vier Einzelfälle mit eindeutiger Lösung plus ein Durchlauf
von 20 bis 250 kg in 1,25-kg-Schritten: Summe stimmt exakt, der nicht
darstellbare Rest ist immer kleiner als die kleinste Scheibe, Reihenfolge
absteigend.

---

### PB-056

**CSV-Export — Test vor dem Fehler**

| | |
|---|---|
| **Schwere** | — (vorbeugend) |
| **Klasse** | Vorbeugung |
| **Status** | ✅ abgesichert |

Ein Semikolon oder Zeilenumbruch in einer Notiz verschiebt in einer CSV alle
folgenden Spalten — **still**, erst in der Tabelle fällt es auf. Der Test
schreibt deshalb genau solche Zeichen in Übungsname und Notiz und zählt
danach die Spalten außerhalb von Anführungszeichen; außerdem BOM (sonst
zerlegt Excel die Umlaute) und Dezimalkomma.

**Test.** `PB-056`

---

### PB-057

**Supersätze sparen Pause, nicht Volumen**

| | |
|---|---|
| **Schwere** | — (vorbeugend) |
| **Klasse** | Vorbeugung |
| **Status** | ✅ abgesichert |

Der Zweck der Kopplung ist Zeit: dieselben Sätze, eine gemeinsame Pause. Ein
Supersatz, der nebenbei das Volumen verändert, wäre ein heimlicher
Volumenschnitt — dieselbe Klasse wie PB-030 (Deload) und PB-054 (Mesozyklus).
Zusätzlich prüft der Test die Kopplungsregel: zwei schwere Grundübungen dürfen
nicht gekoppelt werden, zwei Übungen derselben Volumengruppe auch nicht.

**Test.** `PB-057`

---

### PB-058

**Das Zeitbudget kürzt von der richtigen Seite**

| | |
|---|---|
| **Schwere** | — (vorbeugend) |
| **Klasse** | Vorbeugung |
| **Status** | ✅ abgesichert |

Wer selbst kürzt, hört hinten auf — und hinten stehen Arme, Waden und Rumpf.
Nach drei solchen Wochen fehlt genau dort das Volumen. Die Funktion muss
deshalb nachweisbar anders kürzen: Grundübungen zuletzt, nie unter zwei Sätze,
und der Plan bleibt unberührt.

**Test.** `PB-058`

---

### PB-059

**Autoregulation reagiert auf RIR, aber nicht auf Rauschen**

| | |
|---|---|
| **Schwere** | — (vorbeugend) |
| **Klasse** | Vorbeugung |
| **Status** | ✅ abgesichert |

RIR wurde bis jetzt nur protokolliert. Die Vorgabe für den nächsten Satz zieht
ihn jetzt heran — aber erst ab einer ganzen Stufe Abweichung. Ohne diese
Schwelle würde jede Selbsteinschätzung die Vorgabe verschieben, und die
Zielzahl wäre nicht mehr wiederzuerkennen.

**Test.** `PB-059` — RIR 0 senkt das Gewicht, RIR 2 (Ziel) und RIR 3 lassen
die normale doppelte Progression stehen, RIR 4 gibt zwei Wiederholungen statt
einer.

---

### PB-060

**Stagnations-Aktionen greifen in den Plan und lassen die Historie**

| | |
|---|---|
| **Schwere** | — (vorbeugend) |
| **Klasse** | Vorbeugung |
| **Status** | ✅ abgesichert |

Drei Handgriffe gegen eine stagnierende Übung — tauschen, Wiederholungsbereich
verschieben, einen Satz zurücknehmen — verändern alle den **Plan**. Keiner
davon darf geloggte Sätze anfassen: Die Historie ist das einzige, was sich
nicht wiederherstellen lässt. Der Test prüft zusätzlich, dass ein Aufruf mit
einem Namen, der in keinem Trainingstag steht, nicht abstürzt.

**Test.** `PB-060`


---

### PB-061

**„Satz loggen" passte nicht auf den Bildschirm**

| | |
|---|---|
| **Schwere** | **hoch** — betrifft die Handlung, die man pro Training 25-mal macht |
| **Klasse** | iOS / Layout |
| **Gefunden** | vom Nutzer, beim Loggen am Gerät |
| **Status** | ✅ behoben |

**Symptom.** Das Sheet war **590 px** hoch. Auf einem iPhone SE (667 px) füllte
es fast den ganzen Bildschirm und scrollte intern; mit eingeblendeter Tastatur
lag der Speichern-Knopf **290 px unter der Kante** — unerreichbar, ohne im
Sheet zu scrollen, während die Tastatur die Sicht nimmt.

**Zwei Ursachen, beide strukturell:**

1. **Die Tastatur bekam Platz an der falschen Stelle.** Die Ausweichlogik
   setzte `--kb` als zusätzliches **Padding am Sheet**. Das Sheet wuchs damit
   nach unten *hinter* die Tastatur, statt darüber zu rutschen. Jetzt bekommt
   der **Container** das Padding (das Sheet sitzt an dessen unterem Rand) und
   die Maximalhöhe schrumpft um dieselbe Strecke.
2. **Der Inhalt war zu üppig für seinen Zweck.** Übungsname, Cue, „letztes
   Mal", PR, geschätztes 1RM, Zielvorgabe und die Demo-Vorschau standen in
   je einer eigenen Zeile — 168 von 590 Pixeln allein für Kontext. Zusammen-
   gefasst zu einer Kopfzeile mit Vorschaubild und einer einzeiligen
   Zielvorgabe: **40 statt 168**.

**Dazu drei Maßnahmen, die für alle Sheets gelten:**

* Die Hauptaktion sitzt in einer **klebenden Aktionszeile** am unteren Rand des
  Sheets. Ein Dialog, dessen Bestätigen-Knopf man suchen muss, ist auf einem
  Telefon kein Dialog.
* Bei offener Tastatur blendet das Log-Sheet aus, was gerade nicht gebraucht
  wird (Kopfzeile, Notizfeld, Begründungstext, Zweitaktion) — sonst deckt die
  Aktionszeile genau die Felder zu, um die es geht.
* Die Notiz klappt auf Wunsch auf, statt dauerhaft eine Zeile zu kosten.

**Ergebnis.** 590 → **484 px**. Ohne Tastatur passt alles auf einen Bildschirm,
auch auf dem kleinsten iPhone. Mit Tastatur bleiben Zielvorgabe, beide Felder,
RIR und der Speichern-Knopf sichtbar.

**Lektion.** „Weicht der Tastatur aus" ist keine Eigenschaft, die man einmal
einbaut und abhakt — sie gilt pro Dialog und pro Bildschirmgröße. Und ein
Formular, das auf dem Entwicklungsgerät passt, sagt nichts über das kleinste
Gerät, auf dem es benutzt wird.

**Test.** `PB-061` — drei iPhone-Größen (SE, 14, 15 Pro Max) × fünf Sheets:
Ohne Tastatur darf kein Sheet höher sein als der Bildschirm; mit simulierter
Tastatur (336 px) muss die Hauptaktion sichtbar bleiben; Sheets mit
Eingabefeldern brauchen eine klebende Aktionszeile. Beim Bauen hat außerdem
der bestehende Test **PB-026** zugeschlagen: Das neue Notizfeld hatte 13,3 px
und hätte iOS beim Fokussieren hineinzoomen lassen.


---

### PB-062

**Einklappbare Abschnitte — Test vor dem Fehler**

| | |
|---|---|
| **Schwere** | — (vorbeugend) |
| **Klasse** | Vorbeugung |
| **Status** | ✅ abgesichert |

Der Zustand eines eingeklappten Abschnitts liegt in `D.ui`, nicht in einer
Modulvariablen — sonst klappt bei jedem Reload alles wieder auf und die
Einstellung fehlt auf dem zweiten Gerät. Die Volumenkarte trägt eingeklappt
zusätzlich eine Kurzfassung; ohne sie müsste man aufklappen, nur um zu sehen,
ob überhaupt etwas fehlt — dann hätte das Einklappen nichts gebracht.

**Test.** `PB-062` — Zustand gespeichert, Rumpf versteckt, Kurzfassung
vorhanden, Karte messbar kleiner, Zustand überlebt ein Neuzeichnen.

---

### PB-063

**Der Scheibenrechner öffnete sich hinter dem Log-Dialog**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Darstellung / Schichtung |
| **Gefunden** | vom Nutzer, beim Umrechnen mitten im Satz |
| **Status** | ✅ behoben |

**Symptom.** Ruft man den Scheibenrechner aus „Satz loggen" auf, erscheint er
**hinter** dem Dialog, aus dem man ihn gerade geöffnet hat. Man muss erst den
Log-Dialog schließen, um den Rechner zu sehen — und danach den Satz neu
öffnen.

**Ursache.** Beide Sheets liegen auf `z-index: 200`. Bei Gleichstand
entscheidet die **Dokumentreihenfolge**, und `m-plates` steht im Markup vor
`m-log`. Die Reihenfolge im Dokument war damit die Rangfolge auf dem
Bildschirm — obwohl sie über die Zeit nur davon abhing, wo neue Dialoge
eingefügt wurden.

**Fix.** Ein Zähler in `om()` vergibt beim Öffnen die nächsthöhere Ebene;
`cm()` räumt sie wieder ab und setzt den Zähler zurück, sobald kein Sheet mehr
offen ist. Sheets stapeln sich damit in der Reihenfolge, in der man sie
öffnet.

**Dazu der fehlende Rückweg.** Aus dem Log-Dialog heraus zeigt der Rechner
jetzt „Gewicht übernehmen" — er schreibt das Ergebnis ins Gewichtsfeld und
schließt sich, der Satz-Dialog steht mit den restlichen Eingaben noch da.
Vorher hätte man die Zahl abgelesen und daneben noch einmal eingetippt.

**Lektion.** Wenn zwei Elemente denselben `z-index` haben, ist die
Stapelreihenfolge ein **Nebenprodukt der Dateistruktur**. Das fällt erst auf,
wenn zwei davon gleichzeitig offen sind — bei Dialogen also erst, wenn einer
den anderen aufruft.

**Test.** `PB-063` — Rechner aus dem Log-Dialog: beide offen, Rechner obenauf,
Übernehmen schreibt zurück und lässt den Log-Dialog stehen; ohne Log-Kontext
erscheint der Rückweg-Knopf gar nicht erst.

---

### PB-064

**Ein kaputter Plan-Code erzeugte eine unbehandelte Promise-Ablehnung**

| | |
|---|---|
| **Schwere** | niedrig |
| **Klasse** | Fehlerbehandlung / asynchrone Ränder |
| **Gefunden** | vom Fuzzer, nachdem der Import überhaupt erst in den Fuzzer aufgenommen wurde |
| **Status** | ✅ behoben |

**Symptom.** Fügt man einen halb kopierten Plan-Code ein, erscheint die
richtige Meldung („Code nicht lesbar") — und **daneben** ein
`Uncaught (in promise): Compressed input was truncated` in der Konsole.
Sichtbar war der Fehler nur dort; funktional lief alles korrekt weiter.

**Ursache.** Das Dekomprimieren läuft über einen Stream:

```js
const w=ds.writable.getWriter();
w.write(bytes);w.close();                 // zwei Promises, beide ignoriert
bytes=await new Response(ds.readable).arrayBuffer();   // dieses wird gefangen
```

`write()` und `close()` liefern **eigene** Promises. Bei abgeschnittenem Input
schlägt der Strom fehl, und *alle drei* lehnen ab. Der `try/catch` um den
`await` fängt genau eines davon. Die anderen beiden haben keinen Handler und
werden zu unbehandelten Ablehnungen.

**Fix.** `w.write(bytes).catch(()=>{}); w.close().catch(()=>{});` — die
Ablehnung wird bewusst verworfen, weil der aussagekräftige Fehler eine Zeile
tiefer aus dem `Response`-Aufruf kommt und dort in eine Nutzermeldung
übersetzt wird. Dieselbe Stelle gab es beim Komprimieren; auch dort korrigiert,
obwohl sie in der Praxis kaum auslöst.

**Warum das nicht kosmetisch ist.** Eine unbehandelte Ablehnung ist ein Fehler
ohne Empfänger. Heute steht sie nur in der Konsole; sobald jemand
`window.onunhandledrejection` einhängt — für Absturzberichte, für einen
Fehler-Banner — wird aus einem korrekt behandelten Nutzerfehler eine gemeldete
Störung. Und der Weg dahin ist kurz.

**Lektion.** Eine asynchrone API kann **mehr Promises zurückgeben, als der
Aufruf sichtbar macht**. Bei Streams ist die Regel: jedes zurückgegebene
Promise braucht einen Handler, auch das, dessen Ergebnis niemanden
interessiert. `await` auf eines davon deckt die anderen nicht mit ab.

**Test.** `PB-064` — vier Arten kaputter Codes (abgeschnitten, falsches
Base64, gültiges Base64 mit Müllinhalt, leer) durch `startPlanImport`; danach
darf die Fehlerliste des Harnesses leer und die Vorschau geschlossen sein.

---

### PB-065

**Eine Supersatz-Kennung blieb allein zurück**

| | |
|---|---|
| **Schwere** | mittel |
| **Klasse** | Datenmodell / Beziehung ohne Hüter |
| **Gefunden** | vom Fuzzer, Iteration 673, nach `swapCommit` |
| **Status** | ✅ behoben |

**Symptom.** Nach dem Tauschen einer Übung, die Teil eines Supersatzes war,
trug die Partnerübung weiter die Marke „A" — für einen Wechsel mit einer
Übung, die es nicht mehr gab. Dasselbe beim Löschen des Partners aus dem Plan
und bei Plänen, die per Import oder Cloud-Merge hereinkamen.

**Ursache.** `ex.ss` ist ein String, und **ein String weiß nichts von seinem
Gegenüber**. Die Kopplung existierte nur als übereinstimmender Wert in zwei
Objekten; kein Code war dafür zuständig, dass es zwei bleiben. `commitSwap`
baute die neue Übung aus den Feldern der Alternative zusammen — `ss` war
darunter nicht, also fiel es weg. Drei weitere Wege (Löschen, Import,
Merge) hätten dasselbe getan.

**Fix, zweistufig:**

1. **Die Absicht.** `commitSwap` nimmt die Kennung mit. Wer eine Übung im
   Supersatz austauscht, will weiter im Wechsel arbeiten. Nur wenn die alte
   Übung mit geloggten Sätzen stehen bleibt, behält *sie* die Kennung — sonst
   stünden drei Übungen in einem Zweier-Supersatz.
2. **Das Netz darunter.** `pruneLoneSupersets()` in `normalizeData()`, also
   bei **jedem** `save()`: eine Kennung, die nur einmal vorkommt, wird
   entfernt. Das greift auch für die Wege, die nichts vom Supersatz wissen —
   fremde Pläne aus dem Import eingeschlossen.

**Warum beides.** Nur Schritt 2 hätte die Invariante ebenfalls gehalten, aber
die Kopplung beim Tauschen still gelöscht — Muster 6, stille
Datenvernichtung. Nur Schritt 1 hätte den einen bekannten Weg repariert und
die drei unbekannten offen gelassen.

**Was der Zufall dabei half.** Die Rechnung war nie betroffen:
`remainingMinutes()` gruppiert nach Kennung, und eine Einergruppe kostet
`rest + 25 s × max(0, n−1)` = genau dasselbe wie keine Gruppe. Der Schaden lag
allein in der Anzeige — eine Kopplung behaupten, die es nicht gibt.

**Lektion.** Eine Beziehung zwischen zwei Objekten, die nur als
übereinstimmender Wert existiert, braucht **eine Stelle, die sie durchsetzt**.
Sonst muss jeder Weg, der eines der beiden Objekte anfasst, von der Beziehung
wissen — und einer weiß es nie.

**Test.** `PB-065` — koppeln, Partner löschen; neu koppeln, Partner im
laufenden Workout tauschen (die Kopplung muss den Tausch **überleben**);
zuletzt eine einsame Kennung von Hand setzen und speichern. Dazu die
Fuzz-Invariante „Supersatz-Kennungen bleiben paarweise" nach jeder der 89
Operationen.

---

### PB-066

**Vier weitere Sheets hatten genau das Problem, das PB-061 behoben hatte**

| | |
|---|---|
| **Schwere** | hoch |
| **Klasse** | iOS / Layout — und Testreichweite |
| **Gefunden** | beim Ausweiten des PB-061-Tests von 5 auf 20 Sheets |
| **Status** | ✅ behoben |

**Symptom.** Auf einem iPhone SE (375 × 667) mit eingeblendeter Tastatur lag
der Bestätigen-Knopf außerhalb des Bildschirms — bei **„Übung hinzufügen"**
(587 px, sichtbar bis 331) und **„Trainingstag anlegen"** (413 px). Zwei
weitere Formulare, **„Plan importieren"** und der **Bibliotheks-Editor**,
hatten keine klebende Aktionszeile und wären beim nächsten längeren Inhalt
genauso gelaufen.

**Ursache.** Nicht der Code — der **Test**. PB-061 hat das Problem für
„Satz loggen" korrekt behoben, und der zugehörige Regressionstest prüfte
danach fünf Sheets. Die App hat zwanzig. Fünfzehn davon standen in keiner
Prüfliste, also war „PB-061 grün" eine Aussage über 25 % der Dialoge, die
sich wie eine Aussage über alle las.

**Fix.** `.sheet-cta` um die Aktionszeile von `m-add`, `m-planday` und
`m-import`. Derselbe Mechanismus wie bei PB-061, keine neue Technik.

**Beim Bibliotheks-Editor war er die falsche Lösung.** Dort steht der
Speichern-Knopf *in* der Formularkarte, und danach kommen noch Suchfeld und
Übungsliste. `position: sticky` klebt nur, solange sein Elternteil im Bild
ist — der Knopf hing also mitten im Sheet statt unten. Ein Screenshot zeigte
das sofort, die Zahl im Test nicht. Hier gilt ein anderer Vertrag: nicht
Kleben, sondern **Nähe** — der Knopf steht 20 px unter dem letzten Feld, beide
sind immer zusammen sichtbar. Der Test kennt dafür jetzt eine dritte Sorte
Sheet (`inline`) und misst den Abstand statt der absoluten Position.

**Und ein zweiter Fund aus demselben Screenshot.** Die Wochentagsleiste in
„Trainingstag anlegen" hatte `flex-wrap: wrap` und `min-width: 48px`. Bei
375 px passen damit nur sechs Chips in die Zeile — der **Sonntag** rutschte in
Zeile zwei und stand dort hinter der frisch eingebauten klebenden
Aktionszeile. Ein Wochentag, den man wegscrollen muss, ist ein Wochentag, den
niemand findet. Die Chips teilen sich jetzt die Breite (`flex: 1 1 0`) und
stehen von 320 px an in einer Zeile.

**Der eigentliche Fix ist der Test.** Er deckt jetzt alle zwanzig Sheets ab
und trennt dabei zwei Sorten:

* **Formular** — man tippt und schließt mit einer Aktion ab. Voller Vertrag:
  klebende Aktionszeile, Hauptaktion trotz Tastatur erreichbar.
* **Auswahl** — man tippt höchstens einen Suchbegriff und tippt dann auf einen
  Listeneintrag. Eine klebende Aktionszeile wäre hier eine Leerzeile.

Dazu eine Vollständigkeitsprüfung: Der Test liest alle `.mbg`-Elemente aus dem
Dokument und schlägt fehl, wenn eines davon nicht in seiner Liste steht. Ein
neu gebautes Sheet kann nicht mehr stillschweigend ungeprüft bleiben.

**Lektion.** Ein grüner Test ist nur so viel wert wie seine **Reichweite**.
Nach einem Fix lautet die Frage nicht „läuft der Test?", sondern „**wie viele
gleichartige Stellen gibt es, und prüft der Test sie alle?**" Wo die Antwort
eine Liste ist, gehört eine Vollständigkeitsprüfung dazu — sonst misst der
Test den Stand am Tag seiner Entstehung.

**Zweite Lektion, aus dem Bibliotheks-Editor und dem Sonntag:** Der Fix zu
einem Layoutfehler ist selbst ein Layoutfehler-Risiko. Beide Folgeprobleme
entstanden **durch** die klebende Aktionszeile, und beide hat kein Assert
gesehen — nur ein angeschauter Screenshot. Nach einem Layoutfix gilt: einmal
hinsehen, nicht nur nachmessen.

**Test.** `PB-061` (erweitert) — 20 Sheets × 3 Bildschirmgrößen, Höhe ohne
Tastatur, Hauptaktion mit Tastatur, klebende Aktionszeile bei Formularen,
Abstand Feld↔Aktion bei `inline`-Sheets, Wochentagsleiste einzeilig und ohne
abgeschnittene Beschriftung, plus Abgleich gegen alle `.mbg` im Dokument.

---

### PB-067 bis PB-070

**Der Sync bekommt Tests — durch eine gefälschte Firestore**

| | |
|---|---|
| **Schwere** | — (PB-067, PB-068, PB-070: Vorbeugung) · **hoch** (PB-069) |
| **Klasse** | Nebenläufigkeit / Datenverlust |
| **Gefunden** | beim Schließen der Lücke, die der Abdeckungs-Audit benannt hatte |
| **Status** | ✅ |

**Der Anlass.** Nach dem Audit (PB-064 ff.) blieben acht Funktionen als „nicht
prüfbar" stehen — fast alle rund um Firebase. Der Grund war banal und
peinlich: `db` ist nur gesetzt, wenn das SDK von einem CDN geladen wurde. Unter
`file://` ohne Netz passiert das nie, also nahm `initFirebase()` **immer** den
`catch`-Zweig und `queueCloudSave()` kehrte in Zeile eins zurück. Tausende
Fuzz-Runden über eine Funktion, die nichts tat.

**Die Lösung war kleiner als erwartet.** Die App berührt vom SDK **sieben**
Methoden:

```
firebase.initializeApp · firebase.firestore
db.collection(c).doc(id) → .get() · .set() · .delete() · .onSnapshot()
```

Eine Nachbildung davon (`test/fakestore.mjs`) ist kürzer als ihre Begründung.
Der Store liegt in **Node**, nicht in der Seite — nur so teilen zwei
Browser-Contexts ihn wirklich, und genau das braucht der interessante Test.
`onSnapshot`-Benachrichtigungen werden **nicht** automatisch zugestellt,
sondern gesammelt und per `flush()` freigegeben: die spannenden Fehler stecken
in einer *bestimmten* Verschränkung von Lesen und Schreiben, und die muss ein
Test bauen können, statt auf sie zu hoffen.

**Was dabei herauskam.**

| | |
|---|---|
| **PB-067** | Anmelden mit unbekanntem Namen → Onboarding, nicht in die App · Plan landet in der Cloud · das Profilbild **nicht** (`cloudSafeSnapshot`) · Abmelden meldet den Beobachter ab und lässt lokale Daten stehen · Wiederkommen holt die Historie zurück |
| **PB-068** | Zwei Geräte, ein Konto: B bekommt A's Plan ohne Onboarding, beide loggen Eigenes, danach hat **jede** Seite und die Cloud beide Sätze |
| **PB-069** | **Der Fund.** Absichtlich gebaute Verschränkung → ein Satz verschwand aus der Cloud und kam nicht zurück. Das ist PB-022, erstmals reproduziert statt nur vermutet. |
| **PB-070** | `resetAll` löscht wirklich beides — lokalen Speicher *und* das Cloud-Dokument |

**Der Fix zu PB-069** steht bei [PB-022](#pb-022): `db.runTransaction()`. Der
Wettlauf verlor je nach Timing mal den Satz des einen, mal den des anderen
Geräts — beide Richtungen in der Gegenprobe gesehen.

**Die wichtigste Zeile im Test steht nicht im Vertrag, sondern im Nachweis:**

```js
if (!fs.ops('tx-conflict').length) return [false, 'Kein Konflikt aufgetreten
  — die Verschränkung wurde nicht getroffen, der Test beweist nichts.'];
```

Ohne sie wäre PB-069 grün geworden, sobald die Verschränkung *nicht* eintritt —
also genau dann, wenn der Test nichts geprüft hat. Ein Nebenläufigkeitstest
muss belegen, dass die Nebenläufigkeit stattgefunden hat. Sonst ist er ein
Zufallsgenerator mit Häkchen.

**Was das Double nicht prüft.** Ob das echte SDK sich so verhält wie die
Nachbildung. Das ist die bewusst gewählte Lücke: die Fehler lagen historisch in
*unserer* Merge-Logik, nicht in Googles Bibliothek. Sobald PB-021 angegangen
wird (Auth + Security Rules), reicht das Double nicht mehr — Rules kann man nur
gegen den echten Emulator testen.

**Und eine Grenze der Umgebung, gemessen statt vermutet.** `location.reload()`
aus der Seite heraus kommt unter `file://` in headless Chromium nie an (kein
`load`-Ereignis nach 8 s, `#login-screen` bleibt null). `doLogout()` und
`resetAll()` werden deshalb aufgerufen und an ihren *beobachtbaren* Wirkungen
geprüft — Beobachter abgemeldet, Speicher geleert, Cloud-Dokument gelöscht —
der Neustart selbst kommt von außen. Auf GitHub Pages über `https` gibt es das
Problem nicht.

**Lektion.** Wenn ein Teil der App „nicht testbar" scheint, ist die nächste
Frage nicht *ob*, sondern **wie klein die Schnittstelle nach draußen ist.** Bei
sieben Methoden ist ein Double billiger als die Ausrede.

---

### PB-071

**Der Erst-Sync beim Anmelden überschrieb die Sätze des anderen Geräts**

| | |
|---|---|
| **Schwere** | hoch |
| **Klasse** | Datenverlust / Nebenläufigkeit |
| **Gefunden** | durch die Geschwisterfrage nach dem Fix von PB-069 |
| **Status** | ✅ behoben |

**Wie er gefunden wurde.** Nicht durch einen Testlauf, sondern durch die Frage,
die Phase 3 des `/check` nach jedem Fix stellt: *wer macht dasselbe noch?*
`startSync()` hat dieselbe Form wie `queueCloudSave()` — lesen, zusammenführen,
schreiben — und schrieb mit einem nackten `ref.set()` zurück.

**Symptom.** Ein zweites Gerät meldet sich am Konto an. Zwischen seinem Lesen
und seinem Zurückschreiben loggt das erste Gerät einen Satz. Der Satz ist weg —
und kommt nicht zurück.

**Warum die Transaktion aus PB-022 nicht half.** Sie schützt den, der sie
benutzt. Ein **blindes `set()` von der anderen Seite überschreibt sie einfach.**
Eine Transaktion sichert nur zu, dass *zwischen ihrem* Lesen und Schreiben
nichts passiert ist — sie kann niemanden daran hindern, danach stumpf
draufzuschreiben. Nebenläufigkeitsschutz ist keine Eigenschaft einer
Funktion, sondern eine Eigenschaft **aller** Schreibpfade auf dasselbe
Dokument. Einer, der nicht mitmacht, hebt alle anderen auf.

**Fix.** Die beiden Rückschreibungen in `startSync()` gehen über
`queueCloudSave()` — damit über die Transaktion und mit einem erneuten
Zusammenführen unmittelbar vor dem Schreiben. Ein Schreibpfad statt zwei.

**Der Nachweis war das eigentliche Stück Arbeit.** Der erste Versuch benutzte
Wartezeiten und war **grün** — und im Protokoll lagen alle Schreibvorgänge des
einen Geräts *vollständig vor* dem Lesen des anderen:

```
tx-commit A · tx-commit A · tx-commit A · get B · set B      ← nichts geprüft
```

Also bekam das Double **Barrieren**: `holdNext({op:['set','tx-commit'], who:'B'})`
hält B's Rückschreiben an, bis der Test es freigibt. Damit wird die
Verschränkung gebaut statt erhofft:

```
get B · hold B · tx-commit A ×3 · released B · set B
Cloud vorher : [altbekannt, mittendrin]
Cloud nachher: [altbekannt, vonB]        ← „mittendrin" ist weg
```

Das `op`-Feld darf ein Array sein, und das ist kein Komfort: Der Fix
verwandelt B's `set` in ein `tx-commit`. Träfe die Barriere nur `set`, würde
sie nach dem Fix nicht mehr zuschnappen — die Gegenprobe wäre dann nicht mehr
dieselbe Prüfung wie der Test.

**Lektion.** Zwei, und die zweite ist die teurere:

1. **Ein Wettlauf-Test ohne Barriere ist ein Zufallsgenerator mit Häkchen.**
   `sleep()` synchronisiert nichts. Wer eine Verschränkung prüfen will, muss
   sie anhalten können — und der Test muss scheitern, wenn die Barriere nicht
   zuschnappt.
2. **Ein Schutz, den nur ein Pfad benutzt, ist kein Schutz.** Nach jedem
   Nebenläufigkeits-Fix gehört ein `grep` über *alle* Schreibstellen desselben
   Ziels. Hier waren es drei: eine war schon transaktional, zwei nicht.

**Test.** `PB-071` — B meldet sich mit eigenen lokalen Daten an, seine
Rückschreibung wird angehalten, A schreibt hinein, dann Freigabe. Danach müssen
**alle drei** Sätze in der Cloud stehen. Der Test scheitert ausdrücklich, wenn
die Barriere nicht zuschnappt oder wenn B noch mit einem nackten `set()`
schreibt.

---

### PB-072

**Derselbe Test ging in WebKit mal grün, mal rot — eine Uhr im Test**

| | |
|---|---|
| **Schwere** | mittel (Testgüte, nicht App) |
| **Klasse** | Zeit als Ersatz für eine Bedingung |
| **Gefunden** | weil zwei Engines widersprachen — CI-Lauf 1 gegen CI-Lauf 2 |
| **Status** | ✅ behoben |

**Der Ablauf, weil er die Lehre trägt.** Der erste CI-Lauf mit WebKit meldete
PB-061 rot: „`m-log`: Knopf bei 590, Limit 331". Chromium lieferte an
derselben Stelle 311 und grün. Die Einordnung schien eindeutig — nur WebKit
rot heißt Engine-Unterschied, also ein iOS-Problem. Und es traf ausgerechnet
den Fehler, den der Nutzer selbst gemeldet hatte.

**Der zweite Lauf war grün.** Über praktisch demselben Code, nur mit
ergänzten Diagnosewerten. Damit war die Aussage „in Safari kaputt" hinfällig,
und die eigentliche Frage eine andere: warum widerspricht sich der Test?

**Ursache.** `.mdl` fährt mit `animation: su .32s` von unten herein
(`translateY(100%)` → `0`). Der Test wartete mit `setTimeout(420)`. Das ist
großzügig gerechnet und trotzdem falsch: in CI teilen sich drei Läufe einen
Rechner, und die Animation startet gelegentlich später. **590 − 311 ist genau
eine Sheet-Höhe** — die Messung fiel mitten ins Einfahren.

Nachgemessen, deterministisch:

| Wartezeit | Knopf bei |
|---|---|
| 0 ms | 591 |
| 50 ms | 591 |
| 150 ms | 247 |
| 250 ms | 276 |
| 420 ms | 276 |
| bis zur Ruhe | **276** (stabil, Limit 331) |

Die 590 aus CI sind exakt der Wert der ersten ~50–150 ms. Und der stabile Wert
liegt **unter** dem Limit: **der PB-061-Fix wirkt auch in WebKit.** Das
Satz-Loggen war auf dem iPhone nie kaputt.

**Fix.** `setTimeout` raus, Bedingung rein: erst alle laufenden Animationen
über die Web Animations API abwarten (`el.getAnimations()`, in beiden Engines
vorhanden), dann messen, bis zwei aufeinanderfolgende Bilder dieselbe
Geometrie liefern. Kommt die Geometrie in 60 Bildern nicht zur Ruhe, meldet
der Test das — statt eine Zahl zu erfinden.

Dazu ein Fehler in meiner eigenen Diagnose, der beinahe zur zweiten Fehlspur
geführt hätte: die Diagnosewerte wurden erhoben, **nachdem** `--kb` schon
zurückgesetzt war. Eine Diagnose, die den Fehlerfall nicht sieht, ist keine.

**Lektion.** Drei, in aufsteigender Wichtigkeit:

1. **Zeit ist kein Ersatz für eine Bedingung.** Jedes `setTimeout` in einem
   Test ist eine Wette auf die Geschwindigkeit der Maschine. Sie geht so lange
   auf, bis der Test auf einem langsameren Rechner läuft.
2. **Ein widersprüchlicher Test ist schlimmer als ein roter.** Rot heißt „hier
   ist etwas". Mal so, mal so heißt „diesem Test kann man nicht glauben" — und
   damit ist auch sein Grün wertlos.
3. **Ein einzelner Fehlschlag ist kein Befund, sondern ein Verdacht.** Ich habe
   nach dem ersten roten Lauf berichtet, das Satz-Loggen sei auf dem iPhone
   kaputt. Das war falsch, und die Korrektur kostete einen zweiten Lauf. Bei
   einer neuen Prüfmethode gehören **mehrere Läufe** vor die Diagnose — die
   Methode ist am Anfang unverdächtiger als das, was sie prüft.

**Test.** `PB-072` — misst dieselbe Stelle einmal ohne und fünfmal mit Warten.
Verlangt beides: dass Warten **nötig** ist (ohne Warten kommt ein anderer Wert)
und dass es **reicht** (fünf Messungen, ein Wert). Fällt jemand auf
`setTimeout` zurück, schlägt der Stabilitätsteil an.

---

### PB-073 bis PB-075

**Der Offline-Cache war für jeden neuen Nutzer tot**

| | |
|---|---|
| **Schwere** | hoch (PB-073) · Vorbeugung (PB-074, PB-075) |
| **Klasse** | Zustand — ein Zuhörer nach dem Ereignis |
| **Gefunden** | beim allerersten Lauf der Offline-Stufe |
| **Status** | ✅ behoben |

**Symptom.** `navigator.serviceWorker.getRegistration()` liefert nichts. Kein
Cache, keine Offline-Fähigkeit. Und zwar nur für Nutzer, die sich **neu**
anmelden — wer wiederkommt, bei dem greift alles.

**Ursache.**

```js
window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
```

Aufgerufen wird das aus `showApp()`. Beim wiederkehrenden Nutzer läuft
`showApp()` während des Seitenaufbaus — da ist `load` noch nicht gefeuert, der
Zuhörer kommt rechtzeitig. Wer sich neu anmeldet, klickt sich erst durch acht
Onboarding-Schritte. Bis `showApp()` kommt, steht `document.readyState` auf
`complete`, und **ein Zuhörer, der sich nach dem Ereignis anmeldet, läuft nie.**

Gemessen, beide Fälle nebeneinander:

| | `readyState` bei `showApp()` | Service Worker |
|---|---|---|
| neuer Nutzer | `complete` | **nicht registriert** |
| wiederkehrender Nutzer | (im Aufbau) | registriert |

**Warum das monatelang niemandem auffiel.** Weil die App online einwandfrei
funktioniert. Der Ausfall zeigt sich ausschließlich ohne Empfang — also
genau in der Situation, für die es den Cache überhaupt gibt, und in der
niemand Lust hat, einen Fehlerbericht zu schreiben. Der Kommentar am Kopf von
`sw.js` beschreibt diese Situation sogar wörtlich („im Keller-Studio").

**Fix.** `if (document.readyState === 'complete') los(); else
window.addEventListener('load', los, { once: true });`

**Ein zweiter Fund beim Lesen derselben Datei.** In `sw.js` stand im
Nicht-Navigations-Zweig `.catch(() => hit)` — und `hit` ist dort zwangsläufig
leer, sonst wäre man gar nicht in diesem Zweig. `respondWith(undefined)`
behandelt der Browser als Netzwerkfehler: zufällig das richtige Verhalten,
aber aus dem falschen Grund. Jetzt steht dort eine echte Antwort (504).

**Warum das eine Wiederholung ist.** PB-008 hieß „Async-Guard vor statt im
Callback". Hier ist es dieselbe Familie: **eine Annahme über den zeitlichen
Ablauf, die nur in einem von zwei Wegen durch die App stimmt.** Beide Male
funktionierte der häufigere Weg, und beide Male fiel der seltenere durch.
Muster 5 im Register, seit Monaten notiert — und trotzdem wieder passiert.
Ein Register verhindert nichts, es macht nur den Rückblick kürzer.

**Was PB-074 und PB-075 absichern**, damit die Strategie in `sw.js` nicht
still kippt:

* **PB-074** — Der Testserver liefert die Seite mit einer Marke im `<head>`
  aus und ändert sie zwischen zwei Aufrufen. Kommt die neue Fassung an? Wäre
  der Cache vor dem Netz, sähe der Nutzer nach jeder Änderung noch die alte
  App — bei einer App aus **einer einzigen Datei** betrifft das jede Änderung.
* **PB-075** — Der Server trennt die Verbindungen hart, realistischer als ein
  sauberes 503. Die App muss trotzdem starten.

**Lektion.** Wenn ein Stück Code nur unter Bedingungen läuft, die der Test
nicht herstellt, ist es unbewiesen — egal wie einfach es aussieht.
`registerServiceWorker` sind sechs Zeilen und stand als „nicht testbar" auf
der Liste. Die Liste war das Problem, nicht die Sechs Zeilen: **„braucht einen
Server" ist kein Grund, es nicht zu prüfen, sondern eine Aufgabe von dreißig
Zeilen.**

**Test.** `PB-073` Registrierung nach dem Onboarding · `PB-074` neue Fassung
kommt an · `PB-075` ohne Netz startet die App. Alle drei gegen einen echten
HTTP-Server (`test/httpserve.mjs`).

---

### PB-076 und PB-077

**Was die Mutationsstichprobe gefunden hat — und was sie über sich selbst verriet**

| | |
|---|---|
| **Schwere** | mittel (fehlende Zusicherungen, keine Fehlfunktion) |
| **Klasse** | Testgüte |
| **Gefunden** | `test/mutate.mjs`, der ersten Mutationsstichprobe |
| **Status** | ✅ behoben |

**Die Idee.** `coverage.mjs` beantwortet „wird diese Funktion aufgerufen?" —
die schwächere Hälfte der Frage. Die stärkere lautet: **würde es auffallen,
wenn sie etwas Falsches täte?** Also eine bewusste Verschlechterung einbauen
und nachsehen, ob irgendein Test rot wird. Überlebt sie, hat man die Adresse
einer fehlenden Zusicherung statt des Gefühls, dass irgendwo eine fehlt.

**Zwei echte Funde aus 18 Mutationen:**

* **PB-076 — die e1RM-Formel.** Der Nenner der Epley-Formel ließ sich von 30
  auf 25 ändern, ohne dass eine der 79 Prüfungen rot wurde. Der Fuzzer ruft
  `calc1RM` auf, prüft aber nur „ist eine endliche Zahl" — und das bleibt sie
  auch falsch. Es ist die Rechnung hinter jedem e1RM-Verlauf, jeder
  PR-Erkennung und jeder Stagnationsmeldung. Jetzt auf Werte geprüft
  (100 kg × 10 Wdh → 133,3) samt Monotonie und Randfällen.
* **PB-077 — die Pausenlängen.** Grundübung und Isolation ließen sich
  vertauschen, ohne dass etwas ansprang. Eine der wenigen Einstellungen, die
  der Nutzer selbst setzt; die falsche Zuordnung fällt erst im Studio auf.
* **Nachgetragen an PB-028 — die Aufwärmrampe.** Der Test sicherte nur ab,
  dass die Rampe nicht *zu schwer* wird. Eine Rampe von 5 % auf 8 % der
  Arbeitslast erfüllte das mühelos und wäre als Aufwärmen wertlos. **Ein
  Vertrag, der nur eine Richtung absichert, lässt die andere frei.** Jetzt
  muss die letzte Stufe auch nah genug heranführen.

**Drei Fehlalarme, die lehrreicher sind als die Funde.** Das Werkzeug hat sich
in diesem einen Lauf **dreimal selbst widerlegt**:

1. **Verschachtelte Prüfstufen.** Der neue Schalter `--stages=sync` sprang aus
   der Regressionsstufe heraus — und weil Sync, Offline und Fuzz alle in
   derselben öffnenden Klammer hingen, lief damit *auch Sync nicht*. Acht
   Mutationen wurden als „überlebt" gemeldet, die niemand geprüft hatte.
2. **Zeitüberschreitung als Erfolg gewertet.** Ich hatte entschieden: „Eine
   Prüfmenge, die nicht fertig wird, ist ja nicht grün, also zähle ich sie als
   gefangen." Der Satz stimmt sogar. Er macht nur aus jedem zu langsamen Lauf
   einen Erfolg — und ein Volllauf dauert 325 s bei einer Grenze von 300 s.
   Ergebnis: ein Bericht „7 von 7 gefangen", in dem **keine einzige Mutation
   tatsächlich geprüft** worden war. Das war der teuerste Fehler, weil er als
   einziger eine falsche **Ent**warnung war — Fehlalarme fallen auf, falsche
   Entwarnungen nicht.
3. **Eine äquivalente Mutation.** Die letzte Aufwärmstufe auf 110 % zu heben
   „überlebte" — und war trotzdem kein Fund: `warmupPlan` filtert jede Stufe
   ≥ Arbeitsgewicht selbst heraus, das Verhalten ändert sich also gar nicht.
   Der klassische Fehlalarm dieses Verfahrens.

Dazu ein vierter, im Testcode selbst: `navigator.serviceWorker.ready` löst nie
auf, wenn sich keiner registriert hat. Der Offline-Test **hing** damit, statt
zu scheitern — ein Test muss ein Ergebnis liefern, auch ein schlechtes.

**Lektion.** Ein Werkzeug, das die Tests prüft, ist selbst ungeprüft. Bei
jedem alarmierenden Ergebnis einer **neuen** Messmethode gilt: erst die
Methode verdächtigen, dann das Gemessene. Und die schärfere Fassung davon,
aus Fehlalarm 2: **ein Messwert, der nicht zustande kam, darf nie als das
Ergebnis auftauchen, das man sich wünscht.** „Unklar" braucht eine eigene
Kategorie, sonst wandert es stillschweigend in „in Ordnung".

**Test.** `PB-076` Formelwerte und Monotonie · `PB-077` Pausenzuordnung über
sechs Übungen, Vorwärmen und Voreinstellungen · `PB-028` erweitert. Alle drei
gegengeprüft: die zugehörige Mutation wird jetzt gefangen.

---

### PB-078

**Jeder geloggte Satz lud das gesamte Dokument in die Cloud**

| | |
|---|---|
| **Schwere** | hoch |
| **Klasse** | Effizienz / Datenverbrauch |
| **Gefunden** | beim Nachrechnen für PB-023 — nicht gesucht, sondern nebenbei aufgefallen |
| **Status** | ✅ behoben |

**Symptom.** Nichts Sichtbares. Genau das ist der Punkt.

**Die Rechnung.** `save()` steht an 65 Stellen und läuft nach jedem geloggten
Satz. Jeder Aufruf ging über `queueCloudSave()` und schrieb das **ganze**
Dokument. Nachgemessen:

| | |
|---|---|
| Leere Daten | 3,9 KB |
| Pro Trainingseinheit (24 Sätze) | 2,7 KB |
| Nach 50 Einheiten | 137 KB |

Ein Workout mit 24 Sätzen lud damit **über drei Megabyte** hoch, um knapp drei
Kilobyte neue Daten zu übertragen. Im Studio, über Mobilfunk, während man
trainiert. Und es wächst linear mit der Historie: nach zwei Jahren ist jeder
einzelne Satz ein halbes Megabyte.

**Wie es aufgefallen ist.** Gar nicht durch einen Test. Beim Ausrechnen, wann
das 1-MB-Limit aus PB-023 erreicht wird, stand plötzlich die Zahl „137 KB" da
— und daneben die Erkenntnis, dass diese Zahl bei *jedem Satz* über die
Leitung geht. Das Limit ist ein Problem in 2,5 Jahren. Das hier war eins seit
dem ersten Tag.

**Fix.** Schreibvorgänge werden in einem Vier-Sekunden-Fenster gebündelt.
Lokal wird weiterhin sofort gespeichert — es geht also nichts verloren, wenn
der Browser dazwischen abstürzt.

**Was ausdrücklich NICHT gebündelt wird**, und das hat der Test erzwungen:

* **Workout beenden** — der Moment, in dem man die Daten sicher wissen will.
* **App schließen oder wegwischen** — über `visibilitychange` und `pagehide`.
  `beforeunload` feuert auf iOS nicht zuverlässig, deshalb beide.
* **Anmelden und Zusammenführen** — hier ist es kein Komfort, sondern
  Korrektheit: Wartet der Rückschreib nach dem Merge vier Sekunden, sieht ein
  zweites Gerät, das sich in diesem Fenster anmeldet, veraltete Daten und
  schreibt sie zurück. Das ist PB-071, nur mit Verzögerung als Ursache.

Diese Unterscheidung stand nicht im ersten Entwurf. Die Sync-Tests wurden rot,
weil sie alle davon ausgingen, dass ein `save()` sofort oben ankommt — und
genau dieser Widerspruch hat die Frage aufgeworfen, welche Schreibvorgänge
warten dürfen und welche nicht.

**Lektion.** Eine Kostenfrage sieht man nicht, indem man die App benutzt —
man sieht sie, indem man **die Größenordnung ausrechnet**. Hier: „wie viele
Bytes gehen pro Nutzeraktion über die Leitung?" Diese Frage hatte in
zweieinhalb Monaten niemand gestellt, obwohl die Antwort in einer Zeile Code
stand. Und die zweite Hälfte: **Bündeln ist immer eine Aussage darüber, was
warten darf.** Wer sie nicht trifft, verzögert auch das, was nicht warten
kann.

**Test.** `PB-078` — zwölf Sätze in schneller Folge dürfen höchstens einen
Schreibvorgang auslösen (sonst wäre die Bündelung wirkungslos), nach dem
Sammelfenster muss der zwölfte Satz oben angekommen sein (sonst wäre sie
gefährlich). Beide Hälften des Vertrags, nicht nur die bequeme.

---

## Offene Punkte (Backend-Änderung nötig)

Diese **zwei** sind nicht im Frontend lösbar. Sie brauchen Änderungen an der
Firebase-Konfiguration und stehen hier, damit sie nicht vergessen werden.

> Es waren drei. PB-022 stand hier zweieinhalb Monate zu Unrecht — der Fix war
> eine Client-API. Seit Juli 2026 ist er behoben. Die Lehre daraus steht in
> seinem [Eintrag](#pb-022) und als Muster 21 in der Tabelle unten: eine
> Einschätzung ohne Test ist eine Meinung, und in einer Liste echter
> Backend-Punkte fällt eine falsche nicht auf.

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
| **Status** | ✅ behoben (Juli 2026) — Reproduktion und Fix unter [PB-069](#pb-069) |

**Symptom.** Schreiben zwei Geräte gleichzeitig, kann ein Schreibvorgang
verloren gehen.

> **Nachtrag Juli 2026:** Zu PB-021 liegt jetzt `firestore.rules` im Repo. Die
> Regeln ändern nichts am Entwurf „wer den Code kennt, sieht die Daten" — der
> bleibt akzeptiert. Sie schließen aber eine andere Lücke: Erlauben die Regeln
> `read`, erlauben sie auch `list`, und dann kann ein beliebiger Client die
> ganze Sammlung abfragen. Dann muss niemand einen Namen raten. `get` erlaubt,
> `list` verboten — das kostet keine Änderung an der App.

**Ursache.** `queueCloudSave()` macht `get()` → merge → `set()`. Zwischen den
beiden Netzwerkoperationen liegt ein Fenster. Die `cloudWriteQueue`
serialisiert nur innerhalb eines Tabs.

**Fix.** `db.runTransaction()` — macht Lesen und Schreiben atomar und
wiederholt bei Konflikt automatisch. Ausgeführt im Juli 2026.

**Zwei Dinge an diesem Eintrag waren falsch, und beide sind lehrreicher als
der Fehler selbst:**

1. **„Nicht im Frontend lösbar."** Stand so im README, war nie wahr.
   `runTransaction()` ist eine Client-API des Firestore-SDK — der Fix sind
   sechs Zeilen und keine Backend-Änderung. Der Satz war eine Vermutung, die
   sich als Tatsache maskiert hat, weil er zwischen zwei echten
   Backend-Punkten stand (PB-021 braucht Security Rules, PB-023 braucht ein
   anderes Datenmodell). **Nachbarschaft ist kein Beleg.**
2. **„Praktisches Risiko gering, weil beide Seiten ohnehin mergen."** Auch
   falsch, und zwar nachprüfbar: `onSnapshot` führt zusammen und schreibt
   **nicht zurück**. Es gibt also keinen Reparaturlauf. Der verlorene Satz
   bleibt aus der Cloud verschwunden, bis dasselbe Gerät zufällig noch einmal
   speichert. Wer die App danach schließt und auf einem neuen Gerät
   weitermacht, hat den Satz nie wieder.

**Lektion.** Read-Modify-Write über Netzwerk ist immer eine Race Condition.
Transaktionen sind keine Optimierung, sondern die Korrektheitsbedingung. Und:
**eine Risikoeinschätzung ohne Test ist eine Meinung.** Diese hier stand
zweieinhalb Monate im Register und war in beiden Behauptungen daneben.

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

Wenn man die behobenen Fehler nach Ursache sortiert, bleiben **30
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
| 6 | **Stille Datenvernichtung** | PB-002, PB-010, PB-011, PB-012, PB-030, PB-040, PB-054, PB-057, PB-058, PB-060 | Was geht hier verloren, und weiß der Nutzer es? |
| 7 | **Plattformverhalten mit dem falschen Schalter bekämpft** | PB-026, PB-027, PB-061 | Unter welcher *Bedingung* tut die Plattform das — statt: welcher Schalter stellt es ab? |
| 8 | **Reihenfolge- und Rundungsannahmen** | PB-015, PB-028, PB-031, PB-033, PB-047, PB-049, PB-053, PB-055 | Gilt die Invariante auch noch *nach* Runden, Sortieren, Formatieren — und ist die Reihenfolge von Regeln selbst Bedeutung? |
| 9 | **Teil-Umstellung: nur die halbe Sache angefasst** | PB-004, PB-025, PB-034 | Wer sonst hängt an dem, was ich gerade umgestellt habe? |
| 10 | **Bedingung aus einer Verneinung statt aus der Bedeutung** | PB-038 | Prüft diese Bedingung wirklich den Fall, den sie behauptet — oder nur, dass ein anderer Fall nicht vorliegt? |
| 11 | **Gekürzte Beschriftung ohne Eindeutigkeitsprüfung** | PB-039 | Ist das ein Text oder ein Bezeichner? Bezeichner brauchen eine Kollisionsprüfung — und der Fallback gilt für die ganze Menge, nicht für den Einzelfall. |
| 12 | **Ausgabe, die für Menschen nicht prüfbar ist** | PB-041 | Kann ich diesem Ergebnis ansehen, ob es stimmt? Wenn nein: Welche unabhängige Gegenimplementierung prüft es — und reicht eine? |
| 13 | **Anzeige, die nur bei der aktuellen Datenmenge stimmt** | PB-048 | Stimmt das auch bei drei statt zwei, bei Wiederholungen, bei null? Oder beschreibt es nur zufällig den Ist-Zustand? |
| 14 | **Zwei Rechnungen für dieselbe Frage** | PB-051 | Gibt es diese Aussage noch woanders — und kommt dort dasselbe heraus? |
| 15 | **Erklärtext ohne Deckung im Code** | PB-050 | Behauptet ein Hilfetext etwas über die Rechnung? Dann ist der Satz ein Testfall. |
| 16 | **Erhobene Daten ohne Wirkung** | PB-052 | Wird jede abgefragte Antwort irgendwo gelesen? Wenn nein: benutzen oder nicht fragen. |
| 17 | **Rangfolge, die aus der Dateistruktur stammt** | PB-063 | Ist diese Reihenfolge gewollt — oder nur die, in der es zufällig im Dokument steht? |
| 18 | **Mehr Promises, als der Aufruf sichtbar macht** | PB-064 | Gibt diese API noch andere Promises zurück als das, auf das ich warte? Jedes braucht einen Handler. |
| 19 | **Beziehung ohne Hüter** | PB-065 | Diese Verbindung existiert nur als übereinstimmender Wert in zwei Objekten. Welche *eine* Stelle sorgt dafür, dass sie zwei bleiben? |
| 20 | **Test mit zu kleiner Reichweite** | PB-066 | Wie viele gleichartige Stellen gibt es — und prüft der Test sie alle oder nur die eine, an der es aufgefallen ist? |
| 21 | **Risikoeinschätzung ohne Test** | PB-022, PB-069 | Ist das gemessen oder geschätzt? Ein „praktisch geringes Risiko" ohne Reproduktion ist eine Meinung. |
| 22 | **„Nicht testbar" als Ausrede** | PB-067–PB-070 | Wie viele Methoden gehen hier nach draußen? Bei einer Handvoll ist ein Double billiger als die Begründung, warum es nicht geht. |
| 23 | **Test, der nicht belegt, dass er stattfand** | PB-069, PB-071 | Wäre dieser Test auch grün, wenn die Bedingung nie eingetreten ist? Dann fehlt der Nachweis, nicht der Vertrag. Bei Nebenläufigkeit: Barriere statt `sleep`. |
| 24 | **Schutz, den nur ein Pfad benutzt** | PB-071 | Wie viele Stellen schreiben auf dasselbe Ziel — und machen sie alle mit? Einer, der blind schreibt, hebt die Transaktionen aller anderen auf. |
| 25 | **Zeit als Ersatz für eine Bedingung** | PB-072 | Wartet dieser Test auf eine Uhr oder auf das, was tatsächlich passieren muss? Jedes `setTimeout` ist eine Wette auf die Maschine. |
| 26 | **Ein Fehlschlag als Befund gelesen** | PB-072 | Ist das reproduzierbar? Bei einer neuen Prüfmethode ist die Methode unverdächtiger als das Geprüfte — erst mehrere Läufe, dann die Diagnose. |
| 27 | **„Nicht testbar" als Selbstauskunft** | PB-073 | Was genau fehlt zum Prüfen — und wie viel Arbeit ist das wirklich? Hier waren es dreißig Zeilen HTTP-Server für einen Fehler der Schwere hoch. |
| 28 | **Vertrag, der nur eine Richtung absichert** | PB-028, PB-076 | „Nicht zu groß" ist die halbe Aussage. Gilt auch das Gegenteil — und prüft es jemand? |
| 29 | **Nicht zustande gekommener Messwert als Ergebnis** | PB-072, PB-076 | Kann diese Messung fehlschlagen, ohne dass es auffällt? Dann braucht „unklar" eine eigene Kategorie — sonst wandert es in „in Ordnung". |
| 30 | **Kosten, die niemand ausgerechnet hat** | PB-078 | Wie viele Bytes, Anfragen oder Millisekunden kostet eine einzelne Nutzeraktion — und wächst das mit der Datenmenge? Benutzen zeigt es nicht, rechnen schon. |

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
