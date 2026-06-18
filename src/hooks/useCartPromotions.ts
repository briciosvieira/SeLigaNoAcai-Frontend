import { useCallback, useEffect, useMemo, useState } from 'react';
import { calculatePromotionsRequest, getCouponAvailabilityRequest } from '@/services/promotions.service';
import type { CalculatePromotionsResult } from '@/types/promotion.types';
import { useCartStore } from '@/store/cart.store';
import { normalizeCouponCode } from '@/utils/coupon';

const emptyResult: CalculatePromotionsResult = {
  subtotal: 0,
  discountAmount: 0,
  freeItems: [],
  appliedPromotions: [],
  coupon: null,
  total: 0,
};

export function useCartPromotions() {
  const items = useCartStore((s) => s.items);
  const [promotionResult, setPromotionResult] = useState<CalculatePromotionsResult>(emptyResult);
  const [isCalculatingPromotions, setIsCalculatingPromotions] = useState(false);
  const [hasActiveCoupon, setHasActiveCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);

  useEffect(() => {
    getCouponAvailabilityRequest()
      .then((res) => setHasActiveCoupon(res.hasActiveCoupon))
      .catch(() => setHasActiveCoupon(false));
  }, []);

  const promotionPayload = useMemo(
    () => ({
      ...(appliedCouponCode ? { couponCode: appliedCouponCode } : {}),
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice ?? 0),
      })),
    }),
    [items, appliedCouponCode],
  );

  useEffect(() => {
    let cancelled = false;

    async function calculate() {
      if (promotionPayload.items.length === 0) {
        setPromotionResult(emptyResult);
        return;
      }

      setIsCalculatingPromotions(true);
      try {
        const result = await calculatePromotionsRequest(promotionPayload);
        if (!cancelled) setPromotionResult(result);
      } catch (err) {
        console.error('Erro ao calcular promoções:', err);
        if (!cancelled)
          setPromotionResult({
            ...emptyResult,
            subtotal: promotionPayload.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
            total: promotionPayload.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
          });
      } finally {
        if (!cancelled) setIsCalculatingPromotions(false);
      }
    }

    void calculate();
    return () => {
      cancelled = true;
    };
  }, [promotionPayload]);

  const applyCoupon = useCallback(() => {
    const normalized = normalizeCouponCode(couponCode);
    if (!normalized) return;
    setCouponCode(normalized);
    setAppliedCouponCode(normalized);
  }, [couponCode]);

  const removeCoupon = useCallback(() => {
    setAppliedCouponCode(null);
    setCouponCode('');
    setPromotionResult((prev) => ({ ...prev, coupon: null }));
  }, []);

  const couponMessage = promotionResult.coupon?.message ?? null;

  return {
    promotionResult,
    isCalculatingPromotions,
    hasActiveCoupon,
    couponCode,
    setCouponCode,
    appliedCouponCode,
    applyCoupon,
    removeCoupon,
    couponMessage,
    subtotal: promotionResult.subtotal,
    discountAmount: promotionResult.discountAmount,
    freeItems: promotionResult.freeItems,
    appliedPromotions: promotionResult.appliedPromotions,
    promotionalTotal: promotionResult.total,
  };
}
