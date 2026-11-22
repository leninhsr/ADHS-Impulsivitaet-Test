// Fragebögen. Die Itemtexte sind aus den am 18.11.2026 gelieferten Originaldateien geschnitten, nicht abgetippt.
//
// Format pro Item: { id: "asrs_01", text: "Wortlaut des Items" }
// Die Antwort wird als Zahl gespeichert, beginnend bei 0 für die erste Antwortstufe.
// Umpolung und Skalenbildung passieren im Auswertungsskript (auswertung/schluessel.csv), nicht hier.
//
// wording_verified: false sperrt den Echtbetrieb. Erst auf true setzen, wenn der Wortlaut
// mit dem Originalfragebogen übereinstimmt.
const QUESTIONNAIRES = [
  {
    // ASRS-v1.1 Symptomcheckliste, 18 Fragen, offizielle deutsche Fassung (Datei 18Q_German_final.pdf).
    // © New York University und Ronald C. Kessler. Die Nutzung der 18 Fragen braucht eine Erlaubnis von NYU (siehe LIESMICH).
    // Fragen wörtlich aus dem Formular. Anleitung angepasst: Das Formular spricht vom Ankreuzen von Kästchen
    // „rechts auf der Seite“ und von der Abgabe bei der medizinischen Fachkraft; beides passt online nicht.
    // Antwortstufen wie im Formular: Nie, Selten, Manchmal, Oft, Sehr oft (gespeichert als 0 bis 4).
    id: "asrs",
    title: "Fragebogen 1",
    wording_verified: true,
    instruction: "Bitte beantworten Sie die nachstehenden Fragen. Wählen Sie als Antwort auf jede Frage die Stufe, die am besten beschreibt, wie Sie sich in den letzten 6 Monaten gefühlt und verhalten haben.",
    labels: ["Nie", "Selten", "Manchmal", "Oft", "Sehr oft"],
    items_per_page: 6,
    items: [
      { id: "asrs_01", text: "Wie oft haben Sie Probleme, die letzten Details eines Projekts abzuschließen, nachdem die schwierigen Teile abgeschlossen sind?" },
      { id: "asrs_02", text: "Wie oft haben Sie Schwierigkeiten, Dinge zu ordnen, wenn Sie eine Aufgabe haben, die Organisation erfordert?" },
      { id: "asrs_03", text: "Wie oft haben Sie Probleme, sich an Termine oder Verpflichtungen zu erinnern?" },
      { id: "asrs_04", text: "Wie oft vermeiden oder verschieben Sie es, eine Aufgabe zu beginnen, die viel Nachdenken erfordert?" },
      { id: "asrs_05", text: "Wie oft sind Sie zappelig oder bewegen die Hände oder Füße, wenn Sie lange Zeit sitzen müssen?" },
      { id: "asrs_06", text: "Wie oft fühlen Sie sich übermäßig aktiv und unter dem Zwang, Dinge zu tun, als ob Sie von einem Motor angetrieben wären?" },
      { id: "asrs_07", text: "Wie oft machen Sie Flüchtigkeitsfehler, wenn Sie an einem langweiligen oder schwierigen Projekt arbeiten müssen?" },
      { id: "asrs_08", text: "Wie oft haben Sie Schwierigkeiten, aufmerksam zu bleiben, wenn Sie langweilige oder sich wiederholende Arbeiten verrichten?" },
      { id: "asrs_09", text: "Wie oft haben Sie Schwierigkeiten, sich auf das, was man Ihnen sagt, zu konzentrieren, selbst wenn man Sie direkt anspricht?" },
      { id: "asrs_10", text: "Wie oft verlegen Sie Dinge zuhause oder bei der Arbeit bzw. haben Schwierigkeiten, sie zu finden?" },
      { id: "asrs_11", text: "Wie oft lassen Sie sich durch Aktivitäten oder Geräusche in Ihrer Umgebung ablenken?" },
      { id: "asrs_12", text: "Wie oft verlassen Sie Ihren Platz bei Besprechungen oder in anderen Situationen, wo von Ihnen erwartet wird, dass Sie sitzen bleiben?" },
      { id: "asrs_13", text: "Wie oft sind Sie unruhig oder zappelig?" },
      { id: "asrs_14", text: "Wie oft haben Sie Schwierigkeiten, abzuschalten und sich zu entspannen, wenn Sie Zeit für sich haben?" },
      { id: "asrs_15", text: "Wie oft passiert es Ihnen, dass Sie in geselligen Situationen zu viel reden?" },
      { id: "asrs_16", text: "Wie oft kommt es in einer Unterhaltung vor, dass Sie die Sätze Ihrer Gesprächspartner beenden, bevor diese sie selbst beenden können?" },
      { id: "asrs_17", text: "Wie oft haben Sie Schwierigkeiten zu warten, bis Sie an der Reihe sind?" },
      { id: "asrs_18", text: "Wie häufig unterbrechen Sie andere Leute, wenn diese arbeiten oder mit anderen Dingen beschäftigt sind?" }
    ]
  },
  {
    // UPPS Impulsive Behavior Scale, deutsche Fassung: Schmidt, Gay, d'Acremont & Van der Linden (2008),
    // Swiss Journal of Psychology, 67, 107-112. 45 Items aus dem Originalbogen.
    // Einzige Änderung am Wortlaut: ß statt Schweizer ss an sechs Stellen (Spaß in 15, 21, 44; äußerst in 16; weiß in 17; genießen in 37).
    // Anleitung: Sätze des Originals wörtlich; der Satz zum Ankreuzen der Zahlen 1 bis 4 und der Hinweis
    // auf die Rückseite entfallen, weil die Antwortstufen hier ausgeschrieben sind.
    // Antwortstufen im Original 1 bis 4, gespeichert als 0 bis 3.
    id: "upps",
    title: "Fragebogen 2",
    wording_verified: true,
    instruction: "Nachstehend finden Sie eine Reihe von Beschreibungen, wie Menschen denken und handeln. Bitte geben Sie für jede Beschreibung an, inwiefern sie für Sie zutrifft. Vergewissern Sie sich bitte, dass Sie für jede der nachstehenden Beschreibungen angeben, inwiefern Sie sie für zutreffend oder unzutreffend halten.",
    labels: ["Sehr zutreffend", "Eher zutreffend", "Eher unzutreffend", "Sehr unzutreffend"],
    items_per_page: 6,
    items: [
      { id: "upps_01", text: "Ich habe dem Leben gegenüber eine zurückhaltende und vorsichtige Haltung." },
      { id: "upps_02", text: "Es fällt mir schwer, spontane Handlungsimpulse zu kontrollieren." },
      { id: "upps_03", text: "Ich suche im Allgemeinen nach neuen und aufregenden Erfahrungen und Erlebnissen." },
      { id: "upps_04", text: "Ich führe Dinge im Allgemeinen gerne zu Ende." },
      { id: "upps_05", text: "Mein Denken ist in der Regel sorgfältig und zielgerichtet." },
      { id: "upps_06", text: "Es fällt mir schwer, meinen Begierden zu widerstehen (z.B. nach Essen, Zigaretten)." },
      { id: "upps_07", text: "Ich probiere gerne alles einmal aus." },
      { id: "upps_08", text: "Ich neige dazu, leicht aufzugeben." },
      { id: "upps_09", text: "Ich zähle nicht zu den Menschen, die etwas unüberlegt ausplaudern." },
      { id: "upps_10", text: "Ich werde oft in Situationen verwickelt, aus denen ich später gerne wieder herauskommen würde." },
      { id: "upps_11", text: "Ich mag Sportarten und Spiele, bei denen man die nächste Bewegung oder den nächsten Zug sehr schnell ausführen muss." },
      { id: "upps_12", text: "Unbeendete Aufgaben sind mir sehr unangenehm." },
      { id: "upps_13", text: "Ich lege gerne eine Denkpause ein, bevor ich handle." },
      { id: "upps_14", text: "Wenn ich mich schlecht fühle, tue ich oft Dinge, um mich kurzfristig besser zu fühlen, die ich später aber bereue." },
      { id: "upps_15", text: "Wasserskifahren würde mir Spaß machen." },
      { id: "upps_16", text: "Bin ich erst einmal in eine Tätigkeit vertieft, höre ich nur äußerst ungern wieder damit auf." },
      { id: "upps_17", text: "Solange ich nicht genau weiß, wie ein Projekt anzugehen ist, fange ich nur ungern damit an." },
      { id: "upps_18", text: "Manchmal, wenn ich mich schlecht fühle, kann ich einfach nicht aufhören mit dem, was ich gerade tue, auch wenn es mir dadurch nur noch schlechter geht." },
      { id: "upps_19", text: "Ich gehe ziemlich gerne Risiken ein." },
      { id: "upps_20", text: "Es fällt mir leicht, mich auf etwas zu konzentrieren." },
      { id: "upps_21", text: "Fallschirmspringen würde mir Spaß machen." },
      { id: "upps_22", text: "Was ich einmal angefangen habe, bringe ich auch zu Ende." },
      { id: "upps_23", text: "Ich neige dazu, eine rationale und vernünftige Herangehensweise zu befürworten und zu befolgen." },
      { id: "upps_24", text: "Wenn ich aufgeregt bin, handle ich oft unüberlegt." },
      { id: "upps_25", text: "Ich mag neue und aufregende Erfahrungen und Erlebnisse, selbst wenn sie ein bisschen furchterregend und unkonventionell sind." },
      { id: "upps_26", text: "Ich verstehe es ziemlich gut, mich so zu organisieren, dass Arbeiten rechtzeitig erledigt werden." },
      { id: "upps_27", text: "Entscheidungen fälle ich gewöhnlich nach reiflicher Überlegung." },
      { id: "upps_28", text: "Wenn ich mich abgelehnt fühle, sage ich oft Dinge, die ich später bereue." },
      { id: "upps_29", text: "Ich würde gerne lernen, ein Flugzeug zu pilotieren." },
      { id: "upps_30", text: "Ich bin ein produktiver Mensch, der seine Arbeit immer erledigt." },
      { id: "upps_31", text: "Ich bin eine vorsichtige Person." },
      { id: "upps_32", text: "Es fällt mir schwer, mich daran zu hindern, nach meinen Gefühlen zu handeln." },
      { id: "upps_33", text: "Manchmal tue ich gerne etwas, das ein wenig furchterregend ist." },
      { id: "upps_34", text: "Wenn ich erst einmal mit einem Projekt beginne, so führe ich es fast immer zu Ende." },
      { id: "upps_35", text: "Bevor ich mich in eine neue Situation begebe, bringe ich gerne in Erfahrung, was ich davon zu erwarten habe." },
      { id: "upps_36", text: "Oft mache ich etwas nur noch schlimmer, weil ich unüberlegt handle, wenn ich aufgeregt bin." },
      { id: "upps_37", text: "Ich würde das Erlebnis genießen, sehr schnell auf einer Skipiste hinunterzufahren." },
      { id: "upps_38", text: "Es gibt so viele kleine Dinge zu erledigen, dass ich manchmal einfach alle ignoriere." },
      { id: "upps_39", text: "Gewöhnlich denke ich sorgfältig nach, bevor ich irgendetwas unternehme." },
      { id: "upps_40", text: "Bevor ich eine Entscheidung fälle, wäge ich alle Vor- und Nachteile ab." },
      { id: "upps_41", text: "In der Hitze eines Wortgefechts sage ich oft Dinge, die ich später bereue." },
      { id: "upps_42", text: "Ich würde gerne mit einer Ausrüstung (Sauerstoffflaschen usw.) tauchen gehen." },
      { id: "upps_43", text: "Ich bin immer in der Lage, meine Gefühle unter Kontrolle zu halten." },
      { id: "upps_44", text: "Schnell fahren (z.B. mit dem Auto) würde mir Spaß machen." },
      { id: "upps_45", text: "Manchmal tue ich aus einem Handlungsimpuls heraus Dinge, die ich später bereue." }
    ]
  }
];
