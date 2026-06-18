import { useState } from 'react';
import { getDeliveryZonesRequest } from '@/services/delivery-zones.service';
import { useLocationStore } from '@/store/location.store';
import { useCartStore } from '@/store/cart.store';
import type { DeliveryZone } from '@/types/delivery-zone.types';

export function useLocation() {
  const { selectedDeliveryZone, deliveryFee, setDeliveryZone, clearDeliveryZone } =
    useLocationStore();
  const { setDeliveryFee } = useCartStore();

  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadDeliveryZones() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDeliveryZonesRequest();
      setZones(data ?? []);
      return data;
    } catch {
      setError('Erro ao carregar bairros');
      setZones([]);
    } finally {
      setIsLoading(false);
    }
  }

  function selectDeliveryZone(zone: DeliveryZone) {
    const fee = Number(zone.deliveryFee) || 0;
    setDeliveryZone(zone);
    setDeliveryFee(fee);
  }

  return {
    selectedDeliveryZone,
    deliveryFee,
    zones,
    isLoading,
    error,
    loadDeliveryZones,
    selectDeliveryZone,
    clearDeliveryZone,
  };
}
