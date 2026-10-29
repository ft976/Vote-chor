'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Game } from '../src/core/Game';
import { GameState } from '../src/core/EventBus';
import { PowerUpId, SaveData } from '../src/config/constants';
import { HUD } from '../src/ui/HUD';
import { MenuScreen } from '../src/ui/MenuScreen';
import { PauseScreen } from '../src/ui/PauseScreen';
import { GameOverScreen } from '../src/ui/GameOverScreen';
import { SettingsScreen } from '../src/ui/SettingsScreen';
import { ShopScreen } from '../src/ui/ShopScreen';
import { MissionsModal } from '../src/ui/MissionsModal';
import { HowToPlayModal } from '../src/ui/HowToPlayModal';

export default function GamePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);

  const [gameState, setGameState] = useState<GameState>('Menu');
  const [score, setScore] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [votes, setVotes] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [chaseGap, setChaseGap] = useState<number>(10);
  const [activePowerUps, setActivePowerUps] = useState<Partial<Record<PowerUpId, number>>>({});
  const [activeSpeech, setActiveSpeech] = useState<string | null>(null);
  const [shoutMessage, setShoutMessage] = useState<{ text: string; subtext?: string } | null>(null);

  const [saveData, setSaveData] = useState<SaveData | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showShop, setShowShop] = useState<boolean>(false);
  const [showMissions, setShowMissions] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  // Initialize Game engine once
  useEffect(() => {
    if (!containerRef.current) return;

    const game = new Game(containerRef.current);
    gameRef.current = game;
    setSaveData(game.saveManager.getData());

    // Event Bus Subscriptions
    const unsubState = game.eventBus.on('state:changed', (e) => {
      setGameState(e.to);
      setSaveData({ ...game.saveManager.getData() });
    });

    const unsubScore = game.eventBus.on('score:changed', (e) => {
      setScore(e.score);
      setDistance(e.distance);
      setVotes(e.votes);
      setMultiplier(e.multiplier);
    });

    const unsubStumble = game.eventBus.on('stumble', (e) => {
      setChaseGap(e.gap);
    });

    const unsubPowerStart = game.eventBus.on('powerup:start', () => {
      // Handled via periodic poll or game loop
    });

    const unsubSpeech = game.eventBus.on('rival:speak', (e) => {
      setActiveSpeech(e.line);
      window.setTimeout(() => setActiveSpeech(null), 3500);
    });

    const unsubShout = game.eventBus.on('shout', (e) => {
      setShoutMessage(e);
      window.setTimeout(() => setShoutMessage(null), 2500);
    });

    // Start engine loop
    game.start();

    // Check ?autostart=1 parameter for instant play / headless testing
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      game.startNewRun();
    }

    // Interval to refresh HUD timers and chaser gap at low frequency
    const hudInterval = setInterval(() => {
      if (game.stateMachine.state === 'Playing') {
        setChaseGap(Math.round((window as any).__VOTE_RUNNER_GAME__?.chaseSystem?.getGap() ?? 10));
        setActivePowerUps({
          ...((window as any).__VOTE_RUNNER_GAME__?.powerUpSystem?.getActiveMap() ?? {}),
        });
      }
    }, 150);

    return () => {
      clearInterval(hudInterval);
      unsubState();
      unsubScore();
      unsubStumble();
      unsubPowerStart();
      unsubSpeech();
      unsubShout();
      game.destroy();
    };
  }, []);

  const handleStartRun = () => {
    if (gameRef.current) {
      gameRef.current.startNewRun();
    }
  };

  const handlePause = () => {
    if (gameRef.current) {
      gameRef.current.togglePause();
    }
  };

  const handleResume = () => {
    if (gameRef.current) {
      gameRef.current.resume();
    }
  };

  const handleRestart = () => {
    if (gameRef.current) {
      gameRef.current.startNewRun();
    }
  };

  const handleRevive = () => {
    if (gameRef.current) {
      gameRef.current.revive();
    }
  };

  const handleHome = () => {
    if (gameRef.current) {
      gameRef.current.stateMachine.transitionTo('Menu');
    }
  };

  const handleSwipe = (dir: 'left' | 'right' | 'jump' | 'slide') => {
    if (gameRef.current) {
      gameRef.current.sendInput(dir);
    }
  };

  const handleUpdateSettings = (newSettings: Partial<SaveData['settings']>) => {
    if (!gameRef.current) return;
    const current = gameRef.current.saveManager.getData();
    const updated = { ...current.settings, ...newSettings };
    gameRef.current.saveManager.save({ settings: updated });
    gameRef.current.audioManager.setSfxEnabled(updated.sfx);
    gameRef.current.audioManager.setMusicEnabled(updated.music);
    setSaveData({ ...gameRef.current.saveManager.getData() });
  };

  const handleResetSave = () => {
    if (!gameRef.current) return;
    gameRef.current.saveManager.resetAll();
    setSaveData({ ...gameRef.current.saveManager.getData() });
  };

  const handleSelectSkin = (skinId: string) => {
    if (!gameRef.current) return;
    gameRef.current.setSkin(skinId);
    setSaveData({ ...gameRef.current.saveManager.getData() });
  };

  const handleUnlockSkin = (skinId: string, cost: number) => {
    if (!gameRef.current) return;
    const current = gameRef.current.saveManager.getData();
    if (current.totalVotes >= cost) {
      gameRef.current.saveManager.spendBankedVotes(cost);
      const unlocked = [...current.unlockedSkins, skinId];
      gameRef.current.saveManager.save({ unlockedSkins: unlocked });
      gameRef.current.setSkin(skinId);
      setSaveData({ ...gameRef.current.saveManager.getData() });
    }
  };

  const currentSave = saveData || {
    version: 1 as const,
    highScore: 0,
    bestVotes: 0,
    bestDistance: 0,
    totalVotes: 50,
    settings: { sfx: true, music: true, haptics: true, reducedMotion: false },
    unlockedSkins: ['khadi_white'],
    selectedSkin: 'khadi_white',
    missions: [],
    lastDailyReset: '',
  };

  return (
    <main
      data-state={gameState}
      data-testid="vote-runner-game"
      className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans"
    >
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        data-testid="webgl-canvas-container"
        className="absolute inset-0 w-full h-full z-0 cursor-pointer"
      />

      {/* In-Game HUD (Visible during Playing and Paused) */}
      {(gameState === 'Playing' || gameState === 'Paused') && (
        <HUD
          score={score}
          distance={distance}
          votes={votes}
          multiplier={multiplier}
          chaseGap={chaseGap}
          activePowerUps={activePowerUps}
          activeSpeech={activeSpeech}
          shoutMessage={shoutMessage}
          onPause={handlePause}
          onSwipe={handleSwipe}
        />
      )}

      {/* Main Menu Screen */}
      {gameState === 'Menu' && (
        <MenuScreen
          saveData={currentSave}
          onStart={handleStartRun}
          onOpenShop={() => setShowShop(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenMissions={() => setShowMissions(true)}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'Paused' && (
        <PauseScreen
          onResume={handleResume}
          onRestart={handleRestart}
          onSettings={() => setShowSettings(true)}
          onHome={handleHome}
        />
      )}

      {/* Game Over Screen */}
      {gameState === 'GameOver' && (
        <GameOverScreen
          score={score}
          distance={distance}
          votes={votes}
          highScore={currentSave.highScore}
          totalBankedVotes={currentSave.totalVotes}
          canRevive={gameRef.current ? gameRef.current.canRevive() : false}
          onRevive={handleRevive}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsScreen
          settings={currentSave.settings}
          onUpdateSettings={handleUpdateSettings}
          onResetSave={handleResetSave}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Wardrobe & Skins Shop Modal */}
      {showShop && (
        <ShopScreen
          bankedVotes={currentSave.totalVotes}
          unlockedSkins={currentSave.unlockedSkins}
          selectedSkin={currentSave.selectedSkin}
          onSelectSkin={handleSelectSkin}
          onUnlockSkin={handleUnlockSkin}
          onClose={() => setShowShop(false)}
        />
      )}

      {/* Missions Modal */}
      {showMissions && (
        <MissionsModal
          missions={currentSave.missions}
          bankedVotes={currentSave.totalVotes}
          onClose={() => setShowMissions(false)}
        />
      )}

      {/* How To Play Modal */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}
    </main>
  );
}
