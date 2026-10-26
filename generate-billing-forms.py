"""Generate blank, interactive reimbursement templates. No personal data."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import simpleSplit
from pypdf import PdfReader

ROOT=Path(__file__).parent
OUT=ROOT/'formulare'; OUT.mkdir(exist_ok=True)
pdfmetrics.registerFont(TTFont('DejaVu','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuBold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
INK=HexColor('#28222d'); PURPLE=HexColor('#594567'); LINE=HexColor('#c6bfce')
W,H=595.276,841.89

def text(c,x,y,t,size=9,bold=False):
    c.setFillColor(INK); c.setFont('DejaVuBold' if bold else 'DejaVu',size); c.drawString(x,y,t)

def para(c,t,y,size=9):
    for ln in simpleSplit(t,'DejaVu',size,505):
        text(c,45,y,ln,size); y-=14
    return y-9

def field(c,name,label,x,y,w=240,h=22):
    text(c,x,y,label,8)
    c.acroForm.textfield(name=name,tooltip=label,x=x,y=y-h-5,width=w,height=h,
        fontName='Helvetica',fontSize=10,borderColor=LINE,fillColor=white,textColor=INK,
        borderWidth=.7,forceBorder=True,maxlen=180)

def check(c,name,label,x,y):
    c.acroForm.checkbox(name=name,tooltip=label,x=x,y=y-3,size=11,borderWidth=.7,
        borderColor=PURPLE,fillColor=white,textColor=INK,buttonStyle='check')
    text(c,x+18,y,label,8)

def head(c,title,page,subtitle):
    c.setFillColor(PURPLE);c.rect(0,H-94,W,94,fill=1,stroke=0)
    c.setFont('DejaVuBold',18);c.setFillColor(white);c.drawString(45,H-39,title)
    c.setFont('DejaVu',9);c.drawString(45,H-61,subtitle)
    text(c,45,37,'Pflegegrad-Fragen | Andreas und Ricarda | Muster, kein Kassenformular | 26.10.2026',7)
    text(c,512,37,f'{page} / 2',8)

def table(c,headers,widths,y,rows,prefix):
    x=45;c.setFillColor(HexColor('#eeeaf2'));c.rect(45,y-28,505,28,stroke=0,fill=1)
    for label,w in zip(headers,widths):
        for j,line in enumerate(label.split('|')): text(c,x+4,y-11-j*10,line,7,True)
        x+=w
    y-=28
    for row in range(rows):
        x=45
        for col,w in enumerate(widths):
            c.acroForm.textfield(name=f'{prefix}_{row}_{col}',tooltip=f'Zeile {row+1}: {headers[col].replace("|"," ")}',
                x=x+2,y=y-31,width=w-4,height=27,fontName='Helvetica',fontSize=8,
                borderColor=LINE,fillColor=white,textColor=INK,borderWidth=.5,maxlen=100)
            x+=w
        y-=34
    return y-18

FORMS=[('Verhinderungspflege','Verhinderungspflege_Abrechnung.pdf','§ 39 SGB XI: Antrag und Leistungsnachweis für private Ersatzpflege'),
 ('Entlastungsbetrag','Entlastungsbetrag_Erstattung.pdf','§ 45b SGB XI: Erstattungsantrag und Belegübersicht'),
 ('Kurzzeitpflege','Kurzzeitpflege_Erstattung.pdf','§ 42 SGB XI: Kostenzuordnung und ergänzende Erstattung'),
 ('Tagespflege','Tagespflege_Erstattung.pdf','§ 41 SGB XI: Monatsübersicht und ergänzende Erstattung'),
 ('Nachtpflege','Nachtpflege_Erstattung.pdf','§ 41 SGB XI: Monatsübersicht und ergänzende Erstattung')]

for kind,filename,subtitle in FORMS:
    c=canvas.Canvas(str(OUT/filename),pagesize=(W,H));c.setTitle(kind+' - Abrechnungsmuster');c.setAuthor('Andreas und Ricarda')
    vp=kind=='Verhinderungspflege'
    head(c,kind,1,subtitle)
    field(c,'kasse','An die Pflegekasse / zuständige Abrechnungsstelle',45,723,505)
    field(c,'name','Name der versicherten Person',45,670)
    field(c,'versichertennummer','Versichertennummer / Aktenzeichen',310,670)
    field(c,'adresse','Straße, Hausnummer, PLZ und Ort',45,617,505)
    field(c,'geburt','Geburtsdatum',45,564)
    field(c,'pflegegrad','Pflegegrad',310,564)
    field(c,'von','Leistungszeitraum / Monat: von',45,511)
    field(c,'bis','bis (Leistungsjahr bitte beachten)',310,511)
    if vp:
        field(c,'pflegeperson','Reguläre Pflegeperson: Name',45,458)
        field(c,'ausfallgrund','Ausfallgrund (z. B. Termin, Urlaub, Krankheit)',310,458)
        field(c,'ersatzperson','Ersatzpflegeperson: Name, Anschrift',45,405,505)
        field(c,'verwandtschaft','Verwandtschaft / Schwägerschaft (genau angeben)',45,352)
        check(c,'haushalt_ja','Gemeinsamer Haushalt: ja',310,345)
        check(c,'haushalt_nein','nein',310,325)
        check(c,'erwerb_ja','Ersatzpflege erwerbsmäßig',45,293)
        check(c,'erwerb_nein','nicht erwerbsmäßig',310,293)
        para(c,'Ich beantrage die Erstattung tatsächlich entstandener Kosten der Ersatzpflege. Zeitraum und Kosten sind auf Seite 2 dokumentiert. Bei Bedarf füge ich weitere unterschriebene Einsatzlisten bei.',254)
        para(c,'2026: Verhinderungs- und Kurzzeitpflege teilen bis zu 3.539 EUR jährlich. Für nahe Angehörige oder Haushaltsmitglieder gelten ggf. niedrigere Grenzen. Dauer des Ausfalls der regulären Pflegeperson je Tag getrennt von der Ersatzpflegezeit angeben.',192)
        para(c,'Kosten aus 2026 spätestens bis 31.12.2027 mit Nachweisen geltend machen. Nicht ausgegebene Jahresbudgets werden dadurch nicht in das Folgejahr übertragen.',112,8)
    else:
        field(c,'anbieter','Anbieter / Einrichtung: Name und Anschrift',45,458,505)
        field(c,'zulassung','Anerkennung / Zulassung / Institutionskennzeichen (soweit bekannt)',45,405,505)
        check(c,'erstattung','Erstattung nach eigener Zahlung beantragt',45,346)
        check(c,'direkt','Bereits direkt abgerechnete Beträge auf Seite 2 angegeben',45,322)
        para(c,'Ich beantrage die Prüfung und Erstattung der auf Seite 2 zugeordneten, bislang nicht erstatteten Kosten. Rechnungen und erforderliche Zahlungsnachweise sind beigefügt. Eine Direktabrechnung erfolgt nur nach gesondert geklärtem Verfahren.',280)
        if kind=='Entlastungsbetrag':
            para(c,'Bei Nachbarschaftshilfe in Niedersachsen zusätzlich das amtliche Bestätigungs- und Abrechnungsformular verwenden. Dieses Muster allein bestätigt keine Anerkennung. Die optionale Abtretung im Landesformular nur bei gewünschter Direktzahlung unterschreiben.',205)
        else:
            para(c,'Die Anbieterrechnung muss Pflegekosten, Beförderung (soweit einschlägig), Unterkunft, Verpflegung und Investitionskosten nachvollziehbar trennen. Dieses Muster ist keine Rechnung der Einrichtung.',205)
        para(c,'Wichtig: Keine Kosten doppelt geltend machen. Verfügbares Budget und bereits erstattete oder direkt abgerechnete Beträge mit der Kasse abgleichen.',130)
    c.showPage(); head(c,kind+' - Nachweise',2,'Nur tatsächliche Leistungen eintragen. Belege beifügen. Geldbeträge in EUR.')
    field(c,'name_wdh','Name / Versichertennummer (Zuordnung dieser Seite)',45,723,505)
    if vp:
        y=table(c,['Datum','Ausfall reguläre|Pflegeperson Std.','Ersatzpflege|von - bis','Ersatzpflege|Stunden','EUR je|Stunde','Betrag|EUR'],[62,108,104,76,73,82],665,4,'einsatz')
        field(c,'pflege_summe','Summe Pflegevergütung EUR',45,y,240)
        field(c,'weitere_kosten','Fahrtkosten / Verdienstausfall EUR (Belege)',310,y,240)
        y-=58
        field(c,'summe','Gesamtbetrag zur Erstattung EUR',45,y)
        field(c,'auszahlung','IBAN der erstattungsberechtigten Person',310,y)
        y-=65
        y=para(c,'Leistungsbestätigung der Ersatzpflegeperson: Die angegebenen Einsätze wurden erbracht. Fahrtkosten / Verdienstausfall werden nur entsprechend beigefügter Nachweise geltend gemacht.',y,8)
        field(c,'leistung_unterschrift','Ort, Datum, Unterschrift Ersatzpflegeperson (handschriftlich)',45,y,505)
        y-=60
        check(c,'geld_erhalten','Quittung nur bei tatsächlichem Empfang: Zahlung erhalten',45,y)
        y-=30
        field(c,'quittung','Erhaltener Betrag, Zahlungsdatum, Unterschrift Empfänger/in',45,y,505)
        y-=55
    else:
        y=table(c,['Rechnungsnr. /|Leistungsdatum','Kostenart /|Leistung','Rechnungs-|betrag EUR','Kasse: schon|übernommen EUR','Noch beantragt|EUR / Budget'],[110,130,80,100,85],665,5,'beleg')
        y=para(c,'Bei Tag-/Nachtpflege und Kurzzeitpflege: Kostenarten getrennt nennen. Bei Tag-/Nachtpflege den Monatsbetrag für beide Leistungsarten zusammen beachten. Bei Kurzzeitpflege das gemeinsame Jahresbudget mit Verhinderungspflege beachten.',y,8)
        field(c,'hauptbudget','Beantragt aus Hauptbudget EUR (falls einschlägig)',45,y)
        field(c,'entlastung','Zusätzlich aus Entlastungsbetrag EUR',310,y)
        y-=56
        field(c,'direkt_summe','Bereits direkt abgerechnet / erstattet EUR',45,y)
        field(c,'eigenanteil','Verbleibender eigener Anteil EUR',310,y)
        y-=56
        field(c,'iban','IBAN für die beantragte Erstattung',45,y,505)
        y-=65
    y=para(c,'Ich bestätige die Angaben und beantrage keine doppelte Erstattung. Die Pflegekasse prüft Anspruch, Budget und erstattungsfähige Kosten. Eine Vertretungsvollmacht wird beigefügt, soweit erforderlich.',y,8)
    field(c,'unterschrift','Ort, Datum, Unterschrift versicherte Person / bevollmächtigte Vertretung',45,y,505)
    y-=62
    text(c,45,y,'Anlagen: Rechnung / Leistungsnachweis, Zahlungsbeleg, ggf. weitere Nachweise und Vollmacht',7)
    c.save()
    reader=PdfReader(OUT/filename)
    fields=reader.get_fields()
    assert len(reader.pages)==2 and len(fields)>25
    assert all(p.get('/Annots') for p in reader.pages)
    assert y>45,(filename,y)
    print(filename,len(fields),'ausfüllbare Felder')
