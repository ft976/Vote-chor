'use client';

import React from 'react';
import { RotateCcw, Home, Heart, Award, Disc } from 'lucide-react';
import { formatGameOverTicker } from '../config/lines';
import { REVIVE_COST } from '../config/constants';

interface GameOverScreenProps {
  score: number;
  distance: number;
  votes: number;
  highScore: number;
  totalBankedVotes: number;
  canRevive: boolean;
  onRevive: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  distance,
  votes,
  highScore,
  totalBankedVotes,
  canRevive,
  onRevive,
  onRestart,
  onHome,
}) => {
  const isNewRecord = score >= highScore && score > 0;
  const tickerText = formatGameOverTicker(distance, votes);

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between p-4 sm:p-6 bg-slate-950/85 backdrop-brightness-75 select-none overflow-y-auto">
      {/* Breaking News Ticker Bar */}
      <div className="w-full max-w-xl mx-auto bg-red-600 border border-red-500 rounded-xl overflow-hidden shadow-xl flex items-center">
        <div className="bg-red-800 text-white font-black text-xs px-3 py-2 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          FLASH
        </div>
        <div className="overflow-hidden whitespace-nowrap text-white font-bold text-xs sm:text-sm px-3 py-1.5 flex-1">
          <div className="animate-ticker inline-block">{tickerText}</div>
        </div>
      </div>

      {/* Main Score Card Modal */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full mx-auto my-auto shadow-2xl text-center flex flex-col items-center">
        {isNewRecord && (
          <div className="inline-flex items-center gap-1.5 bg-amber-500 text-slate-950 font-black text-xs uppercase px-3 py-1 rounded-full mb-3 shadow-md">
            <Award className="w-4 h-4 fill-slate-950" />
            NEW ALL-TIME RECORD!
          </div>
        )}

        <h2 className="text-3xl sm:text-4xl font-game font-black text-white">
          CAUGHT BY <span className="text-red-500">VIPAKSH BHAI!</span>
        </h2>
        <p className="font-hindi text-slate-400 text-sm font-semibold mt-1">
          विपक्ष भाई ने प्रेस कॉन्फ्रेंस में घेर लिया!
        </p>

        {/* Big Score Display */}
        <div className="mt-5 w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
          <span className="text-xs uppercase font-bold text-slate-400">Total Run Score</span>
          <span className="text-4xl sm:text-5xl font-game font-black text-amber-400 tabular-nums">
            {score.toLocaleString()}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full mt-3">
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Distance</span>
            <span className="font-game text-xl font-bold text-sky-400 tabular-nums">
              {Math.floor(distance)} m
            </span>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Votes Collected</span>
            <span className="font-game text-xl font-bold text-amber-400 tabular-nums">
              +{votes}
            </span>
          </div>
        </div>

        {/* Banked Votes Tally */}
        <div className="mt-3 text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <span>Banked Balance:</span>
          <Disc className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <strong className="text-white font-game text-sm">{totalBankedVotes}</strong>
        </div>

        {/* Revive Button if eligible */}
        {canRevive && (
          <button
            onClick={onRevive}
            aria-label="Revive with Banked Votes"
            className="mt-5 w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 border border-emerald-400/40"
          >
            <Heart className="w-5 h-5 fill-white text-white animate-pulse" />
            <span>REVIVE WITH SPG CORDON ({REVIVE_COST} Votes)</span>
          </button>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full mt-4">
          <button
            onClick={onHome}
            aria-label="Return to Main Menu"
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm py-3 px-4 rounded-2xl border border-slate-700 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Menu</span>
          </button>

          <button
            onClick={onRestart}
            aria-label="Play Again"
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm py-3 px-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
};
