import React, { useState, useEffect } from 'react';
import { Bell, Smartphone, ShieldCheck, X, Zap, Sun, AlertTriangle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const NotificationPromptModal: React.FC = () => {
  const { 
    isOnboarded, 
    deviceNotificationPermission, 
    requestDeviceNotificationPermission 
  } = useFinance();

  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Only show if user is onboarded and hasn't granted or denied yet
    if (!isOnboarded) return;

    // Check if permission is default ('default' means prompt hasn't been answered)
    const isSupported = typeof window !== 'undefined' && 'Notification' in window;
    if (!isSupported) return;

    if (deviceNotificationPermission === 'default') {
      const dismissed = sessionStorage.getItem('kavora_notif_prompt_dismissed');
      if (!dismissed) {
        // Show after a gentle 1.5s delay so the dashboard loads first
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } else {
      setIsOpen(false);
    }
  }, [isOnboarded, deviceNotificationPermission]);

  const handleEnable = async () => {
    setIsProcessing(true);
    try {
      const result = await requestDeviceNotificationPermission();
      if (result === 'granted') {
        setIsOpen(false);
      } else {
        // Even if denied or dismissed, close modal
        sessionStorage.setItem('kavora_notif_prompt_dismissed', 'true');
        setIsOpen(false);
      }
    } catch (err) {
      console.error('Failed to request permission:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('kavora_notif_prompt_dismissed', 'true');
    setIsOpen(false);
  };

  if (!isOpen || deviceNotificationPermission !== 'default') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-md bg-gradient-to-b from-obsidian-900 to-obsidian-950 border border-white/15 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 animate-slideUp relative overflow-hidden"
      >
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-36 h-36 rounded-full bg-flexible-green/15 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-36 h-36 rounded-full bg-spending-cyan/15 blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header Icon with pulse */}
        <div className="flex items-center gap-3.5 pt-1 relative z-10">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-flexible-green to-spending-cyan flex items-center justify-center text-obsidian-950 shadow-lg shadow-flexible-green/30">
              <Bell size={24} strokeWidth={2.5} className="animate-bounce" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-spending-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-spending-cyan"></span>
            </span>
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-flexible-green font-mono">
              DIRECT MOBILE ALERTS
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              Turn On Mobile Alerts 📲
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed relative z-10">
          Apne phone ke <b>upar wale slidebar (status bar)</b> me direct daily budget alerts aur updates paayein:
        </p>

        {/* Feature bullet list */}
        <div className="space-y-2.5 rounded-2xl bg-obsidian-950/70 p-3.5 border border-white/5 relative z-10">
          <div className="flex items-start gap-2.5 text-xs">
            <div className="p-1 rounded-lg bg-amber-400/10 text-amber-400 shrink-0 mt-0.5">
              <Sun size={14} />
            </div>
            <div>
              <b className="text-white">Morning Daily Allowance:</b>
              <p className="text-[11px] text-slate-400">Subah pata chale aaj kitna kharch karna hai.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs">
            <div className="p-1 rounded-lg bg-rose-500/10 text-rose-400 shrink-0 mt-0.5">
              <AlertTriangle size={14} />
            </div>
            <div>
              <b className="text-white">Instant Overspending Alarm:</b>
              <p className="text-[11px] text-slate-400">Budget cross hote hi phone alert karega.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs">
            <div className="p-1 rounded-lg bg-flexible-green/10 text-flexible-green shrink-0 mt-0.5">
              <ShieldCheck size={14} />
            </div>
            <div>
              <b className="text-white">100% Secure & Zero Spam:</b>
              <p className="text-[11px] text-slate-400">Kavach ki tarah sirf aapka personal money flow.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1 relative z-10">
          <button
            onClick={handleEnable}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-flexible-green to-spending-cyan hover:from-flexible-mint hover:to-spending-mint text-obsidian-950 font-extrabold text-sm shadow-xl shadow-flexible-green/20 hover:shadow-flexible-green/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Smartphone size={17} strokeWidth={2.5} />
            <span>{isProcessing ? 'Connecting...' : 'Enable Mobile Notifications 📲'}</span>
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-2.5 text-center text-xs text-slate-400 hover:text-white font-medium transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};
