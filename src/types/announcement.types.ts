export type Announcement = {
  id: string;
  imageUrl: string;
  startAt: string;
  endAt: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateAnnouncementPayload = {
  imageUrl: string;
  startAt: string;
  endAt: string;
  isActive?: boolean;
};

export type UpdateAnnouncementPayload = Partial<CreateAnnouncementPayload>;
