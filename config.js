// Einstellungen der Studie. Alles, was sich ohne Programmierkenntnisse ändern lässt, steht hier.
const CONFIG = {
  APP_VERSION: "0.6.3",

  // DataPipe-Experiment-ID (pipe.jspsych.org, Speicherort Zenodo). Leer = Testmodus:
  // Daten werden nicht hochgeladen, sondern am Ende zum Download angeboten.
  // Mit ID, aber ohne freigegebenen Einwilligungstext (CONSENT_TEXT_FINAL unten) bleibt der normale Link im Testmodus.
  // Probelauf mit Upload: Link mit ?probelauf=1 aufrufen (Dateien heißen probelauf_..., fallen aus der Auswertung).
  DATAPIPE_EXPERIMENT_ID: "78w2OxMMRSKN",

  // Titel der Studie (erscheint auf der Startseite, über der Einwilligung und im Browser-Tab).
  STUDY_TITLE: "ADHS-Symptomatik und impulsive Entscheidungen",

  // Dauerangaben auf der Startseite. VORLÄUFIG: nach dem Probelauf mit echten Personen anpassen.
  DURATION_TOTAL: "etwa 30 Minuten",
  DURATION_TASK: "etwa 20 Minuten",
  DURATION_QUESTIONNAIRES: "etwa 5 bis 10 Minuten",

  // Kontakt für Rückfragen (erscheint in Einwilligung und Abschluss).
  CONTACT_NAME: "Leni Neuhauser",
  CONTACT_ORG: "Medical School Berlin",
  CONTACT_EMAIL: "leni.neuhauser@student.medicalschool-berlin.de",

  // Erst auf true setzen, wenn der Einwilligungstext final und von der Hochschule freigegeben ist.
  // Solange false, gibt es keinen Echtbetrieb (nur Testmodus oder Probelauf mit ?probelauf=1).
  CONSENT_TEXT_FINAL: false,

  // Reihenfolge der Studienteile:
  //   "questionnaires_first" = erst Fragebögen, dann Aufgabe (wie im Exposé)
  //   "task_first"           = erst Aufgabe, dann Fragebögen (Festlegung vom 17.11.2026)
  ORDER: "task_first",

  // Wo stehen die zwei Fragen zu ADHS-Diagnose und ADHS-Medikamenten?
  //   "end"   = nach Aufgabe und Fragebögen, vor den Abschlussfragen (Stand 18.11.2026)
  //   "start" = auf der Seite „Angaben zur Person“ am Anfang
  ADHD_QUESTIONS: "end",

  // Den Teilnehmenden vor jedem Teil erklären, wie es nach der Belohnung weitergeht, mit Schaubild und Verständnisfrage.
  //   true  = Regel wird vor jedem Teil erklärt und abgefragt (Festlegung vom 17.11.2026).
  //   false = kein Hinweis: Die Teilnehmenden erleben den Unterschied nur selbst.
  EXPLAIN_RULE: true,
  // Verständnisfrage nach der Erklärung jedes Teils (wirkt nur mit EXPLAIN_RULE: true).
  // Seit 19.11.2026 aus (Rückmeldung Leni). Ohne sie lässt sich nicht prüfen, ob die Regel verstanden wurde.
  COMPREHENSION_CHECK: false,

  // Teilnahmevoraussetzung „nicht unter dem Einfluss von Alkohol oder anderen Substanzen“ abfragen.
  // Seit 19.11.2026 aus (Rückmeldung Leni).
  ASK_SOBER: false,

  // Abschlussfragen zu Ablenkung während der Wartezeiten und zu technischen Problemen.
  // Seit 19.11.2026 aus (Rückmeldung Leni). Die Frage, ob die Daten ausgewertet werden sollen, bleibt.
  ASK_DISTRACTION_TECH: false,

  // Die Regel zusätzlich während der Durchgänge als Zeile über den Schaltflächen anzeigen.
  SHOW_RULE_LINE: false,

  // Abschnitt „Versuchspersonenstunden“ auf der Abschlussseite, ein Eintrag pro Absatz. Leere Liste [] = kein Abschnitt.
  // Wortlaut von Leni (19.11.2026). VORLÄUFIG, bis das Verfahren mit Sona feststeht.
  CREDIT_TITLE: "Versuchspersonenstunden (MSB)",
  CREDIT_TEXT: [
    "Studierende der Medical School Berlin, die für ihre Teilnahme Versuchspersonenstunden erhalten möchten, senden bitte einen Screenshot dieser Abschlussseite sowie ihren fünfstelligen SONA-Code an die unten angegebene E-Mail-Adresse. Den Code finden Sie unter „Benutzerdaten“ in Ihrem SONA-Konto.",
    "Die Zuordnung der Versuchspersonenstunden erfolgt ausschließlich über den SONA-Code. Eine Verknüpfung Ihrer E-Mail-Adresse mit Ihren Studiendaten ist nicht möglich. Ihre Studiendaten bleiben somit anonym."
  ],

  // Automatische Verbuchung der Versuchspersonenstunden in SONA (SONA-Infoblatt der MSB, Abschnitt 3.3.4, zweiter Weg).
  // Leer "" = aus; dann gilt nur CREDIT_TEXT oben.
  // Einrichten: 1. In SONA die Studie als „online external study“ anlegen und an die Studienadresse
  //                ?sona_id=%SURVEY_CODE% anhängen.
  //             2. SONA zeigt danach eine „Completion URL (client-side)“. Diese hier eintragen, OHNE das XXX am Ende,
  //                also endend auf "&survey_code=".
  // Wer über SONA kommt, sieht dann auf der Abschlussseite CREDIT_TEXT_SONA und eine Schaltfläche zurück zu SONA.
  // Wer über einen anderen Link kommt, sieht weiter CREDIT_TEXT. Der SONA-Code wird NICHT in der Datendatei gespeichert.
  SONA_COMPLETION_URL: "",
  // VORSCHLAG, von Leni zu bestätigen.
  CREDIT_TEXT_SONA: [
    "Sie haben die Studie über SONA gestartet. Klicken Sie bitte auf die Schaltfläche, damit SONA Ihre Teilnahme verbucht.",
    "SONA erfährt dabei nur, dass Sie teilgenommen haben. Ihre Antworten werden nicht an SONA übertragen."
  ],
  CREDIT_BUTTON_SONA: "Teilnahme in SONA verbuchen",

  // Smartphones und Tablets zulassen (true) oder nur Computer (false).
  ALLOW_MOBILE: true,

  AGE_MIN: 18,
  AGE_MAX: 60,

  // ---- Choice-Delay-Aufgabe ----
  // Belohnungen sind fiktive Geldbeträge in Euro (Stand 19.11.2026, vorher Punkte). Es wird nichts ausgezahlt.
  // Reguläre Durchgänge: jede Kombination aus EARLY_AMOUNTS x LATE_DELAYS_S kommt pro Bedingung einmal vor.
  // Anzahl pro Bedingung = Anzahl EARLY_AMOUNTS x Anzahl LATE_DELAYS_S (hier 5 x 4 = 20).
  // Beispiel für 10 pro Bedingung: EARLY_AMOUNTS: [40, 50, 60, 70, 80] und LATE_DELAYS_S: [5, 15].
  EARLY_DELAY_S: 1,
  EARLY_AMOUNTS: [40, 50, 60, 70, 80], // Euro, frühere Möglichkeit
  LATE_AMOUNT: 100,                    // Euro, spätere Möglichkeit
  LATE_DELAYS_S: [5, 10, 15, 20],

  // Catch Trials pro Bedingung (Kontrolldurchgänge mit einer klar besseren Option, nicht in den Kennwerten).
  // "correct" nennt die Option, die klar besser ist. Zeilen löschen = weniger Catch Trials.
  // Wer die Zahl ändert, passt in auswertung/auswertung.R die Regel MAX_CATCH_FEHLER an.
  CATCH_TRIALS: [
    { id: "catch_A1", early: { amount: 100, delay: 1 }, late: { amount: 60, delay: 10 }, correct: "early" },
    { id: "catch_A2", early: { amount: 100, delay: 1 }, late: { amount: 50, delay: 5 }, correct: "early" },
    { id: "catch_B1", early: { amount: 40, delay: 5 }, late: { amount: 100, delay: 5 }, correct: "late" },
    { id: "catch_B2", early: { amount: 60, delay: 10 }, late: { amount: 100, delay: 10 }, correct: "late" },
    { id: "catch_B3", early: { amount: 50, delay: 1 }, late: { amount: 100, delay: 1 }, correct: "late" }
  ],

  // Übungsdurchgänge vor jedem Teil (freie Wahl, nicht ausgewertet).
  PRACTICE_TRIALS: [
    { id: "practice_1", early: { amount: 50, delay: 1 }, late: { amount: 100, delay: 5 } },
    { id: "practice_2", early: { amount: 70, delay: 1 }, late: { amount: 100, delay: 10 } },
    { id: "practice_3", early: { amount: 40, delay: 1 }, late: { amount: 100, delay: 5 } }
  ],

  FEEDBACK_S: 1.5, // Anzeige des erhaltenen Betrags
  ITI_S: 0.5       // Pause zwischen Durchgängen
};
