/**
 * PUMPBRAH — Funktionstest-Harness
 * ================================
 *
 * Drei Stufen, in dieser Reihenfolge:
 *
 *   1. SMOKE       Startet die App, geht durch das Onboarding, prüft, dass
 *                  jeder Screen rendert. Schlägt das fehl, ist alles Weitere
 *                  Rauschen — der Lauf bricht ab.
 *   2. REGRESSION  Ein Test pro Eintrag in docs/BUGS.md. Jeder je gefundene
 *                  Bug wird hier für immer nachgeprüft. Das ist der
 *                  "automatisch mitgelernt"-Teil: ein Fix ohne Eintrag hier
 *                  gilt als nicht erledigt.
 *   3. FUZZ        N zufällige Aktionen gegen den echten Anwendungszustand.
 *                  Nach JEDER Aktion werden alle Invarianten geprüft. Findet
 *                  die Fehler, an die beim Schreiben der Testfälle keiner
 *                  gedacht hat.
 *
 * Aufruf:
 *   node test/check.mjs                 # 1000 Fuzz-Iterationen (Standard)
 *   node test/check.mjs --iterations=5000
 *   node test/check.mjs --seed=12345    # exakte Wiederholung eines Laufs
 *   node test/check.mjs --smoke-only
 *
 * Exit-Code 0 = alles grün. Alles andere = mindestens ein Fehler.
 */

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_URL = 'file://' + resolve(__dirname, '..', 'index.html');
const CHROME = process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const arg = (name, dflt) => {
  const hit = process.argv.find(a => a.startsWith('--' + name + '='));
  return hit ? hit.split('=')[1] : dflt;
};
/* 2500 statt 1000, seit der zweite Coverage-Audit den Operationsvorrat von
   67 auf 91 gehoben hat: bei 1000 Runden bekommt jede Operation im Mittel nur
   elf Treffer, und die Streuung allein lässt dann regelmäßig eine unter die
   Mindestschwelle rutschen — ein rotes Ergebnis ohne Fund. */
const ITERATIONS = parseInt(arg('iterations', '2500'), 10);
const SEED = parseInt(arg('seed', String(Date.now() % 1e9)), 10);
const SMOKE_ONLY = process.argv.includes('--smoke-only');

// ---------------------------------------------------------------- reporting
const R = { pass: 0, fail: 0, failures: [], errors: [] };
const C = { g: '\x1b[32m', r: '\x1b[31m', y: '\x1b[33m', d: '\x1b[2m', x: '\x1b[0m' };
function check(stage, name, ok, detail = '') {
  if (ok) { R.pass++; console.log(`  ${C.g}✓${C.x} ${name}`); }
  else {
    R.fail++; R.failures.push({ stage, name, detail });
    console.log(`  ${C.r}✗ ${name}${C.x}${detail ? `\n      ${C.d}${detail}${C.x}` : ''}`);
  }
  return ok;
}
function stage(title) { console.log(`\n${C.y}▸ ${title}${C.x}`); }

// ---------------------------------------------------------------- boot
const browser = await chromium.launch({ executablePath: CHROME });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();

page.on('pageerror', e =>
  R.errors.push('pageerror: ' + e.message + ' @ ' + String(e.stack || '').split('\n')[1]?.trim()));
page.on('console', m => {
  if (m.type() !== 'error') return;
  const t = m.text();
  if (/gstatic|firebase|net::ERR|Failed to load resource/i.test(t)) return; // offline erwartet
  R.errors.push('console: ' + t);
});
page.on('dialog', d => d.accept());   // confirm()/alert() immer bestätigen

await page.goto(APP_URL);
await page.waitForTimeout(500);

// ================================================================ 1. SMOKE
stage('SMOKE — App startet und rendert');

await page.click('text=Offline-Modus (ohne Sync)');
await page.waitForTimeout(300);
check('smoke', 'Onboarding erscheint', await page.isVisible('#onboard-screen'));

for (let i = 0; i < 8; i++) {
  if (i === 1) await page.fill('#ob-birthday', '1993-06-21');
  if (i === 2) await page.fill('#ob-height', '181');
  if (i === 3) await page.fill('#ob-weight', '82');
  await page.click('#ob-content .btn');
  await page.waitForTimeout(90);
}
await page.waitForTimeout(500);
check('smoke', 'App nach Onboarding sichtbar', await page.isVisible('#main-app'));

for (const [tab, sel] of [['dash', '.mesh-hero'], ['hist', '#h-streak'],
                          ['ana', '#ana-muscles'], ['settings', '#prof-name']]) {
  await page.evaluate(t => go(t), tab);
  await page.waitForTimeout(200);
  check('smoke', `Screen "${tab}" rendert`, await page.isVisible(sel));
}
check('smoke', 'Keine JS-Fehler beim Start', R.errors.length === 0, R.errors[0] || '');

if (R.fail > 0) {
  console.log(`\n${C.r}SMOKE fehlgeschlagen — Abbruch.${C.x}`);
  await browser.close();
  process.exit(1);
}

// Testdaten mit realistischem Umfang aufbauen
await page.evaluate(() => {
  const cat = [['Bankdrücken', 'chest'], ['Latziehen breit Obergriff', 'back'], ['Beinpresse', 'legs'],
               ['KH Seitheben', 'shoulders'], ['KH Curls', 'arms'], ['Kabelcrunches', 'core']];
  D.history = [];
  for (let w = 7; w >= 0; w--) for (const d of [0, 2, 4]) {
    const dt = new Date(Date.now() - (w * 7 + d) * 864e5);
    const sets = [];
    cat.forEach(([n, m], i) => {
      for (let s = 0; s < 3; s++)
        sets.push({ ex: n, nr: s + 1, w: 30 + i * 10 + (7 - w) * 2.5, r: 8 + (s % 4),
                    rir: s % 4, note: '', muscle: m, type: 'main', mode: '' });
    });
    sets.push({ ex: 'StairMaster', nr: 1, w: 10, r: 20, rir: 3, note: '', muscle: 'legs', type: 'main', mode: 'cardio' });
    D.history.push({ id: newSessionId(), updatedAt: Date.now() - w * 864e5,
                     date: dt.toLocaleDateString('de-DE'), planKey: 'FullBody_A', duration: 60, sets });
  }
  D.bio.weights = Array.from({ length: 10 }, (_, i) => ({
    date: new Date(Date.now() - (9 - i) * 7 * 864e5).toLocaleDateString('de-DE'), kg: +(82 - i * 0.3).toFixed(1) }));
  save(); renderAll(); renderAna(); renderHist();
});
await page.waitForTimeout(400);

// ============================================================ 2. REGRESSION
if (!SMOKE_ONLY) {
stage('REGRESSION — ein Test pro Eintrag in docs/BUGS.md');

/**
 * Jeder Eintrag entspricht 1:1 einer ID in docs/BUGS.md.
 * NEUE BUGS WERDEN HIER ERGÄNZT, NICHT ERSETZT.
 */
const REGRESSIONS = [
  {
    id: 'PB-001', title: 'XSS über Übungsname / Notiz / Plan-Key',
    run: async () => {
      const pwned = await page.evaluate(() => {
        delete window.__pwn;
        const payload = '<img src=x onerror="window.__pwn=1">"><svg onload="window.__pwn=1">';
        D.plan['PB001'] = { day: 'Mo', exercises: [normalizeExercise({
          name: payload, sets: 2, rmin: 5, rmax: 8, type: 'main', muscle: 'chest', note: payload })] };
        D.notes[payload] = payload;
        curTab = 'PB001'; save(); renderPlan(); renderDash(); renderHist(); renderAna();
        /* Strukturell prüfen, nicht per String: innerHTML gibt Anführungs-
           zeichen aus Textknoten unescaped zurück, ein Textvergleich meldet
           also auch bei korrekt escaptem Inhalt einen Treffer. Entscheidend
           ist, ob aus der Nutzlast echte Elemente/Handler geworden sind. */
        const injected = document.querySelectorAll(
          '#main-app img[onerror], #main-app svg[onload], #main-app [onerror], #main-app [onload]').length;
        const textOk = document.getElementById('pl').textContent.includes('<img src=x');
        delete D.plan['PB001']; delete D.notes[payload]; curTab = 'FullBody_A'; save();
        return { flag: !!window.__pwn, injected, textOk };
      });
      return [!pwned.flag && pwned.injected === 0 && pwned.textOk, JSON.stringify(pwned)];
    }
  },
  {
    id: 'PB-002', title: 'History-Dedupe löscht keine echten Sessions',
    run: async () => {
      const n = await page.evaluate(() => {
        const mk = () => ({ id: newSessionId(), updatedAt: Date.now(), date: '01.02.2026',
          planKey: 'FullBody_A', duration: 44,
          sets: [{ ex: 'Bankdrücken', nr: 1, w: 60, r: 10, rir: 2, note: '', muscle: 'chest', type: 'main', mode: '' }] });
        const backup = D.history; D.history = [mk(), mk(), mk()];
        normalizeData(); const len = D.history.length; D.history = backup; return len;
      });
      return [n === 3, `übrig: ${n}/3`];
    }
  },
  {
    id: 'PB-003', title: 'Session-Edit erzeugt beim Merge kein Duplikat',
    run: async () => {
      const r = await page.evaluate(() => {
        const base = { id: 'FIX1', updatedAt: 1000, date: '02.02.2026', planKey: 'FullBody_A', duration: 40,
          sets: [{ ex: 'Bankdrücken', nr: 1, w: 60, r: 10, rir: 2, note: '', muscle: 'chest', type: 'main', mode: '' }] };
        const edited = JSON.parse(JSON.stringify(base));
        edited.updatedAt = 2000; edited.sets[0].w = 62.5;
        const merged = mergeHistory([base], [edited], []);
        return { len: merged.length, w: merged[0].sets[0].w };
      });
      return [r.len === 1 && r.w === 62.5, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-004', title: 'Cardio zählt nicht als Kilogramm-Tonnage',
    run: async () => {
      const r = await page.evaluate(() => {
        const s = { sets: [
          { ex: 'Bankdrücken', w: 80, r: 8, rir: 2, muscle: 'chest', type: 'main', mode: '' },
          { ex: 'StairMaster', w: 12, r: 30, rir: 2, muscle: 'legs', type: 'main', mode: 'cardio' },
          { ex: 'Laufband', w: 8, r: 15, rir: 3, muscle: 'legs', type: 'main', mode: '' }  // Altdaten ohne mode
        ] };
        return { vol: sessionVolume(s), min: cardioMinutes(s.sets), strength: strengthSets(s.sets).length };
      });
      return [r.vol === 640 && r.min === 45 && r.strength === 1, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-005', title: 'Volumen-Landmarks sind extern, nicht selbstbezüglich',
    run: async () => {
      const r = await page.evaluate(() => {
        const a = weeklyLandmarks();
        D.plan.__tmp = { day: 'Mo', exercises: [] };
        const b = weeklyLandmarks();
        delete D.plan.__tmp;
        return { a, b, stable: JSON.stringify(a) === JSON.stringify(b), ordered: a.mev < a.mav && a.mav < a.mrv };
      });
      return [r.stable && r.ordered, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-006', title: 'Timer-Pause friert die Restzeit ein',
    run: async () => {
      const r = await page.evaluate(() => {
        resetTmr(); timerTgt = 120; timerStartedAt = Date.now() - 45000; startTmrInterval();
        const before = getTimerRemaining();
        startTmr(); const frozen = timerPausedRemaining;
        startTmr(); const after = getTimerRemaining();
        resetTmr();
        return { before, frozen, after };
      });
      return [Math.abs(r.after - r.before) <= 2 && r.frozen > 0, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-007', title: 'Timer überlebt einen Reload',
    run: async () => {
      const r = await page.evaluate(() => {
        D.active = D.active || { planKey: 'FullBody_A', startTime: Date.now(), exercises: [], compact: false };
        resetTmr(); timerTgt = 90; timerStartedAt = Date.now(); startTmrInterval(); persistTimer();
        const raw = localStorage.getItem('pb_timer');
        clearInterval(timerInt); timerInt = null; timerTgt = 0; timerStartedAt = 0;
        restoreTimer();
        const ok = timerTgt === 90 && getTimerRemaining() > 80;
        resetTmr();
        return { persisted: !!raw, restored: ok };
      });
      return [r.persisted && r.restored, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-008', title: 'Async-Guards sitzen im Callback, nicht davor',
    run: async () => {
      const before = R.errors.length;
      await page.evaluate(async () => {
        if (!D.active) startWorkout(Object.keys(D.plan)[0]);
        autoScrollNext(0);
        const item = allLibraryCategories()[0].items[0];
        pushExerciseToActiveWorkout(item);
        D.active = null;             // Race provozieren: Callbacks laufen ins Leere
      });
      await page.waitForTimeout(500);
      return [R.errors.length === before, R.errors.slice(before).join(' | ')];
    }
  },
  {
    id: 'PB-009', title: 'startWorkout verschluckt den Plan-Parameter nicht',
    run: async () => {
      const r = await page.evaluate(() => {
        D.active = null; resetTmr();
        startWorkout('FullBody_A');
        startWorkout('FullBody_B');            // anderer Tag, nichts geloggt -> direkt wechseln
        const direct = D.active && D.active.planKey === 'FullBody_B';
        // Mit geloggten Sätzen muss stattdessen nachgefragt werden.
        D.active.exercises[0].logged = [{ w: 40, r: 10, rir: 2, note: '' }];
        startWorkout('FullBody_A');
        const asks = document.getElementById('m-woswitch').classList.contains('show')
          && D.active.planKey === 'FullBody_B';
        cm('m-woswitch'); D.active = null; save();
        return { direct, asks };
      });
      return [r.direct && r.asks, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-010', title: 'Übungstausch behält geloggte Sätze',
    run: async () => {
      const r = await page.evaluate(() => {
        D.active = null; startWorkout('FullBody_A');
        const ei = D.active.exercises.findIndex(e => e.type === 'main');
        D.active.exercises[ei].logged = [{ w: 60, r: 10, rir: 2, note: '' }, { w: 60, r: 9, rir: 1, note: '' }];
        openAlternative(ei);
        if (!altState.list.length) return { err: 'keine Alternativen' };
        swapActiveExercise(ei, 0); commitSwap(false);
        const total = D.active.exercises.reduce((a, e) => a + e.logged.length, 0);
        D.active = null; save();
        return { total };
      });
      return [r.total === 2, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-011', title: 'Skip löscht geloggte Sätze nicht still',
    run: async () => {
      const r = await page.evaluate(() => {
        D.active = null; startWorkout('FullBody_A');
        D.active.exercises[0].logged = [{ w: 20, r: 12, rir: 2, note: '' }];
        skipEx(0);                                   // confirm() wird bestätigt
        const kept = D.active.exercises[0].logged.length;
        unskipEx(0);
        const unskipped = !D.active.exercises[0].skipped;
        D.active = null; save();
        return { kept, unskipped };
      });
      return [r.kept === 1 && r.unskipped, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-012', title: 'Plan umbenennen migriert History und aktive Session',
    run: async () => {
      const r = await page.evaluate(() => {
        D.plan['RenMe'] = { day: 'Mo', exercises: [normalizeExercise({ name: 'X', muscle: 'chest' })] };
        D.history.push({ id: 'REN1', updatedAt: Date.now(), date: '03.03.2026', planKey: 'RenMe', duration: 10, sets: [] });
        curTab = 'RenMe'; D.active = { planKey: 'RenMe', startTime: Date.now(), exercises: [] };
        openPlanDayModal('rename', 'RenMe');
        document.getElementById('pd-name').value = 'Renamed'; savePlanDay();
        const ok = !!D.plan['Renamed'] && !D.plan['RenMe']
          && D.history.some(h => h.planKey === 'Renamed') && D.active.planKey === 'Renamed';
        delete D.plan['Renamed']; D.history = D.history.filter(h => h.id !== 'REN1');
        D.active = null; curTab = 'FullBody_A'; save();
        return { ok };
      });
      return [r.ok, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-013', title: 'Core mit 0 Sätzen gilt nicht als "im MAV"',
    run: async () => {
      const r = await page.evaluate(() => {
        const lm = MUSCLE_LANDMARKS;
        return Object.entries(lm).every(([k, v]) => v.mev > 0 && v.mev < v.mav && v.mav < v.mrv);
      });
      return [r, 'alle Landmarks streng aufsteigend und mev>0'];
    }
  },
  {
    id: 'PB-014', title: 'Erster Satz einer Übung ist kein PR',
    run: async () => {
      const r = await page.evaluate(() => {
        const name = 'NeueUebungOhneHistorie_' + Math.random().toString(36).slice(2);
        return { hadHistory: getAllSets(name).filter(s => s.w > 0).length > 0 };
      });
      return [r.hadHistory === false, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-015', title: 'Chart-Achse erzeugt keine doppelten Labels',
    run: async () => {
      const r = await page.evaluate(() => {
        const svg = svgChart([{ v: 50, label: 'a' }, { v: 52.5, label: 'b' }, { v: 51, label: 'c' }], { showGrid: true });
        const labels = [...svg.matchAll(/class="chart-label" text-anchor="end">([^<]+)</g)].map(m => m[1]);
        return { labels, unique: new Set(labels).size === labels.length };
      });
      return [r.unique, JSON.stringify(r.labels)];
    }
  },
  {
    id: 'PB-016', title: 'Alternativenliste dedupliziert Namensvarianten',
    run: async () => {
      const r = await page.evaluate(() => {
        const cur = normalizeExercise({ name: 'Bankdrücken', muscle: 'chest', type: 'main' });
        const list = getAlternativeExercises(cur, 'all', '');
        const bases = list.map(x => baseNameKey(x.name));
        return { dup: bases.length !== new Set(bases).size,
                 self: list.some(x => baseNameKey(x.name) === baseNameKey('Bankdrücken')) };
      });
      return [!r.dup && !r.self, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-018', title: 'Doppeltes Anführungszeichen bricht nicht aus onclick aus',
    run: async () => {
      // Gefunden vom Fuzzer: jsStr() escapte nur JS-Kontext, nicht den
      // umschließenden HTML-Attributkontext. Ein " im Namen beendete das
      // onclick-Attribut und alles danach wurde als Markup geparst.
      const r = await page.evaluate(() => {
        delete window.__pwn;
        const payload = '"><svg onload="window.__pwn=1"><img src=x onerror="window.__pwn=1">';
        D.plan['PB018'] = { day: 'Mo', exercises: [normalizeExercise({
          name: payload, sets: 1, rmin: 5, rmax: 5, type: 'main', muscle: 'chest', note: payload })] };
        curTab = 'PB018'; save(); renderPlan();
        const injected = document.querySelectorAll('#pl [onload], #pl img, #pl svg[onload]').length;
        // Der Name muss trotzdem vollständig und korrekt lesbar ankommen.
        const readable = document.querySelector('#pl .exr-n').textContent === payload;
        // Und der Handler muss weiterhin funktionieren (kein Syntaxfehler).
        let handlerOk = true;
        try { document.querySelector('#pl .exr-h').click(); } catch { handlerOk = false; }
        delete D.plan['PB018']; curTab = 'FullBody_A'; save(); renderPlan();
        return { flag: !!window.__pwn, injected, readable, handlerOk };
      });
      return [!r.flag && r.injected === 0 && r.readable && r.handlerOk, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-019', title: 'Apostroph im Übungsnamen bricht den Handler nicht',
    run: async () => {
      const r = await page.evaluate(() => {
        window.__handlerRan = false;
        const name = "O'Brien's \\ Backslash \"Übung\"";
        D.plan['PB019'] = { day: 'Mo', exercises: [normalizeExercise({
          name, sets: 1, rmin: 5, rmax: 5, type: 'main', muscle: 'chest', note: '' })] };
        curTab = 'PB019'; save(); renderPlan();
        const readable = document.querySelector('#pl .exr-n').textContent === name;
        let ok = true;
        try { document.querySelector('#pl .exr-h').click(); } catch { ok = false; }
        const opened = openPlanRows.has(name);
        delete D.plan['PB019']; openPlanRows.delete(name); curTab = 'FullBody_A'; save(); renderPlan();
        return { readable, ok, opened };
      });
      return [r.readable && r.ok && r.opened, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-020', title: 'Veralteter logTgt-Index stürzt nicht ab',
    run: async () => {
      // Gefunden vom Fuzzer: Log-Dialog auf Übung 8 offen, dann Übung
      // entfernt/Tag gewechselt -> D.active.exercises[8] ist undefined.
      const r = await page.evaluate(() => {
        D.active = null; startWorkout('FullBody_A');
        const lastIdx = D.active.exercises.length - 1;
        openLog(lastIdx);
        D.active.exercises.splice(0, 3);              // Index veraltet
        let redoOk = true, logOk = true;
        try { redoLast(); } catch { redoOk = false; }
        logTgt = { exIdx: 999 };
        try { confirmLog(); } catch { logOk = false; }
        D.active = null; logTgt = null; save();
        return { redoOk, logOk };
      });
      return [r.redoOk && r.logOk, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-024', title: 'Volumen-Balken haben eine sichtbare Füllung',
    run: async () => {
      // Gefunden beim Ansehen eines Screenshots: eine später im Stylesheet
      // ergänzte Regel überschrieb position:absolute mit position:relative,
      // wodurch die Füllung auf Höhe 0 kollabierte. Kein Assert hätte das
      // gefunden - deshalb prüfen wir jetzt die berechnete Geometrie.
      const r = await page.evaluate(() => {
        go('dash'); renderDash();
        const fills = [...document.querySelectorAll('#d-muscle-volume .mv-fill')];
        if (!fills.length) return { err: 'keine Balken gerendert' };
        const geo = fills.map(f => {
          const cs = getComputedStyle(f), box = f.getBoundingClientRect();
          return { pos: cs.position, h: Math.round(box.height), w: Math.round(box.width) };
        });
        const bars = [...document.querySelectorAll('#d-muscle-volume .mv-bar')].length;
        return { geo, bars, allAbsolute: geo.every(g => g.pos === 'absolute'),
                 allHaveHeight: geo.every(g => g.h > 0) };
      });
      return [!r.err && r.allAbsolute && r.allHaveHeight, JSON.stringify(r).slice(0, 220)];
    }
  },
  {
    id: 'PB-025', title: 'go() wechselt den Screen synchron',
    run: async () => {
      // Gefunden vom Regressionstest PB-024, nachdem go() versuchsweise in
      // document.startViewTransition() gewickelt wurde: dessen Callback läuft
      // asynchron, damit sah jeder Aufrufer direkt nach go() noch den alten
      // Screen. Diese Eigenschaft muss ein Test festnageln, sonst schleicht
      // sie sich beim nächsten "modernen" Umbau wieder ein.
      const r = await page.evaluate(() => {
        const out = {};
        ['dash', 'hist', 'ana', 'settings'].forEach(id => {
          go(id);
          // KEIN await, kein rAF — genau das ist der Punkt.
          const scr = document.getElementById('s-' + id);
          out[id] = scr.classList.contains('active')
            && scr.getBoundingClientRect().height > 0
            && document.querySelector(`.ni[data-tab="${id}"]`).classList.contains('on');
        });
        return out;
      });
      return [Object.values(r).every(Boolean), JSON.stringify(r)];
    }
  },
  {
    id: 'PB-026', title: 'Kein Formularfeld unter 16px (iOS-Zoom)',
    run: async () => {
      // iOS Safari zoomt beim Fokussieren automatisch hinein, sobald ein
      // Formularfeld kleiner als 16px gerendert wird - und zoomt nicht zurück.
      const r = await page.evaluate(() => {
        document.querySelectorAll('.mbg').forEach(m => m.classList.add('show'));
        const small = [...document.querySelectorAll('input,select,textarea')]
          .filter(el => el.type !== 'hidden' && el.type !== 'file' && el.offsetParent !== null)
          .map(el => ({ id: el.id || el.className, size: parseFloat(getComputedStyle(el).fontSize) }))
          .filter(x => x.size < 16);
        document.querySelectorAll('.mbg').forEach(m => m.classList.remove('show'));
        return small;
      });
      return [r.length === 0, r.length ? JSON.stringify(r).slice(0, 200) : ''];
    }
  },
  {
    id: 'PB-027', title: 'Long-Press-Ziele haben kein iOS-Systemmenü',
    run: async () => {
      // Ohne -webkit-touch-callout:none blendet iOS beim Langdrücken sein
      // eigenes Menü ein - genau auf der Geste, die den Satz-Editor öffnet.
      //
      // getComputedStyle taugt hier nicht: -webkit-touch-callout ist eine
      // Safari-Eigenschaft, Chromium liefert dafür einen leeren String. Der
      // Test prüft deshalb die Deklaration im Stylesheet plus das, was
      // Chromium tatsächlich berichtet (user-select) und dass die Geste
      // überhaupt an der Zeile hängt.
      const r = await page.evaluate(() => {
        const css = [...document.querySelectorAll('style')].map(s => s.textContent).join('\n');
        const declared = /\*\s*\{[^}]*-webkit-touch-callout\s*:\s*none/s.test(css);
        const inputsExempt = /input,textarea,select\s*\{[^}]*-webkit-touch-callout\s*:\s*default/s.test(css);
        D.active = null; startWorkout('FullBody_A');
        // In die Übung loggen, die danach noch NICHT fertig ist - eine
        // abgeschlossene Übung klappt im Fokus-Layout zu einer Zeile zusammen
        // und zeigt gar keine Satz-Chips mehr. Der Test soll die Geste prüfen,
        // nicht versehentlich das Zuklappen.
        const ei = D.active.exercises.findIndex(e => !e.skipped && e.sets > 1);
        D.active.exercises[ei].logged = [{ w: 20, r: 10, rir: 2, note: '' }];
        // Zeile explizit aufklappen: welche Übung gerade "aktiv" ist, haengt
        // vom Plan ab - der Test soll die Geste pruefen, nicht die Auswahl.
        toggleWoRow(ei);
        go('wo');
        const row = document.querySelector('#wo-c .wsr:not(.empty)');
        const cs = row ? getComputedStyle(row) : null;
        const select = cs ? (cs.userSelect || cs.webkitUserSelect) : '';
        const hasGesture = !!(row && row.getAttribute('onpointerdown') || '').includes('setLongPress');
        D.active = null; save();
        return { declared, inputsExempt, select, hasGesture, found: !!row };
      });
      return [r.found && r.declared && r.inputsExempt && r.select === 'none' && r.hasGesture,
              JSON.stringify(r)];
    }
  },
  {
    id: 'PB-028', title: 'Aufwärmrampe bleibt unter der Arbeitslast',
    run: async () => {
      const r = await page.evaluate(() => {
        const bad = [];
        [20, 40, 60, 82.5, 100, 140, 200].forEach(w => {
          ['squat', 'push', 'pulld', 'curl', 'legext'].forEach(k => {
            const plan = warmupPlan(w, 'chest', k) || [];
            plan.forEach(s => {
              if (s.kg >= w) bad.push(`${k}@${w}: Stufe ${s.kg} >= Arbeitslast`);
              if (s.kg <= 0 || !Number.isFinite(s.kg)) bad.push(`${k}@${w}: ${s.kg}`);
            });
            // aufsteigend und ohne Dubletten
            for (let i = 1; i < plan.length; i++)
              if (plan[i].kg <= plan[i - 1].kg) bad.push(`${k}@${w}: nicht aufsteigend`);
          });
        });
        // Ungültige Eingaben liefern nichts statt zu werfen
        const nulls = [0, -5, NaN, null, undefined, 'abc'].map(v => warmupPlan(v, 'chest', 'push'));
        return { bad, nullsOk: nulls.every(x => x === null || x.length === 0) };
      });
      return [r.bad.length === 0 && r.nullsOk, JSON.stringify(r).slice(0, 220)];
    }
  },
  {
    id: 'PB-029', title: 'Aufwärmsätze zählen nicht ins Volumen',
    run: async () => {
      // Die Rampe wird angezeigt, aber nie geloggt - sie darf weder in
      // Tonnage noch in die MEV/MAV-Einordnung einfließen.
      const r = await page.evaluate(() => {
        D.active = null; startWorkout('FullBody_A');
        const ei = D.active.exercises.findIndex(e => e.type === 'main');
        renderWo();
        const shown = document.querySelectorAll('#wo-c .warmup-step').length >= 0;
        const volBefore = Object.values(getWeeklyVolume(false)).reduce((a, v) => a + v.sets, 0);
        // Rampe rendern ändert keinen Zustand
        renderWarmup(D.active.exercises[ei]);
        const volAfter = Object.values(getWeeklyVolume(false)).reduce((a, v) => a + v.sets, 0);
        const loggedAny = D.active.exercises.some(e => e.logged.length);
        D.active = null; save();
        return { shown, same: volBefore === volAfter, loggedAny };
      });
      return [r.same && !r.loggedAny, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-030', title: 'Deload reduziert Sätze, lässt den Plan aber unberührt',
    run: async () => {
      const r = await page.evaluate(() => {
        const planBefore = JSON.stringify(D.plan['FullBody_A'].exercises);
        D.ui.deload = { active: true, since: Date.now(), until: Date.now() + 7 * 864e5 };
        D.active = null; startWorkout('FullBody_A');
        const mains = D.active.exercises.filter(e => e.type === 'main');
        const planMains = D.plan['FullBody_A'].exercises.filter(e => e.type === 'main');
        const reduced = mains.every((e, i) => e.sets <= planMains[i].sets);
        const anyReduced = mains.some((e, i) => e.sets < planMains[i].sets);
        const rirRaised = mains.every(e => e.rir === null || e.rir >= 3);
        const planUnchanged = JSON.stringify(D.plan['FullBody_A'].exercises) === planBefore;
        // Ablauf nach 7 Tagen schaltet sich selbst ab
        D.ui.deload.until = Date.now() - 1000;
        const expired = deloadActive() === false;
        endDeload(); D.active = null; save();
        return { reduced, anyReduced, rirRaised, planUnchanged, expired };
      });
      return [r.reduced && r.anyReduced && r.rirRaised && r.planUnchanged && r.expired, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-031', title: 'Indirektes Volumen ist additiv und rundet sauber',
    run: async () => {
      const r = await page.evaluate(() => {
        D.history = [{
          id: 'SEC1', updatedAt: Date.now(), date: new Date().toLocaleDateString('de-DE'),
          planKey: 'FullBody_A', duration: 40,
          sets: Array.from({ length: 3 }, (_, i) => ({
            ex: 'Bankdrücken', nr: i + 1, w: 80, r: 8, rir: 2, note: '',
            muscle: 'chest', type: 'main', mode: '' }))
        }];
        const direct = getWeeklyVolume(false);
        const total = getWeeklyVolume(true);
        return {
          chestSame: direct.chest.sets === 3 && total.chest.sets === 3,
          // Seit der Aufteilung in neun Volumengruppen geht Druecken auf den
          // TRIZEPS, nicht auf einen Sammeltopf "Arme" - sonst zaehlen
          // Bizeps- und Trizepsarbeit gegen dieselbe Obergrenze.
          keinSammeltopf: !direct.arms && !total.arms,
          trizepsDirekt: (direct.triceps && direct.triceps.sets) || 0,
          trizepsTotal: (total.triceps && total.triceps.sets) || 0,
          schultern: (total.shoulders && total.shoulders.sets) || 0,
          bizepsUnberuehrt: !total.biceps,
          // 3 Sätze Drücken -> 1,5 Sätze Trizeps, sauber gerundet
          clean: Object.values(total).every(v =>
            Number.isFinite(v.sets) && Math.abs(v.sets * 10 - Math.round(v.sets * 10)) < 1e-9)
        };
      });
      const ok = r.chestSame && r.keinSammeltopf && r.trizepsDirekt === 0 &&
                 r.trizepsTotal === 1.5 && r.schultern === 1.5 && r.bizepsUnberuehrt && r.clean;
      return [ok, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-032', title: 'Large-Title-Kopfzeile bleibt beim Scrollen kleben',
    run: async () => {
      // overflow-x:hidden auf html/body macht das Element zum Scroll-Container.
      // position:sticky orientiert sich dann daran statt am Viewport - die
      // Kopfzeile scrollte einfach weg. overflow-x:clip schneidet genauso ab,
      // erzeugt aber keinen Scroll-Container.
      const r = await page.evaluate(async () => {
        go('dash');
        window.scrollTo(0, 0);
        await new Promise(res => setTimeout(res, 120));
        const el = document.querySelector('#s-dash .ltitle');
        const expandedH = Math.round(el.getBoundingClientRect().height);
        window.scrollTo(0, 400);
        // Warten, bis sich die Seite beruhigt hat, statt fest 160 ms zu raten:
        // beim Einklappen schrumpft die Kopfzeile um ~23 px, dadurch schrumpft
        // das Dokument, dadurch klemmt der Browser scrollY nach unten - und
        // waehrend dieses Nachziehens steht die Kopfzeile kurz bei top > 0.
        // Ohne Abwarten misst der Test genau dieses Zwischenbild.
        let last = -1, stable = 0;
        for (let i = 0; i < 40 && stable < 3; i++) {
          await new Promise(res => requestAnimationFrame(() => setTimeout(res, 16)));
          const now = Math.round(el.getBoundingClientRect().top) + Math.round(window.scrollY) * 1000;
          stable = now === last ? stable + 1 : 0;
          last = now;
        }
        const box = el.getBoundingClientRect();
        const t = parseFloat(el.style.getPropertyValue('--t') || '0');
        const scrolled = window.scrollY;
        window.scrollTo(0, 0);
        return {
          expandedH,
          collapsedTop: Math.round(box.top),
          collapsedH: Math.round(box.height),
          scrolled: Math.round(scrolled),
          t,
          overflow: getComputedStyle(document.body).overflowX
        };
      });
      // ACHTUNG: `top <= 1` wäre hier falsch — eine weggescrollte Kopfzeile
      // hat top = -377 und würde die Prüfung bestehen. Es muss der Betrag sein.
      const ok = r.scrolled > 100                 // es wurde wirklich gescrollt
        && Math.abs(r.collapsedTop) <= 1          // Kopfzeile klebt oben
        && r.t > 0.9                              // Scrollfortschritt kommt an
        && r.collapsedH < r.expandedH;            // und sie ist geschrumpft
      return [ok, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-033', title: 'Spezifische Bewegungsmuster schlagen allgemeine',
    run: async () => {
      // "Leg Curl" enthält "curl" und wurde als Bizeps-Curl erkannt: die
      // Animation zeigte einen stehenden Hantelcurl statt der Beinmaschine.
      // Die Reihenfolge der Regeln IST die Bedeutung.
      const r = await page.evaluate(() => {
        const cases = [
          ['Leg Curl', 'legcurl'], ['Beinbeuger sitzend', 'legcurl'],
          ['Leg Extension', 'legext'], ['Beinstrecker', 'legext'],
          ['KH Curls', 'curl'], ['Preacher Curl', 'curl'], ['Hammer Curls', 'curl'],
          ['Bankdrücken', 'push'], ['Schulterdrücken', 'pushh'],
          ['Latziehen breit', 'pulld'], ['Maschinenrudern eng', 'row'],
          ['Rumänisches Kreuzheben', 'hinge'], ['Kniebeugen', 'squat'],
          ['KH Seitheben', 'raise'], ['Trizepsdrücken Seil', 'triext'],
          ['Wadenheben stehend', 'calf'], ['Kabelcrunches', 'core'],
          ['Laufband', 'cardio'], ['Incline Pigeon Pose', 'mobility'],
          // PB-047: standen in Regeln, die vor der passenden kamen
          ['Katana Extensions Kabel', 'triext'], ['Katana Extension', 'triext'],
          ['Reverse Butterfly', 'raise'], ['Reverse Pec Deck', 'raise'],
          ['Face Pulls', 'raise'], ['Gesichtziehen', 'raise'],
          // PB-049: traf gar keine Regel und fiel auf den Muskel-Fallback zurueck,
          // der aus jeder unbekannten Armuebung einen Curl macht -> Bizeps
          ['Extensions Kabel', 'triext'], ['Overhead Extension', 'triext'],
          ['Rope Extensions', 'triext'],
          // Gegenprobe zu PB-049: "Extension" darf die spezifischen Regeln nicht kapern
          ['Leg Extensions', 'legext'], ['Back Extension', 'hinge'],
          ['Hyperextension', 'hinge'],
          // Gegenprobe: die allgemeinen Regeln greifen weiterhin
          ['Kabelzug Brust tief', 'push'], ['Butterfly', 'push'], ['Pec Deck', 'push'],
          ['LH Rudern vorgebeugt', 'row'], ['Ring Rows', 'row']
        ];
        // Muskel 'arms' statt 'chest': nur so laeuft eine namenlose Armuebung
        // ueberhaupt in den Fallback, um den es bei PB-049 geht.
        const fails = cases.filter(([n, want]) => detectMovePattern(n, 'chest', 'main') !== want)
                    .map(([n, want]) => `${n}: erwartet ${want}, ist ${detectMovePattern(n, 'chest', 'main')}`);
        const armCases = [['Extensions Kabel', 'triceps'], ['Hammercurls Kabel', 'biceps']];
        armCases.forEach(([n, want]) => {
          const got = volGroupOf(n, 'arms', 'main');
          if (got !== want) fails.push(`${n} (arms): erwartet ${want}, ist ${got}`);
        });
        return fails;
      });
      return [r.length === 0, r.join(' | ')];
    }
  },
  {
    id: 'PB-034', title: 'Illustration: Last hängt an der Hand, nicht daneben',
    run: async () => {
      // Beim Einbau der Heldenpose wurde nur die Figur auf die neue Startpose
      // gesetzt, Hantel und Kabel nicht - beides lief eine halbe Phase versetzt
      // und schwebte neben dem Arm.
      const r = await page.evaluate(() => {
        const bad = [];
        Object.keys(POSES).forEach(k => {
          const spec = POSES[k];
          if (!spec.load || spec.load === 'none') return;
          const host = document.createElement('div');
          host.style.cssText = 'position:absolute;left:-9999px;width:320px';
          host.innerHTML = exerciseAnimSVG('Test', 'chest', 'main', { kind: k, speed: 3 });
          document.body.appendChild(host);
          const svg = host.querySelector('svg');
          svg.pauseAnimations(); svg.setCurrentTime(0);
          const limbs = [...svg.querySelectorAll('polyline.lmb')];
          const bar = svg.querySelector('.bar') || svg.querySelector('.plate');
          if (!bar) { host.remove(); bad.push(k + ': keine Last gezeichnet'); return; }
          const bb = bar.getBBox();
          const bx = bb.x + bb.width / 2, by = bb.y + bb.height / 2;
          // kürzester Abstand der Last zu irgendeinem Gliedmaßen-Endpunkt
          let best = 1e9;
          limbs.forEach(l => {
            const pts = l.getAttribute('points').trim().split(/\s+/).map(s => s.split(',').map(Number));
            pts.forEach(([x, y]) => { best = Math.min(best, Math.hypot(x - bx, y - by)); });
          });
          host.remove();
          if (best > 26) bad.push(`${k}: Last ${best.toFixed(0)}px vom nächsten Gelenk entfernt`);
        });
        return bad;
      });
      return [r.length === 0, r.join(' | ')];
    }
  },
  {
    id: 'PB-035', title: 'Illustration: Figur bleibt im sichtbaren Bereich',
    run: async () => {
      // Beim Wadenheben schwebte die Figur ausserhalb des Bildausschnitts,
      // weil die Wurzelposition angehoben wurde, um die Ferse zu senken.
      const r = await page.evaluate(() => {
        const bad = [];
        Object.keys(POSES).forEach(k => {
          ['a', 'b'].forEach(which => {
            const spec = POSES[k], orig = spec.hero;
            spec.hero = which;
            const host = document.createElement('div');
            host.style.cssText = 'position:absolute;left:-9999px;width:320px';
            host.innerHTML = exerciseAnimSVG('Test', 'chest', 'main', { kind: k, speed: 3 });
            spec.hero = orig;
            document.body.appendChild(host);
            const svg = host.querySelector('svg');
            svg.pauseAnimations(); svg.setCurrentTime(0);
            [...svg.querySelectorAll('polyline.lmb,circle.hd')].forEach(el => {
              const b = el.getBBox();
              if (b.x < 2 || b.y < 2 || b.x + b.width > 318 || b.y + b.height > 208)
                bad.push(`${k}/${which}: ausserhalb (${b.x.toFixed(0)},${b.y.toFixed(0)} ${b.width.toFixed(0)}x${b.height.toFixed(0)})`);
            });
            host.remove();
          });
        });
        return [...new Set(bad)];
      });
      return [r.length === 0, r.slice(0, 4).join(' | ')];
    }
  },
  {
    id: 'PB-043', title: 'Übungskacheln zeigen die Marke, kein Bild',
    run: async () => {
      // Ersetzt PB-036 und PB-037: die Fotoschicht ist entfernt (siehe
      // docs/BUGS.md). Der neue Vertrag lautet - in Listen NIE ein <img>,
      // immer eine Marke mit lesbarem Bewegungsmuster, auch fuer unbekannte
      // Uebungen; die Demo liefert weiterhin die animierte Figur.
      const r = await page.evaluate(() => {
        const host = document.createElement('div');
        host.style.cssText = 'position:absolute;left:-9999px;width:320px';
        document.body.appendChild(host);
        const probe = (name, muscle, type) => {
          host.innerHTML = exerciseVisual(name, muscle, type, { thumb: true });
          const mark = host.querySelector('.exmark');
          return {
            img: host.querySelectorAll('img').length,
            mark: !!mark,
            pattern: mark ? mark.getAttribute('data-pattern') : '',
            svg: !!host.querySelector('svg path')
          };
        };
        const cases = [
          probe('Bankdrücken', 'chest', 'main'),
          probe('Völlig Erfundene Übung 4711', 'back', 'main'),
          probe('', 'legs', 'main'),
          probe('Leg Curl', 'legs', 'main')
        ];
        // Muster muss zur Uebung passen, nicht nur irgendein Text sein
        host.innerHTML = exerciseVisual('Schulterdrücken LH', 'shoulders', 'main', { thumb: true });
        const vertical = host.querySelector('.exmark').getAttribute('data-pattern');
        host.innerHTML = exerciseVisual('Bankdrücken', 'chest', 'main', { thumb: true });
        const horizontal = host.querySelector('.exmark').getAttribute('data-pattern');
        // Demo bleibt die animierte Figur
        host.innerHTML = exerciseVisual('Kniebeugen', 'legs', 'main', {});
        const demo = { svg: !!host.querySelector('svg'), img: host.querySelectorAll('img').length };
        // Kein Rest der Fotoschicht mehr im Code
        const css = [...document.querySelectorAll('style')].map(x => x.textContent).join('\n');
        const leftovers = /exphoto|EXPHOTO/.test(css) || typeof window.exercisePhotoId === 'function';
        host.remove();
        return { cases, vertical, horizontal, demo, leftovers };
      });
      const ok = r.cases.every(c => c.img === 0 && c.mark && c.pattern && c.svg)
        && /Vertikales/.test(r.vertical) && /Horizontales/.test(r.horizontal)
        && r.demo.svg && r.demo.img === 0 && !r.leftovers;
      return [ok, JSON.stringify(r).slice(0, 300)];
    }
  },
  {
    id: 'PB-017', title: 'Wochenring zählt dieselben Sätze wie seine Landmarks',
    run: async () => {
      const r = await page.evaluate(() => {
        const week = weeklyHistorySeries(6);
        const cur = week[week.length - 1] || [];
        const ring = cur.reduce((a, s) => a + strengthSets(s.sets).filter(x => !x.type || x.type === 'main').length, 0);
        const anyCardio = cur.some(s => s.sets.some(isCardioSet));
        const naive = cur.reduce((a, s) => a + s.sets.length, 0);
        return { ring, naive, anyCardio, excludes: !anyCardio || ring < naive };
      });
      return [r.excludes, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-038', title: 'Zonen-Überschriften stimmen mit ihrem Inhalt überein',
    run: async () => {
      // Das Fokus-Layout gliedert in "Erledigt / aktive Übung / Danach".
      // "Danach" darf nie VOR der aktiven Übung im DOM stehen - sonst
      // behauptet die Überschrift das Gegenteil dessen, was darunter steht.
      const r = await page.evaluate(() => {
        D.active = null; startWorkout('FullBody_A');
        // Erste Übung abhaken, damit es eine "Erledigt"-Zone gibt.
        const first = D.active.exercises[0];
        first.logged = Array.from({ length: first.sets }, () => ({ w: 20, r: 8, rir: 2, note: '' }));
        renderWo(); go('wo');
        const nodes = [...document.querySelectorAll('#wo-c .st, #wo-c .wo-act')];
        const idxAct = nodes.findIndex(n => n.classList.contains('wo-act'));
        const heads = nodes.map((n, i) => n.classList.contains('wo-act')
          ? '<AKTIV>' : (i < idxAct ? 'vor:' : 'nach:') + n.textContent.trim());
        const danachVorAktiv = nodes.some((n, i) =>
          n.classList.contains('st') && i < idxAct && /Danach/.test(n.textContent));
        const erledigtNachAktiv = nodes.some((n, i) =>
          n.classList.contains('st') && idxAct >= 0 && i > idxAct && /Erledigt/.test(n.textContent));
        D.active = null; save();
        return { heads, idxAct, danachVorAktiv, erledigtNachAktiv };
      });
      return [r.idxAct >= 0 && !r.danachVorAktiv && !r.erledigtNachAktiv, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-039', title: 'Coach-Matrix hat eindeutige Spaltenüberschriften',
    run: async () => {
      // Die erste Fassung kuerzte den Plannamen auf sechs Zeichen. Aus
      // "FullBody A" und "FullBody B" wurde damit zweimal "FULLBO" - eine
      // Tabelle, in der zwei Spalten gleich heissen, ist keine Tabelle.
      const r = await page.evaluate(() => {
        const before = JSON.parse(JSON.stringify(D.plan));
        D.plan = {
          Ganzkoerper_A: { day: 'Mo', exercises: [{ id: 1, name: 'Bankdrücken', sets: 3, rmin: 8, rmax: 10, rir: 2, type: 'main', muscle: 'chest', note: '' }] },
          Ganzkoerper_B: { day: 'Do', exercises: [{ id: 2, name: 'Kniebeugen', sets: 3, rmin: 6, rmax: 10, rir: 2, type: 'main', muscle: 'legs', note: '' }] },
          Ganzkoerper_C: { day: 'Sa', exercises: [{ id: 3, name: 'Latziehen breit', sets: 3, rmin: 8, rmax: 12, rir: 2, type: 'main', muscle: 'back', note: '' }] }
        };
        const distinct = coachDayLabels(Object.keys(D.plan));
        // Zweiter Fall: Plannamen ohne unterscheidbares letztes Wort.
        D.plan = {
          Oberkoerper: { day: 'Mo', exercises: [{ id: 4, name: 'Bankdrücken', sets: 3, rmin: 8, rmax: 10, rir: 2, type: 'main', muscle: 'chest', note: '' }] },
          Unterkoerper: { day: 'Do', exercises: [{ id: 5, name: 'Kniebeugen', sets: 3, rmin: 6, rmax: 10, rir: 2, type: 'main', muscle: 'legs', note: '' }] }
        };
        const collide = coachDayLabels(Object.keys(D.plan));
        D.plan = before; save(); coachInvalidate();
        const uniq = a => new Set(a).size === a.length && a.every(Boolean);
        return { distinct, collide, ok: uniq(distinct) && uniq(collide) };
      });
      return [r.ok, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-040', title: 'Coach-Maßnahmen lassen den Plan gültig zurück',
    run: async () => {
      // Vorwaertsgerichteter Test (wie PB-029/PB-030): Die Massnahmen des
      // Coaches schreiben in D.plan. Zwei Zusagen muessen dabei halten:
      //   "Verteilen" aendert die Frequenz, NICHT das Volumen.
      //   "- Satz" faellt nie unter einen Satz.
      const r = await page.evaluate(() => {
        const before = JSON.parse(JSON.stringify(D.plan));
        const sets = () => Object.values(D.plan).flatMap(d => d.exercises || [])
          .filter(e => e.type === 'main' && e.muscle === 'chest')
          .reduce((a, e) => a + (parseInt(e.sets) || 0), 0);
        const days = () => Object.values(D.plan)
          .filter(d => (d.exercises || []).some(e => e.type === 'main' && e.muscle === 'chest')).length;
        D.plan = {
          Tag_A: { day: 'Mo', exercises: [
            { id: 1, name: 'Bankdrücken', sets: 4, rmin: 8, rmax: 10, rir: 2, type: 'main', muscle: 'chest', note: '' },
            { id: 2, name: 'Butterfly', sets: 3, rmin: 12, rmax: 15, rir: 1, type: 'main', muscle: 'chest', note: '' }] },
          Tag_B: { day: 'Do', exercises: [
            { id: 3, name: 'Kniebeugen', sets: 3, rmin: 6, rmax: 10, rir: 2, type: 'main', muscle: 'legs', note: '' }] }
        };
        const volBefore = sets(), freqBefore = days();
        coachSpreadMuscle('chest');
        const volAfter = sets(), freqAfter = days();
        // Auf 1 Satz herunterfahren und dann weiter druecken.
        D.plan = { Tag_A: { day: 'Mo', exercises: [
          { id: 1, name: 'Bankdrücken', sets: 1, rmin: 8, rmax: 10, rir: 2, type: 'main', muscle: 'chest', note: '' }] } };
        coachTrimSet('chest'); coachTrimSet('chest');
        const floor = D.plan.Tag_A.exercises[0].sets;
        D.plan = before; save(); coachInvalidate();
        return { volBefore, volAfter, freqBefore, freqAfter, floor };
      });
      return [r.volBefore === r.volAfter && r.freqAfter > r.freqBefore && r.floor >= 1, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-044', title: 'Session-Vergleich nur bei vergleichbaren Sessions',
    run: async () => {
      // Derselbe Plan-Schluessel garantiert nicht denselben Inhalt. Wer den Tag
      // umbaut, verglich vorher Beine gegen Brust - das ergab Prozentwerte wie
      // "+192 %", die nichts bedeuten. Ausserdem: Koerpergewichtsuebungen haben
      // konstant 0 kg, dort muss die Wiederholungszahl verglichen werden.
      const r = await page.evaluate(() => {
        const before = JSON.parse(JSON.stringify(D.history));
        const mkSet = (ex, w, reps, muscle) => ({ ex, nr: 1, w, r: reps, rir: 2, muscle, type: 'main', note: '' });
        D.history = [
          { id: 'x1', date: '01.07.2026', planKey: 'Tag_A', duration: 60, updatedAt: 1,
            sets: [mkSet('Bankdrücken', 80, 8, 'chest'), mkSet('Klimmzüge', 0, 8, 'back')] },
          // gleicher Schluessel, voellig anderer Inhalt -> kein Vergleich
          { id: 'x2', date: '08.07.2026', planKey: 'Tag_A', duration: 60, updatedAt: 2,
            sets: [mkSet('Kniebeugen', 120, 5, 'legs'), mkSet('Beinpresse', 200, 10, 'legs')] },
          // gleicher Schluessel, gleicher Inhalt -> Vergleich erlaubt
          { id: 'x3', date: '15.07.2026', planKey: 'Tag_A', duration: 60, updatedAt: 3,
            sets: [mkSet('Kniebeugen', 125, 5, 'legs'), mkSet('Beinpresse', 210, 10, 'legs')] },
          // Koerpergewicht: mehr Wiederholungen bei 0 kg
          { id: 'x4', date: '22.07.2026', planKey: 'Tag_B', duration: 50, updatedAt: 4,
            sets: [mkSet('Klimmzüge', 0, 8, 'back')] },
          { id: 'x5', date: '29.07.2026', planKey: 'Tag_B', duration: 50, updatedAt: 5,
            sets: [mkSet('Klimmzüge', 0, 11, 'back')] }
        ];
        const find = id => D.history.find(h => h.id === id);
        const res = {
          mismatchNoCompare: previousSameSession(find('x2')) === null,
          matchCompares: (previousSameSession(find('x3')) || {}).id === 'x2',
          bodyweightCompares: (previousSameSession(find('x5')) || {}).id === 'x4'
        };
        // Und die gerenderte Zeile muss Wiederholungen statt Kilogramm zeigen
        const html = histSessionHTML({ ...find('x5'), __i: 4 });
        res.showsReps = /11<\/b>\s*←\s*8\s*Wdh/.test(html) || (/Wdh/.test(html) && !/0\s*kg/.test(html));
        // Keine erfundene Prozentzahl bei fehlendem Vorgaenger
        res.noFakePercent = !/VOLUMEN/.test(histSessionHTML({ ...find('x2'), __i: 1 }));
        // PR-Erkennung: 125 kg schlaegt 120 kg, 120 kg selbst ist kein PR
        const prs3 = sessionPRs(find('x3')).map(p => p.ex);
        const prs2 = sessionPRs(find('x2')).map(p => p.ex);
        res.prFound = prs3.includes('Kniebeugen');
        res.noPrOnFirst = prs2.length === 0;
        D.history = before; save();
        return res;
      });
      const ok = Object.values(r).every(v => v === true);
      return [ok, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-045', title: 'Stats bleibt korrekt bei leeren und einseitigen Daten',
    run: async () => {
      // Der Stats-Screen rechnet Trends, Noten und Stagnation. Genau solche
      // abgeleiteten Werte kippen an den Raendern: keine Historie, nur eine
      // Session, nur Koerpergewichtsuebungen, nur Cardio.
      const r = await page.evaluate(() => {
        const before = JSON.parse(JSON.stringify(D.history));
        const res = {};
        const mk = (date, key, sets) => ({ id: 'p' + date, date, planKey: key, duration: 60, updatedAt: 1, sets });
        const set = (ex, w, reps, muscle, mode) => ({ ex, nr: 1, w, r: reps, rir: 2, muscle, type: 'main', note: '', ...(mode ? { mode } : {}) });

        // 1. Leere Historie darf nicht werfen und muss einen leeren Zustand zeigen
        D.history = []; renderAna(); go('ana');
        res.emptyOk = /Noch keine Trainingsdaten/.test(document.getElementById('ana-report').textContent)
          && !!document.getElementById('ana-progress').textContent;

        // 2. Eine einzige Session: kein Trend, aber auch kein Absturz und keine
        //    erfundene Prozentzahl gegen eine nicht existierende Vorwoche
        D.history = [mk('01.07.2026', 'Tag_A', [set('Bankdrücken', 80, 8, 'chest')])];
        renderAna();
        const rep1 = document.getElementById('ana-report').textContent;
        res.singleNoFakeTrend = /keine Vorwoche/.test(rep1) && !/NaN|Infinity|undefined/.test(rep1);

        // 3. Nur Koerpergewicht: Trend muss in Wiederholungen rechnen, nicht in kg
        D.history = [
          mk('01.07.2026', 'Tag_B', [set('Klimmzüge', 0, 6, 'back')]),
          mk('08.07.2026', 'Tag_B', [set('Klimmzüge', 0, 9, 'back')]),
          mk('15.07.2026', 'Tag_B', [set('Klimmzüge', 0, 11, 'back')])
        ];
        const bw = exerciseProgress('Klimmzüge');
        res.bodyweightUsesReps = !!bw && bw.bodyweight === true && bw.unit === 'Wdh' && bw.last === 11;

        // 4. Nur Cardio: darf gar nicht in der Progression auftauchen
        D.history = [
          mk('01.07.2026', 'Tag_C', [set('Laufband', 12, 30, 'legs', 'cardio')]),
          mk('08.07.2026', 'Tag_C', [set('Laufband', 12, 35, 'legs', 'cardio')])
        ];
        renderAna();
        res.cardioExcluded = progressAll().length === 0;

        // 5. Stagnation wird erkannt, wenn seit vier Einheiten kein Bestwert faellt
        const flat = [];
        for (let i = 1; i <= 6; i++) flat.push(mk(`0${i}.07.2026`, 'Tag_D', [set('Beinpresse', i <= 2 ? 200 : 180, 10, 'legs')]));
        D.history = flat;
        const p = exerciseProgress('Beinpresse');
        res.staleDetected = !!p && p.stale >= 4;

        // 6. e1RM-Formel: 1 Wiederholung ist die Last selbst, mehr ist mehr
        res.e1rm = e1RM(100, 1) === 100 && e1RM(100, 5) > 100 && e1RM(0, 5) === 0 && e1RM(100, 0) === 0;

        D.history = before; save(); renderAna();
        return res;
      });
      const ok = Object.values(r).every(v => v === true);
      return [ok, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-063', title: 'Sheets stapeln sich in der Reihenfolge, in der man sie oeffnet',
    run: async () => {
      // Der Scheibenrechner steht im Markup VOR dem Log-Dialog. Beide lagen
      // auf z-index 200 - bei Gleichstand gewinnt die Dokumentreihenfolge,
      // also oeffnete sich der Rechner HINTER dem Dialog, aus dem er
      // aufgerufen wurde. Man musste erst den Dialog schliessen, um ihn zu
      // sehen. Die Reihenfolge im Dokument ist keine Rangfolge.
      const r = await page.evaluate(() => {
        document.querySelectorAll('.mbg.show').forEach(m => { m.classList.remove('show'); m.style.zIndex = ''; });
        D.active = null; startWorkout(Object.keys(D.plan)[0]);
        openLog(0);
        document.getElementById('log-w').value = '87.5';
        openPlates('87.5', true);
        const z = id => parseInt(getComputedStyle(document.getElementById(id)).zIndex) || 0;
        const res = {
          beideOffen: document.getElementById('m-log').classList.contains('show')
                      && document.getElementById('m-plates').classList.contains('show'),
          rechnerObenauf: z('m-plates') > z('m-log'),
          uebernehmenSichtbar: document.getElementById('plate-back').style.display !== 'none'
        };
        // Uebernehmen schreibt zurueck und laesst den Log-Dialog stehen
        document.getElementById('plate-w').value = '92.5';
        platesToLog();
        res.rechnerZu = !document.getElementById('m-plates').classList.contains('show');
        res.logNochOffen = document.getElementById('m-log').classList.contains('show');
        res.wertUebernommen = document.getElementById('log-w').value === '92.5';
        // Aus dem Setup heraus (ohne Log) gibt es keinen Rueckweg-Knopf
        cm('m-log');
        openPlates(100);
        res.ohneLogKeinKnopf = document.getElementById('plate-back').style.display === 'none';
        cm('m-plates');
        D.active = null; save();
        return res;
      });
      const ok = Object.values(r).every(v => v === true);
      return [ok, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-062', title: 'Einklappbare Abschnitte merken sich ihren Zustand',
    run: async () => {
      // Der Zustand liegt in D.ui und nicht in einer Modulvariablen - sonst
      // klappt jeder Screen bei jedem Reload wieder auf und die Einstellung
      // ist auf dem zweiten Geraet weg. Die Volumenkarte traegt eingeklappt
      // zusaetzlich eine Kurzfassung: sonst muesste man aufklappen, nur um
      // zu sehen, ob ueberhaupt etwas fehlt.
      const r = await page.evaluate(() => {
        ensureUIState();
        const before = JSON.parse(JSON.stringify(D.ui.sections || {}));
        D.ui.sections = {};
        go('dash');            // sonst hat die Karte auf einem inaktiven Screen keine Hoehe
        renderDash();
        const card = () => document.querySelector('#d-muscle-volume .muscle-volume-card');
        const hoeheOffen = Math.round(card().getBoundingClientRect().height);
        toggleSection('volumen');
        const zu = card();
        const hoeheZu = Math.round(zu.getBoundingClientRect().height);
        const body = document.getElementById('volumen-body');
        const res = {
          gespeichert: D.ui.sections.volumen === true,
          rumpfVersteckt: !!body && body.classList.contains('sec-collapsed'),
          kurzfassung: !!zu.querySelector('.mv-sum'),
          hatHoehe: hoeheOffen > 100,
          deutlichKleiner: hoeheZu < hoeheOffen - 100,
          // Neu zeichnen darf den Zustand nicht verlieren
          ueberlebtRender: (() => { renderDash(); const b = document.getElementById('volumen-body');
            return !!b && b.classList.contains('sec-collapsed'); })()
        };
        toggleSection('volumen');
        res.wiederOffen = !document.getElementById('volumen-body').classList.contains('sec-collapsed');
        D.ui.sections = before; save(); renderDash();
        return res;
      });
      const ok = Object.values(r).every(v => v === true);
      return [ok, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-061', title: 'Jedes Sheet bleibt bedienbar, auch mit eingeblendeter Tastatur',
    run: async () => {
      // "Satz loggen" war 590 px hoch und lag auf einem iPhone SE (667 px) mit
      // Tastatur zu weit unten: der Speichern-Knopf war nicht erreichbar. Die
      // Tastatur bekam zusaetzliches PADDING am Sheet statt Platz DAVOR - das
      // Sheet wuchs also nach unten hinter die Tastatur.
      const sizes = [[375, 667], [390, 844], [430, 932]];
      const KB = 336;                        // iOS-Tastatur inkl. Vorschlagsleiste
      const bad = [];
      for (const [w, h] of sizes) {
        await page.setViewportSize({ width: w, height: h });
        const r = await page.evaluate(async kb => {
          /* Alle Sheets, nicht nur die fuenf aus dem urspruenglichen Fund:
             was sich oeffnen laesst, muss auch bedienbar sein. Die Liste wird
             unten gegen die im Markup vorhandenen .mbg-Elemente abgeglichen,
             damit ein neues Sheet nicht stillschweigend durchrutscht. */
          const wo = () => { D.active = null; startWorkout(Object.keys(D.plan)[0]); };
          const ersteUebung = () => D.plan[Object.keys(D.plan)[0]].exercises[0];
          /* Das dritte Feld trennt zwei Sorten Sheet:
             'formular' — man tippt etwas ein und schliesst mit einer Aktion ab.
                          Hier gilt der volle Vertrag: klebende Aktionszeile,
                          Hauptaktion trotz Tastatur erreichbar.
             'auswahl'  — man tippt hoechstens einen Suchbegriff und tippt dann
                          auf einen Listeneintrag. Eine klebende Aktionszeile
                          waere hier eine Leerzeile: es gibt keine Aktion.
             'inline'   — Formular UND Liste im selben Sheet. Kleben geht hier
                          nicht (ein sticky Element klebt nur, solange sein
                          Elternteil im Bild ist), also gilt der Vertrag der
                          Naehe: die Aktion steht direkt unter dem letzten
                          Eingabefeld und ist mit ihm zusammen sichtbar. */
          const sheets = [
            ['m-log', () => { wo(); openLog(0); }, 'formular'],
            ['m-timebudget', () => { wo(); openTimeBudget(); }, 'formular'],
            ['m-exnote', () => openExNote('Bankdrücken'), 'formular'],
            ['m-egym', () => openEgymEntry(), 'formular'],
            ['m-plates', () => openPlates(87.5), 'formular'],
            ['m-add', () => { curTab = Object.keys(D.plan)[0]; openAddEx(); }, 'formular'],
            ['m-planday', () => openPlanDayModal('add'), 'formular'],
            ['m-import', () => openPlanImport(), 'formular'],
            ['m-lib-edit', () => openLibraryEditor(), 'inline'],
            ['m-alt', () => { wo(); openAlternative(0); }, 'auswahl'],
            ['m-evidence', () => showEvidence(EVIDENCE_DB[0].n), 'auswahl'],
            ['m-exdemo', () => { const e = ersteUebung(); showExDemo(e.name, e.muscle, e.type); }, 'auswahl'],
            ['m-exhist', () => showExHist(ersteUebung().name), 'auswahl'],
            ['m-lib', () => openLibrary(), 'auswahl'],
            // Der Auswahl-Dialog erscheint nur ohne laufendes Workout —
            // sonst geht startWorkout() direkt in den Wechsel-Dialog.
            ['m-pick', () => { D.active = null; D.health.sick = false; startWorkout(); }, 'auswahl'],
            ['m-rotation', () => proposeRotation(), 'auswahl'],
            ['m-woswitch', () => { wo(); openWorkoutSwitch(); }, 'auswahl'],
            ['m-share', async () => { await openPlanShare([Object.keys(D.plan)[0]]); }, 'auswahl'],
            ['m-importpreview', async () => {
              const c = await encodeSharePayload({ v: 1, n: 'T', a: '', t: '2026-01-01',
                d: [['A', 'Mo', [['Bankdrücken', 3, 8, 12, 2, 'main', 'chest', '']]]] });
              await startPlanImport(c);
            }, 'auswahl'],
            ['m-wosummary', () => {
              /* Die Zusammenfassung erscheint nach dem Beenden - dafuer muss
                 mindestens ein Satz geloggt sein, sonst gibt es nichts zu
                 zeigen. */
              wo(); openLog(0);
              document.getElementById('log-w').value = '60';
              document.getElementById('log-r').value = '10';
              document.getElementById('log-rir').value = '2';
              confirmLog(); cm('m-log'); endWorkout();
            }, 'auswahl']
          ];
          const out = [];
          for (const [id, open, art] of sheets) {
            document.querySelectorAll('.mbg.show').forEach(m => m.classList.remove('show'));
            document.documentElement.style.setProperty('--kb', '0px');
            try { await open(); } catch (e) { out.push({ id, err: String(e.message) }); continue; }
            if (!document.getElementById(id).classList.contains('show')) {
              out.push({ id, err: 'liess sich nicht oeffnen' }); continue;
            }
            // Das Sheet faehrt mit 0,32 s ein - vorher gemessen misst man die
            // Animation, nicht die Position.
            await new Promise(r => setTimeout(r, 420));
            const dlg = document.querySelector('#' + id + ' .mdl');
            if (!dlg) { out.push({ id, err: 'kein Sheet' }); continue; }
            const vh = window.innerHeight;
            const ohne = Math.round(dlg.getBoundingClientRect().height);
            const cta = dlg.querySelector('.sheet-cta .btn') ||
                        [...dlg.querySelectorAll('.btn')].pop();
            /* Die Tastatur erscheint nur, wo man etwas eintippen kann. Bei
               einem Sheet ohne Eingabefeld die Hauptaktion gegen ein
               Tastaturlimit zu messen, misst nichts. */
            const hatEingabe = !!dlg.querySelector(
              'input:not([readonly]):not([type=file]):not([type=checkbox]):not([type=radio]), textarea:not([readonly])');
            document.documentElement.style.setProperty('--kb', kb + 'px');
            void dlg.offsetHeight;
            const box = cta ? cta.getBoundingClientRect() : null;
            document.documentElement.style.setProperty('--kb', '0px');
            /* Bei 'inline' zaehlt der Abstand zwischen dem letzten Feld des
               Formularblocks und der Aktion — nicht die absolute Position. */
            const felder = [...dlg.querySelectorAll('input:not([type=file]):not([type=checkbox]), textarea, select')];
            const letztesVorCta = cta
              ? felder.filter(f => f.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING).pop()
              : null;
            const abstand = letztesVorCta && box
              ? Math.round(box.top - letztesVorCta.getBoundingClientRect().bottom) : null;
            /* Eine Auswahlleiste, die umbricht, schiebt ihre letzte Option
               hinter die klebende Aktionszeile — der Sonntag war so auf
               375 px nicht mehr zu sehen. */
            const chips = [...dlg.querySelectorAll('.chipgrid .daychip')];
            const chipZeilen = new Set(chips.map(c => Math.round(c.getBoundingClientRect().top))).size;
            out.push({ id, art, vh, ohne, hatEingabe, abstand,
                       chips: chips.length, chipZeilen,
                       chipUeberlauf: chips.some(c => c.scrollWidth > c.clientWidth + 1),
                       ctaUnten: box ? Math.round(box.bottom) : null,
                       limit: vh - kb, hatCta: !!dlg.querySelector('.sheet-cta') });
          }
          document.querySelectorAll('.mbg.show').forEach(m => m.classList.remove('show'));
          D.active = null; save();
          /* Vollstaendigkeit: ein neu gebautes Sheet, das hier nicht in der
             Liste steht, wuerde sonst nie geprueft und niemandem auffallen. */
          const alle = [...document.querySelectorAll('.mbg')].map(m => m.id).filter(Boolean);
          const fehlt = alle.filter(id => !sheets.some(s => s[0] === id));
          if (fehlt.length) out.push({ id: fehlt.join(','), err: 'Sheet nicht in der Prueflise' });
          return out;
        }, KB);
        r.forEach(x => {
          const tag = `${w}×${h} ${x.id}`;
          if (x.err) { bad.push(tag + ': ' + x.err); return; }
          // Ohne Tastatur darf kein Sheet hoeher sein als der Bildschirm
          if (x.ohne > x.vh) bad.push(`${tag}: ${x.ohne} > ${x.vh}`);
          // Wochentagsleiste: eine Zeile, und keine Beschriftung abgeschnitten
          if (x.chips) {
            if (x.chipZeilen !== 1) bad.push(`${tag}: ${x.chips} Chips auf ${x.chipZeilen} Zeilen`);
            if (x.chipUeberlauf) bad.push(tag + ': Chip-Beschriftung abgeschnitten');
          }
          if (x.art === 'inline') {
            // Formular plus Liste: die Aktion muss beim Formular stehen.
            if (x.abstand === null) bad.push(tag + ': keine Aktion beim Formular');
            else if (x.abstand > 120) bad.push(`${tag}: Aktion ${x.abstand} px unter dem letzten Feld`);
            return;
          }
          if (x.art !== 'formular') return;
          // Wo man tippt und abschliesst, muss die Aktion trotz Tastatur erreichbar sein
          if (x.ctaUnten !== null && x.ctaUnten > x.limit)
            bad.push(`${tag}: Knopf bei ${x.ctaUnten}, Limit ${x.limit}`);
          // ... und zwar ueber eine klebende Aktionszeile, nicht durch Zufall
          if (!x.hatCta) bad.push(tag + ': Formular ohne klebende Aktionszeile');
        });
      }
      await page.setViewportSize({ width: 390, height: 844 });
      return [bad.length === 0, bad.slice(0, 6).join(' | ')];
    }
  },
  {
    id: 'PB-059', title: 'Autoregulation reagiert auf RIR, aber nicht auf Rauschen',
    run: async () => {
      // RIR wurde bisher nur protokolliert. Jetzt steuert die Abweichung vom
      // Ziel-RIR die naechste Vorgabe - aber erst ab einer ganzen Stufe,
      // sonst schwankt sie mit jeder Selbsteinschaetzung.
      const r = await page.evaluate(() => {
        const beforeHist = JSON.parse(JSON.stringify(D.history));
        const beforePlan = JSON.parse(JSON.stringify(D.plan));
        D.history = []; D.ui.deload = { active: false, since: 0, until: 0 };
        D.ui.meso = { active: false, start: 0, weeks: 5 };
        const mk = rir => ({ name: 'Bankdrücken', sets: 4, rmin: 6, rmax: 10, rir: 2,
          type: 'main', muscle: 'chest', note: '',
          logged: [{ w: 100, r: 8, rir, nr: 1 }] });
        const zuSchwer = nextSetTarget(mk(0));
        const passend = nextSetTarget(mk(2));
        const knapp = nextSetTarget(mk(3));
        const zuLeicht = nextSetTarget(mk(4));
        D.history = beforeHist; D.plan = beforePlan; save();
        const num = t => parseFloat(String(t.num).replace(',', '.'));
        return {
          // RIR 0 statt 2: Gewicht runter, nicht eine Wiederholung mehr
          schwererSatzSenkt: num(zuSchwer) < 100 && /RIR 0/.test(zuSchwer.why),
          // RIR 2 = Ziel: normale doppelte Progression, Gewicht bleibt
          zielUnveraendert: num(passend) === 100 && /× 9/.test(passend.unit),
          // Eine Stufe drueber ist noch kein Signal
          eineStufeIgnoriert: num(knapp) === 100 && /× 9/.test(knapp.unit),
          // Zwei Stufen drueber: zwei Wiederholungen mehr
          zuLeichtSteigt: num(zuLeicht) === 100 && /× 10/.test(zuLeicht.unit)
        };
      });
      const ok = Object.values(r).every(v => v === true);
      return [ok, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-060', title: 'Stagnations-Aktionen greifen in den Plan und lassen die Historie',
    run: async () => {
      // Der Befund allein hilft nicht. Die drei Handgriffe muessen wirken -
      // und sie duerfen nur den Plan aendern, nie geloggte Saetze.
      const r = await page.evaluate(() => {
        const beforePlan = JSON.parse(JSON.stringify(D.plan));
        const beforeHist = JSON.parse(JSON.stringify(D.history));
        D.plan = { Tag_A: { day: 'Mo', exercises: [
          { id: 1, name: 'Bankdrücken', sets: 4, rmin: 6, rmax: 10, rir: 2,
            type: 'main', muscle: 'chest', note: '', ss: null }] } };
        D.history = [{ id: 'S1', updatedAt: Date.now(), date: '01.07.2026', planKey: 'Tag_A',
          duration: 40, sets: [{ ex: 'Bankdrücken', nr: 1, w: 100, r: 8, rir: 2, note: '',
            muscle: 'chest', type: 'main', mode: '' }] }];
        save();
        const histVorher = JSON.stringify(D.history);
        shiftRepRange('Bankdrücken', 2);
        const nachRange = { ...D.plan.Tag_A.exercises[0] };
        easeStaleExercise('Bankdrücken');
        const nachSets = D.plan.Tag_A.exercises[0].sets;
        // Tausch: bestaetigen erzwingen, ohne Dialog
        const origConfirm = window.confirm; window.confirm = () => true;
        const alt = alternativeFor(D.plan.Tag_A.exercises[0], new Set(['bankdrucken']));
        swapStaleExercise('Bankdrücken');
        window.confirm = origConfirm;
        const nachName = D.plan.Tag_A.exercises[0].name;
        const res = {
          rangeVerschoben: nachRange.rmin === 8 && nachRange.rmax === 12,
          satzWeniger: nachSets === 3,
          altGefunden: !!alt,
          getauscht: !alt || nachName !== 'Bankdrücken',
          gleichesMuster: !alt || detectMovePattern(nachName, 'chest', 'main') === 'push',
          historieUnberuehrt: JSON.stringify(D.history) === histVorher,
          ohnePlanKeinAbsturz: (() => { try { shiftRepRange('Gibt Es Nicht', 2); return true; } catch (e) { return false; } })()
        };
        D.plan = beforePlan; D.history = beforeHist; save();
        return res;
      });
      const ok = Object.values(r).every(v => v === true);
      return [ok, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-057', title: 'Supersatz spart Pause, nicht Volumen',
    run: async () => {
      // Der Zweck ist Zeit, nicht weniger Arbeit: dieselben Saetze, eine
      // gemeinsame Pause. Wenn die Kopplung das VOLUMEN aendert, ist sie ein
      // heimlicher Volumenschnitt.
      const r = await page.evaluate(() => {
        const before = JSON.parse(JSON.stringify(D.plan));
        const mk = (id, name, muscle, sets, ss) =>
          ({ id, name, sets, rmin: 8, rmax: 12, rir: 2, type: 'main', muscle, note: '', ss: ss || null });
        D.plan = { Tag_A: { day: 'Mo', exercises: [
          mk(1, 'Wadenheben stehend', 'legs', 4), mk(2, 'Kabelcrunches', 'core', 4)] } };
        save();
        const volOhne = planWeeklyVolume(true);
        const zeitOhne = estimatedDuration('Tag_A');
        D.plan.Tag_A.exercises[0].ss = 'SA';
        D.plan.Tag_A.exercises[1].ss = 'SA';
        save();
        const volMit = planWeeklyVolume(true);
        const zeitMit = estimatedDuration('Tag_A');
        const paar = D.plan.Tag_A.exercises;
        const res = {
          volumenGleich: volOhne.calves.sets === volMit.calves.sets && volOhne.core.sets === volMit.core.sets,
          zeitKuerzer: zeitMit < zeitOhne,
          // Zwei schwere Grunduebungen darf er nicht koppeln
          keinDoppelCompound: supersetFits(
            { name: 'Bankdrücken', muscle: 'chest', type: 'main' },
            { name: 'Beinpresse', muscle: 'legs', type: 'main' }) === false,
          // Gleiche Muskelgruppe ebenfalls nicht
          keinGleicherMuskel: supersetFits(
            { name: 'Kabelcrunches', muscle: 'core', type: 'main' },
            { name: 'Hängendes Beinheben', muscle: 'core', type: 'main' }) === false,
          passendErlaubt: supersetFits(paar[0], paar[1]) === true
        };
        D.plan = before; save();
        return res;
      });
      const ok = Object.values(r).every(v => v === true);
      return [ok, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-058', title: 'Zeitbudget kuerzt von der richtigen Seite',
    run: async () => {
      // Wer selbst kuerzt, hoert hinten auf - und hinten stehen Arme, Waden
      // und Rumpf. Die Funktion muss stattdessen Grunduebungen zuletzt
      // antasten und darf nie unter zwei Saetze gehen.
      const r = await page.evaluate(() => {
        const beforePlan = JSON.parse(JSON.stringify(D.plan));
        const mk = (id, name, muscle, sets) =>
          ({ id, name, sets, rmin: 8, rmax: 12, rir: 2, type: 'main', muscle, note: '' });
        D.plan = { Tag_A: { day: 'Mo', exercises: [
          mk(1, 'Bankdrücken', 'chest', 5),
          mk(2, 'Beinpresse', 'legs', 5),
          mk(3, 'KH Seitheben', 'shoulders', 5),
          mk(4, 'Kabelcrunches', 'core', 5)] } };
        save();
        D.active = null; startWorkout('Tag_A');
        const vorher = remainingMinutes();
        const planVorher = JSON.stringify(D.plan);
        const res = trimWorkoutTo(30);
        const nach = remainingMinutes();
        const sets = {};
        D.active.exercises.forEach(e => { sets[e.name] = e.skipped ? 0 : e.sets; });
        const out = {
          kuerzer: nach < vorher,
          zielErreicht: nach <= 32,
          nichtUnterZwei: D.active.exercises.every(e => e.skipped || e.sets >= 2),
          grunduebungBleibt: sets['Bankdrücken'] >= 2 && sets['Beinpresse'] >= 2,
          isolationGabZuerstAb: sets['KH Seitheben'] <= sets['Bankdrücken'],
          planUnberuehrt: JSON.stringify(D.plan) === planVorher,
          etwasPassiert: !!res && res.changes.length > 0
        };
        D.active = null; D.plan = beforePlan; save();
        return out;
      });
      const ok = Object.values(r).every(v => v === true);
      return [ok, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-055', title: 'Scheibenrechner rechnet exakt oder sagt, dass er es nicht kann',
    run: async () => {
      // Ein Rechner, der ungefragt rundet, ist schlimmer als keiner: man legt
      // auf und wundert sich ueber 1,25 kg Differenz zum Logbuch.
      const r = await page.evaluate(() => {
        const bad = [];
        // Einzelfaelle, bei denen es genau eine sinnvolle Loesung gibt
        const exact = [
          [87.5, 20, [[25, 1], [5, 1], [2.5, 1], [1.25, 1]], 0],
          [22.5, 20, [[1.25, 1]], 0],
          [20, 20, [], 0],                   // nur die Stange
          [61, 20, [[20, 1]], 0.5]           // 20,5 pro Seite -> 0,5 nicht darstellbar
        ];
        exact.forEach(([total, bar, want, rest]) => {
          const p = platePlan(total, bar);
          if (!p.ok) { bad.push(total + ': nicht berechnet'); return; }
          const got = p.plates.map(x => [x.p, x.n]);
          if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(total + ': ' + JSON.stringify(got));
          if (Math.abs(p.rest - rest) > 1e-9) bad.push(total + ': Rest ' + p.rest);
        });
        // Und ueber den ganzen Bereich die Invarianten: Summe stimmt, der
        // nicht darstellbare Rest ist immer kleiner als die kleinste Scheibe,
        // und die Scheiben stehen von schwer nach leicht.
        for (let t = 20; t <= 250; t += 1.25) {
          const p = platePlan(Math.round(t * 100) / 100, 20);
          if (!p.ok) { bad.push(t + ': nicht berechnet'); break; }
          const sum = 20 + 2 * (p.plates.reduce((a, x) => a + x.p * x.n, 0) + p.rest);
          if (Math.abs(sum - t) > 1e-6) { bad.push(t + ': Summe ' + sum); break; }
          if (p.rest >= 1.25) { bad.push(t + ': Rest zu gross ' + p.rest); break; }
          if (p.plates.some((x, i, a) => i > 0 && x.p >= a[i - 1].p)) { bad.push(t + ': Reihenfolge'); break; }
        }
        if (platePlan(10, 20).ok) bad.push('leichter als Stange wurde berechnet');
        return bad;
      });
      return [r.length === 0, r.join(' | ')];
    }
  },
  {
    id: 'PB-056', title: 'CSV-Export bleibt bei fiesen Zeichen spaltentreu',
    run: async () => {
      // Ein Semikolon oder Zeilenumbruch in einer Notiz wuerde die Spalten
      // verschieben - und zwar still, erst in der Tabelle faellt es auf.
      const r = await page.evaluate(() => {
        const before = JSON.parse(JSON.stringify(D.history));
        let captured = '';
        const origBlob = window.Blob;
        window.Blob = function (parts, opts) { captured = String(parts[0]); return new origBlob(parts, opts); };
        const origCreate = URL.createObjectURL, origRevoke = URL.revokeObjectURL;
        URL.createObjectURL = () => 'blob:test';
        URL.revokeObjectURL = () => {};
        const origClick = HTMLAnchorElement.prototype.click;
        HTMLAnchorElement.prototype.click = function () {};
        D.history = [{ id: 'CSV1', updatedAt: Date.now(), date: '01.07.2026', planKey: 'FullBody_A',
          duration: 40, sets: [
            { ex: 'Bankdrücken;fies', nr: 1, w: 82.5, r: 8, rir: 2, note: 'Zeile1\nZeile2;mit "Anführung"',
              muscle: 'chest', type: 'main', mode: '' }] }];
        exportCSV();
        window.Blob = origBlob; URL.createObjectURL = origCreate; URL.revokeObjectURL = origRevoke;
        HTMLAnchorElement.prototype.click = origClick;
        D.history = before; save();
        const lines = captured.replace(/^﻿/, '').split('\r\n').filter(Boolean);
        // Spalten zaehlen: Semikolons ausserhalb von Anfuehrungszeichen
        const cols = line => {
          let n = 1, q = false;
          for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"') { if (q && line[i + 1] === '"') i++; else q = !q; }
            else if (c === ';' && !q) n++;
          }
          return n;
        };
        return {
          bom: captured.charCodeAt(0) === 0xfeff,
          zeilen: lines.length === 2,
          spalten: lines.every(l => cols(l) === cols(lines[0])),
          dezimalkomma: /;82,5;/.test(lines[1]),
          gruppe: lines[1].includes('chest')
        };
      });
      const ok = Object.values(r).every(v => v === true);
      return [ok, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-054', title: 'Mesozyklus skaliert das Workout, nicht den Plan',
    run: async () => {
      // Der Zyklus darf denselben Fehler nicht machen wie ein naiver Deload:
      // Wer das Volumen im PLAN reduziert, hat es nach vier Wochen dauerhaft
      // verloren (dieselbe Klasse wie PB-030).
      const r = await page.evaluate(() => {
        const before = JSON.parse(JSON.stringify(D.plan));
        const beforeUi = JSON.parse(JSON.stringify(D.ui.meso || {}));
        D.plan = { Tag_A: { day: 'Mo', exercises: [
          { id: 1, name: 'Bankdrücken', sets: 6, rmin: 6, rmax: 10, rir: 2, type: 'main', muscle: 'chest', note: '' }] } };
        // Erst normalisieren, dann vergleichen: sonst misst der Test das
        // Ergaenzen von Standardfeldern statt einer Aenderung am Volumen.
        save();
        const planVorher = JSON.stringify(D.plan);
        const res = { verlauf: [] };
        startMeso(5);
        const woche = w => {
          D.ui.meso.start = Date.now() - w * 7 * 864e5;   // w volle Wochen zurueck
          const st = mesoState();
          D.active = null; startWorkout('Tag_A');
          const sets = D.active.exercises[0].sets;
          D.active = null;
          return { woche: st.week, faktor: st.factor, sets, deload: st.deload };
        };
        for (let w = 0; w < 5; w++) res.verlauf.push(woche(w));
        res.planUnberuehrt = JSON.stringify(D.plan) === planVorher;
        res.steigend = res.verlauf.slice(0, 4).every((x, i, a) => i === 0 || x.sets >= a[i - 1].sets);
        res.starttUnten = res.verlauf[0].sets < 6;
        res.endetOben = res.verlauf[3].sets === 6;
        res.deloadWoche = res.verlauf[4].deload === true && res.verlauf[4].sets < res.verlauf[3].sets;
        stopMeso();
        res.ohneZyklus = (() => {
          D.active = null; startWorkout('Tag_A');
          const s = D.active.exercises[0].sets; D.active = null; return s === 6;
        })();
        D.plan = before; D.ui.meso = beforeUi; D.active = null; save();
        return res;
      });
      const ok = r.planUnberuehrt && r.steigend && r.starttUnten && r.endetOben
                 && r.deloadWoche && r.ohneZyklus;
      return [ok, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-053', title: 'Keine Uebung faellt auf den Muskel-Fallback zurueck',
    run: async () => {
      // "Klimmzuege" traf keine Regel: in der Tabelle stand "klimmzug", der
      // Plural hat ein Umlaut-ue. Die Uebung landete ueber den Fallback bei
      // "Rudern" - vertikales Ziehen wurde als horizontales gezaehlt.
      // Statt nur diesen einen Namen zu pruefen, faehrt der Test JEDEN Namen
      // durch, den die App selbst mitbringt: Bibliothek, Evidenzkatalog,
      // Standardplan, Onboarding-Pool. Der Fallback ist eine Notbremse fuer
      // eigene Uebungen des Nutzers, kein Weg fuer mitgelieferte Namen.
      const r = await page.evaluate(() => {
        const names = new Set();
        allLibraryCategories().forEach(c => c.items.forEach(i =>
          names.add([i.name, i.m || i.muscle, i.t || i.type || 'main'].join('|'))));
        EVIDENCE_DB.forEach(e => names.add([e.n, e.m, 'main'].join('|')));
        Object.values(DEFAULT_PLAN).forEach(d => d.exercises.forEach(e =>
          names.add([e.name, e.muscle, e.type].join('|'))));
        Object.values(OB_POOL).forEach(v => ['gym', 'home'].forEach(k =>
          names.add([v[k][0], v[k][1], 'main'].join('|'))));
        const fall = [];
        [...names].forEach(entry => {
          const [n, m, t] = entry.split('|');
          if (t !== 'main') return;
          if (!MOVE_PATTERNS.some(p => p.re.test(n))) fall.push(n + ' [' + m + ']');
        });
        return { anzahl: names.size, fall };
      });
      // Mindestens die mitgelieferten Namen muessen abgedeckt sein
      const ok = r.anzahl > 100 && r.fall.length === 0;
      return [ok, r.fall.length ? r.fall.slice(0, 6).join(' | ') : r.anzahl + ' Namen geprueft'];
    }
  },
  {
    id: 'PB-052', title: 'Onboarding erzeugt fuer jede Antwortkombination einen gueltigen Plan',
    run: async () => {
      // Vorher wurden Trainingsort, Tage, Ziel und Erfahrung abgefragt und
      // weggeworfen - jeder bekam denselben Standardplan. Jetzt erzeugen sie
      // den Plan, und zwar gegen dieselben Landmarks, an denen der Coach ihn
      // spaeter misst. Dieser Test faehrt alle Kombinationen durch.
      const r = await page.evaluate(() => {
        const before = JSON.parse(JSON.stringify(D.plan));
        const bad = [];
        const days = [2, 3, 4, 5, 6];
        const locs = ['gym', 'home'];
        const exps = ['beginner', 'intermediate', 'advanced'];
        const focs = ['hypertrophy', 'strength', 'balanced', 'recomp', 'bbp'];
        days.forEach(d => locs.forEach(loc => exps.forEach(exp => focs.forEach(focus => {
          D.plan = buildPlanFromOnboarding({ days: d, location: loc, experience: exp, focus });
          coachInvalidate();
          const tag = `${d}d/${loc}/${exp}/${focus}`;
          const keys = Object.keys(D.plan);
          if (keys.length !== d) bad.push(tag + ': ' + keys.length + ' Tage');
          keys.forEach(k => {
            if (!D.plan[k].exercises.length) bad.push(tag + ': ' + k + ' leer');
            const mins = estimatedDuration(k);
            if (mins > 105) bad.push(tag + ': ' + k + ' ' + mins + ' min');
            // Keine Redundanz an einem Tag: derselbe Muskel mit derselben
            // Bewegung zweimal. Muster ALLEIN reicht als Kriterium nicht -
            // seitliches und hinteres Schulterheben teilen sich das Muster
            // 'raise', sind aber verschiedene Muskeln (und umgekehrt).
            const sig = D.plan[k].exercises.map(e =>
              volGroupOf(e.name, e.muscle, e.type) + '/' + detectMovePattern(e.name, e.muscle, e.type));
            if (new Set(sig).size !== sig.length) bad.push(tag + ': ' + k + ' Uebung doppelt');
            const namen = D.plan[k].exercises.map(e => e.name);
            if (new Set(namen).size !== namen.length) bad.push(tag + ': ' + k + ' Name doppelt');
          });
          const a = coachAnalyzePlan();
          a.muscles.forEach(m => {
            if (m.sets <= 0) bad.push(tag + ': ' + m.name + ' fehlt');
            else if (m.state.key === 'low') bad.push(tag + ': ' + m.name + ' unter MEV');
            else if (m.state.key === 'high') bad.push(tag + ': ' + m.name + ' ueber MRV');
          });
        }))));
        D.plan = before; coachInvalidate(); save();
        return bad.slice(0, 8);
      });
      return [r.length === 0, r.join(' | ')];
    }
  },
  {
    id: 'PB-050', title: 'Einseitige Uebungen zaehlen doppelt',
    run: async () => {
      // Das Evidenzblatt behauptete "die Satzangabe gilt pro Seite, fuers
      // Wochenvolumen zaehlt sie doppelt" - die Rechnung tat es nicht.
      const r = await page.evaluate(() => {
        const beforePlan = JSON.parse(JSON.stringify(D.plan));
        const beforeHist = JSON.parse(JSON.stringify(D.history));
        const ex = (id, name, sets, muscle) =>
          ({ id, name, sets, rmin: 8, rmax: 12, rir: 2, note: '', type: 'main', muscle });
        D.plan = { Tag_A: { day: 'Mo', exercises: [
          ex(1, 'KH Rudern einarmig', 4, 'back'),
          ex(2, 'Maschinenrudern eng neutral', 4, 'back')] } };
        D.history = [];
        const vol = planWeeklyVolume(false);
        const einarmig = estimatedDuration('Tag_A');
        D.plan = { Tag_A: { day: 'Mo', exercises: [
          ex(1, 'Maschinenrudern breit', 4, 'back'),
          ex(2, 'Maschinenrudern eng neutral', 4, 'back')] } };
        const beidseitig = estimatedDuration('Tag_A');
        // Und derselbe Massstab in der Historie
        D.plan = beforePlan;
        D.history = [{ id: 'UNI1', updatedAt: Date.now(), date: new Date().toLocaleDateString('de-DE'),
          planKey: 'Tag_A', duration: 40, sets: [
            { ex: 'KH Rudern einarmig', nr: 1, w: 30, r: 10, rir: 2, note: '', muscle: 'back', type: 'main', mode: '' }] }];
        const hist = getWeeklyVolume(false);
        const res = {
          // 4 einarmig + 4 beidseitig = 8 + 4 = 12 Saetze Ruecken
          planVolumen: vol.back && vol.back.sets === 12,
          // doppelte Arbeitszeit, aber nicht doppelte Pause
          zeitLaenger: einarmig > beidseitig,
          zeitPlausibel: einarmig - beidseitig === Math.round(4 * 40 / 60),
          historieDoppelt: hist.back && hist.back.sets === 2,
          erkennung: isUnilateral('Bulgarian Split Squat') && isUnilateral('KH Rudern einarmig')
                     && !isUnilateral('Bankdrücken') && !isUnilateral('Beinpresse'),
          // Ein explizites Feld schlaegt die Namenserkennung
          feldSchlaegtNamen: isUnilateral('Bankdrücken', { uni: true }) === true
                             && isUnilateral('KH Rudern einarmig', { uni: false }) === false
        };
        D.plan = beforePlan; D.history = beforeHist; save();
        return res;
      });
      const ok = Object.values(r).every(v => v === true);
      return [ok, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-051', title: 'Nur eine Trendrechnung fuer dieselbe Uebung',
    run: async () => {
      // Die Stats-Liste rechnete e1RM ueber Einheiten, das Detailblatt rohes
      // Gewicht ueber Saetze: dieselbe Uebung stand gleichzeitig als "+3,8 kg"
      // und als "Stagnation" da.
      const r = await page.evaluate(() => {
        const before = JSON.parse(JSON.stringify(D.history));
        D.history = [];
        // Acht Einheiten, +1 kg pro Einheit, ZWEI Saetze pro Einheit - genau die
        // Konstellation, in der die alte Rechnung scheiterte: die letzten drei
        // SAETZE gegen die drei davor sind anderthalb Trainings gegen anderthalb,
        // der Unterschied bleibt unter der 2-%-Schwelle und hiess "Stagnation".
        for (let i = 0; i < 8; i++) {
          const d = new Date(); d.setDate(d.getDate() - (8 - i) * 3);
          D.history.push({ id: 'T' + i, updatedAt: Date.now(), date: d.toLocaleDateString('de-DE'),
            planKey: 'Tag_A', duration: 40, sets: [
              { ex: 'Bankdrücken', nr: 1, w: 80 + i, r: 8, rir: 2, note: '', muscle: 'chest', type: 'main', mode: '' },
              { ex: 'Bankdrücken', nr: 2, w: 80 + i, r: 8, rir: 2, note: '', muscle: 'chest', type: 'main', mode: '' }] });
        }
        const prog = exerciseProgress('Bankdrücken');
        const trend = getExTrend('Bankdrücken');
        const res = {
          listeSteigend: !!prog && prog.delta > 0 && prog.dir === 'up',
          detailGleich: trend === (prog ? prog.dir : 'x'),
          keinWiderspruch: !(prog && prog.dir === 'up' && trend === 'flat')
        };
        D.history = before; save();
        return res;
      });
      const ok = Object.values(r).every(v => v === true);
      return [ok, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-048', title: 'Karte "Naechstes Workout" beschreibt den richtigen Tag',
    run: async () => {
      // Sichtbar geworden mit dem 3-Tage-Split: die Karte zeigte nur das erste
      // Wort des Tagesnamens ("FULLBODY"), also fuer A, B und C dasselbe. Die
      // Muskelzeile nahm die ersten drei Uebungen statt der groessten
      // Muskelgruppen - bei zwei Ruecken-Uebungen am Anfang stand da
      // "Bruest . Ruecken . Ruecken". Die Punktreihe stand fest auf vier.
      const r = await page.evaluate(() => {
        const before = JSON.parse(JSON.stringify(D.plan));
        const ex = (id, name, sets, muscle) =>
          ({ id, name, sets, rmin: 8, rmax: 12, rir: 2, note: '', type: 'main', muscle });
        D.plan = {
          Tag_A: { day: 'Mo', exercises: [
            ex(1, 'Latziehen', 4, 'back'), ex(2, 'Rudern', 4, 'back'),
            ex(3, 'Bankdruecken', 3, 'chest'), ex(4, 'Beinpresse', 6, 'legs')] },
          Tag_B: { day: 'Di', exercises: [ex(5, 'Bankdruecken', 3, 'chest')] },
          Tag_C: { day: 'Mi', exercises: [ex(6, 'Kniebeugen', 3, 'legs')] }
        };
        // Heute ist der Tag von Tag_A -> die Karte muss Tag_A beschreiben
        const dayMap = { 0: 'So', 1: 'Mo', 2: 'Di', 3: 'Mi', 4: 'Do', 5: 'Fr', 6: 'Sa' };
        D.plan.Tag_A.day = dayMap[new Date().getDay()];
        save(); renderDash();
        const card = document.getElementById('d-next-card');
        const big = card.querySelector('.big');
        const small = card.querySelector('.small').textContent;
        const parts = small.split('·').map(s => s.trim()).filter(Boolean);
        const dots = card.querySelectorAll('.eyebrow2 + div > span').length;
        const res = {
          suffixSichtbar: !!big.querySelector('.suf') && big.textContent.includes('A'),
          keineDoppelten: parts.length === new Set(parts).size,
          // Ruecken 8 Saetze > Beine 6 > Brust 3 - die Reihenfolge folgt dem Volumen
          groessteZuerst: parts[0] === 'Rücken' && parts[1] === 'Beine',
          punkteGleichTage: dots === Object.keys(D.plan).length
        };
        D.plan = before; save(); renderDash();
        return res;
      });
      const ok = Object.values(r).every(v => v === true);
      return [ok, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-046', title: 'Negative Eingaben landen nicht im Datenmodell',
    run: async () => {
      // Vom Fuzzer gefunden: ein Zahlenfeld akzeptiert das Minuszeichen. Ein
      // negatives Gewicht rechnet sich durch die ganze App - negative Tonnage,
      // negatives geschaetztes 1RM, kaputte Bestwert-Erkennung.
      const r = await page.evaluate(() => {
        D.active = null; startWorkout('FullBody_A');
        const ei = D.active.exercises.findIndex(e => !e.skipped);
        openLog(ei);
        const put = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
        put('log-w', '-50'); put('log-r', '-8'); put('log-rir', '-3');
        confirmLog();
        const a = D.active.exercises[ei].logged[0] || {};
        openLog(ei);
        put('log-w', '999999'); put('log-r', '100000'); put('log-rir', '99');
        confirmLog();
        const b = D.active.exercises[ei].logged[1] || {};
        // Und ueber den Satz-Editor derselbe Versuch
        const host = document.createElement('div'); host.id = 'set-popup';
        host.innerHTML = '<input id="edit-set-w" value="-99"><input id="edit-set-r" value="-5">';
        document.body.appendChild(host);
        saveEditSet(ei, 0);
        const c = D.active.exercises[ei].logged[0] || {};
        document.getElementById('set-popup')?.remove();
        const vol = { w: a.w, r: a.r, rir: a.rir };
        D.active = null; save();
        return {
          noNegative: a.w >= 0 && a.r >= 0 && a.rir >= 0,
          capped: b.w <= 2000 && b.r <= 999 && b.rir <= 10,
          editorClamped: c.w >= 0 && c.r >= 0,
          finite: Object.values(vol).every(Number.isFinite)
        };
      });
      const ok = Object.values(r).every(v => v === true);
      return [ok, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-041', title: 'QR-Encoder liefert unveraenderte Referenzcodes',
    run: async () => {
      // Der QR-Encoder ist selbst gebaut. Beim Bauen sind zwei Fehler
      // aufgetreten, die man einem Code NICHT ansieht - er sieht in beiden
      // Faellen aus wie ein QR-Code, nur liest ihn kein Scanner (PB-041).
      // Verifiziert wurde er ausserhalb dieses Harnischs gegen zwei
      // unabhaengige Decoder (ZXing, OpenCV): 110 Zufallsnutzlasten,
      // Versionen 1-29, alle korrekt dekodiert. Dieser Test friert das
      // Ergebnis als Pruefsumme ein, damit ein spaeterer Umbau auffaellt.
      const r = await page.evaluate(() => {
        const hash = t => {
          const m = qrMatrix(t);
          if (!m) return null;
          const flat = m.map(row => row.join('')).join('');
          let h = 5381;
          for (let k = 0; k < flat.length; k++) h = ((h * 33) ^ flat.charCodeAt(k)) >>> 0;
          return { size: m.length, hash: h };
        };
        return {
          a: hash('PUMPBRAH'),
          b: hash('https://example.org/#plan=PB1-AbCdEf'),
          c: hash('Ü'.repeat(120)),
          tooBig: qrMatrix('x'.repeat(3000))
        };
      });
      const ok = r.a && r.a.size === 21 && r.a.hash === 755334356
        && r.b && r.b.size === 29 && r.b.hash === 928709332
        && r.c && r.c.size === 57 && r.c.hash === 3855587988
        && r.tooBig === null;
      return [ok, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-042', title: 'Import uebernimmt nur den Plan und haertet fremde Daten',
    run: async () => {
      // Ein importierter Plan kommt aus einer fremden Datei oder einem fremden
      // Link. Zwei Zusagen macht das UI: (1) Historie, Gewichte, Profil und
      // Einstellungen bleiben unveraendert, (2) kaputte oder boesartige Werte
      // landen nicht im Datenmodell.
      const r = await page.evaluate(async () => {
        const before = {
          history: JSON.stringify(D.history),
          bio: JSON.stringify(D.bio),
          settings: JSON.stringify(D.settings),
          plan: JSON.parse(JSON.stringify(D.plan))
        };
        // Container mit absichtlich unmoeglichen Werten.
        const evil = {
          v: 1, n: '<img src=x onerror=alert(1)>', a: 'mallory', t: '2026-01-01',
          d: [['Tag<script>', 'Mo', [
            ['"><svg onload=alert(1)>', 999, -5, 1, 42, 'boese', 'einhorn', 'x'.repeat(5000)],
            ['', 3, 8, 12, 2, 'main', 'chest', ''],
            ['Bankdrücken', 'drei', null, undefined, null, 'main', 'chest', 'ok']
          ]]]
        };
        const code = await encodeSharePayload(evil);
        await startPlanImport(code);
        importState.mode = 'add';
        confirmPlanImport();
        const keys = Object.keys(D.plan);
        const added = keys.filter(k => !before.plan[k]);
        const ex = added.flatMap(k => D.plan[k].exercises);
        const res = {
          historyUntouched: JSON.stringify(D.history) === before.history,
          bioUntouched: JSON.stringify(D.bio) === before.bio,
          settingsUntouched: JSON.stringify(D.settings) === before.settings,
          oldDaysKept: Object.keys(before.plan).every(k => !!D.plan[k]),
          addedCount: added.length,
          setsInRange: ex.every(e => e.sets >= 1 && e.sets <= 20),
          repsSane: ex.every(e => e.rmin >= 1 && e.rmax >= e.rmin),
          rirSane: ex.every(e => e.rir === null || (e.rir >= 0 && e.rir <= 10)),
          typesKnown: ex.every(e => ['main', 'pre', 'mob'].includes(e.type)),
          musclesKnown: ex.every(e => !!MUSCLE_LANDMARKS[e.muscle]),
          notesClamped: ex.every(e => (e.note || '').length <= 400),
          emptyNamesDropped: ex.every(e => !!e.name),
          // Der Übungsname landet als Text im DOM - nicht als Markup.
          noInjectedNodes: (() => {
            go('dash'); renderPlan();
            const scope = document.getElementById('main-app');
            return scope.querySelectorAll('script,iframe,object,embed').length === 0;
          })()
        };
        // Aufräumen: importierte Tage wieder entfernen.
        added.forEach(k => { delete D.plan[k]; });
        save(); coachInvalidate(); renderPlan();
        return res;
      });
      const ok = Object.entries(r).every(([k, v]) => k === 'addedCount' ? v === 1 : v === true);
      return [ok, JSON.stringify(r)];
    }
  },
  {
    id: 'PB-064', title: 'Kaputter Plan-Code erzeugt keine unbehandelte Ablehnung',
    run: async () => {
      // Ein abgeschnittener Code laesst den Deflate-Strom scheitern. Die
      // Meldung an den Nutzer stimmte immer - aber close() liefert ein
      // EIGENES Promise, und dessen Ablehnung fing niemand. Ergebnis: eine
      // freundliche Meldung im UI und ein "Uncaught (in promise)" daneben.
      const before = R.errors.length;
      const r = await page.evaluate(async () => {
        document.querySelectorAll('.mbg.show').forEach(m => cm(m.id));
        // Einen echten komprimierten Code bauen und dann abschneiden - so
        // sieht ein halb kopierter Code aus der Zwischenablage aus.
        const full = await encodeSharePayload({ v: 1, n: 'Test', a: '', t: '2026-01-01',
          d: [['A', 'Mo', [['Bankdrücken', 3, 8, 12, 2, 'main', 'chest', '']]]] });
        const broken = [
          full.slice(0, Math.floor(full.length * 0.6)),
          'PB1C-' + 'AAAAAAAAAAAAAAAA',
          'PB1C-nicht_base64_!!!',
          'PB1C-'
        ];
        const toasts = [];
        for (const code of broken) {
          try { await startPlanImport(code); toasts.push('ok'); }
          catch (e) { toasts.push('throw:' + e.message); }
        }
        return { toasts, previewOpen: document.getElementById('m-importpreview').classList.contains('show') };
      });
      // Ablehnungen kommen einen Tick spaeter als der abgelehnte Aufruf.
      await page.waitForTimeout(300);
      const rejections = R.errors.slice(before);
      /* Aus der Gesamtbilanz nehmen: sonst meldet die Schlussrechnung
         denselben Fund ein zweites Mal, und ein Test, der den Fehler
         absichtlich provoziert, darf ihn nicht doppelt zaehlen. */
      R.errors.length = before;
      const noThrow = r.toasts.every(t => t === 'ok');
      return [rejections.length === 0 && noThrow && !r.previewOpen,
        `unbehandelt: ${JSON.stringify(rejections)} · startPlanImport: ${JSON.stringify(r.toasts)}`
        + ` · Vorschau offen: ${r.previewOpen}`];
    }
  },
  {
    id: 'PB-065', title: 'Supersatz-Kennung bleibt paarweise oder verschwindet',
    run: async () => {
      // Gefunden vom Fuzzer nach "swapCommit": eine Uebung aus einem
      // Supersatz tauschen liess den Partner mit einer Kennung allein
      // zurueck - eine Kopplung im UI, mit der sich niemand abwechselt.
      const r = await page.evaluate(() => {
        document.querySelectorAll('.mbg.show').forEach(m => cm(m.id));
        const key = Object.keys(D.plan)[0];
        curTab = key;
        const paare = () => {
          const bad = [];
          Object.entries(D.plan).forEach(([k, d]) => {
            const n = {};
            (d.exercises || []).forEach(e => { if (e.ss) n[e.ss] = (n[e.ss] || 0) + 1; });
            Object.entries(n).forEach(([ss, c]) => { if (c < 2) bad.push(`${k}/${ss}=${c}`); });
          });
          if (D.active) {
            const n = {};
            D.active.exercises.forEach(e => { if (e.ss) n[e.ss] = (n[e.ss] || 0) + 1; });
            Object.entries(n).forEach(([ss, c]) => { if (c < 2) bad.push(`active/${ss}=${c}`); });
          }
          return bad;
        };
        const out = {};
        // Einen echten Supersatz herstellen: die erste Uebung, fuer die
        // toggleSuperset einen Partner findet.
        let gekoppelt = -1;
        for (let i = 0; i < D.plan[key].exercises.length; i++) {
          toggleSuperset(i);
          if (D.plan[key].exercises[i].ss) { gekoppelt = i; break; }
        }
        out.konnteKoppeln = gekoppelt >= 0;
        if (gekoppelt < 0) return out;
        const ssKey = D.plan[key].exercises[gekoppelt].ss;
        const partnerIdx = D.plan[key].exercises.findIndex((e, i) => i !== gekoppelt && e.ss === ssKey);

        // (1) Partner aus dem Plan loeschen.
        delEx(partnerIdx);
        out.nachLoeschen = paare();

        // (2) Neu koppeln und den Partner im laufenden Workout tauschen.
        let g2 = -1;
        for (let i = 0; i < D.plan[key].exercises.length; i++) {
          toggleSuperset(i);
          if (D.plan[key].exercises[i].ss) { g2 = i; break; }
        }
        out.konnteErneutKoppeln = g2 >= 0;
        if (g2 < 0) return out;
        const ss2 = D.plan[key].exercises[g2].ss;
        const p2 = D.plan[key].exercises.findIndex((e, i) => i !== g2 && e.ss === ss2);

        startWorkout(key);
        const aktivIdx = D.active.exercises.findIndex(e => e.ss === ss2);
        openAlternative(aktivIdx);
        out.hatAlternativen = altState.list.length > 0;
        if (out.hatAlternativen) {
          swapActiveExercise(altState.ei, 0);
          commitSwap(true);
        }
        out.nachTausch = paare();
        // Der Tausch soll die Kopplung ERHALTEN, nicht nur aufraeumen.
        out.kopplungUeberlebt = D.active.exercises.filter(e => e.ss === ss2).length === 2;

        // (3) Fremde Daten: ein Import kann eine einsame Kennung mitbringen.
        D.plan[key].exercises[0].ss = 'SZ';
        D.plan[key].exercises.forEach((e, i) => { if (i > 0 && e.ss === 'SZ') e.ss = null; });
        save();
        out.nachImportartigemZustand = paare();

        endWorkout();
        out.p2 = p2;
        return out;
      });
      const ok = r.konnteKoppeln && r.konnteErneutKoppeln
        && !r.nachLoeschen.length && !r.nachTausch.length && !r.nachImportartigemZustand.length
        && (!r.hatAlternativen || r.kopplungUeberlebt);
      return [ok, JSON.stringify(r)];
    }
  }
];

for (const t of REGRESSIONS) {
  let ok = false, detail = '';
  try { [ok, detail] = await t.run(); }
  catch (e) { ok = false; detail = 'Ausnahme: ' + e.message; }
  check('regression', `${t.id} — ${t.title}`, ok, ok ? '' : detail);
}

// ================================================================ 3. FUZZ
stage(`FUZZ — ${ITERATIONS} zufällige Aktionen (seed=${SEED})`);

/**
 * Der Fuzzer läuft komplett in der Seite: 1000 Runden über einen
 * Playwright-Roundtrip wären sonst minutenlang. Nach jeder Aktion werden
 * alle Invarianten geprüft; die erste Verletzung stoppt den Lauf und
 * liefert die Aktionsfolge zum Nachstellen zurück.
 */
const fuzz = await page.evaluate(async ({ iterations, seed }) => {
  // Deterministischer PRNG (mulberry32) — gleicher Seed = gleicher Lauf.
  let s = seed >>> 0;
  const rnd = () => { s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pick = a => a[Math.floor(rnd() * a.length)];
  const int = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));

  // Dialoge automatisch beantworten — sonst blockiert der Fuzzer.
  const realConfirm = window.confirm, realPrompt = window.prompt, realAlert = window.alert;
  window.confirm = () => true; window.alert = () => {}; window.prompt = () => 'Fuzz' + int(1, 999);
  /* Downloads und neue Tabs: CSV-Export, Backup und Plan-Datei bauen ein
     <a download> und klicken es an, die Web-Suche ruft window.open. Beides
     würde der Fuzzer tausendfach auslösen. Gestubbt wird nur der letzte
     Schritt — alles davor (Serialisierung, Escaping, Blob) läuft echt. */
  const realOpen = window.open;
  const realAClick = HTMLAnchorElement.prototype.click;
  let downloads = 0, popups = 0;
  window.open = () => { popups++; return null; };
  HTMLAnchorElement.prototype.click = function () { if (this.download !== undefined && this.href) downloads++; };
  const restore = () => {
    window.confirm = realConfirm; window.prompt = realPrompt; window.alert = realAlert;
    window.open = realOpen; HTMLAnchorElement.prototype.click = realAClick;
  };

  const NASTY = ['<img src=x onerror=alert(1)>', '"><script>alert(1)</script>', "O'Brien \"quote\"",
                 '　', '', '   ', 'ÄÖÜ äöü ß', '💪🔥', 'a'.repeat(300), '../../etc/passwd',
                 '{{7*7}}', '${alert(1)}', '\\', 'NaN', 'Infinity', '-1', '0'];
  const setEl = (id, v) => { const e = document.getElementById(id); if (e) e.value = v; };

  const ACTIONS = [
    ['go', () => go(pick(['dash', 'wo', 'hist', 'ana', 'settings']))],
    ['startWorkout', () => startWorkout(pick(Object.keys(D.plan)))],
    ['endWorkout', () => { if (D.active) endWorkout(); }],
    ['openLog', () => { if (D.active && D.active.exercises.length) openLog(int(0, D.active.exercises.length - 1)); }],
    ['confirmLog', () => {
      if (!D.active || !logTgt) return;
      setEl('log-w', pick([String(int(0, 300)), pick(NASTY), String(rnd() * 100)]));
      setEl('log-r', pick([String(int(0, 50)), pick(NASTY)]));
      setEl('log-rir', String(int(0, 5)));
      setEl('log-note', pick(NASTY));
      confirmLog();
    }],
    ['redoLast', () => { if (D.active && logTgt) redoLast(); }],
    ['skipEx', () => { if (D.active && D.active.exercises.length) skipEx(int(0, D.active.exercises.length - 1)); }],
    ['unskipEx', () => { if (D.active && D.active.exercises.length) unskipEx(int(0, D.active.exercises.length - 1)); }],
    ['moveActive', () => { if (D.active && D.active.exercises.length > 1) moveActiveExercise(int(0, D.active.exercises.length - 1), pick([-1, 1])); }],
    ['adjustSets', () => { if (D.active && D.active.exercises.length) adjustActiveSets(int(0, D.active.exercises.length - 1), pick([-1, 1])); }],
    ['removeActive', () => { if (D.active && D.active.exercises.length > 1) removeActiveExercise(int(0, D.active.exercises.length - 1)); }],
    ['openAlternative', () => { if (D.active && D.active.exercises.length) openAlternative(int(0, D.active.exercises.length - 1)); }],
    ['swapCommit', () => {
      if (!D.active || altState.ei < 0 || !altState.list.length) return;
      swapActiveExercise(altState.ei, int(0, altState.list.length - 1));
      commitSwap(rnd() < 0.4);
    }],
    ['altScope', () => { if (altState.ei >= 0) { setAltScope(pick(['smart', 'muscle', 'all'])); setAltQuery(pick(['', 'press', pick(NASTY)])); } }],
    ['addToWorkout', () => {
      if (!D.active) return;
      const cats = allLibraryCategories(); if (!cats.length) return;
      const c = pick(cats); if (!c.items.length) return;
      pushExerciseToActiveWorkout(pick(c.items));
    }],
    ['switchPlan', () => { if (D.active) { const k = pick(Object.keys(D.plan)); switchWorkoutPlan(k); applyWorkoutSwitch(null, pick(['merge', 'keep', 'replace'])); } }],
    ['compact', () => { if (D.active) toggleWorkoutCompact(); }],
    ['timer', () => pick([startTmr, resetTmr, () => adjTmr(pick([-15, 15, 30]))])()],
    ['planDayAdd', () => { openPlanDayModal('add'); setEl('pd-name', pick(NASTY) + int(1, 9999)); planDaySelected = [pick(WEEKDAYS)]; savePlanDay(); }],
    ['planDayRename', () => { const k = pick(Object.keys(D.plan)); curTab = k; openPlanDayModal('rename', k); setEl('pd-name', pick(NASTY) + int(1, 9999)); savePlanDay(); }],
    ['planDayDup', () => { const k = pick(Object.keys(D.plan)); curTab = k; openPlanDayModal('duplicate', k); setEl('pd-name', 'Dup' + int(1, 9999)); savePlanDay(); }],
    ['planDayDel', () => { if (Object.keys(D.plan).length > 2) { curTab = pick(Object.keys(D.plan)); deletePlanDay(); } }],
    ['planDayMove', () => { curTab = pick(Object.keys(D.plan)); movePlanDay(pick([-1, 1])); }],
    ['addEx', () => {
      curTab = pick(Object.keys(D.plan)); openAddEx();
      setEl('a-name', pick(NASTY) + int(1, 999)); setEl('a-sets', String(int(-2, 12)));
      setEl('a-rmin', String(int(-5, 30))); setEl('a-rmax', String(int(-5, 30)));
      document.getElementById('a-type').value = pick(['main', 'pre', 'mob']);
      document.getElementById('a-mus').value = pick(['chest', 'back', 'legs', 'shoulders', 'arms', 'core']);
      setEl('a-note', pick(NASTY)); confirmAddEx();
    }],
    ['editEx', () => { const p = D.plan[curTab]; if (p && p.exercises.length) { openEditEx(int(0, p.exercises.length - 1)); setEl('a-name', pick(NASTY) + int(1, 99)); confirmAddEx(); } }],
    ['delEx', () => { const p = D.plan[curTab]; if (p && p.exercises.length) delEx(int(0, p.exercises.length - 1)); }],
    ['mvEx', () => { const p = D.plan[curTab]; if (p && p.exercises.length > 1) mvEx(int(0, p.exercises.length - 1), pick([-1, 1])); }],
    ['libAdd', () => { setEl('libe-name', pick(NASTY) + int(1, 999)); setEl('libe-sets', String(int(-1, 9))); setEl('libe-rmin', String(int(0, 20))); setEl('libe-rmax', String(int(0, 20))); setEl('libe-note', pick(NASTY)); addLibraryExercise(); }],
    ['libDel', () => { const all = allLibraryCategories().flatMap(c => c.items); if (all.length) { const it = pick(all); deleteLibraryExercise(it.name, !!it.custom); } }],
    ['libRender', () => { renderLib(pick(['', 'druck', pick(NASTY)])); renderLibraryEditor(pick(['', 'curl', pick(NASTY)])); }],
    ['exDemo', () => { const all = allLibraryCategories().flatMap(c => c.items); if (all.length) { const it = pick(all); showExDemo(it.name, it.m, it.t); setDemoSpeed(pick([2, 3, 5])); toggleDemoPlay(); } }],
    ['exHist', () => { const names = [...new Set(D.history.flatMap(s => s.sets.map(x => x.ex)))]; if (names.length) showExHist(pick(names)); }],
    ['exNote', () => { const p = D.plan[curTab]; if (p && p.exercises.length) { openExNote(p.exercises[0].name); setEl('exn-text', pick(NASTY)); document.getElementById('exn-text').dataset.ex = p.exercises[0].name; saveExNote(); } }],
    ['weight', () => { setEl('bio-weight-input', pick([String(int(-50, 400)), pick(NASTY), String(60 + rnd() * 40)])); addWeight(); }],
    ['delWeight', () => { if (D.bio.weights.length) delWeight(int(0, D.bio.weights.length - 1)); }],
    ['bioFields', () => { saveBioHeight(pick([String(int(-10, 260)), pick(NASTY)])); saveBioBirthday(pick(['1990-01-01', '', 'not-a-date', '2099-12-31'])); }],
    ['egym', () => { toggleEgym(rnd() < 0.5); openEgymEntry(); setEl('egym-date', pick(['2026-01-15', '', 'x'])); EG_FIELDS.forEach(k => setEl('eg-' + k, pick([String(int(0, 100)), '', pick(NASTY)]))); saveEgymEntry(); }],
    ['delEgym', () => { if (D.egym.measurements.length) delEgymEntry(int(0, D.egym.measurements.length - 1)); }],
    ['delSess', () => { if (D.history.length > 2) delSess(int(0, D.history.length - 1)); }],
    ['calendar', () => { calNav(pick([-1, 1])); selectCalDay(int(1, 31)); }],
    ['sick', () => toggleSick()],
    ['theme', () => setAccentTheme(pick(['volt', 'whoop', 'apple', 'ember', 'cyber', 'bogus']))],
    ['settings', () => { saveSetting('compound', String(int(-30, 400))); saveSetting('isolation', String(int(-30, 400))); }],
    ['drawer', () => togglePlanDrawer()],
    ['deload', () => { detectDeload(); renderDeload(); if (rnd() < 0.3) snoozeDeload(); }],
    ['renderAll', () => { renderAll(); renderHist(); renderAna(); renderSettings(); }],
    ['closeModals', () => document.querySelectorAll('.mbg.show').forEach(m => cm(m.id))],
    // --- Neue Funktionen: Deload, Volumenmodus, Aufwärmrampe, Plattform ---
    ['deloadToggle', () => { if (rnd() < 0.5) startDeload(); else endDeload(); }],
    ['volMode', () => setVolumeMode(pick(['direct', 'total', 'quatsch']))],
    ['warmup', () => {
      // Grenzwerte: 0, negativ, winzig, riesig, NaN
      [0, -20, 0.5, 2, 20, 60, 82.5, 500, NaN, Infinity].forEach(w =>
        ['squat', 'push', 'curl', 'calf'].forEach(k => {
          const plan = warmupPlan(w, 'chest', k);
          if (plan && plan.some(s => !Number.isFinite(s.kg) || s.kg <= 0 || s.kg >= w))
            throw new Error(`warmupPlan(${w},${k}) liefert ungültige Stufe: ${JSON.stringify(plan)}`);
        }));
    }],
    ['secondary', () => {
      const names = [...new Set(D.history.flatMap(s => s.sets.map(x => x.ex)))];
      names.slice(0, 6).forEach(n => {
        const sec = secondaryContribution(n, 'chest', 'main');
        Object.values(sec).forEach(v => { if (!(v > 0 && v <= 1)) throw new Error('Sekundäranteil außerhalb 0..1'); });
      });
      getWeeklyVolume(true); getWeeklyVolume(false);
    }],
    ['platform', () => { attachReveals(); attachSheetGestures(); segmentedControl('t', [{ key: 'a', label: 'A' }, { key: 'b', label: pick(NASTY) }], 'a', 'setVolumeMode'); }],
    // --- Lücken aus dem Coverage-Audit (grep Funktionen vs. ACTIONS) ---
    ['editLoggedSet', () => {
      if (!D.active) return;
      const ei = D.active.exercises.findIndex(e => (e.logged || []).length);
      if (ei < 0) return;
      const si = int(0, D.active.exercises[ei].logged.length - 1);
      // saveEditSet/deleteSet lesen aus dem Long-Press-Popup, das wir hier nachbauen.
      const pop = document.createElement('div'); pop.id = 'set-popup';
      pop.innerHTML = `<input id="edit-set-w" value="${pick([String(int(-10, 300)), 'abc', ''])}">`
                    + `<input id="edit-set-r" value="${pick([String(int(-5, 60)), 'x', ''])}">`;
      document.body.appendChild(pop);
      if (rnd() < 0.5) saveEditSet(ei, si); else deleteSet(ei, si);
      const leftover = document.getElementById('set-popup'); if (leftover) leftover.remove();
    }],
    ['stepper', () => {
      ['log-w', 'log-r', 'a-sets', 'a-rmin'].forEach(id => stepVal(id, pick([-2.5, -1, 1, 2.5])));
    }],
    ['exportImport', () => {
      // Round-Trip ohne Datei: exakt der Pfad, den importData nach dem Parsen geht.
      const json = JSON.stringify(D);
      const parsed = JSON.parse(json);
      const before = D.history.length;
      D = mergeSyncedData(parsed); normalizeData(); save();
      if (D.history.length < before) throw new Error(`Import verlor Sessions: ${before} -> ${D.history.length}`);
    }],
    ['avatar', () => { if (rnd() < 0.5) clearProfileImage(); else { D.ui.avatar = 'data:image/png;base64,iVBORw0KGgo='; save(); renderSettings(); renderDash(); } }],
    ['exerciseMenu', () => { if (D.active && D.active.exercises.length) openExerciseMenu(int(0, D.active.exercises.length - 1)); }],
    ['planExMenu', () => { const p = D.plan[curTab]; if (p && p.exercises.length) openPlanExMenu(int(0, p.exercises.length - 1)); }],
    ['marks', () => {
      // Fruehere Aktion "photos". Die Fotoschicht ist weg; geprueft wird jetzt,
      // dass Marke und Figur auch mit boesartigen Namen sauber erzeugt werden.
      ['Bankdrücken', 'Leg Curl', pick(NASTY), 'Eigene Übung ' + int(1, 99), 'Kniebeugen (Back Squat)', '']
        .forEach(n => {
          exerciseMark(n, pick(['chest','legs','back','core']), 'main');
          exerciseVisual(n, pick(['chest','legs','back']), pick(['main','pre','mob']), { thumb: rnd() < .5 });
        });
    }],
    ['icons', () => { hydrateIcons(); Object.keys(ICON_PATHS).forEach(k => icon(k, int(12, 28))); exIcon(pick(['main','pre','mob']), pick(['chest','back','legs','arms','core','shoulders','unbekannt'])); }],
    ['jumpActive', () => jumpToActiveExercise()],
    ['openLibraries', () => { openLibrary(); openLibraryEditor(); resetLibraryEditorForm(); }],
    ['savePlan', () => savePlanChanges()],
    ['coach', () => {
      // Der Coach rechnet ueber den GANZEN Plan und greift ueber seine
      // Massnahmen auch hinein - damit ist er genau die Sorte Feature, die
      // an fremden Daten zerbricht (leerer Plan, Muskel ohne Landmark,
      // Uebung mit sets:0).
      coachInvalidate();
      const a = coachAnalyzePlan();
      coachMatrixHTML(a); coachDayLabels(a.dayKeys);
      renderCoachCard(); coachSessionHTML();
      Object.keys(MUSCLE_LANDMARKS).forEach(m => { coachBadge(m, 'main'); coachSuggestExercise(m); coachBestDayFor(m, int(0,1) === 1); });
      Object.keys(D.plan || {}).forEach(k => coachDayHintHTML(k));
      const m = pick(Object.keys(MUSCLE_LANDMARKS));
      // Evidenz-Katalog mitbeschiessen: Vorschlag, Begruendungsblatt, Badge
      coachSuggestExercise(m); confBadge(int(-2, 5));
      showEvidence(pick(EVIDENCE_DB).n); showEvidence('Gibt es nicht ' + int(1, 99)); cm('m-evidence');
      pick([() => coachAddExercise(m, false), () => coachTrimSet(m), () => coachSpreadMuscle(m)])();
    }],
    ['pureMath', () => {
      // Reine Rechenfunktionen mit Grenzwerten beschießen.
      const vals = [0, -1, 0.5, 1, 30, 1000, NaN, Infinity, -Infinity];
      for (const w of vals) for (const r of vals) {
        const rm = calc1RM(w, r);
        if (!Number.isFinite(rm) && Number.isFinite(w) && Number.isFinite(r))
          throw new Error(`calc1RM(${w},${r}) = ${rm}`);
      }
      const names = [...new Set(D.history.flatMap(s => s.sets.map(x => x.ex)))];
      if (names.length) {
        const n = pick(names);
        getExTrend(n); getExPR(n); getEx1RM(n); getLastW(n); checkPR(n, int(0, 200), int(0, 30));
      }
      calcFitnessAge(); getRealAge(); detectDeload();
    }],
    ['dateEdges', () => {
      // Datumsränder, die der Zufall sonst kaum trifft.
      [ '29.02.2024', '01.01.2026', '31.12.2026', '1.1.2026', '', 'kaputt', '31.02.2026' ]
        .forEach(d => { parseGermanDate(d); dateKey(d); });
      calMonth = pick([0, 11]); calYear = pick([2024, 2026, 2027]); renderHist();
    }],
    ['mergeRoundtrip', () => {
      const remote = cloneData(D);
      remote.meta = { updatedAt: Date.now() + int(-5000, 5000) };
      if (remote.history.length && rnd() < .5) remote.history[0].updatedAt = Date.now() + 1000;
      const merged = mergeSyncedSnapshot(cloneData(D), remote);
      if (!merged || typeof merged !== 'object') throw new Error('Merge lieferte kein Objekt');
    }],

    /* ------------------------------------------------------------------
       Zweiter Coverage-Audit (Juli 2026)
       Anlass war die Frage „ist wirklich jede Funktion getestet?". Ein
       grep über alle `function name(` in index.html gegen die Aufrufe in
       dieser Datei fand 32 Funktionen, die zwar per onclick in der
       Oberfläche hängen, aber von keinem Test je aufgerufen wurden — fast
       alles, was seit dem Mesozyklus dazugekommen ist. Gezielte
       Regressionstests gab es dafür; im Fuzzer, wo sie mit fremdem
       Zustand kollidieren, standen sie nicht.
       ------------------------------------------------------------------ */
    ['timeBudget', () => {
      if (!D.active) return;
      remainingMinutes();
      openTimeBudget();
      setEl('tb-min', pick([String(int(-20, 300)), pick(NASTY), '', '0']));
      applyTimeBudget();
    }],
    ['superset', () => {
      curTab = pick(Object.keys(D.plan));
      const p = D.plan[curTab];
      if (p && p.exercises.length) toggleSuperset(int(0, p.exercises.length - 1));
    }],
    ['meso', () => pick([
      () => startMeso(pick([2, 3, 5, 8, 99, -1, 'x', null])),
      () => stopMeso(),
      () => setMesoWeeks(pick([-1, 1])),
      () => { mesoState(); renderMeso(); }
    ])()],
    ['rotation', () => {
      rotationCandidates(pick([0, 1, 3, 99, 'x']));
      proposeRotation();
      const box = document.getElementById('rot-list');
      if (box) box.querySelectorAll('input[type=checkbox]').forEach(c => { c.checked = rnd() < .6; });
      applyRotation();
    }],
    ['plates', () => {
      setEl('plate-w', pick([String(int(-20, 400)), String(rnd() * 200), pick(NASTY)]));
      setEl('plate-bar', pick(['20', '15', '10', '0', '-5', pick(NASTY)]));
      openPlates(pick([null, '80', pick(NASTY)]), rnd() < .5);
      renderPlates();
      if (rnd() < .5) platesToLog();
    }],
    ['sections', () => {
      toggleSection(pick([...Object.keys(SECTION_BODY), 'gibtsnicht']));
      applyAllSections(); toggleTrendAll();
    }],
    ['csv', () => exportCSV()],
    ['backup', () => { backupDue(); if (rnd() < .3) markBackupDone(); exportData(); }],
    ['planRow', () => {
      // togglePlanRow bekommt das geklickte Element — hier nachgebaut.
      const wrap = document.createElement('div'), el = document.createElement('div');
      wrap.appendChild(el);
      const p = D.plan[curTab];
      const nm = p && p.exercises.length ? pick(p.exercises).name : 'Unbekannt';
      togglePlanRow(el, nm); if (rnd() < .5) togglePlanRow(el, nm);
    }],
    ['dayChips', () => {
      addPlanDay();
      togglePlanDayChip(pick(WEEKDAYS)); togglePlanDayChip(pick(WEEKDAYS));
      curTab = pick(Object.keys(D.plan));
      if (rnd() < .5) renamePlanDay(); else duplicatePlanDay();
      cm('m-planday');
    }],
    ['escaping', () => {
      /* Die drei Escaping-Funktionen sind die erste Verteidigung der ganzen
         App. Sie werden zwar millionenfach indirekt aufgerufen, standen aber
         in keinem Test als eigener Vertrag. */
      const probe = document.createElement('div');
      NASTY.concat(['</textarea>', '`${x}`', 'a"b\'c<d>e&f', '&amp;', null, undefined])
        .forEach(s => {
          const erwartet = String(s === null || s === undefined ? '' : s);
          [['esc', esc(s)], ['attr', attr(s)]].forEach(([wie, h]) => {
            if (/[<>"']/.test(h)) throw new Error(`${wie}: aktives Zeichen durchgelassen ${JSON.stringify(h)}`);
            if (/&(?!(amp|lt|gt|quot|#39);)/.test(h)) throw new Error(`${wie}: rohes & durchgelassen ${JSON.stringify(h)}`);
            /* Der eigentliche Vertrag: aus der Nutzlast entstehen keine
               Elemente, und der Text kommt unverändert wieder heraus. */
            probe.innerHTML = h;
            if (probe.querySelectorAll('*').length) throw new Error(`${wie} erzeugte Elemente aus ${JSON.stringify(s)}`);
            if (probe.textContent !== erwartet) throw new Error(`${wie} veränderte den Text: ${JSON.stringify(probe.textContent)}`);
          });
          const j = jsStr(s);
          if (/[<>"']/.test(j) || /[\r\n]/.test(j))
            throw new Error(`jsStr bricht aus dem String aus: ${JSON.stringify(j)}`);
        });
      probe.innerHTML = '';
    }],
    ['backupRoundtrip', () => {
      /* Der echte Weg über <input type=file>: importData liest e.target.files.
         Nur gültiges JSON — der kaputte Zweig loggt bewusst console.error und
         würde die Fehlerbilanz des Laufs verfälschen. */
      const before = D.history.length;
      const json = JSON.stringify(D);
      importData({ target: { files: [new File([json], 'backup.json', { type: 'application/json' })] } });
      if (D.history.length < before) throw new Error('Backup-Import verlor Sessions');
    }],
    ['rirCircles', () => {
      const mk = () => { const e = document.createElement('div'); e.className = 'rir-c'; return e; };
      pickRir(mk(), int(0, 5)); pickRirAdd(mk(), int(0, 5));
    }],
    ['stepHold', () => {
      stepHold(pick(['log-w', 'log-r', 'a-sets', 'plate-w']), pick([-2.5, -1, 1, 2.5]));
      // Ohne pointerup bliebe der Wiederhol-Timer für immer registriert.
      document.dispatchEvent(new Event('pointerup'));
    }],
    ['longPress', () => {
      if (!D.active) return;
      const ei = D.active.exercises.findIndex(e => (e.logged || []).length);
      if (ei < 0) return;
      /* Der Halten-Timer feuert nach 500 ms — der Fuzzer läuft aber
         synchron, der Rückruf käme erst nach dem Lauf. Für diesen einen
         Aufruf wird setTimeout sofort ausgeführt. */
      const realTO = window.setTimeout;
      window.setTimeout = fn => { fn(); return 0; };
      try { setLongPress(ei, 0, { preventDefault() {} }); }
      finally { window.setTimeout = realTO; }
      const pop = document.getElementById('set-popup');
      if (!pop) throw new Error('Langes Drücken erzeugte kein Bearbeiten-Popup');
      pop.remove();
    }],
    ['libEdit', () => {
      const all = allLibraryCategories().flatMap(c => c.items);
      if (!all.length) return;
      const it = pick(all);
      openLibraryEditor(); editLibraryExercise(it.name);
      if (rnd() < .5) { setEl('libe-name', pick(NASTY) + int(1, 99)); addLibraryExercise(); }
      else resetLibraryEditorForm();
    }],
    ['libPick', () => {
      const all = allLibraryCategories().flatMap(c => c.items);
      if (!all.length) return;
      if (rnd() < .4 && D.active) addExerciseToWorkout();
      pickLibraryItem(encodeURIComponent(pick(all).name));
    }],
    ['sharePlan', async () => {
      curTab = pick(Object.keys(D.plan));
      await openPlanShare(rnd() < .5 ? [curTab] : Object.keys(D.plan));
      copyShareCode(); downloadSharePlan();
      cm('m-share');
    }],
    ['importPlan', async () => {
      openPlanImport();
      setEl('import-code', pick([shareState.code || '', pick(NASTY), 'PB1C-kaputt', '']));
      await submitImportCode();
      setImportMode(pick(['add', 'replace', 'quatsch']));
      /* Der Import darf die Historie nie anfassen — die Invariante unten
         prüft das nach jeder Aktion, hier wird er tatsächlich ausgeführt. */
      if (rnd() < .4) confirmPlanImport();
      cm('m-import'); cm('m-importpreview');
    }],
    ['importFile', () => {
      // importFromFile liest input.files[0] — ein einfaches Objekt reicht.
      const code = pick([shareState.code || 'PB1C-x', pick(NASTY)]);
      importFromFile({ files: [new File([code], 'plan.pbplan.txt', { type: 'text/plain' })], value: '' });
    }],
    ['woSwitchUI', () => { if (D.active) openWorkoutSwitch(); }],
    ['exWebSearch', () => { exDemoState.name = pick(['Bankdrücken (Bench Press)', pick(NASTY), '']); openExWebSearch(); }],
    ['onboardingGen', () => {
      /* Der Generator gegen unsinnige Antworten: fehlende Felder, Werte
         außerhalb jeder Auswahl, Tageszahlen jenseits der Vorlagen. */
      const ob = { gender: pick(['male', 'female', '', 'x']), days: pick([0, 1, 2, 3, 4, 5, 6, 9, 'drei', null]),
        location: pick(['gym', 'home', 'mars', '']), focus: pick(['hypertrophy', 'strength', 'balanced', 'recomp', 'bbp', '', 'x']),
        experience: pick(['beginner', 'intermediate', 'advanced', '', 'gott']),
        height: int(0, 260), weight: int(0, 300), birthday: pick(['1990-01-01', '', 'x']) };
      const plan = buildPlanFromOnboarding(ob);
      if (!plan || !Object.keys(plan).length) throw new Error('Generator ohne Plan: ' + JSON.stringify(ob));
      Object.entries(plan).forEach(([k, d]) => (d.exercises || []).forEach(e => {
        if (!e.name || !(parseInt(e.sets) >= 1) || !(e.rmax >= e.rmin))
          throw new Error(`Generator: kaputte Übung in ${k}: ${JSON.stringify(e)}`);
      }));
      if (document.getElementById('ob-content')) { obStep = int(0, 7); renderObStep(); }
    }],
    ['duration', () => {
      Object.keys(D.plan || {}).forEach(k => {
        const m = estimatedDuration(k);
        if (!Number.isFinite(m) || m < 0) throw new Error(`estimatedDuration(${k}) = ${m}`);
      });
      ['Bankdrücken', 'Ausfallschritt je Seite', pick(NASTY), ''].forEach(n => {
        const s = setSides(n); if (s !== 1 && s !== 2) throw new Error('setSides = ' + s);
        const r = restSecondsFor(n, pick(EX_MUSCLES), pick(['main', 'pre', 'mob']));
        if (!Number.isFinite(r) || r < 0) throw new Error('restSecondsFor = ' + r);
      });
    }]
  ];

  // ---- Invarianten: gelten nach JEDER Aktion, ausnahmslos ----
  const INVARIANTS = [
    ['D bleibt serialisierbar', () => { JSON.stringify(D); return true; }],
    ['Plan hat mindestens einen Tag', () => Object.keys(D.plan || {}).length >= 1],
    ['Alle Plan-Übungen sind normalisiert', () => Object.values(D.plan).every(day =>
      Array.isArray(day.exercises) && day.exercises.every(e =>
        typeof e.name === 'string' && e.name.length > 0 &&
        Number.isFinite(e.sets) && e.sets >= 1 &&
        Number.isFinite(e.rmin) && Number.isFinite(e.rmax) && e.rmax >= e.rmin))],
    ['Aktive Session ist konsistent', () => !D.active || (
      Array.isArray(D.active.exercises) &&
      D.active.exercises.every(e => Array.isArray(e.logged) && e.sets >= 1))],
    ['Kein geloggter Satz mit NaN', () => !D.active || D.active.exercises.every(e =>
      e.logged.every(l => Number.isFinite(l.w) && Number.isFinite(l.r) && Number.isFinite(l.rir)))],
    ['History-Sätze sind numerisch', () => D.history.every(s =>
      Array.isArray(s.sets) && s.sets.every(x =>
        Number.isFinite(parseFloat(x.w)) && Number.isFinite(parseInt(x.r))))],
    ['Volumen ist endlich und nicht negativ', () => D.history.every(s => {
      const v = sessionVolume(s); return Number.isFinite(v) && v >= 0; })],
    ['Wochen-Landmarks bleiben geordnet', () => {
      const l = weeklyLandmarks(); return l.mev > 0 && l.mev < l.mav && l.mav < l.mrv; }],
    ['Gewichtseinträge sind plausibel', () => (D.bio.weights || []).every(w =>
      Number.isFinite(parseFloat(w.kg)) && parseFloat(w.kg) > 0)],
    ['Timer-Zeiten sind nicht negativ', () => getTimerRemaining() >= 0 && timerTgt >= 0 && timerPausedRemaining >= 0],
    /* Strukturelle XSS-Prüfung. Ein Regex über innerHTML wäre unbrauchbar:
       Anführungszeichen in Textknoten werden beim Serialisieren nicht
       escaped, ein korrekt escapter Übungsname "<img onerror=...>" würde
       also fälschlich als Treffer gemeldet. Was zählt, ist ob aus der
       Nutzlast tatsächlich Elemente oder Handler entstanden sind. */
    ['Keine injizierten Script-Elemente', () =>
      document.getElementById('main-app').querySelectorAll('script').length === 0],
    ['Keine injizierten Event-Handler-Attribute', () =>
      document.getElementById('main-app').querySelectorAll('[onerror],[onload],[onmouseover],[onfocus]').length === 0],
    /* Übungsfotos sind echte <img>-Elemente und damit legitim. Die Invariante
       prüft weiterhin, dass KEIN unerwartetes Fremdelement entsteht — nur die
       bekannten Foto-Klassen sind ausgenommen. Das ist eine Verschärfung, keine
       Aufweichung: jedes img ohne diese Klassen schlägt weiterhin an. */
    ['Keine injizierten Fremdelemente', () =>
      [...document.getElementById('main-app').querySelectorAll('img,iframe,object,embed,form')]
        // Seit dem Entfernen der Fotoschicht darf ueberhaupt kein <img> mehr
    // im gerenderten Baum stehen - die Ausnahme von PB-037 entfaellt und die
    // Invariante wird dadurch strenger, nicht loecheriger.
        .length === 0],
    ['Keine XSS-Flagge gesetzt', () => !window.__pwn && !window.__pwned],
    // Zwei getrennte Vertraege, seit Kacheln und Demo verschiedene Grafiken
    // zeigen: die Marke ist ein Pfad-Symbol, die Demo eine Strichfigur aus
    // Linien und Kreisen. Eine gemeinsame Regel wuerde entweder die Marke
    // faelschlich anschlagen oder die Figur nicht mehr pruefen.
    ['Übungsmarke hat ein Symbol', () => {
      const mark = document.querySelector('.exmark svg');
      return !mark || mark.querySelectorAll('path').length > 0; }],
    ['Übungsfigur bleibt wohlgeformt', () => {
      const fig = document.querySelector('.exdemo svg, #demo-stage svg');
      return !fig || fig.querySelectorAll('line,circle,polyline,polygon,path').length > 0; }],
    ['Tombstone-Listen bleiben Arrays', () => ['history', 'weights', 'egym', 'libraryCustom']
      .every(k => Array.isArray(D.deleted[k]))],
    /* Eine Supersatz-Kennung ist eine Aussage über ZWEI Übungen. Bleibt
       eine allein zurück (Partner gelöscht, Tag ersetzt, Import), zeigt die
       Oberfläche eine Kopplung an, die es nicht gibt, und die Dauer-
       schätzung rechnet mit einer geteilten Pause, die niemand teilt. */
    ['Supersatz-Kennungen bleiben paarweise', () => Object.values(D.plan || {}).every(day => {
      const n = {};
      (day.exercises || []).forEach(e => { if (e.ss) n[e.ss] = (n[e.ss] || 0) + 1; });
      return Object.values(n).every(c => c >= 2);
    })],
    ['Zeitschätzung ist endlich und nicht negativ', () => Object.keys(D.plan || {}).every(k => {
      const m = estimatedDuration(k); return Number.isFinite(m) && m >= 0;
    }) && Number.isFinite(remainingMinutes()) && remainingMinutes() >= 0],
    ['Mesozyklus-Faktor bleibt zwischen 0 und 1', () => {
      const st = mesoState();
      return !st || (st.factor > 0 && st.factor <= 1 && st.week >= 1 && st.weeks >= 3 && st.weeks <= 8);
    }],
    /* Der Scheibenrechner darf nie eine Summe zeigen, die nicht aufgeht —
       das ist der ganze Zweck des Rechners (PB-055). */
    ['Scheibenplan geht exakt auf', () => [0, 20, 21.25, 60, 87.5, 100, 302.5].every(w => {
      const r = platePlan(w, 20);
      if (!r.ok) return true;
      const sum = r.plates.reduce((a, x) => a + x.p * x.n, 0);
      return Math.abs(sum + r.rest - r.perSide) < 1e-6;
    })],
    ['UI-Zustand bleibt serialisierbar und vollständig', () => {
      ensureUIState();
      return D.ui && typeof D.ui.sections === 'object' && D.ui.sections !== null;
    }]
  ];

  /* Zwei Operationen mit demselben Namen zählen auf denselben Statistikeintrag —
     eine davon verschwindet aus dem Bericht, und niemand merkt es. Genau das
     war bei "deload" ein halbes Jahr lang der Fall. */
  const doppelt = ACTIONS.map(a => a[0]).filter((n, i, all) => all.indexOf(n) !== i);
  if (doppelt.length) throw new Error('Doppelte Operationsnamen im Fuzzer: ' + [...new Set(doppelt)].join(', '));

  const stats = {}; const log = [];
  for (let i = 0; i < iterations; i++) {
    const [name, fn] = pick(ACTIONS);
    stats[name] = (stats[name] || 0) + 1;
    log.push(name); if (log.length > 25) log.shift();
    /* await, weil Teilen und Importieren echt asynchron sind (Kompression,
       Datei lesen). Nebeneffekt und Absicht zugleich: zwischen zwei Runden
       dürfen jetzt auch Timer feuern — genau wie in echter Bedienung. */
    try { await fn(); }
    catch (e) {
      restore();
      return { ok: false, kind: 'exception', iteration: i, action: name,
               message: e.message, stack: String(e.stack || '').split('\n').slice(0, 3).join(' <- '),
               trail: log.slice(-12), stats };
    }
    for (const [inv, test] of INVARIANTS) {
      let held = false;
      try { held = !!test(); } catch (e) { held = false; }
      if (!held) {
        restore();
        return { ok: false, kind: 'invariant', iteration: i, action: name,
                 invariant: inv, trail: log.slice(-12), stats };
      }
    }
  }
  restore();
  return { ok: true, iterations, stats, invariants: INVARIANTS.length, actions: ACTIONS.length,
           downloads, popups };
}, { iterations: ITERATIONS, seed: SEED });

if (fuzz.ok) {
  check('fuzz', `${fuzz.iterations} Aktionen über ${fuzz.actions} Operationen ohne Ausnahme`, true);
  check('fuzz', `${fuzz.invariants} Invarianten nach jeder Aktion gehalten `
    + `(${(fuzz.iterations * fuzz.invariants).toLocaleString('de-DE')} Prüfungen)`, true);
  /* Die Schwelle wächst mit dem Lauf, nicht mit der Zahl der Operationen:
     ein Viertel der Gleichverteilung. Fest verdrahtete 3 waren bei kleinen
     Läufen ein Fehlalarm und bei großen keine Aussage mehr. */
  const soll = Math.max(1, Math.floor(fuzz.iterations / fuzz.actions / 4));
  const cold = Object.entries(fuzz.stats).filter(([, n]) => n < soll).map(([k, n]) => `${k} (${n}×)`);
  const nie = fuzz.actions - Object.keys(fuzz.stats).length;
  check('fuzz', `Jede der ${fuzz.actions} Operationen mindestens ${soll}× getroffen`,
    cold.length === 0 && nie === 0,
    (nie ? `${nie} Operationen nie ausgeführt · ` : '')
    + (cold.length ? 'zu selten: ' + cold.join(', ') : ''));
} else if (fuzz.kind === 'exception') {
  check('fuzz', `Ausnahme in "${fuzz.action}" (Iteration ${fuzz.iteration})`, false,
    `${fuzz.message}\n      ${fuzz.stack}\n      Aktionsfolge: ${fuzz.trail.join(' → ')}`
    + `\n      Nachstellen: node test/check.mjs --seed=${SEED}`);
} else {
  check('fuzz', `Invariante verletzt nach "${fuzz.action}" (Iteration ${fuzz.iteration})`, false,
    `Invariante: ${fuzz.invariant}\n      Aktionsfolge: ${fuzz.trail.join(' → ')}`
    + `\n      Nachstellen: node test/check.mjs --seed=${SEED}`);
}

// Nach dem Fuzzing muss die App noch bedienbar sein.
await page.evaluate(() => { document.querySelectorAll('.mbg.show').forEach(m => cm(m.id)); go('dash'); });
await page.waitForTimeout(400);
check('fuzz', 'App ist nach dem Fuzzing noch bedienbar', await page.isVisible('#main-app'));
}

// ---------------------------------------------------------------- Bilanz
check('global', 'Keine unbehandelten JS-Fehler im gesamten Lauf',
  R.errors.length === 0, R.errors.slice(0, 5).join('\n      '));

await browser.close();

console.log('\n' + '─'.repeat(64));
console.log(`${R.fail === 0 ? C.g + 'ALLES GRÜN' : C.r + 'FEHLER GEFUNDEN'}${C.x}`
  + `   ${R.pass} bestanden, ${R.fail} fehlgeschlagen   ${C.d}seed=${SEED}${C.x}`);
if (R.failures.length) {
  console.log('\nFehlgeschlagen:');
  R.failures.forEach(f => console.log(`  [${f.stage}] ${f.name}${f.detail ? '\n      ' + f.detail : ''}`));
  console.log(`\n${C.y}Jeder neu gefundene Fehler gehört nach dem Fix als Eintrag in`
    + ` docs/BUGS.md UND als Regressionstest in dieses Skript.${C.x}`);
}
console.log('─'.repeat(64));
process.exit(R.fail === 0 ? 0 : 1);
