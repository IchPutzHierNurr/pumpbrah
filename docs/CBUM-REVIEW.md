# PUMPBRAH — durch die CBum-Brille

> Der zweite Blick auf dieselbe App. Nicht „ist der Code sauber", sondern:
> **Macht mich diese App stärker?**
>
> Geschrieben aus der Perspektive eines Athleten, der seit 15 Jahren jeden
> Satz aufschreibt und weiß, dass die App im Studio genau eine Aufgabe hat:
> *nicht im Weg stehen.*
>
> *(Rollenperspektive zum Lernen — kein Zitat und keine Aussage einer realen
> Person. Die Trainingsempfehlungen sind allgemeine Prinzipien aus der
> Trainingswissenschaft, keine individuelle Beratung.)*

---

## Der erste Eindruck: die App weiß, worum es geht

Ich sehe RIR statt „wie fühlte sich das an, 1–10". Ich sehe MEV/MAV/MRV.
Ich sehe eine Deload-Erkennung. Ich sehe getrennte Kategorien für Pre-Workout,
Hauptübung und Mobility.

Das ist kein Zufall. Die meisten Tracking-Apps sind Excel mit runden Ecken —
sie zählen Kilogramm und sind zufrieden. Diese hier hat die richtigen Konzepte
im Fundament. **Deshalb lohnt sich die harte Kritik überhaupt.**

Was folgt, ist keine Abrechnung. Es ist die Liste dessen, was zwischen
„gute App" und „die App, die ich im Studio wirklich benutze" steht.

---

## 1. Der Wochenring hat mich angelogen

Das war der Punkt, an dem ich das Telefon weggelegt hätte.

Ganz oben auf dem Dashboard, größte Zahl auf dem Bildschirm: dein Wochenvolumen,
eingeordnet in MEV / MAV / MRV. Minimum effektives Volumen, maximal
adaptives Volumen, maximal erholbares Volumen. Das sind die drei Zahlen,
nach denen ernsthaftes Hypertrophietraining gesteuert wird.

Nur waren die Grenzen **aus deinem eigenen Wert berechnet.** MEV war immer
66 % von dem, was du gemacht hast. MAV immer 124 %.

Was das praktisch heißt:

| Du machst | „MEV" | „MAV" | Anzeige |
|---:|---:|---:|:---|
| 4 Sätze | 24 | 48 | UNTER MEV |
| 36 Sätze | 24 | 48 | IM MAV ✅ |
| 90 Sätze | 59 | 112 | IM MAV ✅ |

Neunzig Sätze pro Woche. Das ist der Bereich, in dem du dich in Grund und
Boden trainierst, deine Gelenke ruinierst und **weniger** Muskeln aufbaust als
mit der Hälfte. Und die App sagt grünes Licht.

Ein Anfänger richtet sein Training nach dieser Anzeige aus. Er sieht Grün,
also macht er weiter. Er wird schwächer, versteht nicht warum, und die App
sagt ihm die ganze Zeit, dass alles optimal ist.

**Eine Zahl, der man nicht trauen kann, ist schlimmer als gar keine Zahl.**
Ohne Anzeige hört man auf seinen Körper. Mit einer falschen Anzeige hört man
auf die Anzeige.

Jetzt kommen die Grenzen aus festen Richtwerten pro Muskelgruppe und werden
über die im Plan tatsächlich trainierten Gruppen summiert:

| Muskelgruppe | MEV | MAV | MRV |
|---|---:|---:|---:|
| Brust | 8 | 16 | 22 |
| Rücken | 10 | 18 | 25 |
| Beine | 8 | 16 | 22 |
| Schultern | 6 | 14 | 20 |
| Arme | 6 | 14 | 20 |
| Core | 4 | 10 | 16 |

Das sind Orientierungswerte, keine Naturgesetze — individuelle Streuung ist
groß, und der eigene Verlauf über Wochen schlägt jede Tabelle. Aber sie sind
**extern**. Sie bewegen sich nicht mit, wenn du dich bewegst. Das ist der
ganze Punkt eines Maßstabs.

---

## 2. Cardio hat deine Statistik aufgeblasen

30 Minuten StairMaster auf Stufe 12 wurden als **360 kg Volumen** gebucht.
Stufe × Minuten, als wären es Kilo × Wiederholungen.

Das ist nicht nur eine kaputte Zahl. Das verzerrt jede Entscheidung, die auf
Volumen aufbaut:

- Deine Wochentonnage sah aus, als hättest du mehr gehoben.
- Die Deload-Erkennung sah Volumen, wo Erholungsarbeit war — und schlug
  seltener an.
- „Max Gewicht" in den Stats konnte die Widerstandsstufe deines Ergometers sein.
- Der Ø-RIR mischte „ich hatte noch 2 Wiederholungen in der Brust" mit
  „ich bin 30 Minuten locker gelaufen".

Cardio und Krafttraining in einer App zu haben ist richtig. Sie in einen Topf
zu werfen ist es nicht. Jetzt zählt Cardio in Minuten, taucht separat in der
Session-Zusammenfassung auf und fließt in keine Tonnage, keinen RIR-Schnitt
und keine Volumenampel mehr ein.

Genauso wichtig: **Mobility und Pre-Workout zählen nicht mehr ins
Hypertrophie-Volumen.** Drei Sätze Tibialis Raises sind Gelenkarbeit — gut,
notwendig, aber sie machen keine Brust größer und dürfen deine
Volumenampel nicht auf Rot schieben.

---

## 3. Der Trainingsplan war ein Aktenschrank, kein Werkzeug

Das ist der Teil, der mich als Praktiker am meisten gestört hat.

**Situation:** Du stehst im Studio. Die Beinpresse ist besetzt. Alle drei
Hantelbänke auch. Du hast noch 40 Minuten.

Was du brauchst: *drei Sekunden, um umzudisponieren.*
Was die App vorher konnte:

- **Übung tauschen** → Alle geloggten Sätze wurden gelöscht. Deine zwei Sätze
  Bankdrücken, die du schon gemacht hattest? Weg. Ohne Warnung.
- **Anderen Tag trainieren** → `startWorkout(pk)` hat den Parameter kommentarlos
  verschluckt, wenn schon eine Session lief. Der Button reagierte einfach nicht.
- **Übung spontan ergänzen** → Ging nicht. Gar nicht.
- **Reihenfolge ändern** → Ging nicht.
- **Übung überspringen** → Löschte deine geloggten Sätze.
- **Trainingstag umbenennen** → Zwei `prompt()`-Dialoge hintereinander, ohne
  Mehrfachauswahl der Wochentage.

Jeder einzelne dieser Punkte zwingt dich, aus dem Training rauszugehen und
mit der App zu kämpfen. Und zwischen zwei schweren Sätzen ist genau das der
Moment, in dem du das Handy wegsteckst und nichts mehr aufschreibst.
**Eine Trainings-App verliert ihren Nutzer nicht durch Abstürze — sondern
durch Reibung.**

Was jetzt geht, direkt im laufenden Workout:

| Aktion | Verhalten |
|---|---|
| **Tag wechseln** | Drei Strategien zur Auswahl: anhängen · nur Geloggtes behalten · komplett ersetzen. Geloggte Sätze gehen nie ungefragt verloren. |
| **Übung tauschen** | Bewegungsmuster-Treffer zuerst, dann gleiche Muskelgruppe, dazu Freitextsuche. Geloggte Sätze bleiben unter der Originalübung stehen. Optional dauerhaft in den Plan übernehmen. |
| **Übung ergänzen** | Ganze Bibliothek mitten im Workout, landet nur in dieser Session. |
| **Reihenfolge** | ↑ / ↓ pro Übung. |
| **Sätze anpassen** | ± direkt an der Übung, blockiert unter der bereits geloggten Anzahl. |
| **Überspringen** | Mit Rückfrage, wenn Sätze drauf sind — und rückgängig machbar. |
| **Kompaktmodus** | Bei 12 Übungen scrollst du sonst dich zu Tode. |

Der wichtigste Punkt davon ist der Tausch. Wenn du zwei Sätze Bankdrücken
gemacht hast und dann auf die Brustpresse ausweichst, dann hast du **beides
trainiert**. Die alte Übung wird auf die geloggte Satzzahl gekürzt und bleibt
als erledigter Block stehen, die neue kommt darunter. So sieht es in deinem
Trainingstagebuch aus, und so gehört es in die Historie.

---

## 4. Was gefehlt hat: das Ziel für den nächsten Satz

Die App hat dir gezeigt, was du **letztes Mal** gemacht hast. Gut. Aber die
Frage, die vor jedem Satz im Kopf steht, ist eine andere:

> *Was muss ich jetzt machen, damit es besser war als letztes Mal?*

Progressive Überlastung ist nicht „mehr Gewicht". Sie ist ein Verfahren, und
das übliche heißt **doppelte Progression**: erst die Wiederholungen im
Zielkorridor nach oben, dann das Gewicht — und die Wiederholungen fallen
zurück an den unteren Rand.

Beispiel bei 8–12 Wiederholungen:

```
Woche 1:  80 kg × 8   →  Ziel nächstes Mal: 80 kg × 9
Woche 2:  80 kg × 9   →  Ziel nächstes Mal: 80 kg × 10
...
Woche 5:  80 kg × 12  →  obere Grenze erreicht
Woche 6:  82,5 kg × 8 →  Gewicht rauf, Wiederholungen zurück
```

Das rechnet die App jetzt für dich aus und zeigt es an zwei Stellen: an der
Übung in der Workout-Liste und direkt über den Eingabefeldern im Log-Dialog.

```
🎯 Ziel: 80 kg × 9 — letztes Mal 80 kg × 8 @ RIR 2
📈 Letztes Mal 80 kg × 12 — obere Grenze erreicht. Jetzt 82,5 kg bei 8 Wdh.
```

Die Gewichtsschritte sind an die Last angepasst: 2,5 kg ab 60 kg, 2 kg ab
20 kg, 1 kg darunter. Bei einer 12-kg-Kurzhantel um 2,5 kg zu springen sind
über 20 % mehr Last — das schafft niemand sauber. Bei 140 kg Beinpresse ist
1 kg Rauschen.

Ein Detail, das mir wichtig war: **Ein PR gegen nichts ist kein PR.**
Vorher wurde dein allererster Satz einer Übung mit „🏆 NEUER PR!" gefeiert.
Das entwertet die Meldung. Jetzt gibt es Konfetti nur, wenn es tatsächlich
etwas zu schlagen gab.

---

## 5. Übungsausführung: das Kamera-Icon war eine Falle

Ein 📷-Icon neben jeder Übung. Ich tippe drauf, weil ich wissen will, wie
Katana Extensions gehen. Was passiert: **Neuer Browser-Tab. Google-Bildersuche.**

Im Studio heißt das: schlechtes WLAN, Werbebanner, drei Ladesekunden, und
wenn ich zurückkomme, bin ich aus meinem Workout gefallen. Im Keller ohne
Empfang passiert gar nichts.

Jetzt zeigt jede Übung eine **animierte Strichfigur direkt in der App**.
Kein Netzwerk, kein Tab-Wechsel, keine Ladezeit — das SVG wird zur Laufzeit
aus dem Übungsnamen erzeugt.

Das Bewegungsmuster wird aus dem Namen erkannt — 15 Muster, die den Großteil
des Krafttrainings abdecken:

`hinge` · `squat` · `push` · `pushh` · `pulld` · `row` · `curl` · `triext` ·
`raise` · `legext` · `legcurl` · `calf` · `core` · `cardio` · `mobility`

Und dazu, was eine Bewegung wirklich ausmacht:

- **Bewegungsmuster** — „Horizontales Drücken", nicht „Brustübung"
- **Zielmuskulatur** — Brust · vordere Schulter · Trizeps
- **Ausführungs-Cue** — der eine Satz, der den Unterschied macht:
  *„Schulterblätter zusammen und nach unten fixieren. Ellenbogen ca. 45°,
  kein Ausleiern in der untersten Position."*
- **Tempo-Umschalter** — 2 s zügig / 3 s normal / **5 s betonte Exzentrik**

Der 5-Sekunden-Modus ist kein Gimmick. Die exzentrische Phase — das
kontrollierte Ablassen — ist der Teil, den fast alle verschenken, und sie ist
für den Hypertrophie-Reiz mindestens so wichtig wie das Hochdrücken. Eine
Animation, die dir zeigt, wie langsam „langsam" wirklich ist, macht mehr für
deine Technik als jedes Standbild.

Ist eine Strichfigur ein Ersatz für ein echtes Formvideo? Nein. Für die
Feinheiten brauchst du Video oder besser einen Menschen, der zuschaut. Der
🔎-Button für die Websuche ist deshalb geblieben — aber als **bewusste
Entscheidung**, nicht als einziger Weg.

---

## 6. Der Volumen-Radar: was der Spiegel nicht zeigt

Neu in den Stats. Sechs Achsen, eine Fläche, ein Blick.

Sechs Balken untereinander lesen sich nacheinander. Eine Fläche liest sich
**auf einmal** — und Asymmetrie springt einem sofort ins Auge. Wenn die Fläche
nach vorne ausbeult und hinten einbricht, siehst du das Muster, bevor du eine
einzige Zahl gelesen hast.

Und das ist genau das Muster, das man im Spiegel nicht sieht. Man sieht, was
man von vorne sieht: Brust, Arme, Schultern. Rücken und Beinbeuger sieht man
nie. Deshalb sind sie bei fast jedem unterentwickelt — nicht aus Faulheit,
sondern weil das Feedback fehlt.

Der Radar misst gegen MAV, nicht gegen MRV. Denn MAV ist das Ziel, nicht die
Obergrenze. Man will nicht ans Maximum, man will ins Optimum.

Darunter steht die einzige Zeile, die zählt: **welcher Bereich am weitesten
zurückliegt.** Das ist deine Aufgabe für nächste Woche.

---

## 7. Was jetzt Spaß macht

Tracking ist eine Gewohnheit, und Gewohnheiten leben von sofortiger Rückmeldung.
Wenn das Loggen sich wie Buchhaltung anfühlt, hörst du in drei Wochen auf.

Was dazugekommen ist:

- **Satzpunkte** pro Übung — drei Punkte, zwei gefüllt, einer pulsiert.
  Du siehst deinen Stand, ohne zu lesen.
- **Sich zeichnende Diagramme.** Die Linie läuft von links nach rechts,
  die Fläche blendet nach, die Punkte poppen gestaffelt. Man wartet kurz
  darauf — und schaut deshalb hin.
- **Hochzählende Zahlen.** Deine Wochensätze zählen von 0 hoch. Kostet nichts,
  fühlt sich nach Fortschritt an.
- **Konfetti beim PR.** Kurz, laut, dann weg. Aber nur bei einem echten PR.
- **Haptik.** Jeder geloggte Satz vibriert kurz. Beim PR ein anderes Muster.
  Man merkt es nicht bewusst — man vermisst es sofort, wenn es fehlt.
- **Antippbare Datenpunkte.** Jeder Punkt in jedem Chart zeigt Wert und Datum.
- **Sich bewegende Übungsfiguren.** Selbst die 38-Pixel-Thumbnails in der
  Bibliothek animieren. Eine Liste, die atmet, lädt zum Stöbern ein.
- **Fortschrittsbalken über dem Workout.** 4/12 Übungen. Man will ihn vollmachen.

Und das Wichtigste, das man nur merkt, wenn es fehlt: **der Bildschirm bleibt
an.** Wake Lock während des Workouts. Vorher musstest du zwischen jedem Satz
entsperren.

Alles davon respektiert `prefers-reduced-motion`. Wer Bewegung auf dem Gerät
abgeschaltet hat, bekommt dieselbe App ohne einen einzigen Effekt.

---

## 8. Der Pausentimer — kaputt an der wichtigsten Stelle

Zwischen zwei schweren Sätzen sind zwei bis drei Minuten Pause keine
Empfehlung, sondern die Bedingung dafür, dass der nächste Satz zählt.
Zu kurz und du machst weniger Wiederholungen mit weniger Last — weniger
Reiz bei mehr Ermüdung.

Der Timer hatte drei Fehler:

1. **Pause drücken und weiter → Timer sprang auf voll zurück.** 20 Sekunden
   Restpause wurden wieder 150. Man probiert das einmal und benutzt die
   Pause-Taste nie wieder.
2. **App im Hintergrund → Timer weg.** Nachricht beantwortet, zurückgewechselt,
   Timer war auf Null. Man weiß nicht mehr, wie lange man wirklich Pause hatte.
3. **Der Piepton war eine leere Audiodatei.** Null Samples. Also hat man auf
   den Bildschirm gestarrt, statt sich auf den nächsten Satz einzustellen.

Alle drei behoben: Restzeit wird beim Pausieren eingefroren, der Zustand
überlebt einen Reload, und der Ton kommt jetzt aus der WebAudio-API — zwei
Töne mit Hüllkurve, ohne Datei, ohne Netzwerk.

---

## 9. Was ich als Nächstes bauen würde

Ehrliche Priorisierung. Nicht alles ist gleich wichtig.

**Hoch — echter Trainingsnutzen:**

1. **Aufwärmsatz-Rechner.** Vor 100 kg Bankdrücken gehören 4×20, 60×8, 80×5,
   90×2. Das rechnet die App aus der Arbeitslast aus und logt es getrennt,
   ohne das Arbeitsvolumen zu verfälschen.
2. **Sekundäre Muskeln im Volumen.** Bankdrücken ist nicht nur Brust — es sind
   ~0,5 Sätze Trizeps und ~0,5 Sätze vordere Schulter. Wer 20 Sätze Drücken
   macht und dann „nur 6 Sätze Trizeps" sieht, unterschätzt seine Armbelastung
   massiv. Das ist der häufigste Grund für Ellenbogenprobleme.
3. **e1RM-Verlauf statt Maximalgewicht.** Das All-Time-Max ist ein einzelner
   guter Tag. Der geschätzte 1RM über die Zeit ist der ehrliche Kraftverlauf —
   und zeigt Stagnation Wochen früher.
4. **Deload, der auch etwas tut.** Das Banner erkennt den Bedarf richtig,
   empfiehlt aber nur. Ein Knopf „Deload-Woche starten", der alle Zielgewichte
   auf 60 % setzt und RIR auf 4–5 anhebt, wird tatsächlich benutzt.

**Mittel — Datenqualität:**

5. **Supersätze.** Zwei Übungen mit gemeinsamem Timer. Verändert die
   Pausenlogik komplett und wird in fast jedem Armtraining gebraucht.
6. **Tempo-Erfassung.** 3-1-1-0 als Feld. Wer Tempo vorgibt, sollte es messen.
7. **Wöchentlicher Check-in.** Schlaf, Stress, Muskelkater als drei Regler.
   Ohne diesen Kontext ist jede Stagnations-Analyse Kaffeesatzleserei —
   schlechter Schlaf erklärt mehr Leistungseinbrüche als jedes Trainingsdetail.

**Niedrig, aber schön:**

8. Fotoverlauf mit gleicher Pose und gleichem Licht — der ehrlichste Gradmesser.
9. Übungsvideo pro Übung selbst aufnehmen, lokal gespeichert.
10. Plan-Export als Bild zum Teilen.

---

## Fazit

Die App hatte das Richtige im Kopf und Fehler in den Details, die genau dort
weh tun, wo es zählt: bei den Zahlen, denen du dein Training anvertraust,
und bei der Reibung zwischen zwei Sätzen.

Die Zahlen stimmen jetzt. Die Reibung ist weg. Der Rest — Aufwärmsätze,
sekundäre Muskeln, echter Deload — ist die nächste Runde.

Zum Schluss der einzige Satz, der wirklich zählt, und den keine App für dich
erledigt:

> **Das beste Trackingsystem der Welt ersetzt keinen einzigen Satz.
> Es sorgt nur dafür, dass du den nächsten besser machst als den letzten.**

Jetzt geh trainieren. 💪
