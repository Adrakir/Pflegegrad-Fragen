const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),R=require('./care-reader.js');
const original=('Dies ist ein vollständiger erster Satz. Auch dieser zweite Satz bleibt zusammen. ').repeat(100).trim();
const chunks=R.speechChunks(original);assert.equal(chunks.join(' '),original);assert.ok(chunks.every(t=>t.length<=650&&/[.!?]$/.test(t)));
const text='Einleitung. '+('Sehrlangeswort '.repeat(150))+'Ende.';assert.equal(R.speechChunks(text).join(' '),text.trim());
assert.deepEqual(R.speechChunks(''),[]);assert.equal(R.spokenText('PG 2: 131 € bzw. 50 % nach § 45b SGB XI, z. B. 1–5 Stunden.'),'Pflegegrad 2: 131 Euro beziehungsweise 50 Prozent nach Paragraf 45b Sozialgesetzbuch elf, zum Beispiel 1 bis 5 Stunden.');
const local={name:'Anna',lang:'de-DE',voiceURI:'local',localService:true},remote={name:'Neural',lang:'de-DE',voiceURI:'remote',localService:false},enhanced={name:'Anna Enhanced',lang:'de-DE',voiceURI:'enhanced',localService:true};
assert.deepEqual(R.germanVoices([remote,local,enhanced,{name:'English',lang:'en-US'},local]),[enhanced,local,remote]);
function fixture({pauseWorks=true}={}){
 const spoken=[],timers=new Map();let timeId=0,latest;
 const synth={paused:false,speaking:false,cancels:0,cancel(){this.speaking=false;this.cancels++;},pause(){this.paused=pauseWorks;},resume(){this.paused=false;},speak(u){spoken.push(u);this.speaking=true;}};
 const engine=R.createReader({synth,makeUtterance:text=>({text}),onChange:s=>latest=s,setTimer(fn,ms){timers.set(++timeId,{fn,ms});return timeId;},clearTimer(id){timers.delete(id);}});
 return{engine,synth,spoken,timers,get state(){return latest;},end(){synth.speaking=false;spoken.at(-1).onend();},start(){spoken.at(-1).onstart();},boundary(n){spoken.at(-1).onboundary({charIndex:n});},timer(ms){const entry=[...timers.values()].find(t=>t.ms===ms);assert.ok(entry,'Expected timer '+ms);entry.fn();}};
}
// The actual engine must finish every chunk of long sections, in order.
let f=fixture();f.engine.start(original,{voice:local,rate:.9});const expected=R.speechChunks(R.spokenText(original));for(let i=0;i<expected.length;i++){assert.equal(f.spoken[i].text,expected[i]);assert.equal(f.spoken[i].voice,local);assert.equal(f.spoken[i].rate,.9);f.start();f.end();}assert.equal(f.state.mode,'ended');assert.equal(f.spoken.map(s=>s.text).join(' '),original);assert.equal(f.timers.size,0);
// Native pause continues the same utterance; no replay or discarded passage.
f=fixture();f.engine.start('Erster Satz. Zweiter Satz.');f.start();f.boundary(15);const u=f.spoken[0];f.engine.pause();assert.equal(f.state.mode,'paused');const count=f.spoken.length;f.engine.resume();assert.equal(f.spoken.length,count);assert.equal(f.state.position,15);f.end();assert.equal(f.state.mode,'ended');
// Devices without pause restart at the current sentence, not the whole text.
f=fixture({pauseWorks:false});f.engine.start('Erster Satz. Zweiter Satz. Dritter Satz.');f.start();f.boundary(18);f.engine.pause();f.engine.resume();assert.equal(f.spoken.at(-1).text,'Zweiter Satz. Dritter Satz.');u.onend();assert.equal(f.state.mode,'starting');
// Late end/error events from canceled audio must not advance or damage new audio.
const stale=f.spoken.at(-1);f.engine.seek(0);const before=f.spoken.length;stale.onend();stale.onerror({error:'interrupted'});assert.equal(f.spoken.length,before);assert.equal(f.state.mode,'starting');
// A broken native resume has an explicit, sentence-preserving fallback.
f=fixture();f.engine.start('Erster Satz. Zweiter Satz.');f.start();f.boundary(17);f.engine.pause();f.synth.speaking=false;f.engine.resume();f.timer(1800);assert.equal(f.spoken.at(-1).text,'Zweiter Satz.');
// Changing voice/rate preserves the place and waits for a user gesture.
f=fixture();f.engine.start('Erster Satz. Zweiter Satz.');f.start();f.boundary(18);f.engine.changeOptions({voice:enhanced,rate:.8});assert.equal(f.state.mode,'paused');f.engine.resume();assert.equal(f.spoken.at(-1).voice,enhanced);assert.equal(f.spoken.at(-1).rate,.8);assert.equal(f.spoken.at(-1).text,'Zweiter Satz.');
// The voice sample does not replace the reading session or auto-resume it.
f=fixture();f.engine.start(original);f.start();f.boundary(50);f.engine.preview('Dies ist eine Stimmenprobe.',{voice:remote,rate:1.1});assert.equal(f.state.preview,true);f.start();f.end();assert.equal(f.state.preview,false);assert.equal(f.state.mode,'paused');assert.equal(f.state.text,original);const n=f.spoken.length;f.engine.resume();assert.equal(f.spoken.length,n+1);assert.notEqual(f.spoken.at(-1).text,'Dies ist eine Stimmenprobe.');
// Stopping a sample restores the same section instead of leaving sample text.
f.engine.preview('Probe stoppen.');f.engine.stop();assert.equal(f.state.preview,false);assert.equal(f.state.text,original);assert.equal(f.state.mode,'paused');
// A failed / timed-out sample also restores the section and reports the error.
f.engine.preview('Probe.');f.spoken.at(-1).onerror({error:'network'});assert.equal(f.state.preview,false);assert.equal(f.state.text,original);assert.equal(f.state.error,'network');
f.engine.preview('Probe.');f.timer(12000);assert.equal(f.state.preview,false);assert.equal(f.state.text,original);assert.equal(f.state.error,'not-started');
// An end event arriving during pause may prepare, but never auto-play, the next passage.
f=fixture();f.engine.start(original);f.start();f.engine.pause();const pausedCount=f.spoken.length;f.end();assert.equal(f.state.mode,'paused');assert.equal(f.state.index,1);assert.equal(f.spoken.length,pausedCount);f.engine.resume();assert.equal(f.spoken.length,pausedCount+1);assert.equal(f.spoken.at(-1).text,R.speechChunks(original)[1]);
// No start event cannot leave the UI falsely reporting successful speech.
f=fixture();f.engine.start('Test.');f.timer(12000);assert.equal(f.state.mode,'error');assert.equal(f.state.error,'not-started');f.engine.retry();f.start();f.engine.stop();const end=f.spoken.at(-1).onend;end();assert.equal(f.state.mode,'idle');assert.equal(f.timers.size,0);
// No browser speech support: text remains available, speech cannot start.
const absent=R.createReader({synth:null,makeUtterance:null});absent.start('Lesbar.');assert.equal(absent.state().available,false);assert.equal(absent.state().error,'unsupported');
// Older browsers without Intl.Segmenter must never lose decimal/version text.
const fallback={module:{exports:{}},Intl:{}};vm.runInNewContext(fs.readFileSync('care-reader.js','utf8'),fallback);const older=fallback.module.exports;
for(const text of ['Version 2026.10.27.1 bleibt vollständig. Danach geht es weiter.', 'Ein Satz! „Ein zweiter Satz?“ Ja.', '131,00 Euro. Noch 94,40 Euro.'])assert.equal(older.speechChunks(text).join(' '),text);
// Every public section is retained in full after pronunciation normalization.
for(const record of require('./app-public.json').records){const full=R.spokenText(record.title+'. '+record.text);assert.equal(R.speechChunks(full).join(' '),full,record.id);assert.equal(older.speechChunks(full).join(' '),full,record.id+' without Segmenter');}
for(const page of ['index.html','pflegewissen.html','fallbeispiel.html','pflegegradrechner.html','abrechnung.html']){const html=fs.readFileSync(page,'utf8');assert.ok(html.indexOf('<script src="./care-reader.js')<html.indexOf('<script src="./app-access.js'));}
assert.equal(fs.readFileSync('care-reader.js','utf8'),fs.readFileSync('dist/care-reader.js','utf8'));
assert.equal(R.spokenText('Text [2, 3] und [NI] mit GdB.'),'Text und mit Grad der Behinderung.');
console.log('PASS: sentence-aware complete reading, abbreviation pronunciation, stable German voice ranking, full long-text playback, native/fallback pause, broken resume, voice/rate changes, retained place after samples/errors, stale events, timeouts and absent speech support.');
