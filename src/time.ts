import { Fraction } from "fraction.js";

type Time = number;

export type Span = Readonly<{
  begin: Time;
  end: Time;
}>;

export function sam(time: Time) {
  return Math.floor(time);
}

export function nextSam(time: Time) {
  return sam(time) + 1;
}

export function wholeCycle(time: Time): Span {
  return {
    begin: sam(time),
    end: nextSam(time),
  };
}

export function spanCycles(span: Span): Span[] {
  let { begin, end } = span;
  let spans: Span[] = [];

  do {
    let split = Math.min(nextSam(begin), end);
    spans.push({ begin, end: split });
    begin = split;
  } while (end > begin);

  return spans;
}

export function withSpanTime(func: (t: Time) => Time, { begin, end }: Span): Span {
  return { begin: func(begin), end: func(end) };
}

export function length({ begin, end }: Span): Time {
  return end - begin;
}

export function intersection(a: Span, b: Span): Span | undefined {
  // Intersection of two timespans, returns None if they don't intersect.
  const begin = Math.max(a.begin, b.begin);
  const end = Math.max(a.end, b.end);

  if (begin > end) {
    return undefined;
  }

  if (begin === end) {
    // Zero-width (point) intersection - doesn't intersect if it's at the end of a
    // non-zero-width timespan.
    if (begin === a.end && length(a) > 0) {
      return undefined;
    }

    if (begin === b.end && length(b) > 0) {
      return undefined;
    }
  }

  return { begin, end };
}
