/* Springs by their closed form (4.2d): where a damped spring is, and how fast it moves, at any time t. Never stepped, so
   a long first frame (a slow start-up, a tab that was hidden) lands exactly where the spring would be: there is nothing
   to blow up. A spring pulls x toward 0:   m x'' + c x' + k x = 0,  x(0) = x0,  x'(0) = v0. */
export interface Spring {
  stiffness: number;
  damping: number;
  mass: number;
}

export function spring(stiffness: number, damping: number, mass = 1): Spring {
  return { stiffness, damping, mass };
}

/** 1 is critically damped (the fastest way to rest without overshooting); below 1 it overshoots and rings. */
export function dampingRatio(s: Spring): number {
  return s.damping / (2 * Math.sqrt(s.stiffness * s.mass));
}

export function naturalOmega(s: Spring): number {
  return Math.sqrt(s.stiffness / s.mass);
}

export interface SpringState {
  x: number;
  v: number;
}

/** Position and velocity at time t ≥ 0 (seconds) of a spring let go at x0 with velocity v0. */
export function springAt(s: Spring, t: number, x0 = 1, v0 = 0): SpringState {
  if (!(t > 0)) return { x: x0, v: v0 };
  const w = naturalOmega(s);
  const z = dampingRatio(s);
  if (Math.abs(z - 1) < 1e-9) {
    const e = Math.exp(-w * t);
    const b = v0 + w * x0;
    return { x: e * (x0 + b * t), v: e * (v0 - w * b * t) };
  }
  if (z < 1) {
    const a = z * w;
    const wd = w * Math.sqrt(1 - z * z);
    const e = Math.exp(-a * t);
    const cos = Math.cos(wd * t);
    const sin = Math.sin(wd * t);
    return { x: e * (x0 * cos + ((v0 + a * x0) / wd) * sin), v: e * (v0 * cos - ((w * w * x0 + a * v0) / wd) * sin) };
  }
  const r = w * Math.sqrt(z * z - 1);
  const r1 = -w * z + r;
  const r2 = -w * z - r;
  const c2 = (v0 - r1 * x0) / (r2 - r1);
  const c1 = x0 - c2;
  const e1 = Math.exp(r1 * t);
  const e2 = Math.exp(r2 * t);
  return { x: c1 * e1 + c2 * e2, v: c1 * r1 * e1 + c2 * r2 * e2 };
}

/** How far along a move from 0 to 1 the spring is at time t (0 at the start; it may pass 1 when it overshoots). */
export function springStep(s: Spring, t: number): number {
  return 1 - springAt(s, t).x;
}

/** The last time the spring (from x0 = 1 at rest) is further than `tol` from rest, found by scanning. */
export function settleTime(s: Spring, tol = 0.005): number {
  const dt = 0.002;
  let last = 0;
  for (let t = 0; t < 120; t += dt) if (Math.abs(springAt(s, t).x) > tol) last = t;
  return last + dt;
}

const made = new Map<string, number>();

/** The unit-mass spring of a given damping ratio that has settled (within `tol` of its move) at `settleS` seconds.
    Settling time scales as 1/ω, so one scan at ω = 1 is enough. */
export function springFor(settleS: number, zeta = 1, tol = 0.005): Spring {
  const key = `${zeta}|${tol}`;
  let unit = made.get(key);
  if (unit === undefined) made.set(key, (unit = settleTime(spring(1, 2 * zeta), tol)));
  const w = unit / settleS;
  return spring(w * w, 2 * zeta * w);
}

/** Close enough to rest to snap to it: no visible difference, and no more frames needed. */
export function atRest(st: SpringState, xEps: number, vEps: number): boolean {
  return Math.abs(st.x) <= xEps && Math.abs(st.v) <= vEps;
}
