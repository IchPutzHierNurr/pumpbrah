# PUMPBRAH

Trainings-Tracker als einzelne HTML-Datei. Kein Build, keine Abhängigkeiten,
läuft per `file://` und offline. Optionaler Cloud-Sync über Firestore.

```
index.html          Die komplette App (HTML + CSS + JS)
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
Voreinstellung · Cardio getrennt in Minuten · persönliche Notizen pro Übung

**Im laufenden Workout**
Trainingstag wechseln (anhängen / nur Geloggtes behalten / ersetzen) ·
Übung tauschen ohne Verlust geloggter Sätze, optional dauerhaft in den Plan ·
Übung live ergänzen, entfernen, umsortieren · Sätze ± · Kompaktmodus ·
Ziel für den nächsten Satz nach doppelter Progression · Wake Lock

**Auswertung**
Wochenvolumen gegen MEV/MAV/MRV · Volumen-Radar über sechs Muskelgruppen ·
Tonnage- und RIR-Trends · geschätzter 1RM (Epley) · PR-Erkennung ·
Deload-Empfehlung aus Trend, RIR und Volumen · Fitnessalter · Gewichtsverlauf ·
optionale EGYM-Körperanalyse · Kalenderhistorie

**Übungsausführung**
Animierte Inline-SVG-Demonstration pro Bewegungsmuster, aus dem Übungsnamen
erkannt. Kein Netzwerk, kein Tab-Wechsel. Mit Zielmuskulatur, Ausführungs-Cue
und Tempo-Umschalter (2 s / 3 s / 5 s betonte Exzentrik).

**Sync**
Firestore mit Merge-Verfahren über alle Datentypen, Tombstones für Löschungen,
Konfliktauflösung über Zeitstempel. JSON-Export/-Import.

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
| **Fuzz** | N zufällige Aktionen über 58 Operationen, 16 Invarianten nach **jeder** Aktion |

Der Fuzzer ist deterministisch: gleicher Seed = gleicher Lauf. Bei einem Fund
liefert der Report die Aktionsfolge der letzten 12 Schritte und den Seed zum
Nachstellen.

Aktueller Stand: **33 Prüfungen grün**, verifiziert über acht unabhängige
Kampagnen (u. a. 1 × 10.000 und 4 × 2.500 Iterationen, zusammen >30.000
Aktionen und >400.000 Invariantenprüfungen).

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

- **PB-021 (kritisch):** Firestore ohne Authentifizierung. Der Sync-Code ist
  der Vorname; wer ihn kennt, liest und schreibt alle Daten. Braucht
  Firebase Auth + Security Rules.
- **PB-022:** Read-Modify-Write ohne Transaktion beim Cloud-Speichern.
- **PB-023:** Die gesamte App liegt in einem Firestore-Dokument (1-MB-Limit,
  erreicht bei etwa 1.000 Sessions).

Bis PB-021 behoben ist, gilt: **keine Daten in dieser App, die nicht
öffentlich sein dürfen.**

---

## Barrierefreiheit

Sämtliche Animationen respektieren `prefers-reduced-motion`. Bei aktivierter
Bewegungsreduktion läuft die App ohne einen einzigen Effekt — inklusive der
Übungs-Demonstrationen, Chart-Animationen und der PR-Feier.
