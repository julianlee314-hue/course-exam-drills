(function () {
  const E = window.ExamEngine;
  const simp = E.simplifyFraction, gcd = E.gcd;

  function mean(arr) {
    return arr.reduce((s, x) => s + x, 0) / arr.length;
  }

  const generators = [
    function (rng) {
      const n = rng.int(5, 7);
      const data = [];
      for (let i = 0; i < n; i++) data.push(rng.int(10, 40));
      const sum = data.reduce((s, x) => s + x, 0);
      const m = simp(sum, n);
      return {
        id: 'aps-mean', section: 'Descriptive', difficulty: 'easy', tags: ['mean'],
        type: 'short',
        prompt: `Data: ${data.join(', ')}. Find the mean (simplified fraction or integer).`,
        answer: m.str,
        solution: `Sum=${sum}; mean=${sum}/${n}=${m.str}.`
      };
    },
    function (rng) {
      const n = rng.pick([5, 7, 9]); // odd for unique median
      const data = [];
      for (let i = 0; i < n; i++) data.push(rng.int(5, 30));
      const sorted = data.slice().sort((a, b) => a - b);
      const med = sorted[(n - 1) / 2];
      return {
        id: 'aps-median', section: 'Descriptive', difficulty: 'easy', tags: ['median'],
        type: 'short',
        prompt: `Find the median of: ${data.join(', ')}`,
        answer: String(med),
        solution: `Sorted: ${sorted.join(', ')}. Middle value=${med}.`
      };
    },
    function (rng) {
      const a = rng.int(2, 10), b = a + rng.int(5, 20);
      return {
        id: 'aps-range', section: 'Descriptive', difficulty: 'easy', tags: ['range'],
        type: 'short',
        prompt: `A data set has minimum ${a} and maximum ${b}. What is the range?`,
        answer: String(b - a),
        solution: `Range = max−min = ${b}−${a}=${b - a}.`
      };
    },
    function (rng) {
      const items = [
        { q: 'The mean is resistant to extreme outliers.', a: 'False', s: 'Median is more resistant; mean is pulled by outliers.' },
        { q: 'A z-score of 0 means the observation equals the mean.', a: 'True', s: 'z=(x−μ)/σ.' },
        { q: 'In a left-skewed distribution, the mean is typically less than the median.', a: 'True', s: 'Mean pulled toward the long left tail.' },
        { q: 'Standard deviation can be negative.', a: 'False', s: 'SD ≥ 0.' }
      ];
      const t = rng.pick(items);
      return { id: 'aps-desc-tf', section: 'Descriptive', difficulty: 'easy', tags: ['concepts'], type: 'tf', prompt: t.q, answer: t.a, solution: t.s };
    },
    function (rng) {
      const r = rng.int(2, 6), b = rng.int(2, 6), g = rng.int(1, 4);
      const total = r + b + g;
      const s = simp(r + b, total);
      return {
        id: 'aps-prob', section: 'Probability', difficulty: 'easy', tags: ['basic probability'],
        type: 'short',
        prompt: `Bag: ${r} red, ${b} blue, ${g} green. P(red or blue) as simplified fraction:`,
        answer: s.str,
        solution: `(${r}+${b})/${total}=${s.str}.`
      };
    },
    function (rng) {
      const pNum = rng.int(1, 4), pDen = rng.pick([5, 6, 8, 10]);
      const s = simp(pDen - pNum, pDen);
      return {
        id: 'aps-comp', section: 'Probability', difficulty: 'easy', tags: ['complement'],
        type: 'short',
        prompt: `If P(A)=${pNum}/${pDen}, find P(Aᶜ) as simplified fraction.`,
        answer: s.str,
        solution: `1−P(A)=${s.str}.`
      };
    },
    function (rng) {
      // independent: P(A and B)=P(A)P(B)
      const a = simp(rng.int(1, 3), rng.pick([4, 5, 6]));
      const b = simp(rng.int(1, 3), rng.pick([4, 5, 6]));
      const prod = simp(a.n * b.n, a.d * b.d);
      return {
        id: 'aps-indep', section: 'Probability', difficulty: 'medium', tags: ['independence'],
        type: 'short',
        prompt: `Independent events: P(A)=${a.str}, P(B)=${b.str}. P(A∩B)=`,
        answer: prod.str,
        solution: `P(A)P(B)=${prod.str}.`
      };
    },
    function (rng) {
      const n = rng.int(5, 10), k = rng.int(1, 3);
      // binomial expected value np with p=1/2
      const s = simp(n, 2);
      return {
        id: 'aps-binom-mu', section: 'Probability', difficulty: 'medium', tags: ['binomial'],
        type: 'short',
        prompt: `X~Binomial(n=${n}, p=1/2). Find E[X] (simplified fraction or integer).`,
        answer: s.str,
        solution: `E[X]=np=${n}/2=${s.str}.`
      };
    },
    function (rng) {
      const mu = rng.int(50, 80), x = mu + rng.pick([-10, -5, 5, 10, 15]), sd = rng.pick([5, 10]);
      const z = simp(x - mu, sd);
      return {
        id: 'aps-z', section: 'Sampling & distributions', difficulty: 'medium', tags: ['z-score'],
        type: 'short',
        prompt: `Population mean μ=${mu}, σ=${sd}. z-score of x=${x} (simplified fraction or integer):`,
        answer: z.str,
        solution: `z=(x−μ)/σ=(${x}−${mu})/${sd}=${z.str}.`
      };
    },
    function (rng) {
      const items = [
        { q: 'By the Central Limit Theorem, the sampling distribution of x̄ is approximately normal for large n even if the population is not normal (with finite variance).', a: 'True', s: 'CLT statement.' },
        { q: 'For a fixed confidence level, larger sample size tends to produce a wider confidence interval for a mean (known σ).', a: 'False', s: 'Larger n ⇒ smaller SE ⇒ narrower CI.' },
        { q: 'A p-value is the probability that the null hypothesis is true.', a: 'False', s: 'P(data as extreme | H₀ true), not P(H₀).' }
      ];
      const t = rng.pick(items);
      return { id: 'aps-inf-tf', section: 'Inference', difficulty: 'medium', tags: ['concepts'], type: 'tf', prompt: t.q, answer: t.a, solution: t.s };
    },
    function (rng) {
      // CI for mean known sigma: xbar ± z* sigma/sqrt(n) — ask margin of error with z=2 approx
      const sigma = rng.pick([4, 6, 8, 10]), n = rng.pick([16, 25, 36, 64]);
      const z = 2; // approx 95%
      const se = sigma / Math.sqrt(n);
      const me = z * se;
      // ensure integer ME
      return {
        id: 'aps-me', section: 'Inference', difficulty: 'hard', tags: ['CI'],
        type: 'short',
        prompt: `Approximate 95% CI uses z*≈2. If σ=${sigma} and n=${n}, the margin of error 2·σ/√n equals:`,
        answer: String(me),
        solution: `σ/√n=${sigma}/√${n}=${se}; ME=2×${se}=${me}.`
      };
    },
    function (rng) {
      const phatNum = rng.int(20, 60), n = rng.pick([100, 100, 200]);
      const phat = simp(phatNum, n);
      return {
        id: 'aps-phat', section: 'Sampling & distributions', difficulty: 'easy', tags: ['proportion'],
        type: 'short',
        prompt: `In a sample of ${n}, there were ${phatNum} successes. Sample proportion p̂ as simplified fraction:`,
        answer: phat.str,
        solution: `p̂=${phatNum}/${n}=${phat.str}.`
      };
    },
    function (rng) {
      const a = rng.int(3, 8), b = rng.int(3, 8);
      // expected count in 2x2 under independence rough: for totals — simpler contingency
      // P(A)=a/(a+b) 
      const s = simp(a, a + b);
      return {
        id: 'aps-cond', section: 'Probability', difficulty: 'medium', tags: ['conditional'],
        type: 'short',
        prompt: `${a} students take French, ${b} take Spanish (disjoint groups, every student in exactly one). P(French)=`,
        answer: s.str,
        solution: `${a}/${a + b}=${s.str}.`
      };
    },
    function (rng) {
      const items = [
        { q: 'Increasing confidence level from 95% to 99% (same data, known σ) widens the CI.', a: 'True', s: 'Larger z*.' },
        { q: 'Type I error is rejecting H₀ when H₀ is true.', a: 'True', s: 'Definition.' },
        { q: 'Type II error is rejecting H₀ when H₀ is true.', a: 'False', s: 'Type II: fail to reject false H₀.' }
      ];
      const t = rng.pick(items);
      return { id: 'aps-err', section: 'Inference', difficulty: 'easy', tags: ['errors'], type: 'tf', prompt: t.q, answer: t.a, solution: t.s };
    },
    function (rng) {
      // generate small sample and ask Q1-ish: for sorted 4 values, ask IQR rough with quartiles on small set
      const data = [];
      for (let i = 0; i < 4; i++) data.push(rng.int(1, 20));
      const sorted = data.slice().sort((a, b) => a - b);
      const iqr = sorted[3] - sorted[0]; // range as proxy? Better: genuine 5-number with 5 points
      return {
        id: 'aps-sorted', section: 'Descriptive', difficulty: 'easy', tags: ['order stats'],
        type: 'short',
        prompt: `Sort ascending and give the largest value: ${data.join(', ')}`,
        answer: String(sorted[3]),
        solution: `Sorted ${sorted.join(', ')}; max=${sorted[3]}.`
      };
    },
    function (rng) {
      const n = 5;
      const data = [];
      for (let i = 0; i < n; i++) data.push(rng.int(2, 15));
      const sorted = data.slice().sort((a, b) => a - b);
      const iqr = sorted[3] - sorted[1]; // rough sample quartiles positions
      return {
        id: 'aps-iqr', section: 'Descriptive', difficulty: 'medium', tags: ['IQR'],
        type: 'short',
        prompt: `For the ordered sample ${sorted.join(', ')}, use Q1=2nd value and Q3=4th value. IQR =`,
        answer: String(iqr),
        solution: `Q1=${sorted[1]}, Q3=${sorted[3]}, IQR=${iqr}.`
      };
    }
  ];

  E.registerCourse({
    id: 'ap_stats',
    title: 'AP Statistics',
    subtitle: 'Descriptive, probability, sampling, inference',
    textbook: 'AP Statistics 2020 student edition',
    level: 'AP / HS',
    description: 'AP Stats drills: descriptive statistics with random samples, probability, sampling distributions, and inference concepts (CI/tests).',
    sections: [
      { id: 'desc', name: 'Descriptive', weight: 3 },
      { id: 'prob', name: 'Probability', weight: 3 },
      { id: 'samp', name: 'Sampling & distributions', weight: 2 },
      { id: 'inf', name: 'Inference', weight: 2 }
    ],
    generators,
    examPresets: { quick: { n: 10, minutes: 25 }, standard: { n: 25, minutes: 60 }, full: { n: 40, minutes: 90 } }
  });
})();
