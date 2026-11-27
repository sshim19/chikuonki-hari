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
  {
    id: "spring-letter",
    title: "春を待つ手紙",
    style: "J-POPバラード",
    genre: "J-POP（バラード）",
    meter: 4,
    tempo: 92,
    cuts: [3, 4, 6],
    accomp: "ballad",
    melody:
      "A4/1 C5/1 F5/1.5 E5/0.5 | D5/1 F5/1 E5/1 G5/1 | A5/2 F5/2 | D6/1 C6/0.5 Bb5/0.5 A5/1.5 F5/0.5 | " +
      "A5/1 F5/0.5 D5/0.5 Bb5/1 G5/1 | E5/1 G5/0.5 E5/0.5 F5/2",
    chords: ["F", "Bb+C", "F", "Bb+F", "Dm+Gm", "C7+F"],
  },
  {
    id: "blue-bicycle",
    title: "青い自転車で",
    style: "アップテンポのJ-POP",
    genre: "J-POP（アップテンポ）",
    meter: 4,
    tempo: 132,
    cuts: [4, 6, 8],
    accomp: "pop8",
    melody:
      "B4/0.5 D5/0.5 G5/0.5 A5/0.5 B5/1 A5/0.5 G5/0.5 | F#5/1 A5/1 G5/1.5 E5/0.5 | E5/0.5 G5/0.5 C6/1 A5/0.5 F#5/0.5 D5/1 | G5/1.5 D5/0.5 G5/2 | " +
      "B5/0.5 B5/0.5 A5/0.5 G5/0.5 E5/1 G5/1 | A5/0.5 B5/0.5 A5/1 G5/2 | C6/1 B5/0.5 A5/0.5 A5/0.5 B5/0.5 C6/0.5 D6/0.5 | B5/1 A5/0.5 B5/0.5 G5/2",
    chords: ["G", "D+Em", "C+D", "G", "Em+C", "D+G", "C+D", "G"],
  },
  {
    id: "rusty-guitar",
    title: "錆びたギターと夜明け",
    style: "8ビートのロック",
    genre: "ロック",
    meter: 4,
    tempo: 144,
    cuts: [4, 6, 8],
    accomp: "rock8",
    melody:
      "E5/0.5 G5/0.5 A5/0.5 B5/1 A5/0.5 G5/0.5 E5/0.5 | D5/0.5 E5/0.5 G5/1 A5/1.5 G5/0.5 | E5/0.5 G5/0.5 E5/0.5 C5/0.5 D5/1 B4/0.5 D5/0.5 | E5/3 r/1 | " +
      "B5/0.5 B5/0.5 D6/0.5 B5/0.5 A5/1 F#5/1 | A5/0.5 C6/0.5 B5/0.5 A5/0.5 G5/0.5 A5/0.5 E5/1 | G5/0.5 G5/0.5 E5/0.5 G5/0.5 A5/0.5 B5/0.5 D6/1 | E6/2 B5/0.5 G5/0.5 E5/1",
    chords: ["E5", "G5+A5", "C5+D5", "E5", "G5+D5", "A5+E5", "C5+D5", "E5"],
  },
  {
    id: "rainy-shuffle",
    title: "雨の日のシャッフル",
    style: "ブルースのシャッフル",
    genre: "ブルース",
    meter: 4,
    tempo: 112,
    cuts: [4, 6, 8],
    accomp: "shuffle",
    melody:
      "E5/2_3 G5/1_3 A5/1 G5/2_3 E5/1_3 C5/1 | D5/2_3 F#5/1_3 A5/1 C6/1 A5/1 | A5/2_3 G5/1_3 E5/2_3 Eb5/1_3 D5/2_3 C5/1_3 A4/1 | A4/3 r/1 | " +
      "F#5/2_3 A5/1_3 C6/1 A5/2_3 F#5/1_3 D5/1 | E5/2_3 G#5/1_3 B5/1 A5/2 | D5/2_3 F#5/1_3 A5/1 G#5/2_3 B5/1_3 D6/1 | C6/2_3 A5/1_3 G5/2_3 E5/1_3 A5/2",
    chords: ["A7", "D7", "A7", "A7", "D7", "E7+A7", "D7+E7", "A7"],
  },
  {
    id: "attic-swing",
    title: "屋根裏のスウィング",
    style: "ジャズのスウィング",
    genre: "ジャズ",
    meter: 4,
    tempo: 132,
    cuts: [4, 6, 8],
    accomp: "swing",
    melody:
      "A4/2_3 C5/1_3 E5/2_3 F5/1_3 A5/1 G5/1 | F#5/1 A5/2_3 F#5/1_3 D5/1 C5/1 | Bb4/2_3 D5/1_3 F5/1 E5/2_3 G5/1_3 Bb5/1 | A5/1 G5/2_3 E5/1_3 F5/2 | " +
      "C6/2_3 B5/1_3 A5/2_3 G5/1_3 F#5/1 A5/1 | G5/2_3 Bb5/1_3 E5/1 F5/2 | D5/2_3 F5/1_3 A5/2_3 G5/1_3 Bb5/1 E5/1 | F5/1 A5/2_3 C6/1_3 A5/1 F5/1",
    chords: ["Fmaj7", "D7", "Gm7+C7", "Fmaj7", "Am7+D7", "C7+F", "Gm7+C7", "F"],
  },
  {
    id: "seabreeze-bossa",
    title: "潮風のボサノバ",
    style: "ボサノバ",
    genre: "ボサノバ",
    meter: 4,
    tempo: 128,
    cuts: [4, 6, 8],
    accomp: "bossa",
    melody:
      "E5/1.5 G5/0.5 B5/1 A5/0.5 G5/0.5 | C5/1.5 E5/0.5 A5/1.5 G5/0.5 | F5/1 A5/0.5 F5/0.5 D5/1 B4/1 | C5/1.5 E5/0.5 C5/2 | " +
      "A5/1.5 C6/0.5 E6/1 C6/1 | Ab5/1 F5/0.5 Ab5/0.5 G5/1 C5/1 | F5/0.5 E5/0.5 D5/0.5 F5/0.5 B4/1 D5/1 | E5/1.5 D5/0.5 C5/2",
    chords: ["Cmaj7", "Am7", "Dm7+G7", "Cmaj7", "Fmaj7", "Fm+Cmaj7", "Dm7+G7", "Cmaj7"],
  },
  {
    id: "tram-ska",
    title: "跳ねる路面電車",
    style: "スカ",
    genre: "スカ",
    meter: 4,
    tempo: 150,
    cuts: [4, 6, 8],
    accomp: "ska",
    melody:
      "F#5/0.5 A5/0.5 r/0.5 F#5/0.5 D5/1 A4/1 | B4/0.5 D5/0.5 F#5/1 G5/0.5 B5/0.5 D6/1 | C#6/1 B5/0.5 A5/0.5 E5/1 C#5/1 | D5/1.5 F#5/0.5 D5/1 r/1 | " +
      "G5/0.5 G5/0.5 B5/0.5 G5/0.5 D5/1 B4/1 | E5/0.5 A5/0.5 C#6/1 D6/2 | B5/0.5 G5/0.5 E5/1 C#5/0.5 E5/0.5 A5/1 | F#5/1 E5/0.5 F#5/0.5 D5/2",
    chords: ["D", "Bm+G", "A", "D", "G", "A+D", "Em+A", "D"],
  },
  {
    id: "mirrorball",
    title: "ミラーボールの午後",
    style: "ディスコ・ファンク",
    genre: "ディスコ／ファンク",
    meter: 4,
    tempo: 120,
    cuts: [4, 6, 8],
    accomp: "disco",
    melody:
      "A5/0.5 r/0.5 A5/0.5 G5/0.5 E5/0.5 G5/1 A5/0.5 | F5/0.5 A5/0.5 C6/1 A5/0.5 F5/0.5 D5/1 | E5/0.5 G5/0.5 B5/1 A5/0.5 F5/0.5 D5/1 | E5/0.5 G5/0.5 A5/3 | " +
      "C6/0.5 A5/0.5 F5/0.5 A5/0.5 C6/1 E6/1 | D6/0.5 B5/0.5 G5/1 A5/2 | F5/0.5 F5/0.5 A5/1 G5/0.5 G5/0.5 B5/1 | C6/1 B5/0.5 G5/0.5 A5/2",
    chords: ["Am7", "Dm7", "Em7+Dm7", "Am7", "Fmaj7", "Em7+Am7", "Dm7+Em7", "Am7"],
  },
  {
    id: "harbor-light",
    title: "港の灯",
    style: "演歌（ヨナ抜き短音階）",
    genre: "演歌",
    meter: 4,
    tempo: 84,
    cuts: [3, 4, 6],
    accomp: "enka",
    melody:
      "E5/1.5 F5/0.25 E5/0.25 C5/1 A4/1 | F5/1 A5/0.5 F5/0.5 E5/1.5 B4/0.5 | C5/0.5 B4/0.5 A4/3 | A5/1 F5/0.5 E5/0.5 C5/1 A4/1 | " +
      "C6/1 A5/0.5 F5/0.5 E5/0.75 F5/0.25 E5/0.5 B4/0.5 | C5/1 B4/0.5 C5/0.5 A4/2",
    chords: ["Am", "Dm+E7", "Am", "Dm+Am", "F+E7", "Am"],
  },
  {
    id: "pico-quest",
    title: "ピコピコ冒険記",
    style: "ゲーム音楽（チップチューン）",
    genre: "チップチューン",
    meter: 4,
    tempo: 150,
    cuts: [4, 6, 8],
    accomp: "chip",
    timbre: "chip",
    melody:
      "C5/0.5 E5/0.5 G5/0.5 C6/0.5 B5/0.5 G5/0.5 E5/1 | A5/0.75 A5/0.25 C6/0.5 A5/0.5 E5/1 A4/1 | F5/0.5 A5/0.5 C6/1 B5/0.5 A5/0.5 G5/0.5 D5/0.5 | E5/0.5 G5/0.5 C6/1 C5/2 | " +
      "A5/0.25 G5/0.25 A5/0.5 C6/0.5 A5/0.5 F5/1 C5/1 | B5/0.5 D6/0.5 B5/0.5 G5/0.5 C6/2 | E6/0.5 D6/0.5 C6/0.5 A5/0.5 B5/0.5 G5/0.5 D5/1 | C6/0.5 G5/0.5 E5/0.5 G5/0.5 C6/2",
    chords: ["C", "Am", "F+G", "C", "F", "G+C", "Am+G", "C"],
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

const CHORD_SHAPES = {
  "": [0, 4, 7],
  m: [0, 3, 7],
  "7": [0, 4, 7, 10],
  "5": [0, 7, 12],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
};

/** 和音名 → { root (pitch class), tones: 半音のずれ }。"+" で区切った小節は最後の和音。 */
export function parseChord(name) {
  const parts = String(name).split("+");
  if (parts.length > 1) return parseChord(parts[parts.length - 1]);
  const m = /^([A-G])([#b]?)(maj7|m7|m|7|5)?$/.exec(String(name).trim());
  if (!m) throw new Error(`bad chord: ${name}`);
  const root = (NOTE_BASE[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + 12) % 12;
  return { root, tones: CHORD_SHAPES[m[3] || ""] };
}

/** 小節の和音の列（"Bb+C" は小節を等分して前半 Bb、後半 C）。 */
export function barChords(name) {
  return String(name)
    .split("+")
    .map((n) => parseChord(n));
}

/** 旋律を小節ごとの音の列にする。拍は 0.5 のほか、"2_3" のような分数（3連・はねるリズム）も書ける。 */
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
      const dur = String(d).includes("_") ? Number(d.split("_")[0]) / Number(d.split("_")[1]) : Number(d);
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
    const subs = barChords(name);
    const { root, tones } = subs[0];
    const chordAt = (beat) => subs[Math.min(subs.length - 1, Math.floor((beat / meter) * subs.length + 1e-9))];
    const bn = (beat, semi) => {
      let m = 48 + chordAt(beat).root + semi;
      while (m > 62) m -= 12;
      return m;
    };
    const B = (beat, dur, semi = 0) => out.push({ beat: b0 + beat, dur, midi: bn(beat, semi), part: "bass" });
    const C = (beat, dur, full = false) => {
      const c = chordAt(beat);
      const ts = full ? c.tones.filter((t) => t < 12) : c.tones.slice(0, 3);
      ts.forEach((t) => out.push({ beat: b0 + beat, dur, midi: 60 + ((c.root + t) % 12), part: "chord" }));
    };
    const third = (beat) => chordAt(beat).tones[1];
    const D = (beat, kind, dur = 0.1) => out.push({ beat: b0 + beat, dur, midi: null, part: kind });
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
      case "ballad":
        for (const h of [0, 2]) {
          B(h, 1.9);
          const c = chordAt(h);
          [0, 7, 12, c.tones[1] + 12].forEach((t, k) => {
            out.push({ beat: b0 + h + k * 0.5, dur: 0.9, midi: 60 + ((c.root + t) % 12) + (t >= 12 ? 12 : 0) - 12, part: "chord" });
          });
        }
        D(0, "kick");
        D(2, "snare");
        break;
      case "pop8":
        for (let k = 0; k < 8; k++) B(k * 0.5, 0.4, k === 7 ? 12 : 0);
        C(0, 0.9);
        C(1.5, 0.4);
        C(2.5, 0.9);
        [0, 1.5, 2].forEach((b) => D(b, "kick"));
        [1, 3].forEach((b) => D(b, "snare"));
        for (let k = 0; k < 8; k++) D(k * 0.5, "hat");
        break;
      case "rock8":
        for (let k = 0; k < 8; k++) B(k * 0.5, 0.42);
        for (let k = 0; k < 4; k++) C(k, 0.45);
        [0, 2, 2.5].forEach((b) => D(b, "kick"));
        [1, 3].forEach((b) => D(b, "snare"));
        for (let k = 0; k < 8; k++) D(k * 0.5, "hat");
        break;
      case "shuffle":
        for (let k = 0; k < 4; k++) {
          const semi = [0, 7, 9, 7][k];
          B(k, 0.62, semi);
          B(k + 2 / 3, 0.3, semi);
        }
        C(1, 0.3, true);
        C(3, 0.3, true);
        [0, 2].forEach((b) => D(b, "kick"));
        [1, 3].forEach((b) => D(b, "snare"));
        for (let k = 0; k < 4; k++) {
          D(k, "hat");
          D(k + 2 / 3, "hat");
        }
        break;
      case "swing":
        for (let k = 0; k < 4; k++) {
          const semi = [0, third(k), 7, 9][k];
          B(k, 0.9, semi);
        }
        C(1, 0.4, true);
        C(2 + 2 / 3, 0.3, true);
        D(0, "kick");
        [0, 1, 1 + 2 / 3, 2, 3, 3 + 2 / 3].forEach((b) => D(b, "hat"));
        D(3 + 2 / 3, "rim");
        break;
      case "bossa":
        B(0, 1.4);
        B(1.5, 0.45, 7);
        B(2, 1.4);
        B(3.5, 0.45, 7);
        [0, 1.5, 3].forEach((b) => C(b, 0.6, true));
        [0, 2].forEach((b) => D(b, "kick"));
        [0, 1.5, 3, 2.5].forEach((b) => D(b, "rim"));
        for (let k = 0; k < 8; k++) D(k * 0.5, "hat");
        break;
      case "ska":
        for (let k = 0; k < 4; k++) B(k, 0.85, [0, third(k), 7, third(k)][k]);
        for (let k = 0; k < 4; k++) C(k + 0.5, 0.25);
        [0, 2].forEach((b) => D(b, "kick"));
        [1, 3].forEach((b) => D(b, "snare"));
        for (let k = 0; k < 4; k++) D(k + 0.5, "hat");
        break;
      case "disco":
        for (let k = 0; k < 8; k++) B(k * 0.5, 0.35, k % 2 ? 12 : 0);
        [0.75, 1.5, 2.75, 3.5].forEach((b) => C(b, 0.2, true));
        for (let k = 0; k < 4; k++) D(k, "kick");
        [1, 3].forEach((b) => D(b, "snare"));
        for (let k = 0; k < 4; k++) D(k + 0.5, "hat");
        break;
      case "enka":
        for (const h of [0, 2]) {
          B(h, 0.9);
          B(h + 1, 0.9, 7);
          const c = chordAt(h);
          [0, c.tones[1], 7, c.tones[1]].forEach((t, k) => {
            out.push({ beat: b0 + h + k * 0.5, dur: 0.45, midi: 60 + ((c.root + t) % 12), part: "chord" });
          });
        }
        D(0, "kick");
        D(2, "kick");
        break;
      case "chip":
        for (let k = 0; k < 8; k++) B(k * 0.5, 0.4, k % 2 ? 12 : 0);
        for (let k = 0; k < 16; k++) {
          const c = chordAt(k * 0.25);
          const t = [0, c.tones[1], 7, 12][k % 4];
          out.push({ beat: b0 + k * 0.25, dur: 0.2, midi: 72 + ((c.root + t) % 12) - (t === 12 ? 0 : 0), part: "arp" });
        }
        [0, 2].forEach((b) => D(b, "kick"));
        [1, 3].forEach((b) => D(b, "snare"));
        for (let k = 0; k < 8; k++) D(k * 0.5, "hat", 0.05);
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

/**
 * 17曲をランダムに並べ、先頭から n 曲を返す（n 曲までは重ならない。使い切ったらまた並べ替える）。
 * 得点の乱数列には触らない。既定の乱数は Math.random。検査用に rand を渡せる。
 * @param {number} n
 * @param {() => number} [rand]
 * @returns {object[]} TUNES の要素
 */
export function pickTunes(n, rand = Math.random) {
  const want = Math.max(0, Math.floor(Number(n) || 0));
  const roll = typeof rand === "function" ? rand : Math.random;
  const out = [];
  while (out.length < want) {
    const order = TUNES.slice();
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(roll() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    out.push(...order.slice(0, want - out.length));
  }
  return out;
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
 * 盤の曲の並び。各溝に曲と速さを割り当てる。
 * 曲間（とリードイン）は、次の曲の前奏として鳴らす区間にする（音の途切れをなくす）。
 * 各要素の startR〜endR が、その曲が鳴る半径の範囲（startR は前の曲が鳴り終わる位置）。
 * tunes を省略したときは、その場でランダムに選ぶ（プレイの共有には programFor / reshuffleProgram を使う）。
 * @param {{ tracks: {r0:number,r1:number}[], playRate: number, leadInR?: number }} params
 * @param {object[]} [tunes]
 */
export function recordProgram(params, tunes) {
  const tracks = Array.isArray(params?.tracks) ? params.tracks : [];
  const rate = Number(params?.playRate) || 0;
  const chosen = Array.isArray(tunes) && tunes.length ? tunes : pickTunes(tracks.length);
  const out = [];
  let prevEndR = Number(params?.leadInR);
  tracks.forEach((tr, i) => {
    const r0 = Math.max(tr.r0, tr.r1);
    const sec = rate > 0 ? Math.abs(tr.r0 - tr.r1) / rate : 10;
    const tune = chosen[i] || TUNES[i % TUNES.length];
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

function paramsKey(params) {
  const tracks = Array.isArray(params?.tracks) ? params.tracks : [];
  return `${tracks.map((t) => `${t.r0}:${t.r1}`).join(",")}|${params?.playRate}|${params?.leadInR}`;
}

let sessionId = 0;
let sessionProgram = null;
let sessionParamsKey = "";

/** いまのプレイで共有する曲順の番号。音と描画のキャッシュ合わせに使う。 */
export function programSessionId() {
  return sessionId;
}

/**
 * 新しいプレイ用に、17曲から溝の数だけ重ならないようランダムに選び直す。
 * タイトルと最初のプレイは同じ並びのままにし、もう一度遊ぶときだけ呼び出す。
 */
export function reshuffleProgram(params, rand = Math.random) {
  const tracks = Array.isArray(params?.tracks) ? params.tracks : [];
  sessionProgram = recordProgram(params, pickTunes(tracks.length, rand));
  sessionParamsKey = paramsKey(params);
  sessionId += 1;
  return sessionProgram;
}

/** いまのプレイの曲の並び。まだ無ければ新しく選ぶ。音と描画が同じものを使う。 */
export function programFor(params) {
  const key = paramsKey(params);
  if (!sessionProgram || sessionParamsKey !== key) reshuffleProgram(params);
  return sessionProgram;
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
      const root = barChords(entry.tune.chords[0])[0].root;
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
