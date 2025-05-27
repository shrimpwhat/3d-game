export interface InputState {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
}

export class InputManager {
  private keys: Set<string> = new Set();
  private inputState: InputState = {
    forward: false,
    back: false,
    left: false,
    right: false,
    jump: false,
  };

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));
  }

  private onKeyDown(event: KeyboardEvent): void {
    this.keys.add(event.code);
    this.updateInputState();
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.keys.delete(event.code);
    this.updateInputState();
  }

  private updateInputState(): void {
    this.inputState.forward = this.keys.has("KeyW") || this.keys.has("ArrowUp");
    this.inputState.back = this.keys.has("KeyS") || this.keys.has("ArrowDown");
    this.inputState.left = this.keys.has("KeyA") || this.keys.has("ArrowLeft");
    this.inputState.right =
      this.keys.has("KeyD") || this.keys.has("ArrowRight");
    this.inputState.jump = this.keys.has("Space");
  }

  public getInputState(): InputState {
    return { ...this.inputState };
  }

  public dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown.bind(this));
    window.removeEventListener("keyup", this.onKeyUp.bind(this));
  }
}
