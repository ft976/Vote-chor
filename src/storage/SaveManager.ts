import { Mission, SaveData } from '../config/constants';

const STORAGE_KEY = 'vote_runner_save_v1';

export const DEFAULT_SAVE_DATA: SaveData = {
  version: 1,
  highScore: 0,
  bestVotes: 0,
  bestDistance: 0,
  totalVotes: 50, // Starting gift of 50 votes so player can test revive or shop!
  settings: {
    sfx: true,
    music: true,
    haptics: true,
    reducedMotion: false,
  },
  unlockedSkins: ['khadi_white'],
  selectedSkin: 'khadi_white',
  missions: [
    {
      id: 'm_votes_50',
      text: 'Collect 50 campaign votes in runs',
      type: 'votes',
      progress: 0,
      goal: 50,
      reward: 30,
      done: false,
    },
    {
      id: 'm_distance_500',
      text: 'Reach 500 meters down the street',
      type: 'distance',
      progress: 0,
      goal: 500,
      reward: 40,
      done: false,
    },
    {
      id: 'm_jumps_10',
      text: 'Leap over 10 barricades or obstacles',
      type: 'jumps',
      progress: 0,
      goal: 10,
      reward: 25,
      done: false,
    },
  ],
  lastDailyReset: new Date().toISOString().split('T')[0],
};

export class SaveManager {
  private static instance: SaveManager;
  private data: SaveData;

  private constructor() {
    this.data = this.load();
  }

  public static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  public getData(): SaveData {
    return this.data;
  }

  public load(): SaveData {
    if (typeof window === 'undefined') {
      return { ...DEFAULT_SAVE_DATA };
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { ...DEFAULT_SAVE_DATA };
      }

      const parsed = JSON.parse(raw);
      return this.migrateAndSanitize(parsed);
    } catch (err) {
      console.warn('Could not parse saved game data. Resetting to defaults.', err);
      return { ...DEFAULT_SAVE_DATA };
    }
  }

  public migrateAndSanitize(candidate: any): SaveData {
    if (!candidate || typeof candidate !== 'object') {
      return { ...DEFAULT_SAVE_DATA };
    }

    // Version migration checks (v1 currently)
    const sanitized: SaveData = {
      version: 1,
      highScore: Number.isFinite(candidate.highScore) ? Math.max(0, candidate.highScore) : 0,
      bestVotes: Number.isFinite(candidate.bestVotes) ? Math.max(0, candidate.bestVotes) : 0,
      bestDistance: Number.isFinite(candidate.bestDistance) ? Math.max(0, candidate.bestDistance) : 0,
      totalVotes: Number.isFinite(candidate.totalVotes) ? Math.max(0, candidate.totalVotes) : 50,
      settings: {
        sfx: typeof candidate.settings?.sfx === 'boolean' ? candidate.settings.sfx : true,
        music: typeof candidate.settings?.music === 'boolean' ? candidate.settings.music : true,
        haptics: typeof candidate.settings?.haptics === 'boolean' ? candidate.settings.haptics : true,
        reducedMotion: typeof candidate.settings?.reducedMotion === 'boolean' ? candidate.settings.reducedMotion : false,
      },
      unlockedSkins: Array.isArray(candidate.unlockedSkins) && candidate.unlockedSkins.length > 0
        ? Array.from(new Set(['khadi_white', ...candidate.unlockedSkins]))
        : ['khadi_white'],
      selectedSkin: typeof candidate.selectedSkin === 'string' && candidate.selectedSkin ? candidate.selectedSkin : 'khadi_white',
      missions: Array.isArray(candidate.missions) && candidate.missions.length > 0 ? candidate.missions : DEFAULT_SAVE_DATA.missions,
      lastDailyReset: typeof candidate.lastDailyReset === 'string' ? candidate.lastDailyReset : DEFAULT_SAVE_DATA.lastDailyReset,
    };

    return sanitized;
  }

  public save(updatedData?: Partial<SaveData>): void {
    if (updatedData) {
      this.data = { ...this.data, ...updatedData };
    }

    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (err) {
      console.error('Failed to save game state to localStorage:', err);
    }
  }

  public addBankedVotes(amount: number): number {
    this.data.totalVotes += Math.max(0, amount);
    this.save();
    return this.data.totalVotes;
  }

  public spendBankedVotes(amount: number): boolean {
    if (this.data.totalVotes >= amount) {
      this.data.totalVotes -= amount;
      this.save();
      return true;
    }
    return false;
  }

  public updateRecords(score: number, distance: number, votes: number): { isNewHigh: boolean } {
    let isNewHigh = false;
    if (score > this.data.highScore) {
      this.data.highScore = Math.floor(score);
      isNewHigh = true;
    }
    if (distance > this.data.bestDistance) {
      this.data.bestDistance = Math.floor(distance);
    }
    if (votes > this.data.bestVotes) {
      this.data.bestVotes = votes;
    }
    this.save();
    return { isNewHigh };
  }

  public resetAll(): void {
    this.data = { ...DEFAULT_SAVE_DATA };
    this.save();
  }
}
