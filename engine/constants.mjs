/** Dimensions, zones, time constants, spring and drop, grades, and storage keys. Y is down in wu. */

export const VIEW_W = 844;
export const VIEW_H = 390;

export const LEFT_X0 = 0;
export const LEFT_X1 = 400;
export const LEFT_Y0 = 44;
export const LEFT_Y1 = 390;

export const RIGHT_X0 = 444;
export const RIGHT_X1 = 844;
export const RIGHT_Y0 = 44;
export const RIGHT_Y1 = 390;
/** After assignment only: play.mjs may keep the right pointer this far past the edge. */
export const RIGHT_EDGE_SLACK = 24;

export const CRANK_CX = 188;
export const CRANK_CY = 268;
export const CRANK_VISUAL_R = 110;
export const CRANK_DEAD = 28;
export const CRANK_R_MIN = 36;
export const CRANK_R_MAX = 110;

export const NEEDLE_CX = 648;
export const NEEDLE_CY = 268;
export const NEEDLE_GROOVE_W = 56;
export const NEEDLE_GROOVE_H = 200;
/** y of height 0 (raised). height 1 is 200wu below. */
export const HEIGHT_Y0 = 168;
export const HEIGHT_SPAN = 200;
/** x of radius 0.98 (outer). x+200 is radius 0.22. */
export const RADIUS_X0 = 548;
export const RADIUS_X_SPAN = 200;
export const RADIUS_OUT = 0.98;
export const RADIUS_IN = 0.22;

export const LABEL_R = 0.34;
export const MUSIC_LO = 0.36;
export const MUSIC_HI = 0.92;
export const PLACE_RADIUS = 0.96;
export const WIND_START = 0.52;

export const PLACE_TIME = 1.2;
export const PLAY_TIME = 75;
export const FINISH_MIN = 22;
export const FINISH_MIN_TIME = FINISH_MIN;
export const REVEAL_TIME = 1.6;
export const RUINED_REVEAL_DELAY = 0.8;
export const DAILY_HINT_TIME = 2.5;
export const LESSON_HINT_TIME = 3.2;
export const FIXED_DT = 1 / 60;
export const MAX_DT = 0.05;

export const CRANK_SMOOTH_TAU = 0.12;
export const CRANK_DECAY_TAU = 0.16;
export const HEIGHT_SMOOTH_TAU = 0.1;
export const RADIUS_SMOOTH_TAU = 0.14;
export const DROPVEL_DECAY_TAU = 0.16;
export const TAP_PATH = 10;

/** Tunable §3 coefficients. DESIGN defaults: decay 0.11, supply 0.18, inertia 0.45s,
 *  pitch 0.08/0.22, drop 1.80/2.80/5.20, skip jump 0.03–0.06, start wind 0.62,
 *  rateMid 1.60. Changes stay within ±35%. Phase 3 retune (honest bots):
 *  decay 0.14, supply 0.16, pitch outer 0.297, start wind 0.52, rateMid 1.12.
 */
export const WIND_DECAY = 0.14;
export const CRANK_WIND = 0.16;
export const OMEGA_TAU = 0.45;
export const WIND_CAP0 = 0.42;
export const WIND_CAP1 = 0.58;
export const OMEGA_CAP_MUL = 1.05;

export const PITCH_INNER = 0.08;
export const PITCH_OUTER = 0.297;

export const SEAT_HEIGHT = 0.88;
export const LIFT_HEIGHT = 0.35;
export const POS_HEIGHT = 0.3;
export const GENTLE = 1.8;
export const HARD = 2.8;
export const GOUGE = 5.2;
export const OMEGA_ADVANCE_MIN = 0.05;
export const OMEGA_GOUGE_MIN = 0.75;

export const SKIP_JUMP_MIN = 0.03;
export const SKIP_JUMP_MAX = 0.06;
export const AIRBORNE_T = 0.4;
export const AIRBORNE_HEIGHT = 0.55;
export const LATERAL_PRESS = 28;

export const RATE_MID0 = 1.12;
export const RATE_MID_JITTER = 0.08;
export const RATE_HALF = 0.28;
export const WIND_DECAY_JITTER = 0.04;

export const TRACK_DUR_MIN = 8;
export const TRACK_DUR_MAX = 16;
export const GAP_MIN = 1.2;
export const GAP_MAX = 2.0;
export const RUNOUT_MIN = 1.6;
export const RUNOUT_MAX = 2.2;
export const SIDE_MIN = 52;
export const SIDE_MAX = 64;
export const MUSIC_TIME_MIN = 40;
export const MUSIC_TIME_MAX = 50;
export const SCRATCH_W_MIN = 0.01;
export const SCRATCH_W_MAX = 0.018;

export const WEAR_TABLE = {
  clean: {
    wear: "clean",
    tracks: [3, 3],
    scratches: [0, 1],
    firstScratch: 12,
    leadIn: [2.8, 3.4],
    windDecayMul: 0.82,
  },
  normal: {
    wear: "normal",
    tracks: [4, 4],
    scratches: [1, 2],
    firstScratch: 8,
    leadIn: [2.2, 2.8],
    windDecayMul: 1.0,
  },
  worn: {
    wear: "worn",
    tracks: [4, 5],
    scratches: [2, 4],
    firstScratch: 6,
    leadIn: [1.8, 2.4],
    windDecayMul: 1.18,
  },
};

export const SCORE_LOFTY = 88;
export const SCORE_GOOD = 72;
export const SCORE_CLOSE = 55;
export const SCORE_OFF = 32;

export const SCORE_PLAY = 0.38;
export const SCORE_PITCH = 0.32;
export const SCORE_CARE = 0.3;
export const CARE_HARD = 0.26;
export const CARE_SKIPS = 0.3;
export const CARE_SCRATCH = 0.22;
export const CARE_RUIN = 0.22;

export const JUDGE_BALLOON_OFFSET = 70;

export const STORAGE_BEST = "chikuonki-hari:bestScore";
export const STORAGE_DAILY_PREFIX = "chikuonki-hari:daily:";
export const STORAGE_MUTED = "chikuonki-hari:muted";
export const SEED_PREFIX = "chikuonki-hari:";

export const WEAR_LABELS = { clean: "傷が少ない", normal: "ふつう", worn: "傷多め" };

export const GRADE_LABELS = {
  lofty: "よく鳴った",
  good: "よい針",
  close: "おしい",
  off: "乱れた",
  early: "まだ早い",
};

export const GRADE_BALLOONS = {
  lofty: "よく鳴った！",
  good: "よい針",
  close: "おしい",
  off: "乱れた",
  early: "まだ早い",
};

export const GRADE_SHARE = {
  lofty: "よく鳴った",
  good: "よい針",
  close: "おしい",
  off: "乱れた",
  early: "まだ早い",
};

export const GRADE_RESULT = {
  lofty: "よく鳴った盤",
  good: "よい針",
  close: "おしい",
  off: "乱れた",
  early: "まだ早い",
};

export function seedString(dateJst) {
  return SEED_PREFIX + dateJst;
}

export function dailyKey(dateJst) {
  return STORAGE_DAILY_PREFIX + dateJst;
}

export function gradeForScore(score) {
  const s = Number(score) || 0;
  if (s >= SCORE_LOFTY) return "lofty";
  if (s >= SCORE_GOOD) return "good";
  if (s >= SCORE_CLOSE) return "close";
  if (s >= SCORE_OFF) return "off";
  return "early";
}

export function clamp(x, lo, hi) {
  const n = Number(x);
  if (!Number.isFinite(n)) return lo;
  if (n < lo) return lo;
  if (n > hi) return hi;
  return n;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function wrapAngle(d) {
  let a = d;
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

/**
 * 1 when |x-mid| ≤ half, then linear to 0 at mid ± 2*half (floor 0).
 */
export function bump(x, mid, half) {
  const h = Number(half) || 0;
  if (!(h > 0)) return 0;
  const d = Math.abs((Number(x) || 0) - mid);
  if (d <= h) return 1;
  if (d >= 2 * h) return 0;
  return 1 - (d - h) / h;
}

/** Pitch quality: 1 when |omega-1| ≤ inner, 0 when |omega-1| ≥ outer, linear between. */
export function pitchInst(omega) {
  const d = Math.abs((Number(omega) || 0) - 1);
  if (d <= PITCH_INNER + 1e-12) return 1;
  if (d >= PITCH_OUTER - 1e-12) return 0;
  return 1 - (d - PITCH_INNER) / (PITCH_OUTER - PITCH_INNER);
}

export function heightDesired(y) {
  return clamp((Number(y) - HEIGHT_Y0) / HEIGHT_SPAN, 0, 1);
}

export function yFromHeight(height) {
  return HEIGHT_Y0 + clamp(height, 0, 1) * HEIGHT_SPAN;
}

export function radiusDesired(x) {
  return clamp(RADIUS_OUT - ((Number(x) - RADIUS_X0) / RADIUS_X_SPAN) * (RADIUS_OUT - RADIUS_IN), RADIUS_IN, RADIUS_OUT);
}

export function xFromRadius(radius) {
  const span = RADIUS_OUT - RADIUS_IN;
  const t = span > 0 ? (RADIUS_OUT - clamp(radius, RADIUS_IN, RADIUS_OUT)) / span : 0;
  return RADIUS_X0 + t * RADIUS_X_SPAN;
}

/** Point on the crank circle. theta = atan2(y-cy, x-cx); increasing is clockwise (Y down). */
export function pointOnCrank(theta, r = 80) {
  return { x: CRANK_CX + r * Math.cos(theta), y: CRANK_CY + r * Math.sin(theta) };
}

export function windCap(wind) {
  return WIND_CAP0 + WIND_CAP1 * clamp(wind, 0, 1);
}
