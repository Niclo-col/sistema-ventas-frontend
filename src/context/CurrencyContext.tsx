import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ExchangeRate } from '../types';
import { ExchangeRateService } from '../services/api';

interface CurrencyContextType {
  rate: number;
  rateInfo: ExchangeRate | null;
  isLoading: boolean;
  formatUSD: (amount: number) => string;
  formatVES: (amountInUsd: number) => string;
  toVES: (usdAmount: number) => number;
  syncWithBCV: () => Promise<void>;
  updateRate: (newRate: number) => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rateInfo, setRateInfo] = useState<ExchangeRate | null>(null);
  const [rate, setRate] = useState<number>(857.8876);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCurrentRate = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ExchangeRateService.getCurrent();
      setRateInfo(data);
      setRate(data.rate || 857.8876);
    } catch (e) {
      console.warn('Error fetching rate:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentRate();
  }, [fetchCurrentRate]);

  const syncWithBCV = async () => {
    setIsLoading(true);
    try {
      const updated = await ExchangeRateService.syncBCV();
      setRateInfo(updated);
      setRate(updated.rate);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRate = async (newRate: number) => {
    setIsLoading(true);
    try {
      const updated = await ExchangeRateService.updateManual(newRate);
      setRateInfo(updated);
      setRate(updated.rate);
    } finally {
      setIsLoading(false);
    }
  };

  const toVES = (usdAmount: number) => {
    return Number((usdAmount * rate).toFixed(2));
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatVES = (amountInUsd: number) => {
    const ves = toVES(amountInUsd);
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(ves) + ' Bs';
  };

  return (
    <CurrencyContext.Provider
      value={{
        rate,
        rateInfo,
        isLoading,
        formatUSD,
        formatVES,
        toVES,
        syncWithBCV,
        updateRate
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
