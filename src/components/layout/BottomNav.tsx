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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-obsidian-950/90 backdrop-blur-2xl border-t border-white/10 px-4 py-2 pb-safe">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={onOpenAddExpense}
                className="relative -top-5 flex flex-col items-center group"
                aria-label="Add Expense"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-flexible-green via-flexible-mint to-spending-cyan flex items-center justify-center text-obsidian-950 shadow-xl shadow-flexible-green/30 group-hover:scale-105 active:scale-95 transition-transform border-2 border-obsidian-950">
                  <Plus size={28} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold text-flexible-mint mt-1">Add</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-flexible-green' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-flexible-green/10' : ''}`}>
                <Icon size={20} strokeWidth={isActive ? 2.3 : 1.8} />
              </div>
              <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${isActive ? 'font-bold text-white' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
