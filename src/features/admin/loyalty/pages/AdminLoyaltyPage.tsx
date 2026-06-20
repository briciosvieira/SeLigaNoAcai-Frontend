import { useEffect, useRef, useState } from 'react';
import { Gift, Upload, Search, Plus, Minus, X, Check } from 'lucide-react';
import { useAdminLoyalty } from '@/hooks/useAdminLoyalty';
import { formatBRL } from '@/utils/currency.util';
import { resolveImageUrl } from '@/utils/image-url.util';
import './AdminLoyaltyPage.css';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function AdminLoyaltyPage() {
  const loy = useAdminLoyalty();
  const imgInputRef = useRef<HTMLInputElement>(null);

  // Local form state (mirrors settings, editable before save)
  const [form, setForm] = useState({
    title: '',
    description: '',
    minOrderAmount: '',
    stampsRequired: '',
    rewardDescription: '',
    isEnabled: false,
  });

  // Stamp action form state
  const [stampQty, setStampQty] = useState('1');
  const [stampReason, setStampReason] = useState('');

  // Search debounce
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate local form when settings load
  useEffect(() => {
    if (!loy.settings) return;
    setForm({
      title: loy.settings.title ?? '',
      description: loy.settings.description ?? '',
      minOrderAmount: String(loy.settings.minOrderAmount ?? ''),
      stampsRequired: String(loy.settings.stampsRequired ?? '10'),
      rewardDescription: loy.settings.rewardDescription ?? '',
      isEnabled: loy.settings.isEnabled ?? false,
    });
  }, [loy.settings]);

  function handleFormChange(field: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    await loy.saveSettings({
      title: form.title.trim(),
      description: form.description.trim() || null,
      minOrderAmount: Number(form.minOrderAmount) || 0,
      stampsRequired: Number(form.stampsRequired) || 10,
      rewardDescription: form.rewardDescription.trim(),
      isEnabled: form.isEnabled,
    });
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await loy.uploadImage(file);
    if (imgInputRef.current) imgInputRef.current.value = '';
  }

  function handleSearchChange(value: string) {
    loy.setSearchQuery(value);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      void loy.searchCustomers(value);
    }, 400);
  }

  async function handleStampAdd() {
    if (!loy.selectedCustomer) return;
    const qty = parseInt(stampQty, 10);
    if (!qty || qty < 1) return;
    await loy.addStamp(loy.selectedCustomer.customerId, qty, stampReason);
    setStampReason('');
  }

  async function handleStampRemove() {
    if (!loy.selectedCustomer) return;
    const qty = parseInt(stampQty, 10);
    if (!qty || qty < 1) return;
    await loy.removeStamp(loy.selectedCustomer.customerId, qty, stampReason);
    setStampReason('');
  }

  const isBusy = loy.isSaving || loy.isUploading;

  return (
    <div className="admin-loyalty-page">
      {/* Header */}
      <div className="admin-loyalty-header">
        <h1>Fidelidade</h1>
        <p>Configure o programa de fidelidade e gerencie os selos dos clientes</p>
      </div>

      {/* Alerts */}
      {loy.error && (
        <div className="admin-loyalty-alert error">
          <span>{loy.error}</span>
          <button
            className="admin-loyalty-alert-close"
            onClick={() => loy.setError(null)}
          >
            ×
          </button>
        </div>
      )}
      {loy.successMessage && (
        <div className="admin-loyalty-alert success">
          <span>{loy.successMessage}</span>
          <button
            className="admin-loyalty-alert-close"
            onClick={() => loy.setSuccessMessage(null)}
          >
            ×
          </button>
        </div>
      )}

      {loy.isLoading && (
        <p style={{ textAlign: 'center', padding: '48px 0', color: 'var(--t2)' }}>
          Carregando…
        </p>
      )}

      {!loy.isLoading && (
        <div className="admin-loyalty-grid">
          {/* ── Column 1: Settings ── */}
          <div>
            <div className="admin-loyalty-card">
              <h2 className="admin-loyalty-card-title">
                <Gift size={16} />
                Configurações
              </h2>

              {/* Enabled toggle */}
              <div className="admin-loyalty-toggle-row">
                <div className="admin-loyalty-toggle-label">
                  <strong>Programa ativo</strong>
                  <span>
                    {form.isEnabled ? 'Fidelidade habilitada' : 'Fidelidade desabilitada'}
                  </span>
                </div>
                <label className="admin-loyalty-toggle" aria-label="Ativar fidelidade">
                  <input
                    type="checkbox"
                    checked={form.isEnabled}
                    onChange={(e) => handleFormChange('isEnabled', e.target.checked)}
                  />
                  <span className="admin-loyalty-toggle-track" />
                </label>
              </div>

              {/* Title */}
              <div className="admin-loyalty-field">
                <label>Título do cartão</label>
                <input
                  className="admin-loyalty-input"
                  type="text"
                  value={form.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="Se Liga no Açaí"
                />
              </div>

              {/* Description */}
              <div className="admin-loyalty-field">
                <label>Descrição (exibida ao cliente)</label>
                <input
                  className="admin-loyalty-input"
                  type="text"
                  value={form.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="A cada compra acima de R$ 16,00 você ganha 1 selo…"
                />
              </div>

              {/* Min order amount */}
              <div className="admin-loyalty-field">
                <label>Valor mínimo do pedido para ganhar 1 selo</label>
                <input
                  className="admin-loyalty-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minOrderAmount}
                  onChange={(e) => handleFormChange('minOrderAmount', e.target.value)}
                  placeholder="16.00"
                />
                {form.minOrderAmount && (
                  <span className="admin-loyalty-hint">
                    Pedidos acima de {formatBRL(Number(form.minOrderAmount))} ganham 1 selo
                  </span>
                )}
              </div>

              {/* Stamps required */}
              <div className="admin-loyalty-field">
                <label>Selos necessários para ganhar 1 brinde</label>
                <input
                  className="admin-loyalty-input"
                  type="number"
                  min="1"
                  max="50"
                  value={form.stampsRequired}
                  onChange={(e) => handleFormChange('stampsRequired', e.target.value)}
                  placeholder="10"
                />
              </div>

              {/* Reward description */}
              <div className="admin-loyalty-field">
                <label>Descrição do brinde</label>
                <input
                  className="admin-loyalty-input"
                  type="text"
                  value={form.rewardDescription}
                  onChange={(e) => handleFormChange('rewardDescription', e.target.value)}
                  placeholder="1 açaí 300ml grátis"
                />
              </div>

              {/* Image upload */}
              <div className="admin-loyalty-image-section">
                <label>Imagem de fundo do cartão fidelidade</label>
                {resolveImageUrl(loy.settings?.cardImageUrl) ? (
                  <img
                    src={resolveImageUrl(loy.settings?.cardImageUrl) ?? undefined}
                    alt="Preview do cartão"
                    className="admin-loyalty-image-preview"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                      (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty('display', 'flex');
                    }}
                  />
                ) : null}
                <div
                  className="admin-loyalty-image-placeholder"
                  style={{ display: resolveImageUrl(loy.settings?.cardImageUrl) ? 'none' : 'flex' }}
                >
                  <Upload size={24} />
                  <span>Nenhuma imagem</span>
                </div>
                <div className="admin-loyalty-upload-row">
                  <button
                    className="admin-loyalty-upload-btn"
                    onClick={() => imgInputRef.current?.click()}
                    disabled={loy.isUploading}
                    type="button"
                  >
                    <Upload size={14} />
                    {loy.isUploading ? 'Enviando…' : 'Enviar imagem'}
                  </button>
                  <span className="admin-loyalty-image-hint">
                    Recomendado: 1200×720px · JPG/PNG/WEBP
                  </span>
                </div>
                <input
                  ref={imgInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
              </div>

              {/* Save button */}
              <button
                className="admin-loyalty-save-btn"
                onClick={handleSave}
                disabled={isBusy}
                type="button"
              >
                <Check size={15} />
                {loy.isSaving ? 'Salvando…' : 'Salvar configurações'}
              </button>
            </div>
          </div>

          {/* ── Column 2: Customers ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Search */}
            <div className="admin-loyalty-card">
              <h2 className="admin-loyalty-card-title">
                <Search size={16} />
                Buscar cliente
              </h2>

              <div className="admin-loyalty-search-row">
                <input
                  className="admin-loyalty-search-input"
                  type="text"
                  placeholder="Nome, e-mail ou telefone…"
                  value={loy.searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                <button
                  className="admin-loyalty-search-btn"
                  onClick={() => void loy.searchCustomers(loy.searchQuery)}
                  disabled={loy.isSearching || !loy.searchQuery.trim()}
                  type="button"
                >
                  {loy.isSearching ? '…' : 'Buscar'}
                </button>
              </div>

              {loy.searchResults.length > 0 && (
                <div className="admin-loyalty-customer-list">
                  {loy.searchResults.map((c) => (
                    <div
                      key={c.customerId}
                      className="admin-loyalty-customer-item"
                      onClick={() => void loy.openCustomer(c.customerId)}
                    >
                      <div className="admin-loyalty-customer-info">
                        <span className="admin-loyalty-customer-name">{c.customerName}</span>
                        {c.customerEmail && (
                          <span className="admin-loyalty-customer-email">{c.customerEmail}</span>
                        )}
                      </div>
                      <span className="admin-loyalty-customer-stamps">
                        {c.stamps} selo{c.stamps !== 1 ? 's' : ''}
                        {c.availableRewards > 0 && ` · 🎁 ${c.availableRewards}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {loy.searchQuery && !loy.isSearching && loy.searchResults.length === 0 && (
                <p className="admin-loyalty-empty">Nenhum cliente encontrado.</p>
              )}

              {!loy.searchQuery && (
                <p className="admin-loyalty-empty">
                  Digite para buscar um cliente pelo nome, e-mail ou telefone.
                </p>
              )}
            </div>

            {/* Customer detail */}
            {loy.isLoadingCustomer && (
              <div className="admin-loyalty-card">
                <p className="admin-loyalty-empty">Carregando cliente…</p>
              </div>
            )}

            {loy.selectedCustomer && !loy.isLoadingCustomer && (
              <div className="admin-loyalty-card">
                {/* Detail header */}
                <div className="admin-loyalty-detail-header">
                  <div>
                    <p className="admin-loyalty-detail-name">
                      {loy.selectedCustomer.customerName}
                    </p>
                    <p className="admin-loyalty-detail-meta">
                      {loy.selectedCustomer.customerEmail ?? '—'}
                      {loy.selectedCustomer.customerPhone
                        ? ` · ${loy.selectedCustomer.customerPhone}`
                        : ''}
                    </p>
                  </div>
                  <button
                    className="admin-loyalty-detail-close"
                    onClick={() => loy.setSelectedCustomer(null)}
                    type="button"
                  >
                    <X size={13} /> fechar
                  </button>
                </div>

                {/* Stats */}
                <div className="admin-loyalty-detail-stats">
                  <div className="admin-loyalty-stat-box">
                    <span className="admin-loyalty-stat-label">Selos</span>
                    <span className="admin-loyalty-stat-value">
                      {loy.selectedCustomer.stamps}
                    </span>
                  </div>
                  <div className="admin-loyalty-stat-box">
                    <span className="admin-loyalty-stat-label">Total</span>
                    <span className="admin-loyalty-stat-value">
                      {loy.selectedCustomer.totalEarnedStamps}
                    </span>
                  </div>
                  <div className="admin-loyalty-stat-box">
                    <span className="admin-loyalty-stat-label">Brindes</span>
                    <span className={`admin-loyalty-stat-value${loy.selectedCustomer.availableRewards > 0 ? ' highlight' : ''}`}>
                      {loy.selectedCustomer.availableRewards}
                    </span>
                  </div>
                </div>

                {/* Redeem reward */}
                {loy.selectedCustomer.availableRewards > 0 && (
                  <div className="admin-loyalty-redeem-section">
                    <div className="admin-loyalty-redeem-info">
                      <Gift size={16} />
                      <span>
                        {loy.selectedCustomer.availableRewards}{' '}
                        {loy.selectedCustomer.availableRewards === 1
                          ? 'brinde disponível'
                          : 'brindes disponíveis'}
                      </span>
                    </div>
                    <button
                      className="admin-loyalty-redeem-btn"
                      onClick={() => void loy.redeemReward(loy.selectedCustomer!.customerId)}
                      disabled={loy.isStampAction}
                      type="button"
                    >
                      <Check size={14} />
                      {loy.isStampAction ? 'Processando…' : 'Marcar brinde como entregue'}
                    </button>
                  </div>
                )}

                {/* Stamp form */}
                <div className="admin-loyalty-stamp-form">
                  <p className="admin-loyalty-stamp-form-title">Adicionar / Remover selos</p>
                  <div className="admin-loyalty-stamp-row">
                    <input
                      className="admin-loyalty-input"
                      type="number"
                      min="1"
                      max="50"
                      value={stampQty}
                      onChange={(e) => setStampQty(e.target.value)}
                      placeholder="Qtd"
                      aria-label="Quantidade de selos"
                    />
                    <input
                      className="admin-loyalty-input"
                      type="text"
                      value={stampReason}
                      onChange={(e) => setStampReason(e.target.value)}
                      placeholder="Motivo (opcional)"
                      aria-label="Motivo"
                    />
                  </div>
                  <div className="admin-loyalty-stamp-actions">
                    <button
                      className="admin-loyalty-add-btn"
                      onClick={handleStampAdd}
                      disabled={loy.isStampAction || !stampQty}
                      type="button"
                    >
                      <Plus size={13} />
                      {loy.isStampAction ? '…' : 'Adicionar selos'}
                    </button>
                    <button
                      className="admin-loyalty-remove-btn"
                      onClick={handleStampRemove}
                      disabled={loy.isStampAction || !stampQty}
                      type="button"
                    >
                      <Minus size={13} />
                      {loy.isStampAction ? '…' : 'Remover selos'}
                    </button>
                  </div>
                </div>

                {/* History */}
                {loy.selectedCustomer.history && loy.selectedCustomer.history.length > 0 && (
                  <>
                    <p className="admin-loyalty-detail-history-title">Histórico</p>
                    <div className="admin-loyalty-detail-history-list">
                      {loy.selectedCustomer.history.map((item) => {
                        const isRedeem = item.type === 'REWARD_REDEEMED';
                        return (
                          <div
                            key={item.id}
                            className="admin-loyalty-detail-history-item"
                          >
                            {isRedeem ? (
                              <span className="admin-loyalty-detail-history-qty redeem">
                                🎁 Brinde
                              </span>
                            ) : (
                              <span
                                className={`admin-loyalty-detail-history-qty ${item.quantity > 0 ? 'earned' : 'removed'}`}
                              >
                                {item.quantity > 0 ? '+' : ''}{item.quantity}
                              </span>
                            )}
                            {item.reason && (
                              <span className="admin-loyalty-detail-history-reason">
                                {item.reason}
                              </span>
                            )}
                            <span className="admin-loyalty-detail-history-date">
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
