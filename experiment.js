/* Studie "ADHS-Symptomatik und impulsive Entscheidungen": Ablauf der Online-Erhebung.
   Parameter stehen in config.js, Fragebogen-Items in questionnaires.js. */
(function () {
  "use strict";

  const C = CONFIG;
  const urlParams = new URLSearchParams(window.location.search);
  // Echtbetrieb: Experiment-ID eingetragen UND Einwilligungstext freigegeben.
  // Probelauf: Experiment-ID eingetragen, Einwilligungstext noch nicht freigegeben, Aufruf mit ?probelauf=1.
  //   Lädt hoch (Dateinamen beginnen mit "probelauf_", Spalte modus = probelauf, fällt aus der Auswertung).
  // Sonst Testmodus: kein Upload, Download am Ende.
  const HAS_ID = C.DATAPIPE_EXPERIMENT_ID !== "";
  const LIVE = HAS_ID && C.CONSENT_TEXT_FINAL === true;
  const PILOT = HAS_ID && !LIVE && urlParams.get("probelauf") === "1";
  const UPLOAD = LIVE || PILOT;
  const FILE_PREFIX = PILOT ? "probelauf_" : "";
  // Code, den SONA beim Start anhängt (?sona_id=...). Er dient nur dem Rücksprung zu SONA am Ende
  // und wird nicht in den Daten gespeichert.
  const SONA_ID = /^[A-Za-z0-9_-]{1,64}$/.test(urlParams.get("sona_id") || "") ? urlParams.get("sona_id") : "";
  const SONA_BACK = C.SONA_COMPLETION_URL && SONA_ID ? C.SONA_COMPLETION_URL + encodeURIComponent(SONA_ID) : "";
  // Zeitraffer nur im Testmodus, z. B. index.html?speed=20
  const SPEED = !LIVE && Number(urlParams.get("speed")) > 0 ? Number(urlParams.get("speed")) : 1;
  const ms = (seconds) => Math.round((seconds * 1000) / SPEED);

  const BTN = jsPsychHtmlButtonResponse;
  const KEY = jsPsychHtmlKeyboardResponse;

  // ---------------------------------------------------------------- Abwesenheit (Tab/Fenster verlassen)
  const away = { since: null, count: 0, ms: 0 };
  const isAway = () => document.hidden || !document.hasFocus();
  function checkAway() {
    const now = performance.now();
    if (isAway()) {
      if (away.since === null) { away.since = now; away.count += 1; }
    } else if (away.since !== null) {
      away.ms += now - away.since; away.since = null;
    }
  }
  window.addEventListener("blur", checkAway);
  window.addEventListener("focus", checkAway);
  document.addEventListener("visibilitychange", checkAway);
  function takeAway() {
    const now = performance.now();
    let total = away.ms;
    if (away.since !== null) { total += now - away.since; away.since = now; }
    const result = { count: away.count, ms: Math.round(total) };
    away.count = away.since !== null ? 1 : 0;
    away.ms = 0;
    return result;
  }

  // ---------------------------------------------------------------- jsPsych
  let current = null; // laufender Aufgaben-Durchgang
  let score = 0;

  const jsPsych = initJsPsych({
    on_trial_finish: function (data) {
      checkAway();
      const a = takeAway();
      data.away_count = a.count;
      data.away_ms = a.ms;
      if (current) {
        // Eine Abwesenheit, die über mehrere Abschnitte eines Durchgangs reicht, zählt nur einmal.
        current.away_count += a.count - (current.endedAway && a.count > 0 ? 1 : 0);
        current.away_ms += a.ms;
        current.endedAway = away.since !== null;
        if (data.sub === "iti") {
          jsPsych.data.get().filter({ trial_uid: current.uid }).addToAll({
            trial_total_ms: Math.round(performance.now() - current.t0),
            away_count_trial: current.away_count,
            away_ms_trial: current.away_ms,
            score_after: score
          });
          current = null;
        }
      }
    }
  });

  const participantId = jsPsych.randomization.randomID(12);
  const blockOrder = jsPsych.randomization.shuffle(["avoidable", "unavoidable"]);
  jsPsych.data.addProperties({
    participant_id: participantId,
    block_order: blockOrder.join(">"),
    app_version: C.APP_VERSION,
    mode: LIVE ? "live" : (PILOT ? "probelauf" : "test"),
    speed: SPEED,
    study_order: C.ORDER,
    adhd_questions_position: C.ADHD_QUESTIONS,
    explain_rule: C.EXPLAIN_RULE ? 1 : 0
  });
  if (C.ADHD_QUESTIONS !== "start" && C.ADHD_QUESTIONS !== "end") {
    fatal('ADHD_QUESTIONS in config.js muss "start" oder "end" sein.'); return;
  }
  if (C.ORDER !== "questionnaires_first" && C.ORDER !== "task_first") {
    fatal('ORDER in config.js muss "questionnaires_first" oder "task_first" sein.'); return;
  }

  // Fragebögen, deren Wortlaut noch nicht mit dem Original abgeglichen ist, sperren den Echtbetrieb.
  const UNVERIFIED = QUESTIONNAIRES.filter((q) => q.wording_verified === false).map((q) => q.id);

  function fatal(message) {
    document.body.innerHTML = '<div style="max-width:640px;margin:80px auto;font-family:sans-serif">' +
      '<h1>Konfigurationsfehler</h1><p>' + message + "</p></div>";
  }
  if (LIVE) {
    const problems = [];
    const missing = QUESTIONNAIRES.filter((q) => q.items.length === 0).map((q) => q.id);
    if (missing.length > 0) problems.push("Fragebogen-Items fehlen: " + missing.join(", "));
    if (UNVERIFIED.length > 0) problems.push("Wortlaut des Fragebogens ist noch nicht freigegeben (wording_verified): " + UNVERIFIED.join(", "));
    if (problems.length > 0) { fatal(problems.join("<br>")); return; }
  } else {
    const banner = document.createElement("div");
    banner.className = "testbanner";
    banner.textContent = (PILOT ? "PROBELAUF · Upload zu DataPipe" : "TESTMODUS · kein Upload") + (SPEED !== 1 ? " · Zeitraffer x" + SPEED : "") +
      (UNVERIFIED.length > 0 ? " · " + UNVERIFIED.join(", ").toUpperCase() + " vorläufig" : "");
    document.body.appendChild(banner);
    document.body.classList.add("testmode");
  }

  // Datendatei: deutsche Überschriften und Werte laut columns.js, Fragebogen-Spalten am Ende.
  function csvData() {
    const rows = jsPsych.data.get().filter({ keep: true }).values();
    const itemIds = [];
    QUESTIONNAIRES.forEach((q) => q.items.forEach((item) => itemIds.push(item.id)));
    const known = {};
    COLUMNS.forEach((c) => { known[c.intern] = true; });
    itemIds.forEach((id) => { known[id] = true; });
    COLUMNS_DROP.forEach((name) => { known[name] = true; });
    const extra = []; // unbekannte Angaben gehen nicht verloren, sondern hängen unübersetzt am Ende
    rows.forEach((r) => Object.keys(r).forEach((k) => { if (!known[k] && extra.indexOf(k) < 0) extra.push(k); }));
    // Spalten zu ausgeschalteten Fragen (Eigenschaft "wenn" in columns.js) entfallen.
    const cols = COLUMNS.filter((c) => !c.wenn || C[c.wenn]).map((c) => ({ head: c.de, key: c.intern, werte: c.werte }))
      .concat(itemIds.map((id) => ({ head: id, key: id })))
      .concat(extra.map((k) => ({ head: k, key: k })));
    const translate = function (col, value) {
      if (value === null || value === undefined) return "";
      let text = typeof value === "object" ? JSON.stringify(value) : String(value);
      if (col.werte) {
        const back = {};
        Object.keys(col.werte).forEach((de) => { back[col.werte[de]] = de; });
        text = text.split(">").map((token) => (back[token] !== undefined ? back[token] : token)).join(">");
      }
      return text;
    };
    const quote = (text) => '"' + String(text).replace(/"/g, '""') + '"';
    const lines = [cols.map((c) => quote(c.head)).join(",")];
    rows.forEach((r) => lines.push(cols.map((c) => quote(translate(c, r[c.key]))).join(",")));
    return lines.join("\r\n") + "\r\n";
  }

  function flattenResponse(data) {
    if (data.response && typeof data.response === "object") {
      Object.assign(data, data.response);
      delete data.response;
    }
  }

  // ---------------------------------------------------------------- Speichern über DataPipe (-> Zenodo)
  // Eigene Umsetzung statt des Pipe-Plugins: Das Plugin meldet auch bei einem Netzwerkfehler "Erfolg".
  const sleep = (t) => new Promise((resolve) => setTimeout(resolve, t));
  async function upload(filename, data) {
    let lastError = "";
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch("https://pipe.jspsych.org/api/data/", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "*/*" },
          body: JSON.stringify({ experimentID: C.DATAPIPE_EXPERIMENT_ID, filename: filename, data: data })
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json && !json.error) return { success: true, attempts: attempt };
        // Antwort auf einen früheren Versuch ging verloren, die Datei liegt aber schon dort.
        if (attempt > 1 && json && json.error === "FILE_EXISTS") return { success: true, attempts: attempt, note: "FILE_EXISTS" };
        lastError = "HTTP " + res.status + (json ? " " + (json.error || json.message || "") : "");
      } catch (e) {
        lastError = String(e);
      }
      if (attempt < 3) await sleep(1500 * attempt);
    }
    return { success: false, attempts: 3, error: lastError };
  }
  function saveTrial(suffix, rowType, message) {
    return {
      type: jsPsychCallFunction,
      async: true,
      func: function (done) {
        jsPsych.getDisplayElement().innerHTML = message;
        upload(FILE_PREFIX + participantId + suffix, csvData()).then(done);
      },
      data: { row_type: rowType }
    };
  }

  // ---------------------------------------------------------------- Bildschirm wach halten, versehentliches Schließen
  let wakeLock = null;
  let wakeWanted = false;
  async function keepAwake() {
    wakeWanted = true;
    try {
      if ("wakeLock" in navigator && !document.hidden) wakeLock = await navigator.wakeLock.request("screen");
    } catch (e) { /* nicht unterstützt oder abgelehnt: Studie läuft trotzdem */ }
  }
  function allowSleep() {
    wakeWanted = false;
    try { if (wakeLock) wakeLock.release(); } catch (e) { /* egal */ }
    wakeLock = null;
  }
  document.addEventListener("visibilitychange", function () { if (wakeWanted && !document.hidden) keepAwake(); });

  const warnOnLeave = function (e) { e.preventDefault(); e.returnValue = ""; };
  window.addEventListener("beforeunload", warnOnLeave);

  let isMobile = false;
  const timeline = [];

  // ---------------------------------------------------------------- 1 Gerät prüfen
  timeline.push({
    type: jsPsychBrowserCheck,
    features: ["width", "height", "browser", "browser_version", "os", "mobile", "fullscreen"],
    inclusion_function: (d) => C.ALLOW_MOBILE || d.mobile === false,
    exclusion_message: () =>
      "<h1>Bitte am Computer teilnehmen</h1><p>Diese Studie funktioniert nur an einem Computer oder Laptop, " +
      "nicht auf Smartphone oder Tablet. Bitte öffnen Sie den Link dort erneut. Vielen Dank!</p>",
    data: { keep: true, row_type: "browser" },
    on_finish: function (d) { isMobile = d.mobile === true; }
  });

  // ---------------------------------------------------------------- 1b Startseite: Was kommt, worum wir bitten
  document.title = "Studie: " + C.STUDY_TITLE;
  const TASK_FIRST = C.ORDER === "task_first";
  const STEP_TASK = "<li>" + (TASK_FIRST ? "Zuerst bearbeiten Sie" : "Im Anschluss bearbeiten Sie noch") +
    " eine Entscheidungsaufgabe in zwei Teilen (" + C.DURATION_TASK + "). Sie wählen jeweils zwischen zwei Geldbeträgen. " +
    "Das Geld ist fiktiv und wird nicht ausgezahlt. Bevor die Aufgabe beginnt, haben Sie kurz Zeit, sie zu üben.</li>";
  const STEP_QUEST = "<li>" + (TASK_FIRST ? "Im Anschluss bearbeiten Sie noch" : "Zuerst bearbeiten Sie") +
    " zwei Fragebögen (" + C.DURATION_QUESTIONNAIRES + ").</li>";
  timeline.push({
    type: BTN,
    stimulus:
      '<div class="left"><h1>Willkommen</h1>' +
      "<p>Vielen Dank, dass Sie an der Studie „" + C.STUDY_TITLE + "“ teilnehmen möchten. Sie dauert " + C.DURATION_TOTAL + ".</p>" +
      "<h2>Das kommt auf Sie zu</h2><ol>" +
      (TASK_FIRST ? STEP_TASK + STEP_QUEST : STEP_QUEST + STEP_TASK) +
      "<li>Zum Schluss folgen noch einige Angaben zu Ihnen als Person.</li></ol>" +
      "<h2>Darum bitten wir Sie</h2><ul>" +
      "<li>Suchen Sie sich einen ruhigen Ort, an dem Sie ungestört sind.</li>" +
      "<li>Bearbeiten Sie die Studie am Stück. Sie lässt sich nicht unterbrechen und später fortsetzen.</li>" +
      "<li>Schalten Sie Benachrichtigungen stumm (z. B. „Nicht stören“) und legen Sie andere Geräte weg.</li>" +
      "<li>Versetzen Sie sich in die Lage, dass das Geld in der Aufgabe für Sie einen echten Wert hat. " +
      "Entscheiden Sie so, wie Sie es dann tun würden.</li>" +
      "<li>Antworten Sie in den Fragebögen so, wie es auf Sie persönlich zutrifft.</li></ul>" +
      '<p class="hint">Auf der nächsten Seite folgen die Teilnahmeinformation und die Einwilligung.</p></div>',
    choices: ["Weiter"]
  });

  // ---------------------------------------------------------------- 2 Information und Einwilligung
  timeline.push({
    type: jsPsychSurveyHtmlForm,
    html:
      '<div class="left"><h1>Studie „' + C.STUDY_TITLE + '“</h1>' +
      '<div class="placeholder"><b>PLATZHALTER.</b> Hier steht die Teilnahmeinformation mit Datenschutzhinweis ' +
      "in der von der Hochschule freigegebenen Fassung: Zweck, Ablauf, Dauer (ca. 30 Minuten), Freiwilligkeit, " +
      "Abbruch jederzeit ohne Nachteile, Art der Daten (auch Angaben zur Gesundheit), anonyme Speicherung, " +
      "Speicherort, Löschfrist, Verantwortliche, Kontakt: " + C.CONTACT_NAME + ", " + C.CONTACT_ORG + ", " + C.CONTACT_EMAIL + ".</div>" +
      "<h2>Teilnahmevoraussetzungen und Einwilligung</h2>" +
      '<div class="form">' +
      '<label class="check"><input type="checkbox" name="c_age" value="1" required><span>Ich bin zwischen ' + C.AGE_MIN + " und " + C.AGE_MAX + " Jahre alt.</span></label>" +
      '<label class="check"><input type="checkbox" name="c_language" value="1" required><span>Ich verstehe Deutsch gut genug, um Fragebögen und Anleitungen sicher zu bearbeiten.</span></label>' +
      '<label class="check"><input type="checkbox" name="c_health" value="1" required><span>Ich habe aktuell keine schwerwiegende psychiatrische oder neurologische Erkrankung, die meine geistige Leistungsfähigkeit, mein Aufgabenverständnis, meine Aufmerksamkeit oder meine Entscheidungsfähigkeit erheblich beeinträchtigt (z. B. akute psychotische oder manische Episode, schwere neurokognitive Störung, neurologische Erkrankung mit ausgeprägten kognitiven Beeinträchtigungen).</span></label>' +
      '<label class="check"><input type="checkbox" name="c_vision" value="1" required><span>Ich kann Texte auf diesem Bildschirm gut lesen (falls nötig mit Brille oder Kontaktlinsen).</span></label>' +
      (C.ASK_SOBER ? '<label class="check"><input type="checkbox" name="c_sober" value="1" required><span>Ich stehe gerade nicht unter dem Einfluss von Alkohol oder anderen berauschenden Substanzen.</span></label>' : "") +
      '<label class="check"><input type="checkbox" name="c_consent" value="1" required><span>Ich habe die Teilnahmeinformation gelesen und willige in die Teilnahme und in die beschriebene Verarbeitung meiner Daten ein.</span></label>' +
      '<p class="hint">Trifft einer der Punkte nicht zu, können Sie leider nicht teilnehmen. Schließen Sie dann bitte einfach dieses Fenster. Es werden keine Daten gespeichert.</p>' +
      "</div></div>",
    button_label: "Einwilligen und starten",
    data: { keep: true, row_type: "consent" },
    on_finish: flattenResponse
  });

  // ---------------------------------------------------------------- 3 Angaben zur Person
  // Die zwei ADHS-Fragen stehen je nach ADHD_QUESTIONS hier oder am Ende.
  const ADHD_FIELDS =
    '<label for="adhd_dx">Liegt bei Ihnen eine ADHS-Diagnose vor?</label>' +
    '<select id="adhd_dx" name="adhd_diagnosis" required><option value="">Bitte wählen</option>' +
    '<option value="ja">ja</option><option value="nein">nein</option><option value="keine_angabe">keine Angabe</option></select>' +
    '<label for="adhd_med">Nehmen Sie aktuell ADHS-Medikamente ein?</label>' +
    '<select id="adhd_med" name="adhd_medication" required><option value="">Bitte wählen</option>' +
    '<option value="ja">ja</option><option value="nein">nein</option></select>';
  timeline.push({
    type: jsPsychSurveyHtmlForm,
    html:
      '<div class="left"><h1>Angaben zur Person</h1><div class="form">' +
      '<label for="age">Alter in Jahren</label>' +
      '<input type="number" id="age" name="age" min="' + C.AGE_MIN + '" max="' + C.AGE_MAX + '" step="1" required>' +
      '<label for="gender">Geschlecht</label>' +
      '<select id="gender" name="gender" required><option value="">Bitte wählen</option>' +
      '<option value="maennlich">männlich</option><option value="weiblich">weiblich</option>' +
      '<option value="divers">divers</option></select>' +
      '<label for="occupation">Was beschreibt Ihre aktuelle Haupttätigkeit am besten?</label>' +
      '<select id="occupation" name="occupation" required><option value="">Bitte wählen</option>' +
      '<option value="schueler">Schüler*in</option><option value="student">Student*in</option>' +
      '<option value="berufstaetig">berufstätig</option><option value="ausbildung">in Ausbildung</option>' +
      '<option value="arbeitssuchend">arbeitssuchend</option><option value="sonstiges">Sonstiges</option></select>' +
      (C.ADHD_QUESTIONS === "start" ? ADHD_FIELDS : "") +
      "</div></div>",
    button_label: "Weiter",
    data: { keep: true, row_type: "demographics" },
    on_finish: flattenResponse
  });

  // ---------------------------------------------------------------- 4 Fragebögen
  const questionnaireNodes = [];
  if (QUESTIONNAIRES.every((q) => q.items.length > 0)) questionnaireNodes.push({
    type: BTN,
    stimulus: '<div class="left"><h1>Fragebögen</h1><p>' + (TASK_FIRST ? "Im Anschluss" : "Zuerst") +
      " bearbeiten Sie " + (TASK_FIRST ? "noch " : "") + "zwei Fragebögen (" + C.DURATION_QUESTIONNAIRES + ").</p>" +
      "<p>Bitte beantworten Sie jede Frage. Die Anleitung steht jeweils oben auf der Seite.</p></div>",
    choices: ["Weiter"]
  });
  const taskNodes = [];
  QUESTIONNAIRES.forEach(function (q) {
    if (q.items.length === 0) {
      questionnaireNodes.push({
        type: BTN,
        stimulus: '<div class="placeholder"><b>PLATZHALTER.</b> Hier folgt der Fragebogen „' + q.id.toUpperCase() +
          "“. Die Itemtexte sind noch nicht eingetragen (questionnaires.js).</div>",
        choices: ["Weiter"]
      });
      return;
    }
    const pages = [];
    for (let i = 0; i < q.items.length; i += q.items_per_page) pages.push(q.items.slice(i, i + q.items_per_page));
    pages.forEach(function (items, pageIndex) {
      questionnaireNodes.push({
        type: jsPsychSurveyLikert,
        preamble: '<div class="left"><h1>' + q.title + "</h1><p>" + q.instruction + "</p>" +
          '<p class="hint">Seite ' + (pageIndex + 1) + " von " + pages.length + "</p></div>",
        questions: items.map((item) => ({ prompt: item.text, name: item.id, labels: q.labels, required: true })),
        scale_width: Math.min(700, window.innerWidth - 32),
        button_label: "Weiter",
        data: { keep: true, row_type: "questionnaire", questionnaire: q.id, page: pageIndex + 1 },
        on_finish: flattenResponse
      });
    });
  });

  // ---------------------------------------------------------------- 5 Aufgabe
  // Beträge sind fiktive Euro. euro(60) -> "60 €", mit Tausenderpunkt und geschütztem Leerzeichen.
  const euro = (n) => Number(n).toLocaleString("de-DE") + "&nbsp;€";
  // Schaubild: Was passiert nach der Wahl? Beispiel 60 € nach 1 s gegen 100 € nach 10 s.
  function demo(cond) {
    const seg = (cls, grow, text) => '<span class="seg ' + cls + '"' + (grow ? ' style="flex-grow:' + grow + '"' : "") + ">" + text + "</span>";
    const next = seg("next", 0, "weiter");
    const early = seg("wait", 1, "1&nbsp;s") + seg("win", 0, "+" + euro(60)) +
      (cond === "unavoidable" ? seg("wait", 9, "9&nbsp;s warten") + next : next + seg("gap", 9, ""));
    const late = seg("wait", 10, "10&nbsp;s warten") + seg("win", 0, "+" + euro(100)) + next;
    return '<div class="demo" aria-label="Schaubild zum Ablauf"><p class="demo-title">Beispiel</p>' +
      '<p class="demo-label">Sie wählen <b>' + euro(60) + ' nach 1 Sekunde</b>:</p><div class="demo-track">' + early + "</div>" +
      '<p class="demo-label">Sie wählen <b>' + euro(100) + ' nach 10 Sekunden</b>:</p><div class="demo-track">' + late + "</div></div>";
  }

  const RULE = {
    avoidable: "In diesem Teil beginnt nach der Belohnung sofort der nächste Durchgang.",
    unavoidable: "In diesem Teil hängt die Dauer eines Durchgangs nicht von Ihrer Wahl ab."
  };
  const RULE_LONG = {
    avoidable:
      "<p><b>In diesem Teil gilt:</b> Sobald Sie Ihr Geld erhalten haben, beginnt sofort der nächste Durchgang.</p>" +
      "<p>Wenn Sie die frühere Belohnung wählen, ist der Durchgang also kürzer.</p>" + demo("avoidable"),
    unavoidable:
      "<p><b>In diesem Teil gilt:</b> Wie lange ein Durchgang dauert, hängt nicht von Ihrer Wahl ab.</p>" +
      "<p>Wenn Sie die frühere Belohnung wählen, erhalten Sie das Geld früher. Danach warten Sie aber noch die restliche Zeit ab, " +
      "bevor der nächste Durchgang beginnt. Der Durchgang wird dadurch nicht kürzer.</p>" + demo("unavoidable")
  };

  const RULE_LINE = C.EXPLAIN_RULE && C.SHOW_RULE_LINE;
  const RULE_BOX = (cond) => (C.EXPLAIN_RULE ? '<div class="box">' + RULE_LONG[cond] + "</div>" : "");

  const seconds = (n) => (n === 1 ? "1 Sekunde" : n + " Sekunden");
  const optionHtml = (o) => '<span class="pts">' + euro(o.amount) + '</span><span class="dly">nach ' + seconds(o.delay) + "</span>";
  const head = (label, cond) =>
    '<div class="task-head' + (RULE_LINE ? "" : " norule") + '"><span>' + label + '</span><span class="score">Guthaben: ' + euro(score) + "</span></div>" +
    (RULE_LINE ? '<p class="task-rule">' + RULE[cond] + "</p>" : "");
  const GHOST = '<div class="ghost" aria-hidden="true"><div class="option"><span class="pts">' + euro(0) + '</span><span class="dly">nach 1 Sekunde</span></div></div>';
  const WAIT_HTML = '<div class="task-body"><div class="wait-text">Bitte warten</div>' +
    '<div class="dots"><span></span><span></span><span></span></div></div>' + GHOST;

  function buildTrial(spec, cond, kind, label) {
    const earlyLeft = Math.random() < 0.5;
    const uid = cond + "_" + spec.id + "_" + jsPsych.randomization.randomID(4);
    const st = { uid: uid, t0: 0, away_count: 0, away_ms: 0, endedAway: false, chosen: null };
    const maxDelay = Math.max(spec.early.delay, spec.late.delay);

    const choice = {
      type: BTN,
      stimulus: () => head(label, cond) + '<div class="task-body"><p class="task-prompt">Was wählen Sie?</p></div>',
      choices: earlyLeft ? [optionHtml(spec.early), optionHtml(spec.late)] : [optionHtml(spec.late), optionHtml(spec.early)],
      button_html: (choiceHtml) => '<button class="option">' + choiceHtml + "</button>",
      button_layout: "flex",
      data: {
        keep: true, row_type: "choice", trial_uid: uid, condition: cond, trial_kind: kind, item_id: spec.id,
        early_points: spec.early.amount, early_delay_s: spec.early.delay,
        late_points: spec.late.amount, late_delay_s: spec.late.delay,
        early_side: earlyLeft ? "left" : "right"
      },
      on_start: function () { st.t0 = performance.now(); current = st; },
      on_finish: function (d) {
        const choseEarly = (d.response === 0) === earlyLeft;
        st.chosen = choseEarly ? spec.early : spec.late;
        d.choice = choseEarly ? "early" : "late";
        d.chose_early = choseEarly ? 1 : 0;
        d.rt_ms = Math.round(d.rt);
        d.points_won = st.chosen.amount;
        if (kind === "catch") d.catch_correct = d.choice === spec.correct ? 1 : 0;
        delete d.response;
        delete d.rt;
      }
    };
    const wait = {
      type: KEY, choices: "NO_KEYS",
      stimulus: () => head(label, cond) + WAIT_HTML,
      trial_duration: () => ms(st.chosen.delay),
      data: { sub: "wait" },
      on_finish: function () { score += st.chosen.amount; }
    };
    const feedback = {
      type: KEY, choices: "NO_KEYS",
      stimulus: () => head(label, cond) + '<div class="task-body"><div class="reward">+' + euro(st.chosen.amount) + "</div></div>" + GHOST,
      trial_duration: ms(C.FEEDBACK_S),
      data: { sub: "feedback" }
    };
    const rest = {
      timeline: [{
        type: KEY, choices: "NO_KEYS",
        stimulus: () => head(label, cond) + WAIT_HTML,
        trial_duration: () => ms(maxDelay - st.chosen.delay),
        data: { sub: "rest" }
      }],
      conditional_function: () => cond === "unavoidable" && maxDelay - st.chosen.delay > 0
    };
    const iti = {
      type: KEY, choices: "NO_KEYS",
      stimulus: () => head(label, cond) + '<div class="task-body"></div>' + GHOST,
      trial_duration: ms(C.ITI_S),
      data: { sub: "iti" }
    };
    return { timeline: [choice, wait, feedback, rest, iti] };
  }

  function regularSpecs() {
    const specs = [];
    C.EARLY_AMOUNTS.forEach(function (p) {
      C.LATE_DELAYS_S.forEach(function (d) {
        specs.push({
          id: "r_" + p + "_" + d,
          early: { amount: p, delay: C.EARLY_DELAY_S },
          late: { amount: C.LATE_AMOUNT, delay: d }
        });
      });
    });
    return specs;
  }

  function comprehensionCheck(cond) {
    let attempts = 0;
    let correct = false;
    const correctIndex = cond === "avoidable" ? 0 : 1;
    return {
      timeline: [
        {
          type: BTN,
          stimulus: "<h2>Kurze Verständnisfrage</h2><p>Was passiert in diesem Teil, nachdem Sie das Geld für die <b>frühere</b> Belohnung erhalten haben?</p>",
          choices: ["Der nächste Durchgang beginnt sofort.", "Ich warte noch die restliche Zeit ab, dann beginnt der nächste Durchgang."],
          data: { keep: true, row_type: "comprehension", condition: cond },
          on_finish: function (d) {
            attempts += 1;
            correct = d.response === correctIndex;
            d.attempt = attempts;
            d.correct = correct ? 1 : 0;
            delete d.response;
          }
        },
        {
          timeline: [{
            type: BTN,
            stimulus: '<p class="error">Das stimmt nicht ganz.</p><div class="box">' + RULE_LONG[cond] + "</div>",
            choices: ["Noch einmal"]
          }],
          conditional_function: () => !correct
        }
      ],
      loop_function: () => !correct
    };
  }

  function buildBlock(cond, blockNumber) {
    const parts = [];
    const nRegularAndCatch = C.EARLY_AMOUNTS.length * C.LATE_DELAYS_S.length + C.CATCH_TRIALS.length;
    parts.push({
      type: BTN,
      stimulus: "<h1>Teil " + blockNumber + " von 2</h1>" + RULE_BOX(cond) +
        "<p>Dieser Teil hat " + nRegularAndCatch + " Durchgänge. Vorher gibt es " + C.PRACTICE_TRIALS.length +
        " Übungsdurchgänge. In der Übung wählen Sie frei. Probieren Sie ruhig beide Möglichkeiten aus.</p>",
      choices: ["Weiter"]
    });
    if (C.EXPLAIN_RULE && C.COMPREHENSION_CHECK) parts.push(comprehensionCheck(cond));
    C.PRACTICE_TRIALS.forEach(function (spec, i) {
      parts.push(buildTrial(spec, cond, "practice", "Übung " + (i + 1) + " von " + C.PRACTICE_TRIALS.length));
    });
    parts.push({
      type: BTN,
      stimulus: "<h1>Die Übung ist vorbei</h1><p>Jetzt beginnt Teil " + blockNumber + " mit " + nRegularAndCatch +
        " Durchgängen. Das Guthaben startet bei " + euro(0) + ".</p>" + (C.EXPLAIN_RULE ? '<div class="box"><p>' + RULE[cond] + "</p></div>" : ""),
      choices: ["Teil " + blockNumber + " starten"],
      on_finish: function () { score = 0; }
    });
    const specs = jsPsych.randomization.shuffle(
      regularSpecs().map((s) => ({ spec: s, kind: "regular" }))
        .concat(C.CATCH_TRIALS.map((s) => ({ spec: s, kind: "catch" })))
    );
    specs.forEach(function (entry, i) {
      const node = buildTrial(entry.spec, cond, entry.kind, "Teil " + blockNumber + " · Durchgang " + (i + 1) + " von " + specs.length);
      node.timeline[0].data.block = blockNumber;
      node.timeline[0].data.trial_in_block = i + 1;
      parts.push(node);
    });
    parts.push({
      type: BTN,
      stimulus: () => "<h1>Teil " + blockNumber + " geschafft</h1><p>Ihr Guthaben in diesem Teil: <b>" + euro(score) + "</b></p>" +
        (blockNumber === 1 ? "<p>Wenn Sie bereit sind, geht es mit Teil 2 weiter." + (C.EXPLAIN_RULE ? " Dort gilt eine andere Regel." : "") + "</p>" : ""),
      choices: ["Weiter"],
      on_finish: function () { score = 0; }
    });
    return { timeline: parts };
  }

  // Vollbild nur am Computer: Smartphones (vor allem iPhones) unterstützen es nicht zuverlässig.
  taskNodes.push({
    timeline: [{
      type: jsPsychFullscreen,
      fullscreen_mode: true,
      message: "<h1>Entscheidungsaufgabe</h1><p>Der nächste Abschnitt läuft im Vollbild, damit Sie nichts ablenkt.</p>",
      button_label: "Vollbild starten"
    }],
    conditional_function: () => !isMobile
  });
  taskNodes.push({
    type: jsPsychInstructions,
    on_start: keepAwake,
    pages: [
      '<div class="left"><h1>So funktioniert die Aufgabe</h1>' +
      "<p>In jedem Durchgang wählen Sie zwischen zwei Geldbeträgen: einem kleineren, den Sie früher bekommen, " +
      "und einem größeren, auf den Sie länger warten.</p>" +
      "<p>Die Wartezeit ist echt. Nach Ihrer Wahl warten Sie so lange, wie angegeben. Dann wird Ihnen der Betrag gutgeschrieben.</p>" +
      "<p>Das Geld ist fiktiv und wird nicht ausgezahlt. Entscheiden Sie bitte so, als hätte es für Sie einen echten Wert.</p></div>",
      '<div class="left"><h1>Ein Beispiel</h1>' +
      "<p>So sieht ein Durchgang aus. In diesem Beispiel ist die linke Möglichkeit ausgewählt.</p>" +
      '<div class="example" aria-label="Beispielbild eines Durchgangs">' +
      '<div class="example-row"><div class="option example-option chosen"><span class="pts">' + euro(60) + '</span><span class="dly">nach 1 Sekunde</span>' +
      '<span class="tap">ausgewählt</span></div>' +
      '<div class="option example-option"><span class="pts">' + euro(100) + '</span><span class="dly">nach 10 Sekunden</span></div></div>' +
      '<ol class="example-steps"><li>Sie tippen auf <b>' + euro(60) + ' nach 1 Sekunde</b>.</li><li>Sie warten 1 Sekunde.</li>' +
      "<li>Sie erhalten " + euro(60) + ".</li></ol></div>" +
      "<p>Hätten Sie die rechte Möglichkeit gewählt, hätten Sie 10 Sekunden gewartet und " + euro(100) + " erhalten.</p>" +
      '<p class="hint">Das ist nur ein Bild. Gleich üben Sie selbst.</p></div>',
      '<div class="left"><h1>So funktioniert die Aufgabe</h1>' +
      "<p>Es gibt keine richtige oder falsche Wahl. Entscheiden Sie in jedem Durchgang so, wie es Ihnen in dem Moment lieber ist.</p>" +
      "<p>Die Aufgabe besteht aus zwei Teilen. Die Zahl der Durchgänge steht in jedem Teil fest." +
      (C.EXPLAIN_RULE ? " In den beiden Teilen gelten unterschiedliche Regeln dafür, wie es nach der Belohnung weitergeht. " +
      "Die Regel wird vor jedem Teil erklärt." : "") + "</p>" +
      "<p><b>Bitte bleiben Sie während der Wartezeiten auf dieser Seite.</b> Wechseln Sie nicht in andere Apps oder Fenster " +
      "und tun Sie nichts anderes.</p></div>"
    ],
    show_clickable_nav: true,
    button_label_previous: "Zurück",
    button_label_next: "Weiter",
    allow_keys: false
  });
  blockOrder.forEach(function (cond, i) { taskNodes.push(buildBlock(cond, i + 1)); });
  taskNodes.push({
    timeline: [{ type: jsPsychFullscreen, fullscreen_mode: false }],
    conditional_function: () => !isMobile
  });
  taskNodes.push({ type: jsPsychCallFunction, func: allowSleep });

  // ---------------------------------------------------------------- Reihenfolge und Zwischenspeicherung
  const parts = C.ORDER === "task_first" ? [taskNodes, questionnaireNodes] : [questionnaireNodes, taskNodes];
  parts[0].forEach((node) => timeline.push(node));
  if (UPLOAD) timeline.push(saveTrial("_teil1.csv", "save_part1",
    "<p>Ihre Antworten werden gespeichert. Bitte schließen Sie die Seite nicht.</p>"));
  parts[1].forEach((node) => timeline.push(node));

  // ---------------------------------------------------------------- 6b Fragen zu ADHS (falls nicht am Anfang)
  if (C.ADHD_QUESTIONS === "end") timeline.push({
    type: jsPsychSurveyHtmlForm,
    html: '<div class="left"><h1>Zwei Fragen zu ADHS</h1><div class="form">' + ADHD_FIELDS + "</div></div>",
    button_label: "Weiter",
    data: { keep: true, row_type: "adhd_questions" },
    on_finish: flattenResponse
  });

  // ---------------------------------------------------------------- 7 Abschlussfragen
  timeline.push({
    type: jsPsychSurveyHtmlForm,
    html:
      '<div class="left"><h1>Fast geschafft</h1><div class="form">' +
      (C.ASK_DISTRACTION_TECH
        ? '<label for="distraction">Haben Sie während der Wartezeiten etwas anderes gemacht (z. B. andere Apps, Nachrichten, andere Fenster)?</label>' +
          '<select id="distraction" name="end_distraction" required><option value="">Bitte wählen</option>' +
          '<option value="nie">nie</option><option value="selten">selten</option><option value="manchmal">manchmal</option><option value="oft">oft</option></select>' +
          '<label for="tech">Gab es technische Probleme?</label>' +
          '<select id="tech" name="end_tech_problems" required><option value="">Bitte wählen</option>' +
          '<option value="nein">nein</option><option value="ja">ja</option></select>' +
          '<label for="tech_text">Falls ja: Was ist passiert? <span class="hint">(bitte keine Namen oder persönlichen Angaben)</span></label>' +
          '<textarea id="tech_text" name="end_tech_text" rows="2" maxlength="500"></textarea>'
        : "") +
      '<label for="use">Haben Sie die Studie ernsthaft bearbeitet, sodass wir Ihre Daten auswerten können? Ihre Antwort hat keine Nachteile für Sie.</label>' +
      '<select id="use" name="end_use_data" required><option value="">Bitte wählen</option>' +
      '<option value="ja">ja, bitte auswerten</option><option value="nein">nein, bitte nicht auswerten</option></select>' +
      "</div></div>",
    button_label: "Abschließen",
    data: { keep: true, row_type: "end_questions" },
    on_finish: flattenResponse
  });

  // Zusammenfassung pro Person (dient der Kontrolle; das Auswertungsskript rechnet aus den Rohdaten neu)
  timeline.push({
    type: jsPsychCallFunction,
    func: function () {},
    data: { keep: true, row_type: "summary" },
    on_finish: function (d) {
      const choices = jsPsych.data.get().filter({ row_type: "choice" });
      const regular = choices.filter({ trial_kind: "regular" });
      const rate = (cond) => {
        const rows = regular.filter({ condition: cond });
        return rows.count() > 0 ? Math.round((rows.select("chose_early").sum() / rows.count()) * 1000) / 1000 : null;
      };
      const catchRows = choices.filter({ trial_kind: "catch" });
      d.n_regular = regular.count();
      d.early_rate_avoidable = rate("avoidable");
      d.early_rate_unavoidable = rate("unavoidable");
      d.delay_aversion_index = d.early_rate_avoidable !== null && d.early_rate_unavoidable !== null
        ? Math.round((d.early_rate_avoidable - d.early_rate_unavoidable) * 1000) / 1000 : null;
      d.catch_errors = catchRows.count() - catchRows.select("catch_correct").sum();
      d.regular_trials_away = regular.filterCustom((r) => r.away_count_trial > 0).count();
      // Nur das Datum, keine Uhrzeit: So lässt sich ein Datensatz nicht über den Zeitpunkt einer E-Mail zuordnen.
      const now = new Date();
      d.finished_at = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
    }
  });

  // ---------------------------------------------------------------- 8 Speichern und Ende
  if (UPLOAD) timeline.push(saveTrial("_komplett.csv", "save_final",
    "<p>Ihre Daten werden gespeichert. Bitte schließen Sie die Seite noch nicht.</p>"));

  timeline.push({
    type: KEY, choices: "NO_KEYS",
    on_start: function () { window.removeEventListener("beforeunload", warnOnLeave); },
    stimulus: function () {
      // Aufklärungstext von Leni (19.11.2026). Der grüne Kasten steht oben, damit er auf dem Screenshot ist.
      const debrief =
        '<div class="left"><h1>Vielen Dank für Ihre Teilnahme!</h1>' +
        "<p>Sie haben die Studie zu ADHS-Symptomatik und impulsiven Entscheidungen erfolgreich abgeschlossen.</p>" +
        '<div class="box done"><b>Teilnahme abgeschlossen</b><br>' + new Date().toLocaleDateString("de-DE") + "</div>" +
        "<p>Ziel der Studie ist es, Zusammenhänge zwischen ADHS-Symptomatik und impulsivem Entscheidungsverhalten zu untersuchen. " +
        "Dazu wurden zwei Fragebögen und eine Entscheidungsaufgabe eingesetzt.</p>" +
        "<p><b>Wichtiger Hinweis:</b> Die verwendeten Fragebögen dienen ausschließlich wissenschaftlichen Forschungszwecken " +
        "und stellen keine klinische Diagnostik dar. Aus den Ergebnissen können weder eine ADHS-Diagnose noch andere psychische Diagnosen abgeleitet werden.</p>";
      const credit = SONA_BACK
        ? "<h2>" + C.CREDIT_TITLE + "</h2>" + C.CREDIT_TEXT_SONA.map((t) => "<p>" + t + "</p>").join("") +
          '<p><a class="jspsych-btn sona-back" id="sona-back" href="' + SONA_BACK + '">' + C.CREDIT_BUTTON_SONA + "</a></p>"
        : (C.CREDIT_TEXT.length > 0 ? "<h2>" + C.CREDIT_TITLE + "</h2>" + C.CREDIT_TEXT.map((t) => "<p>" + t + "</p>").join("") : "");
      const done = credit +
        "<h2>Kontakt</h2><p>Bei Fragen zur Studie können Sie sich gerne an die Studienleitung wenden:</p>" +
        "<p>" + C.CONTACT_NAME + "<br>" + C.CONTACT_ORG + "<br>E-Mail: " + C.CONTACT_EMAIL + "</p>" +
        "<p>Vielen Dank für Ihre Zeit und Unterstützung!</p>";
      const saved = UPLOAD ? jsPsych.data.get().filter({ row_type: "save_final" }).values()[0] : null;
      if (UPLOAD && saved && saved.value && saved.value.success) {
        return debrief + done + "<p>Ihre Daten wurden gespeichert. " +
          (SONA_BACK ? "Nach dem Klick auf die Schaltfläche können Sie dieses Browserfenster schließen." : "Sie können dieses Browserfenster nun schließen.") + "</p></div>";
      }
      const url = URL.createObjectURL(new Blob([csvData()], { type: "text/csv" }));
      const link = '<p><a href="' + url + '" download="' + participantId + '_komplett.csv" id="download-link">Daten als Datei herunterladen</a></p>';
      if (UPLOAD) {
        return debrief + done + '<p class="error">Die Daten konnten leider nicht automatisch gespeichert werden.</p>' +
          "<p>Bitte laden Sie die Datei herunter und senden Sie sie an " + C.CONTACT_EMAIL + ". Die Datei enthält keinen Namen.</p>" + link + "</div>";
      }
      return debrief + done + "<p><b>Testmodus:</b> Es wurde nichts hochgeladen.</p>" + link + "</div>";
    }
  });

  window.__study = { jsPsych: jsPsych, csvData: csvData };
  jsPsych.run(timeline);
})();
