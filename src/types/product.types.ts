export type Category = {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductVariant = {
  id: string;
  productId?: string;
  name: string;
  price: number | string;
  isActive: boolean;
  sortOrder?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductOption = {
  id: string;
  optionGroupId?: string;
  name: string;
  description?: string | null;
  emoji?: string | null;
  additionalPrice: number | string;
  isActive: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type OptionGroup = {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  selectionType?: string | null;
  minSelected: number;
  maxSelected: number;
  isRequired: boolean;
  isActive: boolean;
  displayOrder?: number;
  options?: ProductOption[];
  createdAt?: string;
  updatedAt?: string;
};

// Raw relation returned by GET /products/:id/option-groups
export type ProductOptionGroupRelation = {
  id: string;
  productId: string;
  optionGroupId: string;
  minSelected: number;
  maxSelected: number;
  isRequired: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
  optionGroup: OptionGroup;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  mobileImageUrl?: string | null;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
    slug?: string | null;
  } | null;
  basePrice: number | string;
  isActive: boolean;
  variants?: ProductVariant[];
  optionGroups?: OptionGroup[];
  createdAt: string;
  updatedAt: string;
};

export type CreateProductPayload = {
  name: string;
  slug: string;
  description?: string | null;
  categoryId: string;
  imageUrl?: string | null;
  mobileImageUrl?: string | null;
  basePrice: number;
  isActive?: boolean;
};

export type UpdateProductPayload = Partial<CreateProductPayload>;

export type CreateProductVariantPayload = {
  name: string;
  price: number;
  isActive?: boolean;
  sortOrder?: number;
};

export type UpdateProductVariantPayload = Partial<CreateProductVariantPayload>;

export type CreateOptionGroupPayload = {
  name: string;
  slug: string;
  selectionType: 'SINGLE' | 'MULTIPLE';
  description?: string | null;
  minSelected?: number;
  maxSelected?: number;
  isRequired?: boolean;
  isActive?: boolean;
};

export type UpdateOptionGroupPayload = Partial<CreateOptionGroupPayload>;

export type CreateProductOptionPayload = {
  optionGroupId: string;
  name: string;
  description?: string | null;
  additionalPrice: number;
  isActive?: boolean;
  displayOrder?: number;
};

export type UpdateProductOptionPayload = Partial<Omit<CreateProductOptionPayload, 'optionGroupId'>>;

export type AdminProductFilters = {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
};
