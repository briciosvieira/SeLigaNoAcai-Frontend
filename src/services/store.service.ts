import { api } from './api';
import type { 
  Store, 
  CreateStorePayload, 
  UpdateStorePayload,
  StoreAvailabilityDurationOption,
  UpdateStoreAvailabilityPayload
} from '@/types/store.types';

function unwrapResponseData<T>(response: { data: any }): T {
  const responseData = response.data;

  if (
    responseData &&
    typeof responseData === 'object' &&
    'data' in responseData
  ) {
    return responseData.data as T;
  }

  return responseData as T;
}

function normalizeCurrentStorePayload(payload: any): any {
  if (!payload) {
    return null;
  }

  if (Array.isArray(payload)) {
    return payload[0] ?? null;
  }

  if (Array.isArray(payload.items)) {
    return payload.items[0] ?? null;
  }

  if (Array.isArray(payload.data)) {
    return payload.data[0] ?? null;
  }

  if (payload.data && typeof payload.data === 'object') {
    return normalizeCurrentStorePayload(payload.data);
  }

  return payload;
}

export async function getStoreCurrentRequest(): Promise<Store | null> {
  const response = await api.get('/store/current');
  const payload = unwrapResponseData<any>(response);

  return normalizeCurrentStorePayload(payload);
}

export async function getCurrentStoreRequest(): Promise<Store | null> {
  return getStoreCurrentRequest();
}

export async function getStoresRequest(): Promise<Store[]> {
  const store = await getStoreCurrentRequest();
  return store ? [store] : [];
}

export async function createStoreRequest(payload: CreateStorePayload): Promise<Store> {
  const response = await api.post('/store/current', payload);
  return unwrapResponseData<Store>(response);
}

export async function updateStoreRequest(payload: UpdateStorePayload): Promise<Store> {
  const response = await api.patch('/store/current', payload);
  return unwrapResponseData<Store>(response);
}

export async function updateCurrentStoreRequest(payload: UpdateStorePayload): Promise<Store> {
  return updateStoreRequest(payload);
}

export async function updateStoreStatusRequest(id: string, isActive: boolean): Promise<Store> {
  const response = await api.patch('/store/current', { isActive });
  return unwrapResponseData<Store>(response);
}

export async function getStoreAvailabilityDurationOptionsRequest(): Promise<StoreAvailabilityDurationOption[]> {
  const response = await api.get('/store/availability/duration-options');
  return unwrapResponseData<StoreAvailabilityDurationOption[]>(response);
}

export async function updateCurrentStoreAvailabilityRequest(payload: UpdateStoreAvailabilityPayload): Promise<Store> {
  const response = await api.patch('/store/current/availability', payload);
  return unwrapResponseData<Store>(response);
}

export async function deleteStoreRequest(id: string): Promise<void> {
  await api.delete(`/store/${id}`);
}
