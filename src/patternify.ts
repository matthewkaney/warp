import { Pattern } from "./pattern/pattern";

type AsPatterns<P> = {
  [K in keyof P]: Pattern<P[K]>;
};

export function patternify<T, Args extends unknown[]>(
  func: (...args: [...Args, pat: Pattern<T>]) => Pattern<T>
): (...args: [...AsPatterns<Args>, pat: Pattern<T>]) => Pattern<T> {
  return (...args: [...AsPatterns<Args>, Pattern<T>]) => args[args.length - 1] as Pattern<T>;
}
