import React, { useState } from 'react';
import { Bell, Volume2, VolumeX, Shield, Sparkles, User, Eye, EyeOff, Target, Lock } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Logo } from '../common/Logo';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { AffordabilityCheckerModal } from '../tools/AffordabilityCheckerModal';

export const Navbar: React.FC = () => {
  const { 
    config, 
    ledger, 
    notifications, 
    toggleSound, 
    soundEnabled, 
    setActiveTab, 
    activeTab,
    privacyMode,
    togglePrivacyMode,
    isPinEnabled,
    lockApp,
    addExpense
  } = useFinance();
  
  const [showNotifs, setShowNotifs] = useState(false);
  const [showAffordModal, setShowAffordModal] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-obsidian-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Tagline */}
          <div className="cursor-pointer" onClick={() => setActiveTab('home')}>
            <Logo size="md" showTagline={true} />
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-obsidian-900/60 p-1.5 rounded-full border border-white/5">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'home'
                  ? 'bg-gradient-to-r from-flexible-green to-spending-cyan text-obsidian-950 shadow-md shadow-flexible-green/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-flexible-green to-spending-cyan text-obsidian-950 shadow-md shadow-flexible-green/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-flexible-green to-spending-cyan text-obsidian-950 shadow-md shadow-flexible-green/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              3-Tier History
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-flexible-green to-spending-cyan text-obsidian-950 shadow-md shadow-flexible-green/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Settings & Vault
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* "Afford?" Quick Simulator Button */}
            <button
              onClick={() => setShowAffordModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-spending-cyan/15 hover:bg-spending-cyan/25 text-spending-cyan border border-spending-cyan/30 text-xs font-bold transition-all shadow-sm"
              title="Can I Afford This? Purchase Simulator"
            >
              <Target size={14} />
              <span className="hidden sm:inline">Afford?</span>
            </button>

            {/* Privacy Mode Eye Toggle */}
            <button
              onClick={togglePrivacyMode}
              className={`p-2 rounded-xl border transition-all ${
                privacyMode 
                  ? 'bg-amber-400/15 border-amber-400/30 text-amber-400' 
                  : 'bg-obsidian-900 border-white/10 text-slate-400 hover:text-white'
              }`}
              title={privacyMode ? 'Turn off Privacy Mode' : 'Hide balances (Privacy Mode)'}
              aria-label="Privacy mode"
            >
              {privacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>

            {/* PIN Lock Button if enabled */}
            {isPinEnabled && (
              <button
                onClick={lockApp}
                className="p-2 rounded-xl bg-obsidian-900 border border-white/10 text-slate-400 hover:text-white transition-all"
                title="Lock App with PIN"
              >
                <Lock size={16} />
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-all ${
                soundEnabled 
                  ? 'bg-obsidian-900 border-white/10 text-slate-300 hover:text-white' 
                  : 'bg-obsidian-900 border-white/5 text-slate-500 hover:text-slate-400'
              }`}
              title={soundEnabled ? 'Mute micro-sounds' : 'Enable micro-sounds'}
              aria-label="Sound settings"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifs(true)}
              className="relative p-2 rounded-xl bg-obsidian-900 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all"
              aria-label="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-flexible-green text-[10px] font-bold text-obsidian-950 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Pill */}
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-gradient-to-r from-obsidian-900 to-obsidian-850 border border-white/10 hover:border-white/20 transition-all text-xs font-medium text-slate-200"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-flexible-green to-spending-cyan flex items-center justify-center text-obsidian-950 font-bold text-[11px]">
                {config.userFullName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline font-semibold">{config.userFullName}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notification Center Drawer */}
      <NotificationCenter isOpen={showNotifs} onClose={() => setShowNotifs(false)} />

      {/* Affordability Checker Simulator Modal */}
      <AffordabilityCheckerModal
        isOpen={showAffordModal}
        onClose={() => setShowAffordModal(false)}
        onQuickAddAsExpense={(amt, desc) => {
          addExpense({
            amount: amt,
            category: 'shopping',
            description: desc,
            date: new Date().toISOString().split('T')[0],
            time: '12:00',
          });
        }}
      />
    </>
  );
};
