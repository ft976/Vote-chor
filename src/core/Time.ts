import { FIXED_STEP } from '../config/constants';

export class Time {
  private lastTime: number = 0;
  private accumulator: number = 0;
  private timeScale: number = 1.0;
  private elapsedSeconds: number = 0;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.lastTime = performance.now() / 1000;
    this.accumulator = 0;
    this.elapsedSeconds = 0;
  }

  setTimeScale(scale: number): void {
    this.timeScale = Math.max(0.1, Math.min(3.0, scale));
  }

  get elapsed(): number {
    return this.elapsedSeconds;
  }

  advance(currentTimeMs: number, onFixedTick: (dt: number) => void): number {
    const currentSeconds = currentTimeMs / 1000;
    if (this.lastTime === 0) {
      this.lastTime = currentSeconds;
    }

    let delta = currentSeconds - this.lastTime;
    this.lastTime = currentSeconds;

    // Clamp huge deltas to avoid spiral of death (e.g. background tab switch)
    if (delta > 0.1) {
      delta = 0.1;
    }

    this.accumulator += delta * this.timeScale;

    let steps = 0;
    const maxStepsPerFrame = 5;

    while (this.accumulator >= FIXED_STEP && steps < maxStepsPerFrame) {
      onFixedTick(FIXED_STEP);
      this.elapsedSeconds += FIXED_STEP;
      this.accumulator -= FIXED_STEP;
      steps++;
    }

    if (steps >= maxStepsPerFrame) {
      this.accumulator = 0;
    }

    // Return interpolation alpha for smooth rendering between physics steps
    return Math.min(1.0, Math.max(0.0, this.accumulator / FIXED_STEP));
  }
}
