# PUMPBRAH

Trainings-Tracker für den Browser. Läuft als Web-App unter
[ichputzhiernurr.github.io/pumpbrah](https://ichputzhiernurr.github.io/pumpbrah/)
und lässt sich auf dem iPhone über „Zum Home-Bildschirm" wie eine App
installieren.

```
index.html     Die komplette App (HTML + CSS + JS, kein Build nötig)
assets/ex/     Übungsfotos, 560px WebP
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
Echte Fotos der Start- und Endposition, überblendet zur Bewegung. Fehlt eine
Datei, wird sie nachgeladen; klappt auch das nicht, zeichnet die App eine
animierte Strichfigur aus dem erkannten Bewegungsmuster. Dazu Zielmuskulatur,
Ausführungs-Cue und Tempo-Umschalter (2 s / 3 s / 5 s betonte Exzentrik).

**Sync**
Firestore mit Merge-Verfahren über alle Datentypen, Tombstones für Löschungen,
Konfliktauflösung über Zeitstempel. JSON-Export/-Import.

**iOS**
Als Home-Screen-App installierbar · Large-Title-Kopfzeilen, die beim Scrollen
zu einer Glasleiste kollabieren · Bottom-Sheets mit Ziehgriff und
Wisch-zum-Schließen · Tastatur-Ausweichen · Safe-Area in Hoch- und Querformat ·
kein Auto-Zoom beim Fokussieren · Pull-to-Refresh mitten im Workout deaktiviert

---

## Bildmaterial

Die Übungsfotos stammen aus der
[Free Exercise DB](https://github.com/yuhonas/free-exercise-db) und stehen unter
der **Unlicense** (Public Domain). Sie sind auf 560px verkleinert und als WebP
in `assets/ex/` abgelegt.

---

## Barrierefreiheit

- `prefers-reduced-motion` — die App läuft ohne einen einzigen Effekt, inklusive
  Übungsdemos, Chart-Animationen und PR-Feier.
- `prefers-reduced-transparency` — Glasflächen werden undurchsichtig.
- `prefers-contrast` — Ränder und Sekundärtext werden deutlicher.
- Zoomen ist erlaubt, Formularfelder sind groß genug, dass iOS nicht von selbst
  hineinzoomt.
- Sichtbarer Fokusring über `:focus-visible`.

---

## Entwicklung

Code-Review, Trainingsreview, Bug-Register und der Testharness liegen auf dem
Entwicklungsbranch
[`claude/fitness-app-review-overhaul-iwee5t`](https://github.com/IchPutzHierNurr/pumpbrah/tree/claude/fitness-app-review-overhaul-iwee5t)
unter `docs/` und `test/`.

**Hinweis zu deinen Daten:** Die Synchronisation ist derzeit nicht
zugriffsgeschützt. Nutze die App deshalb nicht für Angaben, die vertraulich
bleiben müssen. Die App funktioniert auch vollständig im Offline-Modus, dann
bleiben alle Daten auf dem Gerät.
