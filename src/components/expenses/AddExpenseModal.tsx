import React, { useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle, Calendar, Clock, Tag } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ExpenseCategory } from '../../types/finance';
import { Modal } from '../common/Modal';
import { CATEGORIES, formatCurrency } from '../../utils/formatters';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose }) => {
  const { ledger, addExpense, config } = useFinance();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [description, setDescription] = useState('');

  // Default to today's active date in the ledger
  const todayStr = ledger.dailyCalculations[ledger.currentDayIndex - 1]?.date || new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);

  const nowTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  const [time, setTime] = useState(nowTime());

  // Quick increment buttons
  const quickPills = [20, 50, 100, 150, 200, 500];

  const handleQuickAdd = (increment: number) => {
    const current = Number(amount) || 0;
    setAmount(String(current + increment));
  };

  // Live calculation preview
  const numAmount = Number(amount) || 0;
  const isToday = date === todayStr;
  const projectedTodaySpent = isToday ? ledger.todaySpent + numAmount : ledger.todaySpent;
  const projectedRemaining = ledger.todayBudget - projectedTodaySpent;
  const willOverspend = projectedRemaining < 0;
  const projectedOverspentAmount = Math.abs(projectedRemaining);
  const flexCanCover = ledger.currentFlexibleSavings >= projectedOverspentAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numAmount || numAmount <= 0) return;

    addExpense({
      amount: numAmount,
      category,
      description: description.trim(),
      date,
      time,
    });

    // Reset fields & close
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="➕ Add Daily Expense"
      subtitle="Track your spending against today's budget with instant 3-Tier ledger updates."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Amount Input */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-2xl">
              ₹
            </span>
            <input
              type="number"
              step="any"
              min="1"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-obsidian-950 border border-white/10 rounded-2xl text-white font-mono text-2xl font-bold focus:outline-none focus:border-spending-cyan focus:ring-1 focus:ring-spending-cyan transition-all"
              autoFocus
              required
            />
          </div>

          {/* Quick Increment Pills */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {quickPills.map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => handleQuickAdd(pill)}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-mono text-slate-300 hover:text-white transition-all"
              >
                +₹{pill}
              </button>
            ))}
          </div>
        </div>

        {/* Category Selector Grid */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(CATEGORIES) as ExpenseCategory[]).map((catKey) => {
              const cat = CATEGORIES[catKey];
              const isSelected = category === catKey;

              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setCategory(catKey)}
                  className={`flex items-center gap-2 p-2.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-obsidian-800 border-spending-cyan shadow-md shadow-spending-cyan/10'
                      : 'bg-obsidian-950/70 border-white/5 hover:border-white/15'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className={`text-xs truncate ${isSelected ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                    {cat.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Description */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Description <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Canteen lunch, Coffee, Metro card"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-obsidian-950 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-spending-cyan transition-all"
          />
        </div>

        {/* Date and Time Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Calendar size={12} />
              <span>Date</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-obsidian-950 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-spending-cyan"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Clock size={12} />
              <span>Time</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 bg-obsidian-950 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-spending-cyan"
            />
          </div>
        </div>

        {/* Live Calculation Impact Card */}
        {numAmount > 0 && isToday && (
          <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/10 text-xs animate-fadeIn space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span>Today's Remaining after this:</span>
              <span className={`font-mono font-bold ${projectedRemaining >= 0 ? 'text-flexible-green' : 'text-rose-400'}`}>
                {projectedRemaining >= 0 ? formatCurrency(projectedRemaining) : `-${formatCurrency(projectedOverspentAmount)}`}
              </span>
            </div>

            {willOverspend && (
              <div className="pt-2 border-t border-white/5 space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                  <AlertTriangle size={13} />
                  <span>Will exceed today's budget by {formatCurrency(projectedOverspentAmount)}</span>
                </div>
                {flexCanCover ? (
                  <p className="text-slate-300">
                    🟢 {formatCurrency(projectedOverspentAmount)} will be automatically deducted from Flexible Savings ({formatCurrency(ledger.currentFlexibleSavings)} → {formatCurrency(ledger.currentFlexibleSavings - projectedOverspentAmount)}).
                  </p>
                ) : (
                  <p className="text-rose-400 font-medium">
                    ⚠️ Your Flexible Savings cannot cover this overspending! Deficit will be flagged.
                  </p>
                )}
                <p className="text-[10px] text-vault-purple font-semibold">
                  🔒 Protected Savings ({formatCurrency(ledger.protectedSavings)}) remains untouched.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-flexible-green to-spending-cyan text-obsidian-950 font-bold text-xs shadow-lg shadow-flexible-green/20 hover:shadow-flexible-green/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Add Expense
          </button>
        </div>
      </form>
    </Modal>
  );
};
