import { Span } from "./time";

export type Hap<T> = Readonly<{
  whole?: Span;
  part: Span;
  value: T;
  // context: object; // Skip context for now
}>;

export function wholeOrPart<T>({ whole, part }: Hap<T>) {
  return whole ?? part;
}

export function withSpan<T>(f: (span: Span) => Span, hap: Hap<T>): Hap<T> {
  return {
    ...hap,
    whole: hap.whole && f(hap.whole),
    part: f(hap.part),
  };
}

export function withValue<T>(f: (value: T) => T, hap: Hap<T>): Hap<T> {
  return {
    ...hap,
    value: f(hap.value),
  };
}
