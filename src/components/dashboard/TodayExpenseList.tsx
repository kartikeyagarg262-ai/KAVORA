import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Clock, AlertCircle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatTime, CATEGORIES } from '../../utils/formatters';
import { Expense } from '../../types/finance';
import { EditExpenseModal } from '../expenses/EditExpenseModal';

interface TodayExpenseListProps {
  onOpenAddExpense: () => void;
}

export const TodayExpenseList: React.FC<TodayExpenseListProps> = ({ onOpenAddExpense }) => {
  const { expenses, ledger, deleteExpense } = useFinance();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Filter expenses matching today
  const todayStr = ledger.dailyCalculations[ledger.currentDayIndex - 1]?.date;
  const todayExpenses = expenses.filter(exp => exp.date === todayStr);

  return (
    <>
      <div className="rounded-2xl sm:rounded-3xl bg-obsidian-900 border border-white/10 p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Today's Expenses</span>
              <span className="px-2 py-0.5 rounded-full bg-white/5 text-[11px] text-slate-300 font-mono">
                {todayExpenses.length} items
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Spent: <b className="text-white font-mono">{formatCurrency(ledger.todaySpent)}</b> of <b className="text-spending-cyan font-mono">{formatCurrency(ledger.todayBudget)}</b>
              {ledger.todayStatus === 'over' && (
                <span className="ml-1.5 text-rose-400 font-semibold font-mono">
                  • Over {formatCurrency(Math.abs(ledger.todayRemaining))} (Flexible: {formatCurrency(ledger.currentFlexibleSavings)})
                </span>
              )}
            </p>
          </div>

          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all border border-white/5"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>

        {todayExpenses.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-white/10 bg-obsidian-950/40">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-sm font-semibold text-slate-300">No expenses recorded today</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Any unused amount from today's ₹{ledger.todayBudget} budget will roll into Flexible Savings.
            </p>
            <button
              onClick={onOpenAddExpense}
              className="mt-4 px-4 py-2 rounded-xl bg-flexible-green/10 text-flexible-green border border-flexible-green/30 text-xs font-bold hover:bg-flexible-green/20 transition-all"
            >
              + Record an expense
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayExpenses.map((expense) => {
              const cat = CATEGORIES[expense.category] || CATEGORIES.other;

              return (
                <div
                  key={expense.id}
                  className="group flex items-center justify-between p-3.5 rounded-2xl bg-obsidian-950/60 border border-white/5 hover:border-white/10 hover:bg-obsidian-850/80 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg border"
                      style={{ 
                        backgroundColor: cat.bgColor,
                        borderColor: cat.borderColor,
                      }}
                    >
                      {cat.icon}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white capitalize">
                        {expense.description || cat.label}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="text-slate-300 font-medium">{cat.label}</span>
                        {expense.time && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={11} className="text-slate-500" />
                              {formatTime(expense.time)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold font-mono text-white">
                      {formatCurrency(expense.amount)}
                    </span>

                    <div className="flex items-center opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingExpense(expense)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="Edit Expense"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </>
  );
};
