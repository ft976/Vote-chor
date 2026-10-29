import * as THREE from 'three';
import { Chunk, LANE_WIDTH, LANES, PowerUpId, ROW_SPACING, SPAWN_HORIZON } from '../config/constants';
import { PARSED_CHUNKS } from '../config/chunks';
import { getAllowedTiers } from '../config/difficulty';
import { SpawnValidator } from './SpawnValidator';
import { SeededRNG } from '../utils/rng';
import { ObjectPool } from '../core/Pool';
import { ObstacleEntity } from '../entities/Obstacle';
import { CollectibleEntity } from '../entities/Collectible';
import { PowerUpEntity } from '../entities/PowerUp';

export class ChunkSpawner {
  private rng: SeededRNG;
  private currentSpawnZ: number = 15; // Start spawning ahead of player
  private obstaclePool: ObjectPool<ObstacleEntity>;
  private collectiblePool: ObjectPool<CollectibleEntity>;
  private powerUpPool: ObjectPool<PowerUpEntity>;
  private scene: THREE.Scene;

  constructor(
    scene: THREE.Scene,
    obstaclePool: ObjectPool<ObstacleEntity>,
    collectiblePool: ObjectPool<CollectibleEntity>,
    powerUpPool: ObjectPool<PowerUpEntity>,
    rng?: SeededRNG
  ) {
    this.scene = scene;
    this.obstaclePool = obstaclePool;
    this.collectiblePool = collectiblePool;
    this.powerUpPool = powerUpPool;
    this.rng = rng || new SeededRNG(Date.now());
  }

  public reset(): void {
    this.currentSpawnZ = 15;
    this.obstaclePool.releaseAll();
    this.collectiblePool.releaseAll();
    this.powerUpPool.releaseAll();
  }

  public update(scrollDistance: number, difficulty: number, speed: number): void {
    this.currentSpawnZ -= scrollDistance;

    // Keep spawning chunks until currentSpawnZ exceeds SPAWN_HORIZON
    while (this.currentSpawnZ < SPAWN_HORIZON) {
      this.spawnNextChunk(difficulty, speed);
    }

    // Update active obstacles
    for (const obs of this.obstaclePool.getActive()) {
      obs.update(1 / 60, scrollDistance);
    }

    // Update active collectibles
    for (const col of this.collectiblePool.getActive()) {
      col.update(1 / 60, scrollDistance);
    }

    // Update active powerups
    for (const pUp of this.powerUpPool.getActive()) {
      pUp.update(1 / 60, scrollDistance);
    }

    // Clean up inactive items from pools
    this.recyclePassedEntities();
  }

  private spawnNextChunk(difficulty: number, speed: number): void {
    const chunk = this.selectChunk(difficulty, speed);
    if (!chunk) return;

    for (const row of chunk.rows) {
      const rowZ = this.currentSpawnZ + row.z;

      for (let laneIdx = 0; laneIdx < 3; laneIdx++) {
        const lane = LANES[laneIdx];
        const x = lane * LANE_WIDTH;
        const cell = row.cells[laneIdx];

        if (cell.t === 'obstacle') {
          const obs = this.obstaclePool.obtain();
          obs.init(cell.id, lane, rowZ, x);
          if (!this.scene.children.includes(obs.mesh)) {
            this.scene.add(obs.mesh);
          }
        } else if (cell.t === 'vote') {
          const vote = this.collectiblePool.obtain();
          vote.init(cell.value, lane, rowZ, x);
          if (!this.scene.children.includes(vote.mesh)) {
            this.scene.add(vote.mesh);
          }
        } else if (cell.t === 'powerup') {
          const pUp = this.powerUpPool.obtain();
          pUp.init(cell.id, lane, rowZ, x);
          if (!this.scene.children.includes(pUp.mesh)) {
            this.scene.add(pUp.mesh);
          }
        }
      }
    }

    this.currentSpawnZ += chunk.length;
  }

  private selectChunk(difficulty: number, speed: number): Chunk | null {
    const tiers = getAllowedTiers(difficulty);
    const candidateChunks = PARSED_CHUNKS.filter((c) =>
      tiers.some((t) => c.difficulty >= t.minDiff && c.difficulty <= t.maxDiff)
    );

    const pool = candidateChunks.length > 0 ? candidateChunks : PARSED_CHUNKS;

    // Retry up to 5 times with validator check
    for (let attempts = 0; attempts < 5; attempts++) {
      const candidate = this.rng.pick(pool);
      const validation = SpawnValidator.validateChunk(candidate, speed);
      if (validation.valid) {
        return candidate;
      }
    }

    return pool[0] || null;
  }

  private recyclePassedEntities(): void {
    // Release inactive obstacles
    for (const obs of [...this.obstaclePool.getActive()]) {
      if (!obs.active) {
        this.obstaclePool.release(obs);
      }
    }

    // Release inactive collectibles
    for (const col of [...this.collectiblePool.getActive()]) {
      if (!col.active) {
        this.collectiblePool.release(col);
      }
    }

    // Release inactive powerups
    for (const pUp of [...this.powerUpPool.getActive()]) {
      if (!pUp.active) {
        this.powerUpPool.release(pUp);
      }
    }
  }
}
