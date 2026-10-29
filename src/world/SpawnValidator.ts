import { Chunk, MIN_LANE_CHANGE_INTERVAL, ROW_SPACING } from '../config/constants';
import { OBSTACLES } from '../config/obstacles';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validates whether a chunk is 100% physically passable and fair for the player
 * Rules:
 * 1. Every row has at least one passable lane (not all 3 lanes blocked by full height obstacles)
 * 2. The route is reachable with possible player actions (jump, slide, lane change)
 * 3. No two lane changes are forced closer than MIN_LANE_CHANGE_INTERVAL at the current speed
 */
export class SpawnValidator {
  public static validateChunk(chunk: Chunk, currentSpeed: number): ValidationResult {
    if (!chunk || !chunk.rows || chunk.rows.length === 0) {
      return { valid: true };
    }

    const rows = chunk.rows;
    let previousFeasibleLanes: number[] = [0, 1, 2]; // All lanes initially reachable

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const passableLanesInRow: number[] = [];

      for (let lane = 0; lane < 3; lane++) {
        const cell = row.cells[lane];
        if (cell.t !== 'obstacle') {
          // Empty, vote or power-up is always passable
          passableLanesInRow.push(lane);
        } else {
          // Obstacle: check if it can be beaten
          const def = (OBSTACLES as any)[cell.id];
          if (!def) {
            passableLanesInRow.push(lane);
          } else if (def.kind === 'low' || def.kind === 'high') {
            // Jumpable or slideable
            passableLanesInRow.push(lane);
          } else if (def.kind === 'moving') {
            // Cow moves across lanes; player can time or dodge
            passableLanesInRow.push(lane);
          }
          // Note: 'full' blocks the lane completely, so not in passableLanesInRow
        }
      }

      // Rule 1: At least one lane must be passable
      if (passableLanesInRow.length === 0) {
        return {
          valid: false,
          reason: `Row ${r} has all 3 lanes completely blocked with full obstacles.`,
        };
      }

      // Rule 2 & 3: Reachability and lane-switch interval
      // A lane is reachable if it was passable previously, or adjacent to a previous feasible lane
      const feasibleInThisRow: number[] = [];
      for (const curLane of passableLanesInRow) {
        // Can we transition from any previousFeasibleLane to curLane?
        const canReach = previousFeasibleLanes.some((prevLane) => {
          const laneDelta = Math.abs(curLane - prevLane);
          if (laneDelta === 0) return true;

          // Lane change required: check distance between rows
          const minRequiredDistance = currentSpeed * MIN_LANE_CHANGE_INTERVAL;
          // Row spacing is ROW_SPACING (3 units)
          return ROW_SPACING >= minRequiredDistance * (laneDelta / 2);
        });

        if (canReach) {
          feasibleInThisRow.push(curLane);
        }
      }

      if (feasibleInThisRow.length === 0) {
        return {
          valid: false,
          reason: `Row ${r} is unreachable from feasible lanes of row ${r - 1}.`,
        };
      }

      previousFeasibleLanes = feasibleInThisRow;
    }

    return { valid: true };
  }
}
