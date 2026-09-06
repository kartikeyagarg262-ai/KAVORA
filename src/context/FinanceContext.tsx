import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  BudgetConfig, 
  Expense, 
  FinancialLedger, 
  NotificationItem, 
  NotificationSettings, 
  BudgetMode,
  VaultTransaction,
  SavingsGoal
} from '../types/finance';
import { calculateFinancialLedger } from '../utils/calculations';
import { createInitialSeedData } from '../utils/seedData';
import { sound } from '../utils/sound';

interface FinanceContextType {
  config: BudgetConfig;
  expenses: Expense[];
  vaultTransactions: VaultTransaction[];
  goals: SavingsGoal[];
  ledger: FinancialLedger;
  notifications: NotificationItem[];
  notificationSettings: NotificationSettings;
  isOnboarded: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // Privacy & PIN Lock
  privacyMode: boolean;
  togglePrivacyMode: () => void;
  isLocked: boolean;
  isPinEnabled: boolean;
  pinCode: string;
  unlockApp: (pin: string) => boolean;
  lockApp: () => void;
  updatePinSettings: (enabled: boolean, newPin?: string) => void;
  // Expense Actions
  addExpense: (expenseData: Omit<Expense, 'id' | 'createdAt'>) => { status: 'ok' | 'overspent'; deficit: number };
  editExpense: (id: string, updated: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  // Vault Actions
  addVaultDeposit: (depositData: { amount: number; source: string; note?: string; date?: string; time?: string }) => void;
  withdrawFromVault: (withdrawData: { amount: number; source: string; note?: string; date?: string; time?: string }) => boolean;
  deleteVaultTransaction: (id: string) => void;
  // Goals Actions
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'savedAmount' | 'completed'>) => void;
  deleteGoal: (id: string) => void;
  addFundsToGoal: (id: string, amount: number) => boolean;
  // Config & Notification Actions
  updateConfig: (updated: Partial<BudgetConfig>) => void;
  setBudgetMode: (mode: BudgetMode) => void;
  updateProtectedSavings: (newAmount: number) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  triggerSimulatedNotification: (type: NotificationItem['type']) => void;
  completeOnboarding: (newConfig: BudgetConfig) => void;
  resetOnboarding: () => void;
  resetToDemoData: () => void;
  toggleSound: () => boolean;
  soundEnabled: boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CONFIG: 'kavora_budget_config',
  EXPENSES: 'kavora_expenses',
  VAULT_TXS: 'kavora_vault_transactions',
  GOALS: 'kavora_savings_goals',
  NOTIFICATIONS: 'kavora_notifications',
  NOTIF_SETTINGS: 'kavora_notif_settings',
  ONBOARDED: 'kavora_is_onboarded',
  PRIVACY: 'kavora_privacy_mode',
  PIN_ENABLED: 'kavora_pin_enabled',
  PIN_CODE: 'kavora_pin_code',
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const seed = useMemo(() => createInitialSeedData(), []);

  // State initialization
  const [config, setConfig] = useState<BudgetConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return seed.config;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return seed.expenses;
  });

  const [vaultTransactions, setVaultTransactions] = useState<VaultTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VAULT_TXS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return seed.vaultTransactions;
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return seed.goals;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return seed.notifications;
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIF_SETTINGS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return seed.notificationSettings;
  });

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ONBOARDED);
    return saved !== null ? saved === 'true' : true;
  });

  // Feature 5: Privacy Mode & PIN
  const [privacyMode, setPrivacyMode] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.PRIVACY) === 'true';
  });

  const [isPinEnabled, setIsPinEnabled] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.PIN_ENABLED) === 'true';
  });

  const [pinCode, setPinCode] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.PIN_CODE) || '1234';
  });

  const [isLocked, setIsLocked] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<string>('home');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sound.isEnabled());

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VAULT_TXS, JSON.stringify(vaultTransactions));
  }, [vaultTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIF_SETTINGS, JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDED, String(isOnboarded));
  }, [isOnboarded]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRIVACY, String(privacyMode));
  }, [privacyMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PIN_ENABLED, String(isPinEnabled));
  }, [isPinEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PIN_CODE, pinCode);
  }, [pinCode]);

  // Compute 3-Tier Financial Ledger
  const ledger = useMemo(() => {
    return calculateFinancialLedger(config, expenses, vaultTransactions);
  }, [config, expenses, vaultTransactions]);

  // Toggle Privacy
  const togglePrivacyMode = () => {
    sound.playTap();
    setPrivacyMode(prev => !prev);
  };

  // Lock and Unlock
  const unlockApp = (enteredPin: string): boolean => {
    if (enteredPin === pinCode) {
      sound.playSuccess();
      setIsLocked(false);
      return true;
    }
    sound.playWarning();
    return false;
  };

  const lockApp = () => {
    sound.playTap();
    setIsLocked(true);
  };

  const updatePinSettings = (enabled: boolean, newPin?: string) => {
    sound.playTap();
    setIsPinEnabled(enabled);
    if (newPin) setPinCode(newPin);
  };

  // Expense Management
  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newId = 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newExpense: Expense = {
      ...expenseData,
      id: newId,
      createdAt: Date.now(),
    };

    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);

    const newLedger = calculateFinancialLedger(config, updatedExpenses, vaultTransactions);
    const todayRemaining = newLedger.todayRemaining;

    if (todayRemaining < 0) {
      sound.playWarning();
      const overspentAmount = Math.abs(todayRemaining);

      if (notificationSettings.overspendingAlert) {
        const notif: NotificationItem = {
          id: 'alert_' + Date.now(),
          type: 'overspent',
          title: 'Overspending Alert',
          message: newLedger.todayDeficit > 0 
            ? `You exceeded today's budget by ₹${overspentAmount}. Your Flexible Savings cannot cover this entire amount (Deficit: ₹${newLedger.todayDeficit}).`
            : `You exceeded today's budget by ₹${overspentAmount}. ₹${overspentAmount} was deducted from Flexible Savings.`,
          timestamp: 'Just now',
          read: false,
          meta: { amount: overspentAmount, flexibleRemaining: newLedger.currentFlexibleSavings },
        };
        setNotifications(prev => [notif, ...prev]);
      }
      return { status: 'overspent' as const, deficit: newLedger.todayDeficit };
    } else {
      sound.playSuccess();
      return { status: 'ok' as const, deficit: 0 };
    }
  };

  const editExpense = (id: string, updated: Partial<Expense>) => {
    sound.playTap();
    setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, ...updated } : exp));
  };

  const deleteExpense = (id: string) => {
    sound.playTap();
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  // Vault Management
  const addVaultDeposit = (depositData: { amount: number; source: string; note?: string; date?: string; time?: string }) => {
    sound.playSuccess();
    const today = new Date();
    const dateStr = depositData.date || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const timeStr = depositData.time || `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

    const newTx: VaultTransaction = {
      id: 'vault_dep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type: 'deposit',
      amount: depositData.amount,
      source: depositData.source || 'Extra Deposit',
      note: depositData.note || '',
      date: dateStr,
      time: timeStr,
      createdAt: Date.now(),
      balanceAfter: ledger.protectedSavings + depositData.amount,
    };

    setVaultTransactions(prev => [newTx, ...prev]);

    const notif: NotificationItem = {
      id: 'notif_vault_' + Date.now(),
      type: 'achievement',
      title: 'Protected Vault Increased 🔒',
      message: `+₹${depositData.amount} added to Protected Vault from "${depositData.source}".`,
      timestamp: 'Just now',
      read: false,
      meta: { amount: depositData.amount },
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const withdrawFromVault = (withdrawData: { amount: number; source: string; note?: string; date?: string; time?: string }): boolean => {
    if (withdrawData.amount > ledger.protectedSavings) {
      sound.playWarning();
      return false;
    }

    sound.playTap();
    const today = new Date();
    const dateStr = withdrawData.date || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const timeStr = withdrawData.time || `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

    const newTx: VaultTransaction = {
      id: 'vault_wd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type: 'withdrawal',
      amount: -withdrawData.amount,
      source: withdrawData.source || 'Vault Withdrawal',
      note: withdrawData.note || '',
      date: dateStr,
      time: timeStr,
      createdAt: Date.now(),
      balanceAfter: Math.max(0, ledger.protectedSavings - withdrawData.amount),
    };

    setVaultTransactions(prev => [newTx, ...prev]);
    return true;
  };

  const deleteVaultTransaction = (id: string) => {
    sound.playTap();
    setVaultTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Feature 2: Savings Goals Management
  const addGoal = (goalData: Omit<SavingsGoal, 'id' | 'savedAmount' | 'completed'>) => {
    sound.playSuccess();
    const newGoal: SavingsGoal = {
      ...goalData,
      id: 'goal_' + Date.now(),
      savedAmount: 0,
      completed: false,
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const deleteGoal = (id: string) => {
    sound.playTap();
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const addFundsToGoal = (id: string, amount: number): boolean => {
    const targetGoal = goals.find(g => g.id === id);
    if (!targetGoal) return false;

    // Check available pool based on linked tier
    const availablePool = targetGoal.linkedTier === 'protected' 
      ? ledger.protectedSavings 
      : ledger.currentFlexibleSavings;

    if (amount > availablePool) {
      sound.playWarning();
      return false;
    }

    sound.playSuccess();
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const newSaved = g.savedAmount + amount;
        const isComplete = newSaved >= g.targetAmount;
        if (isComplete && !g.completed) {
          try {
            confetti({ particleCount: 70, spread: 60 });
          } catch { /* ignore */ }
        }
        return {
          ...g,
          savedAmount: newSaved,
          completed: isComplete,
        };
      }
      return g;
    }));

    return true;
  };

  // Config Updates
  const updateConfig = (updated: Partial<BudgetConfig>) => {
    setConfig(prev => ({ ...prev, ...updated }));
  };

  const setBudgetMode = (mode: BudgetMode) => {
    sound.playTap();
    setConfig(prev => ({ ...prev, budgetMode: mode }));
  };

  const updateProtectedSavings = (newAmount: number) => {
    sound.playSuccess();
    setConfig(prev => ({ ...prev, protectedSavings: Math.max(0, newAmount) }));
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => ({ ...prev, ...settings }));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    sound.playTap();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const triggerSimulatedNotification = (type: NotificationItem['type']) => {
    sound.playTap();
    let title = '';
    let message = '';
    const todayBudget = ledger.todayBudget;

    switch (type) {
      case 'morning':
        title = 'Morning Budget Active';
        message = `Good morning! Your budget for today is ₹${todayBudget}.`;
        break;
      case 'evening':
        title = 'Evening Check-in';
        message = "Don't forget to add today's expenses.";
        break;
      case 'warning':
        title = 'Budget Alert';
        message = "You're close to today's budget limit.";
        break;
      case 'overspent':
        title = 'Tier 3 Deduction Alert';
        message = `You exceeded today's budget by ₹50. ₹50 was deducted from Flexible Savings.`;
        break;
      case 'achievement':
        title = 'Savings Achievement';
        message = `Great job! You saved ₹50 today. Streak: ${ledger.discipline.streakDays} days 🔥`;
        break;
      case 'month_end':
        title = 'Monthly Summary';
        message = `Your monthly financial summary is ready. Protected Savings secured: ₹${ledger.protectedSavings}. Score: ${ledger.discipline.score}/100.`;
        break;
    }

    const notif: NotificationItem = {
      id: 'sim_' + Date.now(),
      type,
      title,
      message,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const completeOnboarding = (newConfig: BudgetConfig) => {
    sound.playSuccess();
    setConfig(newConfig);
    setExpenses([]);
    const todayStr = newConfig.startDate;
    setVaultTransactions([
      {
        id: 'vault_init_' + Date.now(),
        type: 'initial',
        amount: newConfig.protectedSavings,
        source: 'Monthly Base Allocation',
        note: 'Initial monthly lock into vault',
        date: todayStr,
        time: '00:00',
        createdAt: Date.now(),
        balanceAfter: newConfig.protectedSavings,
      }
    ]);
    setIsOnboarded(true);
    setActiveTab('home');
  };

  const resetOnboarding = () => {
    sound.playTap();
    setIsOnboarded(false);
  };

  const resetToDemoData = () => {
    sound.playSuccess();
    const freshSeed = createInitialSeedData();
    setConfig(freshSeed.config);
    setExpenses(freshSeed.expenses);
    setVaultTransactions(freshSeed.vaultTransactions);
    setGoals(freshSeed.goals);
    setNotifications(freshSeed.notifications);
    setNotificationSettings(freshSeed.notificationSettings);
    setIsOnboarded(true);
    setActiveTab('home');
  };

  const toggleSound = () => {
    const newState = sound.toggleSound();
    setSoundEnabled(newState);
    return newState;
  };

  return (
    <FinanceContext.Provider
      value={{
        config,
        expenses,
        vaultTransactions,
        goals,
        ledger,
        notifications,
        notificationSettings,
        isOnboarded,
        activeTab,
        setActiveTab,
        privacyMode,
        togglePrivacyMode,
        isLocked,
        isPinEnabled,
        pinCode,
        unlockApp,
        lockApp,
        updatePinSettings,
        addExpense,
        editExpense,
        deleteExpense,
        addVaultDeposit,
        withdrawFromVault,
        deleteVaultTransaction,
        addGoal,
        deleteGoal,
        addFundsToGoal,
        updateConfig,
        setBudgetMode,
        updateProtectedSavings,
        updateNotificationSettings,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        triggerSimulatedNotification,
        completeOnboarding,
        resetOnboarding,
        resetToDemoData,
        toggleSound,
        soundEnabled,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
