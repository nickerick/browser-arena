import type { SpriteConfig } from '../Sprite';

export const PLAYER_SPRITE_CONFIG: SpriteConfig = {
  src: '/player.png',
  frameW: 40,
  frameH: 64,
  frameCount: 6,
  fps: 8,
  rows: { down: 0, left: 1, up: 2, right: { row: 1, flipX: true } },
  defaultFacing: 'down',
};
