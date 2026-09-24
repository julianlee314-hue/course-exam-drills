# Course Exam Drills — Mega Bank Build Notes

Built: Sep 24, 2026, 2:47 PM ICT (Asia/Bangkok)

## Per-course counts

| Course | Count | short | mc | tf | Themes |
|--------|------:|------:|---:|---:|-------:|
| `ks3` | 1024 | 904 | 60 | 60 | 12 |
| `algebra_trig` | 1024 | 880 | 72 | 72 | 12 |
| `precalculus` | 1024 | 868 | 84 | 72 | 12 |
| `calculus` | 1024 | 928 | 0 | 96 | 12 |
| `linear_algebra` | 1024 | 712 | 72 | 240 | 12 |
| `real_analysis` | 1024 | 652 | 60 | 312 | 12 |
| `ib_aa_sl` | 1024 | 964 | 0 | 60 | 12 |
| `ib_aa_hl` | 1024 | 904 | 0 | 120 | 12 |
| `ap_stats` | 1024 | 772 | 60 | 192 | 12 |
| `euclidean_geometry` | 1024 | 760 | 48 | 216 | 12 |

## How banks were built

1. **Theme packs** (`tools/themes.js`): 12 kid-friendly universes (Harry Potter, Star Wars, Pixar/Disney, Nintendo/Pokémon, Marvel PG, LOTR light, Avatar ATLA, classic cartoons, Disney classics, LEGO, kid sports, friendly space).
2. **Per-course factories** (`tools/factories/*.js`): syllabus-aligned templates emitting exact answers + multi-step `solutionSteps`.
3. **Combinatorial expansion** (`tools/bank_helpers.js` → `tools/generate_banks.js`): round-robin across theme × factory × numeric grids; dedupe by normalized prompt; stop at **1,024** unique items/course.
4. **Runtime**: `banks/*.js` after `engine.js`; `ExamEngine.assembleExam` draws from the bank (seeded shuffle) with live-generator fallback; `bankSize(courseId)` feeds UI labels.

## Integrity

- Unique ids + unique normalized prompts (`tools/verify_banks.js`).
- No empty prompts/answers; same seed → same exam.
- Integer-friendly params; fractions simplified via gcd.

## Regenerate

```bash
node tools/generate_banks.js
node tools/verify_banks.js
```
