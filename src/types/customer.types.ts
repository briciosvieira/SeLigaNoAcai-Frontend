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
