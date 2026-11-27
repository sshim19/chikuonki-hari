/** dailyParams(rngState) → { params, rngState }. Idempotent daily disc. */

import {
  GAP_MAX,
  GAP_MIN,
  LABEL_R,
  MUSIC_HI,
  MUSIC_LO,
  MUSIC_TIME_MAX,
  MUSIC_TIME_MIN,
  PLACE_RADIUS,
  RATE_HALF,
  RATE_MID0,
  RATE_MID_JITTER,
  RUNOUT_MAX,
  RUNOUT_MIN,
  SCRATCH_W_MAX,
  SCRATCH_W_MIN,
  SIDE_MAX,
  SIDE_MIN,
  TRACK_DUR_MAX,
  TRACK_DUR_MIN,
  WEAR_TABLE,
  WIND_DECAY_JITTER,
  clamp,
} from "./constants.mjs";
import { rngRange, rngStep } from "./rng.mjs";

function pickWear(u) {
  if (u < 0.3) return "clean";
  if (u < 0.7) return "normal";
  return "worn";
}

function pickInt(a, lo, hi) {
  if (lo === hi) return { value: lo, a };
  const step = rngStep(a);
  const n = lo + Math.min(hi - lo, Math.floor(step.value * (hi - lo + 1)));
  return { value: n, a: step.a };
}

function splitDurations(a, n, total, lo, hi) {
  const weights = [];
  for (let i = 0; i < n; i++) {
    const r = rngStep(a);
    a = r.a;
    weights.push(0.35 + r.value);
  }
  const sumW = weights.reduce((s, w) => s + w, 0) || n;
  let durs = weights.map((w) => (w / sumW) * total);
  for (let pass = 0; pass < 10; pass++) {
    let surplus = 0;
    const flex = [];
    for (let i = 0; i < n; i++) {
      if (durs[i] < lo) {
        surplus -= lo - durs[i];
        durs[i] = lo;
      } else if (durs[i] > hi) {
        surplus += durs[i] - hi;
        durs[i] = hi;
      } else {
        flex.push(i);
      }
    }
    if (Math.abs(surplus) < 1e-9) break;
    if (!flex.length) break;
    const share = surplus / flex.length;
    for (const i of flex) {
      const nd = clamp(durs[i] + (surplus > 0 ? share : share), lo, hi);
      surplus -= nd - durs[i];
      durs[i] = nd;
    }
  }
  let fix = total - durs.reduce((s, d) => s + d, 0);
  for (let i = 0; i < n && Math.abs(fix) > 1e-9; i++) {
    const nd = clamp(durs[i] + fix, lo, hi);
    fix -= nd - durs[i];
    durs[i] = nd;
  }
  return { durs, a };
}

function growToSide(leadIn, durs, gaps, runout, leadInMax, musicMax) {
  let side = leadIn + durs.reduce((s, d) => s + d, 0) + gaps.reduce((s, g) => s + g, 0) + runout;
  if (side >= SIDE_MIN && side <= SIDE_MAX) {
    return { leadIn, durs, gaps, runout, side };
  }
  if (side < SIDE_MIN) {
    let need = SIDE_MIN - side;
    const music = durs.reduce((s, d) => s + d, 0);
    const musicRoom = Math.max(0, Math.min(musicMax, durs.length * TRACK_DUR_MAX) - music);
    const addMusic = Math.min(need, musicRoom);
    if (addMusic > 0) {
      let left = addMusic;
      for (let pass = 0; pass < 8 && left > 1e-9; pass++) {
        const room = durs.map((d, i) => (d < TRACK_DUR_MAX ? i : -1)).filter((i) => i >= 0);
        if (!room.length) break;
        const share = left / room.length;
        for (const i of room) {
          const nd = Math.min(TRACK_DUR_MAX, durs[i] + share);
          left -= nd - durs[i];
          durs[i] = nd;
        }
      }
      need = left;
    }
    const bumpLead = Math.min(need, Math.max(0, leadInMax - leadIn));
    leadIn += bumpLead;
    need -= bumpLead;
    for (let i = 0; i < gaps.length && need > 1e-9; i++) {
      const add = Math.min(need, Math.max(0, GAP_MAX - gaps[i]));
      gaps[i] += add;
      need -= add;
    }
    const bumpRun = Math.min(need, Math.max(0, RUNOUT_MAX - runout));
    runout += bumpRun;
    need -= bumpRun;
    if (need > 1e-9) runout += need;
  } else if (side > SIDE_MAX) {
    let extra = side - SIDE_MAX;
    const cutRun = Math.min(extra, Math.max(0, runout - RUNOUT_MIN));
    runout -= cutRun;
    extra -= cutRun;
    for (let i = 0; i < gaps.length && extra > 1e-9; i++) {
      const cut = Math.min(extra, Math.max(0, gaps[i] - GAP_MIN));
      gaps[i] -= cut;
      extra -= cut;
    }
    const musicMin = Math.max(MUSIC_TIME_MIN, durs.length * TRACK_DUR_MIN);
    let music = durs.reduce((s, d) => s + d, 0);
    let cutMusic = Math.min(extra, Math.max(0, music - musicMin));
    extra -= cutMusic;
    for (let pass = 0; pass < 8 && cutMusic > 1e-9; pass++) {
      const room = durs.map((d, i) => (d > TRACK_DUR_MIN ? i : -1)).filter((i) => i >= 0);
      if (!room.length) break;
      const share = cutMusic / room.length;
      for (const i of room) {
        const nd = Math.max(TRACK_DUR_MIN, durs[i] - share);
        cutMusic -= durs[i] - nd;
        durs[i] = nd;
      }
    }
    if (extra > 1e-9) leadIn = Math.max(leadIn - extra, 0);
  }
  let side2 = leadIn + durs.reduce((s, d) => s + d, 0) + gaps.reduce((s, g) => s + g, 0) + runout;
  if (side2 < SIDE_MIN && SIDE_MIN - side2 < 1e-6) {
    runout += SIDE_MIN - side2;
    side2 = SIDE_MIN;
  }
  if (side2 > SIDE_MAX && side2 - SIDE_MAX < 1e-6) {
    runout = Math.max(RUNOUT_MIN, runout - (side2 - SIDE_MAX));
    side2 = SIDE_MAX;
  }
  return { leadIn, durs, gaps, runout, side: side2 };
}

/**
 * Stream order: wear → decay jitter → rateMid jitter → track count and widths → gaps and runout → scratches.
 */
export function dailyParams(rngState) {
  let a = rngState >>> 0;
  let r = rngStep(a);
  a = r.a;
  const wear = pickWear(r.value);
  const row = WEAR_TABLE[wear];

  r = rngRange(a, -WIND_DECAY_JITTER, WIND_DECAY_JITTER);
  a = r.a;
  const windDecayMul = clamp(row.windDecayMul + r.value, row.windDecayMul - WIND_DECAY_JITTER, row.windDecayMul + WIND_DECAY_JITTER);

  r = rngRange(a, RATE_MID0 - RATE_MID_JITTER, RATE_MID0 + RATE_MID_JITTER);
  a = r.a;
  const rateMid = r.value;
  const rateHalf = RATE_HALF;

  const nPick = pickInt(a, row.tracks[0], row.tracks[1]);
  a = nPick.a;
  const n = nPick.value;

  r = rngRange(a, row.leadIn[0], row.leadIn[1]);
  a = r.a;
  let leadIn = r.value;

  const musicMin = Math.max(MUSIC_TIME_MIN, n * TRACK_DUR_MIN);
  const musicMax = Math.min(MUSIC_TIME_MAX, n * TRACK_DUR_MAX);
  r = rngRange(a, musicMin, Math.max(musicMin, musicMax));
  a = r.a;
  const musicTarget = r.value;
  const split = splitDurations(a, n, musicTarget, TRACK_DUR_MIN, TRACK_DUR_MAX);
  a = split.a;
  let durs = split.durs;

  const gaps = [];
  for (let i = 0; i < n - 1; i++) {
    r = rngRange(a, GAP_MIN, GAP_MAX);
    a = r.a;
    gaps.push(r.value);
  }
  r = rngRange(a, RUNOUT_MIN, RUNOUT_MAX);
  a = r.a;
  let runout = r.value;

  const fitted = growToSide(leadIn, durs, gaps, runout, row.leadIn[1], musicMax);
  leadIn = fitted.leadIn;
  durs = fitted.durs;
  const gapsOut = fitted.gaps;
  runout = fitted.runout;
  const sideDur = fitted.side;

  // First track starts at musicHi; label is reached at the end of runout.
  const playRate = (MUSIC_HI - LABEL_R) / Math.max(1e-6, sideDur - leadIn);
  const leadInR = MUSIC_HI + leadIn * playRate;
  const runOutR = LABEL_R + runout * playRate;

  const tracks = [];
  let rad = MUSIC_HI;
  for (let i = 0; i < n; i++) {
    const r0 = rad;
    const r1 = r0 - durs[i] * playRate;
    tracks.push({ r0, r1, dur: durs[i] });
    if (i < n - 1) rad = r1 - gapsOut[i] * playRate;
    else rad = r1;
  }

  const scratches = placeScratches(a, tracks, leadInR, playRate, row);
  a = scratches.a;

  return {
    params: {
      wear,
      rateMid,
      rateHalf,
      windDecayMul,
      sideDur,
      playRate,
      tracks: tracks.map((t) => ({ r0: t.r0, r1: t.r1 })),
      scratches: scratches.list,
      leadInR,
      runOutR,
      labelR: LABEL_R,
      leadIn,
      runout,
    },
    rngState: a,
  };
}

function timeOfR(leadInR, playRate, radius) {
  return (leadInR - radius) / Math.max(1e-9, playRate);
}

function placeScratches(a, tracks, leadInR, playRate, row) {
  const countPick = pickInt(a, row.scratches[0], row.scratches[1]);
  a = countPick.a;
  const want = countPick.value;
  const minT = row.firstScratch;
  const list = [];

  function overlaps(r, w) {
    for (const s of list) {
      if (Math.abs(s.r - r) < (s.w + w) / 2 + 0.004) return true;
    }
    return false;
  }

  function windows(marginT) {
    const out = [];
    for (const tr of tracks) {
      const t0 = timeOfR(leadInR, playRate, tr.r0);
      const t1 = timeOfR(leadInR, playRate, tr.r1);
      const start = Math.max(t0 + marginT, minT);
      const end = t1 - marginT;
      if (end - start > 0.2) out.push({ t0: start, t1: end, tr });
    }
    return out;
  }

  let wins = windows(0.65);
  if (wins.length === 0) wins = windows(0.25);
  if (wins.length === 0) wins = windows(0);

  for (let k = 0; k < want; k++) {
    let placed = false;
    for (let attempt = 0; attempt < 8 && !placed; attempt++) {
      const use = wins.length ? wins : windows(0);
      if (!use.length) break;
      let pick = rngStep(a);
      a = pick.a;
      const win = use[Math.min(use.length - 1, Math.floor(pick.value * use.length))];
      pick = rngRange(a, win.t0, win.t1);
      a = pick.a;
      const tm = pick.value;
      const rad = leadInR - tm * playRate;
      pick = rngRange(a, SCRATCH_W_MIN, SCRATCH_W_MAX);
      a = pick.a;
      const w = pick.value;
      if (rad <= win.tr.r0 - 1e-6 && rad >= win.tr.r1 + 1e-6 && !overlaps(rad, w)) {
        list.push({ r: rad, w });
        placed = true;
      }
    }
    if (!placed) {
      const use = windows(0);
      let best = null;
      for (const win of use) {
        const midT = (win.t0 + win.t1) / 2;
        const rad = leadInR - midT * playRate;
        const w = (SCRATCH_W_MIN + SCRATCH_W_MAX) / 2;
        if (!overlaps(rad, w) && rad < win.tr.r0 && rad > win.tr.r1) {
          const span = win.t1 - win.t0;
          if (!best || span > best.span) best = { r: rad, w, span };
        }
      }
      if (best) list.push({ r: best.r, w: best.w });
    }
  }

  list.sort((x, y) => y.r - x.r);
  return { list, a };
}

/** Disc time (omega=1 seconds from the outer lead-in) for a radius. */
export function timeAtRadius(params, radius) {
  const rate = Number(params?.playRate) || 0;
  if (!(rate > 0)) return 0;
  return (Number(params.leadInR ?? PLACE_RADIUS) - Number(radius)) / rate;
}

export function radiusAtTime(params, t) {
  const rate = Number(params?.playRate) || 0;
  const start = Number(params?.leadInR ?? PLACE_RADIUS);
  return start - rate * (Number(t) || 0);
}

export function trackIndexAt(params, radius) {
  const tracks = params?.tracks || [];
  for (let i = 0; i < tracks.length; i++) {
    if (radius <= tracks[i].r0 + 1e-12 && radius >= tracks[i].r1 - 1e-12) return i;
  }
  return -1;
}

export function scratchAt(params, radius) {
  const scratches = params?.scratches || [];
  for (const s of scratches) {
    if (Math.abs(radius - s.r) <= s.w / 2 + 1e-12) return s;
  }
  return null;
}

export function inMusicBand(radius) {
  return radius <= MUSIC_HI + 1e-9 && radius >= MUSIC_LO - 1e-9;
}
