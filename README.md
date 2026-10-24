# Pflegegrad-Fragen

100 mögliche Fragen mit vollständig ausformulierten Antworten für ein Fallbeispiel.


[App öffnen](https://adrakir.github.io/Pflegegrad-Fragen/) · [Pflegegrade & Leistungen](https://adrakir.github.io/Pflegegrad-Fragen/pflegewissen.html)

## Fallbeispiel

Fiktiv ergänzter Übungsfall, angelehnt an das beschriebene Beschwerdebild mit Depression, Ängsten, Schlafproblemen, Konzentrationsproblemen und Erschöpfung. Fehlende Einzelheiten wurden für die Übung plausibel erfunden. Dazu gehören der Zeitraum, Häufigkeiten, Behandlungstermine und konkrete Hilfen. Die Ergänzungen sind keine zusätzlichen Tatsachenangaben über die zugrunde liegende Person und dürfen nicht ungeprüft in einen echten Antrag übernommen werden. Selbstständige Fähigkeiten sind ebenfalls vollständig beschrieben. Die App berechnet keinen Pflegegrad.

## Pflegegrade und Leistungen

Neuer Bereich mit Pflegegraden 1 bis 5, monatlichen Beträgen 2026, zweckgebundenen Budgets, Kombination von Geld- und Sachleistungen, Ersatzpflege, Antrag und Widerspruch. Datenstand 24.10.2026, mit Links zu offiziellen Quellen. Rechner für Kombinationsleistungen und das gemeinsame Jahresbudget sind unverbindliche Beispiele.

## Nutzen

`index.html` im Browser öffnen. Keine Installation und keine externen Bibliotheken erforderlich. Enthalten sind Suche, zehn Themenfilter, Vormerkliste, Gesprächsmodus, eigene Antworten, große Schrift, hoher Kontrast, Sicherung, Wiederherstellung und Druckansicht. Eigene Einträge bleiben lokal im Browser. Eine Sicherung kann persönliche Angaben enthalten.

## Entwickeln

Fragen und Antworten in `questions.json`, Oberfläche in `template.html`. Leistungsbeträge in `care-benefits.json`, Informationsseite in `care-template.html`. `python3 build.py` erzeugt `index.html`, `pflegewissen.html` und deren Kopien in `dist/`. Danach `node verify.cjs` und `node verify-care.cjs` ausführen. GitHub Pages veröffentlicht aus `main` / Hauptverzeichnis; der lokale Vorschauserver nutzt `dist`.


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
