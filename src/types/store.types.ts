export type StoreAvailability = {
  isOpen: boolean;
  label: 'Aberto' | 'Fechado';
  nextLabel: 'Fecha em' | 'Abre em' | null;
  scheduledIsOpen?: boolean | null;
  availabilityChangeAt?: string | null;
  availabilityUntil?: string | null;
  availabilityUpdatedAt?: string | null;
  remainingSeconds: number;
};

export type StoreAvailabilityDurationOption = {
  label: string;
  minutes: number;
};

export type UpdateStoreAvailabilityPayload = {
  isOpen: boolean;
  durationMinutes: number;
};

export type Store = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  whatsappNumber: string | null;
  ifoodUrl: string | null;
  pixKey: string | null;
  pixKeyType: string | null;
  rating: string | null;
  minDeliveryMinutes: number | null;
  maxDeliveryMinutes: number | null;
  minimumOrderAmount: string;
  isActive: boolean;
  isOpen?: boolean;
  scheduledIsOpen?: boolean | null;
  availabilityChangeAt?: string | null;
  availabilityUntil?: string | null;
  availabilityUpdatedAt?: string | null;
  availability?: StoreAvailability;
};

export type CreateStorePayload = {
  name: string;
  slug: string;
  logoUrl?: string | null;
  whatsappNumber?: string | null;
  ifoodUrl?: string | null;
  pixKey?: string | null;
  pixKeyType?: string | null;
  rating?: number | null;
  minDeliveryMinutes?: number | null;
  maxDeliveryMinutes?: number | null;
  minimumOrderAmount?: number | null;
  isActive?: boolean;
};

export type UpdateStorePayload = Partial<CreateStorePayload>;
