import { POWERUPS } from '../config/powerups';
import { PowerUpId } from '../config/constants';
import { EventBus } from '../core/EventBus';

export class PowerUpSystem {
  private activeTimers: Map<PowerUpId, number> = new Map();
  private shieldCharges: number = 0;
  private eventBus?: EventBus;

  constructor(eventBus?: EventBus) {
    this.eventBus = eventBus;
  }

  public reset(): void {
    this.activeTimers.clear();
    this.shieldCharges = 0;
  }

  public activate(id: PowerUpId): void {
    const def = POWERUPS[id];
    if (!def) return;

    if (id === 'shield') {
      this.shieldCharges = 1;
      this.activeTimers.set(id, def.duration);
    } else {
      this.activeTimers.set(id, def.duration);
    }

    if (this.eventBus) {
      this.eventBus.emit('powerup:start', { id, duration: def.duration });
      this.eventBus.emit('shout', { text: def.name, subtext: def.description });
    }
  }

  public update(dt: number): void {
    for (const [id, timeLeft] of this.activeTimers.entries()) {
      const nextTime = timeLeft - dt;
      if (nextTime <= 0) {
        this.activeTimers.delete(id);
        if (id === 'shield') {
          this.shieldCharges = 0;
        }
        if (this.eventBus) {
          this.eventBus.emit('powerup:end', { id });
        }
      } else {
        this.activeTimers.set(id, nextTime);
      }
    }
  }

  public consumeShield(): boolean {
    if (this.shieldCharges > 0) {
      this.shieldCharges--;
      this.activeTimers.delete('shield');
      if (this.eventBus) {
        this.eventBus.emit('powerup:end', { id: 'shield' });
      }
      return true;
    }
    return false;
  }

  public hasShield(): boolean {
    return this.shieldCharges > 0;
  }

  public isActive(id: PowerUpId): boolean {
    return (this.activeTimers.get(id) ?? 0) > 0;
  }

  public getTimeRemaining(id: PowerUpId): number {
    return this.activeTimers.get(id) ?? 0;
  }

  public getActiveMap(): Partial<Record<PowerUpId, number>> {
    const map: Partial<Record<PowerUpId, number>> = {};
    for (const [id, time] of this.activeTimers.entries()) {
      map[id] = time;
    }
    return map;
  }
}
