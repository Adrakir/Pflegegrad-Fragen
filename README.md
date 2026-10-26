# Pflegegrad-Fragen

Start mit Pflegegraden und Leistungen, anschließend Fallbeispiel mit 100 vollständig ausformulierten Antworten und Pflegegradrechner.


[App öffnen](https://adrakir.github.io/Pflegegrad-Fragen/) · [Fallbeispiel](https://adrakir.github.io/Pflegegrad-Fragen/fallbeispiel.html)

## Fallbeispiel

Fiktiv ergänzter Übungsfall, angelehnt an das beschriebene Beschwerdebild mit Depression, Ängsten, Schlafproblemen, Konzentrationsproblemen und Erschöpfung. Fehlende Einzelheiten wurden für die Übung plausibel erfunden. Dazu gehören der Zeitraum, Häufigkeiten, Behandlungstermine und konkrete Hilfen. Die Ergänzungen sind keine zusätzlichen Tatsachenangaben über die zugrunde liegende Person und dürfen nicht ungeprüft in einen echten Antrag übernommen werden. Selbstständige Fähigkeiten sind ebenfalls vollständig beschrieben. Die App berechnet keinen Pflegegrad.

## Pflegegrade und Leistungen

Neuer Bereich mit Pflegegraden 1 bis 5, monatlichen Beträgen 2026, zweckgebundenen Budgets, Kombination von Geld- und Sachleistungen, Ersatzpflege, Antrag und Widerspruch. Datenstand 24.10.2026, mit Links zu offiziellen Quellen. Rechner für Kombinationsleistungen und das gemeinsame Jahresbudget sind unverbindliche Beispiele.

## Nutzen

`index.html` öffnet Pflegegrade und Leistungen. Die Navigation führt danach zum Fallbeispiel (`fallbeispiel.html`) und zum Pflegegradrechner. `pflegewissen.html` bleibt als Direktlink zur Leistungsübersicht erreichbar. Keine Installation und keine externen Bibliotheken erforderlich. Enthalten sind Suche, zehn Themenfilter, Vormerkliste, Gesprächsmodus, eigene Antworten, große Schrift, hoher Kontrast, Sicherung, Wiederherstellung und Druckansicht. Eigene Einträge bleiben lokal im Browser. Eine Sicherung kann persönliche Angaben enthalten.

## Entwickeln

Fragen und Antworten in `questions.json`, Oberfläche in `template.html`. Leistungsbeträge in `care-benefits.json`, Informationsseite in `care-template.html`. `python3 build.py` erzeugt `index.html`, `pflegewissen.html`, `fallbeispiel.html`, `pflegegradrechner.html` und deren Kopien in `dist/`. Danach `node verify.cjs` und `node verify-care.cjs` ausführen. GitHub Pages veröffentlicht aus `main` / Hauptverzeichnis; der lokale Vorschauserver nutzt `dist`.


## Fachliche Orientierung

Die Fragen sind selbst formuliert. Keine offizielle Fragenliste und kein Pflegegutachten.

- https://www.gesetze-im-internet.de/sgb_11/__14.html
- https://www.gesetze-im-internet.de/sgb_11/anlage_1.html
- https://md-bund.de/themen/pflegebeduerftigkeit-und-pflegebegutachtung/begutachtungs-richtlinien.html

Stand: 24.10.2026.

## Pflegegradrechner

[Rechner öffnen](https://adrakir.github.io/Pflegegrad-Fragen/pflegegradrechner.html). Orientierungsrechner ausschließlich für Erwachsene: 64 Kriterien mit auswählbaren Antworten, Häufigkeitseingaben in Modul 5, Vollständigkeitsprüfung, Einzel- und gewichtete Punkte, höhere Wertung aus Modul 2/3, Dauerprüfung und Hinweis auf die besondere Bedarfskonstellation. Keine Begutachtung oder Leistungszusage.

Regeln nach § 15 SGB XI, Anlagen 1/2 und Begutachtungs-Richtlinien ab 01.10.2026, Kapitel 5.9 und 5.10.1. Bewertungsdaten in `calculator-data.json`, Rechenlogik in `calculator-engine.js`, Oberfläche in `calculator-template.html` und `calculator.js`. Nach dem Build zusätzlich `node verify-calculator.cjs` ausführen.

Antworten werden ohne Serverübertragung im Browser verarbeitet; dauerhafte Gerätespeicherung ist freiwillig und standardmäßig ausgeschaltet. Drucken umfasst Punkteübersicht und ausgewählte Antworten. Der Rechner übernimmt keine Antworten aus dem fiktiven Übungsfall.

## Gestaltung und Erstellung

Erstellt von **Andreas und Ricarda**. Das Weidenherz mit handförmigem Busch ist als Logo in allen App-Bereichen eingebunden und dient auch als Browser- und Startbildschirmsymbol. Die Originalgrafik mit Transparenz liegt in `assets/weidenherz-logo.png` und wird beim Build nach `dist/assets/` kopiert.

## Erweiterungen für Ausfüllen und Vorbereitung

- Jedes der 64 Kriterien hat eine Unsicher-Markierung und konkrete Alltagsbeispiele für seine Antwortmöglichkeiten. Ausgewählte Antworten bleiben erhalten; bei markierten Unsicherheiten wird keine Pflegegradzuordnung ausgegeben.
- Rechner-Sicherungen als JSON enthalten auch unfertige Antworten, Unsicher-Markierungen, Rahmenangaben und das zuletzt geöffnete Modul. Vor dem Ersetzen vorhandener Eingaben wird eine Vorschau angezeigt.
- Bei freiwillig aktivierter Gerätespeicherung wird das zuletzt verwendete Rechnermodul wieder geöffnet. Bestehende gespeicherte Antworten aus Version 1 bleiben lesbar.
- Unter „Pflegetagebuch & Checkliste“ im Rechner können eigene Einträge erstellt, bearbeitet, gefiltert und gedruckt werden. Entfernte Einträge lassen sich unmittelbar rückgängig machen. Die Checkliste enthält zwölf Punkte, eine Terminnotiz und eigene Fragen.
- Die Vorbereitung hat eine eigene freiwillige Gerätespeicherung sowie separate JSON-Sicherung und Wiederherstellung. Sie verändert weder Rechnerantworten noch eigene Einträge im Fallbeispiel.

Direkt zur Vorbereitung: https://adrakir.github.io/Pflegegrad-Fragen/pflegegradrechner.html#vorbereitung

## Neubegutachtung und Höherstufung

Im Wissensbereich unter `#hoeherstufung`: Anlässe für erneute Begutachtung, Höherstufung bei erhöhtem Hilfebedarf, Wiederholungsbegutachtung, neuer Antrag nach Ablehnung und Abgrenzung zum Widerspruch. Mit fünf Vorbereitungsschritten, einem ausdrücklich fiktiven Vorher-/Heute-Beispiel, anpassbaren Mustertexten für Höherstufungsantrag und fristwahrenden Widerspruch sowie Antworten zu Dauerprognose, möglichen Ergebnissen, Leistungsbeginn und privater Versicherung. Die Texte senden keine Anträge oder Widersprüche ab.

Inhalte in `reassessment.html.inc`; `build.py` fügt sie in Startseite und `pflegewissen.html` ein. Die vorhandene Vorbereitung verlinkt den Wissensabschnitt und ergänzt die zwölf Checklistenpunkte um Veränderungen, vorheriges Gutachten und Fristen. Schlüssel und Datenformat bestehender Sicherungen bleiben erhalten. Quellenstand 24.10.2026: MD-Bund-Richtlinien ab 01.10.2026, § 84 SGG, §§ 18c/33 SGB XI und § 48 SGB X; Links stehen direkt in der App.

`calculator-session.js` verwaltet Rechner-Sicherungen, `preparation-engine.js` prüft Tagebuchdaten, `preparation.js` steuert die Oberfläche. Die Vorbereitung wird aus `preparation.html.inc` und `preparation.css` in den Rechner eingebaut. Nach `python3 build.py` prüfen: `node verify.cjs`, `node verify-care.cjs`, `node verify-improvements.cjs` und `node verify-preparation.cjs`. Die Verbesserungsprüfung enthält auch die bisherigen Rechnerprüfungen. Alle Eingaben werden im Browser verarbeitet; Sicherungsdateien können persönliche Gesundheitsdaten enthalten.

## Zentrale FAQ

24 Antworten in fünf Themenbereichen unter `#faq`, mit lokaler Volltextsuche (alle Suchwörter), Themenfilter, Trefferzahl, Zurücksetzen und Öffnen/Schließen der Treffer. Ohne JavaScript bleiben alle Fragen und Antworten über native Aufklappfelder erreichbar. Beim Drucken werden auch ausgefilterte FAQ ausgegeben. Links aus Rechner und Fallbeispiel führen zur FAQ; die drei Hauptbereiche bleiben unverändert. Dateien: `faq.html.inc`, `faq.css`, `faq.js`; Einbindung und Cache-Versionierung durch `build.py`.

## Abrechnung und Nachbarschaftshilfe Niedersachsen (26.10.2026)

`abrechnung.html` erklärt fünf Leistungsarten und die niedersächsische Nachbarschaftshilfe mit sechs fiktiven Rechenfällen. Drei Budgetgrafiken, ein schrittweiser Zahlungsweg, pausierbare Animationen, acht Kassenkontaktkarten mit Ortsfilter sowie sechs PDF-Downloads sind integriert. Die Kontaktsammlung ist eine regionale Auswahl mit Verweis auf die vollständige GKV-Liste. Besucher- und zentrale Postanschriften sind getrennt.

Quellen: Gesetzestexte, BMG/gesund.bund.de, Land Niedersachsen sowie offizielle Kassenseiten, jeweils auf der Seite verlinkt. Jahresbudget Verhinderung/Kurzzeit und Monatsbudget Tag/Nacht werden jeweils gemeinsam betrachtet. Kein Versand und keine Speicherung persönlicher Abrechnungsdaten durch den neuen Bereich. PDF-Muster sind editierbar, rechnen jedoch nicht automatisch.

Quellen: `abrechnung-template.html`, `abrechnung.js`, `abrechnung.css`, `billing-data.json`; PDF-Generator: `generate-billing-forms.py`; Prüfung: `node verify-billing.cjs`. `python3 build.py` erstellt die Seite und kopiert alle Formulare nach `dist/`.

## Verständlichkeit und Bedienung (26.10.2026)

- Wissensthemen beginnen mit „Was bedeutet das?“, „Was muss ich tun?“ und „Was brauche ich?“; ausführliche Texte bleiben aufklappbar und werden beim Drucken geöffnet.
- Gemeinsame Begriffshilfe mit Tastatur-bedienbarem Dialog, einheitlicher Schrift-/Kontrasteinstellung, kompakteren mobilen Überschriften und direkten Einstiegen.
- Rechner startet in der zusätzlichen Ansicht „Eine Frage“. „Ganzes Modul“ bleibt wählbar. Auswahlen, Häufigkeiten und Unsicher-Markierungen bleiben beim Wechsel erhalten. Die Berechnungsregeln und 64 Kriterien bleiben gleich.
- Tagebuch-Schnelleintrag verwendet dasselbe Formular und dieselben Einträge. Zusätzliche Angaben bleiben auch in der verkürzten Ansicht erhalten; beim Bearbeiten werden alle Felder geöffnet.
- Mobile Themenauswahl im Fallbeispiel, Gewichtungsgrafik und interaktiver Wegweiser für Erstantrag/Höherstufung/Widerspruch.
- 30 FAQ einschließlich Abrechnung und Nachbarschaftshilfe. Die Beleganimation startet nur nach Betätigung und berücksichtigt reduzierte Bewegung im Betriebssystem.

Gemeinsame Oberflächen-Dateien: `app-usability.js`, `app-usability.css`. Neue Prüfungen: `node verify-usability.cjs`; Tagebuch-Ansichtswechsel wird zusätzlich in `verify-preparation.cjs` geprüft.

### Visuelle Erklärungen

`care-visuals.js` und `care-visuals.css` ergänzen lokale SVG-Bilder für die sechs Begutachtungsbereiche, Leistungsarten und Fragekategorien. Aufklappbare Illustrationen zeigen ein Gespräch und Nachbarschaftshilfe zwischen getrennten Haushalten. Das Fallbeispiel bietet eine Antwortstruktur aus vier Bildkarten; im Tagebuch kann der Bereich zusätzlich über beschriftete Bildschaltflächen gewählt werden.

Drei bebilderte Abläufe (Erstantrag, Höherstufung, Nachbarschaftshilfe) lassen sich einzeln durchschalten oder auf Wunsch einmal abspielen und pausieren. Automatische Durchläufe enden selbstständig; bei verborgenem Browserfenster werden sie gestoppt. Reduzierte Bewegung wird berücksichtigt. Das Ergebnisdiagramm nutzt eine gemeinsame 100-Punkte-Skala und zählt aus Modul 2/3 ausschließlich den höheren gewichteten Wert. Grafiken und Bilder ersetzen weder den erklärenden Text noch die Begutachtung.

`node verify-visuals.cjs` prüft die zugänglichen SVG-Texte, Ablaufschritte, Einbindung und korrekte gemeinsame Berücksichtigung von Modul 2/3 im Ergebnisbild.

### Ergänzende Abrechnungsabläufe und Bedienkorrekturen

Jede der fünf Leistungsarten besitzt zusätzlich einen eigenen aufklappbaren Ablauf mit vier beschrifteten Bildschritten. Die zugehörige Animation pausiert beim Zuklappen; beim Wechsel der Leistungsart werden laufende Bildfolgen beendet. Der Schalter für die separate Beleggrafik ist ausdrücklich als „Beleganimation“ benannt. Große Schrift nutzt auf schmalen Bildschirmen eine einspaltige Bildfolge.

Die Begriffshilfe berücksichtigt auch neu gerenderte Leistungs- und Rechnerinhalte. Sie verändert nur vollständige Wörter, erhält die angezeigte Schreibweise und zerlegt etwa „Eigenanteile“ oder „Pflegesachleistungen“ nicht mehr in Wortteile. Eingabefelder und Statusmeldungen werden dabei nicht verändert.

Bei großer Schrift werden außerdem lange Begriffe und Kostenarten in den Abrechnungsbeispielen umgebrochen. Die Balkenbeschriftung auf schmalen Bildschirmen steht vollständig in der Legende unterhalb der Grafik; der Alternativtext nennt weiterhin die genauen Beträge.

Die Adresskarten enthalten vollständige Empfängerblöcke und je Anschrift eine offizielle Quelle. BARMER unterscheidet Hannover (42266 Wuppertal) von Osnabrück (73524 Schwäbisch Gmünd); BKK Pflegekasse firmus erhält Post unter 28192 Bremen. Großempfängeranschriften benötigen keine erfundene Straße. Nicht verifizierte örtliche Anschriften bleiben ausdrücklich als solche gekennzeichnet. Der Kopfbereich verlinkt zur Abrechnungserklärung; die Belegbewegung ist vor Ort beschriftet und von den bebilderten Schrittfolgen getrennt.

Zusätzliche Bildhilfen (`care-learning.js/css`): vier fiktive Situationen zum Anziehen, interaktive Tagespflege-Kostenübersicht (880 = 640 + 131 + 109 Euro), ausgefülltes fiktives Tagebuch, drei antippbare Begutachtungssituationen, kommentierter Musterbescheid und neun örtlich gültige Voraussetzungen der ehrenamtlichen Nachbarschaftshilfe. Der Check sagt keinen Anspruch zu. Er übernimmt keine Beispiele in Eingaben und speichert keine Daten. Die Online-Antragsauswahl wird aus `online-applications.json` statisch gebaut. Acht Kassen, offizielle Quellen, Zugangshinweise und eine klare Trennung von Online-Antrag, Portal und PDF/Upload. Adresskarten verlinken direkt zur jeweiligen Auswahl; Direktlinks heben einen anderen Kassenfilter auf.
