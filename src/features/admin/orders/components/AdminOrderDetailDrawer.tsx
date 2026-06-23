import { useState } from 'react';
import { X, User, MapPin, ShoppingBag, CreditCard, RefreshCw, Phone } from 'lucide-react';
import { formatBRL, getOrderTotal } from '@/utils/currency.util';
import { formatDateTime } from '@/utils/date.util';
import type { AdminOrderDetail, OrderStatus, PaymentStatus } from '@/types/order.types';

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  CREATED: 'Criado',
  AWAITING_PAYMENT: 'Aguardando pagamento',
  PAID: 'Pago',
  PREPARING: 'Em preparo',
  OUT_FOR_DELIVERY: 'Saiu para entrega',
  DELIVERED: 'Entregue',
  CANCELED: 'Cancelado',
};

const ORDER_STATUS_COLOR: Record<OrderStatus, { bg: string; color: string }> = {
  CREATED:          { bg: 'rgba(150,150,150,0.15)', color: '#aaa' },
  AWAITING_PAYMENT: { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
  PAID:             { bg: 'rgba(76,175,80,0.15)',    color: '#4caf50' },
  PREPARING:        { bg: 'rgba(139,92,246,0.15)',   color: 'var(--roxo-c)' },
  OUT_FOR_DELIVERY: { bg: 'rgba(59,130,246,0.15)',   color: '#60a5fa' },
  DELIVERED:        { bg: 'rgba(76,175,80,0.15)',    color: '#4caf50' },
  CANCELED:         { bg: 'rgba(239,68,68,0.15)',    color: '#f87171' },
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  FAILED: 'Falhou',
  CANCELED: 'Cancelado',
  EXPIRED: 'Expirado',
};

const PAYMENT_STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  PENDING:  { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  PAID:     { bg: 'rgba(76,175,80,0.15)',  color: '#4caf50' },
  FAILED:   { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  CANCELED: { bg: 'rgba(150,150,150,0.15)', color: '#aaa' },
  EXPIRED:  { bg: 'rgba(150,150,150,0.15)', color: '#aaa' },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  PIX: 'PIX',
  CASH_ON_DELIVERY: 'Dinheiro na entrega',
  CARD_ON_DELIVERY: 'Cartão na entrega',
};

type StatusAction = { label: string; status: OrderStatus; bg: string };

function getStatusActions(status: OrderStatus): StatusAction[] {
  if (status === 'CREATED' || status === 'AWAITING_PAYMENT' || status === 'PAID') {
    return [
      { label: 'Iniciar preparo', status: 'PREPARING', bg: 'var(--roxo-v)' },
      { label: 'Cancelar pedido', status: 'CANCELED', bg: '#ef4444' },
    ];
  }
  if (status === 'PREPARING') {
    return [
      { label: 'Saiu para entrega', status: 'OUT_FOR_DELIVERY', bg: '#3b82f6' },
      { label: 'Cancelar pedido', status: 'CANCELED', bg: '#ef4444' },
    ];
  }
  if (status === 'OUT_FOR_DELIVERY') {
    return [
      { label: 'Marcar como entregue', status: 'DELIVERED', bg: '#4caf50' },
      { label: 'Cancelar pedido', status: 'CANCELED', bg: '#ef4444' },
    ];
  }
  return [];
}

function buildWhatsAppUrl(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const withCode = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${withCode}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNeighborhood(order: any): string | null {
  return (
    order?.deliveryZone?.neighborhood ??
    order?.deliveryZone?.name ??
    order?.neighborhood ??
    order?.deliveryNeighborhood ??
    order?.address?.neighborhood ??
    order?.customerAddress?.neighborhood ??
    order?.customer?.neighborhood ??
    order?.customer?.address?.neighborhood ??
    null
  );
}

type Props = {
  order: AdminOrderDetail | null;
  isLoading: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: OrderStatus) => Promise<void>;
  onUpdatePaymentStatus: (id: string, status: PaymentStatus) => Promise<void>;
  onSyncOnePixPayment?: (paymentId: string) => Promise<void>;
  syncingPaymentId?: string | null;
};

export function AdminOrderDetailDrawer({ order, isLoading, onClose, onUpdateStatus, onUpdatePaymentStatus, onSyncOnePixPayment, syncingPaymentId }: Props) {
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  if (!order && !isLoading) return null;

  const isVisible = !!order || isLoading;

  async function handleStatus(status: OrderStatus) {
    if (!order) return;
    setPendingAction(status);
    try { await onUpdateStatus(order.id, status); }
    finally { setPendingAction(null); }
  }

  async function handlePayment(status: PaymentStatus) {
    if (!order) return;
    setPendingAction('payment');
    try { await onUpdatePaymentStatus(order.id, status); }
    finally { setPendingAction(null); }
  }

  const total = order ? getOrderTotal(order) : 0;
  const deliveryFee = order ? Number(order.deliveryFee ?? 0) : 0;
  const subtotal = order ? Number(order.subtotal ?? (total - deliveryFee)) : 0;
  const customerName = order?.customerName ?? order?.customer?.fullName ?? 'Cliente não informado';
  const customerPhone = order?.customerPhone ?? order?.customer?.phone ?? null;
  const customerEmail = order?.customer?.email ?? null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const neighborhood = getNeighborhood(order as any);
  const orderStatusColors = order ? (ORDER_STATUS_COLOR[order.orderStatus] ?? ORDER_STATUS_COLOR.CREATED) : ORDER_STATUS_COLOR.CREATED;
  const paymentStatusColors = order ? (PAYMENT_STATUS_COLOR[order.paymentStatus] ?? PAYMENT_STATUS_COLOR.PENDING) : PAYMENT_STATUS_COLOR.PENDING;
  const statusActions = order ? getStatusActions(order.orderStatus) : [];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          zIndex: 198, opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.25s',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: 500,
        background: 'var(--bg)',
        borderLeft: '1px solid var(--c3)',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
        zIndex: 199,
        display: 'flex', flexDirection: 'column',
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Header fixo */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid var(--c3)',
          background: 'var(--c1)', flexShrink: 0,
        }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--t2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Pedido</p>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              {order ? `#${order.orderNumber}` : '—'}
            </h2>
            {order && (
              <p style={{ fontSize: '0.75rem', color: 'var(--t2)', marginTop: 2 }}>{formatDateTime(order.createdAt)}</p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t2)', padding: 8, display: 'flex' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--t2)' }}>
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginRight: 10 }} />
              Carregando...
            </div>
          )}

          {order && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Status badges */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  padding: '4px 12px', borderRadius: 'var(--r-full)', fontSize: '0.78rem', fontWeight: 700,
                  background: orderStatusColors.bg, color: orderStatusColors.color,
                  border: `1px solid ${orderStatusColors.color}33`,
                }}>
                  {ORDER_STATUS_LABEL[order.orderStatus] ?? order.orderStatus}
                </span>
                <span style={{
                  padding: '4px 12px', borderRadius: 'var(--r-full)', fontSize: '0.78rem', fontWeight: 700,
                  background: paymentStatusColors.bg, color: paymentStatusColors.color,
                  border: `1px solid ${paymentStatusColors.color}33`,
                }}>
                  {PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}
                </span>
              </div>

              {/* Cliente / Entrega — tudo no topo */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span style={{ color: 'var(--roxo-c)' }}><User size={15} /></span>
                  <span style={{ color: 'var(--roxo-c)' }}><MapPin size={15} /></span>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Cliente / Entrega
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <InfoRow label="Nome" value={customerName} />
                  {customerPhone && (
                    <PhoneRow phone={customerPhone} label="Telefone" />
                  )}
                  {customerEmail && <InfoRow label="E-mail" value={customerEmail} />}
                  {order.customer?.cpf && <InfoRow label="CPF" value={order.customer.cpf} />}
                  {neighborhood && <WideInfoRow label="Bairro" value={neighborhood} />}
                  {order.deliveryFee != null && (
                    <WideInfoRow label="Taxa de entrega" value={formatBRL(deliveryFee)} />
                  )}
                  {order.street && <WideInfoRow label="Rua / Avenida" value={order.street} />}
                  {order.addressNumber && <WideInfoRow label="Número" value={order.addressNumber} />}
                  {order.complement && <WideInfoRow label="Complemento" value={order.complement} />}
                  {order.apartment && <WideInfoRow label="Apto / Bloco" value={order.apartment} />}
                  {order.referencePoint && <WideInfoRow label="Ponto de referência" value={order.referencePoint} />}
                  {order.deliveryAddress && !order.street && (
                    <WideInfoRow label="Endereço" value={order.deliveryAddress} />
                  )}
                </div>
              </div>

              {/* Itens */}
              <Section icon={<ShoppingBag size={15} />} title={`Itens${order.items?.length ? ` (${order.items.length})` : ''}`}>
                {(!order.items || order.items.length === 0) ? (
                  <p style={{ color: 'var(--t2)', fontSize: '0.82rem' }}>Nenhum item disponível</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {order.items.map((item) => (
                      <div key={item.id} style={{ borderBottom: '1px solid var(--c3)', paddingBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                              {item.quantity}× {item.productName ?? '—'}
                              {item.variantName && (
                                <span style={{ fontWeight: 400, color: 'var(--t2)', marginLeft: 4 }}>({item.variantName})</span>
                              )}
                            </p>
                            {item.selectedOptions && item.selectedOptions.length > 0 && (
                              <ul style={{ marginTop: 4, paddingLeft: 12 }}>
                                {item.selectedOptions.map((opt, idx) => (
                                  <li key={idx} style={{ fontSize: '0.78rem', color: 'var(--t2)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>+ {opt.optionName ?? opt.optionGroupName ?? '—'}</span>
                                    {opt.price && Number(opt.price) > 0 && (
                                      <span>{formatBRL(opt.price)}</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {item.observations && (
                              <p style={{ fontSize: '0.75rem', color: 'var(--am)', marginTop: 4, fontStyle: 'italic' }}>
                                Obs: {item.observations}
                              </p>
                            )}
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                            {formatBRL(item.totalAmount ?? (Number(item.unitPrice ?? 0) * item.quantity))}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Pagamento */}
              <Section icon={<CreditCard size={15} />} title="Pagamento">
                <InfoRow label="Método" value={PAYMENT_METHOD_LABEL[order.paymentMethod as string] ?? order.paymentMethod ?? '—'} />
                <InfoRow label="Status" value={PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus} />
                {(() => {
                  const pmt = order.payment ?? order.payments?.[0] ?? null;
                  if (!pmt) return null;
                  const endToEndId = pmt.providerEndToEndId ?? pmt.endToEndId ?? null;
                  return (
                    <>
                      {pmt.amountPaid != null && (
                        <InfoRow label="Valor pago" value={formatBRL(Number(pmt.amountPaid))} />
                      )}
                      {pmt.paidAt && (
                        <InfoRow label="Pago em" value={formatDateTime(pmt.paidAt)} />
                      )}
                      {pmt.payerName && (
                        <InfoRow label="Pagador" value={pmt.payerName} />
                      )}
                      {(pmt.payerDocumentMasked || pmt.payerDocument) && (
                        <InfoRow label="Documento" value={pmt.payerDocumentMasked ?? pmt.payerDocument ?? ''} />
                      )}
                      {pmt.payerBank && (
                        <InfoRow label="Banco" value={pmt.payerBank} />
                      )}
                      {pmt.txid && (
                        <div style={{ display: 'flex', gap: 8, fontSize: '0.875rem' }}>
                          <span style={{ color: 'var(--t2)', minWidth: 70, flexShrink: 0 }}>TXID:</span>
                          <span style={{ color: 'var(--txt)', fontWeight: 500, wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                            {pmt.txid}
                          </span>
                        </div>
                      )}
                      {endToEndId && (
                        <div style={{ display: 'flex', gap: 8, fontSize: '0.875rem' }}>
                          <span style={{ color: 'var(--t2)', minWidth: 70, flexShrink: 0 }}>E2E ID:</span>
                          <span style={{ color: 'var(--txt)', fontWeight: 500, wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                            {endToEndId}
                          </span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </Section>

              {/* Totais */}
              <div style={{ background: 'var(--c1)', border: '1px solid var(--c3)', borderRadius: 'var(--r-md)', padding: '14px 16px' }}>
                {order.subtotal != null && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--t2)', marginBottom: 6 }}>
                    <span>Subtotal</span>
                    <span>{formatBRL(subtotal)}</span>
                  </div>
                )}
                {order.deliveryFee != null && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--t2)', marginBottom: 8 }}>
                    <span>Taxa de entrega</span>
                    <span>{formatBRL(deliveryFee)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', borderTop: '1px solid var(--c3)', paddingTop: 8 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--am)' }}>{formatBRL(total)}</span>
                </div>
              </div>

              {/* Observações */}
              {order.notes && (
                <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--r-md)', padding: '10px 14px' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>Observações</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--txt)' }}>{order.notes}</p>
                </div>
              )}

              {/* Ações */}
              {(() => {
                const isPix = String(order.paymentMethod ?? '').toUpperCase() === 'PIX';
                const isPending = String(order.paymentStatus ?? '').toUpperCase() === 'PENDING';
                const pixPaymentId = order.payment?.id ?? order.payments?.[0]?.id ?? null;
                const showPixSync = isPix && isPending && !!pixPaymentId && !!onSyncOnePixPayment;
                const showActions = statusActions.length > 0 || order.paymentStatus === 'PENDING' || showPixSync;

                if (!showActions) return null;

                return (
                  <div style={{ borderTop: '1px solid var(--c3)', paddingTop: 16 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Ações</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {showPixSync && (
                        <ActionButton
                          label={syncingPaymentId === pixPaymentId ? 'Consultando...' : 'Consultar PIX deste pedido'}
                          bg="#15803d"
                          loading={syncingPaymentId === pixPaymentId}
                          disabled={!!pendingAction || syncingPaymentId === pixPaymentId}
                          onClick={() => void onSyncOnePixPayment(pixPaymentId!)}
                        />
                      )}
                      {order.paymentStatus === 'PENDING' && (
                        <ActionButton
                          label="Confirmar pagamento"
                          bg="#4caf50"
                          loading={pendingAction === 'payment'}
                          disabled={!!pendingAction || !!syncingPaymentId}
                          onClick={() => handlePayment('PAID')}
                        />
                      )}
                      {statusActions.map((action) => (
                        <ActionButton
                          key={action.status}
                          label={action.label}
                          bg={action.bg}
                          loading={pendingAction === action.status}
                          disabled={!!pendingAction || !!syncingPaymentId}
                          onClick={() => handleStatus(action.status)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{ color: 'var(--roxo-c)' }}>{icon}</span>
        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: '0.875rem' }}>
      <span style={{ color: 'var(--t2)', minWidth: 70, flexShrink: 0 }}>{label}:</span>
      <span style={{ color: 'var(--txt)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function WideInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: '0.875rem' }}>
      <span style={{ color: 'var(--t2)', minWidth: 130, flexShrink: 0 }}>{label}:</span>
      <span style={{ color: 'var(--txt)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function PhoneRow({ phone, label }: { phone: string; label: string }) {
  const whatsappUrl = buildWhatsAppUrl(phone);
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: '0.875rem', alignItems: 'center' }}>
      <span style={{ color: 'var(--t2)', minWidth: 70, flexShrink: 0 }}>{label}:</span>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: '#25d366',
          fontWeight: 700,
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        <Phone size={13} />
        {phone}
      </a>
    </div>
  );
}

function ActionButton({ label, bg, loading, disabled, onClick }: {
  label: string; bg: string; loading: boolean; disabled: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '11px 16px',
        background: disabled && !loading ? 'var(--c3)' : bg,
        border: 'none', borderRadius: 'var(--r-md)',
        color: '#fff', fontWeight: 700, fontSize: '0.875rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled && !loading ? 0.6 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'opacity 0.15s',
      }}
    >
      {loading && <RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} />}
      {label}
    </button>
  );
}
