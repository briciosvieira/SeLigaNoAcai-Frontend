import { api } from '@/services/api';
import type {
  CalculatePromotionsPayload,
  CalculatePromotionsResult,
  CouponAvailabilityResult,
  CreatePromotionPayload,
  Promotion,
  UpdatePromotionPayload,
  UpdatePromotionStatusPayload,
} from '@/types/promotion.types';

function unwrapData<T>(response: { data: { data: T } | T }): T {
  const responseData = response.data;
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return (responseData as { data: T }).data;
  }
  return responseData as T;
}

export async function getPromotionsRequest(): Promise<Promotion[]> {
  const response = await api.get('/promotions');
  return unwrapData<Promotion[]>(response) ?? [];
}

export async function getActivePromotionsRequest(): Promise<Promotion[]> {
  const response = await api.get('/promotions/active');
  return unwrapData<Promotion[]>(response) ?? [];
}

export async function getPromotionByIdRequest(promotionId: string): Promise<Promotion> {
  const response = await api.get(`/promotions/${promotionId}`);
  return unwrapData<Promotion>(response);
}

export async function createPromotionRequest(payload: CreatePromotionPayload): Promise<Promotion> {
  const response = await api.post('/promotions', payload);
  return unwrapData<Promotion>(response);
}

export async function updatePromotionRequest(
  promotionId: string,
  payload: UpdatePromotionPayload,
): Promise<Promotion> {
  const response = await api.patch(`/promotions/${promotionId}`, payload);
  return unwrapData<Promotion>(response);
}

export async function updatePromotionStatusRequest(
  promotionId: string,
  payload: UpdatePromotionStatusPayload,
): Promise<Promotion> {
  const response = await api.patch(`/promotions/${promotionId}/status`, payload);
  return unwrapData<Promotion>(response);
}

export async function deletePromotionRequest(promotionId: string): Promise<{ deleted: boolean }> {
  const response = await api.delete(`/promotions/${promotionId}`);
  return unwrapData<{ deleted: boolean }>(response);
}

export async function calculatePromotionsRequest(
  payload: CalculatePromotionsPayload,
): Promise<CalculatePromotionsResult> {
  const response = await api.post('/promotions/calculate', payload);
  return unwrapData<CalculatePromotionsResult>(response);
}

export async function getCouponAvailabilityRequest(): Promise<CouponAvailabilityResult> {
  const response = await api.get('/promotions/coupons/availability');
  return unwrapData<CouponAvailabilityResult>(response);
}
