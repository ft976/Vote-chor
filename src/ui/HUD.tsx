'use client';

import React from 'react';
import { Pause, Zap, Shield, Compass, Coffee, Disc } from 'lucide-react';
import { PowerUpId } from '../config/constants';

interface HUDProps {
  score: number;
  distance: number;
  votes: number;
  multiplier: number;
  chaseGap: number; // 0..10
  activePowerUps: Partial<Record<PowerUpId, number>>;
  activeSpeech: string | null;
  shoutMessage: { text: string; subtext?: string } | null;
  onPause: () => void;
  onSwipe: (dir: 'left' | 'right' | 'jump' | 'slide') => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  distance,
  votes,
  multiplier,
  chaseGap,
  activePowerUps,
  activeSpeech,
  shoutMessage,
  onPause,
  onSwipe,
}) => {
  // Gap danger: 0 is caught, 10 is max safe
  const gapDanger = Math.max(0, Math.min(1, (5 - chaseGap) / 5));
  const isHighDanger = chaseGap < 4;

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-3 sm:p-5 z-20">
      {/* Red chase danger screen border vignette */}
      {isHighDanger && (
        <div
          className="absolute inset-0 pointer-events-none border-4 sm:border-8 border-red-600/60 animate-pulse"
          style={{ boxShadow: 'inset 0 0 60px rgba(220, 38, 38, 0.45)' }}
        />
      )}

      {/* Top Header Bar */}
      <div className="flex items-start justify-between w-full pointer-events-auto">
        {/* Left: Distance & Score */}
        <div className="flex flex-col gap-1.5">
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-1.5 shadow-lg flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Distance</span>
            <span className="font-game text-xl sm:text-2xl font-bold text-amber-400 tabular-nums">
              {Math.floor(distance)} <span className="text-xs text-amber-300 font-sans">m</span>
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-1.5 shadow-lg flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Score</span>
            <span className="font-game text-lg sm:text-xl font-bold text-white tabular-nums">
              {score.toLocaleString()}
            </span>
            {multiplier > 1 && (
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs px-2 py-0.5 rounded-full shadow-md animate-bounce">
                2x REEL
              </span>
            )}
          </div>
        </div>

        {/* Center: Chase Proximity Bar */}
        <div className="flex flex-col items-center">
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3 py-1.5 shadow-lg flex flex-col items-center min-w-[130px] sm:min-w-[170px]">
            <div className="flex items-center justify-between w-full text-[10px] font-bold uppercase tracking-wider mb-1">
              <span className={isHighDanger ? 'text-red-400 animate-pulse' : 'text-slate-300'}>
                {isHighDanger ? '⚠️ RIVAL CLOSING IN!' : 'Rival Gap'}
              </span>
              <span className="text-amber-400 tabular-nums">{Math.round(chaseGap * 10)}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  isHighDanger
                    ? 'bg-gradient-to-r from-red-600 to-orange-500'
                    : 'bg-gradient-to-r from-emerald-500 to-amber-400'
                }`}
                style={{ width: `${Math.max(8, (chaseGap / 10) * 100)}%` }}
              />
            </div>
          </div>

          {/* Active Rival Speech Bubble */}
          {activeSpeech && (
            <div className="mt-2 bg-red-600/95 text-white text-xs sm:text-sm font-hindi font-bold px-3 py-1.5 rounded-2xl shadow-xl border border-red-400/80 animate-bounce max-w-[220px] text-center">
              📢 Vipaksh: &quot;{activeSpeech}&quot;
            </div>
          )}
        </div>

        {/* Right: Votes & Pause Button */}
        <div className="flex items-center gap-2">
          <div className="bg-amber-500/95 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl shadow-lg border border-amber-300 flex items-center gap-1.5">
            <Disc className="w-4 h-4 text-slate-900 fill-slate-900" />
            <span className="font-game text-lg sm:text-xl font-extrabold tabular-nums">{votes}</span>
          </div>

          <button
            onClick={onPause}
            aria-label="Pause Game"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Middle: Shouts & Pop-up announcements */}
      {shoutMessage && (
        <div className="self-center flex flex-col items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-200">
          <div className="bg-amber-500 text-slate-950 font-game font-black text-2xl sm:text-4xl px-6 py-2 rounded-2xl shadow-2xl border-2 border-white uppercase tracking-wider transform -rotate-1">
            {shoutMessage.text}
          </div>
          {shoutMessage.subtext && (
            <div className="mt-1 bg-slate-900/90 text-amber-300 text-xs sm:text-sm font-semibold px-4 py-1 rounded-full border border-amber-500/40">
              {shoutMessage.subtext}
            </div>
          )}
        </div>
      )}

      {/* Bottom Area: Active Power-Up Timers & On-screen mobile quick controls */}
      <div className="flex flex-col gap-2 w-full">
        {/* Active Power-Up Badges */}
        <div className="flex items-center gap-2 justify-center flex-wrap">
          {Object.entries(activePowerUps).map(([id, time]) => {
            if (!time || time <= 0) return null;
            return (
              <div
                key={id}
                className="bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg text-xs font-bold text-white pointer-events-auto"
              >
                {id === 'magnet' && <Zap className="w-4 h-4 text-blue-400" />}
                {id === 'multiplier' && <span className="text-pink-400 font-black">2x</span>}
                {id === 'shield' && <Shield className="w-4 h-4 text-emerald-400" />}
                {id === 'helicopter' && <Compass className="w-4 h-4 text-amber-400" />}
                {id === 'slowmo' && <Coffee className="w-4 h-4 text-purple-400" />}
                <span className="capitalize">{id}</span>
                <span className="text-amber-400 font-mono tabular-nums">{Math.ceil(time)}s</span>
              </div>
            );
          })}
        </div>

        {/* On-Screen Touch Direction Arrows for Mobile & Accessibility */}
        <div className="flex items-center justify-between w-full pt-1 pointer-events-auto max-w-sm mx-auto">
          <button
            onClick={() => onSwipe('left')}
            aria-label="Move Lane Left"
            className="w-14 h-14 rounded-2xl bg-slate-900/85 hover:bg-slate-800 active:bg-amber-500 active:text-slate-950 text-white border border-slate-700 flex items-center justify-center font-bold text-lg shadow-lg active:scale-95 transition-all"
          >
            ←
          </button>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => onSwipe('jump')}
              aria-label="Jump Over Obstacle"
              className="w-24 h-11 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-1"
            >
              ▲ JUMP
            </button>
            <button
              onClick={() => onSwipe('slide')}
              aria-label="Slide Under Obstacle"
              className="w-24 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-600 shadow-lg transition-all flex items-center justify-center gap-1"
            >
              ▼ SLIDE
            </button>
          </div>

          <button
            onClick={() => onSwipe('right')}
            aria-label="Move Lane Right"
            className="w-14 h-14 rounded-2xl bg-slate-900/85 hover:bg-slate-800 active:bg-amber-500 active:text-slate-950 text-white border border-slate-700 flex items-center justify-center font-bold text-lg shadow-lg active:scale-95 transition-all"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};
