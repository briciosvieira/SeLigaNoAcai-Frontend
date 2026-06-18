import { api } from './api';
import type {
  Product,
  ProductVariant,
  OptionGroup,
  ProductOptionGroupRelation,
  CreateProductPayload,
  UpdateProductPayload,
  CreateProductVariantPayload,
  UpdateProductVariantPayload,
} from '@/types/product.types';

function unwrap<T>(response: { data: { data?: T } | T }): T {
  const r = response.data as { data?: T };
  return (r.data ?? response.data) as T;
}

// Maps GET /products/:id/option-groups relations → OptionGroup[]
// The relation carries product-specific min/max/required that override group defaults
function mapRelationsToGroups(relations: ProductOptionGroupRelation[]): OptionGroup[] {
  return relations.map((rel) => ({
    ...rel.optionGroup,
    minSelected: rel.minSelected,
    maxSelected: rel.maxSelected,
    isRequired: rel.isRequired,
  }));
}

export async function getAdminProductsRequest(): Promise<Product[]> {
  const response = await api.get('/products');
  const result = unwrap<Product[]>(response);
  return result ?? [];
}

export async function getAdminProductByIdRequest(id: string): Promise<Product> {
  const response = await api.get(`/products/${id}`);
  return unwrap<Product>(response);
}

export async function createProductRequest(payload: CreateProductPayload): Promise<Product> {
  const response = await api.post('/products', payload);
  return unwrap<Product>(response);
}

export async function updateProductRequest(id: string, payload: UpdateProductPayload): Promise<Product> {
  const response = await api.patch(`/products/${id}`, payload);
  return unwrap<Product>(response);
}

export async function deleteProductRequest(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function getAdminProductVariantsRequest(productId: string): Promise<ProductVariant[]> {
  const response = await api.get(`/products/${productId}/variants`);
  const result = unwrap<ProductVariant[]>(response);
  return result ?? [];
}

export async function createProductVariantRequest(
  productId: string,
  payload: CreateProductVariantPayload,
): Promise<ProductVariant> {
  const response = await api.post(`/products/${productId}/variants`, payload);
  return unwrap<ProductVariant>(response);
}

export async function updateProductVariantRequest(
  productId: string,
  variantId: string,
  payload: UpdateProductVariantPayload,
): Promise<ProductVariant> {
  const response = await api.patch(`/products/${productId}/variants/${variantId}`, payload);
  return unwrap<ProductVariant>(response);
}

export async function deleteProductVariantRequest(productId: string, variantId: string): Promise<void> {
  await api.delete(`/products/${productId}/variants/${variantId}`);
}

export async function getAdminProductOptionGroupsRequest(productId: string): Promise<OptionGroup[]> {
  const response = await api.get(`/products/${productId}/option-groups`);
  const relations = unwrap<ProductOptionGroupRelation[]>(response);
  return mapRelationsToGroups(relations ?? []);
}

export async function getAdminProductOptionGroupRelationsRequest(productId: string): Promise<ProductOptionGroupRelation[]> {
  const response = await api.get(`/products/${productId}/option-groups`);
  const result = unwrap<ProductOptionGroupRelation[]>(response);
  return result ?? [];
}

export async function linkOptionGroupToProductRequest(
  productId: string,
  optionGroupId: string,
): Promise<ProductOptionGroupRelation> {
  const response = await api.post(`/products/${productId}/option-groups`, { optionGroupId });
  return unwrap<ProductOptionGroupRelation>(response);
}

export async function unlinkOptionGroupFromProductRequest(
  productId: string,
  relationId: string,
): Promise<void> {
  await api.delete(`/products/${productId}/option-groups/${relationId}`);
}
