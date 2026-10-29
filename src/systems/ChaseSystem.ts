import { GAP_MAX, GAP_RECOVERY, GAP_START, STUMBLE_GAP_LOSS } from '../config/constants';
import { RIVAL_LINES } from '../config/lines';
import { EventBus } from '../core/EventBus';
import { SeededRNG } from '../utils/rng';

export class ChaseSystem {
  private gap: number = GAP_START;
  private mode: 'chasing' | 'closing' | 'caught' = 'chasing';
  private speechTimer: number = 6;
  private rng: SeededRNG;
  private eventBus?: EventBus;

  constructor(eventBus?: EventBus, rng?: SeededRNG) {
    this.eventBus = eventBus;
    this.rng = rng || new SeededRNG(42);
    this.reset();
  }

  public reset(startingGap: number = GAP_START): void {
    this.gap = startingGap;
    this.mode = 'chasing';
    this.speechTimer = this.rng.range(6, 10);
  }

  public getGap(): number {
    return this.gap;
  }

  public getMode(): 'chasing' | 'closing' | 'caught' {
    return this.mode;
  }

  public setGap(gap: number): void {
    this.gap = Math.max(0, Math.min(GAP_MAX, gap));
    if (this.gap <= 0) {
      this.mode = 'caught';
    } else if (this.gap < 5) {
      this.mode = 'closing';
    } else {
      this.mode = 'chasing';
    }
  }

  public onStumble(hasShield: boolean, isInvulnerable: boolean): { caught: boolean; gapLost: number } {
    if (isInvulnerable) {
      return { caught: false, gapLost: 0 };
    }

    if (hasShield) {
      // Shield absorbs stumble without losing distance
      return { caught: false, gapLost: 0 };
    }

    this.gap = Math.max(0, this.gap - STUMBLE_GAP_LOSS);

    if (this.gap <= 0) {
      this.mode = 'caught';
      return { caught: true, gapLost: STUMBLE_GAP_LOSS };
    }

    if (this.gap < 5) {
      this.mode = 'closing';
    }

    return { caught: false, gapLost: STUMBLE_GAP_LOSS };
  }

  public update(dt: number, isInvulnerable: boolean = false): { caught: boolean } {
    if (this.mode === 'caught') {
      return { caught: true };
    }

    // Gap recovery when running clean
    if (!isInvulnerable && this.gap < GAP_MAX) {
      this.gap = Math.min(GAP_MAX, this.gap + GAP_RECOVERY * dt);
    }

    // Update chase mode
    if (this.gap < 5) {
      this.mode = 'closing';
    } else {
      this.mode = 'chasing';
    }

    // Satirical rival speech trigger
    this.speechTimer -= dt;
    if (this.speechTimer <= 0) {
      const line = this.rng.pick(RIVAL_LINES);
      if (this.eventBus) {
        this.eventBus.emit('rival:speak', { line });
      }
      this.speechTimer = this.rng.range(8, 15);
    }

    return { caught: this.gap <= 0 };
  }
}
