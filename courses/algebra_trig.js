(function () {
  const E = window.ExamEngine;
  const gcd = E.gcd, simp = E.simplifyFraction, fmtPoly = E.fmtPoly;

  function nz(rng, lo, hi) {
    let x; do { x = rng.int(lo, hi); } while (x === 0); return x;
  }

  const generators = [
    function (rng) {
      const a = nz(rng, -6, 6), b = rng.int(-10, 10), c = nz(rng, -6, 6), d = rng.int(-10, 10);
      // (ax+b)+(cx+d)
      const A = a + c, B = b + d;
      return {
        id: 'at-combine', section: 'Algebra basics', difficulty: 'easy', tags: ['polynomials'],
        type: 'short',
        prompt: `Simplify: (${fmtPoly([b, a])}) + (${fmtPoly([d, c])})`,
        answer: fmtPoly([B, A]),
        solution: `Combine like terms: x-coeffs ${a}+${c}=${A}; constants ${b}+${d}=${B}. Result: ${fmtPoly([B, A])}.`
      };
    },
    function (rng) {
      const a = nz(rng, 1, 5), b = nz(rng, -8, 8), c = nz(rng, 1, 5), d = nz(rng, -8, 8);
      // (ax+b)(cx+d)
      const A = a * c, B = a * d + b * c, C = b * d;
      return {
        id: 'at-foil', section: 'Algebra basics', difficulty: 'medium', tags: ['expand'],
        type: 'short',
        prompt: `Expand: (${fmtPoly([b, a])})(${fmtPoly([d, c])})\nWrite as px²+qx+r.`,
        answer: fmtPoly([C, B, A]),
        solution: `FOIL: (${a}x)(${c}x)=${A}x²; (${a}x)(${d})+(${b})(${c}x)=${B}x; (${b})(${d})=${C}. → ${fmtPoly([C, B, A])}.`
      };
    },
    function (rng) {
      // factor x^2 + sx + p with integer roots
      const r1 = nz(rng, -6, 6), r2 = nz(rng, -6, 6);
      const s = -(r1 + r2), p = r1 * r2;
      const poly = fmtPoly([p, s, 1]);
      const f1 = r1 > 0 ? `x−${r1}` : r1 < 0 ? `x+${-r1}` : 'x';
      const f2 = r2 > 0 ? `x−${r2}` : r2 < 0 ? `x+${-r2}` : 'x';
      // canonical order smaller root first for answer matching — accept either order via |
      const ans1 = `(${f1})(${f2})`;
      const ans2 = `(${f2})(${f1})`;
      return {
        id: 'at-factor', section: 'Algebra basics', difficulty: 'medium', tags: ['factoring'],
        type: 'short',
        prompt: `Factor completely over the integers: ${poly}\nWrite as (x±…)(x±…).`,
        answer: ans1 + '|' + ans2,
        solution: `Roots r where (x−r) factors: looking for two numbers summing to ${-s} and product ${p}: ${r1} and ${r2}. So ${ans1}.`
      };
    },
    function (rng) {
      const a = nz(rng, 1, 5), b = rng.int(-12, 12), c = rng.int(-20, 20);
      // ax+b=c
      const num = c - b, s = simp(num, a);
      return {
        id: 'at-linear', section: 'Equations', difficulty: 'easy', tags: ['linear'],
        type: 'short',
        prompt: `Solve: ${a}x ${b >= 0 ? '+ ' + b : '− ' + Math.abs(b)} = ${c}\nGive simplified fraction or integer.`,
        answer: s.str,
        solution: `${a}x = ${c}−(${b}) = ${num}. x = ${num}/${a} = ${s.str}.`
      };
    },
    function (rng) {
      // quadratic formula with nice discriminant
      const a = rng.pick([1, 1, 2]), r1 = rng.int(-5, 5), r2 = rng.int(-5, 5);
      if (r1 === r2) return generators[4](rng); // rare recurse via index — safer rewrite below
      const b = -a * (r1 + r2), c = a * r1 * r2;
      const disc = b * b - 4 * a * c;
      const answers = [r1, r2].sort((x, y) => x - y);
      return {
        id: 'at-quad', section: 'Equations', difficulty: 'medium', tags: ['quadratic'],
        type: 'short',
        prompt: `Solve ${fmtPoly([c, b, a])} = 0. List solutions ascending, separated by comma (e.g. -2,5).`,
        answer: answers.join(','),
        solution: `Discriminant Δ=${disc}. Roots from factoring/quadratic formula: ${answers.join(' and ')}.`
      };
    },
    function (rng) {
      const m = nz(rng, -5, 5), x1 = rng.int(-4, 4), y1 = rng.int(-6, 6);
      const x2 = x1 + nz(rng, 1, 5), y2 = y1 + m * (x2 - x1);
      return {
        id: 'at-slope', section: 'Graphs', difficulty: 'easy', tags: ['slope'],
        type: 'short',
        prompt: `Find the slope of the line through (${x1},${y1}) and (${x2},${y2}).`,
        answer: String(m),
        solution: `m = (y₂−y₁)/(x₂−x₁) = (${y2}−${y1})/(${x2}−${x1}) = ${y2 - y1}/${x2 - x1} = ${m}.`
      };
    },
    function (rng) {
      const m = nz(rng, -4, 4), b = rng.int(-8, 8), x = rng.int(-5, 5);
      const y = m * x + b;
      return {
        id: 'at-line-eval', section: 'Graphs', difficulty: 'easy', tags: ['linear functions'],
        type: 'short',
        prompt: `For y = ${m}x ${b >= 0 ? '+ ' + b : '− ' + Math.abs(b)}, find y when x = ${x}.`,
        answer: String(y),
        solution: `y = ${m}(${x}) + (${b}) = ${y}.`
      };
    },
    function (rng) {
      // exponential: 2^n style
      const base = rng.pick([2, 3, 4, 5]), exp = rng.int(2, 5);
      const ans = Math.pow(base, exp);
      return {
        id: 'at-exp', section: 'Exponents & logs', difficulty: 'easy', tags: ['exponents'],
        type: 'short',
        prompt: `Evaluate: ${base}^${exp}`,
        answer: String(ans),
        solution: `${base}^${exp} = ${ans}.`
      };
    },
    function (rng) {
      const a = rng.int(2, 5), m = rng.int(2, 4), n = rng.int(1, 3);
      // (a^m)(a^n)=a^{m+n}
      return {
        id: 'at-exp-laws', section: 'Exponents & logs', difficulty: 'easy', tags: ['exponent laws'],
        type: 'short',
        prompt: `Simplify to a single power of ${a}: ${a}^${m} · ${a}^${n}`,
        answer: `${a}^${m + n}`,
        solution: `a^m · a^n = a^{m+n} = ${a}^${m + n}.`
      };
    },
    function (rng) {
      // log_b(b^k)=k
      const b = rng.pick([2, 3, 5, 10]), k = rng.int(1, 5);
      return {
        id: 'at-log', section: 'Exponents & logs', difficulty: 'medium', tags: ['logs'],
        type: 'short',
        prompt: `Evaluate: log_${b}(${Math.pow(b, k)})`,
        answer: String(k),
        solution: `log_b(b^k) = k, so log_${b}(${Math.pow(b, k)}) = ${k}.`
      };
    },
    function (rng) {
      // sin of special angles — store degrees answer for sin value as fraction
      const table = [
        { ang: 0, sin: '0', cos: '1' },
        { ang: 30, sin: '1/2', cos: '√3/2' },
        { ang: 45, sin: '√2/2', cos: '√2/2' },
        { ang: 60, sin: '√3/2', cos: '1/2' },
        { ang: 90, sin: '1', cos: '0' }
      ];
      const t = rng.pick(table);
      const fn = rng.pick(['sin', 'cos']);
      const ans = fn === 'sin' ? t.sin : t.cos;
      return {
        id: 'at-trig-exact', section: 'Trigonometry', difficulty: 'medium', tags: ['exact values'],
        type: 'short',
        prompt: `Give the exact value of ${fn}(${t.ang}°). Use √ where needed (e.g. √2/2).`,
        answer: ans,
        solution: `Standard unit-circle / special-triangle value: ${fn}(${t.ang}°) = ${ans}.`
      };
    },
    function (rng) {
      // right triangle: find side via sin/cos with nice numbers
      const hyp = rng.pick([10, 12, 13, 15, 20]);
      const opp = rng.int(3, hyp - 2);
      // ask sin = opp/hyp simplified
      const s = simp(opp, hyp);
      return {
        id: 'at-trig-ratio', section: 'Trigonometry', difficulty: 'easy', tags: ['trig ratios'],
        type: 'short',
        prompt: `In a right triangle, opposite = ${opp} and hypotenuse = ${hyp}. Find sin(θ) as a simplified fraction.`,
        answer: s.str,
        solution: `sin(θ) = opposite/hypotenuse = ${opp}/${hyp} = ${s.str}.`
      };
    },
    function (rng) {
      const A = rng.int(20, 70);
      const B = 90 - A;
      return {
        id: 'at-cofn', section: 'Trigonometry', difficulty: 'easy', tags: ['cofunctions'],
        type: 'short',
        prompt: `If ∠A and ∠B are complementary acute angles in a right triangle and ∠A = ${A}°, find ∠B.`,
        answer: String(B),
        solution: `Complementary angles sum to 90°. B = 90 − ${A} = ${B}.`
      };
    },
    function (rng) {
      // domain restriction rational: (x-a)/(x-b)
      const a = rng.int(-5, 5), b = nz(rng, -6, 6);
      return {
        id: 'at-domain', section: 'Functions', difficulty: 'medium', tags: ['domain'],
        type: 'short',
        prompt: `For f(x) = (x ${a >= 0 ? '− ' + a : '+ ' + (-a)})/(x ${b >= 0 ? '− ' + b : '+ ' + (-b)}), what real value of x is excluded from the domain?`,
        answer: String(b),
        solution: `Denominator zero when x − (${b}) = 0 ⇒ x = ${b}.`
      };
    },
    function (rng) {
      // composition f(g(x)) simple linear
      const a = nz(rng, 1, 4), b = rng.int(-5, 5), c = nz(rng, 1, 4), d = rng.int(-5, 5);
      const x0 = rng.int(-3, 5);
      const gx = c * x0 + d;
      const ans = a * gx + b;
      return {
        id: 'at-compose', section: 'Functions', difficulty: 'medium', tags: ['composition'],
        type: 'short',
        prompt: `Let f(x) = ${a}x ${b >= 0 ? '+ ' + b : '− ' + Math.abs(b)} and g(x) = ${c}x ${d >= 0 ? '+ ' + d : '− ' + Math.abs(d)}. Find (f∘g)(${x0}).`,
        answer: String(ans),
        solution: `g(${x0}) = ${c}(${x0})+${d} = ${gx}. f(${gx}) = ${a}(${gx})+${b} = ${ans}.`
      };
    },
    function (rng) {
      const opts = [
        { q: 'The graph of y = −f(x) is a reflection of y = f(x) across the x-axis.', a: 'True' },
        { q: 'The graph of y = f(−x) is a reflection of y = f(x) across the y-axis.', a: 'True' },
        { q: 'The graph of y = f(x) + 3 is a horizontal shift of y = f(x) by 3 units.', a: 'False' },
        { q: 'Every function has an inverse that is also a function.', a: 'False' }
      ];
      const t = rng.pick(opts);
      return {
        id: 'at-tf', section: 'Functions', difficulty: 'easy', tags: ['definitions'],
        type: 'tf', prompt: t.q, answer: t.a,
        solution: t.a === 'True' ? 'This matches the standard transformation/definition statement.' : 'Counterexample / correction: vertical shift is ±k outside; not every function is one-to-one.'
      };
    }
  ];

  // fix quadratic generator to avoid self-call issues
  generators[4] = function (rng) {
    const a = rng.pick([1, 1, 2]);
    let r1 = rng.int(-5, 5), r2 = rng.int(-5, 5);
    while (r2 === r1) r2 = rng.int(-5, 5);
    const b = -a * (r1 + r2), c = a * r1 * r2;
    const answers = [r1, r2].sort((x, y) => x - y);
    return {
      id: 'at-quad', section: 'Equations', difficulty: 'medium', tags: ['quadratic'],
      type: 'short',
      prompt: `Solve ${fmtPoly([c, b, a])} = 0. List solutions ascending, separated by comma (e.g. -2,5).`,
      answer: answers.join(','),
      solution: `By factoring / quadratic formula, roots are ${answers.join(' and ')}.`
    };
  };

  E.registerCourse({
    id: 'algebra_trig',
    title: 'Algebra & Trigonometry',
    subtitle: 'Alg II + Trig + precalc bridge',
    textbook: 'OpenStax Algebra and Trigonometry 2e',
    level: 'College / HS',
    description: 'Polynomials, equations, functions, exponents/logs, and trigonometry — OpenStax Alg & Trig 2e core.',
    sections: [
      { id: 'alg', name: 'Algebra basics', weight: 2 },
      { id: 'eq', name: 'Equations', weight: 2 },
      { id: 'graphs', name: 'Graphs', weight: 1 },
      { id: 'exp', name: 'Exponents & logs', weight: 2 },
      { id: 'trig', name: 'Trigonometry', weight: 2 },
      { id: 'fn', name: 'Functions', weight: 2 }
    ],
    generators,
    examPresets: { quick: { n: 10, minutes: 25 }, standard: { n: 25, minutes: 60 }, full: { n: 40, minutes: 90 } }
  });
})();
