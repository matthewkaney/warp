export type Time = number;

export function sam(time: Time): Time {
  return Math.floor(time);
}

export function nextSam(time: Time): Time {
  return sam(time) + 1;
}

export type Span = Readonly<{
  begin: Time;
  end: Time;
}>;

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
