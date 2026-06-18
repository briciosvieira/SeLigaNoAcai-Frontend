export type Banner = {
  id: string;
  imageUrl: string;
  tabletImageUrl: string | null;
  mobileImageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateBannerPayload = {
  imageUrl: string;
  tabletImageUrl?: string;
  mobileImageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdateBannerPayload = Partial<CreateBannerPayload>;

export type UpdateBannerStatusPayload = {
  isActive: boolean;
};

export type UploadBannerResponse = {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
};
