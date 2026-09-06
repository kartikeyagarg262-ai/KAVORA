import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false }) => {
  const iconSize = size === 'sm' ? 26 : size === 'md' ? 34 : 46;
  const textSize = size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl';

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Brand Vector Symbol */}
      <div 
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-obsidian-850 to-obsidian-900 border border-white/10 shadow-lg shadow-flexible-emerald/10 p-1"
        style={{ width: iconSize + 8, height: iconSize + 8 }}
      >
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="logoShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="logoKGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>
          </defs>
          {/* Outer Protection Shield */}
          <path 
            d="M50 12 L82 28 V52 C82 70 50 88 50 88 C50 88 18 70 18 52 V28 L50 12 Z" 
            stroke="url(#logoShieldGrad)" 
            strokeWidth="6" 
            strokeLinejoin="round" 
          />
          {/* Inner Geometric K-Flow */}
          <path 
            d="M38 32 V68 M38 50 L62 32 M44 45 L64 68" 
            stroke="url(#logoKGrad)" 
            strokeWidth="7" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Tier 3 Flexible Savings Orb */}
          <circle cx="64" cy="32" r="5" fill="#10B981" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-display font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 ${textSize}`}>
            KAVORA
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-flexible-green animate-pulse" />
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium tracking-wide text-slate-400">
            Your Money. Your Flow.
          </span>
        )}
      </div>
    </div>
  );
};
