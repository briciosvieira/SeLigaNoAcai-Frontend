import { useState } from 'react';
import { getMyLoyaltyCardRequest, getLoyaltyBenefitsRequest } from '@/services/loyalty.service';
import type { LoyaltyCard, LoyaltyBenefit } from '@/types/loyalty.types';

export function useLoyalty() {
  const [card, setCard] = useState<LoyaltyCard | null>(null);
  const [benefits, setBenefits] = useState<LoyaltyBenefit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadLoyalty() {
    setIsLoading(true);
    setError(null);
    try {
      const [cardData, benefitsData] = await Promise.allSettled([
        getMyLoyaltyCardRequest(),
        getLoyaltyBenefitsRequest(),
      ]);
      if (cardData.status === 'fulfilled') setCard(cardData.value);
      if (benefitsData.status === 'fulfilled') setBenefits(benefitsData.value ?? []);
    } catch {
      setError('Erro ao carregar fidelidade');
    } finally {
      setIsLoading(false);
    }
  }

  return { card, benefits, isLoading, error, loadLoyalty };
}
