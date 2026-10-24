(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./calculator-engine.js'));else root.CareSession=factory(root.CareCalculator);})(typeof globalThis!=='undefined'?globalThis:this,function(E){
'use strict';
const APP='pflegegrad-fragen-rechner',SCHEMA=2;
function object(v){return!!v&&typeof v==='object'&&!Array.isArray(v);}
function normalize(data,input){if(!object(input))throw Error('Die Sicherung enthält keine lesbaren Rechnerdaten.');const settings={duration:'',special:''};const source=object(input.settings)?input.settings:input;for(const key of ['duration','special']){const allowed=key==='duration'?['yes','no','unknown','lifespan']:['yes','no','unknown'];if(allowed.includes(source[key]))settings[key]=source[key];}return{answers:E.sanitizeDraft(data,input.answers),settings,step:Number.isInteger(input.step)&&input.step>=0&&input.step<=7?input.step:0};}
function stored(data,input){if(!object(input)||input.enabled!==true||![1,2].includes(input.version))return null;return normalize(data,input);}
function backup(data,state){return{app:APP,schemaVersion:SCHEMA,exportedAt:new Date().toISOString(),data:normalize(data,state)};}
function read(data,input){if(!object(input)||input.app!==APP)throw Error('Das ist keine Sicherung des Pflegegradrechners. Sicherungen des Fallbeispiels oder des Tagebuchs bitte dort laden.');if(input.schemaVersion!==SCHEMA)throw Error('Diese Sicherungsversion wird nicht unterstützt. Bitte die passende App-Version verwenden.');if(!object(input.data)||!object(input.data.answers))throw Error('Die Sicherungsdatei ist unvollständig. Die bisherigen Antworten bleiben erhalten.');return normalize(data,input.data);}
return{APP,SCHEMA,normalize,stored,backup,read};
});
