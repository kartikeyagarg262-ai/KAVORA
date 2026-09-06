import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  ArrowRight, 
  ArrowLeft, 
  Shield, 
  Lock, 
  Sliders, 
  Zap, 
  CheckCircle2, 
  Calendar, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { BudgetConfig, BudgetMode } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { Logo } from '../common/Logo';

interface OnboardingWizardProps {
  onComplete?: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const { completeOnboarding } = useFinance();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('Kartik');
  const [monthlyMoney, setMonthlyMoney] = useState(5000);
  const [protectedSavings, setProtectedSavings] = useState(500);
  const [periodDays, setPeriodDays] = useState(30);
  const [budgetMode, setBudgetMode] = useState<BudgetMode>('fixed');

  // Calculations
  const availableSpending = Math.max(0, monthlyMoney - protectedSavings);
  const dailyBudget = Math.round(availableSpending / (periodDays || 30));

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Complete!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback
      }

      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const newConfig: BudgetConfig = {
        userFullName: name || 'User',
        monthlyIncome: monthlyMoney,
        protectedSavings,
        periodDays,
        budgetMode: 'fixed',
        startDate: todayStr,
      };

      completeOnboarding(newConfig);
      if (onComplete) onComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-flexible-green/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-spending-cyan/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-obsidian-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Top Progress Dots */}
        <div className="flex items-center justify-between mb-8">
          <Logo size="sm" showTagline={false} />
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step 
                    ? 'w-6 bg-flexible-green' 
                    : i < step 
                      ? 'w-2 bg-flexible-green/50' 
                      : 'w-2 bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* SCREEN 1: Welcome to KAVORA */}
        {step === 1 && (
          <div className="space-y-6 text-center py-4 animate-fadeIn">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-flexible-green/20 via-spending-cyan/20 to-vault-purple/20 border border-white/10 flex items-center justify-center p-3 shadow-xl">
              <Sparkles size={36} className="text-flexible-green animate-pulse-slow" />
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight font-display">
                Welcome to KAVORA
              </h2>
              <p className="text-sm font-medium text-flexible-mint mt-1">
                "Your money. Your flow."
              </p>
              <p className="text-xs text-slate-400 mt-3 max-w-sm mx-auto leading-relaxed">
                Smart 3-Tier money management designed for fixed monthly pocket money, student allowances, and disciplined daily budgeting.
              </p>
            </div>

            <div className="pt-2">
              <label className="block text-xs text-slate-400 font-medium mb-1.5 text-left">
                What should we call you?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2.5 bg-obsidian-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-flexible-green text-center font-bold"
              />
            </div>
          </div>
        )}

        {/* SCREEN 2: Enter Monthly Money */}
        {step === 2 && (
          <div className="space-y-6 py-2 animate-fadeIn">
            <div>
              <span className="text-[11px] font-bold text-spending-cyan uppercase tracking-wider">Screen 2 of 5</span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1">
                Enter Monthly Money
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                How much total money do you receive for this month or budget cycle?
              </p>
            </div>

            <div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-3xl">₹</span>
                <input
                  type="number"
                  min="500"
                  step="100"
                  value={monthlyMoney}
                  onChange={(e) => setMonthlyMoney(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-12 pr-4 py-4 bg-obsidian-950 border border-white/10 rounded-2xl text-white font-mono text-3xl font-bold focus:outline-none focus:border-spending-cyan text-left"
                  autoFocus
                />
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-2 mt-3">
                {[3000, 5000, 8000, 10000, 15000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMonthlyMoney(preset)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                      monthlyMoney === preset 
                        ? 'bg-spending-cyan/20 border-spending-cyan text-white font-bold' 
                        : 'bg-obsidian-950 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    ₹{preset.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 3: Set Protected Savings */}
        {step === 3 && (
          <div className="space-y-6 py-2 animate-fadeIn">
            <div>
              <span className="text-[11px] font-bold text-vault-purple uppercase tracking-wider">Screen 3 of 5</span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
                <span>Set Protected Savings</span>
                <span>🔒</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Money you immediately lock into your vault. Completely isolated and <b>never</b> automatically used for daily overspending.
              </p>
            </div>

            <div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-vault-purple font-bold text-3xl">₹</span>
                <input
                  type="number"
                  min="0"
                  max={monthlyMoney}
                  step="100"
                  value={protectedSavings}
                  onChange={(e) => setProtectedSavings(Math.min(monthlyMoney, Math.max(0, Number(e.target.value))))}
                  className="w-full pl-12 pr-4 py-4 bg-obsidian-950 border border-white/10 rounded-2xl text-white font-mono text-3xl font-bold focus:outline-none focus:border-vault-purple text-left"
                />
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { label: '10%', val: Math.round(monthlyMoney * 0.1) },
                  { label: '₹500', val: 500 },
                  { label: '₹1,000', val: 1000 },
                  { label: '20%', val: Math.round(monthlyMoney * 0.2) },
                  { label: 'None (₹0)', val: 0 },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProtectedSavings(preset.val)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                      protectedSavings === preset.val 
                        ? 'bg-vault-purple/20 border-vault-purple text-white font-bold' 
                        : 'bg-obsidian-950 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 4: Select Budget Period */}
        {step === 4 && (
          <div className="space-y-6 py-2 animate-fadeIn">
            <div>
              <span className="text-[11px] font-bold text-flexible-green uppercase tracking-wider">Screen 4 of 5</span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
                <span>Select Budget Period</span>
                <Calendar size={22} className="text-flexible-green" />
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                How many days should this monthly budget cover?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { days: 30, title: 'Standard 30 Days', desc: 'Standard monthly pocket money cycle' },
                { days: 31, title: 'Full 31 Days', desc: 'Long calendar months' },
                { days: 15, title: 'Bi-Weekly (15 Days)', desc: 'Half-month allowance' },
                { days: 7, title: 'Weekly (7 Days)', desc: 'Short sprint cycle' },
              ].map((item) => (
                <button
                  key={item.days}
                  type="button"
                  onClick={() => setPeriodDays(item.days)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    periodDays === item.days
                      ? 'bg-flexible-green/15 border-flexible-green shadow-lg shadow-flexible-green/10'
                      : 'bg-obsidian-950/70 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{item.title}</span>
                    <span className="text-xs font-mono font-bold text-flexible-green">{item.days}d</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SCREEN 5: Calculated Financial Setup */}
        {step === 5 && (
          <div className="space-y-6 py-2 animate-fadeIn">
            <div className="text-center">
              <span className="text-[11px] font-bold text-flexible-green uppercase tracking-wider">Setup Complete • Screen 5 of 5</span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1">
                Your Calculated Financial Plan
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Here is your personalized KAVORA 3-Tier Money configuration:
              </p>
            </div>

            <div className="space-y-2.5 rounded-2xl bg-obsidian-950 p-4 border border-white/10 font-mono">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <span className="text-slate-400">Monthly Money:</span>
                <span className="font-bold text-white text-sm">{formatCurrency(monthlyMoney)}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <span className="text-slate-400 flex items-center gap-1">
                  <span>Protected Savings:</span>
                  <span>🔒</span>
                </span>
                <span className="font-bold text-vault-purple text-sm">{formatCurrency(protectedSavings)}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <span className="text-slate-400">Available Spending:</span>
                <span className="font-bold text-spending-cyan text-sm">{formatCurrency(availableSpending)}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 pt-3">
                <span className="text-flexible-green font-bold text-sm">Daily Spending Budget:</span>
                <span className="font-extrabold text-flexible-mint text-xl">{formatCurrency(dailyBudget)} / day</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-flexible-green/10 border border-flexible-green/20 text-xs text-slate-300">
              🟢 Any unspent daily budget will automatically roll into <b>Flexible Savings</b> to cushion you from future overspending!
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-4 border-t border-white/5">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-flexible-green to-spending-cyan text-obsidian-950 font-extrabold text-xs shadow-xl shadow-flexible-green/20 hover:shadow-flexible-green/30 hover:scale-[1.02] active:scale-[0.98] transition-all ml-auto"
          >
            <span>{step === 5 ? 'Start Managing My Money' : 'Continue'}</span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
