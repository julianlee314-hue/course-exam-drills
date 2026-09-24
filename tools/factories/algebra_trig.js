'use strict';
const { steps, mcShuffle, who, where, stuff, simp, fmtFrac, lcm, gcd, isPerfectSquare } = require('../bank_helpers');

function factories() {
  return [

    {
      params: (r) => { const o=[]; for(let a=1;a<=7;a++)for(let b=1;b<=7;b++)for(let c=1;c<=6;c++)for(let d=1;d<=5;d++) if((a+c+r)%2===0)o.push({a,b,c,d}); return o.slice(0,55); },
      make: (f,p) => {
        const A=p.a+p.c, B=p.b+p.d;
        const bStr=B>=0?`+ ${B}`:`− ${-B}`;
        const ans = B===0?`${A}x`:`${A}x ${bStr}`;
        return { section:'Algebra basics', difficulty:'easy', type:'short', tags:['polynomials'],
          prompt:`${who(f)} combines (${p.a}x+${p.b})+(${p.c}x+${p.d}) of ${stuff(f)} at ${where(f)}. Simplify to mx+k form.`,
          answer: ans.replace(/\s+/g,' ').trim(), solutionSteps: steps(`x: ${A}`, `const: ${B}`, ans) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=6;a++)for(let b=1;b<=7;b++)for(let c=1;c<=6;c++)for(let d=1;d<=7;d++)o.push({a,b,c,d}); return o.slice(0,60); },
      make: (f,p) => ({ section:'Algebra basics', difficulty:'medium', type:'short', tags:['expand'],
        prompt:`${who(f)} expands (${p.a}x+${p.b})(${p.c}x+${p.d}) crafting ${stuff(f)} at ${where(f)}. Constant term?`,
        answer:String(p.b*p.d), solutionSteps: steps(`${p.b}·${p.d}=${p.b*p.d}`) })
    },
    {
      params: () => { const o=[]; for(let p=1;p<=9;p++)for(let q=1;q<=9;q++)if(p!==q)o.push({p,q,sum:p+q,prod:p*q}); return o.slice(0,60); },
      make: (f,p) => ({ section:'Algebra basics', difficulty:'medium', type:'short', tags:['factoring'],
        prompt:`${who(f)} factors x²−${p.sum}x+${p.prod}=0 at ${where(f)} (${stuff(f)} plan). Smaller positive root?`,
        answer:String(Math.min(p.p,p.q)), solutionSteps: steps(`Factors ${p.p},${p.q}`, `Smaller root ${Math.min(p.p,p.q)}`) })
    },
    {
      params: (r) => { const o=[]; for(let a=2;a<=9;a++)for(let b=-8;b<=8;b++)if(b){for(let x=-4;x<=7;x++)if(x&&((x+a+r)%2===0))o.push({a,b,rhs:a*x+b});} return o.slice(0,60); },
      make: (f,p) => {
        const x=(p.rhs-p.b)/p.a; const bStr=p.b>=0?`+ ${p.b}`:`− ${-p.b}`;
        return { section:'Equations', difficulty:'easy', type:'short', tags:['linear'],
          prompt:`Solve ${p.a}x ${bStr}=${p.rhs} for ${stuff(f)} quota (${who(f)} @ ${where(f)}).`,
          answer:String(x), solutionSteps: steps(`${p.a}x=${p.rhs-p.b}`, `x=${x}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=4;a++)for(let b=-7;b<=7;b++)if(b)for(let c=-6;c<=6;c++){const d=b*b-4*a*c; if(d>=0 && Number.isInteger(Math.sqrt(d)))o.push({a,b,c,d});} return o.slice(0,55); },
      make: (f,p) => {
        const root=Math.sqrt(p.d); const s1=simp(-p.b+root,2*p.a), s2=simp(-p.b-root,2*p.a);
        const ans=[s1.str,s2.str].sort().join(',');
        const bStr=p.b>=0?`+ ${p.b}x`:`− ${-p.b}x`; const cStr=p.c>=0?`+ ${p.c}`:`− ${-p.c}`;
        return { section:'Equations', difficulty:'medium', type:'short', tags:['quadratic'],
          prompt:`${who(f)} solves ${p.a}x² ${bStr} ${cStr}=0 at ${where(f)}. Roots ascending as r1,r2:`,
          answer:ans, solutionSteps: steps(`Δ=${p.d}`, `Roots ${ans}`) };
      }
    },
    {
      params: () => { const o=[]; for(let x1=-5;x1<=5;x1++)for(let y1=-5;y1<=5;y1++)for(let x2=-5;x2<=5;x2++)if(x1!==x2){const y2=y1+(x2>x1?2:-2); o.push({x1,y1,x2,y2});} return o.slice(0,60); },
      make: (f,p) => { const s=simp(p.y2-p.y1,p.x2-p.x1);
        return { section:'Graphs', difficulty:'easy', type:'short', tags:['slope'],
          prompt:`${who(f)} maps ${stuff(f)} from (${p.x1},${p.y1}) to (${p.x2},${p.y2}) near ${where(f)}. Slope?`,
          answer:s.str, solutionSteps: steps(`m=(${p.y2}-${p.y1})/(${p.x2}-${p.x1})=${s.str}`) }; }
    },
    {
      params: () => { const o=[]; for(let m=-6;m<=6;m++)if(m)for(let b=-6;b<=6;b++)for(let x=-4;x<=6;x++)o.push({m,b,x}); return o.slice(0,60); },
      make: (f,p) => { const y=p.m*p.x+p.b; const bStr=p.b>=0?`+ ${p.b}`:`− ${-p.b}`;
        return { section:'Graphs', difficulty:'easy', type:'short', tags:['linear functions'],
          prompt:`y=${p.m}x ${bStr} tracks ${stuff(f)}. ${who(f)} at ${where(f)} evaluates x=${p.x}. y?`,
          answer:String(y), solutionSteps: steps(`y=${p.m}(${p.x})${bStr}=${y}`) }; }
    },
    {
      params: () => { const o=[]; for(let a=2;a<=6;a++)for(let m=1;m<=5;m++)for(let n=1;n<=4;n++)o.push({a,m,n}); return o.slice(0,50); },
      make: (f,p) => ({ section:'Exponents & logs', difficulty:'easy', type:'short', tags:['exponents'],
        prompt:`${who(f)} simplifies ${p.a}^${p.m}·${p.a}^${p.n} powering ${stuff(f)} at ${where(f)}. Exponent k in ${p.a}^k?`,
        answer:String(p.m+p.n), solutionSteps: steps(`Add exponents: ${p.m}+${p.n}=${p.m+p.n}`) })
    },
    {
      params: () => { const o=[]; for(let b=2;b<=6;b++)for(let k=1;k<=5;k++)o.push({b,k,arg:Math.pow(b,k)}); return o; },
      make: (f,p) => ({ section:'Exponents & logs', difficulty:'medium', type:'short', tags:['logs'],
        prompt:`${who(f)} computes log_${p.b}(${p.arg}) decoding ${stuff(f)} at ${where(f)}.`,
        answer:String(p.k), solutionSteps: steps(`${p.b}^${p.k}=${p.arg}`, `log=${p.k}`) })
    },
    {
      params: () => {
        const angles=[{deg:0,sin:'0',cos:'1'},{deg:30,sin:'1/2',cos:'√3/2'},{deg:45,sin:'√2/2',cos:'√2/2'},{deg:60,sin:'√3/2',cos:'1/2'},{deg:90,sin:'1',cos:'0'}];
        const o=[]; for(const a of angles){o.push({...a,which:'sin'});o.push({...a,which:'cos'});} return o;
      },
      make: (f,p) => ({ section:'Trigonometry', difficulty:'medium', type:'short', tags:['exact values'],
        prompt:`${who(f)} needs exact ${p.which}(${p.deg}°) aiming ${stuff(f)} at ${where(f)}.`,
        answer: p.which==='sin'?p.sin:p.cos, solutionSteps: steps(`Special angle`, `${p.which}(${p.deg}°)=${p.which==='sin'?p.sin:p.cos}`) })
    },
    {
      params: () => { const o=[]; for(let opp=2;opp<=15;opp++)for(let adj=2;adj<=15;adj++)if(gcd(opp,adj)===1||opp!==adj)o.push({opp,adj}); return o.slice(0,55); },
      make: (f,p) => { const s=simp(p.opp,p.adj);
        return { section:'Trigonometry', difficulty:'easy', type:'short', tags:['trig ratios'],
          prompt:`Ramp of ${stuff(f)} at ${where(f)}: opp=${p.opp}, adj=${p.adj}. ${who(f)} finds tan θ simplified.`,
          answer:s.str, solutionSteps: steps(`tan=opp/adj=${s.str}`) }; }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=8;a++)for(let b=0;b<=8;b++)for(let x=1;x<=8;x++)o.push({a,b,x}); return o.slice(0,55); },
      make: (f,p) => ({ section:'Functions', difficulty:'medium', type:'short', tags:['composition'],
        prompt:`f(x)=${p.a}x+${p.b}. ${who(f)} computes f(${p.x}) for a ${stuff(f)} meter at ${where(f)}.`,
        answer:String(p.a*p.x+p.b), solutionSteps: steps(`f(${p.x})=${p.a*p.x+p.b}`) })
    },
    {
      params: () => [
        {q:'sin²θ+cos²θ=1 for all real θ.',a:'True',s:'Pythagorean identity.'},
        {q:'A function may assign two outputs to one input.',a:'False',s:'One output per input.'},
        {q:'Vertical lines have slope 0.',a:'False',s:'Undefined slope.'},
        {q:'log_b(xy)=log_b x + log_b y (valid b).',a:'True',s:'Product rule.'},
        {q:'Every quadratic has two distinct real roots.',a:'False',s:'Depends on discriminant.'},
        {q:'The domain of √x (reals) is x≥0.',a:'True',s:'Nonnegative radicand.'}
      ],
      make: (f,p) => ({ section:'Functions', difficulty:'easy', type:'tf', tags:['definitions'],
        prompt:`True or false (${who(f)} @ ${where(f)}): ${p.q}`, answer:p.a, solutionSteps: steps(p.s) })
    },
    {
      params: () => { const o=[]; for(let a=2;a<=7;a++)for(let b=2;b<=5;b++)o.push({a,b}); return o; },
      make: (f,p,salt) => {
        const ans=Math.pow(p.a,p.b); const mc=mcShuffle(ans,[ans+p.a,p.a*p.b,Math.pow(p.a,p.b-1)||1],salt);
        return { section:'Exponents & logs', difficulty:'easy', type:'mc', tags:['exponent laws'],
          prompt:`${who(f)} evaluates ${p.a}^${p.b} counting ${stuff(f)} at ${where(f)}.`,
          options:mc.options, answer:mc.answer, solutionSteps: steps(`${p.a}^${p.b}=${ans}`) };
      }
    }

  ];
}
module.exports = { factories };
