import { api } from './api';
import type {
  OptionGroup,
  ProductOption,
  CreateOptionGroupPayload,
  UpdateOptionGroupPayload,
  CreateProductOptionPayload,
  UpdateProductOptionPayload,
} from '@/types/product.types';

function unwrap<T>(response: { data: { data?: T } | T }): T {
  const r = response.data as { data?: T };
  return (r.data ?? response.data) as T;
}

// ── Option Groups ─────────────────────────────────────────────────────────────

export async function getOptionGroupsRequest(): Promise<OptionGroup[]> {
  const response = await api.get('/options/groups');
  const result = unwrap<OptionGroup[]>(response);
  return result ?? [];
}

export async function getOptionGroupByIdRequest(id: string): Promise<OptionGroup> {
  const response = await api.get(`/options/groups/${id}`);
  return unwrap<OptionGroup>(response);
}

export async function createOptionGroupRequest(payload: CreateOptionGroupPayload): Promise<OptionGroup> {
  const response = await api.post('/options/groups', payload);
  return unwrap<OptionGroup>(response);
}

export async function updateOptionGroupRequest(
  id: string,
  payload: UpdateOptionGroupPayload,
): Promise<OptionGroup> {
  const response = await api.patch(`/options/groups/${id}`, payload);
  return unwrap<OptionGroup>(response);
}

export async function deleteOptionGroupRequest(id: string): Promise<void> {
  await api.delete(`/options/groups/${id}`);
}

// ── Options (items inside a group) ────────────────────────────────────────────

export async function createProductOptionRequest(
  payload: CreateProductOptionPayload,
): Promise<ProductOption> {
  const { optionGroupId, ...body } = payload;
  const response = await api.post(`/options/groups/${optionGroupId}/options`, body);
  return unwrap<ProductOption>(response);
}

export async function updateProductOptionRequest(
  id: string,
  payload: UpdateProductOptionPayload,
): Promise<ProductOption> {
  const response = await api.patch(`/options/${id}`, payload);
  return unwrap<ProductOption>(response);
}

export async function deleteProductOptionRequest(id: string): Promise<void> {
  await api.delete(`/options/${id}`);
}
