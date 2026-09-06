import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Sparkles, ArrowRight, Wallet } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { Modal } from '../common/Modal';

interface AffordabilityCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickAddAsExpense?: (amount: number, description: string) => void;
}

export const AffordabilityCheckerModal: React.FC<AffordabilityCheckerModalProps> = ({
  isOpen,
  onClose,
  onQuickAddAsExpense,
}) => {
  const { ledger, config } = useFinance();
  const [amountInput, setAmountInput] = useState('800');
  const [itemName, setItemName] = useState('Sneakers / Party Meal');

  const price = Math.max(0, Number(amountInput) || 0);

  // Simulation calculations
  const todayRemaining = ledger.todayRemaining;
  const flexSavings = ledger.currentFlexibleSavings;
  const daysLeft = ledger.daysRemaining;

  // 1. Can today's budget cover it alone?
  const coveredByToday = Math.min(price, Math.max(0, todayRemaining));
  const excessAfterToday = Math.max(0, price - Math.max(0, todayRemaining));

  // 2. Can Flexible Savings cover the excess?
  const coveredByFlex = Math.min(excessAfterToday, flexSavings);
  const uncoveredDeficit = Math.max(0, excessAfterToday - flexSavings);

  // 3. What would the smart daily budget become for the remaining days if deducted from remaining spending pool?
  const currentRemainingPool = Math.max(0, ledger.availableSpendingMoney - ledger.totalSpentSoFar);
  const newPoolAfterPurchase = Math.max(0, currentRemainingPool - price);
  const newSmartDaily = daysLeft > 0 ? Math.round(newPoolAfterPurchase / daysLeft) : 0;

  // Verdict determination
  let verdict: 'safe' | 'caution' | 'danger' = 'safe';
  let verdictTitle = '';
  let verdictExplanation = '';

  if (price === 0) {
    verdictTitle = 'Enter an amount';
    verdictExplanation = 'Type a purchase amount to test its impact on your 3-Tier Money System.';
  } else if (uncoveredDeficit > 0) {
    verdict = 'danger';
    verdictTitle = '🔴 Cannot Afford — Deficit Warning!';
    verdictExplanation = `This purchase creates an uncovered deficit of ${formatCurrency(uncoveredDeficit)}. Your Flexible Savings (${formatCurrency(flexSavings)}) is not enough, and your Protected Vault (${formatCurrency(ledger.protectedSavings)}) is locked and cannot be touched automatically.`;
  } else if (excessAfterToday > 0 && excessAfterToday > flexSavings * 0.75) {
    verdict = 'caution';
    verdictTitle = '🟡 Tight / High Impact on Cushion';
    verdictExplanation = `You can afford this, but it will consume ${Math.round((coveredByFlex / (flexSavings || 1)) * 100)}% of your Flexible Savings. Your remaining daily allowance will tighten to approx ${formatCurrency(newSmartDaily)}/day.`;
  } else if (excessAfterToday > 0) {
    verdict = 'safe';
    verdictTitle = '🟢 Affordable via Flexible Savings!';
    verdictExplanation = `Your Flexible Savings cushion (${formatCurrency(flexSavings)}) will smoothly absorb the excess ${formatCurrency(excessAfterToday)} without touching Protected Savings or disturbing future days!`;
  } else {
    verdict = 'safe';
    verdictTitle = '🟢 Easily Affordable Today!';
    verdictExplanation = `Today's remaining budget (${formatCurrency(todayRemaining)}) is enough to cover this completely! No impact on savings at all.`;
  }

  const handleProceed = () => {
    if (onQuickAddAsExpense && price > 0) {
      onQuickAddAsExpense(price, itemName);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🎯 Can I Afford This? (Simulator)"
      subtitle="Simulate the purchase before spending to see how your 3-Tier system responds."
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Input */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Item / Purpose & Price (₹)
          </label>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="e.g. Headphones, Concert Ticket, Weekend Dinner"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-4 py-2.5 bg-obsidian-950 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-spending-cyan"
            />
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-2xl">₹</span>
              <input
                type="number"
                min="10"
                placeholder="500"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-obsidian-950 border border-white/10 rounded-2xl text-white font-mono text-2xl font-bold focus:outline-none focus:border-spending-cyan"
                autoFocus
              />
            </div>
          </div>

          {/* Quick pills */}
          <div className="flex gap-2 mt-2">
            {[250, 500, 800, 1500, 2500].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmountInput(String(p))}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 border border-white/5"
              >
                ₹{p}
              </button>
            ))}
          </div>
        </div>

        {/* Verdict Banner */}
        <div className={`p-4 rounded-2xl border ${
          verdict === 'safe'
            ? 'bg-flexible-green/10 border-flexible-green/30 text-flexible-mint'
            : verdict === 'caution'
              ? 'bg-amber-400/10 border-amber-400/30 text-amber-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <h4 className="text-sm font-extrabold tracking-tight mb-1">{verdictTitle}</h4>
          <p className="text-xs leading-relaxed opacity-90">{verdictExplanation}</p>
        </div>

        {/* 3-Tier Breakdown Simulation Card */}
        <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/10 space-y-2.5 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400">
            <span>Today's Available:</span>
            <span className="text-white font-bold">{formatCurrency(todayRemaining)}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Flexible Savings Cushion:</span>
            <span className="text-flexible-green font-bold">{formatCurrency(flexSavings)}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-white/5">
            <span>Flex Savings After Purchase:</span>
            <span className={`font-bold ${flexSavings - excessAfterToday >= 0 ? 'text-flexible-mint' : 'text-rose-400'}`}>
              {formatCurrency(Math.max(0, flexSavings - excessAfterToday))}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Future Daily Allowance ({daysLeft}d left):</span>
            <span className="text-spending-cyan font-bold">{formatCurrency(newSmartDaily)} / day</span>
          </div>

          <div className="flex items-center justify-between text-vault-purple pt-2 border-t border-white/5 font-bold">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} />
              <span>Protected Vault Guarantee:</span>
            </span>
            <span>{formatCurrency(ledger.protectedSavings)} (Safe)</span>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Close
          </button>
          {onQuickAddAsExpense && price > 0 && verdict !== 'danger' && (
            <button
              type="button"
              onClick={handleProceed}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-flexible-green to-spending-cyan text-obsidian-950 font-bold text-xs shadow-lg shadow-flexible-green/20"
            >
              <span>Buy & Log as Expense</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
