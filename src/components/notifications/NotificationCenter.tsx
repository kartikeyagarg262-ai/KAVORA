import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Sparkles, 
  Sun, 
  Moon, 
  AlertTriangle, 
  TrendingDown, 
  Award, 
  FileText,
  Settings,
  Play,
  Smartphone,
  Check
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { NotificationType } from '../../types/finance';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    triggerSimulatedNotification,
    notificationSettings,
    updateNotificationSettings,
    deviceNotificationPermission,
    requestDeviceNotificationPermission
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'inbox' | 'sim' | 'settings'>('inbox');

  if (!isOpen) return null;

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'morning':
        return <Sun size={18} className="text-amber-400" />;
      case 'evening':
        return <Moon size={18} className="text-indigo-400" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-amber-500" />;
      case 'overspent':
        return <TrendingDown size={18} className="text-rose-400" />;
      case 'achievement':
        return <Award size={18} className="text-flexible-green" />;
      case 'month_end':
        return <FileText size={18} className="text-spending-cyan" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-obsidian-900 border-l border-white/10 shadow-2xl h-full flex flex-col z-10 animate-slideLeft">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-obsidian-850/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-flexible-green/10 flex items-center justify-center text-flexible-green border border-flexible-green/20">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">KAVORA Alerts</h3>
              <p className="text-[11px] text-slate-400">Budget alerts and daily reminders</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-2 bg-obsidian-950/60 border-b border-white/5">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'inbox' 
                ? 'bg-obsidian-800 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inbox ({notifications.filter(n => !n.read).length})
          </button>
          <button
            onClick={() => setActiveTab('sim')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'sim' 
                ? 'bg-obsidian-800 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Simulator
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'settings' 
                ? 'bg-obsidian-800 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Mobile Status Bar Push Notification Permission Banner */}
        <div className="p-3.5 bg-obsidian-950/80 border-b border-white/10">
          {deviceNotificationPermission === 'granted' ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-flexible-green/10 border border-flexible-green/25 text-xs">
              <div className="flex items-center gap-2 text-flexible-mint">
                <CheckCheck size={15} />
                <span className="font-bold text-[11px]">Mobile Status Bar Alerts: Active 📲</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Top slidebar enabled</span>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-spending-cyan/15 to-flexible-green/15 border border-spending-cyan/30 space-y-2">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-xl bg-spending-cyan/20 text-spending-cyan shrink-0 mt-0.5">
                  <Smartphone size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Mobile Status Bar Notifications</h4>
                  <p className="text-[10.5px] text-slate-300 mt-0.5">
                    Phone ke upar notification bar (slidebar) me alerts paane ke liye permission enable karein.
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  await requestDeviceNotificationPermission();
                }}
                className="w-full py-2 px-3 rounded-xl bg-spending-cyan text-obsidian-950 text-xs font-bold hover:bg-spending-mint transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                <Bell size={13} />
                <span>Enable Status Bar Notifications 📲</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: Inbox */}
        {activeTab === 'inbox' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs text-slate-400 font-medium">Recent Notifications</span>
              {notifications.some(n => !n.read) && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="flex items-center gap-1 text-xs text-flexible-green hover:underline font-semibold"
                >
                  <CheckCheck size={13} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationAsRead(n.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    !n.read 
                      ? 'bg-obsidian-800/80 border-spending-cyan/30 shadow-sm' 
                      : 'bg-obsidian-950/40 border-white/5 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-2 rounded-xl bg-obsidian-900 border border-white/5 shrink-0">
                      {getIconForType(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-flexible-green shrink-0 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">
                        {n.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Notification Simulator (Directly testing prompt notifications!) */}
        {activeTab === 'sim' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="p-3 rounded-2xl bg-spending-cyan/10 border border-spending-cyan/20 text-xs text-spending-cyan">
              💡 <b>Test Live Alerts:</b> Kisi bhi alert ke aage <b>Play (▶)</b> dabayein — yeh turant aapke phone ke upar notification bar (slidebar) me live pop-up aayega!
            </div>

            <div className="space-y-2.5">
              {[
                {
                  type: 'morning' as const,
                  label: 'Morning Budget Notification',
                  desc: '"Good morning! Your budget for today is ₹150."',
                  icon: <Sun size={16} className="text-amber-400" />,
                },
                {
                  type: 'evening' as const,
                  label: 'Evening Reminder',
                  desc: '"Don\'t forget to add today\'s expenses."',
                  icon: <Moon size={16} className="text-indigo-400" />,
                },
                {
                  type: 'warning' as const,
                  label: 'Overspending Warning',
                  desc: '"You\'re close to today\'s budget."',
                  icon: <AlertTriangle size={16} className="text-amber-500" />,
                },
                {
                  type: 'overspent' as const,
                  label: 'Overspending Alert',
                  desc: '"You exceeded today\'s budget by ₹50. ₹50 was deducted from Flexible Savings."',
                  icon: <TrendingDown size={16} className="text-rose-400" />,
                },
                {
                  type: 'achievement' as const,
                  label: 'Savings Achievement',
                  desc: '"Great job! You saved ₹50 today."',
                  icon: <Award size={16} className="text-flexible-green" />,
                },
                {
                  type: 'month_end' as const,
                  label: 'End of Month Summary',
                  desc: '"Your monthly financial summary is ready."',
                  icon: <FileText size={16} className="text-spending-cyan" />,
                },
              ].map((sim) => (
                <div 
                  key={sim.type}
                  className="p-3.5 rounded-2xl bg-obsidian-950/60 border border-white/5 flex items-center justify-between gap-3 hover:border-white/15 transition-all"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-obsidian-900 border border-white/5 mt-0.5">
                      {sim.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{sim.label}</h4>
                      <p className="text-[11px] text-slate-400 italic mt-0.5">{sim.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      triggerSimulatedNotification(sim.type);
                      setActiveTab('inbox');
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 shrink-0 transition-colors"
                    title="Send this notification"
                  >
                    <Play size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Notification Settings */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="p-3 rounded-2xl bg-obsidian-950 border border-white/5 text-xs text-slate-400">
              Customize which automated notifications and push triggers you receive.
            </div>

            <div className="space-y-3">
              {[
                {
                  key: 'morningBudget' as const,
                  title: 'Morning Daily Budget',
                  desc: 'Delivers your daily spend allowance at 8:00 AM',
                },
                {
                  key: 'eveningReminder' as const,
                  title: 'Evening Expense Check-in',
                  desc: 'Prompts you at 8:30 PM to log any remaining receipts',
                },
                {
                  key: 'overspendingWarning' as const,
                  title: 'Budget Proximity Warning',
                  desc: 'Notifies you when reaching 80% of daily limit',
                },
                {
                  key: 'overspendingAlert' as const,
                  title: 'Overspending & Tier 3 Deduction Alert',
                  desc: 'Immediate alert when budget exceeded and absorbed by Flexible Savings',
                },
                {
                  key: 'savingsAchievement' as const,
                  title: 'Daily Savings Achievements',
                  desc: 'Celebrates when you successfully save surplus into Tier 3',
                },
                {
                  key: 'monthEndSummary' as const,
                  title: 'Monthly Wrap-up Report',
                  desc: 'Summary of Protected Vault growth at end of cycle',
                },
              ].map((setting) => (
                <div 
                  key={setting.key} 
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-obsidian-950/60 border border-white/5"
                >
                  <div className="pr-4">
                    <h4 className="text-xs font-bold text-white">{setting.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{setting.desc}</p>
                  </div>

                  {/* Toggle switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={notificationSettings[setting.key]}
                      onChange={(e) => updateNotificationSettings({ [setting.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-obsidian-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-flexible-green"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
