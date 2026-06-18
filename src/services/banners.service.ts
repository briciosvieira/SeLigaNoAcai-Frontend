import { api } from './api';
import type {
  Banner,
  CreateBannerPayload,
  UpdateBannerPayload,
  UpdateBannerStatusPayload,
  UploadBannerResponse,
} from '@/types/banner.types';

export async function getActiveBannersRequest(): Promise<Banner[]> {
  const response = await api.get('/banners/active');
  return response.data.data;
}

export async function getBannersRequest(): Promise<Banner[]> {
  const response = await api.get('/banners');
  return response.data.data;
}

export async function createBannerRequest(payload: CreateBannerPayload): Promise<Banner> {
  const response = await api.post('/banners', payload);
  return response.data.data;
}

export async function updateBannerRequest(id: string, payload: UpdateBannerPayload): Promise<Banner> {
  const response = await api.patch(`/banners/${id}`, payload);
  return response.data.data;
}

export async function updateBannerStatusRequest(
  id: string,
  payload: UpdateBannerStatusPayload,
): Promise<Banner> {
  const response = await api.patch(`/banners/${id}/status`, payload);
  return response.data.data;
}

export async function deleteBannerRequest(id: string): Promise<void> {
  await api.delete(`/banners/${id}`);
}

export async function uploadBannerImageRequest(file: File): Promise<UploadBannerResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/uploads/banners', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}
