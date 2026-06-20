import { create } from 'zustand';

type LoyaltyStoreState = {
  isEnabled: boolean | null;
  availableRewards: number;
  set: (patch: { isEnabled?: boolean | null; availableRewards?: number }) => void;
};

export const useLoyaltyStore = create<LoyaltyStoreState>((set) => ({
  isEnabled: null,
  availableRewards: 0,
  set: (patch) => set(patch),
}));
