/** 蓄音機の針: 左手はハンドルを右回り、右手は溝を下へおろす。 */
import * as C from "../engine/constants.mjs";
import {
  drawTravelGuide,
  guideNow,
  pathCircle,
  pathLine,
  prefersReducedMotion,
} from "./motion-guide.mjs";

const HANDLE_CX = C.HANDLE_CX ?? C.CRANK_CX ?? 188;
const HANDLE_CY = C.HANDLE_CY ?? C.CRANK_CY ?? 268;
const HANDLE_R = C.HANDLE_VISUAL_R ?? C.HANDLE_R ?? C.CRANK_VISUAL_R ?? 110;
const LIFT_CX = C.LIFT_CX ?? C.NEEDLE_CX ?? 648;
const LIFT_CY = C.LIFT_CY ?? C.NEEDLE_CY ?? 268;
const LIFT_H = C.LIFT_H ?? C.NEEDLE_GROOVE_H ?? 200;
const LIFT_Y0 = C.LIFT_Y0 ?? C.HEIGHT_Y0 ?? (LIFT_CY - LIFT_H / 2);
const LIFT_Y1 = C.LIFT_Y1 ?? (LIFT_CY + LIFT_H / 2);

export function drawMotionGuides(ctx, view, state) {
  if (state?.status !== "playing") return;
  if (state.phase === "reveal") return;
  const reduced = prefersReducedMotion();
  const t = guideNow();
  if (state.hintLeft !== false) {
    const r = Math.min(82, HANDLE_R - 28);
    // Y 下向きで偏角が増える向き = 右回り。
    drawTravelGuide(ctx, view, pathCircle(HANDLE_CX, HANDLE_CY, r, r, 48, 0.4, Math.PI * 2), t, {
      period: 2.5,
      loop: "cycle",
      reduced,
      alpha: 0.5,
    });
  }
  if (state.hintRight !== false) {
    const pts = pathLine(LIFT_CX, LIFT_Y0 + 8, LIFT_CX, LIFT_Y1 - 8, 18);
    drawTravelGuide(ctx, view, pts, t, { period: 2.8, loop: "pingpong", reduced, alpha: 0.48 });
  }
}
