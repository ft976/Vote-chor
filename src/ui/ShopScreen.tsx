'use client';

import React from 'react';
import { X, Check, Lock, Sparkles, Disc } from 'lucide-react';
import { CHARACTERS } from '../config/characters';

interface ShopScreenProps {
  bankedVotes: number;
  unlockedSkins: string[];
  selectedSkin: string;
  onSelectSkin: (skinId: string) => void;
  onUnlockSkin: (skinId: string, cost: number) => void;
  onClose: () => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({
  bankedVotes,
  unlockedSkins,
  selectedSkin,
  onSelectSkin,
  onUnlockSkin,
  onClose,
}) => {
  const skins = CHARACTERS.player.skins;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-brightness-75 select-none overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-2xl font-game font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>WARDROBE & SKINS</span>
            </h3>
            <p className="font-hindi text-slate-400 text-xs">नेता जी का नया कुर्ता और साफ़ा</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-amber-500/90 text-slate-950 px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow">
              <Disc className="w-4 h-4 text-slate-900 fill-slate-900" />
              <span className="font-game text-sm">{bankedVotes}</span>
            </div>

            <button
              onClick={onClose}
              aria-label="Close Shop"
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Skins Grid */}
        <div className="flex flex-col gap-3 my-5 overflow-y-auto pr-1">
          {skins.map((skin) => {
            const isUnlocked = unlockedSkins.includes(skin.id);
            const isSelected = selectedSkin === skin.id;
            const canAfford = bankedVotes >= skin.cost;

            return (
              <div
                key={skin.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/80 shadow-md'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Visual Palette Preview */}
                <div className="flex items-center gap-3.5">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-11 h-11 rounded-2xl shadow-inner border-2 border-white/20 flex items-center justify-center relative overflow-hidden"
                      style={{ backgroundColor: skin.kurtaColor }}
                    >
                      <div
                        className="w-5 h-7 rounded-sm shadow-sm"
                        style={{ backgroundColor: skin.vestColor }}
                      />
                      <div
                        className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full"
                        style={{ backgroundColor: skin.capColor }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{skin.name}</span>
                      {isSelected && (
                        <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 max-w-xs">{skin.description}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                      <span>Trail effect:</span>
                      <div
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: skin.trailColor }}
                      />
                    </div>
                  </div>
                </div>

                {/* Unlock / Select Button */}
                <div>
                  {isUnlocked ? (
                    <button
                      onClick={() => onSelectSkin(skin.id)}
                      disabled={isSelected}
                      aria-label={`Select ${skin.name}`}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-slate-800 text-amber-400 cursor-default'
                          : 'bg-slate-800 hover:bg-slate-700 text-white active:scale-95'
                      }`}
                    >
                      {isSelected ? (
                        <span className="flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Equipped
                        </span>
                      ) : (
                        'Equip'
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => onUnlockSkin(skin.id, skin.cost)}
                      disabled={!canAfford}
                      aria-label={`Unlock ${skin.name} for ${skin.cost} votes`}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95 shadow-md'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{skin.cost} Votes</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            aria-label="Close Shop"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
