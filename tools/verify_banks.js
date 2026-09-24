#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'banks');
const ids = ['ks3','algebra_trig','precalculus','calculus','linear_algebra','real_analysis','ib_aa_sl','ib_aa_hl','ap_stats','euclidean_geometry'];
let ok = true;
for (const id of ids) {
  const file = path.join(dir, id + '.js');
  const code = fs.readFileSync(file, 'utf8');
  // eval in sandbox-ish
  const window = {};
  eval(code);
  const bank = window.QUESTION_BANKS[id];
  const qs = bank.questions;
  const idsSet = new Set();
  const prompts = new Set();
  let empty = 0, badAns = 0;
  const types = { short:0, mc:0, tf:0 };
  for (const q of qs) {
    if (!q.prompt || !String(q.prompt).trim()) empty++;
    if (q.answer == null || String(q.answer).trim() === '') badAns++;
    if (idsSet.has(q.id)) { console.error(id, 'dup id', q.id); ok=false; }
    idsSet.add(q.id);
    const np = String(q.prompt).toLowerCase().replace(/\s+/g,' ').trim();
    prompts.add(np);
    types[q.type] = (types[q.type]||0)+1;
  }
  const sample = qs[Math.floor(qs.length/2)];
  console.log(`${id}: count=${qs.length} uniquePrompts=${prompts.size} types=${JSON.stringify(types)} empty=${empty} badAns=${badAns}`);
  console.log(`  sample: [${sample.theme}] ${sample.prompt.slice(0,90)}… → ${sample.answer}`);
  if (qs.length < 1000 || empty || badAns || prompts.size < qs.length) ok = false;
}
process.exit(ok ? 0 : 1);
