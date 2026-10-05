import React, { useState } from 'react';
import { X, CreditCard, Banknote, ArrowRight, AlertCircle, Check, DollarSign } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { OrderService } from '../../services/api';
import { Order } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { items, totalUsd, totalVes, clearCart } = useCart();
  const { rate, formatUSD, formatVES } = useCurrency();

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');
  const [cashCurrency, setCashCurrency] = useState<'USD' | 'VES'>('USD');
  const [amountReceivedInput, setAmountReceivedInput] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('Cliente Mostrador');
  const [cardRef, setCardRef] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const rawAmountReceived = parseFloat(amountReceivedInput) || 0;
  
  // Calculate received normalized to USD
  const receivedInUsd = cashCurrency === 'USD' ? rawAmountReceived : rawAmountReceived / rate;
  const changeInUsd = Math.max(0, receivedInUsd - totalUsd);
  const changeInVes = changeInUsd * rate;

  const isCashSufficient = paymentMethod === 'CARD' || receivedInUsd >= totalUsd - 0.001;

  const handleQuickAmount = (valUsd: number) => {
    if (cashCurrency === 'USD') {
      setAmountReceivedInput(valUsd.toString());
    } else {
      setAmountReceivedInput((valUsd * rate).toFixed(2));
    }
  };

  const handleExactAmount = () => {
    if (cashCurrency === 'USD') {
      setAmountReceivedInput(totalUsd.toFixed(2));
    } else {
      setAmountReceivedInput(totalVes.toFixed(2));
    }
  };

  const handleProcessSale = async () => {
    if (paymentMethod === 'CASH' && !isCashSufficient) {
      setErrorMsg('El monto recibido debe ser mayor o igual al total a pagar.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const order = await OrderService.create({
        items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        totalUsd,
        exchangeRate: rate,
        paymentMethod,
        amountReceivedUsd: paymentMethod === 'CASH' ? receivedInUsd : totalUsd,
        changeGivenUsd: paymentMethod === 'CASH' ? changeInUsd : 0,
        customerName: customerName.trim() || 'Cliente Mostrador'
      });

      // Attach products to order items for receipt
      order.items = items.map(i => ({
        productId: i.product.id,
        product: i.product,
        productNameSnapshot: i.product.name,
        quantity: i.quantity,
        priceUsd: Number(i.product.priceUsd)
      }));

      clearCart();
      onSuccess(order);
    } catch (e: any) {
      setErrorMsg(e.message || 'Error al procesar la venta');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Cobro de Pedido</h2>
            <p className="text-xs text-slate-500">Seleccione el método de pago y registre el importe</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Total display banner */}
          <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-indigo-950 p-5 rounded-2xl text-white shadow-md">
            <span className="text-xs font-medium text-indigo-200 uppercase tracking-wider">Total a Pagar</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-extrabold tracking-tight">{formatUSD(totalUsd)}</span>
              <span className="text-base font-semibold text-indigo-200">{formatVES(totalUsd)}</span>
            </div>
            <div className="text-[11px] text-indigo-300 mt-1 flex items-center gap-1.5">
              <span>Tasa oficial BCV:</span>
              <span className="font-semibold text-white">{rate.toFixed(2)} Bs / 1$</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
              Método de Pago
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`flex items-center justify-center gap-3 p-3.5 rounded-2xl border-2 font-semibold text-sm transition-all cursor-pointer ${
                  paymentMethod === 'CASH'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className={`p-2 rounded-xl ${paymentMethod === 'CASH' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Banknote className="w-5 h-5" />
                </div>
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`flex items-center justify-center gap-3 p-3.5 rounded-2xl border-2 font-semibold text-sm transition-all cursor-pointer ${
                  paymentMethod === 'CARD'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className={`p-2 rounded-xl ${paymentMethod === 'CARD' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <span>Punto / Tarjeta</span>
              </button>
            </div>
          </div>

          {/* Cash Payment Details */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Monto Recibido
                </label>
                {/* Currency switch */}
                <div className="flex bg-white rounded-lg p-0.5 border border-slate-300 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setCashCurrency('USD');
                      setAmountReceivedInput('');
                    }}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      cashCurrency === 'USD' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Dólares ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCashCurrency('VES');
                      setAmountReceivedInput('');
                    }}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      cashCurrency === 'VES' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Bolívares (Bs)
                  </button>
                </div>
              </div>

              {/* Amount input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                  {cashCurrency === 'USD' ? '$' : 'Bs'}
                </div>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={amountReceivedInput}
                  onChange={e => setAmountReceivedInput(e.target.value)}
                  placeholder={cashCurrency === 'USD' ? totalUsd.toFixed(2) : totalVes.toFixed(2)}
                  className="w-full pl-9 pr-24 py-3 bg-white border border-slate-300 rounded-xl text-lg font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleExactAmount}
                  className="absolute right-2 top-2 bottom-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Exacto
                </button>
              </div>

              {/* Quick bill suggestions */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[5, 10, 20, 50, 100].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAmount(val)}
                    className="px-3 py-1 bg-white hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    {cashCurrency === 'USD' ? `$${val}` : `${(val * rate).toFixed(0)} Bs`}
                  </button>
                ))}
              </div>

              {/* Change / Vuelto Calculation display */}
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-medium text-slate-500">Monto ingresado:</span>
                  <span className="text-xs font-bold text-slate-800">
                    {cashCurrency === 'USD'
                      ? `${formatUSD(rawAmountReceived)} (${formatVES(rawAmountReceived)})`
                      : `${rawAmountReceived.toFixed(2)} Bs (${formatUSD(receivedInUsd)})`}
                  </span>
                </div>

                <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  !rawAmountReceived
                    ? 'bg-slate-100 border-slate-200 text-slate-500'
                    : isCashSufficient
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block">
                      {isCashSufficient ? 'Devolver / Vuelto al cliente:' : 'Falta para completar pago:'}
                    </span>
                    <span className="text-[11px] opacity-80">
                      {isCashSufficient ? 'Calculado a tasa oficial' : 'El importe ingresado es insuficiente'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black">
                      {isCashSufficient
                        ? formatUSD(changeInUsd)
                        : formatUSD(totalUsd - receivedInUsd)}
                    </div>
                    <div className="text-xs font-semibold opacity-90">
                      {isCashSufficient
                        ? `${changeInVes.toFixed(2)} Bs`
                        : `${((totalUsd - receivedInUsd) * rate).toFixed(2)} Bs`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Card Payment Details */}
          {paymentMethod === 'CARD' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold">
                <Check className="w-4 h-4" />
                <span>Cobro automático por punto de venta bancario</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número de Referencia / Lote (Opcional)
                </label>
                <input
                  type="text"
                  value={cardRef}
                  onChange={e => setCardRef(e.target.value)}
                  placeholder="Ej: 004812"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre o C.I. del Cliente (Opcional)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Cliente Mostrador"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleProcessSale}
            disabled={isProcessing || !isCashSufficient}
            className="flex-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <span>Procesando...</span>
            ) : (
              <>
                <span>Confirmar Venta</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
