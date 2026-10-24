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
print('Pflegegrad-Fragen: 100 Fragen und Antworten, eigenständige HTML-App erstellt.')
