import { INPUT_BUFFER } from '../config/constants';

export type InputCommand = 'left' | 'right' | 'jump' | 'slide' | 'pause';

export class InputSystem {
  private bufferedCommand: InputCommand | null = null;
  private bufferTimestamp: number = 0;
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchStartTime: number = 0;
  private isTouching: boolean = false;
  private onPauseCallback?: () => void;

  public init(onPause?: () => void): void {
    this.onPauseCallback = onPause;
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    window.addEventListener('touchend', this.handleTouchEnd, { passive: true });
  }

  public destroy(): void {
    if (typeof window === 'undefined') return;

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchend', this.handleTouchEnd);
  }

  public enqueue(cmd: InputCommand): void {
    if (cmd === 'pause') {
      if (this.onPauseCallback) this.onPauseCallback();
      return;
    }
    this.bufferedCommand = cmd;
    this.bufferTimestamp = performance.now();
  }

  public consume(): InputCommand | null {
    if (!this.bufferedCommand) return null;

    const age = performance.now() - this.bufferTimestamp;
    if (age <= INPUT_BUFFER) {
      const cmd = this.bufferedCommand;
      this.bufferedCommand = null;
      return cmd;
    }

    this.bufferedCommand = null;
    return null;
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    // Ignore input if user is focusing an input field
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        this.enqueue('left');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        this.enqueue('right');
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
      case ' ':
        e.preventDefault();
        this.enqueue('jump');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        this.enqueue('slide');
        break;
      case 'p':
      case 'P':
      case 'Escape':
        e.preventDefault();
        this.enqueue('pause');
        break;
    }
  };

  private handleTouchStart = (e: TouchEvent): void => {
    if (e.touches.length > 0) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.touchStartTime = performance.now();
      this.isTouching = true;
    }
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    if (!this.isTouching || e.changedTouches.length === 0) return;
    this.isTouching = false;

    const dx = e.changedTouches[0].clientX - this.touchStartX;
    const dy = e.changedTouches[0].clientY - this.touchStartY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const threshold = 30; // 30 px swipe threshold per spec

    if (Math.max(absX, absY) < threshold) return;

    if (absX > absY) {
      // Horizontal swipe
      if (dx > 0) {
        this.enqueue('right');
      } else {
        this.enqueue('left');
      }
    } else {
      // Vertical swipe
      if (dy > 0) {
        this.enqueue('slide');
      } else {
        this.enqueue('jump');
      }
    }
  };
}
