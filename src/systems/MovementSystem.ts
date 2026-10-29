import {
  GRAVITY,
  JUMP_VELOCITY,
  LANE_SWITCH_TIME,
  LANE_WIDTH,
  LaneIndex,
  PlayerState,
  SLIDE_DURATION,
} from '../config/constants';
import { clamp, damp, lerp } from '../utils/math';

export class MovementSystem {
  private targetX: number = 0;
  private slideTimer: number = 0;
  private stumbleTimer: number = 0;
  private helicopterAltitude: number = 4.5;

  public reset(player: PlayerState): void {
    player.lane = 0;
    player.x = 0;
    player.y = 0;
    player.vy = 0;
    player.action = 'running';
    player.invulnerableFor = 0;
    player.shieldCharges = 0;
    player.activePowerUps = {};
    this.targetX = 0;
    this.slideTimer = 0;
    this.stumbleTimer = 0;
  }

  public changeLane(player: PlayerState, direction: -1 | 1): boolean {
    const nextLane = (player.lane + direction) as LaneIndex;
    if (nextLane >= -1 && nextLane <= 1) {
      player.lane = nextLane;
      this.targetX = player.lane * LANE_WIDTH;
      return true;
    }
    return false;
  }

  public jump(player: PlayerState): boolean {
    if (player.action === 'dead') return false;

    // Helicopter overrides jump
    if (player.activePowerUps.helicopter && player.activePowerUps.helicopter > 0) {
      return false;
    }

    if (player.y <= 0.05) {
      player.vy = JUMP_VELOCITY;
      player.action = 'jumping';
      this.slideTimer = 0;
      return true;
    }
    return false;
  }

  public slide(player: PlayerState): boolean {
    if (player.action === 'dead') return false;

    // Helicopter overrides slide
    if (player.activePowerUps.helicopter && player.activePowerUps.helicopter > 0) {
      return false;
    }

    // Fast-fall if in the air
    if (player.y > 0.05) {
      player.vy = Math.min(player.vy, -26); // Dive down quickly
      this.slideTimer = SLIDE_DURATION;
      player.action = 'sliding';
      return true;
    }

    // Ground slide
    this.slideTimer = SLIDE_DURATION;
    player.action = 'sliding';
    return true;
  }

  public triggerStumble(player: PlayerState): void {
    player.action = 'stumbling';
    this.stumbleTimer = 0.4;
    player.invulnerableFor = 1.2;
  }

  public update(player: PlayerState, dt: number): void {
    if (player.action === 'dead') return;

    // Horizontal lane smoothing using fast exponential damping
    const switchLambda = 1 / LANE_SWITCH_TIME;
    player.x = damp(player.x, this.targetX, switchLambda * 1.8, dt);
    if (Math.abs(player.x - this.targetX) < 0.01) {
      player.x = this.targetX;
    }

    // Helicopter flight mechanic
    const isHelicopter = (player.activePowerUps.helicopter ?? 0) > 0;
    if (isHelicopter) {
      // Smoothly hover up to helicopter altitude
      player.y = damp(player.y, this.helicopterAltitude, 6, dt);
      player.vy = 0;
      if (player.action !== 'stumbling') {
        player.action = 'running';
      }
      return;
    }

    // Stumble timer
    if (player.action === 'stumbling') {
      this.stumbleTimer -= dt;
      if (this.stumbleTimer <= 0) {
        player.action = player.y > 0.05 ? 'jumping' : 'running';
      }
    }

    // Slide timer
    if (player.action === 'sliding') {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        player.action = player.y > 0.05 ? 'jumping' : 'running';
      }
    }

    // Vertical physics (gravity and jump)
    if (player.y > 0 || player.vy !== 0) {
      player.vy += GRAVITY * dt;
      player.y += player.vy * dt;

      if (player.y <= 0) {
        player.y = 0;
        player.vy = 0;
        if (player.action === 'jumping') {
          player.action = 'running';
        }
      }
    }

    // Invulnerability timer
    if (player.invulnerableFor > 0) {
      player.invulnerableFor = Math.max(0, player.invulnerableFor - dt);
    }
  }
}
