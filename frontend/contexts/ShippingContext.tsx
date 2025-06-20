"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import shippingpriceService from '@/services/shippingpricesService';

interface ShippingContextType {
  shippingPrice: number;
  minOrderForFreeShipping: number;
  isLoading: boolean;
}

const ShippingContext = createContext<ShippingContextType | undefined>(undefined);

export function ShippingProvider({ children }: { children: ReactNode }) {
  const [shippingPrice, setShippingPrice] = useState<number>(0);
  const [minOrderForFreeShipping, setMinOrderForFreeShipping] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShipping = async () => {
      try {
        setIsLoading(true);
        const { valorEnvio, min_order } = await shippingpriceService.getCurrentPrice();
        setShippingPrice(valorEnvio);
        setMinOrderForFreeShipping(min_order);
      } catch (error) {
        console.error("Failed to fetch shipping price:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShipping();
  }, []);

  const value = { shippingPrice, minOrderForFreeShipping, isLoading };

  return (
    <ShippingContext.Provider value={value}>
      {children}
    </ShippingContext.Provider>
  );
}

export function useShipping() {
  const context = useContext(ShippingContext);
  if (context === undefined) {
    throw new Error('useShipping must be used within a ShippingProvider');
  }
  return context;
} 