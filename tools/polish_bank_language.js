#!/usr/bin/env node
'use strict';

/**
 * Polish every banks/*.js prompt + solution into natural English.
 * Answers and metadata (difficulty10, subtopics, topics, meta, points) stay identical.
 *
 * Usage: node tools/polish_bank_language.js
 */

const fs = require('fs');
const path = require('path');
const { rewriteQuestion } = require('./rewrite_language');

const ROOT = path.join(__dirname, '..');
const BANKS = path.join(ROOT, 'banks');
const SNAP = path.join(ROOT, '_snapshots', 'pre_polish_answers.json');

const BANNED = /messing about|This is really about|Find lim_\s*$| is messing|It['’]s a friendly way into|friendly way into|training des banner|banner at\s*:|poly\s*@|\(\s*\)\s*$/i;

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

function metaEqual(a, b) {
  return (
    a.difficulty10 === b.difficulty10 &&
    JSON.stringify(a.subtopics) === JSON.stringify(b.subtopics) &&
    JSON.stringify(a.topics) === JSON.stringify(b.topics) &&
    JSON.stringify(a.meta) === JSON.stringify(b.meta) &&
    a.points === b.points
  );
}

function main() {
  if (!fs.existsSync(SNAP)) {
    console.error('Missing snapshot at', SNAP);
    process.exit(1);
  }
  const snapshot = JSON.parse(fs.readFileSync(SNAP, 'utf8'));
  const files = fs.readdirSync(BANKS).filter((f) => f.endsWith('.js')).sort();

  let total = 0;
  let answerDrift = 0;
  let metaDrift = 0;
  let bannedHits = 0;
  const bannedSamples = [];

  for (const file of files) {
    const bank = loadBank(path.join(BANKS, file));
    const courseId = bank.courseId || path.basename(file, '.js');
    const snapQs = snapshot[courseId];
    if (!snapQs || snapQs.length !== bank.questions.length) {
      console.error(`${courseId}: snapshot mismatch (${snapQs && snapQs.length} vs ${bank.questions.length})`);
      process.exitCode = 2;
      continue;
    }

    const questions = bank.questions.map((q, i) => {
      const polished = rewriteQuestion(q);
      // Force-preserve answer + metadata from the live pre-polish question (and cross-check snapshot)
      polished.answer = String(q.answer);
      polished.difficulty10 = q.difficulty10;
      polished.subtopics = q.subtopics;
      polished.topics = q.topics;
      polished.meta = q.meta;
      polished.points = q.points;
      if (String(polished.answer) !== String(snapQs[i].answer)) answerDrift++;
      if (!metaEqual(polished, q)) metaDrift++;
      if (BANNED.test(polished.prompt)) {
        bannedHits++;
        if (bannedSamples.length < 8) bannedSamples.push({ id: polished.id, prompt: polished.prompt });
      }
      return polished;
    });

    const payload = Object.assign({}, bank, {
      courseId,
      count: questions.length,
      polishedAt: new Date().toISOString(),
      questions
    });
    writeBank(courseId, payload);
    total += questions.length;
    console.log(`${courseId}: polished ${questions.length}`);
  }

  console.log(`Done. ${total} questions.`);
  console.log(`Answer drift vs snapshot: ${answerDrift}`);
  console.log(`Metadata drift vs pre-polish objects: ${metaDrift}`);
  console.log(`Banned-phrase hits: ${bannedHits}`);
  if (bannedSamples.length) {
    console.log('Samples:', JSON.stringify(bannedSamples, null, 2));
  }
  if (answerDrift || bannedHits) process.exitCode = 2;
}

main();
