import React, { useState } from 'react';
import { Lock, Delete, Shield, Check } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Logo } from '../common/Logo';

export const PinLockScreen: React.FC = () => {
  const { unlockApp, isLocked, isPinEnabled } = useFinance();
  const [pin, setPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);

  if (!isPinEnabled || !isLocked) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);

      if (newPin.length === 4) {
        const ok = unlockApp(newPin);
        if (!ok) {
          setErrorShake(true);
          setTimeout(() => {
            setErrorShake(false);
            setPin('');
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 bg-obsidian-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 select-none">
      <div className="w-full max-w-xs flex flex-col items-center space-y-6 animate-fadeIn">
        <Logo size="md" showTagline={true} />

        <div className="text-center mt-2">
          <div className="w-12 h-12 rounded-2xl bg-flexible-green/10 border border-flexible-green/20 flex items-center justify-center text-flexible-green mx-auto mb-3 shadow-lg shadow-flexible-green/10">
            <Lock size={22} />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Enter KAVORA PIN</h3>
          <p className="text-xs text-slate-400 mt-0.5">Your 3-Tier finances are protected</p>
        </div>

        {/* 4 Dot Indicators */}
        <div className={`flex items-center gap-4 py-2 ${errorShake ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                pin.length > idx
                  ? 'bg-flexible-green scale-110 shadow-md shadow-flexible-green/40'
                  : 'bg-white/10 border border-white/20'
              }`}
            />
          ))}
        </div>

        {errorShake && (
          <p className="text-xs text-rose-400 font-semibold animate-fadeIn">Incorrect PIN, try again</p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full pt-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="h-14 rounded-2xl bg-obsidian-900/80 hover:bg-obsidian-850 active:bg-flexible-green/20 border border-white/5 text-white font-mono font-bold text-xl transition-all flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-obsidian-900/80 hover:bg-obsidian-850 active:bg-flexible-green/20 border border-white/5 text-white font-mono font-bold text-xl transition-all flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-obsidian-900/40 hover:bg-obsidian-850 border border-white/5 text-slate-400 hover:text-white transition-all flex items-center justify-center"
            aria-label="Delete"
          >
            <Delete size={20} />
          </button>
        </div>

        <p className="text-[11px] text-slate-500 font-mono text-center">
          Default PIN: <b>1234</b>
        </p>
      </div>
    </div>
  );
};
