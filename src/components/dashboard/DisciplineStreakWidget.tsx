import React, { useState } from 'react';
import { Flame, Award, Shield, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';

export const DisciplineStreakWidget: React.FC = () => {
  const { ledger } = useFinance();
  const [showInfoModal, setShowInfoModal] = useState(false);

  const { discipline } = ledger;

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        {/* Streak Card */}
        <div 
          onClick={() => setShowInfoModal(true)}
          className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-obsidian-900 to-amber-950/20 border border-amber-500/20 hover:border-amber-500/40 transition-all flex items-center justify-between cursor-pointer group shadow-md"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
              <Flame size={18} className="text-amber-400 fill-amber-400/30 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block leading-tight">
                STREAK
              </span>
              <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1">
                <span>{discipline.streakDays}d</span>
                <span>🔥</span>
              </h4>
            </div>
          </div>
        </div>

        {/* Discipline Score Card */}
        <div 
          onClick={() => setShowInfoModal(true)}
          className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-obsidian-900 to-flexible-green/10 border border-flexible-green/20 hover:border-flexible-green/40 transition-all flex items-center justify-between cursor-pointer group shadow-md"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-flexible-green/15 border border-flexible-green/30 flex items-center justify-center text-flexible-green group-hover:scale-105 transition-transform shrink-0 text-base sm:text-lg">
              {discipline.badgeIcon}
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-flexible-green block leading-tight">
                DISCIPLINE
              </span>
              <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1">
                <span>{discipline.score}</span>
                <span className="text-[10px] font-semibold text-flexible-mint truncate max-w-[65px] sm:max-w-none">• {discipline.badgeTitle}</span>
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Discipline Breakdown Modal */}
      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="🔥 Financial Health & Discipline Breakdown"
        subtitle="How KAVORA grades your 3-Tier money habits"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400">Current Health Score:</span>
              <span className="text-base font-bold font-mono text-flexible-green">{discipline.score} / 100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400">Discipline Level:</span>
              <span className="font-bold text-white flex items-center gap-1">
                <span>{discipline.badgeIcon}</span>
                <span>{discipline.badgeTitle}</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400">Under-Budget Days:</span>
              <span className="font-mono text-flexible-mint font-bold">{discipline.underBudgetDaysCount} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400">Overspent Days:</span>
              <span className="font-mono text-rose-400 font-bold">{discipline.overBudgetDaysCount} days</span>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white">How to earn a 100/100 score:</h5>
            <ul className="space-y-1.5 text-[11.5px] text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-flexible-green shrink-0" />
                <span>Keep your daily spending under today's allowance to build streaks (+15 pts).</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-flexible-green shrink-0" />
                <span>Maintain at least 15% in Protected Vault + Flexible Savings (+25 pts).</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-flexible-green shrink-0" />
                <span>Avoid running out of Flexible Savings cushion.</span>
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  );
};
