'use strict';

/**
 * Rewrite bank prompts + solution prose into natural, simple spoken English.
 * Preserves answers and mathematical meaning. Prefer structured fields + careful
 * parsing over regex-gluing of template fragments.
 */

const { THEMES } = require('./themes');

const THEME_SLUGS = new Set(THEMES.map((t) => t.id).concat(['bank']));

const CHARACTERS = [];
const SETTINGS = [];
const ITEMS = [];
for (const t of THEMES) {
  t.characters.forEach((c) => CHARACTERS.push(c));
  t.settings.forEach((s) => SETTINGS.push(s));
  t.items.forEach((i) => ITEMS.push(i));
}
CHARACTERS.sort((a, b) => b.length - a.length);
SETTINGS.sort((a, b) => b.length - a.length);
ITEMS.sort((a, b) => b.length - a.length);

function hash(s) {
  let h = 2166136261;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function pick(arr, salt) {
  return arr[Math.abs(salt | 0) % arr.length];
}
function findMatch(text, list) {
  const lower = String(text).toLowerCase();
  for (const item of list) {
    const i = lower.indexOf(item.toLowerCase());
    if (i >= 0) return text.slice(i, i + item.length);
  }
  return null;
}
function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function flavorFrom(q) {
  const p = String(q.prompt || '');
  let char = findMatch(p, CHARACTERS);
  let setting = findMatch(p, SETTINGS);
  let item = findMatch(p, ITEMS);
  const theme =
    THEMES.find((t) => t.name === q.theme) ||
    THEMES.find((t) => (q.tags || []).includes(t.id)) ||
    THEMES[hash(q.id) % THEMES.length];
  const s = hash(q.id || p);
  if (!char) char = pick(theme.characters, s);
  if (!setting) setting = pick(theme.settings, s + 7);
  if (!item) item = pick(theme.items, s + 11);
  return { char, setting, item, theme };
}

function skillOf(q) {
  if (Array.isArray(q.subtopics) && q.subtopics.length) return String(q.subtopics[0]);
  for (const t of q.tags || []) {
    if (!THEME_SLUGS.has(String(t).toLowerCase())) return String(t);
  }
  return q.section || 'general';
}

function isPluralChar(char) {
  const c = String(char || '').trim().toLowerCase();
  if (c === 'the guardians') return true;
  if (/crew/.test(c)) return true;
  return false;
}

function beVerb(char) {
  return isPluralChar(char) ? 'are' : 'is';
}

/** Clean coefficient-1 and broken operator glue in math snippets. */
function fixMath(s) {
  let t = String(s || '');
  t = t.replace(/\b1([xy])\b/g, '$1');
  t = t.replace(/\+\-/g, '−');
  t = t.replace(/\-\+/g, '−');
  t = t.replace(/−\+/g, '−');
  t = t.replace(/\+\+/g, '+');
  // "x+-4" style leftovers
  t = t.replace(/([xy0-9)])\+\-([0-9])/g, '$1−$2');
  t = t.replace(/([xy0-9)])\+-([0-9])/g, '$1−$2');
  // light spacing around = and binary + − for readability (keep ^ compact)
  t = t.replace(/\s*=\s*/g, ' = ');
  t = t.replace(/([0-9xy)])\+([0-9(])/g, '$1 + $2');
  t = t.replace(/([0-9xy)])−([0-9(])/g, '$1 − $2');
  t = t.replace(/([0-9xy)])-([0-9(])/g, (m, a, b, off, full) => {
    // don't break exponents like x^2- or lim x→-3
    const before = full.slice(Math.max(0, off - 1), off);
    if (before === '^' || before === '→' || before === '−') return m;
    return `${a} − ${b}`;
  });
  t = t.replace(/\s{2,}/g, ' ').trim();
  return t;
}

function nums(p) {
  return String(p).match(/-?\d+(?:\.\d+)?/g) || [];
}

/**
 * Strip prior template glue and return the math/question core.
 */
function stripTemplateGlue(raw) {
  let p = String(raw || '').replace(/\s+/g, ' ').trim();

  // Remove one or two leading scene sentences of known shapes
  const openers = [
    /^At [^,]{1,60}, [^.?]{1,80} is messing about with [^.?]+\.\s*/i,
    /^At [^,]{1,60}, [^.?]{1,80} is at [^.?]+\.\s*/i,
    /^[A-ZÁÉÍÓÚÑÜ][^.]{0,90} takes a breath at [^.?]+\.\s*/i,
    /^[A-ZÁÉÍÓÚÑÜ][^.]{0,90} is at [^.?]{1,80} with a pile of [^.?]+\.\s*/i,
    /^Picture [^,]{1,80}, using [^.?]+\.\s*/i,
    /^[A-ZÁÉÍÓÚÑÜ][^.]{0,90} is practicing[^.?]+\.\s*/i,
    /^[A-ZÁÉÍÓÚÑÜ][^.]{0,90} sets up[^.?]+\.\s*/i,
    /^[A-ZÁÉÍÓÚÑÜ][^.]{0,90} looks over[^.?]+\.\s*/i,
    /^Over at [^.?]+\.\s*/i,
    /^Quick scene:[^.?]+\.\s*/i
  ];
  for (const re of openers) p = p.replace(re, '');

  const bridges = [
    /^This is really about [^.?]+\.\s*/i,
    /^It['’]s a friendly way into [^.?]+\.\s*/i,
    /^That sets up a clean question on [^.?]+\.\s*/i,
    /^Use the scene as a hook for [^.?]+\.\s*/i,
    /^The math idea:[^.?]+\.\s*/i
  ];
  for (const re of bridges) p = p.replace(re, '');

  // Drop trailing junk wrappers
  p = p
    .replace(/\s*\(\s*\)\s*\.?$/g, '')
    .replace(/\s*\(\s*@\s*,?\s*\)\s*\.?$/g, '')
    .replace(/\s*\(\s*poly\s*@\s*\)\s*/gi, ' ')
    .replace(/\s*\(\s*line\s*@\s*\)\s*/gi, ' ')
    .replace(/\s+for\s+at\.?\s*$/i, '')
    .replace(/\s+of\s+\S+\s+paths\s+at\.?/i, '')
    .replace(/\s+for\s+[\w\s']{1,40}?\s+meter\s+at\s+[\w\s']{1,40}(?=[,.]|\s+find\b|$)/i, '')
    .replace(/\s+of\s+fading\s+at\.?/i, '')
    .replace(/\s*\([^)]*strip of[^)]*\)/gi, '')
    .replace(/\s*\([^)]*modulus[^)]*\)/gi, '')
    .replace(/\s*\([^)]*of at[^)]*\)/gi, '')
    .replace(/\s*'s area\?/gi, '')
    .replace(/\(\+conj\)/gi, ' and its conjugate')
    .replace(/\s+of at\.?/gi, '')
    .replace(/\s+of\s+stretch\s+at\.?/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return p;
}

/** Skill-aware repair of the math ask so it reads as a crisp question. */
function cleanAsk(rawAsk, q, skill) {
  let p = stripTemplateGlue(rawAsk);
  if (!p) p = stripTemplateGlue(q.prompt);

  let m;

  // --- Triangle area banner mess ---
  m = p.match(/base\s+(\d+)\s*,\s*height\s+(\d+)/i);
  if (m && /area|banner|triangular/i.test(p)) {
    return `A triangle has base ${m[1]} and height ${m[2]}. What is its area?`;
  }

  // --- Area under y=1 ---
  m = p.match(/Area under y\s*=\s*1 from x\s*=\s*(-?\d+)\s+to\s+(-?\d+)/i)
    || p.match(/under y\s*=\s*1 from x\s*=\s*(-?\d+)\s+to\s+(-?\d+)/i);
  if (m && /area/i.test(skill + p)) {
    return `What is the area under y = 1 from x = ${m[1]} to x = ${m[2]}?`;
  }

  // --- Complex conjugate product ---
  m = p.match(/\((\d+)\s*\+\s*(\d+)i\).*conj/i) || p.match(/\((\d+)\s*\+\s*(\d+)i\)/);
  if (m && /conj|modulus/i.test(skill + p)) {
    return `Find the product of (${m[1]} + ${m[2]}i) and its complex conjugate.`;
  }

  // --- Probability already given ---
  m = p.match(/P\s*=\s*(\d+\/\d+)/i);
  if (m && /probab/i.test(skill + p)) {
    return `A probability is ${m[1]}. Write it in simplest form.`;
  }

  // --- Polynomial eval junk: P(x)=1x+-4 ( poly @ ). p(-2)? ---
  m = p.match(/P\(x\)\s*=\s*([^(\n]+?)\s*(?:\(|\.|,|\s+p\()/i);
  const pm = p.match(/\b[Pp]\((-?\d+)\)/);
  if (m && pm && /poly|polynomial/i.test(skill + p)) {
    return `If P(x) = ${fixMath(m[1].trim())}, find P(${pm[1]}).`;
  }

  // --- f(x)=1x-5 ... find f(-3) ---
  m = p.match(/(?:If\s+)?f\(x\)\s*=\s*([^,\n]+?)(?=,|\s+find\b|\.|$)/i);
  const fm = p.match(/\bf\((-?\d+)\)/i);
  if (m && fm) {
    return `If f(x) = ${fixMath(m[1].trim())}, find f(${fm[1]}).`;
  }

  // --- Inverse: F(x)=1x+2. f^{-1}(2) ---
  m = p.match(/F\(x\)\s*=\s*([^\s.]+).*f\^?\{?-?1\}?\((-?\d+)\)/i)
    || p.match(/f\(x\)\s*=\s*([^\s.]+).*f\^\{-1\}\((-?\d+)\)/i);
  if (m && /inverse/i.test(skill + p)) {
    return `If f(x) = ${fixMath(m[1])}, find f⁻¹(${m[2]}).`;
  }

  // --- Linear systems: 1x+1y=2, 1x+2y=3 ---
  {
    let sys = p.replace(/^Solve the system\s+/i, '');
    m = sys.match(/(^|,\s*|\s)((?:-?\d*)[xy](?:\s*[+\-−]\s*(?:-?\d*)[xy])*\s*=\s*-?\d+)\s*,\s*((?:-?\d*)[xy](?:\s*[+\-−]\s*(?:-?\d*)[xy])*\s*=\s*-?\d+)/i);
    if (!m) m = sys.match(/((?:-?\d+)?[xy](?:\s*[+\-−]\s*(?:-?\d+)?[xy])*\s*=\s*-?\d+)\s*,\s*((?:-?\d+)?[xy](?:\s*[+\-−]\s*(?:-?\d+)?[xy])*\s*=\s*-?\d+)/i);
    if (m && /system|linear systems|RREF|What is x/i.test(skill + p)) {
      const e1 = (m[2] || m[1]).trim();
      const e2 = (m[3] || m[2]).trim();
      // Guard against swallowing the word "system"
      if (!/system/i.test(e1)) {
        return `Solve the system ${fixMath(e1)}, ${fixMath(e2)}. What is x?`;
      }
    }
  }

  // --- Limits ---
  m = p.match(/(lim_\{[^}]+\}[^.?!]*)/i) || p.match(/(lim\s+a_n)/i);
  if (m && /limit/i.test(skill + ' ' + p)) {
    let lim = m[1].replace(/\s+for\s+a\b.*$/i, '').replace(/\s+near\b.*$/i, '').trim();
    lim = fixMath(lim);
    if (/lim_\{[^}]+\}\s*$/.test(lim) || /Find lim_\s*$/i.test(p)) {
      // recover from solution if truncated
      const sol = String(q.solution || '') + ' ' + (q.solutionSteps || []).join(' ');
      const plug = sol.match(/x\s*=\s*(-?\d+)/i);
      const expr = p.match(/\(([^)]+)\)/);
      if (plug && expr) return `Find lim_{x→${plug[1]}} (${fixMath(expr[1])}).`;
    }
    return `Find ${lim}.`;
  }

  // --- True/false ---
  if (q.type === 'tf' || /^True or false/i.test(p)) {
    const tm = p.match(/True or false[^:]*:\s*(.+)$/i);
    let claim = (tm ? tm[1] : p.replace(/^True or false[^:]*:\s*/i, '')).trim();
    claim = claim.replace(/\s*\([^)]*\)\s*$/, '').replace(/\s+for\s+.+$/i, '').trim();
    claim = claim.replace(/\s+of\s+\S+\s+p-series.*$/i, '').trim();
    if (!/[?.!]$/.test(claim)) claim += '.';
    return `True or false: ${claim}`;
  }

  // --- Mean / median lists ---
  if (skill === 'mean' || skill === 'averages') {
    m = p.match(/(?:mean of|data)\s+(-?\d+(?:\s*,\s*-?\d+)+)/i)
      || p.match(/:\s*(-?\d+(?:\s*,\s*-?\d+)+)/);
    if (m) return `Find the mean of ${m[1]}.`;
  }
  if (skill === 'median') {
    m = p.match(/median of\s+(-?\d+(?:\s*,\s*-?\d+)+)/i);
    if (m) return `Find the median of ${m[1]}.`;
  }
  if (skill === 'range') {
    const n = nums(p);
    if (n.length >= 2) return `Find the range from ${n[0]} to ${n[1]} (largest − smallest).`;
  }

  // --- Order of operations ---
  if (skill === 'order of operations') {
    m = p.match(/(\d+\s*\+\s*\d+\s*[×x*]\s*\d+)/i);
    if (m) return `Evaluate ${m[1]}. Remember: multiply before you add.`;
  }

  // --- Fractions / percentages / ratio ---
  if (skill === 'fractions') {
    m = p.match(/(\d+\/\d+\s*\+\s*\d+\/\d+)/);
    if (m) return `Add and simplify ${m[1]}.`;
  }
  if (skill === 'percentages') {
    m = p.match(/(\d+)%\s+of\s+(\d+)/i);
    if (m) return `What is ${m[1]}% of ${m[2]}?`;
  }
  if (skill === 'ratio') {
    m = p.match(/share\s+(\d+).*?ratio\s+(\d+)\s*:\s*(\d+)/i)
      || p.match(/in\s+ratio\s+(\d+)\s*:\s*(\d+).*?(\d+)/i);
    if (m && m[3] && /share/i.test(p)) {
      return `Share ${m[1]} in the ratio ${m[2]}:${m[3]}. How many does the first person get?`;
    }
  }

  // --- Geometry Euclid family ---
  if (skill === 'I.32' || (skill === 'angles' && /triangle/i.test(p))) {
    const all = p.match(/(\d+)°/g) || [];
    if (all.length >= 2) {
      return `A triangle has angles ${all[0]} and ${all[1]}. What is the third angle?`;
    }
  }
  if (skill === 'I.32 exterior') {
    m = p.match(/(\d+)°\s*\+\s*(\d+)°/);
    if (m) return `Remote interior angles are ${m[1]}° and ${m[2]}°. What is the exterior angle?`;
  }
  if (skill === 'I.47 Pythagoras' || skill === 'Pythagoras') {
    m = p.match(/legs?\s+(\d+)\s*,\s*(\d+)/i);
    if (m) return `A right triangle has legs ${m[1]} and ${m[2]}. What is the hypotenuse?`;
  }
  if (skill === 'I.15') {
    m = p.match(/one (?:is|measures)\s+(\d+)°/i);
    if (m) return `Vertical angles: one measures ${m[1]}°. What does its vertical match measure?`;
  }
  if (skill === 'I.13') {
    m = p.match(/one is\s+(\d+)°/i);
    if (m) return `Adjacent angles on a straight line: one is ${m[1]}°. What is the other?`;
  }
  if (skill === 'I.29') {
    m = p.match(/(?:angle )?is\s+(\d+)°/i);
    if (m) return `Parallel lines with a transversal: a corresponding angle is ${m[1]}°. What is the matching corresponding angle?`;
  }
  if (skill === 'I.34') {
    m = p.match(/(?:angle is|to)\s+(\d+)°/i);
    if (m) {
      // opposite vs consecutive — keep wording from answer context
      if (/opposite/i.test(p) || Number(q.answer) === Number(m[1])) {
        return `In a parallelogram, one angle is ${m[1]}°. What is the opposite angle?`;
      }
      return `In a parallelogram, one angle is ${m[1]}°. What is a consecutive angle?`;
    }
  }
  if (skill === 'III.31') {
    m = p.match(/acute is\s+(\d+)°/i);
    if (m) return `Angle in a semicircle is 90°. If one acute angle is ${m[1]}°, what is the other acute angle?`;
  }
  if (skill === 'III.20') {
    m = p.match(/[Cc]entral angle\s+(\d+)°/);
    if (m) return `A central angle is ${m[1]}°. What is the inscribed angle on the same arc?`;
  }
  if (skill === 'VI.2 / ratios') {
    m = p.match(/(\d+\/\d+\s*=\s*\d+\/x)/i);
    if (m) return `Similar triangles: ${m[1]}. Solve for x.`;
  }
  if (skill === 'I.1') {
    m = p.match(/side\s+(\d+)/i);
    if (m) return `An equilateral triangle has one side ${m[1]}. What is another side length?`;
  }
  if (skill === 'I.20') {
    m = p.match(/sides\s+(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (m) return `True or false: sides ${m[1]}, ${m[2]}, ${m[3]} can form a triangle (triangle inequality).`;
  }

  // --- Slope ---
  if (skill === 'slope') {
    m = p.match(/through\s+(\([^)]+\))\s+and\s+(\([^)]+\))/i)
      || p.match(/from\s+(\([^)]+\))\s+to\s+(\([^)]+\))/i);
    if (m) return `Find the slope of the line through ${m[1]} and ${m[2]}.`;
  }

  // --- Vertex / parabola ---
  if (skill === 'vertex') {
    m = p.match(/y\s*=\s*([^\s,]+)/i);
    if (m) return `For the parabola y = ${fixMath(m[1])}, find the x-coordinate of the vertex.`;
  }

  // --- Simplify polynomials ---
  if (skill === 'polynomials') {
    m = p.match(/(\([^)]+\)\s*\+\s*\([^)]+\))/);
    if (m) return `Simplify ${fixMath(m[1])} to the form mx + k.`;
  }
  if (skill === 'expand') {
    m = p.match(/(\([^)]+\)\([^)]+\))/);
    if (m) return `Expand ${fixMath(m[1])}. What is the constant term?`;
  }
  if (skill === 'factoring') {
    m = p.match(/(x²[^=]*=0)/);
    if (m) return `Factor and solve ${m[1]}. What is the smaller positive root?`;
  }
  if (skill === 'quadratic') {
    m = p.match(/(x²[^=]*=0)/i);
    if (m) return `Solve ${m[1]}. List the roots in ascending order. What is the larger root?`;
  }

  // --- Det / matrices ---
  if (skill === 'det') {
    m = p.match(/(det\[\[[^\]]+\],\[[^\]]+\]\])/i);
    if (m) return `Compute ${m[1]}.`;
    m = p.match(/det\s*diag\(([^)]+)\)/i) || p.match(/[Dd]et\s+diag\(([^)]+)\)/);
    if (m) return `Compute det(diag(${m[1]})). Choose the correct option.`;
  }
  if (skill === 'dot' || skill === 'dot product') {
    m = p.match(/(⟨[^⟩]+⟩\s*·\s*⟨[^⟩]+⟩)/);
    if (m) return `Compute the dot product ${m[1]}.`;
  }
  if (skill === 'orthogonal') {
    m = p.match(/(⟨[^⟩]+⟩\s*⊥\s*⟨[^⟩]+⟩)/);
    if (m) return `True or false: ${m[1]} (orthogonal means the dot product is 0).`;
  }

  // --- Derivatives ---
  if (/power rule|product rule|chain rule|derivatives/i.test(skill)) {
    m = p.match(/(d\/dx\[[^\]]+\])/i) || p.match(/(d\/dx\s*\([^)]+\))/i);
    const at = p.match(/at\s+x\s*=\s*(-?\d+)/i);
    if (m) return `Differentiate: ${fixMath(m[1])}${at ? ` at x = ${at[1]}` : ''}.`;
  }
  if (skill === 'tangent') {
    m = p.match(/[Yy]\s*=\s*([^\s(]+).*?(?:at\s+)?x\s*=\s*(-?\d+)/);
    if (m) return `For the line y = ${fixMath(m[1])}, what is the slope of the tangent at x = ${m[2]}?`;
    m = p.match(/[Yy]\s*=\s*([^\s(]+)/);
    if (m) return `For y = ${fixMath(m[1])}, what is the slope of the tangent line?`;
  }

  // --- Integrals ---
  if (/integral|antiderivative|FTC|integration|integrals/i.test(skill)) {
    m = p.match(/(∬[^?]+)/) || p.match(/(∫[^?]+)/);
    if (m) {
      let s = m[1]
        .replace(/\s*\([^)]*slab.*$/i, '')
        .replace(/\s+@.*$/, '')
        .replace(/\s+coef of.*$/i, '')
        .replace(/\s+—.*$/, '')
        .trim();
      if (/coef/i.test(p) || /coefficient/i.test(p)) {
        const coef = p.match(/coef(?:ficient)? of (x\^\d+)/i);
        return `Evaluate ${fixMath(s)}. What is the coefficient of ${coef ? coef[1] : 'the next power of x'} (ignore +C)?`;
      }
      return `Evaluate ${fixMath(s)}.`;
    }
  }

  // --- Logs / exponents ---
  if (skill === 'logs' || skill === 'log laws') {
    m = p.match(/(log[_\s]?\S+\([^)]+\))/i) || p.match(/(log\([^)]+\))/i);
    if (m) return `Evaluate ${m[1]}.`;
  }
  if (skill === 'exponents' || skill === 'exponent laws') {
    m = p.match(/(\d+\^\d+)/);
    if (m) return `Evaluate ${m[1]}.`;
  }
  if (skill === 'exponential equations') {
    m = p.match(/(\d+\^x\s*=\s*\d+\^\d+)/i) || p.match(/solve\s+([^=]+=\S+)/i);
    if (m) return `Solve ${fixMath(m[1])}.`;
  }

  // --- Trig ---
  if (skill === 'exact values' || skill === 'trig ratios') {
    m = p.match(/(sin|cos|tan)\s*\(?\s*(\d+)/i);
    if (m && !/opp/i.test(p)) return `Find the exact value of ${m[1]}(${m[2]}°).`;
    const a = p.match(/opp(?:osite)?\s*=\s*(\d+)/i);
    const b = p.match(/adj(?:acent)?\s*=\s*(\d+)/i);
    if (a && b) return `In a right triangle, opposite = ${a[1]} and adjacent = ${b[1]}. Find tan θ simplified.`;
  }
  if (skill === 'radians') {
    m = p.match(/(\d+)°/);
    if (m) return `Convert ${m[1]}° to radians (in terms of π, e.g. π/3).`;
  }
  if (skill === 'sinusoids' || skill === 'amplitude') {
    m = p.match(/y\s*=\s*([^\s,]+)/i);
    if (m && /period/i.test(p)) return `For y = ${fixMath(m[1])}, find the period (in terms of π if needed).`;
    if (m) return `For y = ${fixMath(m[1])}, what is the amplitude?`;
  }

  // --- Sequences ---
  if (skill === 'sequences' || skill === 'arithmetic') {
    m = p.match(/a1\s*=\s*(-?\d+).*d\s*=\s*(-?\d+)/i)
      || p.match(/a\s*=\s*(-?\d+).*d\s*=\s*(-?\d+)/i);
    const term = p.match(/term\s+(\d+)/i) || p.match(/n\s*=\s*(\d+)/i);
    if (m && /S_n|sum/i.test(p)) {
      const n = p.match(/n\s*=\s*(\d+)/i);
      return `Arithmetic sequence with a = ${m[1]}, d = ${m[2]}${n ? `, n = ${n[1]}` : ''}. Find the sum S_n.`;
    }
    if (m && term) return `Arithmetic sequence with first term ${m[1]} and common difference ${m[2]}. Find term ${term[1]}.`;
  }
  if (skill === 'geometric') {
    m = p.match(/a\s*=\s*(-?\d+).*r\s*=\s*(-?\d+)/i)
      || p.match(/A_n=\(([^)]+)\)\^n/i);
    if (m && m[0].includes('A_n')) return `For a_n = (${m[1]})^n, find lim a_n.`;
    const term = p.match(/[Tt]erm\s+(\d+)/);
    if (m) return `Geometric sequence with a = ${m[1]}, r = ${m[2]}${term ? `. Find term ${term[1]}` : ''}.`;
  }

  // --- Stats odds and ends ---
  if (skill === 'z-score') {
    m = p.match(/x\s*=\s*(-?\d+).*μ\s*=\s*(-?\d+).*σ\s*=\s*(-?\d+)/i);
    if (m) return `Find the z-score of x = ${m[1]} when μ = ${m[2]} and σ = ${m[3]}.`;
  }
  if (skill === 'IQR') {
    m = p.match(/Q1\s*=\s*(-?\d+).*Q3\s*=\s*(-?\d+)/i);
    if (m) return `If Q1 = ${m[1]} and Q3 = ${m[2]}, what is the IQR?`;
  }
  if (skill === 'binomial' && /Bin/i.test(p)) {
    m = p.match(/Bin\(n\s*=\s*(\d+),\s*p\s*=\s*([^)]+)\)/i);
    if (m) return `X ~ Bin(n = ${m[1]}, p = ${m[2]}). Find E[X].`;
  }
  if (skill === 'proportion') {
    m = p.match(/(\d+)\s+(?:of|out of)\s+(\d+)/i);
    if (m) return `${m[1]} out of ${m[2]} people in a sample said yes. What is the sample proportion p̂?`;
  }
  if (skill === 'basic probability' || skill === 'probability') {
    m = p.match(/(\d+)\s+.*?,\s*(\d+)\s+shiny/i);
    if (m) return `A chest has ${m[1]} items and ${m[2]} are “shiny.” What is P(shiny)? Simplify.`;
  }
  if (skill === 'complement') {
    m = p.match(/P\(shiny\)\s*=\s*(\d+\/\d+)/i);
    if (m) return `If P(shiny) = ${m[1]}, find P(not shiny). Simplify.`;
  }
  if (skill === 'independence') {
    m = p.match(/P\(A\)\s*=\s*(\d+\/\d+).*P\(B\)\s*=\s*(\d+\/\d+)/i);
    if (m) return `Independent events with P(A) = ${m[1]} and P(B) = ${m[2]}. Find P(A ∩ B). Simplify.`;
  }

  // --- Circle radius ---
  if (skill === 'circle') {
    const r2 = p.match(/=\s*(\d+)/);
    if (r2) return `A circle equation ends with = ${r2[1]}. What is the radius?`;
  }

  // --- Epsilon ---
  if (skill === 'epsilon') {
    m = p.match(/a_n\s*=\s*([^,]+),\s*ε\s*=\s*([^.\s]+)/i);
    if (m) return `For a_n = ${fixMath(m[1])} and ε = ${m[2]}, find the smallest integer n₀ that works in the ε–N definition.`;
  }
  if (skill === 'supremum') {
    m = p.match(/\{([^}]+)\}/);
    if (m) return `Find the supremum (least upper bound) of the set {${m[1]}}.`;
    const n = nums(p);
    if (n.length) return `Find the supremum of the set with largest listed bound ${n[n.length - 1]}.`;
  }

  // --- Continuity eval ---
  if (skill === 'continuity') {
    m = p.match(/[Ff]\(x\)\s*=\s*([^\s]+).*f\((-?\d+)\)/i);
    if (m) return `f(x) = ${fixMath(m[1])} is continuous everywhere. Find f(${m[2]}).`;
  }

  // --- Eigenvalues / diag ---
  if (skill === 'eigenvalues' || skill === 'characteristic' || skill === 'trace') {
    m = p.match(/diag\(([^)]+)\)/i);
    if (m && /larger/i.test(p)) return `For the diagonal matrix diag(${m[1]}), what is the larger eigenvalue?`;
    if (m && /product|det/i.test(p)) return `For diag(${m[1]}), what is the product of the eigenvalues?`;
    if (m && /trace|sum/i.test(p)) return `For diag(${m[1]}), what is the trace?`;
  }
  if (skill === 'invertibility') {
    m = p.match(/(\[\[[^\]]+\],\[[^\]]+\]\])/);
    if (m) return `True or false: the matrix ${m[1]} is invertible.`;
  }

  // --- Substitution ---
  if (skill === 'substitution') {
    m = p.match(/(?:formula|expression)\s+(\S+).*x\s*=\s*(-?\d+)/i)
      || p.match(/(\d*x[+\-−]\d+).*x\s*=\s*(-?\d+)/i);
    if (m) return `Substitute x = ${m[2]} into ${fixMath(m[1])}. What do you get?`;
  }

  // --- Area rectangle ---
  if (skill === 'area' && !/triangle|banner/i.test(p)) {
    m = p.match(/(\d+)\s*[×x*]\s*(\d+)/i);
    if (m) return `A rectangle measures ${m[1]} by ${m[2]}. What is its area?`;
  }

  // --- MC leftovers: keep evaluate wording ---
  if (q.type === 'mc') {
    m = p.match(/(\d+[×x*]\d+)/i) || p.match(/(\d+\^\d+)/);
    if (m) return `Evaluate ${m[1]}. Choose the correct option.`;
  }

  // --- Gentle fallback: strip character/setting/item leftovers, keep math ---
  let fallback = p;
  for (const w of CHARACTERS.concat(SETTINGS).concat(ITEMS)) {
    fallback = fallback.replace(new RegExp(escapeRe(w), 'gi'), '');
  }
  fallback = fallback
    .replace(/\b(finds|logs|computes|evaluates|simplifies|solves|expands|factors|maps|combines|needs|wants|flies toward|proving near|antidifferentiates|differentiates|Multiplies|multiplies)\b/gi, '')
    .replace(/\b(training des|des banner|banner at\s*:)/gi, 'triangle with')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s*[,;:.\-–—]+\s*/, '')
    .replace(/\s+([,.])/g, '$1')
    .replace(/\s+at\s*\.?\s*$/i, '')
    .replace(/\s+for\s*\.?\s*$/i, '')
    .replace(/\s+for\s+at\.?/gi, '')
    .replace(/\s*picks:?\s*\.?$/i, '')
    .replace(/\s+of\s+\S+\s+stretch\s+at\.?/gi, '')
    .trim();

  fallback = fixMath(fallback);

  if (fallback.length >= 6 && fallback.length < 240) {
    if (!/[?.!]$/.test(fallback)) fallback += '.';
    // Capitalize
    fallback = fallback.charAt(0).toUpperCase() + fallback.slice(1);
    // Fix "Triangle with base..." if still fragmenty
    fallback = fallback.replace(/^Triangle with base/i, 'A triangle has base');
    fallback = fallback.replace(/\.\s*area\.?$/i, '. What is its area?');
    return fallback;
  }

  // Last resort: original stripped ask
  let last = fixMath(p);
  if (!/[?.!]$/.test(last)) last += '.';
  return last.charAt(0).toUpperCase() + last.slice(1);
}

function storyOpen(f, salt) {
  const { char, setting, item } = f;
  const is = beVerb(char);
  const opens = [
    `${char} ${is} at ${setting}, sorting a few ${item}.`,
    `At ${setting}, ${char} sets up a quick drill with ${item}.`,
    `${char} looks over the ${item} at ${setting}.`,
    `Over at ${setting}, ${char} grabs some ${item} for practice.`,
    `Quick scene: ${char} at ${setting}, ${item} in hand.`,
    `${char} takes a short break at ${setting} beside the ${item}.`
  ];
  return pick(opens, salt);
}

function rewritePrompt(q) {
  const f = flavorFrom(q);
  const skill = skillOf(q);
  const salt = hash(q.id || q.prompt);
  const ask = cleanAsk(q.prompt, q, skill);
  const open = storyOpen(f, salt);
  let out = `${open} ${ask}`.replace(/\s+/g, ' ').trim();
  // Final safety: never leave banned glue
  out = out
    .replace(/\s+for\s+[\w\s'\-]{1,50}?\s+meter\s+at\s+[\w\s'\-]{1,50}(?=[,.]|\s+find\b)/gi, '')
    .replace(/\s+find f\(/gi, ', find f(')
    .replace(/,\s*,\s*find f\(/gi, ', find f(')
    .replace(/\bis messing about with\b/gi, 'is working with')
    .replace(/\bThis is really about\b[^.]*\.\s*/gi, '')
    .replace(/\bIt['’]s a friendly way into\b[^.]*\.\s*/gi, '')
    .replace(/\bThat sets up a clean question on\b[^.]*\.\s*/gi, '')
    .replace(/\bUse the scene as a hook for\b[^.]*\.\s*/gi, '');
  out = out.replace(/\s+/g, ' ').trim();
  if (out.length) out = out.charAt(0).toUpperCase() + out.slice(1);
  return out;
}

function polishStep(line, idx, total, answer) {
  let s = String(line || '').trim();
  if (!s) return s;
  s = s.replace(/\s*→\s*/g, '; ').replace(/\s+/g, ' ').trim();

  const replacements = [
    [/^Multiplication first:\s*/i, 'Multiply first: '],
    [/^Then\s+/i, 'Then '],
    [/^LCD\s*=/i, 'Common denominator = '],
    [/^Sum\s*=/i, 'Sum = '],
    [/^Mean\s*=/i, 'Mean = '],
    [/^Poly continuous\s*;?\s*/i, 'A polynomial is continuous, so we can substitute. '],
    [/^Plug x\s*=/i, 'Substitute x = '],
    [/^Plug in x\s*=/i, 'Substitute x = '],
    [/^Factor\s+/i, 'Factor '],
    [/^Cancel the common factor;\s*;?\s*/i, 'Cancel the common factor; '],
    [/^Cancel\s*;?\s*/i, 'Cancel: '],
    [/^Δ\s*=/i, 'Discriminant Δ = '],
    [/^Roots\s+/i, 'Roots: '],
    [/^Factors\s+/i, 'Factor pair: '],
    [/^Smaller root\s+/i, 'Smaller root: '],
    [/^Answer:\s*/i, 'Answer: '],
    [/^So the answer is\s*/i, 'Answer: '],
    [/^x:\s*/i, 'x coefficients: '],
    [/^X coefficients:\s*/i, 'x coefficients: '],
    [/^const:\s*/i, 'Constant terms: '],
    [/^Dot\s*=/i, 'Dot product = '],
    [/^Standard Euclidean fact\.?/i, 'That’s a standard Euclidean fact.'],
    [/^a_n=a\+\(n-1\)d/i, 'Use a_n = a + (n − 1)d'],
    [/^n\(inner\)/i, 'Chain rule: n(inner)'],
    [/^=\s*/, 'Result: '],
    [/^F\((-?\d+)\)\s*=/i, (_, x) => `f(${x}) = `],
    [/^P\((-?\d+)\)\s*=/i, (_, x) => `P(${x}) = `],
    [/^M\s*=/i, 'Slope m = '],
    [/^R²\s*=/i, 'r² = '],
    [/^C\/\(n\+1\)\s*=/i, 'Coefficient c/(n+1) = '],
    [/^Width\s*=/i, 'Width = '],
    [/^Area\s*=/i, 'Area = '],
    [/^Max−min\s*=/i, 'Range = max − min = '],
    [/^Max-min\s*=/i, 'Range = max − min = '],
    [/^Unique solution x\s*=/i, 'The unique solution has x = '],
    [/^Product\s*=\s*det\s*=/i, 'Product of eigenvalues = det = '],
    [/^\|r\|\s*=/i, '|r| = ']
  ];
  for (const [re, rep] of replacements) s = s.replace(re, rep);

  s = fixMath(s);
  s = s.replace(/\s*=\s*/g, ' = ').replace(/\s+/g, ' ').trim();
  s = s.replace(/^So so /i, 'So ');
  s = s.replace(/^Start with do /i, 'Do ');
  s = s.replace(/^Start with /i, '');

  if (s.length) s = s.charAt(0).toUpperCase() + s.slice(1);
  if (!/[.!?]$/.test(s)) s += '.';
  s = s.replace(/\s+/g, ' ').replace(/\.\./g, '.').trim();
  return s;
}

function rewriteSolution(q) {
  let steps = Array.isArray(q.solutionSteps) ? q.solutionSteps.map(String) : [];
  if (!steps.length && q.solution) {
    steps = String(q.solution).split(/\s*→\s*/).map((x) => x.trim()).filter(Boolean);
  }

  // Expand ultra-terse single "=" steps using skill
  if (steps.length === 1 && /^=\s*/.test(steps[0].trim()) || (steps.length === 1 && steps[0].trim().length < 12)) {
    const skill = skillOf(q);
    const ans = String(q.answer);
    const extra = [];
    if (/limit/i.test(skill)) extra.push('A polynomial (or simplified form) is continuous, so substitute.');
    else if (/evaluate|polynomial|substitution|continuity/i.test(skill)) extra.push('Substitute the given value into the expression.');
    else if (/mean|averages/i.test(skill)) extra.push('Add the values, then divide by how many there are.');
    else if (/det/i.test(skill)) extra.push('For [[a,b],[c,d]], det = ad − bc.');
    else if (/area/i.test(skill)) extra.push('Use the matching area formula.');
    else extra.push('Work the expression carefully.');
    if (steps[0] && !/^=\s*$/.test(steps[0])) extra.push(steps[0]);
    extra.push(`Answer: ${ans}`);
    steps = extra;
  }

  let polished = steps.map((line, i) => polishStep(line, i, steps.length, q.answer));
  polished = polished.filter(Boolean);

  // Keep 2–5 steps when possible
  if (polished.length > 5) {
    const head = polished.slice(0, 4);
    const last = polished[polished.length - 1];
    polished = head.concat(/^Answer:/i.test(last) ? [last] : [`Answer: ${q.answer}.`]);
  }

  const ans = String(q.answer);
  const joined = polished.join(' ');
  if (ans && !polished.some((s) => s.includes(ans)) && !joined.includes(ans)) {
    polished.push(`Answer: ${ans}.`);
  }

  const dedup = [];
  for (const s of polished) {
    if (dedup.length && /^Answer:/i.test(s) && /^Answer:/i.test(dedup[dedup.length - 1])) continue;
    if (dedup.length && s === dedup[dedup.length - 1]) continue;
    dedup.push(s);
  }
  return { solutionSteps: dedup, solution: dedup.join(' ') };
}

function rewriteQuestion(q) {
  const prompt = rewritePrompt(q);
  const sol = rewriteSolution(q);
  // Preserve identity fields exactly
  return Object.assign({}, q, {
    prompt,
    solution: sol.solution,
    solutionSteps: sol.solutionSteps
  });
}

module.exports = {
  rewriteQuestion,
  rewritePrompt,
  rewriteSolution,
  flavorFrom,
  skillOf,
  fixMath,
  cleanAsk,
  stripTemplateGlue,
  storyOpen
};
