"""Check public links without cookies or user data. Run --network in CI."""
import argparse,json,sys,re,datetime,ipaddress
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
from urllib.request import Request,urlopen
from urllib.error import HTTPError,URLError
from concurrent.futures import ThreadPoolExecutor
R=Path(__file__).parent
PAGES=['index.html','pflegewissen.html','fallbeispiel.html','pflegegradrechner.html','abrechnung.html','gdb.html','meine-vorbereitung.html']
class Page(HTMLParser):
 def __init__(self,text):super().__init__();self.ids=[];self.links=[];self.assets=[];self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.append(a['id'])
  if tag=='a' and a.get('href'):self.links.append(a['href'])
  if tag in ['script','link','img']:
   url=a.get('src') or a.get('href')
   if url:self.assets.append(url)
def offline():
 errors=[];pages={f:Page((R/f).read_text()) for f in PAGES}
 aliases={'vorbereitung','rechner','antragsrollen','antwortbeispiele','zeitstrahlen','guthabenkalender'}
 for f,p in pages.items():
  if len(set(p.ids))!=len(p.ids):errors.append(f+': doppelte IDs')
  for raw in p.links+p.assets:
   url=urlsplit(raw)
   if url.scheme or url.netloc:continue
   target=unquote(url.path.removeprefix('./')) or (f if raw.startswith('#') else 'index.html')
   if not (R/target).is_file():errors.append(f+': Datei fehlt: '+raw);continue
   if url.fragment and target in pages and url.fragment not in pages[target].ids:
    h=url.fragment
    if h in aliases or re.fullmatch(r'q-\d+(?:-\d+)?|plan-(gdb|pflege|abrechnung|bescheid)',h):continue
    errors.append(f+': Sprungziel fehlt: '+raw)
 registry=json.loads((R/'source-registry.json').read_text())['sources']
 assert registry and len(registry)==len({s['url'] for s in registry})
 for s in registry:
  u=urlsplit(s['url']);assert u.scheme=='https' and u.hostname and not u.username and not u.password
  try:ipaddress.ip_address(u.hostname);raise AssertionError('IP-Adresse statt Quellenhost')
  except ValueError:pass
  assert datetime.date.fromisoformat(s['lastContentReview']) and s['reviewAfterDays']==90
 if errors:raise AssertionError('\n'.join(errors))
 return len(registry)
def remote(source):
 url=source['url'];result={'url':url,'lastContentReview':source['lastContentReview']}
 age=(datetime.date.today()-datetime.date.fromisoformat(source['lastContentReview'])).days
 result['contentReviewRecommended']=age>source['reviewAfterDays']
 try:
  for method in ['HEAD','GET']:
   try:
    with urlopen(Request(url,method=method,headers={'User-Agent':'Pflegegrad-Fragen-Public-Linkcheck/1.0'}),timeout=15) as response:
     result.update(status=response.status,finalURL=response.url,technicalState='reachable');break
   except HTTPError as err:
    if method=='HEAD' and err.code in [405,501]:continue
    result.update(status=err.code,technicalState='broken' if err.code in [404,410] else 'manual-review');break
 except (URLError,TimeoutError,OSError,ValueError):result['technicalState']='manual-review'
 return result
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--network',action='store_true');parser.add_argument('--report',default='tmp/source-link-report.json');args=parser.parse_args()
 count=offline();print(f'PASS: {len(PAGES)} Seiten, lokale Sprungziele und Dateien, {count} öffentliche Quellen mit Prüfdatum.')
 if args.network:
  sources=json.loads((R/'source-registry.json').read_text())['sources']
  with ThreadPoolExecutor(max_workers=6) as pool:results=list(pool.map(remote,sources))
  path=R/args.report;path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps({'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'note':'Erreichbarkeit ist keine inhaltliche Prüfung; 401/403/429 und temporäre Fehler benötigen manuelle Sichtung.','results':results},ensure_ascii=False,indent=2)+'\n')
  broken=[r for r in results if r['technicalState']=='broken'];manual=[r for r in results if r['technicalState']=='manual-review'];stale=[r for r in results if r['contentReviewRecommended']]
  print(f'{len(broken)} nicht mehr gefunden; {len(manual)} technisch manuell prüfen; {len(stale)} inhaltlich erneut prüfen. Bericht: {args.report}')
  for r in broken:print('Nicht mehr gefunden:',r['url'])
  sys.exit(1 if broken else 0)
