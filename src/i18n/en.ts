// The canonical dictionary. This file holds every visible English string on
// the site AND, through `LocaleDict`, defines the shape every other locale must
// match: same keys, same array lengths, every leaf a string. Locale files
// declare `satisfies LocaleDict`, so a missing, extra, or misplaced key is a
// compile error; src/i18n/i18n.test.ts is the runtime backstop.
//
// Sections: `ui` (shared chrome), `form` (the contact form), `blog` (blog
// chrome), and `pages.<name>` (each page's meta plus prose). Icons, URLs, and
// layout stay in the page files; only words live here.

export interface TranslationStatus {
  /** "human" for owner-written or reviewed prose, "ai" for a machine draft,
   *  "stub" while the file still carries English. */
  source: "human" | "ai" | "stub";
  reviewed: boolean;
  note: string;
}

export const en = {
  translation: { source: "human", reviewed: true, note: "" },

  ui: {
    skip_to_content: "Skip to content",
    switch_language: "Change language",
    primary_navigation: "Primary",

    nav_about: "About Us",
    nav_packages: "Packages",
    nav_blog: "Blog",
    nav_merch: "Merch",
    nav_learning: "Learning",
    nav_supper_club: "Supper Club",

    home: "Home",
    cart: "Cart",

    book_session: "Book a Session",
    free_consultation: "Free {minutes}-minute consultation",
    contact_us: "Contact Us",
    back_home: "Back to home",

    tagline: "Healing brewed daily...",

    founder_role: "Founder and Psychotherapist",

    footer_contact: "Get in touch",
    footer_follow: "Follow along",

    coming_soon: "Coming soon...",
    coming_soon_body:
      "This corner of the cafe is still brewing. Follow along on Instagram or reach out and we will let you know the moment it opens.",

    crisis_note:
      "The Soul Cafe is not an emergency service. In a crisis, call Tele-MANAS, the Government of India's free 24x7 mental health helpline: {short} or {full}.",

    whatsapp_label: "Chat with us on WhatsApp",

    not_found_title: "Page not found",
    not_found_body: "The page you were looking for has wandered off. Let's get you back.",

    languages_india: "India",
    languages_europe: "Europe",

    version: "Version",
    version_production: "production",
  },

  form: {
    name: "Name",
    phone: "Phone number",
    countryCode: "Country code",
    number: "Number",
    phoneFormat: "Please enter a valid phone number.",
    email: "Email",
    subject: "Subject",
    attachment: "Attachment",
    attachmentHelp: "Optional. A document or image, up to about 10 MB.",
    message: "Message",
    messagePlaceholder: "Tell us a little about what brings you here...",
    send: "Send message",
    required: "required",
    optional: "(optional)",
    replyHint: "Give us a phone number or an email so we can reply.",
    alt: "Prefer another way? Reach us directly:",
    call: "Call us",
    whatsapp: "WhatsApp",
    email_us: "Email us",
    honeypot: "Leave this field empty",
  },

  blog: {
    title: "Blog",
    intro: "A few honest notes on healing and everyday wellbeing, added here as they come.",
    read: "Read",
    back: "Back to blog",
    metaDescription:
      "Short, honest notes on healing and everyday mental wellbeing from The Soul Cafe.",
  },

  pages: {
    home: {
      meta: {
        title: "Psychotherapy by Vanessa Worrell",
        description:
          "A warm, non-judgmental psychotherapy space to explore, heal, and grow. Support for adolescents, adults, and families from an internationally trained psychologist.",
      },
      hero: {
        heading: "Welcome to The Soul Cafe!",
        lead: "You don't have to navigate life alone. A warm, non judgmental space to explore, heal, and grow.",
        body: "Psychotherapy built on a simple idea: healing and nurturing souls with evidence backed practices, led by an internationally trained psychologist supporting adolescents, adults, and families seeking clarity, healing, and meaningful change.",
        photoAlt: "Vanessa Worrell, founder and psychotherapist at The Soul Cafe",
      },
      expertise: {
        heading: "Expertise",
        items: [
          "Emotional Wellbeing",
          "Relationships and Attachment",
          "Trauma and Healing",
          "Growth and Self Discovery",
          "Substance Use Disorders",
        ],
      },
      approaches: {
        heading: "Evidence-Based Approaches We Draw From",
        chips: [
          "Cognitive Behavioral Therapy",
          "Humanistic",
          "Trauma Informed Care",
          "Existential",
          "Dialectical Behavioral Therapy",
          "Applied Behavior Analysis",
          "Mindfulness",
        ],
      },
      support: {
        heading: "Who We Support",
        items: [
          "Adolescents",
          "Adults",
          "Families",
          "Neurodivergent Individuals",
          "Professionals and Caregivers",
        ],
      },
      closing: {
        line: "Taking the first step is often the hardest part. When you feel ready, send a message and we can talk it through together.",
      },
    },

    about: {
      meta: {
        title: "About Us",
        description:
          "Vanessa Worrell, founder of The Soul Cafe, is a psychologist trained in the US, the UK, and India. Her work is humanistic and existential, and draws on CBT when it helps.",
      },
      heading: "About Our Founder and Psychotherapist",
      photoAlt: "Vanessa Worrell, founder of The Soul Cafe",
      bioOpening: [
        "I'm a psychologist trained across the United States, the United Kingdom, and India, and the founder of The Soul Cafe. I created this space with a simple intention, to make therapy feel both deeply human and clinically grounded.",
        "My journey into psychology has been shaped by working across diverse settings, from specific spaces like drug rehabilitation centers to more general settings like community health settings. These experiences have allowed me to understand how differently people experience distress, healing, and growth, and how important it is for therapy to meet you where you are.",
      ],
      subheadApproach: "How I work",
      bioApproach: [
        "At the core of my work is a humanistic and existential approach. Humanistic therapy emphasises empathy, authenticity, and creating a space where you feel truly heard and accepted. Existential therapy explores deeper questions around identity, meaning, choice, and the direction of your life, especially during times of uncertainty or transition. This means that I see you as more than your symptoms or difficulties. I focus on understanding your inner world, your emotions, your relationships, and your sense of self.",
        "At the same time, I do not believe therapy should be limited to a single framework. I integrate tools and insights from evidence based approaches such as cognitive behavioural therapy (CBT), trauma informed care, and behavioural interventions when they are helpful. Therapy is not about fitting you into a model, it is about shaping the work around you and what you need in that moment.",
      ],
      subheadValues: "What our work feels like",
      bioValues: [
        "I value honesty, curiosity, and gentleness in the therapeutic space. Whether you are feeling overwhelmed, stuck, or simply seeking clarity, I aim to create a space where you feel heard, supported, and not judged.",
        "The Soul Cafe is an extension of that philosophy, a space where science meets care, and where your story is given the attention it deserves.",
      ],
      workHeading: "What we can work on together",
      workOnTogether: [
        "Anxiety and depression",
        "Stress and burnout",
        "Emotional overwhelm",
        "Self esteem and confidence",
        "Relationship difficulties",
        "Attachment concerns",
        "Boundaries and communication",
        "Interpersonal challenges",
        "Identity exploration",
        "Life transitions",
        "Purpose and meaning",
        "Personal development",
        "Trauma recovery",
        "Childhood experiences",
        "Nervous system regulation",
        "Emotional processing",
        "Autism and neurodiversity support",
        "Behavioural challenges",
        "Parent coaching",
        "Family consultation",
      ],
      closingLine: "Whenever you feel ready, there is a seat waiting for you at The Soul Cafe.",
      questionLink: "Or reach out with a question first",
    },

    book: {
      meta: {
        title: "Book a Session",
        description:
          "Book an online psychotherapy session with Vanessa Worrell, M.A., at The Soul Cafe, or start with a free {minutes}-minute consultation to see if it's the right fit.",
      },
      title: "Book a Session",
      description:
        "Choose a time that works for you. Sessions are online, so you can meet from wherever you feel most at ease.",
      cards: {
        individual: {
          title: "One-on-one therapy session",
          description:
            "A confidential {minutes}-minute online session with Vanessa Worrell, M.A. Warm, unhurried time to talk things through at your own pace.",
        },
        couples: {
          title: "Couples therapy session",
          description:
            "A confidential {minutes}-minute online session for the two of you, working together on understanding, communication, and connection.",
        },
        family: {
          title: "Family therapy session",
          description:
            "A confidential {minutes}-minute online session for the whole family, making room for every voice and finding a way forward together.",
        },
      },
      from: "From {price}",
      sessionEmbed: "Booking calendar for a psychotherapy session",
      consultBand: "Not Sure About Starting Yet?",
      consultLead:
        "That's completely okay. Meet Vanessa first and see whether it feels like a fit. There's no pressure to book anything.",
      consultTitle: "Free {minutes}-minute consultation",
      consultDesc:
        "A short, friendly introductory call to ask questions and get a feel for how we work together before you book a full session.",
      consultEmbed: "Booking calendar for a free consultation",
      trouble: "Sessions are held online. Trouble with bookings, or have a question first?",
      opensIn: "Opens in Google Calendar",
      orBookHere: "or book right here",
    },

    packages: {
      meta: {
        title: "Packages",
        description:
          "One-on-one therapy sessions from {price}, with couples and family therapy too. A package of six sessions saves you one. Discounts for youth, students, armed forces personnel, ex-servicemen, and seniors.",
      },
      heading: "Packages",
      intro:
        "Every session is held online. Prices are in Indian rupees, with US dollar and British pound prices shown for clients abroad.",
      currencyLabel: "Currency",
      currencyNames: {
        INR: "Indian rupee",
        USD: "US dollar",
        GBP: "British pound",
      },
      types: {
        individual: "One-on-one therapy",
        couples: "Couples therapy",
        family: "Family therapy",
      },
      single: "One session",
      package: "Six sessions",
      packagePill: "Buy {paid}, get {free} free",
      duration: {
        minutes: "{n} minutes",
        hours: "{h} hour {m} minutes",
      },
      packagesNote: "Packages are arranged by message or WhatsApp.",
      askPackage: "Ask about a package",
      discountHeading: "Discounted Pricing Available for:",
      discounts: [
        "Youth ({from} to {to} y/o)",
        "Students",
        "Personnel of Indian Armed Forces",
        "Ex-Servicemen",
        "Seniors ({age} y/o+)",
      ],
    },

    contact: {
      meta: {
        title: "Contact Us",
        description:
          "Get in touch with The Soul Cafe about bookings, jobs and internships, or collaboration on workshops and trainings. We usually reply within a couple of days.",
      },
      title: "Contact Us",
      intro:
        "Questions, ideas, or just want to say hello? Drop us a line. We usually reply within a couple of days.",
      reachBand: "Reach out for",
      bookings: "Trouble with bookings",
      jobs: "Jobs / Internships / Volunteer Opportunities",
      collabKicker: "Collaboration on",
      workshops: "Workshops",
      trainings: "Trainings",
    },

    thanks: {
      meta: {
        title: "Thank you",
        description: "Your message has been sent to The Soul Cafe.",
      },
      title: "Thank you!",
      body: "Your message is on its way. We usually reply within a couple of days.",
    },

    learning: {
      meta: {
        title: "Learning",
        description:
          "Workshops, trainings, and psychoeducation resources from The Soul Cafe are on the way. Interested in collaborating? Get in touch.",
      },
      title: "Learning",
      intro:
        "Workshops, trainings, and psychoeducation resources are on the way: gentle, practical spaces to learn about the mind and grow at your own pace.",
      collabQuestion: "Would you like to collaborate on a workshop or training?",
      collabEnd: ".",
    },

    supperClub: {
      meta: {
        title: "The Soul Food Supper Club",
        description:
          "An evening of good food, open conversation, and good company from The Soul Cafe. Coming soon. Follow along on Instagram or get in touch to hear more.",
      },
      title: "The Soul Food Supper Club",
      intro:
        "A table set for good food, honest conversation, and easy company. Somewhere to slow down and share a meal with other people.",
    },

    merch: {
      meta: {
        title: "Merch",
        description:
          "Cozy, comforting merch from The Soul Cafe is on its way. Follow along on Instagram or get in touch and we'll tell you when it opens.",
      },
      title: "Merch",
      intro:
        "Cozy, comforting merch is on its way: small things made to feel like a warm cup in your hands.",
    },

    privacy: {
      meta: {
        title: "Privacy",
        description:
          "How The Soul Cafe handles your information: no cookies or trackers, a contact form used only to reply to you, and bookings handled on Google's own site.",
      },
      title: "Privacy",
      updated: "Last updated: {date}",
      cookies: {
        heading: "No cookies, no tracking",
        body: "This website sets no cookies and runs no analytics or trackers. Simply reading these pages leaves no record with us.",
        storage:
          "One thing stays in your own browser: the language you chose, so the site opens in it next time. It is never sent to us.",
      },
      form: {
        heading: "The contact form",
        bodyBefore:
          "Our contact form reaches our inbox through FormSubmit, a third-party service that receives your message and any attachments and passes them on to us. We use what you send only to reply to you. We don't sell it, and we don't share it with anyone beyond FormSubmit, whose own ",
        linkLabel: "privacy policy",
        bodyAfter: " explains how they handle what passes through them.",
      },
      bookings: {
        heading: "Bookings",
        body: "Appointments are booked on Google Calendar's own site, under Google's terms and privacy policy. Any details you enter there are handled by Google, not by us.",
      },
      links: {
        heading: "Links to other services",
        body: "Links to WhatsApp, Instagram, and other platforms take you off this site. Once you're there, those services' own terms and privacy policies apply.",
      },
      questions: {
        heading: "Questions",
        bodyBefore: "Any questions about your privacy? Email us at ",
        bodyAfter: ".",
      },
    },
  },
} as const;

/** Recursively widens every string leaf to `string`, so a translation matches
 *  the English shape (same keys, same tuple lengths) without matching its text. */
export type Localized<T> = T extends string ? string : { readonly [K in keyof T]: Localized<T[K]> };

export type LocaleDict = Localized<Omit<typeof en, "translation">> & {
  translation: TranslationStatus;
};

export type UiKey = keyof typeof en.ui;
