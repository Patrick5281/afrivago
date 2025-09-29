import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCurrencyStore = create(
  persist(
    (set) => ({
      currency: 'XOF',
      setCurrency: (currency: string) => set({ currency }),
    }),
    {
      name: 'currency-store',
    }
  )
); 