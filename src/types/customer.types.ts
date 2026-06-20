export type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpdateCustomerPayload = {
  name?: string;
  phone?: string;
  cpf?: string;
};

export type UpdateCustomerPasswordPayload = {
  newPassword: string;
};

export type AdminCustomer = {
  id: string;
  fullName?: string | null;
  email: string;
  phone?: string | null;
  cpf?: string | null;
  customerCode?: string | null;
  authProvider?: string | null;
  isGuest?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminCustomerFilters = {
  search?: string;
  isActive?: boolean;
};

export type UpdateAdminCustomerPayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  cpf?: string;
};

export type UpdateAdminCustomerStatusPayload = {
  isActive: boolean;
};

export type UpdateAdminCustomerPasswordPayload = {
  password: string;
};
