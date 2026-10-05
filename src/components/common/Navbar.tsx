import React from 'react';
import { ArrowLeft, RefreshCw, LogOut, Shield, ShoppingCart, UserCheck, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { LuipeLogo } from './LuipeLogo';

interface NavbarProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ title, subtitle, onBack, showBack = false }) => {
  const { user, role, logout, switchRole } = useAuth();
  const { rate, syncWithBCV, isLoading: isSyncingRate } = useCurrency();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Back button + Logo / Titles */}
        <div className="flex items-center gap-3">
          {showBack && onBack && (
            <button
              onClick={onBack}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <LuipeLogo size="sm" />
            {(title || subtitle) && (
              <div className="hidden md:block pl-3 border-l border-slate-200">
                {title && <h1 className="text-base font-bold text-slate-900 leading-tight">{title}</h1>}
                {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Center: Exchange rate badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-700">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Tasa BCV:</span>
          <span className="font-bold text-slate-900">$1 USD = {rate.toFixed(4)} Bs</span>
          <button
            onClick={() => syncWithBCV()}
            disabled={isSyncingRate}
            className="text-slate-400 hover:text-indigo-600 transition-colors p-0.5 rounded cursor-pointer disabled:opacity-50"
            title="Sincronizar tasa con BCV"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingRate ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>

        {/* Right: User info, Role switch, Logout */}
        <div className="flex items-center gap-3">
          {/* Role badge and switcher */}

          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => switchRole('SELLER')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                role === 'SELLER'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Cambiar a vista Vendedor"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vendedor</span>
            </button>
            <button
              onClick={() => switchRole('ADMIN')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                role === 'ADMIN'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Cambiar a vista Administrador"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>

          {/* User profile dropdown / info */}
          <div className="flex items-center gap-2 pl-2">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {role === 'ADMIN' ? 'A' : 'V'}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <div className="font-semibold text-slate-800 leading-tight">
                {user?.name || (role === 'ADMIN' ? 'Administrador' : 'Vendedor')}
              </div>
              <div className="text-[10px] text-slate-500 capitalize">{role.toLowerCase()}</div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
