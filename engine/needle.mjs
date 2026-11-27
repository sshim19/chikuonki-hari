/** Positions → height, dropVel, and raised-arm radius. Checkable pure functions. */

import {
  DROPVEL_DECAY_TAU,
  HEIGHT_SMOOTH_TAU,
  LATERAL_PRESS,
  POS_HEIGHT,
  RADIUS_IN,
  RADIUS_OUT,
  RADIUS_SMOOTH_TAU,
  clamp,
  heightDesired,
  radiusDesired,
  xFromRadius,
  yFromHeight,
} from "./constants.mjs";

export { heightDesired, radiusDesired, xFromRadius, yFromHeight };

export function emptyRight() {
  return {
    height: 0,
    dropVel: 0,
    dropPeak: 0,
    heightDes: 0,
    prevX: 0,
    hasPrev: false,
    lateral: 0,
  };
}

/**
 * Update height, dropVel, and (when raised) radius from a right-hand sample.
 * height 0 is raised, 1 is in the groove. dropVel is positive when lowering.
 * When inactive or not landscape, height and radius stay; dropVel decays to 0.
 * Returns { right, radius, lateral } where lateral is |dx|/dt in wu/s this frame (0 if unknown).
 */
export function updateNeedle(right, radius, pos, dt, active) {
  const next = {
    height: clamp(Number(right?.height) || 0, 0, 1),
    dropVel: Number(right?.dropVel) || 0,
    dropPeak: Number(right?.dropPeak) || 0,
    heightDes: clamp(Number(right?.heightDes) || 0, 0, 1),
    prevX: Number(right?.prevX) || 0,
    hasPrev: !!right?.hasPrev,
    lateral: 0,
  };
  let rad = clamp(Number(radius) || 0, RADIUS_IN, RADIUS_OUT);
  const step = Math.max(0, Number(dt) || 0);

  if (!active || !pos) {
    if (step > 0) next.dropVel = next.dropVel * Math.exp(-step / DROPVEL_DECAY_TAU);
    if (next.dropVel < 0.02) next.dropVel = 0;
    next.dropPeak = 0;
    next.hasPrev = false;
    next.lateral = 0;
    return { right: next, radius: rad, lateral: 0 };
  }

  const des = heightDesired(pos.y);
  const prevH = next.height;
  const prevDes = next.heightDes;
  if (step > 0) {
    next.height += (des - next.height) * (1 - Math.exp(-step / HEIGHT_SMOOTH_TAU));
    next.height = clamp(next.height, 0, 1);
    next.dropVel = (next.height - prevH) / step;
  }
  next.heightDes = des;

  // Peak downward speed of the current descent, used at the seating instant.
  const desVel = step > 0 ? (des - prevDes) / step : 0;
  if (desVel > 0.12 || next.dropVel > 0.12) {
    next.dropPeak = Math.max(next.dropPeak, next.dropVel, desVel);
  } else {
    next.dropPeak = 0;
  }

  if (next.height <= POS_HEIGHT) {
    const rDes = radiusDesired(pos.x);
    if (step > 0) {
      rad += (rDes - rad) * (1 - Math.exp(-step / RADIUS_SMOOTH_TAU));
      rad = clamp(rad, RADIUS_IN, RADIUS_OUT);
    }
  }

  let lateral = 0;
  if (next.hasPrev && step > 0) lateral = Math.abs(Number(pos.x) - next.prevX) / step;
  next.prevX = Number(pos.x);
  next.hasPrev = true;
  next.lateral = lateral;
  return { right: next, radius: rad, lateral };
}

export function isLateralPress(lateral) {
  return (Number(lateral) || 0) > LATERAL_PRESS;
}
