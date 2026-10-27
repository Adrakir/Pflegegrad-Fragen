"""Build a public-only content index and a versioned offline shell."""
import json,re,subprocess,hashlib,shutil
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
from PIL import Image
ROOT=Path(__file__).parent
class Node:
 def __init__(self,tag='',attrs=()): self.tag=tag;self.attrs=dict(attrs);self.children=[]
 def all(self,tag=None):
  for n in self.children:
   if isinstance(n,Node):
    if tag is None or n.tag==tag: yield n
    yield from n.all(tag)
 def text(self):
  if 'data-private' in self.attrs:return ''
  if self.tag in {'svg','script','style','form','input','textarea','select','button','nav','footer','noscript'}: return ''
  return ' '.join(n.text() if isinstance(n,Node) else n for n in self.children)
class Parse(HTMLParser):
 def __init__(self,text):
  super().__init__(convert_charrefs=True);self.root=Node('root');self.stack=[self.root];self.feed(text)
 def handle_starttag(self,t,a):
  n=Node(t,a);self.stack[-1].children.append(n)
  if t not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:self.stack.append(n)
 def handle_startendtag(self,t,a):self.stack[-1].children.append(Node(t,a))
 def handle_endtag(self,t):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==t:self.stack=self.stack[:i];break
 def handle_data(self,d):self.stack[-1].children.append(d)
def clean(s):return re.sub(r'\s+',' ',s).strip()
def plaintext(html):return clean(Parse(html).root.text())
def node_json(code):return json.loads(subprocess.check_output(['node','-e',code],cwd=ROOT,text=True))
records=[]
def add(id,title,text,url,group,tags=''):
 records.append(dict(id=id,title=title,text=clean(text),url=url,group=group,tags=tags))
for page,group in [('index.html','Pflegewissen'),('abrechnung.html','Abrechnung'),('gdb.html','GdB')]:
 tree=Parse((ROOT/page).read_text()).root
 for n in tree.all('section'):
  id=n.attrs.get('id');heads=list(n.all('h2'))
  if not id or not heads or id in {'faq','quellen'}:continue
  add(page+'-'+id,clean(heads[0].text()),n.text(),('./' if page=='index.html' else './'+page)+'#'+id,group,'')
gdb=json.loads((ROOT/'gdb-data.json').read_text())
for row in gdb['comparisons']:add('gdb-compare-'+row['id'],'GdB und Pflegegrad: '+row['title'],' '.join([row['scene'],row['gdb'],row['care']]),'./gdb.html#gdb-vergleich-'+row['id'],'GdB')
for row in gdb['overlaps']:add('gdb-overlap-'+row['id'],'Gesamt-GdB: '+row['title'],row['explanation'],'./gdb.html#gdb-zusammenspiel-'+row['id'],'GdB')
for row in gdb['cases']:add('gdb-case-'+row['id'],'GdB-Beispiel: '+row['title'],' '.join([row['person'],row['situation'],'Zu allgemein: '+row['vague'],'Konkretes erfundenes Beispiel: '+row['concrete'],*row['evidence'],row['lesson']]),'./gdb.html#gdb-fall-'+row['id'],'GdB')
for row in gdb['marks']:add('gdb-mark-'+row['id'],'Merkzeichen '+row['id']+': '+row['title'],row['text']+' '+row['next'],'./gdb.html#gdb-merkzeichen-'+row['id'],'GdB')
for i,row in enumerate(gdb['faqs'],1):add('gdb-faq-'+str(i),row[0],row[1],'./gdb.html#gdb-faq-'+str(i),'GdB')
workspace=Parse((ROOT/'meine-vorbereitung.html').read_text()).root
public_guide=next(n for n in workspace.all('section') if n.attrs.get('id')=='workspace-guide')
add('workspace-guide','Meine Vorbereitung: Aufgaben und Unterlagen',public_guide.text(),'./meine-vorbereitung.html#workspace-guide','Vorbereitung')
for i,n in enumerate((n for n in Parse((ROOT/'faq.html.inc').read_text()).root.all('details')),1):
 title=next(n.all('summary')).text();add('faq-'+str(i),title,n.text(),'./#faq-q-'+str(i),'FAQ')
questions=json.loads((ROOT/'questions.json').read_text())
for i,q in enumerate(questions,1): add('question-'+str(i),q['q'],'Fiktive Beispielantwort. '+q['a'],'./fallbeispiel.html?frage='+str(i)+'#q-'+str(i),'Fallbeispiel',q['c'])
# Reuse the five published service descriptions verbatim; no eligibility calculation.
services=node_json("const fs=require('fs'),vm=require('vm');const s=fs.readFileSync('abrechnung.js','utf8');const a=s.indexOf('const SERVICES=')+15,b=s.indexOf('\\n};\\nfunction renderService',a)+2;process.stdout.write(JSON.stringify(vm.runInNewContext('('+s.slice(a,b)+')',{}, {timeout:1000}))); ")
for id,s in services.items():
 add('service-'+id,s['title']+' abrechnen',' '.join([s['budget'],s['body'],*s['steps'],s['special'],s['extra'],s['deadline'],s['caseTitle'],s['example'],s['equation'],s['rest']]),'./abrechnung.html?leistung='+id+'#leistungen','Leistung',s['title']+' Belege Formular Rechnung Kosten')
for c in json.loads((ROOT/'online-applications.json').read_text())['insurers']:
 add('online-'+c['id'],c['name']+': Online-Anträge',c['info']+' '+' '.join(l['label']+' '+l['note'] for l in c['links']),'./abrechnung.html#online-'+c['id'],'Pflegekasse','Antrag Pflegekasse Versicherung Abrechnung Formular')
extras=node_json("const X=require('./care-explain.js'),L=require('./care-learning.js');process.stdout.write(JSON.stringify([['calendar',X.reliefCalendar()],['timeline',X.vpTimeline()],['week',X.weekExample()],['compare',X.answerComparison()],['roles',X.rolePicture()],['diary',L.diaryExample()],['invoice',L.invoiceExample()],['notice',L.noticeExample()],['neighbour',L.neighbourCheck()]]));")
extra_info={'calendar':('Entlastungsbetrag im Guthabenkalender','./abrechnung.html#guthabenkalender'),'timeline':('Verhinderungsdauer und Hilfseinsatz','./abrechnung.html#zeitstrahlen'),'week':('Schwankende Tagesform dokumentieren','./pflegegradrechner.html#vorbereitung'),'compare':('Antworten konkret beschreiben','./fallbeispiel.html#antwortbeispiele'),'roles':('Antrag selbst stellen oder vertreten','./#antragsrollen'),'diary':('Pflegetagebuch mit ausgefülltem Beispiel','./pflegegradrechner.html#vorbereitung'),'invoice':('Musterrechnung verstehen','./abrechnung.html#weg'),'notice':('Pflegebescheid verstehen','./#hoeherstufung'),'neighbour':('Nachbarschaftshilfe in Niedersachsen','./abrechnung.html#nachbarschaft')}
for id,html in extras:
 title,url=extra_info[id];add('example-'+id,title,plaintext(html),url,'Beispiel','Nachbar hilft Nachbarschaftshilfe' if id=='neighbour' else '')
for module in json.loads((ROOT/'calculator-data.json').read_text())['modules']:
 for item in module['items']:
  add('criterion-'+item['id'],'Rechner: '+item['label'],item['hint']+' Fiktive Beispiele: '+' '.join(x['text'] for x in item.get('examples',[])),'./pflegegradrechner.html?kriterium='+item['id']+'#rechner','Rechner',module['title'])
add('calculator','Pflegegradrechner','Unverbindliche Selbsteinschätzung für Erwachsene mit 64 Kriterien in sechs Modulen. Antworten selbst auswählen, Unsicherheiten markieren und persönliche Angaben nur auf Wunsch im Browser speichern. Es wird kein Pflegegrad festgestellt.','./pflegegradrechner.html','Rechner','Punkte berechnen Pflegegrad Test')
add('planner','Abrechnung vorbereiten','Leistung, Pflegegrad, Pflegekasse und Zahlungsweg wählen. Passende Unterlagen, PDF-Bogen und offizielle Einreichungswege zusammenstellen. Keine Erstattungszusage.','./abrechnung.html#abrechnung-plan','Abrechnung','Checkliste Antrag Belege Formulare')
# Deep links open the original public examples and provider cards.
for n in Parse((ROOT/'abrechnung.html').read_text()).root.all():
 id=n.attrs.get('id','')
 if not (id.startswith('haus-fall-') or id.startswith('firma-')):continue
 head=next(n.all('summary' if id.startswith('haus-fall-') else 'h3'))
 add('local-'+id,clean(head.text()),n.text(),'./abrechnung.html#'+id,'Beispiel' if id.startswith('haus-fall-') else 'Firmen vor Ort','Fenster Garten Reinigung Fahrdienst Hannover Osnabrück')
release={'version':'2026.10.27.3','date':'27.10.2026','changes':[
{'title':'Fenster, Garten und Fahrdienste','items':['Eigener Bereich mit niedersächsischen Leistungsgrenzen und acht erfundenen Beispielen.','Fahrdienst, Begleitung und verordnete Krankenfahrt getrennt erklärt.','Zehn konkrete Firmen in Hannover und Osnabrück mit Kontakt, Quellen und getrennten Abrechnungshinweisen.']},
{'title':'GdB und eigene Vorbereitung','items':['Neuer GdB-Leitfaden für Niedersachsen mit Bildern, startbaren Abläufen, vier erfundenen Fallbeispielen und acht Merkzeichen.','Eigene Aufgaben, selbst eingetragene Termine und Unterlagenübersicht; Speicherung nur auf Wunsch.','Übersicht drucken sowie Sicherungen prüfen und wieder laden.','Stimme und Lesetempo auf Wunsch über Seitenwechsel hinweg merken.','Öffentliches Quellenverzeichnis und automatisierte Qualitäts- und Linkprüfungen.']},
{'title':'Vorlesen verbessert','items':['Zusammenhängende Sätze statt Trennung mitten im Satz.','Deutsche Gerätestimmen bevorzugt, Stimmenprobe mit erhaltener Lesestelle.','Pause und Fortsetzen, sichtbare Lesepassage und Vor-/Zurückspringen.','Stimme und Tempo ändern, ohne den ganzen Abschnitt neu beginnen zu müssen.']},
{'title':'Schneller zum passenden Inhalt','items':['Appweite Suche in Erklärungen, FAQ, 100 fiktiven Fragen und Kassenanträgen.','Feste Navigation für die vier Hauptbereiche auf schmalen Bildschirmen.','Abrechnungsvorbereitung mit Belegliste, PDF-Bogen und Einreichungsweg.']},
{'title':'Lesen und Hören','items':['Vorlesen öffentlicher Abschnitte mit Stimmenprobe, Geschwindigkeit, Pause und Stopp.','Eigene Antworten und Tagebucheinträge werden nicht für Suche oder Vorlesen verwendet.']},
{'title':'Offline und Zugänglichkeit','items':['Optionales Offline-Lesen öffentlicher Inhalte und PDF-Bögen.','Installationshilfe für den Startbildschirm.','Verbesserte Fokusführung, Formularbeschriftungen und Tastaturbedienung.']},
{'title':'Bereits ergänzt','items':['Interaktive Zeitstrahlen, Guthabenkalender, Bildbeispiele und Antwortvergleiche.','Korrigierte Besuchs- und Postanschriften sowie offizielle Online-Anträge von acht Pflegekassen.']}]}
public={'release':release,'records':records,'services':{k:{'title':s['title'],'form':s['form'],'steps':s['steps']} for k,s in services.items()},'insurers':[{'id':c['onlineId'],'name':c['name']} for c in json.loads((ROOT/'billing-data.json').read_text())['contacts']]}
(ROOT/'app-public.json').write_text(json.dumps(public,ensure_ascii=False,separators=(',',':'))+'\n')
for size in [192,512]:
 im=Image.open(ROOT/'assets/weidenherz-logo.png').convert('RGB');im.thumbnail((size-24,size-24));canvas=Image.new('RGB',(size,size),'#f7f6f1');canvas.paste(im,((size-im.width)//2,(size-im.height)//2));canvas.save(ROOT/f'assets/app-icon-{size}.png')
manifest={'id':'./','name':'Pflegegrad-Fragen · Andreas und Ricarda','short_name':'Pflegegrad','lang':'de','start_url':'./','scope':'./','display':'standalone','background_color':'#f7f6f1','theme_color':'#504260','icons':[{'src':f'./assets/app-icon-{s}.png','sizes':f'{s}x{s}','type':'image/png','purpose':'any'} for s in [192,512]]}
(ROOT/'manifest.webmanifest').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
for asset in ['care-reader.js','app-access.js','app-access.css','app-public.json','source-registry.json','manifest.webmanifest','assets/app-icon-192.png','assets/app-icon-512.png']:
 shutil.copy2(ROOT/asset,ROOT/'dist'/asset)
reader_js=hashlib.sha256((ROOT/'care-reader.js').read_bytes()).hexdigest()[:12]
js=hashlib.sha256((ROOT/'app-access.js').read_bytes()).hexdigest()[:12];css=hashlib.sha256((ROOT/'app-access.css').read_bytes()).hexdigest()[:12]
for page in ['index.html','pflegewissen.html','fallbeispiel.html','pflegegradrechner.html','abrechnung.html','gdb.html','meine-vorbereitung.html']:
 html=(ROOT/page).read_text().replace('</head>',f'<link rel="stylesheet" href="./app-access.css?v={css}"><link rel="manifest" href="./manifest.webmanifest"><link rel="apple-touch-icon" href="./assets/app-icon-192.png"></head>').replace('</body>',f'<script src="./care-reader.js?v={reader_js}"></script><script src="./app-access.js?v={js}"></script></body>')
 (ROOT/page).write_text(html);(ROOT/'dist'/page).write_text(html)
# Cache only an explicit public allowlist; never cache arbitrary requests or runtime form state.
pages=['./','./index.html','./pflegewissen.html','./fallbeispiel.html','./pflegegradrechner.html','./abrechnung.html','./gdb.html','./meine-vorbereitung.html']
assets=set(['./app-public.json','./manifest.webmanifest','./assets/app-icon-192.png','./assets/app-icon-512.png'])
for page in pages[1:]:
 for url in re.findall(r'(?:src|href)="(\./[^"#]+)"',(ROOT/page[2:]).read_text()):
  file=url.split('?',1)[0][2:]
  if (ROOT/file).is_file() and not file.endswith('.html'):assets.add(url)
for f in (ROOT/'formulare').glob('*.pdf'):assets.add('./formulare/'+f.name)
allowlist=pages+sorted(assets)
version=hashlib.sha256(''.join(url+hashlib.sha256((ROOT/('index.html' if url=='./' else url[2:].split('?')[0])).read_bytes()).hexdigest() for url in allowlist).encode()).hexdigest()[:16]
sw=(ROOT/'sw-template.js').read_text().replace('__CACHE_VERSION__',version).replace('__PRECACHE__',json.dumps(allowlist))
(ROOT/'sw.js').write_text(sw);(ROOT/'dist/sw.js').write_text(sw)
print(f'App-Komfort: {len(records)} öffentliche Such-/Vorleseinträge, Abrechnungsassistent, Navigation, {len(allowlist)} optionale Offline-Dateien.')
