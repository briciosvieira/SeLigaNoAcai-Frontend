import { api } from './api';
import type {
  Category,
  Product,
  OptionGroup,
  ProductVariant,
  ProductOptionGroupRelation,
} from '@/types/product.types';

function unwrap<T>(response: { data: { data?: T } | T }): T {
  const r = response.data as { data?: T };
  return (r.data ?? response.data) as T;
}

function mapRelationsToGroups(relations: ProductOptionGroupRelation[]): OptionGroup[] {
  return relations.map((rel) => ({
    ...rel.optionGroup,
    minSelected: rel.minSelected,
    maxSelected: rel.maxSelected,
    isRequired: rel.isRequired,
  }));
}

export async function getCategoriesRequest(): Promise<Category[]> {
  const response = await api.get('/categories');
  const result = unwrap<Category[]>(response);
  return result ?? [];
}

export async function getProductsRequest(): Promise<Product[]> {
  const response = await api.get('/products');
  const result = unwrap<Product[]>(response);
  return result ?? [];
}

export async function getProductByIdRequest(id: string): Promise<Product> {
  const response = await api.get(`/products/${id}`);
  return unwrap<Product>(response);
}

export async function getProductVariantsRequest(productId: string): Promise<ProductVariant[]> {
  const response = await api.get(`/products/${productId}/variants`);
  const result = unwrap<ProductVariant[]>(response);
  return result ?? [];
}

export async function getProductOptionGroupsRequest(productId: string): Promise<OptionGroup[]> {
  const response = await api.get(`/products/${productId}/option-groups`);
  const relations = unwrap<ProductOptionGroupRelation[]>(response);
  return mapRelationsToGroups(relations ?? []);
}
