import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createPromotionRequest,
  deletePromotionRequest,
  getPromotionsRequest,
  updatePromotionRequest,
  updatePromotionStatusRequest,
} from '@/services/promotions.service';
import { getAdminProductsRequest } from '@/services/admin-products.service';
import type {
  CreatePromotionPayload,
  Promotion,
  PromotionType,
  UpdatePromotionPayload,
} from '@/types/promotion.types';
import type { Product } from '@/types/product.types';

export type PromotionFilter = 'ALL' | 'ACTIVE' | 'INACTIVE' | PromotionType;

export function useAdminPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [filter, setFilter] = useState<PromotionFilter>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const loadPromotions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getPromotionsRequest();
      setPromotions(data ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const data = await getAdminProductsRequest();
      setProducts(data ?? []);
    } catch {}
  }, []);

  const createPromotion = useCallback(
    async (payload: CreatePromotionPayload) => {
      setIsSaving(true);
      try {
        await createPromotionRequest(payload);
        await loadPromotions();
      } finally {
        setIsSaving(false);
      }
    },
    [loadPromotions],
  );

  const updatePromotion = useCallback(
    async (promotionId: string, payload: UpdatePromotionPayload) => {
      setIsSaving(true);
      try {
        await updatePromotionRequest(promotionId, payload);
        await loadPromotions();
      } finally {
        setIsSaving(false);
      }
    },
    [loadPromotions],
  );

  const togglePromotionStatus = useCallback(
    async (promotion: Promotion) => {
      await updatePromotionStatusRequest(promotion.id, { isActive: !promotion.isActive });
      await loadPromotions();
    },
    [loadPromotions],
  );

  const deletePromotion = useCallback(
    async (promotionId: string) => {
      await deletePromotionRequest(promotionId);
      await loadPromotions();
    },
    [loadPromotions],
  );

  const filteredPromotions = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    return promotions.filter((p) => {
      const matchesSearch =
        !s ||
        p.name.toLowerCase().includes(s) ||
        (p.description?.toLowerCase().includes(s) ?? false) ||
        (p.buyProduct?.name?.toLowerCase().includes(s) ?? false) ||
        (p.rewardProduct?.name?.toLowerCase().includes(s) ?? false) ||
        (p.couponCode?.toLowerCase().includes(s) ?? false);

      const matchesFilter =
        filter === 'ALL' ||
        (filter === 'ACTIVE' && p.isActive) ||
        (filter === 'INACTIVE' && !p.isActive) ||
        p.type === filter;

      return matchesSearch && matchesFilter;
    });
  }, [filter, promotions, searchTerm]);

  useEffect(() => {
    void loadPromotions();
    void loadProducts();
  }, [loadPromotions, loadProducts]);

  return {
    promotions,
    filteredPromotions,
    products,
    isLoading,
    isSaving,
    filter,
    searchTerm,
    setFilter,
    setSearchTerm,
    loadPromotions,
    createPromotion,
    updatePromotion,
    togglePromotionStatus,
    deletePromotion,
  };
}
