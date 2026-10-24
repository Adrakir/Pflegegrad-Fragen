# Pflegegrad-Fragen

100 unterschiedliche mögliche Fragen und Antwortbeispiele zur Vorbereitung auf ein Begutachtungsgespräch. Keine offizielle oder vollständige Fragenliste des Medizinischen Dienstes, keine Pflegegradberechnung.

[App öffnen](https://pflegegrad-fragen.node-opcua.chatgpt.site) (Zugriff mit ChatGPT-Anmeldung).

## Nutzen

`index.html` im Browser öffnen. Keine Installation, keine externen Bibliotheken und kein Benutzerkonto innerhalb der App nötig. Suche, zehn Themenfilter, Vormerkliste, Gesprächsmodus, persönliche Antworten, große Schrift, hoher Kontrast und Druckansicht sind enthalten.

Alle Antwortbeispiele sind Formulierungshilfen. Zutreffende Beispiele prüfen und persönlich ergänzen; nicht bestehende Einschränkungen nicht übernehmen. Alle Antworten sind allgemeine Formulierungsbeispiele und keine Angaben über eine bestimmte Person. Es werden keine personenbezogenen Fallunterlagen veröffentlicht. Angaben in eckigen Klammern sind individuell zu ergänzen. Selbstständigkeit und fehlenden Hilfebedarf ebenfalls angeben.

Persönliche Eingaben, Markierungen und Bearbeitungsstände werden ausschließlich im lokalen Browser gespeichert, ohne Synchronisierung. Bei gesperrtem Browserspeicher funktioniert die App im laufenden Fenster, meldet aber fehlende dauerhafte Speicherung. Daten lassen sich als JSON sichern und später über die App wiederherstellen. Beim Import werden nur Antworten und Markierungen übernommen, keine ausführbaren Inhalte. Inhalte der Suchanfrage werden nicht an einen Server geschickt.

## Entwickeln

Fragen in `questions.json`, Oberfläche in `template.html`. `python3 build.py` erzeugt die identischen Dateien `index.html` und `dist/index.html`. `node verify.cjs` prüft Daten, Syntax und den grundsätzlichen Ablauf ohne externe Pakete. Statisches Hosting: `dist`.

## Fachliche Orientierung

Fragen selbst formuliert und thematisch an den Begutachtungsbereichen orientiert. Die App setzt keine Einzelpunkte und verspricht keinen bestimmten Pflegegrad.

- https://www.gesetze-im-internet.de/sgb_11/__14.html
- https://www.gesetze-im-internet.de/sgb_11/anlage_1.html
- https://md-bund.de/themen/pflegebeduerftigkeit-und-pflegebegutachtung/begutachtungs-richtlinien.html

Stand: 24.10.2026.
