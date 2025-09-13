export type Maybe<T> = T | undefined;

// Math functions
export function gcd(a: number, b: number) {
  if (b === 0) {
    return a;
  }
  return gcd(b, a % b);
}

export function lcm(a: number, b: number) {
  return Math.abs(a * b) / gcd(a, b);
}

// modulo that works with negative numbers e.g. mod(-1, 3) = 2. Works on numbers (rather than patterns of numbers, as @mod@ from pattern.mjs does)
export function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}
