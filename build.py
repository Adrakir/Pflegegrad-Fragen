import json
import runpy
import hashlib
import shutil
from html import escape
from pathlib import Path

root=Path(__file__).parent
questions=json.loads((root/'questions.json').read_text())
assert len(questions)==100 and len({q['q'] for q in questions})==100
template=(root/'template.html').read_text()
data=json.dumps([dict(q,id=i+1) for i,q in enumerate(questions)],ensure_ascii=False).replace('</','<\\/')
html=template.replace('__QUESTIONS__',data)
(root/'dist').mkdir(exist_ok=True)
(root/'dist/fallbeispiel.html').write_text(html)
(root/'fallbeispiel.html').write_text(html)
care=json.loads((root/'care-benefits.json').read_text())
assert [g['grade'] for g in care['grades']]==[1,2,3,4,5]
base_css=template.split('<style>',1)[1].split('</style>',1)[0]
guide=(root/'care-template.html').read_text().replace('__BASE_CSS__',base_css).replace('__REASSESSMENT_HTML__',(root/'reassessment.html.inc').read_text()).replace('__FAQ_HTML__',(root/'faq.html.inc').read_text()).replace('__FAQ_CSS__',(root/'faq.css').read_text()).replace('__CARE_DATA__',json.dumps(care,ensure_ascii=False))
faq_digest=hashlib.sha256((root/'faq.js').read_bytes()).hexdigest()[:12]
guide=guide.replace('src="./faq.js"','src="./faq.js?v='+faq_digest+'"')
(root/'dist/faq.js').write_text((root/'faq.js').read_text())
(root/'pflegewissen.html').write_text(guide)
(root/'dist/pflegewissen.html').write_text(guide)
(root/'index.html').write_text(guide)
(root/'dist/index.html').write_text(guide)
print('Pflegegrad-Fragen: 100 Fragen plus Pflegegrade & Leistungen 2026 erstellt.')

calculator=json.loads((root/'calculator-data.json').read_text())
assert sum(len(m['items']) for m in calculator['modules'])==64
calc=(root/'calculator-template.html').read_text().replace('__WEIGHTING_HTML__',(root/'weighting.html.inc').read_text()).replace('__BASE_CSS__',base_css).replace('__PREPARATION_CSS__',(root/'preparation.css').read_text()).replace('__PREPARATION_HTML__',(root/'preparation.html.inc').read_text()).replace('__CALCULATOR_DATA__',json.dumps(calculator,ensure_ascii=False).replace('</','<\\/')).replace('__CARE_DATA__',json.dumps(care,ensure_ascii=False))
for script in ['calculator-engine.js','calculator-session.js','calculator.js','preparation-engine.js','preparation.js']:
 digest=hashlib.sha256((root/script).read_bytes()).hexdigest()[:12]
 calc=calc.replace('src="./'+script+'"','src="./'+script+'?v='+digest+'"')
(root/'pflegegradrechner.html').write_text(calc)
(root/'dist/pflegegradrechner.html').write_text(calc)
for asset in ['calculator-engine.js','calculator-session.js','calculator.js','preparation-engine.js','preparation.js']:
 (root/'dist'/asset).write_text((root/asset).read_text())
print('Pflegegradrechner: 64 Kriterien und sechs Module erstellt.')

(root/'dist/assets').mkdir(exist_ok=True)
shutil.copy2(root/'assets/weidenherz-logo.png',root/'dist/assets/weidenherz-logo.png')

# A static, accessible directory: browsing links never transmits app inputs.
applications=json.loads((root/'online-applications.json').read_text())
online_cards=[]
for c in applications['insurers']:
 links=''.join('<a href="'+escape(l['url'],quote=True)+'" target="_blank" rel="noopener"><span>'+escape(l['label'])+'</span><small>'+escape(l['note'])+'</small></a>' for l in c['links'])
 online_cards.append('<article class="online-application-card" id="online-'+escape(c['id'])+'" data-online-insurer="'+escape(c['id'])+'"><span class="online-kind">'+escape(c['kind'])+'</span><h3>'+escape(c['name'])+'</h3><p>'+escape(c['info'])+'</p><div class="online-actions">'+links+'</div><p class="learning-note">Links geprüft: '+escape(applications['checked'])+' · öffnet die offizielle Kassenseite.</p></article>')
options=''.join('<option value="'+escape(c['id'])+'">'+escape(c['name'])+'</option>' for c in applications['insurers'])
online_html='<section id="online-antraege"><h2>Online-Anträge bei Ihrer Pflegekasse</h2><p>Für Versicherte in Niedersachsen: Wählen Sie Ihre eigene Kranken-/Pflegekasse. Die bundesweiten Portale gelten auch hier. Diese Auswahl umfasst die acht Kassen aus der Adressübersicht und ist keine vollständige Liste aller Kassen.</p><p><strong>Online-Antrag, Mitgliederportal und PDF-Upload sind verschieden.</strong> Am Link steht, welcher Weg angeboten wird. Ein Linkaufruf stellt noch keinen Antrag; Angaben erst auf der offiziellen Kassenseite eingeben und dort die Eingangsbestätigung sichern. Für eine Vertretung die Vorgaben zur Vollmacht beachten.</p><label class="online-chooser" for="onlineInsurer">Eigene Pflegekasse auswählen<select id="onlineInsurer"><option value="">Alle acht Kassen ansehen</option>'+options+'</select></label><p id="onlineCount" role="status">Alle acht Kassen angezeigt.</p><div class="online-application-grid">'+''.join(online_cards)+'</div><p>Ihre Kasse fehlt? Über die <a href="https://www.gkv-spitzenverband.de/service/krankenkassenliste/krankenkassen.jsp" target="_blank" rel="noopener">offizielle GKV-Kassenliste</a> die eigene Kasse öffnen und deren Pflegeanträge suchen. <a href="#kontakte">Zu Besuchs- und Postanschriften</a></p><p class="learning-note">Dies sind Wege für Anträge und Belege. Für einen Widerspruch die Rechtsbehelfsbelehrung und zulässige Form gesondert beachten; nicht jeder Upload ist dafür geeignet.</p></section>'
# Public directory: no booking, provider embeds, geolocation or private inputs.
local_services=json.loads((root/'local-services.json').read_text())
provider_cards=[]
provider_labels={'fenster':'Fenster & Reinigung','garten':'Gartenpflege','fahrt':'Fahrdienst','waesche':'Wäschepflege','essen':'Mahlzeitenlieferung'}
for provider in local_services['providers']:
 city_name=escape(provider.get('cityLabel',{'ha':'Hannover','os':'Osnabrück'}[provider['city']]))
 sources=[('Firmenwebsite: Angebot und Kontakt',provider['url'])]
 if provider.get('contactSource'):sources.append(('Weitere Kontaktquelle',provider['contactSource']))
 links=''.join('<a data-reviewed="2026-10-27" href="'+escape(url,quote=True)+'" target="_blank" rel="noopener">'+escape(label)+'</a>' for label,url in sources)
 address='<br>'.join(escape(line) for line in provider['address']) if provider['address'] else 'Hannover und Region · Kontakt über Firmenwebsite und Telefon; hier keine bestätigte Straßenanschrift.'
 phone=''.join(c for c in provider['phone'] if c.isdigit())
 provider_cards.append('<article class="card local-provider" id="firma-'+escape(provider['id'])+'" data-provider-city="'+provider['city']+'" data-provider-type="'+provider['type']+'"><div class="badge-row"><span>'+city_name+'</span><span>'+provider_labels[provider['type']]+'</span></div><h3>'+escape(provider['name'])+'</h3><ul>'+''.join('<li>'+escape(t)+'</li>' for t in provider['services'])+'</ul><address>'+address+'</address><a class="provider-phone" href="tel:'+phone+'">Anrufen: '+escape(provider['phone'])+'</a><a class="provider-website" data-reviewed="2026-10-27" href="'+escape(provider['url'],quote=True)+'" target="_blank" rel="noopener">Firmenwebsite öffnen</a><p class="provider-funding"><strong>Abrechnung:</strong> '+escape(provider['funding'])+'</p><details><summary>Firmenquellen und Prüfstand</summary><div class="provider-sources">'+links+'</div><p class="small">Leistungsangebot und Kontakt geprüft: '+local_services['checked']+'. Nicht telefonisch bestätigt; Termine, Mindestauftrag, Einzugsgebiet und Preise direkt erfragen.</p></details></article>')
provider_html='<section id="dienstleister-vorort" class="household-help"><h2>Konkrete Firmen in Hannover und Osnabrück</h2><p>Reinigungsbetriebe, Gartenbauunternehmen, Taxi- und Krankenfahrunternehmen, Wäschereien und Menülieferanten mit eigenen Leistungen. Osnabrück umfasst hier auch einen ausdrücklich gekennzeichneten Betrieb aus dem nahen Umland mit Angebot für den Raum Osnabrück. Keine Haushaltsvermittlungsagenturen oder Alltagsbetreuungsdienste in dieser Auswahl. Die Liste ist keine Rangfolge und keine vollständige Marktübersicht.</p><p class="notice household-note"><span><strong>Firmenangebot ist keine Erstattungszusage.</strong> Für keinen der aufgeführten Betriebe wurde hier eine passende AZUA-Anerkennung bestätigt. Bei Fensterreinigung deshalb vor Auftrag den konkreten anerkannten Abrechnungsweg nachweisen lassen; ohne Nachweis privat planen. Bei Gartenpflege gelten die oben beschriebenen Ausschlüsse, bei Krankenfahrten die Regeln der Krankenversicherung.</span></p><div class="contact-controls"><label for="providerCity">Ort<select id="providerCity"><option value="all">Hannover und Osnabrück</option><option value="ha">Hannover</option><option value="os">Osnabrück</option></select></label><label for="providerType">Gesuchte Hilfe<select id="providerType"><option value="all">Alle Dienste</option><option value="fenster">Fenster und Reinigung</option><option value="garten">Gartenpflege</option><option value="fahrt">Fahrdienst / Krankenfahrt</option><option value="waesche">Wäsche / Abholservice</option><option value="essen">Essen auf Rädern / Menüservice</option></select></label></div><button type="button" id="providerReset" class="secondary">Alle Firmen anzeigen</button><p id="providerCount" role="status">Alle '+str(len(local_services['providers']))+' Firmen angezeigt.</p><div class="grid2 local-provider-grid">'+''.join(provider_cards)+'</div><p class="small">Angaben stammen aus den verlinkten Firmenwebsites, Prüfstand '+local_services['checked']+'. Die Adressen sind veröffentlichte Firmenanschriften, keine bestätigten Beratungs- oder Besuchsstellen. Externe Seiten erst beim Öffnen des Links; es werden keine App-Eingaben weitergegeben.</p><details class="card"><summary>Was frage ich das Unternehmen?</summary><ul><li>Führen Sie genau diese Arbeit an meiner Adresse aus? Wie hoch sind Endpreis, Mindestauftrag, Anfahrt und Zusatzkosten?</li><li>Falls Pflegekassen-Erstattung gewünscht: Welche aktuelle Anerkennung oder Zulassung umfasst gerade diese Tätigkeit? Können Sie sie mir vorlegen?</li><li>Bei Fahrten: sitzend, im Rollstuhl oder mit Tragestuhl? Treppen, Begleitperson, Hilfsmittel, Hin- und Rückfahrt vorher absprechen.</li><li>Bei Wäsche: Abholung bis zur Wohnungstür? Preis pro Stück oder Kilogramm, Mindestmenge, Liefergebühr, Rückgabe und Bügeln eingeschlossen?</li><li>Bei Menüs: Wird meine Adresse beliefert? Warm oder zum Aufwärmen, auch am Wochenende? Gesamtpreis mit Lieferung, Behältern und Abbestellfrist klären.</li><li>Bei Krankenfahrten: Welche Verordnung und gegebenenfalls Genehmigung brauche ich, wie rechnen Sie ab, welcher Eigenanteil bleibt?</li></ul></details></section>'
billing=(root/'abrechnung-template.html').read_text().replace('__BASE_CSS__',base_css).replace('__ONLINE_APPLICATIONS__',online_html).replace('__HOUSEHOLD_HELP__',(root/'household-help.html.inc').read_text()).replace('__TRANSPORT_HELP__',(root/'transport-help.html.inc').read_text()).replace('__EVERYDAY_HELP__',(root/'everyday-services.html.inc').read_text()).replace('__LOCAL_PROVIDERS__',provider_html).replace('__BILLING_DATA__',json.dumps(json.loads((root/'billing-data.json').read_text()),ensure_ascii=False).replace('</','<\\/'))
for asset in ['abrechnung.css','abrechnung.js']:
 digest=hashlib.sha256((root/asset).read_bytes()).hexdigest()[:12]
 billing=billing.replace('./'+asset+'"','./'+asset+'?v='+digest+'"')
 shutil.copy2(root/asset,root/'dist'/asset)
(root/'abrechnung.html').write_text(billing)
(root/'dist/abrechnung.html').write_text(billing)
shutil.copytree(root/'formulare',root/'dist/formulare',dirs_exist_ok=True)
print('Abrechnung Niedersachsen: fünf Leistungsarten, Nachbarschaftshilfe, sechs PDF-Bögen und acht Kassenkontakte erstellt.')

runpy.run_path(str(root/'build-gdb.py'))

# Shared reading aids are added after the established page-specific handlers.
for asset in ['app-usability.css','app-usability.js']:
 shutil.copy2(root/asset,root/'dist'/asset)
css_hash=hashlib.sha256((root/'app-usability.css').read_bytes()).hexdigest()[:12]
js_hash=hashlib.sha256((root/'app-usability.js').read_bytes()).hexdigest()[:12]
for page in ['index.html','pflegewissen.html','fallbeispiel.html','pflegegradrechner.html','abrechnung.html','gdb.html','meine-vorbereitung.html']:
 html=(root/page).read_text().replace('</head>','<link rel="stylesheet" href="./app-usability.css?v='+css_hash+'"></head>').replace('</body>','<script src="./app-usability.js?v='+js_hash+'"></script></body>')
 (root/page).write_text(html)
 (root/'dist'/page).write_text(html)
print('Leseführung, mobile Bedienung und einheitliche Bedienhilfen eingebunden.')

for asset in ['care-visuals.js','care-visuals.css']:
 shutil.copy2(root/asset,root/'dist'/asset)
visual_css=hashlib.sha256((root/'care-visuals.css').read_bytes()).hexdigest()[:12]
visual_js=hashlib.sha256((root/'care-visuals.js').read_bytes()).hexdigest()[:12]
for page in ['index.html','pflegewissen.html','fallbeispiel.html','pflegegradrechner.html','abrechnung.html','gdb.html','meine-vorbereitung.html']:
 html=(root/page).read_text().replace('</head>','<link rel="stylesheet" href="./care-visuals.css?v='+visual_css+'"></head>')
 first_script=html.index('<script')
 html=html[:first_script]+'<script src="./care-visuals.js?v='+visual_js+'"></script>'+html[first_script:]
 (root/page).write_text(html)
 (root/'dist'/page).write_text(html)
print('Bereichsbilder, Gesprächsillustrationen, Bildauswahl, Punktediagramm und startbare Ablaufanimationen eingebunden.')

# Contextual learning pictures and local-only interaction helpers.
for asset in ['care-learning.js','care-learning.css']:
 shutil.copy2(root/asset,root/'dist'/asset)
learning_js=hashlib.sha256((root/'care-learning.js').read_bytes()).hexdigest()[:12]
learning_css=hashlib.sha256((root/'care-learning.css').read_bytes()).hexdigest()[:12]
for page in ['index.html','pflegewissen.html','fallbeispiel.html','pflegegradrechner.html','abrechnung.html','gdb.html','meine-vorbereitung.html']:
 html=(root/page).read_text().replace('</head>','<link rel="stylesheet" href="./care-learning.css?v='+learning_css+'"></head>')
 first_script=html.index('<script')
 html=html[:first_script]+'<script src="./care-learning.js?v='+learning_js+'"></script>'+html[first_script:]
 (root/page).write_text(html)
 (root/'dist'/page).write_text(html)
print('Sechs kontextbezogene Bildhilfen und offizielle Online-Antragswege eingebunden.')

# Interactive explanations inherit the app's existing controls and preferences.
for asset in ['care-explain.js','care-explain.css']:
 shutil.copy2(root/asset,root/'dist'/asset)
explain_js=hashlib.sha256((root/'care-explain.js').read_bytes()).hexdigest()[:12]
explain_css=hashlib.sha256((root/'care-explain.css').read_bytes()).hexdigest()[:12]
for page in ['index.html','pflegewissen.html','fallbeispiel.html','pflegegradrechner.html','abrechnung.html','gdb.html','meine-vorbereitung.html']:
 html=(root/page).read_text().replace('</head>','<link rel="stylesheet" href="./care-explain.css?v='+explain_css+'"></head>')
 first_script=html.index('<script')
 html=html[:first_script]+'<script src="./care-explain.js?v='+explain_js+'"></script>'+html[first_script:]
 (root/page).write_text(html)
 (root/'dist'/page).write_text(html)
print('Gekoppelte Balken, Zeitstrahlen, Guthabenkalender, Tagesform, Antwortvergleiche und Antragsrollen eingebunden.')

# Keep navigation consistent while preserving the established page templates.
for page in ['index.html','pflegewissen.html','fallbeispiel.html','pflegegradrechner.html','abrechnung.html']:
 html=(root/page).read_text()
 import re
 html=re.sub(r'(<nav class="section-nav"[^>]*>)(.*?)(</nav>)',lambda m:m[1]+m[2]+'<a class="subtle" href="./gdb.html">GdB &amp; Ausweis</a><a class="subtle" href="./meine-vorbereitung.html">Meine Vorbereitung</a>'+m[3],html,count=1,flags=re.S)
 if page in ['index.html','pflegewissen.html']:
  html=html.replace('<nav class="care-jump"','<aside class="shared-next"><strong>Auch gut vorbereitet?</strong><p><a href="./gdb.html">GdB &amp; Schwerbehindertenausweis verstehen</a> · <a href="./meine-vorbereitung.html">Eigene Aufgaben und Unterlagen ordnen</a></p></aside><nav class="care-jump"',1)
 (root/page).write_text(html);(root/'dist'/page).write_text(html)

# Shared public index, application comfort controls, and optional offline bundle.
runpy.run_path(str(root/'build-sources.py'))
runpy.run_path(str(root/'build-access.py'))
