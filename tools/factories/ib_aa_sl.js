'use strict';
const { steps, mcShuffle, who, where, stuff, simp, fmtFrac, lcm, gcd, isPerfectSquare } = require('../bank_helpers');

function factories() {
  return [

    {
      params: () => { const o=[]; for(let a=1;a<=6;a++)for(let b=-5;b<=6;b++)for(let x=-3;x<=5;x++)o.push({a,b,x}); return o.slice(0,55); },
      make: (f,p) => ({ section:'Functions', difficulty:'easy', type:'short', tags:['evaluate'],
        prompt:`f(x)=${p.a}x${p.b>=0?'+':''}${p.b} for ${stuff(f)} meter at ${where(f)}. ${who(f)} finds f(${p.x}).`,
        answer:String(p.a*p.x+p.b), solutionSteps: steps(`f(${p.x})=${p.a*p.x+p.b}`) })
    },
    {
      params: () => { const o=[]; for(let a=1;a<=5;a++)for(let b=1;b<=8;b++)o.push({a,b}); return o; },
      make: (f,p) => {
        // inverse of y=ax+b is (x-b)/a; ask inverse at x=b → 0
        return { section:'Functions', difficulty:'medium', type:'short', tags:['inverse'],
          prompt:`f(x)=${p.a}x+${p.b}. ${who(f)} evaluates f^{-1}(${p.b}) for ${stuff(f)} unlock at ${where(f)}.`,
          answer:'0', solutionSteps: steps(`f(0)=${p.b}`, `f^{-1}(${p.b})=0`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=2;a<=9;a++)for(let b=-6;b<=6;b++)if(b)for(let x=1;x<=6;x++)o.push({a,b,rhs:a*x+b}); return o.slice(0,55); },
      make: (f,p) => {
        const x=(p.rhs-p.b)/p.a; const bStr=p.b>=0?`+ ${p.b}`:`− ${-p.b}`;
        return { section:'Algebra', difficulty:'easy', type:'short', tags:['linear'],
          prompt:`Solve ${p.a}x ${bStr}=${p.rhs} (${stuff(f)} quota, ${who(f)} @ ${where(f)}).`,
          answer:String(x), solutionSteps: steps(`x=${x}`) };
      }
    },
    {
      params: () => { const o=[]; for(let p_=1;p_<=8;p_++)for(let q=1;q<=8;q++)if(p_!==q)o.push({p:p_,q,sum:p_+q,prod:p_*q}); return o.slice(0,55); },
      make: (f,p) => ({ section:'Algebra', difficulty:'medium', type:'short', tags:['quadratic'],
        prompt:`x²−${p.sum}x+${p.prod}=0 for ${stuff(f)} at ${where(f)}. Larger root? (${who(f)})`,
        answer:String(Math.max(p.p,p.q)), solutionSteps: steps(`Roots ${p.p},${p.q}`, `Larger=${Math.max(p.p,p.q)}`) })
    },
    {
      params: () => { const o=[]; for(let n=2;n<=8;n++)for(let c=1;c<=7;c++)o.push({n,c}); return o.slice(0,50); },
      make: (f,p) => ({ section:'Calculus', difficulty:'easy', type:'short', tags:['derivatives'],
        prompt:`d/dx[${p.c}x^${p.n}] coefficient of x^${p.n-1} (${stuff(f)} @ ${where(f)}, ${who(f)}).`,
        answer:String(p.c*p.n), solutionSteps: steps(`${p.c}·${p.n}=${p.c*p.n}`) })
    },
    {
      params: () => { const o=[]; for(let n=1;n<=7;n++)for(let c=1;c<=6;c++)o.push({n,c}); return o.slice(0,50); },
      make: (f,p) => {
        const s=simp(p.c,p.n+1);
        return { section:'Calculus', difficulty:'easy', type:'short', tags:['integration'],
          prompt:`∫ ${p.c}x^${p.n} dx — coefficient of x^${p.n+1} (${stuff(f)}, ${who(f)} @ ${where(f)}; ignore +C).`,
          answer:s.str, solutionSteps: steps(`c/(n+1)=${s.str}`) };
      }
    },
    {
      params: () => { const o=[]; for(let m=1;m<=8;m++)for(let x0=1;x0<=5;x0++)o.push({m,x0,b:2}); return o.slice(0,45); },
      make: (f,p) => ({ section:'Calculus', difficulty:'medium', type:'short', tags:['tangent'],
        prompt:`y=${p.m}x+${p.b} (${stuff(f)} line @ ${where(f)}). Slope of tangent at x=${p.x0}? (${who(f)})`,
        answer:String(p.m), solutionSteps: steps(`Slope=${p.m}`) })
    },
    {
      params: () => { const o=[]; for(let fav=1;fav<=10;fav++)for(let tot=fav+1;tot<=16;tot++)o.push({fav,tot}); return o.slice(0,55); },
      make: (f,p) => {
        const s=simp(p.fav,p.tot);
        return { section:'Statistics & probability', difficulty:'easy', type:'short', tags:['probability'],
          prompt:`${p.tot} ${stuff(f)} at ${where(f)}, ${p.fav} rare. P(rare) simplified? (${who(f)})`,
          answer:s.str, solutionSteps: steps(`${p.fav}/${p.tot}→${s.str}`) };
      }
    },
    {
      params: () => { const o=[]; for(let n=3;n<=7;n++)for(let base=2;base<=12;base++){const vals=[];for(let i=0;i<n;i++)vals.push(base+i);o.push({vals});} return o.slice(0,55); },
      make: (f,p) => {
        const sum=p.vals.reduce((a,b)=>a+b,0); const mean=sum/p.vals.length;
        const ans=Number.isInteger(mean)?String(mean):fmtFrac(sum,p.vals.length);
        return { section:'Statistics & probability', difficulty:'easy', type:'short', tags:['mean'],
          prompt:`Data ${p.vals.join(',')} of ${stuff(f)} at ${where(f)}. Mean? (${who(f)})`,
          answer:ans, solutionSteps: steps(`Sum=${sum}`, `Mean=${ans}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=10;a++)for(let d=2;d<=8;d++)for(let n=3;n<=10;n++)if((a+n)%2===0)o.push({a,d,n}); return o.slice(0,55); },
      make: (f,p) => ({ section:'Sequences & series', difficulty:'easy', type:'short', tags:['arithmetic'],
        prompt:`Arithmetic ${stuff(f)}: a=${p.a}, d=${p.d}. Term ${p.n}? (${who(f)} @ ${where(f)})`,
        answer:String(p.a+(p.n-1)*p.d), solutionSteps: steps(`a_n=${p.a+(p.n-1)*p.d}`) })
    },
    {
      params: () => { const o=[]; for(let a=1;a<=4;a++)for(let r=2;r<=4;r++)for(let n=2;n<=6;n++)o.push({a,r,n}); return o; },
      make: (f,p) => ({ section:'Sequences & series', difficulty:'medium', type:'short', tags:['geometric'],
        prompt:`Geo ${stuff(f)}: a=${p.a}, r=${p.r}, term ${p.n}? (${who(f)} @ ${where(f)})`,
        answer:String(p.a*Math.pow(p.r,p.n-1)), solutionSteps: steps(`ar^{n-1}=${p.a*Math.pow(p.r,p.n-1)}`) })
    },
    {
      params: () => { const o=[]; for(let A=20;A<=80;A+=5)for(let B=20;B<=80;B+=5)if(A+B<160)o.push({A,B}); return o.slice(0,55); },
      make: (f,p) => ({ section:'Geometry & trig', difficulty:'easy', type:'short', tags:['triangle'],
        prompt:`Triangle angles ${p.A}°, ${p.B}° (${stuff(f)} map @ ${where(f)}). Third angle? (${who(f)})`,
        answer:String(180-p.A-p.B), solutionSteps: steps(`180−${p.A}−${p.B}=${180-p.A-p.B}`) })
    },
    {
      params: () => { const o=[]; for(let opp=3;opp<=12;opp++)for(let hyp=opp+1;hyp<=15;hyp++)if(hyp>opp)o.push({opp,hyp}); return o.slice(0,50); },
      make: (f,p) => {
        const s=simp(p.opp,p.hyp);
        return { section:'Geometry & trig', difficulty:'easy', type:'short', tags:['trig'],
          prompt:`sin θ = opp/hyp = ${p.opp}/${p.hyp} for ${stuff(f)} ramp at ${where(f)}. Simplify. (${who(f)})`,
          answer:s.str, solutionSteps: steps(`${p.opp}/${p.hyp}→${s.str}`) };
      }
    },
    {
      params: () => [
        {q:'The derivative of x^2 is 2x.',a:'True',s:'Power rule.'},
        {q:'A function can fail the vertical line test and still be a function.',a:'False',s:'Must pass VLT.'},
        {q:'Arithmetic sequences have constant first differences.',a:'True',s:'Definition.'},
        {q:'P(A)+P(A^c)=1 for an event A in a probability space.',a:'True',s:'Complement rule.'}
      ],
      make: (f,p) => ({ section:'Functions', difficulty:'easy', type:'tf', tags:['theory'],
        prompt:`True or false (${who(f)} @ ${where(f)}): ${p.q}`, answer:p.a, solutionSteps: steps(p.s) })
    },
    {
      params: () => { const o=[]; for(let n=5;n<=12;n++)for(let k=2;k<=4;k++)o.push({n,k}); return o; },
      make: (f,p) => {
        // C(n,k)
        let num=1,den=1; for(let i=0;i<p.k;i++){num*=p.n-i;den*=i+1;}
        const ans=num/den;
        return { section:'Statistics & probability', difficulty:'medium', type:'short', tags:['combinatorics'],
          prompt:`C(${p.n},${p.k}) ways to choose ${stuff(f)} at ${where(f)}. ${who(f)}?`,
          answer:String(ans), solutionSteps: steps(`n!/(k!(n-k)!)=${ans}`) };
      }
    }

  ];
}
module.exports = { factories };
