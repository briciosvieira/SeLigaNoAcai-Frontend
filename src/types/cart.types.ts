export type CartItemOption = {
  optionGroupId: string;
  optionGroupName: string;
  optionId: string;
  optionName: string;
  additionalPrice: number;
};

export type CartItem = {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string | null;
  variantId?: string | null;
  variantName?: string | null;
  quantity: number;
  basePrice: number;
  optionsTotal: number;
  unitPrice: number;
  totalAmount: number;
  selectedOptions: CartItemOption[];
  notes?: string;
};
