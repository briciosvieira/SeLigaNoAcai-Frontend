import { normalizeCouponCode } from '@/utils/coupon';
import '@/styles/cart-promotions.css';

type CartCouponBoxProps = {
  hasActiveCoupon: boolean;
  couponCode: string;
  appliedCouponCode: string | null;
  couponMessage: string | null;
  isCalculatingPromotions: boolean;
  onChangeCouponCode: (value: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
};

export function CartCouponBox({
  hasActiveCoupon,
  couponCode,
  appliedCouponCode,
  couponMessage,
  isCalculatingPromotions,
  onChangeCouponCode,
  onApplyCoupon,
  onRemoveCoupon,
}: CartCouponBoxProps) {
  if (!hasActiveCoupon) return null;

  if (appliedCouponCode) {
    return (
      <div className="cart-coupon-box">
        <p className="cart-coupon-title">Cupom aplicado</p>
        <div className="cart-coupon-applied">
          <span className="cart-coupon-applied-code">{appliedCouponCode}</span>
          <button className="cart-coupon-remove-button" onClick={onRemoveCoupon} type="button">
            Remover
          </button>
        </div>
        {couponMessage && (
          <p className="cart-coupon-message cart-coupon-message--applied">{couponMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div className="cart-coupon-box">
      <p className="cart-coupon-title">Tem um cupom?</p>
      <div className="cart-coupon-form">
        <input
          className="cart-coupon-input"
          type="text"
          value={couponCode}
          onChange={(e) => onChangeCouponCode(normalizeCouponCode(e.target.value))}
          placeholder="Digite o código"
          disabled={isCalculatingPromotions}
        />
        <button
          className="cart-coupon-button"
          type="button"
          onClick={onApplyCoupon}
          disabled={!couponCode.trim() || isCalculatingPromotions}
        >
          Aplicar
        </button>
      </div>
      {couponMessage && (
        <p className="cart-coupon-message cart-coupon-message--error">{couponMessage}</p>
      )}
    </div>
  );
}
