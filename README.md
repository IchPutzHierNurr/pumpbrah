# PUMPBRAH

Trainings-Tracker als einzelne HTML-Datei. Kein Build, keine Abhängigkeiten,
läuft per `file://` und offline. Optionaler Cloud-Sync über Firestore.

```
index.html          Die komplette App (HTML + CSS + JS)
sw.js               Service Worker: die App läuft auch ohne Empfang
test/check.mjs      Funktionstest-Harness: Smoke, Regressionen, Sync, Fuzzing
test/fakestore.mjs  Gefälschte Firestore — macht den Sync und zwei Geräte prüfbar
test/httpserve.mjs  Winziger HTTP-Server — macht den Service Worker prüfbar
test/mutate.mjs     Mutationsstichprobe — prüft die Tests statt der App
firestore.rules     Security Rules zum Einspielen in die Firebase-Konsole
test/coverage.mjs   Abdeckung: welche Funktion ruft überhaupt jemand auf?
.github/workflows/  CI: derselbe Harness in Chromium UND WebKit, bei jedem Push
docs/CODE-REVIEW.md Engineering-Review als Lerndokument
docs/CBUM-REVIEW.md Dieselbe App aus Trainingssicht bewertet
docs/DESIGN.md      Der visuelle Masterprompt: Regeln und Abnahmekriterien
docs/EVIDENZ.md     Woher die Übungsvorschläge kommen — und was sie nicht behaupten
docs/BUGS.md        Register aller je gefundenen Fehler + Regressionstests
.claude/commands/   /check — der Masterprompt für den Testlauf
```

---

## Funktionen

**Training**
Plan aus dem Onboarding erzeugt — Tage, Ort, Ziel und Erfahrung bestimmen ihn
wirklich, gerechnet gegen dieselben Landmarks wie der Coach ·
**Mesozyklus**: Volumen steigt über die Wochen von 72 % auf 100 % des Plans,
danach eine Entlastungswoche — skaliert wird das Workout, nie der Plan ·
Dauerschätzung je Trainingstag (einseitige Übungen zählen doppelt) ·
Mehrere Trainingstage mit Wochentagszuordnung · Übungsbibliothek mit eigenen
Übungen · RIR-basierte Satzerfassung · Pausentimer mit Compound-/Isolations-
Voreinstellung · Cardio getrennt in Minuten · persönliche Notizen pro Übung ·
Aufwärmrampe je Hauptübung (zählt nicht ins Volumen) · Deload-Modus, der die
Workouts sieben Tage lang automatisch reduziert und den Plan unberührt lässt

Der mitgelieferte Plan ist ein 3-Tage-Ganzkörper (Di/Do/Sa), **33 Übungen,
121 Sätze**, höchstens **4 Sätze je Übung** — lieber eine Übung mehr als ein
Satz mehr, weil der fünfte und sechste Satz derselben Übung am wenigsten
beiträgt. Alle zehn Volumengruppen liegen im Korridor zwischen MEV und MRV,
die Pause steht einheitlich auf 120 s, jede Einheit dauert 101–112 min.

**Im laufenden Workout**
„Wenig Zeit": kürzt die Einheit auf ein Zeitbudget — Grundübungen zuletzt,
nie unter zwei Sätze, der Plan bleibt unverändert ·
Autoregulation: weicht der RIR vom Ziel ab, ändert sich die nächste Vorgabe ·
Supersätze mit gemeinsamer Pause · Scheibenrechner ·
Trainingstag wechseln (anhängen / nur Geloggtes behalten / ersetzen) ·
Übung tauschen ohne Verlust geloggter Sätze, optional dauerhaft in den Plan ·
Übung live ergänzen, entfernen, umsortieren · Sätze ± · Kompaktmodus ·
Ziel für den nächsten Satz nach doppelter Progression · Wake Lock

**Auswertung**
Wochenvolumen gegen MEV/MAV/MRV über **zehn Muskeln** — Bizeps und Trizeps
getrennt, Quadrizeps, Beinbeuger und Waden getrennt, seitliche und hintere
Schulter getrennt (Begründung in
[`docs/EVIDENZ.md`](docs/EVIDENZ.md)) · wahlweise inklusive indirekt
beteiligter Muskeln (0,5 Sätze) · Volumen-Radar · Tonnage- und RIR-Trends ·
e1RM-Verlauf pro Übung statt nur Rohgewicht · PR-Erkennung · Deload-Empfehlung
aus Trend, RIR und Volumen · Fitnessalter · Gewichtsverlauf · EGYM-BioAge in
Altersdifferenzen statt Rohwerten · Kalenderhistorie · einklappbare Abschnitte (auch die Volumenkarte auf dem Startbildschirm, eingeklappt mit Kurzfassung)

**Übungsausführung**
In Listen steht je Übung eine Bewegungsmuster-Marke: ein Strich-Piktogramm für
eines von 15 erkannten Mustern (Drücken, Ziehen, Hüftbeuge, Kniebeuge, …),
eingefärbt nach Muskelgruppe. In der Demo läuft die animierte Strichfigur aus
der eigenen Pose-Engine, dazu Zielmuskulatur, Ausführungs-Cue und
Tempo-Umschalter (2 s / 3 s / 5 s betonte Exzentrik).

**Volumen-Coach**
Wochenvolumen je Muskel gegen MEV/MAV/MRV, Frequenz, fehlende
Bewegungsmuster — im Plan wie im laufenden Workout. Fehlt Volumen, schlägt er
eine konkrete Übung aus einem Katalog von 52 Einträgen vor, jede mit sichtbarer
Konfidenzstufe und „warum?"-Beleg (siehe [`docs/EVIDENZ.md`](docs/EVIDENZ.md)).

**Plan teilen**
Ein Trainingsplan wird zu einem komprimierten Code, einem Link oder einem
QR-Code (eigener Encoder, ohne Bibliothek). Beim Import zeigt die App zuerst
eine Vorschau; Historie und eigene Daten des Empfängers bleiben unberührt.

**Daten**
JSON-Backup mit Erinnerung, wenn länger als 30 Tage nichts gesichert wurde ·
CSV-Export aller Sätze (Semikolon, Dezimalkomma, BOM — öffnet in Excel ohne
Import-Dialog)

**Sync**
Firestore mit Merge-Verfahren über alle Datentypen, Tombstones für Löschungen,
Konfliktauflösung über Zeitstempel. JSON-Export/-Import.

**iOS**
Als Home-Screen-App installierbar (Icon und Manifest sind in die Datei
eingebettet) · Large-Title-Kopfzeilen, die beim Scrollen zu einer Glasleiste
kollabieren · Bottom-Sheets mit Ziehgriff und Wisch-zum-Schließen ·
Tastatur-Ausweichen über `visualViewport` · Safe-Area in Hoch- und Querformat ·
kein Auto-Zoom beim Fokussieren, Zoomen von Hand bleibt erlaubt ·
Pull-to-Refresh mitten im Workout deaktiviert · Wake Lock ·
respektiert „Bewegung reduzieren", „Transparenz reduzieren" und
„Kontrast erhöhen"

---

## Testen

```bash
node test/check.mjs                    # 2500 Fuzz-Iterationen
node test/check.mjs --iterations=25000
node test/check.mjs --seed=12345       # Lauf exakt wiederholen
node test/check.mjs --smoke-only
node test/check.mjs --browser=webkit   # andere Engine (siehe unten)
node test/coverage.mjs                 # welche Funktion ruft überhaupt jemand auf?
node test/mutate.mjs                   # würde es auffallen, wenn sie etwas Falsches täte?
```

Voraussetzung: Chromium + Playwright. Pfad ggf. über `PW_CHROMIUM` setzen.

Fünf Stufen:

| Stufe | Inhalt |
|---|---|
| **Smoke** | Start, Onboarding, jeder Screen rendert |
| **Regression** | Ein Test pro Eintrag in `docs/BUGS.md` — wächst mit jedem Fund |
| **Sync** | Anmelden, Cloud, **zwei Geräte auf einem Konto** — gegen eine gefälschte Firestore, mit Barrieren für echte Wettläufe |
| **Offline** | Service Worker, Cache und ob eine **neue Fassung ankommt** — über einen echten HTTP-Server |
| **Fuzz** | N zufällige Aktionen über 91 Operationen, 22 Invarianten nach **jeder** Aktion |

### Der Sync wird gegen ein Double geprüft

`db` ist nur gesetzt, wenn das Firebase-SDK von einem CDN geladen wurde — unter
`file://` ohne Netz also nie. Der gesamte Sync-Pfad lief deshalb in keinem Test.
[`test/fakestore.mjs`](test/fakestore.mjs) bildet die **sieben** SDK-Methoden
nach, die die App überhaupt benutzt, hält den Store in Node (damit zwei
Browser-Contexts ihn wirklich teilen) und stellt `onSnapshot`-Benachrichtigungen
erst auf Abruf zu. Dazu **Barrieren**: `holdNext({op:'set', who:'B'})` hält
einen Schreibvorgang an, bis der Test ihn freigibt. Damit wird eine
Verschränkung von Lesen und Schreiben **gebaut** statt erhofft — so wurden
PB-022 und sein Zwilling PB-071 zum ersten Mal reproduziert und dann behoben.
Ohne Barriere war der erste Anlauf grün, während im Protokoll alle
Schreibvorgänge des einen Geräts vollständig vor dem Lesen des anderen lagen.

Der Fuzzer ist deterministisch: gleicher Seed = gleicher Lauf. Bei einem Fund
liefert der Report die Aktionsfolge der letzten 12 Schritte und den Seed zum
Nachstellen.

Aktueller Stand: **98 Prüfungen grün** — 77 Regressionstests, 6 Sync-Tests über
zwei Geräte, 3 Offline-Tests und Fuzzing über 93 Operationen, in Chromium und
WebKit.

Der teuerste Beleg für den Sinn dieser Aufstellung ist frisch: Eine Auslieferung
ging mit 86 grünen Prüfungen raus und trug einen Datenverlust-Fehler in sich
(PB-085). Gefunden hat ihn kein Test, sondern das Nachlesen des eigenen Codes —
gefolgt von einem Gegencheck, der zeigte, dass der Schaden **größer** war als
vermutet: nicht eine falsch beschriebene Session, sondern eine verschwundene.
Grün heißt „die geprüften Fälle halten", nicht „es ist heil".
Aus der Lektion von PB-085 — *merkt sich ein Dialog eine Position, ist das ein
Fund* — fiel fünf Minuten später ein zweiter Fall derselben Bauart heraus
(PB-086). Ein Muster im Register ist erst dann etwas wert, wenn nach dem
Aufschreiben die Frage folgt: wo noch?

### Die App ansehen, ohne sie zu installieren

`node tools/vorschau.mjs` baut aus `index.html` eine einzelne Seite, in der die
App im echten iPhone-Viewport läuft — antippbar, mit Startdaten, ohne
Installation. Drei Eingriffe, alle im Skript nachlesbar und alle notwendig:

| Eingriff | Grund |
|---|---|
| Schriften eingebettet statt verlinkt | die Seite darf keinen fremden Host kontaktieren |
| Firebase-SDK nicht geladen, Schlüssel auf Platzhalter | die Vorschau darf die echten Daten **nicht** anfassen können |
| Startdatensatz (vier Sessions, zwei Messungen) | ohne Historie gäbe es nichts zu korrigieren, also nichts zu sehen |

Der Rest ist Zeile für Zeile dieselbe Datei, die auf GitHub Pages ausgeliefert
wird. Bricht ein Eingriff, weil sich `index.html` geändert hat, wirft das
Skript — eine halb funktionierende Vorschau sieht man ihr nicht an.

Was es **nicht** ist: ein iOS-Simulator. Der läuft nur auf macOS mit Xcode.
Die Vorschau zeigt die App in der Engine des jeweiligen Browsers, aber auf den
echten Viewport-Maßen aus PB-080 — 320 × 568 bis 430 × 739.

### Zwei Engines, ein Vergleich

Die Entwicklungsumgebung darf WebKit nicht herunterladen — die Netzwerk-
Richtlinie sperrt `cdn.playwright.dev`. Der Lauf wandert deshalb dorthin, wo
das Netz offen ist: [`.github/workflows/check.yml`](.github/workflows/check.yml)
fährt bei jedem Push **Chromium und WebKit nebeneinander**.

Der Sinn liegt im Vergleich, nicht in der zweiten Engine allein:

| Ergebnis | Bedeutung |
|---|---|
| beide rot | echter Fehler in der App |
| nur WebKit rot | Engine-Unterschied — also ein iOS-Problem |
| nur Chromium rot | etwas an der Prüfung selbst stimmt nicht |

Ohne diesen Vergleich müsste man bei jedem roten Lauf erst raten. Der Seed ist
die Commit-Nummer, jeder CI-Lauf ist also exakt nachstellbar.

Der erste WebKit-Lauf meldete prompt einen Fehler — und der **zweite war
grün**, über praktisch demselben Code. Damit war der Befund kein
Engine-Unterschied, sondern eine Uhr im Test (PB-072). Auch das ist ein
Ergebnis: eine Prüfmethode ist am Anfang unverdächtiger als das, was sie
prüft. CI fährt 1.500
Runden für eine schnelle Antwort; die großen Kampagnen laufen weiter von Hand.

Die Datei liegt **nicht** auf `main` — dort stehen nur App-Dateien, weil `main`
über GitHub Pages ausgeliefert wird.

### „Erreicht" ist nicht „geprüft" — die Mutationsstichprobe

`node test/mutate.mjs` baut achtzehn bewusste Verschlechterungen in den Code
und sieht nach, ob ein Test rot wird. Überlebt eine, ist das die **Adresse
einer fehlenden Zusicherung** — nicht bloß das Gefühl, dass irgendwo eine
fehlt. Gefunden wurden so drei: die e1RM-Formel wurde nie auf ihren Wert
geprüft (PB-076), die Pausenlängen ließen sich vertauschen (PB-077), und die
Aufwärmrampe war nur gegen „zu schwer" abgesichert, nicht gegen „nutzlos
flach" (PB-028).

Die Mutationen sind in zwei Sorten geteilt: solche, die einen Fehler mit
benanntem Regressionstest nachbauen — überlebt so eine, ist das Register
selbst schadhaft — und solche ohne Test, wo ein Überleben ein Fund ist.

### Was der Test *nicht* prüft

Auf die Frage „ist jede Funktion geprüft?" gibt es eine Zahl statt einer
Meinung: `test/coverage.mjs` liest alle Funktionsdefinitionen aus `index.html`
und sucht sie im Testskript.

| | |
|---|---|
| Funktionen in `index.html` | 387 |
| vom Test erreicht | 232 |
| **an einem Knopf, aber von keinem Test aufgerufen** | **0** — das Skript schlägt fehl, sobald es wieder mehr werden |
| nur intern erreichbar (Renderer, Merge-Teile, Hilfsfunktionen) | 155 |
| außerhalb des Harnesses | **0** |

Die letzte Zeile stand einmal bei acht. Sieben fielen weg, als die gefälschte
Firestore kam, der achte mit einem dreißigzeiligen HTTP-Server. Beide Male war
„nicht testbar" nur eine Abkürzung für „noch niemand hat nachgesehen, wie
klein die Schnittstelle ist" — und hinter dem letzten Eintrag steckte ein
Fehler der Schwere *hoch* (PB-073).

Vier Grenzen, die keine Zahl sichtbar macht:

* **„Erreicht" ist nicht „geprüft".** Die 232 enthalten Funktionen, die der
  Fuzzer nur ausführt, ohne ihr Ergebnis zu bewerten. Was zusichert, sind die
  59 Regressionstests, die 5 Sync-Tests, die 3 Offline-Tests und die 22
  Invarianten — nicht die Abdeckungszahl.
* **Kein iOS-Simulator.** Der läuft nur auf macOS mit Xcode. Was geht: die
  echten Geräteprofile aus Playwright — Viewport, Pixeldichte, Touch,
  User-Agent. Der Harness läuft seit Juli 2026 auf dem **tatsächlichen**
  iPhone-Viewport (393×659), nicht mehr auf der Bildschirmhöhe (393×852); der
  Sheet-Test über vier Profile vom SE (320×568) bis zum Pro Max. Siehe PB-080.
* **WebKit ist nicht iOS Safari.** Seit Juli 2026 läuft derselbe Harness in CI
  zusätzlich in WebKit (siehe unten) — Engine-Unterschiede werden damit
  gefunden. Was weiter fehlt: echte Tastatur, echtes Safe-Area, echter
  Gummiband-Scroll, echte Finger. Dafür gibt es kein Ersatzverfahren, nur ein
  Gerät.
* **Das Double ist nicht Firestore.** Es bildet die sieben benutzten Methoden
  samt optimistischer Transaktion nach. Ob Googles SDK sich genauso verhält,
  prüft niemand. Sobald PB-021 angegangen wird (Auth + Security Rules), reicht
  das nicht mehr — Rules gehen nur gegen den echten Emulator.
* **`location.reload()` ist unter `file://` nicht beobachtbar.** Gemessen: kein
  `load`-Ereignis nach 8 s. `doLogout()` und `resetAll()` werden deshalb an
  ihren Wirkungen geprüft, der Neustart kommt von außen. Über `https` — also im
  Betrieb — tritt das nicht auf.

---

## Der `/check`-Workflow

Beim Arbeiten mit Claude Code:

```
/check              # Standardlauf
/check 5000         # mehr Iterationen
/check --fokus=workout
```

Dahinter steht ein Grundgesetz:

> **Ein Fehler gilt erst als behoben, wenn er
> (1) im Code gefixt, (2) in `docs/BUGS.md` dokumentiert und
> (3) durch einen Regressionstest in `test/check.mjs` abgesichert ist.**

So wächst die Prüfmenge mit jedem Lauf, statt dass alte Fehler nach einem
halben Jahr unbemerkt zurückkommen. `docs/BUGS.md` schrumpft nie — auch nicht,
wenn der betroffene Code längst umgeschrieben wurde.

---

## Bekannte offene Punkte

Zwei Befunde brauchen Änderungen außerhalb des Frontends und in
[`docs/BUGS.md`](docs/BUGS.md) mit Lösungsweg dokumentiert:

- **PB-021 (kritisch):** Firestore ohne Authentifizierung. Braucht Firebase
  Auth plus Security Rules. Vom Betreiber als bekanntes Risiko akzeptiert.
- **PB-023:** Die gesamte App liegt in einem Firestore-Dokument. Nachgemessen:
  2,7 KB je Trainingseinheit (24 Sätze), also **389 Einheiten bis zum
  1-MB-Limit** — bei 3×/Woche rund 2,5 Jahre. Die früher hier genannten
  „etwa 1.000" waren zu optimistisch; sie unterstellten deutlich kleinere
  Einheiten.

Zu **PB-021** liegt jetzt [`firestore.rules`](firestore.rules) im Repo — sie
ändern nichts an der App und müssen von Hand in der Firebase-Konsole
veröffentlicht werden. Ihr Kern: `get` erlauben, **`list` verbieten**. Erlauben
die Regeln `read`, kann ein beliebiger Client die ganze Sammlung abfragen und
bekommt jedes Konto auf einmal — dann muss niemand einen Namen raten. Das ist
eine andere Größenordnung als „wer den Code kennt".

Nicht mehr offen, aber verwandt: Der Schreibpfad lud bei jedem geloggten Satz
das ganze Dokument hoch — bei 50 Einheiten 137 KB pro Satz, im Studio über
Mobilfunk. Seit Juli 2026 werden Schreibvorgänge in einem Vier-Sekunden-Fenster
gebündelt; Sync-Momente (Anmelden, Zusammenführen, Workout-Ende, App
schließen) gehen weiter sofort raus. Abgesichert durch PB-078.

Hier stand bis Juli 2026 ein dritter: **PB-022**, Read-Modify-Write ohne
Transaktion. Er war nie ein Backend-Punkt — `runTransaction()` ist eine
Client-API, der Fix sind sechs Zeilen. Er stand hier, weil er zwischen zwei
echten Backend-Punkten stand und niemand nachgesehen hat. Reproduziert und
behoben, sobald der Sync überhaupt einen Test hatte.

Solange PB-021 offen ist, gilt: **keine Daten in dieser App, die nicht
öffentlich sein dürfen.**

---

## Bildmaterial

Keins. Die App lädt kein einziges Bild — weder lokal noch aus dem Netz.

Bis Juli 2026 lagen 52 Übungsfotos aus der
[Free Exercise DB](https://github.com/yuhonas/free-exercise-db) unter
`assets/ex/`. Sie waren rechtlich sauber (Unlicense) und trotzdem falsch:
Studiofotos mit fremdem Weißabgleich, fremdem Hintergrund und fremdem
Bildstil, in einer App, deren gesamte Oberfläche aus zwei Farben und einem
Verlauf besteht. Jedes Foto war ein Fremdkörper.

An ihrer Stelle steht jetzt eine **Bewegungsmuster-Marke**: dasselbe
Strichvokabular wie die übrigen Icons, eingefärbt nach Muskelgruppe,
beschriftet mit dem erkannten Muster. Sie ist Vektor, skaliert beliebig,
erbt den Akzent und kostet null Byte Netzwerk. Für die Ausführung selbst
zeichnet die Pose-Engine weiterhin eine animierte Strichfigur.

---

## Barrierefreiheit

- `prefers-reduced-motion` — bei aktivierter Bewegungsreduktion läuft die App
  ohne einen einzigen Effekt, inklusive Übungsdemos, Chart-Animationen und
  PR-Feier.
- `prefers-reduced-transparency` — Glasflächen werden undurchsichtig.
- `prefers-contrast` — Ränder und Sekundärtext werden deutlicher.
- Zoomen ist erlaubt (`user-scalable` nicht gesperrt), Formularfelder sind
  groß genug, dass iOS nicht von selbst hineinzoomt.
- Sichtbarer Fokusring über `:focus-visible` für Tastatur- und Schalterzugriff.
