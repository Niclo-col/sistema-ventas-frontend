import React, { createContext, useContext, useState, useMemo } from 'react';
import { CartItem, Product } from '../types';
import { useCurrency } from './CurrencyContext';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotalUsd: number;
  totalUsd: number;
  totalVes: number;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { rate } = useCurrency();

  const addItem = (product: Product) => {
    setItems(current => {
      const existing = current.find(i => i.product.id === product.id);
      if (existing) {
        return current.map(i =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...current, { product, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(current => current.filter(i => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(current =>
      current.map(i => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (productId: string) => {
    return items.find(i => i.product.id === productId)?.quantity || 0;
  };

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotalUsd = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.product.priceUsd) * item.quantity, 0);
  }, [items]);

  const totalUsd = subtotalUsd;
  const totalVes = useMemo(() => {
    return Number((totalUsd * rate).toFixed(2));
  }, [totalUsd, rate]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotalUsd,
        totalUsd,
        totalVes,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
