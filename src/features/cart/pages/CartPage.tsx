import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useCartPromotions } from '@/hooks/useCartPromotions';
import { CartPromotionSummary } from '../components/CartPromotionSummary';
import { CartCouponBox } from '../components/CartCouponBox';
import { CheckoutFlowModal } from '@/features/checkout/components/CheckoutFlowModal';
import { useCatalog } from '@/hooks/useCatalog';
import { useStoreAvailabilityCountdown } from '@/hooks/useStoreAvailabilityCountdown';
import { formatRemainingTime } from '@/utils/time';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/currency.util';
import { resolveImageUrl, getImageUrl } from '@/utils/image-url.util';
import { ShoppingCart, Trash2, Plus, Minus, Gift } from 'lucide-react';
import { getStoreIsOpen } from '@/components/store/StoreAvailabilityBadge';
import './CartPage.css';

export function CartPage() {
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const { items, deliveryFee, increaseItem, decreaseItem, removeItem, clearCart } = useCart();
  const {
    promotionResult, isCalculatingPromotions, freeItems, promotionalTotal,
    hasActiveCoupon, couponCode, setCouponCode, appliedCouponCode,
    applyCoupon, removeCoupon, couponMessage,
  } = useCartPromotions();

  const { store, loadStore } = useCatalog();
  const remainingSeconds = useStoreAvailabilityCountdown(
    store?.availability?.remainingSeconds ?? 0,
    () => void loadStore(),
  );
  const isStoreClosed = store ? !getStoreIsOpen(store) : false;

  useEffect(() => {
    loadStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finalTotal = promotionalTotal + deliveryFee;

  if (items.length === 0 && !showCheckout) {
    return (
      <EmptyState
        icon={<ShoppingCart size={56} />}
        title="Seu carrinho está vazio"
        description="Adicione produtos do cardápio para continuar"
        action={<Button onClick={() => navigate('/')}>Ver cardápio</Button>}
      />
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ padding: '24px 16px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Meu Carrinho</h1>
        <button
          onClick={clearCart}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '999px', cursor: 'pointer', color: 'var(--t2)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
        >
          <Trash2 size={14} /> Limpar
        </button>
      </div>

      {/* Regular items */}
      <ul style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((item) => {
          const imgSrc = resolveImageUrl(item.productImageUrl);
          return (
            <li key={item.id} style={{ background: 'var(--surface)', borderRadius: '20px', padding: 16, display: 'flex', gap: 16, border: '1px solid var(--border)', backdropFilter: 'blur(8px)' }}>
              <div className="cart-item-image-frame">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={item.productName}
                    className="cart-item-image"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const f = e.currentTarget.parentElement;
                      if (f) f.classList.add('cart-item-image-frame--fallback');
                    }}
                  />
                ) : (
                  <span className="cart-item-image-placeholder" aria-hidden="true">🍧</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 4, color: '#fff' }}>{item.productName}</p>
                {item.variantName && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--purple-soft)', marginBottom: 2 }}>
                    Tamanho: {item.variantName}
                  </p>
                )}
                {item.selectedOptions && item.selectedOptions.length > 0 && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--t2)', marginBottom: 2 }}>
                    Adicionais: {item.selectedOptions.map((o) => o.optionName).join(', ')}
                  </p>
                )}
                {item.notes && <p style={{ fontSize: '0.75rem', color: 'var(--t2)', fontStyle: 'italic', marginTop: 4 }}>{item.notes}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12 }}>
                  <span style={{ fontWeight: 800, color: 'var(--yellow)', fontSize: '1.05rem' }}>
                    {formatCurrency(item.totalAmount)}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-strong)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <button onClick={() => decreaseItem(item.id)} style={{ width: 36, height: 36, borderRadius: '12px 0 0 12px', background: 'transparent', border: 'none', color: 'var(--txt)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Minus size={16} />
                      </button>
                      <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center', fontSize: '0.95rem' }}>{item.quantity}</span>
                      <button onClick={() => increaseItem(item.id)} style={{ width: 36, height: 36, borderRadius: '0 12px 12px 0', background: 'transparent', border: 'none', color: 'var(--txt)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus size={16} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id)} style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', borderRadius: '12px', width: 36, height: 36, cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 4, transition: 'background 0.2s' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}

        {/* Free items (read-only) */}
        {freeItems.map((fi) => {
          const imgSrc = getImageUrl(fi.imageUrl);
          return (
            <li key={fi.productId + fi.promotionId} style={{ background: 'var(--surface)', borderRadius: '20px', padding: 16, display: 'flex', gap: 16, border: '1px solid rgba(168,85,247,0.3)', backdropFilter: 'blur(8px)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--roxo-v), transparent)' }} />
              <div className="cart-item-image-frame cart-item-image-frame--gift">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={fi.productName}
                    className="cart-item-image"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const f = e.currentTarget.parentElement;
                      if (f) f.classList.add('cart-item-image-frame--fallback');
                    }}
                  />
                ) : (
                  <Gift size={28} color="var(--roxo-c)" />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <p style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>{fi.productName}</p>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(168,85,247,0.2)', color: 'var(--roxo-c)', border: '1px solid rgba(168,85,247,0.3)', whiteSpace: 'nowrap' }}>
                    Item promocional
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--t2)', marginBottom: 8 }}>por {fi.promotionName}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: '#22c55e', fontSize: '1.05rem' }}>R$ 0,00</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--t2)', background: 'var(--surface-strong)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--border)' }}>
                    Qtd: {fi.quantity}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Cupom */}
      <div style={{ margin: '24px 16px 0' }}>
        <CartCouponBox
          hasActiveCoupon={hasActiveCoupon}
          couponCode={couponCode}
          appliedCouponCode={appliedCouponCode}
          couponMessage={couponMessage}
          isCalculatingPromotions={isCalculatingPromotions}
          onChangeCouponCode={setCouponCode}
          onApplyCoupon={applyCoupon}
          onRemoveCoupon={removeCoupon}
        />
      </div>

      {/* Resumo com promoções */}
      <div style={{ margin: '8px 16px 0', background: 'var(--surface)', borderRadius: '24px', padding: 24, border: '1px solid var(--border)', backdropFilter: 'blur(8px)' }}>
        <CartPromotionSummary
          promotionResult={promotionResult}
          isCalculatingPromotions={isCalculatingPromotions}
          deliveryFee={deliveryFee}
        />
      </div>

    {isStoreClosed && (
      <div style={{ margin: '16px 16px 0', padding: '14px 16px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', textAlign: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
        A loja está fechada no momento.
        {remainingSeconds > 0 && (
          <span style={{ display: 'block', marginTop: 4, fontSize: '0.8rem', fontWeight: 600, color: 'rgba(248, 113, 113, 0.8)' }}>
            {store?.availability?.nextLabel || 'Abre em'} {formatRemainingTime(remainingSeconds)}
          </span>
        )}
      </div>
    )}

      <div style={{ padding: '24px 16px 0' }}>
        <button
          type="button"
          onClick={() => setShowCheckout(true)}
        disabled={isStoreClosed}
          style={{
            width: '100%', padding: '16px', borderRadius: '16px',
            border: 'none', background: 'var(--purple)',
            color: '#fff', fontWeight: 800, fontSize: '1.05rem',
          cursor: isStoreClosed ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', transition: 'all 0.2s',
          opacity: isStoreClosed ? 0.6 : 1,
            boxShadow: '0 8px 24px rgba(157, 47, 224, 0.25)',
          }}
        >
          Comprar · {isCalculatingPromotions ? '…' : formatCurrency(finalTotal)}
        </button>
      </div>

      {showCheckout && (
        <CheckoutFlowModal
          onClose={() => setShowCheckout(false)}
          promotionalTotal={promotionalTotal}
        />
      )}
    </div>
  );
}
