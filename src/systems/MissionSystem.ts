import { Mission } from '../config/constants';
import { EventBus } from '../core/EventBus';
import { SaveManager } from '../storage/SaveManager';

export class MissionSystem {
  private saveManager: SaveManager;
  private eventBus?: EventBus;

  constructor(saveManager: SaveManager, eventBus?: EventBus) {
    this.saveManager = saveManager;
    this.eventBus = eventBus;
  }

  public getMissions(): Mission[] {
    return this.saveManager.getData().missions;
  }

  public trackProgress(type: 'votes' | 'distance' | 'jumps' | 'powerups', amount: number): void {
    const data = this.saveManager.getData();
    let updated = false;

    for (const mission of data.missions) {
      if (mission.type === type && !mission.done) {
        mission.progress += amount;
        if (mission.progress >= mission.goal) {
          mission.progress = mission.goal;
          mission.done = true;
          this.saveManager.addBankedVotes(mission.reward);

          if (this.eventBus) {
            this.eventBus.emit('shout', {
              text: 'Mission Completed!',
              subtext: `+${mission.reward} Banked Votes: ${mission.text}`,
            });
          }
        }

        if (this.eventBus) {
          this.eventBus.emit('mission:progress', {
            id: mission.id,
            progress: mission.progress,
            goal: mission.goal,
            done: mission.done,
          });
        }
        updated = true;
      }
    }

    if (updated) {
      this.saveManager.save();
    }
  }

  public checkDailyReset(): void {
    const today = new Date().toISOString().split('T')[0];
    const data = this.saveManager.getData();

    if (data.lastDailyReset !== today) {
      data.lastDailyReset = today;
      // Refresh daily missions
      data.missions = [
        {
          id: `m_votes_${Date.now()}`,
          text: 'Collect 60 votes across street rallies',
          type: 'votes',
          progress: 0,
          goal: 60,
          reward: 40,
          done: false,
        },
        {
          id: `m_dist_${Date.now()}`,
          text: 'Cover 800 meters down campaign roads',
          type: 'distance',
          progress: 0,
          goal: 800,
          reward: 50,
          done: false,
        },
        {
          id: `m_jumps_${Date.now()}`,
          text: 'Leap over 15 barricades or potholes',
          type: 'jumps',
          progress: 0,
          goal: 15,
          reward: 35,
          done: false,
        },
      ];
      this.saveManager.save();
    }
  }
}
