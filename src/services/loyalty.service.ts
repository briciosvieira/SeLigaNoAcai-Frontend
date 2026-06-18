import { api } from './api';
import type { LoyaltyCard, LoyaltyBenefit } from '@/types/loyalty.types';

export async function getMyLoyaltyCardRequest(): Promise<LoyaltyCard> {
  const response = await api.get('/loyalty/my-card');
  return response.data.data;
}

export async function getLoyaltyBenefitsRequest(): Promise<LoyaltyBenefit[]> {
  const response = await api.get('/loyalty/benefits');
  return response.data.data;
}
