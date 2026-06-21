export type LoyaltyCardStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'REDEEMED';

export type LoyaltySettings = {
  id?: string;
  isEnabled: boolean;
  title: string;
  description?: string | null;
  cardImageUrl?: string | null;
  minOrderAmount: number | string;
  stampsRequired: number;
  rewardDescription: string;
  validityMonths?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type LoyaltyCurrentCard = {
  id: string;
  status: LoyaltyCardStatus | string;
  stamps: number;
  stampsRequired: number;
  minOrderAmount?: string | number | null;
  rewardDescription?: string | null;
  startedAt?: string | null;
  expiresAt?: string | null;
  completedAt?: string | null;
  redeemedAt?: string | null;
  createdAt?: string | null;
};

export type LoyaltyMeResponse = {
  settings: LoyaltySettings;
  currentCard?: LoyaltyCurrentCard | null;
  previousCards?: LoyaltyCurrentCard[];
  availableRewards?: number;
  customerName?: string | null;
};

export type LoyaltyHistoryItem = {
  id: string;
  type: string;
  quantity: number;
  reason?: string | null;
  createdAt: string;
};

export type AdminLoyaltyCustomer = {
  customerId: string;
  customerName: string;
  /* new API uses email/phone without "customer" prefix */
  email?: string | null;
  phone?: string | null;
  /* legacy fallback */
  customerEmail?: string | null;
  customerPhone?: string | null;
  avatarUrl?: string | null;
  googleAvatarUrl?: string | null;
  customerCode?: string | null;
  stamps: number;
  availableRewards: number;
  totalEarnedStamps: number;
  history?: LoyaltyHistoryItem[];
  currentCard?: LoyaltyCurrentCard | null;
  previousCards?: LoyaltyCurrentCard[];
};

export type AdminLoyaltyCustomerListItem = {
  id?: string;
  customerId: string;
  customerName: string;
  /* new API */
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  googleAvatarUrl?: string | null;
  customerCode?: string | null;
  /* legacy fallback */
  customerEmail?: string | null;
  customerPhone?: string | null;
  stamps: number;
  availableRewards: number;
  totalEarnedStamps?: number;
};
