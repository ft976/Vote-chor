import { MAX_SPEED, SPEED_RAMP, START_SPEED } from './constants';

export function calculateDifficulty(distance: number): number {
  return Math.min(1.0, Math.max(0.0, distance / 3000));
}

export function calculateSpeed(elapsedTime: number, slowmoActive: boolean = false): number {
  const rampProgress = Math.min(1.0, elapsedTime / SPEED_RAMP);
  let speed = START_SPEED + (MAX_SPEED - START_SPEED) * rampProgress;
  if (slowmoActive) {
    speed *= 0.7;
  }
  return speed;
}

export function getAllowedTiers(difficulty: number): { minDiff: number; maxDiff: number }[] {
  if (difficulty < 0.25) {
    return [{ minDiff: 0.0, maxDiff: 0.25 }];
  } else if (difficulty < 0.5) {
    return [
      { minDiff: 0.0, maxDiff: 0.25 },
      { minDiff: 0.25, maxDiff: 0.5 },
    ];
  } else if (difficulty < 0.75) {
    return [
      { minDiff: 0.15, maxDiff: 0.5 },
      { minDiff: 0.5, maxDiff: 0.75 },
    ];
  } else {
    return [
      { minDiff: 0.35, maxDiff: 0.75 },
      { minDiff: 0.75, maxDiff: 1.0 },
    ];
  }
}
