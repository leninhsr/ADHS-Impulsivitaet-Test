// Spalten der Datendatei (CSV): deutsche Überschrift, interner Name, Bedeutung.
// Diese Liste ist die einzige Quelle. Aus ihr entsteht auswertung/spalten.csv (tests/make_spalten.js),
// mit der das Auswertungsskript die Datei liest.
//   de        Überschrift in der Datei
//   intern    Name, mit dem App und Auswertung intern rechnen
//   wo        In welchen Zeilen (Spalte „zeilenart“) die Spalte gefüllt ist
//   bedeutung Erklärung
//   werte     nur bei festen Antwortmöglichkeiten: deutscher Wert in der Datei -> interner Wert
// Die 63 Fragebogen-Spalten (asrs_01 … upps_45) stehen nicht hier. Sie folgen am Ende der Datei.
const COLUMNS = [
  { de: "teilnehmer_id", intern: "participant_id", wo: "alle", bedeutung: "Zufällige Kennung der Person, im Browser erzeugt. Kein Name, kein Bezug zur Person." },
  { de: "zeilenart", intern: "row_type", wo: "alle", bedeutung: "Wofür die Zeile steht: Gerät, Einwilligung, Angaben zur Person, Verständnisfrage, eine Wahl in der Aufgabe, eine Fragebogenseite, ADHS-Fragen, Abschlussfragen oder Zusammenfassung.",
    werte: { geraet: "browser", einwilligung: "consent", person: "demographics", verstaendnisfrage: "comprehension", wahl: "choice", fragebogen: "questionnaire", adhs_fragen: "adhd_questions", abschlussfragen: "end_questions", zusammenfassung: "summary" } },
  { de: "zeit_seit_start_ms", intern: "time_elapsed", wo: "alle", bedeutung: "Millisekunden vom Öffnen der Studie bis zum Ende dieser Seite oder dieses Durchgangs. Keine Uhrzeit." },
  { de: "app_version", intern: "app_version", wo: "alle", bedeutung: "Version der Studien-App." },
  { de: "modus", intern: "mode", wo: "alle", bedeutung: "Echte Erhebung oder Testlauf. Testläufe fallen aus der Auswertung.", werte: { echt: "live", test: "test" } },
  { de: "zeitraffer", intern: "speed", wo: "alle", bedeutung: "1 = normale Geschwindigkeit. Größer als 1 gibt es nur in Testläufen." },
  { de: "reihenfolge_studie", intern: "study_order", wo: "alle", bedeutung: "Reihenfolge der Studienteile.", werte: { aufgabe_zuerst: "task_first", frageboegen_zuerst: "questionnaires_first" } },
  { de: "reihenfolge_teile", intern: "block_order", wo: "alle", bedeutung: "Zufällige Reihenfolge der zwei Aufgabenteile, z. B. vermeidbar>unvermeidbar.", werte: { vermeidbar: "avoidable", unvermeidbar: "unavoidable" } },
  { de: "adhs_fragen_position", intern: "adhd_questions_position", wo: "alle", bedeutung: "Ob die zwei ADHS-Fragen am Anfang oder am Ende standen.", werte: { anfang: "start", ende: "end" } },
  { de: "regel_erklaert", intern: "explain_rule", wo: "alle", bedeutung: "1 = Die Regel wurde vor jedem Aufgabenteil erklärt und abgefragt." },

  { de: "bildschirm_breite", intern: "width", wo: "geraet", bedeutung: "Breite des Browserfensters in Pixeln." },
  { de: "bildschirm_hoehe", intern: "height", wo: "geraet", bedeutung: "Höhe des Browserfensters in Pixeln." },
  { de: "browser", intern: "browser", wo: "geraet", bedeutung: "Name des Browsers." },
  { de: "browser_version", intern: "browser_version", wo: "geraet", bedeutung: "Version des Browsers." },
  { de: "betriebssystem", intern: "os", wo: "geraet", bedeutung: "Betriebssystem des Geräts." },
  { de: "mobilgeraet", intern: "mobile", wo: "geraet", bedeutung: "Smartphone oder Tablet (ja) oder Computer (nein).", werte: { ja: "true", nein: "false" } },

  { de: "bestaetigt_alter", intern: "c_age", wo: "einwilligung", bedeutung: "1 = Altersgrenzen bestätigt." },
  { de: "bestaetigt_deutsch", intern: "c_language", wo: "einwilligung", bedeutung: "1 = ausreichende Deutschkenntnisse bestätigt." },
  { de: "bestaetigt_gesundheit", intern: "c_health", wo: "einwilligung", bedeutung: "1 = keine schwerwiegende Erkrankung laut Teilnahmevoraussetzungen bestätigt." },
  { de: "bestaetigt_sehen", intern: "c_vision", wo: "einwilligung", bedeutung: "1 = Bildschirm gut lesbar bestätigt." },
  { de: "bestaetigt_nuechtern", intern: "c_sober", wo: "einwilligung", bedeutung: "1 = kein Einfluss von Alkohol oder anderen Substanzen bestätigt. Nur vorhanden, wenn die Frage in den Einstellungen eingeschaltet ist.", wenn: "ASK_SOBER" },
  { de: "einwilligung", intern: "c_consent", wo: "einwilligung", bedeutung: "1 = in Teilnahme und Datenverarbeitung eingewilligt." },
  { de: "bearbeitungszeit_ms", intern: "rt", wo: "einwilligung, person, verstaendnisfrage, fragebogen, adhs_fragen, abschlussfragen", bedeutung: "Zeit auf dieser Seite in Millisekunden." },

  { de: "alter", intern: "age", wo: "person", bedeutung: "Alter in Jahren." },
  { de: "geschlecht", intern: "gender", wo: "person", bedeutung: "maennlich, weiblich oder divers." },
  { de: "taetigkeit", intern: "occupation", wo: "person", bedeutung: "Haupttätigkeit: schueler, student, berufstaetig, ausbildung, arbeitssuchend oder sonstiges." },
  { de: "adhs_diagnose", intern: "adhd_diagnosis", wo: "adhs_fragen", bedeutung: "ADHS-Diagnose laut Selbstangabe: ja, nein oder keine_angabe." },
  { de: "adhs_medikamente", intern: "adhd_medication", wo: "adhs_fragen", bedeutung: "Aktuelle ADHS-Medikamente laut Selbstangabe: ja oder nein." },

  { de: "bedingung", intern: "condition", wo: "wahl, verstaendnisfrage", bedeutung: "Aufgabenteil: Wartezeit vermeidbar oder unvermeidbar.", werte: { vermeidbar: "avoidable", unvermeidbar: "unavoidable" } },
  { de: "versuch", intern: "attempt", wo: "verstaendnisfrage", bedeutung: "Wievielter Versuch bei der Verständnisfrage. Nur vorhanden, wenn die Frage in den Einstellungen eingeschaltet ist.", wenn: "COMPREHENSION_CHECK" },
  { de: "richtig", intern: "correct", wo: "verstaendnisfrage", bedeutung: "1 = Verständnisfrage richtig beantwortet, 0 = falsch. Nur vorhanden, wenn die Frage in den Einstellungen eingeschaltet ist.", wenn: "COMPREHENSION_CHECK" },

  { de: "teil", intern: "block", wo: "wahl", bedeutung: "Erster oder zweiter Aufgabenteil (1 oder 2). Leer bei Übungsdurchgängen." },
  { de: "durchgang", intern: "trial_in_block", wo: "wahl", bedeutung: "Nummer des Durchgangs im Teil (1 bis 25). Leer bei Übungsdurchgängen." },
  { de: "durchgangsart", intern: "trial_kind", wo: "wahl", bedeutung: "Übung, regulärer Durchgang oder Catch Trial. Nur reguläre Durchgänge zählen für die Kennwerte.", werte: { uebung: "practice", regulaer: "regular", catch: "catch" } },
  { de: "paar", intern: "item_id", wo: "wahl", bedeutung: "Kennung des Paars. r_60_10 = früher Betrag 60, späte Wartezeit 10 Sekunden. practice_… = Übung, catch_… = Catch Trial." },
  { de: "frueh_betrag", intern: "early_points", wo: "wahl", bedeutung: "Betrag der früheren Möglichkeit in Euro (fiktiv)." },
  { de: "frueh_wartezeit_s", intern: "early_delay_s", wo: "wahl", bedeutung: "Wartezeit der früheren Möglichkeit in Sekunden." },
  { de: "spaet_betrag", intern: "late_points", wo: "wahl", bedeutung: "Betrag der späteren Möglichkeit in Euro (fiktiv)." },
  { de: "spaet_wartezeit_s", intern: "late_delay_s", wo: "wahl", bedeutung: "Wartezeit der späteren Möglichkeit in Sekunden." },
  { de: "frueh_seite", intern: "early_side", wo: "wahl", bedeutung: "Bildschirmseite, auf der die frühere Möglichkeit stand (zufällig).", werte: { links: "left", rechts: "right" } },
  { de: "wahl", intern: "choice", wo: "wahl", bedeutung: "Gewählte Möglichkeit.", werte: { frueh: "early", spaet: "late" } },
  { de: "frueh_gewaehlt", intern: "chose_early", wo: "wahl", bedeutung: "1 = frühere Möglichkeit gewählt, 0 = spätere. Aus dieser Spalte entsteht die Sofortwahlrate." },
  { de: "reaktionszeit_ms", intern: "rt_ms", wo: "wahl", bedeutung: "Zeit vom Erscheinen der zwei Möglichkeiten bis zur Wahl in Millisekunden." },
  { de: "gewinn", intern: "points_won", wo: "wahl", bedeutung: "Erhaltener Betrag in diesem Durchgang in Euro (fiktiv)." },
  { de: "guthaben_danach", intern: "score_after", wo: "wahl", bedeutung: "Guthaben im Teil nach diesem Durchgang." },
  { de: "dauer_durchgang_ms", intern: "trial_total_ms", wo: "wahl", bedeutung: "Tatsächliche Dauer des ganzen Durchgangs in Millisekunden." },
  { de: "verlassen_anzahl", intern: "away_count_trial", wo: "wahl", bedeutung: "Wie oft die Person in diesem Durchgang die Seite verlassen hat (anderer Tab, andere App)." },
  { de: "verlassen_ms", intern: "away_ms_trial", wo: "wahl", bedeutung: "Wie lange die Seite in diesem Durchgang verlassen war, in Millisekunden." },
  { de: "catch_richtig", intern: "catch_correct", wo: "wahl", bedeutung: "Nur bei Catch Trials: 1 = die klar bessere Möglichkeit gewählt, 0 = nicht." },

  { de: "fragebogen", intern: "questionnaire", wo: "fragebogen", bedeutung: "asrs oder upps." },
  { de: "seite", intern: "page", wo: "fragebogen", bedeutung: "Seitennummer im Fragebogen. Die Antworten dieser Seite stehen in den Spalten asrs_… oder upps_…" },

  { de: "ablenkung", intern: "end_distraction", wo: "abschlussfragen", bedeutung: "Selbstangabe, ob während der Wartezeiten etwas anderes gemacht wurde: nie, selten, manchmal, oft. Nur vorhanden, wenn die Frage in den Einstellungen eingeschaltet ist.", wenn: "ASK_DISTRACTION_TECH" },
  { de: "technische_probleme", intern: "end_tech_problems", wo: "abschlussfragen", bedeutung: "Technische Probleme: ja oder nein. Nur vorhanden, wenn die Frage in den Einstellungen eingeschaltet ist.", wenn: "ASK_DISTRACTION_TECH" },
  { de: "technische_probleme_text", intern: "end_tech_text", wo: "abschlussfragen", bedeutung: "Freitext zu technischen Problemen. Nur vorhanden, wenn die Frage in den Einstellungen eingeschaltet ist.", wenn: "ASK_DISTRACTION_TECH" },
  { de: "daten_verwenden", intern: "end_use_data", wo: "abschlussfragen", bedeutung: "Antwort auf die Frage, ob die Daten ausgewertet werden sollen: ja oder nein. Bei nein fällt der Datensatz aus der Auswertung." },

  { de: "n_regulaer", intern: "n_regular", wo: "zusammenfassung", bedeutung: "Zahl der bearbeiteten regulären Durchgänge (vollständig = 40)." },
  { de: "sofortwahl_vermeidbar", intern: "early_rate_avoidable", wo: "zusammenfassung", bedeutung: "Anteil früher Wahlen im Teil „vermeidbar“ (0 bis 1). Nur zur Kontrolle; die Auswertung rechnet neu." },
  { de: "sofortwahl_unvermeidbar", intern: "early_rate_unavoidable", wo: "zusammenfassung", bedeutung: "Anteil früher Wahlen im Teil „unvermeidbar“ (0 bis 1). Nur zur Kontrolle." },
  { de: "delay_aversion_index", intern: "delay_aversion_index", wo: "zusammenfassung", bedeutung: "Sofortwahlrate vermeidbar minus unvermeidbar. Nur zur Kontrolle." },
  { de: "catch_fehler", intern: "catch_errors", wo: "zusammenfassung", bedeutung: "Zahl der falsch beantworteten Catch Trials (von 10)." },
  { de: "durchgaenge_verlassen", intern: "regular_trials_away", wo: "zusammenfassung", bedeutung: "Zahl der regulären Durchgänge, in denen die Seite verlassen wurde." },
  { de: "abgeschlossen_am", intern: "finished_at", wo: "zusammenfassung", bedeutung: "Datum des Abschlusses, ohne Uhrzeit." }
];

// Angaben, die die App intern braucht, die aber nicht in die Datei kommen.
const COLUMNS_DROP = ["keep", "stimulus", "trial_type", "plugin_version", "question_order", "sub", "response",
  "trial_index", "trial_uid", "away_count", "away_ms", "fullscreen", "value"];

if (typeof module !== "undefined") module.exports = { COLUMNS: COLUMNS, COLUMNS_DROP: COLUMNS_DROP };
