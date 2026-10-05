import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, ShoppingBag, Home, Printer, ArrowRight } from 'lucide-react';
import { Order } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';

interface SaleSuccessModalProps {
  order: Order | null;
  onNewSale: () => void;
  onBackToMenu: () => void;
  onViewReceipt: () => void;
}

export const SaleSuccessModal: React.FC<SaleSuccessModalProps> = ({
  order,
  onNewSale,
  onBackToMenu,
  onViewReceipt
}) => {
  const { formatUSD, formatVES } = useCurrency();

  useEffect(() => {
    if (order) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.warn('Confetti error:', e);
      }
    }
  }, [order]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-200">
        {/* Success Header with green gradient circle */}
        <div className="p-8 text-center bg-linear-to-b from-emerald-50 via-white to-white flex flex-col items-center">
          <div className="w-18 h-18 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 ring-8 ring-emerald-50 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-black text-slate-900">¡Venta Exitosa!</h2>
          <p className="text-xs text-slate-500 mt-1">
            La transacción se ha registrado correctamente en el sistema
          </p>

          <div className="mt-4 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-700">
            Orden {order.orderNumber || order.id}
          </div>
        </div>

        {/* Transaction Summary Card */}
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Total cobrado:</span>
              <div className="text-right">
                <span className="text-base font-black text-slate-900 block">{formatUSD(order.totalUsd)}</span>
                <span className="text-[11px] text-slate-500 font-semibold">{formatVES(order.totalUsd)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-slate-500 font-medium">Método de pago:</span>
              <span className="font-bold text-slate-800 uppercase px-2 py-0.5 bg-white border border-slate-200 rounded-md">
                {order.paymentMethod === 'CASH' ? 'Efectivo' : 'Tarjeta / Punto'}
              </span>
            </div>

            {order.paymentMethod === 'CASH' && order.amountReceivedUsd !== undefined && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Monto recibido:</span>
                  <span className="font-semibold text-slate-700">{formatUSD(order.amountReceivedUsd)}</span>
                </div>
                <div className="flex justify-between items-center pt-1 text-emerald-700 bg-emerald-100/40 p-2 rounded-lg">
                  <span className="font-bold">Cambio a devolver:</span>
                  <span className="font-extrabold text-sm">{formatUSD(order.changeGivenUsd || 0)}</span>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons as requested */}
          <div className="space-y-2.5 pt-2">
            {/* Button 1: Hacer otra venta */}
            <button
              type="button"
              onClick={onNewSale}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Hacer otra venta</span>
            </button>

            {/* Button 2: Volver al menú de opciones del vendedor */}
            <button
              type="button"
              onClick={onBackToMenu}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Volver al menú de opciones del vendedor</span>
            </button>

            {/* Extra: Ver Recibo */}
            <button
              type="button"
              onClick={onViewReceipt}
              className="w-full py-2 px-4 text-slate-500 hover:text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Ver e imprimir recibo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
