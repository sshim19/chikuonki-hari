/** 書き下ろし曲のデータ検査: 音域、小節の拍の合計、切れ目が主音で終わる、プレイごとの選曲が重ならない、溝の長さに収まる。 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TUNES,
  parseChord,
  parseMelody,
  tuneScore,
  pickTunes,
  fitTune,
  recordProgram,
  programFor,
  reshuffleProgram,
  programSessionId,
  entryEvents,
  entryIndexAt,
  beatAtRadius,
  midiToHz,
  TEMPO_MIN_MUL,
  TEMPO_MAX_MUL,
} from "../engine/tunes.mjs";
import { createInitialState } from "../engine/sim.mjs";
import { seedString } from "../engine/constants.mjs";

function makeRand(seed) {
  let a = (Number(seed) >>> 0) || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test("曲は17曲あり、id と曲名が重ならない", () => {
  assert.equal(TUNES.length, 17);
  assert.equal(new Set(TUNES.map((t) => t.id)).size, TUNES.length);
  assert.equal(new Set(TUNES.map((t) => t.title)).size, TUNES.length);
  for (const t of TUNES) assert.ok(t.title.length >= 2 && t.title.length <= 12, t.title);
});

test("どの小節も拍子どおりの長さで、和音は小節の数だけある", () => {
  for (const t of TUNES) {
    const m = parseMelody(t);
    assert.equal(m.bars, t.chords.length, t.id);
    for (const b of m.barBeats) assert.ok(Math.abs(b - t.meter) < 1e-9, `${t.id} bar ${b}`);
    assert.ok(Math.abs(m.totalBeats - m.bars * t.meter) < 1e-9);
    assert.ok(m.totalBeats >= 24, `${t.id} too short`);
    for (const c of t.chords) for (const sub of String(c).split("+")) parseChord(sub);
  }
});

test("音域: 旋律は G3–E6、伴奏は C3–C6 に収まり、可聴の周波数", () => {
  for (const t of TUNES) {
    for (const ev of tuneScore(t).events) {
      if (ev.midi == null) {
        assert.ok(["kick", "snare", "hat", "rim"].includes(ev.part), `${t.id} ${ev.part}`);
        continue;
      }
      if (ev.part === "melody") assert.ok(ev.midi >= 55 && ev.midi <= 88, `${t.id} melody ${ev.midi}`);
      else assert.ok(ev.midi >= 36 && ev.midi <= 84, `${t.id} ${ev.part} ${ev.midi}`);
      assert.ok(ev.dur > 0 && ev.beat >= 0);
      const hz = midiToHz(ev.midi);
      assert.ok(hz > 60 && hz < 1400);
    }
  }
});

test("切れ目は旋律が主音（和音の根音）で終わる", () => {
  for (const t of TUNES) {
    const m = parseMelody(t);
    assert.ok(t.cuts.includes(m.bars), `${t.id} full length must be a cut`);
    for (const bars of t.cuts) {
      const endBeat = m.barBeats.slice(0, bars).reduce((s, b) => s + b, 0);
      const last = m.notes.filter((n) => n.beat < endBeat).pop();
      const tonic = parseChord(t.chords[t.chords.length - 1]).root;
      assert.equal(last.midi % 12, tonic, `${t.id} cut ${bars}`);
      assert.equal(parseChord(t.chords[bars - 1]).root, tonic, `${t.id} chord at cut ${bars}`);
    }
  }
});

test("溝の長さ（8〜16秒）に、速さの帯の中で収まり、余韻は短い", () => {
  for (const t of TUNES) {
    for (let sec = 8; sec <= 16; sec += 0.25) {
      const f = fitTune(t, sec);
      const mul = f.tempo / t.tempo;
      assert.ok(mul >= TEMPO_MIN_MUL - 1e-9 && mul <= TEMPO_MAX_MUL + 1e-9, `${t.id} ${sec}s mul ${mul}`);
      assert.ok(f.playSec <= sec + 1e-9, `${t.id} ${sec}s overruns`);
      assert.ok(sec - f.playSec <= 2.5, `${t.id} ${sec}s tail ${sec - f.playSec}`);
    }
  }
});

test("選曲は重ならず、同じ乱数なら再現でき、乱数が違えば並びが変わる", () => {
  const a = pickTunes(5, makeRand(1)).map((t) => t.id);
  const b = pickTunes(5, makeRand(1)).map((t) => t.id);
  assert.deepEqual(a, b);
  assert.equal(new Set(a).size, 5);
  const all = pickTunes(17, makeRand(2)).map((t) => t.id);
  assert.equal(all.length, 17);
  assert.equal(new Set(all).size, 17);
  assert.deepEqual([...all].sort(), [...TUNES.map((t) => t.id)].sort());
  const extra = pickTunes(20, makeRand(3)).map((t) => t.id);
  assert.equal(extra.length, 20);
  assert.equal(new Set(extra.slice(0, 17)).size, 17);
  const seen = new Set();
  for (let d = 1; d <= 30; d++) {
    seen.add(pickTunes(3, makeRand(d)).map((t) => t.id).join(","));
  }
  assert.ok(seen.size >= 15, "orders should vary");
  const c = pickTunes(5, makeRand(99)).map((t) => t.id);
  assert.notDeepEqual(c, pickTunes(5, makeRand(100)).map((t) => t.id));
});

test("盤の溝ごとに曲が割り当てられ、エンジンの状態は変わらない", () => {
  for (let d = 1; d <= 30; d++) {
    const seed = seedString(`2026-11-${String(d).padStart(2, "0")}`);
    const s = createInitialState({ seed, dateJst: `2026-11-${d}` });
    const before = JSON.stringify(s);
    const tunes = pickTunes(s.params.tracks.length, makeRand(d + 100));
    const prog = recordProgram(s.params, tunes);
    assert.equal(prog.length, s.params.tracks.length);
    assert.equal(new Set(prog.map((p) => p.tune.id)).size, prog.length);
    for (const p of prog) assert.ok(p.playSec <= p.trackSec + 1e-9);
    assert.deepEqual(recordProgram(s.params, tunes).map((p) => p.title), prog.map((p) => p.title));
    assert.equal(JSON.stringify(s), before);
  }
});

test("曲間は次の曲の前奏で埋まり、片面のあいだ音が途切れない", () => {
  for (let d = 1; d <= 30; d++) {
    const seed = seedString(`2026-11-${String(d).padStart(2, "0")}`);
    const s = createInitialState({ seed, dateJst: `2026-11-${d}` });
    const rate = s.params.playRate;
    const prog = recordProgram(s.params, pickTunes(s.params.tracks.length, makeRand(d + 200)));
    assert.ok(Math.abs(prog[0].startR - s.params.leadInR) < 1e-12);
    for (let i = 1; i < prog.length; i++) {
      assert.ok(Math.abs(prog[i].startR - prog[i - 1].endR) < 1e-12, "contiguous");
      assert.ok(prog[i].introSec >= 1.2 - 1e-9, "gap is played as intro");
    }
    // 片面の時間軸で、音が鳴っていない区間の最長
    const spans = [];
    for (const p of prog) {
      const t0 = (s.params.leadInR - p.r0) / rate;
      for (const ev of entryEvents(p)) {
        const a = t0 + (ev.beat * 60) / p.tempo;
        spans.push([a, a + (ev.dur * 60) / p.tempo]);
        assert.ok(ev.beat >= -p.introBeats - 1e-9 && ev.beat < p.beats);
      }
    }
    spans.sort((x, y) => x[0] - y[0]);
    let end = spans[0][0];
    let maxGap = 0;
    for (const [a, b] of spans) {
      maxGap = Math.max(maxGap, a - end);
      end = Math.max(end, b);
    }
    assert.ok(maxGap < 0.35, `${seed} silent ${maxGap.toFixed(2)}s`);
    // 半径からの索引: 曲間の真ん中は次の曲、拍は負
    for (let i = 1; i < prog.length; i++) {
      const mid = (prog[i].startR + prog[i].r0) / 2;
      assert.equal(entryIndexAt(prog, mid), i);
      assert.ok(beatAtRadius(prog[i], mid, rate) < 0);
    }
  }
});

test("第2弾の10曲は、ジャンルがすべて違い、打楽器か型どおりの伴奏を持つ", () => {
  const second = TUNES.slice(7);
  assert.equal(second.length, 10);
  assert.equal(new Set(second.map((t) => t.genre)).size, 10);
  assert.equal(new Set(TUNES.map((t) => t.accomp)).size >= 15, true);
  for (const t of second) {
    const parts = new Set(tuneScore(t).events.map((e) => e.part));
    assert.ok(parts.has("melody") && parts.has("bass") && (parts.has("chord") || parts.has("arp")), t.id);
  }
});

test("17曲から最大5曲を重ならずに選び、何度か遊ぶと全部が現れる", () => {
  const all = new Set();
  for (let i = 0; i < 120; i++) {
    const a = pickTunes(5, makeRand(1000 + i)).map((t) => t.id);
    assert.deepEqual(a, pickTunes(5, makeRand(1000 + i)).map((t) => t.id));
    assert.equal(new Set(a).size, 5);
    a.forEach((id) => all.add(id));
  }
  assert.equal(all.size, 17, "every tune appears within 120 shuffles");
  const s = createInitialState({ seed: seedString("2026-11-27"), dateJst: "2026-11-27" });
  const first = reshuffleProgram(s.params, makeRand(7)).map((p) => p.title);
  assert.deepEqual(programFor(s.params).map((p) => p.title), first);
  const sid = programSessionId();
  const second = reshuffleProgram(s.params, makeRand(8)).map((p) => p.title);
  assert.notDeepEqual(second, first);
  assert.ok(programSessionId() > sid);
  assert.deepEqual(programFor(s.params).map((p) => p.title), second);
});
