# PUMPBRAH

Trainings-Tracker als einzelne HTML-Datei. Kein Build, keine Abhängigkeiten,
läuft per `file://` und offline. Optionaler Cloud-Sync über Firestore.

```
index.html          Die komplette App (HTML + CSS + JS)
sw.js               Service Worker: die App läuft auch ohne Empfang
test/check.mjs      Funktionstest-Harness: Smoke, Regressionen, Fuzzing
test/coverage.mjs   Abdeckung: welche Funktion ruft überhaupt jemand auf?
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
node test/coverage.mjs                 # welche Funktion ruft überhaupt jemand auf?
```

Voraussetzung: Chromium + Playwright. Pfad ggf. über `PW_CHROMIUM` setzen.

Drei Stufen:

| Stufe | Inhalt |
|---|---|
| **Smoke** | Start, Onboarding, jeder Screen rendert |
| **Regression** | Ein Test pro Eintrag in `docs/BUGS.md` — wächst mit jedem Fund |
| **Fuzz** | N zufällige Aktionen über 91 Operationen, 22 Invarianten nach **jeder** Aktion |

Der Fuzzer ist deterministisch: gleicher Seed = gleicher Lauf. Bei einem Fund
liefert der Report die Aktionsfolge der letzten 12 Schritte und den Seed zum
Nachstellen.

Aktueller Stand: **70 Prüfungen grün** — 58 Regressionstests plus Fuzzing über
91 Operationen, verifiziert über vierzehn unabhängige Kampagnen mit insgesamt
80.000 Aktionen.

### Was der Test *nicht* prüft

Auf die Frage „ist jede Funktion geprüft?" gibt es eine Zahl statt einer
Meinung: `test/coverage.mjs` liest alle Funktionsdefinitionen aus `index.html`
und sucht sie im Testskript.

| | |
|---|---|
| Funktionen in `index.html` | 376 |
| von einem Test aufgerufen | 213 |
| **an einem Knopf, aber von keinem Test aufgerufen** | **0** — das Skript schlägt fehl, sobald es wieder mehr werden |
| nur intern erreichbar (Renderer, Merge-Teile, Hilfsfunktionen) | 155 |
| außerhalb des Harnesses | 8 |

Die letzte Zeile ist die ehrliche: **Firebase-Anmeldung, Cloud-Schreiben,
Offline-Umschalten, „Alles zurücksetzen" und der Service Worker** laufen in
keinem Test. Die ersten vier laden die Seite neu oder brauchen eine echte
Verbindung, der fünfte existiert unter `file://` nicht. Jeder Eintrag steht
mit Begründung in `test/coverage.mjs`.

Drei weitere Grenzen, die keine Zahl sichtbar macht:

* **„Aufgerufen" ist nicht „geprüft".** Die 213 enthalten Funktionen, die der
  Fuzzer nur ausführt, ohne ihr Ergebnis zu bewerten. Was zusichert, sind die
  58 Regressionstests und die 22 Invarianten — nicht die Abdeckungszahl.
* **Chromium ist nicht Safari.** Tastatur-Ausweichen, Sheet-Gesten und
  Safe-Area werden gegen `visualViewport` und Media Queries geprüft, nicht
  gegen echtes iOS.
* **Der Sync hat keinen zweiten Client.** Die Merge-Funktionen werden mit
  synthetischen Gegenständen getestet; zwei echte Geräte, die gleichzeitig
  schreiben, prüft niemand (siehe PB-022).

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

Drei Befunde sind **nicht im Frontend lösbar** und in
[`docs/BUGS.md`](docs/BUGS.md) mit Lösungsweg dokumentiert:

- **PB-021 (kritisch):** Firestore ohne Authentifizierung. Braucht Firebase
  Auth plus Security Rules. Vom Betreiber als bekanntes Risiko akzeptiert.
- **PB-022:** Read-Modify-Write ohne Transaktion beim Cloud-Speichern.
- **PB-023:** Die gesamte App liegt in einem Firestore-Dokument (1-MB-Limit,
  erreicht bei etwa 1.000 Sessions).

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
