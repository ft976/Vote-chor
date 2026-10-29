'use client';

import React from 'react';
import { X, Volume2, VolumeX, Music, Smartphone, Eye, RotateCcw } from 'lucide-react';
import { SaveData } from '../config/constants';

interface SettingsScreenProps {
  settings: SaveData['settings'];
  onUpdateSettings: (newSettings: Partial<SaveData['settings']>) => void;
  onResetSave: () => void;
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onResetSave,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-brightness-75 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-2xl font-game font-black text-white">SETTINGS</h3>
            <p className="font-hindi text-slate-400 text-xs">सेटिंग्स और नियंत्रण</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Settings"
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggles List */}
        <div className="flex flex-col gap-3.5 my-6">
          {/* SFX */}
          <div className="flex items-center justify-between bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                {settings.sfx ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-bold text-sm text-white">Sound Effects (SFX)</div>
                <div className="text-xs text-slate-400">Jumps, slides, coin chimes & siren</div>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ sfx: !settings.sfx })}
              role="switch"
              aria-checked={settings.sfx}
              aria-label="Toggle Sound Effects"
              className={`w-12 h-6.5 rounded-full p-1 transition-colors ${
                settings.sfx ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-slate-950 shadow-md transform transition-transform ${
                  settings.sfx ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Music */}
          <div className="flex items-center justify-between bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">Campaign Music</div>
                <div className="text-xs text-slate-400">Desi dhol & rally rhythm beats</div>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ music: !settings.music })}
              role="switch"
              aria-checked={settings.music}
              aria-label="Toggle Background Music"
              className={`w-12 h-6.5 rounded-full p-1 transition-colors ${
                settings.music ? 'bg-pink-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-slate-950 shadow-md transform transition-transform ${
                  settings.music ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Haptics */}
          <div className="flex items-center justify-between bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">Haptic Vibration</div>
                <div className="text-xs text-slate-400">Vibration feedback on stumble</div>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ haptics: !settings.haptics })}
              role="switch"
              aria-checked={settings.haptics}
              aria-label="Toggle Haptic Vibration"
              className={`w-12 h-6.5 rounded-full p-1 transition-colors ${
                settings.haptics ? 'bg-sky-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-slate-950 shadow-md transform transition-transform ${
                  settings.haptics ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">Reduced Motion</div>
                <div className="text-xs text-slate-400">Disables camera stumble screen shake</div>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ reducedMotion: !settings.reducedMotion })}
              role="switch"
              aria-checked={settings.reducedMotion}
              aria-label="Toggle Reduced Motion"
              className={`w-12 h-6.5 rounded-full p-1 transition-colors ${
                settings.reducedMotion ? 'bg-purple-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-slate-950 shadow-md transform transition-transform ${
                  settings.reducedMotion ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              if (confirm('Reset high score, missions, and banked votes to default?')) {
                onResetSave();
              }
            }}
            aria-label="Reset Progress Data"
            className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1.5 p-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Save Data</span>
          </button>

          <button
            onClick={onClose}
            aria-label="Done with settings"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
