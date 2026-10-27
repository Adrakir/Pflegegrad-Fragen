# Qualitätsprüfung

`python3 build.py` erstellt alle sieben Seiten und die öffentliche Offline-Auswahl.
`python3 check-sources.py` prüft lokale Dateien, Sprungziele, doppelte IDs und das Quellenverzeichnis.
Die `verify*.cjs`-Programme testen Berechnung, Beispieldaten, Eingabebehandlung, Sicherungen, Speicherfehler, Vorlesen und Offline-Grenzen.

Der Workflow `Qualität und öffentliche Quellen` führt den Build und die Funktionstests bei Änderungen aus. Wöchentlich montags um 06:00 UTC sowie bei manuellem Start prüft er zusätzlich die öffentlichen Links ohne Cookies. 404/410 gelten als defekt; 401/403/429, Zeitüberschreitungen und temporäre Fehler erfordern manuelle Sichtung. Ein erreichbarer Link ist keine inhaltliche Freigabe. Der Bericht weist nach 90 Tagen auf eine erneut erforderliche Inhaltsprüfung hin. Die Prüfung sendet keine Nutzereingaben.

## Geräteprüfung

Vor Veröffentlichung im Chrome-Browser auf Desktop sowie in einer 375-Pixel-Inhaltsansicht prüfen:

- kurze und ausführliche GdB-Erklärungen, Sprungziele, Bildergeschichte, Pause/Weiter und direkte Wahl
- GdB-Wegweiser, Wechselwirkungsbilder, Merkzeichen und Musterbescheid
- Aufgaben erstellen, bearbeiten, abhaken, entfernen und rückgängig machen
- Dokumentstatus, Entwürfe, freiwillige Gerätespeicherung und Wiederladen
- Sicherungsvorschau, Abbruch und Übernahme; anderer App-Bestand bleibt erhalten
- freiwillige Vorleseeinstellungen über Seitenwechsel, deaktivierte Speicherung
- Suche und Lesetext enthalten keine persönlichen Eingaben
- große Schrift, Kontrast, beschriftete Felder, sichtbarer Fokus, Escape und kein seitlicher Überlauf
- Live-Offline-Bündel vollständig; externe Portale benötigen Internet

Echte iPhones mit Safari/VoiceOver und Android-Geräte mit Chrome, Edge und TalkBack sind zusätzlich manuell zu prüfen. Eine schmale Browseransicht und simulierte Sprachausgabe-Tests ersetzen keine Hör- oder Screenreaderprüfung auf diesen Geräten. Tests dürfen ausschließlich erfundene, als solche erkennbare Daten verwenden.

## Pflege der Inhalte

Rechtliche Inhalte und Kontaktdaten stehen in `gdb-data.json`, `care-benefits.json`, `billing-data.json` und `online-applications.json`. Bei einer inhaltlichen Änderung die offiziellen Quellen prüfen und das betreffende Inhaltsprüfdatum aktualisieren. Ein erfolgreicher automatisierter Linktest aktualisiert dieses Datum nicht.

Die persönliche Vorbereitung verwendet ausschließlich `pflegegrad-workspace-v1`; Vorleseeinstellungen ausschließlich `pflegegrad-reader-preferences-v1`. Die bestehenden Speicherbereiche für Fallbeispiel, Rechner und Tagebuch sind davon unabhängig. Öffentliche Suche und Vorlesen lesen nur den beim Build erstellten öffentlichen Index.
