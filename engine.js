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


  // ---------- Question banks ----------
  function getBank(courseId) {
    const banks = global.QUESTION_BANKS || {};
    const b = banks[courseId];
    if (!b || !Array.isArray(b.questions) || !b.questions.length) return null;
    return b;
  }

  function bankSize(courseId) {
    const b = getBank(courseId);
    return b ? b.questions.length : 0;
  }

  function cloneQuestion(q, index) {
    const out = Object.assign({}, q);
    out._index = index;
    out.type = out.type || 'short';
    if (Array.isArray(q.options)) out.options = q.options.slice();
    if (Array.isArray(q.solutionSteps)) out.solutionSteps = q.solutionSteps.slice();
    if (Array.isArray(q.tags)) out.tags = q.tags.slice();
    return out;
  }

  function assembleFromBank(course, bank, rng, options) {
    options = options || {};
    const n = options.n || 25;
    const pool = bank.questions.slice();
    const byDiff = { easy: [], medium: [], hard: [] };
    pool.forEach((q, i) => {
      const d = q.difficulty || 'medium';
      if (byDiff[d]) byDiff[d].push(i);
      else byDiff.medium.push(i);
    });
    // shuffle index lists
    byDiff.easy = rng.shuffle(byDiff.easy);
    byDiff.medium = rng.shuffle(byDiff.medium);
    byDiff.hard = rng.shuffle(byDiff.hard);

    const nEasy = Math.max(1, Math.round(n * 0.35));
    const nHard = Math.max(1, Math.round(n * 0.2));
    const nMed = Math.max(0, n - nEasy - nHard);
    const plan = rng.shuffle(
      [].concat(
        Array(nEasy).fill('easy'),
        Array(nMed).fill('medium'),
        Array(nHard).fill('hard')
      )
    );

    const used = new Set();
    const questions = [];
    const ptr = { easy: 0, medium: 0, hard: 0 };

    function take(diff) {
      const list = byDiff[diff] || [];
      while (ptr[diff] < list.length) {
        const idx = list[ptr[diff]++];
        if (used.has(idx)) continue;
        used.add(idx);
        return pool[idx];
      }
      return null;
    }

    for (let i = 0; i < plan.length; i++) {
      let q = take(plan[i]);
      if (!q) q = take('medium') || take('easy') || take('hard');
      if (!q) break;
      questions.push(cloneQuestion(q, questions.length + 1));
    }

    // Fill from full shuffle if needed
    if (questions.length < n) {
      const rest = rng.shuffle(pool.map((_, i) => i).filter((i) => !used.has(i)));
      for (const idx of rest) {
        if (questions.length >= n) break;
        used.add(idx);
        questions.push(cloneQuestion(pool[idx], questions.length + 1));
      }
    }

    return {
      courseId: course.id,
      seed: rng.seed,
      createdAt: new Date().toISOString(),
      questions,
      n: questions.length,
      source: 'bank',
      bankCount: pool.length
    };
  }

  // ---------- Exam assembly ----------
  function assembleExam(course, rng, options) {
    options = options || {};
    const n = options.n || 25;
    const bank = getBank(course.id);
    if (bank && !options.forceLive) {
      return assembleFromBank(course, bank, rng, options);
    }
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

    let parts;
    if (/\n/.test(text)) {
      parts = text.split(/\n+/);
    } else if (/→/.test(text)) {
      // Keep label before first arrow with the first clause when it's a short tag like "Factor:"
      parts = text.split(/\s*→\s*/);
      if (parts.length >= 2 && /^[A-Za-z][A-Za-z\s]{0,20}:$/.test(parts[0].trim())) {
        parts[1] = parts[0].trim() + ' ' + parts[1].trim();
        parts.shift();
      }
    } else {
      parts = text.split(/(?<=\.)\s+(?=[A-Z(0-9])|(?<=;)\s+/);
    }
    parts = parts.map((s) => s.trim()).filter(Boolean);

    const merged = [];
    for (let i = 0; i < parts.length; i++) {
      let p = parts[i];
      // Merge dangling short prefixes (e.g. "FOIL:") into the next chunk
      if (p.length <= 24 && /:$/.test(p) && i + 1 < parts.length) {
        parts[i + 1] = p + ' ' + parts[i + 1];
        continue;
      }
      merged.push(p);
    }

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
    assembleFromBank,
    getBank,
    bankSize,
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
