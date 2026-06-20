import { useState } from 'react';
import { QrCode, CreditCard, Banknote, CheckCircle, MapPin, Store, X, RefreshCw } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useCheckout, PICKUP_ZONE_ID } from '@/hooks/useCheckout';
import { useLocationStore } from '@/store/location.store';
import { formatCurrency } from '@/utils/currency.util';
import { resolvePixQrImageSrc } from '@/utils/pix';
import '@/styles/checkout-flow.css';

interface Props {
  onClose: () => void;
  promotionalTotal: number;
}

const STEP_TITLES: Record<string, string> = {
  CONFIRM_LOCATION: 'Confirmar localização',
  LOCATION_REQUIRED: 'Informe seu bairro',
  LOCATION_NOT_SERVED: 'Bairro não atendido',
  CONFIRM_DELIVERY: 'Confirmar entrega',
  DELIVERY_INFO: 'Dados de entrega',
  SAVE_TO_PROFILE: 'Salvar no perfil',
  PAYMENT_METHOD: 'Forma de pagamento',
  CHANGE_FOR: 'Troco',
  PIX_PENDING: 'Pagamento PIX',
  ORDER_SUCCESS: 'Pedido criado!',
};

export function CheckoutFlowModal({ onClose, promotionalTotal }: Props) {
  const checkout = useCheckout(onClose, promotionalTotal);
  const selectedDeliveryZone = useLocationStore((s) => s.selectedDeliveryZone);
  const [pixCopied, setPixCopied] = useState(false);
  const [qrImageFailed, setQrImageFailed] = useState(false);

  const finalTotal = checkout.getFinalTotal();
  const deliveryFee = Number(selectedDeliveryZone?.deliveryFee ?? 0);

  const canClose =
    checkout.step !== 'ORDER_SUCCESS' &&
    checkout.step !== 'PIX_PENDING' &&
    checkout.step !== 'SAVE_TO_PROFILE';

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget && canClose) onClose();
  }

  function handleCopyPix(text: string) {
    if (!text) return;
    void navigator.clipboard
      .writeText(text)
      .then(() => {
        setPixCopied(true);
        setTimeout(() => setPixCopied(false), 2000);
      })
      .catch(() => undefined);
  }

  function getPaymentBackStep() {
    if (checkout.isPickup) {
      return selectedDeliveryZone ? 'CONFIRM_LOCATION' : 'LOCATION_REQUIRED';
    }
    return 'CONFIRM_DELIVERY';
  }

  return (
    <div className="checkout-modal-overlay" onClick={handleOverlayClick}>
      <div className="checkout-modal">
        <div className="checkout-modal-header">
          <h2 className="checkout-modal-title">
            {checkout.step === 'DELIVERY_INFO' && checkout.isPickup
              ? 'Dados para retirada'
              : STEP_TITLES[checkout.step]}
          </h2>
          {canClose && (
            <button type="button" className="checkout-close-button" onClick={onClose}>
              <X size={18} />
            </button>
          )}
        </div>

        {checkout.step === 'CONFIRM_LOCATION' && renderConfirmLocation()}
        {checkout.step === 'LOCATION_REQUIRED' && renderLocationRequired()}
        {checkout.step === 'LOCATION_NOT_SERVED' && renderLocationNotServed()}
        {checkout.step === 'CONFIRM_DELIVERY' && renderConfirmDelivery()}
        {checkout.step === 'DELIVERY_INFO' && renderDeliveryInfo()}
        {checkout.step === 'SAVE_TO_PROFILE' && renderSaveToProfile()}
        {checkout.step === 'PAYMENT_METHOD' && renderPaymentMethod()}
        {checkout.step === 'CHANGE_FOR' && renderChangeFor()}
        {checkout.step === 'PIX_PENDING' && renderPixPending()}
        {checkout.step === 'ORDER_SUCCESS' && renderOrderSuccess()}
      </div>
    </div>
  );

  /* ── CONFIRM_LOCATION ── */
  function renderConfirmLocation() {
    return (
      <>
        <div className="checkout-modal-body">
          <div className="checkout-location-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <MapPin size={18} color="rgba(216,180,254,0.8)" style={{ flexShrink: 0 }} />
              <h3 className="checkout-location-name">
                {selectedDeliveryZone?.neighborhood}
              </h3>
            </div>
            <p className="checkout-location-meta">
              {selectedDeliveryZone?.city}
              {selectedDeliveryZone?.state ? `, ${selectedDeliveryZone.state}` : ''}
            </p>
            <div className="checkout-fee-badge">
              Taxa de entrega: {deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}
            </div>
          </div>

          <div className="checkout-total-row">
            <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
              Total estimado
            </span>
            <span>{formatCurrency(finalTotal)}</span>
          </div>
        </div>

        <div className="checkout-modal-footer">
          <button
            type="button"
            className="checkout-secondary-button"
            onClick={checkout.goToZoneSelection}
          >
            Alterar bairro
          </button>
          <button
            type="button"
            className="checkout-primary-button"
            onClick={checkout.goToPayment}
          >
            Continuar
          </button>
        </div>
      </>
    );
  }

  /* ── LOCATION_REQUIRED ── */
  function renderLocationRequired() {
    return (
      <>
        <div className="checkout-modal-body">
          <p className="checkout-info-message">
            Antes de continuar, informe seu bairro para que possamos calcular a taxa de entrega.
          </p>

          {checkout.isLoadingZones && (
            <p className="checkout-spinner">Carregando bairros…</p>
          )}

          {checkout.zoneError && !checkout.isLoadingZones && (
            <div>
              <p className="checkout-error-message">{checkout.zoneError}</p>
              <button
                type="button"
                className="checkout-secondary-button"
                style={{ marginTop: 10 }}
                onClick={() => void checkout.loadData()}
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!checkout.isLoadingZones && !checkout.zoneError && (
            <>
              <div>
                <label className="checkout-label">Selecione o bairro ou retirada</label>
                <select
                  className="checkout-select"
                  value={checkout.pendingZoneId}
                  onChange={(e) => checkout.setPendingZoneId(e.target.value)}
                >
                  <option value="">— Escolha uma opção —</option>
                  <option value={PICKUP_ZONE_ID}>
                    🏪 Retirada na loja — Itapuã · Grátis
                  </option>
                  {checkout.deliveryZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.neighborhood}
                      {z.city ? ` — ${z.city}` : ''}
                      {Number(z.deliveryFee) === 0
                        ? ' · Grátis'
                        : ` · ${formatCurrency(Number(z.deliveryFee))}`}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="checkout-not-in-list-button"
                onClick={checkout.handleNotServed}
              >
                Meu bairro não está na lista
              </button>
            </>
          )}
        </div>

        <div className="checkout-modal-footer">
          <button type="button" className="checkout-secondary-button" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="checkout-primary-button"
            onClick={checkout.confirmZone}
            disabled={!checkout.pendingZoneId || checkout.isLoadingZones}
          >
            Confirmar bairro
          </button>
        </div>
      </>
    );
  }

  /* ── LOCATION_NOT_SERVED ── */
  function renderLocationNotServed() {
    const { store } = checkout;
    const hasIfood = !!store?.ifoodUrl;
    const hasWhatsapp = !!store?.whatsappNumber;

    function openIfood() {
      if (store?.ifoodUrl) window.open(store.ifoodUrl, '_blank', 'noopener,noreferrer');
    }

    function openWhatsapp() {
      if (store?.whatsappNumber) {
        const phone = store.whatsappNumber.replace(/\D/g, '');
        const msg = encodeURIComponent('Olá! Gostaria de fazer um pedido.');
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener,noreferrer');
      }
    }

    return (
      <>
        <div className="checkout-modal-body">
          <div className="checkout-not-served-box">
            <p className="checkout-info-message">
              Ainda não entregamos no seu bairro pelo site.
            </p>

            {hasIfood && (
              <>
                <p className="checkout-info-message">
                  Você pode fazer seu pedido pelo iFood.
                </p>
                <button type="button" className="checkout-ifood-button" onClick={openIfood}>
                  Pedir pelo iFood
                </button>
              </>
            )}

            {!hasIfood && hasWhatsapp && (
              <>
                <p className="checkout-info-message">
                  Entre em contato pelo WhatsApp da loja para fazer seu pedido.
                </p>
                <button
                  type="button"
                  className="checkout-whatsapp-button"
                  onClick={openWhatsapp}
                >
                  Falar no WhatsApp
                </button>
              </>
            )}

            {!hasIfood && !hasWhatsapp && (
              <p className="checkout-info-message">
                Entre em contato diretamente com a loja para verificar disponibilidade.
              </p>
            )}
          </div>
        </div>

        <div className="checkout-modal-footer">
          <button
            type="button"
            className="checkout-secondary-button"
            onClick={() => checkout.setStep('LOCATION_REQUIRED')}
          >
            Voltar
          </button>
        </div>
      </>
    );
  }

  /* ── CONFIRM_DELIVERY ── */
  function renderConfirmDelivery() {
    const zone = selectedDeliveryZone;
    const zoneFee = Number(zone?.deliveryFee ?? 0);

    return (
      <>
        <div className="checkout-modal-body">
          <p className="checkout-info-message" style={{ fontSize: 13 }}>
            Confirme os dados abaixo antes de continuar.
          </p>

          <div className="checkout-summary-card">
            <div className="checkout-summary-row">
              <span className="checkout-summary-label">Nome</span>
              <span className="checkout-summary-value">{checkout.customerFullName}</span>
            </div>
            <div className="checkout-summary-row">
              <span className="checkout-summary-label">Telefone</span>
              <span className="checkout-summary-value">{checkout.customerPhone}</span>
            </div>
            {zone && (
              <div className="checkout-summary-row">
                <span className="checkout-summary-label">Bairro</span>
                <span className="checkout-summary-value">
                  {zone.neighborhood}
                  {zone.city ? ` — ${zone.city}` : ''}
                </span>
              </div>
            )}
            <div className="checkout-summary-row">
              <span className="checkout-summary-label">Endereço</span>
              <span className="checkout-summary-value">
                {checkout.addressStreet}, {checkout.addressNumber}
                {checkout.addressComplement ? ` — ${checkout.addressComplement}` : ''}
              </span>
            </div>
            {checkout.addressReference && (
              <div className="checkout-summary-row">
                <span className="checkout-summary-label">Referência</span>
                <span className="checkout-summary-value">{checkout.addressReference}</span>
              </div>
            )}
          </div>

          <div className="checkout-total-row">
            <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
              Total
              {zoneFee > 0 && (
                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginLeft: 6 }}>
                  (inclui taxa {formatCurrency(zoneFee)})
                </span>
              )}
            </span>
            <span>{formatCurrency(finalTotal)}</span>
          </div>
        </div>

        <div className="checkout-modal-footer">
          <button
            type="button"
            className="checkout-secondary-button"
            onClick={checkout.goToEditDeliveryInfo}
          >
            Alterar dados
          </button>
          <button
            type="button"
            className="checkout-primary-button"
            onClick={checkout.confirmDeliveryAddress}
          >
            Confirmar e continuar
          </button>
        </div>
      </>
    );
  }

  /* ── DELIVERY_INFO ── */
  function renderDeliveryInfo() {
    const e = checkout.deliveryInfoErrors;
    const isAuth = checkout.isAuthenticated;
    const isPickup = checkout.isPickup;

    const selectedZoneInForm = !isPickup && checkout.pendingZoneId
      ? checkout.deliveryZones.find((z) => z.id === checkout.pendingZoneId)
      : null;
    const feeInForm = Number(selectedZoneInForm?.deliveryFee ?? 0);

    return (
      <>
        <div className="checkout-modal-body">
          {isPickup ? (
            <p className="checkout-info-message" style={{ fontSize: 13 }}>
              Precisamos do seu nome e telefone para confirmar a retirada na loja.
            </p>
          ) : isAuth ? (
            <p className="checkout-info-message" style={{ fontSize: 13 }}>
              Dados do cadastro pré-preenchidos. Informe o endereço de entrega.
            </p>
          ) : null}

          <div>
            <label className="checkout-label">Nome completo *</label>
            <input
              type="text"
              className="checkout-input"
              placeholder="Seu nome completo"
              value={checkout.customerFullName}
              onChange={(ev) => checkout.setCustomerFullName(ev.target.value)}
              autoComplete="name"
            />
            {e.fullName && <p className="checkout-field-error">{e.fullName}</p>}
          </div>

          <div>
            <label className="checkout-label">Telefone *</label>
            <input
              type="tel"
              className="checkout-input"
              placeholder="(00) 00000-0000"
              value={checkout.customerPhone}
              onChange={(ev) => checkout.setCustomerPhone(ev.target.value)}
              autoComplete="tel"
            />
            {e.phone && <p className="checkout-field-error">{e.phone}</p>}
          </div>

          {!isPickup && (
            <>
              <div>
                <label className="checkout-label">Bairro / zona de entrega *</label>
                <select
                  className="checkout-select"
                  value={checkout.pendingZoneId}
                  onChange={(ev) => checkout.setPendingZoneId(ev.target.value)}
                >
                  <option value="">Selecione seu bairro</option>
                  {checkout.deliveryZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.neighborhood}
                      {z.city ? ` — ${z.city}` : ''}
                      {Number(z.deliveryFee) === 0
                        ? ' · Grátis'
                        : ` · ${formatCurrency(Number(z.deliveryFee))}`}
                    </option>
                  ))}
                </select>
                {e.deliveryZoneId && <p className="checkout-field-error">{e.deliveryZoneId}</p>}
              </div>

              {selectedZoneInForm && (
                <div className="checkout-delivery-fee-box">
                  <span>Taxa de entrega</span>
                  <strong>{feeInForm === 0 ? 'Grátis' : formatCurrency(feeInForm)}</strong>
                </div>
              )}

              <div className="checkout-address-row">
                <div>
                  <label className="checkout-label">Rua / Avenida *</label>
                  <input
                    type="text"
                    className="checkout-input"
                    placeholder="Nome da rua ou avenida"
                    value={checkout.addressStreet}
                    onChange={(ev) => checkout.setAddressStreet(ev.target.value)}
                    autoComplete="street-address"
                  />
                  {e.street && <p className="checkout-field-error">{e.street}</p>}
                </div>
                <div>
                  <label className="checkout-label">Número *</label>
                  <input
                    type="text"
                    className="checkout-input"
                    placeholder="Nº"
                    value={checkout.addressNumber}
                    onChange={(ev) => checkout.setAddressNumber(ev.target.value)}
                  />
                  {e.number && <p className="checkout-field-error">{e.number}</p>}
                </div>
              </div>

              <div>
                <label className="checkout-label">Complemento</label>
                <input
                  type="text"
                  className="checkout-input"
                  placeholder="Apto, bloco, casa… (opcional)"
                  value={checkout.addressComplement}
                  onChange={(ev) => checkout.setAddressComplement(ev.target.value)}
                />
              </div>

              <div>
                <label className="checkout-label">Ponto de referência</label>
                <input
                  type="text"
                  className="checkout-input"
                  placeholder="Ex: próximo ao mercado (opcional)"
                  value={checkout.addressReference}
                  onChange={(ev) => checkout.setAddressReference(ev.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <div className="checkout-modal-footer">
          <button
            type="button"
            className="checkout-secondary-button"
            onClick={checkout.goBackFromDeliveryInfo}
          >
            Voltar
          </button>
          <button
            type="button"
            className="checkout-primary-button"
            onClick={checkout.confirmDeliveryInfo}
          >
            Continuar
          </button>
        </div>
      </>
    );
  }

  /* ── SAVE_TO_PROFILE ── */
  function renderSaveToProfile() {
    return (
      <>
        <div className="checkout-modal-body">
          <div className="checkout-save-profile-box">
            <p className="checkout-save-profile-title">
              Deseja salvar os dados de entrega no seu perfil?
            </p>
            <p className="checkout-info-message" style={{ fontSize: 13 }}>
              Seus dados ficarão salvos para agilizar os próximos pedidos.
            </p>
          </div>
        </div>

        <div className="checkout-modal-footer">
          <button
            type="button"
            className="checkout-secondary-button"
            onClick={checkout.skipSaveToProfile}
            disabled={checkout.isSavingToProfile}
          >
            Não, continuar
          </button>
          <button
            type="button"
            className="checkout-primary-button"
            onClick={() => void checkout.saveToProfileAndContinue()}
            disabled={checkout.isSavingToProfile}
          >
            {checkout.isSavingToProfile ? 'Salvando…' : 'Sim, salvar'}
          </button>
        </div>
      </>
    );
  }

  /* ── PAYMENT_METHOD ── */
  function renderPaymentMethod() {
    const methods = [
      {
        id: 'PIX' as const,
        icon: <QrCode size={22} />,
        label: 'PIX',
        description: 'Pagamento instantâneo',
      },
      {
        id: 'CARD_ON_DELIVERY' as const,
        icon: <CreditCard size={22} />,
        label: 'Cartão na entrega',
        description: 'Pague com maquininha no ato da entrega',
      },
      {
        id: 'CASH_ON_DELIVERY' as const,
        icon: <Banknote size={22} />,
        label: 'Dinheiro na entrega',
        description: 'Pague em dinheiro quando receber',
      },
    ];

    return (
      <>
        <div className="checkout-modal-body">
          <div className="checkout-total-row">
            <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
              Total
            </span>
            <span>{formatCurrency(finalTotal)}</span>
          </div>

          {checkout.isPickup && (
            <div className="checkout-pickup-badge">
              <Store size={14} style={{ flexShrink: 0 }} />
              Retirada na loja — sem taxa de entrega
            </div>
          )}

          {checkout.orderError && (
            <p className="checkout-error-message">{checkout.orderError}</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {methods.map((m) => (
              <button
                key={m.id}
                type="button"
                className="checkout-option-card"
                onClick={() => void checkout.handlePaymentSelect(m.id)}
                disabled={checkout.isSubmitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  opacity: checkout.isSubmitting ? 0.6 : 1,
                }}
              >
                <div className="checkout-payment-icon-wrapper">{m.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 15 }}>{m.label}</p>
                  <p
                    style={{
                      margin: '3px 0 0',
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.55)',
                    }}
                  >
                    {m.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {checkout.isSubmitting && (
            <p className="checkout-spinner">Criando pedido…</p>
          )}
        </div>

        <div className="checkout-modal-footer">
          <button
            type="button"
            className="checkout-secondary-button"
            onClick={() => checkout.setStep(getPaymentBackStep())}
            disabled={checkout.isSubmitting}
          >
            Voltar
          </button>
        </div>
      </>
    );
  }

  /* ── CHANGE_FOR ── */
  function renderChangeFor() {
    return (
      <>
        <div className="checkout-modal-body">
          <div className="checkout-total-row">
            <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
              Total do pedido
            </span>
            <span>{formatCurrency(finalTotal)}</span>
          </div>

          <div>
            <p className="checkout-label">Precisa de troco?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                className={`checkout-option-card${checkout.needsChange === false ? ' selected' : ''}`}
                onClick={() => checkout.setNeedsChange(false)}
                style={{ padding: '14px 16px' }}
              >
                <span style={{ fontWeight: 700, fontSize: 14 }}>Não preciso de troco</span>
              </button>
              <button
                type="button"
                className={`checkout-option-card${checkout.needsChange === true ? ' selected' : ''}`}
                onClick={() => checkout.setNeedsChange(true)}
                style={{ padding: '14px 16px' }}
              >
                <span style={{ fontWeight: 700, fontSize: 14 }}>Sim, preciso de troco</span>
              </button>
            </div>
          </div>

          {checkout.needsChange && (
            <div>
              <label className="checkout-label">Troco para quanto?</label>
              <input
                type="number"
                className="checkout-input"
                placeholder="Ex: 100.00"
                value={checkout.changeForAmount}
                onChange={(e) => checkout.setChangeForAmount(e.target.value)}
                min={0}
                step={0.01}
              />
            </div>
          )}

          {checkout.changeError && (
            <p className="checkout-error-message">{checkout.changeError}</p>
          )}

          {checkout.orderError && (
            <p className="checkout-error-message">{checkout.orderError}</p>
          )}

          {checkout.isSubmitting && (
            <p className="checkout-spinner">Criando pedido…</p>
          )}
        </div>

        <div className="checkout-modal-footer">
          <button
            type="button"
            className="checkout-secondary-button"
            onClick={() => checkout.setStep('PAYMENT_METHOD')}
            disabled={checkout.isSubmitting}
          >
            Voltar
          </button>
          <button
            type="button"
            className="checkout-primary-button"
            onClick={() => void checkout.handleChangeSubmit()}
            disabled={checkout.isSubmitting || checkout.needsChange === null}
          >
            {checkout.isSubmitting ? 'Aguarde…' : 'Confirmar pedido'}
          </button>
        </div>
      </>
    );
  }

  /* ── PIX_PENDING ── */
  function renderPixPending() {
    const { createdOrder, pixData, isLoadingPix, pixError, retryPix } = checkout;

    const qrImageSrc = resolvePixQrImageSrc(pixData);
    const hasCode = Boolean(pixData.copyPasteCode);

    return (
      <>
        <div className="checkout-modal-body">
          {createdOrder?.orderNumber && (
            <p className="checkout-order-number" style={{ textAlign: 'center' }}>
              Pedido #{createdOrder.orderNumber}
            </p>
          )}

          {isLoadingPix && (
            <div className="checkout-pix-loading">
              <div className="checkout-spinner-ring" />
              <p className="checkout-pix-loading-text">Gerando PIX…</p>
            </div>
          )}

          {!isLoadingPix && pixError && !hasCode && (
            <div className="checkout-pix-error-box">
              <p className="checkout-pix-error-text">{pixError}</p>
              <button
                type="button"
                className="checkout-secondary-button"
                onClick={retryPix}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <RefreshCw size={15} />
                Tentar novamente
              </button>
            </div>
          )}

          {!isLoadingPix && hasCode && (
            <div className="checkout-pix-box">
              <div className="checkout-pix-qr-frame">
                {qrImageSrc && !qrImageFailed ? (
                  <img
                    src={qrImageSrc}
                    alt="QR Code PIX"
                    className="checkout-pix-qr-image"
                    onError={() => setQrImageFailed(true)}
                  />
                ) : (
                  <QRCodeCanvas
                    value={pixData.copyPasteCode}
                    size={220}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                )}
              </div>

              <div className="checkout-pix-copy">
                <p className="checkout-label">Pix Copia e Cola</p>
                <div className="checkout-pix-copy-row">
                  <p className="checkout-pix-code">{pixData.copyPasteCode}</p>
                  <button
                    type="button"
                    className="checkout-secondary-button"
                    style={{ flexShrink: 0 }}
                    disabled={!hasCode}
                    onClick={() => handleCopyPix(pixData.copyPasteCode)}
                  >
                    {pixCopied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              {pixData.expiresAt && (
                <p className="checkout-info-message" style={{ textAlign: 'center', fontSize: 13 }}>
                  Expira em:{' '}
                  {new Date(pixData.expiresAt).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="checkout-modal-footer" style={{ justifyContent: 'center' }}>
          <button
            type="button"
            className="checkout-primary-button"
            onClick={checkout.handleSuccessClose}
            style={{ minWidth: 200 }}
          >
            Ver meus pedidos
          </button>
        </div>
      </>
    );
  }

  /* ── ORDER_SUCCESS ── */
  function renderOrderSuccess() {
    const { createdOrder, paymentMethod, isPickup } = checkout;

    const methodLabels: Record<string, string> = {
      CARD_ON_DELIVERY: 'Cartão na entrega',
      CASH_ON_DELIVERY: 'Dinheiro na entrega',
    };

    const methodInfo: Record<string, string> = {
      CARD_ON_DELIVERY: 'O pagamento será feito com a maquininha no ato da entrega.',
      CASH_ON_DELIVERY: 'O pagamento será feito em dinheiro no ato da entrega.',
    };

    const method = paymentMethod ?? '';

    return (
      <>
        <div className="checkout-modal-body">
          <div className="checkout-success-box">
            <CheckCircle size={56} className="checkout-success-icon" />
            <h3 className="checkout-success-title">Pedido criado com sucesso!</h3>

            {createdOrder?.orderNumber && (
              <p className="checkout-order-number">Pedido #{createdOrder.orderNumber}</p>
            )}

            <p className="checkout-payment-info">
              <strong style={{ color: '#ffe100' }}>
                {methodLabels[method] ?? method}
              </strong>
              <br />
              {methodInfo[method] ?? ''}
            </p>

            {isPickup ? (
              <p className="checkout-payment-info">
                <strong style={{ color: '#fff' }}>Retirada na loja</strong>
              </p>
            ) : (
              selectedDeliveryZone && (
                <p className="checkout-payment-info">
                  Entrega em{' '}
                  <strong style={{ color: '#fff' }}>
                    {selectedDeliveryZone.neighborhood}
                  </strong>
                </p>
              )
            )}
          </div>
        </div>

        <div className="checkout-modal-footer" style={{ justifyContent: 'center' }}>
          <button
            type="button"
            className="checkout-primary-button"
            onClick={checkout.handleSuccessClose}
            style={{ minWidth: 200 }}
          >
            Ver meus pedidos
          </button>
        </div>
      </>
    );
  }
}
