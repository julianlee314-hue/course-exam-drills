# Course Exam Drills

Self-contained, offline practice exams for Julius’s **core textbook set** (curriculum map).  
Open `index.html` in any modern browser — **file:// works**; no network or CDN required.

## Mega question banks

Each course ships with a pre-generated bank of **≥1,000 unique questions** (1,024 per course) in `banks/<courseId>.js`.
Exams draw primarily from the bank via a seeded shuffle; live generators are only a fallback.

Banks are rebuilt with:

```bash
node tools/generate_banks.js
node tools/verify_banks.js
```

Prompts are heavily themed with kid-friendly pop culture (Harry Potter, Star Wars, Pixar/Disney, Nintendo/Pokémon, Marvel PG, LOTR light, Avatar ATLA, classic cartoons) while answers stay mathematically exact.

## Courses

| # | Course | Textbook spine | Generators (approx.) |
|---|--------|----------------|----------------------|
| 1 | KS3 Foundation | CGP KS3 Maths 1–3 | 15 |
| 2 | Algebra & Trigonometry | OpenStax Algebra & Trigonometry 2e | 16 |
| 3 | Precalculus | Stewart Precalculus 8e | 16 |
| 4 | Calculus 1–3 | Stewart Calculus ET 9e | 24 |
| 5 | Linear Algebra | Andrilli & Hecker ELA 6e | 15 |
| 6 | Real Analysis | Abbott Understanding Analysis | 16 |
| 7 | IB AA SL | Haese Red Book | 16 |
| 8 | IB AA HL | Oxford Green Book | 24 |
| 9 | AP Statistics | AP Statistics 2020 | 16 |
| 10 | Euclidean Geometry | Euclid Elements (Heath) | 18 |

Each generator is **parameterized** (random integers/coefficients) so “New exam” produces fresh variants. Answers are computed from those parameters (fractions simplified).

## How to open

1. Go to this folder on disk.
2. Double-click `index.html`, or drag it into Chrome/Firefox/Safari/Edge.
3. Pick a course → choose Quick / Standard / Full (or custom N) → Start.

## Drill vs Exam

- **Drill (default):** Check each question immediately, see the worked solution, optionally “New question same topic.”
- **Exam:** Hide solutions until **Submit all**. Optional timer; at 0:00 the exam auto-submits in Exam mode.

Toggle **One at a time** vs **Paper** (all questions scrollable). Print via the browser (print CSS included) or **Export** an HTML file.

## Seeds

Every exam shows a **seed**.  

- **Retry same seed** — identical paper.  
- **New exam** — fresh seed.  
- Paste a seed on the setup screen to share the same exam with someone else.

## History

The last **20 attempts per course** are stored in this browser’s `localStorage` (not synced across devices).

## Math notation

Plain text / Unicode (`x²`, `√`, `π`, fractions like `3/4`). No KaTeX CDN — reliable offline.

## Files

```
index.html      course picker + shell
styles.css      layout + print
app.js          UI / exam runner
engine.js       seeded RNG, assembly, scoring, history
courses/*.js    one module per course (registers with ExamEngine)
banks/*.js      mega question banks (≥1000 themed items per course)
tools/          bank generator + verifier
```

## Quality notes

- Prefer integer-friendly parameters; gcd-simplify fraction answers.
- HTML in prompts is escaped in the UI.
- Euclid items cite real Element proposition themes (I.1, I.15, I.29, I.32, I.47, III.20, III.31, VI ratios, etc.).
