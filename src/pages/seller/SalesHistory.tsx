import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Receipt,
  Printer,
  Calendar,
  Search,
  CreditCard,
  Banknote,
  Clock
} from 'lucide-react';
import { OrderService, StatsService } from '../../services/api';
import { Order, StatsSummary } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { ReceiptModal } from '../../components/common/ReceiptModal';

interface SalesHistoryProps {
  onBackToMenu: () => void;
  onNewSale?: () => void;
}

export const SalesHistory: React.FC<SalesHistoryProps> = ({ onBackToMenu, onNewSale }) => {
  const { currentViewRole } = useAuth();
  const { formatUSD, formatVES } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [todaySummary, setTodaySummary] = useState<StatsSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // The seller has the button to go make a sale; the admin does NOT
  const isSeller = currentViewRole === 'SELLER';

  useEffect(() => {
    loadOrdersAndStats();
  }, []);

  const loadOrdersAndStats = async () => {
    setIsLoading(true);
    try {
      const [orderList, summary] = await Promise.all([
        OrderService.getAll(),
        StatsService.getSummary('today').catch(() => null)
      ]);
      setOrders(orderList);
      setTodaySummary(summary);
    } catch (e) {
      console.warn('Error fetching orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customerName?.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q)
    );
  });

  // Calculate stats directly from real endpoint data
  const totalSalesRevenue = orders.reduce((sum, o) => sum + (o.totalUsd || 0), 0);
  const totalOrdersCount = orders.length;

  // Today's orders
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter(o => o.createdAt && o.createdAt.slice(0, 10) === todayDateStr);
  const todayRevenue = todaySummary?.totalRevenueUsd ?? todayOrders.reduce((sum, o) => sum + (o.totalUsd || 0), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMenu}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-xs"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Historial de ventas</h2>
            <p className="text-xs text-slate-500">Registro oficial de transacciones emitidas por el sistema</p>
          </div>
        </div>

        {/* Nueva venta button: ONLY for Seller, hidden for Administrator */}
        {isSeller && onNewSale && (
          <button
            onClick={onNewSale}
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva venta</span>
          </button>
        )}
      </div>

      {/* Summary Stat Cards strictly according to endpoint data */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total de ventas histórico */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total de ventas
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
            {formatUSD(totalSalesRevenue)}
          </span>
          <span className="text-xs text-slate-500 mt-0.5 block">
            {formatVES(totalSalesRevenue)}
          </span>
        </div>

        {/* Ventas del día */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Ventas del día (Hoy)
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 block">
            {formatUSD(todayRevenue)}
          </span>
          <span className="text-xs text-slate-500 mt-0.5 block">
            {todayOrders.length} {todayOrders.length === 1 ? 'ticket hoy' : 'tickets hoy'}
          </span>
        </div>

        {/* Ventas / Tickets Totales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Ventas / Tickets Totales
          </span>
          <span className="text-2xl sm:text-3xl font-black text-indigo-700 mt-1 block">
            {totalOrdersCount}
          </span>
          <span className="text-xs text-slate-500 mt-0.5 block">
            Transacciones registradas
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar por # de orden o cliente..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Date Header */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <Calendar className="w-3.5 h-3.5 text-slate-400" />
        <span>Listado de Órdenes</span>
      </div>

      {/* Order List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400">
            <Receipt className="w-12 h-12 stroke-1 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700 text-sm">No hay ventas registradas</p>
            <p className="text-xs mt-0.5">Las operaciones confirmadas aparecerán en esta lista</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const dateObj = new Date(order.createdAt);
            const timeStr = !isNaN(dateObj.getTime())
              ? dateObj.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
              : '';
            const dateFormatted = !isNaN(dateObj.getTime())
              ? dateObj.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })
              : '';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-slate-900">
                      Order {order.orderNumber || order.id}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {dateFormatted} {timeStr}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {order.status || 'Completada'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 font-medium flex items-center gap-2">
                    <span>{order.customerName || 'Cliente Mostrador'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">
                      {order.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 1} artículos
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      {order.paymentMethod === 'CARD' ? (
                        <>
                          <CreditCard className="w-3.5 h-3.5 text-indigo-600" /> Tarjeta
                        </>
                      ) : (
                        <>
                          <Banknote className="w-3.5 h-3.5 text-emerald-600" /> Efectivo
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Right Amount & Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-lg font-black text-slate-900 block leading-tight">
                      {formatUSD(order.totalUsd)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatVES(order.totalUsd)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Ver Recibo</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setTimeout(() => window.print(), 200);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                      title="Imprimir ticket"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button "+ Nueva venta" (ONLY for Seller) */}
      {isSeller && onNewSale && (
        <div className="fixed bottom-6 right-6 z-20">
          <button
            onClick={onNewSale}
            className="py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-full shadow-xl shadow-indigo-300 flex items-center gap-2 transition-all transform hover:scale-105 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>+ Nueva venta</span>
          </button>
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};
