import { ExpenseCategory, CategoryInfo } from '../types/finance';

export const formatCurrency = (
  amount: number, 
  options?: { showSign?: boolean; compact?: boolean; privacy?: boolean }
): string => {
  if (options?.privacy) {
    return '••••••';
  }

  const isNegative = amount < 0;
  const absVal = Math.abs(amount);

  let formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(absVal);

  if (options?.showSign) {
    if (amount > 0) return `+${formatted}`;
    if (amount < 0) return `-${formatted}`;
  }

  return isNegative ? `-${formatted}` : formatted;
};

export const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (dateStr === todayStr) {
    return 'Today';
  }
  if (dateStr === yesterdayStr) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (timeStr: string): string => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const CATEGORIES: Record<ExpenseCategory, CategoryInfo> = {
  food: {
    id: 'food',
    label: 'Food & Dining',
    icon: '🍔',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  travel: {
    id: 'travel',
    label: 'Travel & Commute',
    icon: '🚕',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  shopping: {
    id: 'shopping',
    label: 'Shopping',
    icon: '🛍️',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  drinks: {
    id: 'drinks',
    label: 'Drinks & Coffee',
    icon: '☕',
    color: '#d97706',
    bgColor: 'rgba(217, 119, 6, 0.15)',
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  entertainment: {
    id: 'entertainment',
    label: 'Entertainment',
    icon: '🎮',
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  bills: {
    id: 'bills',
    label: 'Rent & Bills',
    icon: '🏠',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  education: {
    id: 'education',
    label: 'Education & Books',
    icon: '📚',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  health: {
    id: 'health',
    label: 'Health & Pharmacy',
    icon: '💊',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  other: {
    id: 'other',
    label: 'Other Miscellaneous',
    icon: '📦',
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
};
