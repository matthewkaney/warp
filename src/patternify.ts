import { Pattern } from "./pattern/pattern";

type AsPatterns<P> = {
  [K in keyof P]: Pattern<P[K]>;
};

export function patternify<T, Args extends unknown[]>(
  func: (...args: [...Args, Pattern<T>]) => Pattern<T>
): (...args: [...AsPatterns<Args>, pat: Pattern<T>]) => Pattern<T> {
  return (...args: [...AsPatterns<Args>, Pattern<T>]) => {
    const pat = args[args.length - 1] as Pattern<T>;
    // let result;

    // if (arity === 1) {
    //   result = func(pat);
    // } else {
    //   const firstArgs = args.slice(0, -1);

    //   if (firstArgs.every((arg) => arg.__pure != undefined)) {
    //     const pureArgs = firstArgs.map((arg) => arg.__pure);
    //     const pureLocs = firstArgs.filter((arg) => arg.__pure_loc).map((arg) => arg.__pure_loc);
    //     result = func(...pureArgs, pat);
    //     result = result.withContext((context) => {
    //       const locations = (context.locations || []).concat(pureLocs);
    //       return { ...context, locations };
    //     });
    //   } else {
    //     const [left, ...right] = firstArgs;

    //     let mapFn = (...args) => {
    //       return func(...args, pat);
    //     };
    //     mapFn = curry(mapFn, null, arity - 1);
    //     result = join(right.reduce((acc, p) => acc.appLeft(p), left.fmap(mapFn)));
    //   }
    // }
    // if (preserveSteps) {
    //   result._steps = pat._steps;
    // }
    // return result;
    return pat;
  };
}

type Curried<F extends (...args: any[]) => unknown> = Parameters<F> extends [infer FirstArg, ...infer Rest]
  ? (arg: FirstArg) => Curried<(...args: Rest) => ReturnType<F>>
  : ReturnType<F>;

export function curry<T, Args extends [unknown, ...unknown[]], R>(
  func: (...args: Args) => R
): Curried<(...args: Args) => R> {
  throw new Error();
}
