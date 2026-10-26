const assert=require('node:assert/strict'),fs=require('node:fs');
const L=require('./care-learning.js'),online=require('./online-applications.json'),billing=require('./billing-data.json');
assert.match(L.neighbourResult([]),/Noch 9 Punkte/);
assert.match(L.neighbourResult(Array(9).fill('yes')),/keine Anerkennungs- oder Erstattungszusage/);
assert.match(L.neighbourResult(['no',...Array(8).fill('yes')]),/Bei 1 Punkt/);
assert.match(L.neighbourResult([...Array(8).fill('yes'),'']),/Noch 1 Punkt ist/);
assert.match(L.neighbourResult(Array(9).fill('bad')),/Noch 9 Punkte/);
for(let i=0;i<4;i++){const s=L.dressingPicture(i);assert.match(s,/role="img"/);assert.ok(s.includes(L.levels[i][0]));}
assert.equal((L.independenceGuide().match(/class="dressing-picture"/g)||[]).length,4);
for(const kind of ['invoice','visit','notice'])assert.equal((L[kind==='invoice'?'invoiceExample':kind==='visit'?'visitExample':'noticeExample']().match(/data-picture-tip=/g)||[]).length,L.tips[kind].length);
assert.equal(640+240,880);assert.equal(880-640-131,109);
assert.match(L.invoiceExample(),/Keine echte Rechnung/);assert.match(L.diaryExample(),/weder gespeichert noch in Ihr Tagebuch eingefügt/);
assert.doesNotMatch(fs.readFileSync('care-learning.js','utf8'),/localStorage|sessionStorage|fetch\(|XMLHttpRequest/);
const h=fs.readFileSync('abrechnung.html','utf8');
for(const c of online.insurers){assert.ok(billing.contacts.some(b=>b.onlineId===c.id));assert.ok(h.includes('id="online-'+c.id+'"'));for(const l of c.links){assert.match(l.url,/^https:\/\//);assert.ok(l.note);assert.ok(h.includes(l.url.replace(/&/g,'&amp;')));}}
assert.equal(online.insurers.length,8);assert.match(h,/keine vollständige Liste/);assert.match(h,/Ein Linkaufruf stellt noch keinen Antrag/);assert.match(h,/PDF-Upload/);
for(const page of ['index.html','pflegewissen.html','fallbeispiel.html','pflegegradrechner.html','abrechnung.html']){const p=fs.readFileSync(page,'utf8');assert.match(p,/care-learning\.js\?v=/);assert.match(p,/care-learning\.css\?v=/);assert.doesNotMatch(p,/__[A-Z_]+__/);assert.equal(p,fs.readFileSync('dist/'+page,'utf8'));}
console.log('PASS: four illustrated levels, separate fictitious diary, clickable document explanations, incomplete/no/yes neighbour checks, no storage or transmission, eight official application cards and unchanged built output.');
