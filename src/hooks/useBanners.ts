import { useState } from 'react';
import { getActiveBannersRequest } from '@/services/banners.service';
import type { Banner } from '@/types/banner.types';

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function loadActiveBanners() {
    setIsLoading(true);
    try {
      const data = await getActiveBannersRequest();
      setBanners(data ?? []);
    } catch {
      setBanners([]);
    } finally {
      setIsLoading(false);
    }
  }

  return { banners, isLoading, loadActiveBanners };
}
