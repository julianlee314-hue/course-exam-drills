/**
 * Course Exam Drills — shared engine
 * Seeded RNG, math helpers, exam assembly, scoring, localStorage history
 */
(function (global) {
  'use strict';

  // ---------- Seeded RNG (mulberry32) ----------
  function hashString(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return (h >>> 0) || 1;
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function createRng(seedInput) {
    const seedStr = seedInput == null || seedInput === ''
      ? String(Date.now()) + '-' + Math.floor(Math.random() * 1e9)
      : String(seedInput);
    const seed = hashString(seedStr);
    const rand = mulberry32(seed);
    return {
      seed: seedStr,
      seedNum: seed,
      next: rand,
      int(min, max) {
        // inclusive
        return Math.floor(rand() * (max - min + 1)) + min;
      },
      pick(arr) {
        return arr[Math.floor(rand() * arr.length)];
      },
      shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(rand() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      },
      bool(p) {
        return rand() < (p == null ? 0.5 : p);
      },
      float(min, max, decimals) {
        const v = min + rand() * (max - min);
        if (decimals == null) return v;
        const f = Math.pow(10, decimals);
        return Math.round(v * f) / f;
      }
    };
  }

  // ---------- Math helpers ----------
  function gcd(a, b) {
    a = Math.abs(a | 0);
    b = Math.abs(b | 0);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a || 1;
  }

  function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
  }

  function simplifyFraction(n, d) {
    if (d < 0) {
      n = -n;
      d = -d;
    }
    if (d === 0) return { n, d: 1, str: String(n) };
    const g = gcd(n, d);
    n /= g;
    d /= g;
    return {
      n,
      d,
      str: d === 1 ? String(n) : n + '/' + d
    };
  }

  function fmtFrac(n, d) {
    return simplifyFraction(n, d).str;
  }

  function fmtSigned(n) {
    if (n > 0) return '+' + n;
    return String(n);
  }

  function fmtTerm(coef, variable, isFirst) {
    if (coef === 0) return '';
    const abs = Math.abs(coef);
    let body = abs === 1 && variable ? variable : abs + (variable || '');
    if (isFirst) {
      return coef < 0 ? '-' + body : body;
    }
    return (coef < 0 ? ' − ' : ' + ') + body;
  }

  function fmtPoly(coeffs, variable) {
    // coeffs[0] = const, coeffs[1] = x, coeffs[2] = x^2, ...
    variable = variable || 'x';
    const parts = [];
    for (let i = coeffs.length - 1; i >= 0; i--) {
      const c = coeffs[i];
      if (c === 0) continue;
      let v = '';
      if (i === 1) v = variable;
      else if (i > 1) v = variable + '²'.repeat
        ? (i === 2 ? variable + '²' : i === 3 ? variable + '³' : variable + '^' + i)
        : variable + '^' + i;
      if (i >= 2) {
        const supers = { 2: '²', 3: '³', 4: '⁴', 5: '⁵' };
        v = variable + (supers[i] || ('^' + i));
      }
      parts.push({ c, v });
    }
    if (!parts.length) return '0';
    let s = '';
    parts.forEach((p, idx) => {
      const abs = Math.abs(p.c);
      let body;
      if (!p.v) body = String(abs);
      else if (abs === 1) body = p.v;
      else body = abs + p.v;
      if (idx === 0) s += (p.c < 0 ? '-' : '') + body;
      else s += (p.c < 0 ? ' − ' : ' + ') + body;
    });
    return s;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function nearlyEqual(a, b, tol) {
    tol = tol == null ? 1e-6 : tol;
    if (typeof a === 'number' && typeof b === 'number') {
      return Math.abs(a - b) <= tol || Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
    }
    return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
  }

  function normalizeAnswer(s) {
    return String(s)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/,/g, '')
      .replace(/^\+/, '');
  }

  function answersMatch(user, correct, opts) {
    opts = opts || {};
    if (user == null || String(user).trim() === '') return false;
    const u = String(user).trim();
    const c = String(correct).trim();

    // Multiple choice: letter or full option
    if (opts.type === 'mc') {
      const ul = u.charAt(0).toUpperCase();
      const cl = c.charAt(0).toUpperCase();
      if (/^[A-D]$/i.test(ul) && ul === cl) return true;
      return normalizeAnswer(u) === normalizeAnswer(c);
    }

    if (opts.type === 'tf') {
      const yes = /^(t|true|yes|y|1)$/i.test(u);
      const no = /^(f|false|no|n|0)$/i.test(u);
      const cy = /^(t|true|yes)/i.test(c);
      if (yes) return cy;
      if (no) return !cy;
      return normalizeAnswer(u) === normalizeAnswer(c);
    }

    // Numeric / fraction
    const parseNum = (x) => {
      x = String(x).replace(/\s/g, '');
      if (/^-?\d+\/-?\d+$/.test(x)) {
        const [n, d] = x.split('/').map(Number);
        if (d !== 0) return n / d;
      }
      const m = Number(x);
      return Number.isFinite(m) ? m : null;
    };

    const un = parseNum(u);
    const cn = parseNum(c);
    if (un != null && cn != null) {
      return nearlyEqual(un, cn, opts.tol);
    }

    // Accept equivalent fractions in string form after simplify
    const fracRe = /^(-?\d+)\s*\/\s*(-?\d+)$/;
    const um = u.match(fracRe);
    const cm = c.match(fracRe);
    if (um && cm) {
      return simplifyFraction(+um[1], +um[2]).str === simplifyFraction(+cm[1], +cm[2]).str;
    }

    // Set of answers (comma or "or")
    if (c.includes('|')) {
      return c.split('|').some((alt) => answersMatch(u, alt.trim(), opts));
    }

    return normalizeAnswer(u) === normalizeAnswer(c);
  }

  // ---------- Exam assembly ----------
  function assembleExam(course, rng, options) {
    options = options || {};
    const n = options.n || 25;
    const gens = course.generators || [];
    if (!gens.length) throw new Error('No generators for course ' + course.id);

    const byDiff = { easy: [], medium: [], hard: [] };
    gens.forEach((g, i) => {
      // probe once lightly — generators declare difficulty per question
      byDiff.medium.push(i); // we'll balance after generation
    });

    // Target difficulty mix
    const nEasy = Math.max(1, Math.round(n * 0.35));
    const nHard = Math.max(1, Math.round(n * 0.2));
    const nMed = n - nEasy - nHard;

    const targets = [];
    for (let i = 0; i < nEasy; i++) targets.push('easy');
    for (let i = 0; i < nMed; i++) targets.push('medium');
    for (let i = 0; i < nHard; i++) targets.push('hard');
    const shuffledTargets = rng.shuffle(targets);

    // Prefer covering sections: round-robin generators
    const order = rng.shuffle(gens.map((_, i) => i));
    const questions = [];
    const usedIds = new Set();
    let attempts = 0;
    let gi = 0;

    while (questions.length < n && attempts < n * 40) {
      attempts++;
      const gen = gens[order[gi % order.length]];
      gi++;
      let q;
      try {
        q = gen(rng);
      } catch (e) {
        continue;
      }
      if (!q || !q.prompt) continue;
      const want = shuffledTargets[questions.length] || 'medium';
      // Soft filter: if difficulty doesn't match and we have room, sometimes skip
      if (q.difficulty && q.difficulty !== want && rng.next() < 0.55 && attempts < n * 20) {
        continue;
      }
      const uid = (q.id || 'q') + '::' + (q.prompt || '').slice(0, 80);
      if (usedIds.has(uid)) continue;
      usedIds.add(uid);
      q._index = questions.length + 1;
      q.type = q.type || 'short';
      questions.push(q);
    }

    // Fill remaining without difficulty filter
    while (questions.length < n && attempts < n * 80) {
      attempts++;
      const gen = gens[rng.int(0, gens.length - 1)];
      let q;
      try {
        q = gen(rng);
      } catch (e) {
        continue;
      }
      if (!q || !q.prompt) continue;
      const uid = (q.id || 'q') + '::' + (q.prompt || '').slice(0, 80);
      if (usedIds.has(uid)) continue;
      usedIds.add(uid);
      q._index = questions.length + 1;
      q.type = q.type || 'short';
      questions.push(q);
    }

    return {
      courseId: course.id,
      seed: rng.seed,
      createdAt: new Date().toISOString(),
      questions,
      n: questions.length
    };
  }

  // ---------- Scoring ----------
  function scoreExam(exam, responses) {
    let correct = 0;
    const details = exam.questions.map((q, i) => {
      const user = responses[i] == null ? '' : responses[i];
      const ok = answersMatch(user, q.answer, { type: q.type, tol: q.tol });
      if (ok) correct++;
      return { index: i, ok, user, answer: q.answer };
    });
    return {
      correct,
      total: exam.questions.length,
      percent: exam.questions.length
        ? Math.round((1000 * correct) / exam.questions.length) / 10
        : 0,
      details
    };
  }

  // ---------- History (localStorage) ----------
  const HIST_KEY = 'courseExams.history.v1';
  const MAX_PER_COURSE = 20;

  function loadHistory() {
    try {
      const raw = localStorage.getItem(HIST_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveAttempt(courseId, attempt) {
    const all = loadHistory();
    if (!all[courseId]) all[courseId] = [];
    all[courseId].unshift(attempt);
    all[courseId] = all[courseId].slice(0, MAX_PER_COURSE);
    try {
      localStorage.setItem(HIST_KEY, JSON.stringify(all));
    } catch (e) {
      /* quota */
    }
    return all[courseId];
  }

  function getHistory(courseId) {
    return loadHistory()[courseId] || [];
  }


  // ---------- Solution steps (line-by-line reveal) ----------
  function solutionSteps(q) {
    if (!q) return [];
    if (Array.isArray(q.solutionSteps) && q.solutionSteps.length) {
      return q.solutionSteps.map((s) => String(s).trim()).filter(Boolean);
    }
    let text = String(q.solution || '').trim();
    if (!text && q.answer != null) text = 'Answer: ' + q.answer;
    if (!text) return ['No worked solution recorded for this item.'];

    // Prefer explicit newlines
    let parts = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    if (parts.length <= 1) {
      // Split on sentence/clause boundaries used in generators
      parts = text
        .split(/\s*→\s*|(?<=[.!;:])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    // Keep short leftovers attached
    const merged = [];
    for (const p of parts) {
      if (merged.length && p.length < 12 && !/[.!:]$/.test(merged[merged.length - 1])) {
        merged[merged.length - 1] += ' ' + p;
      } else {
        merged.push(p);
      }
    }
    // Always end with explicit answer if not already last line
    const ans = q.answer != null ? String(q.answer).trim() : '';
    if (ans) {
      const last = (merged[merged.length - 1] || '').toLowerCase();
      if (!last.includes(ans.toLowerCase()) && !/^answer\b/i.test(last)) {
        merged.push('Answer: ' + ans);
      }
    }
    return merged.length ? merged : [text];
  }

  function formatSolutionText(q) {
    return solutionSteps(q).join('\n');
  }

  // ---------- Registry ----------
  const courses = {};

  function registerCourse(course) {
    courses[course.id] = course;
  }

  function getCourse(id) {
    return courses[id];
  }

  function listCourses() {
    return Object.keys(courses).map((k) => courses[k]);
  }

  global.ExamEngine = {
    createRng,
    hashString,
    gcd,
    lcm,
    simplifyFraction,
    fmtFrac,
    fmtSigned,
    fmtTerm,
    fmtPoly,
    escapeHtml,
    nearlyEqual,
    normalizeAnswer,
    answersMatch,
    assembleExam,
    scoreExam,
    saveAttempt,
    getHistory,
    loadHistory,
    registerCourse,
    getCourse,
    listCourses,
    courses,
    solutionSteps,
    formatSolutionText
  };
})(typeof window !== 'undefined' ? window : globalThis);
