import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, DollarSign, Tag, FileText } from 'lucide-react';
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
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      CategoryService.getAll().then(cats => {
        setCategories(cats);
        if (cats.length > 0 && !categoryId) {
          setCategoryId(product ? product.categoryId : cats[0].id);
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategoryId(product.categoryId);
      setPriceUsd(product.priceUsd.toString());
      setDescription(product.description || '');
    } else {
      setName('');
      setPriceUsd('');
      setDescription('');
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
    if (!categoryId) {
      setErrorMsg('Debe seleccionar una categoría.');
      return;
    }
    const parsedPrice = parseFloat(priceUsd);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
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
          priceUsd: String(parsedPrice),
          description: description.trim() || undefined
        });
      } else {
        await ProductService.create({
          categoryId,
          name: name.trim(),
          priceUsd: String(parsedPrice),
          description: description.trim() || undefined
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
              {product ? 'Modifique los atributos y precio del artículo' : 'Ingrese los datos del nuevo producto según el catálogo'}
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
              placeholder="Ej: Caramel Macchiato, Croissant de mantequilla..."
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category & Price USD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                <span>Categoría *</span>
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {categories.length === 0 ? (
                  <option value="">Cargando categorías...</option>
                ) : (
                  categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>

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
                  min="0.01"
                  required
                  value={priceUsd}
                  onChange={e => setPriceUsd(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Equivalente BCV: <span className="font-semibold text-slate-700">{priceVes.toFixed(2)} Bs</span>
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Descripción (Opcional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalles o especificaciones del producto..."
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
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
