import * as THREE from 'three';
import { Track } from './Track';
import { Environment } from './Environment';
import { ChunkSpawner } from './ChunkSpawner';
import { ObjectPool } from '../core/Pool';
import { ObstacleEntity } from '../entities/Obstacle';
import { CollectibleEntity } from '../entities/Collectible';
import { PowerUpEntity } from '../entities/PowerUp';

export class WorldManager {
  public scene: THREE.Scene;
  public track: Track;
  public environment: Environment;
  public chunkSpawner: ChunkSpawner;

  public obstaclePool: ObjectPool<ObstacleEntity>;
  public collectiblePool: ObjectPool<CollectibleEntity>;
  public powerUpPool: ObjectPool<PowerUpEntity>;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Initialize Pools
    this.obstaclePool = new ObjectPool(
      () => new ObstacleEntity(),
      (item) => item.deactivate(),
      25
    );

    this.collectiblePool = new ObjectPool(
      () => new CollectibleEntity(),
      (item) => item.deactivate(),
      40
    );

    this.powerUpPool = new ObjectPool(
      () => new PowerUpEntity(),
      (item) => item.deactivate(),
      10
    );

    // Initialize Subsystems
    this.track = new Track();
    this.scene.add(this.track.group);

    this.environment = new Environment(this.scene);
    this.scene.add(this.environment.group);

    this.chunkSpawner = new ChunkSpawner(
      this.scene,
      this.obstaclePool,
      this.collectiblePool,
      this.powerUpPool
    );
  }

  public reset(): void {
    this.chunkSpawner.reset();
  }

  public update(scrollDistance: number, distance: number, difficulty: number, speed: number): void {
    this.track.update(scrollDistance);
    this.environment.update(scrollDistance, distance);
    this.chunkSpawner.update(scrollDistance, difficulty, speed);
  }
}
