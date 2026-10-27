const assert=require('node:assert/strict'),fs=require('node:fs');
const V=require('./care-visuals.js'),{boot,data,blank}=require('./verify-calculator.cjs');
for(let id=1;id<=6;id++){const svg=V.modulePicture(id);assert.match(svg,/<svg/);assert.match(svg,/Im Alltag/);assert.doesNotMatch(svg,/>undefined</);}
for(const scene of ['conversation','neighbour']){const s=V.scene(scene);assert.match(s,/role="img"/);assert.match(s,/aria-label=/);assert.match(s,/viewBox="0 0 400 236"/);}
assert.equal(V.flows.application.length,5);assert.equal(V.flows.higher.length,4);assert.equal(V.flows.neighbour.length,4);
for(const type of Object.keys(V.flows)){const h=V.flowHTML(type);assert.equal((h.match(/data-flow-step=/g)||[]).length,V.flows[type].length);assert.match(h,/aria-pressed="false">(?:Abrechnung|Ablauf) Schritt für Schritt zeigen/);}
const ui=boot();assert.equal(ui.run('resultPicture(E.calculate(DATA,{}))'),'');
ui.run("answers="+JSON.stringify(blank())+";for(let n=1;n<=11;n++)answers['2.'+n]={choice:'3'};for(let n=1;n<=13;n++)answers['3.'+n]={choice:'5'}");
const picture=ui.run('resultPicture(E.calculate(DATA,answers))');
const widths=[...picture.matchAll(/style="width:([\d.]+)%/g)].map(m=>Number(m[1]));assert.deepEqual(widths,[0,15,0,0,0,85]);
for(const page of ['index.html','pflegewissen.html','fallbeispiel.html','pflegegradrechner.html','abrechnung.html','gdb.html','meine-vorbereitung.html']){
 const h=fs.readFileSync(page,'utf8');assert.match(h,/care-visuals\.css\?v=/);assert.match(h,/care-visuals\.js\?v=/);assert.equal(h,fs.readFileSync('dist/'+page,'utf8'));
}
console.log('PASS: six module pictures, accessible SVG scenes, finite opt-in flow definitions and result graphic counts modules 2/3 only once.');
for(const id of ['vp','eb','kp','tp','np']){
 assert.equal(V.flows[id].length,4);assert.equal((V.flowHTML(id).match(/data-flow-step=/g)||[]).length,4);
}
assert.match(V.flows.tp[2][2],/Nachtpflege/);assert.match(V.flows.np[2][2],/Tagespflege/);
console.log('PASS: every billing type has its own four-step flow; day/night flows explicitly share the month.');
