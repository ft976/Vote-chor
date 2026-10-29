import { PlayerState } from '../config/constants';
import { Box3D, checkAABBOverlap } from '../utils/math';
import { ObstacleEntity } from '../entities/Obstacle';
import { CollectibleEntity } from '../entities/Collectible';
import { PowerUpEntity } from '../entities/PowerUp';

export interface CollisionResults {
  stumbles: ObstacleEntity[];
  collectedVotes: CollectibleEntity[];
  collectedPowerUps: PowerUpEntity[];
}

export class CollisionSystem {
  public checkCollisions(
    player: PlayerState,
    obstacles: readonly ObstacleEntity[],
    collectibles: readonly CollectibleEntity[],
    powerUps: readonly PowerUpEntity[],
    magnetActive: boolean = false
  ): CollisionResults {
    const results: CollisionResults = {
      stumbles: [],
      collectedVotes: [],
      collectedPowerUps: [],
    };

    // Calculate player 3D bounding box
    const playerBox: Box3D = this.getPlayerBoundingBox(player);

    // 1. Check Obstacles (only near the player, z in [-2, 5])
    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      if (!obs.active) continue;

      // Distance check in Z: player is at z = 0
      if (obs.z < -2 || obs.z > 6) continue;

      const obsBox = obs.getBoundingBox();
      if (checkAABBOverlap(playerBox, obsBox)) {
        results.stumbles.push(obs);
      }
    }

    // 2. Check Collectibles (Votes)
    for (let i = 0; i < collectibles.length; i++) {
      const vote = collectibles[i];
      if (!vote.active) continue;

      // Magnet pull: if magnet is active, pull votes towards player within 12 units
      if (magnetActive && vote.z > -2 && vote.z < 14) {
        vote.x += (player.x - vote.x) * 0.25;
      }

      if (vote.z < -2 || vote.z > 6) continue;

      const voteBox = vote.getBoundingBox();
      if (checkAABBOverlap(playerBox, voteBox)) {
        results.collectedVotes.push(vote);
      }
    }

    // 3. Check Power-Ups
    for (let i = 0; i < powerUps.length; i++) {
      const pUp = powerUps[i];
      if (!pUp.active) continue;

      if (pUp.z < -2 || pUp.z > 6) continue;

      const pBox = pUp.getBoundingBox();
      if (checkAABBOverlap(playerBox, pBox)) {
        results.collectedPowerUps.push(pUp);
      }
    }

    return results;
  }

  private getPlayerBoundingBox(player: PlayerState): Box3D {
    const halfWidth = 0.45;
    const halfDepth = 0.45;

    if (player.action === 'sliding') {
      // Shrunk height during slide
      return {
        minX: player.x - halfWidth,
        maxX: player.x + halfWidth,
        minY: 0,
        maxY: 0.75,
        minZ: -halfDepth,
        maxZ: halfDepth,
      };
    }

    // Normal or jumping
    return {
      minX: player.x - halfWidth,
      maxX: player.x + halfWidth,
      minY: player.y,
      maxY: player.y + 1.85,
      minZ: -halfDepth,
      maxZ: halfDepth,
    };
  }
}
