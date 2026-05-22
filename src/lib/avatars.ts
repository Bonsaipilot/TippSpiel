const uri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`

// ── Smiley: round emoji face, color configurable ─────────────────────────────
const smiley = (bg: string, face: string, faceColor = '#FFD700', shineColor = '#FFE44D') => uri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
  `<rect width="100" height="100" fill="${bg}"/>` +
  `<circle cx="50" cy="50" r="38" fill="${faceColor}"/>` +
  `<circle cx="40" cy="38" r="22" fill="${shineColor}" opacity="0.35"/>` +
  face + `</svg>`
)

// ── Robot: white head on blue background ────────────────────────────────────
const robot = (bg: string, face: string) => uri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
  `<rect width="100" height="100" fill="${bg}"/>` +
  face + `</svg>`
)

// ── Squid Game mask: oval face, eye slit, symbol BELOW slit ─────────────────
const squid = (bg: string, symbol: string) => uri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
  `<rect width="100" height="100" fill="${bg}"/>` +
  `<ellipse cx="50" cy="55" rx="30" ry="36" fill="#f0f0f0"/>` +
  `<rect x="30" y="47" width="40" height="12" rx="6" fill="#1a1a1a"/>` +
  symbol + `</svg>`
)
// Symbols positioned BELOW the eye slit (y > 59)
const sqC = `<circle cx="50" cy="74" r="8" fill="none" stroke="#1a1a1a" stroke-width="2.5"/>`
const sqT = `<polygon points="50,63 63,83 37,83" fill="none" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>`
const sqS = `<rect x="40" y="63" width="20" height="20" rx="1.5" fill="none" stroke="#1a1a1a" stroke-width="2.5"/>`

// Shorthands for colored smiley eye/mouth colors
const GE = '#1d5c1d' // green face: dark feature color
const BE = '#1a3d6e' // blue face: dark feature color

// ── Menschen helpers ──────────────────────────────────────────────────────────
const SL = '#FECBA1' // helle Haut
const SD = '#795548' // dunkle Haut
const human = (bg: string, skin: string, hair: string, face: string) => uri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
  `<rect width="100" height="100" fill="${bg}"/>` +
  `<path d="M10,100 Q10,78 50,76 Q90,78 90,100Z" fill="${skin}"/>` +
  `<ellipse cx="50" cy="50" rx="24" ry="26" fill="${skin}"/>` +
  `<ellipse cx="26" cy="52" rx="4" ry="6" fill="${skin}"/>` +
  `<ellipse cx="74" cy="52" rx="4" ry="6" fill="${skin}"/>` +
  hair + face + `</svg>`
)
// Hair
const hShortDark  = `<ellipse cx="50" cy="35" rx="24" ry="12" fill="#2C1810"/>`
const hShortBlond = `<ellipse cx="50" cy="35" rx="24" ry="12" fill="#E0C040"/>`
const hShortBlack = `<ellipse cx="50" cy="35" rx="24" ry="12" fill="#1A1A1A"/>`
const hShortGray  = `<ellipse cx="50" cy="35" rx="24" ry="12" fill="#9E9E9E"/>`
const hShortRed   = `<ellipse cx="50" cy="35" rx="24" ry="12" fill="#BF4000"/>`
const hLongBrown  = `<ellipse cx="50" cy="35" rx="24" ry="12" fill="#6B3A2A"/>` +
  `<rect x="25" y="38" width="7" height="32" rx="3.5" fill="#6B3A2A"/>` +
  `<rect x="68" y="38" width="7" height="32" rx="3.5" fill="#6B3A2A"/>`
const hLongBlond  = `<ellipse cx="50" cy="35" rx="24" ry="12" fill="#E0C040"/>` +
  `<rect x="25" y="38" width="7" height="38" rx="3.5" fill="#E0C040"/>` +
  `<rect x="68" y="38" width="7" height="38" rx="3.5" fill="#E0C040"/>`
const hBunBlack   = `<ellipse cx="50" cy="37" rx="24" ry="12" fill="#1A1A1A"/>` +
  `<circle cx="50" cy="24" r="10" fill="#1A1A1A"/>`
const hBobBrown   = `<ellipse cx="50" cy="35" rx="24" ry="12" fill="#3D2010"/>` +
  `<rect x="25" y="38" width="7" height="18" rx="3.5" fill="#3D2010"/>` +
  `<rect x="68" y="38" width="7" height="18" rx="3.5" fill="#3D2010"/>`
const hPixieDark  = `<ellipse cx="50" cy="37" rx="22" ry="10" fill="#3D2010"/>`
const hAfro       = `<ellipse cx="50" cy="30" rx="28" ry="20" fill="#1A1A1A"/>`
const hAfroPuff   = `<ellipse cx="50" cy="38" rx="24" ry="12" fill="#1A1A1A"/>` +
  `<circle cx="50" cy="23" r="12" fill="#1A1A1A"/>`
// Faces
const fHappy   = `<circle cx="42" cy="55" r="3.5" fill="#333"/><circle cx="58" cy="55" r="3.5" fill="#333"/>` +
  `<path d="M38,66 Q50,75 62,66" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>`
const fGrin    = `<circle cx="42" cy="55" r="3.5" fill="#333"/><circle cx="58" cy="55" r="3.5" fill="#333"/>` +
  `<path d="M38,65 Q50,76 62,65 L60,70 Q50,73 40,70Z" fill="white" stroke="#333" stroke-width="1.5"/>`
const fWink    = `<path d="M38,53 Q42,49 46,53" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>` +
  `<circle cx="58" cy="55" r="3.5" fill="#333"/>` +
  `<path d="M38,66 Q50,75 62,66" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>`
const fSmirk   = `<circle cx="42" cy="55" r="3.5" fill="#333"/><circle cx="58" cy="55" r="3.5" fill="#333"/>` +
  `<path d="M42,67 Q52,74 60,66" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>`
const fGlasses = `<circle cx="42" cy="55" r="3.5" fill="#333"/><circle cx="58" cy="55" r="3.5" fill="#333"/>` +
  `<path d="M38,66 Q50,75 62,66" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>` +
  `<rect x="31" y="48" width="15" height="12" rx="6" fill="none" stroke="#666" stroke-width="2.5"/>` +
  `<rect x="54" y="48" width="15" height="12" rx="6" fill="none" stroke="#666" stroke-width="2.5"/>` +
  `<line x1="46" y1="54" x2="54" y2="54" stroke="#666" stroke-width="2"/>` +
  `<line x1="22" y1="54" x2="31" y2="54" stroke="#666" stroke-width="2"/>` +
  `<line x1="69" y1="54" x2="79" y2="54" stroke="#666" stroke-width="2"/>`

export interface AvatarOption { id: string; url: string }

export const AVATARS: AvatarOption[] = [

  // ── 😄 Smileys gelb ── 20 ───────────────────────────────────────────────

  { id: 's1', url: smiley('#ffd6e0',
    `<circle cx="37" cy="43" r="4" fill="#333"/><circle cx="63" cy="43" r="4" fill="#333"/>` +
    `<path d="M34,61 Q50,75 66,61" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>`) },

  { id: 's2', url: smiley('#ffe4a0',
    `<path d="M31,41 Q37,35 43,41" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M57,41 Q63,35 69,41" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M30,59 Q50,74 70,59 L70,66 Q50,72 30,66Z" fill="white" stroke="#333" stroke-width="2"/>`) },

  { id: 's3', url: smiley('#d4f7ff',
    `<circle cx="37" cy="43" r="4" fill="#333"/><circle cx="63" cy="43" r="4" fill="#333"/>` +
    `<path d="M34,61 Q50,75 66,61" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<ellipse cx="50" cy="11" rx="18" ry="4" fill="none" stroke="#ffe066" stroke-width="3"/>`) },

  { id: 's4', url: smiley('#ffe4e8',
    `<path d="M34,47 Q33,41 37,39 Q41,37 43,41 Q45,37 49,39 Q53,41 52,47 L43,54Z" fill="#e53935"/>` +
    `<path d="M47,47 Q46,41 50,39 Q54,37 56,41 Q58,37 62,39 Q66,41 65,47 L56,54Z" fill="#e53935"/>` +
    `<path d="M34,63 Q50,75 66,63" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>`) },

  { id: 's5', url: smiley('#ffe0f0',
    `<path d="M31,43 Q37,37 43,43" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<circle cx="63" cy="43" r="4" fill="#333"/>` +
    `<circle cx="50" cy="63" r="7" fill="#ff8fa3"/>` +
    `<path d="M64,28 Q65,25 68,25 Q71,25 72,28 Q71,31 68,34Z" fill="#e53935"/>`) },

  { id: 's6', url: smiley('#fff0c0',
    `<path d="M31,43 Q37,37 43,43" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<circle cx="63" cy="43" r="4" fill="#333"/>` +
    `<path d="M38,60 Q50,70 62,60" stroke="#333" stroke-width="2" fill="#ff8fa3"/>` +
    `<ellipse cx="50" cy="67" rx="8" ry="6" fill="#ff8fa3"/>`) },

  { id: 's7', url: smiley('#e8f4ff',
    `<path d="M37,37 L38.5,42 L43,42 L39.5,45 L41,49.5 L37,47 L33,49.5 L34.5,45 L31,42 L35.5,42Z" fill="#FFB300"/>` +
    `<path d="M63,37 L64.5,42 L69,42 L65.5,45 L67,49.5 L63,47 L59,49.5 L60.5,45 L57,42 L61.5,42Z" fill="#FFB300"/>` +
    `<path d="M34,62 Q50,74 66,62" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>`) },

  { id: 's8', url: smiley('#e8e8f0',
    `<rect x="31" y="41" width="13" height="5" rx="2.5" fill="#333"/>` +
    `<rect x="56" y="41" width="13" height="5" rx="2.5" fill="#333"/>` +
    `<line x1="36" y1="63" x2="64" y2="63" stroke="#333" stroke-width="3" stroke-linecap="round"/>`) },

  { id: 's9', url: smiley('#c8f7e4',
    `<path d="M31,41 Q37,34 43,41" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M57,41 Q63,34 69,41" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M30,58 Q50,76 70,58 L62,66 Q50,70 38,66Z" fill="#333"/>` +
    `<ellipse cx="28" cy="52" rx="3" ry="6" fill="#69b4ff"/>` +
    `<ellipse cx="72" cy="52" rx="3" ry="6" fill="#69b4ff"/>`) },

  { id: 's10', url: smiley('#fff9c0',
    `<circle cx="37" cy="43" r="4" fill="#333"/><circle cx="63" cy="43" r="4" fill="#333"/>` +
    `<path d="M34,61 Q50,75 66,61" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M75,26 Q77,21 79,26 Q79,32 77,32 Q75,32 75,26Z" fill="#69b4ff"/>`) },

  { id: 's11', url: smiley('#ffe4f4',
    `<path d="M31,41 Q37,35 43,41" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M57,41 Q63,35 69,41" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M34,61 Q50,73 66,61" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M17,27 Q17,23 20,23 Q23,23 23,26 Q23,23 26,23 Q29,23 29,27 L23,33Z" fill="#e53935"/>` +
    `<path d="M72,19 Q72,16 74.5,16 Q77,16 77,19 Q77,16 79.5,16 Q82,16 82,19 L77,24Z" fill="#e53935"/>`) },

  { id: 's12', url: smiley('#f0e0ff',
    `<line x1="31" y1="38" x2="43" y2="48" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<line x1="43" y1="38" x2="31" y2="48" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<line x1="57" y1="38" x2="69" y2="48" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<line x1="69" y1="38" x2="57" y2="48" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M36,61 Q50,71 64,61" stroke="#333" stroke-width="2" fill="#ff8fa3"/>` +
    `<ellipse cx="50" cy="68" rx="9" ry="6" fill="#ff8fa3"/>`) },

  { id: 's13', url: smiley('#e0f4e0',
    `<circle cx="37" cy="43" r="4" fill="#333"/><circle cx="63" cy="43" r="4" fill="#333"/>` +
    `<path d="M31,35 Q37,31 43,33" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>` +
    `<path d="M40,63 Q54,72 65,61" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>`) },

  { id: 's14', url: smiley('#e8e0f8',
    `<path d="M31,47 Q37,41 43,47" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M57,47 Q63,41 69,47" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M34,61 Q50,73 66,61" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<text x="64" y="29" font-family="sans-serif" font-size="11" fill="#aaa" font-weight="bold">z</text>` +
    `<text x="70" y="21" font-family="sans-serif" font-size="9" fill="#bbb" font-weight="bold">z</text>`) },

  { id: 's15', url: smiley('#ddeeff',
    `<circle cx="37" cy="43" r="4" fill="#333"/><circle cx="63" cy="43" r="4" fill="#333"/>` +
    `<path d="M34,68 Q50,58 66,68" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M37,48 Q35,55 38,60" fill="none" stroke="#69b4ff" stroke-width="3" stroke-linecap="round"/>`) },

  { id: 's16', url: smiley('#ffe0e0',
    `<line x1="30" y1="35" x2="43" y2="42" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<line x1="70" y1="35" x2="57" y2="42" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<circle cx="37" cy="45" r="4" fill="#333"/><circle cx="63" cy="45" r="4" fill="#333"/>` +
    `<path d="M34,66 Q50,57 66,66" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>`) },

  { id: 's17', url: smiley('#f0f4e8',
    `<circle cx="37" cy="44" r="9" fill="white" stroke="#333" stroke-width="2.5"/>` +
    `<circle cx="63" cy="44" r="9" fill="white" stroke="#333" stroke-width="2.5"/>` +
    `<line x1="46" y1="44" x2="54" y2="44" stroke="#333" stroke-width="2"/>` +
    `<line x1="19" y1="42" x2="28" y2="44" stroke="#333" stroke-width="2"/>` +
    `<line x1="81" y1="42" x2="72" y2="44" stroke="#333" stroke-width="2"/>` +
    `<circle cx="37" cy="44" r="4" fill="#333"/><circle cx="63" cy="44" r="4" fill="#333"/>` +
    `<path d="M38,63 Q50,71 62,63 L60,67 Q50,70 40,67Z" fill="white" stroke="#333" stroke-width="1.5"/>`) },

  { id: 's18', url: smiley('#e0f0ff',
    `<rect x="22" y="37" width="22" height="14" rx="5" fill="#1a1a1a"/>` +
    `<rect x="56" y="37" width="22" height="14" rx="5" fill="#1a1a1a"/>` +
    `<line x1="44" y1="44" x2="56" y2="44" stroke="#1a1a1a" stroke-width="2.5"/>` +
    `<path d="M34,62 Q50,74 66,62" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>`) },

  { id: 's19', url: smiley('#fff4e0',
    `<circle cx="37" cy="42" r="6" fill="#333"/><circle cx="36" cy="40" r="2.5" fill="white"/>` +
    `<circle cx="63" cy="42" r="6" fill="#333"/><circle cx="62" cy="40" r="2.5" fill="white"/>` +
    `<ellipse cx="50" cy="64" rx="8" ry="9" fill="#333"/>`) },

  { id: 's20', url: smiley('#f0e8ff',
    `<circle cx="37" cy="44" r="6" fill="white" stroke="#333" stroke-width="1.5"/>` +
    `<circle cx="37" cy="40" r="3.5" fill="#333"/>` +
    `<circle cx="63" cy="44" r="6" fill="white" stroke="#333" stroke-width="1.5"/>` +
    `<circle cx="63" cy="40" r="3.5" fill="#333"/>` +
    `<line x1="36" y1="63" x2="64" y2="63" stroke="#333" stroke-width="3" stroke-linecap="round"/>`) },

  // ── 😄 Smileys grün ── 5 ─────────────────────────────────────────────────

  { id: 's21', url: smiley('#c8f0c0',
    `<circle cx="37" cy="43" r="4" fill="${GE}"/><circle cx="63" cy="43" r="4" fill="${GE}"/>` +
    `<path d="M31,60 Q50,76 69,60 L67,67 Q50,72 33,67Z" fill="white" stroke="${GE}" stroke-width="1.5"/>`,
    '#5ab85a', '#7fd07f') },

  { id: 's22', url: smiley('#d8f4d0',
    `<path d="M31,43 Q37,37 43,43" fill="none" stroke="${GE}" stroke-width="3" stroke-linecap="round"/>` +
    `<circle cx="63" cy="43" r="4" fill="${GE}"/>` +
    `<path d="M34,62 Q50,74 66,62" fill="none" stroke="${GE}" stroke-width="3" stroke-linecap="round"/>`,
    '#52b052', '#78cc78') },

  { id: 's23', url: smiley('#b8ecb0',
    `<rect x="23" y="37" width="21" height="13" rx="4.5" fill="${GE}"/>` +
    `<rect x="56" y="37" width="21" height="13" rx="4.5" fill="${GE}"/>` +
    `<line x1="44" y1="43" x2="56" y2="43" stroke="${GE}" stroke-width="2.5"/>` +
    `<path d="M34,63 Q50,74 66,63" fill="none" stroke="${GE}" stroke-width="3" stroke-linecap="round"/>`,
    '#4eb04e', '#72cc72') },

  { id: 's24', url: smiley('#c0f0b8',
    `<path d="M37,37 L38.5,42 L43,42 L39.5,45 L41,50 L37,47 L33,50 L34.5,45 L31,42 L35.5,42Z" fill="#FFB300"/>` +
    `<path d="M63,37 L64.5,42 L69,42 L65.5,45 L67,50 L63,47 L59,50 L60.5,45 L57,42 L61.5,42Z" fill="#FFB300"/>` +
    `<path d="M34,62 Q50,74 66,62" fill="none" stroke="${GE}" stroke-width="3" stroke-linecap="round"/>`,
    '#58b858', '#7fd07f') },

  { id: 's25', url: smiley('#d0f8c8',
    `<path d="M31,41 Q37,34 43,41" fill="none" stroke="${GE}" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M57,41 Q63,34 69,41" fill="none" stroke="${GE}" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M30,58 Q50,76 70,58 L62,66 Q50,70 38,66Z" fill="${GE}"/>` +
    `<ellipse cx="25" cy="50" rx="3" ry="6" fill="#a8e8a0"/>` +
    `<ellipse cx="75" cy="50" rx="3" ry="6" fill="#a8e8a0"/>`,
    '#50b450', '#76cc76') },

  // ── 😄 Smileys blau ── 5 ─────────────────────────────────────────────────

  { id: 's26', url: smiley('#c8dcf8',
    `<circle cx="37" cy="44" r="4" fill="${BE}"/><circle cx="63" cy="44" r="4" fill="${BE}"/>` +
    `<path d="M35,62 Q50,74 65,62" fill="none" stroke="${BE}" stroke-width="3" stroke-linecap="round"/>`,
    '#4a96d8', '#70b8f0') },

  { id: 's27', url: smiley('#d0e4ff',
    `<path d="M31,40 Q37,33 43,40" fill="none" stroke="${BE}" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M57,40 Q63,33 69,40" fill="none" stroke="${BE}" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M31,58 Q50,74 69,58 L62,66 Q50,70 38,66Z" fill="${BE}"/>` +
    `<ellipse cx="28" cy="52" rx="3" ry="6" fill="#a8ccf8"/>` +
    `<ellipse cx="72" cy="52" rx="3" ry="6" fill="#a8ccf8"/>`,
    '#4490d4', '#6ab0ec') },

  { id: 's28', url: smiley('#b8d4ff',
    `<path d="M34,47 Q33,41 37,39 Q41,37 43,41 Q45,37 49,39 Q53,41 52,47 L43,54Z" fill="#e53935"/>` +
    `<path d="M47,47 Q46,41 50,39 Q54,37 56,41 Q58,37 62,39 Q66,41 65,47 L56,54Z" fill="#e53935"/>` +
    `<path d="M35,63 Q50,75 65,63" fill="none" stroke="${BE}" stroke-width="3" stroke-linecap="round"/>`,
    '#4898dc', '#6eb8f4') },

  { id: 's29', url: smiley('#c0dcff',
    `<circle cx="37" cy="43" r="9" fill="white" stroke="${BE}" stroke-width="2.5"/>` +
    `<circle cx="63" cy="43" r="9" fill="white" stroke="${BE}" stroke-width="2.5"/>` +
    `<line x1="46" y1="43" x2="54" y2="43" stroke="${BE}" stroke-width="2"/>` +
    `<line x1="19" y1="41" x2="28" y2="43" stroke="${BE}" stroke-width="2"/>` +
    `<line x1="81" y1="41" x2="72" y2="43" stroke="${BE}" stroke-width="2"/>` +
    `<circle cx="37" cy="43" r="4" fill="${BE}"/><circle cx="63" cy="43" r="4" fill="${BE}"/>` +
    `<path d="M38,63 Q50,71 62,63 L60,67 Q50,70 40,67Z" fill="white" stroke="${BE}" stroke-width="1.5"/>`,
    '#4290d0', '#68aeec') },

  { id: 's30', url: smiley('#d8e8ff',
    `<line x1="31" y1="38" x2="43" y2="48" stroke="${BE}" stroke-width="3" stroke-linecap="round"/>` +
    `<line x1="43" y1="38" x2="31" y2="48" stroke="${BE}" stroke-width="3" stroke-linecap="round"/>` +
    `<line x1="57" y1="38" x2="69" y2="48" stroke="${BE}" stroke-width="3" stroke-linecap="round"/>` +
    `<line x1="69" y1="38" x2="57" y2="48" stroke="${BE}" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M35,63 Q50,74 65,63" fill="none" stroke="${BE}" stroke-width="3" stroke-linecap="round"/>`,
    '#4a94d8', '#70b4f0') },

  // ── 🤖 Roboter ── 10 ─────────────────────────────────────────────────────

  { id: 'r1', url: robot('#2a4494',
    `<line x1="37" y1="14" x2="37" y2="28" stroke="white" stroke-width="2.5"/>` +
    `<circle cx="37" cy="11" r="4.5" fill="white"/>` +
    `<line x1="63" y1="14" x2="63" y2="28" stroke="white" stroke-width="2.5"/>` +
    `<circle cx="63" cy="11" r="4.5" fill="white"/>` +
    `<rect x="18" y="28" width="64" height="54" rx="14" fill="white"/>` +
    `<circle cx="37" cy="49" r="8" fill="#2a4494"/><circle cx="37" cy="49" r="4" fill="white"/>` +
    `<circle cx="63" cy="49" r="8" fill="#2a4494"/><circle cx="63" cy="49" r="4" fill="white"/>` +
    `<path d="M36,65 Q50,75 64,65" fill="none" stroke="#2a4494" stroke-width="3" stroke-linecap="round"/>`) },

  { id: 'r2', url: robot('#1e3a8a',
    `<line x1="37" y1="14" x2="37" y2="28" stroke="white" stroke-width="2.5"/>` +
    `<circle cx="37" cy="11" r="4.5" fill="white"/>` +
    `<line x1="63" y1="14" x2="63" y2="28" stroke="white" stroke-width="2.5"/>` +
    `<circle cx="63" cy="11" r="4.5" fill="white"/>` +
    `<rect x="18" y="28" width="64" height="54" rx="14" fill="white"/>` +
    `<rect x="24" y="44" width="52" height="12" rx="6" fill="#1e3a8a"/>` +
    `<path d="M34,66 Q50,76 66,66" fill="none" stroke="#1e3a8a" stroke-width="3" stroke-linecap="round"/>`) },

  { id: 'r3', url: robot('#2563eb',
    `<line x1="50" y1="10" x2="50" y2="28" stroke="white" stroke-width="2.5"/>` +
    `<circle cx="50" cy="7" r="5" fill="white"/>` +
    `<rect x="18" y="28" width="64" height="54" rx="14" fill="white"/>` +
    `<path d="M29,52 Q37,42 45,52" fill="none" stroke="#2563eb" stroke-width="4" stroke-linecap="round"/>` +
    `<path d="M55,52 Q63,42 71,52" fill="none" stroke="#2563eb" stroke-width="4" stroke-linecap="round"/>` +
    `<path d="M28,65 Q50,80 72,65" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round"/>`) },

  { id: 'r4', url: robot('#1d4ed8',
    `<line x1="35" y1="13" x2="35" y2="28" stroke="white" stroke-width="2.5"/>` +
    `<circle cx="35" cy="10" r="5" fill="white"/>` +
    `<line x1="65" y1="13" x2="65" y2="28" stroke="white" stroke-width="2.5"/>` +
    `<circle cx="65" cy="10" r="5" fill="white"/>` +
    `<rect x="18" y="28" width="64" height="54" rx="14" fill="white"/>` +
    `<circle cx="32" cy="49" r="5.5" fill="#1d4ed8"/>` +
    `<circle cx="50" cy="49" r="5.5" fill="#1d4ed8"/>` +
    `<circle cx="68" cy="49" r="5.5" fill="#1d4ed8"/>` +
    `<path d="M34,65 Q50,75 66,65" fill="none" stroke="#1d4ed8" stroke-width="3" stroke-linecap="round"/>`) },

  { id: 'r5', url: robot('#3b5bdb',
    `<line x1="50" y1="11" x2="50" y2="28" stroke="white" stroke-width="2.5"/>` +
    `<path d="M50,3 L51.5,8 L56,8 L52.5,11 L54,16 L50,13 L46,16 L47.5,11 L44,8 L48.5,8Z" fill="white"/>` +
    `<rect x="18" y="28" width="64" height="54" rx="14" fill="white"/>` +
    `<circle cx="37" cy="49" r="6.5" fill="#3b5bdb"/>` +
    `<circle cx="63" cy="49" r="6.5" fill="#3b5bdb"/>` +
    `<path d="M40,65 Q53,74 65,63" fill="none" stroke="#3b5bdb" stroke-width="3" stroke-linecap="round"/>`) },

  { id: 'r6', url: robot('#1a3a6a',
    `<line x1="37" y1="14" x2="37" y2="28" stroke="white" stroke-width="2.5"/>` +
    `<circle cx="37" cy="11" r="4.5" fill="white"/>` +
    `<line x1="63" y1="14" x2="63" y2="28" stroke="white" stroke-width="2.5"/>` +
    `<circle cx="63" cy="11" r="4.5" fill="white"/>` +
    `<rect x="18" y="28" width="64" height="54" rx="14" fill="white"/>` +
    `<rect x="27" y="42" width="18" height="14" rx="4" fill="#1a3a6a"/>` +
    `<rect x="55" y="42" width="18" height="14" rx="4" fill="#1a3a6a"/>` +
    `<path d="M34,66 Q50,76 66,66" fill="none" stroke="#1a3a6a" stroke-width="3" stroke-linecap="round"/>`) },

  { id: 'r7', url: robot('#264aa0',
    `<line x1="37" y1="14" x2="37" y2="28" stroke="white" stroke-width="2.5"/>` +
    `<circle cx="37" cy="11" r="4.5" fill="white"/>` +
    `<line x1="63" y1="14" x2="63" y2="28" stroke="white" stroke-width="2.5"/>` +
    `<circle cx="63" cy="11" r="4.5" fill="white"/>` +
    `<rect x="18" y="28" width="64" height="54" rx="14" fill="white"/>` +
    `<rect x="22" y="43" width="56" height="12" rx="6" fill="#264aa0"/>` +
    `<line x1="36" y1="67" x2="64" y2="67" stroke="#264aa0" stroke-width="3" stroke-linecap="round"/>`) },

  { id: 'r8', url: robot('#2146aa',
    `<line x1="62" y1="12" x2="62" y2="28" stroke="white" stroke-width="2.5"/>` +
    `<circle cx="62" cy="9" r="5" fill="white"/>` +
    `<rect x="18" y="28" width="64" height="54" rx="14" fill="white"/>` +
    `<circle cx="37" cy="49" r="7" fill="#2146aa"/><circle cx="36" cy="47" r="2.5" fill="white"/>` +
    `<circle cx="63" cy="49" r="7" fill="#2146aa"/><circle cx="62" cy="47" r="2.5" fill="white"/>` +
    `<path d="M34,65 Q50,75 66,65" fill="none" stroke="#2146aa" stroke-width="3" stroke-linecap="round"/>`) },

  { id: 'r9', url: robot('#2d5a9c',
    `<line x1="37" y1="14" x2="37" y2="28" stroke="white" stroke-width="2.5"/>` +
    `<circle cx="37" cy="11" r="4.5" fill="white"/>` +
    `<line x1="63" y1="14" x2="63" y2="28" stroke="white" stroke-width="2.5"/>` +
    `<circle cx="63" cy="11" r="4.5" fill="white"/>` +
    `<rect x="18" y="28" width="64" height="54" rx="14" fill="white"/>` +
    `<ellipse cx="37" cy="49" rx="9" ry="6" fill="#2d5a9c"/>` +
    `<ellipse cx="63" cy="49" rx="9" ry="6" fill="#2d5a9c"/>` +
    `<path d="M32,65 Q50,78 68,65" fill="none" stroke="#2d5a9c" stroke-width="3" stroke-linecap="round"/>`) },

  { id: 'r10', url: robot('#1e4bb8',
    `<line x1="37" y1="17" x2="37" y2="28" stroke="white" stroke-width="2.5"/>` +
    `<circle cx="37" cy="14" r="3.5" fill="white"/>` +
    `<line x1="63" y1="13" x2="63" y2="28" stroke="white" stroke-width="2.5"/>` +
    `<circle cx="63" cy="10" r="5.5" fill="white"/>` +
    `<rect x="18" y="28" width="64" height="54" rx="14" fill="white"/>` +
    `<path d="M29,52 Q37,43 45,52" fill="none" stroke="#1e4bb8" stroke-width="4" stroke-linecap="round"/>` +
    `<circle cx="63" cy="49" r="7" fill="#1e4bb8"/><circle cx="62" cy="47" r="2.5" fill="white"/>` +
    `<path d="M34,65 Q50,75 66,65" fill="none" stroke="#1e4bb8" stroke-width="3" stroke-linecap="round"/>`) },

  // ── 🧑 Menschen ── 15 (13 hell, 2 dunkel) ────────────────────────────────
  { id: 'p1',  url: human('#ffd6e0', SL, hLongBrown,  fHappy)   },
  { id: 'p2',  url: human('#93d5ff', SL, hShortDark,  fHappy)   },
  { id: 'p3',  url: human('#b5ead7', SL, hShortBlond, fWink)    },
  { id: 'p4',  url: human('#ffe599', SL, hShortBlack, fGrin)    },
  { id: 'p5',  url: human('#c4b5fd', SL, hLongBlond,  fHappy)   },
  { id: 'p6',  url: human('#ffb3c1', SL, hBobBrown,   fGlasses) },
  { id: 'p7',  url: human('#a8e6cf', SL, hShortRed,   fSmirk)   },
  { id: 'p8',  url: human('#ffd3b6', SL, hBunBlack,   fHappy)   },
  { id: 'p9',  url: human('#b6e3f4', SL, hShortGray,  fHappy)   },
  { id: 'p10', url: human('#e8d5ff', SL, hShortDark,  fGrin)    },
  { id: 'p11', url: human('#fff0ba', SL, hPixieDark,  fWink)    },
  { id: 'p12', url: human('#ffaaa5', SL, hShortBlond, fSmirk)   },
  { id: 'p13', url: human('#a8d8ea', SL, hBobBrown,   fHappy)   },
  { id: 'p14', url: human('#caffbf', SD, hAfro,        fHappy)   },
  { id: 'p15', url: human('#fcbad3', SD, hAfroPuff,    fGrin)    },

  // ── 🦑 Squid Game ── 5 ───────────────────────────────────────────────────
  { id: 'sq1', url: squid('#ff6b8a', sqC) },   // Pink – Kreis
  { id: 'sq2', url: squid('#ff8fa3', sqT) },   // Soft pink – Dreieck
  { id: 'sq3', url: squid('#e91e8c', sqS) },   // Magenta – Quadrat
  { id: 'sq4', url: squid('#1a1a2e', sqC) },   // Dunkel – Kreis
  { id: 'sq5', url: squid('#7b1fa2', sqT) },   // Lila – Dreieck
]
