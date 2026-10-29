import { PowerUpId } from '../config/constants';

export type GameState = 'Boot' | 'Menu' | 'Playing' | 'Paused' | 'GameOver';

export interface GameEvents {
  'vote:collected': { value: number; total: number; isGolden: boolean };
  'stumble': { gap: number; hasShield: boolean };
  'powerup:start': { id: PowerUpId; duration: number };
  'powerup:end': { id: PowerUpId };
  'caught': { distance: number; votes: number; score: number };
  'score:changed': { score: number; distance: number; votes: number; multiplier: number };
  'state:changed': { from: GameState; to: GameState };
  'mission:progress': { id: string; progress: number; goal: number; done: boolean };
  'shout': { text: string; subtext?: string };
  'rival:speak': { line: string };
  'revive:ready': { canRevive: boolean; cost: number };
}

type EventCallback<T> = (data: T) => void;

export class EventBus {
  private listeners: { [K in keyof GameEvents]?: EventCallback<any>[] } = {};

  on<K extends keyof GameEvents>(event: K, cb: EventCallback<GameEvents[K]>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(cb);
    return () => this.off(event, cb);
  }

  off<K extends keyof GameEvents>(event: K, cb: EventCallback<GameEvents[K]>): void {
    const list = this.listeners[event];
    if (!list) return;
    this.listeners[event] = list.filter((item) => item !== cb);
  }

  emit<K extends keyof GameEvents>(event: K, data: GameEvents[K]): void {
    const list = this.listeners[event];
    if (!list || list.length === 0) return;
    // Iterate over slice to protect against mutation during dispatch
    for (const cb of list.slice()) {
      try {
        cb(data);
      } catch (err) {
        console.error(`Error in event listener for "${event}":`, err);
      }
    }
  }

  clear(): void {
    this.listeners = {};
  }
}
