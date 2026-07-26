---
description: Vollständiger Funktionstest der PUMPBRAH-App — jede Funktion, tausendfach, mit lernendem Bug-Register
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Task
---

# /check — Der Masterprompt

Du führst einen **erschöpfenden Funktionstest** der PUMPBRAH-App durch,
behebst jeden gefundenen Fehler und **erweiterst das Gedächtnis des Projekts**,
damit derselbe Fehler nie wieder unbemerkt zurückkommt.

Argumente (optional): `$ARGUMENTS`
— z. B. `5000` für die Iterationszahl, `--seed=12345` zum Nachstellen eines
Laufs, `--fokus=workout` um einen Bereich besonders zu beackern. Ohne
Argumente gilt der Standard: 2500 Iterationen, zufälliger Seed.

---

## Das Grundgesetz

> **Ein Fehler gilt erst als behoben, wenn er
> (1) im Code gefixt,
> (2) in `docs/BUGS.md` dokumentiert und
> (3) durch einen Regressionstest in `test/check.mjs` dauerhaft abgesichert ist.**
>
> Zwei von drei reichen nicht. Ein Fix ohne Test ist eine Vermutung.

Daraus folgt das lernende Verhalten: Mit jedem `/check` wächst die Menge der
Dinge, die geprüft werden. Bugs von vor einem Jahr werden heute noch getestet.
**Das Register schrumpft nie.**

---

## Ablauf

### Phase 0 — Lage klären

1. `docs/BUGS.md` lesen. Das ist die Liste aller je gefundenen Fehler samt
   ihrer Muster. **Lies auch den Abschnitt „Muster über alle Fehler hinweg"** —
   er sagt dir, wo erfahrungsgemäß neue Fehler sitzen.
2. `test/check.mjs` lesen: welche Regressionen existieren schon, was deckt der
   Fuzzer bereits ab.
3. `git log --oneline -15` und `git diff --stat HEAD~1` — was hat sich seit dem
   letzten Lauf geändert? **Neuer Code ist der wahrscheinlichste Fehlerort.**

### Phase 1 — Den Harness laufen lassen

```bash
node test/check.mjs --iterations=2500
```

Der Harness hat vier Stufen (Details im Kopf der Datei):

| Stufe | Was sie tut | Wenn sie fehlschlägt |
|---|---|---|
| **SMOKE** | App starten, Onboarding, jeder Screen | Abbruch — alles Weitere ist Rauschen |
| **REGRESSION** | Ein Test pro `PB-NNN` aus `BUGS.md` | Ein alter Fehler ist zurück. Höchste Priorität. |
| **SYNC** | Anmelden, Cloud, zwei Geräte auf einem Konto (gefälschte Firestore) | Datenverlust im Sync. Sofort. |
| **FUZZ** | N zufällige Aktionen, nach **jeder** alle Invarianten | Neuer Fehler. Seed notieren. |

Bei einem Fehlschlag liefert der Report immer:
- die **Aktionsfolge** der letzten 12 Schritte,
- den **Seed** zum exakten Nachstellen,
- bei Ausnahmen den Stacktrace, bei Invarianten deren Namen.

### Phase 2 — Erweitern, wo noch nichts hinschaut

Der Harness deckt viel ab, aber nicht automatisch das, was **du gerade neu
gebaut hast**. Prüfe aktiv:

1. **Deckt der Fuzzer jede öffentliche Funktion ab?**

   ```bash
   node test/coverage.mjs          # scheitert, sobald ein Knopf ungetestet ist
   node test/coverage.mjs --alle   # mit vollständigen Listen
   ```

   Das Skript zählt alle `function name(` in `index.html` und sucht sie im
   Testskript. Die harte Regel steht in seinem Rückgabewert: **eine Funktion,
   die an einem `onclick` hängt und von keinem Test aufgerufen wird, lässt den
   Lauf scheitern.** Sie ist per Definition benutzbar, also auch prüfbar.

   Was nicht in der Seite testbar ist (Firebase, Reload, Service Worker),
   gehört mit Begründung in die `AUSSERHALB`-Tabelle des Skripts — nicht
   stillschweigend übergangen.

   Und die Warnung dazu: **„aufgerufen" ist nicht „geprüft".** Ein Aufruf ohne
   Zusicherung zählt in der Statistik mit und sichert nichts zu. Die
   Abdeckungszahl sagt dir, wo du gar nicht hinschaust — nicht, wie gut du
   hinschaust.

2. **Fehlt eine Invariante?** Für jede neue Datenstruktur gilt: Welche
   Eigenschaft muss **immer** gelten? Die gehört ins `INVARIANTS`-Array.

2b. **Belegt ein Nebenläufigkeitstest, dass die Nebenläufigkeit stattfand?**
   Ein Wettlauf-Test, der auch grün ist, wenn die Verschränkung nicht eintritt,
   prüft nichts — er ist ein Zufallsgenerator mit Häkchen. Also erst den
   Nachweis (`fs.ops('tx-conflict').length > 0`), dann den Vertrag. Siehe
   PB-069.

3. **Ist der Zufall breit genug?** Neue Eingabefelder brauchen Einträge in
   `NASTY`: leer, nur Leerzeichen, negativ, `NaN`, `Infinity`, 300 Zeichen,
   Emoji, Umlaute, `<script>`, `"` und `'`, Backslash, Pfad-Traversal.

4. **Grenzfälle, die Zufall selten trifft** — hier gezielt Regressionstests
   ergänzen:
   - Leerer Plan, ein Tag, ein Tag ohne Übungen
   - Historie leer / mit genau einem Eintrag
   - Erster Tag im Monat, letzter Tag, 29. Februar, Jahreswechsel
   - Alle Sätze übersprungen, Workout ohne einen geloggten Satz
   - Sommerzeitumstellung (Datumsberechnungen über `864e5`)
   - `localStorage` voll (Quota-Fehler)
   - Firestore nicht erreichbar (der Standardzustand im Test)

5. **Visuelle Prüfung.** Der Harness prüft Verhalten, nicht Aussehen.
   Screenshots von Dashboard, Workout, Stats, Übungs-Demo, Alternativen-Dialog
   und Plan-Editor aufnehmen und **wirklich ansehen**. Überlappender Text,
   abgeschnittene Elemente, unlesbare Kontraste und kaputte Diagramme findet
   kein Assert.

6. **Wenn der Nutzer einen Fokus genannt hat** (`--fokus=…`), dort besonders
   tief gehen: alle Funktionen dieses Bereichs einzeln durchspielen, nicht nur
   zufällig treffen lassen.

### Phase 3 — Beheben

Für jeden Fund, in dieser Reihenfolge:

1. **Minimal reproduzieren.** Seed und Aktionsfolge nutzen. Die kürzeste Folge
   finden, die den Fehler auslöst.
2. **Ursache verstehen, nicht Symptom bekämpfen.** Frag: *Welche Annahme trifft
   diese Funktion über eine andere, ohne sie durchzusetzen?* Ein `try/catch`
   um den Absturz ist kein Fix.
3. **Nach Geschwistern suchen.** Fast jeder Fehler hier hatte einen Zwilling
   an anderer Stelle (PB-008 zweimal, PB-018 zwölfmal). **Immer** per `grep`
   nach demselben Muster im ganzen Projekt suchen, bevor du weitergehst.
4. **Fixen** — mit kurzem Kommentar im Code, der das *Warum* festhält, nicht
   das *Was*.
5. **Prüfen, dass der Fix nichts kaputtmacht.** Zu jedem Sicherheitstest gehört
   der Zwillingstest, dass die Funktion noch funktioniert (siehe PB-019). Ein
   Escaping, das alles zerstört, wäre sicher und nutzlos.

### Phase 4 — Das Gedächtnis erweitern ⭐

**Dieser Schritt ist nicht optional.** Er ist der Grund, warum es `/check` gibt.

Für **jeden** in diesem Lauf gefundenen und behobenen Fehler:

1. **Eintrag in `docs/BUGS.md`** — nächste freie `PB-NNN`, Vorlage steht oben
   in der Datei. Pflichtfelder: Schwere, Klasse, Gefunden, Status, Symptom,
   Ursache, Fix, **Lektion**, Test.

   Die *Lektion* ist das Wertvollste. Nicht „Variable X war null", sondern die
   verallgemeinerbare Regel: *„Ein Guard schützt nur den synchron folgenden
   Code."*

2. **Zeile in der Statusübersicht** von `BUGS.md` ergänzen.

3. **Regressionstest in `test/check.mjs`** ins `REGRESSIONS`-Array, mit
   derselben ID und einem Titel, der den Fehler benennt.

4. **Gegenprobe — der wichtigste Schritt:** Fix kurz zurücknehmen, prüfen dass
   der neue Test **rot** wird, Fix wieder einsetzen, prüfen dass er **grün**
   wird. Ein Test, der ohne den Fix bestanden hätte, testet nichts.

5. **Muster-Tabelle am Ende von `BUGS.md` pflegen.** Passt der neue Fehler in
   eines der bestehenden fünf Muster? Dann dort eintragen. Wenn nicht: ein
   sechstes Muster aufmachen. Diese Tabelle ist der Kern des Lernens — sie
   sagt dir beim nächsten Feature, wo du zuerst hinschauen musst.

### Phase 5 — Verifizieren

```bash
# Mehrere unabhängige Kampagnen — ein grüner Lauf beweist wenig
for s in 11111 22222 33333 44444; do
  node test/check.mjs --iterations=2500 --seed=$s
done
```

Alle grün? Dann zusätzlich:

```bash
node test/check.mjs --iterations=10000     # eine lange Kampagne
```

**Erst wenn alles grün ist:** committen. Commit-Nachricht nennt die behobenen
`PB-NNN`-IDs.

### Phase 6 — Bericht

Kurz und ehrlich:

```
CHECK-BERICHT
─────────────
Regressionen:  58/58 bestanden
Sync:          5/5 bestanden (zwei Geräte, Transaktion, Barrieren, Zurücksetzen)
Fuzzing:       12 × 2500 + 2 × 25000 Iterationen über 91 Operationen
Invarianten:   22 × je Aktion
Abdeckung:     0 Funktionen am Knopf ohne Testaufruf (test/coverage.mjs)
Neue Fehler:   2 gefunden, 2 behoben
               PB-064 — <Titel> (niedrig, Fehlerbehandlung)
               PB-065 — <Titel> (mittel, Datenmodell)
Register:      66 Einträge, davon 3 offen (Backend)
Offen:         PB-021 (Firestore-Auth) — vom Betreiber als Risiko akzeptiert
```

Wurde **nichts** gefunden: das ebenso klar sagen — und dazu, was das *nicht*
beweist. Ein grüner Lauf heißt „diese 2500 Pfade sind sauber", nicht „die App
ist fehlerfrei". Ehrlich benennen, welcher Bereich am schwächsten abgedeckt ist,
und beim nächsten `/check` dort ansetzen.

---

## Was jeder Lauf mindestens abdecken muss

Diese Liste ist die Untergrenze. Fehlt hier etwas im Fuzzer oder in den
Regressionen, ergänze es in Phase 2.

**Lebenszyklus**
Login (Sync/Offline) · Onboarding alle 8 Schritte inkl. Zurück ·
Auto-Resume nach Reload · Logout · Alles löschen · Export · Import
(gültig, kaputt, leer, fremdes Schema)

**Trainingsplan**
Tag anlegen/umbenennen/duplizieren/löschen/sortieren · letzter Tag nicht
löschbar · Namenskollision · Wochentag-Mehrfachauswahl · Übung
hinzufügen/bearbeiten/löschen/verschieben · Bibliothek: anlegen, bearbeiten,
löschen, Basisübung überschreiben, Suche

**Workout**
Starten (mit/ohne Parameter, mit laufender Session) · Satz loggen (0, negativ,
riesig, Text, leer) · letzten Satz wiederholen · Satz bearbeiten/löschen
(Long-Press) · Übung überspringen und zurücknehmen · Übung tauschen (mit/ohne
geloggte Sätze, mit/ohne Plan-Übernahme) · Übung live ergänzen/entfernen/
umsortieren · Sätze ±  · Tag mitten im Workout wechseln (alle drei Strategien) ·
Kompaktmodus · Beenden (mit/ohne Sätze) · Timer: start/pause/weiter/reset/±

**Daten & Statistik**
Gewicht eintragen/löschen (Grenzwerte, Dubletten am selben Tag) · Größe,
Geburtsdatum (leer, ungültig, Zukunft) · EGYM an/aus, Messung speichern/löschen ·
Kalender: Monatswechsel über Jahresgrenze, Tag wählen/abwählen · Session löschen ·
Fitnessalter · Deload-Erkennung und Snooze · Krank-Modus · Alle Diagramme mit
0, 1, 2 und vielen Datenpunkten · Theme wechseln

**Sync-Logik** *(ohne echtes Firestore testbar)*
`mergeSyncedData` mit leerem/älterem/neuerem Remote · Tombstones ·
Konflikt bei gleicher Session-ID · Merge-Idempotenz: zweimal mergen == einmal

**Übungsbilder**
Zuordnung deutscher Namen → Datenbank-ID stimmt (Stichproben aus `EXPHOTO_MAP`) ·
erfundene Übungen liefern **kein** Foto (sonst zeigt die App eine falsche Übung) ·
alle referenzierten Dateien unter `assets/ex/` existieren · Fallback-Kette
lokal → GitHub-Raw → Zeichnung greift in dieser Reihenfolge · gezeichnete Figur
bleibt für alle 15 Bewegungsmuster im Bildausschnitt und die Last hängt am
richtigen Gelenk

**Sicherheit** — für **jedes** Freitextfeld
`<img src=x onerror=…>` · `"><svg onload=…>` · `'; alert(1); //` ·
`{{7*7}}` · `${…}` · Backslash · Emoji · 300 Zeichen · leer · nur Leerzeichen

---

## Die Invarianten

Das sind die Aussagen, die nach **jeder** Aktion gelten müssen. Sie sind das
schärfste Werkzeug des Fuzzers — ein Assert am Ende eines Testfalls prüft einen
Zustand, eine Invariante prüft alle.

Aktuell 22 Stück, siehe `INVARIANTS` in `test/check.mjs`. Kern davon:

- `D` bleibt serialisierbar (keine Zyklen, kein `undefined` an kritischer Stelle)
- Plan hat mindestens einen Tag, alle Übungen normalisiert (`rmax >= rmin`, `sets >= 1`)
- Aktive Session konsistent, kein geloggter Satz mit `NaN`
- Volumen endlich und nicht negativ
- Wochen-Landmarks streng aufsteigend, `mev > 0`
- Timer-Zeiten nie negativ
- **Keine injizierten `<script>`, Event-Handler-Attribute oder Fremdelemente im DOM**
- Tombstone-Listen bleiben Arrays
- Supersatz-Kennungen bleiben paarweise (eine Kopplung braucht zwei Übungen)
- Zeitschätzung endlich und nicht negativ, Mesozyklus-Faktor in (0, 1]
- Scheibenplan geht exakt auf (Scheiben + Rest = Zielgewicht pro Seite)

Bei neuen Features: Was muss hier immer gelten? Rein damit.

---

## Fallstricke, die schon einmal Zeit gekostet haben

- **XSS strukturell prüfen, nie per String.** `innerHTML` gibt Anführungszeichen
  aus Textknoten unescaped zurück — ein Regex meldet auch bei korrekt escaptem
  Inhalt einen Treffer. Prüfe stattdessen mit `querySelectorAll`, ob echte
  Elemente oder Handler entstanden sind.
- **Dialoge stubben.** `confirm`/`prompt`/`alert` blockieren den Fuzzer. Der
  Harness ersetzt sie und stellt sie danach wieder her.
- **Determinismus.** Immer den gleichen PRNG mit Seed benutzen. Ein Fehler, den
  man nicht nachstellen kann, ist ein Gerücht.
- **Die App muss nach dem Fuzzing noch bedienbar sein.** Der Harness prüft das
  am Ende — sonst maskiert ein früher Totalausfall alle folgenden Prüfungen.
- **Ein grüner Lauf beweist nichts.** Immer mehrere Seeds.
- **Keine Ausnahme für den eigenen Code.** Wenn eine Invariante beim eigenen
  Feature anschlägt (etwa ein Inline-`onerror` gegen die XSS-Prüfung), ist die
  erste Frage nicht „wie nehme ich mich aus?", sondern „warum brauche ich, was
  ich verbiete?". Eine Regel mit Selbstausnahme prüft nur noch, dass man sich
  selbst nicht überrascht. Ist die Regel wirklich zu breit, macht man sie
  **präziser** — nicht löchriger.
- **Für alles Visuelle: Kontaktbogen.** Alle Fälle nebeneinander rendern und
  Animationen einfrieren (`svg.pauseAnimations(); svg.setCurrentTime(0)`).
  Einzeln betrachtet sieht fast jeder Darstellungsfehler plausibel aus.

---

## Am Ende

Nach `/check` muss gelten:

- [ ] `node test/check.mjs` ist grün, über mindestens vier Seeds
- [ ] Jeder gefundene Fehler ist gefixt, in `BUGS.md` dokumentiert **und** durch
      einen Regressionstest abgesichert
- [ ] Jeder neue Test wurde gegen den nicht-gefixten Zustand rot gesehen
- [ ] Die Muster-Tabelle in `BUGS.md` ist aktuell
- [ ] Screenshots wurden angesehen, nicht nur erzeugt
- [ ] Der Bericht sagt auch, was **nicht** getestet wurde

Dann committen, mit den `PB-NNN`-IDs in der Nachricht.
