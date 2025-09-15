import { Pattern } from "../pattern";
import { late } from "../transformers/raw";

import { lcm, mod } from "../../helpers";
import { silence } from "../primitives/raw";
import { sam } from "../../time";

export function stack<T>(pats: Pattern<T>[]): Pattern<T> {
  return {
    query: (state) => pats.flatMap((pat) => pat.query(state)),
    steps: pats.map(({ steps }) => steps).reduce(lcm, 1),
  };
}

export function stackWith<A, B>(func: (pat: Pattern<A>, index: number) => Pattern<B>, pats: Pattern<A>[]) {
  return stack(pats.map(func));
}

export function feedback<A>(func: (pat: Pattern<A>) => Pattern<A>, num: number, pat: Pattern<A>) {
  let pats: Pattern<A>[] = [pat];

  for (let i = 1; i < num; ++i) {
    pats.push(func(pats[i - 1]));
  }

  return stack(pats);
}

export function slowCat<T>(pats: Pattern<T>[]): Pattern<T> {
  if (pats.length <= 1) {
    return pats[0] ?? silence;
  }

  return {
    query: (state) => {
      const { begin } = state.span;
      const pat = pats[mod(sam(begin), pats.length)];

      // A bit of maths to make sure that cycles from constituent patterns aren't skipped.
      // For example if three patterns are slowCat-ed, the fourth cycle of the result should
      // be the second (rather than fourth) cycle from the first pattern.
      const offset = Math.floor(Math.floor(begin) - begin / pats.length);
      return late(offset, pat).query(state);
    },
    steps: pats.map(({ steps }) => steps).reduce(lcm, 1),
  };
}
