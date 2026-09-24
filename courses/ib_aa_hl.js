(function () {
  const E = window.ExamEngine;
  const simp = E.simplifyFraction, fmtPoly = E.fmtPoly;

  function nz(rng, lo, hi) { let x; do x = rng.int(lo, hi); while (x === 0); return x; }

  const generators = [
    function (rng) {
      const a = nz(rng, -4, 4), b = rng.int(-6, 6), c = rng.int(-6, 6), x = rng.int(-3, 4);
      const y = a * x * x + b * x + c;
      return { id: 'hl-fn', section: 'Functions', difficulty: 'easy', tags: ['polynomial'], type: 'short',
        prompt: `f(x)=${fmtPoly([c,b,a])}. Find f(${x}).`, answer: String(y),
        solution: `Substitute x=${x} → ${y}.` };
    },
    function (rng) {
      const a = rng.int(1, 3), b = rng.int(1, 4);
      // inverse of linear f=ax+b → (x-b)/a
      const x0 = rng.int(0, 8);
      const s = simp(x0 - b, a);
      return { id: 'hl-inv', section: 'Functions', difficulty: 'medium', tags: ['inverse'], type: 'short',
        prompt: `f(x)=${a}x+${b}. Find f⁻¹(${x0}).`, answer: s.str,
        solution: `y=${a}x+${b} ⇒ x=(y−${b})/${a}. f⁻¹(${x0})=${s.str}.` };
    },
    function (rng) {
      const n = rng.int(5, 10);
      return { id: 'hl-induct-stmt', section: 'Proof & induction', difficulty: 'medium', tags: ['induction'], type: 'tf',
        prompt: `To prove Σ_{k=1}^{n} k = n(n+1)/2 by induction, the base case n=1 checks that 1 = 1·2/2.`,
        answer: 'True', solution: 'Base case holds: 1=1.' };
    },
    function (rng) {
      const n = rng.int(3, 8);
      const sum = n * (n + 1) / 2;
      return { id: 'hl-induct-sum', section: 'Proof & induction', difficulty: 'easy', tags: ['induction'], type: 'short',
        prompt: `Assuming the formula, evaluate 1+2+…+${n}.`, answer: String(sum),
        solution: `n(n+1)/2=${n}·${n+1}/2=${sum}.` };
    },
    function (rng) {
      const a = rng.int(-3, 3), b = rng.int(-3, 3);
      // |z| for z=a+bi
      const mag2 = a * a + b * b;
      // ask |z|^2 for integer friendliness
      return { id: 'hl-complex-mod', section: 'Complex numbers', difficulty: 'easy', tags: ['modulus'], type: 'short',
        prompt: `For z = ${a} + ${b}i, compute |z|².`, answer: String(mag2),
        solution: `|z|²=a²+b²=${a*a}+${b*b}=${mag2}.` };
    },
    function (rng) {
      const a = rng.int(1, 4), b = rng.int(1, 4), c = rng.int(-3, 3), d = rng.int(-3, 3);
      // (a+bi)+(c+di)
      return { id: 'hl-complex-add', section: 'Complex numbers', difficulty: 'easy', tags: ['arithmetic'], type: 'short',
        prompt: `Real part of (${a}+${b}i)+(${c}+${d}i):`, answer: String(a + c),
        solution: `Real parts ${a}+${c}=${a+c}.` };
    },
    function (rng) {
      const a = rng.int(1, 3), b = rng.int(1, 3);
      // (a+bi)(a-bi)=a^2+b^2
      return { id: 'hl-complex-conj', section: 'Complex numbers', difficulty: 'medium', tags: ['conjugate'], type: 'short',
        prompt: `Compute (${a}+${b}i)(${a}−${b}i).`, answer: String(a*a + b*b),
        solution: `Difference of squares: a²+b²=${a*a+b*b}.` };
    },
    function (rng) {
      const n = rng.int(3, 6), coef = nz(rng, 2, 6);
      return { id: 'hl-diff', section: 'Calculus', difficulty: 'easy', tags: ['derivatives'], type: 'short',
        prompt: `d/dx(${coef}x^${n}) — coefficient of x^${n-1}:`, answer: String(coef * n),
        solution: `${coef}·${n}=${coef*n}.` };
    },
    function (rng) {
      const a = nz(rng, 2, 5);
      // chain: d/dx e^{ax} at 0 = a
      return { id: 'hl-chain-exp', section: 'Calculus', difficulty: 'medium', tags: ['chain rule'], type: 'short',
        prompt: `If f(x)=e^{${a}x}, find f'(0).`, answer: String(a),
        solution: `f'= ${a}e^{${a}x}; f'(0)=${a}.` };
    },
    function (rng) {
      const b = rng.int(2, 5);
      return { id: 'hl-int', section: 'Calculus', difficulty: 'easy', tags: ['integrals'], type: 'short',
        prompt: `∫_0^{${b}} 3x² dx =`, answer: String(b*b*b),
        solution: `[x³]_0^{${b}}=${b*b*b}.` };
    },
    function (rng) {
      const a = rng.int(1, 4), b = a + rng.int(1, 3);
      // integration by recognizing ∫ 1/x = ln|x| — ask numerical ∫_a^b 2x = b^2-a^2
      return { id: 'hl-defint', section: 'Calculus', difficulty: 'medium', tags: ['FTC'], type: 'short',
        prompt: `∫_${a}^{${b}} 2x dx =`, answer: String(b*b - a*a),
        solution: `[x²]_${a}^{${b}}=${b*b}-${a*a}=${b*b-a*a}.` };
    },
    function (rng) {
      const a1 = rng.int(-2, 5), a2 = rng.int(-2, 5), a3 = rng.int(-2, 5);
      const b1 = rng.int(-2, 5), b2 = rng.int(-2, 5), b3 = rng.int(-2, 5);
      const ans = a1*b1 + a2*b2 + a3*b3;
      return { id: 'hl-dot3', section: 'Vectors', difficulty: 'easy', tags: ['dot'], type: 'short',
        prompt: `〈${a1},${a2},${a3}〉·〈${b1},${b2},${b3}〉 =`, answer: String(ans),
        solution: `${a1}·${b1}+${a2}·${b2}+${a3}·${b3}=${ans}.` };
    },
    function (rng) {
      const pick = rng.pick([[2,3,6],[3,4,12],[4,3,12],[5,12,60]]);
      // magnitude ask for i component of unit? simpler: |〈a,b,0〉| if nice
      const trip = rng.pick([[3,4,5],[6,8,10],[5,12,13]]);
      return { id: 'hl-mag', section: 'Vectors', difficulty: 'easy', tags: ['magnitude'], type: 'short',
        prompt: `|〈${trip[0]},${trip[1]},0〉| =`, answer: String(trip[2]),
        solution: `√(${trip[0]}²+${trip[1]}²)=${trip[2]}.` };
    },
    function (rng) {
      const a = rng.int(1, 3), b = rng.int(1, 3), c = rng.int(1, 3);
      // cross i-component of 〈a,0,0〉×〈0,b,c〉 = 0*c - 0*b = 0; j-component...
      // 〈1,0,0〉×〈0,1,0〉 = 〈0,0,1〉 — ask k component of 〈a,0,0〉×〈0,b,0〉 = a b
      return { id: 'hl-cross', section: 'Vectors', difficulty: 'medium', tags: ['cross'], type: 'short',
        prompt: `k-component of 〈${a},0,0〉 × 〈0,${b},0〉:`, answer: String(a * b),
        solution: `i×j=k ⇒ (${a})(${b})k has k-component ${a*b}.` };
    },
    function (rng) {
      const n = rng.int(4, 9), r = rng.int(1, 3);
      let num = 1, den = 1;
      for (let i = 0; i < r; i++) { num *= (n - i); den *= (i + 1); }
      const s = simp(num, den);
      return { id: 'hl-binom', section: 'Combinatorics & series', difficulty: 'medium', tags: ['binomial'], type: 'short',
        prompt: `C(${n},${r}) =`, answer: s.str, solution: `${s.str}.` };
    },
    function (rng) {
      const a = rng.int(1, 3), r = rng.pick([2, 3]), n = rng.int(3, 5);
      const sn = a * (Math.pow(r, n) - 1) / (r - 1);
      return { id: 'hl-geo', section: 'Combinatorics & series', difficulty: 'medium', tags: ['geometric'], type: 'short',
        prompt: `S_${n} for geometric series a=${a}, ratio ${r}:`, answer: String(sn),
        solution: `a(r^n−1)/(r−1)=${sn}.` };
    },
    function (rng) {
      const p = rng.pick([2, 3, 4]);
      return { id: 'hl-pseries', section: 'Combinatorics & series', difficulty: 'easy', tags: ['series'], type: 'tf',
        prompt: `Σ 1/n^${p} converges.`, answer: 'True', solution: `p=${p}>1.` };
    },
    function (rng) {
      const data = [];
      for (let i = 0; i < 4; i++) data.push(rng.int(1, 12));
      const sum = data.reduce((s, x) => s + x, 0);
      const mean = simp(sum, 4);
      return { id: 'hl-mean', section: 'Statistics', difficulty: 'easy', tags: ['mean'], type: 'short',
        prompt: `Mean of ${data.join(', ')}:`, answer: mean.str, solution: `${sum}/4=${mean.str}.` };
    },
    function (rng) {
      const n = rng.int(8, 15), k = rng.int(2, 5);
      const s = simp(k, n);
      return { id: 'hl-prob', section: 'Statistics', difficulty: 'easy', tags: ['probability'], type: 'short',
        prompt: `Bag: ${k} red, ${n - k} blue. P(red)=`, answer: s.str, solution: `${s.str}.` };
    },
    function (rng) {
      const items = [
        { q: 'Every differentiable function is continuous.', a: 'True', s: 'Standard.' },
        { q: 'The binomial theorem applies to (x+y)^n for n∈ℕ.', a: 'True', s: 'Yes.' },
        { q: 'Arg(z₁z₂)=Arg(z₁)+Arg(z₂) always, with no branch care.', a: 'False', s: 'True up to multiples of 2π / branch cuts.' },
        { q: 'A l’Hôpital 0/0 form may be resolved by differentiating numerator and denominator.', a: 'True', s: 'Under hypotheses.' }
      ];
      const t = rng.pick(items);
      return { id: 'hl-tf', section: 'Functions', difficulty: 'medium', tags: ['theory'], type: 'tf', prompt: t.q, answer: t.a, solution: t.s };
    },
    function (rng) {
      const m = nz(rng, -4, 4), c = rng.int(-5, 5), x1 = rng.int(-3, 3);
      const y1 = m * x1 + c;
      return { id: 'hl-line', section: 'Functions', difficulty: 'easy', tags: ['lines'], type: 'short',
        prompt: `Line y=${m}x+${c} passes through (${x1},?). Find the y-coordinate.`, answer: String(y1),
        solution: `y=${m}(${x1})+${c}=${y1}.` };
    },
    function (rng) {
      const a = rng.int(2, 5);
      return { id: 'hl-maclaurin', section: 'Calculus', difficulty: 'hard', tags: ['series'], type: 'short',
        prompt: `The Maclaurin series for e^x begins 1 + x + x²/2! + … Coefficient of x in the expansion of e^{${a}x} is:`,
        answer: String(a), solution: `e^{ax}=1+ax+… so coeff of x is ${a}.` };
    },
    function (rng) {
      const A = rng.int(2, 6), B = rng.int(1, 3);
      const ans = B === 1 ? '2π' : B === 2 ? 'π' : `2π/${B}`;
      return { id: 'hl-period', section: 'Functions', difficulty: 'medium', tags: ['trig'], type: 'short',
        prompt: `Period of y=${A} cos(${B}x) (in terms of π):`, answer: ans,
        solution: `2π/|B|=${ans}.` };
    },
    function (rng) {
      const r = rng.int(2, 6);
      return { id: 'hl-disc', section: 'Proof & induction', difficulty: 'medium', tags: ['discriminant'], type: 'short',
        prompt: `Discriminant of x² − ${2*r}x + ${r*r} = 0:`, answer: '0',
        solution: `b²−4ac=${(2*r)**2}-4(${r*r})=0 (double root ${r}).` };
    }
  ];

  E.registerCourse({
    id: 'ib_aa_hl',
    title: 'IB AA HL',
    subtitle: 'Analysis & Approaches Higher Level',
    textbook: 'Oxford IB Mathematics AA HL (Green Book)',
    level: 'IB DP HL',
    description: 'IB AA HL extras beyond SL: denser calculus, complex numbers, induction, vectors in 3D, series — Oxford Green Book spirit.',
    sections: [
      { id: 'fn', name: 'Functions', weight: 2 },
      { id: 'proof', name: 'Proof & induction', weight: 2 },
      { id: 'cplx', name: 'Complex numbers', weight: 2 },
      { id: 'calc', name: 'Calculus', weight: 3 },
      { id: 'vec', name: 'Vectors', weight: 2 },
      { id: 'ser', name: 'Combinatorics & series', weight: 2 },
      { id: 'stat', name: 'Statistics', weight: 1 }
    ],
    generators,
    examPresets: { quick: { n: 12, minutes: 30 }, standard: { n: 25, minutes: 75 }, full: { n: 40, minutes: 120 } }
  });
})();
