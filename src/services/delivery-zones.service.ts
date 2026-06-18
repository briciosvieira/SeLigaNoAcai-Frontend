import { api } from './api';
import type {
  DeliveryZone,
  CreateDeliveryZonePayload,
  UpdateDeliveryZonePayload,
} from '@/types/delivery-zone.types';

function unwrap<T>(res: { data: unknown }): T {
  const d = res.data as { data?: T };
  return (d.data ?? res.data) as T;
}

export async function getDeliveryZonesRequest(): Promise<DeliveryZone[]> {
  const firstResponse = await api.get('/delivery-zones', {
    params: {
      page: 1,
      limit: 100,
    },
  });

  const firstPayload = firstResponse.data.data ?? firstResponse.data;

  if (Array.isArray(firstPayload)) {
    return firstPayload;
  }

  const firstItems = Array.isArray(firstPayload.data) ? firstPayload.data : [];
  const totalPages = Number(firstPayload.meta?.totalPages ?? 1);

  if (totalPages <= 1) {
    return firstItems;
  }

  const requests = [];

  for (let page = 2; page <= totalPages; page += 1) {
    requests.push(
      api.get('/delivery-zones', {
        params: {
          page,
          limit: 100,
        },
      }),
    );
  }

  const responses = await Promise.all(requests);

  const otherItems = responses.flatMap((response) => {
    const payload = response.data.data ?? response.data;
    if (Array.isArray(payload)) return payload;
    return Array.isArray(payload.data) ? payload.data : [];
  });

  return [...firstItems, ...otherItems] as DeliveryZone[];
}

export async function getDeliveryZoneByIdRequest(id: string): Promise<DeliveryZone> {
  const response = await api.get(`/delivery-zones/${id}`);
  return unwrap<DeliveryZone>(response);
}

export async function createDeliveryZoneRequest(
  payload: CreateDeliveryZonePayload,
): Promise<DeliveryZone> {
  const response = await api.post('/delivery-zones', payload);
  return unwrap<DeliveryZone>(response);
}

export async function updateDeliveryZoneRequest(
  id: string,
  payload: UpdateDeliveryZonePayload,
): Promise<DeliveryZone> {
  const response = await api.patch(`/delivery-zones/${id}`, payload);
  return unwrap<DeliveryZone>(response);
}

export async function deleteDeliveryZoneRequest(id: string): Promise<void> {
  await api.delete(`/delivery-zones/${id}`);
}
