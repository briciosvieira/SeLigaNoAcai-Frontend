import { useState } from 'react';
import { getCurrentStoreRequest } from '@/services/store.service';
import { getDeliveryZonesRequest } from '@/services/delivery-zones.service';
import { getCategoriesRequest, getProductsRequest } from '@/services/catalog.service';
import type { Category, Product } from '@/types/product.types';
import type { Store } from '@/types/store.types';
import type { DeliveryZone } from '@/types/delivery-zone.types';

export function useCatalog() {
  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAll() {
    setIsLoading(true);
    setError(null);
    try {
      const [storeData, zonesData, categoriesData, productsData] = await Promise.allSettled([
        getCurrentStoreRequest(),
        getDeliveryZonesRequest(),
        getCategoriesRequest(),
        getProductsRequest(),
      ]);

      if (storeData.status === 'fulfilled') setStore(storeData.value);
      if (zonesData.status === 'fulfilled') setDeliveryZones(zonesData.value ?? []);
      if (categoriesData.status === 'fulfilled') setCategories(categoriesData.value ?? []);
      if (productsData.status === 'fulfilled') setProducts(productsData.value ?? []);
    } catch {
      setError('Erro ao carregar catálogo');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadStore() {
    try {
      const storeData = await getCurrentStoreRequest();
      setStore(storeData);
    } catch (err) {
      console.error('Erro ao atualizar status da loja:', err);
    }
  }

  function getProductsByCategory(categoryId: string) {
    return products.filter((p) => p.categoryId === categoryId && p.isActive);
  }

  return {
    store,
    categories,
    products,
    deliveryZones,
    isLoading,
    error,
    loadAll,
    loadStore,
    getProductsByCategory,
  };
}
