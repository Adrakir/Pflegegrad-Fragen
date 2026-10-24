const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('./calculator-engine.js'),data=require('./calculator-data.json');
const items=data.modules.flatMap(m=>m.items),byId=Object.fromEntries(items.map(i=>[i.id,i]));
const blank=()=>Object.fromEntries(items.map(i=>[i.id,{choice:'0'}]));
assert.equal(items.length,64);assert.equal(new Set(items.map(i=>i.id)).size,64);
assert.deepEqual(data.modules.map(m=>m.items.length),[5,11,13,13,16,6]);
// Explicit expected cut points from Anlage 2 / BRi chapter 5.10.1, not generated from the implementation.
const expected=[[[0,0],[1,0],[2,2.5],[3,2.5],[4,5],[5,5],[6,7.5],[9,7.5],[10,10],[15,10]],[[0,0],[1,0],[2,3.75],[5,3.75],[6,7.5],[10,7.5],[11,11.25],[16,11.25],[17,15],[33,15]],[[0,0],[1,3.75],[2,3.75],[3,7.5],[4,7.5],[5,11.25],[6,11.25],[7,15],[65,15]],[[0,0],[2,0],[3,10],[7,10],[8,20],[18,20],[19,30],[36,30],[37,40],[54,40]],[[0,0],[1,5],[2,10],[3,10],[4,15],[5,15],[6,20],[15,20]],[[0,0],[1,3.75],[3,3.75],[4,7.5],[6,7.5],[7,11.25],[11,11.25],[12,15],[18,15]]];
expected.forEach((rows,i)=>rows.forEach(([raw,w])=>assert.equal(E.weighted(i+1,raw),w,`Module ${i+1}, raw ${raw}`)));
[[0,0],[12.49,0],[12.5,1],[26.99,1],[27,2],[47.49,2],[47.5,3],[69.99,3],[70,4],[89.99,4],[90,5],[100,5]].forEach(([p,g])=>assert.equal(E.grade(p),g));
assert.equal(E.calculate(data,{}).total,null);assert.equal(E.calculate(data,{}).grade,null);
let a=blank(),r=E.calculate(data,a);assert.equal(r.complete,true);assert.equal(r.total,0);assert.equal(r.grade,0);
delete a['5.1'];assert.equal(E.calculate(data,a).total,null);
a=blank();for(const i of items)a[i.id]={choice:i.kind==='behavior'?'5':i.kind==='tube'?'6':i.kind==='frequency'?'help':'3',...(i.kind==='frequency'?{count:i.id==='5.12'?'1':'10',unit:Number(i.id.split('.')[1])>=13?'week':'day'}:{})};r=E.calculate(data,a);assert.equal(r.total,100);assert.equal(r.grade,5);assert.equal(r.modules[3].raw,54);assert.equal(r.modules[4].raw,15);
// Module 2/3 contribute the greater weighted value, never the sum.
a=blank();for(let i=1;i<=11;i++)a['2.'+i]={choice:'3'};a['3.10']={choice:'5'};r=E.calculate(data,a);assert.equal(r.total,15);assert.equal(r.modules[2].weighted,11.25);
a=blank();a['3.10']={choice:'5'};a['3.11']={choice:'5'};for(let i=1;i<=6;i++)a['6.'+i]={choice:'1'};a['5.1']={choice:'help',count:'3',unit:'day'};r=E.calculate(data,a);assert.equal(r.total,27.5);assert.equal(r.grade,2);
a['1.1']={choice:'2'};a['1.2']={choice:'2'};a['4.1']={choice:'3'};a['4.2']={choice:'3'};a['4.3']={choice:'2'};r=E.calculate(data,a);assert.equal(r.total,52.5);assert.equal(r.grade,3);
const therapy=data.modules[4].items;
function t(id,count,unit){const answers=blank();answers[id]={choice:'help',count:String(count),unit};return E.therapy(therapy,answers);}
[[0.9,0],[1,1],[3,1],[3.1,2],[8,2],[8.1,3]].forEach(([n,p])=>assert.equal(t('5.1',n,'day').groupA,p));
assert.equal(t('5.1',1,'week').groupA,0);assert.equal(t('5.1',30,'month').groupA,1);
assert.equal(t('5.8',1,'week').groupB,1);assert.equal(t('5.8',4,'month').groupB,0);assert.equal(t('5.8',1,'day').groupB,2);assert.equal(t('5.8',2.99,'day').groupB,2);assert.equal(t('5.8',3,'day').groupB,3);
assert.equal(t('5.13',1,'week').groupC,1);assert.equal(t('5.14',2,'week').groupC,2);assert.equal(t('5.13',3,'week').groupC,3);assert.equal(t('5.15',1,'week').groupC,2);assert.equal(t('5.12',1,'day').groupC,6);assert.equal(t('5.12',1,'month').groupC,0);
a=blank();a['5.1']={choice:'help',count:'3',unit:'day'};a['5.2']={choice:'help',count:'3',unit:'month'};a['5.5']={choice:'help',count:'2',unit:'week'};assert.equal(E.therapy(therapy,a).dailyA,3.3857);assert.equal(E.therapy(therapy,a).groupA,2);
a=blank();a['5.13']={choice:'help',count:'1',unit:'week'};a['5.15']={choice:'help',count:'1',unit:'month'};assert.equal(E.therapy(therapy,a).monthlyC,6.3);assert.equal(E.therapy(therapy,a).groupC,1);
for(const v of ['',null,'NaN','Infinity','-1','0','10001'])assert.equal(E.valid(byId['5.1'],{choice:'help',count:v,unit:'day'}),false);
assert.equal(E.valid(byId['5.13'],{choice:'help',count:'1',unit:'day'}),false);assert.equal(E.valid(byId['5.12'],{choice:'help',count:'2',unit:'day'}),false);assert.equal(E.valid(byId['3.1'],{choice:'2'}),false);assert.equal(E.valid(byId['4.13'],{choice:'9'}),false);
a=blank();a['4.11']={choice:'na'};a['4.12']={choice:'na'};assert.equal(E.calculate(data,a).complete,true);assert.equal(E.calculate(data,a).modules[3].raw,0);a['4.13']={choice:'6'};assert.equal(E.calculate(data,a).modules[3].raw,6);a['4.13']={choice:'3'};assert.equal(E.calculate(data,a).modules[3].raw,3);
assert.deepEqual(E.sanitize(data,{'1.1':{choice:'<script>'},'1.2':{choice:'1',evil:'x'},extra:{choice:'3'}}),{'1.2':{choice:'1'}});
// UI result, storage opt-in, reset and printed answers tested without a browser dependency.
function boot(initial={},deny=false){const elements=new Map();function el(){return{innerHTML:'',textContent:'',value:'',hidden:false,checked:false,disabled:false,classList:{toggle(){}},setAttribute(){},addEventListener(){},focus(){},scrollIntoView(){}};}const q=s=>{if(!elements.has(s))elements.set(s,el());return elements.get(s)};q('#calculatorData').textContent=JSON.stringify(data);q('#benefitsData').textContent=fs.readFileSync('care-benefits.json','utf8');const store={...initial};let printed=false;const c=vm.createContext({CareCalculator:E,CareSession:require('./calculator-session.js'),console,Intl,document:{getElementById:id=>q('#'+id),querySelector:q,documentElement:el()},localStorage:{getItem(k){if(deny)throw Error();return store[k]||null},setItem(k,v){if(deny)throw Error();store[k]=v},removeItem(k){if(deny)throw Error();delete store[k]}},window:{print(){printed=true}}});vm.runInContext(fs.readFileSync('calculator.js','utf8'),c);return{q,store,run:s=>vm.runInContext(s,c),printed:()=>printed};}
const original=JSON.stringify({answers:{1:'Eigene Notiz'},saved:[1]});let ui=boot({'pflegegrad-fragen-v1':original});assert.equal(ui.store['pflegegrad-rechner-v1'],undefined);assert.equal(ui.run('remember'),false);ui.run('go(7)');assert.match(ui.q('#calcScreen').innerHTML,/64 Kriterien sind offen/);assert.doesNotMatch(ui.q('#calcScreen').innerHTML,/Nach Punkten:/);
ui.run(`answers=${JSON.stringify(blank())};go(7)`);assert.match(ui.q('#calcScreen').innerHTML,/Rahmenfragen fehlen/);assert.doesNotMatch(ui.q('#calcScreen').innerHTML,/Nach Punkten:/);
ui.run("settings={duration:'yes',special:'no'};go(7)");assert.match(ui.q('#calcScreen').innerHTML,/Nach Punkten: Unterhalb/);
ui.run("settings.duration='no';go(7)");assert.match(ui.q('#calcScreen').innerHTML,/Voraussetzung zur Dauer ist nach Ihrer Angabe nicht erfüllt/);
ui.run("settings.duration='lifespan';go(7)");assert.match(ui.q('#calcScreen').innerHTML,/Ausnahme bei kürzerer verbleibender Lebenszeit/);
ui.run("settings.special='yes';go(7)");assert.match(ui.q('#calcScreen').innerHTML,/Sonderregel für Pflegegrad 5 prüfen lassen/);
ui.run('remember=true;persist()');assert.equal(JSON.parse(ui.store['pflegegrad-rechner-v1']).enabled,true);assert.equal(ui.store['pflegegrad-fragen-v1'],original);
let restored=boot(ui.store);assert.equal(restored.run('E.calculate(DATA,answers).answered'),64);
ui.q('#printResult').onclick();assert.equal(ui.printed(),true);assert.match(ui.q('#printSummary').innerHTML,/Ihre ausgewählten Antworten/);assert.match(ui.q('#printSummary').innerHTML,/6.6/);
ui.q('#confirmReset').onclick();assert.equal(ui.run('E.calculate(DATA,answers).answered'),0);assert.equal(ui.store['pflegegrad-rechner-v1'],undefined);assert.equal(ui.store['pflegegrad-fragen-v1'],original);
ui=boot({},true);assert.match(ui.q('#saveStatus').textContent,/nicht verfügbar/);assert.equal(ui.run('E.calculate(DATA,answers).total'),null);
for(const name of ['index.html','pflegewissen.html','fallbeispiel.html','pflegegradrechner.html']){const html=fs.readFileSync('dist/'+name,'utf8');assert.match(html,/href="\.\/pflegegradrechner.html"/);assert.doesNotMatch(html,/__[A-Z_]+__/);}
console.log('PASS: 64 criteria, every module/grade boundary, 0/100 points, no double-counting of modules 2/3, two full scenarios, therapy frequency conversion and rounding, tube feeding, continence exclusions, incomplete/invalid input, duration/special notes, opt-in persistence, reload, reset, print, storage failure and all navigation links.');
module.exports={boot,blank,data,E};
