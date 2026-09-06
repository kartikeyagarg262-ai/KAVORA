import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  TrendingUp, 
  Shield, 
  Sparkles, 
  PieChart as PieIcon, 
  DollarSign, 
  Calendar, 
  Award,
  Layers,
  BarChart3
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, CATEGORIES } from '../../utils/formatters';
import { ExpenseCategory } from '../../types/finance';

export const AnalyticsView: React.FC = () => {
  const { config, ledger, expenses } = useFinance();

  // 1. Core Summary Metrics
  const totalSpent = ledger.totalSpentSoFar;
  const totalSavings = ledger.protectedSavings + ledger.currentFlexibleSavings;
  const savingsRate = config.monthlyIncome > 0 
    ? Math.round((totalSavings / config.monthlyIncome) * 100) 
    : 0;

  const averageDailySpend = ledger.currentDayIndex > 0 
    ? Math.round(totalSpent / ledger.currentDayIndex) 
    : 0;

  // 2. Category Breakdown Calculation
  const categoryTotals = useMemo(() => {
    const map: Record<string, { category: ExpenseCategory; total: number; count: number }> = {};
    for (const exp of expenses) {
      if (!map[exp.category]) {
        map[exp.category] = { category: exp.category, total: 0, count: 0 };
      }
      map[exp.category].total += exp.amount;
      map[exp.category].count += 1;
    }
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [expenses]);

  const topCategory = categoryTotals[0] || null;

  // 3. Category Data for Pie Chart
  const pieChartData = useMemo(() => {
    return categoryTotals.map((item) => {
      const cat = CATEGORIES[item.category] || CATEGORIES.other;
      return {
        name: cat.label,
        value: item.total,
        color: cat.color,
        icon: cat.icon,
      };
    });
  }, [categoryTotals]);

  // 4. Daily Spending Trend Data
  const dailyTrendData = useMemo(() => {
    return ledger.dailyCalculations
      .slice(0, ledger.currentDayIndex)
      .map((d) => {
        const [y, m, day] = d.date.split('-');
        return {
          dayLabel: `Day ${d.dayNumber}`,
          date: `${day}/${m}`,
          spent: d.spent,
          budget: d.budget,
        };
      });
  }, [ledger.dailyCalculations, ledger.currentDayIndex]);

  // 5. Weekly Spending Breakdown
  const weeklyData = useMemo(() => {
    const weeks: Record<string, number> = {
      'Week 1': 0,
      'Week 2': 0,
      'Week 3': 0,
      'Week 4': 0,
    };
    for (let i = 0; i < ledger.dailyCalculations.length; i++) {
      const d = ledger.dailyCalculations[i];
      if (i < 7) weeks['Week 1'] += d.spent;
      else if (i < 14) weeks['Week 2'] += d.spent;
      else if (i < 21) weeks['Week 3'] += d.spent;
      else weeks['Week 4'] += d.spent;
    }
    return Object.keys(weeks).map(w => ({ week: w, spent: weeks[w] }));
  }, [ledger.dailyCalculations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Financial Analytics</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Deep visual breakdown of your 3-Tier Money allocation and daily spending habits
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Spending */}
        <div className="p-4 rounded-2xl bg-obsidian-900 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Spent</span>
            <DollarSign size={16} className="text-rose-400" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white font-display">
              {formatCurrency(totalSpent)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              of {formatCurrency(ledger.availableSpendingMoney)} available
            </p>
          </div>
        </div>

        {/* Total Savings */}
        <div className="p-4 rounded-2xl bg-obsidian-900 border border-flexible-green/30 flex flex-col justify-between bg-gradient-to-br from-obsidian-900 to-flexible-green/10">
          <div className="flex items-center justify-between text-flexible-green mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Savings</span>
            <Sparkles size={16} className="text-flexible-green" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-flexible-mint font-display">
              {formatCurrency(totalSavings)}
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              Vault ({formatCurrency(ledger.protectedSavings)}) + Flex ({formatCurrency(ledger.currentFlexibleSavings)})
            </p>
          </div>
        </div>

        {/* Daily Average */}
        <div className="p-4 rounded-2xl bg-obsidian-900 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Daily Spend</span>
            <Calendar size={16} className="text-spending-cyan" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white font-display">
              {formatCurrency(averageDailySpend)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Target budget: {formatCurrency(ledger.todayBudget)}/d
            </p>
          </div>
        </div>

        {/* Highest Category */}
        <div className="p-4 rounded-2xl bg-obsidian-900 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Top Expense</span>
            <Award size={16} className="text-amber-400" />
          </div>
          <div>
            <div className="text-lg font-extrabold text-white truncate flex items-center gap-1.5">
              <span>{topCategory ? CATEGORIES[topCategory.category]?.icon : '—'}</span>
              <span>{topCategory ? CATEGORIES[topCategory.category]?.label.split(' ')[0] : 'None'}</span>
            </div>
            <p className="text-[11px] text-amber-300/80 mt-1 font-mono font-bold">
              {topCategory ? formatCurrency(topCategory.total) : '₹0'}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Spending Trend Chart */}
      <div className="p-6 rounded-3xl bg-obsidian-900 border border-white/10 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp size={18} className="text-spending-cyan" />
              <span>Daily Spending vs. Daily Budget Limit</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Shows how much you spent on each day compared to your daily budget threshold ({formatCurrency(ledger.todayBudget)})
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-spending-cyan" />
              <span>Spent</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span className="w-3 h-0.5 bg-rose-400" />
              <span>Budget Threshold</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="dayLabel" stroke="#475569" fontSize={11} tickLine={false} />
              <YAxis stroke="#475569" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(value: number) => [`₹${value}`, 'Amount']}
              />
              <ReferenceLine y={ledger.todayBudget} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: `Limit ₹${ledger.todayBudget}`, fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} />
              <Area type="monotone" dataKey="spent" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#spendGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Category Breakdown + Weekly Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-6 rounded-3xl bg-obsidian-900 border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mb-1">
              <PieIcon size={18} className="text-flexible-green" />
              <span>Monthly Category Breakdown</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Where your money is flowing across essential vs leisure categories
            </p>

            {pieChartData.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">No expense data to display</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                        formatter={(val: number) => [`₹${val}`, 'Spent']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Legend list */}
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {pieChartData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded-xl bg-obsidian-950/60 border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{item.icon}</span>
                        <span className="text-slate-300 font-medium truncate max-w-[90px]">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-white">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Spending Chart */}
        <div className="p-6 rounded-3xl bg-obsidian-900 border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mb-1">
              <BarChart3 size={18} className="text-spending-cyan" />
              <span>Weekly Spending Pace</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Pacing across the 4 weeks of the {config.periodDays}-day cycle
            </p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="week" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val: number) => [`₹${val}`, 'Weekly Total']}
                  />
                  <Bar dataKey="spent" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
