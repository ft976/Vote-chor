'use client';

import React from 'react';
import { X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Shield, Zap, Compass, Coffee } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-brightness-75 select-none overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-2xl font-game font-black text-white">HOW TO PLAY</h3>
            <p className="font-hindi text-slate-400 text-xs">खेलने के नियम और नियंत्रण</p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close How to Play"
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col gap-4 my-4 overflow-y-auto pr-1 text-xs sm:text-sm text-slate-300">
          {/* Controls */}
          <div>
            <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs mb-2">Controls</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
                <div className="flex gap-1 text-amber-400 font-bold">
                  <ArrowLeft className="w-4 h-4" />
                  <ArrowRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">A / D or Swipe Left/Right</div>
                  <div className="text-slate-400 text-[11px]">Switch between 3 lanes</div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
                <div className="text-amber-400 font-bold">
                  <ArrowUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">W / Space or Swipe Up</div>
                  <div className="text-slate-400 text-[11px]">Jump over low barriers</div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
                <div className="text-amber-400 font-bold">
                  <ArrowDown className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">S or Swipe Down</div>
                  <div className="text-slate-400 text-[11px]">Slide under overhead mics</div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
                <div className="text-amber-400 font-bold font-mono">ESC/P</div>
                <div>
                  <div className="font-bold text-white">Pause Menu</div>
                  <div className="text-slate-400 text-[11px]">Take a quick chai break</div>
                </div>
              </div>
            </div>
          </div>

          {/* How to beat obstacles */}
          <div>
            <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs mb-2">Beat Obstacles</h4>
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">🚧 Barricade & Pothole:</span>
                <span className="text-amber-400 font-bold uppercase">JUMP (Space / Up)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">🎙️ Press Mics & Banners:</span>
                <span className="text-sky-400 font-bold uppercase">SLIDE (Down / S)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">🚗 Stalled Cars & Stray Cows:</span>
                <span className="text-pink-400 font-bold uppercase">SWITCH LANE</span>
              </div>
            </div>
          </div>

          {/* Powerups Guide */}
          <div>
            <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs mb-2">Campaign Power-ups</h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400 shrink-0" />
                <div><strong>Jeep Magnet:</strong> Pulls all votes</div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <div><strong>SPG Shield:</strong> Absorbs 1 stumble</div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                <div><strong>Helicopter:</strong> Fly over obstacles</div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-purple-400 shrink-0" />
                <div><strong>Chai Break:</strong> Slows time to 0.7x</div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 italic mt-1 text-center">
            Notice: All characters, situations and dialogues are fictional cartoon caricatures for lighthearted comedy.
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            aria-label="Got it"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition-all"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
