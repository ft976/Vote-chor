'use client';

import React from 'react';
import { Play, RotateCcw, Home, Settings } from 'lucide-react';

interface PauseScreenProps {
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onHome: () => void;
}

export const PauseScreen: React.FC<PauseScreenProps> = ({
  onResume,
  onRestart,
  onSettings,
  onHome,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-brightness-75 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center">
        <h2 className="text-3xl font-game font-black text-white">GAME PAUSED</h2>
        <p className="font-hindi text-slate-400 text-xs sm:text-sm mt-1">रुकिए — चाय ब्रेक चल रहा है!</p>

        <div className="flex flex-col gap-3 w-full mt-6">
          <button
            onClick={onResume}
            aria-label="Resume Campaign Run"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>RESUME RUN</span>
          </button>

          <button
            onClick={onRestart}
            aria-label="Restart Current Run"
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm py-3 rounded-2xl border border-slate-700 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart</span>
          </button>

          <button
            onClick={onSettings}
            aria-label="Open Settings"
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm py-3 rounded-2xl border border-slate-700 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={onHome}
            aria-label="Return to Main Menu"
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm py-3 rounded-2xl border border-slate-700 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
