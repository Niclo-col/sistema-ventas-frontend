import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Layers,
  Award,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { StatsService } from '../../services/api';
import { StatsSummary, PeriodStat, CategoryStat, ProductStat } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';

interface AnalyticsDashboardProps {
  onBackToMenu: () => void;
}

type PeriodFilter = 'today' | 'yesterday' | 'week' | 'month';

const CATEGORY_COLORS = ['#6366F1', '#38BDF8', '#10B981', '#F59E0B', '#EC4899'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onBackToMenu }) => {
  const { formatUSD, formatVES } = useCurrency();
  const [filter, setFilter] = useState<PeriodFilter>('week');
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [periodStats, setPeriodStats] = useState<PeriodStat[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [topProducts, setTopProducts] = useState<ProductStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [filter]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const groupBy = filter === 'today' || filter === 'yesterday' ? 'day' : 'week';
      const [sum, periods, cats, tops] = await Promise.all([
        StatsService.getSummary(filter),
        StatsService.getPeriodStats(groupBy),
        StatsService.getCategoryStats(),
        StatsService.getTopProducts()
      ]);

      setSummary(sum);
      setPeriodStats(periods);

      // Adjust mock stats proportionally based on filter
      const multiplier = filter === 'today' ? 0.3 : filter === 'yesterday' ? 0.28 : 1.0;
      setCategoryStats(
        cats.map(c => ({
          ...c,
          revenueUsd: Number((c.revenueUsd * multiplier).toFixed(2)),
          itemsSold: Math.round(c.itemsSold * multiplier)
        }))
      );

      setTopProducts(
        tops.map(t => ({
          ...t,
          unitsSold: Math.round(t.unitsSold * multiplier),
          revenueUsd: Number((t.revenueUsd * multiplier).toFixed(2))
        }))
      );
    } catch (e) {
      console.warn('Error loading analytics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const maxProductRevenue = Math.max(...topProducts.map(p => p.revenueUsd), 1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Header matching mockup */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMenu}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-xs"
            title="Volver al menú de administrador"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900">Analítica</h2>
            <p className="text-xs text-slate-500">Resumen de transacciones, ingresos y operaciones</p>
          </div>
        </div>

        {/* Period Filter Buttons matching mockup */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setFilter('today')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'today'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setFilter('yesterday')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'yesterday'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ayer
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'week'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Últimos 7 días
          </button>
          <button
            onClick={() => setFilter('month')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'month'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mensual
          </button>
        </div>
      </div>

      {/* Metric Cards matching mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ingresos Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ingresos</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatUSD(summary?.totalRevenueUsd || 4280.50)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
            {formatVES(summary?.totalRevenueUsd || 4280.50)}
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{summary?.revenueGrowthPercent || 12.5}% vs periodo anterior</span>
          </div>
        </div>

        {/* Ventas Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ventas</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {summary?.totalOrders || 142}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
            Transacciones completadas
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{summary?.ordersGrowthPercent || 8.2}% de actividad</span>
          </div>
        </div>

        {/* Ticket Promedio Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ticket Promedio</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatUSD(summary?.averageTicketUsd || 30.14)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
            Por transacción de compra
          </div>
          <div className="mt-3 text-xs text-slate-500 font-medium">
            Promedio estimado del cliente
          </div>
        </div>

        {/* Artículos Vendidos Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Artículos Totales</span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {summary?.totalItemsSold || 395}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
            Unidades entregadas
          </div>
          <div className="mt-3 text-xs text-slate-500 font-medium">
            Rotación de catálogo
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Histórico de ingresos Area Chart matching mockup */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-extrabold text-base text-slate-900">Histórico de ingresos</h3>
            <p className="text-xs text-slate-400">
              Comparativo de ingresos en {filter === 'today' || filter === 'yesterday' ? 'el día por horas' : 'la semana por días'}
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={periodStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Ingreso']}
                  labelStyle={{ fontWeight: 'bold', color: '#1E293B' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenueUsd"
                  stroke="#6366F1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#incomeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ventas por Categorías Pie Chart matching mockup */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="font-extrabold text-base text-slate-900">Ventas por categorías</h3>
            <p className="text-xs text-slate-400">Distribución de ingresos por tipo de producto</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="percentage"
                  nameKey="categoryName"
                >
                  {categoryStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Proporción']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legend */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {categoryStats.map((c, idx) => (
              <div key={c.categoryId} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  />
                  <span className="font-medium text-slate-700">{c.categoryName}</span>
                </div>
                <span className="font-bold text-slate-900">{c.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top de productos vendidos Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Top de productos vendidos</h3>
            <p className="text-xs text-slate-400">Artículos con mayor facturación en el periodo seleccionado</p>
          </div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl">
            Ranked por recaudación
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {topProducts.map((prod, index) => {
            const barWidth = Math.round((prod.revenueUsd / maxProductRevenue) * 100);

            return (
              <div key={prod.productId} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Product rank & title */}
                <div className="flex items-center gap-3 min-w-0 sm:w-1/3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      index === 0
                        ? 'bg-amber-100 text-amber-800'
                        : index === 1
                        ? 'bg-slate-200 text-slate-700'
                        : index === 2
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    #{index + 1}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-sm text-slate-800 block truncate">
                      {prod.productName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {prod.categoryName || 'General'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex-1 max-w-md mx-2">
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>

                {/* Sales volume and revenue */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 sm:w-1/4 text-right">
                  <span className="text-xs font-semibold text-slate-500">
                    {prod.unitsSold} u.
                  </span>
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 block">
                      {formatUSD(prod.revenueUsd)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatVES(prod.revenueUsd)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
