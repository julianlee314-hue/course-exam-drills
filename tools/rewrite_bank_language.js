#!/usr/bin/env node
'use strict';

/**
 * Rewrite all banks/*.js prompts + solutions into clearer English.
 * Preserves answers and any existing metadata fields.
 *
 * Usage: node tools/rewrite_bank_language.js
 */

const fs = require('fs');
const path = require('path');
const { rewriteQuestion } = require('./rewrite_language');

const ROOT = path.join(__dirname, '..');
const BANKS = path.join(ROOT, 'banks');

function loadBank(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const window = { QUESTION_BANKS: {} };
  const fn = new Function('window', code + '\n;return window.QUESTION_BANKS;');
  const banks = fn(window);
  const base = path.basename(filePath, '.js');
  return banks[base] || banks[Object.keys(banks)[0]];
}

function writeBank(courseId, payload) {
  const body =
    'window.QUESTION_BANKS = window.QUESTION_BANKS || {};\n' +
    'window.QUESTION_BANKS[' + JSON.stringify(courseId) + '] = ' +
    JSON.stringify(payload) + ';\n';
  fs.writeFileSync(path.join(BANKS, courseId + '.js'), body, 'utf8');
}

function main() {
  const files = fs.readdirSync(BANKS).filter((f) => f.endsWith('.js')).sort();
  let total = 0;
  for (const file of files) {
    const bank = loadBank(path.join(BANKS, file));
    const courseId = bank.courseId || path.basename(file, '.js');
    const before = bank.questions.length;
    const questions = bank.questions.map(rewriteQuestion);
    // Verify answers unchanged
    let drift = 0;
    for (let i = 0; i < before; i++) {
      if (String(questions[i].answer) !== String(bank.questions[i].answer)) drift++;
    }
    const payload = Object.assign({}, bank, {
      courseId,
      count: questions.length,
      rewrittenAt: new Date().toISOString(),
      questions
    });
    writeBank(courseId, payload);
    total += questions.length;
    console.log(`${courseId}: rewrote ${questions.length} (answer drift=${drift})`);
    if (drift) process.exitCode = 2;
  }
  console.log(`Done. ${total} questions across ${files.length} banks.`);
}

main();
