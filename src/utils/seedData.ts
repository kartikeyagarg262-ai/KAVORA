import { BudgetConfig, Expense, NotificationItem, NotificationSettings, VaultTransaction, SavingsGoal } from '../types/finance';

export const getInitialDates = () => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return { todayStr, startDateStr: todayStr };
};

export const createInitialSeedData = () => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const config: BudgetConfig = {
    userFullName: 'User',
    monthlyIncome: 5000,
    protectedSavings: 500,
    startDate: todayStr,
    periodDays: 30,
    budgetMode: 'fixed',
  };

  const vaultTransactions: VaultTransaction[] = [];
  const expenses: Expense[] = [];
  const goals: SavingsGoal[] = [];

  const notifications: NotificationItem[] = [
    {
      id: 'notif-welcome',
      type: 'morning',
      title: 'Welcome to KAVORA',
      message: 'Your smart 3-Tier money manager is ready.',
      timestamp: 'Just now',
      read: false,
    },
  ];

  const notificationSettings: NotificationSettings = {
    morningBudget: true,
    eveningReminder: true,
    overspendingWarning: true,
    overspendingAlert: true,
    savingsAchievement: true,
    monthEndSummary: true,
  };

  return { config, expenses, vaultTransactions, goals, notifications, notificationSettings };
};
