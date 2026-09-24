(function () {
  const E = window.ExamEngine;
  const simp = E.simplifyFraction, fmtPoly = E.fmtPoly, gcd = E.gcd;

  function nz(rng, lo, hi) { let x; do x = rng.int(lo, hi); while (x === 0); return x; }

  const generators = [
    // 1 limit of polynomial
    function (rng) {
      const a = rng.int(-3, 4), b = rng.int(-5, 5), c = rng.int(-5, 5), x0 = rng.int(-3, 4);
      const val = a * x0 * x0 + b * x0 + c;
      return {
        id: 'calc-lim-poly', section: 'Limits', difficulty: 'easy', tags: ['limits'],
        type: 'short',
        prompt: `Evaluate lim_{x→${x0}} (${fmtPoly([c, b, a])}).`,
        answer: String(val),
        solution: `Polynomials are continuous: plug in x=${x0} → ${val}.`
      };
    },
    // 2 limit difference of squares / cancel
    function (rng) {
      const a = rng.int(1, 6);
      // lim x→a (x^2-a^2)/(x-a) = 2a
      return {
        id: 'calc-lim-cancel', section: 'Limits', difficulty: 'medium', tags: ['limits'],
        type: 'short',
        prompt: `Evaluate lim_{x→${a}} (x² − ${a * a})/(x − ${a}).`,
        answer: String(2 * a),
        solution: `Factor: (x−${a})(x+${a})/(x−${a}) → x+${a} → ${a}+${a}=${2 * a}.`
      };
    },
    // 3 derivative power rule
    function (rng) {
      const n = rng.int(2, 7), coef = nz(rng, 2, 9);
      const ansCoef = coef * n, ansPow = n - 1;
      const ans = ansPow === 1 ? `${ansCoef}x` : ansPow === 0 ? String(ansCoef) : `${ansCoef}x^${ansPow}`;
      return {
        id: 'calc-power', section: 'Derivatives', difficulty: 'easy', tags: ['power rule'],
        type: 'short',
        prompt: `Differentiate: f(x) = ${coef}x^${n}. Write answer like ${ansCoef}x^${ansPow} (use ^ for powers).`,
        answer: ans,
        solution: `Power rule: ${coef}·${n}x^${n - 1} = ${ans}.`
      };
    },
    // 4 product rule numerically at a point
    function (rng) {
      const a = rng.int(1, 4);
      // u=x^2, v=x+a at x=2: u'=2x, v'=1
      const x0 = 2;
      const u = x0 * x0, up = 2 * x0, v = x0 + a, vp = 1;
      const ans = up * v + u * vp;
      return {
        id: 'calc-product', section: 'Derivatives', difficulty: 'medium', tags: ['product rule'],
        type: 'short',
        prompt: `Let f(x)=x²(x+${a}). Find f'(${x0}).`,
        answer: String(ans),
        solution: `u=x², v=x+${a}. f'=u'v+uv' = 2x(x+${a})+x². At ${x0}: 2(${x0})(${x0}+${a})+(${x0})² = ${ans}.`
      };
    },
    // 5 chain rule
    function (rng) {
      const a = nz(rng, 2, 5), n = rng.int(2, 4);
      // d/dx (a x + 1)^n at x=0 → n(1)^{n-1} * a = n a
      const ans = n * a;
      return {
        id: 'calc-chain', section: 'Derivatives', difficulty: 'medium', tags: ['chain rule'],
        type: 'short',
        prompt: `If f(x) = (${a}x + 1)^${n}, find f'(0).`,
        answer: String(ans),
        solution: `f' = ${n}(${a}x+1)^${n - 1}·${a}. At 0: ${n}(1)^${n - 1}·${a} = ${ans}.`
      };
    },
    // 6 tangent slope
    function (rng) {
      const a = rng.int(1, 4), x0 = rng.int(-2, 3);
      // f=x^3 + a x , f'=3x^2+a
      const slope = 3 * x0 * x0 + a;
      return {
        id: 'calc-tangent', section: 'Applications of derivatives', difficulty: 'medium', tags: ['tangent'],
        type: 'short',
        prompt: `For f(x)=x³ + ${a}x, find the slope of the tangent line at x=${x0}.`,
        answer: String(slope),
        solution: `f'(x)=3x²+${a}. f'(${x0})=${slope}.`
      };
    },
    // 7 critical points of quadratic
    function (rng) {
      const a = rng.pick([1, 2, -1]), b = nz(rng, -8, 8);
      // f=ax^2+bx → f'=2ax+b=0 → x=-b/(2a)
      const s = simp(-b, 2 * a);
      return {
        id: 'calc-crit', section: 'Applications of derivatives', difficulty: 'medium', tags: ['critical points'],
        type: 'short',
        prompt: `Find the critical point x of f(x)=${fmtPoly([0, b, a])} (where f'=0).`,
        answer: s.str,
        solution: `f'= ${2 * a}x + ${b} = 0 ⇒ x = ${s.str}.`
      };
    },
    // 8 related rates lite / linear approx
    function (rng) {
      const x0 = rng.int(4, 9), dx = rng.pick([0.1, 0.2, 0.5]);
      // f=sqrt(x) approx — actually use f=x^2 for exact computable
      const f = (x) => x * x;
      const approx = f(x0) + 2 * x0 * dx;
      // store with one decimal if needed
      const ans = Number.isInteger(approx) ? String(approx) : String(approx);
      return {
        id: 'calc-linapprox', section: 'Applications of derivatives', difficulty: 'hard', tags: ['linearization'],
        type: 'short',
        prompt: `Use the linear approximation of f(x)=x² at x=${x0} to estimate f(${x0}+${dx}).`,
        answer: ans,
        solution: `f'=2x. L(x)=f(${x0})+f'(${x0})(x−${x0}) = ${f(x0)}+${2 * x0}(x−${x0}). L(${x0}+${dx})=${approx}.`
      };
    },
    // 9 indefinite integral power
    function (rng) {
      const n = rng.int(1, 5), coef = nz(rng, 2, 8);
      // ∫ coef x^n = coef/(n+1) x^{n+1}
      const s = simp(coef, n + 1);
      const ans = s.d === 1 ? `${s.n}x^${n + 1}` : `(${s.str})x^${n + 1}`;
      return {
        id: 'calc-int-power', section: 'Integrals', difficulty: 'easy', tags: ['antiderivative'],
        type: 'short',
        prompt: `Find ∫ ${coef}x^${n} dx (omit +C). Write like (${s.str})x^${n + 1} if fractional.`,
        answer: ans + '|' + `${s.str}x^${n + 1}`,
        solution: `∫ x^n dx = x^{n+1}/(n+1). Result: (${coef}/${n + 1})x^${n + 1} = ${ans} (+C).`
      };
    },
    // 10 definite integral polynomial
    function (rng) {
      const a = rng.int(0, 2), b = a + rng.int(1, 4);
      // ∫_a^b 2x dx = x^2 from a to b
      const ans = b * b - a * a;
      return {
        id: 'calc-defint', section: 'Integrals', difficulty: 'easy', tags: ['definite integral'],
        type: 'short',
        prompt: `Evaluate ∫_${a}^${b} 2x dx.`,
        answer: String(ans),
        solution: `Antiderivative x². ${b}² − ${a}² = ${b * b} − ${a * a} = ${ans}.`
      };
    },
    // 11 FTC average value
    function (rng) {
      const a = 0, b = rng.int(2, 5);
      // f=3x^2 on [0,b]: avg = 1/b ∫ 3x^2 = 1/b [x^3]_0^b = b^2
      const ans = b * b;
      return {
        id: 'calc-avg', section: 'Integrals', difficulty: 'medium', tags: ['average value'],
        type: 'short',
        prompt: `Find the average value of f(x)=3x² on [0,${b}].`,
        answer: String(ans),
        solution: `(1/${b})∫_0^{${b}} 3x² dx = (1/${b})[x³]_0^{${b}} = ${b}²/${b} wait: [x³]=${b * b * b}, /${b}=${b * b}.`
      };
    },
    // 12 area between curves simple
    function (rng) {
      const c = rng.int(2, 5);
      // area between y=c and y=0 on [0,2] = 2c
      return {
        id: 'calc-area', section: 'Applications of integrals', difficulty: 'easy', tags: ['area'],
        type: 'short',
        prompt: `Find the area of the region bounded by y=${c}, y=0, x=0, and x=2.`,
        answer: String(2 * c),
        solution: `Rectangle width 2 height ${c}: area = ${2 * c}.`
      };
    },
    // 13 volume disk
    function (rng) {
      const r = rng.int(2, 5), h = rng.int(2, 6);
      // cylinder volume π r^2 h — ask coefficient of π
      const coef = r * r * h;
      return {
        id: 'calc-disk', section: 'Applications of integrals', difficulty: 'medium', tags: ['volume'],
        type: 'short',
        prompt: `A solid is a cylinder of radius ${r} and height ${h}. Its volume is kπ. Find k.`,
        answer: String(coef),
        solution: `V = πr²h = π(${r})²(${h}) = ${coef}π ⇒ k=${coef}.`
      };
    },
    // 14 series: geometric sum finite
    function (rng) {
      const a = rng.int(1, 4), r = 2, n = rng.int(3, 5);
      // S = a(r^n-1)/(r-1)
      const sn = a * (Math.pow(r, n) - 1) / (r - 1);
      return {
        id: 'calc-geo-sum', section: 'Series', difficulty: 'medium', tags: ['geometric series'],
        type: 'short',
        prompt: `Sum the finite geometric series: ${a} + ${a * r} + … (${n} terms, ratio ${r}).`,
        answer: String(sn),
        solution: `S_n = a(r^n−1)/(r−1) = ${a}(${Math.pow(r, n)}−1)/1 = ${sn}.`
      };
    },
    // 15 convergence of geometric |r|<1
    function (rng) {
      const cases = [
        { r: '1/2', conv: 'True' },
        { r: '2', conv: 'False' },
        { r: '-1/3', conv: 'True' },
        { r: '-1', conv: 'False' }
      ];
      const t = rng.pick(cases);
      return {
        id: 'calc-geo-conv', section: 'Series', difficulty: 'easy', tags: ['convergence'],
        type: 'tf',
        prompt: `The infinite geometric series with first term 1 and ratio r=${t.r} converges.`,
        answer: t.conv,
        solution: `Converges iff |r|<1. Here |r|=${t.r.replace('-', '')} → ${t.conv}.`
      };
    },
    // 16 partial derivatives
    function (rng) {
      const a = rng.int(1, 5), b = rng.int(1, 5);
      // f=ax^2 y + b y^3 ; f_x = 2a x y
      const x0 = rng.int(1, 3), y0 = rng.int(1, 3);
      const ans = 2 * a * x0 * y0;
      return {
        id: 'calc-fx', section: 'Multivariable', difficulty: 'medium', tags: ['partial derivatives'],
        type: 'short',
        prompt: `f(x,y)=${a}x²y + ${b}y³. Find f_x(${x0},${y0}).`,
        answer: String(ans),
        solution: `f_x = ${2 * a}xy. At (${x0},${y0}): ${2 * a}(${x0})(${y0})=${ans}.`
      };
    },
    // 17 gradient components
    function (rng) {
      const a = rng.int(2, 6);
      // f=a x + y ; grad = <a,1>
      return {
        id: 'calc-grad', section: 'Multivariable', difficulty: 'easy', tags: ['gradient'],
        type: 'short',
        prompt: `For f(x,y)=${a}x + y, the gradient is 〈p, q〉. Find p+q.`,
        answer: String(a + 1),
        solution: `∇f = 〈${a}, 1〉. p+q=${a}+1=${a + 1}.`
      };
    },
    // 18 double integral rectangle
    function (rng) {
      const A = rng.int(1, 3), B = rng.int(1, 3);
      // ∫_0^A ∫_0^B 1 dy dx = A B
      return {
        id: 'calc-dint', section: 'Multivariable', difficulty: 'easy', tags: ['double integral'],
        type: 'short',
        prompt: `Evaluate ∫_0^{${A}} ∫_0^{${B}} 1 dy dx.`,
        answer: String(A * B),
        solution: `Inner ∫_0^{${B}} 1 dy = ${B}. Outer ∫_0^{${A}} ${B} dx = ${A * B}.`
      };
    },
    // 19 vector length
    function (rng) {
      const triples = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [1, 2, Math.sqrt(5)]];
      const pick = rng.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]]);
      return {
        id: 'calc-vec-len', section: 'Vectors', difficulty: 'easy', tags: ['magnitude'],
        type: 'short',
        prompt: `Find the magnitude of vector 〈${pick[0]}, ${pick[1]}〉.`,
        answer: String(pick[2]),
        solution: `‖v‖=√(${pick[0]}²+${pick[1]}²)=√${pick[0] * pick[0] + pick[1] * pick[1]}=${pick[2]}.`
      };
    },
    // 20 dot product
    function (rng) {
      const a1 = rng.int(-4, 5), a2 = rng.int(-4, 5), b1 = rng.int(-4, 5), b2 = rng.int(-4, 5);
      const ans = a1 * b1 + a2 * b2;
      return {
        id: 'calc-dot', section: 'Vectors', difficulty: 'easy', tags: ['dot product'],
        type: 'short',
        prompt: `Compute 〈${a1},${a2}〉 · 〈${b1},${b2}〉.`,
        answer: String(ans),
        solution: `${a1}·${b1} + ${a2}·${b2} = ${ans}.`
      };
    },
    // 21 L'Hôpital structure TF
    function (rng) {
      const items = [
        { q: 'd/dx [ln x] = 1/x for x>0.', a: 'True', s: 'Standard derivative.' },
        { q: '∫ e^x dx = e^x + C.', a: 'True', s: 'Yes.' },
        { q: 'If f is differentiable at c, then f is continuous at c.', a: 'True', s: 'Differentiability ⇒ continuity.' },
        { q: 'Every continuous function on (0,1) attains a maximum on (0,1).', a: 'False', s: 'Need closed bounded interval (Extreme Value Theorem).' }
      ];
      const t = rng.pick(items);
      return { id: 'calc-tf', section: 'Limits', difficulty: 'easy', tags: ['theory'], type: 'tf', prompt: t.q, answer: t.a, solution: t.s };
    },
    // 22 implicit differentiation snapshot
    function (rng) {
      const a = rng.int(1, 5);
      // x^2 + y^2 = a^2 ; at (0,a): 2x+2y y'=0 → y'= -x/y = 0
      return {
        id: 'calc-impl', section: 'Derivatives', difficulty: 'hard', tags: ['implicit'],
        type: 'short',
        prompt: `For x² + y² = ${a * a}, find dy/dx at the point (0,${a}).`,
        answer: '0',
        solution: `2x + 2y y' = 0 ⇒ y' = −x/y. At (0,${a}): 0/${a}=0.`
      };
    },
    // 23 IVP / antideriv with condition
    function (rng) {
      const C = rng.int(-5, 5), x0 = 0, y0 = C; // f'=2x, f(0)=C → f=x^2+C; ask f(3)
      const ans = 9 + C;
      return {
        id: 'calc-ivp', section: 'Integrals', difficulty: 'medium', tags: ['IVP'],
        type: 'short',
        prompt: `Solve f'(x)=2x with f(0)=${C}. Then find f(3).`,
        answer: String(ans),
        solution: `f(x)=x²+C with C=${C}. f(3)=9+${C}=${ans}.`
      };
    },
    // 24 cross product k-component in 2D sense: a1b2-a2b1
    function (rng) {
      const a1 = rng.int(-3, 4), a2 = rng.int(-3, 4), b1 = rng.int(-3, 4), b2 = rng.int(-3, 4);
      const ans = a1 * b2 - a2 * b1;
      return {
        id: 'calc-cross2', section: 'Vectors', difficulty: 'medium', tags: ['cross product'],
        type: 'short',
        prompt: `For u=〈${a1},${a2},0〉 and v=〈${b1},${b2},0〉, the k-component of u×v is:`,
        answer: String(ans),
        solution: `k-component = a1 b2 − a2 b1 = ${a1}·${b2} − ${a2}·${b1} = ${ans}.`
      };
    }
  ];

  E.registerCourse({
    id: 'calculus',
    title: 'Calculus 1–3',
    subtitle: 'Limits through vector calculus',
    textbook: 'Stewart Calculus Early Transcendentals 9e',
    level: 'University',
    description: 'Single-variable limits/derivatives/integrals, series, and multivariable/vector calculus drills aligned to Stewart ET 9e.',
    sections: [
      { id: 'lim', name: 'Limits', weight: 2 },
      { id: 'der', name: 'Derivatives', weight: 3 },
      { id: 'appd', name: 'Applications of derivatives', weight: 2 },
      { id: 'int', name: 'Integrals', weight: 3 },
      { id: 'appi', name: 'Applications of integrals', weight: 1 },
      { id: 'ser', name: 'Series', weight: 2 },
      { id: 'mv', name: 'Multivariable', weight: 2 },
      { id: 'vec', name: 'Vectors', weight: 2 }
    ],
    generators,
    examPresets: { quick: { n: 12, minutes: 30 }, standard: { n: 25, minutes: 75 }, full: { n: 40, minutes: 120 } }
  });
})();
