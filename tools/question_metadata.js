'use strict';

/**
 * Shared metadata enrichment for bank questions.
 *
 * Points rule (current): points = 1 for every question so overall % and
 * by-topic % are unweighted and easy to read. Weighted fields in scoreExam
 * still mirror raw counts (pointsEarned === correct).
 *
 * Optional weighted rule (documented, not applied): points = 1 + floor((difficulty10-1)/3)
 * → maps 1–3→1, 4–6→2, 7–9→3, 10→4.
 */

const THEME_SLUGS = new Set([
  'harry-potter', 'star-wars', 'pixar', 'nintendo', 'marvel', 'lotr', 'atla',
  'cartoons', 'disney-classics', 'lego', 'sports-kids', 'space-kids', 'bank'
]);

function simpleHash(s) {
  let h = 2166136261;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function bandFrom10(d) {
  const n = Math.max(1, Math.min(10, d | 0));
  if (n <= 3) return 'easy';
  if (n <= 6) return 'medium';
  return 'hard';
}

function estimateDifficulty10(q) {
  if (Number.isInteger(q.difficulty10) && q.difficulty10 >= 1 && q.difficulty10 <= 10) {
    return q.difficulty10;
  }
  const band = String(q.difficulty || 'medium').toLowerCase();
  let base = band === 'easy' ? 2 : band === 'hard' ? 8 : 5;

  const steps = Array.isArray(q.solutionSteps) ? q.solutionSteps.length : 0;
  const prompt = String(q.prompt || '');
  const tags = (q.tags || []).join(' ').toLowerCase();
  const section = String(q.section || '').toLowerCase();
  const hay = prompt + ' ' + tags + ' ' + section;

  if (steps >= 4) base += 1;
  if (steps >= 6) base += 1;
  if (String(q.type) === 'tf') base = Math.min(base, 3);
  if (String(q.type) === 'mc') base = Math.max(1, base - 1);

  if (/proof|epsilon|induction|eigen|characteristic|supremum|infimum|nested|ivt|p-series|chain rule|product rule|binomial theorem|conjugate|modulus|rref|orthogonal/i.test(hay)) {
    base += 1;
  }
  if (/true or false|definition|order of operations|substitute|rounding|complement|postulates|mean|median|range/i.test(hay)) {
    base -= 1;
  }
  if (/quadratic|factor|logs|integral|derivative|probability|pythagoras|trig|composition|volume|series/i.test(hay)) {
    base += 0; // keep base; medium-ish skills
  }

  const jitter = (simpleHash(q.id || prompt) % 3) - 1;
  base += jitter;

  if (band === 'easy') base = Math.min(Math.max(base, 1), 4);
  else if (band === 'hard') base = Math.min(Math.max(base, 6), 10);
  else base = Math.min(Math.max(base, 3), 7);

  return Math.min(10, Math.max(1, Math.round(base)));
}

function skillTagsFrom(q) {
  const tags = Array.isArray(q.tags) ? q.tags : [];
  return tags
    .map((t) => String(t).trim())
    .filter((t) => t && !THEME_SLUGS.has(t.toLowerCase()));
}

function deriveSubtopics(q) {
  if (Array.isArray(q.subtopics) && q.subtopics.length) {
    return q.subtopics.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 3);
  }
  const skills = skillTagsFrom(q);
  const out = [];
  for (const s of skills) {
    if (!out.includes(s)) out.push(s);
    if (out.length >= 3) break;
  }
  if (!out.length && q.section) out.push(String(q.section));
  if (!out.length) out.push('general');
  return out.slice(0, 3);
}

function guessBloom(q, difficulty10) {
  const type = String(q.type || 'short');
  const tags = (q.tags || []).join(' ').toLowerCase();
  const prompt = String(q.prompt || '').toLowerCase();
  if (type === 'tf' || /definition|postulate|true or false|concept/.test(tags + ' ' + prompt)) {
    return 'remember';
  }
  if (difficulty10 >= 8 || /proof|show that|explain why|compare|analyze|epsilon/.test(prompt)) {
    return 'analyze';
  }
  if (difficulty10 <= 3 && type !== 'short') return 'understand';
  if (difficulty10 <= 3) return 'understand';
  return 'apply';
}

function estimatedSeconds(q, difficulty10) {
  const type = String(q.type || 'short');
  if (type === 'tf') return 25 + difficulty10 * 5;
  if (type === 'mc') return 40 + difficulty10 * 8;
  return 50 + difficulty10 * 15;
}

/** points = 1 (equal weight). See file header for optional weighted rule. */
function pointsFor(_difficulty10) {
  return 1;
}

function enrichQuestion(q) {
  const difficulty10 = estimateDifficulty10(q);
  const difficulty = bandFrom10(difficulty10);
  const subtopics = deriveSubtopics(q);
  const section = q.section || 'General';
  const topics = Array.isArray(q.topics) && q.topics.length
    ? q.topics.map(String)
    : [section, ...subtopics.filter((s) => s !== section)];
  const type = q.type || 'short';
  const theme = q.theme || '';
  const meta = Object.assign({}, q.meta || {}, {
    bloom: (q.meta && q.meta.bloom) || guessBloom(q, difficulty10),
    type,
    theme,
    estimatedSeconds: (q.meta && q.meta.estimatedSeconds) || estimatedSeconds(q, difficulty10),
    skills: subtopics.slice()
  });
  const points = Number.isFinite(q.points) ? q.points : pointsFor(difficulty10);

  const out = Object.assign({}, q, {
    difficulty10,
    difficulty,
    subtopics,
    topics,
    meta,
    points
  });
  return out;
}

function median(nums) {
  if (!nums.length) return 0;
  const a = nums.slice().sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}

function computeBankStats(questions) {
  const byDifficulty10 = {};
  for (let i = 1; i <= 10; i++) byDifficulty10[i] = 0;
  const byDifficultyBand = { easy: 0, medium: 0, hard: 0 };
  const bySection = {};
  const bySubtopic = {};
  const byType = { short: 0, mc: 0, tf: 0 };
  const byTheme = {};
  const diffs = [];

  for (const q of questions) {
    const d = q.difficulty10 | 0;
    if (d >= 1 && d <= 10) byDifficulty10[d]++;
    const band = q.difficulty || bandFrom10(d);
    if (byDifficultyBand[band] != null) byDifficultyBand[band]++;
    else byDifficultyBand.medium++;

    const sec = q.section || 'General';
    bySection[sec] = (bySection[sec] || 0) + 1;

    for (const st of q.subtopics || []) {
      bySubtopic[st] = (bySubtopic[st] || 0) + 1;
    }

    const t = q.type || 'short';
    if (byType[t] != null) byType[t]++;
    else byType[t] = 1;

    const th = q.theme || 'none';
    byTheme[th] = (byTheme[th] || 0) + 1;

    if (d >= 1 && d <= 10) diffs.push(d);
  }

  const avgDifficulty10 = diffs.length
    ? Math.round((diffs.reduce((a, b) => a + b, 0) / diffs.length) * 100) / 100
    : 0;
  const medianDifficulty10 = diffs.length
    ? Math.round(median(diffs) * 100) / 100
    : 0;

  return {
    total: questions.length,
    byDifficulty10,
    byDifficultyBand,
    bySection,
    bySubtopic,
    byType,
    byTheme,
    avgDifficulty10,
    medianDifficulty10
  };
}

function formatStatsMarkdown(allStats) {
  const lines = [
    '# Course Exam Drills — Bank statistics',
    '',
    'Generated by `tools/enrich_bank_metadata.js`.',
    '',
    '**Difficulty:** `difficulty10` is an integer 1–10. Band mapping: 1–3 easy, 4–6 medium, 7–10 hard.',
    '**Points:** every question has `points = 1` (unweighted % by topic).',
    '**Subtopics:** 1–3 skill labels derived from factory tags (theme slugs excluded).',
    ''
  ];
  for (const { courseId, stats } of allStats) {
    lines.push(`## ${courseId}`);
    lines.push('');
    lines.push(`- **Total:** ${stats.total}`);
    lines.push(`- **Avg difficulty10:** ${stats.avgDifficulty10}`);
    lines.push(`- **Median difficulty10:** ${stats.medianDifficulty10}`);
    lines.push(`- **Bands:** easy ${stats.byDifficultyBand.easy}, medium ${stats.byDifficultyBand.medium}, hard ${stats.byDifficultyBand.hard}`);
    lines.push(`- **Types:** short ${stats.byType.short || 0}, mc ${stats.byType.mc || 0}, tf ${stats.byType.tf || 0}`);
    lines.push('');
    lines.push('### Difficulty 1–10');
    lines.push('');
    lines.push('| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |');
    lines.push('|---|---|---|---|---|---|---|---|---|---|');
    lines.push(
      '| ' +
        Array.from({ length: 10 }, (_, i) => stats.byDifficulty10[i + 1] || 0).join(' | ') +
        ' |'
    );
    lines.push('');
    lines.push('### Sections');
    lines.push('');
    const secs = Object.entries(stats.bySection).sort((a, b) => b[1] - a[1]);
    for (const [name, n] of secs) lines.push(`- ${name}: ${n}`);
    lines.push('');
    lines.push('### Top subtopics');
    lines.push('');
    const subs = Object.entries(stats.bySubtopic).sort((a, b) => b[1] - a[1]).slice(0, 15);
    for (const [name, n] of subs) lines.push(`- ${name}: ${n}`);
    lines.push('');
  }
  return lines.join('\n');
}

module.exports = {
  THEME_SLUGS,
  bandFrom10,
  estimateDifficulty10,
  deriveSubtopics,
  enrichQuestion,
  computeBankStats,
  formatStatsMarkdown,
  pointsFor,
  guessBloom
};
