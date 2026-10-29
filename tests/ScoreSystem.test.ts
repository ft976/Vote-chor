import test from 'node:test';
import assert from 'node:assert/strict';
import { ScoreSystem } from '../src/systems/ScoreSystem';

test('ScoreSystem: increments distance correctly over time', () => {
  const scoreSystem = new ScoreSystem();
  scoreSystem.update(1.0, 12, false); // 1 sec at 12 u/s
  assert.equal(scoreSystem.getDistance(), 12);
  assert.equal(scoreSystem.getScore(), 12);
});

test('ScoreSystem: adds votes and calculates score formula', () => {
  const scoreSystem = new ScoreSystem();
  scoreSystem.update(2.0, 10, false); // distance = 20
  scoreSystem.addVote(5); // 5 votes collected

  // Formula: floor(distance) + votesCollected * 10 * multiplier
  // 20 + 5 * 10 * 1 = 70
  assert.equal(scoreSystem.getScore(), 70);
});

test('ScoreSystem: multiplier doubles vote value in score calculation', () => {
  const scoreSystem = new ScoreSystem();
  scoreSystem.update(1.0, 10, true); // distance = 10, multiplier active (2x)
  scoreSystem.addVote(2); // 2 votes

  // Formula: 10 + 2 * 10 * 2 = 50
  assert.equal(scoreSystem.getScore(), 50);
});
