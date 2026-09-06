import React from 'react';
import { Wallet, ShieldCheck, ArrowRight, Info } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';

export const MonthlyOverviewCard: React.FC = () => {
  const { config, ledger, privacyMode } = useFinance();

  const cycleProgressPercent = Math.min(100, Math.round((ledger.currentDayIndex / config.periodDays) * 100));

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-obsidian-850 to-obsidian-900 border border-white/10 p-4 sm:p-6 shadow-xl">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-spending-cyan/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-flexible-green/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4 sm:gap-5">
        {/* Top bar: Total Monthly Money & Days */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
              <Wallet size={20} className="text-spending-cyan sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-slate-400">Total Monthly Money</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                {formatCurrency(config.monthlyIncome, { privacy: privacyMode })}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300 font-mono font-semibold">
              Day {ledger.currentDayIndex}/{config.periodDays}
            </span>
          </div>
        </div>

        {/* Calculation Split Bar - Mobile 2-column clean grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Protected Savings Split */}
          <div className="p-3 rounded-xl bg-obsidian-950/60 border border-vault-purple/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span>🔒 Protected</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-vault-purple/15 text-vault-purple border border-vault-purple/25">Safe</span>
            </div>
            <p className="text-base sm:text-lg font-extrabold text-vault-purple font-mono mt-1">
              {formatCurrency(ledger.protectedSavings, { privacy: privacyMode })}
            </p>
          </div>

          {/* Available Monthly Spending */}
          <div className="p-3 rounded-xl bg-obsidian-950/60 border border-spending-cyan/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span>💳 Spending Pool</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-spending-cyan/15 text-spending-cyan border border-spending-cyan/25">Active</span>
            </div>
            <p className="text-base sm:text-lg font-extrabold text-spending-cyan font-mono mt-1">
              {formatCurrency(ledger.availableSpendingMoney, { privacy: privacyMode })}
            </p>
          </div>
        </div>

        {/* Cycle Days Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span>Cycle Progress</span>
            <span className="font-mono text-slate-300">
              {config.periodDays - ledger.currentDayIndex} days remaining
            </span>
          </div>
          <div className="w-full h-2 bg-obsidian-950 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-spending-cyan via-flexible-green to-flexible-mint transition-all duration-700"
              style={{ width: `${cycleProgressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
