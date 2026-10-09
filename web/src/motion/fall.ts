/* A body let fall (4.2d): under constant gravity, bouncing with restitution e (each bounce leaves at e times the speed
   it arrived at) until a bounce would rise less than `rest` (1 mm by default), then still. Piecewise parabolas, closed
   form: ask for any time. Heights are above the floor (y = 0) in the same units as g. */
export interface FallOptions {
  /** height above the floor at t = 0 */
  height: number;
  /** gravity, positive (units/s²) */
  g: number;
  /** restitution, 0 to 1 */
  e: number;
  /** upward speed at t = 0 (default 0) */
  v0?: number;
  /** it stops when a bounce would rise less than this (default 1 mm) */
  rest?: number;
}

export interface Fall {
  /** seconds until it lies still */
  duration: number;
  /** the time of each hit on the floor, the last one the landing it rests on */
  hitTimes: number[];
  at(t: number): { y: number; v: number };
}

/** 1 mm in squares (one square is 76.2 mm). */
export const MM = 1 / 76.2;

export function fall({ height, g, e, v0 = 0, rest = MM }: FallOptions): Fall {
  const h0 = Math.max(0, height);
  // each segment starts at t0 on the floor (the first, at h0) with upward speed u0
  const segs: { t0: number; h: number; u0: number }[] = [{ t0: 0, h: h0, u0: v0 }];
  const hitTimes: number[] = [];
  let speed = Math.sqrt(v0 * v0 + 2 * g * h0);
  let t = (v0 + speed) / g;
  for (let n = 0; n < 40; n++) {
    hitTimes.push(t);
    const u = e * speed;
    if ((u * u) / (2 * g) < rest) break;
    segs.push({ t0: t, h: 0, u0: u });
    t += (2 * u) / g;
    speed = u;
  }
  const duration = hitTimes[hitTimes.length - 1];
  return {
    duration,
    hitTimes,
    at(time: number) {
      if (time >= duration) return { y: 0, v: 0 };
      let s = segs[0];
      for (const c of segs) if (c.t0 <= time) s = c;
      const dt = Math.max(0, time) - s.t0;
      return { y: Math.max(0, s.h + s.u0 * dt - 0.5 * g * dt * dt), v: s.u0 - g * dt };
    },
  };
}
