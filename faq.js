/* FAQ search stays on this page; no storage or network requests. */
(()=>{'use strict';
const section=document.querySelector('#faq');if(!section)return;
const $=s=>section.querySelector(s),items=Array.from(section.querySelectorAll('#faqList details'));
const search=$('#faqSearch'),topic=$('#faqTopic');
const normalize=s=>s.toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');
const text=new Map(items.map(item=>[item,normalize(item.textContent)]));
function filter(){const words=normalize(search.value.trim()).split(/\s+/).filter(Boolean);let count=0;for(const item of items){const show=(!topic.value||item.dataset.topic===topic.value)&&words.every(word=>text.get(item).includes(word));item.hidden=!show;if(show){count++;if(words.length)item.open=true;}}$('#faqCount').textContent=`${count} von ${items.length} Fragen angezeigt`;$('#faqEmpty').hidden=count>0;$('#faqExpand').disabled=count===0;$('#faqCollapse').disabled=count===0;}
search.addEventListener('input',filter);search.addEventListener('search',filter);topic.addEventListener('change',filter);
$('#faqReset').addEventListener('click',()=>{search.value='';topic.value='';items.forEach(item=>item.open=false);filter();search.focus();});
$('#faqExpand').addEventListener('click',()=>items.filter(item=>!item.hidden).forEach(item=>item.open=true));
$('#faqCollapse').addEventListener('click',()=>items.filter(item=>!item.hidden).forEach(item=>item.open=false));
let beforePrint;
window.addEventListener('beforeprint',()=>{if(beforePrint)return;beforePrint=items.map(item=>item.open);items.forEach(item=>item.open=true);});
window.addEventListener('afterprint',()=>{if(!beforePrint)return;items.forEach((item,i)=>item.open=beforePrint[i]);beforePrint=undefined;});
$('#faqControls').hidden=false;filter();
})();
