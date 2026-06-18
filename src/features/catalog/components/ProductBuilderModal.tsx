import { X, Plus, Minus, ShoppingCart, Image as ImageIcon } from 'lucide-react';
import { formatBRL } from '@/utils/currency.util';
import { getImageUrl } from '@/utils/image-url.util';
import type { useProductBuilder } from '@/hooks/useProductBuilder';
import type { OptionGroup } from '@/types/product.types';
import { isComboProduct } from '../pages/HomePage';

type Builder = ReturnType<typeof useProductBuilder>;

interface Props {
  builder: Builder;
  onAddToCart: () => void;
}

export function ProductBuilderModal({ builder, onAddToCart }: Props) {
  const {
    isOpen, product, variants, optionGroups, isLoading,
    selectedVariantId, setSelectedVariantId,
    selectedOptionsByGroup, toggleOption,
    quantity, setQuantity,
    notes, setNotes,
    basePrice, totalPrice,
    validationError,
    closeProduct,
  } = builder;

  if (!isOpen) return null;

  const imgSrc       = getImageUrl(product?.imageUrl);
  const mobileImgSrc = getImageUrl(product?.mobileImageUrl ?? product?.imageUrl);
  const isCombo = product ? isComboProduct(product) : false;

  return (
    <>
      <div className="pm-overlay" onClick={closeProduct}>
        <div className="pm-modal" onClick={(e) => e.stopPropagation()}>

          <button className="pm-close" onClick={closeProduct} aria-label="Fechar">
            <X size={17} />
          </button>

          {isLoading ? (
            <div className="pm-loading">Carregando produto…</div>
          ) : product ? (
            <>
              {/* Painel da imagem */}
              <div className="pm-image-panel">
                {imgSrc ? (
                  <>
                    <img src={imgSrc}       alt={product.name} className="pm-image pm-img--desktop" />
                    <img src={mobileImgSrc ?? imgSrc} alt={product.name} className="pm-image pm-img--mobile" />
                  </>
                ) : (
                  <div className="pm-image-empty">
                    <ImageIcon size={52} color="rgba(255,255,255,0.12)" />
                  </div>
                )}
                {isCombo && <span className="pm-combo-badge">Combo</span>}
              </div>

              {/* Painel de conteúdo */}
              <div className="pm-content">
                <div className="pm-body">
                  <h2 className="pm-title">{product.name}</h2>
                  {product.description && !isCombo && (
                    <p className="pm-desc">{product.description}</p>
                  )}
                  <p className="pm-price">{formatBRL(basePrice)}</p>

                  {isCombo ? (
                    <div className="pm-combo-box">
                      <span className="pm-combo-box-label">O que vem no combo</span>
                      <p className="pm-combo-box-text">
                        {product.description || 'Descrição não informada.'}
                      </p>
                      <p className="pm-combo-box-note">Este combo já vem montado.</p>
                    </div>
                  ) : (
                    <>
                      {variants.length > 0 && (
                        <Section title="Escolha o tamanho" required={false}>
                          {variants.filter((v) => v.isActive).map((variant) => {
                            const sel = selectedVariantId === variant.id;
                            return (
                              <VariantItem
                                key={variant.id}
                                label={variant.name}
                                price={Number(variant.price)}
                                selected={sel}
                                onToggle={() => setSelectedVariantId(sel ? null : variant.id)}
                              />
                            );
                          })}
                        </Section>
                      )}

                      {optionGroups.map((group) => (
                        <OptionGroupSection
                          key={group.id}
                          group={group}
                          selectedIds={selectedOptionsByGroup[group.id] ?? []}
                          validationError={validationError}
                          onToggle={(optionId) => toggleOption(group.id, optionId, group.maxSelected)}
                        />
                      ))}
                    </>
                  )}

                  <div className="pm-notes">
                    <p className="pm-notes-label">Alguma observação?</p>
                    <textarea
                      className="pm-notes-input"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: sem leite condensado, pouco açúcar…"
                    />
                  </div>
                </div>

                <div className="pm-footer">
                  <div className="pm-qty">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Diminuir">
                      <Minus size={15} />
                    </button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} aria-label="Aumentar">
                      <Plus size={15} />
                    </button>
                  </div>

                  <div className="pm-footer-total">
                    <span className="pm-footer-total-label">Total</span>
                    <span className="pm-footer-total-value">{formatBRL(totalPrice)}</span>
                  </div>

                  <button
                    className="pm-add-btn"
                    onClick={onAddToCart}
                    disabled={!isCombo && !!validationError}
                  >
                    <ShoppingCart size={16} />
                    Adicionar
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <style>{`
        .pm-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(4, 1, 10, 0.84);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          animation: pm-fade-in 0.16s ease;
        }
        @keyframes pm-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .pm-modal {
          position: relative;
          display: grid;
          grid-template-columns: 320px 1fr;
          width: min(860px, calc(100vw - 40px));
          height: min(680px, 88vh);
          border-radius: 5px;
          overflow: hidden;
          background: #0e0419;
          border: 1px solid rgba(192, 132, 252, 0.13);
          box-shadow:
            0 40px 100px rgba(0, 0, 0, 0.8),
            0 0 0 1px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          animation: pm-scale-in 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes pm-scale-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }

        /* Botão fechar */
        .pm-close {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 20;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: background 0.15s, transform 0.15s;
        }
        .pm-close:hover {
          background: rgba(0, 0, 0, 0.85);
          transform: scale(1.06);
        }

        /* Painel da imagem */
        .pm-image-panel {
          position: relative;
          overflow: hidden;
          background: radial-gradient(ellipse at 50% 40%, rgba(120, 40, 200, 0.18) 0%, transparent 65%),
                      linear-gradient(160deg, #1e0b30 0%, #0a0217 100%);
        }
        .pm-img--mobile               { display: none; }
        .pm-img--desktop              { display: block; }
        .pm-image.pm-img--desktop     { object-fit: contain; }
        .pm-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .pm-image-empty {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pm-combo-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          background: linear-gradient(135deg, #9d2fe0, #6b21a8);
          color: #fff;
          font-size: 0.6rem;
          font-weight: 800;
          padding: 5px 12px;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          box-shadow: 0 4px 14px rgba(157, 47, 224, 0.55);
        }

        /* Painel de conteúdo */
        .pm-content {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-left: 1px solid rgba(255, 255, 255, 0.05);
        }

        /* Corpo com scroll */
        .pm-body {
          flex: 1;
          overflow-y: auto;
          padding: 26px 24px 0;
          scrollbar-width: thin;
          scrollbar-color: rgba(192, 132, 252, 0.22) transparent;
        }
        .pm-body::-webkit-scrollbar { width: 4px; }
        .pm-body::-webkit-scrollbar-track { background: transparent; }
        .pm-body::-webkit-scrollbar-thumb {
          background: rgba(192, 132, 252, 0.3);
          border-radius: 4px;
        }

        .pm-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: #fff;
          line-height: 1.25;
          margin: 0 0 6px;
          letter-spacing: -0.01em;
        }
        .pm-desc {
          font-size: 0.825rem;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.55;
          margin: 0 0 12px;
        }
        .pm-price {
          font-size: 1.3rem;
          font-weight: 800;
          color: #ffe100;
          margin: 0 0 20px;
          letter-spacing: -0.02em;
        }

        /* Combo */
        .pm-combo-box {
          background: rgba(157, 47, 224, 0.08);
          border: 1px solid rgba(192, 132, 252, 0.16);
          border-radius: 5px;
          padding: 14px 16px;
          margin-bottom: 18px;
        }
        .pm-combo-box-label {
          display: block;
          font-size: 0.67rem;
          font-weight: 800;
          color: #c084fc;
          text-transform: uppercase;
          letter-spacing: 0.9px;
          margin-bottom: 7px;
        }
        .pm-combo-box-text {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
          margin: 0;
        }
        .pm-combo-box-note {
          font-size: 0.73rem;
          color: rgba(255, 255, 255, 0.38);
          margin: 8px 0 0;
          font-style: italic;
        }

        /* Section */
        .pm-section { margin-bottom: 20px; }
        .pm-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .pm-section-title {
          font-size: 0.7rem;
          font-weight: 800;
          color: rgba(192, 132, 252, 0.75);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0;
        }
        .pm-section-required {
          font-size: 0.58rem;
          font-weight: 800;
          padding: 3px 9px;
          border-radius: 999px;
          background: rgba(157, 47, 224, 0.1);
          color: #c084fc;
          border: 1px solid rgba(192, 132, 252, 0.18);
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .pm-section-hint {
          font-size: 0.76rem;
          color: rgba(255, 255, 255, 0.4);
          margin: -4px 0 8px;
        }
        .pm-section-items {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .pm-option-error {
          margin-top: 6px;
          color: #ff7b7b;
          font-size: 0.77rem;
          font-weight: 700;
        }

        /* Variante */
        .pm-variant {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 13px;
          border-radius: 5px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          width: 100%;
          transition: background 0.15s, border-color 0.15s;
        }
        .pm-variant.selected {
          border-color: rgba(192, 132, 252, 0.65);
          background: rgba(157, 47, 224, 0.13);
        }
        .pm-variant:hover:not(.selected) {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(255, 255, 255, 0.13);
        }

        /* Opção */
        .pm-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 13px;
          border-radius: 5px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          width: 100%;
          transition: background 0.15s, border-color 0.15s;
          text-align: left;
        }
        .pm-option.selected {
          border-color: rgba(192, 132, 252, 0.65);
          background: rgba(157, 47, 224, 0.13);
        }
        .pm-option:hover:not(.selected):not(:disabled) {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(255, 255, 255, 0.13);
        }
        .pm-option:disabled { opacity: 0.42; cursor: not-allowed; }

        /* Observação */
        .pm-notes { padding: 16px 0 22px; }
        .pm-notes-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.42);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin: 0 0 7px;
        }
        .pm-notes-input {
          width: 100%;
          min-height: 72px;
          resize: none;
          border-radius: 5px;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.09);
          color: #fff;
          font-family: inherit;
          font-size: 0.84rem;
          line-height: 1.5;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .pm-notes-input:focus {
          outline: none;
          border-color: rgba(192, 132, 252, 0.45);
        }
        .pm-notes-input::placeholder { color: rgba(255, 255, 255, 0.26); }

        /* Footer */
        .pm-footer {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          background: rgba(6, 2, 12, 0.65);
          flex-shrink: 0;
        }

        /* Controle de quantidade */
        .pm-qty {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 5px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .pm-qty button {
          width: 36px;
          height: 40px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .pm-qty button:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
        .pm-qty span {
          width: 34px;
          font-size: 0.95rem;
          font-weight: 800;
          color: #fff;
          text-align: center;
          border-left: 1px solid rgba(255, 255, 255, 0.09);
          border-right: 1px solid rgba(255, 255, 255, 0.09);
        }

        /* Total */
        .pm-footer-total {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          min-width: 0;
        }
        .pm-footer-total-label {
          font-size: 0.67rem;
          color: rgba(255, 255, 255, 0.42);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          line-height: 1;
          margin-bottom: 3px;
        }
        .pm-footer-total-value {
          font-size: 1.2rem;
          font-weight: 800;
          color: #ffe100;
          white-space: nowrap;
          letter-spacing: -0.02em;
        }

        /* Botão adicionar */
        .pm-add-btn {
          height: 44px;
          padding: 0 18px;
          border-radius: 5px;
          font-size: 0.875rem;
          font-weight: 800;
          border: none;
          background: linear-gradient(135deg, #9d2fe0 0%, #6822aa 100%);
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          white-space: nowrap;
          flex-shrink: 0;
          box-shadow: 0 4px 18px rgba(157, 47, 224, 0.42),
                      inset 0 1px 0 rgba(255, 255, 255, 0.12);
          transition: opacity 0.15s, transform 0.12s, box-shadow 0.15s;
        }
        .pm-add-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(157, 47, 224, 0.55);
        }
        .pm-add-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(157, 47, 224, 0.3);
        }
        .pm-add-btn:disabled {
          background: rgba(255, 255, 255, 0.07);
          color: rgba(255, 255, 255, 0.24);
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Loading */
        .pm-loading {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.42);
          font-size: 0.875rem;
        }

        /* Tablet + Mobile: troca para imagem mobile */
        @media (max-width: 768px) {
          .pm-img--desktop { display: none; }
          .pm-img--mobile  { display: block; }
        }

        /* Tablet — coluna única com strip de imagem */
        @media (max-width: 768px) {
          .pm-modal {
            grid-template-columns: 1fr;
            grid-template-rows: 230px 1fr;
            width: calc(100vw - 32px);
            height: min(84vh, 660px);
            border-radius: 5px;
          }
          .pm-image-panel { grid-row: 1; }
          .pm-content {
            grid-row: 2;
            border-left: none;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
          }
          .pm-body { padding: 20px 20px 0; }
          .pm-footer { padding: 12px 20px 16px; }
        }

        /* Mobile — bottom sheet */
        @media (max-width: 560px) {
          .pm-overlay {
            align-items: flex-end;
            padding: 0;
          }
          .pm-modal {
            width: 100%;
            max-height: 94dvh;
            height: auto;
            border-radius: 5px 5px 0 0;
            grid-template-rows: 195px 1fr;
            animation: pm-sheet-in 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          }
          @keyframes pm-sheet-in {
            from { transform: translateY(100%); opacity: 0.85; }
            to   { transform: translateY(0);    opacity: 1; }
          }
          .pm-title { font-size: 1.1rem; }
          .pm-body { padding: 16px 16px 0; }
          .pm-footer {
            flex-wrap: wrap;
            padding: 12px 16px env(safe-area-inset-bottom, 18px);
            gap: 8px;
          }
          .pm-qty { order: 1; }
          .pm-footer-total { order: 2; margin-left: auto; flex: unset; }
          .pm-add-btn {
            order: 3;
            width: 100%;
            height: 50px;
            border-radius: 5px;
            font-size: 0.925rem;
          }
        }
      `}</style>
    </>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

function Section({
  title, required, children, error,
}: {
  title: string;
  required: boolean;
  children: React.ReactNode;
  error?: string | null;
}) {
  return (
    <div className="pm-section">
      <div className="pm-section-header">
        <h3 className="pm-section-title">{title}</h3>
        {required && <span className="pm-section-required">Obrigatório</span>}
      </div>
      <div className="pm-section-items">{children}</div>
      {error && <p className="pm-option-error">{error}</p>}
    </div>
  );
}

// ── OptionGroupSection ────────────────────────────────────────────────────────

function OptionGroupSection({
  group, selectedIds, validationError, onToggle,
}: {
  group: OptionGroup;
  selectedIds: string[];
  validationError: string | null;
  onToggle: (optionId: string) => void;
}) {
  const isRadio = group.maxSelected === 1;
  const activeOptions = (group.options ?? []).filter((o) => o.isActive);
  const error = validationError?.toLowerCase().includes(group.name.toLowerCase())
    ? validationError
    : null;

  return (
    <Section title={group.name || 'Adicionais'} required={group.isRequired} error={error}>
      {(group.minSelected > 0 || group.maxSelected > 1) && (
        <p className="pm-section-hint">
          {group.minSelected > 0 ? `Escolha de ${group.minSelected} até ` : 'Escolha até '}
          {group.maxSelected} {group.maxSelected === 1 ? 'opção' : 'opções'}
        </p>
      )}
      {activeOptions.map((option) => {
        const price = Number(option.additionalPrice ?? 0);
        const selected = selectedIds.includes(option.id);
        const atMax = !selected && selectedIds.length >= group.maxSelected;
        return (
          <OptionItem
            key={option.id}
            emoji={option.emoji ?? undefined}
            label={option.name}
            description={option.description ?? undefined}
            price={price > 0 ? price : undefined}
            selected={selected}
            disabled={atMax}
            isRadio={isRadio}
            onToggle={() => !atMax && onToggle(option.id)}
          />
        );
      })}
    </Section>
  );
}

// ── VariantItem ───────────────────────────────────────────────────────────────

function VariantItem({
  label, price, selected, onToggle,
}: {
  label: string;
  price: number;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button className={`pm-variant${selected ? ' selected' : ''}`} onClick={onToggle}>
      <span style={{
        fontSize: '0.9rem',
        fontWeight: selected ? 700 : 500,
        color: selected ? '#fff' : 'rgba(255,255,255,0.85)',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '0.875rem',
        fontWeight: 700,
        color: price > 0 ? '#ffe100' : 'rgba(255,255,255,0.45)',
      }}>
        {price ? `+ ${formatBRL(price)}` : 'Grátis'}
      </span>
    </button>
  );
}

// ── OptionItem ────────────────────────────────────────────────────────────────

function OptionItem({
  emoji, label, description, price, selected, disabled, isRadio, onToggle,
}: {
  emoji?: string;
  label: string;
  description?: string;
  price?: number;
  selected: boolean;
  disabled?: boolean;
  isRadio?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className={`pm-option${selected ? ' selected' : ''}`}
      onClick={onToggle}
      disabled={disabled}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        {/* Indicador radio/checkbox */}
        <div style={{
          width: 20, height: 20,
          borderRadius: isRadio ? '50%' : 5,
          flexShrink: 0,
          border: `2px solid ${selected ? '#c084fc' : 'rgba(255,255,255,0.25)'}`,
          background: selected ? '#9d2fe0' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}>
          {selected && (
            isRadio
              ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
              : <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                  <path d="M1 4l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
          )}
        </div>

        {emoji && <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>{emoji}</span>}

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: '0.875rem',
            fontWeight: selected ? 700 : 500,
            color: selected ? '#fff' : 'rgba(255,255,255,0.88)',
            margin: 0,
          }}>
            {label}
          </p>
          {description && (
            <p style={{
              fontSize: '0.775rem',
              color: 'rgba(255,255,255,0.5)',
              marginTop: 2,
              margin: '2px 0 0',
              lineHeight: 1.35,
            }}>
              {description}
            </p>
          )}
        </div>
      </div>

      <span style={{
        fontSize: '0.85rem',
        fontWeight: 700,
        color: price && price > 0 ? '#ffe100' : 'rgba(255,255,255,0.42)',
        flexShrink: 0,
      }}>
        {price ? `+ ${formatBRL(price)}` : 'Grátis'}
      </span>
    </button>
  );
}
