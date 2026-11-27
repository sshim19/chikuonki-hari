/**
 * 盤に刻まれた曲（すべてこのゲームのための書き下ろし）。
 * 得点や認識には使わない。音と曲名の表示だけが読む純粋なデータとヘルパー。
 *
 * 旋律は "音名/拍" をスペースで並べた文字列。r は休符。拍の単位は曲ごとの tempo の拍。
 * chords は小節ごとの和音名。cuts は「ここで終えても主音で終わる」小節数。
 */

export const TUNES = [
  {
    id: "tea-waltz",
    title: "紅茶とワルツ",
    style: "ワルツ",
    meter: 3,
    tempo: 168,
    cuts: [8, 12, 16],
    accomp: "waltz",
    melody:
      "E5/2 G5/1 | C6/2 G5/1 | A5/2 F5/1 | E5/3 | F5/2 A5/1 | G5/1 F5/1 D5/1 | B4/2 D5/1 | C5/3 | " +
      "A5/2 C6/1 | B5/2 G5/1 | F5/1 D5/1 B4/1 | C5/3 | E5/2 G5/1 | C6/2 A5/1 | D6/2 B5/1 | C6/3",
    chords: ["C", "C", "F", "C", "Dm", "G7", "G7", "C", "Am", "Em", "G7", "C", "C", "F", "G7", "C"],
  },
  {
    id: "tin-march",
    title: "ブリキの行進",
    style: "小さな行進曲",
    meter: 2,
    tempo: 116,
    cuts: [8, 12, 16],
    accomp: "march",
    melody:
      "G4/0.5 B4/0.5 D5/0.5 G5/0.5 | D5/1 B4/1 | C5/0.5 E5/0.5 D5/0.5 C5/0.5 | B4/1 G4/1 | " +
      "E5/0.5 E5/0.5 G5/0.5 E5/0.5 | D5/0.5 D5/0.5 B4/1 | A4/0.5 B4/0.5 C5/0.5 F#4/0.5 | G4/2 | " +
      "B4/0.5 E5/0.5 G5/0.75 F#5/0.25 | E5/0.5 C5/0.5 A4/1 | D5/0.5 F#5/0.5 A5/0.5 C6/0.5 | B5/1 G5/1 | " +
      "D5/0.5 G5/0.5 B5/0.5 G5/0.5 | E5/0.5 C6/0.5 G5/0.5 E5/0.5 | D5/0.5 F#5/0.5 A5/0.5 F#5/0.5 | G5/1 G4/1",
    chords: ["G", "G", "D7", "G", "C", "G", "D7", "G", "Em", "Am", "D7", "G", "G", "C", "D7", "G"],
  },
  {
    id: "cradle-moon",
    title: "ゆりかごと月",
    style: "子守歌（8分の6拍子）",
    meter: 6,
    tempo: 150,
    cuts: [4, 6, 8],
    accomp: "lullaby",
    melody:
      "C5/3 A4/1 C5/2 | Bb4/2 G4/1 C5/3 | G4/2 A4/1 Bb4/2 E4/1 | F4/6 | " +
      "F5/3 D5/2 Bb4/1 | C5/2 A4/1 F4/3 | E5/2 D5/1 Bb4/2 G4/1 | F4/6",
    chords: ["F", "C7", "C7", "F", "Bb", "F", "C7", "F"],
  },
  {
    id: "sunday-step",
    title: "日曜のステップ",
    style: "フォックストロット",
    meter: 4,
    tempo: 138,
    cuts: [4, 6, 8],
    accomp: "foxtrot",
    melody:
      "F#5/1.5 E5/0.5 D5/1 A4/1 | G5/1.5 F#5/0.5 E5/2 | B4/1 E5/1 G5/1.5 F#5/0.5 | A5/1 F#5/1 D5/2 | " +
      "B5/1.5 A5/0.5 G5/1 D5/1 | F#5/1.5 E5/0.5 D5/2 | A5/1 G5/1 E5/1 C#5/1 | D5/1 F#5/1 D6/2",
    chords: ["D", "A7", "Em", "D", "G", "D", "A7", "D"],
  },
  {
    id: "moon-boat",
    title: "月見の舟唄",
    style: "和の音階の舟唄",
    meter: 2,
    tempo: 104,
    cuts: [8, 12, 16],
    accomp: "koto",
    melody:
      "A4/0.5 Bb4/0.5 D5/1 | E5/1.5 F5/0.5 | E5/0.5 D5/0.5 Bb4/1 | A4/2 | " +
      "D5/0.5 E5/0.5 F5/1 | A5/1 F5/0.5 E5/0.5 | F5/0.5 E5/0.5 D5/0.5 Bb4/0.5 | A4/2 | " +
      "E5/1 E5/0.5 F5/0.5 | A5/1.5 Bb5/0.5 | A5/0.5 F5/0.5 E5/0.5 D5/0.5 | E5/0.5 Bb4/0.5 A4/1 | " +
      "D5/1 F5/1 | E5/0.5 F5/0.5 E5/0.5 D5/0.5 | Bb4/1 D5/0.5 Bb4/0.5 | A4/2",
    chords: ["A5", "A5", "D5", "A5", "D5", "A5", "D5", "A5", "A5", "A5", "D5", "A5", "D5", "A5", "D5", "A5"],
  },
  {
    id: "hydrangea-tango",
    title: "紫陽花タンゴ",
    style: "タンゴ",
    meter: 2,
    tempo: 120,
    cuts: [8, 12, 16],
    accomp: "tango",
    melody:
      "E5/0.75 F5/0.25 E5/0.5 C5/0.5 | A4/1.5 E5/0.5 | F5/0.75 G5/0.25 F5/0.5 D5/0.5 | B4/1.5 E5/0.5 | " +
      "A5/0.75 G#5/0.25 A5/0.5 E5/0.5 | F5/0.5 E5/0.5 D5/0.5 C5/0.5 | B4/0.75 C5/0.25 D5/0.5 G#4/0.5 | A4/2 | " +
      "C5/0.75 D5/0.25 C5/0.5 A4/0.5 | G5/1.5 E5/0.5 | G#4/0.5 B4/0.5 D5/0.5 B4/0.5 | A4/2 | " +
      "D5/0.75 E5/0.25 F5/0.5 A5/0.5 | E5/0.75 F5/0.25 E5/0.5 C5/0.5 | B4/0.75 C5/0.25 B4/0.5 G#4/0.5 | A5/0.5 E5/0.5 A4/1",
    chords: ["Am", "Am", "Dm", "E7", "Am", "Dm", "E7", "Am", "F", "C", "E7", "Am", "Dm", "Am", "E7", "Am"],
  },
  {
    id: "yarn-polka",
    title: "はずむ毛糸玉",
    style: "ポルカ",
    meter: 2,
    tempo: 126,
    cuts: [8, 12, 16],
    accomp: "march",
    melody:
      "A4/0.5 C5/0.5 F5/0.5 A5/0.5 | G5/0.25 A5/0.25 G5/0.5 F5/1 | E5/0.5 G5/0.5 Bb5/0.5 G5/0.5 | A5/0.5 F5/0.5 C5/1 | " +
      "D5/0.5 F5/0.5 Bb5/0.5 D6/0.5 | C6/0.25 Bb5/0.25 A5/0.5 F5/1 | G5/0.5 E5/0.5 C5/0.5 E5/0.5 | F5/0.5 C5/0.5 F4/1 | " +
      "D5/0.5 F5/0.5 A5/0.75 G5/0.25 | Bb4/0.5 D5/0.5 G5/1 | E5/0.25 F5/0.25 G5/0.5 Bb5/0.5 G5/0.5 | A5/1 F5/1 | " +
      "C6/0.5 A5/0.5 F5/0.5 A5/0.5 | D6/0.5 Bb5/0.5 F5/0.5 D5/0.5 | G5/0.25 F5/0.25 E5/0.5 G5/0.5 E5/0.5 | F5/0.5 C5/0.5 F5/1",
    chords: ["F", "F", "C7", "F", "Bb", "F", "C7", "F", "Dm", "Gm", "C7", "F", "F", "Bb", "C7", "F"],
  },
];

const NOTE_BASE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** "C#5" → MIDI 番号。 */
export function noteToMidi(name) {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(String(name).trim());
  if (!m) throw new Error(`bad note: ${name}`);
  let n = NOTE_BASE[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
  return 12 * (Number(m[3]) + 1) + n;
}

export function midiToHz(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const CHORD_SHAPES = { "": [0, 4, 7], m: [0, 3, 7], "7": [0, 4, 7, 10], "5": [0, 7, 12] };

/** 和音名 → { root (pitch class), tones: 半音のずれ }。 */
export function parseChord(name) {
  const m = /^([A-G])([#b]?)(m|7|5)?$/.exec(String(name).trim());
  if (!m) throw new Error(`bad chord: ${name}`);
  const root = (NOTE_BASE[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + 12) % 12;
  return { root, tones: CHORD_SHAPES[m[3] || ""] };
}

/** 旋律を小節ごとの音の列にする。 */
export function parseMelody(tune) {
  const bars = String(tune.melody)
    .split("|")
    .map((b) => b.trim())
    .filter(Boolean);
  const out = [];
  let beat = 0;
  const barBeats = [];
  for (const bar of bars) {
    let sum = 0;
    for (const tok of bar.split(/\s+/)) {
      const [p, d] = tok.split("/");
      const dur = Number(d);
      if (!(dur > 0)) throw new Error(`bad duration in ${tune.id}: ${tok}`);
      if (p !== "r") out.push({ beat: beat + sum, dur, midi: noteToMidi(p) });
      sum += dur;
    }
    barBeats.push(sum);
    beat += sum;
  }
  return { notes: out, barBeats, totalBeats: beat, bars: bars.length };
}

/** 伴奏の音（低音と和音）。型は曲ごと。 */
function accompaniment(tune) {
  const meter = tune.meter;
  const out = [];
  tune.chords.forEach((name, bar) => {
    const { root, tones } = parseChord(name);
    const b0 = bar * meter;
    const bassRoot = 48 + root; // C3 付近
    const bassFifth = bassRoot + 7 > 57 ? bassRoot - 5 : bassRoot + 7;
    const chord = tones.slice(0, 3).map((t) => 60 + ((root + t) % 12));
    const add = (beat, dur, midi, part) => out.push({ beat: b0 + beat, dur, midi, part });
    const stab = (beat, dur) => chord.forEach((m) => add(beat, dur, m, "chord"));
    switch (tune.accomp) {
      case "waltz":
        add(0, 1, bassRoot, "bass");
        stab(1, 0.6);
        stab(2, 0.6);
        break;
      case "march":
        add(0, 0.45, bassRoot, "bass");
        stab(0.5, 0.3);
        add(1, 0.45, bassFifth, "bass");
        stab(1.5, 0.3);
        break;
      case "lullaby":
        add(0, 2.8, bassRoot, "bass");
        add(3, 2.8, bassFifth, "bass");
        chord.forEach((m, i) => add(1 + i, 1.8, m, "chord"));
        chord.forEach((m, i) => add(4 + (i % 2), 1.5, m, "chord"));
        break;
      case "foxtrot":
        add(0, 0.9, bassRoot, "bass");
        stab(1, 0.45);
        add(2, 0.9, bassFifth, "bass");
        stab(3, 0.45);
        break;
      case "koto":
        add(0, 1.8, bassRoot - 12 < 40 ? bassRoot : bassRoot - 12, "bass");
        add(1, 0.5, 60 + root, "chord");
        add(1, 0.5, 60 + ((root + 7) % 12), "chord");
        add(1.5, 0.45, 72 + root > 79 ? 60 + root : 72 + root, "chord");
        break;
      case "tango":
        add(0, 0.7, bassRoot, "bass");
        add(0.75, 0.25, bassFifth, "bass");
        add(1, 0.45, bassRoot, "bass");
        add(1.5, 0.45, bassFifth, "bass");
        stab(0.5, 0.25);
        stab(1.5, 0.25);
        break;
      default:
        add(0, meter * 0.9, bassRoot, "bass");
    }
  });
  return out;
}

const cache = new Map();

/** 曲の全音（旋律・低音・和音）を拍の順に並べたもの。 */
export function tuneScore(tune) {
  if (cache.has(tune.id)) return cache.get(tune.id);
  const mel = parseMelody(tune);
  const events = [
    ...mel.notes.map((n) => ({ ...n, part: "melody" })),
    ...accompaniment(tune),
  ].sort((a, b) => a.beat - b.beat || (a.part === "melody" ? -1 : 1));
  const res = { tune, events, totalBeats: mel.totalBeats, barBeats: mel.barBeats, bars: mel.bars };
  cache.set(tune.id, res);
  return res;
}

function hashString(s) {
  let h = 2166136261;
  const str = String(s);
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * 日のシードから、盤の曲を n 曲選ぶ（重ならない）。エンジンの乱数列とは別のハッシュを使う。
 * @returns {object[]} TUNES の要素
 */
export function pickTunes(seed, n) {
  let a = hashString(`${seed || "chikuonki-hari"}:tunes`) || 1;
  const order = TUNES.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    const j = Math.floor(r * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const k = Math.max(0, Math.min(order.length, Math.floor(Number(n) || 0)));
  return order.slice(0, k).map((i) => TUNES[i]);
}

export const TEMPO_MIN_MUL = 0.8;
export const TEMPO_MAX_MUL = 1.3;
export const FIT_FILL = 0.94; // 曲の終わりの音が響く余白を残す

/**
 * 溝の長さ（omega=1 での秒）に合わせて、どこまで弾くかと速さを決める。
 * 主音で終わる切れ目のうち、速さが本来に一番近いものを選ぶ。どれも合わなければ、
 * 収まる一番長い切れ目を下限の速さで弾き、残りは余韻にする。
 * @returns {{ bars: number, beats: number, tempo: number, playSec: number }}
 */
export function fitTune(tune, trackSec) {
  const score = tuneScore(tune);
  const sec = Math.max(1, Number(trackSec) || 1);
  const cutBeats = (bars) => score.barBeats.slice(0, bars).reduce((s, b) => s + b, 0);
  let best = null;
  for (const bars of tune.cuts) {
    const beats = cutBeats(bars);
    const need = (beats * 60) / (sec * FIT_FILL);
    const mul = need / tune.tempo;
    if (mul < TEMPO_MIN_MUL || mul > TEMPO_MAX_MUL) continue;
    const off = Math.abs(Math.log(mul));
    if (!best || off < best.off) best = { bars, beats, tempo: need, off };
  }
  if (!best) {
    const slow = tune.tempo * TEMPO_MIN_MUL;
    let pick = null;
    for (const bars of tune.cuts) {
      const beats = cutBeats(bars);
      if ((beats * 60) / slow <= sec * FIT_FILL) pick = { bars, beats, tempo: slow };
    }
    if (!pick) {
      const bars = tune.cuts[0];
      const beats = cutBeats(bars);
      pick = { bars, beats, tempo: (beats * 60) / (sec * FIT_FILL) };
    }
    best = pick;
  }
  return {
    bars: best.bars,
    beats: best.beats,
    tempo: best.tempo,
    playSec: (best.beats * 60) / best.tempo,
  };
}

/**
 * その日の盤の曲の並び。各溝に曲と速さを割り当てる。
 * 曲間（とリードイン）は、次の曲の前奏として鳴らす区間にする（音の途切れをなくす）。
 * 各要素の startR〜endR が、その曲が鳴る半径の範囲（startR は前の曲が鳴り終わる位置）。
 * @param {string} seed
 * @param {{ tracks: {r0:number,r1:number}[], playRate: number, leadInR?: number }} params
 */
export function recordProgram(seed, params) {
  const tracks = Array.isArray(params?.tracks) ? params.tracks : [];
  const rate = Number(params?.playRate) || 0;
  const tunes = pickTunes(seed, tracks.length);
  const out = [];
  let prevEndR = Number(params?.leadInR);
  tracks.forEach((tr, i) => {
    const r0 = Math.max(tr.r0, tr.r1);
    const sec = rate > 0 ? Math.abs(tr.r0 - tr.r1) / rate : 10;
    const tune = tunes[i] || TUNES[i % TUNES.length];
    const fit = fitTune(tune, sec);
    if (!Number.isFinite(prevEndR) || prevEndR < r0) prevEndR = r0;
    const introSec = rate > 0 ? (prevEndR - r0) / rate : 0;
    const endR = r0 - fit.playSec * rate;
    out.push({
      index: i,
      tune,
      title: tune.title,
      trackSec: sec,
      ...fit,
      r0,
      startR: prevEndR,
      endR,
      introSec,
      introBeats: (introSec * fit.tempo) / 60,
    });
    prevEndR = endR;
  });
  return out;
}

const eventCache = new Map();

/**
 * 曲の音（前奏 + 本編）。前奏は 1小節目の伴奏を、1小節目の頭へ向けて負の拍に敷き詰めたもの。
 * 拍 0 が溝の頭（r0）。本編は切れ目（beats）まで。
 */
export function entryEvents(entry) {
  const key = `${entry.tune.id}|${entry.beats}|${Math.round(entry.introBeats * 1000)}`;
  if (eventCache.has(key)) return eventCache.get(key);
  const score = tuneScore(entry.tune);
  const meter = entry.tune.meter;
  const bar1 = score.events.filter((e) => e.part !== "melody" && e.beat < meter);
  const intro = [];
  for (let k = 1; k * meter - meter < entry.introBeats + meter; k++) {
    for (const e of bar1) {
      const b = e.beat - k * meter;
      if (b >= -entry.introBeats - 1e-9 && b < 0) intro.push({ ...e, beat: b, dur: Math.min(e.dur, -b), intro: true });
    }
  }
  // 小節の途中から始まる前奏の頭を、主音の低音でつなぐ（前の曲の終わりから間を空けない）
  if (entry.introBeats > 0.05) {
    const first = intro.reduce((m, e) => Math.min(m, e.beat), 0);
    const lead = first - -entry.introBeats;
    if (lead > 0.1) {
      const root = parseChord(entry.tune.chords[0]).root;
      intro.push({ beat: -entry.introBeats, dur: lead, midi: 48 + root, part: "bass", intro: true });
    }
  }
  const body = score.events.filter((e) => e.beat < entry.beats);
  const list = [...intro, ...body].sort((a, b) => a.beat - b.beat);
  eventCache.set(key, list);
  return list;
}

/** 半径から、いま鳴らす曲（前奏を含む）を探す。なければ -1。 */
export function entryIndexAt(program, radius) {
  for (let i = 0; i < program.length; i++) {
    const p = program[i];
    if (radius <= p.startR + 1e-9 && radius > p.endR) return i;
  }
  return -1;
}

/** 半径 → その曲の拍（溝の頭が 0、前奏は負）。 */
export function beatAtRadius(entry, radius, playRate) {
  return ((entry.r0 - radius) / playRate) * (entry.tempo / 60);
}

/** 溝の中の位置（omega=1 の秒）→ 曲の拍。 */
export function beatAt(fit, trackT) {
  return (Math.max(0, trackT) * fit.tempo) / 60;
}
