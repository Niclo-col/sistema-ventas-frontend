import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Package, Tag, Barcode } from 'lucide-react';
import { ProductService, CategoryService } from '../../services/api';
import { Product, Category } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';

interface PriceListProps {
  onBackToMenu: () => void;
}

export const PriceList: React.FC<PriceListProps> = ({ onBackToMenu }) => {
  const { formatUSD, formatVES, rate } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header matching mockup */}
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
            <h2 className="text-xl font-bold text-slate-900">Listado de Precios</h2>
            <p className="text-xs text-slate-500">Tarifas oficiales en divisas y bolívares</p>
          </div>
        </div>

        {/* Total items badge matching mockup */}
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Items en catálogo
          </span>
          <span className="text-xl font-black text-indigo-700">
            {products.length}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar producto por nombre, descripción o código de barras..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
        />
      </div>

      {/* Real Category Pills from Endpoint */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
          }`}
        >
          ✓ Todos ({products.length})
        </button>
        {categories.map(c => {
          const count = products.filter(p => p.categoryId === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
              }`}
            >
              {c.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
        <span>Lista de productos</span>
        <span className="text-slate-400">Tasa de cambio: {rate.toFixed(2)} Bs/$</span>
      </div>

      {/* Product List without stock and without images */}
      <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Package className="w-10 h-10 stroke-1 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700 text-sm">No hay productos en esta categoría</p>
          </div>
        ) : (
          filteredProducts.map(p => {
            const price = Number(p.priceUsd) || 0;
            const priceVes = price * rate;
            const categoryObj = categories.find(c => c.id === p.categoryId) || p.category;

            return (
              <div
                key={p.id}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4"
              >
                {/* Left: Product Details */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Package className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{p.name}</h3>
                      {categoryObj?.name && (
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                          {categoryObj.name}
                        </span>
                      )}
                      {p.barcode && (
                        <span className="text-[10px] font-mono font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Barcode className="w-3 h-3 text-slate-400" />
                          {p.barcode}
                        </span>
                      )}
                    </div>
                    {p.description && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {p.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Price */}
                <div className="text-right shrink-0">
                  <span className="text-base font-black text-indigo-700 block leading-tight">
                    {formatUSD(price)}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {priceVes.toFixed(2)} Bs
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Notice for sellers */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 text-center font-medium">
        💡 Vista de sólo lectura para vendedores.
      </div>
    </div>
  );
};
