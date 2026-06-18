import { useState, useMemo } from 'react';
import { getProductByIdRequest, getProductVariantsRequest, getProductOptionGroupsRequest } from '@/services/catalog.service';
import { validateSelectedOptions } from '@/utils/options-validation.util';
import { calculateOptionsTotal } from '@/utils/cart-pricing.util';
import type { Product, ProductVariant, OptionGroup } from '@/types/product.types';
import type { CartItem, CartItemOption } from '@/types/cart.types';

export function useProductBuilder() {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedOptionsByGroup, setSelectedOptionsByGroup] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function openProduct(productId: string) {
    setIsOpen(true);
    setIsLoading(true);
    setProduct(null);
    setVariants([]);
    setOptionGroups([]);
    setSelectedOptionsByGroup({});
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
    setSelectedOptionsByGroup({});
  }

  function toggleOption(groupId: string, optionId: string, maxSelected: number) {
    setSelectedOptionsByGroup((prev) => {
      const current = prev[groupId] ?? [];
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      }
      if (maxSelected === 1) {
        return { ...prev, [groupId]: [optionId] };
      }
      if (current.length >= maxSelected) {
        return prev;
      }
      return { ...prev, [groupId]: [...current, optionId] };
    });
  }

  const validationError = useMemo(
    () => validateSelectedOptions(optionGroups, selectedOptionsByGroup),
    [optionGroups, selectedOptionsByGroup],
  );

  const basePrice = useMemo(() => {
    if (selectedVariantId) {
      const variant = variants.find((v) => v.id === selectedVariantId);
      if (variant) return Number(variant.price) || 0;
    }
    return Number(product?.basePrice ?? 0) || 0;
  }, [selectedVariantId, variants, product]);

  const optionsTotal = useMemo(
    () => calculateOptionsTotal(optionGroups, selectedOptionsByGroup),
    [optionGroups, selectedOptionsByGroup],
  );

  const unitPrice = basePrice + optionsTotal;
  const totalPrice = unitPrice * quantity;

  function buildCartItem(): CartItem | null {
    if (!product) return null;

    const selectedOptions: CartItemOption[] = [];
    for (const group of optionGroups) {
      const selectedIds = selectedOptionsByGroup[group.id] ?? [];
      for (const option of group.options ?? []) {
        if (selectedIds.includes(option.id)) {
          selectedOptions.push({
            optionGroupId: group.id,
            optionGroupName: group.name,
            optionId: option.id,
            optionName: option.name,
            additionalPrice: Number(option.additionalPrice ?? 0),
          });
        }
      }
    }

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
      selectedOptions,
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
    selectedOptionsByGroup,
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
