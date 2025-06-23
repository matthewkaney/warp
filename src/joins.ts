import { Maybe } from "./helpers";

import { intersection } from "./time";
import { wholeOrPart } from "./hap";
import { Pattern } from "./pattern/pattern";

export function appBoth<A, B>(patF: Pattern<(a: A) => B>, patA: Pattern<A>): Pattern<B> {
  return {
    query: (state) =>
      patF.query(state).flatMap((hapF) =>
        patA
          .query(state)
          .map((hapA) => {
            const part = intersection(hapF.part, hapA.part);
            return (
              part && {
                whole: hapF.whole && hapA.whole && intersection(hapF.whole, hapA.whole),
                part,
                value: hapF.value(hapA.value),
              }
            );
          })
          .filter((a) => a !== undefined)
      ),
    steps: 1, // TODO: Combine tactus
  };
}

export function appLeft<A, B>(patF: Pattern<(a: A) => B>, patA: Pattern<A>): Pattern<B> {
  return {
    query: (state) =>
      patF.query(state).flatMap((hapF) =>
        patA
          .query({ span: wholeOrPart(hapF) })
          .map((hapA) => {
            const part = intersection(hapF.part, hapA.part);
            return (
              part && {
                whole: hapF.whole,
                part,
                value: hapF.value(hapA.value),
              }
            );
          })
          .filter((a) => a !== undefined)
      ),
    steps: 1, // TODO: Combine tactus
  };
}

export function appRight<A, B>(patF: Pattern<(a: A) => B>, patA: Pattern<A>): Pattern<B> {
  return {
    query: (state) =>
      patA.query(state).flatMap((hapA) =>
        patF
          .query({ span: wholeOrPart(hapA) })
          .map((hapF) => {
            const part = intersection(hapF.part, hapA.part);
            return (
              part && {
                whole: hapA.whole,
                part,
                value: hapF.value(hapA.value),
              }
            );
          })
          .filter((a) => a !== undefined)
      ),
    steps: 1, // TODO: Combine tactus
  };
}

export function bindWhole(choose_whole, func) {
  const pat_val = this;
  const query = function (state) {
    const withWhole = function (a, b) {
      return new Hap(
        choose_whole(a.whole, b.whole),
        b.part,
        b.value,
        Object.assign({}, a.context, b.context, {
          locations: (a.context.locations || []).concat(b.context.locations || []),
        })
      );
    };
    const match = function (a) {
      return func(a.value)
        .query(state.setSpan(a.part))
        .map((b) => withWhole(a, b));
    };
    return flatten(pat_val.query(state).map((a) => match(a)));
  };
  return new Pattern(query);
}

export function bind<T>(f: (val: T) => T) {
  const whole_func = function (a, b) {
    if (a == undefined || b == undefined) {
      return undefined;
    }
    return a.intersection_e(b);
  };
  return this.bindWhole(whole_func, func);
}

export function join() {
  // Flattens a pattern of patterns into a pattern, where wholes are
  // the intersection of matched inner and outer haps.
  return bind((a) => a);
}

export function outerBind(func) {
  return this.bindWhole((a) => a, func).setSteps(this._steps);
}

export function outerJoin() {
  // Flattens a pattern of patterns into a pattern, where wholes are
  // taken from outer haps.
  return this.outerBind(id);
}

export function innerBind(func) {
  return this.bindWhole((_, b) => b, func);
}

export function innerJoin() {
  // Flattens a pattern of patterns into a pattern, where wholes are
  // taken from inner haps.
  return this.innerBind(id);
}

// Flatterns patterns of patterns, by retriggering/resetting inner patterns at onsets of outer pattern haps
export function resetJoin(restart = false) {
  const pat_of_pats = this;
  return new Pattern((state) => {
    return (
      pat_of_pats
        // drop continuous haps from the outer pattern.
        .discreteOnly()
        .query(state)
        .map((outer_hap) => {
          return (
            outer_hap.value
              // reset = align the inner pattern cycle start to outer pattern haps
              // restart = align the inner pattern cycle zero to outer pattern haps
              .late(restart ? outer_hap.whole.begin : outer_hap.whole.begin.cyclePos())
              .query(state)
              .map((inner_hap) =>
                new Hap(
                  // Supports continuous haps in the inner pattern
                  inner_hap.whole ? inner_hap.whole.intersection(outer_hap.whole) : undefined,
                  inner_hap.part.intersection(outer_hap.part),
                  inner_hap.value
                ).setContext(outer_hap.combineContext(inner_hap))
              )
              // Drop haps that didn't intersect
              .filter((hap) => hap.part)
          );
        })
        .flat()
    );
  });
}

export function restartJoin() {
  return this.resetJoin(true);
}

// Like the other joins above, joins a pattern of patterns of values, into a flatter
// pattern of values. In this case it takes whole cycles of the inner pattern to fit each event
// in the outer pattern.
export function squeezeJoin() {
  // A pattern of patterns, which we call the 'outer' pattern, with patterns
  // as values which we call the 'inner' patterns.
  const pat_of_pats = this;
  function query(state) {
    // Get the events with the inner patterns. Ignore continuous events (without 'wholes')
    const haps = pat_of_pats.discreteOnly().query(state);
    // A function to map over the events from the outer pattern.
    function flatHap(outerHap) {
      // Get the inner pattern, slowed and shifted so that the 'whole'
      // timespan of the outer event corresponds to the first cycle of the
      // inner event
      const inner_pat = outerHap.value._focusSpan(outerHap.wholeOrPart());
      // Get the inner events, from the timespan of the outer event's part
      const innerHaps = inner_pat.query(state.setSpan(outerHap.part));
      // A function to map over the inner events, to combine them with the
      // outer event
      function munge(outer, inner) {
        let whole = undefined;
        if (inner.whole && outer.whole) {
          whole = inner.whole.intersection(outer.whole);
          if (!whole) {
            // The wholes are present, but don't intersect
            return undefined;
          }
        }
        const part = inner.part.intersection(outer.part);
        if (!part) {
          // The parts don't intersect
          return undefined;
        }
        const context = inner.combineContext(outer);
        return new Hap(whole, part, inner.value, context);
      }
      return innerHaps.map((innerHap) => munge(outerHap, innerHap));
    }
    const result = flatten(haps.map(flatHap));
    // remove undefineds
    return result.filter((x) => x);
  }
  return new Pattern(query);
}

export function squeezeBind(func) {
  return this.fmap(func).squeezeJoin();
}

export function polyJoin() {
  const pp = this;
  return pp.fmap((p) => p.repeat(pp._steps.div(p._steps))).outerJoin();
}

export function polyBind(func) {
  return this.fmap(func).polyJoin();
}
