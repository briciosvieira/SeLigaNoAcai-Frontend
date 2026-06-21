import type { DeliveryZone } from './delivery-zone.types';

export type AuthProvider = 'GOOGLE' | 'GUEST' | 'MANUAL';

export type CustomerMe = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
  authProvider?: AuthProvider | null;
  createdAt: string;
  updatedAt?: string;
  avatarUrl?: string | null;
  googleAvatarUrl?: string | null;
  customerCode?: string | null;
};

export type UpdateMePayload = {
  fullName?: string;
  phone?: string;
  avatarUrl?: string | null;
};

export type UpdateMyPasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type CustomerDefaultAddress = {
  id: string;
  customerId: string;
  deliveryZoneId: string | null;
  street: string | null;
  number: string | null;
  complement?: string | null;
  referencePoint?: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  isDefault: boolean;
  deliveryZone?: DeliveryZone | null;
};

export type UpsertDefaultAddressPayload = {
  deliveryZoneId: string;
  street: string;
  number: string;
  complement?: string | null;
  referencePoint?: string | null;
};

export type ProfileFormData = {
  fullName: string;
  phone: string;
  deliveryZoneId: string;
  street: string;
  number: string;
  complement: string;
  referencePoint: string;
};
