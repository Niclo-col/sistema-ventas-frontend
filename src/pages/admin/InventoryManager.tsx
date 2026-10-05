import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Tag,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { ProductService, CategoryService } from '../../services/api';
import { Product, Category } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import { ProductModal } from '../../components/admin/ProductModal';

interface InventoryManagerProps {
  onBackToMenu: () => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ onBackToMenu }) => {
  const { formatUSD, formatVES, rate } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    } catch (e) {
      console.warn('Error loading inventory:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await ProductService.delete(productToDelete.id);
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      setProductToDelete(null);
    } catch (e) {
      console.warn('Error deleting product:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMenu}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-xs"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900">Inventario</h2>
            <p className="text-xs text-slate-500">Administre el catálogo de productos y precios</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Items totales badge */}
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Items en catálogo
            </span>
            <span className="text-xl font-black text-indigo-700">
              {products.length}
            </span>
          </div>

          {/* + Agregar producto button */}
          <button
            onClick={handleOpenCreate}
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-indigo-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar producto</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar producto por nombre o descripción..."
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

      {/* Product List without images and without stock */}
      <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <FolderOpen className="w-10 h-10 stroke-1 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700 text-sm">No se encontraron productos en esta categoría</p>
            <button
              onClick={handleOpenCreate}
              className="mt-3 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              + Agregar nuevo producto a la base de datos
            </button>
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
                {/* Left: Product Name, Category & Description */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
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
                    </div>
                    {p.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {p.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Center: Price in USD and Bs */}
                <div className="text-right shrink-0 px-2">
                  <span className="text-base font-black text-slate-900 block leading-tight">
                    {formatUSD(price)}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {priceVes.toFixed(2)} Bs
                  </span>
                </div>

                {/* Right: Actions (Edit & Delete) */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                    title="Editar producto"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setProductToDelete(p)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-20">
        <button
          onClick={handleOpenCreate}
          className="py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-full shadow-xl shadow-indigo-300 flex items-center gap-2 transition-all transform hover:scale-105 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>+ Agregar producto</span>
        </button>
      </div>

      {/* Product Create / Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        product={editingProduct}
        onClose={() => setIsProductModalOpen(false)}
        onSaved={loadData}
      />

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">¿Eliminar producto?</h3>
              <p className="text-xs text-slate-500 mt-1">
                ¿Está seguro de eliminar <strong>"{productToDelete.name}"</strong>?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
