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
