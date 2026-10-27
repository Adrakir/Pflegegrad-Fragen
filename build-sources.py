"""A public source registry; contains no runtime user entries."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import json
R=Path(__file__).parent
records={}
def add(url,page,checked):
 if not isinstance(url,str) or not url.startswith('https://'):return
 p=urlsplit(url)
 if not p.hostname or any(c in url for c in ['${','<','>','"']):return
 record=records.setdefault(url,{'url':url,'pages':[],'lastContentReview':checked,'reviewAfterDays':90})
 if page not in record['pages']:record['pages'].append(page)
 record['lastContentReview']=max(record['lastContentReview'],checked)
class Links(HTMLParser):
 def __init__(self,page,date):super().__init__();self.page=page;self.date=date
 def handle_starttag(self,tag,attrs):
  if tag=='a':
   a=dict(attrs);add(a.get('href'),self.page,a.get('data-reviewed',self.date))
def walk(value,page,date):
 if isinstance(value,dict):
  for v in value.values():walk(v,page,date)
 elif isinstance(value,list):
  for v in value:walk(v,page,date)
 elif isinstance(value,str):add(value,page,date)
for f,date in [('care-benefits.json','2026-10-24'),('billing-data.json','2026-10-26'),('online-applications.json','2026-10-26')]:walk(json.loads((R/f).read_text()),f,date)
for s in json.loads((R/'gdb-data.json').read_text())['sources']:add(s['url'],'gdb.html',s['checked'])
for page,date in [('index.html','2026-10-24'),('fallbeispiel.html','2026-10-24'),('pflegegradrechner.html','2026-10-24'),('abrechnung.html','2026-10-26'),('gdb.html','2026-10-27')]:
 parser=Links(page,date);parser.feed((R/page).read_text())
(R/'source-registry.json').write_text(json.dumps({'schema':1,'note':'Technische Erreichbarkeit ist keine inhaltliche Freigabe. Prüfdatum bezeichnet die letzte inhaltliche Prüfung.','sources':sorted(records.values(),key=lambda x:x['url'])},ensure_ascii=False,indent=2)+'\n')
