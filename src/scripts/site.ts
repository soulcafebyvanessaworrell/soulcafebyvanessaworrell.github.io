// Client behavior for the site chrome. Dependency-free. Every binding is
// (re)attached on `astro:page-load` so it survives Astro's view transitions,
// which swap the DOM without a full reload.

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Scroll reveal: headings, feature items, and cards in the page body fade in
// and rise the first time they enter the viewport. Cards in the chrome are
// excluded: the language menu is a `.card` too, and a menu must appear at once.
// Hiding is applied by JS only, so with scripting off (or reduced motion) the
// content is simply visible. Recreated per page so it tracks the freshly
// swapped DOM.
let revealObserver: IntersectionObserver | null = null;

function initReveal(): void {
  revealObserver?.disconnect();
  revealObserver = null;
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) return;

  const targets = Array.from(
    document.querySelectorAll<HTMLElement>("[data-reveal], main .card"),
  ).filter((el) => el.dataset.revealed !== "done");
  if (targets.length === 0) return;

  // Stagger siblings within the same parent so a grid or row cascades in.
  const seen = new Map<Element, number>();
  for (const el of targets) {
    const parent = el.parentElement;
    const index = parent ? (seen.get(parent) ?? 0) : 0;
    if (parent) seen.set(parent, index + 1);
    el.style.transitionDelay = `${Math.min(index, 6) * 60}ms`;
    el.classList.add("reveal-pending");
  }

  revealObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.classList.add("revealed");
        el.dataset.revealed = "done";
        observer.unobserve(el);
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
  );

  for (const el of targets) revealObserver.observe(el);
}

// WhatsApp float: one soft scale-in the first time it appears in the session.
// The flag lives at module scope, which survives view transitions (the module
// is not re-executed), so later navigations don't replay it. The class is
// removed on animationend so the hover scale keeps working afterward.
let whatsappIntroDone = false;

function initWhatsAppIntro(): void {
  if (whatsappIntroDone) return;
  const float = document.querySelector<HTMLElement>(".whatsapp-float");
  if (!float) return;
  whatsappIntroDone = true;
  if (prefersReducedMotion()) return;
  float.addEventListener("animationend", () => float.classList.remove("animate-in"), {
    once: true,
  });
  float.classList.add("animate-in");
}

// On phones, hide the WhatsApp float while a form field is focused so it never
// covers the input being filled. Bound once at module scope (the document
// persists across view transitions), guarded so page-loads don't stack it.
let whatsappFocusHideBound = false;

function initWhatsAppFocusHide(): void {
  if (whatsappFocusHideBound) return;
  whatsappFocusHideBound = true;
  const small = window.matchMedia("(max-width: 767px)");
  const isField = (node: EventTarget | null): boolean =>
    node instanceof Element && node.matches("input, textarea, select");
  const float = (): HTMLElement | null => document.querySelector(".whatsapp-float");

  document.addEventListener("focusin", (event) => {
    if (small.matches && isField(event.target)) float()?.classList.add("whatsapp-float--hidden");
  });
  document.addEventListener("focusout", () => {
    // Defer so focus moving between fields keeps it hidden without a flicker.
    setTimeout(() => {
      if (!isField(document.activeElement)) float()?.classList.remove("whatsapp-float--hidden");
    }, 0);
  });
}

// Language picker: the <details> works without JS; this closes it on Escape
// and on a click outside, which native <details> does not do. Bound once at
// module scope (the document persists across view transitions); the handlers
// look the picker up per event so they track the freshly swapped DOM.
let languagePickerBound = false;

function initLanguagePicker(): void {
  if (languagePickerBound) return;
  languagePickerBound = true;
  const openPickers = (): HTMLDetailsElement[] =>
    Array.from(
      document.querySelectorAll<HTMLDetailsElement>("details[data-language-picker][open]"),
    );

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    for (const picker of openPickers()) {
      picker.open = false;
      picker.querySelector<HTMLElement>("summary")?.focus();
    }
  });
  document.addEventListener("click", (event) => {
    for (const picker of openPickers()) {
      if (event.target instanceof Node && picker.contains(event.target)) continue;
      picker.open = false;
    }
  });
}

function init(): void {
  initReveal();
  initWhatsAppIntro();
  initWhatsAppFocusHide();
  initLanguagePicker();
}

document.addEventListener("astro:page-load", init);
