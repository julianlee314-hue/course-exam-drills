'use strict';
const { steps, mcShuffle, who, where, stuff, simp, fmtFrac, lcm, gcd, isPerfectSquare } = require('../bank_helpers');

function factories() {
  return [

    {
      params: () => { const o=[]; for(let a=1;a<=6;a++)for(let b=-4;b<=6;b++)for(let x=-2;x<=5;x++)o.push({a,b,x}); return o.slice(0,50); },
      make: (f,p) => ({ section:'Functions', difficulty:'easy', type:'short', tags:['polynomial'],
        prompt:`p(x)=${p.a}x+${p.b} (${stuff(f)} poly @ ${where(f)}). p(${p.x})? (${who(f)})`,
        answer:String(p.a*p.x+p.b), solutionSteps: steps(`=${p.a*p.x+p.b}`) })
    },
    {
      params: () => { const o=[]; for(let a=1;a<=5;a++)for(let b=1;b<=7;b++)o.push({a,b}); return o; },
      make: (f,p) => ({ section:'Functions', difficulty:'medium', type:'short', tags:['inverse'],
        prompt:`f(x)=${p.a}x+${p.b}. f^{-1}(${p.b})? (${who(f)}, ${stuff(f)} @ ${where(f)})`,
        answer:'0', solutionSteps: steps(`f(0)=${p.b}`) })
    },
    {
      params: () => [
        {q:'Mathematical induction proves statements for all natural numbers (under hypotheses).',a:'True',s:'Standard use of induction.'},
        {q:'The inductive step assumes n=k and proves n=k+1.',a:'True',s:'Induction hypothesis.'},
        {q:'A base case is optional in induction.',a:'False',s:'Base case required.'}
      ],
      make: (f,p) => ({ section:'Proof & induction', difficulty:'medium', type:'tf', tags:['induction'],
        prompt:`True or false (${who(f)} @ ${where(f)}): ${p.q}`, answer:p.a, solutionSteps: steps(p.s) })
    },
    {
      params: () => { const o=[]; for(let n=3;n<=20;n++)o.push({n}); return o; },
      make: (f,p) => {
        const s=p.n*(p.n+1)/2;
        return { section:'Proof & induction', difficulty:'easy', type:'short', tags:['induction'],
          prompt:`1+2+…+${p.n} (induction warm-up with ${stuff(f)} at ${where(f)}). Sum? (${who(f)})`,
          answer:String(s), solutionSteps: steps(`n(n+1)/2=${s}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=8;a++)for(let b=1;b<=8;b++)o.push({a,b}); return o.slice(0,50); },
      make: (f,p) => {
        // |a+bi|=sqrt(a^2+b^2); ask squared modulus
        return { section:'Complex numbers', difficulty:'easy', type:'short', tags:['modulus'],
          prompt:`|${p.a}+${p.b}i|² for ${stuff(f)} signal at ${where(f)}. ${who(f)}?`,
          answer:String(p.a*p.a+p.b*p.b), solutionSteps: steps(`a²+b²=${p.a*p.a+p.b*p.b}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)for(let c=1;c<=6;c++)for(let d=1;d<=6;d++)o.push({a,b,c,d}); return o.slice(0,55); },
      make: (f,p) => ({ section:'Complex numbers', difficulty:'easy', type:'short', tags:['arithmetic'],
        prompt:`Re((${p.a}+${p.b}i)+(${p.c}+${p.d}i)) (${stuff(f)} @ ${where(f)}, ${who(f)}).`,
        answer:String(p.a+p.c), solutionSteps: steps(`Real parts ${p.a}+${p.c}`) })
    },
    {
      params: () => { const o=[]; for(let a=1;a<=8;a++)for(let b=1;b<=8;b++)o.push({a,b}); return o.slice(0,45); },
      make: (f,p) => ({ section:'Complex numbers', difficulty:'medium', type:'short', tags:['conjugate'],
        prompt:`(${p.a}+${p.b}i)(+conj) product equals? (${who(f)} modulus² of ${stuff(f)} at ${where(f)})`,
        answer:String(p.a*p.a+p.b*p.b), solutionSteps: steps(`z·conj(z)=|z|²=${p.a*p.a+p.b*p.b}`) })
    },
    {
      params: () => { const o=[]; for(let n=2;n<=8;n++)for(let c=1;c<=6;c++)o.push({n,c}); return o.slice(0,50); },
      make: (f,p) => ({ section:'Calculus', difficulty:'easy', type:'short', tags:['derivatives'],
        prompt:`d/dx[${p.c}x^${p.n}] coef of x^${p.n-1} (${who(f)}, ${stuff(f)} @ ${where(f)}).`,
        answer:String(p.c*p.n), solutionSteps: steps(`${p.c*p.n}`) })
    },
    {
      params: () => { const o=[]; for(let a=2;a<=6;a++)for(let n=2;n<=5;n++)o.push({a,n}); return o; },
      make: (f,p) => ({ section:'Calculus', difficulty:'medium', type:'short', tags:['chain rule'],
        prompt:`d/dx[(${p.a}x+1)^${p.n}] at x=0 (${stuff(f)} chain @ ${where(f)}, ${who(f)}).`,
        answer:String(p.n*p.a), solutionSteps: steps(`n(inner)^{n-1}·a at 0 → ${p.n*p.a}`) })
    },
    {
      params: () => { const o=[]; for(let n=1;n<=7;n++)for(let c=1;c<=6;c++)o.push({n,c}); return o.slice(0,50); },
      make: (f,p) => {
        const s=simp(p.c,p.n+1);
        return { section:'Calculus', difficulty:'easy', type:'short', tags:['integrals'],
          prompt:`∫${p.c}x^${p.n} dx coef of x^${p.n+1} (${who(f)} @ ${where(f)}; no +C).`,
          answer:s.str, solutionSteps: steps(`${s.str}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=0;a<=3;a++)for(let b=a+1;b<=6;b++)for(let c=1;c<=5;c++)o.push({a,b,c}); return o.slice(0,50); },
      make: (f,p) => ({ section:'Calculus', difficulty:'medium', type:'short', tags:['FTC'],
        prompt:`∫_${p.a}^${p.b} ${p.c} dx (${stuff(f)} @ ${where(f)}, ${who(f)}).`,
        answer:String(p.c*(p.b-p.a)), solutionSteps: steps(`${p.c*(p.b-p.a)}`) })
    },
    {
      params: () => { const o=[]; for(let a=1;a<=5;a++)for(let b=1;b<=5;b++)for(let c=1;c<=5;c++)for(let d=1;d<=5;d++)for(let e=0;e<=3;e++)for(let f_=0;f_<=3;f_++)o.push({a,b,c,d,e,f:f_}); return o.slice(0,60); },
      make: (f,p) => ({ section:'Vectors', difficulty:'easy', type:'short', tags:['dot'],
        prompt:`⟨${p.a},${p.b},${p.c}⟩·⟨${p.d},${p.e},${p.f}⟩ (${stuff(f)} @ ${where(f)}, ${who(f)}).`,
        answer:String(p.a*p.d+p.b*p.e+p.c*p.f), solutionSteps: steps(`${p.a*p.d+p.b*p.e+p.c*p.f}`) })
    },
    {
      params: () => { const o=[]; for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)for(let c=0;c<=5;c++)o.push({a,b,c}); return o.slice(0,50); },
      make: (f,p) => {
        const s2=p.a*p.a+p.b*p.b+p.c*p.c;
        return { section:'Vectors', difficulty:'easy', type:'short', tags:['magnitude'],
          prompt:`||⟨${p.a},${p.b},${p.c}⟩||² (${stuff(f)} @ ${where(f)}, ${who(f)}).`,
          answer:String(s2), solutionSteps: steps(`${s2}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=5;a++)for(let b=1;b<=5;b++)for(let c=1;c<=5;c++)for(let d=1;d<=5;d++)o.push({a,b,c,d}); return o.slice(0,50); },
      make: (f,p) => {
        // 2D cross magnitude ad-bc as k for i component of 2d
        const k=p.a*p.d-p.b*p.c;
        return { section:'Vectors', difficulty:'medium', type:'short', tags:['cross'],
          prompt:`⟨${p.a},${p.b},0⟩×⟨${p.c},${p.d},0⟩ k-component (${stuff(f)} @ ${where(f)}, ${who(f)}).`,
          answer:String(k), solutionSteps: steps(`${p.a}·${p.d}-${p.b}·${p.c}=${k}`) };
      }
    },
    {
      params: () => { const o=[]; for(let n=5;n<=12;n++)for(let k=2;k<=4;k++)o.push({n,k}); return o; },
      make: (f,p) => {
        let num=1,den=1; for(let i=0;i<p.k;i++){num*=p.n-i;den*=i+1;}
        return { section:'Combinatorics & series', difficulty:'medium', type:'short', tags:['binomial'],
          prompt:`C(${p.n},${p.k}) (${stuff(f)} teams @ ${where(f)}, ${who(f)}).`,
          answer:String(num/den), solutionSteps: steps(`${num/den}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=4;a++)for(let r=2;r<=3;r++)for(let n=2;n<=5;n++)o.push({a,r,n}); return o; },
      make: (f,p) => {
        const sum=p.a*(Math.pow(p.r,p.n)-1)/(p.r-1);
        return { section:'Combinatorics & series', difficulty:'medium', type:'short', tags:['geometric'],
          prompt:`Geo sum a=${p.a},r=${p.r},n=${p.n} terms of ${stuff(f)} at ${where(f)}. S_n? (${who(f)})`,
          answer:String(sum), solutionSteps: steps(`a(r^n-1)/(r-1)=${sum}`) };
      }
    },
    {
      params: () => { const o=[]; for(let pwr=2;pwr<=7;pwr++)o.push({p:pwr}); return o; },
      make: (f,p) => ({ section:'Combinatorics & series', difficulty:'easy', type:'tf', tags:['series'],
        prompt:`True or false (${who(f)}): ∑1/n^${p.p} converges (${stuff(f)} p-series @ ${where(f)}).`,
        answer:'True', solutionSteps: steps(`p>1`) })
    },
    {
      params: () => { const o=[]; for(let n=3;n<=7;n++)for(let base=3;base<=10;base++){const vals=[];for(let i=0;i<n;i++)vals.push(base+i*2);o.push({vals});} return o.slice(0,50); },
      make: (f,p) => {
        const sum=p.vals.reduce((a,b)=>a+b,0); const mean=sum/p.vals.length;
        const ans=Number.isInteger(mean)?String(mean):fmtFrac(sum,p.vals.length);
        return { section:'Statistics', difficulty:'easy', type:'short', tags:['mean'],
          prompt:`Mean of ${p.vals.join(',')} (${stuff(f)} @ ${where(f)}, ${who(f)}).`,
          answer:ans, solutionSteps: steps(`${ans}`) };
      }
    },
    {
      params: () => { const o=[]; for(let fav=1;fav<=9;fav++)for(let tot=fav+2;tot<=15;tot++)o.push({fav,tot}); return o.slice(0,50); },
      make: (f,p) => {
        const s=simp(p.fav,p.tot);
        return { section:'Statistics', difficulty:'easy', type:'short', tags:['probability'],
          prompt:`P=${p.fav}/${p.tot} of ${stuff(f)} at ${where(f)}. Simplify (${who(f)}).`,
          answer:s.str, solutionSteps: steps(`${s.str}`) };
      }
    },
    {
      params: () => [
        {q:'An odd function satisfies f(−x)=−f(x).',a:'True',s:'Definition.'},
        {q:'Every continuous function on [a,b] is differentiable on (a,b).',a:'False',s:'e.g. |x|.'},
        {q:'The modulus of a complex number is nonnegative.',a:'True',s:'|z|≥0.'}
      ],
      make: (f,p) => ({ section:'Functions', difficulty:'medium', type:'tf', tags:['theory'],
        prompt:`True or false (${who(f)} @ ${where(f)}): ${p.q}`, answer:p.a, solutionSteps: steps(p.s) })
    },
    {
      params: () => { const o=[]; for(let m=-5;m<=5;m++)if(m)for(let b=-4;b<=5;b++)for(let x=1;x<=4;x++)o.push({m,b,x}); return o.slice(0,50); },
      make: (f,p) => ({ section:'Functions', difficulty:'easy', type:'short', tags:['lines'],
        prompt:`y=${p.m}x${p.b>=0?'+':''}${p.b} at x=${p.x} (${stuff(f)} @ ${where(f)}, ${who(f)}). y?`,
        answer:String(p.m*p.x+p.b), solutionSteps: steps(`${p.m*p.x+p.b}`) })
    },
    {
      params: () => { const o=[]; for(let n=1;n<=6;n++)o.push({n}); return o; },
      make: (f,p) => ({ section:'Calculus', difficulty:'hard', type:'short', tags:['series'],
        prompt:`Maclaurin leading term of e^x is 1. Coefficient of x^${p.n}/n! in e^x is? (${who(f)}, ${stuff(f)} @ ${where(f)})`,
        answer:'1', solutionSteps: steps(`e^x=∑x^n/n!`, `coef=1`) })
    },
    {
      params: () => { const o=[]; for(let B=1;B<=8;B++)o.push({B}); return o; },
      make: (f,p) => {
        const ss=simp(2,p.B);
        let ans;
        if (ss.n===2 && ss.d===1) ans='2π';
        else if (ss.n===1 && ss.d===1) ans='π';
        else if (ss.n===1) ans=`π/${ss.d}`;
        else if (ss.d===1) ans=`${ss.n}π`;
        else ans=`${ss.n}π/${ss.d}`;
        return { section:'Functions', difficulty:'medium', type:'short', tags:['trig'],
          prompt:`Period of sin(${p.B}x) (${stuff(f)} wave @ ${where(f)}, ${who(f)}; in terms of π).`,
          answer:ans, solutionSteps: steps(`2π/${p.B}=${ans}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=5;a++)for(let b=-8;b<=8;b++)for(let c=-5;c<=5;c++){const d=b*b-4*a*c;o.push({a,b,c,d});} return o.slice(0,55); },
      make: (f,p) => ({ section:'Proof & induction', difficulty:'medium', type:'short', tags:['discriminant'],
        prompt:`Discriminant of ${p.a}x²${p.b>=0?'+':''}${p.b}x${p.c>=0?'+':''}${p.c} (${stuff(f)} @ ${where(f)}, ${who(f)}).`,
        answer:String(p.d), solutionSteps: steps(`b²−4ac=${p.d}`) })
    }

  ];
}
module.exports = { factories };
