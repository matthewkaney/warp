import { Pattern } from "../pattern";

export function setSteps<A>(steps: number, pat: Pattern<A>): Pattern<A> {
  return {
    ...pat,
    steps,
  };
}
