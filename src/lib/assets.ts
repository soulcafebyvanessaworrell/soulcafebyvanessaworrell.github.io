// Central import point for the owner's original brand images. The PNGs go
// through astro:assets (ImageMetadata, so they are hashed, optimized, and get
// width/height baked in). The SVGs are imported for their emitted URL (`.src`),
// used in plain <img src>. Every component pulls images from here so paths live
// in one place.

import founder from "../assets/founder.png";
import logo from "../assets/logo.png";
// Astro returns an SVG import as a component that also carries ImageMetadata;
// we only want its URL here, so take `.src`.
import signatureSvg from "../assets/signature.svg";
import teacupDoodleSvg from "../assets/teacup-doodle.svg";

const signature: string = signatureSvg.src;
const teacupDoodle: string = teacupDoodleSvg.src;

export { founder, logo, signature, teacupDoodle };
