/**
 * 洋間・キャビネット・ラッパ・盤・溝・傷・針・ハンドル・左右の域・縮小図。
 * 844×390 論理座標。Y は下向き。カメラは描画側だけが持つ。画像アセットは使わない。
 */

import * as constants from "../engine/constants.mjs";
import { drawFx, revealZoom } from "./fx.mjs";

export const VIEW_W = constants.VIEW_W ?? 844;
export const VIEW_H = constants.VIEW_H ?? 390;

export const LEFT_X0 = constants.LEFT_X0 ?? 0;
export const LEFT_X1 = constants.LEFT_X1 ?? 400;
export const LEFT_Y0 = constants.LEFT_Y0 ?? 44;
export const LEFT_Y1 = constants.LEFT_Y1 ?? 390;

export const RIGHT_X0 = constants.RIGHT_X0 ?? 444;
export const RIGHT_X1 = constants.RIGHT_X1 ?? 844;
export const RIGHT_Y0 = constants.RIGHT_Y0 ?? 44;
export const RIGHT_Y1 = constants.RIGHT_Y1 ?? 390;
export const RIGHT_EDGE_SLACK = constants.RIGHT_EDGE_SLACK ?? 24;

export const HANDLE_CX = constants.HANDLE_CX ?? constants.CRANK_CX ?? 188;
export const HANDLE_CY = constants.HANDLE_CY ?? constants.CRANK_CY ?? 268;
export const HANDLE_R = constants.HANDLE_VISUAL_R ?? constants.HANDLE_R ?? constants.CRANK_VISUAL_R ?? 110;

export const LIFT_CX = constants.LIFT_CX ?? constants.NEEDLE_CX ?? 648;
export const LIFT_CY = constants.LIFT_CY ?? constants.NEEDLE_CY ?? 268;
export const LIFT_W = constants.LIFT_W ?? constants.NEEDLE_GROOVE_W ?? 56;
export const LIFT_H = constants.LIFT_H ?? constants.NEEDLE_GROOVE_H ?? 200;
export const LIFT_Y0 = constants.LIFT_Y0 ?? constants.HEIGHT_Y0 ?? (LIFT_CY - LIFT_H / 2);
export const LIFT_Y1 = constants.LIFT_Y1 ?? (LIFT_CY + LIFT_H / 2);

export const RADIUS_X0 = constants.RADIUS_X0 ?? 548;
export const RADIUS_X1 = constants.RADIUS_X1 ?? 748;
export const RADIUS_OUTER = constants.RADIUS_OUTER ?? constants.RADIUS_OUT ?? 0.98;
export const RADIUS_INNER = constants.RADIUS_INNER ?? constants.RADIUS_IN ?? 0.22;

export const DISC_CX = constants.DISC_CX ?? 455;
export const DISC_CY = constants.DISC_CY ?? 192;
export const DISC_R = constants.DISC_R ?? 104;
export const ARM_ANG = constants.ARM_ANG ?? 0.32;

export const MINIMAP = { x: 16, y: 50, w: 100, h: 118 };
export const THUMB_GUIDE_R = 22; // 直径 44wu

const WALL_A = "#e8dcc8";
const WALL_B = "#d4c4a8";
const FLOOR_A = "#5a3e2a";
const FLOOR_B = "#3f2a1c";
const CAB_A = "#6b4a32";
const CAB_B = "#4a3224";
const HORN_A = "#c4a060";
const HORN_B = "#a88448";
const DISC = "#1a1814";
const GROOVE = "#2e2c28";
const SCRATCH = "#d8d0c4";
const LABEL = "#7a2c28";
const CREAM = "#f3eee4";
const ARM = "#2a2824";
const METAL = "#8a8c90";
const INK = "#1c2430";
const HUD_BG = "#f3eee4";
const FONT = `"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif`;

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, Number(n) || 0));
}

function clamp01(n) {
  return clamp(n, 0, 1);
}

function rgba(hex, a) {
  const n = parseInt(String(hex || "#ffffff").replace("#", ""), 16);
  if (!Number.isFinite(n)) return `rgba(255, 255, 255, ${a})`;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export function syncCanvasSize(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const cssW = Math.max(1, canvas.clientWidth || VIEW_W);
  const cssH = Math.max(1, canvas.clientHeight || VIEW_H);
  const w = Math.round(cssW * dpr);
  const h = Math.round(cssH * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  return { cssW, cssH, dpr };
}

/**
 * 高さに合わせて 844×390 を伸ばし、幅が足りなければ contain する。
 * 余った部分は同じ壁色で埋める。
 */
export function makeView(cssW, cssH) {
  let scale = cssH / VIEW_H;
  if (VIEW_W * scale > cssW + 0.5) scale = cssW / VIEW_W;
  const drawW = VIEW_W * scale;
  const drawH = VIEW_H * scale;
  const ox = (cssW - drawW) / 2;
  const oy = (cssH - drawH) / 2;
  return {
    scale,
    ox,
    oy,
    drawW,
    drawH,
    cssW,
    cssH,
    sx(x) {
      return ox + x * scale;
    },
    sy(y) {
      return oy + y * scale;
    },
    px(wu) {
      return wu * scale;
    },
    worldX(cssX) {
      return (cssX - ox) / scale;
    },
    worldY(cssY) {
      return (cssY - oy) / scale;
    },
  };
}

/**
 * クライアント座標をキャンバス論理座標（0..844, 0..390, Y 下向き）へ。
 * @returns {{ x: number, y: number }}
 */
export function clientToLogical(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const cssW = canvas.clientWidth || rect.width || VIEW_W;
  const cssH = canvas.clientHeight || rect.height || VIEW_H;
  const view = makeView(cssW, cssH);
  const cssX = ((clientX - rect.left) / (rect.width || 1)) * cssW;
  const cssY = ((clientY - rect.top) / (rect.height || 1)) * cssH;
  return { x: view.worldX(cssX), y: view.worldY(cssY) };
}

export function inLeftZone(x, y) {
  return x >= LEFT_X0 && x <= LEFT_X1 && y >= LEFT_Y0 && y <= LEFT_Y1;
}

export function inRightZone(x, y, slack = 0) {
  return (
    x >= RIGHT_X0 - slack &&
    x <= RIGHT_X1 + slack &&
    y >= RIGHT_Y0 - slack &&
    y <= RIGHT_Y1 + slack
  );
}

function tracksOf(state) {
  return Array.isArray(state?.params?.tracks) ? state.params.tracks : [];
}

function scratchesOf(state) {
  return Array.isArray(state?.params?.scratches) ? state.params.scratches : [];
}

function labelROf(state) {
  const r = Number(state?.params?.labelR);
  return Number.isFinite(r) && r > 0 ? r : 0.34;
}

function wearOf(state) {
  return state?.params?.wear || "normal";
}

function fillWall(ctx, view) {
  ctx.fillStyle = WALL_A;
  ctx.fillRect(0, 0, view.cssW, view.cssH);
  const x = view.sx(0);
  const y = view.sy(0);
  const w = view.px(VIEW_W);
  const h = view.px(VIEW_H);
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, WALL_A);
  g.addColorStop(0.72, WALL_B);
  g.addColorStop(1, WALL_B);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

function drawWindow(ctx, view) {
  const x = view.sx(704);
  const y = view.sy(22);
  const w = view.px(124);
  const h = view.px(128);
  ctx.save();
  ctx.fillStyle = rgba("#cfc3a8", 0.85);
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, view.px(4));
    ctx.fill();
  } else {
    ctx.fillRect(x, y, w, h);
  }
  ctx.fillStyle = rgba("#dce6dc", 0.7);
  const pad = view.px(8);
  const mw = view.px(4);
  const paneW = (w - pad * 2 - mw) / 2;
  const paneH = (h - pad * 2 - mw) / 2;
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      ctx.fillRect(x + pad + i * (paneW + mw), y + pad + j * (paneH + mw), paneW, paneH);
    }
  }
  ctx.strokeStyle = rgba("#6b4a32", 0.45);
  ctx.lineWidth = Math.max(1, view.px(2));
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

function drawFloor(ctx, view) {
  const x = view.sx(0);
  const y = view.sy(300);
  const w = view.px(VIEW_W);
  const h = view.px(90);
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, rgba(FLOOR_A, 0.15));
  g.addColorStop(0.28, FLOOR_A);
  g.addColorStop(1, FLOOR_B);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = rgba("#2a1c14", 0.2);
  ctx.beginPath();
  ctx.ellipse(view.sx(430), view.sy(352), view.px(210), view.px(22), 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHorn(ctx, view, fx, reduced) {
  const sway = reduced ? 0 : Number(fx?.hornSway) || 0;
  const nx = view.sx(400);
  const ny = view.sy(200);
  ctx.save();
  ctx.translate(nx, ny);
  ctx.rotate(-0.55 + sway);
  const flare = ctx.createLinearGradient(view.px(-20), 0, view.px(-150), view.px(-90));
  flare.addColorStop(0, HORN_B);
  flare.addColorStop(0.5, HORN_A);
  flare.addColorStop(1, "#d8c07a");
  ctx.fillStyle = flare;
  ctx.beginPath();
  ctx.moveTo(view.px(8), view.px(-6));
  ctx.quadraticCurveTo(view.px(-40), view.px(-30), view.px(-90), view.px(-70));
  ctx.quadraticCurveTo(view.px(-130), view.px(-110), view.px(-70), view.px(-128));
  ctx.quadraticCurveTo(view.px(-10), view.px(-120), view.px(18), view.px(-20));
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = rgba("#7a5e30", 0.55);
  ctx.lineWidth = Math.max(1, view.px(1.4));
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(view.px(-78), view.px(-96), view.px(46), view.px(28), -0.4, 0, Math.PI * 2);
  ctx.fillStyle = rgba("#efe0b0", reduced ? 0.18 : 0.32);
  ctx.fill();
  ctx.strokeStyle = rgba("#8a6a38", 0.7);
  ctx.lineWidth = Math.max(1.2, view.px(2));
  ctx.stroke();
  ctx.fillStyle = HORN_B;
  ctx.beginPath();
  ctx.moveTo(view.px(8), view.px(-8));
  ctx.lineTo(view.px(36), view.px(10));
  ctx.lineTo(view.px(30), view.px(18));
  ctx.lineTo(view.px(4), view.px(4));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCabinet(ctx, view) {
  const x = view.sx(292);
  const y = view.sy(248);
  const w = view.px(330);
  const h = view.px(132);
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, CAB_A);
  g.addColorStop(0.4, "#5c3f2b");
  g.addColorStop(1, CAB_B);
  ctx.save();
  ctx.fillStyle = g;
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, view.px(6));
    ctx.fill();
  } else {
    ctx.fillRect(x, y, w, h);
  }
  ctx.fillStyle = rgba("#3a281c", 0.35);
  ctx.fillRect(x, y, w, view.px(10));
  ctx.fillStyle = rgba("#8a6244", 0.45);
  ctx.fillRect(x + view.px(10), y + view.px(16), w - view.px(20), view.px(3));
  ctx.strokeStyle = rgba("#2a1c14", 0.4);
  ctx.lineWidth = Math.max(1, view.px(1.2));
  ctx.strokeRect(x + view.px(8), y + view.px(22), w - view.px(16), h - view.px(32));
  ctx.restore();
}

function drawSpringBox(ctx, view, state) {
  const wind = clamp01(state?.left?.wind);
  const x = view.sx(400);
  const y = view.sy(308);
  const w = view.px(70);
  const h = view.px(26);
  ctx.save();
  ctx.fillStyle = "#3a2a1c";
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, view.px(4));
    ctx.fill();
  } else {
    ctx.fillRect(x, y, w, h);
  }
  ctx.fillStyle = rgba("#2a1c14", 0.9);
  ctx.fillRect(x + view.px(5), y + view.px(5), w - view.px(10), h - view.px(10));
  ctx.fillStyle = "#c4a060";
  const fw = (w - view.px(10)) * wind;
  ctx.fillRect(x + view.px(5), y + view.px(5), fw, h - view.px(10));
  ctx.strokeStyle = rgba(METAL, 0.8);
  ctx.lineWidth = Math.max(1, view.px(1.2));
  ctx.strokeRect(x, y, w, h);
  ctx.beginPath();
  ctx.arc(x + w + view.px(6), y + h / 2, view.px(6), 0, Math.PI * 2);
  ctx.fillStyle = HORN_B;
  ctx.fill();
  ctx.restore();
}

function drawHandle(ctx, view, state, fx) {
  const cx = view.sx(HANDLE_CX);
  const cy = view.sy(HANDLE_CY);
  const r = view.px(HANDLE_R);
  const ang = Number(fx?.crankAngle) || 0;
  const omega = Number(state?.omega) || 0;
  const rateMid = Number(state?.params?.rateMid) || 1.6;
  const ratio = rateMid > 0 ? (Number(state?.left?.crankRate) || 0) / rateMid : omega;
  const inBand = Math.abs(omega - 1) <= 0.08 || Math.abs(ratio - 1) <= 0.08;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.25, r * 0.1, cx, cy, r);
  g.addColorStop(0, "#7a5a40");
  g.addColorStop(0.7, CAB_B);
  g.addColorStop(1, "#2e2016");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = Math.max(2, view.px(4));
  ctx.strokeStyle = inBand ? rgba(HORN_A, 0.95) : rgba(METAL, 0.7);
  ctx.stroke();

  // 速さの帯。数値は出さない
  ctx.beginPath();
  ctx.arc(cx, cy, r - view.px(7), -Math.PI * 0.75, -Math.PI * 0.25);
  ctx.strokeStyle = rgba(CREAM, 0.28);
  ctx.lineWidth = Math.max(3, view.px(5));
  ctx.lineCap = "butt";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r - view.px(7), -Math.PI * 0.58, -Math.PI * 0.42);
  ctx.strokeStyle = inBand ? rgba(HORN_A, 0.95) : rgba(HORN_A, 0.55);
  ctx.lineWidth = Math.max(3.5, view.px(6));
  ctx.stroke();
  const pip = -Math.PI * 0.75 + clamp(ratio, 0, 2) * (Math.PI * 0.25);
  ctx.beginPath();
  const pr = r - view.px(7);
  ctx.arc(cx + Math.cos(pip) * pr, cy + Math.sin(pip) * pr, view.px(5), 0, Math.PI * 2);
  ctx.fillStyle = inBand ? HORN_A : CREAM;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(1, view.px(1));
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, view.px(22), 0, Math.PI * 2);
  ctx.fillStyle = "#3a2a1c";
  ctx.fill();
  ctx.strokeStyle = METAL;
  ctx.lineWidth = Math.max(1.2, view.px(2));
  ctx.stroke();

  ctx.translate(cx, cy);
  ctx.rotate(ang);
  ctx.fillStyle = METAL;
  ctx.fillRect(-view.px(6), -view.px(8), view.px(12), view.px(78));
  ctx.beginPath();
  ctx.arc(0, view.px(82), view.px(14), 0, Math.PI * 2);
  ctx.fillStyle = "#3a3430";
  ctx.fill();
  ctx.strokeStyle = METAL;
  ctx.lineWidth = Math.max(1.2, view.px(2));
  ctx.stroke();
  ctx.restore();
}

function discPoint(cx, cy, radius, ang, rScale) {
  const rr = radius * rScale;
  return { x: cx + Math.cos(ang) * rr, y: cy + Math.sin(ang) * rr };
}

function drawDiscBody(ctx, cx, cy, r, state, fx, reduced, opts = {}) {
  const spin = reduced || opts.still ? 0 : Number(fx?.platterAngle) || 0;
  const wear = wearOf(state);
  const labelR = labelROf(state);
  const tracks = tracksOf(state);
  const scratches = scratchesOf(state);
  const shine = wear === "clean" ? 0.22 : wear === "worn" ? 0.08 : 0.14;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
  ctx.fillStyle = "#2a2620";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = DISC;
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r - 0.5, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(cx, cy);
  ctx.rotate(spin);

  const grooveCount = 22;
  for (let i = 1; i <= grooveCount; i++) {
    const rr = (labelR + (1 - labelR) * (i / grooveCount)) * r;
    ctx.beginPath();
    ctx.arc(0, 0, rr, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(GROOVE, 0.55 + (i % 2) * 0.2);
    ctx.lineWidth = i % 3 === 0 ? 1.4 : 1;
    ctx.stroke();
  }

  for (const tr of tracks) {
    const r0 = Number(tr?.r0);
    const r1 = Number(tr?.r1);
    if (!Number.isFinite(r0) || !Number.isFinite(r1)) continue;
    const inner = Math.min(r0, r1) * r;
    const outer = Math.max(r0, r1) * r;
    ctx.beginPath();
    ctx.arc(0, 0, (inner + outer) / 2, 0, Math.PI * 2);
    ctx.strokeStyle = rgba("#3a3732", 0.7);
    ctx.lineWidth = Math.max(2, outer - inner);
    ctx.stroke();
  }

  if (!reduced && !opts.still) {
    ctx.rotate(-spin);
    const hg = ctx.createLinearGradient(-r, -r, r, r);
    hg.addColorStop(0, rgba("#ffffff", 0));
    hg.addColorStop(0.45, rgba("#ffffff", shine));
    hg.addColorStop(0.55, rgba("#ffffff", 0));
    hg.addColorStop(1, rgba("#ffffff", 0));
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.rotate(spin);
  }

  // 傷はクリップ内・盤座標で、はっきり描く。縮小図では線を少し太くする。
  const smallDisc = !!opts.still || r < 90;
  for (let i = 0; i < scratches.length; i++) {
    const sc = scratches[i];
    const sr = Number(sc?.r);
    const sw = (Number(sc?.w) || 0.014) * r;
    if (!Number.isFinite(sr)) continue;
    const a0 = 0.7 + i * 1.7;
    ctx.save();
    ctx.rotate(a0);
    ctx.strokeStyle = SCRATCH;
    ctx.lineWidth = Math.max(smallDisc ? 3.4 : 2.2, sw * (smallDisc ? 1.7 : 1.15));
    ctx.lineCap = "round";
    ctx.beginPath();
    const rad = sr * r;
    const span = smallDisc ? 0.34 : 0.22;
    ctx.arc(0, 0, rad, -span, span);
    ctx.stroke();
    ctx.strokeStyle = rgba("#f4efe6", 0.95);
    ctx.lineWidth = Math.max(smallDisc ? 1.8 : 1.2, sw * (smallDisc ? 0.7 : 0.45));
    ctx.beginPath();
    const tick = smallDisc ? 9 : 7;
    ctx.moveTo(rad - tick, 0);
    ctx.lineTo(rad + tick, 0);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // レーベル。文字は出さない
  const lr = labelR * r;
  ctx.beginPath();
  ctx.arc(cx, cy, lr, 0, Math.PI * 2);
  ctx.fillStyle = LABEL;
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.035);
  ctx.strokeStyle = CREAM;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(3, lr * 0.18), 0, Math.PI * 2);
  ctx.fillStyle = "#2a1816";
  ctx.fill();

  const glow = Number(fx?.seatedGlow) || 0;
  const radius = Number(state?.radius);
  if (glow > 0.05 && Number.isFinite(radius) && !opts.noGlow) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius * r, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(HORN_A, 0.25 + 0.5 * glow);
    ctx.lineWidth = 2.4;
    ctx.stroke();
  }
  ctx.restore();
}

function needlePose(state, fx) {
  const radius = clamp(Number(state?.radius) || 0.96, 0.08, 1);
  const height = clamp01(state?.right?.height);
  const lift = (1 - height) * 16;
  const tipX = DISC_CX + DISC_R * radius * Math.cos(ARM_ANG);
  const tipY = DISC_CY + DISC_R * radius * Math.sin(ARM_ANG) - lift;
  const pivotX = DISC_CX + (DISC_R + 46) * Math.cos(ARM_ANG);
  const pivotY = DISC_CY + (DISC_R + 46) * Math.sin(ARM_ANG) - lift * 0.35;
  return { tipX, tipY, pivotX, pivotY, radius, height, lift };
}

function drawNeedle(ctx, view, state, fx) {
  const p = needlePose(state, fx);
  const x0 = view.sx(p.pivotX);
  const y0 = view.sy(p.pivotY);
  const x1 = view.sx(p.tipX);
  const y1 = view.sy(p.tipY);
  ctx.save();
  if (p.lift > 1) {
    ctx.beginPath();
    ctx.arc(view.sx(p.tipX), view.sy(p.tipY + p.lift), view.px(3.2), 0, Math.PI * 2);
    ctx.fillStyle = rgba("#000000", 0.22);
    ctx.fill();
  }
  ctx.strokeStyle = ARM;
  ctx.lineWidth = Math.max(3, view.px(5));
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.strokeStyle = METAL;
  ctx.lineWidth = Math.max(1.6, view.px(2.2));
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x0, y0, view.px(8), 0, Math.PI * 2);
  ctx.fillStyle = "#3a3834";
  ctx.fill();
  ctx.strokeStyle = METAL;
  ctx.lineWidth = Math.max(1, view.px(1.4));
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x1, y1, view.px(3.4), 0, Math.PI * 2);
  ctx.fillStyle = p.height >= 0.88 ? "#d8d0c4" : METAL;
  ctx.fill();
  ctx.strokeStyle = ARM;
  ctx.lineWidth = Math.max(1, view.px(1.1));
  ctx.stroke();
  ctx.restore();
}

function drawLift(ctx, view, state) {
  const x = view.sx(LIFT_CX - LIFT_W / 2);
  const y = view.sy(LIFT_Y0);
  const w = view.px(LIFT_W);
  const h = view.px(LIFT_H);
  const height = clamp01(state?.right?.height);
  ctx.save();
  ctx.fillStyle = rgba("#2a221c", 0.55);
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, view.px(10));
    ctx.fill();
  } else {
    ctx.fillRect(x, y, w, h);
  }
  ctx.strokeStyle = rgba(METAL, 0.7);
  ctx.lineWidth = Math.max(1.4, view.px(2));
  ctx.stroke();
  ctx.fillStyle = rgba(CREAM, 0.12);
  ctx.fillRect(x + w * 0.42, y + view.px(6), w * 0.16, h - view.px(12));

  if (height <= 0.3) {
    const rx = view.sx(RADIUS_X0);
    const rw = view.px(RADIUS_X1 - RADIUS_X0);
    const ry = view.sy(LIFT_Y0 + height * LIFT_H);
    ctx.strokeStyle = rgba(HORN_A, 0.7);
    ctx.lineWidth = Math.max(2, view.px(2.4));
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + rw, ry);
    ctx.stroke();
  }

  const cy = view.sy(LIFT_Y0 + height * LIFT_H);
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x + view.px(4), cy - view.px(12), w - view.px(8), view.px(24), 4);
  } else {
    ctx.rect(x + view.px(4), cy - view.px(12), w - view.px(8), view.px(24));
  }
  ctx.fillStyle = METAL;
  ctx.fill();
  ctx.strokeStyle = ARM;
  ctx.lineWidth = Math.max(1, view.px(1));
  ctx.stroke();
  ctx.restore();
}

function drawThumbGuide(ctx, view, x, y, active, hint) {
  const r = view.px(THUMB_GUIDE_R);
  ctx.save();
  ctx.beginPath();
  ctx.arc(view.sx(x), view.sy(y), r, 0, Math.PI * 2);
  ctx.fillStyle = rgba(HUD_BG, active ? 0.42 : hint ? 0.34 : 0.22);
  ctx.strokeStyle = rgba(INK, active ? 0.55 : 0.32);
  ctx.lineWidth = Math.max(1.2, view.px(1.6));
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(view.sx(x), view.sy(y), r * 0.42, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(INK, 0.22);
  ctx.lineWidth = Math.max(1, view.px(1));
  ctx.stroke();
  ctx.restore();
}

function leftThumbPos(left) {
  if (left?.active && Number.isFinite(left.x) && Number.isFinite(left.y)) {
    const dx = left.x - HANDLE_CX;
    const dy = left.y - HANDLE_CY;
    const d = Math.hypot(dx, dy) || 1;
    const r = clamp(d, 36, HANDLE_R - 10);
    return { x: HANDLE_CX + (dx / d) * r, y: HANDLE_CY + (dy / d) * r, active: true };
  }
  return { x: HANDLE_CX + 62, y: HANDLE_CY + 36, active: false };
}

function rightThumbPos(right, state) {
  const height = clamp01(state?.right?.height);
  if (right?.active && Number.isFinite(right.x) && Number.isFinite(right.y)) {
    const raised = height <= 0.3;
    return {
      x: clamp(right.x, raised ? RADIUS_X0 : LIFT_CX - LIFT_W / 2, raised ? RADIUS_X1 : LIFT_CX + LIFT_W / 2),
      y: clamp(right.y, LIFT_Y0, LIFT_Y1),
      active: true,
    };
  }
  return { x: LIFT_CX, y: LIFT_Y0 + height * LIFT_H, active: false };
}

function drawMinimap(ctx, view, state, fx) {
  const box = MINIMAP;
  const x = view.sx(box.x);
  const y = view.sy(box.y);
  const w = view.px(box.w);
  const h = view.px(box.h);
  ctx.save();
  ctx.fillStyle = rgba(HUD_BG, 0.94);
  ctx.strokeStyle = rgba("#6b4a32", 0.7);
  ctx.lineWidth = Math.max(1, view.px(1.2));
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, 4);
  else ctx.rect(x, y, w, h);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.font = `700 ${Math.max(10, view.px(11))}px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("盤", x + w / 2, y + view.px(4));

  const cx = x + w / 2;
  const cy = y + view.px(18) + (h - view.px(22)) / 2;
  const r = Math.min(w, h - view.px(22)) * 0.42;
  const miniFx = { platterAngle: 0, seatedGlow: 0 };
  drawDiscBody(ctx, cx, cy, r, state, miniFx, true, { still: true, noGlow: true });

  const radius = Number(state?.radius);
  if (Number.isFinite(radius)) {
    const p = discPoint(cx, cy, radius, ARM_ANG, r);
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(2.2, view.px(3.2)), 0, Math.PI * 2);
    ctx.fillStyle = state?.seated ? CREAM : METAL;
    ctx.fill();
    ctx.strokeStyle = ARM;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();
}

function drawRevealOverlay(ctx, view, state, fx) {
  const cx = view.sx(DISC_CX);
  const cy = view.sy(DISC_CY);
  const r = view.px(DISC_R + 6);
  ctx.save();
  ctx.fillStyle = rgba("#1c2430", 0.28);
  ctx.fillRect(view.sx(0), view.sy(0), view.px(VIEW_W), view.px(VIEW_H));
  drawDiscBody(ctx, cx, cy, r, state, { platterAngle: 0, seatedGlow: 0 }, true, {
    still: true,
    noGlow: true,
  });

  const trail = Array.isArray(fx?.trail) ? fx.trail : [];
  if (trail.length >= 2) {
    ctx.beginPath();
    let started = false;
    for (const p of trail) {
      const ang = ARM_ANG - (Number(p.ang) || 0);
      const q = discPoint(cx, cy, Number(p.r) || 0, ang, r);
      if (!started) {
        ctx.moveTo(q.x, q.y);
        started = true;
      } else ctx.lineTo(q.x, q.y);
    }
    ctx.strokeStyle = rgba(HORN_A, 0.95);
    ctx.lineWidth = Math.max(2, view.px(2.2));
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * タイトルの盤の縮小図。傷と曲の帯は見せ、配置の解説も数値も出さない。
 * @param {HTMLCanvasElement} canvas
 * @param {object} state
 */
export function drawTitlePreview(canvas, state) {
  if (!canvas || typeof canvas.getContext !== "function") return;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssW = Math.max(1, canvas.clientWidth || 160);
  const cssH = Math.max(1, canvas.clientHeight || 160);
  const w = Math.round(cssW * dpr);
  const h = Math.round(cssH * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = HUD_BG;
  ctx.fillRect(0, 0, cssW, cssH);
  const cx = cssW / 2;
  const cy = cssH / 2;
  const r = Math.min(cssW, cssH) * 0.42;
  drawDiscBody(ctx, cx, cy, r, state, { platterAngle: 0, seatedGlow: 0 }, true, {
    still: true,
    noGlow: true,
  });
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} state
 * @param {{ reducedMotion?: boolean, fx?: object, left?: object, right?: object }} [opts]
 */
export function drawScene(ctx, state, opts = {}) {
  const canvas = ctx.canvas;
  const { cssW, cssH, dpr } = syncCanvasSize(canvas);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const base = makeView(cssW, cssH);
  const reduced = !!opts.reducedMotion;
  const fx = opts.fx;
  const zoom = revealZoom(fx, reduced);
  const view =
    zoom === 1
      ? base
      : {
          ...base,
          sx(x) {
            return base.sx(DISC_CX + (x - DISC_CX) * zoom);
          },
          sy(y) {
            return base.sy(DISC_CY + (y - DISC_CY) * zoom);
          },
          px(wu) {
            return base.px(wu * zoom);
          },
        };

  fillWall(ctx, base);
  drawWindow(ctx, view);
  drawFloor(ctx, view);
  drawHorn(ctx, view, fx, reduced);
  drawCabinet(ctx, view);
  drawSpringBox(ctx, view, state);
  drawHandle(ctx, view, state, fx);

  const playing = state?.status === "playing";
  const phase = state?.phase;
  const showControls = playing && phase !== "reveal";

  const leftPos = leftThumbPos(opts.left);
  const rightPos = rightThumbPos(opts.right, state);
  if (showControls) {
    drawThumbGuide(ctx, view, leftPos.x, leftPos.y, leftPos.active, !!state?.hintLeft);
  }

  if (showControls) drawLift(ctx, view, state);
  if (showControls) {
    drawThumbGuide(ctx, view, rightPos.x, rightPos.y, rightPos.active, !!state?.hintRight);
  }

  const liftY = Number(fx?.placeLift) || 0;
  const discX = view.sx(DISC_CX);
  const discY = view.sy(DISC_CY - liftY);
  const discR = view.px(DISC_R);
  // 盤と今乗っている針は指より手前
  drawDiscBody(ctx, discX, discY, discR, state, fx, reduced);
  drawNeedle(ctx, view, state, fx);

  if (playing && phase !== "reveal") drawMinimap(ctx, base, state, fx);
  if (playing && phase === "reveal") drawRevealOverlay(ctx, view, state, fx);

  drawFx(ctx, fx, { ...view, reducedMotion: reduced }, state);
}
