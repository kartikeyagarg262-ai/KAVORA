# KAVORA — Your Money. Your Flow. 💸🔒🟢

> **A smart, modern, premium personal finance and daily expense management application built for students and fixed-income individuals.**

---

## 🌟 The Core Concept: The KAVORA 3-Tier Money System

KAVORA eliminates the anxiety of managing monthly money through an automated, intelligent 3-tier cascade:

```
                  MONTHLY INCOME (₹5,000)
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
  TIER 1: PROTECTED SAVINGS 🔒     AVAILABLE SPENDING POOL
  (₹500 Vault + Cash Gifts)        (₹4,500 ÷ 30 days)
  * Guaranteed 100% Safe *                  │
                                            ▼
                                   TIER 2: DAILY BUDGET 💳
                                   (₹150/day allowance)
                                            │
                                ┌───────────┴───────────┐
                                │                       │
                            [SURPLUS]              [OVERSPENT]
                          Unspent +₹50            Overspent -₹50
                                │                       │
                                ▼                       ▼
                      TIER 3: FLEXIBLE SAVINGS 🟢 (₹300)
                      (Accumulates daily surplus / Absorbs overspending)
                      * Protected Vault is NEVER automatically touched *
```

### The 3 Tiers
1. **Tier 1 — Protected Savings 🔒**:
   - Intentionally locked away at the start of the monthly cycle (e.g. ₹500 from ₹5,000).
   - Completely separate vault immune to daily overspending.
   - **Custom Alterations & Gifts**: Add unexpected cash gifts from relatives (e.g. Chacha ji gift, festival shagun) anytime with custom notes.
2. **Tier 2 — Daily Spending 💳**:
   - Derived from Available Spending Money divided across the cycle (e.g. ₹4,500 ÷ 30 = ₹150/day).
   - Real-time status indicators:
     - 🟢 **Under Budget**: *"You are ₹50 under budget."*
     - 🟡 **Exact Budget**: *"You used your complete daily budget."*
     - 🔴 **Over Budget**: *"You are ₹50 over budget (Absorbed by Tier 3)."*
3. **Tier 3 — Flexible Savings 🟢 (Hero Feature)**:
   - **Autonomous Rollover**: At the end of every day, unused daily budget flows into Flexible Savings.
   - **Automatic Cushion**: When the user overspends on any day, the deficit is automatically absorbed from Flexible Savings.
   - **Deficit Safeguard**: If Flexible Savings runs dry, a clear warning prevents dangerous deficits while keeping Protected Savings 100% safe.

---

## 🚀 Key Features

- 🎯 **"Can I Afford This?" (Purchase Simulator)**: Simulate the impact of any purchase before spending. See whether today's budget, Flexible Savings, or future daily allowances can absorb it.
- 🎁 **Savings Wishlist & Goals**: Set targets for earbuds, books, or trips. Allocate funds directly from your Flexible Cushion or Protected Vault with progress bars and celebration confetti.
- 🔒 **Privacy Mode & 4-Digit PIN Lock**: 1-click eye button (`••••••`) hides sensitive balances in public. Optional 4-digit PIN security with a numeric keypad overlay.
- 🔥 **Daily Savings Streak & Financial Discipline Score (0 to 100)**: Consecutive days under budget streak counter + comprehensive financial health rating with achievement badges.
- 📜 **Dedicated 3-Tier Ledgers**: Separate transaction histories for:
  - 🔒 Tier 1: Protected Vault (Base locks, relative gifts, emergency withdrawals)
  - 💳 Tier 2: Daily Expenses (Date grouping, categories, timestamps)
  - 🟢 Tier 3: Flexible Savings (Daily surplus roll-ins, overspending deductions)
- 📊 **Financial Analytics**: Recharts-powered daily spending trend with horizontal budget threshold line, monthly category doughnut breakdown, and weekly pace charts.
- 🔔 **Smart Reminder System**: Customizable notifications (morning budget, evening check-in, overspending warnings, savings achievements) with an interactive test simulator.
- 🪄 **6-Screen Interactive Onboarding Flow**: Guided initial setup wizard with presets, sliders, and celebration confetti.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Dark theme `#06070a`, Obsidian glassmorphism, glowing borders)
- **Visuals & Charts**: Recharts, Lucide Icons, Canvas-Confetti
- **Audio Feedback**: Tactile micro-interactions via Web Audio API
- **Persistence**: Reactive localStorage with instant calculation cascade

---

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/kartikeyagarg262-ai/KAVORA.git

# Navigate to project directory
cd KAVORA

# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 📄 License

MIT © [KAVORA](https://github.com/kartikeyagarg262-ai/KAVORA)
