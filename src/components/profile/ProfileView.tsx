import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Sliders, 
  Zap, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Bell, 
  KeyRound,
  ShieldAlert,
  Smartphone
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { NotificationCenter } from '../notifications/NotificationCenter';

export const ProfileView: React.FC = () => {
  const { 
    config, 
    updateConfig, 
    setBudgetMode, 
    ledger, 
    toggleSound, 
    soundEnabled, 
    resetOnboarding, 
    resetToDemoData,
    updateProtectedSavings,
    isPinEnabled,
    pinCode,
    updatePinSettings,
    lockApp
  } = useFinance();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(config.userFullName);
  const [showNotifSettings, setShowNotifSettings] = useState(false);

  // PIN settings state
  const [pinInput, setPinInput] = useState(pinCode);
  const [isChangingPin, setIsChangingPin] = useState(false);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      updateConfig({ userFullName: nameInput.trim() });
    }
    setIsEditingName(false);
  };

  const handleSavePin = () => {
    if (pinInput.length === 4 && /^\d+$/.test(pinInput)) {
      updatePinSettings(true, pinInput);
      setIsChangingPin(false);
    } else {
      alert('PIN must be exactly 4 digits!');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Settings & Profile</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your KAVORA 3-Tier preferences, PIN protection, Protected Vault, and financial modes
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-6 rounded-3xl bg-obsidian-900 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-flexible-green to-spending-cyan flex items-center justify-center text-obsidian-950 font-extrabold text-2xl shadow-lg shadow-flexible-green/20">
            {config.userFullName.charAt(0).toUpperCase()}
          </div>
          <div>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="px-3 py-1 bg-obsidian-950 border border-white/20 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-spending-cyan"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="p-1.5 rounded-lg bg-flexible-green text-obsidian-950 hover:bg-flexible-mint"
                >
                  <Check size={14} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{config.userFullName}</h3>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-xs text-spending-cyan hover:underline font-medium"
                >
                  Edit
                </button>
              </div>
            )}
            <p className="text-xs text-slate-400 mt-0.5">Personal Finance Tier 3 Account</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={toggleSound}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
              soundEnabled 
                ? 'bg-obsidian-850 border-white/15 text-white' 
                : 'bg-obsidian-950 border-white/5 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 size={16} className="text-flexible-green" /> : <VolumeX size={16} />}
            <span>{soundEnabled ? 'Micro-Sounds On' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* Feature 5: Security & 4-Digit PIN Lock */}
      <div className="p-6 rounded-3xl bg-obsidian-900 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-flexible-green/10 text-flexible-green flex items-center justify-center border border-flexible-green/20">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">4-Digit PIN Security & Lock Screen</h3>
              <p className="text-xs text-slate-400">Lock your 3-Tier finances with PIN keypad</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={isPinEnabled}
              onChange={(e) => updatePinSettings(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-obsidian-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-flexible-green"></div>
          </label>
        </div>

        {isPinEnabled && (
          <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Current PIN:</span>
              <span className="font-mono font-bold text-white bg-obsidian-950 px-2.5 py-1 rounded-lg border border-white/10 tracking-widest">
                {isChangingPin ? (
                  <input
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-16 bg-transparent text-white focus:outline-none"
                    autoFocus
                  />
                ) : (
                  '••••'
                )}
              </span>
              {isChangingPin ? (
                <button
                  onClick={handleSavePin}
                  className="px-2.5 py-1 rounded-lg bg-flexible-green text-obsidian-950 font-bold text-[11px]"
                >
                  Save PIN
                </button>
              ) : (
                <button
                  onClick={() => setIsChangingPin(true)}
                  className="text-spending-cyan hover:underline"
                >
                  Change PIN
                </button>
              )}
            </div>

            <button
              onClick={lockApp}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold self-start sm:self-auto"
            >
              🔒 Lock App Now
            </button>
          </div>
        )}
      </div>

      {/* 3-Tier Mode Configuration */}
      <div className="p-6 rounded-3xl bg-obsidian-900 border border-white/10 space-y-5">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Sliders size={18} className="text-spending-cyan" />
            <span>Budget Calculation Mode</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Switch between a constant fixed daily limit or dynamic smart reallocation
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => setBudgetMode('fixed')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              config.budgetMode === 'fixed'
                ? 'bg-spending-cyan/15 border-spending-cyan shadow-lg shadow-spending-cyan/10'
                : 'bg-obsidian-950/70 border-white/5 hover:border-white/15'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-spending-cyan">Fixed Mode</span>
              <span className="text-xs font-mono font-bold text-white">{formatCurrency(ledger.fixedDailyBudget)}/d</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Available monthly pool divided equally by {config.periodDays} days. Constant allowance regardless of previous days.
            </p>
          </div>

          <div
            onClick={() => setBudgetMode('smart')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              config.budgetMode === 'smart'
                ? 'bg-flexible-green/15 border-flexible-green shadow-lg shadow-flexible-green/10'
                : 'bg-obsidian-950/70 border-white/5 hover:border-white/15'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-flexible-green">Smart Mode</span>
              <span className="text-xs font-mono font-bold text-flexible-mint">{formatCurrency(ledger.smartDailyRecommended)}/d</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Dynamically recalculates: Remaining Money ÷ Remaining Days ({ledger.daysRemaining} days left). Automatically adapts!
            </p>
          </div>
        </div>
      </div>

      {/* Tier 1 Vault Settings */}
      <div className="p-6 rounded-3xl bg-obsidian-900 border border-vault-purple/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-vault-purple/20 text-vault-purple flex items-center justify-center border border-vault-purple/30">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Tier 1 • Protected Savings Vault</h3>
              <p className="text-xs text-slate-400">Guaranteed safe from daily overspending</p>
            </div>
          </div>
          <span className="text-lg font-mono font-bold text-vault-purple">{formatCurrency(ledger.protectedSavings)}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/5 text-xs text-slate-300 flex items-center gap-2">
          <ShieldCheck size={16} className="text-vault-purple shrink-0" />
          <span>This money is mathematically excluded from daily allowance calculations.</span>
        </div>
      </div>

      {/* Notifications Drawer Quick Trigger */}
      <div className="p-6 rounded-3xl bg-obsidian-900 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-slate-300 border border-white/5">
            <Bell size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Notification Preferences & Alerts</h3>
            <p className="text-xs text-slate-400">Morning budget, evening check-in, overspending alarms</p>
          </div>
        </div>
        <button
          onClick={() => setShowNotifSettings(true)}
          className="px-4 py-2 rounded-xl bg-obsidian-850 hover:bg-obsidian-800 text-xs font-semibold text-white border border-white/10 transition-colors"
        >
          Configure
        </button>
      </div>

      {/* Data Management / Demo Reset */}
      <div className="p-6 rounded-3xl bg-obsidian-900 border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Demo & Testing Tools</h3>
        <p className="text-xs text-slate-400">
          Easily restart the 6-screen onboarding or reload Kartik's pre-configured scenario (₹5,000 monthly, ₹500 vault, ₹150 daily budget, ₹300 flexible savings).
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={resetToDemoData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-flexible-green/15 text-flexible-mint hover:bg-flexible-green/25 border border-flexible-green/30 text-xs font-bold transition-all"
          >
            <RefreshCw size={15} />
            <span>Restore Kartik's Demo State</span>
          </button>

          <button
            onClick={resetOnboarding}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all"
          >
            <RotateCcw size={15} />
            <span>Replay 6-Screen Onboarding Flow</span>
          </button>
        </div>
      </div>

      <NotificationCenter isOpen={showNotifSettings} onClose={() => setShowNotifSettings(false)} />
    </div>
  );
};
