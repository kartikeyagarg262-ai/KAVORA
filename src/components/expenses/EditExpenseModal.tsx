import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Expense, ExpenseCategory } from '../../types/finance';
import { Modal } from '../common/Modal';
import { CATEGORIES } from '../../utils/formatters';

interface EditExpenseModalProps {
  expense: Expense;
  isOpen: boolean;
  onClose: () => void;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  expense,
  isOpen,
  onClose,
}) => {
  const { editExpense } = useFinance();

  const [amount, setAmount] = useState(String(expense.amount));
  const [category, setCategory] = useState<ExpenseCategory>(expense.category);
  const [description, setDescription] = useState(expense.description);
  const [date, setDate] = useState(expense.date);
  const [time, setTime] = useState(expense.time);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;

    editExpense(expense.id, {
      amount: numAmount,
      category,
      description: description.trim(),
      date,
      time,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="✏️ Edit Expense"
      subtitle="Modifying this expense will immediately recalculate subsequent days in your 3-Tier ledger."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">₹</span>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-obsidian-950 border border-white/10 rounded-xl text-white font-mono text-xl font-bold focus:outline-none focus:border-spending-cyan"
              required
            />
          </div>
        </div>

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
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-obsidian-850 border-spending-cyan text-white'
                      : 'bg-obsidian-950/70 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="text-xs truncate font-medium">{cat.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-obsidian-950 border border-white/10 rounded-xl text-white text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-obsidian-950 border border-white/10 rounded-xl text-white text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 bg-obsidian-950 border border-white/10 rounded-xl text-white text-xs font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-spending-cyan text-obsidian-950 font-bold text-xs shadow-lg shadow-spending-cyan/20 hover:opacity-95"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};
