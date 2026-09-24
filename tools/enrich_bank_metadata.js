#!/usr/bin/env node
'use strict';

/**
 * Rewrite all banks/*.js with rich per-question metadata + bank.stats,
 * and write BANK_STATS.md + stats/<courseId>.json.
 *
 * Usage: node tools/enrich_bank_metadata.js
 */

const fs = require('fs');
const path = require('path');
const {
  enrichQuestion,
  computeBankStats,
  formatStatsMarkdown
} = require('./question_metadata');

const ROOT = path.join(__dirname, '..');
const BANKS = path.join(ROOT, 'banks');
const STATS_DIR = path.join(ROOT, 'stats');

function loadBank(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const window = { QUESTION_BANKS: {} };
  // eslint-disable-next-line no-new-func
  const fn = new Function('window', code + '\n;return window.QUESTION_BANKS;');
  const banks = fn(window);
  const ids = Object.keys(banks);
  if (!ids.length) throw new Error('No bank in ' + filePath);
  // Prefer matching filename
  const base = path.basename(filePath, '.js');
  return banks[base] || banks[ids[0]];
}

function writeBank(courseId, payload) {
  const body =
    'window.QUESTION_BANKS = window.QUESTION_BANKS || {};\n' +
    'window.QUESTION_BANKS[' + JSON.stringify(courseId) + '] = ' +
    JSON.stringify(payload) + ';\n';
  fs.writeFileSync(path.join(BANKS, courseId + '.js'), body, 'utf8');
}

function main() {
  if (!fs.existsSync(STATS_DIR)) fs.mkdirSync(STATS_DIR, { recursive: true });
  const files = fs.readdirSync(BANKS).filter((f) => f.endsWith('.js')).sort();
  const allStats = [];
  let missingDiff = 0;
  let missingSubs = 0;
  let totalQ = 0;

  for (const file of files) {
    const bank = loadBank(path.join(BANKS, file));
    const courseId = bank.courseId || path.basename(file, '.js');
    const questions = (bank.questions || []).map(enrichQuestion);
    const stats = computeBankStats(questions);
    const payload = {
      courseId,
      count: questions.length,
      generatedAt: bank.generatedAt || new Date().toISOString(),
      enrichedAt: new Date().toISOString(),
      stats,
      questions
    };
    writeBank(courseId, payload);
    fs.writeFileSync(
      path.join(STATS_DIR, courseId + '.json'),
      JSON.stringify(stats, null, 2) + '\n',
      'utf8'
    );
    allStats.push({ courseId, stats });

    for (const q of questions) {
      totalQ++;
      if (!(q.difficulty10 >= 1 && q.difficulty10 <= 10)) missingDiff++;
      if (!Array.isArray(q.subtopics) || !q.subtopics.length) missingSubs++;
    }
    console.log(
      `${courseId}: ${questions.length} Q · avg d10=${stats.avgDifficulty10} · median=${stats.medianDifficulty10}`
    );
  }

  const md = formatStatsMarkdown(allStats);
  fs.writeFileSync(path.join(ROOT, 'BANK_STATS.md'), md, 'utf8');
  console.log('\nWrote BANK_STATS.md and stats/*.json');
  console.log(`Verified ${totalQ} questions; missing difficulty10=${missingDiff}, empty subtopics=${missingSubs}`);
  if (missingDiff || missingSubs) process.exitCode = 2;
}

main();
