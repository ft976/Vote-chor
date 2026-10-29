import test from 'node:test';
import assert from 'node:assert/strict';
import { SpawnValidator } from '../src/world/SpawnValidator';
import { parseAsciiChunk } from '../src/config/chunks';
import { Chunk } from '../src/config/constants';

test('SpawnValidator: passes valid authored chunks', () => {
  const validChunk = parseAsciiChunk({
    id: 'valid_test',
    difficulty: 0.2,
    pattern: [
      '.v.',
      '.B.',
      '.v.',
      'C.v',
      'v..',
    ],
  });

  const res = SpawnValidator.validateChunk(validChunk, 15);
  assert.equal(res.valid, true);
});

test('SpawnValidator: rejects row where all 3 lanes are blocked by full obstacles', () => {
  const impossibleChunk: Chunk = {
    id: 'impossible_block',
    length: 9,
    difficulty: 0.5,
    rows: [
      {
        z: 0,
        cells: [
          { t: 'obstacle', id: 'traffic_car' },
          { t: 'obstacle', id: 'traffic_car' },
          { t: 'obstacle', id: 'traffic_car' },
        ],
      },
    ],
  };

  const res = SpawnValidator.validateChunk(impossibleChunk, 15);
  assert.equal(res.valid, false);
  assert.match(res.reason || '', /all 3 lanes completely blocked/i);
});

test('SpawnValidator: allows rows with jumpable or slideable obstacles', () => {
  const jumpableChunk = parseAsciiChunk({
    id: 'jumpable_row',
    difficulty: 0.3,
    pattern: [
      'BBB', // All low obstacles, can jump!
      '.v.',
    ],
  });

  const res = SpawnValidator.validateChunk(jumpableChunk, 15);
  assert.equal(res.valid, true);
});
