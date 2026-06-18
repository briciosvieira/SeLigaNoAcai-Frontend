export type DeliveryZone = {
  id: string;
  storeId: string;
  neighborhood: string;
  city: string;
  state: string;
  deliveryFee: string;
  isAvailable: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateDeliveryZonePayload = {
  neighborhood: string;
  city: string;
  state: string;
  deliveryFee: string;
  isAvailable?: boolean;
  storeId: string;
};

export type UpdateDeliveryZonePayload = Partial<CreateDeliveryZonePayload>;
