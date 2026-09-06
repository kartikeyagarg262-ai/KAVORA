import React from 'react';
import { Wallet, ShieldCheck, ArrowRight, Sliders, Zap, Info } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';

export const MonthlyOverviewCard: React.FC = () => {
  const { config, ledger, setBudgetMode, privacyMode } = useFinance();

  const cycleProgressPercent = Math.min(100, Math.round((ledger.currentDayIndex / config.periodDays) * 100));

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-obsidian-850 to-obsidian-900 border border-white/10 p-6 shadow-2xl">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-spending-cyan/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-flexible-green/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Top bar: Total Monthly Money & Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-white shadow-inner">
              <Wallet size={24} className="text-spending-cyan" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Total Monthly Money</span>
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-[11px] text-slate-300 font-mono">
                  {config.periodDays} Days
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-0.5 font-display">
                {formatCurrency(config.monthlyIncome, { privacy: privacyMode })}
              </div>
            </div>
          </div>

          {/* Budget Mode Selector */}
          <div className="flex items-center bg-obsidian-950/80 p-1 rounded-2xl border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setBudgetMode('fixed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                config.budgetMode === 'fixed'
                  ? 'bg-gradient-to-r from-spending-cyan to-blue-500 text-obsidian-950 shadow-md shadow-spending-cyan/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders size={13} />
              <span>Fixed Mode</span>
            </button>
            <button
              onClick={() => setBudgetMode('smart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                config.budgetMode === 'smart'
                  ? 'bg-gradient-to-r from-flexible-green to-flexible-mint text-obsidian-950 shadow-md shadow-flexible-green/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap size={13} />
              <span>Smart Mode</span>
            </button>
          </div>
        </div>

        {/* Calculation Split Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
          {/* Protected Savings Split */}
          <div className="p-3.5 rounded-2xl bg-obsidian-950/50 border border-vault-purple/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🔒</span>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Protected Vault</p>
                <p className="text-sm font-bold text-vault-purple font-mono">{formatCurrency(ledger.protectedSavings, { privacy: privacyMode })}</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-vault-purple/10 text-vault-purple border border-vault-purple/20">
              Safe
            </span>
          </div>

          {/* Available Monthly Spending */}
          <div className="p-3.5 rounded-2xl bg-obsidian-950/50 border border-spending-cyan/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">💳</span>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Available Spending</p>
                <p className="text-sm font-bold text-spending-cyan font-mono">{formatCurrency(ledger.availableSpendingMoney, { privacy: privacyMode })}</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-spending-cyan/10 text-spending-cyan border border-spending-cyan/20">
              Active
            </span>
          </div>

          {/* Mode Formula Info */}
          <div className="p-3.5 rounded-2xl bg-obsidian-950/50 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">⚡</span>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Daily Formula</p>
                <p className="text-xs font-semibold text-slate-200">
                  {privacyMode ? '••••••' : (
                    config.budgetMode === 'fixed' 
                      ? `₹${ledger.availableSpendingMoney} ÷ ${config.periodDays}d = ₹${ledger.fixedDailyBudget}/d`
                      : `₹${ledger.availableSpendingMoney - ledger.totalSpentSoFar} ÷ ${ledger.daysRemaining}d left = ₹${ledger.todayBudget}/d`
                  )}
                </p>
              </div>
            </div>
            <Info size={14} className="text-slate-500" />
          </div>
        </div>

        {/* Cycle Days Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium">Cycle Progress</span>
            <span className="font-mono text-slate-300">
              {ledger.currentDayIndex} of {config.periodDays} days elapsed ({config.periodDays - ledger.currentDayIndex} days remaining)
            </span>
          </div>
          <div className="w-full h-2.5 bg-obsidian-950 rounded-full overflow-hidden p-0.5 border border-white/5">
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
