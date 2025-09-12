import { spanCycles, Time, wholeCycle } from "../../time";
import { Pattern } from "../pattern";

export function gap(steps: number): Pattern<never> {
  return {
    query: () => [],
    steps,
  };
}

export const silence = gap(1);

export function pure<T>(value: T): Pattern<T> {
  return {
    query: ({ span }) => spanCycles(span).map((part) => ({ whole: wholeCycle(part.begin), part, value })),
    steps: 1,
  };
}

export function steady<T>(value: T): Pattern<T> {
  // A continuous value
  return {
    query: ({ span }) => [{ part: span, value }],
    steps: 0,
  };
}

export function signal<A>(f: (t: Time) => A): Pattern<A> {
  return { query: ({ span }) => [{ part: span, value: f(span.begin) }], steps: 0 };
}
