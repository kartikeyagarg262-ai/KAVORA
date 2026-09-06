import { BudgetConfig, Expense, NotificationItem, NotificationSettings, VaultTransaction, SavingsGoal } from '../types/finance';
import { addDaysToDate } from './calculations';

export const getInitialDates = () => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  // We place today at Day 6 of 30
  const startDateStr = addDaysToDate(todayStr, -5);
  return { todayStr, startDateStr };
};

export const createInitialSeedData = () => {
  const { todayStr, startDateStr } = getInitialDates();

  const config: BudgetConfig = {
    userFullName: 'Kartik',
    monthlyIncome: 5000,
    protectedSavings: 500,
    startDate: startDateStr,
    periodDays: 30,
    budgetMode: 'fixed',
  };

  const day1 = addDaysToDate(startDateStr, 0);
  const day2 = addDaysToDate(startDateStr, 1);
  const day3 = addDaysToDate(startDateStr, 2);
  const day4 = addDaysToDate(startDateStr, 3);
  const day5 = addDaysToDate(startDateStr, 4);
  const day6Today = todayStr;

  // Tier 1 Vault Transactions
  const vaultTransactions: VaultTransaction[] = [
    {
      id: 'vault-seed-1',
      type: 'initial',
      amount: 500,
      source: 'Monthly Base Allocation',
      note: 'Budget cycle auto-lock into Protected Vault',
      date: day1,
      time: '09:00',
      createdAt: Date.now() - 5 * 86400000,
      balanceAfter: 500,
    },
  ];

  const expenses: Expense[] = [
    // Day 1: Budget 150, Spent 100 (+50 to Flexible)
    {
      id: 'seed-exp-1',
      amount: 70,
      category: 'food',
      description: 'College canteen lunch',
      date: day1,
      time: '13:15',
      createdAt: Date.now() - 5 * 86400000,
    },
    {
      id: 'seed-exp-2',
      amount: 30,
      category: 'travel',
      description: 'Metro ticket',
      date: day1,
      time: '17:45',
      createdAt: Date.now() - 5 * 86400000 + 1000,
    },

    // Day 2: Budget 150, Spent 50 (+100 to Flexible)
    {
      id: 'seed-exp-3',
      amount: 30,
      category: 'drinks',
      description: 'Chai & snack',
      date: day2,
      time: '11:00',
      createdAt: Date.now() - 4 * 86400000,
    },
    {
      id: 'seed-exp-4',
      amount: 20,
      category: 'travel',
      description: 'Bus pass recharge',
      date: day2,
      time: '18:20',
      createdAt: Date.now() - 4 * 86400000 + 1000,
    },

    // Day 3: Budget 150, Spent 50 (+100 to Flexible)
    {
      id: 'seed-exp-5',
      amount: 50,
      category: 'food',
      description: 'Sandwich meal',
      date: day3,
      time: '14:00',
      createdAt: Date.now() - 3 * 86400000,
    },

    // Day 4: Budget 150, Spent 100 (+50 to Flexible)
    {
      id: 'seed-exp-6',
      amount: 60,
      category: 'education',
      description: 'Notebook & stationery',
      date: day4,
      time: '12:30',
      createdAt: Date.now() - 2 * 86400000,
    },
    {
      id: 'seed-exp-7',
      amount: 40,
      category: 'drinks',
      description: 'Cold coffee',
      date: day4,
      time: '16:10',
      createdAt: Date.now() - 2 * 86400000 + 1000,
    },

    // Day 5: Budget 150, Spent 150 (Exact budget, +0 to Flexible)
    {
      id: 'seed-exp-8',
      amount: 110,
      category: 'food',
      description: 'Weekend lunch with friends',
      date: day5,
      time: '13:45',
      createdAt: Date.now() - 1 * 86400000,
    },
    {
      id: 'seed-exp-9',
      amount: 40,
      category: 'travel',
      description: 'Auto fare',
      date: day5,
      time: '19:00',
      createdAt: Date.now() - 1 * 86400000 + 1000,
    },

    // Day 6 (TODAY): Budget 150, Spent 100 (Remaining 50)
    {
      id: 'seed-exp-10',
      amount: 80,
      category: 'food',
      description: 'Breakfast & coffee combo',
      date: day6Today,
      time: '09:30',
      createdAt: Date.now() - 3600000 * 3,
    },
    {
      id: 'seed-exp-11',
      amount: 20,
      category: 'travel',
      description: 'Morning bus commute',
      date: day6Today,
      time: '11:15',
      createdAt: Date.now() - 3600000 * 1,
    },
  ];

  // Feature 2: Sample Student Savings Goals
  const goals: SavingsGoal[] = [
    {
      id: 'goal-1',
      title: 'Wireless Earbuds',
      targetAmount: 3000,
      savedAmount: 1800,
      icon: '🎧',
      category: 'Gadgets',
      targetDate: addDaysToDate(todayStr, 24),
      completed: false,
      linkedTier: 'flexible',
    },
    {
      id: 'goal-2',
      title: 'Semester Textbooks',
      targetAmount: 1500,
      savedAmount: 1200,
      icon: '📚',
      category: 'Education',
      targetDate: addDaysToDate(todayStr, 15),
      completed: false,
      linkedTier: 'protected',
    },
    {
      id: 'goal-3',
      title: 'Weekend Trek Trip',
      targetAmount: 4000,
      savedAmount: 1500,
      icon: '🎒',
      category: 'Travel',
      targetDate: addDaysToDate(todayStr, 35),
      completed: false,
      linkedTier: 'flexible',
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      type: 'morning',
      title: 'Morning Budget Active',
      message: 'Good morning! Your budget for today is ₹150.',
      timestamp: 'Today, 08:00 AM',
      read: false,
    },
    {
      id: 'notif-2',
      type: 'achievement',
      title: 'Savings Milestone',
      message: 'Great job! You saved ₹50 yesterday.',
      timestamp: 'Yesterday, 10:00 PM',
      read: true,
      meta: { amount: 50 },
    },
    {
      id: 'notif-3',
      type: 'evening',
      title: 'Daily Check-in',
      message: "Don't forget to add today's expenses.",
      timestamp: 'Yesterday, 08:30 PM',
      read: true,
    },
    {
      id: 'notif-4',
      type: 'overspent',
      title: 'Tier 3 Active Absorption',
      message: 'Overspending is smoothly absorbed by Flexible Savings. Protected Savings remains safe.',
      timestamp: '3 days ago',
      read: true,
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
