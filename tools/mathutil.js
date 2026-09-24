'use strict';

function gcd(a, b) {
  a = Math.abs(a | 0); b = Math.abs(b | 0);
  while (b) { const t = b; b = a % b; a = t; }
  return a || 1;
}
function simp(n, d) {
  if (d < 0) { n = -n; d = -d; }
  if (d === 0) return { n, d: 1, str: String(n) };
  const g = gcd(n, d); n /= g; d /= g;
  return { n, d, str: d === 1 ? String(n) : n + '/' + d };
}
function fmtFrac(n, d) { return simp(n, d).str; }
function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }
function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
function isPerfectSquare(n) {
  if (n < 0) return false;
  const r = Math.round(Math.sqrt(n));
  return r * r === n;
}
function pythagoreanTriple(k, m, n) {
  // classic: a=k(m^2-n^2), b=k(2mn), c=k(m^2+n^2) with m>n>0
  const a = k * (m * m - n * n);
  const b = k * (2 * m * n);
  const c = k * (m * m + n * n);
  return { a, b, c };
}

module.exports = { gcd, simp, fmtFrac, lcm, clamp, isPerfectSquare, pythagoreanTriple };
