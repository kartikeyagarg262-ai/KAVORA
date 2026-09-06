import React, { useState } from 'react';
import { ArrowDown, ArrowRight, Shield, Wallet, Sparkles, RefreshCw, AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';

export const MoneyFlowWidget: React.FC = () => {
  const { config, ledger } = useFinance();
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      title: 'Monthly Income Received',
      amount: formatCurrency(config.monthlyIncome),
      desc: 'Fixed monthly pocket money or stipend deposited at the beginning of the budget period.',
    },
    {
      id: 2,
      title: 'Tier 1: Protected Savings 🔒',
      amount: formatCurrency(ledger.protectedSavings),
      desc: 'Set aside immediately. Completely isolated in a vault — never automatically tapped.',
    },
    {
      id: 3,
      title: 'Available Spending Money',
      amount: formatCurrency(ledger.availableSpendingMoney),
      desc: `₹${config.monthlyIncome} minus ₹${ledger.protectedSavings} protected savings = ₹${ledger.availableSpendingMoney} for active monthly living expenses.`,
    },
    {
      id: 4,
      title: 'Tier 2: Daily Budget 💳',
      amount: `${formatCurrency(ledger.todayBudget)} / day`,
      desc: `Allocated per day (${config.budgetMode === 'fixed' ? 'Fixed: total available ÷ 30' : 'Smart: remaining available ÷ remaining days'}). Today spent: ₹${ledger.todaySpent}.`,
    },
    {
      id: 5,
      title: 'Tier 3: Flexible Savings 🟢',
      amount: formatCurrency(ledger.currentFlexibleSavings),
      desc: 'Every unspent rupee from daily budgets automatically accumulates here. Overspending on another day is automatically deducted from this pool!',
    },
  ];

  return (
    <div className="rounded-3xl bg-gradient-to-b from-obsidian-900 to-obsidian-950 border border-white/10 p-6 shadow-xl relative overflow-hidden">
      {/* Background Decorative lines */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>The KAVORA 3-Tier Money Flow</span>
              <span className="w-2 h-2 rounded-full bg-flexible-green animate-pulse" />
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            How your money automatically flows, protects itself, and cushions future spending
          </p>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5 self-start sm:self-auto bg-obsidian-850 px-3 py-1 rounded-full border border-white/5">
          <HelpCircle size={14} className="text-spending-cyan" />
          <span>Tap any node to learn more</span>
        </div>
      </div>

      {/* Interactive Flow Visual Tree */}
      <div className="flex flex-col items-center gap-4 py-2">
        {/* Step 1: Monthly Income Top Node */}
        <div 
          onClick={() => setSelectedStep(selectedStep === 1 ? null : 1)}
          className={`w-full max-w-sm p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedStep === 1 
              ? 'bg-obsidian-800 border-white/30 scale-105 shadow-xl shadow-white/5' 
              : 'bg-obsidian-850/80 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white text-base font-bold">
                ₹
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step 1 • Total Income</p>
                <h4 className="text-sm font-extrabold text-white">Monthly Money</h4>
              </div>
            </div>
            <span className="text-base font-mono font-extrabold text-white">{formatCurrency(config.monthlyIncome)}</span>
          </div>
        </div>

        {/* Split Connector */}
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-6 bg-gradient-to-b from-white/30 to-white/10" />
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold bg-obsidian-950 px-2 py-0.5 rounded border border-white/5">
            Split on Day 1
          </div>
          <div className="w-0.5 h-6 bg-gradient-to-b from-white/10 to-white/30" />
        </div>

        {/* Step 2 & 3: Two branches (Protected Vault & Available Spending) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
          {/* Node 2: Protected Savings 🔒 */}
          <div 
            onClick={() => setSelectedStep(selectedStep === 2 ? null : 2)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedStep === 2 
                ? 'bg-vault-purple/20 border-vault-purple scale-105 shadow-xl shadow-vault-purple/20' 
                : 'bg-obsidian-850/80 border-vault-purple/30 hover:border-vault-purple/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🔒</span>
                <div>
                  <span className="text-[10px] font-extrabold text-vault-purple uppercase tracking-wider">Tier 1</span>
                  <h4 className="text-xs font-bold text-white">Protected Savings</h4>
                </div>
              </div>
              <span className="text-sm font-mono font-bold text-vault-purple">{formatCurrency(ledger.protectedSavings)}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              Immune to daily overspending. Safe in your personal vault.
            </p>
          </div>

          {/* Node 3: Available Spending Money */}
          <div 
            onClick={() => setSelectedStep(selectedStep === 3 ? null : 3)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedStep === 3 
                ? 'bg-spending-cyan/20 border-spending-cyan scale-105 shadow-xl shadow-spending-cyan/20' 
                : 'bg-obsidian-850/80 border-spending-cyan/30 hover:border-spending-cyan/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">💳</span>
                <div>
                  <span className="text-[10px] font-extrabold text-spending-cyan uppercase tracking-wider">Available Pool</span>
                  <h4 className="text-xs font-bold text-white">Available Spending</h4>
                </div>
              </div>
              <span className="text-sm font-mono font-bold text-spending-cyan">{formatCurrency(ledger.availableSpendingMoney)}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              Divided across {config.periodDays} days for living expenses.
            </p>
          </div>
        </div>

        {/* Down arrow to Daily Budget */}
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-6 bg-gradient-to-b from-spending-cyan/40 to-spending-cyan" />
          <ArrowDown size={16} className="text-spending-cyan -mt-1" />
        </div>

        {/* Step 4: Tier 2 Daily Budget */}
        <div 
          onClick={() => setSelectedStep(selectedStep === 4 ? null : 4)}
          className={`w-full max-w-sm p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedStep === 4 
              ? 'bg-spending-cyan/20 border-spending-cyan scale-105 shadow-xl shadow-spending-cyan/20' 
              : 'bg-obsidian-850/80 border-spending-cyan/30 hover:border-spending-cyan/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-spending-cyan/20 text-spending-cyan flex items-center justify-center font-bold">
                <Wallet size={18} />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-spending-cyan">Tier 2 • Daily Budget</p>
                <h4 className="text-sm font-extrabold text-white">Today's Allowance</h4>
              </div>
            </div>
            <span className="text-base font-mono font-extrabold text-spending-cyan">{formatCurrency(ledger.todayBudget)}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Spent today: ₹{ledger.todaySpent}</span>
            <span className="text-flexible-green font-bold">Surplus: +₹{Math.max(0, ledger.todayRemaining)}</span>
          </div>
        </div>

        {/* Dynamic Surplus Rollover & Overspending Absorber Line */}
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-6 bg-gradient-to-b from-spending-cyan to-flexible-green" />
          <div className="flex items-center gap-1 text-[10px] font-bold text-flexible-mint bg-flexible-green/15 px-3 py-0.5 rounded-full border border-flexible-green/30">
            <span>If money left: auto-flows into Flexible Savings 🟢</span>
          </div>
          <div className="w-0.5 h-6 bg-gradient-to-b from-flexible-green to-flexible-mint" />
          <ArrowDown size={16} className="text-flexible-mint -mt-1" />
        </div>

        {/* Step 5: Tier 3 Flexible Savings 🟢 Hero Node */}
        <div 
          onClick={() => setSelectedStep(selectedStep === 5 ? null : 5)}
          className={`w-full max-w-lg p-5 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${
            selectedStep === 5 
              ? 'bg-flexible-green/20 border-flexible-green scale-105 shadow-2xl shadow-flexible-green/30' 
              : 'bg-obsidian-850/90 border-flexible-green/40 hover:border-flexible-green/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-flexible-green/20 text-flexible-green flex items-center justify-center font-bold animate-pulse-slow">
                <Sparkles size={22} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-flexible-green">
                  Tier 3 • Autonomous Cushion
                </span>
                <h4 className="text-base font-extrabold text-white">Flexible Savings</h4>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-mono font-extrabold text-flexible-mint">{formatCurrency(ledger.currentFlexibleSavings)}</span>
              <p className="text-[10px] text-slate-400 font-medium">Accumulated</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-flexible-green/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 text-flexible-green font-semibold">
              <RefreshCw size={13} className="shrink-0 animate-spin-slow" />
              <span>Automatically covers future overspending days!</span>
            </div>
            <span className="text-[11px] text-slate-400">Protected Savings is never touched</span>
          </div>
        </div>
      </div>

      {/* Detail drawer if a node is clicked */}
      {selectedStep && (
        <div className="mt-6 p-4 rounded-2xl bg-obsidian-950 border border-white/10 animate-fadeIn">
          <div className="flex items-center justify-between mb-1">
            <h5 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-flexible-green" />
              <span>{steps[selectedStep - 1].title}</span>
            </h5>
            <span className="text-xs font-mono font-bold text-slate-300">{steps[selectedStep - 1].amount}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {steps[selectedStep - 1].desc}
          </p>
        </div>
      )}
    </div>
  );
};
