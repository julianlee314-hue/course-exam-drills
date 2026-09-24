(function () {
  const E = window.ExamEngine;
  const simp = E.simplifyFraction, fmtPoly = E.fmtPoly, gcd = E.gcd;

  function nz(rng, lo, hi) { let x; do x = rng.int(lo, hi); while (x === 0); return x; }

  const generators = [
    function (rng) {
      const a = nz(rng, -5, 5), b = rng.int(-8, 8), x = rng.int(-4, 5);
      const y = a * x + b;
      return {
        id: 'sl-lin', section: 'Functions', difficulty: 'easy', tags: ['linear'],
        type: 'short',
        prompt: `f(x)=${a}x ${b >= 0 ? '+ ' + b : '− ' + Math.abs(b)}. Find f(${x}).`,
        answer: String(y),
        solution: `f(${x})=${a}(${x})+${b}=${y}.`
      };
    },
    function (rng) {
      const a = rng.int(1, 4), h = rng.int(-3, 3), k = rng.int(-4, 4);
      return {
        id: 'sl-quad-vertex', section: 'Functions', difficulty: 'medium', tags: ['quadratic'],
        type: 'short',
        prompt: `The vertex of y = ${a}(x ${h >= 0 ? '− ' + h : '+ ' + (-h)})² ${k >= 0 ? '+ ' + k : '− ' + Math.abs(k)} is (h,k). Find h+k.`,
        answer: String(h + k),
        solution: `Vertex (${h},${k}); h+k=${h + k}.`
      };
    },
    function (rng) {
      const base = rng.pick([2, 3, 10]), k = rng.int(1, 4);
      return {
        id: 'sl-exp', section: 'Functions', difficulty: 'easy', tags: ['exponential'],
        type: 'short',
        prompt: `Solve ${base}^x = ${Math.pow(base, k)}.`,
        answer: String(k),
        solution: `Same base ⇒ x=${k}.`
      };
    },
    function (rng) {
      const a = nz(rng, 1, 5), b = rng.int(-6, 6), c = rng.int(-10, 10);
      const s = simp(c - b, a);
      return {
        id: 'sl-eq', section: 'Algebra', difficulty: 'easy', tags: ['equations'],
        type: 'short',
        prompt: `Solve ${a}x ${b >= 0 ? '+ ' + b : '− ' + Math.abs(b)} = ${c}.`,
        answer: s.str,
        solution: `x=(${c}−(${b}))/${a}=${s.str}.`
      };
    },
    function (rng) {
      const r1 = rng.int(-4, 4), r2 = rng.int(-4, 4);
      const b = -(r1 + r2), c = r1 * r2;
      const roots = [r1, r2].sort((x, y) => x - y);
      return {
        id: 'sl-quad-eq', section: 'Algebra', difficulty: 'medium', tags: ['quadratic'],
        type: 'short',
        prompt: `Solve x² ${b >= 0 ? '+ ' + b : '− ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '− ' + Math.abs(c)} = 0. Roots ascending, comma-separated.`,
        answer: roots.join(','),
        solution: `Factors (x−(${r1}))(x−(${r2})). Roots ${roots.join(', ')}.`
      };
    },
    function (rng) {
      const n = rng.int(2, 6), coef = nz(rng, 2, 7);
      const ans = coef * n;
      return {
        id: 'sl-diff', section: 'Calculus', difficulty: 'easy', tags: ['derivatives'],
        type: 'short',
        prompt: `Differentiate ${coef}x^${n}. Coefficient of x^${n - 1} is:`,
        answer: String(ans),
        solution: `${coef}·${n}=${ans}.`
      };
    },
    function (rng) {
      const a = 0, b = rng.int(2, 5);
      const ans = b * b; // ∫_0^b 2x = b^2
      return {
        id: 'sl-int', section: 'Calculus', difficulty: 'easy', tags: ['integration'],
        type: 'short',
        prompt: `Evaluate ∫_0^{${b}} 2x dx.`,
        answer: String(ans),
        solution: `[x²]_0^{${b}}=${ans}.`
      };
    },
    function (rng) {
      const x0 = rng.int(1, 4);
      const slope = 3 * x0 * x0; // f=x^3
      return {
        id: 'sl-tang', section: 'Calculus', difficulty: 'medium', tags: ['tangent'],
        type: 'short',
        prompt: `For f(x)=x³, find f'(${x0}).`,
        answer: String(slope),
        solution: `f'=3x²; f'(${x0})=${slope}.`
      };
    },
    function (rng) {
      const n = rng.int(5, 12), k = rng.int(1, 4);
      const s = simp(k, n);
      return {
        id: 'sl-prob', section: 'Statistics & probability', difficulty: 'easy', tags: ['probability'],
        type: 'short',
        prompt: `A fair ${n}-sided die is rolled. P(face ≤ ${k}) as simplified fraction:`,
        answer: s.str,
        solution: `${k}/${n}=${s.str}.`
      };
    },
    function (rng) {
      const data = [];
      const n = 5;
      for (let i = 0; i < n; i++) data.push(rng.int(2, 15));
      const sum = data.reduce((a, b) => a + b, 0);
      const mean = simp(sum, n);
      return {
        id: 'sl-mean', section: 'Statistics & probability', difficulty: 'easy', tags: ['mean'],
        type: 'short',
        prompt: `Mean of {${data.join(', ')}} (simplified fraction or integer):`,
        answer: mean.str,
        solution: `Sum=${sum}; mean=${mean.str}.`
      };
    },
    function (rng) {
      const a1 = rng.int(1, 8), d = nz(rng, 1, 5), n = rng.int(5, 10);
      const an = a1 + (n - 1) * d;
      return {
        id: 'sl-arith', section: 'Sequences & series', difficulty: 'easy', tags: ['arithmetic'],
        type: 'short',
        prompt: `Arithmetic: u₁=${a1}, common difference ${d}. Find u_${n}.`,
        answer: String(an),
        solution: `u_n=u₁+(n−1)d=${an}.`
      };
    },
    function (rng) {
      const a = rng.int(1, 4), r = 2, n = rng.int(3, 5);
      const sn = a * (Math.pow(r, n) - 1) / (r - 1);
      return {
        id: 'sl-geo', section: 'Sequences & series', difficulty: 'medium', tags: ['geometric'],
        type: 'short',
        prompt: `Geometric: first term ${a}, ratio 2, ${n} terms. Find the sum S_${n}.`,
        answer: String(sn),
        solution: `S_n=a(r^n−1)/(r−1)=${sn}.`
      };
    },
    function (rng) {
      const A = rng.int(20, 70), B = rng.int(20, 70);
      let C = 180 - A - B;
      if (C <= 0) C = 40;
      return {
        id: 'sl-tri', section: 'Geometry & trig', difficulty: 'easy', tags: ['triangle'],
        type: 'short',
        prompt: `In a triangle, angles ${A}° and ${B}°. Third angle (degrees):`,
        answer: String(C),
        solution: `180−${A}−${B}=${C}.`
      };
    },
    function (rng) {
      const opp = rng.int(3, 8), hyp = opp + rng.int(2, 6);
      const s = simp(opp, hyp);
      return {
        id: 'sl-sin', section: 'Geometry & trig', difficulty: 'easy', tags: ['trig'],
        type: 'short',
        prompt: `Right triangle: opposite=${opp}, hypotenuse=${hyp}. sin θ as simplified fraction:`,
        answer: s.str,
        solution: `sin=opp/hyp=${s.str}.`
      };
    },
    function (rng) {
      const items = [
        { q: 'The derivative of sin x is cos x.', a: 'True', s: 'Standard.' },
        { q: 'log_a(xy)=log_a x + log_a y for positive x,y and a>0,a≠1.', a: 'True', s: 'Log product rule.' },
        { q: 'A binomial distribution requires independent Bernoulli trials.', a: 'True', s: 'Definition.' },
        { q: '∫_a^a f(x) dx = 1 for any continuous f.', a: 'False', s: 'Equals 0.' }
      ];
      const t = rng.pick(items);
      return { id: 'sl-tf', section: 'Functions', difficulty: 'easy', tags: ['theory'], type: 'tf', prompt: t.q, answer: t.a, solution: t.s };
    },
    function (rng) {
      const n = rng.int(4, 8), r = rng.int(1, 3);
      // C(n,r)
      let num = 1, den = 1;
      for (let i = 0; i < r; i++) { num *= n - i; den *= i + 1; }
      const s = simp(num, den);
      return {
        id: 'sl-binom', section: 'Statistics & probability', difficulty: 'medium', tags: ['combinatorics'],
        type: 'short',
        prompt: `Compute C(${n},${r}) = ${n} choose ${r}.`,
        answer: s.str,
        solution: `C(${n},${r})=${s.str}.`
      };
    }
  ];

  E.registerCourse({
    id: 'ib_aa_sl',
    title: 'IB AA SL',
    subtitle: 'Analysis & Approaches Standard Level',
    textbook: 'Haese Mathematics AA SL (Red Book)',
    level: 'IB DP SL',
    description: 'IB AA SL: functions, algebra, calculus, probability/statistics, sequences, and trig — Haese Red Book breadth.',
    sections: [
      { id: 'fn', name: 'Functions', weight: 2 },
      { id: 'alg', name: 'Algebra', weight: 2 },
      { id: 'calc', name: 'Calculus', weight: 2 },
      { id: 'stat', name: 'Statistics & probability', weight: 2 },
      { id: 'seq', name: 'Sequences & series', weight: 1 },
      { id: 'geo', name: 'Geometry & trig', weight: 1 }
    ],
    generators,
    examPresets: { quick: { n: 10, minutes: 25 }, standard: { n: 25, minutes: 60 }, full: { n: 40, minutes: 90 } }
  });
})();
