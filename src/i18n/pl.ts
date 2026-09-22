// Polish, a machine draft; see translation.note.

import type { LocaleDict } from "./en";

export const dict = {
  translation: {
    source: "ai",
    reviewed: false,
    note: "Latin script. Warm second-person singular with capitalised Ci/Cię/Twoje, phrased gender-neutrally where Polish participles would force a gender; product names (Merch, Supper Club, Blog, Instagram, FormSubmit, WhatsApp) kept, Google Calendar as Kalendarz Google; CBT/DBT/ABA given the accepted Polish term with the English acronym; the founder's full name stays in the nominative (sentences restructured around it), only the bare first name is declined once (Vanessę). Two owner-level choices: the tagline renders Healing as Ukojenie (solace), a paraphrase chosen over the literal Uzdrowienie, and the feminatives psycholożka, psychoterapeutka and założycielka are used throughout (psycholog is also used for women). Awaiting a native speaker's review.",
  },

  ui: {
    skip_to_content: "Przejdź do treści",
    switch_language: "Zmień język",
    primary_navigation: "Nawigacja główna",

    nav_about: "O nas",
    nav_packages: "Pakiety",
    nav_blog: "Blog",
    nav_merch: "Merch",
    nav_learning: "Edukacja",
    nav_supper_club: "Supper Club",

    home: "Strona główna",
    cart: "Koszyk",

    book_session: "Zarezerwuj sesję",
    free_consultation: "Bezpłatna konsultacja {minutes} min",
    contact_us: "Skontaktuj się z nami",
    back_home: "Wróć na stronę główną",

    tagline: "Ukojenie parzone codziennie...",

    founder_role: "Założycielka i psychoterapeutka",

    footer_contact: "Kontakt",
    footer_follow: "Obserwuj nas",

    coming_soon: "Już wkrótce...",
    coming_soon_body:
      "Ten kącik kawiarni jeszcze się parzy. Obserwuj nas na Instagramie albo napisz do nas, a damy Ci znać, gdy tylko go otworzymy.",

    crisis_note:
      "The Soul Cafe nie jest służbą ratunkową. W sytuacji kryzysowej zadzwoń do Tele-MANAS, bezpłatnej linii wsparcia psychicznego Rządu Indii, czynnej 24x7: {short} lub {full}.",

    whatsapp_label: "Napisz do nas na WhatsApp",

    not_found_title: "Nie znaleziono strony",
    not_found_body: "Strona, której szukasz, gdzieś się zawieruszyła. Pomożemy Ci wrócić.",

    languages_india: "Indie",
    languages_europe: "Europa",

    version: "Wersja",
    version_production: "produkcja",
  },

  form: {
    name: "Imię",
    phone: "Numer telefonu",
    countryCode: "Kod kraju",
    number: "Numer",
    phoneFormat: "Podaj poprawny numer telefonu.",
    email: "E-mail",
    subject: "Temat",
    attachment: "Załącznik",
    attachmentHelp: "Opcjonalnie. Dokument lub obraz, do około {size} MB.",
    message: "Wiadomość",
    messagePlaceholder: "Napisz kilka słów o tym, co Cię do nas sprowadza...",
    send: "Wyślij wiadomość",
    required: "wymagane",
    optional: "(opcjonalnie)",
    replyHint: "Podaj numer telefonu lub adres e-mail, abyśmy mogli odpowiedzieć.",
    alt: "Wolisz inaczej? Skontaktuj się z nami bezpośrednio:",
    call: "Zadzwoń",
    whatsapp: "WhatsApp",
    email_us: "Napisz e-mail",
    honeypot: "Pozostaw to pole puste",
  },

  blog: {
    title: "Blog",
    intro:
      "Kilka szczerych notatek o zdrowieniu i codziennym dobrostanie, dodawanych tu w miarę powstawania.",
    read: "Czytaj",
    back: "Wróć do bloga",
    metaDescription:
      "Krótkie, szczere notatki z The Soul Cafe o zdrowieniu i codziennym zdrowiu psychicznym.",
  },

  pages: {
    home: {
      meta: {
        title: "Psychoterapia: Vanessa Worrell",
        description:
          "Ciepła przestrzeń psychoterapii bez oceniania, w której można poznawać siebie, zdrowieć i rozwijać się. Wsparcie dla młodzieży, dorosłych i rodzin od psycholożki z międzynarodowym wykształceniem.",
      },
      hero: {
        heading: "Witaj w The Soul Cafe!",
        lead: "Nie musisz iść przez życie w pojedynkę. Ciepła przestrzeń bez oceniania, w której możesz poznawać siebie, zdrowieć i rozwijać się.",
        body: "Psychoterapia zbudowana na prostej idei: leczyć i pielęgnować dusze metodami opartymi na dowodach naukowych. Prowadzi ją psycholożka z międzynarodowym wykształceniem, wspierająca młodzież, dorosłych i rodziny, które szukają jasności, zdrowienia i znaczącej zmiany.",
        photoAlt: "Vanessa Worrell, założycielka i psychoterapeutka The Soul Cafe",
      },
      expertise: {
        heading: "Specjalizacja",
        items: [
          "Dobrostan emocjonalny",
          "Relacje i przywiązanie",
          "Trauma i zdrowienie",
          "Rozwój i odkrywanie siebie",
          "Uzależnienia od substancji psychoaktywnych",
        ],
      },
      approaches: {
        heading: "Podejścia oparte na dowodach, z których czerpiemy",
        chips: [
          "Terapia poznawczo-behawioralna (CBT)",
          "Podejście humanistyczne",
          "Opieka uwzględniająca traumę",
          "Podejście egzystencjalne",
          "Terapia dialektyczno-behawioralna (DBT)",
          "Stosowana analiza zachowania (ABA)",
          "Uważność (mindfulness)",
        ],
      },
      support: {
        heading: "Kogo wspieramy",
        items: [
          "Młodzież",
          "Dorośli",
          "Rodziny",
          "Osoby neuroróżnorodne",
          "Osoby aktywne zawodowo i opiekunowie bliskich",
        ],
      },
      closing: {
        line: "Pierwszy krok bywa najtrudniejszy. Kiedy poczujesz, że to dobry moment, napisz do nas, a razem to omówimy.",
      },
    },

    about: {
      meta: {
        title: "O nas",
        description:
          "Vanessa Worrell, założycielka The Soul Cafe, jest psycholożką wykształconą w USA, Wielkiej Brytanii i Indiach. Pracuje w nurcie humanistycznym i egzystencjalnym, a gdy to pomaga, sięga po CBT.",
      },
      heading: "O naszej założycielce i psychoterapeutce",
      photoAlt: "Vanessa Worrell, założycielka The Soul Cafe",
      bioOpening: [
        "Jestem psycholożką wykształconą w Stanach Zjednoczonych, Wielkiej Brytanii i Indiach oraz założycielką The Soul Cafe. Stworzyłam tę przestrzeń z prostą intencją: żeby terapia była jednocześnie głęboko ludzka i oparta na solidnych podstawach klinicznych.",
        "Moją drogę w psychologii ukształtowała praca w bardzo różnych miejscach, od miejsc tak wyspecjalizowanych jak ośrodki leczenia uzależnień po tak szerokie jak środowiskowa opieka zdrowotna. Te doświadczenia pozwoliły mi zrozumieć, jak różnie ludzie przeżywają trudne chwile, zdrowienie i rozwój, i jak ważne jest, by terapia spotykała Cię tam, gdzie właśnie jesteś.",
      ],
      subheadApproach: "Jak pracuję",
      bioApproach: [
        "U podstaw mojej pracy leży podejście humanistyczne i egzystencjalne. Terapia humanistyczna kładzie nacisk na empatię, autentyczność i tworzenie przestrzeni, w której czujesz, że ktoś naprawdę Cię słyszy i akceptuje. Terapia egzystencjalna sięga do głębszych pytań o tożsamość, sens, wybór i kierunek życia, zwłaszcza w czasach niepewności lub zmiany. Oznacza to, że widzę w Tobie kogoś więcej niż objawy czy trudności. Skupiam się na zrozumieniu Twojego wewnętrznego świata, emocji, relacji i poczucia własnego ja.",
        "Jednocześnie nie uważam, że terapia powinna zamykać się w jednym nurcie. Gdy to pomaga, sięgam po narzędzia i wnioski z podejść opartych na dowodach, takich jak terapia poznawczo-behawioralna (CBT), opieka uwzględniająca traumę i interwencje behawioralne. W terapii nie chodzi o to, by dopasować Cię do modelu, ale o to, by kształtować pracę wokół Ciebie i tego, czego w danej chwili potrzebujesz.",
      ],
      subheadValues: "Jak wygląda nasza wspólna praca",
      bioValues: [
        "W przestrzeni terapeutycznej cenię szczerość, ciekawość i łagodność. Niezależnie od tego, czy czujesz przytłoczenie, czy masz wrażenie, że stoisz w miejscu, czy po prostu szukasz jasności, staram się stworzyć przestrzeń, w której masz poczucie, że ktoś Cię słyszy, wspiera i nie ocenia.",
        "The Soul Cafe wyrasta z tej filozofii: przestrzenią, w której nauka spotyka się z troską, a Twoja historia dostaje uwagę, na jaką zasługuje.",
      ],
      workHeading: "Nad czym możemy razem pracować",
      workOnTogether: [
        "Lęk i depresja",
        "Stres i wypalenie",
        "Przeciążenie emocjonalne",
        "Poczucie własnej wartości i pewność siebie",
        "Trudności w relacjach",
        "Kwestie przywiązania",
        "Granice i komunikacja",
        "Trudności w kontaktach z ludźmi",
        "Poszukiwanie tożsamości",
        "Zmiany życiowe",
        "Cel i sens",
        "Rozwój osobisty",
        "Wychodzenie z traumy",
        "Doświadczenia z dzieciństwa",
        "Regulacja układu nerwowego",
        "Przepracowywanie emocji",
        "Wsparcie w spektrum autyzmu i neuroróżnorodności",
        "Trudności w zachowaniu",
        "Coaching rodzicielski",
        "Konsultacje rodzinne",
      ],
      closingLine:
        "Kiedy tylko poczujesz, że to dobry moment, w The Soul Cafe czeka na Ciebie miejsce przy stole.",
      questionLink: "Albo najpierw napisz do nas z pytaniem",
    },

    book: {
      meta: {
        title: "Zarezerwuj sesję",
        description:
          "Zarezerwuj sesję psychoterapii online w The Soul Cafe. Prowadzi Vanessa Worrell, M.A. Możesz też zacząć od bezpłatnej {minutes}-minutowej konsultacji, by sprawdzić, czy to dla Ciebie.",
      },
      title: "Zarezerwuj sesję",
      description:
        "Wybierz dogodny dla siebie termin. Sesje odbywają się online, więc możesz połączyć się z miejsca, w którym czujesz się najswobodniej.",
      cards: {
        individual: {
          title: "Sesja terapii indywidualnej",
          description:
            "Poufna {minutes}-minutowa sesja online. Prowadzi Vanessa Worrell, M.A. Ciepły, spokojny czas, by omówić to, co ważne, we własnym tempie.",
        },
        couples: {
          title: "Sesja terapii par",
          description:
            "Poufna {minutes}-minutowa sesja online dla Was dwojga, podczas której wspólnie pracujecie nad zrozumieniem, komunikacją i bliskością.",
        },
        family: {
          title: "Sesja terapii rodzinnej",
          description:
            "Poufna {minutes}-minutowa sesja online dla całej rodziny, w której każdy głos ma swoje miejsce, a drogi naprzód szukacie razem.",
        },
      },
      from: "Od {price}",
      sessionEmbed: "Kalendarz rezerwacji sesji psychoterapii",
      consultBand: "Jeszcze nie masz pewności, czy zacząć?",
      consultLead:
        "To zupełnie w porządku. Poznaj najpierw Vanessę i sprawdź, czy to dla Ciebie. Nic nie musisz rezerwować.",
      consultTitle: "Bezpłatna {minutes}-minutowa konsultacja",
      consultDesc:
        "Krótka, przyjazna rozmowa na początek: możesz zadać pytania i poczuć, jak nam się razem pracuje, zanim zarezerwujesz pełną sesję.",
      consultEmbed: "Kalendarz rezerwacji bezpłatnej konsultacji",
      trouble:
        "Sesje odbywają się online. Masz problem z rezerwacją albo chcesz najpierw o coś zapytać?",
      opensIn: "Otwiera się w Kalendarzu Google",
      orBookHere: "albo zarezerwuj tutaj",
    },

    packages: {
      meta: {
        title: "Pakiety",
        description:
          "Sesje terapii indywidualnej od {price}, a także terapia par i rodzin. Pakiet sześciu sesji to jedna sesja gratis. Zniżki dla młodych dorosłych, studentów, żołnierzy, weteranów i seniorów.",
      },
      heading: "Pakiety",
      intro:
        "Każda sesja odbywa się online. Ceny podane są w rupiach indyjskich, a dla klientów z zagranicy także w dolarach amerykańskich i funtach brytyjskich.",
      currencyLabel: "Waluta",
      currencyNames: {
        INR: "Rupia indyjska",
        USD: "Dolar amerykański",
        GBP: "Funt brytyjski",
      },
      types: {
        individual: "Terapia indywidualna",
        couples: "Terapia par",
        family: "Terapia rodzinna",
      },
      single: "Jedna sesja",
      package: "Sześć sesji",
      packagePill: "Kup {paid}, {free} gratis",
      duration: {
        minutes: "{n} min",
        hours: "{h} godz. {m} min",
      },
      packagesNote: "Pakiety ustalamy przez wiadomość lub WhatsApp.",
      askPackage: "Zapytaj o pakiet",
      discountHeading: "Ceny ze zniżką dla:",
      discounts: [
        "Młodzi dorośli (od {from} do {to} lat)",
        "Studenci",
        "Żołnierze Indyjskich Sił Zbrojnych",
        "Weterani",
        "Seniorzy ({age}+)",
      ],
    },

    contact: {
      meta: {
        title: "Kontakt",
        description:
          "Skontaktuj się z The Soul Cafe w sprawie rezerwacji, pracy i praktyk albo współpracy przy warsztatach i szkoleniach. Zwykle odpowiadamy w ciągu kilku dni.",
      },
      title: "Skontaktuj się z nami",
      intro:
        "Masz pytania, pomysły albo po prostu chcesz się przywitać? Napisz do nas. Zwykle odpowiadamy w ciągu kilku dni.",
      reachBand: "W czym możemy pomóc",
      bookings: "Problemy z rezerwacją",
      jobs: "Praca / Praktyki / Wolontariat",
      collabKicker: "Współpraca",
      workshops: "Warsztaty",
      trainings: "Szkolenia",
    },

    thanks: {
      meta: {
        title: "Dziękujemy",
        description: "Twoja wiadomość została wysłana do The Soul Cafe.",
      },
      title: "Dziękujemy!",
      body: "Twoja wiadomość jest już w drodze. Zwykle odpowiadamy w ciągu kilku dni.",
    },

    learning: {
      meta: {
        title: "Edukacja",
        description:
          "Warsztaty, szkolenia i materiały psychoedukacyjne z The Soul Cafe już wkrótce. Chcesz współpracować? Napisz do nas.",
      },
      title: "Edukacja",
      intro:
        "Warsztaty, szkolenia i materiały psychoedukacyjne są w przygotowaniu: łagodne, praktyczne przestrzenie, by poznawać umysł i rozwijać się we własnym tempie.",
      collabQuestion: "Chcesz wspólnie przygotować warsztat lub szkolenie?",
      collabEnd: ".",
    },

    supperClub: {
      meta: {
        title: "The Soul Food Supper Club",
        description:
          "Wieczór dobrego jedzenia, otwartej rozmowy i dobrego towarzystwa, organizowany przez The Soul Cafe. Już wkrótce. Obserwuj nas na Instagramie albo napisz do nas, by dowiedzieć się więcej.",
      },
      title: "The Soul Food Supper Club",
      intro:
        "Stół nakryty do dobrego jedzenia, szczerej rozmowy i niewymuszonego towarzystwa. Miejsce, by zwolnić i podzielić się posiłkiem z innymi.",
    },

    merch: {
      meta: {
        title: "Merch",
        description:
          "Ciepły, kojący merch z The Soul Cafe jest już w drodze. Obserwuj nas na Instagramie albo napisz do nas, a damy Ci znać, gdy ruszy.",
      },
      title: "Merch",
      intro:
        "Ciepły, kojący merch jest w drodze: drobne rzeczy, które mają dawać poczucie ciepłego kubka w dłoniach.",
    },

    privacy: {
      meta: {
        title: "Prywatność",
        description:
          "Jak The Soul Cafe obchodzi się z Twoimi danymi: bez plików cookie i narzędzi śledzących, formularz kontaktowy używany tylko po to, by Ci odpowiedzieć, a rezerwacje obsługiwane w serwisie Google.",
      },
      title: "Prywatność",
      updated: "Ostatnia aktualizacja: {date}",
      cookies: {
        heading: "Bez plików cookie, bez śledzenia",
        body: "Ta strona nie zapisuje plików cookie i nie korzysta z żadnych narzędzi analitycznych ani śledzących. Samo czytanie tych stron nie zostawia u nas żadnego śladu.",
        storage:
          "Jedna rzecz zostaje w Twojej własnej przeglądarce: wybrany przez Ciebie język, aby strona otwierała się w nim następnym razem. Nigdy nie jest do nas przesyłana.",
      },
      form: {
        heading: "Formularz kontaktowy",
        bodyBefore:
          "Nasz formularz kontaktowy trafia do naszej skrzynki przez FormSubmit, zewnętrzną usługę, która odbiera Twoją wiadomość i załączniki, a następnie przekazuje je nam. Tego, co wysyłasz, używamy tylko po to, by Ci odpowiedzieć. Nie sprzedajemy tych danych i nie udostępniamy ich nikomu poza FormSubmit. Własna ",
        linkLabel: "polityka prywatności",
        bodyAfter: " tej usługi wyjaśnia, jak obchodzi się ona z tym, co przez nią przechodzi.",
        captcha:
          "Zanim Twoja wiadomość zostanie przekazana, FormSubmit może poprosić Cię o rozwiązanie captchy Google.",
      },
      bookings: {
        heading: "Rezerwacje",
        body: "Wizyty rezerwuje się w serwisie Kalendarz Google, na warunkach i zgodnie z polityką prywatności Google. Dane, które tam wpisujesz, przetwarza Google, nie my.",
      },
      links: {
        heading: "Linki do innych serwisów",
        body: "Linki do WhatsApp, Instagrama i innych platform prowadzą poza tę stronę. Tam obowiązują już warunki i polityki prywatności tych serwisów.",
      },
      questions: {
        heading: "Pytania",
        bodyBefore: "Masz pytania o swoją prywatność? Napisz do nas na ",
        bodyAfter: ".",
      },
    },
  },
} satisfies LocaleDict;
