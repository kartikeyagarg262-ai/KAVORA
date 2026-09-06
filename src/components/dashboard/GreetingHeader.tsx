import React from 'react';
import { Plus, Calendar, Sparkles } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface GreetingHeaderProps {
  onOpenAddExpense: () => void;
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({ onOpenAddExpense }) => {
  const { config, ledger } = useFinance();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-flexible-green uppercase tracking-wider mb-1">
          <Sparkles size={14} />
          <span>3-Tier Smart System Active</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {getGreeting()}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-flexible-mint">{config.userFullName}</span> 👋
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5 flex items-center gap-2">
          <Calendar size={14} className="text-slate-500" />
          <span>{todayFormatted}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 font-medium">Cycle Day {ledger.currentDayIndex} of {config.periodDays}</span>
        </p>
      </div>

      {/* Desktop Quick Add Button */}
      <button
        onClick={onOpenAddExpense}
        className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-flexible-green to-spending-cyan text-obsidian-950 font-bold text-sm shadow-lg shadow-flexible-green/20 hover:shadow-flexible-green/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        <Plus size={18} strokeWidth={2.5} />
        <span>Add Expense</span>
      </button>
    </div>
  );
};
