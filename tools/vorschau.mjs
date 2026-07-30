/**
 * BAUT DIE BEDIENBARE VORSCHAU
 *
 * Der Wunsch war ein iOS-Simulator: „Ich will eine Live-Ansicht sehen."
 * Ein echter Simulator läuft nur auf macOS mit Xcode; diese Maschine ist
 * Linux. Was hier entsteht, ist deshalb bewusst nicht als Simulator
 * ausgegeben, sondern als das, was es ist: die echte App, im echten
 * iPhone-Viewport, in einer Seite, die man antippen kann.
 *
 * Drei Eingriffe an der App, alle notwendig, alle rückstandslos:
 *
 *  1. Die drei externen Ressourcen fallen weg. Die Seite, in der die
 *     Vorschau läuft, darf keine fremden Hosts kontaktieren — die
 *     Schriften kommen deshalb eingebettet, die Firebase-SDKs gar nicht.
 *  2. Der Firebase-Schlüssel wird auf den Platzhalter gesetzt. Ohne das
 *     wäre schon der Versuch denkbar, die Vorschau schriebe in die echten
 *     Daten. `initFirebase()` prüft genau diesen Platzhalter und gibt
 *     `false` zurück — die App läuft also in ihrem eigenen Offline-Modus,
 *     nicht in einem Sonderzustand, den es sonst nirgends gibt.
 *  3. Ein Startdatensatz. Ohne Historie und ohne Messung wären drei der
 *     vier Änderungen unsichtbar: Es gäbe nichts zu korrigieren.
 *
 * Alles andere ist Zeile für Zeile dieselbe Datei, die auf GitHub Pages
 * ausgeliefert wird.
 *
 *   node tools/vorschau.mjs [ziel.html]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const hier = path.dirname(fileURLToPath(import.meta.url));
const wurzel = path.join(hier, '..');
const ziel = process.argv[2] || path.join(wurzel, 'build', 'vorschau.html');

let app = fs.readFileSync(path.join(wurzel, 'index.html'), 'utf8');
const schriften = fs.readFileSync(path.join(hier, 'schriften.css'), 'utf8');
const rahmen = fs.readFileSync(path.join(hier, 'rahmen.html'), 'utf8');

/* Ein fehlgeschlagener Austausch darf nicht durchrutschen: Wenn das Muster
   nicht mehr passt, weil sich index.html geändert hat, ist das Ergebnis
   eine Seite, die halb funktioniert — und niemand sieht es an. */
function ersetze(text, muster, neu, name) {
  const treffer = text.match(muster);
  if (!treffer) throw new Error(`Vorschau: "${name}" nicht gefunden — index.html hat sich geändert.`);
  return text.replace(muster, neu);
}

app = ersetze(app, /<link href="https:\/\/fonts\.googleapis\.com[^>]*>/,
  `<style>\n${schriften}\n</style>`, 'Schrift-Link');
app = ersetze(app, /<script src="https:\/\/www\.gstatic\.com\/firebasejs\/[^"]*firebase-app-compat\.js"><\/script>\s*/,
  '', 'Firebase-App-SDK');
app = ersetze(app, /<script src="https:\/\/www\.gstatic\.com\/firebasejs\/[^"]*firebase-firestore-compat\.js"><\/script>/,
  '<!-- Firebase in der Vorschau bewusst nicht geladen -->', 'Firebase-Firestore-SDK');
app = ersetze(app, /const FIREBASE_CONFIG=\{apiKey:"[^"]*"/,
  'const FIREBASE_CONFIG={apiKey:"DEIN_API_KEY"', 'Firebase-Konfiguration');

if (/https:\/\/(fonts\.googleapis|www\.gstatic)/.test(app))
  throw new Error('Vorschau: es ist noch ein externer Host in der Seite.');

/* Der Startdatensatz läuft NACH dem Skript der App: dort sind DEFAULT_PLAN,
   normalizeData und showApp bereits definiert, und `autoResume` ist ohne
   gespeicherten Sync-Code folgenlos durchgelaufen. Er greift nur beim ersten
   Aufruf — wer in der Vorschau etwas einträgt, findet es beim nächsten
   Öffnen wieder. */
const start = `
<script>
(function startdatensatz(){
  try{ if(localStorage.getItem('pb_data'))return; }catch{ return }
  const tage=Object.keys(DEFAULT_PLAN);
  const datum=v=>{const d=new Date();d.setDate(d.getDate()-v);return d.toLocaleDateString('de-DE')};
  const iso=v=>{const d=new Date();d.setDate(d.getDate()-v);return d.toISOString().split('T')[0]};
  /* Gewichte, die zur Übung passen — eine Session, in der alles 40 kg wiegt,
     sieht nach Testdaten aus und lässt sich schlecht beurteilen. */
  const last={chest:72,back:64,legs:130,shoulders:14,arms:26,core:25};
  const sessions=[[24,0],[17,1],[10,2],[3,0]].map(([vorTagen,tag],n)=>{
    const key=tage[tag];
    const s={id:'demo-'+n,updatedAt:Date.now()-vorTagen*864e5,date:datum(vorTagen),
             planKey:key,duration:95+n*4,sets:[]};
    DEFAULT_PLAN[key].exercises.forEach(ex=>{
      const basis=(last[ex.muscle]||30)*(1+n*0.025);
      for(let i=0;i<ex.sets;i++){
        s.sets.push({ex:ex.name,nr:i+1,
          w:Math.round(basis*(1-i*0.04)*2)/2,
          r:ex.rmax-Math.min(i,3),rir:Math.max(0,2-i),note:'',
          muscle:ex.muscle,type:ex.type});
      }
    });
    return s;
  });
  D.bio.height=183;D.bio.birthday='1988-04-12';D.bio.gender='male';
  D.bio.weights=[{date:datum(60),kg:84.4}];
  D.egym={enabled:true,measurements:[
    {date:iso(48),bioage:41,kraft:39,kardio:44,stoff:40,flex:45,bmi:25.1,gewicht:84.1,
     kfp:21.4,kfkg:18,ffm:66.1,smm:35.9,kwp:55.2,kwl:46.4,ezw:19.1,izw:27.3,bmr:1795,
     vf:8,pw:6.1,mual:3.6,muar:3.7,mubl:9.8,mubr:9.9,muru:28.4},
    {date:iso(20),bioage:39,kraft:36,kardio:43,stoff:38,flex:44,bmi:24.7,gewicht:82.8,
     kfp:19.6,kfkg:16.2,ffm:66.6,smm:36.8,kwp:56.4,kwl:46.7,ezw:19,izw:27.7,bmr:1812,
     vf:7,pw:6.3,mual:3.7,muar:3.8,mubl:10,mubr:10.1,muru:28.9}
  ]};
  D.history=sessions;
  normalizeData();
  localStorage.setItem('pb_data',JSON.stringify(D));
  localStorage.setItem('pb_sync','offline');
  syncCode='offline';useFirebase=false;
  loadLocal();showApp();
})();
<\/script>
`;
app = app.replace('</body>', start + '</body>');

/* Der HTML-Parser beendet einen <script>-Block beim ersten "</script" —
   auch bei type="text/plain". Die App enthält eigene Skriptblöcke, deren
   Ende hier maskiert werden muss; die Seite macht es beim Auslesen
   rückgängig. */
const eingebettet = app.replace(/<\/script/g, '<\\/script');

const seite = rahmen
  .replace('<!--PB_QUELLE-->', eingebettet)
  .replace('<!--PB_SCHRIFTEN-->', schriften);

fs.mkdirSync(path.dirname(ziel), { recursive: true });
fs.writeFileSync(ziel, seite);
const kb = n => (n / 1024).toFixed(0) + ' KB';
console.log(`Vorschau geschrieben: ${ziel}`);
console.log(`  App eingebettet : ${kb(app.length)}`);
console.log(`  Schriften       : ${kb(schriften.length)}`);
console.log(`  Seite gesamt    : ${kb(seite.length)}`);
