import React, { useState } from 'react';
import { 
  Lock, 
  Wallet, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Gift, 
  Sliders, 
  ArrowDownLeft, 
  Calendar,
  History
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';

export const TierCards: React.FC = () => {
  const { 
    ledger, 
    config, 
    updateProtectedSavings, 
    addVaultDeposit, 
    withdrawFromVault, 
    deleteVaultTransaction,
    vaultTransactions,
    setActiveTab,
    privacyMode
  } = useFinance();

  const [showVaultModal, setShowVaultModal] = useState(false);
  const [modalTab, setModalTab] = useState<'deposit' | 'alter' | 'withdraw'>('deposit');

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState('500');
  const [depositSource, setDepositSource] = useState('Relative Gift (Rishtedar)');
  const [customSource, setCustomSource] = useState('');
  const [depositNote, setDepositNote] = useState('');

  // Alter Baseline Form State
  const [vaultAmountInput, setVaultAmountInput] = useState(String(config.protectedSavings));

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('');

  const spentPercentage = Math.min(100, Math.round((ledger.todaySpent / (ledger.todayBudget || 1)) * 100));

  const quickSourcePresets = [
    { label: '🎁 Relative Gift (Rishtedar)', value: 'Relative Gift (Rishtedar)' },
    { label: '🧧 Shagun / Festival', value: 'Festival Shagun' },
    { label: '💰 Pocket Cash Saved', value: 'Pocket Cash Saved' },
    { label: '💼 Part-time / Reward', value: 'Part-time / Reward' },
    { label: '✏️ Other Source', value: 'Other' },
  ];

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(depositAmount);
    if (!num || num <= 0) return;

    const finalSource = depositSource === 'Other' ? (customSource.trim() || 'Custom Gift') : depositSource;

    addVaultDeposit({
      amount: num,
      source: finalSource,
      note: depositNote.trim(),
    });

    setDepositAmount('500');
    setDepositNote('');
    setCustomSource('');
    setShowVaultModal(false);
  };

  const handleAlterBaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(vaultAmountInput);
    if (!isNaN(val) && val >= 0) {
      updateProtectedSavings(val);
      setShowVaultModal(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(withdrawAmount);
    if (!num || num <= 0) return;

    const ok = await withdrawFromVault({
      amount: num,
      source: withdrawReason.trim() || 'Emergency Need',
    });

    if (ok) {
      setWithdrawAmount('');
      setWithdrawReason('');
      setShowVaultModal(false);
    } else {
      alert('Withdrawal amount cannot exceed Protected Vault balance!');
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* TIER 1 — PROTECTED SAVINGS 🔒 */}
        <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl glass-card-vault p-4 sm:p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-vault-purple/10 flex flex-col justify-between">
          <div className="relative z-10">
            {/* Header / Lock Emblem */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-vault-purple/20 border border-vault-purple/30 flex items-center justify-center text-vault-purple shadow-md">
                  <Lock size={16} className="text-vault-purple sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-vault-purple/90">
                    TIER 1 • SECURED
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                    Protected Savings
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  setModalTab('deposit');
                  setShowVaultModal(true);
                }}
                className="flex items-center gap-1 text-[10.5px] px-2.5 py-1 rounded-lg bg-vault-purple/25 text-vault-gold hover:bg-vault-purple/35 border border-vault-purple/40 font-bold transition-all shadow-sm"
                title="Add Money (Gift from relative / cash)"
              >
                <Plus size={12} strokeWidth={3} />
                <span>Add Money</span>
              </button>
            </div>

            {/* Amount */}
            <div className="my-1.5 sm:my-2">
              <div className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
                {formatCurrency(ledger.protectedSavings, { privacy: privacyMode })}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 font-medium">
                Money secured for your future
              </p>

              {ledger.extraVaultDeposits > 0 && (
                <div className="flex items-center justify-between mt-1.5 p-1.5 rounded-lg bg-vault-purple/20 border border-vault-purple/30 text-[10.5px]">
                  <div className="flex items-center gap-1.5 text-vault-gold font-semibold">
                    <Gift size={12} />
                    <span>+{formatCurrency(ledger.extraVaultDeposits, { privacy: privacyMode })} gifts added</span>
                  </div>
                  <button
                    onClick={() => {
                      // Delete all gift deposits
                      vaultTransactions.filter(t => t.type === 'deposit').forEach(t => deleteVaultTransaction(t.id));
                    }}
                    className="text-[10px] text-rose-400 hover:text-rose-300 hover:underline font-bold px-1.5 py-0.5 rounded bg-rose-500/10"
                    title="Remove all gift deposits"
                  >
                    Clear Gifts (₹0)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Security Note & Action Buttons */}
          <div className="relative z-10 mt-3 sm:mt-5 pt-2.5 border-t border-vault-purple/20 space-y-2">
            <div className="flex items-center justify-between gap-2 text-[10.5px]">
              <button
                onClick={() => {
                  setVaultAmountInput(String(config.protectedSavings));
                  setModalTab('alter');
                  setShowVaultModal(true);
                }}
                className="text-slate-300 hover:text-white underline font-medium"
              >
                Alter Base (₹{config.protectedSavings})
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className="flex items-center gap-1 text-vault-purple hover:underline font-bold"
              >
                <History size={11} />
                <span>History</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-vault-purple/90 bg-vault-purple/10 p-2 sm:p-2.5 rounded-xl border border-vault-purple/20">
              <ShieldCheck size={14} className="shrink-0 text-vault-purple" />
              <span>Vault locked. Excluded from daily spending.</span>
            </div>
          </div>
        </div>

        {/* TIER 2 — DAILY SPENDING 💳 */}
        <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl glass-card-daily p-4 sm:p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-spending-cyan/10 flex flex-col justify-between">
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-spending-cyan/20 border border-spending-cyan/30 flex items-center justify-center text-spending-cyan shadow-md">
                  <Wallet size={16} className="text-spending-cyan sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-spending-cyan/90">
                    TIER 2 • DAILY LIMIT
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Today's Budget
                  </h3>
                </div>
              </div>

              <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-md bg-spending-cyan/15 text-spending-cyan border border-spending-cyan/30 font-bold">
                Allowance
              </span>
            </div>

            {/* Budget Amount */}
            <div className="my-1.5 sm:my-2">
              <div className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
                {formatCurrency(ledger.todayBudget, { privacy: privacyMode })}
              </div>
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 mt-1.5 font-mono">
                <span>Spent: <b className="text-slate-200">{formatCurrency(ledger.todaySpent, { privacy: privacyMode })}</b></span>
                <span>
                  {ledger.todayRemaining >= 0 ? (
                    <>Left: <b className="text-flexible-green font-bold">{formatCurrency(ledger.todayRemaining, { privacy: privacyMode })}</b></>
                  ) : (
                    <>Over: <b className="text-rose-400 font-bold">{formatCurrency(Math.abs(ledger.todayRemaining), { privacy: privacyMode })}</b></>
                  )}
                </span>
              </div>
            </div>

            {/* Progress Bar Indicator */}
            <div className="mt-2.5 sm:mt-3">
              <div className="w-full h-1.5 sm:h-2 bg-obsidian-950 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    ledger.todayStatus === 'over' 
                      ? 'bg-rose-500' 
                      : ledger.todayStatus === 'exact' 
                        ? 'bg-amber-400' 
                        : 'bg-flexible-green'
                  }`}
                  style={{ width: `${spentPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Daily Status Indicator */}
          <div className="relative z-10 mt-3 sm:mt-5 pt-2.5 border-t border-white/10">
            {ledger.todayStatus === 'under' && (
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-flexible-green bg-flexible-green/10 p-2 sm:p-2.5 rounded-xl border border-flexible-green/20">
                <CheckCircle2 size={14} className="shrink-0 text-flexible-green" />
                <span>🟢 {formatCurrency(ledger.todayRemaining, { privacy: privacyMode })} under budget</span>
              </div>
            )}

            {ledger.todayStatus === 'exact' && (
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-amber-300 bg-amber-400/10 p-2 sm:p-2.5 rounded-xl border border-amber-400/20">
                <AlertCircle size={14} className="shrink-0 text-amber-400" />
                <span>🟡 Used complete daily budget</span>
              </div>
            )}

            {ledger.todayStatus === 'over' && (
              <div className="flex flex-col gap-1.5 text-[11px] sm:text-xs text-rose-300 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 font-medium">
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-1.5 text-rose-400">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>Over: {formatCurrency(Math.abs(ledger.todayRemaining), { privacy: privacyMode })}</span>
                  </div>
                  {ledger.todayAbsorbedFromFlexible > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-flexible-green/15 text-flexible-green border border-flexible-green/25 font-bold">
                      -{formatCurrency(ledger.todayAbsorbedFromFlexible, { privacy: privacyMode })} from Flexible
                    </span>
                  )}
                </div>

                {ledger.todayAbsorbedFromFlexible > 0 && (
                  <div className="text-[10.5px] text-slate-300 bg-obsidian-950/70 px-2 py-1 rounded-lg border border-white/5 font-mono flex items-center justify-between">
                    <span className="text-slate-400">Over ₹{Math.abs(ledger.todayRemaining)} − Flexible ₹{ledger.todayAbsorbedFromFlexible}:</span>
                    <span className="font-bold text-rose-400">
                      Net Deficit: {formatCurrency(ledger.todayDeficit, { privacy: privacyMode })}
                    </span>
                  </div>
                )}

                {ledger.todayDeficit > 0 ? (
                  <p className="text-[10px] text-rose-300/90 leading-tight">
                    ⚠️ {formatCurrency(ledger.todayDeficit, { privacy: privacyMode })} net deficit remaining after absorbing {formatCurrency(ledger.todayAbsorbedFromFlexible, { privacy: privacyMode })} from Flexible Savings.
                  </p>
                ) : (
                  <p className="text-[10px] text-flexible-green font-medium">
                    ✅ 100% absorbed by Flexible Savings cushion! Zero net deficit.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* TIER 3 — FLEXIBLE SAVINGS 🟢 (HERO CARD) */}
        <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl glass-card-flexible p-4 sm:p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-flexible-green/20 flex flex-col justify-between border-2 border-flexible-green/40">
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-flexible-green/20 border border-flexible-green/40 flex items-center justify-center text-flexible-green shadow-md animate-pulse-slow">
                  <Sparkles size={16} className="text-flexible-green sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-flexible-green">
                    TIER 3 • HERO CUSHION
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                    Flexible Savings
                  </h3>
                </div>
              </div>

              <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-flexible-green/20 text-flexible-mint border border-flexible-green/30 font-bold">
                Auto-Roll
              </span>
            </div>

            {/* Amount */}
            <div className="my-1.5 sm:my-2">
              <div className="text-2xl sm:text-4xl font-extrabold text-flexible-mint tracking-tight font-display">
                {formatCurrency(ledger.currentFlexibleSavings, { privacy: privacyMode })}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 font-medium">
                Accumulates daily surplus & absorbs overspending
              </p>

              {ledger.todayAbsorbedFromFlexible > 0 && (
                <div className="mt-2 p-1.5 px-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10.5px] flex items-center justify-between text-rose-300 font-mono">
                  <span className="text-slate-300 text-[10px]">⚡ Used to absorb overspend:</span>
                  <b className="text-rose-400">-{formatCurrency(ledger.todayAbsorbedFromFlexible, { privacy: privacyMode })}</b>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Absorption Explainer */}
          <div className="relative z-10 mt-3 sm:mt-5 pt-2.5 border-t border-flexible-green/20 space-y-1.5">
            <div className="flex items-center justify-between text-[10.5px] sm:text-[11px] text-slate-300 bg-flexible-green/10 p-2 sm:p-2.5 rounded-xl border border-flexible-green/20">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={13} className="text-flexible-green" />
                <span>Daily surplus flows here</span>
              </div>
              <span className="text-flexible-green font-bold">+ Surplus</span>
            </div>
            <div className="text-[10px] sm:text-[10.5px] text-slate-400 flex items-center justify-between pt-0.5">
              <span>⚡ Absorbs overspending automatically</span>
              <button 
                onClick={() => setActiveTab('history')}
                className="text-flexible-green font-semibold hover:underline"
              >
                View Roll-ins
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Vault Manager Modal (Add Money, Alter Base, Withdraw) */}
      <Modal
        isOpen={showVaultModal}
        onClose={() => setShowVaultModal(false)}
        title="🔒 Tier 1: Protected Savings Vault"
        subtitle="Manage your locked wealth. Add unexpected cash gifts from relatives, alter baseline, or track transactions."
        maxWidth="lg"
      >
        <div className="space-y-4">
          {/* Modal Tab Switcher */}
          <div className="flex items-center p-1 bg-obsidian-950 rounded-2xl border border-white/5">
            <button
              onClick={() => setModalTab('deposit')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                modalTab === 'deposit'
                  ? 'bg-vault-purple text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gift size={14} />
              <span>Add Money / Gift 🎁</span>
            </button>
            <button
              onClick={() => setModalTab('alter')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                modalTab === 'alter'
                  ? 'bg-vault-purple text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders size={14} />
              <span>Alter Base Monthly</span>
            </button>
            <button
              onClick={() => setModalTab('withdraw')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                modalTab === 'withdraw'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft size={14} />
              <span>Emergency Withdraw</span>
            </button>
          </div>

          {/* TAB 1: ADD MONEY / GIFT */}
          {modalTab === 'deposit' && (
            <form onSubmit={handleDepositSubmit} className="space-y-4 animate-fadeIn">
              <div className="p-3 rounded-xl bg-vault-purple/10 border border-vault-purple/20 text-xs text-slate-300">
                💡 <b>Got unexpected money?</b> Jaise kisi rishtedar ne paise diye, ya koi cash reward mila — usse seedha Protected Vault me add karein. Yeh daily spending se bilkul alag rahega!
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Deposit Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-vault-purple font-bold text-xl">₹</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="500"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-obsidian-950 border border-white/10 rounded-xl text-white font-mono text-xl font-bold focus:outline-none focus:border-vault-purple"
                    required
                    autoFocus
                  />
                </div>

                {/* Quick Pills */}
                <div className="flex gap-2 mt-2">
                  {[200, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(String(amt))}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-mono text-slate-300"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Source / Reason
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickSourcePresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setDepositSource(preset.value)}
                      className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                        depositSource === preset.value
                          ? 'bg-vault-purple/25 border-vault-purple text-white font-bold'
                          : 'bg-obsidian-950 border-white/5 text-slate-300 hover:border-white/15'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {depositSource === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter custom source (e.g. Chacha ji gift)"
                    value={customSource}
                    onChange={(e) => setCustomSource(e.target.value)}
                    className="w-full mt-2 px-3 py-2 bg-obsidian-950 border border-white/10 rounded-xl text-xs text-white"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Optional Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Blessing money during holiday visit"
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian-950 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  New Vault Balance: <b className="text-white font-mono">{formatCurrency(ledger.protectedSavings + Number(depositAmount || 0))}</b>
                </span>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-vault-purple to-vault-gold text-white font-bold text-xs shadow-lg shadow-vault-purple/30 hover:opacity-95"
                >
                  Deposit to Vault 🔒
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ALTER BASELINE */}
          {modalTab === 'alter' && (
            <form onSubmit={handleAlterBaseSubmit} className="space-y-4 animate-fadeIn">
              <div className="p-3 rounded-xl bg-obsidian-950 border border-white/5 text-xs text-slate-400">
                Change your recurring base monthly savings allocation. Current base: <b className="text-white">₹{config.protectedSavings}</b>.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Base Monthly Protected Savings (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">₹</span>
                  <input
                    type="number"
                    min="0"
                    max={config.monthlyIncome}
                    value={vaultAmountInput}
                    onChange={(e) => setVaultAmountInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-obsidian-950 border border-white/10 rounded-xl text-white font-mono text-xl font-bold focus:outline-none focus:border-vault-purple"
                    required
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Available monthly spending will become: <b className="text-spending-cyan">{formatCurrency(Math.max(0, config.monthlyIncome - Number(vaultAmountInput || 0)))}</b>.
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-vault-purple text-white font-bold text-xs shadow-lg shadow-vault-purple/30 hover:opacity-95"
                >
                  Update Baseline
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: EMERGENCY WITHDRAW */}
          {modalTab === 'withdraw' && (
            <form onSubmit={handleWithdrawSubmit} className="space-y-4 animate-fadeIn">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                ⚠️ <b>Emergency Release:</b> Money in Protected Vault is meant for long-term safety. Withdraw only for genuine emergency needs.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Withdrawal Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 font-bold text-xl">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={ledger.protectedSavings}
                    placeholder="100"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-obsidian-950 border border-white/10 rounded-xl text-white font-mono text-xl font-bold focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Available in vault: {formatCurrency(ledger.protectedSavings)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Emergency Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Urgent college fee, medical"
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian-950 border border-white/10 rounded-xl text-xs text-white"
                  required
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/30 hover:opacity-95"
                >
                  Confirm Withdrawal
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </>
  );
};
