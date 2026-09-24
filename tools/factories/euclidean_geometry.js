'use strict';
const { steps, mcShuffle, who, where, stuff, simp, fmtFrac, lcm, gcd, isPerfectSquare } = require('../bank_helpers');

function factories() {
  return [

    {
      params: () => { const o=[]; for(let a=20;a<=100;a+=5)for(let b=20;b<=100;b+=5)if(a+b<160)o.push({a,b}); return o.slice(0,60); },
      make: (f,p) => ({ section:'Book I — Triangles', difficulty:'easy', type:'short', tags:['I.32'],
        prompt:`Δ of ${stuff(f)} at ${where(f)} has angles ${p.a}° and ${p.b}°. Third angle (I.32)? (${who(f)})`,
        answer:String(180-p.a-p.b), solutionSteps: steps(`Angle sum 180°`, `Third=${180-p.a-p.b}`) })
    },
    {
      params: () => { const o=[]; for(let a=20;a<=80;a+=5)for(let b=20;b<=80;b+=5)if(a+b<150)o.push({a,b}); return o.slice(0,55); },
      make: (f,p) => {
        const ext=p.a+p.b;
        return { section:'Book I — Triangles', difficulty:'medium', type:'short', tags:['I.32 exterior'],
          prompt:`Exterior angle equals sum of remote interiors ${p.a}°+${p.b}° (${stuff(f)} Δ @ ${where(f)}). Measure? (${who(f)})`,
          answer:String(ext), solutionSteps: steps(`Exterior=${ext}`) };
      }
    },
    {
      params: () => {
        const triples=[[3,4,5],[5,12,13],[6,8,10],[7,24,25],[8,15,17],[9,12,15],[9,40,41],[20,21,29]];
        const o=[];
        for(const [a,b,c] of triples) for(let k=1;k<=5;k++) o.push({a:a*k,b:b*k,c:c*k});
        return o;
      },
      make: (f,p) => ({ section:'Book I — Triangles', difficulty:'medium', type:'short', tags:['I.47 Pythagoras'],
        prompt:`Right Δ legs ${p.a},${p.b} of ${stuff(f)} paths at ${where(f)}. Hypotenuse (I.47)? (${who(f)})`,
        answer:String(p.c), solutionSteps: steps(`c=√(${p.a}²+${p.b}²)=${p.c}`) })
    },
    {
      params: () => [
        {q:'Through two distinct points there is exactly one straight line (Postulate I vibe).',a:'True',s:'Euclid Postulate 1.'},
        {q:'All right angles are equal to one another (Postulate 4).',a:'True',s:'Postulate 4.'},
        {q:'A point has length greater than zero.',a:'False',s:'A point has no part (Def. 1).'},
        {q:'Parallel lines meet if extended far enough (Euclidean).',a:'False',s:'Parallels never meet (Playfair/Postulate 5).'}
      ],
      make: (f,p) => ({ section:'Foundations', difficulty:'easy', type:'tf', tags:['postulates'],
        prompt:`True or false (${who(f)} studying Elements at ${where(f)}): ${p.q}`, answer:p.a, solutionSteps: steps(p.s) })
    },
    {
      params: () => { const o=[]; for(let a=10;a<=80;a+=5)o.push({a}); return o; },
      make: (f,p) => ({ section:'Book I — Lines & angles', difficulty:'easy', type:'short', tags:['I.15'],
        prompt:`Vertical angles: one is ${p.a}°. The vertical match (${stuff(f)} crossing @ ${where(f)})? (${who(f)}; I.15)`,
        answer:String(p.a), solutionSteps: steps(`Vertical angles equal`, `${p.a}`) })
    },
    {
      params: () => { const o=[]; for(let a=20;a<=160;a+=5)o.push({a}); return o; },
      make: (f,p) => ({ section:'Book I — Lines & angles', difficulty:'easy', type:'short', tags:['I.13'],
        prompt:`Adjacent angles on a line: one is ${p.a}°. The other? (${who(f)}, ${stuff(f)} @ ${where(f)}; I.13)`,
        answer:String(180-p.a), solutionSteps: steps(`Supplementary on a line`, `${180-p.a}`) })
    },
    {
      params: () => { const o=[]; for(let a=20;a<=80;a+=5)o.push({a}); return o; },
      make: (f,p) => ({ section:'Book I — Parallels', difficulty:'medium', type:'short', tags:['I.29'],
        prompt:`Parallel lines, transversal: corresponding angle is ${p.a}°. Matching corresponding? (${who(f)} @ ${where(f)}; I.29)`,
        answer:String(p.a), solutionSteps: steps(`Corresponding angles equal`) })
    },
    {
      params: () => { const o=[]; for(let a=40;a<=140;a+=5)o.push({a}); return o; },
      make: (f,p) => ({ section:'Book I — Parallels', difficulty:'medium', type:'short', tags:['I.29'],
        prompt:`Co-interior angles with parallels sum to 180°. One is ${p.a}°. Other? (${who(f)}, ${stuff(f)} @ ${where(f)})`,
        answer:String(180-p.a), solutionSteps: steps(`180−${p.a}=${180-p.a}`) })
    },
    {
      params: () => { const o=[]; for(let s=2;s<=20;s++)o.push({s}); return o; },
      make: (f,p) => ({ section:'Book I — Constructions', difficulty:'easy', type:'short', tags:['I.1'],
        prompt:`Equilateral side ${p.s} (${stuff(f)} at ${where(f)}). Another side length? (${who(f)}; I.1)`,
        answer:String(p.s), solutionSteps: steps(`All sides equal`) })
    },
    {
      params: () => [
        {q:'To construct an equilateral triangle on a segment, use two circles of that radius (I.1 idea).',a:'True',s:'Classic I.1 construction.'},
        {q:'Bisecting an angle requires only a marked ruler with numbers.',a:'False',s:'Compass and straightedge (I.9).'}
      ],
      make: (f,p) => ({ section:'Book I — Constructions', difficulty:'hard', type:'tf', tags:['construction'],
        prompt:`True or false (${who(f)} @ ${where(f)}): ${p.q}`, answer:p.a, solutionSteps: steps(p.s) })
    },
    {
      params: () => { const o=[]; for(let a=2;a<=12;a++)for(let b=2;b<=12;b++)for(let c=2;c<=12;c++)if(a!==c)o.push({a,b,c}); return o.slice(0,55); },
      make: (f,p) => {
        // similar triangles a/b = c/x => x=bc/a
        if((p.b*p.c)%p.a!==0) return null;
        const x=(p.b*p.c)/p.a;
        return { section:'Book VI — Similarity', difficulty:'medium', type:'short', tags:['VI.2 / ratios'],
          prompt:`Similar Δ ratios ${p.a}/${p.b} = ${p.c}/x for ${stuff(f)} shadows at ${where(f)}. x? (${who(f)})`,
          answer:String(x), solutionSteps: steps(`x=${p.b}·${p.c}/${p.a}=${x}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=30;a<=150;a+=5)o.push({a}); return o; },
      make: (f,p) => ({ section:'Book I — Parallelograms', difficulty:'easy', type:'short', tags:['I.34'],
        prompt:`Parallelogram opposite angle to ${p.a}° (${stuff(f)} @ ${where(f)}). Measure? (${who(f)}; I.34)`,
        answer:String(p.a), solutionSteps: steps(`Opposite angles equal`) })
    },
    {
      params: () => { const o=[]; for(let a=40;a<=140;a+=5)o.push({a}); return o; },
      make: (f,p) => ({ section:'Book I — Parallelograms', difficulty:'medium', type:'short', tags:['I.34'],
        prompt:`Parallelogram consecutive angle to ${p.a}°. Other? (${who(f)}, ${stuff(f)} @ ${where(f)})`,
        answer:String(180-p.a), solutionSteps: steps(`Consecutive supplementary`, `${180-p.a}`) })
    },
    {
      params: () => { const o=[]; for(let a=20;a<=80;a+=5)o.push({a}); return o; },
      make: (f,p) => ({ section:'Book III — Circles', difficulty:'medium', type:'short', tags:['III.31'],
        prompt:`Angle in a semicircle is a right angle (III.31 vibe). If one acute is ${p.a}°, the other acute? (${who(f)} @ ${where(f)})`,
        answer:String(90-p.a), solutionSteps: steps(`Right triangle with 90°`, `Other acute=${90-p.a}`) })
    },
    {
      params: () => { const o=[]; for(let c=20;c<=80;c+=10)o.push({c}); return o; },
      make: (f,p) => ({ section:'Book III — Circles', difficulty:'medium', type:'short', tags:['III.20'],
        prompt:`Central angle ${p.c}°; inscribed on same arc is half (III.20). Inscribed? (${who(f)}, ${stuff(f)} @ ${where(f)})`,
        answer:String(p.c/2),
        solutionSteps: steps(`Inscribed = half central`, `${p.c}/2=${p.c/2}`) })
    },
    {
      params: () => [
        {q:'Book I focuses largely on triangles, parallels, and parallelograms.',a:'True',s:'Structure of Elements Book I.'},
        {q:'Book III is primarily about circles.',a:'True',s:'Circles and angles in circles.'},
        {q:'Similarity of triangles is treated in Book VI.',a:'True',s:'Book VI ratios/similarity.'}
      ],
      make: (f,p) => ({ section:'Foundations', difficulty:'easy', type:'tf', tags:['Elements structure'],
        prompt:`True or false (${who(f)} @ ${where(f)}): ${p.q}`, answer:p.a, solutionSteps: steps(p.s) })
    },
    {
      params: () => { const o=[]; for(let a=3;a<=12;a++)for(let b=3;b<=12;b++)for(let c=3;c<=18;c++) if((a+b+c)%3===0) o.push({a,b,c}); return o.slice(0,60); },
      make: (f,p) => {
        const ok = (p.a+p.b>p.c && p.a+p.c>p.b && p.b+p.c>p.a);
        return { section:'Book I — Triangles', difficulty:'medium', type:'tf', tags:['I.20'],
          prompt:`True or false (${who(f)}): sides ${p.a},${p.b},${p.c} can form a triangle (${stuff(f)} @ ${where(f)}; triangle inequality).`,
          answer: ok ? 'True' : 'False',
          solutionSteps: steps(`a+b>c and cyclic permutations → ${ok}`) };
      }
    },
    {
      params: () => { const o=[]; for(let a=2;a<=12;a++)for(let b=2;b<=12;b++)o.push({a,b}); return o.slice(0,50); },
      make: (f,p,salt) => {
        const ans=180-p.a-p.b; if(ans<=0) return null;
        const mc=mcShuffle(ans,[ans+10,p.a+p.b,90],salt);
        return { section:'Book I — Triangles', difficulty:'easy', type:'mc', tags:['I.32'],
          prompt:`Angles ${p.a}° and ${p.b}° in a triangle of ${stuff(f)} at ${where(f)}. Third? (${who(f)})`,
          options:mc.options.map(String), answer:mc.answer, solutionSteps: steps(`180−${p.a}−${p.b}=${ans}`) };
      }
    }

  ];
}
module.exports = { factories };
