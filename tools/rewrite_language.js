'use strict';

/**
 * Rewrite bank prompts + solution prose into warmer, clearer English.
 * Preserves answers and mathematical content exactly.
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
  const theme = THEMES.find((t) => t.name === q.theme) || THEMES[hash(q.id) % THEMES.length];
  const s = hash(q.id || p);
  if (!char) char = pick(theme.characters, s);
  if (!setting) setting = pick(theme.settings, s + 7);
  if (!item) item = pick(theme.items, s + 11);
  return { char, setting, item, theme };
}

function skillOf(q) {
  for (const t of q.tags || []) {
    if (!THEME_SLUGS.has(String(t).toLowerCase())) return String(t);
  }
  return q.section || 'general';
}

/** Human topic bridge — pop culture + real-life intuition. */
function topicBridge(skill, section, salt) {
  const pairs = {
    'order of operations': 'order of operations — like a recipe, multiply before you add',
    fractions: 'fair shares — the same idea as splitting a pizza',
    percentages: 'surveys, discounts, and “out of 100” thinking',
    ratio: 'keeping a mix fair, like a sports lineup ratio',
    substitution: 'plug in a value — the habit loop of a formula',
    equations: 'balance: whatever you do to one side, do to the other',
    expand: 'open the brackets so every piece gets multiplied',
    sequences: 'streaks and habits — what comes next in the pattern',
    area: 'how much flat space a shape covers',
    Pythagoras: 'shortcut across a right triangle (sports field diagonal)',
    angles: 'turns and corners measured in degrees',
    averages: 'a fair typical score for a team or class',
    probability: 'fairness and chance — how often should this happen?',
    negatives: 'direction on a number line (below zero still counts)',
    rounding: 'smoothing a number to a useful place value',
    mean: 'the fair-share average of a list of scores',
    median: 'the middle value once sorted — sturdy against outliers',
    range: 'spread: biggest minus smallest',
    'basic probability': 'favorable outcomes over total outcomes',
    complement: 'the opposite event — probability left when you subtract from 1',
    independence: 'one trial doesn’t nudge the next (like fair coin flips)',
    binomial: 'counting successes in repeated yes/no trials',
    'z-score': 'how unusual a score is compared with the group',
    proportion: 'what fraction of a sample said “yes”',
    CI: 'a plausible range for the truth, with a margin of error',
    errors: 'the two ways a decision can be wrong in a test',
    'order stats': 'reading a sorted list (min, max, …)',
    IQR: 'the middle 50% spread — resistant to extremes',
    concepts: 'a big-picture stats idea',
    limits: 'what a value approaches as you zoom in (“almost there”)',
    'power rule': 'how powers change when you differentiate',
    'product rule': 'differentiating a product of two pieces',
    'chain rule': 'outside derivative × inside derivative',
    tangent: 'the best straight-line story near a point',
    'critical points': 'where the slope is zero — candidate peaks and valleys',
    antiderivative: 'undoing a derivative (recovering a quantity from its rate)',
    'definite integral': 'signed area — adding tiny slices',
    'average value': 'a continuous cousin of the mean',
    volume: 'stacking cross-sections to get 3D measure',
    'geometric series': 'infinite sums with a constant ratio',
    convergence: 'does the infinite sum settle to a finite total?',
    gradient: 'which way is uphill fastest?',
    'double integral': 'adding over a 2D region',
    'partial derivatives': 'change one variable while holding the other still',
    'dot product': 'how aligned two directions are',
    polynomials: 'combining like terms',
    factoring: 'undoing a product to find roots',
    linear: 'straight-line relationships',
    quadratic: 'parabolas and their roots',
    slope: 'steepness: rise over run',
    'linear functions': 'input → output for a straight-line rule',
    exponents: 'repeated multiplication, written compactly',
    logs: 'asking “what power?” — undoing an exponential',
    'exact values': 'trig at special angles without a calculator',
    'trig ratios': 'side ratios in a right triangle',
    composition: 'feeding one function into another',
    definitions: 'checking a definition',
    'exponent laws': 'same base → add the exponents when multiplying',
    det: 'a 2×2 determinant — the scaling factor of a transform',
    invertibility: 'can we undo this matrix transform?',
    dot: 'dot product: multiply matching components and add',
    orthogonal: 'perpendicular vectors have dot product 0',
    RREF: 'cleaning a system into a simpler row form',
    'linear systems': 'values that satisfy every equation at once',
    eigenvalues: 'stretch factors along special directions',
    characteristic: 'the polynomial whose roots are eigenvalues',
    trace: 'sum of the diagonal entries',
    multiplication: 'matrix multiply: row meets column',
    span: 'every combination you can reach with given vectors',
    theory: 'a true/false check on a big idea',
    vertex: 'the turning point of a parabola',
    'log laws': 'pulling exponents out of logarithms',
    'exponential equations': 'same base ⇒ match the exponents',
    radians: 'another unit for turns (π radians = 180°)',
    sinusoids: 'how long until a wave repeats (period)',
    amplitude: 'how tall the wave is from the middle',
    zeros: 'where a polynomial hits zero',
    arithmetic: 'add-the-same-amount sequences and their sums',
    geometric: 'multiply-by-the-same-amount sequences',
    circle: 'radius: center to edge',
    evaluate: 'just compute carefully',
    inverse: 'undoing a rule (swap roles carefully)',
    derivatives: 'instantaneous rate of change',
    integration: 'accumulating change',
    triangle: 'sides and angles working together',
    induction: 'prove for n=1, then climb one step at a time',
    modulus: 'distance from 0 in the complex plane',
    conjugate: 'flip the sign of the imaginary part',
    integrals: 'area and accumulation',
    FTC: 'derivatives and integrals as inverses',
    magnitude: 'length of a vector',
    polynomial: 'powers of x living in one expression',
    epsilon: 'making “close enough” precise with ε and N',
    supremum: 'least upper bound — the tightest ceiling',
    infimum: 'greatest lower bound — the tightest floor',
    'nested intervals': 'intervals inside intervals',
    continuity: 'no jumps or holes',
    IVT: 'hitting every height between two values',
    'p-series': '∑ 1/n^p — when does it converge?',
    monotone: 'always rising or always falling',
    Cauchy: 'terms eventually huddle together',
    proof: 'why a claim is believable',
    lines: 'direction and position',
    discriminant: 'how many real roots a quadratic has',
    cross: 'parallelogram area from two vectors',
    combinatorics: 'careful counting of outcomes',
    'I.32': 'Euclid I.32 — angles in a triangle sum to 180°',
    'I.32 exterior': 'an exterior angle equals the remote interiors',
    'I.47 Pythagoras': 'Euclid I.47 — Pythagoras on a right triangle',
    postulates: 'Euclid’s starting rules',
    'I.15': 'vertical angles are equal',
    'I.13': 'adjacent angles on a line sum to 180°',
    'I.29': 'parallels cut by a transversal — corresponding angles match',
    'I.1': 'equilateral ideas — equal sides',
    construction: 'compass-and-straightedge thinking',
    'VI.2 / ratios': 'similar triangles keep side ratios',
    'I.34': 'parallelogram opposite angles are equal',
    'III.31': 'angle in a semicircle is a right angle',
    'III.20': 'inscribed angle is half the central angle on the same arc',
    'Elements structure': 'how Euclid organizes definitions and propositions',
    'I.20': 'triangle inequality — shortest path is straight'
  };
  const bridge = pairs[skill] || pairs[section] || `a solid ${skill} skill`;
  return bridge;
}

function nums(p) {
  return String(p).match(/-?\d+(?:\.\d+)?/g) || [];
}

/**
 * Build a clear math ask from the original prompt, preferring to KEEP
 * mathematical expressions intact rather than over-parse.
 */
function mathAsk(q, skill, f) {
  const raw = String(q.prompt || '').replace(/\s+/g, ' ').trim();
  const type = q.type || 'short';

  // --- True/false ---
  if (type === 'tf' || /^True or false/i.test(raw)) {
    const m = raw.match(/True or false[^:]*:\s*(.+)$/i);
    let claim = (m ? m[1] : raw).trim();
    claim = claim.replace(/\s*\([^)]*\)\s*$/, '').trim();
    return `True or false: ${claim}`;
  }

  // --- Tag-specific extractions (conservative) ---
  let m;

  if (skill === 'order of operations') {
    m = raw.match(/(\d+\s*\+\s*\d+\s*[×x*]\s*\d+)/i);
    if (m) return `Evaluate ${m[1]}. Remember: multiply before you add.`;
  }
  if (skill === 'fractions') {
    m = raw.match(/(\d+\/\d+\s*\+\s*\d+\/\d+)/);
    if (m) return `Add and simplify ${m[1]}.`;
  }
  if (skill === 'percentages') {
    m = raw.match(/(\d+%\s+of\s+\d+)/i);
    if (m) return `What is ${m[1]}?`;
  }
  if (skill === 'ratio') {
    m = raw.match(/share\s+(\d+)\s+.+?\s+in\s+ratio\s+(\d+)\s*:\s*(\d+)/i)
      || raw.match(/share\s+(\d+).*?ratio\s+(\d+)\s*:\s*(\d+)/i);
    if (m) return `Share ${m[1]} in the ratio ${m[2]}:${m[3]}. How many does the first person get?`;
  }
  if (skill === 'substitution' || /sets x=/i.test(raw)) {
    m = raw.match(/([-\d]+x[+\-][-\d]+)/i) || raw.match(/formula\s+(\S+)/i);
    const xm = raw.match(/x\s*=\s*([-\d]+)/i);
    if (m && xm) return `Using the formula ${m[1]}, what do you get when x = ${xm[1]}?`;
  }
  if (skill === 'mean' || skill === 'averages') {
    m = raw.match(/:\s*([-\d]+(?:\s*,\s*[-\d]+)+)/);
    if (m) return `Find the mean of ${m[1]}.`;
    m = raw.match(/Mean of\s+([-\d]+(?:\s*,\s*[-\d]+)+)/i);
    if (m) return `Find the mean of ${m[1]}.`;
    m = raw.match(/Mean of\s+(\d+)\s+and\s+(\d+)/i);
    if (m) return `Find the mean of ${m[1]} and ${m[2]}.`;
  }
  if (skill === 'median') {
    m = raw.match(/Median of\s+([-\d]+(?:\s*,\s*[-\d]+)+)/i);
    if (m) return `Find the median of ${m[1]}.`;
  }
  if (skill === 'range') {
    const n = nums(raw);
    if (n.length >= 2) return `Find the range from ${n[0]} to ${n[1]} (largest − smallest).`;
  }
  if (skill === 'basic probability' || skill === 'probability') {
    m = raw.match(/(\d+)\s+\S.*?,\s*(\d+)\s+shiny/i) || raw.match(/(\d+)\s+.*?,\s*(\d+)\s+shiny/i);
    if (m) return `A chest has ${m[1]} items and ${m[2]} are “shiny.” What is P(shiny)? Simplify.`;
    m = raw.match(/P\(shiny\)\s*=\s*(\d+\/\d+)/i);
    if (m) return `If P(shiny) = ${m[1]}, what is P(not shiny)? Simplify.`;
  }
  if (skill === 'complement') {
    m = raw.match(/P\(shiny\)\s*=\s*(\d+\/\d+)/i);
    if (m) return `If P(shiny) = ${m[1]}, find P(not shiny). Simplify.`;
  }
  if (skill === 'independence') {
    m = raw.match(/P\(A\)\s*=\s*(\d+\/\d+).*P\(B\)\s*=\s*(\d+\/\d+)/i);
    if (m) return `Independent events with P(A) = ${m[1]} and P(B) = ${m[2]}. Find P(A ∩ B). Simplify.`;
  }
  if (skill === 'proportion') {
    m = raw.match(/(\d+)\s+of\s+(\d+)/i);
    if (m) return `${m[1]} out of ${m[2]} people in a sample said yes. What is the sample proportion p̂? Simplify.`;
  }
  if (skill === 'z-score') {
    m = raw.match(/x\s*=\s*([-\d]+).*μ\s*=\s*([-\d]+).*σ\s*=\s*([-\d]+)/i);
    if (m) return `Find the z-score of x = ${m[1]} when μ = ${m[2]} and σ = ${m[3]}.`;
  }
  if (skill === 'IQR') {
    m = raw.match(/Q1\s*=\s*([-\d]+).*Q3\s*=\s*([-\d]+)/i);
    if (m) return `If Q1 = ${m[1]} and Q3 = ${m[2]}, what is the IQR?`;
  }
  if (skill === 'CI' || skill === 'errors') {
    m = raw.match(/z\s*=\s*([-\d.]+).*s\s*=\s*([-\d.]+).*n\s*=\s*([-\d]+)/i);
    if (m) return `Margin of error = z·(s/√n) with z = ${m[1]}, s = ${m[2]}, n = ${m[3]}. Find ME.`;
  }
  if (skill === 'binomial' && /Bin/i.test(raw)) {
    m = raw.match(/Bin\(n\s*=\s*(\d+),\s*p\s*=\s*([^)]+)\)/i);
    if (m) return `X ~ Bin(n = ${m[1]}, p = ${m[2]}). Find E[X].`;
  }
  if (skill === 'polynomials') {
    m = raw.match(/(\([^)]+\)\s*\+\s*\([^)]+\))/);
    if (m) return `Simplify ${m[1]} to the form mx + k.`;
  }
  if (skill === 'expand') {
    m = raw.match(/(\([^)]+\)\([^)]+\))/);
    if (m) return `Expand ${m[1]}. What is the constant term?`;
  }
  if (skill === 'factoring') {
    m = raw.match(/(x²[^.]*=0)/);
    if (m) return `Factor and solve ${m[1]}. What is the smaller positive root?`;
  }
  if (skill === 'linear' || skill === 'equations') {
    m = raw.match(/Solve\s+(.+?)\s+for/i) || raw.match(/Solve\s+([^=]+=\S+)/i);
    if (m) return `Solve ${m[1].replace(/\s+for.*$/, '').trim()}.`;
  }
  if (skill === 'quadratic') {
    m = raw.match(/solves\s+(.+?)\s+at/i) || raw.match(/([-\d]*x²[^.]*=0)/i);
    if (m) return `Solve ${m[1]}. List the roots in ascending order.`;
  }
  if (skill === 'slope') {
    m = raw.match(/from\s+(\([^)]+\))\s+to\s+(\([^)]+\))/i);
    if (m) return `Find the slope of the line through ${m[1]} and ${m[2]}.`;
  }
  if (skill === 'linear functions') {
    m = raw.match(/(y\s*=\s*[^.]+?)\s+tracks/i) || raw.match(/(y\s*=\s*\S+)/i);
    const xm = raw.match(/x\s*=\s*([-\d]+)/);
    if (m && xm) return `For ${m[1].trim()}, what is y when x = ${xm[1]}?`;
  }
  if (skill === 'exponents' || skill === 'exponent laws') {
    m = raw.match(/simplifies\s+(\S+)/i) || raw.match(/evaluates\s+(\S+)/i) || raw.match(/(\d+\^\d+)/);
    if (m) return `Evaluate or simplify: ${m[1]}.`;
  }
  if (skill === 'logs' || skill === 'log laws') {
    m = raw.match(/(log[_\s]?\S+\([^)]+\))/i) || raw.match(/(log\([^)]+\))/i);
    if (m) return `Evaluate ${m[1]}.`;
  }
  if (skill === 'exact values' || skill === 'trig ratios') {
    m = raw.match(/(sin|cos|tan)\s*\(?\s*(\d+)/i) || raw.match(/opp\s*=\s*(\d+).*adj\s*=\s*(\d+)/i);
    if (m && m[2] && !m[0].includes('opp')) return `Find the exact value of ${m[1]}(${m[2]}°).`;
    if (/opp=/i.test(raw)) {
      const a = raw.match(/opp\s*=\s*(\d+)/i);
      const b = raw.match(/adj\s*=\s*(\d+)/i);
      if (a && b) return `In a right triangle, opposite = ${a[1]} and adjacent = ${b[1]}. Find tan θ simplified.`;
    }
  }
  if (skill === 'composition' || skill === 'evaluate') {
    m = raw.match(/(f\(x\)\s*=\s*[^.]*)/i) || raw.match(/f\((\d+)\)/);
    const xm = raw.match(/f\((\-?\d+)\)/);
    if (m && xm) return `If ${m[1].split('.')[0].trim()}, find f(${xm[1]}).`;
    if (xm) return `Find f(${xm[1]}).`;
  }
  if (skill === 'limits') {
    m = raw.match(/(lim[^:？?]*)/i);
    if (m) {
      let lim = m[1].replace(/\s+for\s+a\s*$/i, '').replace(/\s+near\s*$/i, '').trim();
      lim = lim.replace(/\s+for a$/, '').trim();
      // cut trailing flavor after the math
      lim = lim.replace(/\s+for a\b.*$/i, '').replace(/\s+near\b.*$/i, '').trim();
      return `Find ${lim}.`;
    }
  }
  if (skill === 'chain rule' || skill === 'power rule' || skill === 'product rule' || skill === 'derivatives') {
    m = raw.match(/(d\/dx\[[^\]]+\])/i) || raw.match(/(d\/dx\s*\([^)]+\))/i);
    const at = raw.match(/at\s+x\s*=\s*([-\d]+)/i);
    if (m) return `Differentiate: ${m[1]}${at ? ` at x = ${at[1]}` : ''}.`;
  }
  if (skill === 'tangent') {
    m = raw.match(/at\s+x\s*=\s*([-\d]+)/i);
  }
  if (skill === 'definite integral' || skill === 'antiderivative' || skill === 'integrals' || skill === 'integration' || skill === 'FTC') {
    m = raw.match(/([∫∬][^?]+)/);
    if (m) return `Evaluate ${m[1].replace(/\s*\([^)]*slab.*$/, '').replace(/\s+@.*$/, '').trim()}.`;
  }
  if (skill === 'double integral') {
    m = raw.match(/(∬[^?]+)/);
    if (m) {
      let s = m[1].replace(/\s*\([^)]*\).*$/, '').trim();
      return `Evaluate ${s}.`;
    }
  }
  if (skill === 'det') {
    m = raw.match(/(det\[\[[^\]]+\],\[[^\]]+\]\])/i) || raw.match(/(det\[\[[^\]]+\]\])/i) || raw.match(/(det\S+)/i);
    if (m) return `Compute ${m[1]}.`;
  }
  if (skill === 'dot' || skill === 'dot product' || skill === 'orthogonal') {
    m = raw.match(/(⟨[^⟩]+⟩\s*[·⊥]\s*⟨[^⟩]+⟩)/);
    if (m) return skill === 'orthogonal' || /⊥/.test(m[1])
      ? `True or false-style check: are these orthogonal? Compute/interpret ${m[1]}.`
      : `Compute the dot product ${m[1]}.`;
  }
  if (skill === 'linear systems' || skill === 'RREF') {
    m = raw.match(/Solve\s+(.+?)(?:\s*\(|$)/i);
    if (m) return `Solve ${m[1].trim()}.`;
  }
  if (skill === 'eigenvalues' || skill === 'characteristic' || skill === 'trace' || skill === 'invertibility') {
    // keep matrix-ish snippets
    m = raw.match(/((?:det|tr|char|eigen)[^?]*)/i);
  }
  if (skill === 'I.32' || skill === 'angles') {
    m = raw.match(/angles\s+(\d+)°\s+and\s+(\d+)°/i);
    if (m) return `A triangle has angles ${m[1]}° and ${m[2]}°. What is the third angle?`;
  }
  if (skill === 'I.32 exterior') {
    m = raw.match(/(\d+)°\+(\d+)°/);
    if (m) return `Remote interior angles are ${m[1]}° and ${m[2]}°. What is the exterior angle?`;
  }
  if (skill === 'I.47 Pythagoras' || skill === 'Pythagoras') {
    m = raw.match(/legs\s+(\d+)\s*,\s*(\d+)/i);
    if (m) return `A right triangle has legs ${m[1]} and ${m[2]}. What is the hypotenuse?`;
  }
  if (skill === 'I.15') {
    m = raw.match(/one is\s+(\d+)°/i);
    if (m) return `Vertical angles: one measures ${m[1]}°. What does its vertical match measure?`;
  }
  if (skill === 'I.13') {
    m = raw.match(/one is\s+(\d+)°/i);
    if (m) return `Adjacent angles on a straight line: one is ${m[1]}°. What is the other?`;
  }
  if (skill === 'I.29') {
    m = raw.match(/is\s+(\d+)°/i);
    if (m) return `Parallel lines with a transversal: a corresponding angle is ${m[1]}°. What is the matching corresponding angle?`;
  }
  if (skill === 'I.34') {
    m = raw.match(/to\s+(\d+)°/i);
    if (m) return `In a parallelogram, one angle is ${m[1]}°. What is the opposite angle?`;
  }
  if (skill === 'III.31') {
    m = raw.match(/acute is\s+(\d+)°/i);
    if (m) return `Angle in a semicircle is 90°. If one acute angle is ${m[1]}°, what is the other acute angle?`;
  }
  if (skill === 'III.20') {
    m = raw.match(/Central angle\s+(\d+)°/i);
    if (m) return `A central angle is ${m[1]}°. What is the inscribed angle on the same arc?`;
  }
  if (skill === 'VI.2 / ratios') {
    m = raw.match(/(\d+\/\d+\s*=\s*\d+\/x)/i);
    if (m) return `Similar triangles: ${m[1]}. Solve for x.`;
  }
  if (skill === 'I.1') {
    m = raw.match(/side\s+(\d+)/i);
    if (m) return `An equilateral triangle has one side ${m[1]}. What is another side length?`;
  }
  if (skill === 'I.20') {
    m = raw.match(/sides\s+(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (m) return `True or false: sides ${m[1]}, ${m[2]}, ${m[3]} can form a triangle (triangle inequality).`;
  }
  if (skill === 'sequences' || skill === 'arithmetic') {
    m = raw.match(/a1\s*=\s*([-\d]+),\s*d\s*=\s*([-\d]+)/i) || raw.match(/a\s*=\s*([-\d]+),\s*d\s*=\s*([-\d]+)/i);
    const term = raw.match(/term\s+(\d+)/i) || raw.match(/n\s*=\s*(\d+)/i);
    if (m && /S_n|sum/i.test(raw)) {
      const n = raw.match(/n\s*=\s*(\d+)/i);
      return `Arithmetic sequence with a = ${m[1]}, d = ${m[2]}${n ? `, n = ${n[1]}` : ''}. Find the sum S_n.`;
    }
    if (m && term) return `Arithmetic sequence with first term ${m[1]} and common difference ${m[2]}. Find term ${term[1]}.`;
  }
  if (skill === 'geometric') {
    m = raw.match(/a\s*=\s*([-\d]+),\s*r\s*=\s*([-\d]+)/i);
    const term = raw.match(/Term\s+(\d+)/i) || raw.match(/term\s+(\d+)/i);
    if (m) return `Geometric sequence with a = ${m[1]}, r = ${m[2]}${term ? `. Find term ${term[1]}` : ''}.`;
  }
  if (skill === 'vertex') {
    m = raw.match(/(y\s*=\s*[^.]+)/i);
    if (m) return `For the parabola ${m[1].replace(/\.\s*$/, '')}, find the x-coordinate of the vertex.`;
  }
  if (skill === 'radians') {
    m = raw.match(/(\d+)°/);
    if (m) return `Convert ${m[1]}° to radians (answer in terms of π, e.g. π/3).`;
  }
  if (skill === 'sinusoids' || skill === 'amplitude') {
    m = raw.match(/(y\s*=\s*[^\s]+)/i);
    if (m && /period/i.test(raw)) return `For ${m[1]}, find the period (in terms of π if needed).`;
    if (m) return `For ${m[1]}, what is the amplitude?`;
  }
  if (skill === 'circle') {
    m = raw.match(/=\s*(\d+)\./);
    const r2 = raw.match(/²\s*=\s*(\d+)/);
    if (r2) return `A circle equation ends with = ${r2[1]}. What is the radius?`;
  }
  if (skill === 'zeros') {
    m = raw.match(/\(x−\(([^)]+)\)\)\(x−\(([^)]+)\)\)/);
    if (m) return `A polynomial has factors (x − (${m[1]}))(x − (${m[2]})). What is the sum of the zeros?`;
  }
  if (skill === 'negatives') {
    m = raw.match(/([−\-]\d+\s*[+\-]\s*[−\-]?\d+)/);
    if (m) return `Evaluate ${m[1]}.`;
  }
  if (skill === 'rounding') {
    m = raw.match(/([\d.]+)/);
  }

  // --- Skill extras ---
  if (skill === 'ratio') {
    m = raw.match(/share\s+(\d+)\s+.+?\s+in\s+ratio\s+(\d+)\s*:\s*(\d+)/i)
      || raw.match(/share\s+(\d+).*?ratio\s+(\d+)\s*:\s*(\d+)/i);
    if (m) return `Share ${m[1]} in the ratio ${m[2]}:${m[3]}. How many does the first person get?`;
  }
  if (skill === 'product rule') {
    m = raw.match(/d\/dx\s*\[?\(?([^\]]+?)\)?\]?/i) || raw.match(/product rule on\s+(.+?)(?:\s+at|$)/i);
    if (m) return `Use the product rule to differentiate ${m[1].trim()}.`;
  }
  if (skill === 'power rule') {
    m = raw.match(/d\/dx\s*\(?([^)]+)\)?/i) || raw.match(/(\S+\^\S+)/);
    if (m) return `Differentiate using the power rule: ${m[1]}.`;
  }
  if (skill === 'percentages') {
    m = raw.match(/(\d+)%\s+of\s+(\d+)/i);
    if (m) return `What is ${m[1]}% of ${m[2]}?`;
  }
  if (skill === 'negatives') {
    m = raw.match(/([−\-]?\d+\s*[+\-]\s*[−\-]?\d+)/);
    if (m) return `Evaluate ${m[1]}.`;
  }
  if (skill === 'rounding') {
    m = raw.match(/([\d.]+)\s+to\s+(\d+)/i) || raw.match(/round\s+([\d.]+)/i);
    if (m) return m[2] ? `Round ${m[1]} to ${m[2]} decimal places.` : `Round ${m[1]}.`;
  }
  if (skill === 'substitution') {
    m = raw.match(/(?:formula|expression)\s+(\S+).*x\s*=\s*([\-\d]+)/i)
      || raw.match(/(\d*x[+\-]\d+).*x\s*=\s*([\-\d]+)/i);
    if (m) return `Substitute x = ${m[2]} into ${m[1]}. What do you get?`;
  }
  if (skill === 'expand' || skill === 'expanding') {
    m = raw.match(/expand\s+(\([^)]+\))/i) || raw.match(/(\([^)]+\)\([^)]+\))/);
    if (m) return `Expand ${m[1]}.`;
  }
  if (skill === 'sequences') {
    m = raw.match(/a1\s*=\s*([\-\d]+).*d\s*=\s*([\-\d]+).*term\s+(\d+)/i)
      || raw.match(/a\s*=\s*([\-\d]+).*d\s*=\s*([\-\d]+).*n\s*=\s*(\d+)/i);
    if (m) return `Arithmetic sequence: a₁ = ${m[1]}, d = ${m[2]}. Find term ${m[3]}.`;
  }
  if (skill === 'area') {
    m = raw.match(/(\d+)\s*[×x*]\s*(\d+)/i);
    if (m) return `A rectangle measures ${m[1]} by ${m[2]}. What is its area?`;
  }
  if (skill === 'Pythagoras') {
    m = raw.match(/legs?\s+(\d+)\s*,\s*(\d+)/i) || raw.match(/(\d+)\s+and\s+(\d+)/);
    if (m) return `Right triangle with legs ${m[1]} and ${m[2]}. Find the hypotenuse.`;
  }
  if (skill === 'angles') {
    m = raw.match(/(\d+)°/);
    if (m && /triangle/i.test(raw)) {
      const all = raw.match(/(\d+)°/g) || [];
      if (all.length >= 2) return `A triangle has angles ${all[0]} and ${all[1]}. Find the third angle.`;
    }
  }
  if (skill === 'averages') {
    m = raw.match(/:\s*([\-\d]+(?:\s*,\s*[\-\d]+)+)/);
    if (m) return `Find the average (mean) of ${m[1]}.`;
  }

  // --- Gentle fallback: strip only flavor names + wrapper verbs, keep math intact ---
  let p = raw;
  p = p.replace(/\s*\([^)]*simplify[^)]*\)\s*$/i, '');
  p = p.replace(/\s*\((I\.\d+|III\.\d+)[^)]*\)\s*$/i, '');
  for (const w of CHARACTERS.concat(SETTINGS).concat(ITEMS)) {
    p = p.replace(new RegExp(escapeRe(w), 'gi'), '');
  }
  p = p
    .replace(/\b(finds|logs|computes|evaluates|simplifies|solves|expands|factors|maps|combines|needs|wants|flies toward|proving near)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s*[,;:.\-–—]+\s*/, '')
    .replace(/\s+([,.])/g, '$1')
    .trim();
  if (p.length >= 8 && p.length < 220) {
    if (!/[?.!]$/.test(p)) p += '.';
    return p.charAt(0).toUpperCase() + p.slice(1);
  }
  return raw.replace(/\s*\([^)]*simplify[^)]*\)\s*$/i, '').trim();
}

function storyOpen(f, bridge, salt) {
  const { char, setting, item } = f;
  const opens = [
    `${char} is at ${setting} with a pile of ${item}.`,
    `At ${setting}, ${char} is messing about with ${item}.`,
    `${char} takes a breath at ${setting} — ${item} everywhere.`,
    `Picture ${char} at ${setting}, using ${item} as a prop.`
  ];
  const links = [
    `This is really about ${bridge}.`,
    `It’s a friendly way into ${bridge}.`,
    `That sets up a clean question on ${bridge}.`,
    `Use the scene as a hook for ${bridge}.`
  ];
  return `${pick(opens, salt)} ${pick(links, salt + 5)}`;
}

function rewritePrompt(q) {
  const f = flavorFrom(q);
  const skill = skillOf(q);
  const salt = hash(q.id || q.prompt);
  const bridge = topicBridge(skill, q.section, salt);
  const ask = mathAsk(q, skill, f);
  const open = storyOpen(f, bridge, salt);
  return `${open} ${ask}`.replace(/\s+/g, ' ').trim();
}

function polishStep(line, idx, total) {
  let s = String(line || '').trim();
  if (!s) return s;
  s = s.replace(/\s*→\s*/g, '; ').replace(/\s+/g, ' ').trim();

  const replacements = [
    [/^Multiplication first:\s*/i, 'Multiply first: '],
    [/^Then\s+/i, 'Then '],
    [/^LCD=/i, 'Common denominator = '],
    [/^Sum=/i, 'Sum = '],
    [/^Mean=/i, 'Mean = '],
    [/^Poly continuous\s*;?\s*/i, 'A polynomial is continuous, so we can substitute. '],
    [/^Plug x=/i, 'Substitute x = '],
    [/^Plug in x=/i, 'Substitute x = '],
    [/^Factor\s+/i, 'Factor '],
    [/^Cancel the common factor;\s*;?\s*/i, 'Cancel the common factor; '],
    [/^Cancel\s*;?\s*/i, 'Cancel: '],
    [/^Δ=/i, 'Discriminant Δ = '],
    [/^Roots\s+/i, 'Roots: '],
    [/^Factors\s+/i, 'Factor pair: '],
    [/^Smaller root\s+/i, 'Smaller root: '],
    [/^Answer:\s*/i, 'Answer: '],
    [/^So the answer is\s*/i, 'Answer: '],
    [/^x:\s*/i, 'x coefficients: '],
    [/^const:\s*/i, 'constant terms: '],
    [/^Dot=/i, 'Dot product = '],
    [/^Standard Euclidean fact\.?/i, 'That’s a standard Euclidean fact.'],
    [/^a_n=a\+\(n-1\)d/i, 'Use a_n = a + (n − 1)d'],
    [/^n\(inner\)/i, 'Chain rule: n(inner)']
  ];
  for (const [re, rep] of replacements) s = s.replace(re, rep);

  s = s.replace(/\s*=\s*/g, ' = ').replace(/\s+/g, ' ').trim();

  // Avoid "So so" / "Start with do"
  s = s.replace(/^So so /i, 'So ');
  s = s.replace(/^Start with do /i, 'Do ');
  s = s.replace(/^Start with ([a-z])/i, (_, c) => c.toUpperCase() + ""); // will fix below

  const leadAlready = /^(Multiply|Then|Next|So|Thus|Hence|First|Finally|Use|Apply|Recall|Factor|Cancel|Substitute|Answer|Discriminant|Roots|Factor pair|Smaller|Common|Sum|Mean|Dot|A polynomial|That’s|Chain|Collect|x coefficients|constant|Compute|Add|Subtract|Divide|Write|Check|Compare|Simplify|Expand|The|We|It|This|If|For|When|Because|Since|Standard|Vertical|Supplementary|Angle|Third|Exterior|Hypotenuse|Opposite|Adjacent|Parallel|Inscribed|Central|Equilateral|Similar|True|False|\d)/i.test(s);

  if (!leadAlready) {
    if (idx === 0) s = s.charAt(0).toUpperCase() + s.slice(1);
    else if (idx === total - 1) s = 'So ' + s.charAt(0).toLowerCase() + s.slice(1);
    else s = 'Next, ' + s.charAt(0).toLowerCase() + s.slice(1);
  }

  // Fix botched "Start with X" remnant if any
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
  const polished = steps.map((line, i) => polishStep(line, i, steps.length));
  const ans = String(q.answer);
  const joined = polished.join(' ');
  if (ans && !polished.some((s) => s.includes(ans)) && !joined.includes(ans)) {
    polished.push(`Answer: ${ans}.`);
  }
  // De-dupe accidental double Answer lines
  const dedup = [];
  for (const s of polished) {
    if (dedup.length && /^Answer:/i.test(s) && /^Answer:/i.test(dedup[dedup.length - 1])) continue;
    dedup.push(s);
  }
  return { solutionSteps: dedup, solution: dedup.join(' ') };
}

function rewriteQuestion(q) {
  const prompt = rewritePrompt(q);
  const sol = rewriteSolution(q);
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
  topicBridge,
  mathAsk
};
