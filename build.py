import json
from pathlib import Path

root=Path(__file__).parent
questions=json.loads((root/'questions.json').read_text())
assert len(questions)==100 and len({q['q'] for q in questions})==100
template=(root/'template.html').read_text()
data=json.dumps([dict(q,id=i+1) for i,q in enumerate(questions)],ensure_ascii=False).replace('</','<\\/')
html=template.replace('__QUESTIONS__',data)
(root/'dist').mkdir(exist_ok=True)
(root/'dist/index.html').write_text(html)
(root/'index.html').write_text(html)
care=json.loads((root/'care-benefits.json').read_text())
assert [g['grade'] for g in care['grades']]==[1,2,3,4,5]
base_css=template.split('<style>',1)[1].split('</style>',1)[0]
guide=(root/'care-template.html').read_text().replace('__BASE_CSS__',base_css).replace('__CARE_DATA__',json.dumps(care,ensure_ascii=False))
(root/'pflegewissen.html').write_text(guide)
(root/'dist/pflegewissen.html').write_text(guide)
print('Pflegegrad-Fragen: 100 Fragen plus Pflegegrade & Leistungen 2026 erstellt.')

calculator=json.loads((root/'calculator-data.json').read_text())
assert sum(len(m['items']) for m in calculator['modules'])==64
calc=(root/'calculator-template.html').read_text().replace('__BASE_CSS__',base_css).replace('__CALCULATOR_DATA__',json.dumps(calculator,ensure_ascii=False).replace('</','<\\/')).replace('__CARE_DATA__',json.dumps(care,ensure_ascii=False))
(root/'pflegegradrechner.html').write_text(calc)
(root/'dist/pflegegradrechner.html').write_text(calc)
for asset in ['calculator-engine.js','calculator.js']:
 (root/'dist'/asset).write_text((root/asset).read_text())
print('Pflegegradrechner: 64 Kriterien und sechs Module erstellt.')
