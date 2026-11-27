/** 速さの灯と案内の文言。描画側だけの純関数で、エンジンは触らない。 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { pitchInst } from "../engine/constants.mjs";
import {
  LAMP_CLEAR,
  LAMP_CRANK_MIN,
  LAMP_RELEASE,
  lampCueFrom,
  lampCueText,
  lampSignal,
} from "../render/fx.mjs";

test("案内の文言は自然な日本語の短さ", () => {
  assert.equal(lampCueText("slow"), "もっと速く");
  assert.equal(lampCueText("fast"), "ゆっくり");
  assert.equal(lampCueText(""), "");
  assert.equal(lampCueText(null), "");
});

test("はっきり遅い・速いときだけ案内を出し、帯の近くでは出さない", () => {
  assert.equal(lampCueFrom(0), "slow");
  assert.equal(lampCueFrom(0.4), "slow");
  assert.equal(lampCueFrom(1 - LAMP_CLEAR - 0.001), "slow");
  assert.equal(lampCueFrom(1 - LAMP_CLEAR + 0.001), "");
  assert.equal(lampCueFrom(1), "");
  assert.equal(lampCueFrom(1 + LAMP_CLEAR - 0.001), "");
  assert.equal(lampCueFrom(1 + LAMP_CLEAR + 0.001), "fast");
  assert.equal(lampCueFrom(1.8), "fast");
});

test("案内はすぐ消さず、帯に近づいてから消える", () => {
  assert.equal(lampCueFrom(0.82, "slow"), "slow");
  assert.equal(lampCueFrom(1 - LAMP_RELEASE + 0.001, "slow"), "");
  assert.equal(lampCueFrom(1.18, "fast"), "fast");
  assert.equal(lampCueFrom(1 + LAMP_RELEASE - 0.001, "fast"), "");
  assert.equal(lampCueFrom(1, "slow"), "");
  assert.equal(lampCueFrom(1, "fast"), "");
});

test("回しているときは手の速さ、離しているときは皿の速さを見る", () => {
  const mid = 1.12;
  assert.equal(lampSignal({ omega: 0.4, left: { crankRate: 0 }, params: { rateMid: mid } }), 0.4);
  assert.ok(lampSignal({ omega: 0.4, left: { crankRate: LAMP_CRANK_MIN }, params: { rateMid: mid } }) === 0.4);
  const sig = lampSignal({ omega: 0.4, left: { crankRate: mid }, params: { rateMid: mid } });
  assert.ok(Math.abs(sig - 1) < 1e-12, sig);
  const slow = lampSignal({ omega: 1, left: { crankRate: mid * 0.4 }, params: { rateMid: mid } });
  assert.ok(Math.abs(slow - 0.4) < 1e-12, slow);
});

test("帯の中では灯が最も明るく、はっきり外れると消える", () => {
  assert.equal(pitchInst(1), 1);
  assert.equal(pitchInst(1.08), 1);
  assert.equal(pitchInst(0.92), 1);
  assert.equal(pitchInst(0), 0);
  assert.ok(pitchInst(1.3) === 0);
  const mid = pitchInst(1.15);
  assert.ok(mid > 0 && mid < 1, mid);
});
