export type ExpenseCategory = 
  | 'food'
  | 'travel'
  | 'shopping'
  | 'drinks'
  | 'entertainment'
  | 'bills'
  | 'education'
  | 'health'
  | 'other';

export interface CategoryInfo {
  id: ExpenseCategory;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24h)
  createdAt: number;
}

export type BudgetMode = 'fixed' | 'smart';

export interface BudgetConfig {
  monthlyIncome: number;
  protectedSavings: number; // Base monthly locked amount
  startDate: string; // YYYY-MM-DD
  periodDays: number;
  budgetMode: BudgetMode;
  userFullName: string;
}

export type DayStatus = 'under' | 'exact' | 'over';

export interface DayCalculation {
  date: string; // YYYY-MM-DD
  dayNumber: number; // 1 to 30
  budget: number;
  spent: number;
  remaining: number;
  status: DayStatus;
  surplusAddedToFlexible: number;
  overspentDeductedFromFlexible: number;
  uncoveredDeficit: number;
}

// TIER 1: Protected Savings Vault Transaction
export type VaultTransactionType = 'initial' | 'deposit' | 'withdrawal' | 'adjustment';

export interface VaultTransaction {
  id: string;
  type: VaultTransactionType;
  amount: number; // Positive for addition, negative for withdrawal
  source: string; // e.g. "Relative Gift (Chacha ji)", "Monthly Base Allocation", "Birthday Cash", etc.
  note?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  createdAt: number;
  balanceAfter?: number;
}

// TIER 3: Flexible Savings Transaction
export type FlexibleTransactionType = 'rollover_in' | 'overspend_out' | 'manual_transfer';

export interface FlexibleTransaction {
  id: string;
  type: FlexibleTransactionType;
  amount: number; // Positive for surplus roll-in (+₹50), negative for absorption (-₹50)
  date: string; // YYYY-MM-DD
  time?: string;
  dayNumber: number;
  description: string;
  createdAt: number;
  balanceAfter: number;
}

// Feature 2: Savings Goal / Wishlist Target
export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  icon: string; // emoji e.g. 🎧, ✈️, 📚, 💻
  category: string;
  targetDate?: string;
  completed: boolean;
  linkedTier: 'protected' | 'flexible';
}

// Feature 6: Discipline Metrics
export interface DisciplineMetrics {
  score: number; // 0 to 100
  streakDays: number; // Consecutive under-budget days
  badgeTitle: string; // e.g. "Diamond Disciplinarian", "Thrifty Guru"
  badgeIcon: string;
  underBudgetDaysCount: number;
  overBudgetDaysCount: number;
}

export interface FinancialLedger {
  monthlyIncome: number;
  protectedSavings: number; // Total protected vault balance (including extra deposits)
  baseProtectedSavings: number;
  extraVaultDeposits: number;
  availableSpendingMoney: number;
  totalSpentSoFar: number;
  currentFlexibleSavings: number;
  todayBudget: number;
  todaySpent: number;
  todayRemaining: number;
  todayStatus: DayStatus;
  todayDeficit: number;
  todayAbsorbedFromFlexible: number;
  currentDayIndex: number; // e.g. 6 of 30
  daysRemaining: number;
  smartDailyRecommended: number;
  fixedDailyBudget: number;
  dailyCalculations: DayCalculation[];
  flexibleTransactions: FlexibleTransaction[];
  discipline: DisciplineMetrics;
}

export type NotificationType = 
  | 'morning' 
  | 'evening' 
  | 'warning' 
  | 'overspent' 
  | 'achievement' 
  | 'month_end';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  meta?: {
    amount?: number;
    flexibleRemaining?: number;
  };
}

export interface NotificationSettings {
  morningBudget: boolean;
  eveningReminder: boolean;
  overspendingWarning: boolean;
  overspendingAlert: boolean;
  savingsAchievement: boolean;
  monthEndSummary: boolean;
}
