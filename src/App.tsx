import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { GreetingHeader } from './components/dashboard/GreetingHeader';
import { MonthlyOverviewCard } from './components/dashboard/MonthlyOverviewCard';
import { TierCards } from './components/dashboard/TierCards';
import { DisciplineStreakWidget } from './components/dashboard/DisciplineStreakWidget';
import { SavingsGoalsWidget } from './components/goals/SavingsGoalsWidget';
import { MoneyFlowWidget } from './components/dashboard/MoneyFlowWidget';
import { TodayExpenseList } from './components/dashboard/TodayExpenseList';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ExpenseHistory } from './components/history/ExpenseHistory';
import { ProfileView } from './components/profile/ProfileView';
import { AddExpenseModal } from './components/expenses/AddExpenseModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { PinLockScreen } from './components/security/PinLockScreen';
import { NotificationPromptModal } from './components/notifications/NotificationPromptModal';
import { Logo } from './components/common/Logo';
import { Plus, Loader2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { isOnboarded, activeTab, setActiveTab } = useFinance();
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // If user hasn't finished onboarding or clicked "Replay Onboarding"
  if (!isOnboarded) {
    return <OnboardingWizard onComplete={() => setIsAddExpenseOpen(false)} />;
  }

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col selection:bg-flexible-green selection:text-black relative">
      {/* Direct Mobile Status Bar Notification Permission Modal */}
      <NotificationPromptModal />

      {/* Feature 5: PIN Lock Screen Overlay */}
      <PinLockScreen />

      {/* Top Navbar */}
      <Navbar />

      {/* Main App Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 md:pb-12">
        {activeTab === 'home' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Greeting Header */}
            <GreetingHeader onOpenAddExpense={() => setIsAddExpenseOpen(true)} />

            {/* Feature 6: Daily Streak & Financial Discipline Score */}
            <DisciplineStreakWidget />

            {/* Total Monthly Money & Overview */}
            <MonthlyOverviewCard />

            {/* 3 Main Premium Tier Cards: 🔒 Protected, 💳 Daily, 🟢 Flexible */}
            <TierCards />

            {/* Feature 2: Savings Wishlist & Goals Widget */}
            <SavingsGoalsWidget />

            {/* Visual 3-Tier Money Flow Widget */}
            <MoneyFlowWidget />

            {/* Today's Expenses Breakdown */}
            <TodayExpenseList onOpenAddExpense={() => setIsAddExpenseOpen(true)} />
          </div>
        )}

        {activeTab === 'analytics' && <AnalyticsView />}

        {activeTab === 'history' && <ExpenseHistory />}

        {activeTab === 'profile' && <ProfileView />}
      </main>

      {/* Quick Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
      />

      {/* Desktop Floating Add Button */}
      <button
        onClick={() => setIsAddExpenseOpen(true)}
        className="hidden md:flex fixed bottom-8 right-8 z-30 items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-flexible-green to-spending-cyan text-obsidian-950 font-extrabold text-sm shadow-2xl shadow-flexible-green/30 hover:shadow-flexible-green/50 hover:scale-105 active:scale-95 transition-all border border-white/20"
        aria-label="Add Expense"
      >
        <Plus size={20} strokeWidth={3} />
        <span>Add Expense</span>
      </button>

      {/* Mobile Bottom Navigation */}
      <BottomNav onOpenAddExpense={() => setIsAddExpenseOpen(true)} />

      {/* Footer */}
      <footer className="hidden md:block border-t border-white/5 bg-obsidian-950/50 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">KAVORA</span>
            <span>—</span>
            <span>Your Money. Your Flow.</span>
          </div>
          <p className="text-[11px] text-slate-600">
            Engineered for Students & Fixed Pocket Money • 3-Tier Autonomous Allocation
          </p>
        </div>
      </footer>
    </div>
  );
};

const AuthGate: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-flexible-green to-spending-cyan flex items-center justify-center shadow-xl shadow-flexible-green/20 mb-6 animate-pulse">
          <Logo size="lg" showTagline={false} />
        </div>
        <div className="flex items-center gap-2 text-flexible-green text-sm font-semibold">
          <Loader2 size={18} className="animate-spin" />
          <span>Authenticating KAVORA...</span>
        </div>
        <p className="text-xs text-slate-500 mt-2">Loading your private 3-Tier cloud vault</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <FinanceProvider>
      <MainLayout />
    </FinanceProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
