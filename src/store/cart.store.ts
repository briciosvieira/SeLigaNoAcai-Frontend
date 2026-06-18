import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types/cart.types';

type CartState = {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  increaseItem: (id: string) => void;
  decreaseItem: (id: string) => void;
  clearCart: () => void;
  setDeliveryFee: (fee: number) => void;
};

function calcTotals(items: CartItem[], deliveryFee: number) {
  const subtotal = items.reduce((acc, item) => acc + item.totalAmount, 0);
  return { subtotal, total: subtotal + deliveryFee };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      total: 0,

      addItem: (item) => {
        const items = [...get().items, item];
        const { subtotal, total } = calcTotals(items, get().deliveryFee);
        set({ items, subtotal, total });
      },

      removeItem: (id) => {
        const items = get().items.filter((i) => i.id !== id);
        const { subtotal, total } = calcTotals(items, get().deliveryFee);
        set({ items, subtotal, total });
      },

      increaseItem: (id) => {
        const items = get().items.map((i) =>
          i.id === id
            ? { ...i, quantity: i.quantity + 1, totalAmount: i.unitPrice * (i.quantity + 1) }
            : i,
        );
        const { subtotal, total } = calcTotals(items, get().deliveryFee);
        set({ items, subtotal, total });
      },

      decreaseItem: (id) => {
        const items = get()
          .items.map((i) =>
            i.id === id
              ? { ...i, quantity: i.quantity - 1, totalAmount: i.unitPrice * (i.quantity - 1) }
              : i,
          )
          .filter((i) => i.quantity > 0);
        const { subtotal, total } = calcTotals(items, get().deliveryFee);
        set({ items, subtotal, total });
      },

      clearCart: () => set({ items: [], subtotal: 0, total: get().deliveryFee }),

      setDeliveryFee: (fee) => {
        const { subtotal } = calcTotals(get().items, fee);
        set({ deliveryFee: fee, total: subtotal + fee });
      },
    }),
    {
      name: 'seliga-cart',
    },
  ),
);
