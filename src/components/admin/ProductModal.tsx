import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Barcode, Tag, DollarSign, Package } from 'lucide-react';
import { Product, Category } from '../../types';
import { CategoryService, ProductService } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';

interface ProductModalProps {
  isOpen: boolean;
  product: Product | null; // If null => create, else edit
  onClose: () => void;
  onSaved: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, product, onClose, onSaved }) => {
  const { rate } = useCurrency();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priceUsd, setPriceUsd] = useState('');
  const [barcode, setBarcode] = useState('');
  const [stock, setStock] = useState('10');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    CategoryService.getAll().then(cats => {
      setCategories(cats);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    });
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategoryId(product.categoryId);
      setPriceUsd(product.priceUsd.toString());
      setBarcode(product.barcode || '');
      setStock((product.stock ?? 10).toString());
      setDescription(product.description || '');
      setImageUrl(product.imageUrl || '');
    } else {
      setName('');
      setPriceUsd('');
      setBarcode(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      setStock('20');
      setDescription('');
      setImageUrl('https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60');
    }
    setErrorMsg('');
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('El nombre del producto es obligatorio.');
      return;
    }
    const parsedPrice = parseFloat(priceUsd);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setErrorMsg('Ingrese un precio en USD válido.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      if (product) {
        await ProductService.update(product.id, {
          name: name.trim(),
          categoryId,
          priceUsd: parsedPrice,
          barcode: barcode.trim(),
          stock: parseInt(stock, 10) || 0,
          description: description.trim(),
          imageUrl: imageUrl.trim()
        });
      } else {
        await ProductService.create({
          name: name.trim(),
          categoryId,
          priceUsd: parsedPrice,
          barcode: barcode.trim(),
          stock: parseInt(stock, 10) || 0,
          description: description.trim(),
          imageUrl: imageUrl.trim()
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  const parsedPrice = parseFloat(priceUsd) || 0;
  const priceVes = parsedPrice * rate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {product ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h2>
            <p className="text-xs text-slate-500">
              {product ? 'Modifique los atributos y precios del artículo' : 'Ingrese los datos del nuevo producto para el inventario'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Nombre del Producto *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Galletas Club Social, Caramel Macchiato..."
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category & Barcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Categoría *
              </label>
              <div className="relative">
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider flex items-center gap-1">
                <Barcode className="w-3.5 h-3.5 text-slate-500" />
                <span>Código de Barras / SKU</span>
              </label>
              <input
                type="text"
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                placeholder="Ej: KS-34-KIK"
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Price USD & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Precio (USD) *</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
                  $
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={priceUsd}
                  onChange={e => setPriceUsd(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Equivalente en Bs: <span className="font-semibold text-slate-700">{priceVes.toFixed(2)} Bs</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-slate-500" />
                <span>Stock / Unidades</span>
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={e => setStock(e.target.value)}
                placeholder="10"
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Descripción Corta
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ingredientes, presentación o detalles del producto"
              className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              URL de Imagen (Opcional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Guardando...' : product ? 'Actualizar Producto' : 'Guardar Producto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
