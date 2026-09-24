'use strict';
const { steps, mcShuffle, who, where, stuff, simp, fmtFrac, lcm, gcd, isPerfectSquare } = require('../bank_helpers');

function factories() {
  return [

    {
      params: () => { const o=[]; for(let a=1;a<=6;a++)for(let b=0;b<=5;b++)for(let c=0;c<=5;c++)for(let d=1;d<=6;d++)o.push({a,b,c,d}); return o.slice(0,60); },
      make: (f,p) => {
        const det=p.a*p.d-p.b*p.c;
        return { section:'Determinants', difficulty:'easy', type:'short', tags:['det'],
          prompt:`det[[${p.a},${p.b}],[${p.c},${p.d}]] of a ${stuff(f)} transform at ${where(f)}. ${who(f)}?`,
          answer:String(det), solutionSteps: steps(`${p.a}·${p.d}-${p.b}·${p.c}=${det}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=5;a++)for(let b=0;b<=4;b++)for(let c=0;c<=4;c++)for(let d=1;d<=5;d++)o.push({a,b,c,d}); return o.slice(0,55); },
      make: (f,p) => {
        const det=p.a*p.d-p.b*p.c;
        const ans = det!==0 ? 'True' : 'False';
        return { section:'Matrices', difficulty:'easy', type:'tf', tags:['invertibility'],
          prompt:`True or false (${who(f)} @ ${where(f)}): [[${p.a},${p.b}],[${p.c},${p.d}]] is invertible (about ${stuff(f)}).`,
          answer:ans, solutionSteps: steps(`det=${det}`, `Invertible iff det≠0 → ${ans}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)for(let c=1;c<=6;c++)o.push({a,b,c}); return o.slice(0,50); },
      make: (f,p) => ({ section:'Vectors', difficulty:'easy', type:'short', tags:['dot'],
        prompt:`⟨${p.a},${p.b}⟩·⟨${p.c},0⟩ for ${stuff(f)} axes at ${where(f)}. ${who(f)}?`,
        answer:String(p.a*p.c), solutionSteps: steps(`${p.a}·${p.c}+${p.b}·0=${p.a*p.c}`) })
    },
    {
      params: () => { const o=[]; for(let a=1;a<=5;a++)for(let b=1;b<=5;b++)o.push({a,b,x:-b,y:a}); return o; },
      make: (f,p) => ({ section:'Vectors', difficulty:'easy', type:'tf', tags:['orthogonal'],
        prompt:`True or false (${who(f)}): ⟨${p.a},${p.b}⟩ ⊥ ⟨${p.x},${p.y}⟩ for ${stuff(f)} at ${where(f)}.`,
        answer:'True', solutionSteps: steps(`Dot=${p.a*p.x+p.b*p.y}=0 ⇒ orthogonal`) })
    },
    {
      params: () => { const o=[]; for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)for(let c=1;c<=8;c++)o.push({a,b,c}); return o.slice(0,55); },
      make: (f,p) => {
        // ax=c => x=c/a if solve [a][x]=[c]
        const s=simp(p.c,p.a);
        return { section:'Systems', difficulty:'easy', type:'short', tags:['RREF'],
          prompt:`Solve ${p.a}x = ${p.c} (1×1 ${stuff(f)} system at ${where(f)}). ${who(f)} finds x.`,
          answer:s.str, solutionSteps: steps(`x=${p.c}/${p.a}=${s.str}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=5;a++)for(let b=1;b<=5;b++)for(let c=1;c<=5;c++)for(let d=1;d<=5;d++){
        if(a*d===b*c) continue; // unique
        // solve ax+by=e, cx+dy=f with chosen x,y
        for(let x=1;x<=3;x++)for(let y=1;y<=3;y++){ const e=a*x+b*y,f=c*x+d*y; o.push({a,b,c,d,e,f,x,y}); }
      } return o.slice(0,60); },
      make: (f,p) => ({ section:'Systems', difficulty:'medium', type:'short', tags:['linear systems'],
        prompt:`${who(f)} solves ${p.a}x+${p.b}y=${p.e}, ${p.c}x+${p.d}y=${p.f} for ${stuff(f)} at ${where(f)}. What is x?`,
        answer:String(p.x), solutionSteps: steps(`Unique solution x=${p.x}`) })
    },
    {
      params: () => { const o=[]; for(let a=1;a<=8;a++)for(let b=1;b<=8;b++)if(a!==b)o.push({a,b}); return o; },
      make: (f,p) => ({ section:'Eigenvalues', difficulty:'easy', type:'short', tags:['eigenvalues'],
        prompt:`Diagonal matrix diag(${p.a},${p.b}) of ${stuff(f)} stretch at ${where(f)}. Larger eigenvalue? (${who(f)})`,
        answer:String(Math.max(p.a,p.b)), solutionSteps: steps(`Eigs are diagonal entries`, `max=${Math.max(p.a,p.b)}`) })
    },
    {
      params: () => { const o=[]; for(let a=1;a<=5;a++)for(let d=1;d<=5;d++)o.push({a,d}); return o; },
      make: (f,p) => {
        // char poly of diag(a,d): (a-λ)(d-λ); ask product of eigs = ad = det
        return { section:'Eigenvalues', difficulty:'medium', type:'short', tags:['characteristic'],
          prompt:`For diag(${p.a},${p.d}), product of eigenvalues (${stuff(f)} @ ${where(f)})? ${who(f)}`,
          answer:String(p.a*p.d), solutionSteps: steps(`Product=det=${p.a*p.d}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=6;a++)for(let b=0;b<=5;b++)for(let c=0;c<=5;c++)for(let d=1;d<=6;d++)o.push({a,b,c,d}); return o.slice(0,55); },
      make: (f,p) => {
        // trace
        return { section:'Matrices', difficulty:'easy', type:'short', tags:['trace'],
          prompt:`tr[[${p.a},${p.b}],[${p.c},${p.d}]] for ${stuff(f)} matrix at ${where(f)}. ${who(f)}?`,
          answer:String(p.a+p.d), solutionSteps: steps(`${p.a}+${p.d}=${p.a+p.d}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=1;a<=5;a++)for(let b=1;b<=5;b++)for(let x=1;x<=5;x++)for(let y=1;y<=5;y++)o.push({a,b,x,y}); return o.slice(0,55); },
      make: (f,p) => {
        // [[a,b]]*[[x],[y]] first entry
        return { section:'Matrices', difficulty:'easy', type:'short', tags:['multiplication'],
          prompt:`[[${p.a},${p.b}]]·⟨${p.x},${p.y}⟩ first entry (${stuff(f)} @ ${where(f)}). ${who(f)}?`,
          answer:String(p.a*p.x+p.b*p.y), solutionSteps: steps(`${p.a}·${p.x}+${p.b}·${p.y}=${p.a*p.x+p.b*p.y}`) };
      }
    },
    {
      params: () => { const o=[]; for(let n=1;n<=4;n++)o.push({n}); return o; },
      make: (f,p) => ({ section:'Vector spaces', difficulty:'easy', type:'short', tags:['span'],
        prompt:`dim(R^${p.n}) — standard ${stuff(f)} space lecture at ${where(f)}. ${who(f)} answers?`,
        answer:String(p.n), solutionSteps: steps(`Standard basis has ${p.n} vectors`) })
    },
    {
      params: () => [
        {q:'The zero vector is in every subspace.',a:'True',s:'Subspace axioms.'},
        {q:'det(I)=0 for any identity matrix.',a:'False',s:'det(I)=1.'},
        {q:'Similar matrices share eigenvalues.',a:'True',s:'Same characteristic polynomial.'},
        {q:'Rank of the zero matrix is 1.',a:'False',s:'Rank 0.'},
        {q:'Orthogonal vectors have dot product 0.',a:'True',s:'Definition.'},
        {q:'Every square matrix is invertible.',a:'False',s:'Need nonzero det.'}
      ],
      make: (f,p) => ({ section:'Vector spaces', difficulty:'medium', type:'tf', tags:['theory'],
        prompt:`True or false (${who(f)} @ ${where(f)}): ${p.q}`, answer:p.a, solutionSteps: steps(p.s) })
    },
    {
      params: () => { const o=[]; for(let a=1;a<=6;a++)for(let d=0;d<=5;d++)o.push({a,d}); return o; },
      make: (f,p,salt) => {
        const det=p.a*p.d; const mc=mcShuffle(det,[det+1,p.a+p.d,0],salt);
        return { section:'Determinants', difficulty:'easy', type:'mc', tags:['det'],
          prompt:`${who(f)} computes det(diag(${p.a},${p.d})) for a ${stuff(f)} check at ${where(f)}. Choose the value.`,
          options:mc.options, answer:mc.answer, solutionSteps: steps(`Product of diag=${det}`) };
      }
    }

  ];
}
module.exports = { factories };
