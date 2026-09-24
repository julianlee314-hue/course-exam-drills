'use strict';

const { steps, mcShuffle, who, where, stuff, simp, fmtFrac, lcm, gcd } = require('../bank_helpers');

function factories() {
  return [
    {
      params: (r) => {
        const out = [];
        for (let a = 2; a <= 12; a++) for (let b = 2; b <= 9; b++) for (let c = 1; c <= 8; c++)
          if ((a + b + c + r) % 2 === 0) out.push({ a, b, c });
        return out.slice(0, 50);
      },
      make: (f, p) => {
        const ans = p.a + p.b * p.c;
        return { section: 'Number', difficulty: 'easy', type: 'short', tags: ['order of operations'],
          prompt: `${who(f)} finds ${p.a} + ${p.b} × ${p.c} stacks of ${stuff(f)} near ${where(f)}. Evaluate.`,
          answer: String(ans),
          solutionSteps: steps(`Multiplication first: ${p.b}×${p.c}=${p.b * p.c}`, `Then ${p.a}+${p.b * p.c}=${ans}`) };
      }
    },
    {
      params: (r) => {
        const dens = [2,3,4,5,6,8,10]; const out = [];
        for (const d1 of dens) for (const d2 of dens) if (d1 !== d2) {
          out.push({ n1: 1 + ((r + d1) % (d1 - 1)), d1, n2: 1 + ((r + d2 * 2) % (d2 - 1)), d2 });
        }
        return out.slice(0, 48);
      },
      make: (f, p) => {
        const den = lcm(p.d1, p.d2);
        const num = p.n1 * (den / p.d1) + p.n2 * (den / p.d2);
        const s = simp(num, den);
        return { section: 'Number', difficulty: 'easy', type: 'short', tags: ['fractions'],
          prompt: `At ${where(f)}, ${who(f)} combines ${p.n1}/${p.d1} + ${p.n2}/${p.d2} crates of ${stuff(f)}. Simplify.`,
          answer: s.str,
          solutionSteps: steps(`LCD=${den}`, `Sum=${num}/${den}=${s.str}`) };
      }
    },
    {
      params: (r) => {
        const ps = [5,10,15,20,25,30,40,50,75]; const out = [];
        for (const pct of ps) for (let k = 2; k <= 40; k++) if ((k + r) % 2 === 0) out.push({ pct, amount: k * 10 });
        return out.slice(0, 50);
      },
      make: (f, p) => {
        const ans = (p.pct * p.amount) / 100;
        return { section: 'Number', difficulty: 'easy', type: 'short', tags: ['percentages'],
          prompt: `${who(f)} needs ${p.pct}% of ${p.amount} ${stuff(f)} at ${where(f)}. How many?`,
          answer: String(ans), solutionSteps: steps(`(${p.pct}/100)×${p.amount}=${ans}`) };
      }
    },
    {
      params: (r) => {
        const out = [];
        for (let a = 2; a <= 9; a++) for (let b = 2; b <= 9; b++) if (a !== b) {
          const total = (a + b) * (2 + ((r + a) % 6));
          out.push({ a, b, total });
        }
        return out.slice(0, 50);
      },
      make: (f, p) => {
        const parts = p.a + p.b; const one = p.total / parts; const ans = one * p.a;
        return { section: 'Number', difficulty: 'medium', type: 'short', tags: ['ratio'],
          prompt: `${who(f)} and ${f.char2} share ${p.total} ${stuff(f)} in ratio ${p.a}:${p.b} at ${where(f)}. How many for ${who(f)}?`,
          answer: String(ans), solutionSteps: steps(`Parts=${parts}`, `One part=${one}`, `${who(f)} gets ${ans}`) };
      }
    },
    {
      params: (r) => {
        const out = [];
        for (let a = 2; a <= 9; a++) for (let b = 1; b <= 8; b++) for (let x = 1; x <= 9; x++)
          if ((a + x + r) % 2 === 0) out.push({ a, b, x });
        return out.slice(0, 50);
      },
      make: (f, p) => {
        const ans = p.a * p.x + p.b;
        return { section: 'Algebra', difficulty: 'easy', type: 'short', tags: ['substitution'],
          prompt: `Score formula ${p.a}x+${p.b} for ${stuff(f)} at ${where(f)}. ${who(f)} sets x=${p.x}. Score?`,
          answer: String(ans), solutionSteps: steps(`${p.a}(${p.x})+${p.b}=${ans}`) };
      }
    },
    {
      params: (r) => {
        const out = [];
        for (let a = 2; a <= 9; a++) for (let b = -8; b <= 8; b++) if (b !== 0) {
          for (let x = -5; x <= 8; x++) if (x !== 0 && (x + a + r) % 2 === 0)
            out.push({ a, b, rhs: a * x + b });
        }
        return out.slice(0, 55);
      },
      make: (f, p) => {
        const x = (p.rhs - p.b) / p.a;
        const bStr = p.b >= 0 ? `+ ${p.b}` : `− ${-p.b}`;
        return { section: 'Algebra', difficulty: 'easy', type: 'short', tags: ['equations'],
          prompt: `Solve ${p.a}x ${bStr} = ${p.rhs} (${stuff(f)} count for ${who(f)} at ${where(f)}).`,
          answer: String(x), solutionSteps: steps(`${p.a}x=${p.rhs - p.b}`, `x=${x}`) };
      }
    },
    {
      params: (r) => {
        const out = [];
        for (let a = 2; a <= 8; a++) for (let n = 2; n <= 7; n++) for (let k = 1; k <= 6; k++)
          if ((a + n + r) % 2 === 0) out.push({ a, n, k });
        return out.slice(0, 50);
      },
      make: (f, p) => {
        const ans = p.a * p.n;
        return { section: 'Algebra', difficulty: 'easy', type: 'short', tags: ['expand'],
          prompt: `${who(f)} expands ${p.a}(${p.n}x+${p.k}) sorting ${stuff(f)} at ${where(f)}. Coefficient of x?`,
          answer: String(ans), solutionSteps: steps(`${p.a}·${p.n}=${ans}`) };
      }
    },
    {
      params: (r) => {
        const out = [];
        for (let a = 1; a <= 10; a++) for (let d = 2; d <= 9; d++) for (let n = 3; n <= 10; n++)
          if ((a + d + n + r) % 3 === 0) out.push({ a, d, n });
        return out.slice(0, 55);
      },
      make: (f, p) => {
        const term = p.a + (p.n - 1) * p.d;
        return { section: 'Algebra', difficulty: 'medium', type: 'short', tags: ['sequences'],
          prompt: `Arithmetic ${stuff(f)} line at ${where(f)}: a1=${p.a}, d=${p.d}. ${who(f)} wants term ${p.n}.`,
          answer: String(term), solutionSteps: steps(`a_n=a+(n-1)d`, `a_${p.n}=${term}`) };
      }
    },
    {
      params: () => {
        const out = [];
        for (let b = 4; b <= 24; b += 2) for (let h = 3; h <= 21; h += 3) out.push({ b, h });
        return out.slice(0, 55);
      },
      make: (f, p) => {
        const raw = p.b * p.h; const ans = raw % 2 === 0 ? String(raw / 2) : fmtFrac(raw, 2);
        return { section: 'Geometry', difficulty: 'easy', type: 'short', tags: ['area'],
          prompt: `Triangular ${stuff(f)} banner at ${where(f)}: base ${p.b}, height ${p.h}. ${who(f)} finds area.`,
          answer: ans, solutionSteps: steps(`Area=½·${p.b}·${p.h}=${ans}`) };
      }
    },
    {
      params: (r) => {
        const triples = [[3,4,5],[5,12,13],[6,8,10],[7,24,25],[8,15,17],[9,12,15],[9,40,41],[20,21,29]];
        const out = [];
        for (const [a,b,c] of triples) for (let k = 1; k <= 4; k++) out.push({ a: a*k, b: b*k, c: c*k });
        return out;
      },
      make: (f, p) => ({ section: 'Geometry', difficulty: 'medium', type: 'short', tags: ['Pythagoras'],
        prompt: `Right path of ${stuff(f)} near ${where(f)} has legs ${p.a} and ${p.b}. ${who(f)} needs hypotenuse.`,
        answer: String(p.c), solutionSteps: steps(`c²=${p.a}²+${p.b}²`, `c=${p.c}`) })
    },
    {
      params: () => {
        const out = [];
        for (let a = 20; a <= 100; a += 5) for (let b = 20; b <= 100; b += 5)
          if (a + b < 170) out.push({ a, b });
        return out.slice(0, 60);
      },
      make: (f, p) => {
        const c = 180 - p.a - p.b;
        return { section: 'Geometry', difficulty: 'easy', type: 'short', tags: ['angles'],
          prompt: `Triangle of ${stuff(f)} markers at ${where(f)} has angles ${p.a}° and ${p.b}°. ${who(f)} finds the third.`,
          answer: String(c), solutionSteps: steps(`180−${p.a}−${p.b}=${c}`) };
      }
    },
    {
      params: (r) => {
        const out = [];
        for (let n = 3; n <= 7; n++) for (let base = 2; base <= 15; base++) {
          const vals = []; for (let i = 0; i < n; i++) vals.push(base + i * (1 + (r + base) % 4));
          out.push({ vals });
        }
        return out.slice(0, 55);
      },
      make: (f, p) => {
        const sum = p.vals.reduce((a,b)=>a+b,0);
        const mean = sum / p.vals.length;
        const ans = Number.isInteger(mean) ? String(mean) : fmtFrac(sum, p.vals.length);
        return { section: 'Statistics', difficulty: 'easy', type: 'short', tags: ['averages'],
          prompt: `${who(f)} records ${stuff(f)} counts at ${where(f)}: ${p.vals.join(', ')}. Mean?`,
          answer: ans, solutionSteps: steps(`Sum=${sum}`, `Mean=${ans}`) };
      }
    },
    {
      params: () => {
        const out = [];
        for (let fav = 1; fav <= 10; fav++) for (let tot = fav + 1; tot <= 16; tot++) out.push({ fav, tot });
        return out.slice(0, 60);
      },
      make: (f, p) => {
        const s = simp(p.fav, p.tot);
        return { section: 'Statistics', difficulty: 'easy', type: 'short', tags: ['probability'],
          prompt: `Bag at ${where(f)}: ${p.tot} ${stuff(f)}, ${p.fav} favorites of ${who(f)}. P(favorite) simplified?`,
          answer: s.str, solutionSteps: steps(`${p.fav}/${p.tot} → ${s.str}`) };
      }
    },
    {
      params: (r) => {
        const out = [];
        for (let a = -12; a <= 12; a++) for (let b = -12; b <= 12; b++) {
          if (!a || !b) continue;
          if ((a + b + r) % 3 === 0) out.push({ a, b, op: (a + b) % 2 === 0 ? 'add' : 'mul' });
        }
        return out.slice(0, 70);
      },
      make: (f, p) => {
        const ans = p.op === 'add' ? p.a + p.b : p.a * p.b;
        const expr = p.op === 'add' ? `${p.a}+(${p.b})` : `${p.a}×(${p.b})`;
        return { section: 'Number', difficulty: 'easy', type: 'short', tags: ['negatives'],
          prompt: `${who(f)} evaluates ${expr} on a ${stuff(f)} ledger at ${where(f)}.`,
          answer: String(ans), solutionSteps: steps(`${expr}=${ans}`) };
      }
    },
    {
      params: (r) => {
        const out = [];
        for (let n = 105; n <= 990; n += 7) out.push({ n, dp: ((n + r) % 2 === 0) ? 10 : 100 });
        return out.slice(0, 60);
      },
      make: (f, p) => {
        const ans = Math.round(p.n / p.dp) * p.dp;
        return { section: 'Number', difficulty: 'easy', type: 'short', tags: ['rounding'],
          prompt: `${who(f)} rounds ${p.n} ${stuff(f)} at ${where(f)} to nearest ${p.dp}.`,
          answer: String(ans), solutionSteps: steps(`Round ${p.n} → ${ans}`) };
      }
    },
    {
      params: () => {
        const out = [];
        for (let a = 2; a <= 12; a++) for (let b = 2; b <= 12; b++) out.push({ a, b });
        return out.slice(0, 60);
      },
      make: (f, p, salt) => {
        const ans = p.a * p.b;
        const mc = mcShuffle(ans, [ans + p.a, Math.abs(ans - p.b), p.a + p.b], salt);
        return { section: 'Number', difficulty: 'easy', type: 'mc', tags: ['multiplication'],
          prompt: `${who(f)} multiplies ${p.a}×${p.b} batches of ${stuff(f)} at ${where(f)}.`,
          options: mc.options, answer: mc.answer, solutionSteps: steps(`${p.a}×${p.b}=${ans}`) };
      }
    },
    {
      params: () => [
        { q: 'Angles in a triangle sum to 180°.', a: 'True', s: 'Standard Euclidean fact.' },
        { q: 'A negative times a negative is negative.', a: 'False', s: 'Negative × negative = positive.' },
        { q: 'Percent means per hundred.', a: 'True', s: 'cent = 100.' },
        { q: 'The mean must be a data value.', a: 'False', s: 'Mean can fall between values.' },
        { q: 'A square is a rectangle.', a: 'True', s: 'Square is a special rectangle.' },
        { q: 'Prime numbers have exactly two distinct positive divisors.', a: 'True', s: 'Definition of prime.' },
        { q: '0.25 equals 1/4.', a: 'True', s: '0.25 = 25/100 = 1/4.' },
        { q: 'Perimeter measures area inside a shape.', a: 'False', s: 'Perimeter is distance around.' }
      ],
      make: (f, p) => ({ section: 'Number', difficulty: 'easy', type: 'tf', tags: ['concepts'],
        prompt: `True or false (${who(f)} at ${where(f)}): ${p.q}`,
        answer: p.a, solutionSteps: steps(p.s) })
    }
  ];
}
module.exports = { factories };
