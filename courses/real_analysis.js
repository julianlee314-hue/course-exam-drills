(function () {
  const E = window.ExamEngine;
  const simp = E.simplifyFraction;

  const generators = [
    function (rng) {
      const items = [
        { q: 'Every convergent sequence of real numbers is bounded.', a: 'True', s: 'Standard theorem.' },
        { q: 'Every bounded sequence of real numbers converges.', a: 'False', s: 'Counterexample: (−1)^n.' },
        { q: 'If (a_n)→L and (b_n)→M then (a_n+b_n)→L+M.', a: 'True', s: 'Algebraic limit theorem.' },
        { q: 'A function continuous on (0,1) must be bounded on (0,1).', a: 'False', s: 'e.g. f(x)=1/x on (0,1).' },
        { q: 'The intersection of two open sets in R is open.', a: 'True', s: 'Topology of R.' },
        { q: 'The union of infinitely many closed sets in R is always closed.', a: 'False', s: '⋃[1/n,1] = (0,1] not closed.' }
      ];
      const t = rng.pick(items);
      return { id: 'ra-tf', section: 'Definitions & theory', difficulty: 'medium', tags: ['true/false'], type: 'tf', prompt: t.q, answer: t.a, solution: t.s };
    },
    function (rng) {
      const L = rng.int(-3, 5), N = rng.int(5, 20);
      // sequence constant eventually
      return {
        id: 'ra-seq-const', section: 'Sequences', difficulty: 'easy', tags: ['limits'],
        type: 'short',
        prompt: `The sequence a_n = ${L} for all n has limit:`,
        answer: String(L),
        solution: `Constant sequence converges to ${L}.`
      };
    },
    function (rng) {
      const c = rng.int(2, 9);
      // lim 1/n = 0 — ask for limit of c/n
      return {
        id: 'ra-one-over-n', section: 'Sequences', difficulty: 'easy', tags: ['limits'],
        type: 'short',
        prompt: `Evaluate lim_{n→∞} ${c}/n.`,
        answer: '0',
        solution: `${c}/n → 0.`
      };
    },
    function (rng) {
      const a = rng.int(2, 5);
      return {
        id: 'ra-geo-seq', section: 'Sequences', difficulty: 'medium', tags: ['geometric'],
        type: 'short',
        prompt: `Does ( (${a}/( ${a}+1 ))^n ) converge to 0? Answer True or False.`,
        answer: 'True',
        solution: `|r|=${a}/${a + 1}<1 ⇒ r^n→0.`
      };
    },
    function (rng) {
      const epsNum = 1, epsDen = rng.pick([10, 100, 1000]);
      // for a_n=1/n, find N so n>N ⇒ |a_n| < 1/epsDen — N = epsDen
      return {
        id: 'ra-eps-N', section: 'Sequences', difficulty: 'hard', tags: ['epsilon'],
        type: 'short',
        prompt: `Let a_n = 1/n and ε = 1/${epsDen}. Find the smallest integer N such that n > N ⇒ |a_n − 0| < ε.\n(Use N = floor(1/ε) = ${epsDen} works; give that N.)`,
        answer: String(epsDen),
        solution: `Need 1/n < 1/${epsDen} ⇒ n > ${epsDen}. Smallest such integer threshold N=${epsDen} in the sense n>N.`
      };
    },
    function (rng) {
      const items = [
        { q: 'Write the ε–definition: lim a_n = L means: for every ε>0 there exists N∈ℕ such that … (complete: n>N ⇒ |a_n−L|<ε). Does this definition require ε to be less than 1? True/False.', a: 'False', s: 'ε is any positive real.' }
      ];
      return {
        id: 'ra-eps-def', section: 'Sequences', difficulty: 'medium', tags: ['definitions'],
        type: 'tf',
        prompt: items[0].q,
        answer: items[0].a,
        solution: items[0].s
      };
    },
    function (rng) {
      const a = rng.int(1, 4), b = a + rng.int(1, 4);
      return {
        id: 'ra-sup', section: 'Completeness', difficulty: 'medium', tags: ['supremum'],
        type: 'short',
        prompt: `For the set S = {x∈ℝ : ${a} < x < ${b}}, what is sup S?`,
        answer: String(b),
        solution: `S=(${a},${b}); least upper bound is ${b}.`
      };
    },
    function (rng) {
      const a = rng.int(0, 3), b = a + rng.int(2, 5);
      return {
        id: 'ra-inf', section: 'Completeness', difficulty: 'medium', tags: ['infimum'],
        type: 'short',
        prompt: `For S = [${a},${b}), find inf S.`,
        answer: String(a),
        solution: `Greatest lower bound is ${a}.`
      };
    },
    function (rng) {
      return {
        id: 'ra-nci', section: 'Completeness', difficulty: 'easy', tags: ['nested intervals'],
        type: 'tf',
        prompt: 'The Nested Interval Property says that a nested sequence of nonempty closed bounded intervals in ℝ has nonempty intersection.',
        answer: 'True',
        solution: 'Equivalent form of completeness of ℝ.'
      };
    },
    function (rng) {
      const c = rng.int(2, 6);
      // continuous f(x)=cx at 0 — lim = 0
      return {
        id: 'ra-cont-eval', section: 'Continuity', difficulty: 'easy', tags: ['continuity'],
        type: 'short',
        prompt: `If f(x)=${c}x is continuous on ℝ, then lim_{x→0} f(x) =`,
        answer: '0',
        solution: `f(0)=0 and continuity ⇒ limit is 0.`
      };
    },
    function (rng) {
      const items = [
        { q: 'If f is continuous on [a,b], then f is bounded on [a,b].', a: 'True', s: 'Extreme value theorem precursor / Heine–Borel consequence.' },
        { q: 'If f is continuous on [a,b] and f(a)<0<f(b), then ∃c∈(a,b) with f(c)=0.', a: 'True', s: 'Intermediate Value Theorem.' },
        { q: 'Uniform continuity on (0,1) is automatic for every continuous f:(0,1)→ℝ.', a: 'False', s: 'e.g. 1/x is continuous but not uniformly continuous on (0,1).' }
      ];
      const t = rng.pick(items);
      return { id: 'ra-cont-tf', section: 'Continuity', difficulty: 'medium', tags: ['IVT'], type: 'tf', prompt: t.q, answer: t.a, solution: t.s };
    },
    function (rng) {
      // series tests recognition
      const items = [
        { q: 'The harmonic series Σ 1/n converges.', a: 'False', s: 'Diverges.' },
        { q: 'Σ 1/n² converges.', a: 'True', s: 'p-series with p=2>1.' },
        { q: 'If a_n → 0 then Σ a_n converges.', a: 'False', s: 'Necessary but not sufficient (harmonic).' },
        { q: 'Absolutely convergent series are convergent.', a: 'True', s: 'Standard theorem.' }
      ];
      const t = rng.pick(items);
      return { id: 'ra-series-tf', section: 'Series', difficulty: 'medium', tags: ['series'], type: 'tf', prompt: t.q, answer: t.a, solution: t.s };
    },
    function (rng) {
      const p = rng.pick([2, 3, 4]);
      return {
        id: 'ra-p-series', section: 'Series', difficulty: 'easy', tags: ['p-series'],
        type: 'tf',
        prompt: `The p-series Σ 1/n^${p} converges.`,
        answer: 'True',
        solution: `p=${p}>1 ⇒ converges.`
      };
    },
    function (rng) {
      const L = rng.int(1, 5);
      return {
        id: 'ra-proof-sketch', section: 'Definitions & theory', difficulty: 'hard', tags: ['proof'],
        type: 'short',
        prompt: `Proof sketch (fill the blank with a number): To show lim (n→∞) ${L}/n = 0, given ε>0 choose N = ${L}/ε (or ceil). Then n>N ⇒ |${L}/n| < ε. What is lim ${L}/n?`,
        answer: '0',
        solution: `Model: ∀ε>0 ∃N (e.g. N=${L}/ε) so n>N ⇒ |${L}/n−0|<ε. Limit is 0.`
      };
    },
    function (rng) {
      const a = rng.int(2, 5);
      return {
        id: 'ra-mono', section: 'Sequences', difficulty: 'medium', tags: ['monotone'],
        type: 'tf',
        prompt: `The sequence a_n = 1 − 1/n is monotone increasing and bounded above by 1, hence converges.`,
        answer: 'True',
        solution: 'Monotone Convergence Theorem ⇒ converges (to 1).'
      };
    },
    function (rng) {
      return {
        id: 'ra-cauchy', section: 'Sequences', difficulty: 'hard', tags: ['Cauchy'],
        type: 'tf',
        prompt: 'In ℝ, a sequence converges if and only if it is Cauchy.',
        answer: 'True',
        solution: 'Completeness characterization of ℝ.'
      };
    }
  ];

  E.registerCourse({
    id: 'real_analysis',
    title: 'Real Analysis',
    subtitle: 'Sequences, continuity, series, completeness',
    textbook: 'Abbott Understanding Analysis',
    level: 'University (proof)',
    description: 'First analysis course: definitions, true/false theory, sequential limits, ε–N drills, continuity, and series criteria in the spirit of Abbott.',
    sections: [
      { id: 'def', name: 'Definitions & theory', weight: 2 },
      { id: 'seq', name: 'Sequences', weight: 3 },
      { id: 'comp', name: 'Completeness', weight: 2 },
      { id: 'cont', name: 'Continuity', weight: 2 },
      { id: 'ser', name: 'Series', weight: 2 }
    ],
    generators,
    examPresets: { quick: { n: 10, minutes: 30 }, standard: { n: 20, minutes: 75 }, full: { n: 35, minutes: 120 } }
  });
})();
