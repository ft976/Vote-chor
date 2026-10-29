import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveManager, DEFAULT_SAVE_DATA } from '../src/storage/SaveManager';

test('SaveManager: handles invalid or null candidate safely', () => {
  const manager = SaveManager.getInstance();
  const result = manager.migrateAndSanitize(null);
  assert.equal(result.version, 1);
  assert.equal(result.selectedSkin, 'khadi_white');
  assert.deepEqual(result.unlockedSkins, ['khadi_white']);
});

test('SaveManager: preserves and clamps valid progress data', () => {
  const manager = SaveManager.getInstance();
  const corruptedInput = {
    highScore: 1250,
    totalVotes: 140,
    unlockedSkins: ['saffron_sunset'],
    settings: { sfx: false },
  };

  const result = manager.migrateAndSanitize(corruptedInput);
  assert.equal(result.highScore, 1250);
  assert.equal(result.totalVotes, 140);
  assert.equal(result.settings.sfx, false);
  assert.equal(result.settings.music, true); // fallback default
  assert.ok(result.unlockedSkins.includes('khadi_white'));
  assert.ok(result.unlockedSkins.includes('saffron_sunset'));
});
