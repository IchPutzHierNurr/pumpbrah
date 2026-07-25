# PUMPBRAH — Visueller Masterprompt

> Geschrieben aus der Perspektive eines Designers/Entwicklers, wie er bei
> WHOOP oder Apple Fitness arbeiten würde. Das ist eine **Rollenperspektive**,
> kein Zitat und keine Aussage einer realen Person oder Firma.
>
> Dieses Dokument ist zweierlei: die **Design-Vorgabe** (was gebaut wird) und
> die **Begründung** (warum genau so). Wer die App weiterentwickelt, liest
> zuerst hier — jede neue Fläche muss sich an diesen Regeln messen lassen.

---

## 0. Der Auftrag in einem Satz

**Durch die App zu scrollen muss sich lohnen, auch wenn man gerade gar nichts
tracken will.**

Das ist kein Schmuck-Ziel. Eine Trainings-App wird nur benutzt, wenn sie
außerhalb des Trainings geöffnet wird. Wer sie nur zum Loggen öffnet, hört nach
sechs Wochen auf. Apple Fitness und WHOOP leben davon, dass man morgens
reinschaut, ohne einen Grund zu haben. Der Grund ist die Fläche selbst.

---

## 1. Was vorher falsch war (ehrliche Bestandsaufnahme)

Die App vor diesem Umbau war technisch sauber und visuell **belanglos**:

| Problem | Konkret |
|---|---|
| **Ein Ton, eine Fläche** | Dunkelgrau auf Dunkelgrau, ein Limegrün als Akzent. Jede Karte sah aus wie jede andere. |
| **Keine Hierarchie** | Die wichtigste Zahl der Woche war 32 px groß, die Beschriftung daneben 11 px. Verhältnis 3:1 — das liest das Auge als „gleich wichtig". |
| **Statisch beim Scrollen** | Alles bewegte sich mit derselben Geschwindigkeit. Eine Fläche ohne Parallaxe wirkt wie ein PDF. |
| **Kein Signature-Element** | Apple hat die Ringe. WHOOP hat den Strain-Bogen. PUMPBRAH hatte einen Halbkreis, den man auch in jeder Wetter-App findet. |
| **Farbe ohne Bedeutung** | Der Akzent war überall — auf Buttons, Rändern, Icons, Text. Wenn alles hervorgehoben ist, ist nichts hervorgehoben. |
| **Animation = Deko** | Ein Fade-in beim Screenwechsel. Aber keine Animation, die *etwas erklärt.* |

---

## 2. Die sechs Regeln

### Regel 1 — Eine Zahl regiert jeden Bildschirm

Auf jeder Fläche gibt es **genau eine** Zahl, die man aus zwei Metern Abstand
lesen kann. Alles andere ordnet sich unter.

```
Heldenzahl     72–96 px   Bebas Neue, line-height 0.82, tabular
Sekundärzahl   28–34 px   Bebas Neue
Label          10 px      uppercase, letter-spacing .18em, 700, text3
Fließtext      13–15 px   Space Grotesk
```

Das Verhältnis Heldenzahl zu Label ist **7:1 bis 9:1**, nicht 3:1. Dieser
Kontrast ist der wirksamste Einzelhebel im ganzen Dokument. Er kostet nichts
und verändert die Wahrnehmung einer Fläche komplett.

Zahlen sind immer `font-variant-numeric: tabular-nums`. Eine Zahl, die beim
Hochzählen springt, weil die 1 schmaler ist als die 8, sieht billig aus.

### Regel 2 — Der Akzent ist ein Zustand, keine Farbe

Der Akzent markiert **eine** Sache pro Fläche: den aktiven Zustand, den
primären Weg nach vorn. Nicht Ränder. Nicht Icons. Nicht Überschriften.

Bedeutung liegt in der **semantischen Palette**, die unabhängig vom gewählten
Akzent ist und nie mit ihm verwechselt werden darf:

```
unter MEV     Bernstein   #ffb020    zu wenig Reiz
im MAV        Grün        #2ee06a    Zielkorridor
über MRV      Rot         #ff3b5c    Erholung gefährdet
neutral/info  Blau        #4ea1ff
```

Wenn ein Nutzer den Akzent auf Rot stellt, darf „über MRV" nicht plötzlich wie
der Normalzustand aussehen. Deshalb sind Landmark-Farben hart kodiert.

### Regel 3 — Tiefe entsteht durch Licht, nicht durch Rahmen

Eine Fläche auf dunklem Grund wirkt körperlich, wenn sie eine **obere
Innenkante** hat (`inset 0 1px 0 rgba(255,255,255,.07)`) und einen Schatten,
der weiter fällt als die Karte hoch ist. Rahmen sind das Gegenteil: sie kleben
die Fläche auf.

Vier Materialstufen, mehr nicht:

```
Grund      #0a0b0e + radialer Akzent-Schimmer am oberen Rand
Karte      mat-1 über bg2, edge, shadow-1
Erhöht     mat-1 über bg3, edge-strong, shadow-2   (Hero, aktive Session)
Glas       nur wo wirklich etwas durchscrollt      (Nav, Sheets, Kopfzeile)
```

Backdrop-Filter kostet auf dem iPhone Bildrate. Er gehört an vier Stellen —
nicht auf jede Karte.

### Regel 4 — Scrollen ist eine Choreografie

Beim Scrollen passieren **vier** Dinge gleichzeitig, aber unterschiedlich
schnell. Genau diese Geschwindigkeitsdifferenz erzeugt das Gefühl von Raum:

1. **Kopfzeile** kollabiert von groß (38 px) auf kompakt (23 px), Glas fährt hoch — gesteuert über eine CSS-Variable `--t` (0..1), keine Klassenumschaltung, kein Layout-Sprung.
2. **Hero** driftet langsamer als der Inhalt (Parallaxe ~14 %) und verliert leicht an Deckkraft.
3. **Karten** treten von unten ein: 18 px hoch, 0.985 skaliert, mit **gestaffelter** Verzögerung (40 ms pro Karte, gedeckelt bei 5).
4. **Fortschrittsleiste** unter der Kopfzeile zeigt, wo man im Bildschirm ist.

Die Staffelung ist der Punkt. Alle Karten gleichzeitig einzublenden liest sich
als Fehler; nacheinander liest es sich als Absicht.

**Nur was unterhalb der Falz liegt, bekommt einen Reveal.** Ein Element, das
schon sichtbar ist und trotzdem erst eingeblendet wird, ist ein Bug, kein
Effekt.

### Regel 5 — Bewegung erklärt, sonst gehört sie weg

Jede Animation beantwortet eine Frage:

| Bewegung | Erklärt |
|---|---|
| Ring zeichnet sich von 0 auf | „So viel von deinem Ziel ist erledigt" |
| Zahl zählt hoch (ease-out) | „Diese Zahl ist ein Ergebnis, kein Etikett" |
| Karte tritt von unten ein | „Das ist neu im Blickfeld" |
| Thumb gleitet im Umschalter | „Du bist von A nach B gewechselt, nicht woandershin" |
| Balken wächst in seine Zone | „Hier stehst du im Korridor" |

Ein Puls, der nichts bedeutet, ist Lärm. Ein Glow ohne Zustand ist Lärm.

Alles hört bei `prefers-reduced-motion: reduce` auf — und zwar wirklich alles,
inklusive SMIL in den Übungsgrafiken.

### Regel 6 — Anfassen muss sich anfühlen

- Druckzustand: `scale(.97)` in 120 ms mit Spring-Kurve, nicht linear.
- Trefferfläche nie unter 44 × 44 px.
- Haptik bei Zustandswechseln — nicht bei jedem Tap.
- Formularfelder mindestens 16 px. Darunter zoomt iOS beim Fokus hinein und
  kommt nicht von allein zurück. Das ist keine Geschmacksfrage.

---

## 3. Das Signature-Element: die Trainingsringe

Apple hat drei Ringe. WHOOP hat einen Bogen. PUMPBRAH bekommt **drei
konzentrische Ringe**, die zusammen die einzige Frage beantworten, die eine
Trainingswoche stellt: *war das genug, oft genug, hart genug?*

| Ring | Misst | Ziel | Farbe |
|---|---|---|---|
| **Außen — VOLUMEN** | Arbeitssätze der Woche | MAV der geplanten Muskeln | Landmark-Farbe (Bernstein/Grün/Rot) |
| **Mitte — FREQUENZ** | Trainingstage der Woche | Anzahl Plantage | Blau → Cyan |
| **Innen — INTENSITÄT** | Anteil Sätze mit RIR ≤ 2 | 55 % der Arbeitssätze | Violett → Magenta |

Bauregeln:

- Strich als **Verlauf** entlang des Bogens (`<linearGradient>` mit
  `gradientUnits="userSpaceOnUse"`), nicht als Vollton. Ein Vollton-Ring wirkt
  wie ein Ladebalken; ein Verlauf wirkt wie eine Messung.
- Ein zweiter, unscharfer Ring darunter (`feGaussianBlur`) als Glühen. Das ist
  der Unterschied zwischen „SVG" und „Display".
- Spur (Track) ist derselbe Ring in 8 % Deckkraft — nie ein anderes Grau.
- Überschreitung (> 100 %) läuft in den Ring hinein weiter und trägt den
  Übergangspunkt sichtbar: nicht abschneiden, überzeichnen.
- Zeichnen per `stroke-dasharray` / `stroke-dashoffset` über 1.1 s
  `cubic-bezier(.22,1,.36,1)`, gestartet **erst wenn sichtbar**.
- In der Mitte steht die Heldenzahl. Nicht drei Zahlen. Eine.

---

## 4. Typografie-Stack

```
Bebas Neue      Zahlen, Heldenzahlen, Screen-Titel
Space Grotesk   UI, Fließtext, Buttons
JetBrains Mono  Messwerte in Zeilen, Zeiten, kg-Werte in Tabellen
```

Regel: Wenn eine Zahl **verglichen** wird (Tabelle, Satzliste, Timer), ist sie
Mono. Wenn eine Zahl **gefeiert** wird (Wochenvolumen, Session-Dauer, PR), ist
sie Bebas. Beides in derselben Zeile zu mischen ist immer falsch.

---

## 5. Bewegungs-Kurven

```
--ease   cubic-bezier(.4,0,.2,1)      Standard
--sp     cubic-bezier(.34,1.56,.64,1) Spring, für Druck & Thumb
--out    cubic-bezier(.22,1,.36,1)    Ausklang, für Ringe & Zähler
```

Dauern: Mikro 120 ms · Element 320 ms · Fläche 380 ms · Ring 1100 ms.
Nichts dazwischen erfinden.

---

## 6. Abnahmekriterien

Ein Bildschirm ist fertig, wenn:

- [ ] Man aus zwei Metern erkennt, welche Zahl die wichtigste ist.
- [ ] Der Akzent auf der Fläche **höchstens zwei** Dinge markiert.
- [ ] Beim Scrollen mindestens zwei Ebenen unterschiedlich schnell laufen.
- [ ] Jede Animation eine Frage aus Regel 5 beantwortet.
- [ ] `prefers-reduced-motion` die Fläche vollständig ruhigstellt, ohne dass
      Information verloren geht.
- [ ] Auf 375 px Breite (iPhone SE/13 mini) nichts umbricht oder abgeschnitten wird.
- [ ] Kein Formularfeld unter 16 px.
- [ ] Der Bildschirm funktioniert mit **leeren Daten** — Tag 1, keine Historie.

Der letzte Punkt ist der, der in der Praxis am häufigsten scheitert und am
meisten wehtut: Der erste Eindruck der App ist immer der leere Zustand.

---

## 7. Umsetzung in diesem Repo

| Regel | Wo im Code |
|---|---|
| Materialstufen | CSS-Abschnitt „MATERIAL-SYSTEM", `--mat-1`, `--edge`, `--shadow-*` |
| Kopfzeile | `.ltitle` + `attachLargeTitles()` (setzt `--t`) |
| Scroll-Choreografie | `attachScrollChoreography()` — Parallaxe, Fortschritt, Staffelung |
| Reveal | `.reveal` / `attachReveals()` — nur unterhalb der Falz |
| Trainingsringe | `buildTrainingRings()` + `.rings-*` |
| Heldenzahlen | `.hero-num`, `.stat-hero` |
| Zähler | `runCountUps()` / `.countup` |
| Semantische Farben | `--red` / `--green` / `--orange` / `--blue`, hart kodiert in `buildTrainingRings` |
| Reduced Motion | Media-Query am Ende des Stylesheets |
