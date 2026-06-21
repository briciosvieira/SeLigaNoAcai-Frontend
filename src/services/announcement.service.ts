import { api } from './api';
import type {
  Announcement,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
} from '@/types/announcement.types';

function unwrapData<T>(response: { data: unknown }): T {
  const d = response.data as { data?: T };
  return (d.data ?? response.data) as T;
}

export async function getActiveAnnouncementRequest(): Promise<Announcement | null> {
  const response = await api.get('/announcements/active');
  return unwrapData<Announcement | null>(response);
}

export async function getAdminAnnouncementsRequest(): Promise<Announcement[]> {
  const response = await api.get('/admin/announcements');
  const data = unwrapData<unknown>(response);
  if (Array.isArray(data)) return data as Announcement[];
  const d = data as Record<string, unknown>;
  if (Array.isArray(d?.items)) return d.items as Announcement[];
  if (Array.isArray(d?.data)) return d.data as Announcement[];
  return [];
}

export async function createAdminAnnouncementRequest(
  payload: CreateAnnouncementPayload,
): Promise<Announcement> {
  const response = await api.post('/admin/announcements', payload);
  return unwrapData<Announcement>(response);
}

export async function updateAdminAnnouncementRequest(
  id: string,
  payload: UpdateAnnouncementPayload,
): Promise<Announcement> {
  const response = await api.patch(`/admin/announcements/${id}`, payload);
  return unwrapData<Announcement>(response);
}

export async function deleteAdminAnnouncementRequest(id: string): Promise<void> {
  await api.delete(`/admin/announcements/${id}`);
}

export async function uploadAnnouncementImageRequest(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/uploads/announcement', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrapData<{ url: string }>(response);
}
