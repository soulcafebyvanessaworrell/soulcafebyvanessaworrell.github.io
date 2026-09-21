// German, a machine draft; see translation.note.

import type { LocaleDict } from "./en";

export const dict = {
  translation: {
    source: "ai",
    reviewed: false,
    note: "Machine-drafted, Sie-Form throughout; 'Sitzung' for session, 'Erstgespräch' for consultation, 'Paket' for package, 'Fortbildungen' for trainings, 'Suchterkrankungen' for substance use disorders; the brand takes 'bei The Soul Cafe'; 'Merch' and 'Supper Club' kept as on the English site. Awaiting a native speaker's review.",
  },

  ui: {
    skip_to_content: "Zum Inhalt springen",
    switch_language: "Sprache wechseln",
    primary_navigation: "Hauptnavigation",

    nav_about: "Über uns",
    nav_packages: "Pakete",
    nav_blog: "Blog",
    nav_merch: "Merch",
    nav_learning: "Lernen",
    nav_supper_club: "Supper Club",

    home: "Startseite",
    cart: "Warenkorb",

    book_session: "Sitzung buchen",
    free_consultation: "Kostenloses Erstgespräch (15 Min.)",
    contact_us: "Kontakt aufnehmen",
    back_home: "Zurück zur Startseite",

    tagline: "Heilung, täglich frisch aufgebrüht...",

    founder_role: "Gründerin und Psychotherapeutin",
    founder_qualification: "M.A.",

    footer_contact: "Kontakt",
    footer_follow: "Folgen Sie uns",

    coming_soon: "Bald verfügbar...",
    coming_soon_body:
      "In dieser Ecke des Cafés wird noch aufgebrüht. Folgen Sie uns auf Instagram oder melden Sie sich, und wir sagen Ihnen Bescheid, sobald es losgeht.",

    crisis_note:
      "The Soul Cafe ist kein Notfalldienst. In einer Krise rufen Sie Tele-MANAS an, die kostenlose, 24x7 erreichbare Hotline der indischen Regierung für psychische Gesundheit: {short} oder {full}.",

    whatsapp_label: "Schreiben Sie uns auf WhatsApp",

    not_found_title: "Seite nicht gefunden",
    not_found_body: "Die Seite, die Sie suchen, ist verschwunden. Wir bringen Sie zurück.",

    languages_india: "Indien",
    languages_europe: "Europa",

    version: "Version",
    version_production: "Produktion",
    version_stable: "stabil",
  },

  form: {
    name: "Name",
    phone: "Telefonnummer",
    countryCode: "Ländervorwahl",
    number: "Nummer",
    phoneFormat: "Bitte geben Sie eine gültige Telefonnummer ein.",
    email: "E-Mail",
    subject: "Betreff",
    attachment: "Anhang",
    attachmentHelp: "Optional. Ein Dokument oder Bild, bis etwa 10 MB.",
    message: "Nachricht",
    messagePlaceholder: "Erzählen Sie uns ein wenig darüber, was Sie hierher führt…",
    send: "Nachricht senden",
    required: "Pflichtfeld",
    optional: "(optional)",
    replyHint:
      "Geben Sie uns eine Telefonnummer oder eine E-Mail-Adresse, damit wir antworten können.",
    alt: "Lieber direkt? So erreichen Sie uns:",
    call: "Anrufen",
    whatsapp: "WhatsApp",
    email_us: "E-Mail schreiben",
    honeypot: "Lassen Sie dieses Feld leer",
  },

  blog: {
    title: "Blog",
    intro:
      "Ein paar ehrliche Notizen über Heilung und Wohlbefinden im Alltag, die hier nach und nach dazukommen.",
    read: "Lesen",
    back: "Zurück zum Blog",
    heroAlt:
      "Eine nachdenkliche Herbstszene: gefrostete Blätter am Boden neben stillem Wasser, in dem sich die kahlen Äste darüber spiegeln.",
    metaDescription:
      "Kurze, ehrliche Notizen von The Soul Cafe über Heilung und psychisches Wohlbefinden im Alltag.",
  },

  pages: {
    home: {
      meta: {
        title: "Psychotherapie bei Vanessa Worrell",
        description:
          "Ein warmer, wertfreier Raum für Psychotherapie, um zu erkunden, zu heilen und zu wachsen. Begleitung für Jugendliche, Erwachsene und Familien von einer international ausgebildeten Psychologin.",
      },
      hero: {
        heading: "Willkommen bei The Soul Cafe!",
        lead: "Sie müssen das Leben nicht allein bewältigen. Ein warmer, wertfreier Raum, um zu erkunden, zu heilen und zu wachsen.",
        body: "Psychotherapie, die auf einer einfachen Idee beruht: Seelen heilen und nähren mit wissenschaftlich fundierten Methoden, geleitet von einer international ausgebildeten Psychologin, die Jugendliche, Erwachsene und Familien auf der Suche nach Klarheit, Heilung und bedeutsamer Veränderung begleitet.",
        photoAlt: "Vanessa Worrell, Gründerin und Psychotherapeutin bei The Soul Cafe",
      },
      expertise: {
        heading: "Schwerpunkte",
        items: [
          "Emotionales Wohlbefinden",
          "Beziehungen und Bindung",
          "Trauma und Heilung",
          "Wachstum und Selbstfindung",
          "Suchterkrankungen",
        ],
      },
      approaches: {
        heading: "Wissenschaftlich fundierte Ansätze, auf die wir zurückgreifen",
        chips: [
          "Kognitive Verhaltenstherapie",
          "Humanistisch",
          "Traumasensible Begleitung",
          "Existenziell",
          "Dialektisch-Behaviorale Therapie",
          "Angewandte Verhaltensanalyse",
          "Achtsamkeit",
        ],
      },
      support: {
        heading: "Wen wir begleiten",
        items: [
          "Jugendliche",
          "Erwachsene",
          "Familien",
          "Neurodivergente Menschen",
          "Berufstätige und Betreuungspersonen",
        ],
      },
      closing: {
        line: "Der erste Schritt ist oft der schwerste. Wenn Sie sich bereit fühlen, schreiben Sie uns eine Nachricht, und wir sprechen gemeinsam darüber.",
      },
    },

    about: {
      meta: {
        title: "Über uns",
        description:
          "Vanessa Worrell, Gründerin von The Soul Cafe, ist eine in den USA, in Großbritannien und in Indien ausgebildete Psychologin. Ihre Arbeit ist humanistisch und existenziell und greift auf KVT zurück, wenn es hilft.",
      },
      heading: "Über unsere Gründerin und Psychotherapeutin",
      photoAlt: "Vanessa Worrell, Gründerin von The Soul Cafe",
      bioOpening: [
        "Ich bin Psychologin, ausgebildet in den Vereinigten Staaten, im Vereinigten Königreich und in Indien, und die Gründerin von The Soul Cafe. Ich habe diesen Raum mit einer einfachen Absicht geschaffen: Therapie soll sich zugleich tief menschlich und klinisch fundiert anfühlen.",
        "Mein Weg in die Psychologie wurde durch die Arbeit in ganz unterschiedlichen Umfeldern geprägt, von spezialisierten Orten wie Drogenrehabilitationszentren bis zu allgemeineren Bereichen wie kommunalen Gesundheitsdiensten. Diese Erfahrungen haben mir gezeigt, wie unterschiedlich Menschen seelische Not, Heilung und Wachstum erleben und wie wichtig es ist, dass Therapie Sie dort abholt, wo Sie gerade stehen.",
      ],
      subheadApproach: "Wie ich arbeite",
      bioApproach: [
        "Im Kern meiner Arbeit steht ein humanistischer und existenzieller Ansatz. Die humanistische Therapie betont Empathie, Echtheit und einen Raum, in dem Sie sich wirklich gehört und angenommen fühlen. Die existenzielle Therapie erkundet tiefere Fragen zu Identität, Sinn, Entscheidungen und der Richtung Ihres Lebens, besonders in Zeiten der Unsicherheit oder des Übergangs. Das bedeutet, dass ich in Ihnen mehr sehe als Ihre Symptome oder Schwierigkeiten. Ich konzentriere mich darauf, Ihre innere Welt zu verstehen: Ihre Gefühle, Ihre Beziehungen und Ihr Selbstgefühl.",
        "Gleichzeitig glaube ich nicht, dass Therapie auf einen einzigen Rahmen beschränkt sein sollte. Ich beziehe Werkzeuge und Erkenntnisse aus wissenschaftlich fundierten Ansätzen ein, etwa der kognitiven Verhaltenstherapie (KVT), traumasensibler Begleitung und verhaltensbezogenen Interventionen, wenn sie hilfreich sind. Bei Therapie geht es nicht darum, Sie in ein Modell zu pressen, sondern darum, die Arbeit an Ihnen und an dem auszurichten, was Sie in diesem Moment brauchen.",
      ],
      subheadValues: "Wie sich unsere Arbeit anfühlt",
      bioValues: [
        "Ich schätze Ehrlichkeit, Neugier und Behutsamkeit im therapeutischen Raum. Ob Sie sich überfordert oder festgefahren fühlen oder einfach Klarheit suchen: Ich möchte einen Raum schaffen, in dem Sie sich gehört, unterstützt und nicht beurteilt fühlen.",
        "The Soul Cafe ist der Ausdruck dieser Haltung: ein Ort, an dem Wissenschaft auf Fürsorge trifft und an dem Ihre Geschichte die Aufmerksamkeit bekommt, die sie verdient.",
      ],
      workHeading: "Woran wir gemeinsam arbeiten können",
      workOnTogether: [
        "Angst und Depression",
        "Stress und Burnout",
        "Emotionale Überforderung",
        "Selbstwert und Selbstvertrauen",
        "Beziehungsschwierigkeiten",
        "Bindungsthemen",
        "Grenzen und Kommunikation",
        "Zwischenmenschliche Herausforderungen",
        "Identitätsfindung",
        "Lebensübergänge",
        "Sinn und Bedeutung",
        "Persönliche Entwicklung",
        "Traumaverarbeitung",
        "Kindheitserfahrungen",
        "Regulation des Nervensystems",
        "Emotionale Verarbeitung",
        "Begleitung bei Autismus und Neurodiversität",
        "Herausforderndes Verhalten",
        "Elterncoaching",
        "Familienberatung",
      ],
      closingLine: "Wann immer Sie sich bereit fühlen: Bei The Soul Cafe wartet ein Platz auf Sie.",
      questionLink: "Oder stellen Sie zuerst eine Frage",
    },

    book: {
      meta: {
        title: "Sitzung buchen",
        description:
          "Buchen Sie eine Online-Psychotherapiesitzung mit Vanessa Worrell, M.A., bei The Soul Cafe, oder beginnen Sie mit einem kostenlosen 15-Minuten-Erstgespräch, um zu sehen, ob es passt.",
      },
      title: "Sitzung buchen",
      description:
        "Wählen Sie eine Zeit, die Ihnen passt. Die Sitzungen finden online statt, sodass Sie von dort teilnehmen können, wo Sie sich am wohlsten fühlen.",
      cards: {
        individual: {
          title: "Einzeltherapiesitzung",
          description:
            "Eine vertrauliche {minutes}-minütige Online-Sitzung mit Vanessa Worrell, M.A. Warme, ungehetzte Zeit, um in Ihrem eigenen Tempo über die Dinge zu sprechen.",
        },
        couples: {
          title: "Paartherapiesitzung",
          description:
            "Eine vertrauliche {minutes}-minütige Online-Sitzung für Sie beide, in der Sie gemeinsam an Verständnis, Kommunikation und Verbundenheit arbeiten.",
        },
        family: {
          title: "Familientherapiesitzung",
          description:
            "Eine vertrauliche {minutes}-minütige Online-Sitzung für die ganze Familie, mit Raum für jede Stimme und einem gemeinsamen Weg nach vorn.",
        },
      },
      from: "Ab {price}",
      sessionEmbed: "Buchungskalender für eine Psychotherapiesitzung",
      consultBand: "Noch unsicher, ob Sie anfangen möchten?",
      consultLead:
        "Das ist völlig in Ordnung. Lernen Sie Vanessa zuerst kennen und sehen Sie, ob es für Sie passt. Sie müssen nichts buchen.",
      consultTitle: "Kostenloses 15-Minuten-Erstgespräch",
      consultDesc:
        "Ein kurzes, freundliches Kennenlerngespräch, um Fragen zu stellen und ein Gefühl dafür zu bekommen, wie wir zusammenarbeiten, bevor Sie eine reguläre Sitzung buchen.",
      consultEmbed: "Buchungskalender für ein kostenloses Erstgespräch",
      trouble:
        "Die Sitzungen finden online statt. Probleme mit der Buchung oder zuerst eine Frage?",
      opensIn: "Öffnet sich in Google Kalender",
      orBookHere: "oder buchen Sie direkt hier",
    },

    packages: {
      meta: {
        title: "Pakete",
        description:
          "Einzeltherapiesitzungen ab {price}, dazu Paar- und Familientherapie. Ein Paket mit sechs Sitzungen spart Ihnen eine. Ermäßigungen für junge Erwachsene, Studierende, Angehörige der Streitkräfte, Veteranen und Senioren.",
      },
      heading: "Pakete",
      intro:
        "Jede Sitzung findet online statt. Die Preise sind in indischen Rupien angegeben, mit Preisen in US-Dollar und britischen Pfund für Klientinnen und Klienten im Ausland.",
      currencyLabel: "Währung",
      currencyNames: {
        INR: "Indische Rupie",
        USD: "US-Dollar",
        GBP: "Britisches Pfund",
      },
      types: {
        individual: "Einzeltherapie",
        couples: "Paartherapie",
        family: "Familientherapie",
      },
      single: "Eine Sitzung",
      package: "Sechs Sitzungen",
      packagePill: "5 kaufen, 1 gratis",
      duration: {
        minutes: "{n} Minuten",
        hours: "{h} Stunde {m} Minuten",
      },
      packagesNote: "Pakete werden per Nachricht oder WhatsApp vereinbart.",
      askPackage: "Nach einem Paket fragen",
      discountHeading: "Ermäßigte Preise gibt es für:",
      discounts: [
        "Junge Erwachsene (18 bis 25 Jahre)",
        "Studierende",
        "Angehörige der indischen Streitkräfte",
        "Veteranen",
        "Seniorinnen und Senioren (ab 60 Jahren)",
      ],
    },

    contact: {
      meta: {
        title: "Kontakt",
        description:
          "Nehmen Sie Kontakt mit The Soul Cafe auf: zu Buchungen, Jobs und Praktika oder zur Zusammenarbeit bei Workshops und Fortbildungen. Wir antworten meist innerhalb weniger Tage.",
      },
      title: "Kontakt aufnehmen",
      intro:
        "Fragen, Ideen oder einfach nur Hallo sagen? Schreiben Sie uns. Wir antworten meist innerhalb weniger Tage.",
      reachBand: "Wir sind da für",
      bookings: "Probleme mit der Buchung",
      jobs: "Jobs / Praktika / Ehrenamt",
      collabKicker: "Zusammenarbeit bei",
      workshops: "Workshops",
      trainings: "Fortbildungen",
    },

    thanks: {
      meta: {
        title: "Danke",
        description: "Ihre Nachricht wurde an The Soul Cafe gesendet.",
      },
      title: "Danke!",
      body: "Ihre Nachricht ist unterwegs. Wir antworten meist innerhalb weniger Tage.",
    },

    learning: {
      meta: {
        title: "Lernen",
        description:
          "Workshops, Fortbildungen und psychoedukative Materialien von The Soul Cafe sind in Vorbereitung. Interesse an einer Zusammenarbeit? Melden Sie sich.",
      },
      title: "Lernen",
      intro:
        "Workshops, Fortbildungen und psychoedukative Materialien sind in Vorbereitung: behutsame, praktische Räume, um mehr über die Psyche zu lernen und in Ihrem eigenen Tempo zu wachsen.",
      collabQuestion: "Möchten Sie bei einem Workshop oder einer Fortbildung zusammenarbeiten?",
      collabEnd: ".",
    },

    supperClub: {
      meta: {
        title: "The Soul Food Supper Club",
        description:
          "Ein Abend mit gutem Essen, offenen Gesprächen und guter Gesellschaft von The Soul Cafe. Bald verfügbar. Folgen Sie uns auf Instagram oder melden Sie sich, um mehr zu erfahren.",
      },
      title: "The Soul Food Supper Club",
      intro:
        "Ein gedeckter Tisch für gutes Essen, ehrliche Gespräche und entspannte Gesellschaft. Ein Ort, um zur Ruhe zu kommen und mit anderen Menschen eine Mahlzeit zu teilen.",
    },

    merch: {
      meta: {
        title: "Merch",
        description:
          "Gemütlicher, tröstlicher Merch von The Soul Cafe ist in Vorbereitung. Folgen Sie uns auf Instagram oder melden Sie sich, und wir sagen Ihnen Bescheid, wenn es losgeht.",
      },
      title: "Merch",
      intro:
        "Gemütlicher, tröstlicher Merch ist in Vorbereitung: kleine Dinge, die sich anfühlen wie eine warme Tasse in Ihren Händen.",
    },

    privacy: {
      meta: {
        title: "Datenschutz",
        description:
          "Wie The Soul Cafe mit Ihren Daten umgeht: keine Cookies oder Tracker, ein Kontaktformular, das nur für unsere Antwort genutzt wird, und Buchungen direkt auf Googles eigener Seite.",
      },
      title: "Datenschutz",
      updated: "Zuletzt aktualisiert: Juli 2026",
      cookies: {
        heading: "Keine Cookies, kein Tracking",
        body: "Diese Website setzt keine Cookies und verwendet keine Analysetools oder Tracker. Das bloße Lesen dieser Seiten hinterlässt bei uns keine Spur.",
      },
      form: {
        heading: "Das Kontaktformular",
        bodyBefore:
          "Unser Kontaktformular erreicht unser Postfach über FormSubmit, einen Drittanbieter, der Ihre Nachricht und etwaige Anhänge entgegennimmt und an uns weiterleitet. Wir nutzen, was Sie uns senden, ausschließlich, um Ihnen zu antworten. Wir verkaufen es nicht und geben es an niemanden außer FormSubmit weiter, dessen eigene ",
        linkLabel: "Datenschutzerklärung",
        bodyAfter:
          " beschreibt, wie dort mit den Daten umgegangen wird, die durch den Dienst laufen.",
      },
      bookings: {
        heading: "Buchungen",
        body: "Termine werden auf der eigenen Seite von Google Kalender gebucht, zu den Bedingungen und der Datenschutzerklärung von Google. Alle Angaben, die Sie dort machen, verarbeitet Google, nicht wir.",
      },
      links: {
        heading: "Links zu anderen Diensten",
        body: "Links zu WhatsApp, Instagram und anderen Plattformen führen Sie von dieser Website weg. Dort gelten die eigenen Bedingungen und Datenschutzerklärungen dieser Dienste.",
      },
      questions: {
        heading: "Fragen",
        bodyBefore: "Haben Sie Fragen zu Ihrem Datenschutz? Schreiben Sie uns an ",
        bodyAfter: ".",
      },
    },
  },
} satisfies LocaleDict;
