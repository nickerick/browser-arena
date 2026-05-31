/** Width of the game world in world units. */
export const WORLD_W = 2000;

/** Height of the game world in world units. */
export const WORLD_H = 1200;

/** Collision radius of a player in world units. */
export const PLAYER_RADIUS = 20;

/** Server tick rate in Hz. */
export const TICK_RATE = 20;

/** Player movement speed in world units per second. */
export const PLAYER_SPEED = 800;

/** Collision radius of a projectile in world units. */
export const PROJECTILE_RADIUS = 8;

/** Projectile travel speed in world units per second. */
export const PROJECTILE_SPEED = 1400;

/** Time in seconds before a projectile is removed from the world. */
export const PROJECTILE_LIFETIME = 2.5;

/** Maximum HP a player starts with and respawns to. */
export const MAX_HP = 3;

/** Shape used for projectile-vs-player hit detection. */
export const HITBOX_SHAPE: 'circle' | 'aabb' = 'circle';

/** Half-width used when HITBOX_SHAPE is 'aabb'. */
export const HITBOX_W = 40;

/** Half-height used when HITBOX_SHAPE is 'aabb'. */
export const HITBOX_H = 48;
