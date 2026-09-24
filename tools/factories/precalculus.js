'use strict';
const { steps, mcShuffle, who, where, stuff, simp, fmtFrac, lcm, gcd, isPerfectSquare } = require('../bank_helpers');

function factories() {
  return [

    {
      params: () => { const o=[]; for(let a=1;a<=5;a++)for(let b=-6;b<=6;b++)if(b)for(let c=-4;c<=8;c++)o.push({a,b,c}); return o.slice(0,55); },
      make: (f,p) => {
        // vertex x = -b/(2a) for y=ax^2+bx+c
        const s=simp(-p.b,2*p.a);
        return { section:'Functions & graphs', difficulty:'medium', type:'short', tags:['vertex'],
          prompt:`Parabola of ${stuff(f)} arcs at ${where(f)}: y=${p.a}x²${p.b>=0?'+':''}${p.b}x${p.c>=0?'+':''}${p.c}. ${who(f)} finds vertex x-coordinate.`,
          answer:s.str, solutionSteps: steps(`x=-b/(2a)=${s.str}`) };
      }
    },
    {
      params: () => { const o=[]; for(let b=2;b<=6;b++)for(let k=1;k<=5;k++)o.push({b,k,arg:b**k}); return o; },
      make: (f,p) => ({ section:'Exp & log', difficulty:'easy', type:'short', tags:['logs'],
        prompt:`${who(f)} evaluates log_${p.b}(${p.arg}) while charting ${stuff(f)} at ${where(f)}.`,
        answer:String(p.k), solutionSteps: steps(`${p.b}^${p.k}=${p.arg}`) })
    },
    {
      params: () => { const o=[]; for(let c=2;c<=8;c++)o.push({c}); return o; },
      make: (f,p,salt) => {
        const mc=mcShuffle(`${p.c} log x`, [`log x / ${p.c}`, `log(${p.c}x)`, `(log x)^${p.c}`], salt);
        // fix: correct is first conceptually - rebuild
        const opts=[`${p.c} log x`, `log x / ${p.c}`, `log(${p.c}x)`, `(log x)^${p.c}`];
        const k=Math.abs(salt)%4; const rot=opts.slice(k).concat(opts.slice(0,k));
        const ans=String.fromCharCode(65+rot.indexOf(`${p.c} log x`));
        return { section:'Exp & log', difficulty:'easy', type:'mc', tags:['log laws'],
          prompt:`${who(f)} expands log(x^${p.c}) at ${where(f)} (${stuff(f)} logs). Which equals it?`,
          options:rot, answer:ans, solutionSteps: steps(`Power rule → ${p.c} log x`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=2;a<=7;a++)for(let b=1;b<=8;b++)o.push({a,b}); return o; },
      make: (f,p) => ({ section:'Exp & log', difficulty:'easy', type:'short', tags:['exponential equations'],
        prompt:`Solve ${p.a}^x = ${p.a}^${p.b} for ${stuff(f)} level (${who(f)} @ ${where(f)}).`,
        answer:String(p.b), solutionSteps: steps(`Same base ⇒ x=${p.b}`) })
    },
    {
      params: () => {
        const degs=[0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330];
        return degs.map(theta=>{
          const s=simp(theta,180);
          let ans; if(theta===0)ans='0'; else if(s.n===1&&s.d===1)ans='π'; else if(s.n===1)ans=`π/${s.d}`; else if(s.d===1)ans=`${s.n}π`; else ans=`${s.n}π/${s.d}`;
          return {theta, ans};
        });
      },
      make: (f,p) => ({ section:'Trigonometry', difficulty:'easy', type:'short', tags:['radians'],
        prompt:`${who(f)} converts ${p.theta}° to radians for a ${stuff(f)} dial at ${where(f)}. Answer in terms of π (e.g. π/3).`,
        answer:p.ans, solutionSteps: steps(`${p.theta}°·π/180=${p.ans}`) })
    },
    {
      params: () => { const o=[]; for(let A=1;A<=8;A++)for(let B=1;B<=6;B++)o.push({A,B}); return o; },
      make: (f,p) => {
        const ss=simp(2, Math.abs(p.B));
        let ans; if(ss.n===2 && ss.d===1) ans='2π'; else if(ss.n===1 && ss.d===1) ans='π'; else if(ss.n===1) ans=`π/${ss.d}`; else if(ss.d===1) ans=`${ss.n}π`; else ans=`${ss.n}π/${ss.d}`;
        // Special: 2/B when B=2 → 1 → π; when B=1 → 2π; when B=4 → π/2
        return { section:'Trigonometry', difficulty:'medium', type:'short', tags:['sinusoids'],
          prompt:`Wave of ${stuff(f)}: y=${p.A} sin(${p.B}x) at ${where(f)}. ${who(f)} finds the period (in terms of π).`,
          answer: ans, solutionSteps: steps(`Period=2π/|B|=${ans}`) };
      }
    },
    {
      params: () => { const o=[]; for(let A=1;A<=12;A++)o.push({A}); return o; },
      make: (f,p) => ({ section:'Trigonometry', difficulty:'easy', type:'short', tags:['amplitude'],
        prompt:`y=${p.A} cos(x) models ${stuff(f)} bounce at ${where(f)}. Amplitude? (${who(f)})`,
        answer:String(p.A), solutionSteps: steps(`Amplitude=|A|=${p.A}`) })
    },
    {
      params: () => { const o=[]; for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)o.push({a,b}); return o.slice(0,40); },
      make: (f,p) => ({ section:'Polynomials', difficulty:'easy', type:'short', tags:['binomial'],
        prompt:`${who(f)} expands (x+${p.a})(x+${p.b}) for ${stuff(f)} codes at ${where(f)}. Constant term?`,
        answer:String(p.a*p.b), solutionSteps: steps(`Constant=${p.a}·${p.b}=${p.a*p.b}`) })
    },
    {
      params: () => { const o=[]; for(let r=-5;r<=5;r++)if(r)for(let s=-5;s<=5;s++)if(s&&s!==r)o.push({r,s}); return o.slice(0,50); },
      make: (f,p) => {
        // (x-r)(x-s)=x^2-(r+s)x+rs; ask sum of zeros
        return { section:'Polynomials', difficulty:'medium', type:'short', tags:['zeros'],
          prompt:`Polynomial (x−(${p.r}))(x−(${p.s}))=0 for ${stuff(f)} roots at ${where(f)}. Sum of zeros? (${who(f)})`,
          answer:String(p.r+p.s), solutionSteps: steps(`Zeros ${p.r},${p.s}`, `Sum=${p.r+p.s}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=2;a<=10;a++)for(let d=2;d<=8;d++)for(let n=3;n<=12;n++)if((a+d+n)%2===0)o.push({a,d,n}); return o.slice(0,55); },
      make: (f,p) => {
        const sum = (p.n/2)*(2*p.a+(p.n-1)*p.d);
        return { section:'Sequences & series', difficulty:'medium', type:'short', tags:['arithmetic'],
          prompt:`Arithmetic ${stuff(f)} tally at ${where(f)}: a=${p.a}, d=${p.d}, n=${p.n}. ${who(f)} finds S_n.`,
          answer:String(sum), solutionSteps: steps(`S_n=n/2·(2a+(n-1)d)=${sum}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=5;a++)for(let r=2;r<=4;r++)for(let n=2;n<=6;n++)o.push({a,r,n}); return o; },
      make: (f,p) => {
        const term=p.a*Math.pow(p.r,p.n-1);
        return { section:'Sequences & series', difficulty:'medium', type:'short', tags:['geometric'],
          prompt:`Geometric ${stuff(f)} sequence at ${where(f)}: a=${p.a}, r=${p.r}. Term ${p.n}? (${who(f)})`,
          answer:String(term), solutionSteps: steps(`a_n=ar^{n-1}=${term}`) };
      }
    },
    {
      params: () => { const o=[]; for(let h=-4;h<=4;h++)for(let k=-4;k<=4;k++)for(let rad=1;rad<=8;rad++)o.push({h,k,r:rad}); return o.slice(0,55); },
      make: (f,p) => ({ section:'Analytic geometry', difficulty:'easy', type:'short', tags:['circle'],
        prompt:`Circle of ${stuff(f)} glow at ${where(f)}: (x−(${p.h}))²+(y−(${p.k}))²=${p.r*p.r}. Radius? (${who(f)})`,
        answer:String(p.r), solutionSteps: steps(`r²=${p.r*p.r}`, `r=${p.r}`) })
    },
    {
      params: () => [
        {q:'The amplitude of y=3sin(x) is 3.',a:'True',s:'|A|=3.'},
        {q:'log(x/y)=log x − log y.',a:'True',s:'Quotient rule.'},
        {q:'A circle is a function y=f(x) for all x.',a:'False',s:'Fails vertical line test.'},
        {q:'Period of sin(2x) is π.',a:'True',s:'2π/2=π.'},
        {q:'Every exponential a^x (a>0) has y-intercept 0.',a:'False',s:'a^0=1.'},
        {q:'Vertex form reveals the vertex of a parabola directly.',a:'True',s:'(h,k) is the vertex.'}
      ],
      make: (f,p) => ({ section:'Functions & graphs', difficulty:'easy', type:'tf', tags:['definitions'],
        prompt:`True or false (${who(f)} @ ${where(f)}): ${p.q}`, answer:p.a, solutionSteps: steps(p.s) })
    }

  ];
}
module.exports = { factories };
