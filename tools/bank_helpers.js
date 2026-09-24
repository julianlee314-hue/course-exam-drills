'use strict';
const fs = require('fs');
const path = require('path');
const { THEMES, flavorOf } = require('./themes');
const math = require('./mathutil');
const { enrichQuestion, computeBankStats } = require('./question_metadata');
const { rewriteQuestion } = require('./rewrite_language');

const OUT_DIR = path.join(__dirname, '..', 'banks');
const TARGET = 1024;

function normalizePrompt(p) {
  return String(p).toLowerCase().replace(/\s+/g, ' ').trim();
}
function makeId(courseId, n) {
  return courseId + '-' + String(n).padStart(4, '0');
}
function steps(...parts) {
  return parts.map((s) => String(s).trim()).filter(Boolean);
}
function solFrom(stepsArr, answer) {
  const s = (stepsArr || []).map((x) => String(x).trim()).filter(Boolean);
  if (answer != null && !s.some((x) => String(x).includes(String(answer)))) {
    s.push('Answer: ' + answer);
  }
  return { solutionSteps: s, solution: s.join(' → ') };
}
function mcShuffle(correct, distractors, salt) {
  const opts = [String(correct), ...distractors.map(String)].slice(0, 4);
  const k = Math.abs(salt | 0) % opts.length;
  const rotated = opts.slice(k).concat(opts.slice(0, k));
  const idx = rotated.indexOf(String(correct));
  return { options: rotated, answer: String.fromCharCode(65 + (idx < 0 ? 0 : idx)) };
}
function who(f) { return f.char; }
function where(f) { return f.setting; }
function stuff(f) { return f.item; }

function buildBank(courseId, factories, target) {
  target = target || TARGET;
  const seen = new Set();
  const questions = [];
  let salt = 0;
  // Round-robin: one param per (factory, theme) each round so all themes appear
  const maxRounds = 200;
  for (let round = 0; round < maxRounds && questions.length < target; round++) {
    for (let fi = 0; fi < factories.length && questions.length < target; fi++) {
      const fac = factories[fi];
      let paramSets;
      try { paramSets = fac.params(round, salt); } catch (e) { continue; }
      if (!Array.isArray(paramSets)) paramSets = [paramSets];
      if (!paramSets.length) continue;
      // Pick a rotating param index so grids stay varied without dumping a whole theme's grid at once
      const pi = round % paramSets.length;
      for (let ti = 0; ti < THEMES.length && questions.length < target; ti++) {
        const theme = THEMES[ti];
        const f = flavorOf(theme, salt + round * 97 + fi * 13 + pi * 3 + ti * 5);
        salt++;
        let q;
        try { q = fac.make(f, paramSets[pi], salt); } catch (e) { continue; }
        if (!q || !q.prompt || q.answer == null || String(q.answer).trim() === '') continue;
        const key = normalizePrompt(q.prompt);
        if (seen.has(key)) continue;
        seen.add(key);
        const type = q.type || 'short';
        const packed = solFrom(q.solutionSteps || String(q.solution || '').split(/\s*→\s*/), q.answer);
        const item = {
          id: makeId(courseId, questions.length + 1),
          section: q.section,
          difficulty: q.difficulty || 'medium',
          type,
          prompt: q.prompt,
          answer: String(q.answer),
          solution: packed.solution,
          tags: Array.from(new Set([...(q.tags || []), theme.id, 'bank'])),
          theme: theme.name
        };
        if (packed.solutionSteps.length) item.solutionSteps = packed.solutionSteps;
        if (type === 'mc' && q.options) item.options = q.options;
        questions.push(enrichQuestion(rewriteQuestion(item)));
      }
    }
  }
  return questions;
}

function writeBank(courseId, questions) {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const enriched = questions.map((q) => enrichQuestion(rewriteQuestion(q)));
  const payload = {
    courseId,
    count: enriched.length,
    generatedAt: new Date().toISOString(),
    enrichedAt: new Date().toISOString(),
    stats: computeBankStats(enriched),
    questions: enriched
  };
  const body =
    'window.QUESTION_BANKS = window.QUESTION_BANKS || {};\n' +
    'window.QUESTION_BANKS[' + JSON.stringify(courseId) + '] = ' +
    JSON.stringify(payload) + ';\n';
  const out = path.join(OUT_DIR, courseId + '.js');
  fs.writeFileSync(out, body, 'utf8');
  return { out, count: questions.length };
}

module.exports = {
  THEMES, flavorOf, math, TARGET, OUT_DIR,
  buildBank, writeBank, steps, solFrom, mcShuffle, who, where, stuff,
  gcd: math.gcd, simp: math.simp, fmtFrac: math.fmtFrac, lcm: math.lcm,
  isPerfectSquare: math.isPerfectSquare, pythagoreanTriple: math.pythagoreanTriple
};
