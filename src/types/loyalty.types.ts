export type LoyaltyCard = {
  id: string;
  customerId: string;
  stamps: number;
  maxStamps: number;
  rewardDescription?: string;
  isComplete: boolean;
  completedAt?: string;
  createdAt: string;
};

export type LoyaltyBenefit = {
  id: string;
  title: string;
  description: string;
  requiredStamps: number;
  isActive: boolean;
};
