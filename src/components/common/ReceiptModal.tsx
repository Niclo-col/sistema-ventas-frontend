import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { Order } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  const { formatUSD } = useCurrency();
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleString('es-VE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-800 text-sm">Recibo de Venta {order.orderNumber}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Ticket Content (Printable) */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-slate-800 space-y-4 print:p-0">
          {/* Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
            <p className="font-extrabold text-sm uppercase text-slate-900">IMPRESIONES LUIPE C.A.</p>
            <p className="text-[11px] text-slate-500">RIF: J-50123984-1</p>
            <p className="text-[11px] text-slate-500">Cafetería & Multiservicios</p>
            <p className="text-[10px] text-slate-400">Tel: (0212) 555-0199</p>
          </div>

          {/* Metadata */}
          <div className="space-y-1 text-[11px] pb-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Orden:</span>
              <span className="font-bold">{order.orderNumber || order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Fecha:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Atendido por:</span>
              <span>{order.userName || 'Caja 1'}</span>
            </div>
            {order.customerName && (
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente:</span>
                <span>{order.customerName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Tasa BCV aplicada:</span>
              <span className="font-semibold">{order.exchangeRate.toFixed(2)} Bs/$</span>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2 pb-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between text-slate-500 font-bold text-[10px] uppercase">
              <span>Cant. / Descripción</span>
              <span>Total</span>
            </div>
            {order.items.map((item, idx) => {
              const unitPrice = Number(item.unitPriceUsdSnapshot || item.priceUsd || item.product?.priceUsd || 0);
              const lineTotal = Number(item.subtotalUsd || unitPrice * item.quantity);
              return (
                <div key={idx} className="flex justify-between items-start text-[11px]">
                  <div className="pr-2">
                    <span className="font-bold">{item.quantity}x</span>{' '}
                    <span>{item.productNameSnapshot || item.product?.name || `Producto #${idx + 1}`}</span>
                    <div className="text-[10px] text-slate-400">
                      @ {formatUSD(unitPrice)}
                    </div>
                  </div>
                  <span className="font-semibold">
                    {formatUSD(lineTotal)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between font-bold text-sm text-slate-900 pt-1">
              <span>TOTAL USD:</span>
              <span>{formatUSD(order.totalUsd)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-700 text-xs">
              <span>TOTAL BS:</span>
              <span>{order.totalVes.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs</span>
            </div>
            <div className="flex justify-between text-slate-600 text-[11px] pt-1">
              <span>Método de pago:</span>
              <span className="font-semibold uppercase">
                {order.paymentMethod === 'CASH' ? 'Efectivo' : 'Tarjeta'}
              </span>
            </div>
            {order.paymentMethod === 'CASH' && order.amountReceivedUsd && (
              <>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Recibido:</span>
                  <span>{formatUSD(order.amountReceivedUsd)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold text-[11px]">
                  <span>Cambio / Vuelto:</span>
                  <span>{formatUSD(order.changeGivenUsd || 0)}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer note & barcode fake */}
          <div className="pt-4 text-center space-y-2 border-t border-dashed border-slate-300">
            <p className="text-[10px] text-slate-500">¡Gracias por su compra!</p>
            <div className="flex justify-center items-center py-1">
              <div className="h-8 w-44 bg-slate-900 flex items-center justify-around px-2 text-[7px] text-white">
                ||| | |||| | || | |||| ||
              </div>
            </div>
            <p className="text-[9px] text-slate-400">Conserve este comprobante para cualquier reclamo</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimir Ticket
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
