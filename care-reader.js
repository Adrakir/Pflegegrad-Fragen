/* Public-text speech only. The injected adapter keeps browser lifecycle testable. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CareReader=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const tidy=text=>String(text??'').replace(/\s+/gu,' ').trim();
function spokenText(text){
 return tidy(text)
  .replace(/\[(?:\d[\d\s,–-]*|NI|VP|KP|EB|TN|ML|Ablauf|Quelle)\]/g,' ')
  .replace(/\bGdB\b/g,'Grad der Behinderung')
  .replace(/\bz\.\s?B\./g,'zum Beispiel').replace(/\bu\.\s?a\./g,'unter anderem')
  .replace(/\bbzw\./g,'beziehungsweise').replace(/\bggf\./g,'gegebenenfalls')
  .replace(/\bca\./g,'circa').replace(/\bStd\./g,'Stunden')
  .replace(/\bPG\s*([1-5])\b/g,'Pflegegrad $1')
  .replace(/\bSGB\s+XI\b/g,'Sozialgesetzbuch elf')
  .replace(/§§\s*/g,'Paragrafen ').replace(/§\s*/g,'Paragraf ')
  .replace(/€/g,' Euro').replace(/%/g,' Prozent')
  .replace(/(\d)\s*–\s*(?=\d)/g,'$1 bis ')
  .replace(/\s+/g,' ').trim();
}
function sentences(text){
 const s=tidy(text);if(!s)return[];
 if(typeof Intl!=='undefined'&&Intl.Segmenter)return Array.from(new Intl.Segmenter('de',{granularity:'sentence'}).segment(s),x=>x.segment.trim()).filter(Boolean);
 const result=[];let start=0;
 for(let i=0;i<s.length;i++)if(/[.!?]/.test(s[i])){let end=i+1;while(end<s.length&&/[.!?»”\"'’)]/.test(s[end]))end++;if(end===s.length||/\s/.test(s[end])){result.push(s.slice(start,end).trim());start=end;while(start<s.length&&/\s/.test(s[start]))start++;i=start-1;}}
 if(start<s.length)result.push(s.slice(start));return result.filter(Boolean);
}
// Pack complete sentences together. Only exceptionally long sentences need a
// secondary split, preferably after a comma/semicolon, otherwise between words.
function speechChunks(text,max=650){
 const out=[];let block='';
 function push(piece){if(block&&block.length+piece.length+1>max){out.push(block);block='';}block+=(block?' ':'')+piece;}
 for(const sentence of sentences(text)){
  if(sentence.length<=max){push(sentence);continue;}
  if(block){out.push(block);block='';}
  let rest=sentence;
  while(rest.length>max){let cut=-1;const front=rest.slice(0,max+1);for(const m of front.matchAll(/[,;:]\s+/g))if(m.index>max*.45)cut=m.index+1;
   if(cut<0)cut=front.lastIndexOf(' ');if(cut<=0)cut=rest.indexOf(' ');if(cut<0)break;
   out.push(rest.slice(0,cut).trim());rest=rest.slice(cut).trim();
  }if(rest)push(rest);
 }if(block)out.push(block);return out;
}
function voiceKey(v){return [v.voiceURI||v.name,v.lang,v.name].join('|');}
function germanVoices(list){
 const score=v=>(v.localService?1000:0)+(/premium|enhanced|natural|neural|verbessert|natürlich/i.test(v.name)?100:0)+(/^de[-_]DE$/i.test(v.lang)?30:0)+(v.default?5:0);
 const unique=new Map();for(const v of list||[])if(/^de(?:[-_]|$)/i.test(v.lang))unique.set(voiceKey(v),v);
 return [...unique.values()].sort((a,b)=>score(b)-score(a)||a.name.localeCompare(b.name,'de'));
}
function sentenceStart(text,position){let start=0,offset=0;for(const s of sentences(text)){const found=text.indexOf(s,offset);if(found>position)break;start=found;offset=found+s.length;}return Math.max(0,start);}
const preferenceKey='pflegegrad-reader-preferences-v1';
function readPreferences(value){if(!value||typeof value!=='object'||value.remember!==true)return{remember:false,voice:'auto',rate:1};return{remember:true,voice:typeof value.voice==='string'&&value.voice.length<=400?value.voice:'auto',rate:[.8,.9,1,1.1,1.2].includes(value.rate)?value.rate:1};}
function createPreferences(storage){return{load(){try{return readPreferences(JSON.parse(storage.getItem(preferenceKey)||'null'));}catch{return{remember:false,voice:'auto',rate:1};}},save(value){try{if(value.remember)storage.setItem(preferenceKey,JSON.stringify(readPreferences(value)));else storage.removeItem(preferenceKey);return{ok:true};}catch{return{ok:false};}}};}

function createReader({synth,makeUtterance,onChange=()=>{},setTimer=setTimeout,clearTimer=clearTimeout}){
 let parts=[],index=0,position=0,base=0,mode='idle',token=0,utterance=null,options={},timer=null,resumeTimer=null,nativePause=false,finishedWhilePaused=false,precise=false,snapshot=null,isPreview=false,error='';
 const available=!!synth&&typeof makeUtterance==='function';
 function clearTimers(){if(timer!==null)clearTimer(timer);if(resumeTimer!==null)clearTimer(resumeTimer);timer=resumeTimer=null;}
 function state(){return{available,mode,parts:[...parts],index,position,precise,preview:isPreview,error,total:parts.length,text:parts.join(' ')};}
 function emit(){onChange(state());}
 function invalidate(){token++;clearTimers();utterance=null;if(synth)synth.cancel();}
 function fail(code){invalidate();if(isPreview&&restorePreview()){error=code||'synthesis-failed';emit();return;}mode='error';error=code||'synthesis-failed';emit();}
 function timeout(ms,code,current){if(timer!==null)clearTimer(timer);timer=setTimer(()=>{if(current===token&&mode!=='paused')fail(code);},ms);}
 function restorePreview(){if(!snapshot)return false;const saved=snapshot;snapshot=null;isPreview=false;parts=saved.parts;index=saved.index;position=saved.position;precise=saved.precise;options=saved.options;mode=saved.mode==='idle'?'idle':saved.mode==='ended'?'ended':'paused';nativePause=false;finishedWhilePaused=false;error='';emit();return true;}
 function play(offset=0){
  if(!available||!parts[index])return;
  clearTimers();const current=++token;base=offset;position=offset;finishedWhilePaused=false;nativePause=false;mode='starting';error='';
  if(synth.paused)synth.resume();
  utterance=makeUtterance(parts[index].slice(offset));const spoken=utterance;spoken.lang=options.voice?.lang||'de-DE';spoken.rate=options.rate||1;spoken.pitch=1;if(options.voice)spoken.voice=options.voice;
  spoken.onstart=()=>{if(current!==token||mode==='paused')return;mode='speaking';timeout(120000,'stalled',current);emit();};
  spoken.onpause=e=>{if(current!==token)return;if(Number.isFinite(e.charIndex)&&e.charIndex>0&&e.charIndex<spoken.text.length){position=base+e.charIndex;precise=true;}emit();};
  spoken.onboundary=e=>{if(current!==token||mode==='paused')return;if(Number.isFinite(e.charIndex)&&e.charIndex>=0&&e.charIndex<spoken.text.length){position=base+e.charIndex;precise=true;}timeout(120000,'stalled',current);emit();};
  spoken.onend=()=>{if(current!==token)return;clearTimers();utterance=null;position=0;index++;precise=false;
   if(index>=parts.length){if(isPreview&&restorePreview())return;mode='ended';index=Math.max(0,parts.length-1);position=parts[index]?.length||0;emit();return;}
   if(mode==='paused'){finishedWhilePaused=true;nativePause=false;emit();return;}play();
  };
  spoken.onerror=e=>{if(current!==token)return;if(isPreview){const code=e.error;invalidate();restorePreview();error=code||'synthesis-failed';emit();return;}fail(e.error);};
  timeout(12000,'not-started',current);emit();try{synth.speak(spoken);}catch{fail('synthesis-failed');}
 }
 function load(text,nextOptions={}){snapshot=null;isPreview=false;invalidate();parts=speechChunks(spokenText(text));index=0;position=0;precise=false;options={...nextOptions};mode='idle';error='';emit();}
 function start(text,nextOptions={}){load(text,nextOptions);if(!available){mode='error';error='unsupported';emit();return;}if(parts.length)play();}
 function pause(){if(!['starting','speaking'].includes(mode))return;clearTimers();mode='paused';nativePause=false;try{synth.pause();nativePause=synth.paused===true;}catch{}
  if(!nativePause){const at=sentenceStart(parts[index],position);invalidate();position=at;}emit();
 }
 function resume(){if(mode!=='paused'||!available)return;
  if(nativePause&&utterance&&!finishedWhilePaused){mode='speaking';const current=token;try{synth.resume();}catch{nativePause=false;}
   if(nativePause){timeout(120000,'stalled',current);resumeTimer=setTimer(()=>{if(current===token&&mode==='speaking'&&(synth.paused||synth.speaking===false)){const at=sentenceStart(parts[index],position);invalidate();play(at);}},1800);emit();return;}
  }
  const at=finishedWhilePaused?0:sentenceStart(parts[index],position);invalidate();play(at);
 }
 function stop(){if(isPreview){invalidate();restorePreview();return;}snapshot=null;isPreview=false;invalidate();mode='idle';position=0;index=0;precise=false;error='';emit();}
 function seek(next){if(!Number.isInteger(next)||next<0||next>=parts.length)return;if(isPreview){invalidate();restorePreview();}invalidate();index=next;position=0;precise=false;play();}
 function changeOptions(next){if(isPreview){invalidate();restorePreview();}options={...next};if(['starting','speaking','paused','error'].includes(mode)){const at=sentenceStart(parts[index]||'',position);invalidate();position=at;mode='paused';nativePause=false;error='';emit();}}
 function preview(text,nextOptions={}){
  const saved=snapshot||{parts:[...parts],index,position:sentenceStart(parts[index]||'',position),precise,options:{...options},mode};
  invalidate();snapshot=saved;isPreview=true;parts=speechChunks(spokenText(text));index=0;position=0;precise=false;options={...nextOptions};if(available&&parts.length)play();else{restorePreview();error='unsupported';emit();}
 }
 function retry(){if(isPreview){invalidate();restorePreview();return;}if(parts.length){const at=sentenceStart(parts[index],position);invalidate();play(at);}}
 return{load,start,pause,resume,stop,seek,changeOptions,preview,retry,state};
}
return{spokenText,sentences,speechChunks,germanVoices,voiceKey,sentenceStart,preferenceKey,readPreferences,createPreferences,createReader};
});
