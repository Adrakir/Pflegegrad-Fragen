const assert=require('node:assert/strict'),fs=require('node:fs');
const {boot}=require('./verify-calculator.cjs');
const ui=boot();ui.run('go(1)');
assert.equal(ui.run('viewMode'),'one');
assert.equal((ui.q('#calcScreen').innerHTML.match(/<fieldset/g)||[]).length,1);
assert.match(ui.q('#calcScreen').innerHTML,/q-1-1/);
ui.q('#calcScreen').listeners.change({target:{dataset:{question:'1.1'},value:'2'}});
ui.q('#nextStep').onclick();assert.match(ui.q('#calcScreen').innerHTML,/q-1-2/);
assert.equal(ui.run("answers['1.1'].choice"),'2');
ui.run("viewMode='all';renderScreen()");assert.equal((ui.q('#calcScreen').innerHTML.match(/<fieldset/g)||[]).length,5);
ui.run("viewMode='one';renderScreen()");assert.match(ui.q('#calcScreen').innerHTML,/q-1-2/);
ui.q('#previousStep').onclick();assert.match(ui.q('#calcScreen').innerHTML,/q-1-1/);
ui.run('go(2)');ui.q('#previousStep').onclick();assert.equal(ui.run('step'),1);assert.equal(ui.run('questionIndex'),4);
ui.run("answers['5.13']={choice:'help',count:'2',unit:'week',uncertain:true};reviewQuestion('5.13')");
assert.match(ui.q('#calcScreen').innerHTML,/q-5-13/);assert.equal(ui.run('questionIndex'),12);
assert.equal(ui.run("answers['5.13'].count"),'2');
ui.run('questionIndex=15;renderScreen()');ui.q('#nextStep').onclick();assert.equal(ui.run('step'),6);
ui.run('questionIndex=5;renderScreen()');ui.q('#nextStep').onclick();assert.equal(ui.run('step'),7);
assert.match(ui.q('#calcScreen').innerHTML,/Kriterien sind offen/);
for(const page of ['index.html','pflegewissen.html','fallbeispiel.html','pflegegradrechner.html','abrechnung.html']){
 const h=fs.readFileSync(page,'utf8');assert.match(h,/app-usability\.css\?v=/);assert.match(h,/app-usability\.js\?v=/);assert.doesNotMatch(h,/__[A-Z_]+__/);
}
const faq=fs.readFileSync('faq.html.inc','utf8');assert.match(faq,/Nachbarschaftshilfe in Niedersachsen ab/);assert.match(faq,/data-topic="abrechnung"/);
const bill=fs.readFileSync('abrechnung-template.html','utf8');assert.match(bill,/id="contrast"/);assert.match(bill,/Animation starten/);
const weight=fs.readFileSync('weighting.html.inc','utf8');assert.equal([...weight.matchAll(/width:(\d+)%/g)].reduce((n,m)=>n+Number(m[1]),0),100);
console.log('PASS: single-question navigation, exact review target, unchanged answers/frequencies across view switches, module/result boundaries, shared assets, billing FAQ, opt-in animation and 100% weighting graphic.');
