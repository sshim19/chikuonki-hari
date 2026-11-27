/** Seating, skips, scratches, runout, and playFrac / pitchFrac / care. */

import {
  AIRBORNE_HEIGHT,
  AIRBORNE_T,
  CARE_HARD,
  CARE_RUIN,
  CARE_SCRATCH,
  CARE_SKIPS,
  GENTLE,
  GOUGE,
  GRADE_LABELS,
  HARD,
  LABEL_R,
  LATERAL_PRESS,
  LIFT_HEIGHT,
  OMEGA_ADVANCE_MIN,
  OMEGA_GOUGE_MIN,
  RADIUS_IN,
  RADIUS_OUT,
  SCORE_CARE,
  SCORE_PITCH,
  SCORE_PLAY,
  SEAT_HEIGHT,
  SKIP_JUMP_MAX,
  SKIP_JUMP_MIN,
  clamp,
  gradeForScore,
  pitchInst,
} from "./constants.mjs";
import { scratchAt, timeAtRadius, trackIndexAt } from "./daily.mjs";

export { pitchInst, scratchAt, trackIndexAt, timeAtRadius };

export function emptyTrackProg(tracks) {
  return (tracks || []).map((t) => ({
    goodT: 0,
    dur: Math.max(1e-9, (Number(t.r0) - Number(t.r1)) / 1), // filled by caller with real dur
  }));
}

export function trackDur(track, playRate) {
  const rate = Number(playRate) || 0;
  if (!(rate > 0)) return 0;
  return Math.max(0, (Number(track.r0) - Number(track.r1)) / rate);
}

export function makeTrackProg(params) {
  const tracks = params?.tracks || [];
  const rate = Number(params?.playRate) || 0;
  return tracks.map((t) => ({ goodT: 0, dur: trackDur(t, rate) }));
}

export function inTrack(radius, track) {
  if (!track) return false;
  return radius <= track.r0 + 1e-12 && radius >= track.r1 - 1e-12;
}

export function skipJump(intensity) {
  const u = clamp(Number(intensity) || 0.5, 0, 1);
  return SKIP_JUMP_MIN + (SKIP_JUMP_MAX - SKIP_JUMP_MIN) * u;
}

/**
 * Apply a skip: increment skips, throw the needle inward, raise it to AIRBORNE_HEIGHT, start airborneT.
 * Does not end the play by itself.
 */
export function applySkip(s, intensity = 0.5) {
  s.skips = (Number(s.skips) || 0) + 1;
  const jump = skipJump(intensity);
  s.radius = clamp((Number(s.radius) || 0) - jump, RADIUS_IN, RADIUS_OUT);
  s.airborneT = AIRBORNE_T;
  s.seated = false;
  if (s.right) {
    s.right = { ...s.right, height: AIRBORNE_HEIGHT, dropVel: 0, dropPeak: 0, heightDes: s.right.heightDes ?? AIRBORNE_HEIGHT };
  }
}

export function seatingKind(dropVel) {
  const v = Number(dropVel) || 0;
  if (v > GOUGE) return "gouge";
  if (v > HARD) return "hard";
  if (v <= GENTLE) return "gentle";
  return "medium";
}

/**
 * Handle a downward crossing of SEAT_HEIGHT. Mutates s. Returns the seating kind.
 */
export function onSeat(s, impactVel) {
  const kind = seatingKind(impactVel);
  const omega = Number(s.omega) || 0;
  s.seats = (Number(s.seats) || 0) + 1;
  s.seated = true;
  if (kind === "gentle") s.gentleDrops = (Number(s.gentleDrops) || 0) + 1;
  if (kind === "hard" || kind === "gouge") s.hardDrops = (Number(s.hardDrops) || 0) + 1;
  if (kind === "gouge" && omega >= OMEGA_GOUGE_MIN) s.ruined = true;
  if (kind === "hard" || kind === "gouge") {
    const intensity = clamp((impactVel - HARD) / Math.max(0.01, GOUGE - HARD), 0, 1);
    applySkip(s, 0.45 + 0.55 * intensity);
  }
  if (s.right) s.right = { ...s.right, dropPeak: 0 };
  return kind;
}

export function onLift(s) {
  s.seated = false;
  if (s.right) s.right = { ...s.right, dropPeak: 0 };
}

export function scoreParts(s) {
  const prog = s.trackProg || [];
  const n = prog.length;
  let playFrac = 0;
  if (n === 0) {
    playFrac = 0;
  } else {
    let sum = 0;
    for (const p of prog) {
      const dur = Number(p.dur) || 0;
      const good = Number(p.goodT) || 0;
      sum += dur > 0 ? clamp(good / dur, 0, 1) : 0;
    }
    playFrac = sum / n;
  }
  const nPitch = Number(s.nPitch) || 0;
  const sumPitch = Number(s.sumPitch) || 0;
  const pitchFrac = nPitch > 1e-6 ? clamp(sumPitch / nPitch, 0, 1) : 0;
  const seats = Number(s.seats) || 0;
  const neverSat = seats <= 0;
  const playNearlyZero = (Number(s.playT) || 0) < 1e-6;
  const hardFrac = seats > 0 ? clamp((Number(s.hardDrops) || 0) / seats, 0, 1) : 0;

  let careTerm;
  if (neverSat || playNearlyZero) {
    careTerm = (s.ruined ? 1 : 0) * CARE_RUIN;
  } else {
    careTerm =
      CARE_HARD * hardFrac +
      CARE_SKIPS * clamp((Number(s.skips) || 0) / 3, 0, 1) +
      CARE_SCRATCH * clamp((Number(s.scratchHit) || 0) / 2, 0, 1) +
      CARE_RUIN * (s.ruined || (Number(s.runovers) || 0) > 0 ? 1 : 0);
  }
  const care = 1 - clamp(careTerm, 0, 1);
  if ((neverSat || playNearlyZero) && !s.ruined) {
    playFrac = 0;
  }
  const raw = 100 * (SCORE_PLAY * (neverSat || playNearlyZero ? 0 : playFrac) + SCORE_PITCH * (neverSat || playNearlyZero ? 0 : pitchFrac) + SCORE_CARE * care);
  const score = Math.round(clamp(raw, 0, 100));
  const grade = gradeForScore(score);
  return { playFrac: neverSat || playNearlyZero ? 0 : playFrac, pitchFrac: neverSat || playNearlyZero ? 0 : pitchFrac, care, hardFrac, score, grade };
}

export function trackScore(progI) {
  const dur = Number(progI?.dur) || 0;
  if (!(dur > 0)) return 0;
  return clamp((Number(progI.goodT) || 0) / dur, 0, 1);
}

/**
 * All tracks met: every trackScore ≥ 0.92, no runover, needle raised after the last track
 * (height ≤ LIFT_HEIGHT, and radius has reached the last 0.60s of the last track or beyond).
 */
export function tracksComplete(s) {
  if (s.ruined) return false;
  if ((Number(s.runovers) || 0) > 0) return false;
  const tracks = s.params?.tracks || [];
  const prog = s.trackProg || [];
  if (!tracks.length || prog.length !== tracks.length) return false;
  for (let i = 0; i < tracks.length; i++) {
    if (trackScore(prog[i]) < 0.92 - 1e-12) return false;
  }
  const height = Number(s.right?.height) || 0;
  if (height > LIFT_HEIGHT + 1e-9) return false;
  const last = tracks[tracks.length - 1];
  const rate = Number(s.params?.playRate) || 0;
  const liftWindow = last.r1 + 0.6 * rate;
  if ((Number(s.radius) || 0) > liftWindow + 1e-9) return false;
  return true;
}

/**
 * Advance the groove for one physics step while playing (landscape, not place).
 * Mutates s. Does not lock the score.
 */
export function stepGroove(s, dt, lateral) {
  const step = Math.max(0, Number(dt) || 0);
  if (s.airborneT > 0) {
    s.airborneT = Math.max(0, s.airborneT - step);
  }
  const height = Number(s.right?.height) || 0;
  const airborne = s.airborneT > 1e-12;
  const wantSeat = height >= SEAT_HEIGHT && !airborne;
  s.seated = wantSeat && !s.ruined ? true : wantSeat && s.ruined ? height >= SEAT_HEIGHT && !airborne : wantSeat;

  const labelR = Number(s.params?.labelR) ?? LABEL_R;
  const playRate = Number(s.params?.playRate) || 0;
  const omega = Number(s.omega) || 0;

  if (s.seated && !airborne && omega > OMEGA_ADVANCE_MIN && (Number(s.runovers) || 0) === 0) {
    s.radius = (Number(s.radius) || 0) - playRate * omega * step;
    s.radius = clamp(s.radius, RADIUS_IN, RADIUS_OUT);
  }

  if (s.seated && !airborne && s.radius <= labelR + 1e-12) {
    s.radius = labelR;
    if ((Number(s.runovers) || 0) === 0) s.runovers = 1;
  }

  if (!s.ruined && s.finishedAt == null) {
    if (s.seated && !airborne && (Number(s.runovers) || 0) === 0) {
      const sc = scratchAt(s.params, s.radius);
      if (sc && !s._inScratch) {
        s.scratchHit = (Number(s.scratchHit) || 0) + 1;
        s._inScratch = true;
        applySkip(s, 0.5);
      } else if (!sc) {
        s._inScratch = false;
      }
    } else if (!s.seated) {
      s._inScratch = false;
    }

    if (s.seated && s.airborneT <= 0 && (Number(s.runovers) || 0) === 0 && (Number(lateral) || 0) > LATERAL_PRESS) {
      applySkip(s, 0.4);
    }
  } else if (!s.seated) {
    s._inScratch = false;
  }

  // Re-read after a possible skip this step.
  const nowAir = s.airborneT > 1e-12;
  const nowSeated = (Number(s.right?.height) || 0) >= SEAT_HEIGHT && !nowAir;
  s.seated = nowSeated;

  if (s.finishedAt == null && !s.ruined && s.seated && !nowAir && (Number(s.runovers) || 0) === 0) {
    const idx = trackIndexAt(s.params, s.radius);
    if (idx >= 0) {
      if (!s.trackProg[idx]) s.trackProg[idx] = { goodT: 0, dur: trackDur(s.params.tracks[idx], playRate) };
      s.trackProg[idx] = { ...s.trackProg[idx], goodT: (Number(s.trackProg[idx].goodT) || 0) + step };
      const inst = pitchInst(s.omega);
      s.nPitch = (Number(s.nPitch) || 0) + step;
      s.sumPitch = (Number(s.sumPitch) || 0) + inst * step;
    }
  }
}

void GRADE_LABELS;
