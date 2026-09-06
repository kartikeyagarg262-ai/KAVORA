import React from 'react';
import { Home, BarChart3, Plus, History, Settings } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface BottomNavProps {
  onOpenAddExpense: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenAddExpense }) => {
  const { activeTab, setActiveTab } = useFinance();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'add', label: 'Add', icon: Plus, isAction: true },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-obsidian-950/95 backdrop-blur-2xl border-t border-white/10 px-3 py-1.5 pb-safe">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={onOpenAddExpense}
                className="relative -top-3.5 flex flex-col items-center group"
                aria-label="Add Expense"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-flexible-green via-flexible-mint to-spending-cyan flex items-center justify-center text-obsidian-950 shadow-lg shadow-flexible-green/30 group-hover:scale-105 active:scale-95 transition-transform border-2 border-obsidian-950">
                  <Plus size={22} strokeWidth={3} />
                </div>
                <span className="text-[9.5px] font-bold text-flexible-mint mt-0.5">Add</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-0.5 px-2 rounded-xl transition-all ${
                isActive ? 'text-flexible-green' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg transition-all ${isActive ? 'bg-flexible-green/10' : ''}`}>
                <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />
              </div>
              <span className={`text-[9.5px] font-medium tracking-tight ${isActive ? 'font-bold text-white' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
