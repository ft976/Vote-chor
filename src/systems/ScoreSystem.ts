import { EventBus } from '../core/EventBus';

export class ScoreSystem {
  private distance: number = 0;
  private votesCollected: number = 0;
  private multiplier: number = 1;
  private eventBus?: EventBus;

  constructor(eventBus?: EventBus) {
    this.eventBus = eventBus;
    this.reset();
  }

  public reset(): void {
    this.distance = 0;
    this.votesCollected = 0;
    this.multiplier = 1;
  }

  public update(dt: number, speed: number, isMultiplierActive: boolean = false): void {
    this.distance += speed * dt;
    this.multiplier = isMultiplierActive ? 2 : 1;

    if (this.eventBus) {
      this.eventBus.emit('score:changed', {
        score: this.getScore(),
        distance: this.distance,
        votes: this.votesCollected,
        multiplier: this.multiplier,
      });
    }
  }

  public addVote(value: number): void {
    this.votesCollected += value;
    if (this.eventBus) {
      this.eventBus.emit('score:changed', {
        score: this.getScore(),
        distance: this.distance,
        votes: this.votesCollected,
        multiplier: this.multiplier,
      });
    }
  }

  public getScore(): number {
    return Math.floor(this.distance) + this.votesCollected * 10 * this.multiplier;
  }

  public getDistance(): number {
    return this.distance;
  }

  public getVotes(): number {
    return this.votesCollected;
  }

  public getMultiplier(): number {
    return this.multiplier;
  }
}
