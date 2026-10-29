import test from 'node:test';
import assert from 'node:assert/strict';
import { ChaseSystem } from '../src/systems/ChaseSystem';
import { GAP_MAX, GAP_START, STUMBLE_GAP_LOSS } from '../src/config/constants';

test('ChaseSystem: starts with full gap', () => {
  const chase = new ChaseSystem();
  assert.equal(chase.getGap(), GAP_START);
  assert.equal(chase.getMode(), 'chasing');
});

test('ChaseSystem: stumble reduces gap by STUMBLE_GAP_LOSS', () => {
  const chase = new ChaseSystem();
  const res = chase.onStumble(false, false);
  assert.equal(res.caught, false);
  assert.equal(res.gapLost, STUMBLE_GAP_LOSS);
  assert.equal(chase.getGap(), GAP_START - STUMBLE_GAP_LOSS); // 10 - 6 = 4
  assert.equal(chase.getMode(), 'closing');
});

test('ChaseSystem: two consecutive stumbles end run (caught)', () => {
  const chase = new ChaseSystem();
  chase.onStumble(false, false); // gap = 4
  const res2 = chase.onStumble(false, false); // gap = 0
  assert.equal(res2.caught, true);
  assert.equal(chase.getGap(), 0);
  assert.equal(chase.getMode(), 'caught');
});

test('ChaseSystem: shield absorbs stumble with zero gap loss', () => {
  const chase = new ChaseSystem();
  const res = chase.onStumble(true, false); // has shield
  assert.equal(res.caught, false);
  assert.equal(res.gapLost, 0);
  assert.equal(chase.getGap(), GAP_START);
});

test('ChaseSystem: clean running slowly recovers gap up to GAP_MAX', () => {
  const chase = new ChaseSystem();
  chase.setGap(5.0);
  chase.update(5.0, false); // 5 sec * 0.4 recovery = +2.0 gap -> 7.0
  assert.equal(Math.round(chase.getGap() * 10) / 10, 7.0);
});
