# Pflegegrad-Fragen

100 mögliche Fragen mit vollständig ausformulierten Antworten für ein Fallbeispiel.


## Fallbeispiel

Fiktiv ergänzter Übungsfall, angelehnt an das beschriebene Beschwerdebild mit Depression, Ängsten, Schlafproblemen, Konzentrationsproblemen und Erschöpfung. Fehlende Einzelheiten wurden für die Übung plausibel erfunden. Dazu gehören der Zeitraum, Häufigkeiten, Behandlungstermine und konkrete Hilfen. Die Ergänzungen sind keine zusätzlichen Tatsachenangaben über die zugrunde liegende Person und dürfen nicht ungeprüft in einen echten Antrag übernommen werden. Selbstständige Fähigkeiten sind ebenfalls vollständig beschrieben. Die App berechnet keinen Pflegegrad.

## Nutzen

`index.html` im Browser öffnen. Keine Installation und keine externen Bibliotheken erforderlich. Enthalten sind Suche, zehn Themenfilter, Vormerkliste, Gesprächsmodus, eigene Antworten, große Schrift, hoher Kontrast, Sicherung, Wiederherstellung und Druckansicht. Eigene Einträge bleiben lokal im Browser. Eine Sicherung kann persönliche Angaben enthalten.

## Entwickeln

Fragen und Antworten in `questions.json`, Oberfläche in `template.html`. `python3 build.py` erzeugt `index.html` und `dist/index.html`. Danach prüft `node verify.cjs` die Daten und Funktionen. Statisches Hosting: `dist`.


## Fachliche Orientierung

Die Fragen sind selbst formuliert. Keine offizielle Fragenliste und kein Pflegegutachten.

- https://www.gesetze-im-internet.de/sgb_11/__14.html
- https://www.gesetze-im-internet.de/sgb_11/anlage_1.html
- https://md-bund.de/themen/pflegebeduerftigkeit-und-pflegebegutachtung/begutachtungs-richtlinien.html

Stand: 24.10.2026.

## Online nutzen

Die App wird über GitHub Pages aus dem Branch `main` und dem Hauptverzeichnis bereitgestellt. Sie benötigt kein ChatGPT-Konto.
