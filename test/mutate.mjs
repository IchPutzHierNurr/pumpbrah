/**
 * MUTATIONSSTICHPROBE — prüft die Tests, nicht die App
 *
 * `test/coverage.mjs` beantwortet „wird diese Funktion aufgerufen?". Das ist
 * die schwächere Hälfte der Frage. Die stärkere lautet: **würde es auffallen,
 * wenn sie etwas Falsches täte?** Ein Aufruf ohne Zusicherung zählt in jeder
 * Abdeckungsstatistik mit und sichert nichts zu.
 *
 * Das Verfahren ist alt und einfach: eine bewusste Verschlechterung in den
 * Code einbauen und nachsehen, ob irgendein Test rot wird. Wird er es nicht,
 * hat man eine **überlebende Mutation** — und damit die Adresse einer
 * fehlenden Zusicherung, nicht bloß das Gefühl, dass irgendwo eine fehlt.
 *
 * Zwei Sorten Mutation stehen hier bewusst nebeneinander:
 *
 *   'bekannt'  — baut einen Fehler nach, für den es einen Regressionstest
 *                gibt. Überlebt so eine, ist der zugehörige Test kaputt oder
 *                zu schwach. Das ist eine Prüfung des Prüfregisters selbst.
 *   'offen'    — greift eine Stelle an, für die es keinen benannten Test
 *                gibt. Überlebt sie, ist das ein Fund.
 *
 * Aufruf:
 *   node test/mutate.mjs                 alle
 *   node test/mutate.mjs --nur=bekannt   nur die Register-Prüfung
 *   node test/mutate.mjs --parallel=3
 */
import { spawn } from 'node:child_process';
import { mkdtemp, cp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WURZEL = resolve(__dirname, '..');
const arg = (n, d) => (process.argv.find(a => a.startsWith('--' + n + '=')) || '=' + d).split('=')[1];
const NUR = arg('nur', '');
/* --ids=a,b fährt nur bestimmte Mutationen, --voll über alle Stufen.
   Gebraucht beim Nachfassen: eine Überlebende noch einmal vollständig, um zu
   trennen, ob wirklich keine Zusicherung existiert — oder ob nur meine
   Stufenangabe zu eng war. Das ist derselbe Fehler, der den ersten Lauf
   wertlos gemacht hat, nur eine Ebene höher. */
const IDS = arg('ids', '').split(',').map(x => x.trim()).filter(Boolean);
const ALLE_STUFEN = 'regression,sync,offline,fuzz';
const VOLL = process.argv.includes('--voll');
const PARALLEL = Math.max(1, parseInt(arg('parallel', '3'), 10));

/* Jede Mutation nennt die Stufen, die sie überhaupt treffen KANN. Alles zu
   fahren wäre ehrlicher, aber ein voller Lauf je Mutation sind vier Minuten —
   bei zwanzig Mutationen über eine Stunde. Die Auswahl ist damit ein
   bewusster Handel: schneller Lauf gegen die Möglichkeit, dass eine Mutation
   von einer NICHT gefahrenen Stufe gefangen worden wäre. Für das Ergebnis
   „überlebt" ist das die konservative Richtung — es könnte in Wahrheit
   gefangen sein, nie umgekehrt. */
const MUTATIONEN = [
  { id: 'calc1RM-konstante', art: 'bekannt', stufen: 'regression',   // PB-076
    was: 'Epley-Formel: Nenner 30 -> 25',
    suche: 'return Math.round(w*(1+r/30)*10)/10',
    ersetze: 'return Math.round(w*(1+r/25)*10)/10' },

  { id: 'landmarks-vertauscht', art: 'bekannt', stufen: 'regression',
    was: 'Brust: MEV und MRV vertauscht',
    suche: 'chest:    {mev:8, mav:16,mrv:22},',
    ersetze: 'chest:    {mev:22,mav:16,mrv:8},' },

  { id: 'einseitig-zaehlt-einfach', art: 'bekannt', stufen: 'regression',
    was: 'setSides liefert immer 1 (PB-050)',
    suche: 'function setSides(name,ex){return isUnilateral(name,ex)?2:1}',
    ersetze: 'function setSides(name,ex){return 1}' },

  { id: 'scheiben-gerundet', art: 'bekannt', stufen: 'regression',
    was: 'Scheibenrest wird gerundet (PB-055)',
    suche: 'return{ok:true,plates:out,rest:Math.abs(side)<1e-9?0:side,',
    ersetze: 'return{ok:true,plates:out,rest:Math.round(side*100)/100,' },

  { id: 'supersatz-nicht-aufgeraeumt', art: 'bekannt', stufen: 'regression',
    was: 'pruneLoneSupersets tut nichts (PB-065)',
    suche: '  list.forEach(e=>{if(e&&e.ss&&n[e.ss]<2)e.ss=null});',
    ersetze: '  /* mutiert */' },

  { id: 'escaping-loch', art: 'bekannt', stufen: 'regression,fuzz',
    was: 'esc() lässt den Apostroph durch (PB-019)',
    suche: ".replace(/[&<>\"']/g,c=>HTML_ENTITIES[c])",
    ersetze: '.replace(/[&<>"]/g,c=>HTML_ENTITIES[c])' },

  /* Hier stand eine Mutation, die die letzte Aufwärmstufe auf 110 % hob. Sie
     „überlebte" — und war trotzdem kein Fund: warmupPlan filtert am Ende
     jede Stufe >= Arbeitsgewicht selbst heraus, das Verhalten ändert sich
     also überhaupt nicht. Das nennt man eine ÄQUIVALENTE Mutation, und sie
     ist der klassische Fehlalarm dieses Verfahrens. Ersetzt durch eine, die
     wirklich etwas ändert: die Rampe wird flacher, aber bleibt gültig. */
  { id: 'aufwaermen-zu-flach', art: 'bekannt', stufen: 'regression',   // PB-028
    was: 'Aufwärmrampe startet bei 5 % statt 40 %',
    suche: '?[{pct:.40,reps:8},{pct:.60,reps:5},{pct:.75,reps:3},{pct:.88,reps:1}]',
    ersetze: '?[{pct:.05,reps:8},{pct:.06,reps:5},{pct:.07,reps:3},{pct:.08,reps:1}]' },

  { id: 'cardio-als-tonnage', art: 'bekannt', stufen: 'regression',
    was: 'Cardio zählt als Kilogramm-Volumen (PB-004)',
    suche: 'function setVolume(set){return isCardioSet(set)?0:',
    ersetze: 'function setVolume(set){return false?0:' },

  { id: 'trend-eigene-rechnung', art: 'bekannt', stufen: 'regression,fuzz',
    was: 'getExTrend rechnet wieder selbst (PB-051)',
    suche: "  if(!p||p.sessions<2||p.delta===null)return'—';\n  return p.dir||'flat';",
    ersetze: "  if(!p)return'—';\n  return (p.delta||0)>0?'up':'flat';" },

  { id: 'sync-ohne-transaktion', art: 'bekannt', stufen: 'sync',
    was: 'queueCloudSave ohne Transaktion (PB-069/PB-022)',
    suche: '    if(typeof db.runTransaction!==\'function\')\n      return ref.get().then(doc=>ref.set(zusammenfuehren(doc.exists?doc.data():null)));\n    return db.runTransaction(t=>\n      t.get(ref).then(doc=>{t.set(ref,zusammenfuehren(doc.exists?doc.data():null))}));',
    ersetze: '    return ref.get().then(doc=>ref.set(zusammenfuehren(doc.exists?doc.data():null)));' },

  { id: 'erstsync-blind', art: 'bekannt', stufen: 'sync',
    was: 'startSync schreibt blind zurück (PB-071)',
    suche: '      if(JSON.stringify(D)!==before)queueCloudSave();',
    ersetze: '      if(JSON.stringify(D)!==before)ref.set(cloudSafeData()).catch(()=>{});' },

  { id: 'avatar-in-die-cloud', art: 'bekannt', stufen: 'sync',
    was: 'Profilbild wandert in die Cloud (PB-067)',
    suche: '  if(copy.ui&&copy.ui.avatar)delete copy.ui.avatar;',
    ersetze: '  /* mutiert */' },

  { id: 'sw-zuhoerer-zu-spaet', art: 'bekannt', stufen: 'offline',
    was: 'Service Worker wieder nur über load-Zuhörer (PB-073)',
    suche: "  if(document.readyState==='complete')los();\n  else window.addEventListener('load',los,{once:true});",
    ersetze: "  window.addEventListener('load',los);" },

  // ---- Stellen ohne benannten Test: hier sind Überlebende ein Fund ----
  { id: 'mesozyklus-faktor', art: 'offen', stufen: 'regression',
    was: 'Entlastungswoche skaliert auf 150 % statt 50 %',
    suche: 'const MESO_DELOAD_FACTOR=.5;',
    ersetze: 'const MESO_DELOAD_FACTOR=1.5;' },

  { id: 'supersatz-gleiche-gruppe', art: 'offen', stufen: 'regression',
    was: 'Supersatz aus zwei Übungen derselben Muskelgruppe erlaubt',
    suche: '  if(!ga||!gb||ga===gb)return false;',
    ersetze: '  if(!ga||!gb)return false;' },

  { id: 'pausen-vertauscht', art: 'bekannt', stufen: 'regression',   // PB-077
    was: 'Grundübung bekommt die Isolationspause und umgekehrt',
    suche: '  return COMPOUND_PATTERNS.includes(detectMovePattern(name,muscle,type))?c:i;',
    ersetze: '  return COMPOUND_PATTERNS.includes(detectMovePattern(name,muscle,type))?i:c;' },

  { id: 'zeitbudget-unter-zwei', art: 'offen', stufen: 'regression',
    was: 'Zeitbudget darf unter zwei Sätze kürzen (PB-058)',
    suche: '      .filter(e=>!e.skipped&&openOf(e)>0&&(parseInt(e.sets)||0)>2)',
    ersetze: '      .filter(e=>!e.skipped&&openOf(e)>0&&(parseInt(e.sets)||0)>0)' },

  { id: 'satzzahl-null-erlaubt', art: 'offen', stufen: 'regression,fuzz',
    was: 'normalizeExercise lässt 0 Sätze zu',
    suche: '  ex.sets=Math.max(1,parseInt(ex.sets)||3);',
    ersetze: '  ex.sets=Math.max(0,parseInt(ex.sets)||3);' },
];

const gewaehlt = MUTATIONEN
  .filter(m => !NUR || m.art === NUR)
  .filter(m => !IDS.length || IDS.includes(m.id))
  .map(m => VOLL ? { ...m, stufen: ALLE_STUFEN } : m);

/** Eine Mutation in einer eigenen Kopie fahren. */
async function fahre(m) {
  const dir = await mkdtemp(join(tmpdir(), 'pb-mut-'));
  try {
    for (const f of ['index.html', 'sw.js']) await cp(join(WURZEL, f), join(dir, f));
    await cp(join(WURZEL, 'test'), join(dir, 'test'), { recursive: true });

    const datei = join(dir, m.datei || 'index.html');
    const vorher = await readFile(datei, 'utf8');
    if (!vorher.includes(m.suche))
      return { ...m, ergebnis: 'ANKER FEHLT', hinweis: 'Suchtext nicht gefunden — Mutation veraltet' };
    await writeFile(datei, vorher.replace(m.suche, m.ersetze));

    const code = await new Promise(r => {
      const kind = spawn(process.execPath,
        [join(dir, 'test', 'check.mjs'), '--stages=' + m.stufen, '--seed=4242', '--iterations=800'],
        { cwd: dir, stdio: 'ignore' });
      /* Grosszuegig: ein Volllauf braucht allein 325 s, unter Parallelbetrieb
         entsprechend mehr. Lieber warten als raten. */
      const uhr = setTimeout(() => { kind.kill('SIGKILL'); r(-1); }, 1800000);
      kind.on('exit', c => { clearTimeout(uhr); r(c); });
    });
    /* Eine Zeitüberschreitung ist WEDER gefangen NOCH überlebt — sie ist
       unbekannt. Hier stand einmal „gefangen", mit der Begründung, eine
       Prüfmenge die nicht fertig wird sei ja nicht grün. Das klingt richtig
       und war der teuerste Fehler dieses Werkzeugs: ein Volllauf dauert
       325 s, die Grenze stand bei 300 s, und drei davon liefen parallel auf
       vier Kernen. Ergebnis war ein Bericht „7 von 7 gefangen", in dem keine
       einzige Mutation tatsächlich geprüft worden war.
       Ein Messwert, der nicht zustande kam, muss als solcher auftauchen —
       niemals als das Ergebnis, das man sich wünscht. */
    if (code === -1) return { ...m, ergebnis: 'UNKLAR — Zeit abgelaufen' };
    return { ...m, ergebnis: code !== 0 ? 'gefangen' : 'ÜBERLEBT' };
  } finally { await rm(dir, { recursive: true, force: true }); }
}

const C = { g: '\x1b[32m', r: '\x1b[31m', y: '\x1b[33m', d: '\x1b[2m', x: '\x1b[0m' };
console.log(`\nMUTATIONSSTICHPROBE — ${gewaehlt.length} Mutationen, ${PARALLEL} parallel\n`);

const warteschlange = [...gewaehlt];
const ergebnisse = [];
await Promise.all(Array.from({ length: PARALLEL }, async () => {
  while (warteschlange.length) {
    const m = warteschlange.shift();
    const r = await fahre(m);
    ergebnisse.push(r);
    const ok = r.ergebnis === 'gefangen';
    console.log(`  ${ok ? C.g + '✓' : C.r + '✗'}${C.x} ${r.id.padEnd(26)} ${C.d}${r.art}${C.x}  ${ok ? '' : C.r + r.ergebnis + C.x}`);
  }
}));

const ueberlebt = ergebnisse.filter(r => r.ergebnis === 'ÜBERLEBT');
const unklar = ergebnisse.filter(r => r.ergebnis.startsWith('UNKLAR') || r.ergebnis === 'ANKER FEHLT');
const bekanntUeberlebt = ueberlebt.filter(r => r.art === 'bekannt');
console.log('\n' + '─'.repeat(64));
console.log(`${ergebnisse.filter(r => r.ergebnis === 'gefangen').length} von ${ergebnisse.length} gefangen`
  + (unklar.length ? `, ${unklar.length} UNKLAR (nicht gemessen)` : ''));
if (unklar.length) {
  console.log(`\n${C.y}Nicht gemessen — zaehlt weder als gefangen noch als ueberlebt:${C.x}`);
  unklar.forEach(r => console.log(`  ${r.id}: ${r.ergebnis}`));
}
if (ueberlebt.length) {
  console.log(`\n${C.r}Überlebt — hier fehlt eine Zusicherung:${C.x}`);
  ueberlebt.forEach(r => console.log(`  [${r.art}] ${r.id}: ${r.was}\n      ${r.ergebnis}${r.hinweis ? ' — ' + r.hinweis : ''}`));
}
if (bekanntUeberlebt.length) {
  console.log(`\n${C.y}Davon ${bekanntUeberlebt.length} mit benanntem Regressionstest — der Test ist zu schwach.${C.x}`);
}
console.log('─'.repeat(64));
/* Nur überlebende Mutationen mit benanntem Test sind ein harter Fehlschlag:
   dort behauptet das Register eine Absicherung, die es nicht gibt. Offene
   Überlebende sind Arbeitsvorrat, kein Defekt. */
process.exit(bekanntUeberlebt.length === 0 && unklar.length === 0 ? 0 : 1);
