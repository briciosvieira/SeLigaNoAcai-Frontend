export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export type AdminPermission =
  | 'MANAGE_DASHBOARD'
  | 'MANAGE_ORDERS'
  | 'MANAGE_PRODUCTS'
  | 'MANAGE_PAYMENTS'
  | 'MANAGE_CUSTOMERS'
  | 'MANAGE_LOYALTY'
  | 'MANAGE_STORE'
  | 'MANAGE_DELIVERY_ZONES'
  | 'MANAGE_UPLOADS'
  | 'MANAGE_USERS';

export const adminPermissionLabels: Record<AdminPermission, string> = {
  MANAGE_DASHBOARD:       'Dashboard',
  MANAGE_ORDERS:          'Pedidos',
  MANAGE_PRODUCTS:        'Produtos',
  MANAGE_PAYMENTS:        'Pagamentos',
  MANAGE_CUSTOMERS:       'Clientes',
  MANAGE_LOYALTY:         'Fidelidade',
  MANAGE_STORE:           'Loja',
  MANAGE_DELIVERY_ZONES:  'Bairros / Taxas',
  MANAGE_UPLOADS:         'Uploads',
  MANAGE_USERS:           'Usuários',
};

export const ALL_ADMIN_PERMISSIONS: AdminPermission[] = [
  'MANAGE_DASHBOARD',
  'MANAGE_ORDERS',
  'MANAGE_PRODUCTS',
  'MANAGE_PAYMENTS',
  'MANAGE_CUSTOMERS',
  'MANAGE_LOYALTY',
  'MANAGE_STORE',
  'MANAGE_DELIVERY_ZONES',
  'MANAGE_UPLOADS',
  'MANAGE_USERS',
];

export type AdminUser = {
  id: string;
  customerCode: string | null;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  cpf?: string | null;
  role: UserRole;
  permissions: AdminPermission[];
  authProvider: string;
  isGuest: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DashboardSummary = {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
};

export type CreateAdminUserPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: 'STAFF' | 'ADMIN';
  permissions: AdminPermission[];
};

export type UpdateAdminUserPayload = {
  fullName?: string;
  phone?: string;
};

export type UpdateAdminUserRolePayload = {
  role: UserRole;
};

export type UpdateAdminUserStatusPayload = {
  isActive: boolean;
};

export type UpdateAdminUserPermissionsPayload = {
  permissions: AdminPermission[];
};
