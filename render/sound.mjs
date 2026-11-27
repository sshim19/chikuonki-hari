/**
 * Web Audio だけで鳴らす効果音。ファイルもライブラリも使わない。
 * エンジンは触らず、state の変化から鳴らす音を決める。洋間の、落ち着いた機械音にする。
 */

import * as constants from "../engine/constants.mjs";

export const MUTE_KEY = constants.STORAGE_MUTED ?? "chikuonki-hari:muted";
const MASTER_GAIN = 0.34;
const PITCH_HALF = constants.PITCH_INNER ?? constants.PITCH_HALF ?? 0.08;
const PITCH_CUT = constants.PITCH_OUTER ?? constants.PITCH_CUT ?? 0.22;
const LIFT_CROSS = 0.35;

function readMuted(storage) {
  if (!storage) return false;
  try {
    const v = storage.getItem(MUTE_KEY);
    return v === "1" || v === "true";
  } catch {
    return false;
  }
}

function writeMuted(muted, storage) {
  if (!storage) return;
  try {
    storage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    /* ignore quota / private mode */
  }
}

export function loadMuted(storage = globalThis.localStorage) {
  return readMuted(storage);
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export function pitchInst(omega) {
  const o = Number(omega) || 0;
  const d = Math.abs(o - 1);
  if (d >= PITCH_CUT) return 0;
  if (d <= PITCH_HALF) return 1;
  return Math.max(0, 1 - (d - PITCH_HALF) / (PITCH_CUT - PITCH_HALF));
}

function currentTrackIndex(state) {
  const radius = Number(state?.radius);
  const tracks = Array.isArray(state?.params?.tracks) ? state.params.tracks : [];
  if (!Number.isFinite(radius)) return -1;
  for (let i = 0; i < tracks.length; i++) {
    const r0 = Number(tracks[i]?.r0);
    const r1 = Number(tracks[i]?.r1);
    if (!Number.isFinite(r0) || !Number.isFinite(r1)) continue;
    if (radius <= Math.max(r0, r1) && radius >= Math.min(r0, r1)) return i;
  }
  return -1;
}

function snapshot(state) {
  return {
    status: state?.status || "title",
    phase: state?.phase || "place",
    ruined: !!state?.ruined,
    seated: !!state?.seated,
    height: Number(state?.right?.height) || 0,
    airborneT: Number(state?.airborneT) || 0,
    skips: Number(state?.skips) || 0,
    scratchHit: Number(state?.scratchHit) || 0,
    hardDrops: Number(state?.hardDrops) || 0,
    gentleDrops: Number(state?.gentleDrops) || 0,
    seats: Number(state?.seats) || 0,
    runovers: Number(state?.runovers) || 0,
    omega: Number(state?.omega) || 0,
    crankRate: Number(state?.left?.crankRate) || 0,
    wind: Number(state?.left?.wind) || 0,
    grade: state?.grade ?? null,
    score: Math.max(0, Math.floor(Number(state?.score) || 0)),
    seed: state?.seed || state?.dateJst || "",
    track: currentTrackIndex(state),
  };
}

/**
 * 直前の snapshot と新しい state から、鳴らすべき単発の音を決める。純関数。
 * @returns {{ type: "place"|"gentle"|"hard"|"skip"|"lift"|"ruined"|"reveal", grade?: string, score?: number } | null}
 */
export function soundEvent(prev, state) {
  if (!state) return null;
  const now = snapshot(state);
  const before = prev || {
    status: "idle",
    phase: "none",
    ruined: false,
    seated: false,
    height: 0,
    airborneT: 0,
    skips: 0,
    scratchHit: 0,
    hardDrops: 0,
    gentleDrops: 0,
    seats: 0,
    runovers: 0,
  };

  if (!before.ruined && now.ruined) return { type: "ruined" };

  if (
    now.status === "playing" &&
    now.phase === "place" &&
    (before.status !== "playing" || before.phase !== "place")
  ) {
    return { type: "place" };
  }

  if (before.phase !== "reveal" && now.phase === "reveal") {
    return { type: "reveal", grade: now.grade || "early", score: now.score };
  }
  if (before.status !== "over" && now.status === "over" && before.phase !== "reveal") {
    return { type: "reveal", grade: now.grade || "early", score: now.score };
  }

  if (now.skips > (Number(before.skips) || 0) || now.scratchHit > (Number(before.scratchHit) || 0)) {
    return { type: "skip" };
  }
  if ((Number(before.airborneT) || 0) <= 0 && now.airborneT > 0) {
    return { type: "skip" };
  }

  if (now.hardDrops > (Number(before.hardDrops) || 0)) {
    return { type: "hard" };
  }
  if (now.gentleDrops > (Number(before.gentleDrops) || 0)) {
    return { type: "gentle" };
  }
  if (now.seats > (Number(before.seats) || 0)) {
    return { type: "gentle" };
  }

  if (
    now.status === "playing" &&
    now.phase === "play" &&
    (Number(before.height) || 0) >= LIFT_CROSS &&
    now.height < LIFT_CROSS
  ) {
    return { type: "lift" };
  }

  return null;
}

export function createSfx() {
  return {
    prev: null,
    muted: loadMuted(),
    ctx: null,
    master: null,
    compressor: null,
    noiseBuf: null,
    rumbleSrc: null,
    rumbleFilter: null,
    rumbleGain: null,
    rumbleOsc: null,
    rumbleOscGain: null,
    grooveSrc: null,
    grooveFilter: null,
    grooveGain: null,
    motifOsc: null,
    motifOsc2: null,
    motifFilter: null,
    motifGain: null,
    lastCrankAt: 0,
    lastMotifAt: 0,
    motifStep: 0,
    motifSeed: 0,
  };
}

export function resetSfx(sfx) {
  if (!sfx) return;
  sfx.prev = null;
  sfx.lastCrankAt = 0;
  sfx.lastMotifAt = 0;
  sfx.motifStep = 0;
  stopLoops(sfx, true);
}

function applyMuteGain(sfx, now) {
  if (!sfx?.master || !sfx.ctx) return;
  const g = sfx.master.gain;
  const t = now ?? sfx.ctx.currentTime;
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(sfx.muted ? 0 : MASTER_GAIN, t + 0.03);
}

export function setMuted(sfx, muted, storage = globalThis.localStorage) {
  if (!sfx) return;
  sfx.muted = !!muted;
  writeMuted(sfx.muted, storage);
  applyMuteGain(sfx);
}

export function isMuted(sfx) {
  return !!sfx?.muted;
}

/** 最初の操作で AudioContext を作り、iOS 向けに resume する。 */
export function unlockSfx(sfx) {
  if (!sfx) return;
  const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AC) return;
  try {
    if (!sfx.ctx) {
      const ctx = new AC();
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -16;
      compressor.knee.value = 12;
      compressor.ratio.value = 2.8;
      compressor.attack.value = 0.004;
      compressor.release.value = 0.18;
      const master = ctx.createGain();
      master.gain.value = sfx.muted ? 0 : MASTER_GAIN;
      master.connect(compressor);
      compressor.connect(ctx.destination);
      sfx.ctx = ctx;
      sfx.master = master;
      sfx.compressor = compressor;
    }
    if (sfx.ctx.state === "suspended") {
      const p = sfx.ctx.resume();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
  } catch {
    /* AudioContext unavailable */
  }
}

function noiseBuffer(sfx) {
  if (sfx.noiseBuf) return sfx.noiseBuf;
  const ctx = sfx.ctx;
  const len = Math.floor(ctx.sampleRate * 1.3);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = last * 0.86 + white * 0.14;
    data[i] = last * 2.0;
  }
  sfx.noiseBuf = buf;
  return buf;
}

function playTone(ctx, dest, { freq, type = "sine", t0, dur, peak, attack = 0.012, endFreq }) {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq && endFreq !== freq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), t0 + dur);
  }
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(dest);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function playNoiseBurst(sfx, { t0, dur, peak, hp = 400, lp = 1800, attack = 0.008 }) {
  const ctx = sfx.ctx;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(sfx);
  src.loop = false;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime((hp + lp) / 2, t0);
  filter.Q.value = 0.9;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter);
  filter.connect(g);
  g.connect(sfx.master);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

function playPlace(sfx) {
  const ctx = sfx.ctx;
  const t0 = ctx.currentTime;
  playNoiseBurst(sfx, { t0, dur: 0.16, peak: 0.16, hp: 200, lp: 900, attack: 0.006 });
  playTone(ctx, sfx.master, { freq: 180, type: "triangle", t0, dur: 0.18, peak: 0.07, endFreq: 110 });
}

function playGentle(sfx) {
  const ctx = sfx.ctx;
  const t0 = ctx.currentTime;
  playNoiseBurst(sfx, { t0, dur: 0.08, peak: 0.07, hp: 800, lp: 2200, attack: 0.004 });
  playTone(ctx, sfx.master, { freq: 520, type: "sine", t0, dur: 0.09, peak: 0.04, endFreq: 360 });
}

function playHard(sfx) {
  const ctx = sfx.ctx;
  const t0 = ctx.currentTime;
  playNoiseBurst(sfx, { t0, dur: 0.14, peak: 0.22, hp: 300, lp: 1600, attack: 0.003 });
  playTone(ctx, sfx.master, { freq: 220, type: "square", t0, dur: 0.11, peak: 0.05, endFreq: 90 });
}

function playSkip(sfx) {
  const ctx = sfx.ctx;
  const t0 = ctx.currentTime;
  playNoiseBurst(sfx, { t0, dur: 0.12, peak: 0.18, hp: 600, lp: 2800, attack: 0.003 });
  playTone(ctx, sfx.master, { freq: 340, type: "sawtooth", t0, dur: 0.08, peak: 0.035, endFreq: 180 });
}

function playLift(sfx) {
  const ctx = sfx.ctx;
  const t0 = ctx.currentTime;
  playTone(ctx, sfx.master, { freq: 420, type: "sine", t0, dur: 0.12, peak: 0.04, endFreq: 720 });
  playNoiseBurst(sfx, { t0, dur: 0.09, peak: 0.05, hp: 1200, lp: 3200, attack: 0.01 });
}

function playRuined(sfx) {
  const ctx = sfx.ctx;
  const t0 = ctx.currentTime;
  playNoiseBurst(sfx, { t0, dur: 0.28, peak: 0.28, hp: 80, lp: 500, attack: 0.004 });
  playTone(ctx, sfx.master, { freq: 90, type: "triangle", t0, dur: 0.26, peak: 0.12, endFreq: 48 });
}

function playReveal(sfx, ev) {
  const ctx = sfx.ctx;
  const t0 = ctx.currentTime;
  playNoiseBurst(sfx, { t0, dur: 0.22, peak: 0.08, hp: 200, lp: 800, attack: 0.02 });
  playTone(ctx, sfx.master, { freq: 140, type: "sine", t0, dur: 0.28, peak: 0.05, endFreq: 70 });
  const grade = ev?.grade || "early";
  if (grade === "lofty") {
    playTone(ctx, sfx.master, { freq: 392, type: "sine", t0: t0 + 0.08, dur: 0.42, peak: 0.09 });
    playTone(ctx, sfx.master, { freq: 494, type: "sine", t0: t0 + 0.2, dur: 0.5, peak: 0.07 });
  } else if (grade === "good") {
    playTone(ctx, sfx.master, { freq: 330, type: "sine", t0: t0 + 0.08, dur: 0.38, peak: 0.08 });
    playTone(ctx, sfx.master, { freq: 392, type: "sine", t0: t0 + 0.2, dur: 0.42, peak: 0.06 });
  } else if (grade === "close") {
    playTone(ctx, sfx.master, { freq: 196, type: "sine", t0: t0 + 0.06, dur: 0.32, peak: 0.07, endFreq: 160 });
  } else {
    playNoiseBurst(sfx, { t0: t0 + 0.04, dur: 0.08, peak: 0.06, hp: 400, lp: 900, attack: 0.004 });
  }
}

function playCrankTick(sfx, crankRate) {
  if (!sfx.ctx || !sfx.master) return;
  const now = sfx.ctx.currentTime;
  const interval = 1 / Math.max(2.4, Math.min(14, crankRate * 6.5));
  if (now - (sfx.lastCrankAt || 0) < interval) return;
  sfx.lastCrankAt = now;
  const peak = clamp(0.02 + crankRate * 0.018, 0.02, 0.08);
  playNoiseBurst(sfx, { t0: now, dur: 0.04, peak, hp: 500, lp: 1800, attack: 0.002 });
  playTone(sfx.ctx, sfx.master, {
    freq: 180 + crankRate * 20,
    type: "triangle",
    t0: now,
    dur: 0.035,
    peak: peak * 0.6,
  });
}

function hashSeed(s) {
  const str = String(s || "chikuonki-hari");
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function motifNotes(seed, track) {
  const base = [196, 220, 247, 262, 294, 330, 349, 392];
  let a = hashSeed(`${seed}:${track}`) || 1;
  const notes = [];
  const n = 3 + (a % 3);
  for (let i = 0; i < n; i++) {
    a = Math.imul(a ^ (a >>> 15), a | 1) >>> 0;
    notes.push(base[a % base.length]);
  }
  return notes;
}

function ensureLoops(sfx) {
  const ctx = sfx.ctx;
  if (!ctx || !sfx.master) return;
  if (!sfx.rumbleSrc) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(sfx);
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 180;
    filter.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(sfx.master);
    src.start();
    sfx.rumbleSrc = src;
    sfx.rumbleFilter = filter;
    sfx.rumbleGain = gain;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 52;
    const og = ctx.createGain();
    og.gain.value = 0;
    osc.connect(og);
    og.connect(sfx.master);
    osc.start();
    sfx.rumbleOsc = osc;
    sfx.rumbleOscGain = og;
  }
  if (!sfx.grooveSrc) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(sfx);
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1400;
    filter.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(sfx.master);
    src.start();
    sfx.grooveSrc = src;
    sfx.grooveFilter = filter;
    sfx.grooveGain = gain;
  }
  if (!sfx.motifOsc) {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = 262;
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = 392;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1800;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(sfx.master);
    osc.start();
    osc2.start();
    sfx.motifOsc = osc;
    sfx.motifOsc2 = osc2;
    sfx.motifFilter = filter;
    sfx.motifGain = gain;
  }
}

function stopLoops(sfx, immediate) {
  if (!sfx?.ctx) {
    sfx.rumbleSrc = null;
    sfx.rumbleFilter = null;
    sfx.rumbleGain = null;
    sfx.rumbleOsc = null;
    sfx.rumbleOscGain = null;
    sfx.grooveSrc = null;
    sfx.grooveFilter = null;
    sfx.grooveGain = null;
    sfx.motifOsc = null;
    sfx.motifOsc2 = null;
    sfx.motifFilter = null;
    sfx.motifGain = null;
    return;
  }
  const t = sfx.ctx.currentTime;
  const tau = immediate ? 0.02 : 0.18;
  const fade = (g) => {
    if (!g) return;
    try {
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0, t + tau);
    } catch {
      /* ignore */
    }
  };
  fade(sfx.rumbleGain);
  fade(sfx.rumbleOscGain);
  fade(sfx.grooveGain);
  fade(sfx.motifGain);
  if (immediate) {
    const stop = (node) => {
      if (!node) return;
      try {
        node.stop();
      } catch {
        /* already stopped */
      }
      try {
        node.disconnect();
      } catch {
        /* ignore */
      }
    };
    stop(sfx.rumbleSrc);
    stop(sfx.rumbleOsc);
    stop(sfx.grooveSrc);
    stop(sfx.motifOsc);
    stop(sfx.motifOsc2);
    sfx.rumbleSrc = null;
    sfx.rumbleFilter = null;
    sfx.rumbleGain = null;
    sfx.rumbleOsc = null;
    sfx.rumbleOscGain = null;
    sfx.grooveSrc = null;
    sfx.grooveFilter = null;
    sfx.grooveGain = null;
    sfx.motifOsc = null;
    sfx.motifOsc2 = null;
    sfx.motifFilter = null;
    sfx.motifGain = null;
  }
}

function syncLoops(sfx, state) {
  if (!sfx.ctx || !sfx.master) return;
  const playing = state?.status === "playing";
  const phase = state?.phase;
  if (!playing || phase === "reveal" || phase === "place" || state?.ruined) {
    if (sfx.rumbleGain || sfx.motifGain) stopLoops(sfx, false);
    return;
  }

  ensureLoops(sfx);
  const t = sfx.ctx.currentTime;
  const omega = Number(state?.omega) || 0;
  const wind = Number(state?.left?.wind) || 0;
  const crankRate = Number(state?.left?.crankRate) || 0;
  const seated = !!state?.seated && (Number(state?.airborneT) || 0) <= 0;
  const inst = pitchInst(omega);
  const track = currentTrackIndex(state);

  const rumble = omega > 0.04 ? clamp(0.012 + omega * 0.03, 0, 0.055) * (0.55 + 0.45 * clamp(wind, 0, 1)) : 0;
  if (sfx.rumbleGain) sfx.rumbleGain.gain.setTargetAtTime(rumble, t, 0.12);
  if (sfx.rumbleFilter) {
    const thin = 90 + omega * 140 + wind * 80;
    sfx.rumbleFilter.frequency.setTargetAtTime(thin, t, 0.16);
  }
  if (sfx.rumbleOsc) sfx.rumbleOsc.frequency.setTargetAtTime(40 + omega * 28, t, 0.16);
  if (sfx.rumbleOscGain) sfx.rumbleOscGain.gain.setTargetAtTime(rumble * 0.45, t, 0.14);

  const groove = seated && omega > 0.05 ? 0.018 + inst * 0.02 : 0;
  if (sfx.grooveGain) sfx.grooveGain.gain.setTargetAtTime(groove, t, 0.1);
  if (sfx.grooveFilter) {
    sfx.grooveFilter.frequency.setTargetAtTime(900 + inst * 900, t, 0.14);
  }

  const motifOn = seated && track >= 0 && omega > 0.08 && !state?.ruined;
  const motifGain = motifOn ? 0.018 + inst * 0.055 : 0;
  if (sfx.motifGain) sfx.motifGain.gain.setTargetAtTime(motifGain, t, 0.1);
  if (sfx.motifFilter) {
    const wobble = inst < 0.7 ? 700 + inst * 800 : 1600 + inst * 600;
    sfx.motifFilter.frequency.setTargetAtTime(wobble, t, 0.12);
  }

  if (motifOn && sfx.motifOsc) {
    const notes = motifNotes(state?.seed || state?.dateJst, track);
    const stepDur = 0.28 / Math.max(0.35, omega);
    if (t - (sfx.lastMotifAt || 0) >= stepDur) {
      sfx.lastMotifAt = t;
      sfx.motifStep = (sfx.motifStep + 1) % notes.length;
    }
    const freq = notes[sfx.motifStep % notes.length] * Math.max(0.4, omega);
    const detune = inst >= 0.85 ? 1 : 1 + (1 - inst) * 0.08 * Math.sin(t * 9);
    sfx.motifOsc.frequency.setTargetAtTime(freq * detune, t, 0.06);
    if (sfx.motifOsc2) sfx.motifOsc2.frequency.setTargetAtTime(freq * 1.5 * detune, t, 0.08);
  }

  if (crankRate >= 0.18) playCrankTick(sfx, crankRate);
}

/**
 * state の差分を見て効果音を鳴らす。再生中の皿と音型はループで追従する。
 * @param {object} sfx
 * @param {object} state
 */
export function syncSound(sfx, state) {
  if (!sfx) return null;
  const ev = soundEvent(sfx.prev, state);
  if (sfx.ctx && !sfx.muted) {
    try {
      syncLoops(sfx, state);
      if (ev?.type === "place") playPlace(sfx);
      else if (ev?.type === "gentle") playGentle(sfx);
      else if (ev?.type === "hard") playHard(sfx);
      else if (ev?.type === "skip") playSkip(sfx);
      else if (ev?.type === "lift") playLift(sfx);
      else if (ev?.type === "ruined") {
        stopLoops(sfx, false);
        playRuined(sfx);
      } else if (ev?.type === "reveal") {
        stopLoops(sfx, false);
        playReveal(sfx, ev);
      }
    } catch {
      /* audio graph failed; ignore */
    }
  } else if (ev?.type === "reveal" || ev?.type === "ruined") {
    stopLoops(sfx, false);
  }
  sfx.prev = snapshot(state);
  return ev;
}
