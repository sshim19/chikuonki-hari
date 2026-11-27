/** tick(state, input, dt) → state. Place, play, reveal, finish. No DOM. */

import {
  DAILY_HINT_TIME,
  FINISH_MIN,
  FIXED_DT,
  LATERAL_PRESS,
  LESSON_HINT_TIME,
  LIFT_HEIGHT,
  MAX_DT,
  PLACE_RADIUS,
  PLACE_TIME,
  PLAY_TIME,
  REVEAL_TIME,
  RUINED_REVEAL_DELAY,
  SEAT_HEIGHT,
  WIND_START,
} from "./constants.mjs";
import { emptyLeft, integrateWindOmega, updateCrank } from "./crank.mjs";
import { dailyParams } from "./daily.mjs";
import { makeTrackProg, onLift, onSeat, scoreParts, stepGroove, tracksComplete } from "./groove.mjs";
import { emptyRight, updateNeedle } from "./needle.mjs";
import { hashSeed } from "./rng.mjs";

export { scoreParts, tracksComplete };

export function previewScore(s) {
  if (!s) return 0;
  return scoreParts(s).score;
}

function cloneState(s) {
  return {
    ...s,
    params: s.params
      ? {
          ...s.params,
          tracks: (s.params.tracks || []).map((t) => ({ ...t })),
          scratches: (s.params.scratches || []).map((c) => ({ ...c })),
        }
      : s.params,
    left: { ...(s.left || emptyLeft()) },
    right: { ...(s.right || emptyRight()) },
    trackProg: (s.trackProg || []).map((p) => ({ goodT: Number(p.goodT) || 0, dur: Number(p.dur) || 0 })),
  };
}

function hands(input) {
  const leftOn = !!input?.left?.active;
  const rightOn = !!input?.right?.active;
  return {
    leftOn,
    rightOn,
    leftPos: leftOn ? { x: Number(input.left.x), y: Number(input.left.y) } : null,
    rightPos: rightOn ? { x: Number(input.right.x), y: Number(input.right.y) } : null,
  };
}

function updateBests(s) {
  if (s.score <= 0) return;
  if (s.score > s.bestScore) s.bestScore = s.score;
  if (s.score > s.todayBestScore) s.todayBestScore = s.score;
}

function refreshLive(s) {
  const parts = scoreParts(s);
  if (s.finishedAt == null) {
    s.playFrac = parts.playFrac;
    s.pitchFrac = parts.pitchFrac;
    s.care = parts.care;
  }
}

function lockScore(s) {
  if (s.finishedAt != null) return;
  const parts = scoreParts(s);
  s.playFrac = parts.playFrac;
  s.pitchFrac = parts.pitchFrac;
  s.care = parts.care;
  s.score = parts.score;
  s.grade = parts.grade;
  s.finishedAt = s.playT;
  s.showDaily = false;
  s.showLesson = false;
  updateBests(s);
}

function goReveal(s) {
  s.phase = "reveal";
  s.phaseT = 0;
  s.showDaily = false;
  s.showLesson = false;
}

export function canFinish(s) {
  if (!s || s.status !== "playing" || s.phase !== "play") return false;
  if (s.finishedAt != null) return false;
  if (tracksComplete(s)) return true;
  return s.playT + 1e-9 >= FINISH_MIN;
}

function finalizeFinish(s) {
  lockScore(s);
  goReveal(s);
}

function applyGestures(s, input, dt, active) {
  const h = hands(input);
  const leftPos = active && h.leftOn ? h.leftPos : null;
  const rightPos = active && h.rightOn ? h.rightPos : null;
  const prevRate = s.left.crankRate;
  const prevHeight = s.right.height;
  s.left = updateCrank(s.left, leftPos, dt, !!(active && h.leftOn));
  const needle = updateNeedle(s.right, s.radius, rightPos, dt, !!(active && h.rightOn));
  s.right = needle.right;
  s.radius = needle.radius;
  s._lateral = needle.lateral;

  if (active && h.leftOn && s.left.crankRate > 0.2 && Math.abs(s.left.crankRate - prevRate) > 1e-6) {
    s.hintLeft = false;
  }
  if (active && h.rightOn && (Math.abs(s.right.height - prevHeight) > 0.04 || s.right.height > 0.06)) {
    s.hintRight = false;
  }

  if (s.phase === "play" && s.finishedAt == null && active) {
    const h0 = prevHeight;
    const h1 = s.right.height;
    if (h0 < SEAT_HEIGHT && h1 >= SEAT_HEIGHT && s.airborneT <= 0) {
      const impact = Math.max(Number(s.right.dropVel) || 0, Number(s.right.dropPeak) || 0);
      onSeat(s, impact);
    } else if (h0 > LIFT_HEIGHT && h1 <= LIFT_HEIGHT) {
      onLift(s);
    } else {
      s.seated = h1 >= SEAT_HEIGHT && s.airborneT <= 0;
    }
  }
}

function integrateDisc(s, dt) {
  const windStep = integrateWindOmega(
    {
      wind: s.left.wind,
      omega: s.omega,
      crankRate: s.left.crankRate,
      rateMid: s.params.rateMid,
      windDecayMul: s.params.windDecayMul,
    },
    dt,
  );
  s.left = { ...s.left, wind: windStep.wind };
  s.omega = windStep.omega;
}

function stepPlay(s, input, dt) {
  if (s.finishedAt != null) {
    s.playT += dt;
    s.phaseT += dt;
    s.showDaily = false;
    s.showLesson = false;
    if (s.ruined) {
      s.endWait = (Number(s.endWait) || 0) + dt;
      integrateDisc(s, dt);
      stepGroove(s, dt, 0);
      if (s.endWait + 1e-9 >= RUINED_REVEAL_DELAY) goReveal(s);
    }
    return;
  }

  integrateDisc(s, dt);
  const lateral = s.seated && s.airborneT <= 0 ? Number(s._lateral) || 0 : 0;
  stepGroove(s, dt, lateral > LATERAL_PRESS ? lateral : 0);
  refreshLive(s);

  s.playT += dt;
  s.phaseT += dt;
  s.showDaily = s.playT < DAILY_HINT_TIME;
  s.showLesson = s.playT < LESSON_HINT_TIME;

  if (s.ruined) {
    lockScore(s);
    s.endWait = 0;
    return;
  }
  if (tracksComplete(s)) {
    s.playT = Math.min(s.playT, PLAY_TIME);
    finalizeFinish(s);
  } else if (s.playT + 1e-9 >= PLAY_TIME) {
    s.playT = PLAY_TIME;
    finalizeFinish(s);
  } else if (input?.finish && canFinish(s)) {
    finalizeFinish(s);
  }
}

function stepPhase(s, input, dt) {
  if (s.status !== "playing") return;
  if (s.phase === "place") {
    s.phaseT += dt;
    if (s.phaseT + 1e-9 >= PLACE_TIME) {
      const overflow = Math.max(0, s.phaseT - PLACE_TIME);
      s.phase = "play";
      s.phaseT = 0;
      s.playT = 0;
      s.showDaily = true;
      s.showLesson = true;
      s.omega = 0;
      if (overflow > 0) stepPlay(s, input, overflow);
    }
    return;
  }
  if (s.phase === "play") {
    stepPlay(s, input, dt);
    return;
  }
  if (s.phase === "reveal") {
    s.phaseT += dt;
    if (s.phaseT + 1e-9 >= REVEAL_TIME) s.status = "over";
  }
}

/**
 * Near-pure: same state+input+dt → same result. Does not mutate state or input.
 * Clamps dt to 50ms and steps play / phases at 1/60 + remainder.
 * Gestures are applied once per call with the frame dt (positions are samples, not per-substep).
 * When landscape is false, crank / drop / lift / finish are ignored and time does not advance;
 * crankRate and dropVel decay, height and radius stay, platter inertia is frozen.
 */
export function tick(state, input, dt) {
  if (state.status !== "playing") return cloneState(state);
  const s = cloneState(state);
  const rawDt = Math.min(Math.max(Number(dt) || 0, 0), MAX_DT);
  if (!input?.landscape) {
    applyGestures(s, input, rawDt, false);
    s.seated = (Number(s.right?.height) || 0) >= SEAT_HEIGHT && s.airborneT <= 0;
    return s;
  }
  applyGestures(s, input, rawDt, true);
  let left = rawDt;
  while (left > 0 && s.status === "playing") {
    const stepDt = Math.min(FIXED_DT, left);
    stepPhase(s, input, stepDt);
    left -= stepDt;
  }
  return s;
}

/**
 * Shared by 「止める」, the time limit, and a completed set of tracks.
 * No-op before 22s unless all tracks are complete, and during place / reveal / when not playing.
 * Landscape is enforced by tick; a direct call assumes the caller already checked orientation.
 * A ruined disc is locked by tick, not by finishNow.
 */
export function finishNow(state) {
  const s = cloneState(state);
  if (canFinish(s)) finalizeFinish(s);
  return s;
}

/** Fresh playing state. bestScore / todayBestScore are in-memory; persist elsewhere. */
export function createInitialState({ seed, dateJst, bestScore = 0, todayBestScore = 0 } = {}) {
  const rng0 = hashSeed(seed);
  const built = dailyParams(rng0);
  const params = built.params;
  return {
    status: "playing",
    phase: "place",
    seed,
    dateJst: dateJst ?? null,
    phaseT: 0,
    playT: 0,
    rngState: built.rngState,
    params,
    left: emptyLeft(WIND_START),
    right: emptyRight(),
    omega: 0,
    radius: PLACE_RADIUS,
    seated: false,
    airborneT: 0,
    ruined: false,
    scratchHit: 0,
    hardDrops: 0,
    gentleDrops: 0,
    skips: 0,
    runovers: 0,
    seats: 0,
    trackProg: makeTrackProg(params),
    playFrac: 0,
    pitchFrac: 0,
    care: 1,
    nPitch: 0,
    sumPitch: 0,
    score: 0,
    grade: null,
    finishedAt: null,
    bestScore: bestScore || 0,
    todayBestScore: todayBestScore || 0,
    hintLeft: true,
    hintRight: true,
    showDaily: false,
    showLesson: false,
    endWait: 0,
    _inScratch: false,
    _lateral: 0,
  };
}
