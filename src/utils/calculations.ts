import { 
  BudgetConfig, 
  Expense, 
  FinancialLedger, 
  DayCalculation, 
  VaultTransaction, 
  FlexibleTransaction,
  DisciplineMetrics
} from '../types/finance';

/**
 * Calculates date string + N days (YYYY-MM-DD)
 */
export const addDaysToDate = (baseDateStr: string, daysToAdd: number): string => {
  const [y, m, d] = baseDateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + daysToAdd);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * Get difference in calendar days between two YYYY-MM-DD dates
 */
export const getDayDifference = (startDateStr: string, targetDateStr: string): number => {
  const [y1, m1, d1] = startDateStr.split('-').map(Number);
  const [y2, m2, d2] = targetDateStr.split('-').map(Number);
  const date1 = new Date(y1, m1 - 1, d1).getTime();
  const date2 = new Date(y2, m2 - 1, d2).getTime();
  const diffTime = date2 - date1;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Core 3-Tier Financial Ledger Calculator
 */
export const calculateFinancialLedger = (
  config: BudgetConfig,
  expenses: Expense[],
  vaultTransactions: VaultTransaction[] = [],
  todayDateStr?: string
): FinancialLedger => {
  const today = todayDateStr || new Date().toISOString().split('T')[0];
  const { monthlyIncome, protectedSavings: baseProtectedSavings, startDate, periodDays, budgetMode } = config;

  // Calculate Extra Vault Deposits & Adjustments (e.g. from relatives, gifts, extra cash)
  // Note: Skip 'initial' transactions because config.protectedSavings already includes base monthly allocation
  let extraVaultDeposits = 0;
  for (const vt of vaultTransactions) {
    if (vt.type !== 'initial') {
      extraVaultDeposits += vt.amount;
    }
  }
  const totalProtectedSavings = Math.max(0, baseProtectedSavings + extraVaultDeposits);

  // Available Spending Money derived from monthly income minus base protected savings
  const availableSpendingMoney = Math.max(0, monthlyIncome - baseProtectedSavings);
  const fixedDailyBudget = Math.round(availableSpendingMoney / (periodDays || 30));

  // Determine current cycle day index (1-based, capped at periodDays)
  const diffDays = getDayDifference(startDate, today);
  const currentDayIndex = Math.min(periodDays, Math.max(1, diffDays + 1));
  const daysRemaining = Math.max(1, periodDays - currentDayIndex + 1);

  // Group expenses by date (YYYY-MM-DD)
  const expensesByDate: Record<string, number> = {};
  let totalSpentSoFar = 0;

  for (const exp of expenses) {
    expensesByDate[exp.date] = (expensesByDate[exp.date] || 0) + exp.amount;
    totalSpentSoFar += exp.amount;
  }

  // Calculate past daily cascade to build Flexible Savings and generate Tier 3 ledger
  let runningFlexibleSavings = 0;
  const dailyCalculations: DayCalculation[] = [];
  const flexibleTransactions: FlexibleTransaction[] = [];

  // Track remaining money dynamically for Smart Mode
  let remainingSpendingPool = availableSpendingMoney;

  let underBudgetDaysCount = 0;
  let overBudgetDaysCount = 0;

  for (let i = 1; i <= periodDays; i++) {
    const dayDate = addDaysToDate(startDate, i - 1);
    const daySpent = expensesByDate[dayDate] || 0;
    const remainingDaysFromHere = Math.max(1, periodDays - i + 1);

    // Calculate this day's budget
    let dayBudget = fixedDailyBudget;
    if (budgetMode === 'smart') {
      dayBudget = Math.max(0, Math.round(remainingSpendingPool / remainingDaysFromHere));
    }

    const remaining = dayBudget - daySpent;
    let status: 'under' | 'exact' | 'over' = 'exact';
    let surplusAdded = 0;
    let overspentDeducted = 0;
    let uncoveredDeficit = 0;

    if (remaining > 0) {
      status = 'under';
      if (i <= currentDayIndex) underBudgetDaysCount++;
    } else if (remaining < 0) {
      status = 'over';
      if (i <= currentDayIndex) overBudgetDaysCount++;
    } else {
      status = 'exact';
      if (i <= currentDayIndex) underBudgetDaysCount++;
    }

    // Only finalize roll-ins/absorptions for past days or current day
    if (i < currentDayIndex) {
      // Past day: Surplus rolls into Flexible Savings; Overspend deducts from Flexible Savings
      if (remaining > 0) {
        surplusAdded = remaining;
        runningFlexibleSavings += remaining;

        flexibleTransactions.push({
          id: `flex_roll_${dayDate}_${i}`,
          type: 'rollover_in',
          amount: surplusAdded,
          date: dayDate,
          time: '23:59',
          dayNumber: i,
          description: `Day ${i} surplus automatically rolled in (+₹${surplusAdded})`,
          createdAt: new Date(dayDate).getTime() + 86399000,
          balanceAfter: runningFlexibleSavings,
        });
      } else if (remaining < 0) {
        const overspent = Math.abs(remaining);
        if (runningFlexibleSavings >= overspent) {
          overspentDeducted = overspent;
          runningFlexibleSavings -= overspent;
        } else {
          overspentDeducted = runningFlexibleSavings;
          uncoveredDeficit = overspent - runningFlexibleSavings;
          runningFlexibleSavings = 0;
        }

        flexibleTransactions.push({
          id: `flex_absorb_${dayDate}_${i}`,
          type: 'overspend_out',
          amount: -overspentDeducted,
          date: dayDate,
          time: '23:59',
          dayNumber: i,
          description: uncoveredDeficit > 0 
            ? `Day ${i} overspending absorbed (-₹${overspentDeducted}), deficit: ₹${uncoveredDeficit}`
            : `Day ${i} overspending absorbed (-₹${overspentDeducted})`,
          createdAt: new Date(dayDate).getTime() + 86399000,
          balanceAfter: runningFlexibleSavings,
        });
      }
      remainingSpendingPool = Math.max(0, remainingSpendingPool - daySpent);
    } else if (i === currentDayIndex) {
      // Today: If overspent, show impact on Flexible Savings
      if (remaining < 0) {
        const overspent = Math.abs(remaining);
        if (runningFlexibleSavings >= overspent) {
          overspentDeducted = overspent;
          runningFlexibleSavings -= overspent;
        } else {
          overspentDeducted = runningFlexibleSavings;
          uncoveredDeficit = overspent - runningFlexibleSavings;
          runningFlexibleSavings = 0;
        }

        flexibleTransactions.push({
          id: `flex_absorb_today_${dayDate}`,
          type: 'overspend_out',
          amount: -overspentDeducted,
          date: dayDate,
          time: 'Active',
          dayNumber: i,
          description: `Today's overspending absorbed from Flexible Savings (-₹${overspentDeducted})`,
          createdAt: Date.now(),
          balanceAfter: runningFlexibleSavings,
        });
      }
      remainingSpendingPool = Math.max(0, remainingSpendingPool - daySpent);
    }

    dailyCalculations.push({
      date: dayDate,
      dayNumber: i,
      budget: dayBudget,
      spent: daySpent,
      remaining,
      status,
      surplusAddedToFlexible: surplusAdded,
      overspentDeductedFromFlexible: overspentDeducted,
      uncoveredDeficit,
    });
  }

  // Today specific calculations
  const todayCalc = dailyCalculations[currentDayIndex - 1] || {
    date: today,
    dayNumber: currentDayIndex,
    budget: fixedDailyBudget,
    spent: 0,
    remaining: fixedDailyBudget,
    status: 'under' as const,
    surplusAddedToFlexible: 0,
    overspentDeductedFromFlexible: 0,
    uncoveredDeficit: 0,
  };

  // Smart recommended daily budget for the future
  const smartDailyRecommended = Math.max(
    0,
    Math.round((availableSpendingMoney - totalSpentSoFar) / daysRemaining)
  );

  // Calculate Streak: Count backwards from today
  let streakDays = 0;
  for (let k = currentDayIndex - 1; k >= 0; k--) {
    const day = dailyCalculations[k];
    if (day && (day.status === 'under' || day.status === 'exact')) {
      streakDays++;
    } else {
      break;
    }
  }

  // Calculate Discipline Score (0 to 100)
  let rawScore = 60;
  const savingsRate = monthlyIncome > 0 ? (totalProtectedSavings + runningFlexibleSavings) / monthlyIncome : 0;
  if (savingsRate >= 0.20) rawScore += 20;
  else if (savingsRate >= 0.10) rawScore += 10;

  if (streakDays >= 5) rawScore += 15;
  else if (streakDays >= 2) rawScore += 8;

  rawScore -= (overBudgetDaysCount * 12);
  if (todayCalc.uncoveredDeficit > 0) rawScore -= 20;

  const score = Math.max(10, Math.min(100, Math.round(rawScore)));

  let badgeTitle = 'Budget Balancer';
  let badgeIcon = '⚖️';
  if (score >= 90) {
    badgeTitle = 'Diamond Disciplinarian';
    badgeIcon = '💎';
  } else if (score >= 75) {
    badgeTitle = 'Smart Allocator';
    badgeIcon = '🛡️';
  } else if (score < 50) {
    badgeTitle = 'Needs Adjustment';
    badgeIcon = '⚡';
  }

  const discipline: DisciplineMetrics = {
    score,
    streakDays,
    badgeTitle,
    badgeIcon,
    underBudgetDaysCount,
    overBudgetDaysCount,
  };

  return {
    monthlyIncome,
    protectedSavings: totalProtectedSavings,
    baseProtectedSavings,
    extraVaultDeposits,
    availableSpendingMoney,
    totalSpentSoFar,
    currentFlexibleSavings: runningFlexibleSavings,
    todayBudget: todayCalc.budget,
    todaySpent: todayCalc.spent,
    todayRemaining: todayCalc.remaining,
    todayStatus: todayCalc.status,
    todayDeficit: todayCalc.uncoveredDeficit,
    currentDayIndex,
    daysRemaining,
    smartDailyRecommended,
    fixedDailyBudget,
    dailyCalculations,
    flexibleTransactions: flexibleTransactions.reverse(),
    discipline,
  };
};
