# Course Exam Drills — metadata, language rewrite, topic scoring

**When:** Thu 24 Sep 2026 (Asia/Bangkok, ICT)

## What changed

### 1) Per-question metadata (all 10 × 1024)
Every bank question now has:
- `difficulty10` (integer 1–10); `difficulty` band kept for compat (1–3 easy, 4–6 medium, 7–10 hard)
- `subtopics` (1–3 skill strings from factory tags; theme slugs excluded)
- `topics` (section + subtopics)
- `meta`: `{ bloom, type, theme, estimatedSeconds, skills }`
- `points`: **always 1** (unweighted % overall and by topic)

### 2) Bank stats
Each `banks/<id>.js` includes a `stats` object. Also:
- `BANK_STATS.md`
- `stats/<courseId>.json`
- Desktop: `…/Course Exams/BANK_STATS.md`

Setup UI: compact **Bank stats** panel (avg difficulty/10, type mix, top sections) + expandable full stats.

### 3) Language rewrite
`tools/rewrite_language.js` + `tools/rewrite_bank_language.js` rewrite every prompt and solution into warmer, clearer spoken English (still themed; psychology/sports/fairness hooks where natural). **Answers unchanged** (answer drift = 0).
`tools/bank_helpers.js` runs rewrite → enrich on regenerate.

### 4) Scoring by topic
`scoreExam` returns overall + `byTopic` (section) + `bySubtopic` + details with `difficulty10`.
Score panel: big overall score + **Score by topic** bars + collapsible subtopic list.
Question cards show an **n/10** difficulty badge.

## Per-course avg difficulty10
| Course | avg | median |
|--------|-----|--------|
| ks3 | 2.34 | 2 |
| algebra_trig | 3.19 | 3 |
| precalculus | 3.01 | 3 |
| calculus | 3.37 | 3 |
| linear_algebra | 2.67 | 2 |
| real_analysis | 4.20 | 3 |
| ib_aa_sl | 2.91 | 3 |
| ib_aa_hl | 3.62 | 3 |
| ap_stats | 2.72 | 2 |
| euclidean_geometry | 3.52 | 4 |

## Tools
- `node tools/rewrite_bank_language.js`
- `node tools/enrich_bank_metadata.js`
- `node tools/generate_banks.js` (rewrite+enrich via bank_helpers)

## Points rule
`points = 1` for every question. Optional weighted rule (documented, not applied): `1 + floor((difficulty10-1)/3)`.

## Deploy
- Desktop Course Exams updated (banks, stats, app, engine, styles, BANK_STATS.md)
- GitHub `julianlee314-hue/course-exam-drills` main @ 45ab568 (token scrubbed from remote)
