import React, { useState } from 'react';
import { Shield, Sparkles, Lock, Wallet, ArrowRight, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle, demoSignIn, isConfigured } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMessage(error.message || 'Failed to initialize Google Sign-In. Please check Supabase setup.');
        setIsSigningIn(false);
      }
      // If successful, Supabase redirects to Google OAuth page automatically
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected login error occurred.';
      setErrorMessage(msg);
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden selection:bg-flexible-green selection:text-black">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-flexible-green/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-spending-cyan/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-vault-purple/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-obsidian-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative z-10 flex flex-col items-center text-center">
        {/* Brand Logo & Wordmark */}
        <div className="mb-2">
          <Logo size="lg" showTagline={true} />
        </div>

        {/* Subtitle / Value Prop */}
        <div className="mt-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-display">
            Welcome to KAVORA
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Smart personal finance for students and fixed-allowance earners with the 3-Tier Money System.
          </p>
        </div>

        {/* 3-Tier System Preview Badge */}
        <div className="w-full grid grid-cols-3 gap-2 p-3 rounded-2xl bg-obsidian-950/70 border border-white/5 mb-6 text-left">
          <div className="p-2 rounded-xl bg-vault-purple/10 border border-vault-purple/20">
            <span className="text-base">🔒</span>
            <p className="text-[10px] font-bold text-vault-purple uppercase tracking-wider mt-1">Tier 1</p>
            <p className="text-[11px] font-bold text-white leading-tight">Protected</p>
          </div>
          <div className="p-2 rounded-xl bg-spending-cyan/10 border border-spending-cyan/20">
            <span className="text-base">💳</span>
            <p className="text-[10px] font-bold text-spending-cyan uppercase tracking-wider mt-1">Tier 2</p>
            <p className="text-[11px] font-bold text-white leading-tight">Daily Budget</p>
          </div>
          <div className="p-2 rounded-xl bg-flexible-green/10 border border-flexible-green/20">
            <span className="text-base">🟢</span>
            <p className="text-[10px] font-bold text-flexible-green uppercase tracking-wider mt-1">Tier 3</p>
            <p className="text-[11px] font-bold text-white leading-tight">Flex Savings</p>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="w-full mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2 text-left animate-fadeIn">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
            <div>
              <p className="font-bold">Authentication Error</p>
              <p className="text-[11px] opacity-90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Main Google Sign-In Button */}
        <div className="w-full space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={isSigningIn}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSigningIn ? (
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              // Official Google Colored G Vector
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>{isSigningIn ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          {/* If Supabase is not yet configured, show friendly setup / demo fallback */}
          {!isConfigured && (
            <div className="w-full pt-3 border-t border-white/5 space-y-2.5">
              <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300 text-left">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Info size={14} />
                  <span>Setup Supabase in .env</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Add your <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code> to activate real Google Sign-In & PostgreSQL cloud sync.
                </p>
              </div>

              <button
                type="button"
                onClick={() => demoSignIn('Kartik', 'kartik@kavora.app')}
                className="w-full py-2.5 px-4 rounded-xl bg-obsidian-850 hover:bg-obsidian-800 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <span>Preview as Demo User (Kartik)</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Security / Privacy Trust Pill */}
        <div className="mt-6 pt-4 border-t border-white/5 w-full flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <Shield size={13} className="text-flexible-green" />
          <span>Row Level Security • Private Isolated Accounts</span>
        </div>
      </div>
    </div>
  );
};
