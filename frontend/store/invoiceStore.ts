import { create } from 'zustand';
import { persist, PersistStorage } from 'zustand/middleware';
import React from 'react';

export interface StepData {
  senderName: string;
  senderAddress: string;
  receiverName: string;
  receiverAddress: string;
}

export interface ItemDetail {
  itemId: number;
  code: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface InvoiceStore {
  step1Data: StepData;
  setStep1Data: (data: Partial<StepData>) => void;

  items: ItemDetail[];
  addItem: (item: ItemDetail) => void;
  removeItem: (itemId: number) => void;
  updateItem: (itemId: number, updates: Partial<ItemDetail>) => void;

  totalAmount: number;
  setTotalAmount: (amount: number) => void;

  reset: () => void;

  isHydrated: boolean;
  setIsHydrated: (value: boolean) => void;
}

const initialState = {
  step1Data: {
    senderName: '',
    senderAddress: '',
    receiverName: '',
    receiverAddress: '',
  },
  items: [],
  totalAmount: 0,
  isHydrated: false,
};

const createLocalStorage = (): PersistStorage<InvoiceStore> | undefined => {
  if (typeof window === 'undefined') return undefined;

  return {
    getItem: (name: string) => {
      const item = localStorage.getItem(name);
      return item ? JSON.parse(item) : null;
    },
    setItem: (name: string, value: any) => {
      localStorage.setItem(name, JSON.stringify(value));
    },
    removeItem: (name: string) => {
      localStorage.removeItem(name);
    },
  };
};

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set) => ({
      ...initialState,

      setStep1Data: (data) =>
        set((state) => ({
          step1Data: { ...state.step1Data, ...data },
        })),

      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),

      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.itemId !== itemId),
        })),

      updateItem: (itemId, updates) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.itemId === itemId ? { ...i, ...updates } : i
          ),
        })),

      setTotalAmount: (amount) => set({ totalAmount: amount }),

      reset: () => set(initialState),

      setIsHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: 'invoice-store',
      storage: createLocalStorage(),
    }
  )
);

// Custom hook to safely access store (client-side only)
export const useInvoiceStoreHydrated = () => {
  const store = useInvoiceStore();
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
    store.setIsHydrated(true);
  }, []);

  return { ...store, isHydrated };
};
