
export type OrderStatus =
  | 'CREATED'
  | 'AWAITING_PAYMENT'
  | 'PAID'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELED'
  | 'EXPIRED';

export type PaymentMethod =
  | 'PIX'
  | 'CASH_ON_DELIVERY'
  | 'CARD_ON_DELIVERY';

/* ── Order creation DTOs (match backend CreateOrderDto) ── */

export type CreateOrderCustomer = {
  fullName: string;
  phone: string;
  email?: string;
  cpf?: string;
};

export type CreateOrderAddress = {
  street: string;
  number: string;
  complement?: string;
  referencePoint?: string;
};

export type CreateOrderItem = {
  productId: string;
  variantId?: string;
  quantity: number;
  optionIds?: string[];
  notes?: string;
};

export type PixPaymentData = {
  id?: string;
  orderId?: string;
  pixQrCode: string | null;
  pixCopyPaste: string | null;
  pixExpiresAt: string | null;
  status?: string;
  amount?: string;
};

export type PaymentDetails = {
  id?: string;
  orderId?: string;
  method?: string;
  status?: string;
  amount?: number | string | null;
  amountPaid?: number | string | null;
  txid?: string | null;
  providerEndToEndId?: string | null;
  endToEndId?: string | null;
  payerName?: string | null;
  payerDocument?: string | null;
  payerDocumentMasked?: string | null;
  payerBank?: string | null;
  paidAt?: string | null;
  expiresAt?: string | null;
};

/* ── Order item returned by GET /orders/my-orders/:id ── */
export type OrderItem = {
  id?: string;
  productName?: string | null;
  variantName?: string | null;
  quantity: number;
  unitPrice?: number | string | null;
  totalAmount?: number | string | null;
  selectedOptions?: Array<{
    optionName?: string | null;
    optionGroupName?: string | null;
    price?: number | string | null;
  }>;
  notes?: string | null;
};

/* ── Customer-facing order ── */
export type Order = {
  id: string;
  orderNumber: string;
  orderStatus?: OrderStatus;
  status?: OrderStatus;
  paymentMethod?: PaymentMethod | string | null;
  paymentStatus?: PaymentStatus | string | null;
  payment?: PaymentDetails | null;
  payments?: PaymentDetails[];
  items?: OrderItem[];
  itemsCount?: number | null;
  subtotalAmount?: number | string | null;
  subtotal?: number | string | null;
  discountAmount?: number | string | null;
  deliveryFee?: number | string | null;
  totalAmount?: number | string | null;
  total?: number | string | null;
  deliveryZoneId?: string | null;
  deliveryZoneName?: string | null;
  neighborhood?: string | null;
  customerName?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderPayload = {
  customer: CreateOrderCustomer;
  address?: CreateOrderAddress | null;
  items: CreateOrderItem[];
  deliveryZoneId?: string | null;
  paymentMethod: PaymentMethod;
  changeForAmount?: number;
  notes?: string;
};

/* ── Admin order types ── */
export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  customerName?: string | null;
  customerPhone?: string | null;
  totalAmount?: number | string | null;
  total?: number | string | null;
  finalAmount?: number | string | null;
  orderTotal?: number | string | null;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod | string | null;
  itemsCount?: number | null;
  createdAt: string;
  updatedAt?: string;
};

export type AdminOrderItem = {
  id: string;
  productName?: string | null;
  variantName?: string | null;
  quantity: number;
  unitPrice?: number | string | null;
  totalAmount?: number | string | null;
  selectedOptions?: Array<{
    optionName?: string | null;
    optionGroupName?: string | null;
    price?: number | string | null;
  }>;
  observations?: string | null;
};

// ── PIX sync result types ─────────────────────────────────────────────────

export type PixSyncResult = {
  paymentId?: string;
  orderId?: string;
  txid?: string;
  previousStatus?: string;
  currentStatus?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payment?: any;
  message?: string;
};

export type AdminPixSyncResult = {
  success?: boolean;
  checked?: number;
  paid?: number;
  stillPending?: number;
  failed?: number;
  items?: PixSyncResult[];
  message?: string;
};

export type AdminOrderDetail = AdminOrderListItem & {
  customer?: {
    id: string;
    fullName?: string | null;
    phone?: string | null;
    email?: string | null;
    cpf?: string | null;
  } | null;
  items?: AdminOrderItem[];
  deliveryAddress?: string | null;
  neighborhood?: string | null;
  deliveryFee?: number | string | null;
  subtotal?: number | string | null;
  notes?: string | null;
  payment?: PaymentDetails | null;
  payments?: PaymentDetails[];
};
