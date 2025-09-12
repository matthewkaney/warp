import { Pattern, withValue } from "../pattern";
import { signal } from "../primitives";

// Transformations on values
export function toBipolar(pat: Pattern<number>) {
  return withValue((x) => x * 2 - 1, pat);
}

export function fromBipolar(pat: Pattern<number>) {
  return withValue((x) => (x + 1) / 2, pat);
}

export function floor(pat: Pattern<number>) {
  return withValue((x) => Math.floor(x), pat);
}

export function ceil(pat: Pattern<number>) {
  return withValue((x) => Math.ceil(x), pat);
}

export function round(pat: Pattern<number>) {
  return withValue((x) => Math.round(x), pat);
}

// Numeric signals
export const saw = signal((t) => t % 1);
export const saw2 = toBipolar(saw);

export const isaw = signal((t) => 1 - (t % 1));
export const isaw2 = toBipolar(isaw);

export const sine = signal((t) => (1 + Math.sin(Math.PI * 2 * t)) / 2);
export const sine2 = toBipolar(sine);

export const cosine = signal((t) => (1 + Math.cos(Math.PI * 2 * t)) / 2);
export const cosine2 = toBipolar(cosine);

export const square = signal((t) => Math.floor((t * 2) % 2));
export const square2 = toBipolar(square);

export const tri = signal((t) => Math.abs(((t - 0.5) % 1) * 2 - 1));
export const tri2 = toBipolar(tri);

// Random signals
function xorwise(x: number) {
  const a = (x << 13) ^ x;
  const b = (a >> 17) ^ a;
  return (b << 5) ^ b;
}

// stretch 300 cycles over the range of [0,2**29 == 536870912) then apply the xorshift algorithm
const _frac = (x: number) => x - Math.trunc(x);
const timeToIntSeed = (x: number) => xorwise(Math.trunc(_frac(x / 300) * 536870912));
const intSeedToRand = (x: number) => (x % 536870912) / 536870912;
const timeToRand = (x: number) => Math.abs(intSeedToRand(timeToIntSeed(x)));

export const rand = signal(timeToRand);

// Discrete pattern of numbers from 0 to n-1
export function run(n: Pattern<number>) {
  return saw.range(0, n).floor().segment(n);
}
