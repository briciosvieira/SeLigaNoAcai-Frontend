import { getImageUrl } from '@/utils/image-url.util';
import { formatCurrency } from '@/utils/currency.util';
import { Gift, Tag } from 'lucide-react';
import type { CalculatePromotionsResult } from '@/types/promotion.types';

interface Props {
  promotionResult: CalculatePromotionsResult;
  isCalculatingPromotions: boolean;
  deliveryFee: number;
}

export function CartPromotionSummary({ promotionResult, isCalculatingPromotions, deliveryFee }: Props) {
  const { subtotal, discountAmount, freeItems, appliedPromotions, coupon, total } = promotionResult;
  const finalTotal = total + deliveryFee;
  const hasDiscount = discountAmount > 0;
  const hasFreeItems = freeItems.length > 0;
  const hasPromotions = hasDiscount || hasFreeItems;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Applied promotions */}
      {hasPromotions && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
            Promoções aplicadas
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {appliedPromotions.map((ap) => (
              <div key={ap.promotionId} style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag size={14} color="#22c55e" />
                  <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>{ap.name}</p>
                </div>
                {(ap.type === 'PERCENTAGE_DISCOUNT' || ap.type === 'COUPON_PERCENTAGE_DISCOUNT') && ap.discountPercent && (
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>
                    {ap.type === 'COUPON_PERCENTAGE_DISCOUNT' && ap.couponCode
                      ? `Cupom ${ap.couponCode} · ${Number(ap.discountPercent)}% de desconto`
                      : `${Number(ap.discountPercent)}% de desconto`}
                  </p>
                )}
                {ap.type === 'BUY_X_GET_Y' && (ap.freeQuantity ?? 0) > 0 && (
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>
                    {ap.freeQuantity} item{(ap.freeQuantity ?? 0) > 1 ? 'ns' : ''} grátis
                  </p>
                )}
                {ap.discountAmount > 0 && (
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#22c55e', marginTop: 4 }}>
                    Desconto: -{formatCurrency(ap.discountAmount)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Free items */}
      {hasFreeItems && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
            Você ganhou
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {freeItems.map((fi) => {
              const imgSrc = getImageUrl(fi.imageUrl);
              return (
                <div key={fi.productId + fi.promotionId} style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 10, alignItems: 'center', padding: 12, borderRadius: 14, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.22)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {imgSrc
                      ? <img src={imgSrc} alt={fi.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Gift size={20} color="var(--roxo-c)" />}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>{fi.productName}</p>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: 'rgba(168,85,247,0.25)', color: 'var(--roxo-c)', display: 'inline-block', marginTop: 3 }}>
                      Item promocional
                    </span>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                      Qtd: {fi.quantity} · por {fi.promotionName}
                    </p>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#22c55e', flexShrink: 0 }}>
                    R$ 0,00
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Coupon feedback */}
      {coupon && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 12, background: coupon.isApplied ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${coupon.isApplied ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag size={14} color={coupon.isApplied ? '#22c55e' : '#f87171'} />
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: coupon.isApplied ? '#22c55e' : '#f87171' }}>
              {coupon.isApplied ? `Cupom ${coupon.code} aplicado` : `Cupom ${coupon.code}`}
            </p>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{coupon.message}</p>
        </div>
      )}

      {/* Divider */}
      <hr style={{ borderColor: 'var(--border)', opacity: 0.4, marginBottom: 14 }} />

      {/* Summary rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--t2)', fontSize: '0.9rem' }}>
          <span>Subtotal</span>
          <span>
            {isCalculatingPromotions
              ? <span style={{ fontSize: '0.75rem', color: 'var(--t3)' }}>calculando…</span>
              : formatCurrency(subtotal)}
          </span>
        </div>

        {hasDiscount && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#22c55e', fontSize: '0.9rem', fontWeight: 700 }}>
            <span>Desconto promoção</span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--t2)', fontSize: '0.9rem' }}>
          <span>Taxa de entrega</span>
          <span>{deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}</span>
        </div>

        <hr style={{ borderColor: 'var(--border)', opacity: 0.4 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem' }}>
          <span>Total</span>
          <span style={{ color: 'var(--yellow)' }}>
            {isCalculatingPromotions
              ? <span style={{ fontSize: '0.85rem', color: 'var(--t2)' }}>calculando…</span>
              : formatCurrency(finalTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
