import React, { useState, useEffect } from 'react';
import { ShoppingCart, History, Tag, LogOut, ChevronRight, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { StatsService } from '../../services/api';

interface SellerMenuProps {
  onNavigate: (view: 'menu' | 'pos' | 'history' | 'prices') => void;
}

export const SellerMenu: React.FC<SellerMenuProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const { rate, formatUSD, formatVES } = useCurrency();
  const [balance, setBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(true);

  useEffect(() => {
    loadDailyBalance();
  }, []);

  const loadDailyBalance = async () => {
    setIsLoadingBalance(true);
    try {
      // Balance total en caja corresponde a los ingresos del día reportados por el endpoint
      const todayStats = await StatsService.getSummary('today');
      setBalance(todayStats.totalRevenueUsd);
    } catch (e) {
      console.warn('Error fetching daily box balance:', e);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center">
      {/* Vendedor Avatar Header matching mockup */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-linear-to-b from-indigo-200 to-indigo-300 flex items-center justify-center shadow-inner mb-3">
          <UserCircle className="w-16 h-16 text-indigo-700/80 stroke-1" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          {user?.email?.split('@')[0] || 'Vendedor'}
        </h2>
        <span className="text-xs text-slate-400 font-medium">Turno de Caja Activo</span>
      </div>

      {/* Balance and Rate Cards matching mockup */}
      <div className="w-full grid grid-cols-2 gap-4 mb-8">
        {/* Balance total en caja from Endpoint */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isLoadingBalance ? '...' : formatUSD(balance)}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
            {formatVES(balance)}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
            Balance total en caja
          </span>
        </div>

        {/* Tasa BCV */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center justify-center">
          <span className="text-sm sm:text-base font-bold text-indigo-700 break-all leading-tight">
            $1 USD = {rate.toFixed(4)} Bs
          </span>
          <span className="text-[11px] font-semibold text-slate-400 mt-2 uppercase tracking-wider">
            Tasa Oficial BCV
          </span>
        </div>
      </div>

      {/* 3 Main Action Buttons matching mockup */}
      <div className="w-full space-y-3 mb-10">
        {/* 1. Registrar una venta */}
        <button
          onClick={() => onNavigate('pos')}
          className="w-full p-4.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-colors">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-800 group-hover:text-indigo-900 block">
                Registrar una venta
              </span>
              <span className="text-xs text-slate-400">
                Punto de venta y catálogo de productos
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
        </button>

        {/* 2. Ver registro de ventas */}
        <button
          onClick={() => onNavigate('history')}
          className="w-full p-4.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 group-hover:bg-sky-600 text-sky-600 group-hover:text-white flex items-center justify-center transition-colors">
              <History className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-800 group-hover:text-sky-900 block">
                Ver registro de ventas
              </span>
              <span className="text-xs text-slate-400">
                Historial de transacciones y reimpresión de recibos
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-sky-600 transition-colors" />
        </button>

        {/* 3. Ver listado de precios */}
        <button
          onClick={() => onNavigate('prices')}
          className="w-full p-4.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-800 group-hover:text-emerald-900 block">
                Ver listado de precios
              </span>
              <span className="text-xs text-slate-400">
                Consulta de catálogo y precios vigentes
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
        </button>
      </div>

      {/* Cerrar sesión link */}
      <button
        onClick={logout}
        className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer py-2 px-4 rounded-xl hover:bg-rose-50"
      >
        <LogOut className="w-4 h-4" />
        <span>Cerrar sesión</span>
      </button>
    </div>
  );
};
