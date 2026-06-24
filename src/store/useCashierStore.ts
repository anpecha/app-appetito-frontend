import { create } from 'zustand';

export interface Cashier {
  id: string;
  restaurant_id: string;
  opened_at: string;
  closed_at?: string;
  initial_balance: number;
  expected_balance: number;
  actual_balance?: number;
  status: 'OPEN' | 'CLOSED';
}

interface CashierStore {
  cashier: Cashier | null;
  isLoading: boolean;
  error: string | null;
  fetchCurrentCashier: () => Promise<void>;
  openCashier: (initialBalance: number) => Promise<void>;
  addTransaction: (
    type: 'WITHDRAWAL' | 'ADDITION',
    amount: number,
    observation: string,
  ) => Promise<void>;
  closeCashier: (actualBalance: number) => Promise<void>;
}

export const useCashierStore = create<CashierStore>((set, get) => ({
  cashier: null,
  isLoading: false,
  error: null,

  fetchCurrentCashier: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/proxy/cashier/current');
      if (res.ok) {
        const data = await res.json();
        set({ cashier: data, isLoading: false });
      } else {
        set({ cashier: null, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  openCashier: async (initialBalance: number) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/proxy/cashier/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initial_balance: initialBalance }),
      });
      if (!res.ok) throw new Error(await res.text());
      const newCashier = await res.json();
      set({ cashier: newCashier, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  addTransaction: async (type, amount, observation) => {
    const { cashier } = get();
    if (!cashier) throw new Error('Cashier not open');
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/proxy/cashier/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cashier_id: cashier.id,
          transaction_type: type,
          amount,
          observation,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      // Update local expected balance
      set({
        cashier: { ...cashier, expected_balance: data.new_expected_balance },
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  closeCashier: async (actualBalance: number) => {
    const { cashier } = get();
    if (!cashier) throw new Error('Cashier not open');
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/proxy/cashier/${cashier.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actual_balance: actualBalance }),
      });
      if (!res.ok) throw new Error(await res.text());
      set({ cashier: null, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
}));
