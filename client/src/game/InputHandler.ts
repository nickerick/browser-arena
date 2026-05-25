/**
 * Snapshot of player intent for a single frame.
 * Derived once per frame in {@link InputHandler.read()} and passed to all systems.
 */
export interface InputState {
  /** Horizontal movement intent: -1 (left), 0 (none), or 1 (right). */
  moveX: number;
  /** Vertical movement intent: -1 (up), 0 (none), or 1 (down). */
  moveY: number;
  /** True if any movement key is held. */
  moving: boolean;
  /** True if the fire key (space) is held. */
  fire: boolean;
}

export class InputHandler {
  private keys = new Set<string>();

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key === ' ') e.preventDefault();
    this.keys.add(e.key.toLowerCase());
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
  };

  /** Reads the current key state and returns a derived {@link InputState}. Call once per frame. */
  read(): InputState {
    const moveX =
      (this.keys.has('a') || this.keys.has('arrowleft') ? -1 : 0) +
      (this.keys.has('d') || this.keys.has('arrowright') ? 1 : 0);
    const moveY =
      (this.keys.has('w') || this.keys.has('arrowup') ? -1 : 0) +
      (this.keys.has('s') || this.keys.has('arrowdown') ? 1 : 0);
    return { moveX, moveY, moving: moveX !== 0 || moveY !== 0, fire: this.keys.has(' ') };
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
