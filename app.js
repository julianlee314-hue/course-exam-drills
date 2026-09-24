/**
 * Course Exam Drills — UI router & exam runner
 */
(function () {
  'use strict';
  const E = window.ExamEngine;
  const app = document.getElementById('app');

  const state = {
    view: 'home',
    courseId: null,
    exam: null,
    responses: [],
    checked: [],
    mode: 'drill', // drill | exam
    layout: 'one', // one | paper
    qIndex: 0,
    timer: { remaining: 0, running: false, handle: null, minutes: 0 },
    submitted: false,
    lastScore: null,
    // Solution tab: face per question + how many lines revealed
    face: {},          // qi -> 'problem' | 'solution'
    reveal: {},        // qi -> number of solution lines shown
    solutionBox: {}    // qi -> last copied text in the on-page box
  };

  function esc(s) { return E.escapeHtml(s); }

  function bankLabel(courseId) {
    const n = (E.bankSize && E.bankSize(courseId)) || 0;
    if (!n) return 'Bank: live generators only';
    return 'Bank: ' + n.toLocaleString('en-US') + ' questions';
  }

  function stopTimer() {
    if (state.timer.handle) {
      clearInterval(state.timer.handle);
      state.timer.handle = null;
    }
    state.timer.running = false;
  }

  function startTimer(minutes) {
    stopTimer();
    state.timer.minutes = minutes;
    state.timer.remaining = Math.round(minutes * 60);
    state.timer.running = true;
    state.timer.handle = setInterval(() => {
      if (!state.timer.running) return;
      state.timer.remaining -= 1;
      const el = document.getElementById('timer-display');
      if (el) el.textContent = fmtTime(state.timer.remaining);
      if (state.timer.remaining <= 0) {
        stopTimer();
        if (state.mode === 'exam' && !state.submitted) {
          submitExam();
        }
      }
    }, 1000);
  }

  function fmtTime(sec) {
    const s = Math.max(0, sec);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
  }

  // ---------- Views ----------
  function renderHome() {
    stopTimer();
    state.view = 'home';
    const courses = E.listCourses();
    const order = [
      'ks3', 'algebra_trig', 'precalculus', 'calculus', 'linear_algebra',
      'real_analysis', 'ib_aa_sl', 'ib_aa_hl', 'ap_stats', 'euclidean_geometry'
    ];
    const sorted = order.map((id) => E.getCourse(id)).filter(Boolean)
      .concat(courses.filter((c) => !order.includes(c.id)));

    app.innerHTML = `
      <section class="hero">
        <h2>Pick a course exam</h2>
        <p>Each course draws from a <strong>mega question bank</strong> (1,000+ unique items) themed with kid-friendly pop culture — Harry Potter, Star Wars, Pixar/Disney, Nintendo/Pokémon, Marvel, LOTR, Avatar ATLA, classic cartoons — while keeping the math on-syllabus.
        Use <strong>Drill</strong> for instant feedback, or <strong>Exam</strong> for a timed paper.</p>
        <p>Share the on-screen <strong>seed</strong> to regenerate the same exam later.</p>
      </section>
      <div class="grid" id="course-grid">
        ${sorted.map((c) => `
          <button type="button" class="course-card" data-id="${esc(c.id)}">
            <span class="level">${esc(c.level || '')}</span>
            <h3>${esc(c.title)}</h3>
            <p class="sub">${esc(c.subtitle || '')}</p>
            <p class="tb">${esc(c.textbook || '')} · ${c.generators.length} generators</p>
            <p class="tb bank-meta">${bankLabel(c.id)}</p>
          </button>
        `).join('')}
      </div>
    `;
    app.querySelectorAll('.course-card').forEach((btn) => {
      btn.addEventListener('click', () => openCourse(btn.getAttribute('data-id')));
    });
  }

  function renderHowto() {
    stopTimer();
    state.view = 'howto';
    app.innerHTML = `
      <section class="hero">
        <h2>How to use</h2>
        <p>Offline practice exams for Julius’s core textbook set. Open <code>index.html</code> in any browser (file:// works).</p>
      </section>
      <div class="howto">
        <details open>
          <summary>Drill vs Exam</summary>
          <p><strong>Drill (default):</strong> check each question immediately, then open the <strong>Solution</strong> tab for a line-by-line walkthrough.</p>
          <p><strong>Exam:</strong> hide solutions until you Submit All. Optional timer auto-submits when it hits zero.</p>
        </details>
        <details open>
          <summary>Solution tab</summary>
          <p>Flip any card to <strong>Solution</strong>. Press <kbd>Enter</kbd> to reveal the next line of the worked solution.
          <strong>Copy solution</strong> fills the solution box on the card and copies the full write-up to your clipboard.</p>
        </details>
        <details open>
          <summary>Seeds</summary>
          <p>Every exam has a seed (shown in the meta bar). <em>Retry same seed</em> rebuilds the identical paper.
          <em>New exam</em> draws a fresh seed. Paste a seed in the setup screen to share an exam with someone else.</p>
        </details>
        <details>
          <summary>Layouts &amp; export</summary>
          <p><strong>One at a time</strong> or <strong>Paper</strong> (scrollable). Export printable HTML/text via the toolbar; use your browser Print dialog (print CSS included).</p>
        </details>
        <details>
          <summary>Scoring &amp; history</summary>
          <p>Numeric and fraction answers are compared after simplification (e.g. 2/4 = 1/2).
          Last 20 attempts per course stay in this browser’s localStorage.</p>
        </details>
        <details open>
          <summary>Mega question banks &amp; themes</summary>
          <p>Every course ships with a pre-generated bank of <strong>at least 1,000 unique questions</strong> (typically 1,024).
          Exams draw primarily from the bank (seeded shuffle); live generators are only a fallback if a bank is missing.</p>
          <p>Prompts are heavily flavored with <strong>funny, kid-friendly pop culture</strong> — Harry Potter, Star Wars, Pixar/Disney, Nintendo/Pokémon, Marvel (PG), Lord of the Rings (light), Avatar: The Last Airbender, classic cartoons, LEGO builders, and friendly space adventures — while answers stay mathematically exact.</p>
          <p>Banks live in <code>banks/&lt;courseId&gt;.js</code> and are rebuilt with <code>node tools/generate_banks.js</code>.</p>
        </details>
        <details>
          <summary>Courses</summary>
          <ol>
            <li>KS3 Foundation — CGP KS3 Maths 1–3</li>
            <li>Algebra &amp; Trigonometry — OpenStax Alg &amp; Trig 2e</li>
            <li>Precalculus — Stewart Precalculus 8e</li>
            <li>Calculus 1–3 — Stewart Calculus ET 9e</li>
            <li>Linear Algebra — Andrilli &amp; Hecker ELA 6e</li>
            <li>Real Analysis — Abbott Understanding Analysis</li>
            <li>IB AA SL — Haese Red Book</li>
            <li>IB AA HL — Oxford Green Book</li>
            <li>AP Statistics — AP Stats 2020</li>
            <li>Euclidean Geometry — Euclid Elements (Heath)</li>
          </ol>
        </details>
      </div>
      <p class="no-print"><button type="button" class="btn btn-primary" id="back-home">Back to courses</button></p>
    `;
    document.getElementById('back-home').onclick = renderHome;
  }

  function openCourse(id) {
    const course = E.getCourse(id);
    if (!course) return;
    state.courseId = id;
    state.view = 'setup';
    stopTimer();
    const presets = course.examPresets || {
      quick: { n: 10, minutes: 20 },
      standard: { n: 25, minutes: 60 },
      full: { n: 40, minutes: 90 }
    };
    const hist = E.getHistory(id);

    app.innerHTML = `
      <section class="hero">
        <p class="brand-sub"><button type="button" class="btn btn-ghost" id="back">← Courses</button></p>
        <h2>${esc(course.title)}</h2>
        <p>${esc(course.description || course.subtitle || '')}</p>
        <p class="tb"><strong>Textbook:</strong> ${esc(course.textbook || '')}</p>
        <p class="tb"><strong>${bankLabel(id)}</strong> · exams draw from the bank (seeded)</p>
      </section>
      <section class="panel">
        <h3>Start an exam</h3>
        <div class="controls">
          <div class="field">
            <label>Preset</label>
            <select id="preset">
              <option value="quick">Quick — ${presets.quick.n} Q · ${presets.quick.minutes} min</option>
              <option value="standard" selected>Standard — ${presets.standard.n} Q · ${presets.standard.minutes} min</option>
              <option value="full">Full — ${presets.full.n} Q · ${presets.full.minutes} min</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div class="field">
            <label># questions</label>
            <input type="number" id="nQ" min="1" max="80" value="${presets.standard.n}" />
          </div>
          <div class="field">
            <label>Timer (min, 0 = off)</label>
            <input type="number" id="mins" min="0" max="300" value="${presets.standard.minutes}" />
          </div>
          <div class="field">
            <label>Mode</label>
            <select id="mode">
              <option value="drill" selected>Drill (check as you go)</option>
              <option value="exam">Exam (submit at end)</option>
            </select>
          </div>
          <div class="field">
            <label>Layout</label>
            <select id="layout">
              <option value="one" selected>One question at a time</option>
              <option value="paper">Paper (all questions)</option>
            </select>
          </div>
          <div class="field" style="min-width:200px;flex:1">
            <label>Seed (optional)</label>
            <input type="text" id="seed" placeholder="leave blank for random" />
          </div>
        </div>
        <div class="toolbar">
          <button type="button" class="btn btn-primary" id="start">Start</button>
        </div>
        <h3>Blueprint</h3>
        <ul>${(course.sections || []).map((s) => `<li><strong>${esc(s.name)}</strong> <span style="color:var(--muted)">(weight ${s.weight})</span></li>`).join('')}</ul>
      </section>
      <section class="panel bank-stats-panel" id="bank-stats">
        <h3>Bank stats</h3>
        <div id="bank-stats-body"></div>
      </section>
      <section class="panel">
        <h3>Recent attempts</h3>
        ${hist.length ? `<ul class="history-list">${hist.map((h) => `
          <li>
            <span>${esc(h.dateLabel || h.createdAt)} · ${h.mode} · seed <span class="seed-chip">${esc(h.seed)}</span></span>
            <strong>${h.correct}/${h.total} (${h.percent}%)</strong>
          </li>`).join('')}</ul>` : '<p style="color:var(--muted)">No attempts yet on this device.</p>'}
      </section>
    `;

    document.getElementById('back').onclick = renderHome;
    (function fillBankStats() {
      const body = document.getElementById('bank-stats-body');
      if (!body) return;
      const st = E.bankStats && E.bankStats(id);
      if (!st) {
        body.innerHTML = '<p style="color:var(--muted)">Stats appear after banks are enriched.</p>';
        return;
      }
      const types = st.byType || {};
      const typeBits = ['short', 'mc', 'tf'].map((k) => types[k] ? (k + ' ' + types[k]) : null).filter(Boolean).join(' · ');
      const secs = Object.entries(st.bySection || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const secRows = secs.map(([name, n]) =>
        `<div class="stat-bar-row"><span class="stat-label">${esc(name)}</span><span class="stat-val">${n}</span><div class="stat-bar"><i style="width:${Math.round(100 * n / st.total)}%"></i></div></div>`
      ).join('');
      const d10 = st.byDifficulty10 || {};
      const dCells = Array.from({ length: 10 }, (_, i) => `<td>${d10[i + 1] || 0}</td>`).join('');
      const band = st.byDifficultyBand || {};
      body.innerHTML = `
        <div class="stats-compact">
          <p><strong>Avg difficulty</strong> ${st.avgDifficulty10}/10 · median ${st.medianDifficulty10} · <strong>${st.total}</strong> questions</p>
          <p class="muted">Types: ${esc(typeBits || '—')} · Bands: easy ${band.easy || 0}, medium ${band.medium || 0}, hard ${band.hard || 0}</p>
          <p class="stats-subhead">Top sections</p>
          ${secRows}
        </div>
        <details class="stats-full">
          <summary>View full stats</summary>
          <table class="stats-table"><thead><tr><th colspan="10">difficulty10 counts</th></tr>
          <tr>${[1,2,3,4,5,6,7,8,9,10].map((n) => '<th>' + n + '</th>').join('')}</tr></thead>
          <tbody><tr>${dCells}</tr></tbody></table>
          <p class="stats-subhead">All sections</p>
          <ul>${Object.entries(st.bySection || {}).sort((a, b) => b[1] - a[1]).map(([n, c]) => '<li>' + esc(n) + ': ' + c + '</li>').join('')}</ul>
          <p class="stats-subhead">Top subtopics</p>
          <ul>${Object.entries(st.bySubtopic || {}).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([n, c]) => '<li>' + esc(n) + ': ' + c + '</li>').join('')}</ul>
        </details>
      `;
    })();
    const presetEl = document.getElementById('preset');
    const nQ = document.getElementById('nQ');
    const mins = document.getElementById('mins');
    presetEl.onchange = () => {
      const p = presetEl.value;
      if (p !== 'custom' && presets[p]) {
        nQ.value = presets[p].n;
        mins.value = presets[p].minutes;
      }
    };
    nQ.oninput = () => { presetEl.value = 'custom'; };
    mins.oninput = () => { presetEl.value = 'custom'; };

    document.getElementById('start').onclick = () => {
      const n = Math.max(1, Math.min(80, parseInt(nQ.value, 10) || 25));
      const minutes = Math.max(0, parseInt(mins.value, 10) || 0);
      const mode = document.getElementById('mode').value;
      const layout = document.getElementById('layout').value;
      const seed = document.getElementById('seed').value.trim();
      beginExam(course, { n, minutes, mode, layout, seed });
    };
  }

  function beginExam(course, opts) {
    const rng = E.createRng(opts.seed || undefined);
    const exam = E.assembleExam(course, rng, { n: opts.n });
    state.exam = exam;
    state.responses = exam.questions.map(() => '');
    state.checked = exam.questions.map(() => false);
    state.mode = opts.mode;
    state.layout = opts.layout;
    state.qIndex = 0;
    state.submitted = false;
    state.lastScore = null;
    state.face = {};
    state.reveal = {};
    state.solutionBox = {};
    state.view = 'exam';
    if (opts.minutes > 0) startTimer(opts.minutes);
    else stopTimer();
    renderExam();
  }

  function progressPct() {
    if (!state.exam) return 0;
    if (state.mode === 'drill') {
      const done = state.checked.filter(Boolean).length;
      return Math.round((100 * done) / state.exam.questions.length);
    }
    const filled = state.responses.filter((r) => String(r).trim() !== '').length;
    return Math.round((100 * filled) / state.exam.questions.length);
  }

  function renderExam() {
    const course = E.getCourse(state.exam.courseId);
    const exam = state.exam;
    const showSolutions = state.mode === 'drill' || state.submitted;

    app.innerHTML = `
      <section class="panel no-print">
        <div class="toolbar" style="margin-top:0">
          <button type="button" class="btn btn-ghost" id="back-setup">← Setup</button>
          <strong>${esc(course.title)}</strong>
          <span style="margin-left:auto"></span>
          <button type="button" class="btn" id="new-exam">New exam</button>
          <button type="button" class="btn" id="retry-seed">Retry same seed</button>
          <button type="button" class="btn" id="export-html">Export</button>
          <button type="button" class="btn" id="print-btn">Print</button>
        </div>
        <div class="meta-bar">
          <span>Seed <span class="seed-chip" id="seed-show">${esc(exam.seed)}</span>
            <button type="button" class="btn btn-ghost" id="copy-seed" style="padding:0.2rem 0.45rem">Copy</button></span>
          <span>Mode <strong>${esc(state.mode)}</strong></span>
          <span>Layout
            <select id="layout-tog">
              <option value="one" ${state.layout === 'one' ? 'selected' : ''}>One at a time</option>
              <option value="paper" ${state.layout === 'paper' ? 'selected' : ''}>Paper</option>
            </select>
          </span>
          <span>Progress <strong id="prog-label">${progressPct()}%</strong></span>
          ${state.timer.minutes > 0 ? `<span class="timer-live">Timer <strong id="timer-display">${fmtTime(state.timer.remaining)}</strong>
            <button type="button" class="btn btn-ghost" id="pause-timer" style="padding:0.2rem 0.45rem">${state.timer.running ? 'Pause' : 'Resume'}</button></span>` : ''}
          ${state.lastScore ? `<span>Score <strong>${state.lastScore.correct}/${state.lastScore.total} (${state.lastScore.percent}%)</strong></span>` : ''}
        </div>
        <div class="progress"><span id="prog-bar" style="width:${progressPct()}%"></span></div>
      </section>
      <div id="exam-body"></div>
      <div class="toolbar no-print" id="exam-actions"></div>
    `;

    document.getElementById('back-setup').onclick = () => openCourse(course.id);
    document.getElementById('new-exam').onclick = () => {
      beginExam(course, {
        n: exam.n,
        minutes: state.timer.minutes,
        mode: state.mode,
        layout: state.layout,
        seed: ''
      });
    };
    document.getElementById('retry-seed').onclick = () => {
      beginExam(course, {
        n: exam.n,
        minutes: state.timer.minutes,
        mode: state.mode,
        layout: state.layout,
        seed: exam.seed
      });
    };
    document.getElementById('copy-seed').onclick = () => {
      const t = exam.seed;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).catch(() => fallbackCopy(t));
      } else fallbackCopy(t);
    };
    document.getElementById('export-html').onclick = exportExam;
    document.getElementById('print-btn').onclick = () => window.print();
    document.getElementById('layout-tog').onchange = (e) => {
      state.layout = e.target.value;
      renderExam();
    };
    const pauseBtn = document.getElementById('pause-timer');
    if (pauseBtn) {
      pauseBtn.onclick = () => {
        state.timer.running = !state.timer.running;
        pauseBtn.textContent = state.timer.running ? 'Pause' : 'Resume';
      };
    }

    const body = document.getElementById('exam-body');
    if (state.layout === 'one') {
      body.innerHTML = renderQuestionCard(exam.questions[state.qIndex], state.qIndex, showSolutions);
      wireQuestion(state.qIndex);
    } else {
      body.innerHTML = exam.questions.map((q, i) => renderQuestionCard(q, i, showSolutions)).join('');
      exam.questions.forEach((_, i) => wireQuestion(i));
    }

    const actions = document.getElementById('exam-actions');
    if (state.layout === 'one') {
      actions.innerHTML = `
        <button type="button" class="btn" id="prev-q" ${state.qIndex === 0 ? 'disabled' : ''}>Previous</button>
        <button type="button" class="btn" id="next-q" ${state.qIndex >= exam.questions.length - 1 ? 'disabled' : ''}>Next</button>
        ${state.mode === 'drill' ? `<button type="button" class="btn btn-warn" id="same-topic">New question same topic</button>` : ''}
        ${state.mode === 'exam' && !state.submitted ? `<button type="button" class="btn btn-primary" id="submit-all">Submit all</button>` : ''}
        ${state.submitted || state.mode === 'drill' ? `<button type="button" class="btn btn-good" id="review-score">Score summary</button>` : ''}
      `;
      const prev = document.getElementById('prev-q');
      const next = document.getElementById('next-q');
      if (prev) prev.onclick = () => { persistCurrentInputs(); state.qIndex--; renderExam(); };
      if (next) next.onclick = () => { persistCurrentInputs(); state.qIndex++; renderExam(); };
      const st = document.getElementById('same-topic');
      if (st) st.onclick = newSameTopic;
    } else {
      actions.innerHTML = state.mode === 'exam' && !state.submitted
        ? `<button type="button" class="btn btn-primary" id="submit-all">Submit all</button>`
        : `<button type="button" class="btn btn-good" id="review-score">Score summary</button>`;
    }
    const sub = document.getElementById('submit-all');
    if (sub) sub.onclick = submitExam;
    const rev = document.getElementById('review-score');
    if (rev) rev.onclick = showScoreSummary;

    // Global Enter → next solution line when Solution tab is active
    if (!window._solEnterBound) {
      window._solEnterBound = true;
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        if (state.view !== 'exam' || !state.exam) return;
        const tag = (e.target && e.target.tagName || '').toLowerCase();
        if (tag === 'textarea' || tag === 'input' || tag === 'select' || tag === 'button') return;
        const i = state.layout === 'one' ? state.qIndex : null;
        if (i == null) return;
        if (getFace(i) !== 'solution') return;
        e.preventDefault();
        revealNext(i);
      });
    }
  }

  function persistCurrentInputs() {
    document.querySelectorAll('[data-ans]').forEach((el) => {
      const i = parseInt(el.getAttribute('data-ans'), 10);
      if (el.type === 'radio') {
        if (el.checked) state.responses[i] = el.value;
      } else {
        state.responses[i] = el.value;
      }
    });
    // also radio groups
    document.querySelectorAll('.mc-options').forEach((grp) => {
      const i = parseInt(grp.getAttribute('data-qi'), 10);
      const sel = grp.querySelector('input:checked');
      if (sel) state.responses[i] = sel.value;
    });
  }

  function getFace(i) {
    return state.face[i] || 'problem';
  }

  function getReveal(i) {
    return state.reveal[i] || 0;
  }

  function copyText(t) {
    t = String(t || '');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).catch(() => fallbackCopy(t));
    } else {
      fallbackCopy(t);
    }
  }

  function renderQuestionCard(q, i, showSolutions) {
    const current = state.layout === 'one' && i === state.qIndex ? ' current' : '';
    const diff = (q.difficulty || 'medium').toLowerCase();
    const face = getFace(i);
    const steps = E.solutionSteps(q);
    const revealed = Math.min(getReveal(i), steps.length);
    const canShowSolution = showSolutions && (state.mode === 'drill' ? state.checked[i] : state.submitted);
    // Allow opening Solution tab once checked (drill) or after submit (exam); also allow peek in drill after check
    const solutionUnlocked = canShowSolution || (state.mode === 'drill' && state.checked[i]) || state.submitted;

    let inputHtml = '';
    if (q.type === 'mc' && q.options) {
      inputHtml = `<div class="mc-options" data-qi="${i}">
        ${q.options.map((opt, oi) => {
          const letter = String.fromCharCode(65 + oi);
          const val = letter;
          const checked = state.responses[i] === val ? 'checked' : '';
          return `<label><input type="radio" name="q${i}" value="${esc(val)}" ${checked} ${state.submitted && state.mode === 'exam' ? 'disabled' : ''}/> <span><strong>${letter}.</strong> ${esc(opt)}</span></label>`;
        }).join('')}
      </div>`;
    } else if (q.type === 'tf') {
      inputHtml = `<div class="mc-options" data-qi="${i}">
        <label><input type="radio" name="q${i}" value="True" ${state.responses[i] === 'True' ? 'checked' : ''}/> True</label>
        <label><input type="radio" name="q${i}" value="False" ${state.responses[i] === 'False' ? 'checked' : ''}/> False</label>
      </div>`;
    } else {
      inputHtml = `<div class="answer-row">
        <input class="answer-input" data-ans="${i}" type="text" placeholder="Your answer"
          value="${esc(state.responses[i] || '')}" ${state.submitted && state.mode === 'exam' ? 'readonly' : ''}/>
      </div>`;
    }

    let verdict = '';
    if (state.checked[i] || state.submitted) {
      const ok = E.answersMatch(state.responses[i], q.answer, { type: q.type, tol: q.tol });
      verdict = `<div class="feedback ${ok ? 'ok' : 'bad'}">
        <strong>${ok ? 'Correct' : (state.submitted ? 'Incorrect' : 'Not yet')}</strong>
        ${ok ? '' : ` — expected <code>${esc(String(q.answer))}</code>`}
      </div>`;
    }

    const checkBtn = (state.mode === 'drill' && !state.submitted)
      ? `<button type="button" class="btn btn-primary check-btn" data-check="${i}">Check</button>`
      : '';

    const boxVal = state.solutionBox[i] != null ? state.solutionBox[i] : '';
    const stepHtml = steps.map((line, li) => {
      const on = li < revealed;
      return `<div class="sol-line ${on ? 'shown' : 'hidden-line'}" data-step="${li}">
        <span class="sol-n">${li + 1}</span>
        <span class="sol-text">${on ? esc(line) : '…'}</span>
      </div>`;
    }).join('');

    const solHint = !solutionUnlocked
      ? `<p class="sol-lock">Check your answer first (Drill) or submit the exam to unlock the Solution tab.</p>`
      : (revealed < steps.length
        ? `<p class="sol-hint">Press <kbd>Enter</kbd> for the next line (${revealed}/${steps.length}).</p>`
        : `<p class="sol-hint">All ${steps.length} lines revealed.</p>`);

    return `<article class="q-card${current} face-${face}" id="q-${i}" data-section="${esc(q.section || '')}" data-qi="${i}" tabindex="0">
      <div class="q-head">
        <span class="q-num">Q${q._index || (i + 1)}</span>
        <span class="badge badge-${diff}">${esc(diff)}</span>
        <span class="badge badge-d10" title="Difficulty out of 10">${q.difficulty10 != null ? (q.difficulty10 + '/10') : ''}</span>
        <span class="badge badge-sec">${esc(q.section || '')}</span>
        ${(q.tags || []).slice(0, 3).map((t) => `<span class="badge badge-sec">${esc(t)}</span>`).join('')}
      </div>
      <div class="face-tabs no-print" role="tablist">
        <button type="button" class="face-tab ${face === 'problem' ? 'active' : ''}" data-face="problem" data-qi="${i}">Problem</button>
        <button type="button" class="face-tab ${face === 'solution' ? 'active' : ''}" data-face="solution" data-qi="${i}" ${solutionUnlocked ? '' : 'disabled title="Unlock by checking or submitting"'}>Solution</button>
      </div>
      <div class="face-panel face-problem ${face === 'problem' ? '' : 'hidden'}">
        <div class="prompt">${esc(q.prompt)}</div>
        ${inputHtml}
        <div class="toolbar" style="margin:0.5rem 0 0">${checkBtn}</div>
        ${verdict}
      </div>
      <div class="face-panel face-solution ${face === 'solution' ? '' : 'hidden'}">
        <div class="sol-toolbar no-print">
          <button type="button" class="btn btn-primary" data-reveal-next="${i}" ${!solutionUnlocked || revealed >= steps.length ? 'disabled' : ''}>Next line</button>
          <button type="button" class="btn" data-reveal-all="${i}" ${!solutionUnlocked ? 'disabled' : ''}>Reveal all</button>
          <button type="button" class="btn btn-good" data-copy-sol="${i}" ${!solutionUnlocked ? 'disabled' : ''}>Copy solution</button>
          <button type="button" class="btn btn-ghost" data-reset-sol="${i}" ${!solutionUnlocked ? 'disabled' : ''}>Reset lines</button>
        </div>
        ${solHint}
        <div class="sol-steps" data-steps-for="${i}">${stepHtml}</div>
        <label class="sol-box-label" for="sol-box-${i}">Solution box</label>
        <textarea class="sol-box" id="sol-box-${i}" data-sol-box="${i}" rows="5" placeholder="Copy solution fills this box (and your clipboard)…">${esc(boxVal)}</textarea>
      </div>
    </article>`;
  }

  function wireQuestion(i) {
    const card = app.querySelector(`#q-${i}`);
    const check = app.querySelector(`[data-check="${i}"]`);
    if (check) {
      check.onclick = () => {
        persistCurrentInputs();
        state.checked[i] = true;
        // flip to solution after check so drilling continues into walkthrough
        state.face[i] = 'solution';
        if (!state.reveal[i]) state.reveal[i] = 0;
        renderExam();
        focusSolutionCard(i);
      };
    }

    app.querySelectorAll(`.face-tab[data-qi="${i}"]`).forEach((tab) => {
      tab.onclick = () => {
        if (tab.disabled) return;
        state.face[i] = tab.getAttribute('data-face');
        renderExam();
        if (state.face[i] === 'solution') focusSolutionCard(i);
      };
    });

    const nextBtn = app.querySelector(`[data-reveal-next="${i}"]`);
    if (nextBtn) nextBtn.onclick = () => revealNext(i);

    const allBtn = app.querySelector(`[data-reveal-all="${i}"]`);
    if (allBtn) {
      allBtn.onclick = () => {
        const steps = E.solutionSteps(state.exam.questions[i]);
        state.reveal[i] = steps.length;
        renderExam();
        focusSolutionCard(i);
      };
    }

    const copyBtn = app.querySelector(`[data-copy-sol="${i}"]`);
    if (copyBtn) {
      copyBtn.onclick = () => {
        const full = E.formatSolutionText(state.exam.questions[i]);
        state.solutionBox[i] = full;
        copyText(full);
        renderExam();
        focusSolutionCard(i);
        const box = document.getElementById('sol-box-' + i);
        if (box) {
          box.focus();
          box.select();
        }
        flashCopy(copyBtn);
      };
    }

    const resetBtn = app.querySelector(`[data-reset-sol="${i}"]`);
    if (resetBtn) {
      resetBtn.onclick = () => {
        state.reveal[i] = 0;
        renderExam();
        focusSolutionCard(i);
      };
    }

    const box = app.querySelector(`[data-sol-box="${i}"]`);
    if (box) {
      box.addEventListener('input', () => { state.solutionBox[i] = box.value; });
    }

    const input = app.querySelector(`[data-ans="${i}"]`);
    if (input) {
      input.addEventListener('change', () => { state.responses[i] = input.value; updateProgress(); });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && state.mode === 'drill' && getFace(i) === 'problem') {
          e.preventDefault();
          persistCurrentInputs();
          state.checked[i] = true;
          state.face[i] = 'solution';
          renderExam();
          focusSolutionCard(i);
        }
      });
    }
    const grp = app.querySelector(`.mc-options[data-qi="${i}"]`);
    if (grp) {
      grp.querySelectorAll('input').forEach((inp) => {
        inp.addEventListener('change', () => {
          state.responses[i] = inp.value;
          updateProgress();
        });
      });
    }

    // Enter on solution face → next line (card-level listener once)
    if (card && !card._solKeyWired) {
      card._solKeyWired = true;
      card.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        if (getFace(i) !== 'solution') return;
        const tag = (e.target && e.target.tagName || '').toLowerCase();
        if (tag === 'textarea' || tag === 'input') return;
        e.preventDefault();
        revealNext(i);
      });
    }
  }

  function revealNext(i) {
    const steps = E.solutionSteps(state.exam.questions[i]);
    const cur = getReveal(i);
    if (cur >= steps.length) return;
    state.reveal[i] = cur + 1;
    renderExam();
    focusSolutionCard(i);
  }

  function focusSolutionCard(i) {
    const card = document.getElementById('q-' + i);
    if (card) {
      card.focus({ preventScroll: false });
    }
  }

  function flashCopy(btn) {
    if (!btn) return;
    const prev = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = prev; }, 1200);
  }

  function updateProgress() {
    const bar = document.getElementById('prog-bar');
    const lab = document.getElementById('prog-label');
    const p = progressPct();
    if (bar) bar.style.width = p + '%';
    if (lab) lab.textContent = p + '%';
  }

  function newSameTopic() {
    const course = E.getCourse(state.exam.courseId);
    const cur = state.exam.questions[state.qIndex];
    const section = cur.section;
    const rng = E.createRng(String(Date.now()) + '-topic');
    const pool = course.generators;
    let q = null;
    for (let t = 0; t < 60; t++) {
      const gen = pool[rng.int(0, pool.length - 1)];
      try { q = gen(rng); } catch (e) { continue; }
      if (q && q.section === section) break;
    }
    if (!q) return;
    q._index = cur._index;
    state.exam.questions[state.qIndex] = q;
    state.responses[state.qIndex] = '';
    state.checked[state.qIndex] = false;
    state.face[state.qIndex] = 'problem';
    state.reveal[state.qIndex] = 0;
    state.solutionBox[state.qIndex] = '';
    renderExam();
  }

  function submitExam() {
    persistCurrentInputs();
    stopTimer();
    state.submitted = true;
    state.checked = state.exam.questions.map(() => true);
    const score = E.scoreExam(state.exam, state.responses);
    state.lastScore = score;
    const course = E.getCourse(state.exam.courseId);
    const now = new Date();
    const label = now.toLocaleString('en-GB', { timeZone: 'Asia/Bangkok', dateStyle: 'medium', timeStyle: 'short' }) + ' ICT';
    E.saveAttempt(course.id, {
      createdAt: now.toISOString(),
      dateLabel: label,
      seed: state.exam.seed,
      mode: state.mode,
      correct: score.correct,
      total: score.total,
      percent: score.percent
    });
    renderExam();
    showScoreSummary();
  }

  function showScoreSummary() {
    persistCurrentInputs();
    if (!state.lastScore) {
      state.lastScore = E.scoreExam(state.exam, state.responses);
    }
    const s = state.lastScore;
    const existing = document.getElementById('score-panel');
    if (existing) existing.remove();
    const panel = document.createElement('section');
    panel.id = 'score-panel';
    panel.className = 'panel score-panel';

    const topicEntries = Object.entries(s.byTopic || {}).sort((a, b) => a[0].localeCompare(b[0]));
    const topicRows = topicEntries.map(([name, t]) => {
      const pct = t.percent;
      return `<div class="topic-score-row">
        <div class="topic-score-head"><strong>${esc(name)}</strong>
          <span>${t.correct}/${t.total} (${pct}%)</span></div>
        <div class="stat-bar"><i style="width:${Math.min(100, pct)}%"></i></div>
      </div>`;
    }).join('');

    const subEntries = Object.entries(s.bySubtopic || {}).sort((a, b) => b[1].total - a[1].total);
    const subRows = subEntries.map(([name, t]) =>
      `<li><span>${esc(name)}</span> <strong>${t.correct}/${t.total} (${t.percent}%)</strong></li>`
    ).join('');

    const weightedNote = (s.pointsPossible && s.pointsPossible !== s.total)
      ? `<p class="muted">Weighted: ${s.pointsEarned}/${s.pointsPossible} (${s.percentWeighted}%)</p>`
      : '';

    panel.innerHTML = `
      <h3>Score summary</h3>
      <p class="score-big">${s.correct} / ${s.total}</p>
      <p class="score-pct">${s.percent}%</p>
      ${weightedNote}
      <p>Seed <span class="seed-chip">${esc(state.exam.seed)}</span></p>
      <h4>Score by topic</h4>
      <div class="topic-scores">${topicRows || '<p class="muted">No topic data.</p>'}</div>
      <details class="subtopic-scores">
        <summary>Score by subtopic</summary>
        <ul class="subtopic-list">${subRows || '<li>None</li>'}</ul>
      </details>
      <p class="no-print"><button type="button" class="btn" id="close-score">Close</button></p>
    `;
    app.insertBefore(panel, app.firstChild.nextSibling);
    document.getElementById('close-score').onclick = () => panel.remove();
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function fallbackCopy(t) {
    const ta = document.createElement('textarea');
    ta.value = t;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* */ }
    document.body.removeChild(ta);
  }

  function exportExam() {
    persistCurrentInputs();
    const course = E.getCourse(state.exam.courseId);
    const includeAns = state.submitted || state.mode === 'drill';
    let text = `Course Exam Drills — ${course.title}\nSeed: ${state.exam.seed}\n\n`;
    state.exam.questions.forEach((q, i) => {
      text += `Q${i + 1}. [${q.section}] (${q.difficulty})\n${q.prompt}\n`;
      if (q.options) q.options.forEach((o, oi) => { text += `  ${String.fromCharCode(65 + oi)}. ${o}\n`; });
      if (includeAns) text += `Answer: ${q.answer}\nSolution: ${q.solution}\n`;
      text += '\n';
    });

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(course.title)} — ${esc(state.exam.seed)}</title>
      <style>body{font-family:system-ui,sans-serif;max-width:800px;margin:2rem auto;line-height:1.45}
      .q{border-bottom:1px solid #ddd;padding:1rem 0} .meta{color:#555} pre{white-space:pre-wrap}</style></head><body>
      <h1>${esc(course.title)}</h1>
      <p class="meta">Seed: ${esc(state.exam.seed)}</p>
      ${state.exam.questions.map((q, i) => `
        <div class="q"><h3>Q${i + 1}. ${esc(q.section)} · ${esc(q.difficulty)}</h3>
        <pre>${esc(q.prompt)}</pre>
        ${q.options ? `<ol type="A">${q.options.map((o) => `<li>${esc(o)}</li>`).join('')}</ol>` : ''}
        ${includeAns ? `<p><strong>Answer:</strong> ${esc(String(q.answer))}</p><pre>${esc(q.solution || '')}</pre>` : ''}
        </div>`).join('')}
      </body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.id}-exam-${state.exam.seed}`.replace(/[^\w.-]+/g, '_').slice(0, 80) + '.html';
    a.click();
    URL.revokeObjectURL(url);

    // also offer text via secondary blob? keep simple — html is enough
    console.log(text.slice(0, 200));
  }

  // ---------- Nav ----------
  document.getElementById('btn-home').onclick = renderHome;
  document.getElementById('btn-howto').onclick = renderHowto;

  // boot
  if (!E.listCourses().length) {
    app.innerHTML = '<section class="hero"><h2>No courses loaded</h2><p>Check that courses/*.js registered themselves.</p></section>';
  } else {
    renderHome();
  }
})();
