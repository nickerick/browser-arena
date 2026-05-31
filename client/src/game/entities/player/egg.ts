import { PLAYER_RADIUS } from '@browser-arena/shared';

const BODY_RX = PLAYER_RADIUS * 0.85;
const BODY_RY = PLAYER_RADIUS * 1.1;
const BARREL_W = PLAYER_RADIUS * 1.1;
const BARREL_H = PLAYER_RADIUS * 0.32;
const FOOT_SPREAD = PLAYER_RADIUS * 0.38;
const FOOT_R = PLAYER_RADIUS * 0.18;
const FOOT_BOB_AMP = PLAYER_RADIUS * 0.22;

/**
 * Draws a procedural egg character centered at (x, y).
 *
 * @param aimAngle - radians, direction the barrel points (0 = right)
 * @param walkPhase - 0..2π walk cycle progress, drives foot animation
 * @param color - fill color for the egg body
 */
export function drawEgg(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  aimAngle: number,
  walkPhase: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);

  // feet (drawn behind body)
  drawFeet(ctx, walkPhase);

  // egg body
  ctx.beginPath();
  ctx.ellipse(0, 0, BODY_RX, BODY_RY, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // eyes
  drawEyes(ctx, aimAngle);

  // barrel
  drawBarrel(ctx, aimAngle);

  ctx.restore();
}

function drawFeet(ctx: CanvasRenderingContext2D, walkPhase: number) {
  // left foot bobs up when right foot bobs down
  const leftY = BODY_RY * 0.7 + Math.sin(walkPhase) * FOOT_BOB_AMP;
  const rightY = BODY_RY * 0.7 + Math.sin(walkPhase + Math.PI) * FOOT_BOB_AMP;

  ctx.fillStyle = '#e8c97a';
  ctx.beginPath();
  ctx.ellipse(-FOOT_SPREAD, leftY, FOOT_R * 1.3, FOOT_R, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(FOOT_SPREAD, rightY, FOOT_R * 1.3, FOOT_R, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawEyes(ctx: CanvasRenderingContext2D, aimAngle: number) {
  // eyes face the aim direction, offset slightly toward it
  const eyeOffsetX = Math.cos(aimAngle) * BODY_RX * 0.25;
  const eyeOffsetY = Math.sin(aimAngle) * BODY_RY * 0.25;

  const perpX = -Math.sin(aimAngle) * BODY_RX * 0.28;
  const perpY = Math.cos(aimAngle) * BODY_RY * 0.28;

  const eyeR = PLAYER_RADIUS * 0.14;
  const pupilR = eyeR * 0.55;

  for (const side of [-1, 1]) {
    const ex = eyeOffsetX + perpX * side;
    const ey = eyeOffsetY + perpY * side;

    ctx.beginPath();
    ctx.arc(ex, ey, eyeR, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // pupil looks in aim direction
    ctx.beginPath();
    ctx.arc(
      ex + Math.cos(aimAngle) * eyeR * 0.35,
      ey + Math.sin(aimAngle) * eyeR * 0.35,
      pupilR,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = '#222';
    ctx.fill();
  }
}

function drawBarrel(ctx: CanvasRenderingContext2D, aimAngle: number) {
  ctx.save();
  ctx.rotate(aimAngle);

  // barrel starts at edge of body and extends outward
  const barrelStartX = BODY_RX * 0.6;

  ctx.fillStyle = '#555';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(barrelStartX, -BARREL_H / 2, BARREL_W, BARREL_H, 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}
