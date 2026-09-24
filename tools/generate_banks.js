#!/usr/bin/env node
'use strict';
const path = require('path');
const { buildBank, writeBank, TARGET } = require('./bank_helpers');

const COURSES = [
  { id: 'ks3', file: './factories/ks3.js' },
  { id: 'algebra_trig', file: './factories/algebra_trig.js' },
  { id: 'precalculus', file: './factories/precalculus.js' },
  { id: 'calculus', file: './factories/calculus.js' },
  { id: 'linear_algebra', file: './factories/linear_algebra.js' },
  { id: 'real_analysis', file: './factories/real_analysis.js' },
  { id: 'ib_aa_sl', file: './factories/ib_aa_sl.js' },
  { id: 'ib_aa_hl', file: './factories/ib_aa_hl.js' },
  { id: 'ap_stats', file: './factories/ap_stats.js' },
  { id: 'euclidean_geometry', file: './factories/euclidean_geometry.js' }
];

function main() {
  const target = parseInt(process.env.BANK_TARGET || String(TARGET), 10) || 1000;
  const summary = [];
  for (const c of COURSES) {
    const mod = require(c.file);
    const factories = mod.factories();
    console.log(`Generating ${c.id} (${factories.length} factories, target ${target})…`);
    const questions = buildBank(c.id, factories, target);
    const { out, count } = writeBank(c.id, questions);
    const ok = count >= target ? 'OK' : 'SHORT';
    console.log(`  → ${count} questions [${ok}]  ${out}`);
    summary.push({ id: c.id, count, ok, out });
  }
  console.log('\n=== SUMMARY ===');
  for (const s of summary) console.log(`${s.id}: ${s.count} ${s.ok}`);
  const bad = summary.filter((s) => s.count < target);
  if (bad.length) {
    console.error('Some banks below target:', bad.map((b) => b.id).join(', '));
    process.exitCode = 2;
  }
}

main();
