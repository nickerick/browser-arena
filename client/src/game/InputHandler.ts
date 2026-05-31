/**
 * Snapshot of player intent for a single frame, with mouse already in world space.
 * Built in Game.ts by combining RawInput from InputHandler with the camera transform.
 */
export interface InputState {
  /** Horizontal movement intent: -1 (left), 0 (none), or 1 (right). */
  moveX: number;
  /** Vertical movement intent: -1 (up), 0 (none), or 1 (down). */
  moveY: number;
  /** True if any movement key is held. */
  moving: boolean;
  /** True if the fire key (space) or left mouse button is held. */
  fire: boolean;
  /** Mouse position in world units. */
  worldMouseX: number;
  worldMouseY: number;
}

/**
 * Raw snapshot straight from the OS — mouse is still in client (screen) coords.
 * Returned by InputHandler.read(); Game.ts adds worldMouse before passing downstream.
 */
export interface RawInput {
  moveX: number;
  moveY: number;
  moving: boolean;
  fire: boolean;
  clientMouseX: number;
  clientMouseY: number;
}

/** Reads raw keyboard/mouse events and normalizes them into a RawInput each frame. */
export class InputHandler {
  private keys = new Set<string>();
  private clientMouseX = 0;
  private clientMouseY = 0;
  private mouseDown = false;

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key === ' ') e.preventDefault();
    this.keys.add(e.key.toLowerCase());
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
  };

  private onMouseMove = (e: MouseEvent) => {
    this.clientMouseX = e.clientX;
    this.clientMouseY = e.clientY;
  };

  private onMouseDown = (e: MouseEvent) => {
    if (e.button === 0) this.mouseDown = true;
  };

  private onMouseUp = (e: MouseEvent) => {
    if (e.button === 0) this.mouseDown = false;
  };

  /** Returns a raw snapshot of the current input state. Mouse coords are in client space. */
  read(): RawInput {
    const moveX =
      (this.keys.has('a') || this.keys.has('arrowleft') ? -1 : 0) +
      (this.keys.has('d') || this.keys.has('arrowright') ? 1 : 0);
    const moveY =
      (this.keys.has('w') || this.keys.has('arrowup') ? -1 : 0) +
      (this.keys.has('s') || this.keys.has('arrowdown') ? 1 : 0);
    return {
      moveX,
      moveY,
      moving: moveX !== 0 || moveY !== 0,
      fire: this.keys.has(' ') || this.mouseDown,
      clientMouseX: this.clientMouseX,
      clientMouseY: this.clientMouseY,
    };
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
  }
}
