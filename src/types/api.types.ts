export type ApiResponse<T> = {
  data: T;
  meta?: unknown;
};

export type PaginatedMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginatedMeta;
};

export type ApiError = {
  message: string;
  statusCode: number;
  error?: string;
};
