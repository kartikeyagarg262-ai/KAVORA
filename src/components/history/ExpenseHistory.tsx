import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  Download, 
  Calendar, 
  Clock, 
  Lock, 
  Wallet, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Gift, 
  Plus, 
  Layers,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate, formatTime, CATEGORIES } from '../../utils/formatters';
import { Expense, ExpenseCategory, VaultTransaction, FlexibleTransaction } from '../../types/finance';
import { EditExpenseModal } from '../expenses/EditExpenseModal';

type HistoryTab = 'all' | 'tier1' | 'tier2' | 'tier3';

export const ExpenseHistory: React.FC = () => {
  const { 
    expenses, 
    vaultTransactions, 
    ledger, 
    deleteExpense, 
    deleteVaultTransaction,
    config 
  } = useFinance();

  const [activeTierTab, setActiveTierTab] = useState<HistoryTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // 1. TIER 2: FILTER EXPENSES
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesSearch = 
        !searchQuery ||
        exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        CATEGORIES[exp.category]?.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(exp.amount).includes(searchQuery);

      const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;
      const matchesDate = !selectedDateFilter || exp.date === selectedDateFilter;

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [expenses, searchQuery, selectedCategory, selectedDateFilter]);

  // Group Tier 2 expenses by date
  const groupedExpenses = useMemo(() => {
    const groups: Record<string, { items: Expense[]; total: number }> = {};
    const sorted = [...filteredExpenses].sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return (b.time || '').localeCompare(a.time || '');
    });

    for (const exp of sorted) {
      if (!groups[exp.date]) {
        groups[exp.date] = { items: [], total: 0 };
      }
      groups[exp.date].items.push(exp);
      groups[exp.date].total += exp.amount;
    }
    return groups;
  }, [filteredExpenses]);

  // 2. TIER 1: FILTER VAULT TRANSACTIONS
  const filteredVaultTransactions = useMemo(() => {
    return vaultTransactions.filter((vt) => {
      const matchesSearch = 
        !searchQuery ||
        vt.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vt.note && vt.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
        String(Math.abs(vt.amount)).includes(searchQuery);

      const matchesDate = !selectedDateFilter || vt.date === selectedDateFilter;
      return matchesSearch && matchesDate;
    });
  }, [vaultTransactions, searchQuery, selectedDateFilter]);

  // 3. TIER 3: FILTER FLEXIBLE SAVINGS TRANSACTIONS
  const filteredFlexibleTransactions = useMemo(() => {
    return ledger.flexibleTransactions.filter((ft) => {
      const matchesSearch = 
        !searchQuery ||
        ft.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(Math.abs(ft.amount)).includes(searchQuery);

      const matchesDate = !selectedDateFilter || ft.date === selectedDateFilter;
      return matchesSearch && matchesDate;
    });
  }, [ledger.flexibleTransactions, searchQuery, selectedDateFilter]);

  // 4. ALL TIERS UNIFIED FEED
  const unifiedTransactions = useMemo(() => {
    const list: Array<{
      id: string;
      tier: 'tier1' | 'tier2' | 'tier3';
      title: string;
      subtitle: string;
      amount: number;
      isPositive: boolean;
      date: string;
      time?: string;
      icon: string;
      color: string;
    }> = [];

    // Tier 1 items
    for (const vt of filteredVaultTransactions) {
      list.push({
        id: vt.id,
        tier: 'tier1',
        title: vt.source,
        subtitle: vt.note || (vt.type === 'initial' ? 'Monthly Baseline Lock' : 'Protected Vault Deposit'),
        amount: Math.abs(vt.amount),
        isPositive: vt.amount > 0,
        date: vt.date,
        time: vt.time,
        icon: '🔒',
        color: 'text-vault-purple',
      });
    }

    // Tier 2 items
    for (const exp of filteredExpenses) {
      const cat = CATEGORIES[exp.category] || CATEGORIES.other;
      list.push({
        id: exp.id,
        tier: 'tier2',
        title: exp.description || cat.label,
        subtitle: `${cat.label} (Daily Budget)`,
        amount: exp.amount,
        isPositive: false,
        date: exp.date,
        time: exp.time,
        icon: cat.icon,
        color: 'text-spending-cyan',
      });
    }

    // Tier 3 items
    for (const ft of filteredFlexibleTransactions) {
      list.push({
        id: ft.id,
        tier: 'tier3',
        title: ft.type === 'rollover_in' ? 'Daily Surplus Auto-Roll' : 'Overspending Absorption',
        subtitle: ft.description,
        amount: Math.abs(ft.amount),
        isPositive: ft.amount > 0,
        date: ft.date,
        time: ft.time,
        icon: '🟢',
        color: 'text-flexible-green',
      });
    }

    return list.sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return (b.time || '').localeCompare(a.time || '');
    });
  }, [filteredVaultTransactions, filteredExpenses, filteredFlexibleTransactions]);

  // Export CSV based on active tab
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (activeTierTab === 'tier1') {
      headers = ['ID', 'Date', 'Time', 'Type', 'Source', 'Note', 'Amount'];
      rows = vaultTransactions.map(v => [
        v.id,
        v.date,
        v.time || '',
        v.type,
        `"${v.source.replace(/"/g, '""')}"`,
        `"${(v.note || '').replace(/"/g, '""')}"`,
        String(v.amount),
      ]);
    } else if (activeTierTab === 'tier3') {
      headers = ['ID', 'Date', 'DayNumber', 'Type', 'Description', 'Amount', 'BalanceAfter'];
      rows = ledger.flexibleTransactions.map(f => [
        f.id,
        f.date,
        String(f.dayNumber),
        f.type,
        `"${f.description.replace(/"/g, '""')}"`,
        String(f.amount),
        String(f.balanceAfter),
      ]);
    } else {
      headers = ['ID', 'Date', 'Time', 'Category', 'Description', 'Amount'];
      rows = expenses.map(e => [
        e.id,
        e.date,
        e.time || '',
        e.category,
        `"${(e.description || '').replace(/"/g, '""')}"`,
        String(e.amount),
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kavora_${activeTierTab}_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const datesList = Object.keys(groupedExpenses);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Transaction History</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dedicated transaction logs for all 3 Tiers (Protected Vault, Daily Expenses, Flexible Savings)
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-obsidian-850 hover:bg-obsidian-800 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 transition-all self-start sm:self-auto"
        >
          <Download size={15} />
          <span>Export {activeTierTab.toUpperCase()} CSV</span>
        </button>
      </div>

      {/* 3-TIER DEDICATED TABS */}
      <div className="flex items-center p-1.5 bg-obsidian-900 rounded-2xl border border-white/10 overflow-x-auto">
        <button
          onClick={() => setActiveTierTab('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTierTab === 'all'
              ? 'bg-gradient-to-r from-spending-cyan to-flexible-green text-obsidian-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers size={14} />
          <span>All 3 Tiers</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px] font-mono">
            {unifiedTransactions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTierTab('tier1')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTierTab === 'tier1'
              ? 'bg-vault-purple text-white shadow-md shadow-vault-purple/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🔒</span>
          <span>Tier 1: Protected Vault</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono">
            {vaultTransactions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTierTab('tier2')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTierTab === 'tier2'
              ? 'bg-spending-cyan text-obsidian-950 shadow-md shadow-spending-cyan/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>💳</span>
          <span>Tier 2: Daily Expenses</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono">
            {expenses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTierTab('tier3')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTierTab === 'tier3'
              ? 'bg-flexible-green text-obsidian-950 shadow-md shadow-flexible-green/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🟢</span>
          <span>Tier 3: Flexible Roll-ins</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono">
            {ledger.flexibleTransactions.length}
          </span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-obsidian-900 border border-white/10 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className={`${activeTierTab === 'tier2' ? 'sm:col-span-6' : 'sm:col-span-8'} relative`}>
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by note, relative gift, category, or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-obsidian-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-spending-cyan"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Dropdown (Only for Tier 2) */}
          {activeTierTab === 'tier2' && (
            <div className="sm:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-obsidian-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-spending-cyan"
              >
                <option value="all">All Categories</option>
                {(Object.keys(CATEGORIES) as ExpenseCategory[]).map((catKey) => (
                  <option key={catKey} value={catKey}>
                    {CATEGORIES[catKey].icon} {CATEGORIES[catKey].label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Filter */}
          <div className={`${activeTierTab === 'tier2' ? 'sm:col-span-3' : 'sm:col-span-4'}`}>
            <input
              type="date"
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-obsidian-950 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-spending-cyan"
            />
          </div>
        </div>

        {/* Reset Filter indicator */}
        {(selectedCategory !== 'all' || selectedDateFilter || searchQuery) && (
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
            <span>Filters active</span>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDateFilter('');
                setSearchQuery('');
              }}
              className="text-flexible-green hover:underline font-medium"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: UNIFIED ALL 3 TIERS */}
      {activeTierTab === 'all' && (
        <div className="rounded-3xl bg-obsidian-900 border border-white/10 overflow-hidden shadow-xl">
          <div className="p-4 bg-obsidian-850/60 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Chronological 3-Tier Multi-Flow Feed
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {unifiedTransactions.length} entries
            </span>
          </div>

          <div className="divide-y divide-white/5">
            {unifiedTransactions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">No records found</div>
            ) : (
              unifiedTransactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-obsidian-850/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-obsidian-950 border border-white/10 flex items-center justify-center text-lg">
                      {tx.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{tx.title}</h4>
                        <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase ${
                          tx.tier === 'tier1' 
                            ? 'bg-vault-purple/20 text-vault-purple border border-vault-purple/30' 
                            : tx.tier === 'tier2' 
                              ? 'bg-spending-cyan/20 text-spending-cyan border border-spending-cyan/30' 
                              : 'bg-flexible-green/20 text-flexible-green border border-flexible-green/30'
                        }`}>
                          {tx.tier === 'tier1' ? 'Tier 1 Vault' : tx.tier === 'tier2' ? 'Tier 2 Expense' : 'Tier 3 Flex'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{tx.subtitle}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-sm font-extrabold font-mono ${tx.isPositive ? 'text-flexible-mint' : 'text-slate-200'}`}>
                      {tx.isPositive ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {formatDate(tx.date)} {tx.time ? `• ${formatTime(tx.time)}` : ''}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: TIER 1 PROTECTED VAULT DEDICATED HISTORY */}
      {activeTierTab === 'tier1' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl glass-card-vault flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-vault-purple">
                TIER 1 VAULT LEDGER
              </span>
              <h3 className="text-xl font-bold text-white">Protected Savings Balance</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every baseline lock, unexpected cash gift (e.g. rishtedar), and withdrawal
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold font-display text-white">
                {formatCurrency(ledger.protectedSavings)}
              </span>
              <p className="text-xs text-vault-gold font-medium">Safe in vault</p>
            </div>
          </div>

          <div className="rounded-3xl bg-obsidian-900 border border-white/10 overflow-hidden shadow-xl">
            <div className="divide-y divide-white/5">
              {filteredVaultTransactions.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">No vault transactions found</div>
              ) : (
                filteredVaultTransactions.map((vt) => (
                  <div key={vt.id} className="p-4 flex items-center justify-between hover:bg-obsidian-850/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-vault-purple/20 text-vault-purple flex items-center justify-center border border-vault-purple/30 text-lg">
                        {vt.type === 'deposit' ? '🎁' : vt.type === 'withdrawal' ? '🔓' : '🔒'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{vt.source}</h4>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-vault-purple/20 text-vault-purple border border-vault-purple/30 font-semibold uppercase">
                            {vt.type}
                          </span>
                        </div>
                        {vt.note && (
                          <p className="text-[11px] text-slate-400 mt-0.5 italic">"{vt.note}"</p>
                        )}
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-1">
                          <Calendar size={11} />
                          <span>{formatDate(vt.date)}</span>
                          {vt.time && <span>• {formatTime(vt.time)}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`text-sm font-extrabold font-mono ${vt.amount > 0 ? 'text-vault-gold' : 'text-rose-400'}`}>
                          {vt.amount > 0 ? `+${formatCurrency(vt.amount)}` : formatCurrency(vt.amount)}
                        </span>
                        {vt.balanceAfter !== undefined && (
                          <p className="text-[10px] text-slate-400 font-mono">
                            Vault: {formatCurrency(vt.balanceAfter)}
                          </p>
                        )}
                      </div>

                      {vt.type === 'deposit' && (
                        <button
                          onClick={() => deleteVaultTransaction(vt.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete deposit"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: TIER 2 DAILY EXPENSES DEDICATED HISTORY */}
      {activeTierTab === 'tier2' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl glass-card-daily flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-spending-cyan">
                TIER 2 DAILY EXPENSES LEDGER
              </span>
              <h3 className="text-xl font-bold text-white">Total Spent This Cycle</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily spending against {formatCurrency(ledger.todayBudget)}/day allowance
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold font-display text-white">
                {formatCurrency(ledger.totalSpentSoFar)}
              </span>
              <p className="text-xs text-spending-cyan font-medium">
                of {formatCurrency(ledger.availableSpendingMoney)} available
              </p>
            </div>
          </div>

          {datesList.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-white/10 bg-obsidian-900/40">
              <p className="text-3xl mb-2">🔍</p>
              <h4 className="text-sm font-bold text-white">No expenses match your filter</h4>
            </div>
          ) : (
            <div className="space-y-4">
              {datesList.map((dateStr) => {
                const dayGroup = groupedExpenses[dateStr];
                const formattedDateLabel = formatDate(dateStr).toUpperCase();
                const dayCalc = ledger.dailyCalculations.find(d => d.date === dateStr);
                const budgetForDay = dayCalc?.budget || ledger.fixedDailyBudget;
                const diff = budgetForDay - dayGroup.total;

                return (
                  <div key={dateStr} className="rounded-3xl bg-obsidian-900 border border-white/10 overflow-hidden shadow-lg">
                    {/* Day Header Banner */}
                    <div className="px-6 py-3.5 bg-obsidian-850/70 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 font-extrabold text-xs uppercase tracking-wider text-slate-200">
                          <Calendar size={13} className="text-spending-cyan" />
                          <span>{formattedDateLabel}</span>
                          <span className="text-slate-500 font-normal">({dateStr})</span>
                        </div>

                        {diff > 0 ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-flexible-green/10 text-flexible-green border border-flexible-green/20 font-bold">
                            +{formatCurrency(diff)} Under Budget
                          </span>
                        ) : diff < 0 ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                            -{formatCurrency(Math.abs(diff))} Over Budget
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold">
                            On Budget
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 font-mono">Day Total: </span>
                        <span className="text-sm font-extrabold font-mono text-white">
                          {formatCurrency(dayGroup.total)}
                        </span>
                      </div>
                    </div>

                    {/* Day Expenses List */}
                    <div className="divide-y divide-white/5">
                      {dayGroup.items.map((item) => {
                        const cat = CATEGORIES[item.category] || CATEGORIES.other;

                        return (
                          <div
                            key={item.id}
                            className="group p-4 flex items-center justify-between hover:bg-obsidian-850/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg border"
                                style={{
                                  backgroundColor: cat.bgColor,
                                  borderColor: cat.borderColor,
                                }}
                              >
                                {cat.icon}
                              </div>

                              <div>
                                <h4 className="text-xs font-bold text-white">
                                  {item.description || cat.label}
                                </h4>
                                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                  <span className="text-slate-300 font-medium">{cat.label}</span>
                                  {item.time && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1 font-mono text-slate-500">
                                        <Clock size={11} />
                                        {formatTime(item.time)}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="text-sm font-bold font-mono text-white">
                                {formatCurrency(item.amount)}
                              </span>

                              <div className="flex items-center opacity-60 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setEditingExpense(item)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => deleteExpense(item.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: TIER 3 FLEXIBLE SAVINGS DEDICATED HISTORY */}
      {activeTierTab === 'tier3' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl glass-card-flexible flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-flexible-green">
                TIER 3 FLEXIBLE SAVINGS LEDGER
              </span>
              <h3 className="text-xl font-bold text-white">Accumulated Cushion</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every daily surplus roll-in (+) and every overspending absorption (-)
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold font-display text-flexible-mint">
                {formatCurrency(ledger.currentFlexibleSavings)}
              </span>
              <p className="text-xs text-slate-300 font-medium">Ready for future overspending</p>
            </div>
          </div>

          <div className="rounded-3xl bg-obsidian-900 border border-white/10 overflow-hidden shadow-xl">
            <div className="divide-y divide-white/5">
              {filteredFlexibleTransactions.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">No Flexible Savings activity yet</div>
              ) : (
                filteredFlexibleTransactions.map((ft) => (
                  <div key={ft.id} className="p-4 flex items-center justify-between hover:bg-obsidian-850/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg border ${
                        ft.type === 'rollover_in'
                          ? 'bg-flexible-green/20 text-flexible-green border-flexible-green/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}>
                        {ft.type === 'rollover_in' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">
                            {ft.type === 'rollover_in' ? 'Daily Surplus Rolled In' : 'Overspending Absorbed'}
                          </h4>
                          <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase ${
                            ft.type === 'rollover_in'
                              ? 'bg-flexible-green/20 text-flexible-green'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            Day {ft.dayNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{ft.description}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-1">
                          <Calendar size={11} />
                          <span>{formatDate(ft.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-sm font-extrabold font-mono ${
                        ft.amount > 0 ? 'text-flexible-mint' : 'text-rose-400'
                      }`}>
                        {ft.amount > 0 ? `+${formatCurrency(ft.amount)}` : formatCurrency(ft.amount)}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Flex Balance: {formatCurrency(ft.balanceAfter)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
};
