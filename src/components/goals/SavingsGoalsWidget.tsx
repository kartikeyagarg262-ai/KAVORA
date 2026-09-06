import React, { useState } from 'react';
import { Target, Plus, CheckCircle2, Sparkles, Trash2, ArrowUpRight, Clock, Shield, Award } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { SavingsGoal } from '../../types/finance';
import { Modal } from '../common/Modal';

export const SavingsGoalsWidget: React.FC = () => {
  const { goals, addGoal, deleteGoal, addFundsToGoal, ledger } = useFinance();
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [fundGoalModal, setFundGoalModal] = useState<SavingsGoal | null>(null);

  // New Goal Form
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newCategory, setNewCategory] = useState('Gadgets');
  const [newIcon, setNewIcon] = useState('🎧');
  const [newLinkedTier, setNewLinkedTier] = useState<'protected' | 'flexible'>('flexible');

  // Add Funds Form
  const [fundAmount, setFundAmount] = useState('200');

  const emojiPresets = ['🎧', '💻', '🎒', '📚', '👟', '📱', '✈️', '🎮', '🎸', '🎁'];

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = Number(newTarget);
    if (!newTitle.trim() || !target || target <= 0) return;

    addGoal({
      title: newTitle.trim(),
      targetAmount: target,
      category: newCategory,
      icon: newIcon,
      linkedTier: newLinkedTier,
    });

    setNewTitle('');
    setNewTarget('');
    setShowAddGoalModal(false);
  };

  const handleAddFundsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundGoalModal) return;
    const amt = Number(fundAmount);
    if (!amt || amt <= 0) return;

    const ok = await addFundsToGoal(fundGoalModal.id, amt);
    if (ok) {
      setFundGoalModal(null);
      setFundAmount('200');
    } else {
      alert(`Insufficient funds in ${fundGoalModal.linkedTier === 'protected' ? 'Protected Vault' : 'Flexible Savings'}!`);
    }
  };

  return (
    <>
      <div className="rounded-2xl sm:rounded-3xl bg-obsidian-900 border border-white/10 p-4 sm:p-6 shadow-xl space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Target size={18} className="text-flexible-green sm:w-5 sm:h-5" />
              <span>Savings Wishlist & Goals</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Target items funded from Flexible Savings or Protected Vault
            </p>
          </div>

          <button
            onClick={() => setShowAddGoalModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-flexible-green/15 text-flexible-mint hover:bg-flexible-green/25 border border-flexible-green/30 text-xs font-bold transition-all shadow-sm"
          >
            <Plus size={14} />
            <span>New Goal</span>
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-white/10 bg-obsidian-950/40">
            <p className="text-2xl mb-1">🎯</p>
            <h4 className="text-sm font-bold text-white">No Savings Goals Yet</h4>
            <p className="text-xs text-slate-500 mt-1">
              Start saving for headphones, trips, or exam fees by setting a target!
            </p>
            <button
              onClick={() => setShowAddGoalModal(true)}
              className="mt-3 px-3.5 py-1.5 rounded-xl bg-flexible-green/10 text-flexible-green text-xs font-bold border border-flexible-green/20"
            >
              + Create First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {goals.map((goal) => {
              const percent = Math.min(100, Math.round((goal.savedAmount / (goal.targetAmount || 1)) * 100));

              return (
                <div
                  key={goal.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    goal.completed
                      ? 'bg-flexible-green/10 border-flexible-green/40 shadow-lg shadow-flexible-green/10'
                      : 'bg-obsidian-950/70 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{goal.icon}</span>
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase ${
                          goal.linkedTier === 'protected' 
                            ? 'bg-vault-purple/20 text-vault-purple border border-vault-purple/30' 
                            : 'bg-flexible-green/20 text-flexible-green border border-flexible-green/30'
                        }`}>
                          {goal.linkedTier === 'protected' ? 'Vault' : 'Flex'}
                        </span>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete Goal"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-white truncate">{goal.title}</h4>
                    <div className="flex items-center justify-between text-xs text-slate-300 font-mono mt-1">
                      <span>{formatCurrency(goal.savedAmount)}</span>
                      <span className="text-slate-500 font-normal">of {formatCurrency(goal.targetAmount)}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-obsidian-900 rounded-full overflow-hidden mt-2 border border-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          goal.completed ? 'bg-flexible-green' : 'bg-gradient-to-r from-spending-cyan to-flexible-green'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-flexible-mint">{percent}%</span>

                    {goal.completed ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-flexible-green">
                        <CheckCircle2 size={13} />
                        <span>Achieved!</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setFundGoalModal(goal)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 font-semibold border border-white/10 transition-colors"
                      >
                        + Add Funds
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE GOAL MODAL */}
      <Modal
        isOpen={showAddGoalModal}
        onClose={() => setShowAddGoalModal(false)}
        title="🎯 Create Savings Goal / Wishlist"
        subtitle="Lock and track money towards something you truly want."
        maxWidth="md"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Choose Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {emojiPresets.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setNewIcon(em)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all ${
                    newIcon === em 
                      ? 'bg-flexible-green/20 border-flexible-green scale-110 shadow-md' 
                      : 'bg-obsidian-950 border-white/10 hover:border-white/20'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Goal Title
            </label>
            <input
              type="text"
              placeholder="e.g. Sony Wireless Earbuds, Goa Trip, Gym Gear"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-obsidian-950 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-flexible-green"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Target Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
              <input
                type="number"
                min="100"
                placeholder="2500"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-obsidian-950 border border-white/10 rounded-xl text-white font-mono text-lg font-bold focus:outline-none focus:border-flexible-green"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Link with Savings Tier
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNewLinkedTier('flexible')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  newLinkedTier === 'flexible'
                    ? 'bg-flexible-green/20 border-flexible-green text-white font-bold'
                    : 'bg-obsidian-950 border-white/5 text-slate-400'
                }`}
              >
                <div className="text-xs">🟢 Flexible Savings</div>
                <div className="text-[10.5px] text-slate-500 mt-0.5">Funded from daily surplus</div>
              </button>

              <button
                type="button"
                onClick={() => setNewLinkedTier('protected')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  newLinkedTier === 'protected'
                    ? 'bg-vault-purple/20 border-vault-purple text-white font-bold'
                    : 'bg-obsidian-950 border-white/5 text-slate-400'
                }`}
              >
                <div className="text-xs">🔒 Protected Vault</div>
                <div className="text-[10.5px] text-slate-500 mt-0.5">Funded from locked vault</div>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddGoalModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-flexible-green text-obsidian-950 font-bold text-xs shadow-lg shadow-flexible-green/20"
            >
              Create Goal
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD FUNDS TO GOAL MODAL */}
      {fundGoalModal && (
        <Modal
          isOpen={!!fundGoalModal}
          onClose={() => setFundGoalModal(null)}
          title={`💰 Allocate Funds to "${fundGoalModal.title}"`}
          subtitle={`Funded from ${fundGoalModal.linkedTier === 'protected' ? 'Protected Vault 🔒' : 'Flexible Savings 🟢'}`}
          maxWidth="sm"
        >
          <form onSubmit={handleAddFundsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Amount to Allocate (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
                <input
                  type="number"
                  min="10"
                  max={fundGoalModal.linkedTier === 'protected' ? ledger.protectedSavings : ledger.currentFlexibleSavings}
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-obsidian-950 border border-white/10 rounded-xl text-white font-mono text-xl font-bold focus:outline-none focus:border-flexible-green"
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
                <span>Available in {fundGoalModal.linkedTier === 'protected' ? 'Vault' : 'Flexible'}:</span>
                <span className="text-white font-bold">
                  {formatCurrency(fundGoalModal.linkedTier === 'protected' ? ledger.protectedSavings : ledger.currentFlexibleSavings)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setFundGoalModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-flexible-green to-spending-cyan text-obsidian-950 font-bold text-xs shadow-lg shadow-flexible-green/20"
              >
                Confirm Allocation
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};
