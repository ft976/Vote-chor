import { EventBus, GameState } from './EventBus';

export class StateMachine {
  private current: GameState = 'Boot';
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  get state(): GameState {
    return this.current;
  }

  transitionTo(next: GameState): boolean {
    if (this.current === next) return false;

    // Check valid transitions
    const valid = this.isValidTransition(this.current, next);
    if (!valid) {
      console.warn(`Invalid state transition requested: ${this.current} -> ${next}`);
      return false;
    }

    const previous = this.current;
    this.current = next;
    this.eventBus.emit('state:changed', { from: previous, to: next });
    return true;
  }

  private isValidTransition(from: GameState, to: GameState): boolean {
    switch (from) {
      case 'Boot':
        return to === 'Menu' || to === 'Playing';
      case 'Menu':
        return to === 'Playing';
      case 'Playing':
        return to === 'Paused' || to === 'GameOver' || to === 'Menu';
      case 'Paused':
        return to === 'Playing' || to === 'Menu' || to === 'GameOver';
      case 'GameOver':
        return to === 'Playing' || to === 'Menu';
      default:
        return false;
    }
  }
}
