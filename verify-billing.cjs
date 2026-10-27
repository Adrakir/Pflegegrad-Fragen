const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const data=fs.readFileSync('billing-data.json','utf8'),code=fs.readFileSync('abrechnung.js','utf8');
new vm.Script(code);
const context=vm.createContext({Intl,document:{getElementById(){return{textContent:data}}}});
// Exercise pure calculations and all example totals without replacing UI behavior.
vm.runInContext(code.slice(0,code.indexOf("document.querySelectorAll('[data-service]').forEach(b=>b.addEventListener")),context);
const run=s=>vm.runInContext(s,context);
assert.equal(run('budget(3539,240,1680).remaining'),1619);
assert.equal(run('budget(3539,3000,700).over'),161);
assert.equal(run('budget(131,94.4).remaining'),36.6);
assert.equal(run('budget(721,550,200).over'),29);
assert.equal(run('budget(0,0).ratio'),0);
assert.equal(run('budget(0,20).over'),20);
assert.equal(run('budget(100,-1)'),null);
assert.equal(run("budget(100,'')"),null);
assert.equal(run("budget(100,'abc')"),null);
assert.equal(run('budget(100,Infinity)'),null);
assert.equal(run('budget(.3,.1,.2).remaining'),0);
assert.equal(run("Object.keys(SERVICES).length"),5);
assert.equal(run('SERVICES.kp.cost-SERVICES.kp.covered'),368);
assert.equal(run('SERVICES.tp.cost-SERVICES.tp.covered'),109);
assert.equal(run('SERVICES.np.cost-SERVICES.np.covered'),163);
assert.equal(run('BILLING.contacts.length'),8);
const html=fs.readFileSync('abrechnung.html','utf8');
assert.doesNotMatch(html,/__[A-Z_]+__/);
for(const match of html.matchAll(/(?:href|src)="\.\/([^"?#]+)(?:[?#][^"]*)?"/g))assert.ok(fs.existsSync(match[1]),match[1]);
for(const page of ['index.html','pflegewissen.html','fallbeispiel.html','pflegegradrechner.html'])assert.match(fs.readFileSync(page,'utf8'),/href="\.\/abrechnung.html"/);
assert.equal(fs.readFileSync('dist/abrechnung.html','utf8'),html);
console.log('PASS: five billing examples, independent budgets, cent arithmetic, PG1 zero budget, overflow/invalid inputs, eight contacts, six PDF links and existing-app navigation.');

// The city filter must route the actual letter address, independently of branch visits.
const contacts=JSON.parse(data).contacts;
for(const c of contacts){
 for(const city of ['os','ha']){
  const visit=c.visits[city];assert.ok(visit.lines||visit.note,c.name+city);assert.match(visit.source,/^https:\/\//);
  const posts=run('contactPosts('+JSON.stringify(c)+','+JSON.stringify(city)+')');
  assert.equal(posts.length,1,c.name+city);assert.match(posts[0].lines.at(-1),/^\d{5} /);assert.match(posts[0].source,/^https:\/\//);
 }
}
const barmer=contacts.find(c=>c.name==='BARMER');
assert.equal(run('contactPosts('+JSON.stringify(barmer)+',"ha")[0].lines.at(-1)'),'42266 Wuppertal');
assert.equal(run('contactPosts('+JSON.stringify(barmer)+',"os")[0].lines.at(-1)'),'73524 Schwäbisch Gmünd');
assert.equal(run('contactPosts('+JSON.stringify(barmer)+',"all").length'),2);
const firmus=contacts.find(c=>c.name==='BKK firmus');assert.equal(firmus.posts[0].lines.at(-1),'28192 Bremen');
assert.equal(run('contactLines(["A&B","<Adresse>"])'),'A&amp;B<br>&lt;Adresse&gt;');
console.log('PASS: each city has one complete letter address and a visit source or explicit availability note; BARMER differs by city, firmus has no placeholder, address text is escaped.');

// Household costs use the existing cent-accurate budget engine and public deep links.
assert.equal(run('budget(131,70).remaining'),61);
assert.equal(run('budget(131,23.6).remaining'),107.4);
assert.equal(run('budget(131,30).remaining'),101);
assert.equal(run('budget(3539,54).remaining'),3485);
const providers=JSON.parse(fs.readFileSync('local-services.json','utf8')).providers;
assert.equal(providers.length,10);
assert.equal(new Set(providers.map(p=>p.id)).size,10);
for(const city of ['ha','os'])for(const type of ['fenster','garten','fahrt'])assert.ok(providers.some(p=>p.city===city&&p.type===type));
for(const p of providers){assert.match(p.url,/^https:\/\//);assert.ok(p.phone&&p.funding);assert.ok(html.includes('id="firma-'+p.id+'"'));}
const records=JSON.parse(fs.readFileSync('app-public.json','utf8')).records;
for(const id of ['fenster','nachbar','garten','gemischt','ersatz','balkon','taxi','krankenfahrt'])assert.ok(records.some(r=>r.url==='./abrechnung.html#haus-fall-'+id));
for(const p of providers)assert.ok(records.some(r=>r.url==='./abrechnung.html#firma-'+p.id));
// The real DOM filter function: city+service intersection, empty state and reset.
const cards=providers.map(p=>({dataset:{providerCity:p.city,providerType:p.type},hidden:false}));
const fields={providerCity:{value:'ha'},providerType:{value:'fahrt'},providerCount:{textContent:''}};
const filterContext=vm.createContext({document:{getElementById:id=>fields[id],querySelectorAll:()=>cards}});
const filterStart=code.indexOf('function filterLocalProviders()'),filterEnd=code.indexOf("\nfor(const id of ['providerCity'",filterStart);
vm.runInContext(code.slice(filterStart,filterEnd),filterContext);
vm.runInContext('filterLocalProviders()',filterContext);assert.equal(cards.filter(c=>!c.hidden).length,2);assert.equal(fields.providerCount.textContent,'2 von 10 Firmen angezeigt.');
fields.providerCity.value='os';fields.providerType.value='fenster';vm.runInContext('filterLocalProviders()',filterContext);assert.equal(cards.filter(c=>!c.hidden).length,2);
fields.providerCity.value='all';fields.providerType.value='all';vm.runInContext('filterLocalProviders()',filterContext);assert.equal(cards.filter(c=>!c.hidden).length,10);
assert.match(html,/Garten- und Rasenpflege sind als Alltagsangebot ausgeschlossen/);
assert.match(html,/Keine Doppelerstattung/);assert.match(html,/Krankenkasse/);
console.log('PASS: household cost examples, eight public case targets, ten sourced providers across both cities and all three services, intersecting directory filters and reset.');
