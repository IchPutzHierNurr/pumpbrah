# PUMPBRAH

Trainings-Tracker als einzelne HTML-Datei. Kein Build, keine Abhängigkeiten,
läuft per `file://` und offline. Optionaler Cloud-Sync über Firestore.

```
index.html          Die komplette App (HTML + CSS + JS)
assets/ex/          Übungsfotos, 560px WebP (Public Domain, siehe unten)
test/check.mjs      Funktionstest-Harness: Smoke, Regressionen, Fuzzing
docs/CODE-REVIEW.md Engineering-Review als Lerndokument
docs/CBUM-REVIEW.md Dieselbe App aus Trainingssicht bewertet
docs/BUGS.md        Register aller je gefundenen Fehler + Regressionstests
.claude/commands/   /check — der Masterprompt für den Testlauf
```

---

## Funktionen

**Training**
Mehrere Trainingstage mit Wochentagszuordnung · Übungsbibliothek mit eigenen
Übungen · RIR-basierte Satzerfassung · Pausentimer mit Compound-/Isolations-
Voreinstellung · Cardio getrennt in Minuten · persönliche Notizen pro Übung ·
Aufwärmrampe je Hauptübung (zählt nicht ins Volumen) · Deload-Modus, der die
Workouts sieben Tage lang automatisch reduziert und den Plan unberührt lässt

**Im laufenden Workout**
Trainingstag wechseln (anhängen / nur Geloggtes behalten / ersetzen) ·
Übung tauschen ohne Verlust geloggter Sätze, optional dauerhaft in den Plan ·
Übung live ergänzen, entfernen, umsortieren · Sätze ± · Kompaktmodus ·
Ziel für den nächsten Satz nach doppelter Progression · Wake Lock

**Auswertung**
Wochenvolumen gegen MEV/MAV/MRV, wahlweise inklusive indirekt beteiligter
Muskeln (0,5 Sätze) · Volumen-Radar über sechs Muskelgruppen · Tonnage- und
RIR-Trends · e1RM-Verlauf pro Übung statt nur Rohgewicht · PR-Erkennung ·
Deload-Empfehlung aus Trend, RIR und Volumen · Fitnessalter · Gewichtsverlauf ·
optionale EGYM-Körperanalyse · Kalenderhistorie

**Übungsausführung**
Echte Fotos der Start- und Endposition, überblendet zur Bewegung. Quelle:
[Free Exercise DB](https://github.com/yuhonas/free-exercise-db) (Unlicense,
Public Domain), lokal unter `assets/ex/` in 560px-WebP. Dreistufige
Rückfallebene: lokale Datei → GitHub-Raw → gezeichnete Strichfigur aus der
eigenen Pose-Engine. Dazu Zielmuskulatur, Ausführungs-Cue und Tempo-Umschalter
(2 s / 3 s / 5 s betonte Exzentrik).

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
node test/check.mjs                    # 1000 Fuzz-Iterationen
node test/check.mjs --iterations=10000
node test/check.mjs --seed=12345       # Lauf exakt wiederholen
node test/check.mjs --smoke-only
```

Voraussetzung: Chromium + Playwright. Pfad ggf. über `PW_CHROMIUM` setzen.

Drei Stufen:

| Stufe | Inhalt |
|---|---|
| **Smoke** | Start, Onboarding, jeder Screen rendert |
| **Regression** | Ein Test pro Eintrag in `docs/BUGS.md` — wächst mit jedem Fund |
| **Fuzz** | N zufällige Aktionen über 65 Operationen, 16 Invarianten nach **jeder** Aktion |

Der Fuzzer ist deterministisch: gleicher Seed = gleicher Lauf. Bei einem Fund
liefert der Report die Aktionsfolge der letzten 12 Schritte und den Seed zum
Nachstellen.

Aktueller Stand: **46 Prüfungen grün** — 37 Regressionstests plus Fuzzing über
65 Operationen, verifiziert über mehr als zehn unabhängige Kampagnen.

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

Die Übungsfotos stammen aus der
[Free Exercise DB](https://github.com/yuhonas/free-exercise-db) und stehen unter
der **Unlicense** (Public Domain, keine Namensnennungspflicht). Sie sind auf
560px Breite verkleinert und als WebP in `assets/ex/` abgelegt — zusammen
rund 0,9 MB für 26 Übungen.

Fehlt eine Datei, lädt die App das Bild von `raw.githubusercontent.com` nach.
Klappt auch das nicht — offline, oder die Übung steht nicht in der Datenbank —
zeichnet sie eine animierte Strichfigur aus dem erkannten Bewegungsmuster.
Die App funktioniert damit in jedem Fall, nur unterschiedlich hübsch.

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
