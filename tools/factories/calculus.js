'use strict';
const { steps, mcShuffle, who, where, stuff, simp, fmtFrac, lcm, gcd, isPerfectSquare } = require('../bank_helpers');

function factories() {
  return [

    {
      params: () => { const o=[]; for(let a=1;a<=8;a++)for(let b=-5;b<=8;b++)for(let x=-3;x<=5;x++)o.push({a,b,x}); return o.slice(0,55); },
      make: (f,p) => {
        const ans=p.a*p.x+p.b;
        return { section:'Limits', difficulty:'easy', type:'short', tags:['limits'],
          prompt:`${who(f)} flies toward ${where(f)}: lim_{x→${p.x}} (${p.a}x${p.b>=0?'+':''}${p.b}) for a ${stuff(f)} gauge. Value?`,
          answer:String(ans), solutionSteps: steps(`Poly continuous`, `Plug x=${p.x} → ${ans}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)if(a!==b)o.push({a,b}); return o; },
      make: (f,p) => {
        // lim x→a (x^2-a^2)/(x-a) = 2a, use a=p.a
        const A=p.a;
        return { section:'Limits', difficulty:'medium', type:'short', tags:['limits'],
          prompt:`${who(f)} simplifies lim_{x→${A}} (x²−${A*A})/(x−${A}) near ${where(f)} (${stuff(f)} cancel).`,
          answer:String(2*A), solutionSteps: steps(`Factor (x−${A})(x+${A})`, `Cancel → lim x+${A} = ${2*A}`) };
      }
    },
    {
      params: () => { const o=[]; for(let n=2;n<=9;n++)for(let c=1;c<=8;c++)o.push({n,c}); return o.slice(0,50); },
      make: (f,p) => {
        // d/dx [c x^n] = c n x^{n-1}; ask coefficient of x^{n-1}
        const coef=p.c*p.n;
        return { section:'Derivatives', difficulty:'easy', type:'short', tags:['power rule'],
          prompt:`${who(f)} differentiates ${p.c}x^${p.n} (power of ${stuff(f)}) at ${where(f)}. Coefficient of x^${p.n-1}?`,
          answer:String(coef), solutionSteps: steps(`Power rule: ${p.c}·${p.n}=${coef}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)o.push({a,b}); return o; },
      make: (f,p) => {
        // (ax)'(bx) product at... ask d/dx[ax*bx]=d/dx[ab x^2]=2ab x; coefficient 2ab
        const coef=2*p.a*p.b;
        return { section:'Derivatives', difficulty:'medium', type:'short', tags:['product rule'],
          prompt:`${who(f)} uses product rule on (${p.a}x)(${p.b}x) for ${stuff(f)} at ${where(f)}. Coefficient of x in the derivative?`,
          answer:String(coef), solutionSteps: steps(`Product=${p.a*p.b}x²`, `Derivative ${coef}x`, `coef=${coef}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=2;a<=7;a++)for(let n=2;n<=5;n++)o.push({a,n}); return o; },
      make: (f,p) => {
        // d/dx (a x + 1)^n at x=0 → n(a*0+1)^{n-1}*a = n a
        const ans=p.n*p.a;
        return { section:'Derivatives', difficulty:'medium', type:'short', tags:['chain rule'],
          prompt:`Chain rule: d/dx[(${p.a}x+1)^${p.n}] at x=0 for a ${stuff(f)} link at ${where(f)}. ${who(f)}'s value?`,
          answer:String(ans), solutionSteps: steps(`n(inner)^{n-1}·inner'`, `At 0: ${p.n}·1·${p.a}=${ans}`) };
      }
    },
    {
      params: () => { const o=[]; for(let m=-5;m<=5;m++)if(m)for(let x0=-3;x0<=4;x0++)for(let b=-4;b<=5;b++)o.push({m,x0,b,y0:m*x0+b}); return o.slice(0,55); },
      make: (f,p) => {
        // tangent to y=mx+b is itself; slope is m
        return { section:'Applications of derivatives', difficulty:'medium', type:'short', tags:['tangent'],
          prompt:`Line y=${p.m}x${p.b>=0?'+':''}${p.b} of ${stuff(f)} paths at ${where(f)}. Slope of tangent at x=${p.x0}? (${who(f)})`,
          answer:String(p.m), solutionSteps: steps(`Derivative=${p.m}`, `Slope=${p.m}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=5;a++)for(let b=-8;b<=8;b++)if(b)o.push({a,b}); return o.slice(0,45); },
      make: (f,p) => {
        // f'=2ax+b=0 => x=-b/(2a)
        const s=simp(-p.b,2*p.a);
        return { section:'Applications of derivatives', difficulty:'medium', type:'short', tags:['critical points'],
          prompt:`f(x)=${p.a}x²${p.b>=0?'+':''}${p.b}x models ${stuff(f)} height at ${where(f)}. Critical x? (${who(f)})`,
          answer:s.str, solutionSteps: steps(`f'=2·${p.a}x+${p.b}=0`, `x=${s.str}`) };
      }
    },
    {
      params: () => { const o=[]; for(let n=1;n<=8;n++)for(let c=1;c<=6;c++)o.push({n,c}); return o.slice(0,50); },
      make: (f,p) => {
        // ∫ c x^n dx antideriv coef of x^{n+1} is c/(n+1)
        const s=simp(p.c,p.n+1);
        return { section:'Integrals', difficulty:'easy', type:'short', tags:['antiderivative'],
          prompt:`${who(f)} antidifferentiates ${p.c}x^${p.n} (flux of ${stuff(f)}) at ${where(f)}. Coefficient of x^${p.n+1} (ignore +C)?`,
          answer:s.str, solutionSteps: steps(`∫x^n = x^{n+1}/(n+1)`, `Coef=${s.str}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=0;a<=3;a++)for(let b=a+1;b<=6;b++)for(let c=1;c<=5;c++)o.push({a,b,c}); return o.slice(0,55); },
      make: (f,p) => {
        // ∫_a^b c dx = c(b-a)
        const ans=p.c*(p.b-p.a);
        return { section:'Integrals', difficulty:'easy', type:'short', tags:['definite integral'],
          prompt:`${who(f)} computes ∫_${p.a}^${p.b} ${p.c} dx of steady ${stuff(f)} flow at ${where(f)}.`,
          answer:String(ans), solutionSteps: steps(`${p.c}·(${p.b}-${p.a})=${ans}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=0;a<=2;a++)for(let b=a+2;b<=6;b++)o.push({a,b}); return o; },
      make: (f,p) => {
        // avg value of x on [a,b] = (a+b)/2
        const s=simp(p.a+p.b,2);
        return { section:'Integrals', difficulty:'medium', type:'short', tags:['average value'],
          prompt:`Average value of f(x)=x on [${p.a},${p.b}] for ${stuff(f)} readout (${who(f)} @ ${where(f)}).`,
          answer:s.str, solutionSteps: steps(`(1/(b-a))∫x dx`, `(${p.a}+${p.b})/2=${s.str}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=8;a++)for(let b=a+1;b<=10;b++)o.push({a,b}); return o.slice(0,50); },
      make: (f,p) => {
        // area under y=1 from a to b is b-a
        return { section:'Applications of integrals', difficulty:'easy', type:'short', tags:['area'],
          prompt:`Area under y=1 from x=${p.a} to ${p.b} (strip of ${stuff(f)} at ${where(f)}). ${who(f)}'s area?`,
          answer:String(p.b-p.a), solutionSteps: steps(`Width=${p.b-p.a}`) };
      }
    },
    {
      params: () => { const o=[]; for(let r=1;r<=8;r++)o.push({r}); return o; },
      make: (f,p,salt) => {
        // disk volume π r^2 * 1 for height 1 cylinder - ask π coefficient = r^2
        return { section:'Applications of integrals', difficulty:'medium', type:'short', tags:['volume'],
          prompt:`Disk method: rotate y=${p.r} (constant) about x-axis from 0 to 1 — volume is kπ. ${who(f)} finds k (${stuff(f)} @ ${where(f)}).`,
          answer:String(p.r*p.r), solutionSteps: steps(`V=π∫r² dx=πr²`, `k=${p.r*p.r}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=2;a<=5;a++)for(let n=2;n<=6;n++)o.push({a,n,r:1/a}); return o; },
      make: (f,p) => {
        // geo sum S=a(1-r^n)/(1-r) with first term 1, ratio 1/a? Use sum 1+1/2+... better: sum of geo with a=p.a, r=1/2, n terms? 
        // Infinite |r|<1: sum = a/(1-r) with first term a ratio r=1/p.a? Use first=1, r=1/p.a
        const r=p.a; // denominator
        const s=simp(r, r-1); // 1/(1-1/r)=r/(r-1)
        return { section:'Series', difficulty:'medium', type:'short', tags:['geometric series'],
          prompt:`Infinite geo series of ${stuff(f)}: 1 + 1/${r} + 1/${r}² + … at ${where(f)}. Sum? (${who(f)}; simplified fraction)`,
          answer:s.str, solutionSteps: steps(`Sum=1/(1−1/${r})=${s.str}`) };
      }
    },
    {
      params: () => { const o=[]; for(let r=2;r<=9;r++)o.push({r}); return o; },
      make: (f,p) => ({ section:'Series', difficulty:'easy', type:'tf', tags:['convergence'],
        prompt:`True or false (${who(f)} @ ${where(f)}): the geo series with ratio r=1/${p.r} converges.`,
        answer:'True', solutionSteps: steps(`|r|=1/${p.r}<1 ⇒ converges`) })
    },
    {
      params: () => { const o=[]; for(let a=1;a<=5;a++)for(let b=1;b<=5;b++)for(let x=1;x<=4;x++)for(let y=1;y<=4;y++)o.push({a,b,x,y}); return o.slice(0,55); },
      make: (f,p) => {
        // f=ax+by; f_x=a
        return { section:'Multivariable', difficulty:'medium', type:'short', tags:['partial derivatives'],
          prompt:`f(x,y)=${p.a}x+${p.b}y models ${stuff(f)} at ${where(f)}. ∂f/∂x? (${who(f)})`,
          answer:String(p.a), solutionSteps: steps(`Treat y constant`, `∂f/∂x=${p.a}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)o.push({a,b}); return o; },
      make: (f,p) => ({ section:'Multivariable', difficulty:'easy', type:'short', tags:['gradient'],
        prompt:`∇(${p.a}x+${p.b}y) for ${stuff(f)} field at ${where(f)}. First component? (${who(f)})`,
        answer:String(p.a), solutionSteps: steps(`∇=⟨${p.a},${p.b}⟩`, `First=${p.a}`) })
    },
    {
      params: () => { const o=[]; for(let a=1;a<=5;a++)for(let b=1;b<=4;b++)for(let c=1;c<=4;c++)o.push({a,b,c}); return o.slice(0,50); },
      make: (f,p) => {
        // ∫_0^a ∫_0^b c dy dx = c a b
        return { section:'Multivariable', difficulty:'easy', type:'short', tags:['double integral'],
          prompt:`∬_R ${p.c} dA over 0≤x≤${p.a}, 0≤y≤${p.b} (${stuff(f)} slab @ ${where(f)}). ${who(f)}?`,
          answer:String(p.c*p.a*p.b), solutionSteps: steps(`${p.c}·area=${p.c}*${p.a}*${p.b}=${p.c*p.a*p.b}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=8;a++)for(let b=1;b<=8;b++)for(let c=0;c<=6;c++)o.push({a,b,c}); return o.slice(0,55); },
      make: (f,p) => {
        // ||<a,b,c>|| if perfect square
        const s2=p.a*p.a+p.b*p.b+p.c*p.c;
        if(!isPerfectSquare(s2)) {
          // ask squared magnitude instead
          return { section:'Vectors', difficulty:'easy', type:'short', tags:['magnitude'],
            prompt:`Vector ⟨${p.a},${p.b},${p.c}⟩ of ${stuff(f)} thrust at ${where(f)}. ${who(f)} finds ||v||².`,
            answer:String(s2), solutionSteps: steps(`${p.a}²+${p.b}²+${p.c}²=${s2}`) };
        }
        return { section:'Vectors', difficulty:'easy', type:'short', tags:['magnitude'],
          prompt:`||⟨${p.a},${p.b},${p.c}⟩|| for ${stuff(f)} at ${where(f)}. ${who(f)}?`,
          answer:String(Math.round(Math.sqrt(s2))), solutionSteps: steps(`√${s2}=${Math.round(Math.sqrt(s2))}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)for(let c=1;c<=6;c++)for(let d=1;d<=6;d++)o.push({a,b,c,d}); return o.slice(0,55); },
      make: (f,p) => ({ section:'Vectors', difficulty:'easy', type:'short', tags:['dot product'],
        prompt:`⟨${p.a},${p.b}⟩·⟨${p.c},${p.d}⟩ of ${stuff(f)} directions at ${where(f)}. ${who(f)}?`,
        answer:String(p.a*p.c+p.b*p.d), solutionSteps: steps(`${p.a}·${p.c}+${p.b}·${p.d}=${p.a*p.c+p.b*p.d}`) })
    },
    {
      params: () => [
        {q:'If lim f exists, then f is continuous there.',a:'False',s:'Limit existence alone ≠ continuity (need f(a)=limit).'},
        {q:'d/dx[x^n]=n x^{n-1} for n a positive integer.',a:'True',s:'Power rule.'},
        {q:'A geometric series with |r|≥1 always converges.',a:'False',s:'Needs |r|<1.'},
        {q:'The derivative of a constant is 0.',a:'True',s:'Flat slope.'},
        {q:'∫_a^a f(x)dx = 0.',a:'True',s:'Zero-width interval.'},
        {q:'Partial of ax+by w.r.t. x is b.',a:'False',s:'It is a.'}
      ],
      make: (f,p) => ({ section:'Limits', difficulty:'easy', type:'tf', tags:['theory'],
        prompt:`True or false (${who(f)} debating at ${where(f)}): ${p.q}`, answer:p.a, solutionSteps: steps(p.s) })
    }

  ];
}
module.exports = { factories };
