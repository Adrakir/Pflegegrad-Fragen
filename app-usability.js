/* Shared reading aids. Only visual preferences are saved here. */
(()=>{'use strict';
const key='pflegegrad-fragen-v1',root=document.documentElement;
const dictionary={
 'Sachleistungen':'Die Pflegekasse bezahlt zugelassene Dienste für vereinbarte Pflegeleistungen bis zum jeweiligen Anspruch. Der Betrag wird nicht als frei verfügbares Pflegegeld ausgezahlt.',
 'Abtretung':'Sie erlauben einem Anbieter, einen bestimmten Erstattungsanspruch unmittelbar bei Ihrer Pflegekasse geltend zu machen. Umfang und Zeitraum lesen und eine Kopie behalten. Eine Abtretung ist keine Garantie, dass alle Kosten übernommen werden.',
 'teilstationär':'Sie werden zeitweise in einer zugelassenen Einrichtung versorgt, zum Beispiel tagsüber oder nachts. In der übrigen Zeit leben Sie zu Hause.',
 'Entlastungsbetrag':'Ein zweckgebundener Betrag für geeignete Hilfen. Die Kasse erstattet belegte Kosten im verfügbaren Rahmen. Er wird nicht automatisch als zusätzliches frei verfügbares Geld überwiesen.',
 'Kombinationsleistung':'Sie nutzen einen Teil der ambulanten Sachleistungen und erhalten den entsprechenden Restanteil des Pflegegeldes. Entscheidend ist der verbrauchte Prozentsatz des Sachleistungsanspruchs.',
 'Eigenanteil':'Der Teil der Kosten, der nach den übernommenen Beträgen übrig bleibt. Ob weitere Hilfen dafür infrage kommen, muss gesondert geprüft werden.',
 'Verhinderungspflege':'Eine andere geeignete Person oder ein Dienst übernimmt notwendige Ersatzpflege, weil die private Pflegeperson vorübergehend verhindert ist. Sie teilt sich einen Jahresbetrag mit der Kurzzeitpflege.',
 'Kurzzeitpflege':'Eine vorübergehende vollstationäre Versorgung, wenn die Pflege zu Hause und teilstationäre Hilfe nicht ausreichen. Pflegekosten und weitere Eigenkosten werden getrennt betrachtet.',
 'Höherstufung':'Eine bereits pflegebedürftige Person beantragt wegen gestiegenen Hilfebedarfs einen höheren Pflegegrad. Die aktuelle Selbstständigkeit wird erneut geprüft.',
 'Widerspruch':'Sie wenden sich gegen einen Bescheid der gesetzlichen Pflegekasse. Frist und zulässige Form beachten. Ein neuer Antrag ersetzt den fristgerechten Widerspruch nicht.'
};
function stored(){try{return JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{return{};}}
function apply(){const p=stored();root.classList.toggle('large',p.large===true);root.classList.toggle('contrast',p.contrast===true);for(const [id,k]of [['fontSize','large'],['large','large'],['contrast','contrast']])document.getElementById(id)?.setAttribute('aria-pressed',String(p[k]===true));}
function toggle(k){const p=stored();p[k]=!root.classList.contains(k);try{localStorage.setItem(key,JSON.stringify(p));}catch{root.classList.toggle(k,p[k]);for(const id of k==='large'?['large','fontSize']:['contrast'])document.getElementById(id)?.setAttribute('aria-pressed',String(p[k]));return;}apply();}
// Existing pages already own their controls. Billing uses the same preference key.
if(document.body.dataset.billing==='true'){
 document.getElementById('large')?.addEventListener('click',()=>toggle('large'));
 document.getElementById('contrast')?.addEventListener('click',()=>toggle('contrast'));
}
apply();window.addEventListener('storage',e=>{if(e.key===key)apply();});
const dialog=document.createElement('dialog');dialog.className='term-dialog';dialog.setAttribute('aria-labelledby','termTitle');
dialog.innerHTML='<h2 id="termTitle">Begriffe verständlich erklärt</h2><div id="termContent"></div><button class="subtle dialog-close" type="button">Schließen</button>';
document.body.append(dialog);let opener;
function show(term,button){opener=button;const content=dialog.querySelector('#termContent');content.replaceChildren();dialog.querySelector('h2').textContent=term||'Begriffe verständlich erklärt';if(term){const p=document.createElement('p');p.textContent=dictionary[term];content.append(p);}else{const dl=document.createElement('dl');for(const [k,v]of Object.entries(dictionary)){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=v;dl.append(dt,dd);}content.append(dl);}dialog.showModal();}
dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>opener?.focus());
const tools=document.createElement('div');tools.className='usability-tools';const button=document.createElement('button');button.className='glossary-button';button.type='button';button.textContent='Begriffe erklären';button.setAttribute('aria-haspopup','dialog');button.addEventListener('click',()=>show(null,button));const tip=document.createElement('p');tip.textContent='Unterstrichene Fachbegriffe können Sie antippen.';tools.append(button,tip);document.querySelector('.section-nav')?.after(tools);
// Explain complete words only, including content replaced by page controls.
function matchTerm(text,term){const re=new RegExp('(^|[^\\p{L}])('+term+')(?=$|[^\\p{L}])','iu'),m=re.exec(text);return m?{index:m.index+m[1].length,text:m[2]}:null;}
const aliases={'Sachleistungen':['Sachleistungen','Sachleistung','Pflegesachleistungen'],'Eigenanteil':['Eigenanteil','Eigenanteile'],'teilstationär':['teilstationär','teilstationäre','teilstationären']};
function annotate(region){for(const term of Object.keys(dictionary)){if(region.querySelector('[data-glossary-term="'+term+'"]'))continue;
 const walker=document.createTreeWalker(region,NodeFilter.SHOW_TEXT);let node,match;
 while(walker.nextNode()){const candidate=walker.currentNode;if(candidate.parentElement.closest('a,button,label,summary,h1,h2,h3,h4,script,style,textarea,select,svg,dialog,output,code,pre,[role="status"],[aria-live]'))continue;
  for(const name of aliases[term]||[term]){match=matchTerm(candidate.textContent,name);if(match){node=candidate;break;}}if(node)break;
 }
 if(!node)continue;const fragment=document.createDocumentFragment(),b=document.createElement('button');b.type='button';b.className='term-button';b.dataset.glossaryTerm=term;b.textContent=match.text;b.setAttribute('aria-label',match.text+' erklären');b.setAttribute('aria-haspopup','dialog');b.addEventListener('click',()=>show(term,b));fragment.append(document.createTextNode(node.textContent.slice(0,match.index)),b,document.createTextNode(node.textContent.slice(match.index+match.text.length)));node.replaceWith(fragment);
}}
const main=document.querySelector('main');if(main)annotate(main);
for(const selector of ['#gradeCards','#gradeExtras','#servicePanel','#calcScreen']){const region=document.querySelector(selector);if(!region)continue;let pending=false;const observer=new MutationObserver(()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;annotate(region);});});observer.observe(region,{childList:true,subtree:true});}

document.querySelectorAll('[data-decision]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-decision]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelectorAll('[data-decision-answer]').forEach(x=>x.hidden=x.dataset.decisionAnswer!==b.dataset.decision);}));
function openAnchor(){const hash=location.hash.slice(1);if(!hash)return;const el=document.getElementById(hash);if(!el)return;let p=el.parentElement,opened=false;while(p){if(p.tagName==='DETAILS'&&!p.open){p.open=true;opened=true;}p=p.parentElement;}if(opened)el.scrollIntoView({block:'start',behavior:'instant'});}
openAnchor();window.addEventListener('hashchange',openAnchor);
let printState;
window.addEventListener('beforeprint',()=>{printState=[...document.querySelectorAll('.topic-details')].map(d=>[d,d.open]);printState.forEach(([d])=>d.open=true);});
window.addEventListener('afterprint',()=>{printState?.forEach(([d,open])=>d.open=open);printState=undefined;});
const back=document.createElement('a');back.className='back-top';back.href='#seitenanfang';back.textContent='Zurück zum Anfang';document.body.id='seitenanfang';document.querySelector('main')?.append(back);
})();
