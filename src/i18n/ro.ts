// Romanian, a machine draft; see translation.note.

import type { LocaleDict } from "./en";

export const dict = {
  translation: {
    source: "ai",
    reviewed: false,
    note: "Machine-drafted, then revised against a language review. Latin script with diacritics (ă, â, î, ș, ț), polite dumneavoastră register throughout, including the two chrome imperatives; 'ședință' for session, 'consultație' for consultation, 'pachet' for package, 'psihoterapeută' (feminine) for the founder; 'abordare informată de traumă' for trauma-informed care; 'dificultăți de atașament' and 'consultații de familie' for the work list. Duration templates carry the 'de' Romanian needs after numerals of 20 or more ('50 de minute'), which matches every session length in the pricing table. 'Merch', 'Supper Club', and 'Blog' kept as on the English site; therapy names given in Romanian with English acronyms (TCC for CBT, DBT, ABA). Awaiting a native speaker's review.",
  },

  ui: {
    skip_to_content: "Săriți la conținut",
    switch_language: "Schimbați limba",
    primary_navigation: "Navigare principală",

    nav_about: "Despre noi",
    nav_packages: "Pachete",
    nav_blog: "Blog",
    nav_merch: "Merch",
    nav_learning: "Învățare",
    nav_supper_club: "Supper Club",

    home: "Acasă",
    cart: "Coș",

    book_session: "Programați o ședință",
    free_consultation: "Consultație gratuită, {minutes} min",
    contact_us: "Contactați-ne",
    back_home: "Înapoi la pagina principală",

    tagline: "Vindecare preparată zilnic...",

    founder_role: "Fondatoare și psihoterapeută",

    footer_contact: "Contact",
    footer_follow: "Urmăriți-ne",

    coming_soon: "În curând...",
    coming_soon_body:
      "Acest colț al cafenelei încă se prepară. Urmăriți-ne pe Instagram sau scrieți-ne și vă anunțăm de îndată ce se deschide.",

    crisis_note:
      "The Soul Cafe nu este un serviciu de urgență. Într-o situație de criză, sunați la Tele-MANAS, linia telefonică gratuită de sănătate mintală a Guvernului Indiei, disponibilă 24x7: {short} sau {full}.",

    whatsapp_label: "Scrieți-ne pe WhatsApp",

    not_found_title: "Pagina nu a fost găsită",
    not_found_body: "Pagina pe care o căutați s-a rătăcit. Haideți să vă ducem înapoi.",

    languages_india: "India",
    languages_europe: "Europa",

    version: "Versiune",
    version_production: "producție",
  },

  form: {
    name: "Nume",
    phone: "Număr de telefon",
    countryCode: "Prefix de țară",
    number: "Număr",
    phoneFormat: "Vă rugăm să introduceți un număr de telefon valid.",
    email: "E-mail",
    subject: "Subiect",
    attachment: "Atașament",
    attachmentHelp: "Opțional. Un document sau o imagine, de până la aproximativ {size} MB.",
    message: "Mesaj",
    messagePlaceholder: "Spuneți-ne, pe scurt, ce vă aduce aici...",
    send: "Trimiteți mesajul",
    required: "obligatoriu",
    optional: "(opțional)",
    replyHint: "Lăsați-ne un număr de telefon sau o adresă de e-mail, ca să vă putem răspunde.",
    alt: "Preferați altă cale? Contactați-ne direct:",
    call: "Sunați-ne",
    whatsapp: "WhatsApp",
    email_us: "Scrieți-ne pe e-mail",
    honeypot: "Lăsați acest câmp gol",
  },

  blog: {
    title: "Blog",
    intro:
      "Câteva însemnări sincere despre vindecare și starea de bine de zi cu zi, adăugate aici pe măsură ce apar.",
    read: "Citiți",
    back: "Înapoi la blog",
    metaDescription:
      "Însemnări scurte și sincere de la The Soul Cafe despre vindecare și sănătatea mintală de zi cu zi.",
  },

  pages: {
    home: {
      meta: {
        title: "Psihoterapie cu Vanessa Worrell",
        description:
          "Un spațiu de psihoterapie cald, fără judecăți, în care să explorați, să vă vindecați și să creșteți. Sprijin pentru adolescenți, adulți și familii.",
      },
      hero: {
        heading: "Bine ați venit la The Soul Cafe!",
        lead: "Nu trebuie să treceți singur prin viață. Un spațiu cald, fără judecăți, în care să explorați, să vă vindecați și să creșteți.",
        body: "Psihoterapie construită pe o idee simplă: vindecarea și îngrijirea sufletului prin practici bazate pe dovezi, sub îndrumarea unei psihologe cu formare internațională, care sprijină adolescenți, adulți și familii în căutare de claritate, vindecare și schimbare cu sens.",
        photoAlt: "Vanessa Worrell, fondatoare și psihoterapeută la The Soul Cafe",
      },
      expertise: {
        heading: "Domenii de expertiză",
        items: [
          "Echilibru emoțional",
          "Relații și atașament",
          "Traumă și vindecare",
          "Creștere și autocunoaștere",
          "Tulburări legate de consumul de substanțe",
        ],
      },
      approaches: {
        heading: "Abordări bazate pe dovezi din care ne inspirăm",
        chips: [
          "Terapie cognitiv-comportamentală (TCC)",
          "Terapie umanistă",
          "Abordare informată de traumă",
          "Terapie existențială",
          "Terapie dialectic-comportamentală (DBT)",
          "Analiză comportamentală aplicată (ABA)",
          "Mindfulness",
        ],
      },
      support: {
        heading: "Pe cine sprijinim",
        items: [
          "Adolescenți",
          "Adulți",
          "Familii",
          "Persoane neurodivergente",
          "Profesioniști și îngrijitori",
        ],
      },
      closing: {
        line: "Primul pas este adesea cel mai greu. Când simțiți că a venit momentul, trimiteți-ne un mesaj și putem sta de vorbă despre asta împreună.",
      },
    },

    about: {
      meta: {
        title: "Despre noi",
        description:
          "Vanessa Worrell, fondatoarea The Soul Cafe, este psihologă cu formare în Statele Unite, Regatul Unit și India.",
      },
      heading: "Despre fondatoarea și psihoterapeuta noastră",
      photoAlt: "Vanessa Worrell, fondatoarea The Soul Cafe",
      bioOpening: [
        "Sunt psihologă, cu formare în Statele Unite, Regatul Unit și India, și fondatoarea The Soul Cafe. Am creat acest spațiu cu o intenție simplă: ca terapia să fie, în același timp, profund umană și solid ancorată clinic.",
        "Drumul meu în psihologie a fost modelat de munca în medii foarte diferite, de la spații specializate, precum centrele de recuperare pentru dependențe, până la contexte mai generale, precum serviciile de sănătate comunitară. Aceste experiențe m-au ajutat să înțeleg cât de diferit trăiesc oamenii momentele de dificultate, vindecarea și creșterea, și cât de important este ca terapia să vă întâmpine acolo unde vă aflați.",
      ],
      subheadApproach: "Cum lucrez",
      bioApproach: [
        "În centrul muncii mele stă o abordare umanistă și existențială. Terapia umanistă pune accent pe empatie, autenticitate și pe crearea unui spațiu în care să vă simțiți cu adevărat ascultat și acceptat. Terapia existențială explorează întrebări mai profunde despre identitate, sens, alegere și direcția vieții dumneavoastră, mai ales în perioade de incertitudine sau de tranziție. Asta înseamnă că vă văd ca fiind mai mult decât simptomele sau dificultățile dumneavoastră. Mă concentrez pe înțelegerea lumii interioare, a emoțiilor, a relațiilor și a felului în care vă percepeți pe dumneavoastră înșivă.",
        "În același timp, nu cred că terapia ar trebui să se limiteze la un singur cadru. Integrez instrumente și perspective din abordări bazate pe dovezi, precum terapia cognitiv-comportamentală (TCC), abordarea informată de traumă și intervențiile comportamentale, atunci când sunt de folos. Terapia nu înseamnă să vă potrivim într-un model, ci să modelăm munca în jurul dumneavoastră și al nevoilor pe care le aveți în acel moment.",
      ],
      subheadValues: "Cum este să lucrăm împreună",
      bioValues: [
        "Prețuiesc onestitatea, curiozitatea și blândețea în spațiul terapeutic. Fie că treceți printr-o perioadă de copleșire sau de impas, ori doar căutați claritate, îmi doresc să creez un spațiu în care să vă simțiți ascultat, sprijinit și nejudecat.",
        "The Soul Cafe este o prelungire a acestei filosofii: un spațiu în care știința se întâlnește cu grija și în care povestea dumneavoastră primește atenția pe care o merită.",
      ],
      workHeading: "La ce putem lucra împreună",
      workOnTogether: [
        "Anxietate și depresie",
        "Stres și epuizare",
        "Copleșire emoțională",
        "Stimă de sine și încredere",
        "Dificultăți în relații",
        "Dificultăți de atașament",
        "Limite și comunicare",
        "Provocări interpersonale",
        "Explorarea identității",
        "Tranziții de viață",
        "Scop și sens",
        "Dezvoltare personală",
        "Recuperare după traumă",
        "Experiențe din copilărie",
        "Reglarea sistemului nervos",
        "Procesare emoțională",
        "Sprijin pentru autism și neurodiversitate",
        "Provocări comportamentale",
        "Îndrumare pentru părinți",
        "Consultații de familie",
      ],
      closingLine: "Oricând simțiți că e momentul, vă așteaptă un loc la The Soul Cafe.",
      questionLink: "Sau scrieți-ne mai întâi cu o întrebare",
    },

    book: {
      meta: {
        title: "Programați o ședință",
        description:
          "Programați o ședință de psihoterapie online cu Vanessa Worrell, M.A., la The Soul Cafe, sau începeți cu o consultație gratuită de {minutes} minute.",
      },
      title: "Programați o ședință",
      description:
        "Alegeți o oră care vi se potrivește. Ședințele au loc online, așa că ne putem întâlni de oriunde vă simțiți cel mai în largul dumneavoastră.",
      cards: {
        individual: {
          title: "Ședință de terapie individuală",
          description:
            "O ședință online confidențială de {minutes} de minute cu Vanessa Worrell, M.A. Un răgaz cald, fără grabă, în care să vorbiți despre ce vă preocupă, în ritmul dumneavoastră.",
        },
        couples: {
          title: "Ședință de terapie de cuplu",
          description:
            "O ședință online confidențială de {minutes} de minute pentru amândoi, în care lucrați împreună la înțelegere, comunicare și apropiere.",
        },
        family: {
          title: "Ședință de terapie de familie",
          description:
            "O ședință online confidențială de {minutes} de minute pentru întreaga familie, în care fiecare voce își are locul și găsiți împreună o cale înainte.",
        },
      },
      from: "De la {price}",
      sessionEmbed: "Calendar de programare pentru o ședință de psihoterapie",
      consultBand: "Încă nu știți sigur dacă vreți să începeți?",
      consultLead:
        "Este perfect în regulă. Cunoașteți-o mai întâi pe Vanessa și vedeți dacă simțiți că vi se potrivește. Nu există nicio obligație de a programa ceva.",
      consultTitle: "Consultație gratuită de {minutes} minute",
      consultDesc:
        "O scurtă convorbire prietenoasă de cunoaștere, în care să puneți întrebări și să vă faceți o idee despre cum lucrăm împreună, înainte de a programa o ședință completă.",
      consultEmbed: "Calendar de programare pentru o consultație gratuită",
      trouble: "Ședințele au loc online. Aveți probleme cu programarea sau o întrebare mai întâi?",
      opensIn: "Se deschide în Google Calendar",
      orBookHere: "sau programați direct aici",
    },

    packages: {
      meta: {
        title: "Pachete",
        description:
          "Ședințe de terapie individuală de la {price}, plus terapie de cuplu și de familie. Reduceri pentru tineri, studenți, militari activi și seniori.",
      },
      heading: "Pachete",
      intro:
        "Toate ședințele au loc online. Prețurile sunt în rupii indiene, cu echivalentul în dolari americani și lire sterline afișat pentru clienții din străinătate.",
      currencyLabel: "Monedă",
      currencyNames: {
        INR: "Rupie indiană",
        USD: "Dolar american",
        GBP: "Liră sterlină",
      },
      types: {
        individual: "Terapie individuală",
        couples: "Terapie de cuplu",
        family: "Terapie de familie",
      },
      single: "O ședință",
      package: "Șase ședințe",
      packagePill: "Cumpărați {paid}, primiți {free} gratuit",
      duration: {
        minutes: "{n} de minute",
        hours: "{h} oră și {m} de minute",
      },
      packagesNote: "Pachetele se stabilesc prin mesaj sau pe WhatsApp.",
      askPackage: "Întrebați despre pachete",
      discountHeading: "Prețuri reduse pentru:",
      discounts: [
        "Tineri (între {from} și {to} de ani)",
        "Studenți",
        "Personalul Forțelor Armate Indiene",
        "Veterani militari",
        "Seniori ({age} de ani și peste)",
      ],
    },

    contact: {
      meta: {
        title: "Contactați-ne",
        description:
          "Luați legătura cu The Soul Cafe pentru programări, locuri de muncă și stagii sau pentru colaborări la ateliere. De obicei răspundem în câteva zile.",
      },
      title: "Contactați-ne",
      intro:
        "Întrebări, idei sau doar vreți să ne salutați? Scrieți-ne câteva rânduri. De obicei răspundem în câteva zile.",
      reachBand: "Scrieți-ne pentru",
      bookings: "Probleme cu programările",
      jobs: "Locuri de muncă / Stagii / Voluntariat",
      collabKicker: "Colaborări la",
      workshops: "Ateliere",
      trainings: "Traininguri",
    },

    thanks: {
      meta: {
        title: "Mulțumim",
        description: "Mesajul dumneavoastră a fost trimis către The Soul Cafe.",
      },
      title: "Mulțumim!",
      body: "Mesajul dumneavoastră este pe drum. De obicei răspundem în câteva zile.",
    },

    learning: {
      meta: {
        title: "Învățare",
        description:
          "Atelierele, trainingurile și resursele de psihoeducație de la The Soul Cafe sunt în pregătire. Vă interesează o colaborare? Scrieți-ne.",
      },
      title: "Învățare",
      intro:
        "Atelierele, trainingurile și resursele de psihoeducație sunt în pregătire: spații blânde și practice în care să învățați despre minte și să creșteți în ritmul dumneavoastră.",
      collabQuestion: "Doriți să colaborăm la un atelier sau la un training?",
      collabEnd: ".",
    },

    supperClub: {
      meta: {
        title: "The Soul Food Supper Club",
        description:
          "O seară cu mâncare bună, conversație deschisă și companie plăcută, de la The Soul Cafe. În curând. Urmăriți-ne pe Instagram sau scrieți-ne.",
      },
      title: "The Soul Food Supper Club",
      intro:
        "O masă întinsă pentru mâncare bună, conversație sinceră și companie relaxată. Un loc în care să încetiniți ritmul și să împărțiți o masă cu alți oameni.",
    },

    merch: {
      meta: {
        title: "Merch",
        description:
          "Merch-ul călduros și reconfortant de la The Soul Cafe este în pregătire. Urmăriți-ne pe Instagram sau scrieți-ne și vă anunțăm când se deschide.",
      },
      title: "Merch",
      intro:
        "Merch-ul călduros și reconfortant este în pregătire: lucruri mici, făcute să se simtă ca o cană caldă în mâini.",
    },

    privacy: {
      meta: {
        title: "Confidențialitate",
        description:
          "Cum gestionează The Soul Cafe informațiile dumneavoastră: fără cookie-uri sau instrumente de urmărire, un formular folosit doar pentru a vă răspunde.",
      },
      title: "Confidențialitate",
      updated: "Ultima actualizare: {date}",
      cookies: {
        heading: "Fără cookie-uri, fără urmărire",
        body: "Acest site nu setează cookie-uri și nu rulează instrumente de analiză sau de urmărire. Simpla citire a acestor pagini nu lasă nicio urmă la noi.",
        storage:
          "Un singur lucru rămâne în propriul dumneavoastră browser: limba pe care ați ales-o, ca data viitoare site-ul să se deschidă în ea. Nu ne este trimisă niciodată.",
      },
      form: {
        heading: "Formularul de contact",
        bodyBefore:
          "Formularul nostru de contact ajunge în căsuța noastră de e-mail prin FormSubmit, un serviciu terț care primește mesajul și eventualele atașamente și ni le transmite. Folosim ceea ce ne trimiteți doar pentru a vă răspunde. Nu îl vindem și nu îl transmitem nimănui în afară de FormSubmit, a cărui ",
        linkLabel: "politică de confidențialitate",
        bodyAfter: " explică modul în care gestionează ceea ce trece prin serviciul lor.",
        captcha:
          "Înainte ca mesajul dumneavoastră să fie transmis, FormSubmit vă poate cere să completați un captcha Google.",
      },
      bookings: {
        heading: "Programări",
        body: "Programările se fac pe site-ul Google Calendar, conform termenilor și politicii de confidențialitate Google. Orice date introduceți acolo sunt gestionate de Google, nu de noi.",
      },
      links: {
        heading: "Linkuri către alte servicii",
        body: "Linkurile către WhatsApp, Instagram și alte platforme vă scot de pe acest site. Odată ce ajungeți acolo, se aplică termenii și politicile de confidențialitate ale acelor servicii.",
      },
      questions: {
        heading: "Întrebări",
        bodyBefore: "Aveți întrebări despre confidențialitatea dumneavoastră? Scrieți-ne la ",
        bodyAfter: ".",
      },
    },
  },
} satisfies LocaleDict;
