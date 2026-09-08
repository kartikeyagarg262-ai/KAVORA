import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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
import { calculateFinancialLedger, getLocalDateString } from '../utils/calculations';
import { createInitialSeedData } from '../utils/seedData';
import { sound } from '../utils/sound';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { 
  sendDeviceNotification, 
  requestNotificationPermission, 
  getNotificationPermission 
} from '../utils/deviceNotification';

interface FinanceContextType {
  config: BudgetConfig;
  expenses: Expense[];
  vaultTransactions: VaultTransaction[];
  goals: SavingsGoal[];
  ledger: FinancialLedger;
  notifications: NotificationItem[];
  deviceNotificationPermission: NotificationPermission;
  requestDeviceNotificationPermission: () => Promise<NotificationPermission>;
  notificationSettings: NotificationSettings;
  isOnboarded: boolean;
  activeTab: string;
  isDataLoading: boolean;
  dataSyncError: string | null;
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
  addExpense: (expenseData: Omit<Expense, 'id' | 'createdAt'>) => Promise<{ status: 'ok' | 'overspent'; deficit: number }>;
  editExpense: (id: string, updated: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  // Vault Actions
  addVaultDeposit: (depositData: { amount: number; source: string; note?: string; date?: string; time?: string }) => Promise<void>;
  withdrawFromVault: (withdrawData: { amount: number; source: string; note?: string; date?: string; time?: string }) => Promise<boolean>;
  deleteVaultTransaction: (id: string) => Promise<void>;
  // Goals Actions
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'savedAmount' | 'completed'>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addFundsToGoal: (id: string, amount: number) => Promise<boolean>;
  // Config & Notification Actions
  updateConfig: (updated: Partial<BudgetConfig>) => Promise<void>;
  setBudgetMode: (mode: BudgetMode) => Promise<void>;
  updateProtectedSavings: (newAmount: number) => Promise<void>;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  triggerSimulatedNotification: (type: NotificationItem['type']) => void;
  completeOnboarding: (newConfig: BudgetConfig) => Promise<void>;
  resetOnboarding: () => void;
  resetToDemoData: () => void;
  clearAllData: () => Promise<void>;
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
  const { user, profile, isConfigured } = useAuth();
  const seed = useMemo(() => createInitialSeedData(), []);

  // Financial States
  const [config, setConfig] = useState<BudgetConfig>(seed.config);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vaultTransactions, setVaultTransactions] = useState<VaultTransaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(seed.notifications);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(seed.notificationSettings);
  const [deviceNotificationPermission, setDeviceNotificationPermission] = useState<NotificationPermission>(
    () => getNotificationPermission()
  );

  const dispatchNotification = useCallback((notif: NotificationItem) => {
    setNotifications(prev => [notif, ...prev]);
    sendDeviceNotification(notif.title, { body: notif.message, tag: notif.id });
  }, []);

  const requestDeviceNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    const perm = await requestNotificationPermission();
    setDeviceNotificationPermission(perm);
    if (perm === 'granted') {
      sound.playSuccess();
      sendDeviceNotification('KAVORA Alerts Connected 📲', {
        body: 'Mobile status bar notifications are now active! Daily budget and overspending alerts will appear in your top slidebar.',
        tag: 'kavora_perm_granted',
      });
    }
    return perm;
  }, []);

  const [isOnboarded, setIsOnboarded] = useState<boolean>(true);
  const [currentDateStr, setCurrentDateStr] = useState<string>(() => getLocalDateString());
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [dataSyncError, setDataSyncError] = useState<string | null>(null);

  // Privacy & PIN Lock States
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);
  const [isPinEnabled, setIsPinEnabled] = useState<boolean>(false);
  const [pinCode, setPinCode] = useState<string>('1234');
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<string>('home');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sound.isEnabled());

  // Cloud Sync: Fetch authenticated user's private data from Supabase
  const loadUserDataFromSupabase = useCallback(async (userId: string) => {
    setIsDataLoading(true);
    setDataSyncError(null);

    try {
      // 1. Fetch Active Monthly Budget
      const { data: budgetData, error: budgetError } = await supabase
        .from('monthly_budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (budgetError) throw budgetError;

      if (budgetData) {
        // Automatically migrate any legacy 'smart' mode to strictly fixed
        if (budgetData.budget_mode === 'smart') {
          supabase
            .from('monthly_budgets')
            .update({ budget_mode: 'fixed' })
            .eq('id', budgetData.id)
            .then(() => {});
        }

        setConfig({
          userFullName: profile?.full_name || 'KAVORA User',
          monthlyIncome: Number(budgetData.monthly_income),
          protectedSavings: Number(budgetData.protected_savings),
          startDate: budgetData.start_date,
          periodDays: Number(budgetData.period_days),
          budgetMode: 'fixed',
        });
        setIsOnboarded(true);
      } else {
        // New user has no active budget yet -> Redirect to Onboarding Flow!
        setIsOnboarded(false);
      }

      // 2. Fetch Vault Transactions
      const { data: vaultData, error: vaultError } = await supabase
        .from('vault_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (vaultError) throw vaultError;
      if (vaultData) {
        setVaultTransactions(vaultData.map(v => ({
          id: v.id,
          type: v.type,
          amount: Number(v.amount),
          source: v.source,
          note: v.note || undefined,
          date: v.date,
          time: v.time || '12:00',
          createdAt: new Date(v.created_at).getTime(),
        })));
      }

      // 3. Fetch Expenses
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (expenseError) throw expenseError;
      if (expenseData) {
        setExpenses(expenseData.map(e => ({
          id: e.id,
          amount: Number(e.amount),
          category: e.category,
          description: e.description || '',
          date: e.date,
          time: e.time || '12:00',
          createdAt: new Date(e.created_at).getTime(),
        })));
      }

      // 4. Fetch Savings Goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;
      if (goalsData) {
        setGoals(goalsData.map(g => ({
          id: g.id,
          title: g.title,
          targetAmount: Number(g.target_amount),
          savedAmount: Number(g.saved_amount),
          icon: g.icon || '🎯',
          category: g.category || 'General',
          targetDate: g.target_date || undefined,
          completed: Boolean(g.completed),
          linkedTier: g.linked_tier as 'protected' | 'flexible',
        })));
      }

      // 5. Fetch User Settings
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (settingsData) {
        setPrivacyMode(Boolean(settingsData.privacy_mode));
        setIsPinEnabled(Boolean(settingsData.pin_enabled));
        if (settingsData.pin_code) setPinCode(settingsData.pin_code);
        if (settingsData.notification_settings) {
          setNotificationSettings(settingsData.notification_settings);
        }
      }
    } catch (err: unknown) {
      console.error('Supabase fetch error:', err);
      const msg = err instanceof Error ? err.message : 'Error syncing cloud data';
      setDataSyncError(msg);
    } finally {
      setIsDataLoading(false);
    }
  }, [profile?.full_name]);

  // Handle Authentication State Changes
  useEffect(() => {
    if (user) {
      if (isConfigured) {
        loadUserDataFromSupabase(user.id);
      } else {
        // Fallback for Demo User when .env is not yet set
        const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
        const savedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
        const savedVault = localStorage.getItem(STORAGE_KEYS.VAULT_TXS);
        const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);

        if (savedConfig) try { setConfig(JSON.parse(savedConfig)); } catch {}
        else setConfig({ ...seed.config, userFullName: profile?.full_name || 'Kartik' });

        if (savedExpenses) try { setExpenses(JSON.parse(savedExpenses)); } catch {}
        else setExpenses(seed.expenses);

        if (savedVault) try { setVaultTransactions(JSON.parse(savedVault)); } catch {}
        else setVaultTransactions(seed.vaultTransactions);

        if (savedGoals) try { setGoals(JSON.parse(savedGoals)); } catch {}
        else setGoals(seed.goals);

        setIsOnboarded(true);
      }
    } else {
      // User logged out: clear memory so User B never sees User A's data!
      setExpenses([]);
      setVaultTransactions([]);
      setGoals([]);
      setIsOnboarded(false);
    }
  }, [user, isConfigured, loadUserDataFromSupabase, profile?.full_name, seed]);

  // Monitor midnight date transitions every 10 seconds and on window focus/visibility
  useEffect(() => {
    const checkDateTransition = () => {
      const liveToday = getLocalDateString();
      if (liveToday !== currentDateStr) {
        console.log('Midnight rollover detected: date changed to', liveToday);
        setCurrentDateStr(liveToday);
      }
    };

    const interval = setInterval(checkDateTransition, 10000);
    window.addEventListener('focus', checkDateTransition);
    document.addEventListener('visibilitychange', checkDateTransition);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkDateTransition);
      document.removeEventListener('visibilitychange', checkDateTransition);
    };
  }, [currentDateStr]);

  // Compute 3-Tier Financial Ledger with live local date
  const ledger = useMemo(() => {
    return calculateFinancialLedger(config, expenses, vaultTransactions, currentDateStr);
  }, [config, expenses, vaultTransactions, currentDateStr]);

  // Automated Daily Reminders (Morning Budget & Evening Check-in)
  useEffect(() => {
    if (!isOnboarded) return;

    const checkDailyReminders = () => {
      const now = new Date();
      const hour = now.getHours();
      const todayStr = getLocalDateString(now);
      const lastMorning = localStorage.getItem('kavora_last_morning_notif');
      const lastEvening = localStorage.getItem('kavora_last_evening_notif');

      // 1. Morning Daily Budget Notification (send on first visit of day before 6 PM / 18:00)
      if (notificationSettings.morningBudget && hour < 18 && lastMorning !== todayStr) {
        localStorage.setItem('kavora_last_morning_notif', todayStr);
        const notif: NotificationItem = {
          id: 'morning_' + Date.now(),
          type: 'morning',
          title: 'Daily Budget Ready ☀️',
          message: `Today's allowance is ₹${ledger.todayBudget}. Spend mindfully to grow Flexible Savings!`,
          timestamp: 'Just now',
          read: false,
        };
        dispatchNotification(notif);
      }

      // 2. Evening Check-in Notification (send in the evening from 6:00 PM / 18:00 onwards)
      if (notificationSettings.eveningReminder && hour >= 18 && lastEvening !== todayStr) {
        localStorage.setItem('kavora_last_evening_notif', todayStr);
        const notif: NotificationItem = {
          id: 'evening_' + Date.now(),
          type: 'evening',
          title: 'Evening Expense Check-in 🌙',
          message: `You spent ₹${ledger.todaySpent} out of ₹${ledger.todayBudget} today. Remember to log any cash or UPI receipts!`,
          timestamp: 'Just now',
          read: false,
        };
        dispatchNotification(notif);
      }
    };

    checkDailyReminders();
    const timer = setInterval(checkDailyReminders, 20000);
    window.addEventListener('focus', checkDailyReminders);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', checkDailyReminders);
    };
  }, [isOnboarded, notificationSettings, ledger.todayBudget, ledger.todaySpent, dispatchNotification]);

  // Toggle Privacy
  const togglePrivacyMode = async () => {
    sound.playTap();
    const newPrivacy = !privacyMode;
    setPrivacyMode(newPrivacy);

    if (user && isConfigured) {
      await supabase.from('user_settings').upsert({
        user_id: user.id,
        privacy_mode: newPrivacy,
      });
    }
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

  const updatePinSettings = async (enabled: boolean, newPin?: string) => {
    sound.playTap();
    setIsPinEnabled(enabled);
    if (newPin) setPinCode(newPin);

    if (user && isConfigured) {
      await supabase.from('user_settings').upsert({
        user_id: user.id,
        pin_enabled: enabled,
        pin_code: newPin || pinCode,
      });
    }
  };

  // Expense Management
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const tempId = 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newExpense: Expense = {
      ...expenseData,
      id: tempId,
      createdAt: Date.now(),
    };

    // Optimistic local update
    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);

    const newLedger = calculateFinancialLedger(config, updatedExpenses, vaultTransactions, currentDateStr);
    const todayRemaining = newLedger.todayRemaining;
    const todaySpent = newLedger.todaySpent;
    const todayBudget = newLedger.todayBudget;

    // Cloud persistence
    if (user && isConfigured) {
      try {
        const { data, error } = await supabase.from('expenses').insert({
          user_id: user.id,
          amount: newExpense.amount,
          category: newExpense.category,
          description: newExpense.description,
          date: newExpense.date,
          time: newExpense.time,
        }).select('id').single();

        if (data && !error) {
          // Replace tempId with Supabase UUID
          setExpenses(prev => prev.map(e => e.id === tempId ? { ...e, id: data.id } : e));
        }
      } catch (err) {
        console.error('Failed to sync expense to cloud:', err);
      }
    }

    if (todayRemaining < 0) {
      sound.playWarning();
      const overspentAmount = Math.abs(todayRemaining);

      if (notificationSettings.overspendingAlert) {
        const notif: NotificationItem = {
          id: 'alert_' + Date.now(),
          type: 'overspent',
          title: 'Overspending Alert 🚨',
          message: newLedger.currentFlexibleSavings < 0
            ? `You exceeded today's budget by ₹${overspentAmount}. Deducted turant from Flexible Savings, which is now negative (${newLedger.currentFlexibleSavings}). Tonight's unspent budget will help repay it.`
            : `You exceeded today's budget by ₹${overspentAmount}. Deducted turant from Flexible Savings (Remaining: ₹${newLedger.currentFlexibleSavings}).`,
          timestamp: 'Just now',
          read: false,
          meta: { amount: overspentAmount, flexibleRemaining: newLedger.currentFlexibleSavings },
        };
        dispatchNotification(notif);
      }
      return { status: 'overspent' as const, deficit: newLedger.todayDeficit };
    } else {
      // 80% Daily Budget Proximity Warning
      if (todaySpent >= 0.8 * todayBudget && notificationSettings.overspendingWarning) {
        sound.playWarning();
        const notif: NotificationItem = {
          id: 'warn_' + Date.now(),
          type: 'warning',
          title: 'Budget Warning (80% Limit) ⚠️',
          message: `You've spent ₹${todaySpent} of your ₹${todayBudget} daily allowance. Only ₹${todayRemaining} left today!`,
          timestamp: 'Just now',
          read: false,
        };
        dispatchNotification(notif);
      } else {
        sound.playSuccess();
      }
      return { status: 'ok' as const, deficit: 0 };
    }
  };

  const editExpense = async (id: string, updated: Partial<Expense>) => {
    sound.playTap();
    setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, ...updated } : exp));

    if (user && isConfigured) {
      try {
        await supabase.from('expenses').update({
          amount: updated.amount,
          category: updated.category,
          description: updated.description,
          date: updated.date,
          time: updated.time,
        }).eq('id', id).eq('user_id', user.id);
      } catch (err) {
        console.error('Failed to edit expense in cloud:', err);
      }
    }
  };

  const deleteExpense = async (id: string) => {
    sound.playTap();
    setExpenses(prev => prev.filter(exp => exp.id !== id));

    if (user && isConfigured) {
      try {
        await supabase.from('expenses').delete().eq('id', id).eq('user_id', user.id);
      } catch (err) {
        console.error('Failed to delete expense in cloud:', err);
      }
    }
  };

  // Vault Management
  const addVaultDeposit = async (depositData: { amount: number; source: string; note?: string; date?: string; time?: string }) => {
    sound.playSuccess();
    const today = new Date();
    const dateStr = depositData.date || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const timeStr = depositData.time || `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
    const tempId = 'vault_dep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const newTx: VaultTransaction = {
      id: tempId,
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

    if (user && isConfigured) {
      try {
        const { data, error } = await supabase.from('vault_transactions').insert({
          user_id: user.id,
          type: 'deposit',
          amount: newTx.amount,
          source: newTx.source,
          note: newTx.note,
          date: newTx.date,
          time: newTx.time,
        }).select('id').single();

        if (data && !error) {
          setVaultTransactions(prev => prev.map(v => v.id === tempId ? { ...v, id: data.id } : v));
        }
      } catch (err) {
        console.error('Failed to sync vault deposit:', err);
      }
    }

    const notif: NotificationItem = {
      id: 'notif_vault_' + Date.now(),
      type: 'achievement',
      title: 'Protected Vault Increased 🔒',
      message: `+₹${depositData.amount} added to Protected Vault from "${depositData.source}".`,
      timestamp: 'Just now',
      read: false,
      meta: { amount: depositData.amount },
    };
    dispatchNotification(notif);
  };

  const withdrawFromVault = async (withdrawData: { amount: number; source: string; note?: string; date?: string; time?: string }): Promise<boolean> => {
    if (withdrawData.amount > ledger.protectedSavings) {
      sound.playWarning();
      return false;
    }

    sound.playTap();
    const today = new Date();
    const dateStr = withdrawData.date || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const timeStr = withdrawData.time || `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
    const tempId = 'vault_wd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const newTx: VaultTransaction = {
      id: tempId,
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

    if (user && isConfigured) {
      try {
        const { data, error } = await supabase.from('vault_transactions').insert({
          user_id: user.id,
          type: 'withdrawal',
          amount: newTx.amount,
          source: newTx.source,
          note: newTx.note,
          date: newTx.date,
          time: newTx.time,
        }).select('id').single();

        if (data && !error) {
          setVaultTransactions(prev => prev.map(v => v.id === tempId ? { ...v, id: data.id } : v));
        }
      } catch (err) {
        console.error('Failed to sync vault withdrawal:', err);
      }
    }

    return true;
  };

  const deleteVaultTransaction = async (id: string) => {
    sound.playTap();
    setVaultTransactions(prev => prev.filter(t => t.id !== id));

    if (user && isConfigured) {
      try {
        await supabase.from('vault_transactions').delete().eq('id', id).eq('user_id', user.id);
      } catch (err) {
        console.error('Failed to delete vault transaction:', err);
      }
    }
  };

  // Savings Goals Management
  const addGoal = async (goalData: Omit<SavingsGoal, 'id' | 'savedAmount' | 'completed'>) => {
    sound.playSuccess();
    const tempId = 'goal_' + Date.now();
    const newGoal: SavingsGoal = {
      ...goalData,
      id: tempId,
      savedAmount: 0,
      completed: false,
    };
    setGoals(prev => [newGoal, ...prev]);

    if (user && isConfigured) {
      try {
        const { data, error } = await supabase.from('savings_goals').insert({
          user_id: user.id,
          title: newGoal.title,
          target_amount: newGoal.targetAmount,
          saved_amount: 0,
          icon: newGoal.icon,
          category: newGoal.category,
          target_date: newGoal.targetDate,
          completed: false,
          linked_tier: newGoal.linkedTier,
        }).select('id').single();

        if (data && !error) {
          setGoals(prev => prev.map(g => g.id === tempId ? { ...g, id: data.id } : g));
        }
      } catch (err) {
        console.error('Failed to save goal to cloud:', err);
      }
    }
  };

  const deleteGoal = async (id: string) => {
    sound.playTap();
    setGoals(prev => prev.filter(g => g.id !== id));

    if (user && isConfigured) {
      try {
        await supabase.from('savings_goals').delete().eq('id', id).eq('user_id', user.id);
      } catch (err) {
        console.error('Failed to delete goal in cloud:', err);
      }
    }
  };

  const addFundsToGoal = async (id: string, amount: number): Promise<boolean> => {
    const targetGoal = goals.find(g => g.id === id);
    if (!targetGoal) return false;

    const availablePool = targetGoal.linkedTier === 'protected' 
      ? ledger.protectedSavings 
      : ledger.currentFlexibleSavings;

    if (amount > availablePool) {
      sound.playWarning();
      return false;
    }

    sound.playSuccess();
    const newSaved = targetGoal.savedAmount + amount;
    const isComplete = newSaved >= targetGoal.targetAmount;

    if (isComplete && !targetGoal.completed) {
      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch {}
    }

    setGoals(prev => prev.map(g => g.id === id ? { ...g, savedAmount: newSaved, completed: isComplete } : g));

    if (user && isConfigured) {
      try {
        await supabase.from('savings_goals').update({
          saved_amount: newSaved,
          completed: isComplete,
        }).eq('id', id).eq('user_id', user.id);
      } catch (err) {
        console.error('Failed to update goal funds in cloud:', err);
      }
    }

    return true;
  };

  // Config Updates
  const updateConfig = async (updated: Partial<BudgetConfig>) => {
    const newConfig = { ...config, ...updated };
    setConfig(newConfig);

    if (user && isConfigured) {
      try {
        await supabase.from('monthly_budgets').update({
          monthly_income: newConfig.monthlyIncome,
          protected_savings: newConfig.protectedSavings,
          period_days: newConfig.periodDays,
          budget_mode: newConfig.budgetMode,
        }).eq('user_id', user.id).eq('is_active', true);
      } catch (err) {
        console.error('Failed to update monthly budget in cloud:', err);
      }
    }
  };

  const setBudgetMode = async (mode: BudgetMode) => {
    sound.playTap();
    await updateConfig({ budgetMode: mode });
  };

  const updateProtectedSavings = async (newAmount: number) => {
    sound.playSuccess();
    await updateConfig({ protectedSavings: Math.max(0, newAmount) });
  };

  const updateNotificationSettings = async (settings: Partial<NotificationSettings>) => {
    const newSettings = { ...notificationSettings, ...settings };
    setNotificationSettings(newSettings);

    if (user && isConfigured) {
      await supabase.from('user_settings').upsert({
        user_id: user.id,
        notification_settings: newSettings,
      });
    }
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
    dispatchNotification(notif);
  };

  // Complete Onboarding for New User
  const completeOnboarding = async (newConfig: BudgetConfig) => {
    sound.playSuccess();
    setConfig(newConfig);
    setExpenses([]);
    setIsOnboarded(true);
    setActiveTab('home');

    const todayStr = newConfig.startDate;

    if (user && isConfigured) {
      try {
        // Deactivate any existing budget
        await supabase.from('monthly_budgets')
          .update({ is_active: false })
          .eq('user_id', user.id);

        // Insert fresh budget
        await supabase.from('monthly_budgets').insert({
          user_id: user.id,
          monthly_income: newConfig.monthlyIncome,
          protected_savings: newConfig.protectedSavings,
          start_date: newConfig.startDate,
          period_days: newConfig.periodDays,
          budget_mode: newConfig.budgetMode,
          is_active: true,
        });

        // Insert initial vault transaction
        const { data: vData } = await supabase.from('vault_transactions').insert({
          user_id: user.id,
          type: 'initial',
          amount: newConfig.protectedSavings,
          source: 'Monthly Base Allocation',
          note: 'Initial monthly lock into vault',
          date: todayStr,
          time: '00:00',
        }).select('id').single();

        setVaultTransactions([
          {
            id: vData?.id || 'vault_init_' + Date.now(),
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
      } catch (err) {
        console.error('Error saving onboarding data to cloud:', err);
      }
    } else {
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
    }
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

  const clearAllData = async () => {
    sound.playTap();
    // 1. Wipe local memory
    setExpenses([]);
    setVaultTransactions([]);
    setGoals([]);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.VAULT_TXS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);

    // 2. If connected to Supabase cloud, delete all records for this user
    if (user && isConfigured) {
      try {
        await Promise.all([
          supabase.from('expenses').delete().eq('user_id', user.id),
          supabase.from('vault_transactions').delete().eq('user_id', user.id),
          supabase.from('savings_goals').delete().eq('user_id', user.id),
        ]);
      } catch (err) {
        console.error('Error clearing cloud data:', err);
      }
    }

    // 3. Trigger clean onboarding
    setIsOnboarded(false);
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
        deviceNotificationPermission,
        requestDeviceNotificationPermission,
        notificationSettings,
        isOnboarded,
        activeTab,
        isDataLoading,
        dataSyncError,
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
        clearAllData,
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
