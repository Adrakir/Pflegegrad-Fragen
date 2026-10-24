import json
import hashlib
import shutil
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
calc=(root/'calculator-template.html').read_text().replace('__BASE_CSS__',base_css).replace('__PREPARATION_CSS__',(root/'preparation.css').read_text()).replace('__PREPARATION_HTML__',(root/'preparation.html.inc').read_text()).replace('__CALCULATOR_DATA__',json.dumps(calculator,ensure_ascii=False).replace('</','<\\/')).replace('__CARE_DATA__',json.dumps(care,ensure_ascii=False))
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
