import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LuipeLogo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16'
  };

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Icon Graphic */}
      <div className="relative flex items-center justify-center">
        <svg
          className={`${sizeClasses[size]} w-auto aspect-square`}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* CMYK geometric stylized printer sheet icon */}
          <rect x="18" y="14" width="64" height="72" rx="10" fill="#FFFFFF" stroke="#0284C7" strokeWidth="4" />
          <path d="M26 24H74" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
          <path d="M26 34H60" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
          
          {/* Cyan swirl */}
          <path
            d="M28 72C36 50 56 46 72 54"
            stroke="#0EA5E9"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Magenta swirl */}
          <path
            d="M32 78C44 60 62 58 76 66"
            stroke="#EC4899"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Yellow swoosh */}
          <circle cx="72" cy="32" r="5" fill="#EAB308" />
          {/* Blue accent */}
          <path
            d="M24 45L40 76"
            stroke="#2563EB"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col text-left">
        <span className="text-[10px] font-bold tracking-[0.25em] text-slate-500 uppercase leading-none">
          IMPRESIONES
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black tracking-tight text-sky-600 leading-none">
            LUIPE
          </span>
          <span className="text-[9px] font-semibold text-slate-400">C.A.</span>
        </div>
      </div>
    </div>
  );
};
