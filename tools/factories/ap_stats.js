'use strict';
const { steps, mcShuffle, who, where, stuff, simp, fmtFrac, lcm, gcd, isPerfectSquare } = require('../bank_helpers');

function factories() {
  return [

    {
      params: () => { const o=[]; for(let n=3;n<=8;n++)for(let base=2;base<=15;base++){const vals=[];for(let i=0;i<n;i++)vals.push(base+i*(1+(base%3)));o.push({vals});} return o.slice(0,60); },
      make: (f,p) => {
        const sum=p.vals.reduce((a,b)=>a+b,0); const mean=sum/p.vals.length;
        const ans=Number.isInteger(mean)?String(mean):fmtFrac(sum,p.vals.length);
        return { section:'Descriptive', difficulty:'easy', type:'short', tags:['mean'],
          prompt:`${who(f)} logs ${stuff(f)} scores at ${where(f)}: ${p.vals.join(', ')}. Mean?`,
          answer:ans, solutionSteps: steps(`Sum=${sum}`, `Mean=${ans}`) };
      }
    },
    {
      params: () => { const o=[]; for(let n=3;n<=9;n++)for(let base=1;base<=12;base++){const vals=[];for(let i=0;i<n;i++)vals.push(base+i*2);o.push({vals});} return o.slice(0,55); },
      make: (f,p) => {
        const s=[...p.vals].sort((a,b)=>a-b); const mid=Math.floor(s.length/2);
        const med = s.length%2 ? s[mid] : (s[mid-1]+s[mid])/2;
        const ans=Number.isInteger(med)?String(med):fmtFrac(s[mid-1]+s[mid],2);
        return { section:'Descriptive', difficulty:'easy', type:'short', tags:['median'],
          prompt:`Median of ${p.vals.join(', ')} (${stuff(f)} @ ${where(f)}, ${who(f)}).`,
          answer:ans, solutionSteps: steps(`Sorted ${s.join(',')}`, `Median=${ans}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=20;a++)for(let b=a+2;b<=30;b++)o.push({a,b}); return o.slice(0,55); },
      make: (f,p) => ({ section:'Descriptive', difficulty:'easy', type:'short', tags:['range'],
        prompt:`Range of ${stuff(f)} sizes ${p.a}…${p.b} at ${where(f)}. ${who(f)}?`,
        answer:String(p.b-p.a), solutionSteps: steps(`max−min=${p.b-p.a}`) })
    },
    {
      params: () => [
        {q:'The mean is resistant to outliers.',a:'False',s:'Mean is pulled by outliers; median is more resistant.'},
        {q:'A standard deviation can be negative.',a:'False',s:'SD ≥ 0.'},
        {q:'IQR = Q3 − Q1.',a:'True',s:'Definition of IQR.'},
        {q:'A histogram displays categorical data best as counts of categories.',a:'False',s:'Bar chart for categorical; histogram for quantitative.'}
      ],
      make: (f,p) => ({ section:'Descriptive', difficulty:'easy', type:'tf', tags:['concepts'],
        prompt:`True or false (${who(f)} @ ${where(f)}): ${p.q}`, answer:p.a, solutionSteps: steps(p.s) })
    },
    {
      params: () => { const o=[]; for(let fav=1;fav<=12;fav++)for(let tot=fav+1;tot<=20;tot++)o.push({fav,tot}); return o.slice(0,60); },
      make: (f,p) => {
        const s=simp(p.fav,p.tot);
        return { section:'Probability', difficulty:'easy', type:'short', tags:['basic probability'],
          prompt:`${p.tot} ${stuff(f)} in a chest at ${where(f)}, ${p.fav} shiny. P(shiny)? (${who(f)}; simplify)`,
          answer:s.str, solutionSteps: steps(`${p.fav}/${p.tot}→${s.str}`) };
      }
    },
    {
      params: () => { const o=[]; for(let fav=1;fav<=10;fav++)for(let tot=fav+2;tot<=18;tot++)o.push({fav,tot}); return o.slice(0,55); },
      make: (f,p) => {
        const s=simp(p.tot-p.fav,p.tot);
        return { section:'Probability', difficulty:'easy', type:'short', tags:['complement'],
          prompt:`P(shiny)=${p.fav}/${p.tot} for ${stuff(f)} at ${where(f)}. P(not shiny)? (${who(f)}; simplify)`,
          answer:s.str, solutionSteps: steps(`1−P=${s.str}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=5;a++)for(let b=1;b<=5;b++)for(let den=10;den<=20;den+=2)o.push({a,b,den}); return o.slice(0,55); },
      make: (f,p) => {
        // independent P(A and B)=P(A)P(B) with P(A)=a/den, P(B)=b/den
        const s=simp(p.a*p.b, p.den*p.den);
        return { section:'Probability', difficulty:'medium', type:'short', tags:['independence'],
          prompt:`Independent: P(A)=${p.a}/${p.den}, P(B)=${p.b}/${p.den} for ${stuff(f)} events at ${where(f)}. P(A∩B)? (${who(f)}; simplify)`,
          answer:s.str, solutionSteps: steps(`P(A)P(B)=${s.str}`) };
      }
    },
    {
      params: () => { const o=[]; for(let n=5;n<=20;n++)for(let p_=1;p_<=5;p_++)o.push({n,p:p_, pah:p_/10}); return o.slice(0,50); },
      make: (f,p) => {
        // binomial mean np with p=p.pah
        const mean=p.n*p.pah;
        const ans=Number.isInteger(mean)?String(mean):String(mean);
        // use fractions: p = k/10
        const s=simp(p.n*p.p,10);
        return { section:'Probability', difficulty:'medium', type:'short', tags:['binomial'],
          prompt:`X~Bin(n=${p.n}, p=${p.p}/10) counts ${stuff(f)} successes at ${where(f)}. E[X]? (${who(f)}; fraction ok)`,
          answer:s.str, solutionSteps: steps(`np=${s.str}`) };
      }
    },
    {
      params: () => { const o=[]; for(let x=10;x<=90;x+=5)for(let mu=40;mu<=60;mu+=5)for(let sig of [5,10,15])if(sig)o.push({x,mu,sig}); return o.slice(0,55); },
      make: (f,p) => {
        const z=(p.x-p.mu)/p.sig;
        const ans=Number.isInteger(z)?String(z):fmtFrac(p.x-p.mu,p.sig);
        return { section:'Sampling & distributions', difficulty:'medium', type:'short', tags:['z-score'],
          prompt:`z-score of x=${p.x} with μ=${p.mu}, σ=${p.sig} (${stuff(f)} @ ${where(f)}, ${who(f)}).`,
          answer:ans, solutionSteps: steps(`(x−μ)/σ=${ans}`) };
      }
    },
    {
      params: () => { const o=[]; for(let x=5;x<=40;x++)for(let n=x+5;n<=60;n+=5)o.push({x,n}); return o.slice(0,55); },
      make: (f,p) => {
        const s=simp(p.x,p.n);
        return { section:'Sampling & distributions', difficulty:'easy', type:'short', tags:['proportion'],
          prompt:`${p.x} of ${p.n} ${stuff(f)} surveys at ${where(f)} say yes. Sample proportion p̂? (${who(f)}; simplify)`,
          answer:s.str, solutionSteps: steps(`${p.x}/${p.n}→${s.str}`) };
      }
    },
    {
      params: () => [
        {q:'A 95% CI means 95% of such intervals capture the parameter in repeated sampling.',a:'True',s:'Frequentist CI interpretation.'},
        {q:'Failing to reject H0 proves H0 true.',a:'False',s:'Absence of evidence ≠ proof.'},
        {q:'Type I error is rejecting a true H0.',a:'True',s:'Definition.'},
        {q:'p-value is P(H0 is true).',a:'False',s:'p-value is tail probability under H0, not P(H0).'}
      ],
      make: (f,p) => ({ section:'Inference', difficulty:'medium', type:'tf', tags:['concepts'],
        prompt:`True or false (${who(f)} @ ${where(f)}): ${p.q}`, answer:p.a, solutionSteps: steps(p.s) })
    },
    {
      params: () => { const o=[]; for(let z of [1,2])for(let s=2;s<=10;s++)for(let n of [4,9,16,25,36])o.push({z,s,n}); return o.slice(0,55); },
      make: (f,p) => {
        // ME = z * s/sqrt(n) with z=1 or 2 approx
        const root=Math.sqrt(p.n);
        const s=simp(p.z*p.s, root);
        // if root integer
        const ans = Number.isInteger(root) ? ( (p.z*p.s)%root===0 ? String((p.z*p.s)/root) : fmtFrac(p.z*p.s,root) ) : String(p.z*p.s/root);
        return { section:'Inference', difficulty:'hard', type:'short', tags:['CI'],
          prompt:`Margin of error z·(s/√n) with z=${p.z}, s=${p.s}, n=${p.n} for ${stuff(f)} CI at ${where(f)}. ME? (${who(f)})`,
          answer:ans, solutionSteps: steps(`ME=${p.z}·${p.s}/√${p.n}=${ans}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=8;a++)for(let b=1;b<=8;b++)for(let tot=a+b+1;tot<=20;tot++)o.push({a,b,tot}); return o.slice(0,55); },
      make: (f,p) => {
        // P(A|B)=P(A∩B)/P(B) with counts: |A∩B|=a, |B|=b, universe=tot — use a<b
        if(p.a>=p.b) return null;
        const s=simp(p.a,p.b);
        return { section:'Probability', difficulty:'medium', type:'short', tags:['conditional'],
          prompt:`Among ${p.tot} ${stuff(f)} at ${where(f)}, ${p.b} are type B and ${p.a} are both A and B. P(A|B)? (${who(f)}; simplify)`,
          answer:s.str, solutionSteps: steps(`P(A|B)=${p.a}/${p.b}=${s.str}`) };
      }
    },
    {
      params: () => [
        {q:'Type II error is failing to reject a false H0.',a:'True',s:'Definition of Type II.'},
        {q:'Larger samples always eliminate bias.',a:'False',s:'Bias is about design, not only n.'},
        {q:'A statistic is computed from a sample.',a:'True',s:'Definition.'}
      ],
      make: (f,p) => ({ section:'Inference', difficulty:'easy', type:'tf', tags:['errors'],
        prompt:`True or false (${who(f)} @ ${where(f)}): ${p.q}`, answer:p.a, solutionSteps: steps(p.s) })
    },
    {
      params: () => { const o=[]; for(let a=1;a<=15;a++)for(let b=a;b<=20;b++)for(let c=b;c<=25;c++)o.push({vals:[a,b,c]}); return o.slice(0,55); },
      make: (f,p) => ({ section:'Descriptive', difficulty:'easy', type:'short', tags:['order stats'],
        prompt:`Sorted ${stuff(f)} sizes ${p.vals.join(', ')} at ${where(f)}. Minimum? (${who(f)})`,
        answer:String(p.vals[0]), solutionSteps: steps(`min=${p.vals[0]}`) })
    },
    {
      params: () => { const o=[]; for(let q1=2;q1<=20;q1++)for(let q3=q1+2;q3<=40;q3++)o.push({q1,q3}); return o.slice(0,55); },
      make: (f,p) => ({ section:'Descriptive', difficulty:'medium', type:'short', tags:['IQR'],
        prompt:`Q1=${p.q1}, Q3=${p.q3} for ${stuff(f)} at ${where(f)}. IQR? (${who(f)})`,
        answer:String(p.q3-p.q1), solutionSteps: steps(`Q3−Q1=${p.q3-p.q1}`) })
    },
    {
      params: () => { const o=[]; for(let a=2;a<=12;a++)for(let b=2;b<=12;b++)o.push({a,b}); return o.slice(0,50); },
      make: (f,p,salt) => {
        const mean=(p.a+p.b)/2; const ans=Number.isInteger(mean)?String(mean):fmtFrac(p.a+p.b,2);
        const mc=mcShuffle(ans,[String(p.a+p.b),String(p.a),String(Math.abs(p.b-p.a))],salt);
        return { section:'Descriptive', difficulty:'easy', type:'mc', tags:['mean'],
          prompt:`Mean of ${p.a} and ${p.b} (${stuff(f)} duo @ ${where(f)}, ${who(f)}).`,
          options:mc.options, answer:mc.answer, solutionSteps: steps(`Mean=${ans}`) };
      }
    }

  ];
}
module.exports = { factories };
