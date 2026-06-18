import { useState } from 'react';
import {
  getBannersRequest,
  createBannerRequest,
  updateBannerRequest,
  updateBannerStatusRequest,
  deleteBannerRequest,
  uploadBannerImageRequest,
} from '@/services/banners.service';
import type {
  Banner,
  CreateBannerPayload,
  UpdateBannerPayload,
  UploadBannerResponse,
} from '@/types/banner.types';

export function useAdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  async function loadBanners() {
    setIsLoading(true);
    try {
      const data = await getBannersRequest();
      setBanners(data ?? []);
    } catch {
      setBanners([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function uploadBannerImage(file: File): Promise<UploadBannerResponse> {
    setIsUploading(true);
    try {
      return await uploadBannerImageRequest(file);
    } finally {
      setIsUploading(false);
    }
  }

  async function createBanner(payload: CreateBannerPayload): Promise<void> {
    await createBannerRequest(payload);
    await loadBanners();
  }

  async function updateBanner(id: string, payload: UpdateBannerPayload): Promise<void> {
    await updateBannerRequest(id, payload);
    await loadBanners();
  }

  async function updateBannerStatus(id: string, isActive: boolean): Promise<void> {
    await updateBannerStatusRequest(id, { isActive });
    await loadBanners();
  }

  async function deleteBanner(id: string): Promise<void> {
    await deleteBannerRequest(id);
    await loadBanners();
  }

  return {
    banners,
    isLoading,
    isUploading,
    loadBanners,
    uploadBannerImage,
    createBanner,
    updateBanner,
    updateBannerStatus,
    deleteBanner,
  };
}
