(function () {
  const E = window.ExamEngine;
  const simp = E.simplifyFraction, gcd = E.gcd;

  function nz(rng, lo, hi) { let x; do x = rng.int(lo, hi); while (x === 0); return x; }
  function det2(a, b, c, d) { return a * d - b * c; }

  const generators = [
    function (rng) {
      const a = rng.int(-5, 5), b = rng.int(-5, 5), c = rng.int(-5, 5), d = rng.int(-5, 5);
      const ans = det2(a, b, c, d);
      return {
        id: 'la-det2', section: 'Determinants', difficulty: 'easy', tags: ['det'],
        type: 'short',
        prompt: `Compute det [ ${a} ${b} ; ${c} ${d} ].`,
        answer: String(ans),
        solution: `ad−bc = (${a})(${d})−(${b})(${c}) = ${ans}.`
      };
    },
    function (rng) {
      const a = nz(rng, -4, 4), b = rng.int(-4, 4), c = rng.int(-4, 4), d = nz(rng, -4, 4);
      let det = det2(a, b, c, d);
      while (det === 0) { return generators[0](rng); }
      // inverse exists TF
      return {
        id: 'la-inv-exist', section: 'Matrices', difficulty: 'easy', tags: ['invertibility'],
        type: 'tf',
        prompt: `The matrix [ ${a} ${b} ; ${c} ${d} ] is invertible.`,
        answer: 'True',
        solution: `det = ${det} ≠ 0 ⇒ invertible.`
      };
    },
    function (rng) {
      // singular matrix
      const a = rng.int(1, 4), b = rng.int(1, 4);
      const k = rng.int(2, 3);
      return {
        id: 'la-singular', section: 'Matrices', difficulty: 'easy', tags: ['singular'],
        type: 'tf',
        prompt: `The matrix [ ${a} ${b} ; ${k * a} ${k * b} ] is invertible.`,
        answer: 'False',
        solution: `Row2 = ${k}·Row1 ⇒ det=0 ⇒ not invertible.`
      };
    },
    function (rng) {
      const a = nz(rng, 1, 5), b = rng.int(-4, 4), c = rng.int(-4, 4), d = nz(rng, 1, 5);
      const det = det2(a, b, c, d);
      if (det === 0) {
        return {
          id: 'la-inv', section: 'Matrices', difficulty: 'medium', tags: ['inverse'],
          type: 'short', prompt: `det [1 0; 0 1] = ?`, answer: '1', solution: 'Identity has det 1.'
        };
      }
      // ask (1,1) entry of inverse: d/det
      const s = simp(d, det);
      return {
        id: 'la-inv-entry', section: 'Matrices', difficulty: 'hard', tags: ['inverse'],
        type: 'short',
        prompt: `Let A = [ ${a} ${b} ; ${c} ${d} ]. The (1,1)-entry of A⁻¹ is (simplified fraction or integer):`,
        answer: s.str,
        solution: `A⁻¹ = (1/det)[ d −b; −c a ], det=${det}. (1,1)=${d}/${det}=${s.str}.`
      };
    },
    function (rng) {
      const a1 = rng.int(-3, 4), a2 = rng.int(-3, 4), b1 = rng.int(-3, 4), b2 = rng.int(-3, 4);
      const ans = a1 * b1 + a2 * b2;
      return {
        id: 'la-dot', section: 'Vectors', difficulty: 'easy', tags: ['dot'],
        type: 'short',
        prompt: `Compute [${a1},${a2}] · [${b1},${b2}].`,
        answer: String(ans),
        solution: `${a1}·${b1}+${a2}·${b2}=${ans}.`
      };
    },
    function (rng) {
      // orthogonal?
      const a = rng.int(1, 5), b = rng.int(1, 5);
      return {
        id: 'la-orth', section: 'Vectors', difficulty: 'easy', tags: ['orthogonal'],
        type: 'tf',
        prompt: `Vectors [${a},${b}] and [${-b},${a}] are orthogonal.`,
        answer: 'True',
        solution: `Dot product = ${a}(-${b})+${b}(${a})=0.`
      };
    },
    function (rng) {
      const a = rng.int(1, 4), b = rng.int(0, 4), c = rng.int(0, 4);
      // solve ax=b for RREF style: system  a x = b (1 eq)
      if (a === 0) return generators[6](rng);
      const s = simp(b, a);
      return {
        id: 'la-solve1', section: 'Systems', difficulty: 'easy', tags: ['RREF'],
        type: 'short',
        prompt: `Solve: ${a}x = ${b}. Give simplified fraction or integer.`,
        answer: s.str,
        solution: `x = ${b}/${a} = ${s.str}.`
      };
    },
    function (rng) {
      // 2x2 system with unique solution
      let a = nz(rng, -3, 3), b = nz(rng, -3, 3), c = nz(rng, -3, 3), d = nz(rng, -3, 3);
      let det = det2(a, b, c, d);
      let tries = 0;
      while (det === 0 && tries < 20) {
        a = nz(rng, -3, 3); b = nz(rng, -3, 3); c = nz(rng, -3, 3); d = nz(rng, -3, 3);
        det = det2(a, b, c, d); tries++;
      }
      const x = rng.int(-3, 3), y = rng.int(-3, 3);
      const e = a * x + b * y, f = c * x + d * y;
      return {
        id: 'la-sys2', section: 'Systems', difficulty: 'medium', tags: ['linear systems'],
        type: 'short',
        prompt: `Solve the system:\n${a}x + ${b}y = ${e}\n${c}x + ${d}y = ${f}\nGive x (as integer).`,
        answer: String(x),
        solution: `Unique solution (det=${det}). By construction / Cramer: x=${x}, y=${y}.`
      };
    },
    function (rng) {
      const lam = rng.int(-3, 4);
      // eigenvalue of diagonal
      return {
        id: 'la-eig-diag', section: 'Eigenvalues', difficulty: 'easy', tags: ['eigenvalues'],
        type: 'short',
        prompt: `One eigenvalue of the diagonal matrix diag(${lam}, ${lam + 2}) is ${lam}. What is the other?`,
        answer: String(lam + 2),
        solution: `Diagonal entries are the eigenvalues: ${lam} and ${lam + 2}.`
      };
    },
    function (rng) {
      const a = rng.int(1, 5);
      // A=[a,0;0,a] eigenvalue a with multiplicity 2 — ask det(A-λI) at λ=a is 0
      return {
        id: 'la-char', section: 'Eigenvalues', difficulty: 'medium', tags: ['characteristic'],
        type: 'short',
        prompt: `For A = [${a} 0; 0 ${a}], evaluate det(A − ${a}I).`,
        answer: '0',
        solution: `A−${a}I=0, so det=0 (λ=${a} is eigenvalue).`
      };
    },
    function (rng) {
      const v = [rng.int(1, 4), rng.int(0, 4), rng.int(0, 4)];
      const k = nz(rng, 2, 5);
      return {
        id: 'la-span', section: 'Vector spaces', difficulty: 'easy', tags: ['span'],
        type: 'short',
        prompt: `If v = [${v.join(',')}], find the first component of ${k}v.`,
        answer: String(k * v[0]),
        solution: `${k}v = [${k * v[0]}, ${k * v[1]}, ${k * v[2]}].`
      };
    },
    function (rng) {
      const items = [
        { q: 'The zero vector is orthogonal to every vector in Rⁿ.', a: 'True', s: '0·v=0 always.' },
        { q: 'Any set containing the zero vector is linearly independent.', a: 'False', s: 'Zero vector makes the set dependent.' },
        { q: 'Row operations change the row space but not the null space? Wait—actually elementary row ops preserve null space.', a: 'True', s: 'Interpreted: elementary row operations preserve the null space (solution set of Ax=0). Statement accepted as True regarding null space invariance.' },
        { q: 'A 3×3 matrix can have at most 3 distinct eigenvalues.', a: 'True', s: 'Characteristic polynomial degree 3.' }
      ];
      // Fix the confusing third item:
      const clean = [
        { q: 'The zero vector is orthogonal to every vector in Rⁿ.', a: 'True', s: '0·v=0.' },
        { q: 'Any set containing the zero vector is linearly independent.', a: 'False', s: 'Dependent.' },
        { q: 'Elementary row operations preserve the null space of a matrix.', a: 'True', s: 'Same solution set for Ax=0.' },
        { q: 'A 3×3 matrix can have at most 3 distinct eigenvalues (over C, counting without multiplicity limit on repeats).', a: 'True', s: 'At most 3 roots of the degree-3 characteristic polynomial.' }
      ];
      const t = rng.pick(clean);
      return { id: 'la-tf', section: 'Vector spaces', difficulty: 'medium', tags: ['theory'], type: 'tf', prompt: t.q, answer: t.a, solution: t.s };
    },
    function (rng) {
      // matrix multiply 2x2 * vector
      const a = rng.int(-3, 3), b = rng.int(-3, 3), c = rng.int(-3, 3), d = rng.int(-3, 3);
      const x = rng.int(-3, 3), y = rng.int(-3, 3);
      const r1 = a * x + b * y;
      return {
        id: 'la-matvec', section: 'Matrices', difficulty: 'easy', tags: ['multiplication'],
        type: 'short',
        prompt: `Compute the first entry of [ ${a} ${b} ; ${c} ${d} ] [ ${x} ; ${y} ].`,
        answer: String(r1),
        solution: `First row · vector = ${a}·${x}+${b}·${y}=${r1}.`
      };
    },
    function (rng) {
      const a = rng.int(1, 4), b = rng.int(1, 4);
      // rank of [a b; 0 0] is 1 if (a,b)!=0
      return {
        id: 'la-rank', section: 'Matrices', difficulty: 'easy', tags: ['rank'],
        type: 'short',
        prompt: `What is the rank of [ ${a} ${b} ; 0 0 ]?`,
        answer: '1',
        solution: `One nonzero row ⇒ rank 1.`
      };
    },
    function (rng) {
      // trace
      const a = rng.int(-5, 5), d = rng.int(-5, 5), b = rng.int(-5, 5), c = rng.int(-5, 5);
      return {
        id: 'la-trace', section: 'Matrices', difficulty: 'easy', tags: ['trace'],
        type: 'short',
        prompt: `Find tr[ ${a} ${b} ; ${c} ${d} ].`,
        answer: String(a + d),
        solution: `Trace = sum of diagonal = ${a}+${d}=${a + d}.`
      };
    }
  ];

  // fix generators that self-call poorly
  generators[1] = function (rng) {
    let a = nz(rng, -4, 4), b = rng.int(-4, 4), c = rng.int(-4, 4), d = nz(rng, -4, 4);
    let det = det2(a, b, c, d), t = 0;
    while (det === 0 && t++ < 30) {
      a = nz(rng, -4, 4); b = rng.int(-4, 4); c = rng.int(-4, 4); d = nz(rng, -4, 4);
      det = det2(a, b, c, d);
    }
    return {
      id: 'la-inv-exist', section: 'Matrices', difficulty: 'easy', tags: ['invertibility'],
      type: 'tf',
      prompt: `The matrix [ ${a} ${b} ; ${c} ${d} ] is invertible.`,
      answer: det !== 0 ? 'True' : 'False',
      solution: `det = ${det}. Invertible iff det≠0.`
    };
  };
  generators[6] = function (rng) {
    const a = nz(rng, 1, 5), b = rng.int(-8, 8);
    const s = simp(b, a);
    return {
      id: 'la-solve1', section: 'Systems', difficulty: 'easy', tags: ['RREF'],
      type: 'short',
      prompt: `Solve: ${a}x = ${b}. Give simplified fraction or integer.`,
      answer: s.str,
      solution: `x = ${b}/${a} = ${s.str}.`
    };
  };

  E.registerCourse({
    id: 'linear_algebra',
    title: 'Linear Algebra',
    subtitle: 'Matrices, systems, vector spaces, eigenvalues',
    textbook: 'Andrilli & Hecker Elementary Linear Algebra 6e',
    level: 'University',
    description: 'Intro linear algebra: matrix algebra, determinants, linear systems, vector spaces, and eigenvalues.',
    sections: [
      { id: 'mat', name: 'Matrices', weight: 3 },
      { id: 'det', name: 'Determinants', weight: 2 },
      { id: 'vec', name: 'Vectors', weight: 2 },
      { id: 'sys', name: 'Systems', weight: 2 },
      { id: 'eig', name: 'Eigenvalues', weight: 2 },
      { id: 'vs', name: 'Vector spaces', weight: 2 }
    ],
    generators,
    examPresets: { quick: { n: 10, minutes: 25 }, standard: { n: 25, minutes: 60 }, full: { n: 40, minutes: 90 } }
  });
})();
