/**
 * Web Audio だけで鳴らす効果音。ファイルもライブラリも使わない。
 * エンジンは触らず、state の変化から鳴らす音を決める。洋間の、落ち着いた機械音にする。
 */

import * as constants from "../engine/constants.mjs";
import { midiToHz, tuneScore, entryEvents, entryIndexAt, beatAtRadius, programFor as programForParams, programSessionId, reshuffleProgram } from "../engine/tunes.mjs";

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
    music: null,
    voices: [],
    program: null,
    programKey: "",
    musicPos: null,
    lastCrackleAt: 0,
    lastCrankAt: 0,
  };
}

export function resetSfx(sfx) {
  if (!sfx) return;
  sfx.prev = null;
  sfx.lastCrankAt = 0;
  sfx.musicPos = null;
  sfx.program = null;
  sfx.programKey = "";
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
  if (!sfx.music) sfx.music = createMusicBus(ctx, sfx.master);
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
    sfx.music = null;
    sfx.voices = [];
    sfx.musicPos = null;
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
  releaseVoices(sfx, immediate ? 0.02 : 0.25);
  sfx.musicPos = null;
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
    sfx.rumbleSrc = null;
    sfx.rumbleFilter = null;
    sfx.rumbleGain = null;
    sfx.rumbleOsc = null;
    sfx.rumbleOscGain = null;
    sfx.grooveSrc = null;
    sfx.grooveFilter = null;
    sfx.grooveGain = null;
    if (sfx.music) {
      try {
        sfx.music.out.disconnect();
      } catch {
        /* ignore */
      }
    }
    sfx.music = null;
  }
}

function syncLoops(sfx, state) {
  if (!sfx.ctx || !sfx.master) return;
  const playing = state?.status === "playing";
  const phase = state?.phase;
  if (!playing || phase === "reveal" || phase === "place" || state?.ruined) {
    if (sfx.rumbleGain || sfx.voices.length) stopLoops(sfx, false);
    return;
  }

  ensureLoops(sfx);
  const t = sfx.ctx.currentTime;
  const omega = Number(state?.omega) || 0;
  const wind = Number(state?.left?.wind) || 0;
  const crankRate = Number(state?.left?.crankRate) || 0;
  const seated = !!state?.seated && (Number(state?.airborneT) || 0) <= 0;
  const inst = pitchInst(omega);

  const rumble = omega > 0.04 ? clamp(0.012 + omega * 0.03, 0, 0.055) * (0.55 + 0.45 * clamp(wind, 0, 1)) : 0;
  if (sfx.rumbleGain) sfx.rumbleGain.gain.setTargetAtTime(rumble, t, 0.12);
  if (sfx.rumbleFilter) {
    const thin = 90 + omega * 140 + wind * 80;
    sfx.rumbleFilter.frequency.setTargetAtTime(thin, t, 0.16);
  }
  if (sfx.rumbleOsc) sfx.rumbleOsc.frequency.setTargetAtTime(40 + omega * 28, t, 0.16);
  if (sfx.rumbleOscGain) sfx.rumbleOscGain.gain.setTargetAtTime(rumble * 0.45, t, 0.14);

  const groove = seated && omega > 0.05 ? 0.012 + inst * 0.012 : 0;
  if (sfx.grooveGain) sfx.grooveGain.gain.setTargetAtTime(groove, t, 0.1);
  if (sfx.grooveFilter) {
    sfx.grooveFilter.frequency.setTargetAtTime(900 + inst * 900, t, 0.14);
  }

  syncMusic(sfx, state, { t, omega, inst, seated });

  if (crankRate >= 0.18) playCrankTick(sfx, crankRate);
}

// ---- 曲（engine/tunes.mjs の書き下ろし曲）を盤の回転に合わせて鳴らす ----

const VOICE_GAIN = { melody: 0.15, bass: 0.085, chord: 0.028, arp: 0.03, kick: 0.16, snare: 0.07, hat: 0.022, rim: 0.05 };
const DRUMS = new Set(["kick", "snare", "hat", "rim"]);
const MAX_VOICES = 44;
const drumNoise = new WeakMap();

function drumNoiseBuffer(ctx) {
  let buf = drumNoise.get(ctx);
  if (buf) return buf;
  const len = Math.floor(ctx.sampleRate * 0.4);
  buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let a = 0x2545f491;
  for (let i = 0; i < len; i++) {
    a ^= a << 13;
    a ^= a >>> 17;
    a ^= a << 5;
    d[i] = ((a >>> 0) / 4294967296) * 2 - 1;
  }
  drumNoise.set(ctx, buf);
  return buf;
}

/** 打楽器（バスドラム・スネア・ハイハット・リム）。古い録音らしく軽く、帯域は同じ通り道を通る。 */
function startDrum(ctx, bus, { part, t0, rate = 1 }) {
  const g = ctx.createGain();
  const peak = VOICE_GAIN[part] ?? 0.04;
  const oscs = [];
  let len;
  if (part === "kick") {
    len = 0.16;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(210 * rate, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(30, 80 * rate), t0 + 0.12);
    o.connect(g);
    oscs.push({ o, mul: 1 });
  } else {
    len = part === "snare" ? 0.14 : part === "rim" ? 0.035 : 0.04;
    const src = ctx.createBufferSource();
    src.buffer = drumNoiseBuffer(ctx);
    const f = ctx.createBiquadFilter();
    f.type = part === "hat" ? "highpass" : "bandpass";
    f.frequency.value = part === "hat" ? 5200 : part === "rim" ? 2600 : 1700;
    f.Q.value = part === "rim" ? 4 : 0.8;
    src.connect(f);
    f.connect(g);
    oscs.push({ o: src, mul: 1 });
    if (part === "snare") {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.setValueAtTime(190 * rate, t0);
      const og = ctx.createGain();
      og.gain.value = 0.5;
      o.connect(og);
      og.connect(g);
      oscs.push({ o, mul: 1 });
    }
  }
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
  const stopAt = t0 + len + 0.02;
  g.connect(bus.input);
  for (const { o } of oscs) {
    o.start(t0);
    o.stop(stopAt);
  }
  return { oscs, gain: g, base: 0, stopAt, released: false, fixed: true };
}

/** 古いラッパ蓄音機らしい帯域の狭い音の通り道。 */
function createMusicBus(ctx, dest) {
  const input = ctx.createGain();
  input.gain.value = 1;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 170;
  hp.Q.value = 0.6;
  const horn = ctx.createBiquadFilter();
  horn.type = "peaking";
  horn.frequency.value = 1150;
  horn.Q.value = 0.9;
  horn.gain.value = 5;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 3300;
  lp.Q.value = 0.5;
  const lp2 = ctx.createBiquadFilter();
  lp2.type = "lowpass";
  lp2.frequency.value = 4200;
  lp2.Q.value = 0.4;
  const out = ctx.createGain();
  out.gain.value = 1;
  input.connect(hp);
  hp.connect(horn);
  horn.connect(lp);
  lp.connect(lp2);
  lp2.connect(out);
  out.connect(dest);
  return { input, hp, horn, lp, lp2, out };
}

/** 1音を鳴らす。rate は回転の比（音の高さに掛ける）。 */
function startVoice(ctx, bus, { midi, part, t0, dur, rate = 1, timbre }) {
  if (DRUMS.has(part)) return startDrum(ctx, bus, { part, t0, rate });
  const base = midiToHz(midi);
  const f = base * Math.max(0.05, rate);
  const g = ctx.createGain();
  const peak = VOICE_GAIN[part] ?? 0.05;
  const oscs = [];
  const add = (type, mul, level, detune = 0) => {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f * mul, t0);
    if (detune) o.detune.value = detune;
    const og = ctx.createGain();
    og.gain.value = level;
    o.connect(og);
    og.connect(g);
    oscs.push({ o, mul });
  };
  if (part === "melody" && timbre === "chip") {
    add("square", 1, 0.55);
    add("triangle", 1, 0.6);
  } else if (part === "arp") {
    add("square", 1, 0.5);
  } else if (part === "melody") {
    add("triangle", 1, 1);
    add("square", 1, 0.16, 6);
    add("sine", 2, 0.12);
  } else if (part === "bass") {
    add("triangle", 1, 1);
    add("sine", 2, 0.35);
  } else {
    add("sine", 1, 1);
    add("triangle", 1, 0.4, -5);
  }
  const atk = 0.012;
  const sus = part === "melody" ? 0.62 : 0.45;
  const rel = part === "melody" ? 0.09 : 0.07;
  const end = t0 + Math.max(0.06, dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + atk);
  g.gain.setTargetAtTime(peak * sus, t0 + atk, 0.12);
  g.gain.setTargetAtTime(0.0001, end, rel / 3);
  const stopAt = end + rel * 2.5 + 0.03;
  g.connect(bus.input);
  for (const { o } of oscs) {
    o.start(t0);
    o.stop(stopAt);
  }
  return { oscs, gain: g, base, stopAt, released: false };
}

function releaseVoice(v, t, tau) {
  if (!v || v.released) return;
  v.released = true;
  try {
    const gp = v.gain.gain;
    if (typeof gp.cancelAndHoldAtTime === "function") gp.cancelAndHoldAtTime(t);
    else {
      gp.cancelScheduledValues(t);
      gp.setValueAtTime(gp.value, t);
    }
    gp.linearRampToValueAtTime(0, t + tau);
    const stopAt = t + tau + 0.02;
    for (const { o } of v.oscs) {
      try {
        o.stop(stopAt);
      } catch {
        /* ignore */
      }
    }
    v.stopAt = Math.min(v.stopAt, stopAt);
  } catch {
    /* ignore */
  }
}

function releaseVoices(sfx, tau) {
  if (!sfx?.voices?.length) return;
  const t = sfx.ctx ? sfx.ctx.currentTime : 0;
  for (const v of sfx.voices) releaseVoice(v, t, tau);
}

function pruneVoices(sfx, t) {
  sfx.voices = sfx.voices.filter((v) => v.stopAt > t);
  while (sfx.voices.length > MAX_VOICES) releaseVoice(sfx.voices.shift(), t, 0.03);
}

function playCrackle(sfx, t, worn) {
  const peak = (0.025 + Math.random() * 0.045) * (worn ? 1.25 : 1);
  playNoiseBurst(sfx, { t0: t, dur: 0.006 + Math.random() * 0.006, peak, hp: 1600, lp: 6400, attack: 0.001 });
}

export { reshuffleProgram };

/** このプレイの曲の並び（溝ごとの曲・速さ）。音と描画が同じものを使う。 */
export function programFor(state) {
  return programForParams(state?.params);
}

/**
 * 盤の回転と針の状態から、いま曲のどこを鳴らすかを決める。
 * 再生位置は針の半径そのもの（溝を内側へ進むほど曲が進む）なので、
 * 皿が遅ければ曲も遅く低くなり、跳ねれば先へ飛び、上げれば止まる。
 */
function syncMusic(sfx, state, { t, omega, inst, seated }) {
  const ctx = sfx.ctx;
  const bus = sfx.music;
  if (!ctx || !bus) return;
  pruneVoices(sfx, t);
  const params = state?.params;
  const key = `${programSessionId()}|${params?.tracks?.length}|${params?.playRate}`;
  if (sfx.programKey !== key) {
    sfx.program = programFor(state);
    sfx.programKey = key;
    sfx.musicPos = null;
  }

  // 古い盤らしい揺れ。回転が帯から外れるほど大きくうねる。
  const depth = 0.0035 + (1 - inst) * 0.018;
  const wow = 1 + depth * Math.sin(t * 2 * Math.PI * 1.1) + 0.0015 * Math.sin(t * 2 * Math.PI * 6.3);
  const rate = Math.max(0.05, omega) * wow;
  bus.lp.frequency.setTargetAtTime(1500 + 1900 * inst, t, 0.12);
  for (const v of sfx.voices) {
    if (v.released || v.fixed) continue;
    for (const { o, mul } of v.oscs) o.frequency.setTargetAtTime(v.base * mul * rate, t, 0.03);
  }

  const playable = seated && omega > 0.15 && !state?.ruined;
  if (!playable) {
    if (sfx.voices.length) releaseVoices(sfx, 0.035);
    sfx.musicPos = null;
    return;
  }

  const worn = params?.wear === "worn";
  const gap = (worn ? 0.09 : 0.16) / Math.max(0.3, omega);
  if (t - (sfx.lastCrackleAt || 0) > gap * (0.3 + Math.random() * 1.7)) {
    sfx.lastCrackleAt = t;
    playCrackle(sfx, t, worn);
  }

  const rate0 = Number(params?.playRate) || 0;
  const radius = Number(state.radius);
  const ti = rate0 > 0 ? entryIndexAt(sfx.program || [], radius) : -1;
  const prog = ti >= 0 ? sfx.program[ti] : null;
  if (!prog) {
    sfx.musicPos = null; // 盤の終わり（ランアウト）。鳴っている音は自然に消える
    return;
  }
  const beat = beatAtRadius(prog, radius, rate0);
  const prev = sfx.musicPos;
  // 前の曲の終わりから次の曲の前奏へは、そのまま続ける（切らない）
  const flowsOn = prev && ti === prev.track + 1 && Math.abs(prev.radius - radius) < 0.004;
  let from;
  if (flowsOn) {
    from = -prog.introBeats - 1e-6;
  } else if (!prev || prev.track !== ti || beat < prev.beat - 1e-6 || beat - prev.beat > 1) {
    // 落とし直し・跳ね・位置替え。前の音は切って、新しい位置から鳴らす
    if (prev) releaseVoices(sfx, 0.05);
    from = beat - 0.12;
  } else {
    from = prev.beat;
  }
  sfx.musicPos = { track: ti, beat, radius };
  if (beat <= from) return;
  const secPerBeat = 60 / prog.tempo / Math.max(0.2, omega);
  for (const ev of entryEvents(prog)) {
    if (ev.beat >= beat) break;
    if (ev.beat < from) continue;
    const left = ev.dur - (beat - ev.beat);
    if (DRUMS.has(ev.part) ? beat - ev.beat > 0.15 : left <= 0.05) continue;
    const dur = Math.max(0.03, left) * secPerBeat * (ev.part === "melody" ? 0.95 : 1);
    sfx.voices.push(startVoice(ctx, bus, { midi: ev.midi, part: ev.part, t0: t + 0.005, dur, rate, timbre: prog.tune.timbre }));
  }
}

function offlineRig(len, sampleRate, crackle, clean = false) {
  const OAC = globalThis.OfflineAudioContext || globalThis.webkitOfflineAudioContext;
  const ctx = new OAC(1, Math.ceil(len * sampleRate), sampleRate);
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.knee.value = 12;
  comp.ratio.value = 2.8;
  comp.attack.value = 0.004;
  comp.release.value = 0.18;
  const master = ctx.createGain();
  master.gain.value = MASTER_GAIN * 1.6;
  master.connect(comp);
  comp.connect(ctx.destination);
  if (clean) {
    // 蓄音機の帯域を通さない、作曲そのものの確認用
    const input = ctx.createGain();
    input.connect(master);
    return { ctx, bus: { input } };
  }
  const bus = createMusicBus(ctx, master);
  bus.lp.frequency.value = 3400;

  // 溝のさーっという音と、ぷつぷつ
  const nb = ctx.createBuffer(1, Math.floor(sampleRate * len), sampleRate);
  const d = nb.getChannelData(0);
  let last = 0;
  let a = 0x9e3779b9;
  const rnd = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  let nextClick = 0.2;
  for (let i = 0; i < d.length; i++) {
    const white = rnd() * 2 - 1;
    last = last * 0.86 + white * 0.14;
    let v = last * 0.5;
    const ts = i / sampleRate;
    if (crackle && ts >= nextClick) {
      v += (rnd() < 0.5 ? -1 : 1) * (0.6 + rnd() * 1.4);
      nextClick = ts + 0.04 + rnd() * 0.28;
    }
    d[i] = v;
  }
  const src = ctx.createBufferSource();
  src.buffer = nb;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2400;
  bp.Q.value = 0.5;
  const ng = ctx.createGain();
  ng.gain.value = 0.03;
  src.connect(bp);
  bp.connect(ng);
  ng.connect(master);
  src.start(0);
  return { ctx, bus };
}

/**
 * 曲を理想の再生（回転ぴったり）で OfflineAudioContext に描き出す。試聴用。
 * @returns {Promise<AudioBuffer>}
 */
export function renderTuneOffline(tune, { sampleRate = 44100, tempo, bars, crackle = true, clean = false } = {}) {
  const score = tuneScore(tune);
  const tmp = tempo || tune.tempo;
  const beats = bars ? score.barBeats.slice(0, bars).reduce((s, b) => s + b, 0) : score.totalBeats;
  const spb = 60 / tmp;
  const lead = 0.8;
  const len = lead + beats * spb + 1.8;
  const { ctx, bus } = offlineRig(len, sampleRate, crackle, clean);
  for (const ev of score.events) {
    if (ev.beat >= beats) continue;
    const dur = ev.dur * spb * (ev.part === "melody" ? 0.95 : 1);
    startVoice(ctx, bus, { midi: ev.midi, part: ev.part, t0: lead + ev.beat * spb, dur, rate: 1, timbre: tune.timbre });
  }
  return ctx.startRendering();
}

/**
 * このプレイの盤の片面を、リードインで針を下ろして回転ぴったりのまま最後まで鳴らした音。
 * ゲームと同じ曲の並び・前奏・速さ。傷での跳ねは入れない。試聴用。
 * @returns {Promise<{ buffer: AudioBuffer, marks: { title: string, introAt: number, startAt: number, endAt: number }[] }>}
 */
export async function renderSessionOffline(state, { sampleRate = 44100, crackle = true } = {}) {
  const params = state?.params;
  const rate = Number(params?.playRate) || 1;
  const program = programFor(state);
  const lead = 0.4;
  const r00 = program.length ? program[0].startR : 0;
  const tOf = (r) => lead + (r00 - r) / rate;
  const endR = Math.min(...program.map((p) => p.endR), Number(params?.runOutR) || Infinity);
  const len = tOf(Number(params?.labelR) || endR) + 0.8;
  const { ctx, bus } = offlineRig(len, sampleRate, crackle);
  const marks = [];
  for (const p of program) {
    const spb = 60 / p.tempo;
    const t0 = tOf(p.r0);
    marks.push({ title: p.title, introAt: tOf(p.startR), startAt: t0, endAt: tOf(p.endR) });
    for (const ev of entryEvents(p)) {
      const dur = ev.dur * spb * (ev.part === "melody" ? 0.95 : 1);
      startVoice(ctx, bus, { midi: ev.midi, part: ev.part, t0: t0 + ev.beat * spb, dur, rate: 1, timbre: p.tune.timbre });
    }
  }
  const buffer = await ctx.startRendering();
  return { buffer, marks };
}

/**
 * state の差分を見て効果音を鳴らす。再生中の皿と曲は盤の回転に追従する。
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
