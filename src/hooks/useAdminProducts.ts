import { useState, useMemo } from 'react';
import {
  getAdminProductsRequest,
  getAdminProductByIdRequest,
  createProductRequest,
  updateProductRequest,
  deleteProductRequest,
  getAdminProductVariantsRequest,
  createProductVariantRequest,
  updateProductVariantRequest,
  deleteProductVariantRequest,
  getAdminProductOptionGroupRelationsRequest,
  linkOptionGroupToProductRequest,
  unlinkOptionGroupFromProductRequest,
} from '@/services/admin-products.service';
import { getCategoriesRequest } from '@/services/catalog.service';
import { uploadProductImageRequest } from '@/services/uploads.service';
import { getOptionGroupsRequest } from '@/services/options.service';
import type {
  Product,
  ProductVariant,
  OptionGroup,
  ProductOptionGroupRelation,
  Category,
  CreateProductPayload,
  UpdateProductPayload,
  CreateProductVariantPayload,
  UpdateProductVariantPayload,
} from '@/types/product.types';

export type AdminStatusFilter = 'all' | 'active' | 'inactive';
export type AdminTypeFilter = 'all' | 'combo' | 'product';

function normalizeStr(value?: string | null): string {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function isCategoryCombo(categories: Category[], categoryId: string | null): boolean {
  if (!categoryId) return false;
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) return false;
  const n = normalizeStr(cat.name);
  const s = normalizeStr(cat.slug);
  return n.includes('combo') || s.includes('combo');
}

export function useAdminProducts() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [productRelations, setProductRelations] = useState<ProductOptionGroupRelation[]>([]);
  const [allOptionGroups, setAllOptionGroups] = useState<OptionGroup[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminStatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<AdminTypeFilter>('all');

  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLinkingSaving, setIsLinkingSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const products = useMemo(() => {
    return allProducts.filter((p) => {
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const match =
          p.name.toLowerCase().includes(s) ||
          (p.description?.toLowerCase().includes(s) ?? false) ||
          (p.slug?.toLowerCase().includes(s) ?? false);
        if (!match) return false;
      }
      if (categoryFilter && p.categoryId !== categoryFilter) return false;
      if (statusFilter === 'active' && !p.isActive) return false;
      if (statusFilter === 'inactive' && p.isActive) return false;
      if (typeFilter !== 'all') {
        const combo = isCategoryCombo(categories, p.categoryId);
        if (typeFilter === 'combo' && !combo) return false;
        if (typeFilter === 'product' && combo) return false;
      }
      return true;
    });
  }, [allProducts, searchTerm, categoryFilter, statusFilter, typeFilter, categories]);

  async function loadProducts() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminProductsRequest();
      setAllProducts(data ?? []);
    } catch {
      setError('Erro ao carregar produtos');
      setAllProducts([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await getCategoriesRequest();
      setCategories(data ?? []);
    } catch {}
  }

  async function loadAllOptionGroups() {
    try {
      const data = await getOptionGroupsRequest();
      setAllOptionGroups(data ?? []);
    } catch {}
  }

  async function openProductDetail(id: string) {
    setIsDetailLoading(true);
    try {
      const product = await getAdminProductByIdRequest(id);
      setSelectedProduct(product);
      const [variantResult, relationsResult] = await Promise.allSettled([
        getAdminProductVariantsRequest(id),
        getAdminProductOptionGroupRelationsRequest(id),
      ]);
      setVariants(variantResult.status === 'fulfilled' ? (variantResult.value ?? []) : []);
      setProductRelations(relationsResult.status === 'fulfilled' ? (relationsResult.value ?? []) : []);
      loadAllOptionGroups();
    } catch {
      setSelectedProduct(null);
    } finally {
      setIsDetailLoading(false);
    }
  }

  function closeProductDetail() {
    setSelectedProduct(null);
    setVariants([]);
    setProductRelations([]);
  }

  async function uploadProductImage(file: File): Promise<string | null> {
    setIsUploading(true);
    try {
      const result = await uploadProductImageRequest(file);
      return result.url ?? null;
    } catch {
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  async function createProduct(payload: CreateProductPayload) {
    setIsSaving(true);
    try {
      await createProductRequest(payload);
      await loadProducts();
    } finally {
      setIsSaving(false);
    }
  }

  async function updateProduct(id: string, payload: UpdateProductPayload) {
    setIsSaving(true);
    try {
      await updateProductRequest(id, payload);
      await loadProducts();
      if (selectedProduct?.id === id) {
        const updated = await getAdminProductByIdRequest(id);
        setSelectedProduct(updated);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProduct(id: string) {
    setIsSaving(true);
    try {
      await deleteProductRequest(id);
      setSelectedProduct(null);
      setVariants([]);
      setProductRelations([]);
      await loadProducts();
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleProductStatus(id: string, isActive: boolean) {
    await updateProductRequest(id, { isActive });
    setAllProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive } : p)));
    if (selectedProduct?.id === id) {
      setSelectedProduct((prev) => (prev ? { ...prev, isActive } : null));
    }
  }

  async function loadProductVariants(productId: string) {
    try {
      const data = await getAdminProductVariantsRequest(productId);
      setVariants(data ?? []);
    } catch {}
  }

  async function createVariant(productId: string, payload: CreateProductVariantPayload) {
    await createProductVariantRequest(productId, payload);
    await loadProductVariants(productId);
  }

  async function updateVariant(productId: string, variantId: string, payload: UpdateProductVariantPayload) {
    await updateProductVariantRequest(productId, variantId, payload);
    await loadProductVariants(productId);
  }

  async function deleteVariant(productId: string, variantId: string) {
    await deleteProductVariantRequest(productId, variantId);
    await loadProductVariants(productId);
  }

  async function linkOptionGroup(productId: string, optionGroupId: string): Promise<void> {
    setIsLinkingSaving(true);
    try {
      await linkOptionGroupToProductRequest(productId, optionGroupId);
      const data = await getAdminProductOptionGroupRelationsRequest(productId);
      setProductRelations(data ?? []);
    } finally {
      setIsLinkingSaving(false);
    }
  }

  async function unlinkOptionGroup(productId: string, relationId: string): Promise<void> {
    setProductRelations((prev) => prev.filter((r) => r.id !== relationId));
    try {
      await unlinkOptionGroupFromProductRequest(productId, relationId);
      const data = await getAdminProductOptionGroupRelationsRequest(productId);
      setProductRelations(data ?? []);
    } catch (err) {
      const data = await getAdminProductOptionGroupRelationsRequest(productId).catch(() => null);
      if (data !== null) setProductRelations(data);
      throw err;
    }
  }

  return {
    products,
    allProducts,
    selectedProduct,
    categories,
    productRelations,
    allOptionGroups,
    variants,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    isLoading,
    isDetailLoading,
    isSaving,
    isUploading,
    isLinkingSaving,
    error,
    loadProducts,
    loadCategories,
    openProductDetail,
    closeProductDetail,
    uploadProductImage,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    loadProductVariants,
    createVariant,
    updateVariant,
    deleteVariant,
    linkOptionGroup,
    unlinkOptionGroup,
  };
}
