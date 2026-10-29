'use client';

import React from 'react';
import { Play, Sparkles, Award, Settings, Shirt, HelpCircle, Disc } from 'lucide-react';
import { SaveData } from '../config/constants';

interface MenuScreenProps {
  saveData: SaveData;
  onStart: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
  onOpenMissions: () => void;
  onOpenHowToPlay: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  saveData,
  onStart,
  onOpenShop,
  onOpenSettings,
  onOpenMissions,
  onOpenHowToPlay,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-8 bg-slate-950/80 backdrop-brightness-75 select-none overflow-y-auto">
      {/* Top Bar with Banked Votes & Quick Links */}
      <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-2 bg-amber-500/90 text-slate-950 px-4 py-2 rounded-2xl shadow-lg border border-amber-300 font-extrabold text-sm sm:text-base">
          <Disc className="w-5 h-5 text-slate-900 fill-slate-900" />
          <span className="font-game">{saveData.totalVotes}</span>
          <span className="text-xs uppercase font-sans tracking-wide">Banked Votes</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMissions}
            aria-label="Open Daily Missions"
            className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-slate-700 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Missions</span>
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="Open Settings"
            className="w-10 h-10 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center shadow-md active:scale-95 transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hero Center Section */}
      <div className="flex flex-col items-center justify-center text-center my-auto py-6 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          3D Endless Campaign Meme Game
        </div>

        <h1 className="text-4xl sm:text-6xl font-black font-game tracking-tight text-white drop-shadow-md">
          VOTE <span className="text-amber-400">RUNNER</span>
        </h1>
        <p className="font-hindi text-base sm:text-xl text-slate-300 font-bold mt-1">
          वोट रनर — जन-सम्पर्क मैराथन
        </p>

        <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-3 leading-relaxed">
          Lead the rally as <strong className="text-white">Neta Ji</strong> down endless streets! Collect votes, jump barricades, duck under press boom mics, and don&apos;t let rival <strong className="text-amber-400">Vipaksh Bhai</strong> catch you!
        </p>

        {/* High Score & Best Distance Badges */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs mt-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">High Score</span>
            <span className="font-game text-xl font-extrabold text-amber-400 tabular-nums">
              {saveData.highScore.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Best Distance</span>
            <span className="font-game text-xl font-extrabold text-sky-400 tabular-nums">
              {saveData.bestDistance.toLocaleString()} m
            </span>
          </div>
        </div>

        {/* Big Start CTA Button */}
        <button
          onClick={onStart}
          aria-label="Start Campaign Run"
          className="mt-6 w-full max-w-xs bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-lg sm:text-xl py-4 rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 border-2 border-white/60"
        >
          <Play className="w-6 h-6 fill-slate-950" />
          <span>START CAMPAIGN</span>
        </button>
      </div>

      {/* Bottom Navigation Dock */}
      <div className="flex items-center justify-center gap-3 w-full max-w-md mx-auto pt-2">
        <button
          onClick={onOpenShop}
          aria-label="Open Wardrobe and Skins Shop"
          className="flex-1 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
        >
          <Shirt className="w-4 h-4 text-emerald-400" />
          <span>Wardrobe & Skins</span>
        </button>

        <button
          onClick={onOpenHowToPlay}
          aria-label="How to Play"
          className="flex-1 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
        >
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <span>How to Play</span>
        </button>
      </div>
    </div>
  );
};
