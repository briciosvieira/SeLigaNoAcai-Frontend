import { useCartStore } from '@/store/cart.store';
import { useLocationStore } from '@/store/location.store';
import type { CartItem } from '@/types/cart.types';

export function useCart() {
  const { items, subtotal, total, addItem, removeItem, increaseItem, decreaseItem, clearCart, setDeliveryFee } =
    useCartStore();
  const { deliveryFee } = useLocationStore();

  function syncDeliveryFee() {
    setDeliveryFee(deliveryFee);
  }

  function addToCart(item: CartItem) {
    addItem(item);
  }

  return {
    items,
    subtotal,
    deliveryFee,
    total,
    addItem: addToCart,
    removeItem,
    increaseItem,
    decreaseItem,
    clearCart,
    syncDeliveryFee,
    itemCount: items.reduce((acc, i) => acc + i.quantity, 0),
  };
}
