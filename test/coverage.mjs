/**
 * ABDECKUNG — welche Funktion ruft überhaupt jemand auf?
 *
 * Entstanden aus einer einzigen Frage: „Ist wirklich jede Funktion geprüft?"
 * Die ehrliche Antwort war damals nein, und sie war nicht durch Nachdenken zu
 * bekommen — sondern nur durch Zählen.
 *
 * Das Skript ist bewusst grob: es liest `function name(` aus index.html und
 * sucht nach `name(` in test/check.mjs. Es misst also, ob eine Funktion
 * *aufgerufen* wird, nicht ob sie *geprüft* wird. Ein Aufruf ohne Zusicherung
 * zählt hier mit. Trotzdem ist die Zahl nützlich, weil ihre andere Richtung
 * hart ist: was hier gar nicht auftaucht, ist mit Sicherheit ungetestet.
 *
 *   node test/coverage.mjs            Übersicht
 *   node test/coverage.mjs --alle     mit vollständigen Listen
 *
 * Bekannt und beabsichtigt unerreichbar (siehe README, „Was nicht geprüft
 * wird"): alles, was die Seite neu lädt, den Speicher leert oder Firebase
 * braucht. Diese Namen stehen unten in AUSSERHALB und werden getrennt
 * ausgewiesen, statt die Bilanz zu verwässern.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const app = fs.readFileSync(path.join(here, '..', 'index.html'), 'utf8');
const test = fs.readFileSync(path.join(here, 'check.mjs'), 'utf8');
const ALLE = process.argv.includes('--alle');

/* Nicht in der Seite testbar — jeder Eintrag mit Begründung.
   Die Liste ist leer, und das ist die Pointe des ganzen Audits: Sie stand
   einmal bei acht. Sieben fielen weg, als die gefälschte Firestore kam
   (test/fakestore.mjs), der achte mit einem dreißigzeiligen HTTP-Server
   (test/httpserve.mjs) — beide Male war „nicht testbar" nur eine Abkürzung
   für „noch niemand hat nachgesehen, wie klein die Schnittstelle ist". */
const AUSSERHALB = {};

/* Funktionen, die kein Test beim Namen nennt, weil sie über einen Klick
   angesteuert werden. Ohne diese Liste meldet das Skript einen Fehlalarm —
   und genau das tat es: `offlineMode` läuft in JEDEM Lauf (der SMOKE-Schritt
   klickt „Offline-Modus"), das grep sah nur `name(` und fand nichts.
   Ein Eintrag hier ist eine Behauptung mit Adresse: wer sie prüfen will,
   findet den Test. */
const UEBER_DIE_OBERFLAECHE = {
  offlineMode: 'SMOKE — click(text=Offline-Modus (ohne Sync))',
  doLogin: 'SYNC PB-067/068/069/070 — click(text=LOS GEHT\'S)',
  obNext: 'SMOKE + SYNC — click(#ob-content .btn) durch alle acht Schritte',
  finishOnboarding: 'SMOKE + SYNC — letzter Onboarding-Schritt'
};

const fns = [...app.matchAll(/^function ([A-Za-z_$][\w$]*)\s*\(/gm)].map(m => m[1]);
const uniq = [...new Set(fns)].sort();
const inTest = n => new RegExp('\\b' + n + '\\s*\\(').test(test);
const inMarkup = n => new RegExp('(onclick|oninput|onchange|onpointerdown|ontouchstart|onsubmit)="[^"]*\\b'
  + n + '\\s*\\(').test(app);

const rows = uniq.map(n => ({ n, test: inTest(n) || !!UEBER_DIE_OBERFLAECHE[n],
  perKlick: !inTest(n) && !!UEBER_DIE_OBERFLAECHE[n],
  ui: inMarkup(n), aus: !!AUSSERHALB[n] }));
const getestet = rows.filter(r => r.test);
const perKlick = rows.filter(r => r.perKlick);
const nurUi = rows.filter(r => !r.test && r.ui && !r.aus);
const intern = rows.filter(r => !r.test && !r.ui && !r.aus);
const aussen = rows.filter(r => !r.test && r.aus);

const p = (a, b) => (a / b * 100).toFixed(1).replace('.', ',') + ' %';
console.log(`Funktionen in index.html         : ${uniq.length}`);
console.log(`vom Test erreicht                : ${getestet.length}  (${p(getestet.length, uniq.length)})`);
console.log(`  davon nur über einen Klick     : ${perKlick.length}`);
console.log(`im UI verdrahtet, nie aufgerufen : ${nurUi.length}`);
console.log(`nur intern erreichbar            : ${intern.length}`);
console.log(`außerhalb des Harnesses          : ${aussen.length}`);

if (nurUi.length) {
  console.log('\n⚠  Hängt an einem Knopf, aber kein Test ruft es auf:');
  console.log('   ' + nurUi.map(r => r.n).join(', '));
}
if (perKlick.length) {
  console.log('\n▸  Über die Oberfläche gefahren (kein Aufruf beim Namen):');
  perKlick.forEach(r => console.log(`   ${r.n} — ${UEBER_DIE_OBERFLAECHE[r.n]}`));
}
if (aussen.length) {
  console.log('\n○  Bewusst außerhalb (Grund je Eintrag):');
  aussen.forEach(r => console.log(`   ${r.n} — ${AUSSERHALB[r.n]}`));
}
/* Ein Eintrag in UEBER_DIE_OBERFLAECHE, den der Test doch beim Namen nennt,
   ist veraltet — er würde eine Lücke verdecken, die es nicht mehr gibt. */
const ueberholt = Object.keys(UEBER_DIE_OBERFLAECHE).filter(n => inTest(n));
if (ueberholt.length) {
  console.log('\n⚠  Veraltete Einträge in UEBER_DIE_OBERFLAECHE (Test ruft sie direkt auf):');
  console.log('   ' + ueberholt.join(', '));
}
const fehlend = Object.keys(AUSSERHALB).filter(n => !uniq.includes(n));
if (fehlend.length) {
  console.log('\n⚠  In AUSSERHALB genannt, aber gibt es nicht mehr:');
  console.log('   ' + fehlend.join(', '));
}
if (ALLE && intern.length) {
  console.log('\n·  Nur intern erreichbar (Hilfsfunktionen, Renderer, Merge-Teile):');
  console.log('   ' + intern.map(r => r.n).join(', '));
}

/* Ein Knopf ohne jeden Testaufruf ist der einzige Fall, der hier hart
   fehlschlägt: die Funktion ist per Definition benutzbar, also auch
   prüfbar — es hat nur niemand getan. */
process.exit(nurUi.length === 0 && ueberholt.length === 0 && fehlend.length === 0 ? 0 : 1);
