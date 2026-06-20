export type LoyaltySettings = {
  isEnabled: boolean;
  title: string;
  description?: string | null;
  cardImageUrl?: string | null;
  minOrderAmount: number | string;
  stampsRequired: number;
  rewardDescription: string;
};

export type LoyaltyCard = {
  customerId: string;
  customerName: string;
  stamps: number;
  availableRewards: number;
  totalEarnedStamps: number;
};

export type LoyaltyMeResponse = {
  settings: LoyaltySettings;
  card: LoyaltyCard;
  history?: LoyaltyHistoryItem[];
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
  customerEmail?: string | null;
  customerPhone?: string | null;
  stamps: number;
  availableRewards: number;
  totalEarnedStamps: number;
  history?: LoyaltyHistoryItem[];
};

export type AdminLoyaltyCustomerListItem = {
  customerId: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  stamps: number;
  availableRewards: number;
};
