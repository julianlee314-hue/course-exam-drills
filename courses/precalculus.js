(function () {
  const E = window.ExamEngine;
  const simp = E.simplifyFraction, fmtPoly = E.fmtPoly, gcd = E.gcd;

  function nz(rng, lo, hi) { let x; do x = rng.int(lo, hi); while (x === 0); return x; }

  const generators = [
    function (rng) {
      const a = nz(rng, -4, 4), h = rng.int(-5, 5), k = rng.int(-5, 5), x = rng.int(-3, 6);
      const y = a * (x - h) * (x - h) + k;
      return {
        id: 'pc-vertex', section: 'Functions & graphs', difficulty: 'medium', tags: ['parabola'],
        type: 'short',
        prompt: `For f(x) = ${a}(x ${h >= 0 ? '− ' + h : '+ ' + (-h)})² ${k >= 0 ? '+ ' + k : '− ' + Math.abs(k)}, evaluate f(${x}).`,
        answer: String(y),
        solution: `f(${x}) = ${a}(${x}−(${h}))² + ${k} = ${a}(${x - h})² + ${k} = ${y}.`
      };
    },
    function (rng) {
      const a = nz(rng, 1, 3), b = rng.int(-6, 6), c = rng.int(-8, 8);
      // vertex x = -b/(2a)
      const num = -b, den = 2 * a;
      const s = simp(num, den);
      return {
        id: 'pc-vertex-x', section: 'Functions & graphs', difficulty: 'medium', tags: ['vertex'],
        type: 'short',
        prompt: `Find the x-coordinate of the vertex of y = ${fmtPoly([c, b, a])}.`,
        answer: s.str,
        solution: `x = −b/(2a) = ${-b}/${2 * a} = ${s.str}.`
      };
    },
    function (rng) {
      const base = rng.pick([2, 3, 10]), k = rng.int(1, 4);
      const arg = Math.pow(base, k);
      return {
        id: 'pc-log-eval', section: 'Exp & log', difficulty: 'easy', tags: ['logs'],
        type: 'short',
        prompt: `Evaluate log_${base}(${arg}).`,
        answer: String(k),
        solution: `${base}^${k} = ${arg}, so log_${base}(${arg}) = ${k}.`
      };
    },
    function (rng) {
      // change: log_b(a^c)=c log_b a — ask expand
      const c = rng.int(2, 5);
      return {
        id: 'pc-log-power', section: 'Exp & log', difficulty: 'easy', tags: ['log laws'],
        type: 'mc',
        prompt: `Which expression equals log(x^${c})? (common log)`,
        options: [`${c} log x`, `log x / ${c}`, `log(${c}x)`, `(log x)^${c}`],
        answer: 'A',
        solution: `Power rule: log(x^c) = c log x.`
      };
    },
    function (rng) {
      const a = rng.int(2, 6), b = rng.int(2, 6);
      // solve a^x = a^b → x=b (same base)
      return {
        id: 'pc-exp-eq', section: 'Exp & log', difficulty: 'easy', tags: ['exponential equations'],
        type: 'short',
        prompt: `Solve for x: ${a}^x = ${a}^${b}`,
        answer: String(b),
        solution: `Same bases ⇒ exponents equal: x = ${b}.`
      };
    },
    function (rng) {
      const n = rng.int(2, 6), theta = rng.pick([0, 30, 45, 60, 90, 180]);
      // deg to rad: theta * pi/180
      const s = simp(theta, 180);
      const ans = theta === 0 ? '0' : s.n === 1 && s.d === 1 ? 'π' : s.n === 1 ? `π/${s.d}` : s.d === 1 ? `${s.n}π` : `${s.n}π/${s.d}`;
      return {
        id: 'pc-deg-rad', section: 'Trigonometry', difficulty: 'easy', tags: ['radians'],
        type: 'short',
        prompt: `Convert ${theta}° to radians. Write in terms of π (e.g. π/3 or 2π/3 or 0).`,
        answer: ans,
        solution: `${theta}° × π/180 = ${ans}.`
      };
    },
    function (rng) {
      const table = [
        { t: 'π/6', sin: '1/2', cos: '√3/2', tan: '1/√3|√3/3' },
        { t: 'π/4', sin: '√2/2', cos: '√2/2', tan: '1' },
        { t: 'π/3', sin: '√3/2', cos: '1/2', tan: '√3' },
        { t: 'π/2', sin: '1', cos: '0', tan: 'undefined|und|does not exist|dne' }
      ];
      const row = rng.pick(table);
      const fn = rng.pick(['sin', 'cos', 'tan']);
      return {
        id: 'pc-unit', section: 'Trigonometry', difficulty: 'medium', tags: ['unit circle'],
        type: 'short',
        prompt: `Exact value: ${fn}(${row.t})`,
        answer: row[fn],
        solution: `Unit-circle value: ${fn}(${row.t}) = ${row[fn].split('|')[0]}.`
      };
    },
    function (rng) {
      // amplitude / period of a sin(bx)
      const A = rng.int(2, 6), B = rng.int(1, 4);
      const period = simp(2, B); // 2π/B → we'll ask numerical coefficient: period = 2π/B
      const ans = B === 1 ? '2π' : B === 2 ? 'π' : `2π/${B}`;
      return {
        id: 'pc-amp-per', section: 'Trigonometry', difficulty: 'medium', tags: ['sinusoids'],
        type: 'short',
        prompt: `For y = ${A} sin(${B}x), state the period (in terms of π, e.g. 2π/3).`,
        answer: ans,
        solution: `Period = 2π/|B| = 2π/${B} = ${ans}. (Amplitude is ${A}.)`
      };
    },
    function (rng) {
      const A = rng.int(2, 5);
      return {
        id: 'pc-amp', section: 'Trigonometry', difficulty: 'easy', tags: ['amplitude'],
        type: 'short',
        prompt: `What is the amplitude of y = −${A} cos(x)?`,
        answer: String(A),
        solution: `Amplitude = |−${A}| = ${A}.`
      };
    },
    function (rng) {
      // binomial expand (x+a)^2
      const a = nz(rng, -6, 6);
      const ans = fmtPoly([a * a, 2 * a, 1]);
      return {
        id: 'pc-bin2', section: 'Polynomials', difficulty: 'easy', tags: ['binomial'],
        type: 'short',
        prompt: `Expand: (x ${a >= 0 ? '+ ' + a : '− ' + Math.abs(a)})²`,
        answer: ans,
        solution: `(x+a)² = x² + 2ax + a² = ${ans}.`
      };
    },
    function (rng) {
      const a = nz(rng, 1, 4), roots = [rng.int(-4, 3), rng.int(-3, 4)];
      while (roots[1] === roots[0]) roots[1] = rng.int(-4, 4);
      const sum = roots[0] + roots[1], prod = roots[0] * roots[1];
      // a(x-r)(x-s) = ax^2 - a(sum)x + a prod
      const poly = fmtPoly([a * prod, -a * sum, a]);
      const sorted = roots.slice().sort((x, y) => x - y);
      return {
        id: 'pc-zeros', section: 'Polynomials', difficulty: 'medium', tags: ['zeros'],
        type: 'short',
        prompt: `Find the zeros of f(x) = ${poly}. List ascending, comma-separated.`,
        answer: sorted.join(','),
        solution: `Factor as ${a}(x−(${roots[0]}))(x−(${roots[1]})). Zeros: ${sorted.join(', ')}.`
      };
    },
    function (rng) {
      // rational inequality sign chart lite: (x-a)/(x-b)>0 critical points
      const a = rng.int(-4, 4), b = nz(rng, -5, 5);
      if (a === b) return generators[11](rng);
      return {
        id: 'pc-crit', section: 'Polynomials', difficulty: 'hard', tags: ['rational'],
        type: 'short',
        prompt: `For (x ${a >= 0 ? '− ' + a : '+ ' + (-a)})/(x ${b >= 0 ? '− ' + b : '+ ' + (-b)}) > 0, list the critical values (where expression is 0 or undefined), ascending, comma-separated.`,
        answer: [a, b].sort((x, y) => x - y).join(','),
        solution: `Zero at x=${a}; undefined at x=${b}. Critical values: ${[a, b].sort((x, y) => x - y).join(', ')}.`
      };
    },
    function (rng) {
      // sequence arithmetic sum
      const a1 = rng.int(-5, 10), d = nz(rng, -4, 6), n = rng.int(5, 12);
      const an = a1 + (n - 1) * d;
      const sum = (n * (a1 + an)) / 2;
      return {
        id: 'pc-arith-sum', section: 'Sequences & series', difficulty: 'medium', tags: ['arithmetic'],
        type: 'short',
        prompt: `Arithmetic sequence: a₁=${a1}, d=${d}. Find S_${n} (sum of first ${n} terms).`,
        answer: String(sum),
        solution: `a_${n}=${an}. S_n = n(a₁+a_n)/2 = ${n}(${a1}+${an})/2 = ${sum}.`
      };
    },
    function (rng) {
      const a1 = rng.int(1, 5), r = rng.pick([2, 3, -2]), n = rng.int(3, 5);
      let an = a1;
      for (let i = 1; i < n; i++) an *= r;
      return {
        id: 'pc-geo-term', section: 'Sequences & series', difficulty: 'medium', tags: ['geometric'],
        type: 'short',
        prompt: `Geometric sequence: a₁=${a1}, ratio r=${r}. Find a_${n}.`,
        answer: String(an),
        solution: `a_n = a₁ r^{n−1} = ${a1}·(${r})^${n - 1} = ${an}.`
      };
    },
    function (rng) {
      // conic: circle center radius
      const h = rng.int(-4, 4), k = rng.int(-4, 4), r = rng.int(2, 8);
      return {
        id: 'pc-circle', section: 'Analytic geometry', difficulty: 'easy', tags: ['circle'],
        type: 'short',
        prompt: `Circle (x ${h >= 0 ? '− ' + h : '+ ' + (-h)})² + (y ${k >= 0 ? '− ' + k : '+ ' + (-k)})² = ${r * r}. What is the radius?`,
        answer: String(r),
        solution: `Right side is r² = ${r * r} ⇒ r = ${r}. Center (${h},${k}).`
      };
    },
    function (rng) {
      const statements = [
        { q: 'The range of f(x)=e^x is all real numbers.', a: 'False', sol: 'Range is (0,∞).' },
        { q: 'sin²θ + cos²θ = 1 for all real θ.', a: 'True', sol: 'Pythagorean identity.' },
        { q: 'A function must pass the horizontal line test to be one-to-one.', a: 'True', sol: 'HLT characterizes injectivity for graphs of functions.' },
        { q: 'log(a/b) = log a / log b for positive a,b.', a: 'False', sol: 'Correct: log(a/b)=log a − log b.' }
      ];
      const t = rng.pick(statements);
      return { id: 'pc-tf', section: 'Functions & graphs', difficulty: 'easy', tags: ['definitions'], type: 'tf', prompt: t.q, answer: t.a, solution: t.sol };
    }
  ];

  // repair critical generator self-ref
  generators[11] = function (rng) {
    let a = rng.int(-4, 4), b = nz(rng, -5, 5);
    while (a === b) b = nz(rng, -5, 5);
    return {
      id: 'pc-crit', section: 'Polynomials', difficulty: 'hard', tags: ['rational'],
      type: 'short',
      prompt: `For (x ${a >= 0 ? '− ' + a : '+ ' + (-a)})/(x ${b >= 0 ? '− ' + b : '+ ' + (-b)}) > 0, list the critical values (where expression is 0 or undefined), ascending, comma-separated.`,
      answer: [a, b].sort((x, y) => x - y).join(','),
      solution: `Zero at x=${a}; undefined at x=${b}. Critical values: ${[a, b].sort((x, y) => x - y).join(', ')}.`
    };
  };

  E.registerCourse({
    id: 'precalculus',
    title: 'Precalculus',
    subtitle: 'Functions, trig, exp/log, analytic geometry',
    textbook: 'Stewart/Redlin/Watson Precalculus 8e',
    level: 'Precalculus',
    description: 'Heavier precalc spine: polynomial/rational/exp/log/trig functions, sequences, and analytic geometry.',
    sections: [
      { id: 'fn', name: 'Functions & graphs', weight: 2 },
      { id: 'exp', name: 'Exp & log', weight: 2 },
      { id: 'trig', name: 'Trigonometry', weight: 3 },
      { id: 'poly', name: 'Polynomials', weight: 2 },
      { id: 'seq', name: 'Sequences & series', weight: 1 },
      { id: 'ag', name: 'Analytic geometry', weight: 1 }
    ],
    generators,
    examPresets: { quick: { n: 10, minutes: 25 }, standard: { n: 25, minutes: 60 }, full: { n: 40, minutes: 90 } }
  });
})();
