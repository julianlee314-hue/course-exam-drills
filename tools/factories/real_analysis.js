'use strict';
const { steps, mcShuffle, who, where, stuff, simp, fmtFrac, lcm, gcd, isPerfectSquare } = require('../bank_helpers');

function factories() {
  return [

    {
      params: () => [
        {q:'Every convergent sequence is bounded.',a:'True',s:'Standard theorem.'},
        {q:'Every bounded sequence converges.',a:'False',s:'e.g. (-1)^n.'},
        {q:'A set can have two different least upper bounds.',a:'False',s:'sup is unique when it exists.'},
        {q:'Continuous image of a closed interval is a closed interval.',a:'True',s:'EVT / connectedness on R.'},
        {q:'If ∑a_n converges, then a_n → 0.',a:'True',s:'Term test (necessary).'},
        {q:'If a_n → 0, then ∑a_n converges.',a:'False',s:'Harmonic series.'},
        {q:'Q is complete as a metric space with usual metric.',a:'False',s:'√2 Cauchy sequence in Q.'},
        {q:'The nested interval property needs completeness of R.',a:'True',s:'Equivalent to completeness ideas.'}
      ],
      make: (f,p) => ({ section:'Definitions & theory', difficulty:'medium', type:'tf', tags:['theory'],
        prompt:`True or false (${who(f)} proving near ${where(f)}, ε-δ vibes with ${stuff(f)}): ${p.q}`,
        answer:p.a, solutionSteps: steps(p.s) })
    },
    {
      params: () => { const o=[]; for(let c=-5;c<=8;c++)o.push({c}); return o; },
      make: (f,p) => ({ section:'Sequences', difficulty:'easy', type:'short', tags:['limits'],
        prompt:`Constant sequence a_n=${p.c} of ${stuff(f)} counts at ${where(f)}. lim a_n? (${who(f)})`,
        answer:String(p.c), solutionSteps: steps(`Constant sequence → ${p.c}`) })
    },
    {
      params: () => { const o=[]; for(let k=1;k<=12;k++)o.push({k}); return o; },
      make: (f,p) => ({ section:'Sequences', difficulty:'easy', type:'short', tags:['limits'],
        prompt:`a_n=1/n (Platform 9¾ style thinning of ${stuff(f)} at ${where(f)}). lim a_n? (${who(f)})`,
        answer:'0', solutionSteps: steps(`1/n → 0`) })
    },
    {
      params: () => { const o=[]; for(let r=2;r<=9;r++)o.push({r}); return o; },
      make: (f,p) => ({ section:'Sequences', difficulty:'medium', type:'short', tags:['geometric'],
        prompt:`a_n=(1/${p.r})^n of fading ${stuff(f)} at ${where(f)}. lim a_n? (${who(f)})`,
        answer:'0', solutionSteps: steps(`|1/${p.r}|<1 ⇒ geo → 0`) })
    },
    {
      params: () => { const o=[]; for(let epsN=1;epsN<=20;epsN++)o.push({N:epsN, eps: simp(1,epsN).str}); return o; },
      make: (f,p) => {
        // For a_n=1/n, need N>1/ε. If ε=1/M, N=M works. Ask smallest integer N with 1/N < 1/p.N i.e. N>p.N so N=p.N+1
        const N=p.N+1;
        return { section:'Sequences', difficulty:'hard', type:'short', tags:['epsilon'],
          prompt:`Death Star trench ε–N: a_n=1/n, ε=1/${p.N}. Smallest integer N₀ so n≥N₀ ⇒ |a_n|≤ε? (${who(f)} @ ${where(f)})`,
          answer:String(p.N), solutionSteps: steps(`Need 1/n ≤ 1/${p.N}`, `n≥${p.N}`, `N₀=${p.N}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=9;a++)for(let b=a+1;b<=12;b++)o.push({a,b}); return o.slice(0,50); },
      make: (f,p) => {
        return { section:'Completeness', difficulty:'medium', type:'short', tags:['supremum'],
          prompt:`S=(${p.a},${p.b}) ⊂ R (${stuff(f)} open interval @ ${where(f)}). sup S? (${who(f)})`,
          answer:String(p.b), solutionSteps: steps(`Least upper bound is ${p.b}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=0;a<=8;a++)for(let b=a+1;b<=12;b++)o.push({a,b}); return o.slice(0,50); },
      make: (f,p) => ({ section:'Completeness', difficulty:'medium', type:'short', tags:['infimum'],
        prompt:`S=(${p.a},${p.b}) of ${stuff(f)} levels at ${where(f)}. inf S? (${who(f)})`,
        answer:String(p.a), solutionSteps: steps(`Greatest lower bound=${p.a}`) })
    },
    {
      params: () => { const o=[]; for(let n=1;n<=15;n++)o.push({n}); return o; },
      make: (f,p) => ({ section:'Completeness', difficulty:'easy', type:'short', tags:['nested intervals'],
        prompt:`I_n=[0,1/n]. ∩_{n=1..∞} I_n has how many points? (${who(f)} nesting ${stuff(f)} at ${where(f)})`,
        answer:'1', solutionSteps: steps(`Intersection is {0}`, `1 point`) })
    },
    {
      params: () => { const o=[]; for(let a=1;a<=6;a++)for(let b=-3;b<=5;b++)for(let x=-2;x<=4;x++)o.push({a,b,x}); return o.slice(0,55); },
      make: (f,p) => {
        const y=p.a*p.x+p.b;
        return { section:'Continuity', difficulty:'easy', type:'short', tags:['continuity'],
          prompt:`f(x)=${p.a}x${p.b>=0?'+':''}${p.b} continuous everywhere. f(${p.x})? (${who(f)} @ ${where(f)}, ${stuff(f)})`,
          answer:String(y), solutionSteps: steps(`Evaluate → ${y}`) };
      }
    },
    {
      params: () => [
        {q:'IVT needs continuity on a closed interval.',a:'True',s:'Hypothesis of IVT.'},
        {q:'A function discontinuous everywhere can still hit every intermediate value.',a:'False',s:'IVT needs continuity.'},
        {q:'Polynomials are continuous on R.',a:'True',s:'Standard.'}
      ],
      make: (f,p) => ({ section:'Continuity', difficulty:'medium', type:'tf', tags:['IVT'],
        prompt:`True or false (${who(f)} @ ${where(f)}): ${p.q}`, answer:p.a, solutionSteps: steps(p.s) })
    },
    {
      params: () => { const o=[]; for(let pwr=2;pwr<=8;pwr++)o.push({p:pwr}); return o; },
      make: (f,p) => ({ section:'Series', difficulty:'easy', type:'tf', tags:['p-series'],
        prompt:`True or false (${who(f)}): ∑ 1/n^${p.p} converges (p-series of ${stuff(f)} at ${where(f)}).`,
        answer: 'True',
        solutionSteps: steps(`p=${p.p}>1 ⇒ converges`) })
    },
    {
      params: () => [
        {q:'∑1/n diverges.',a:'True',s:'Harmonic series.'},
        {q:'Absolute convergence implies convergence.',a:'True',s:'Standard.'},
        {q:'Conditional convergence implies absolute convergence.',a:'False',s:'Opposite direction false.'},
        {q:'If a_n≥0 and partial sums bounded, ∑a_n converges.',a:'True',s:'Monotone convergence.'}
      ],
      make: (f,p) => ({ section:'Series', difficulty:'medium', type:'tf', tags:['series'],
        prompt:`True or false (${who(f)} @ ${where(f)}): ${p.q}`, answer:p.a, solutionSteps: steps(p.s) })
    },
    {
      params: () => { const o=[]; for(let a=1;a<=10;a++)o.push({a}); return o; },
      make: (f,p) => ({ section:'Sequences', difficulty:'medium', type:'tf', tags:['monotone'],
        prompt:`True or false: a_n=n+${p.a} is eventually increasing (${stuff(f)} tally @ ${where(f)}, ${who(f)}).`,
        answer:'True', solutionSteps: steps(`a_{n+1}-a_n=1>0`) })
    },
    {
      params: () => { const o=[]; for(let M=2;M<=15;M++)o.push({M}); return o; },
      make: (f,p) => ({ section:'Sequences', difficulty:'hard', type:'short', tags:['Cauchy'],
        prompt:`For a_n=1/n, pick N so m,n≥N ⇒ |a_m-a_n|<1/${p.M}. One valid N is? (use N=${p.M}) (${who(f)} @ ${where(f)})`,
        answer:String(p.M), solutionSteps: steps(`|1/m-1/n|<1/N for m,n≥N`, `N=${p.M} works for ε=1/${p.M}`) })
    },
    {
      params: () => { const o=[]; for(let n=2;n<=20;n++)o.push({n}); return o; },
      make: (f,p,salt) => {
        const mc=mcShuffle('0',[ '1', String(p.n), '∞'],salt);
        return { section:'Sequences', difficulty:'easy', type:'mc', tags:['limits'],
          prompt:`lim (1/${p.n})^k as k→∞ of shrinking ${stuff(f)} at ${where(f)}. ${who(f)} chooses:`,
          options:mc.options, answer:mc.answer, solutionSteps: steps(`|r|<1 ⇒ →0`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=2;a<=9;a++)for(let b=1;b<=5;b++)o.push({a,b}); return o; },
      make: (f,p) => ({ section:'Definitions & theory', difficulty:'hard', type:'short', tags:['proof'],
        prompt:`Fill blank: to show lim a_n=L, for every ε>0 there exists N such that n≥N ⇒ |a_n−L| < ____. (${who(f)}'s ${stuff(f)} proof at ${where(f)}; answer ε)`,
        answer:'ε', solutionSteps: steps(`Definition uses < ε`) })
    }

  ];
}
module.exports = { factories };
