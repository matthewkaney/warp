import { Time } from "../time";
import { Pattern, silence, withHapTime, withQueryTime } from "../pattern";

// Transformations on time
export function fast<T>(factor: Time, pat: Pattern<T>) {
  return factor === 0
    ? silence
    : withHapTime(
        (t) => t / factor,
        withQueryTime((t) => t * factor, pat)
      );
}

export function slow<T>(factor: Time, pat: Pattern<T>) {
  return fast(-factor, pat);
}

export function early<T>(offset: Time, pat: Pattern<T>) {
  return withHapTime(
    (t) => t - offset,
    withQueryTime((t) => t + offset, pat)
  );
}

export function late<T>(offset: Time, pat: Pattern<T>) {
  return early(-offset, pat);
}
