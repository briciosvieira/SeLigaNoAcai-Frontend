import { api } from './api';

export type UploadResult = {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
};

export async function uploadProductImageRequest(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/uploads/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function uploadStoreLogoRequest(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/uploads/store-logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}
