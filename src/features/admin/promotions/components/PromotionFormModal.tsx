import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { CreatePromotionPayload, Promotion, PromotionType } from '@/types/promotion.types';
import type { Product } from '@/types/product.types';
import { normalizeCouponCode } from '@/utils/coupon';

interface Props {
  promotion?: Promotion | null;
  products: Product[];
  isSaving: boolean;
  onSave: (payload: CreatePromotionPayload) => Promise<void>;
  onClose: () => void;
}

type FormErrors = Partial<Record<string, string>>;

function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 16);
}

function fromDatetimeLocal(local: string): string | null {
  if (!local) return null;
  return new Date(local).toISOString();
}

const defaultForm = {
  name: '',
  description: '',
  type: 'PERCENTAGE_DISCOUNT' as PromotionType,
  couponCode: '',
  buyProductId: '',
  buyQuantity: 1,
  rewardProductId: '',
  rewardQuantity: 1,
  discountPercent: '' as string | number,
  isActive: true,
  startsAt: '',
  endsAt: '',
};

export function PromotionFormModal({ promotion, products, isSaving, onSave, onClose }: Props) {
  const isEdit = !!promotion;
  const [form, setForm] = useState({ ...defaultForm });
  const [eligibleProductIds, setEligibleProductIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (promotion) {
      setForm({
        name: promotion.name ?? '',
        description: promotion.description ?? '',
        type: promotion.type,
        couponCode: promotion.couponCode ?? '',
        buyProductId: promotion.buyProductId ?? '',
        buyQuantity: promotion.buyQuantity ?? 1,
        rewardProductId: promotion.rewardProductId ?? '',
        rewardQuantity: promotion.rewardQuantity ?? 1,
        discountPercent: promotion.discountPercent != null ? Number(promotion.discountPercent) : '',
        isActive: promotion.isActive ?? true,
        startsAt: toDatetimeLocal(promotion.startsAt),
        endsAt: toDatetimeLocal(promotion.endsAt),
      });
      setEligibleProductIds(promotion.eligibleProducts?.map((ep) => ep.productId) ?? []);
    } else {
      setForm({ ...defaultForm });
      setEligibleProductIds([]);
    }
    setErrors({});
    setSubmitError(null);
  }, [promotion]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function toggleEligibleProduct(productId: string) {
    setEligibleProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = 'Nome é obrigatório.';
    if (!form.type) e.type = 'Tipo é obrigatório.';

    if (form.type === 'COUPON_PERCENTAGE_DISCOUNT') {
      if (!normalizeCouponCode(form.couponCode)) e.couponCode = 'Código do cupom é obrigatório.';
      const pct = Number(form.discountPercent);
      if (!form.discountPercent || isNaN(pct) || pct <= 0)
        e.discountPercent = 'Percentual deve ser maior que 0.';
      else if (pct > 100) e.discountPercent = 'Percentual não pode ser maior que 100.';
    } else {
      if (!form.buyProductId) e.buyProductId = 'Produto comprado é obrigatório.';
      if (!form.buyQuantity || Number(form.buyQuantity) < 1)
        e.buyQuantity = 'Quantidade mínima: 1.';

      if (form.type === 'BUY_X_GET_Y') {
        if (!form.rewardProductId) e.rewardProductId = 'Produto grátis é obrigatório.';
        if (!form.rewardQuantity || Number(form.rewardQuantity) < 1)
          e.rewardQuantity = 'Quantidade grátis mínima: 1.';
      }

      if (form.type === 'PERCENTAGE_DISCOUNT') {
        const pct = Number(form.discountPercent);
        if (!form.discountPercent || isNaN(pct) || pct <= 0)
          e.discountPercent = 'Percentual deve ser maior que 0.';
        else if (pct > 100) e.discountPercent = 'Percentual não pode ser maior que 100.';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError(null);

    let payload: CreatePromotionPayload;

    if (form.type === 'COUPON_PERCENTAGE_DISCOUNT') {
      payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        type: form.type,
        couponCode: normalizeCouponCode(form.couponCode),
        discountPercent: Number(form.discountPercent),
        eligibleProductIds: eligibleProductIds.length > 0 ? eligibleProductIds : undefined,
        isActive: form.isActive,
        startsAt: fromDatetimeLocal(form.startsAt),
        endsAt: fromDatetimeLocal(form.endsAt),
        buyProductId: null,
        rewardProductId: null,
        rewardQuantity: null,
      };
    } else {
      payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        type: form.type,
        couponCode: null,
        buyProductId: form.buyProductId,
        buyQuantity: Number(form.buyQuantity),
        isActive: form.isActive,
        startsAt: fromDatetimeLocal(form.startsAt),
        endsAt: fromDatetimeLocal(form.endsAt),
        ...(form.type === 'BUY_X_GET_Y'
          ? {
              rewardProductId: form.rewardProductId || null,
              rewardQuantity: Number(form.rewardQuantity),
              discountPercent: null,
            }
          : {
              rewardProductId: null,
              rewardQuantity: null,
              discountPercent: Number(form.discountPercent),
            }),
      };
    }

    try {
      await onSave(payload);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar promoção.';
      setSubmitError(msg);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 'var(--r-md)',
    border: '1px solid var(--c3)',
    background: 'var(--c2)',
    color: 'var(--txt)',
    fontSize: '0.875rem',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--t2)',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  };

  const errorStyle: React.CSSProperties = {
    fontSize: '0.72rem',
    color: '#f87171',
    marginTop: 4,
  };

  const fieldStyle: React.CSSProperties = { marginBottom: 16 };

  const isCoupon = form.type === 'COUPON_PERCENTAGE_DISCOUNT';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'var(--bg)',
          borderRadius: 'var(--r-lg)',
          width: '100%',
          maxWidth: 560,
          maxHeight: '90dvh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 20px',
            borderBottom: '1px solid var(--c3)',
            flexShrink: 0,
          }}
        >
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
            {isEdit ? 'Editar promoção' : 'Nova promoção'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {submitError && (
            <div
              style={{
                padding: '8px 12px',
                background: 'rgba(239,68,68,0.1)',
                color: '#f87171',
                borderRadius: 'var(--r-md)',
                fontSize: '0.82rem',
                marginBottom: 16,
                border: '1px solid rgba(239,68,68,0.25)',
              }}
            >
              {submitError}
            </div>
          )}

          {/* Name */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Nome da promoção *</label>
            <input
              style={{ ...inputStyle, borderColor: errors.name ? '#f87171' : 'var(--c3)' }}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ex: Compre 2 Açaí e ganhe 1"
              maxLength={100}
            />
            {errors.name && <p style={errorStyle}>{errors.name}</p>}
          </div>

          {/* Description */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Descrição</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 64 }}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Descrição opcional"
              maxLength={300}
            />
          </div>

          {/* Type */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Tipo de promoção *</label>
            <select
              style={{ ...inputStyle, borderColor: errors.type ? '#f87171' : 'var(--c3)' }}
              value={form.type}
              onChange={(e) => set('type', e.target.value as PromotionType)}
            >
              <option value="PERCENTAGE_DISCOUNT">Desconto percentual</option>
              <option value="BUY_X_GET_Y">Compre X e leve Y grátis</option>
              <option value="COUPON_PERCENTAGE_DISCOUNT">Cupom de desconto</option>
            </select>
            {errors.type && <p style={errorStyle}>{errors.type}</p>}
          </div>

          {/* COUPON_PERCENTAGE_DISCOUNT fields */}
          {isCoupon && (
            <>
              <div style={fieldStyle}>
                <label style={labelStyle}>Código do cupom *</label>
                <input
                  style={{
                    ...inputStyle,
                    borderColor: errors.couponCode ? '#f87171' : 'var(--c3)',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    fontWeight: 700,
                  }}
                  value={form.couponCode}
                  onChange={(e) => set('couponCode', normalizeCouponCode(e.target.value))}
                  placeholder="Ex: SELIGA10"
                  maxLength={30}
                />
                {errors.couponCode && <p style={errorStyle}>{errors.couponCode}</p>}
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Percentual de desconto (%) *</label>
                <input
                  type="number"
                  style={{ ...inputStyle, borderColor: errors.discountPercent ? '#f87171' : 'var(--c3)' }}
                  value={form.discountPercent}
                  onChange={(e) => set('discountPercent', e.target.value)}
                  min={1}
                  max={100}
                  step={0.01}
                  placeholder="Ex: 15"
                />
                {errors.discountPercent && <p style={errorStyle}>{errors.discountPercent}</p>}
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Produtos elegíveis (opcional)</label>
                <p style={{ fontSize: '0.75rem', color: 'var(--t3)', marginBottom: 10 }}>
                  Selecione os produtos que receberão o desconto. Se nenhum for selecionado, o cupom se aplica a todos.
                </p>
                <div
                  style={{
                    maxHeight: 220,
                    overflowY: 'auto',
                    border: '1px solid var(--c3)',
                    borderRadius: 'var(--r-md)',
                    padding: '4px 0',
                  }}
                >
                  {products.map((p) => (
                    <label
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        borderBottom: '1px solid var(--c3)',
                        opacity: p.isActive ? 1 : 0.5,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={eligibleProductIds.includes(p.id)}
                        onChange={() => toggleEligibleProduct(p.id)}
                        style={{ width: 15, height: 15, accentColor: 'var(--roxo-v)', cursor: 'pointer' }}
                      />
                      <span>
                        {p.name}
                        {!p.isActive && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--t3)', marginLeft: 6 }}>
                            (inativo)
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                  {products.length === 0 && (
                    <p style={{ padding: '12px', color: 'var(--t2)', fontSize: '0.82rem', textAlign: 'center' }}>
                      Nenhum produto disponível.
                    </p>
                  )}
                </div>
                {eligibleProductIds.length > 0 && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--roxo-c)', marginTop: 6, fontWeight: 600 }}>
                    {eligibleProductIds.length} produto{eligibleProductIds.length !== 1 ? 's' : ''} selecionado{eligibleProductIds.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Buy product — not shown for coupon */}
          {!isCoupon && (
            <div style={fieldStyle}>
              <label style={labelStyle}>Produto comprado *</label>
              <select
                style={{ ...inputStyle, borderColor: errors.buyProductId ? '#f87171' : 'var(--c3)' }}
                value={form.buyProductId}
                onChange={(e) => set('buyProductId', e.target.value)}
              >
                <option value="">— Selecione um produto —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {!p.isActive ? ' (inativo)' : ''}
                  </option>
                ))}
              </select>
              {errors.buyProductId && <p style={errorStyle}>{errors.buyProductId}</p>}
            </div>
          )}

          {/* Buy quantity — not shown for coupon */}
          {!isCoupon && (
            <div style={fieldStyle}>
              <label style={labelStyle}>Quantidade mínima de compra *</label>
              <input
                type="number"
                style={{ ...inputStyle, borderColor: errors.buyQuantity ? '#f87171' : 'var(--c3)' }}
                value={form.buyQuantity}
                onChange={(e) => set('buyQuantity', Number(e.target.value))}
                min={1}
                step={1}
              />
              {errors.buyQuantity && <p style={errorStyle}>{errors.buyQuantity}</p>}
            </div>
          )}

          {/* BUY_X_GET_Y fields */}
          {form.type === 'BUY_X_GET_Y' && (
            <>
              <div style={fieldStyle}>
                <label style={labelStyle}>Produto grátis *</label>
                <select
                  style={{ ...inputStyle, borderColor: errors.rewardProductId ? '#f87171' : 'var(--c3)' }}
                  value={form.rewardProductId}
                  onChange={(e) => set('rewardProductId', e.target.value)}
                >
                  <option value="">— Selecione um produto —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {!p.isActive ? ' (inativo)' : ''}
                    </option>
                  ))}
                </select>
                {errors.rewardProductId && <p style={errorStyle}>{errors.rewardProductId}</p>}
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Quantidade grátis *</label>
                <input
                  type="number"
                  style={{ ...inputStyle, borderColor: errors.rewardQuantity ? '#f87171' : 'var(--c3)' }}
                  value={form.rewardQuantity}
                  onChange={(e) => set('rewardQuantity', Number(e.target.value))}
                  min={1}
                  step={1}
                />
                {errors.rewardQuantity && <p style={errorStyle}>{errors.rewardQuantity}</p>}
              </div>
            </>
          )}

          {/* PERCENTAGE_DISCOUNT fields */}
          {form.type === 'PERCENTAGE_DISCOUNT' && (
            <div style={fieldStyle}>
              <label style={labelStyle}>Percentual de desconto (%) *</label>
              <input
                type="number"
                style={{ ...inputStyle, borderColor: errors.discountPercent ? '#f87171' : 'var(--c3)' }}
                value={form.discountPercent}
                onChange={(e) => set('discountPercent', e.target.value)}
                min={1}
                max={100}
                step={0.01}
                placeholder="Ex: 15"
              />
              {errors.discountPercent && <p style={errorStyle}>{errors.discountPercent}</p>}
            </div>
          )}

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Data de início</label>
              <input
                type="datetime-local"
                style={inputStyle}
                value={form.startsAt}
                onChange={(e) => set('startsAt', e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Data de término</label>
              <input
                type="datetime-local"
                style={inputStyle}
                value={form.endsAt}
                onChange={(e) => set('endsAt', e.target.value)}
              />
            </div>
          </div>

          {/* Is active */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <input
              type="checkbox"
              id="promo-active"
              checked={form.isActive}
              onChange={(e) => set('isActive', e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--roxo-v)' }}
            />
            <label htmlFor="promo-active" style={{ fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600 }}>
              Promoção ativa
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--c3)',
                background: 'var(--c2)',
                color: 'var(--t2)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                flex: 2,
                padding: '10px',
                borderRadius: 'var(--r-md)',
                border: 'none',
                background: 'var(--roxo-v)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              {isSaving ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar promoção'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
