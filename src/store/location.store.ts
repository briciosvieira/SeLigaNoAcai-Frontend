import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DeliveryZone } from '@/types/delivery-zone.types';

type LocationState = {
  selectedDeliveryZone: DeliveryZone | null;
  deliveryFee: number;
  setDeliveryZone: (zone: DeliveryZone) => void;
  clearDeliveryZone: () => void;
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      selectedDeliveryZone: null,
      deliveryFee: 0,

      setDeliveryZone: (zone) =>
        set({
          selectedDeliveryZone: zone,
          deliveryFee: Number(zone.deliveryFee) || 0,
        }),

      clearDeliveryZone: () =>
        set({ selectedDeliveryZone: null, deliveryFee: 0 }),
    }),
    { name: 'seliga-location' },
  ),
);
