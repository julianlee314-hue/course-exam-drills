(function () {
  const E = window.ExamEngine;
  const simp = E.simplifyFraction;

  const generators = [
    function (rng) {
      const A = rng.int(20, 80), B = rng.int(20, 80);
      let C = 180 - A - B;
      if (C <= 5) { return generators[0](rng); }
      return {
        id: 'eu-I32', section: 'Book I — Triangles', difficulty: 'easy', tags: ['I.32'],
        type: 'short',
        prompt: `Euclid I.32 (angle sum): In △ABC, ∠A=${A}°, ∠B=${B}°. Find ∠C in degrees.`,
        answer: String(C),
        solution: `I.32: interior angles sum to two right angles (180°). ∠C=180−${A}−${B}=${C}.`
      };
    },
    function (rng) {
      const a = rng.int(30, 70);
      return {
        id: 'eu-exterior', section: 'Book I — Triangles', difficulty: 'medium', tags: ['I.32 exterior'],
        type: 'short',
        prompt: `The exterior angle of a triangle equals the sum of the two remote interior angles (I.32 corollary). If remote interiors are ${a}° and ${180 - 2 * a}°, exterior angle is:`,
        answer: String(a + (180 - 2 * a)),
        solution: `Exterior = ${a}+${180 - 2 * a}=${180 - a}.`
      };
    },
    function (rng) {
      const triples = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [7, 24, 25], [9, 12, 15]];
      const t = rng.pick(triples);
      const k = rng.int(1, 2);
      const a = t[0] * k, b = t[1] * k, c = t[2] * k;
      return {
        id: 'eu-I47', section: 'Book I — Triangles', difficulty: 'medium', tags: ['I.47 Pythagoras'],
        type: 'short',
        prompt: `Euclid I.47 (Pythagoras): Right triangle with legs ${a} and ${b}. Hypotenuse?`,
        answer: String(c),
        solution: `c=√(${a}²+${b}²)=${c}.`
      };
    },
    function (rng) {
      const items = [
        { q: 'Euclid Postulate 1: to draw a straight line from any point to any point.', a: 'True', s: 'Postulate 1.' },
        { q: 'Euclid’s parallel postulate (Postulate 5) is equivalent (in absolute geometry context) to the uniqueness of a parallel through a point not on a line.', a: 'True', s: 'Playfair form is equivalent to Postulate 5 over neutral geometry.' },
        { q: 'Book I Proposition 1 constructs an equilateral triangle on a given finite straight line.', a: 'True', s: 'I.1.' },
        { q: 'Vertical angles are unequal in Euclidean geometry.', a: 'False', s: 'I.15: vertical angles equal.' }
      ];
      const t = rng.pick(items);
      return { id: 'eu-post', section: 'Foundations', difficulty: 'easy', tags: ['postulates'], type: 'tf', prompt: t.q, answer: t.a, solution: t.s };
    },
    function (rng) {
      const a = rng.int(25, 75);
      return {
        id: 'eu-I15', section: 'Book I — Lines & angles', difficulty: 'easy', tags: ['I.15'],
        type: 'short',
        prompt: `Vertical angles (I.15): If one vertical angle measures ${a}°, its vertical opposite measures:`,
        answer: String(a),
        solution: `Vertical angles are equal ⇒ ${a}°.`
      };
    },
    function (rng) {
      const a = rng.int(40, 140);
      return {
        id: 'eu-adjacent', section: 'Book I — Lines & angles', difficulty: 'easy', tags: ['I.13'],
        type: 'short',
        prompt: `I.13: Adjacent angles on a straight line sum to 180°. If one is ${a}°, the adjacent is:`,
        answer: String(180 - a),
        solution: `180−${a}=${180 - a}.`
      };
    },
    function (rng) {
      const a = rng.int(20, 70);
      return {
        id: 'eu-I29', section: 'Book I — Parallels', difficulty: 'medium', tags: ['I.29'],
        type: 'short',
        prompt: `I.29 (parallel lines): If a transversal cuts parallels, corresponding angles are equal. If one corresponding angle is ${a}°, the other is:`,
        answer: String(a),
        solution: `Corresponding angles equal ⇒ ${a}°.`
      };
    },
    function (rng) {
      const a = rng.int(30, 80);
      return {
        id: 'eu-cointerior', section: 'Book I — Parallels', difficulty: 'medium', tags: ['I.29'],
        type: 'short',
        prompt: `When a transversal meets parallels, consecutive interior angles are supplementary. If one is ${a}°, the other is:`,
        answer: String(180 - a),
        solution: `${180 - a}.`
      };
    },
    function (rng) {
      const side = rng.int(3, 12);
      return {
        id: 'eu-I1', section: 'Book I — Constructions', difficulty: 'easy', tags: ['I.1'],
        type: 'short',
        prompt: `I.1 constructs an equilateral triangle on a segment of length ${side}. Each side of the triangle has length:`,
        answer: String(side),
        solution: `Equilateral ⇒ all sides ${side}.`
      };
    },
    function (rng) {
      return {
        id: 'eu-construction-prompt', section: 'Book I — Constructions', difficulty: 'hard', tags: ['construction'],
        type: 'short',
        prompt: `Construction drill (I.9 spirit): Bisecting a given angle uses arcs centered at the vertex and then at the two intersection points on the rays, then joining the vertex to the new intersection. How many rays does the angle bisector add inside the angle? (Answer 1)`,
        answer: '1',
        solution: 'The bisector is a single ray (or line) splitting the angle into two equal parts.'
      };
    },
    function (rng) {
      // similar triangles Book VI style: ratios
      const k = rng.int(2, 5), a = rng.int(2, 6), b = a * k;
      return {
        id: 'eu-VI', section: 'Book VI — Similarity', difficulty: 'medium', tags: ['VI.2 / ratios'],
        type: 'short',
        prompt: `Similar triangles (Book VI): Corresponding sides in ratio 1:${k}. If a side in the smaller is ${a}, the corresponding side in the larger is:`,
        answer: String(b),
        solution: `${a}×${k}=${b}.`
      };
    },
    function (rng) {
      const a = rng.int(2, 8), b = rng.int(2, 8);
      // parallelogram opposite sides — I.34
      return {
        id: 'eu-I34', section: 'Book I — Parallelograms', difficulty: 'easy', tags: ['I.34'],
        type: 'short',
        prompt: `I.34: Opposite sides of a parallelogram are equal. If one side is ${a} and an adjacent side is ${b}, the side opposite the length-${a} side is:`,
        answer: String(a),
        solution: `Opposite sides equal ⇒ ${a}.`
      };
    },
    function (rng) {
      const A = rng.int(50, 100);
      return {
        id: 'eu-I34-angles', section: 'Book I — Parallelograms', difficulty: 'easy', tags: ['I.34'],
        type: 'short',
        prompt: `I.34: Opposite angles of a parallelogram are equal. If one angle is ${A}°, the opposite angle is:`,
        answer: String(A),
        solution: `Opposite angles equal ⇒ ${A}°.`
      };
    },
    function (rng) {
      const A = rng.int(40, 80);
      return {
        id: 'eu-para-consec', section: 'Book I — Parallelograms', difficulty: 'medium', tags: ['I.34'],
        type: 'short',
        prompt: `Consecutive angles in a parallelogram are supplementary. If one is ${A}°, the consecutive angle is:`,
        answer: String(180 - A),
        solution: `180−${A}=${180 - A}.`
      };
    },
    function (rng) {
      // circle Book III: angle in semicircle is right (III.31)
      return {
        id: 'eu-III31', section: 'Book III — Circles', difficulty: 'medium', tags: ['III.31'],
        type: 'short',
        prompt: `III.31: The angle in a semicircle is a right angle. If AC is a diameter and B is on the circle, ∠ABC measures (degrees):`,
        answer: '90',
        solution: 'Angle in a semicircle is 90°.'
      };
    },
    function (rng) {
      const center = rng.int(30, 120);
      // inscribed angle half the central (III.20)
      return {
        id: 'eu-III20', section: 'Book III — Circles', difficulty: 'medium', tags: ['III.20'],
        type: 'short',
        prompt: `III.20: Inscribed angle is half the central angle subtending the same arc. If central angle is ${center}°, inscribed angle is:`,
        answer: String(center / 2),
        solution: `${center}/2=${center / 2}.`
      };
    },
    function (rng) {
      const items = [
        { q: 'Book II deals largely with geometric algebra (identities for rectangles/squares on segments).', a: 'True', s: 'Book II.' },
        { q: 'Book V develops the theory of proportion (Eudoxus).', a: 'True', s: 'Book V.' },
        { q: 'Euclid Book I Proposition 47 is the Pythagorean theorem.', a: 'True', s: 'I.47.' },
        { q: 'Book IV is primarily about solid geometry (polyhedra).', a: 'False', s: 'Book IV: inscribed/circumscribed figures in circles; solids are later (XI–XIII).' }
      ];
      const t = rng.pick(items);
      return { id: 'eu-books-tf', section: 'Foundations', difficulty: 'easy', tags: ['Elements structure'], type: 'tf', prompt: t.q, answer: t.a, solution: t.s };
    },
    function (rng) {
      const a = rng.int(3, 9), b = rng.int(3, 9), c = rng.int(3, 9);
      // triangle inequality check — ask if a+b>c style: construct valid triangle sides
      const x = rng.int(3, 8), y = rng.int(3, 8), z = x + y - rng.int(1, Math.min(x, y) - 0 || 1);
      // ensure strict inequality
      let A = rng.int(5, 12), B = rng.int(5, 12), C = rng.int(5, Math.min(A + B - 1, 15));
      while (A + B <= C || A + C <= B || B + C <= A) {
        A = rng.int(5, 12); B = rng.int(5, 12); C = rng.int(5, 14);
      }
      return {
        id: 'eu-tri-ineq', section: 'Book I — Triangles', difficulty: 'medium', tags: ['I.20'],
        type: 'tf',
        prompt: `I.20 (triangle inequality spirit): Lengths ${A}, ${B}, ${C} can form a triangle.`,
        answer: 'True',
        solution: `${A}+${B}=${A + B}>${C} and cyclic checks hold.`
      };
    }
  ];

  // Fix first generator recursion
  generators[0] = function (rng) {
    const A = rng.int(20, 80), B = rng.int(20, 70);
    const C = 180 - A - B;
    if (C <= 5) {
      return {
        id: 'eu-I32', section: 'Book I — Triangles', difficulty: 'easy', tags: ['I.32'],
        type: 'short',
        prompt: `Euclid I.32: In △ABC, ∠A=50°, ∠B=60°. Find ∠C.`,
        answer: '70',
        solution: '180−50−60=70.'
      };
    }
    return {
      id: 'eu-I32', section: 'Book I — Triangles', difficulty: 'easy', tags: ['I.32'],
      type: 'short',
      prompt: `Euclid I.32 (angle sum): In △ABC, ∠A=${A}°, ∠B=${B}°. Find ∠C in degrees.`,
      answer: String(C),
      solution: `I.32: angles sum to 180°. ∠C=${C}.`
    };
  };

  // Fix exterior angle to be consistent
  generators[1] = function (rng) {
    const r1 = rng.int(20, 60), r2 = rng.int(20, 60);
    const ext = r1 + r2;
    return {
      id: 'eu-exterior', section: 'Book I — Triangles', difficulty: 'medium', tags: ['I.32 exterior'],
      type: 'short',
      prompt: `Exterior angle equals sum of remote interiors (I.32). Remote interiors ${r1}° and ${r2}°. Exterior angle:`,
      answer: String(ext),
      solution: `${r1}+${r2}=${ext}.`
    };
  };

  // Fix III.20 for odd centers
  generators[15] = function (rng) {
    const center = rng.pick([40, 50, 60, 80, 100, 120]);
    return {
      id: 'eu-III20', section: 'Book III — Circles', difficulty: 'medium', tags: ['III.20'],
      type: 'short',
      prompt: `III.20: Inscribed angle is half the central angle subtending the same arc. If central angle is ${center}°, inscribed angle is:`,
      answer: String(center / 2),
      solution: `${center}/2=${center / 2}.`
    };
  };

  E.registerCourse({
    id: 'euclidean_geometry',
    title: 'Euclidean Geometry',
    subtitle: 'Elements Books I–VI drills',
    textbook: "Euclid's Elements (Heath translation)",
    level: 'Foundations',
    description: 'Proposition-grounded drills from Elements Books I–VI: constructions, triangle/parallel theorems, parallelograms, circles, and similarity ratios — with correct proposition references.',
    sections: [
      { id: 'found', name: 'Foundations', weight: 1 },
      { id: 'tri', name: 'Book I — Triangles', weight: 3 },
      { id: 'lines', name: 'Book I — Lines & angles', weight: 2 },
      { id: 'par', name: 'Book I — Parallels', weight: 2 },
      { id: 'con', name: 'Book I — Constructions', weight: 1 },
      { id: 'pg', name: 'Book I — Parallelograms', weight: 2 },
      { id: 'circ', name: 'Book III — Circles', weight: 2 },
      { id: 'sim', name: 'Book VI — Similarity', weight: 1 }
    ],
    generators,
    examPresets: { quick: { n: 10, minutes: 25 }, standard: { n: 25, minutes: 60 }, full: { n: 40, minutes: 90 } }
  });
})();
