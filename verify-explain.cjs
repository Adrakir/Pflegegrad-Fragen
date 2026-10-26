const assert=require('node:assert/strict'),fs=require('node:fs'),X=require('./care-explain.js');
assert.deepEqual(X.vpCases.map((_,i)=>[X.vpCase(i).absence,X.vpCase(i).help]),[[6,4],[10,3],[8,2]]);
for(let i=0;i<3;i++){const c=X.vpCase(i);assert.ok(Math.abs(c.absenceWidth/100*24-c.absence)<1e-10);assert.ok(c.helpFrom>=c.from&&c.helpTo<=c.to);}
for(const scenario of ['save','regular','late','unknown']){
 const rows=X.reliefLedger(scenario);assert.equal(rows.length,19);assert.equal(rows[0].added,13100);assert.equal(rows[11].accrued,157200);assert.equal(rows[12].added,0);assert.equal(rows[18].balance,0);
 for(const r of rows){assert.equal(r.balance+r.used+r.expired,r.accrued);assert.ok(r.balance>=0);assert.equal(r.applied+r.unallocated,r.cost);}
}
assert.equal(X.reliefLedger('save')[17].balance,157200);assert.equal(X.reliefLedger('save')[18].expiry,157200);
assert.equal(X.reliefLedger('regular')[17].balance,13200);assert.equal(X.reliefLedger('regular')[18].expiry,13200);
assert.equal(X.reliefLedger('late')[17].balance,67200);assert.match(X.calendarMonth(X.reliefLedger()[17]),/bis 30. Juni 2027/);assert.match(X.calendarMonth(X.reliefLedger()[18]),/später eingereichte Belege gesondert/);
assert.equal(X.week.length,7);for(const d of X.week){assert.ok(d.self);assert.ok(d.help);assert.ok(d.context);}
assert.equal(X.comparisons.length,3);assert.equal(X.roles.length,3);assert.match(X.roles[2].text,/keine allgemeine Vollmacht/);
const code=fs.readFileSync('care-explain.js','utf8');assert.doesNotMatch(code,/localStorage|sessionStorage|setInterval|setTimeout|fetch\(|XMLHttpRequest/);assert.match(code,/serviceUsed/);assert.match(code,/cashRemaining/);
for(const p of ['index.html','pflegewissen.html','fallbeispiel.html','pflegegradrechner.html','abrechnung.html']){const s=fs.readFileSync(p,'utf8');assert.match(s,/care-explain\.js\?v=/);assert.equal(s,fs.readFileSync('dist/'+p,'utf8'));}
console.log('PASS: 8-hour boundary examples, shared clock scale, 19-month cent-accurate 2026-only ledger, June/July boundary, seven separate diary examples, comparison/role content, no storage or autonomous animation.');
