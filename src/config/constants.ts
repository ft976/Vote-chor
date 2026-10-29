// Core gameplay and simulation constants for Vote Runner

export type LaneIndex = -1 | 0 | 1;

export const LANE_WIDTH = 2.2;
export const LANES: LaneIndex[] = [-1, 0, 1];

export const START_SPEED = 12; // units / sec
export const MAX_SPEED = 30; // units / sec
export const SPEED_RAMP = 180; // linear from start to max over 180 seconds

export const GRAVITY = -38;
export const JUMP_VELOCITY = 13;
export const SLIDE_DURATION = 0.7; // seconds
export const LANE_SWITCH_TIME = 0.12; // seconds

export const ROW_SPACING = 3; // world units between rows
export const SPAWN_HORIZON = 90; // units ahead of the player

export const GAP_START = 10;
export const GAP_MAX = 10;
export const STUMBLE_GAP_LOSS = 6;
export const GAP_RECOVERY = 0.4; // per second while running clean
export const STUMBLE_INVULN = 1.2; // seconds of invulnerability after stumble

export const INPUT_BUFFER = 150; // ms to queue input (e.g. jump before landing)
export const MIN_LANE_CHANGE_INTERVAL = 0.25; // seconds between required lane changes for validation

export const FIXED_STEP = 1 / 60; // 60 updates per second fixed timestep
export const REVIVE_COST = 50; // banked votes required to revive once per run

export type PlayerAction = 'running' | 'jumping' | 'sliding' | 'stumbling' | 'dead';
export type PowerUpId = 'magnet' | 'multiplier' | 'shield' | 'helicopter' | 'slowmo';
export type ObstacleKind = 'low' | 'high' | 'full' | 'moving';

export interface PlayerState {
  lane: LaneIndex;
  x: number; // smoothed horizontal position
  y: number; // height above ground
  vy: number; // vertical velocity
  action: PlayerAction;
  invulnerableFor: number; // seconds left after a stumble
  shieldCharges: number;
  activePowerUps: Partial<Record<PowerUpId, number>>; // seconds left
}

export interface ChaserState {
  gap: number; // distance behind the player, 0..GAP_MAX
  mode: 'chasing' | 'closing' | 'caught';
}

export interface ObstacleDef {
  id: string;
  kind: ObstacleKind;
  size: { w: number; h: number; d: number };
  lanesBlocked: 1 | 2 | 3;
  art: string;
  minDifficulty: number; // 0..1, when it starts appearing
  name: string;
  description: string;
}

export interface PowerUpDef {
  id: PowerUpId;
  name: string;
  duration: number; // seconds
  art: string;
  description: string;
  color: string;
}

export type Cell =
  | { t: 'empty' }
  | { t: 'vote'; value: 1 | 5 }
  | { t: 'obstacle'; id: string }
  | { t: 'powerup'; id: PowerUpId };

export interface Row {
  z: number;
  cells: [Cell, Cell, Cell]; // left, middle, right
}

export interface Chunk {
  id: string;
  length: number; // world units
  difficulty: number; // 0..1
  rows: Row[];
}

export interface Mission {
  id: string;
  text: string;
  type: 'votes' | 'distance' | 'jumps' | 'powerups';
  progress: number;
  goal: number;
  reward: number;
  done: boolean;
}

export interface SaveData {
  version: 1;
  highScore: number;
  bestVotes: number;
  bestDistance: number;
  totalVotes: number; // banked votes, spent on revive and skins
  settings: {
    sfx: boolean;
    music: boolean;
    haptics: boolean;
    reducedMotion: boolean;
  };
  unlockedSkins: string[];
  selectedSkin: string;
  missions: Mission[];
  lastDailyReset: string;
}
