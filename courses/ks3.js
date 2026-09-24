(function () {
  const E = window.ExamEngine;
  const gcd = E.gcd, fmt = E.fmtFrac, simp = E.simplifyFraction;

  function nz(rng, lo, hi) {
    let x;
    do { x = rng.int(lo, hi); } while (x === 0);
    return x;
  }

  const generators = [
    // 1 Number: order of operations
    function (rng) {
      const a = rng.int(2, 12), b = rng.int(2, 9), c = rng.int(1, 8);
      const ans = a + b * c;
      return {
        id: 'ks3-bimdas', section: 'Number', difficulty: 'easy', tags: ['order of operations'],
        type: 'short',
        prompt: `Evaluate: ${a} + ${b} × ${c}`,
        answer: String(ans),
        solution: `Multiplication first: ${b}×${c}=${b * c}. Then ${a}+${b * c}=${ans}.`
      };
    },
    // 2 Fractions add
    function (rng) {
      const d1 = rng.pick([2, 3, 4, 5, 6, 8]);
      let d2 = rng.pick([2, 3, 4, 5, 6, 8, 10]);
      if (d2 === d1) d2 = d1 + 1;
      const n1 = rng.int(1, d1 - 1), n2 = rng.int(1, d2 - 1);
      const den = (d1 * d2) / gcd(d1, d2);
      const num = n1 * (den / d1) + n2 * (den / d2);
      const s = simp(num, den);
      return {
        id: 'ks3-frac-add', section: 'Number', difficulty: 'easy', tags: ['fractions'],
        type: 'short',
        prompt: `Simplify: ${n1}/${d1} + ${n2}/${d2}\nGive your answer as a simplified fraction (or integer).`,
        answer: s.str,
        solution: `LCD = ${den}. ${n1}/${d1}=${n1 * (den / d1)}/${den}, ${n2}/${d2}=${n2 * (den / d2)}/${den}. Sum = ${num}/${den} = ${s.str}.`
      };
    },
    // 3 Percent of amount
    function (rng) {
      const p = rng.pick([5, 10, 15, 20, 25, 30, 40, 50, 75]);
      const amount = rng.int(2, 40) * 10;
      const ans = (p * amount) / 100;
      return {
        id: 'ks3-pct', section: 'Number', difficulty: 'easy', tags: ['percentages'],
        type: 'short',
        prompt: `Find ${p}% of ${amount}.`,
        answer: String(ans),
        solution: `${p}% of ${amount} = (${p}/100)×${amount} = ${ans}.`
      };
    },
    // 4 Ratio share
    function (rng) {
      const a = rng.int(2, 5), b = rng.int(2, 5);
      const totalParts = a + b;
      const total = totalParts * rng.int(3, 12);
      const shareA = (a / totalParts) * total;
      return {
        id: 'ks3-ratio', section: 'Number', difficulty: 'medium', tags: ['ratio'],
        type: 'short',
        prompt: `Share ${total} in the ratio ${a}:${b}. How much does the first share get?`,
        answer: String(shareA),
        solution: `Parts = ${a}+${b}=${totalParts}. One part = ${total}/${totalParts}=${total / totalParts}. First share = ${a}×${total / totalParts}=${shareA}.`
      };
    },
    // 5 Expand brackets
    function (rng) {
      const k = nz(rng, 2, 9), a = nz(rng, -8, 8), b = nz(rng, -8, 8);
      const A = k * a, B = k * b;
      const ans = E.fmtPoly([B, A]);
      return {
        id: 'ks3-expand', section: 'Algebra', difficulty: 'easy', tags: ['expand'],
        type: 'short',
        prompt: `Expand and simplify: ${k}(${a === 1 ? '' : a === -1 ? '-' : a}x${b >= 0 ? '+' : ''}${b})\nWrite in the form px+q (or px−q).`,
        answer: ans,
        solution: `${k}×${a}x = ${A}x; ${k}×(${b}) = ${B}. Result: ${ans}.`
      };
    },
    // 6 Solve linear
    function (rng) {
      const a = nz(rng, 2, 9), x = rng.int(-12, 12), b = rng.int(-20, 20);
      const rhs = a * x + b;
      return {
        id: 'ks3-linear', section: 'Algebra', difficulty: 'easy', tags: ['equations'],
        type: 'short',
        prompt: `Solve for x: ${a}x ${b >= 0 ? '+ ' + b : '− ' + Math.abs(b)} = ${rhs}`,
        answer: String(x),
        solution: `${a}x = ${rhs} − (${b}) = ${rhs - b}. x = ${rhs - b}/${a} = ${x}.`
      };
    },
    // 7 Substitution
    function (rng) {
      const x = rng.int(-5, 8), y = rng.int(-5, 8);
      const a = rng.int(1, 5), b = rng.int(1, 5);
      const ans = a * x - b * y;
      return {
        id: 'ks3-sub', section: 'Algebra', difficulty: 'easy', tags: ['substitution'],
        type: 'short',
        prompt: `If x = ${x} and y = ${y}, find the value of ${a}x − ${b}y.`,
        answer: String(ans),
        solution: `${a}(${x}) − ${b}(${y}) = ${a * x} − ${b * y} = ${ans}.`
      };
    },
    // 8 Sequences nth term
    function (rng) {
      const d = nz(rng, -5, 8), a1 = rng.int(-10, 15);
      const n = rng.int(5, 12);
      const an = a1 + (n - 1) * d;
      return {
        id: 'ks3-seq', section: 'Algebra', difficulty: 'medium', tags: ['sequences'],
        type: 'short',
        prompt: `An arithmetic sequence has first term ${a1} and common difference ${d}. Find the ${n}th term.`,
        answer: String(an),
        solution: `a_n = a_1 + (n−1)d = ${a1} + (${n}−1)(${d}) = ${a1} + ${(n - 1) * d} = ${an}.`
      };
    },
    // 9 Area of triangle
    function (rng) {
      const b = rng.int(4, 20), h = rng.int(3, 18);
      const area = simp(b * h, 2);
      return {
        id: 'ks3-tri-area', section: 'Geometry', difficulty: 'easy', tags: ['area'],
        type: 'short',
        prompt: `A triangle has base ${b} cm and height ${h} cm. Find its area in cm² (simplified fraction or integer).`,
        answer: area.str,
        solution: `Area = (1/2)×base×height = (${b}×${h})/2 = ${area.str}.`
      };
    },
    // 10 Pythagoras
    function (rng) {
      const triples = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [7, 24, 25], [8, 15, 17], [9, 12, 15]];
      const t = rng.pick(triples);
      const k = rng.int(1, 3);
      const a = t[0] * k, b = t[1] * k, c = t[2] * k;
      const askHyp = rng.bool();
      if (askHyp) {
        return {
          id: 'ks3-pyth', section: 'Geometry', difficulty: 'medium', tags: ['Pythagoras'],
          type: 'short',
          prompt: `A right triangle has legs ${a} and ${b}. Find the hypotenuse.`,
          answer: String(c),
          solution: `c = √(${a}²+${b}²) = √(${a * a}+${b * b}) = √${a * a + b * b} = ${c}.`
        };
      }
      return {
        id: 'ks3-pyth-leg', section: 'Geometry', difficulty: 'medium', tags: ['Pythagoras'],
        type: 'short',
        prompt: `A right triangle has hypotenuse ${c} and one leg ${a}. Find the other leg.`,
        answer: String(b),
        solution: `b = √(${c}²−${a}²) = √(${c * c}−${a * a}) = √${c * c - a * a} = ${b}.`
      };
    },
    // 11 Angle in triangle
    function (rng) {
      const A = rng.int(20, 80), B = rng.int(20, 80);
      let C = 180 - A - B;
      if (C <= 0) { C = 40; }
      return {
        id: 'ks3-angles', section: 'Geometry', difficulty: 'easy', tags: ['angles'],
        type: 'short',
        prompt: `In triangle ABC, angle A = ${A}° and angle B = ${B}°. Find angle C in degrees.`,
        answer: String(C),
        solution: `Angles in a triangle sum to 180°. C = 180 − ${A} − ${B} = ${C}.`
      };
    },
    // 12 Mean of data
    function (rng) {
      const n = rng.int(4, 6);
      const data = [];
      for (let i = 0; i < n; i++) data.push(rng.int(2, 20));
      const sum = data.reduce((s, x) => s + x, 0);
      const mean = simp(sum, n);
      return {
        id: 'ks3-mean', section: 'Statistics', difficulty: 'easy', tags: ['averages'],
        type: 'short',
        prompt: `Find the mean of the data set: ${data.join(', ')}\nGive a simplified fraction or integer.`,
        answer: mean.str,
        solution: `Sum = ${sum}. Mean = ${sum}/${n} = ${mean.str}.`
      };
    },
    // 13 Probability simple
    function (rng) {
      const red = rng.int(2, 8), blue = rng.int(2, 8), green = rng.int(1, 5);
      const total = red + blue + green;
      const s = simp(red, total);
      return {
        id: 'ks3-prob', section: 'Statistics', difficulty: 'easy', tags: ['probability'],
        type: 'short',
        prompt: `A bag contains ${red} red, ${blue} blue and ${green} green counters. One counter is drawn at random. What is P(red)? Give a simplified fraction.`,
        answer: s.str,
        solution: `Total = ${total}. P(red) = ${red}/${total} = ${s.str}.`
      };
    },
    // 14 Negative numbers
    function (rng) {
      const a = rng.int(-20, -1), b = rng.int(1, 15);
      const op = rng.pick(['+', '−', '×']);
      let ans, sol;
      if (op === '+') { ans = a + b; sol = `${a} + ${b} = ${ans}`; }
      else if (op === '−') { ans = a - b; sol = `${a} − ${b} = ${ans}`; }
      else { ans = a * b; sol = `${a} × ${b} = ${ans}`; }
      return {
        id: 'ks3-neg', section: 'Number', difficulty: 'easy', tags: ['negatives'],
        type: 'short',
        prompt: `Calculate: (${a}) ${op} ${b}`,
        answer: String(ans),
        solution: sol
      };
    },
    // 15 Rounding
    function (rng) {
      const whole = rng.int(10, 99);
      const frac = rng.int(0, 999);
      const x = whole + frac / 1000;
      const dp = rng.pick([1, 2]);
      const ans = (Math.round(x * Math.pow(10, dp)) / Math.pow(10, dp)).toFixed(dp);
      return {
        id: 'ks3-round', section: 'Number', difficulty: 'easy', tags: ['rounding'],
        type: 'short',
        prompt: `Round ${x} to ${dp} decimal place${dp > 1 ? 's' : ''}.`,
        answer: ans,
        solution: `Look at the digit after the ${dp}${dp === 1 ? 'st' : 'nd'} decimal place and round accordingly → ${ans}.`
      };
    }
  ];

  E.registerCourse({
    id: 'ks3',
    title: 'KS3 Foundation',
    subtitle: 'Number, algebra, geometry & stats readiness',
    textbook: 'CGP KS3 Maths Textbooks 1–3',
    level: 'KS3',
    description: 'Middle-school foundation covering number skills, introductory algebra, geometry measures, and basic statistics — CGP KS3 trilogy breadth.',
    sections: [
      { id: 'number', name: 'Number', weight: 3 },
      { id: 'algebra', name: 'Algebra', weight: 3 },
      { id: 'geometry', name: 'Geometry', weight: 2 },
      { id: 'statistics', name: 'Statistics', weight: 2 }
    ],
    generators,
    examPresets: {
      quick: { n: 10, minutes: 20 },
      standard: { n: 25, minutes: 50 },
      full: { n: 40, minutes: 80 }
    }
  });
})();
