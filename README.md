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

## 🔐 Cloud Authentication & Private Multi-User Data

KAVORA comes with enterprise-grade multi-user cloud synchronization powered by **Supabase PostgreSQL** and **Row Level Security (RLS)**:

- **Google Sign-In**: 1-click authentication using Google OAuth.
- **Strict Row Level Security (RLS)**: Every user's budget, vault transactions, expenses, savings goals, and settings are strictly partitioned using PostgreSQL `auth.uid() = user_id`. User A can **never** access or view User B's financial data.
- **Onboarding vs Returning User Routing**: New users are guided through the 6-step setup flow; returning users are immediately routed to their private cloud dashboard.
- **Resilient Fallback Mode**: If Supabase credentials are not yet configured in `.env`, KAVORA provides a 1-click **Preview as Demo User** option for instant local exploration.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Cloud Backend**: Supabase (PostgreSQL 15 + GoTrue Auth + Row Level Security)
- **Mobile Packaging**: Capacitor Android (`com.kavora.app`)
- **Styling**: Tailwind CSS (Dark theme `#06070a`, Obsidian glassmorphism, glowing borders)
- **Visuals & Charts**: Recharts, Lucide Icons, Canvas-Confetti
- **Audio Feedback**: Tactile micro-interactions via Web Audio API

---

## ⚡ Setup & Configuration Guide

### 1. Supabase Cloud Setup

1. Go to [Supabase](https://supabase.com) and create a free project.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open [`supabase_schema.sql`](./supabase_schema.sql) from this repository, copy all contents, and click **Run**.
   - This creates tables: `profiles`, `monthly_budgets`, `vault_transactions`, `expenses`, `savings_goals`, `user_settings`.
   - Enables Row Level Security (RLS) on all tables with `auth.uid() = user_id` policies.
   - Sets up the trigger `on_auth_user_created` to automatically populate user profiles on Google OAuth sign-in.

### 2. Configure Google OAuth in Supabase

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and set up OAuth Consent Screen (Application type: *External*).
3. Create **OAuth 2.0 Client IDs** (Web application).
4. In your Supabase dashboard, go to **Authentication > Providers > Google**:
   - Turn **Enable Google** ON.
   - Paste your **Client ID** and **Client Secret** from Google Cloud Console.
   - Copy the **Callback URL (for OAuth)** from Supabase (e.g., `https://<your-project-id>.supabase.co/auth/v1/callback`) and paste it into **Authorized redirect URIs** in your Google Cloud Console.

### 3. Configure Local Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Add your Supabase Project URL and Public Anon Key:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 🚀 Running the App

### Web Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### Web Production Build
```bash
npm run build
```

---

## 📱 Mobile App Setup (Capacitor Android)

KAVORA is pre-configured with Capacitor for native Android APK generation:

```bash
# 1. Build the production web bundle
npm run build

# 2. Add Android platform (first time only)
npx cap add android

# 3. Sync web assets and plugins to Android
npx cap sync android

# 4. Open project in Android Studio
npx cap open android
```

Inside Android Studio:
1. Connect your Android device or start an emulator.
2. Click **Run > Run 'app'** or build an APK via **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 📄 License

MIT © [KAVORA](https://github.com/kartikeyagarg262-ai/KAVORA)
