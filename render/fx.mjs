/**
 * 重ねの開示、吹き出し、跳ね、深い傷、針の軌跡。
 * エンジンは触らず、state の差分から演出を進める。
 */

import * as constants from "../engine/constants.mjs";
import { dailyCondition, formatScore, gradeCallout } from "./share.mjs";

export const JUDGE_BALLOON_OFFSET = constants.JUDGE_BALLOON_OFFSET ?? 70;
export const TRAIL_CAP = 280;
export const BITS_CAP = 14;
export const SPIN_RATE = constants.SPIN_RATE ?? 5.2;
export const RUNOUT_WARN = constants.RUNOUT_WARN ?? 0.8;
export const SCRATCH_WARN = constants.SCRATCH_WARN ?? 0.8;
export const WIND_WARN = constants.WIND_WARN ?? 0.22;
export const FAST_OMEGA = constants.FAST_OMEGA ?? 1.14;
export const SLOW_OMEGA = constants.SLOW_OMEGA ?? 0.86;
export const PITCH_HALF = constants.PITCH_HALF ?? 0.08;
export const LESSON_TEXT = "曲の頭で落として、傷の前で上げる";

const FONT = `"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif`;

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, Number(n) || 0));
}

function clamp01(n) {
  return clamp(n, 0, 1);
}

function rgba(hex, a) {
  const n = parseInt(String(hex || "#f3eee4").replace("#", ""), 16);
  if (!Number.isFinite(n)) return `rgba(243, 238, 228, ${a})`;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function tracksOf(state) {
  return Array.isArray(state?.params?.tracks) ? state.params.tracks : [];
}

function scratchesOf(state) {
  return Array.isArray(state?.params?.scratches) ? state.params.scratches : [];
}

function inTrack(radius, tracks) {
  for (const tr of tracks) {
    const r0 = Number(tr?.r0);
    const r1 = Number(tr?.r1);
    if (!Number.isFinite(r0) || !Number.isFinite(r1)) continue;
    const lo = Math.min(r0, r1);
    const hi = Math.max(r0, r1);
    if (radius >= lo && radius <= hi) return true;
  }
  return false;
}

function inScratch(radius, scratches) {
  for (const sc of scratches) {
    const r = Number(sc?.r);
    const w = Number(sc?.w) || 0.014;
    if (!Number.isFinite(r)) continue;
    if (Math.abs(radius - r) <= w / 2) return true;
  }
  return false;
}

function timeToRadius(state, target) {
  const radius = Number(state?.radius);
  const playRate = Number(state?.params?.playRate);
  const omega = Number(state?.omega) || 0;
  if (!Number.isFinite(radius) || !Number.isFinite(playRate) || !(playRate > 0) || omega <= 0.05) {
    return Infinity;
  }
  const dist = radius - target;
  if (dist <= 0) return 0;
  return dist / (playRate * omega);
}

function nextScratchIn(state) {
  const radius = Number(state?.radius);
  if (!Number.isFinite(radius)) return Infinity;
  let best = Infinity;
  for (const sc of scratchesOf(state)) {
    const r = Number(sc?.r);
    const w = Number(sc?.w) || 0.014;
    if (!Number.isFinite(r)) continue;
    const edge = r + w / 2;
    if (edge < radius - 1e-4) {
      const t = timeToRadius(state, edge);
      if (t < best) best = t;
    } else if (Math.abs(radius - r) <= w / 2) {
      best = 0;
    }
  }
  return best;
}

function runoutIn(state) {
  const runOutR = Number(state?.params?.runOutR);
  const labelR = Number(state?.params?.labelR);
  const target = Number.isFinite(runOutR)
    ? runOutR
    : Number.isFinite(labelR)
      ? labelR
      : 0.34;
  return timeToRadius(state, target);
}

function inPitchBand(omega) {
  return Math.abs((Number(omega) || 0) - 1) <= PITCH_HALF;
}

/**
 * 再生中の状態文。優先は深い傷、跳ね、終わり、傷が近い、ぜんまい、速すぎ、遅すぎ、乗っている。
 * @param {object} [state]
 * @returns {string}
 */
export function statusFrom(state) {
  if (state?.status !== "playing") return "";
  if (state?.phase !== "play") return "";
  if (state?.ruined) return "盤を傷めた";
  if ((Number(state?.airborneT) || 0) > 0) return "針が跳ねた";
  const seated = !!state?.seated;
  if (seated && runoutIn(state) <= RUNOUT_WARN) return "終わりが近い";
  if (seated && nextScratchIn(state) <= SCRATCH_WARN) return "傷が近い";
  if ((Number(state?.left?.wind) || 0) < WIND_WARN) return "巻きが弱くなってきた";
  const omega = Number(state?.omega) || 0;
  if (omega > FAST_OMEGA) return "速すぎ";
  if (seated && omega < SLOW_OMEGA) return "遅すぎ";
  const radius = Number(state?.radius);
  if (
    seated &&
    (Number(state?.airborneT) || 0) <= 0 &&
    Number.isFinite(radius) &&
    inTrack(radius, tracksOf(state)) &&
    !inScratch(radius, scratchesOf(state)) &&
    inPitchBand(omega)
  ) {
    return "溝に乗っている";
  }
  return "";
}

export function createFx() {
  return {
    clock: 0,
    trail: [],
    bits: [],
    floats: [],
    crankAngle: 0,
    platterAngle: 0,
    hornSway: 0,
    placeLift: 0,
    revealZoom: 1,
    dailyAlpha: 0,
    lessonAlpha: 0,
    statusAlpha: 0,
    statusText: "",
    overlayX: 455,
    overlayY: 192,
    seatedGlow: 0,
    prev: null,
  };
}

export function resetFx(fx) {
  if (!fx) return;
  fx.clock = 0;
  fx.trail.length = 0;
  fx.bits.length = 0;
  fx.floats.length = 0;
  fx.crankAngle = 0;
  fx.platterAngle = 0;
  fx.hornSway = 0;
  fx.placeLift = 0;
  fx.revealZoom = 1;
  fx.dailyAlpha = 0;
  fx.lessonAlpha = 0;
  fx.statusAlpha = 0;
  fx.statusText = "";
  fx.overlayX = 455;
  fx.overlayY = 192;
  fx.seatedGlow = 0;
  fx.prev = null;
}

function spawnBalloons(fx, state) {
  const grade = state?.grade || "early";
  const score = Math.max(0, Math.floor(Number(state?.score) || 0));
  fx.floats.length = 0;
  fx.floats.push({
    kind: "grade",
    text: gradeCallout(grade),
    age: 0,
    color: "#1c2430",
  });
  fx.floats.push({
    kind: "score",
    text: `${formatScore(score)}点`,
    age: 0,
    color: "#1c2430",
  });
}

function addBits(fx, kind, reduced) {
  if (reduced) return;
  const n = kind === "ruined" ? 8 : 6;
  for (let i = 0; i < n && fx.bits.length < BITS_CAP; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = (kind === "ruined" ? 50 : 36) + Math.random() * 40;
    fx.bits.push({
      kind,
      x: 455 + Math.cos(ang) * 20,
      y: 192 + Math.sin(ang) * 16,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd * 0.6 - 10,
      r: 1.2 + Math.random() * 1.8,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 8,
      life: 0.4 + Math.random() * 0.35,
      max: 0.75,
      color: kind === "ruined" ? "#3a2018" : "#d8d0c4",
    });
  }
}

function pushTrail(fx, state) {
  const r = Number(state?.radius);
  if (!Number.isFinite(r)) return;
  const last = fx.trail[fx.trail.length - 1];
  const seated = !!state?.seated;
  const airborne = (Number(state?.airborneT) || 0) > 0;
  if (last && Math.abs(r - last.r) < 0.003 && fx.clock - last.at < 0.08) return;
  fx.trail.push({
    r,
    ang: Number(fx.platterAngle) || 0,
    seated,
    airborne,
    at: fx.clock,
  });
  if (fx.trail.length > TRAIL_CAP) fx.trail.splice(0, fx.trail.length - TRAIL_CAP);
}

/**
 * @param {object} fx
 * @param {object} state
 * @param {number} dt
 * @param {{ reducedMotion?: boolean, right?: object, left?: object }} [opts]
 */
export function syncFx(fx, state, dt, opts = {}) {
  if (!fx) return;
  const reduced = !!opts.reducedMotion;
  const t = Math.max(0, Number(dt) || 0);
  fx.clock += t;

  const playing = state?.status === "playing";
  const phase = state?.phase;
  const over = state?.status === "over" || state?.status === "title";

  if (over) {
    fx.floats.length = 0;
    fx.bits.length = 0;
    fx.statusAlpha = 0;
    fx.statusText = "";
    fx.dailyAlpha = 0;
    fx.lessonAlpha = 0;
    fx.seatedGlow = 0;
    fx.prev = {
      status: state?.status,
      phase: state?.phase,
      grade: state?.grade,
      score: state?.score,
      ruined: !!state?.ruined,
      skips: Number(state?.skips) || 0,
      scratchHit: Number(state?.scratchHit) || 0,
    };
    return;
  }

  const crankRate = Number(state?.left?.crankRate) || 0;
  fx.crankAngle += crankRate * t * Math.PI * 2;

  const omega = Number(state?.omega) || 0;
  if (playing && (phase === "play" || phase === "reveal")) {
    fx.platterAngle += omega * SPIN_RATE * t;
  }

  const swayTarget = reduced ? 0 : Math.sin(fx.clock * 1.15) * 0.03 * Math.min(1, omega);
  fx.hornSway += (swayTarget - fx.hornSway) * (1 - Math.exp(-t / 0.22));

  const placeTarget = playing && phase === "place" ? Math.max(0, 1 - (Number(state?.phaseT) || 0) / 1.2) : 0;
  fx.placeLift += (placeTarget * 18 - fx.placeLift) * (1 - Math.exp(-t / 0.12));

  const wantDaily = !!(playing && phase === "play" && state?.showDaily);
  fx.dailyAlpha += ((wantDaily ? 1 : 0) - fx.dailyAlpha) * (1 - Math.exp(-t / 0.2));

  const wantLesson = !!(playing && phase === "play" && state?.showLesson);
  fx.lessonAlpha += ((wantLesson ? 1 : 0) - fx.lessonAlpha) * (1 - Math.exp(-t / 0.2));

  const nextStatus = statusFrom(state);
  if (nextStatus) fx.statusText = nextStatus;
  const wantStatus = nextStatus ? 1 : 0;
  if (!playing || phase !== "play") {
    fx.statusAlpha = 0;
    if (!nextStatus) fx.statusText = "";
  } else {
    fx.statusAlpha += (wantStatus - fx.statusAlpha) * (1 - Math.exp(-t / 0.16));
    if (fx.statusAlpha < 0.02 && !nextStatus) fx.statusText = "";
  }

  const glowWant =
    nextStatus === "溝に乗っている" ? 1 : 0;
  fx.seatedGlow += (glowWant - fx.seatedGlow) * (1 - Math.exp(-t / 0.18));

  const zoomTarget = playing && phase === "reveal" ? 1 : 1;
  fx.revealZoom += (zoomTarget - fx.revealZoom) * (1 - Math.exp(-t / 0.25));

  const prevPhase = fx.prev?.phase;
  if (prevPhase !== "reveal" && phase === "reveal") {
    spawnBalloons(fx, state);
  }

  if (!fx.prev?.ruined && state?.ruined) addBits(fx, "ruined", reduced);
  if ((Number(state?.skips) || 0) > (Number(fx.prev?.skips) || 0)) addBits(fx, "skip", reduced);
  if ((Number(state?.scratchHit) || 0) > (Number(fx.prev?.scratchHit) || 0)) {
    addBits(fx, "scratch", reduced);
  }

  if (playing && (phase === "play" || phase === "reveal")) {
    pushTrail(fx, state);
  }

  for (let i = fx.bits.length - 1; i >= 0; i--) {
    const p = fx.bits[i];
    p.life -= t;
    p.x += p.vx * t;
    p.y += p.vy * t;
    p.vy += 80 * t;
    p.vx *= Math.exp(-t / 0.45);
    p.rot += p.spin * t;
    if (p.life <= 0) fx.bits.splice(i, 1);
  }
  if (reduced) fx.bits.length = 0;
  if (fx.bits.length > BITS_CAP) fx.bits.splice(0, fx.bits.length - BITS_CAP);

  for (const f of fx.floats) {
    f.age = (Number(f.age) || 0) + t;
  }

  fx.prev = {
    status: state?.status,
    phase: state?.phase,
    grade: state?.grade,
    score: state?.score,
    ruined: !!state?.ruined,
    skips: Number(state?.skips) || 0,
    scratchHit: Number(state?.scratchHit) || 0,
  };
}

export function revealZoom(fx, reduced) {
  if (!fx) return 1;
  const z = Number(fx.revealZoom) || 1;
  if (reduced) return Math.min(z, 1.02);
  return z;
}

export function overlayCenter(fx) {
  return {
    x: Number(fx?.overlayX) || 455,
    y: Number(fx?.overlayY) || 192,
  };
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} fx
 * @param {{ sx: Function, sy: Function, px: Function, reducedMotion?: boolean }} view
 * @param {object} [state]
 */
export function drawFx(ctx, fx, view, state) {
  if (!fx) return;
  const reduced = !!view.reducedMotion;
  const sx = (x) => view.sx(x);
  const sy = (y) => view.sy(y);
  const px = (w) => view.px(w);

  for (const p of fx.bits) {
    const u = Math.max(0, Math.min(1, p.life / (p.max || 1)));
    ctx.save();
    ctx.translate(sx(p.x), sy(p.y));
    ctx.rotate(p.rot || 0);
    ctx.globalAlpha = 0.28 + 0.5 * u;
    ctx.fillStyle = p.color || "#d8d0c4";
    ctx.fillRect(-px(p.r * 1.6), -px(p.r * 0.5), px(p.r * 3.2), px(p.r));
    ctx.restore();
  }

  function pill(text, x, y, alpha, size = 13) {
    if (alpha <= 0.04 || !text) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.font = `700 ${Math.max(11, px(size))}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const tw = ctx.measureText(text).width;
    const padX = 8;
    const padY = 4;
    const h = Math.max(16, px(size + 2));
    ctx.fillStyle = rgba("#f3eee4", 0.94);
    ctx.strokeStyle = rgba("#1c2430", 0.14);
    ctx.lineWidth = Math.max(1, px(1));
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(x - tw / 2 - padX, y - h / 2 - padY, tw + padX * 2, h + padY * 2, 6);
    } else {
      ctx.rect(x - tw / 2 - padX, y - h / 2 - padY, tw + padX * 2, h + padY * 2);
    }
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1c2430";
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  const playing = state?.status === "playing";
  const phase = state?.phase;
  if (playing && phase === "play") {
    const discX = sx(455);
    if (fx.dailyAlpha > 0.04) {
      pill(dailyCondition(state?.params), discX, sy(58), fx.dailyAlpha, 12);
    }
    if (fx.lessonAlpha > 0.04) {
      const ly = fx.dailyAlpha > 0.12 ? 80 : 64;
      pill(LESSON_TEXT, discX, sy(ly), fx.lessonAlpha, 13);
    }
    if (fx.statusAlpha > 0.05 && fx.statusText) {
      const pulse =
        reduced || fx.statusText !== "溝に乗っている"
          ? 1
          : 1 + 0.03 * Math.sin((Number(fx.clock) || 0) * Math.PI * 2 * 2.0);
      ctx.save();
      ctx.translate(discX, sy(300));
      ctx.scale(pulse, pulse);
      pill(fx.statusText, 0, 0, fx.statusAlpha, 14);
      ctx.restore();
    }
  }

  const over = overlayCenter(fx);
  const cx = clamp(over.x, 260, 620);
  const cy = clamp(over.y - JUDGE_BALLOON_OFFSET, 48, 210);
  const showBalloons = playing && phase === "reveal";
  for (let i = 0; showBalloons && i < fx.floats.length; i++) {
    const f = fx.floats[i];
    const age = Number(f.age) || 0;
    let pop = 1;
    if (!reduced) {
      if (age < 0.12) pop = 0.7 + 0.55 * (age / 0.12);
      else if (age < 0.22) pop = 1.25 - 0.25 * ((age - 0.12) / 0.1);
      else pop = 1;
    }
    const fade = Math.min(1, age / 0.08);
    const lift = reduced ? 0 : Math.min(8, age * 10);
    const row = f.kind === "grade" ? 0 : 22;
    const x = sx(cx);
    const y = sy(cy + row) - px(lift);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(pop, pop);
    ctx.globalAlpha = fade;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const size = f.kind === "grade" ? Math.max(16, px(20)) : Math.max(13, px(15));
    ctx.font = `700 ${size}px ${FONT}`;
    const tw = ctx.measureText(f.text).width;
    ctx.fillStyle = rgba("#f3eee4", 0.92);
    const padX = 8;
    const padY = 4;
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(-tw / 2 - padX, -size / 2 - padY, tw + padX * 2, size + padY * 2, 6);
    } else {
      ctx.rect(-tw / 2 - padX, -size / 2 - padY, tw + padX * 2, size + padY * 2);
    }
    ctx.fill();
    ctx.fillStyle = f.color || "#1c2430";
    ctx.fillText(f.text, 0, 0);
    ctx.restore();
  }
}
