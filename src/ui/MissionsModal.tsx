'use client';

import React from 'react';
import { X, Award, CheckCircle2, Disc } from 'lucide-react';
import { Mission } from '../config/constants';

interface MissionsModalProps {
  missions: Mission[];
  bankedVotes: number;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  missions,
  bankedVotes,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-brightness-75 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-2xl font-game font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>CAMPAIGN MISSIONS</span>
            </h3>
            <p className="font-hindi text-slate-400 text-xs">दैनिक जन-सम्पर्क लक्ष्य</p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Missions Modal"
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Missions List */}
        <div className="flex flex-col gap-3 my-5">
          {missions.map((m) => {
            const pct = Math.min(100, Math.round((m.progress / m.goal) * 100));

            return (
              <div
                key={m.id}
                className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>{m.text}</span>
                      {m.done && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
                    <Disc className="w-3.5 h-3.5 fill-amber-400" />
                    <span>+{m.reward}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      m.done ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Progress</span>
                  <span className="font-mono tabular-nums">
                    {Math.floor(m.progress)} / {m.goal} ({pct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            aria-label="Done with missions"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
