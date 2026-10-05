import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  CreditCard,
  ShoppingBag,
  Package,
  Layers
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { ProductService, CategoryService } from '../../services/api';
import { Product, Category, Order } from '../../types';
import { CheckoutModal } from '../../components/seller/CheckoutModal';
import { SaleSuccessModal } from '../../components/seller/SaleSuccessModal';
import { ReceiptModal } from '../../components/common/ReceiptModal';

interface POSProps {
  onBackToMenu: () => void;
}

export const POS: React.FC<POSProps> = ({ onBackToMenu }) => {
  const {
    items: cartItems,
    itemCount,
    subtotalUsd,
    totalUsd,
    totalVes,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity
  } = useCart();

  const { formatUSD, formatVES, rate } = useCurrency();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        CategoryService.getAll(),
        ProductService.getAll()
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      console.warn('Error loading POS data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSaleSuccess = (order: Order) => {
    setIsCheckoutOpen(false);
    setCompletedOrder(order);
  };

  const handleNewSale = () => {
    setCompletedOrder(null);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-65px)] overflow-hidden bg-slate-100">
      {/* Left/Main Column: Catalog & Products */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar inside POS matching mockup */}
        <div className="bg-white border-b border-slate-200 px-4 py-3 sm:px-6 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToMenu}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Volver al menú de operaciones"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Registro de ventas</h2>
              <p className="text-xs text-slate-500">Registro 400 | John M.</p>
            </div>
          </div>

          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar productos o escanear código..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills (Scrollable) */}
        <div className="bg-white border-b border-slate-200 px-4 py-2.5 sm:px-6 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Todos
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Product Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-2">
              <Package className="w-12 h-12 stroke-1" />
              <p className="text-sm font-semibold text-slate-600">No se encontraron productos</p>
              <p className="text-xs">Pruebe con otra búsqueda o seleccione otra categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => {
                const qtyInCart = getItemQuantity(product.id);
                const priceVes = product.priceUsd * rate;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package className="w-10 h-10 stroke-1" />
                        </div>
                      )}
                      {/* Barcode badge */}
                      {product.barcode && (
                        <span className="absolute top-2 left-2 bg-slate-900/70 backdrop-blur-xs text-white text-[9px] font-mono px-1.5 py-0.5 rounded-md">
                          {product.barcode}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-1">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {product.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="font-extrabold text-base text-slate-900 block leading-tight">
                            {formatUSD(product.priceUsd)}
                          </span>
                          <span className="text-[10px] font-medium text-slate-500">
                            {priceVes.toFixed(2)} Bs
                          </span>
                        </div>

                        {/* Add button or counter */}
                        {qtyInCart > 0 ? (
                          <div className="flex items-center gap-1.5 bg-indigo-50 p-1 rounded-xl border border-indigo-200">
                            <button
                              onClick={() => updateQuantity(product.id, qtyInCart - 1)}
                              className="w-6 h-6 rounded-lg bg-white text-indigo-700 font-bold flex items-center justify-center shadow-xs hover:bg-indigo-100 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-xs text-indigo-900 px-1">
                              {qtyInCart}
                            </span>
                            <button
                              onClick={() => addItem(product)}
                              className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center shadow-xs hover:bg-indigo-700 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addItem(product)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Pedido Drawer / Cart (Matching mockup Page 2) */}
      <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col shrink-0 h-96 lg:h-auto">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Pedido</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingBag className="w-12 h-12 stroke-1 mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No hay productos en el pedido</p>
              <p className="text-xs text-slate-400 mt-1">
                Seleccione productos del catálogo para comenzar la venta
              </p>
            </div>
          ) : (
            cartItems.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      ☕
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-xs truncate">{product.name}</h4>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {formatUSD(product.priceUsd)} x {quantity}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="w-5 h-5 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-slate-800 w-4 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => addItem(product)}
                    className="w-5 h-5 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Line Total */}
                <div className="text-right shrink-0">
                  <span className="font-bold text-xs text-slate-900 block">
                    {formatUSD(product.priceUsd * quantity)}
                  </span>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-slate-400 hover:text-rose-500 p-0.5 rounded cursor-pointer transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Checkout Button matching mockup */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Subtotal:</span>
              <span>{formatUSD(subtotalUsd)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-1 border-t border-slate-200">
              <span className="font-bold text-sm text-slate-900">Total:</span>
              <div className="text-right">
                <span className="font-black text-xl text-indigo-700 block">{formatUSD(totalUsd)}</span>
                <span className="text-[11px] font-semibold text-slate-500">{formatVES(totalUsd)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="p-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 rounded-2xl transition-colors cursor-pointer"
                title="Vaciar pedido"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => setIsCheckoutOpen(true)}
              disabled={cartItems.length === 0}
              className="flex-1 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pagar {formatUSD(totalUsd)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleSaleSuccess}
      />

      {/* Sale Success Modal */}
      <SaleSuccessModal
        order={completedOrder}
        onNewSale={handleNewSale}
        onBackToMenu={onBackToMenu}
        onViewReceipt={() => {
          setReceiptOrder(completedOrder);
          setCompletedOrder(null);
        }}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        order={receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />
    </div>
  );
};
