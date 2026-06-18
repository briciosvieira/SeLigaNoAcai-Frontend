export type PromotionType =
  | 'BUY_X_GET_Y'
  | 'PERCENTAGE_DISCOUNT'
  | 'COUPON_PERCENTAGE_DISCOUNT';

export type PromotionProduct = {
  id: string;
  name: string;
  imageUrl?: string | null;
  basePrice?: number | string | null;
  isActive?: boolean;
};

export type PromotionEligibleProduct = {
  id: string;
  promotionId: string;
  productId: string;
  product: PromotionProduct;
  createdAt?: string;
};

export type Promotion = {
  id: string;
  name: string;
  description?: string | null;
  type: PromotionType;

  couponCode?: string | null;

  buyProductId?: string | null;
  buyQuantity: number;

  rewardProductId?: string | null;
  rewardQuantity?: number | null;

  discountPercent?: number | string | null;

  eligibleProducts?: PromotionEligibleProduct[];

  isActive: boolean;

  startsAt?: string | null;
  endsAt?: string | null;

  createdAt: string;
  updatedAt: string;

  buyProduct?: PromotionProduct | null;
  rewardProduct?: PromotionProduct | null;
};

export type CreatePromotionPayload = {
  name: string;
  description?: string | null;
  type: PromotionType;

  couponCode?: string | null;

  buyProductId?: string | null;
  buyQuantity?: number;

  rewardProductId?: string | null;
  rewardQuantity?: number | null;

  discountPercent?: number | null;

  eligibleProductIds?: string[];

  isActive?: boolean;

  startsAt?: string | null;
  endsAt?: string | null;
};

export type UpdatePromotionPayload = Partial<CreatePromotionPayload>;

export type UpdatePromotionStatusPayload = {
  isActive: boolean;
};

export type CalculatePromotionItemPayload = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type CalculatePromotionsPayload = {
  couponCode?: string;
  items: CalculatePromotionItemPayload[];
};

export type AppliedPromotion = {
  promotionId: string;
  name: string;
  type: PromotionType;
  buyProductId?: string | null;
  rewardProductId?: string | null;
  couponCode?: string | null;
  discountPercent?: number | null;
  discountAmount: number;
  freeQuantity?: number;
};

export type PromotionFreeItem = {
  productId: string;
  productName: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  promotionId: string;
  promotionName: string;
};

export type CouponCalculationResult = {
  code: string;
  isApplied: boolean;
  message: string;
  eligibleAmount?: number;
  discountPercent?: number;
};

export type CalculatePromotionsResult = {
  subtotal: number;
  discountAmount: number;
  freeItems: PromotionFreeItem[];
  appliedPromotions: AppliedPromotion[];
  coupon: CouponCalculationResult | null;
  total: number;
};

export type CouponAvailabilityResult = {
  hasActiveCoupon: boolean;
};
