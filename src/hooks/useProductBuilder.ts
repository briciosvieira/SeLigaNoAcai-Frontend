import { useState, useMemo } from 'react';
import { getProductByIdRequest, getProductVariantsRequest, getProductOptionGroupsRequest } from '@/services/catalog.service';
import type { Product, ProductVariant, OptionGroup, ProductOption } from '@/types/product.types';
import type { CartItem, CartItemOption } from '@/types/cart.types';

export type SelectedProductOption = {
  optionGroupId: string;
  optionId: string;
  groupName: string;
  optionName: string;
  additionalPrice: number;
};

export function getGroupOptions(group: any): any[] {
  if (Array.isArray(group?.options)) return group.options;
  if (Array.isArray(group?.productOptions)) return group.productOptions;
  if (Array.isArray(group?.items)) return group.items;
  return [];
}

export function getGroupMinSelected(group: any): number {
  const rawValue = group?.minSelected ?? group?.minSelections ?? group?.minimumSelected ?? group?.min ?? 0;
  const value = Number(rawValue);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function getGroupMaxSelected(group: any, optionsCount: number): number {
  const rawValue = group?.maxSelected ?? group?.maxSelections ?? group?.maximumSelected ?? group?.max;
  const value = Number(rawValue);
  if (Number.isFinite(value) && value > 0) return value;
  return optionsCount;
}

export function useProductBuilder() {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<SelectedProductOption[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function openProduct(productId: string) {
    setIsOpen(true);
    setIsLoading(true);
    setProduct(null);
    setVariants([]);
    setOptionGroups([]);
    setSelectedOptions([]);
    setSelectedVariantId(null);
    setQuantity(1);
    setNotes('');

    try {
      const [productResult, variantResult, groupResult] = await Promise.allSettled([
        getProductByIdRequest(productId),
        getProductVariantsRequest(productId),
        getProductOptionGroupsRequest(productId),
      ]);
      if (productResult.status === 'fulfilled') setProduct(productResult.value);
      if (variantResult.status === 'fulfilled') setVariants(variantResult.value ?? []);
      if (groupResult.status === 'fulfilled') {
        const activeGroups = (groupResult.value ?? []).filter((g) => g.isActive);
        setOptionGroups(activeGroups);
      }
    } finally {
      setIsLoading(false);
    }
  }

  function closeProduct() {
    setIsOpen(false);
    setProduct(null);
    setVariants([]);
    setOptionGroups([]);
    setSelectedOptions([]);
  }

  function toggleOption(group: OptionGroup, option: ProductOption) {
    const groupId = String(group.id);
    const optionId = String(option.id);

    const groupName = group.name ?? 'Grupo';
    const optionName = option.name ?? 'Opção';

    const options = getGroupOptions(group);
    const maxSelected = getGroupMaxSelected(group, options.length);

    const additionalPrice = Number(option.additionalPrice ?? option.price ?? 0);

    setSelectedOptions((current) => {
      const alreadySelected = current.some(
        (selected) => selected.optionGroupId === groupId && selected.optionId === optionId
      );

      if (alreadySelected) {
        return current.filter(
          (selected) => !(selected.optionGroupId === groupId && selected.optionId === optionId)
        );
      }

      const selectedInGroup = current.filter((selected) => selected.optionGroupId === groupId);

      const newOption = {
        optionGroupId: groupId,
        optionId,
        groupName,
        optionName,
        additionalPrice: Number.isFinite(additionalPrice) ? additionalPrice : 0,
      };

      if (maxSelected === 1) {
        return [...current.filter((selected) => selected.optionGroupId !== groupId), newOption];
      }

      if (selectedInGroup.length >= maxSelected) {
        return current;
      }

      return [...current, newOption];
    });
  }

  const validationError = useMemo(() => {
    const activeVariants = variants.filter((v) => v.isActive);
    if (activeVariants.length > 0 && !selectedVariantId) {
      return 'Escolha o tamanho antes de continuar.';
    }

    for (const group of optionGroups) {
      const minSelected = getGroupMinSelected(group);
      if (minSelected <= 0) continue;

      const selectedInGroup = selectedOptions.filter((s) => s.optionGroupId === String(group.id));
      if (selectedInGroup.length < minSelected) {
        return `Escolha pelo menos ${minSelected} opção(ões) em "${group.name}".`;
      }
    }

    return null;
  }, [variants, selectedVariantId, optionGroups, selectedOptions]);

  const basePrice = useMemo(() => {
    if (selectedVariantId) {
      const variant = variants.find((v) => v.id === selectedVariantId);
      if (variant) return Number(variant.price) || 0;
    }
    return Number(product?.basePrice ?? 0) || 0;
  }, [selectedVariantId, variants, product]);

  const optionsTotal = useMemo(
    () => selectedOptions.reduce((acc, opt) => acc + opt.additionalPrice, 0),
    [selectedOptions],
  );

  const unitPrice = basePrice + optionsTotal;
  const totalPrice = unitPrice * quantity;

  function buildCartItem(): CartItem | null {
    if (!product) return null;

    const cartItemOptions: CartItemOption[] = selectedOptions.map(opt => ({
      optionGroupId: opt.optionGroupId,
      optionGroupName: opt.groupName,
      optionId: opt.optionId,
      optionName: opt.optionName,
      additionalPrice: opt.additionalPrice,
    }));

    const selectedVariant = variants.find((v) => v.id === selectedVariantId);

    return {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productImageUrl: product.imageUrl,
      variantId: selectedVariantId,
      variantName: selectedVariant?.name ?? null,
      quantity,
      basePrice,
      optionsTotal,
      unitPrice,
      totalAmount: totalPrice,
      selectedOptions: cartItemOptions,
      notes: notes.trim() || undefined,
    };
  }

  return {
    isOpen,
    product,
    variants,
    optionGroups,
    selectedVariantId,
    setSelectedVariantId,
    selectedOptions,
    toggleOption,
    quantity,
    setQuantity,
    notes,
    setNotes,
    isLoading,
    basePrice,
    optionsTotal,
    unitPrice,
    totalPrice,
    validationError,
    openProduct,
    closeProduct,
    buildCartItem,
  };
}
