/** Positions → crankRate, wind, omega. Checkable pure functions. */

import {
  CRANK_CX,
  CRANK_CY,
  CRANK_DEAD,
  CRANK_DECAY_TAU,
  CRANK_SMOOTH_TAU,
  CRANK_WIND,
  OMEGA_CAP_MUL,
  OMEGA_TAU,
  TAP_PATH,
  WIND_DECAY,
  WIND_START,
  clamp,
  pointOnCrank,
  windCap,
  wrapAngle,
} from "./constants.mjs";

export { pointOnCrank, windCap };

export function emptyLeft(wind = WIND_START) {
  return {
    crankRate: 0,
    wind: Number(wind) || 0,
    theta: 0,
    hasTheta: false,
    path: 0,
    px: CRANK_CX,
    py: CRANK_CY,
  };
}

/**
 * Instantaneous clockwise revolutions per second from a pair of samples.
 * Counterclockwise values are already included; the ratchet is applied by the caller.
 */
export function crankInst(prevTheta, theta, dt) {
  const step = Number(dt) || 0;
  if (!(step > 0) || prevTheta == null || !Number.isFinite(prevTheta) || !Number.isFinite(theta)) return 0;
  return wrapAngle(theta - prevTheta) / (2 * Math.PI * step);
}

/**
 * Update crankRate from a left-hand sample (clockwise is positive, ratchet zeros the rest).
 * When inactive or not landscape, crankRate decays with tau 0.16.
 * A radius under CRANK_DEAD yields inst 0. A short tap (path < 10wu) does not wind the platter.
 */
export function updateCrank(left, pos, dt, active) {
  const next = {
    crankRate: Number(left?.crankRate) || 0,
    wind: Number(left?.wind) || 0,
    theta: Number(left?.theta) || 0,
    hasTheta: !!left?.hasTheta,
    path: Number(left?.path) || 0,
    px: Number(left?.px) || CRANK_CX,
    py: Number(left?.py) || CRANK_CY,
  };
  const step = Math.max(0, Number(dt) || 0);
  if (!active || !pos) {
    next.crankRate = next.crankRate * Math.exp(-step / CRANK_DECAY_TAU);
    next.hasTheta = false;
    next.path = 0;
    return next;
  }
  const dx = Number(pos.x) - CRANK_CX;
  const dy = Number(pos.y) - CRANK_CY;
  const rad = Math.hypot(dx, dy);
  const theta = Math.atan2(dy, dx);
  if (next.hasTheta) next.path += Math.hypot(Number(pos.x) - next.px, Number(pos.y) - next.py);
  next.px = Number(pos.x);
  next.py = Number(pos.y);

  let inst = 0;
  if (rad >= CRANK_DEAD && next.hasTheta && step > 0) {
    inst = crankInst(next.theta, theta, step);
  }
  next.theta = theta;
  next.hasTheta = true;

  let des = Math.max(0, inst);
  if (next.path < TAP_PATH) des = 0;
  if (step > 0) {
    next.crankRate += (des - next.crankRate) * (1 - Math.exp(-step / CRANK_SMOOTH_TAU));
  }
  if (next.crankRate < 0) next.crankRate = 0;
  return next;
}

/**
 * Integrate spring wind and platter omega. Call only during play in landscape.
 * crankRate / rateMid is the demanded speed; wind caps the reachable omega.
 */
export function integrateWindOmega({ wind, omega, crankRate, rateMid, windDecayMul }, dt) {
  const step = Math.max(0, Number(dt) || 0);
  const mid = Number(rateMid) || 1;
  let w = Number(wind) || 0;
  let om = Number(omega) || 0;
  const supply = CRANK_WIND * ((Number(crankRate) || 0) / mid) * step;
  const drain = WIND_DECAY * (Number(windDecayMul) || 1) * step;
  w = clamp(w + supply - drain, 0, 1);
  const cap = windCap(w) * OMEGA_CAP_MUL;
  const omegaDes = Math.min((Number(crankRate) || 0) / mid, cap);
  if (step > 0) om += (omegaDes - om) * (1 - Math.exp(-step / OMEGA_TAU));
  if (om < 0) om = 0;
  return { wind: w, omega: om };
}
