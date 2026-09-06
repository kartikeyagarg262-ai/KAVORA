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
  Smartphone,
  LogOut,
  Mail,
  Shield
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
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

  const { profile, user, signOut, isConfigured } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.full_name || config.userFullName);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

  const handleSignOut = async () => {
    await signOut();
  };

  const userDisplayName = profile?.full_name || config.userFullName || 'KAVORA User';
  const userEmail = profile?.email || user?.email || 'user@kavora.app';
  const userAvatar = profile?.avatar_url;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Settings & Profile</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your KAVORA 3-Tier preferences, Google account, PIN protection, and Vault settings
        </p>
      </div>

      {/* Profile & Google Account Card */}
      <div className="p-6 rounded-3xl bg-obsidian-900 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userDisplayName}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-flexible-green shadow-lg shadow-flexible-green/20"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-flexible-green to-spending-cyan flex items-center justify-center text-obsidian-950 font-extrabold text-2xl shadow-lg shadow-flexible-green/20">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
          )}
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
                <h3 className="text-lg font-bold text-white">{userDisplayName}</h3>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-xs text-spending-cyan hover:underline font-medium"
                >
                  Edit
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <Mail size={12} className="text-slate-500" />
              <span>{userEmail}</span>
              <span className="text-slate-600">•</span>
              <span className="text-flexible-green font-medium flex items-center gap-1">
                <Shield size={11} />
                {isConfigured ? 'Google Protected' : 'Demo Account'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={toggleSound}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
              soundEnabled 
                ? 'bg-obsidian-850 border-white/15 text-white' 
                : 'bg-obsidian-950 border-white/5 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 size={15} className="text-flexible-green" /> : <VolumeX size={15} />}
            <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
          </button>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all"
            title="Sign out of KAVORA"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-white/15 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto">
              <LogOut size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Sign Out of KAVORA?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your 3-Tier finances and expenses are securely saved in your private cloud account. You can log back in with Google anytime.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-750 text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleSignOut();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

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
