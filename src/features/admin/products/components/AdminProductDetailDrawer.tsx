import { useState, useEffect } from 'react';
import { X, Pencil, ToggleLeft, ToggleRight, Trash2, Package } from 'lucide-react';
import { formatBRL } from '@/utils/currency.util';
import { formatDate } from '@/utils/date.util';
import { getImageUrl } from '@/utils/image-url.util';
import { safeText, getErrorMessage, isForbiddenError } from '@/utils/format.util';
import { AdminProductVariants } from './AdminProductVariants';
import { AdminProductOptionGroups } from './AdminProductOptionGroups';
import type { Product, ProductVariant, OptionGroup, ProductOptionGroupRelation, CreateProductVariantPayload, UpdateProductVariantPayload } from '@/types/product.types';
import { usePermissions } from '@/hooks/usePermissions';

type Tab = 'details' | 'variants' | 'groups';

function normalizeStr(v?: string | null): string {
  if (!v) return '';
  return v.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function isProductCombo(product: Product): boolean {
  const name = normalizeStr(product.category?.name);
  const slug = normalizeStr(product.category?.slug);
  return name.includes('combo') || slug.includes('combo');
}

interface Props {
  product: Product | null;
  isLoading: boolean;
  isSaving: boolean;
  variants: ProductVariant[];
  productRelations: ProductOptionGroupRelation[];
  allOptionGroups: OptionGroup[];
  isLinkingSaving: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onToggleStatus: (id: string, isActive: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCreateVariant: (productId: string, payload: CreateProductVariantPayload) => Promise<void>;
  onUpdateVariant: (productId: string, variantId: string, payload: UpdateProductVariantPayload) => Promise<void>;
  onDeleteVariant: (productId: string, variantId: string) => Promise<void>;
  onLinkOptionGroup: (productId: string, optionGroupId: string) => Promise<void>;
  onUnlinkOptionGroup: (productId: string, relationId: string) => Promise<void>;
}

export function AdminProductDetailDrawer({
  product, isLoading, isSaving, variants, productRelations, allOptionGroups, isLinkingSaving,
  onClose, onEdit, onToggleStatus, onDelete, onCreateVariant, onUpdateVariant, onDeleteVariant,
  onLinkOptionGroup, onUnlinkOptionGroup,
}: Props) {
  const isOpen = product !== null;
  const { isAdmin, hasPermission } = usePermissions();
  const canManage = isAdmin || hasPermission('MANAGE_PRODUCTS');

  const [tab, setTab] = useState<Tab>('details');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSaving, setActionSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setTab('details');
      setConfirmDelete(false);
      setActionError(null);
    }
  }, [product?.id]);

  async function handleToggleStatus() {
    if (!product) return;
    setActionSaving(true);
    setActionError(null);
    try {
      await onToggleStatus(product.id, !product.isActive);
    } catch (err) {
      setActionError(isForbiddenError(err) ? 'Sem permissão.' : getErrorMessage(err));
    } finally {
      setActionSaving(false);
    }
  }

  async function handleDelete() {
    if (!product) return;
    setActionSaving(true);
    setActionError(null);
    try {
      await onDelete(product.id);
      onClose();
    } catch (err) {
      setActionError(isForbiddenError(err) ? 'Sem permissão.' : getErrorMessage(err));
      setConfirmDelete(false);
    } finally {
      setActionSaving(false);
    }
  }

  const price = product?.basePrice ?? null;
  const imageSrc = getImageUrl(product?.imageUrl);
  const isCombo = product ? isProductCombo(product) : false;

  const TABS: { key: Tab; label: string }[] = [
    { key: 'details', label: 'Detalhes' },
    { key: 'variants', label: `Variações${variants.length > 0 ? ` (${variants.length})` : ''}` },
    { key: 'groups', label: `Adicionais${productRelations.length > 0 ? ` (${productRelations.length})` : ''}` },
  ];

  return (
    <>
      <div
        className="apd-backdrop"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
        onClick={onClose}
      />

      <div className="apd-panel" style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '18px 20px 14px', borderBottom: '1px solid var(--c3)', gap: 12, flexShrink: 0 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--t2)', marginBottom: 2 }}>Produto</p>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isLoading ? 'Carregando…' : safeText(product?.name, 'Sem nome')}
            </h2>
            {product && (
              <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                <StatusBadge active={product.isActive} />
                {isCombo && <ComboBadge />}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        {product && !isLoading && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--c3)', flexShrink: 0 }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1, padding: '10px 6px', background: 'none', border: 'none',
                  borderBottom: `2px solid ${tab === t.key ? 'var(--roxo-v)' : 'transparent'}`,
                  cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                  color: tab === t.key ? 'var(--roxo-c)' : 'var(--t2)',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {isLoading && (
            <p style={{ textAlign: 'center', padding: '48px 0', color: 'var(--t2)' }}>Carregando…</p>
          )}

          {!isLoading && product && (
            <>
              {actionError && (
                <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.12)', color: '#f87171', borderRadius: 'var(--r-md)', fontSize: '0.8rem', marginBottom: 14, border: '1px solid rgba(239,68,68,0.25)' }}>
                  {actionError}
                </div>
              )}

              {/* DETALHES */}
              {tab === 'details' && (
                <>
                  {imageSrc ? (
                    <div style={{ marginBottom: 16, borderRadius: 'var(--r-md)', overflow: 'hidden', background: 'var(--c2)', border: '1px solid var(--c3)' }}>
                      <img src={imageSrc} alt={product.name} style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }} />
                    </div>
                  ) : (
                    <div style={{ marginBottom: 16, borderRadius: 'var(--r-md)', background: 'var(--c2)', border: '1px solid var(--c3)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
                      <Package size={40} style={{ opacity: 0.2 }} />
                    </div>
                  )}

                  <InfoSection title="Informações">
                    <InfoRow label="Nome" value={safeText(product.name)} />
                    <InfoRow label="Slug" value={safeText(product.slug)} mono />
                    {product.description && <InfoRow label="Descrição" value={product.description} />}
                    <InfoRow label="Categoria" value={safeText(product.category?.name ?? null)} />
                    <InfoRow label="Tipo" value={isCombo ? 'Combo' : 'Produto'} />
                    <InfoRow label="Preço" value={price != null ? formatBRL(price) : '—'} last />
                  </InfoSection>

                  <InfoSection title="Datas">
                    <InfoRow label="Criado" value={product.createdAt ? formatDate(product.createdAt) : '—'} />
                    <InfoRow label="Atualizado" value={product.updatedAt ? formatDate(product.updatedAt) : '—'} last />
                  </InfoSection>

                  {canManage && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <ActionBtn icon={<Pencil size={14} />} onClick={() => onEdit(product)} label="Editar" primary />
                        <ActionBtn
                          icon={product.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          onClick={handleToggleStatus}
                          label={product.isActive ? 'Desativar' : 'Ativar'}
                          disabled={actionSaving || isSaving}
                          danger={product.isActive}
                          success={!product.isActive}
                        />
                      </div>

                      {!confirmDelete ? (
                        <button
                          onClick={() => setConfirmDelete(true)}
                          style={{
                            width: '100%', padding: '9px', borderRadius: 'var(--r-md)',
                            border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.07)',
                            color: '#f87171', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          }}
                        >
                          <Trash2 size={13} /> Excluir produto
                        </button>
                      ) : (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--r-md)', padding: 12 }}>
                          <p style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 10, color: '#f87171' }}>Confirmar exclusão?</p>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => setConfirmDelete(false)}
                              style={{ flex: 1, padding: '8px', borderRadius: 'var(--r-md)', border: '1px solid var(--c3)', background: 'var(--c2)', color: 'var(--t2)', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={handleDelete}
                              disabled={actionSaving}
                              style={{ flex: 1, padding: '8px', borderRadius: 'var(--r-md)', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: actionSaving ? 'not-allowed' : 'pointer', fontSize: '0.82rem' }}
                            >
                              {actionSaving ? '…' : 'Excluir'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {tab === 'variants' && (
                <AdminProductVariants
                  productId={product.id}
                  variants={variants}
                  canManage={canManage}
                  onCreate={onCreateVariant}
                  onUpdate={onUpdateVariant}
                  onDelete={onDeleteVariant}
                />
              )}

              {tab === 'groups' && (
                <AdminProductOptionGroups
                  relations={productRelations}
                  availableGroups={allOptionGroups}
                  isCombo={isCombo}
                  isLoading={false}
                  isSaving={isLinkingSaving}
                  onLink={(groupId) => onLinkOptionGroup(product.id, groupId)}
                  onUnlink={(relationId) => onUnlinkOptionGroup(product.id, relationId)}
                />
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .apd-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.55);
          z-index: 990; transition: opacity 0.25s;
        }
        .apd-panel {
          position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 520px;
          background: var(--bg); z-index: 991; display: flex; flex-direction: column;
          transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: -8px 0 32px rgba(0,0,0,0.35);
        }
      `}</style>
    </>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span style={{
      padding: '2px 9px', borderRadius: 'var(--r-full)', fontSize: '0.7rem', fontWeight: 700,
      background: active ? 'rgba(76,175,80,0.15)' : 'rgba(239,68,68,0.15)',
      color: active ? '#4caf50' : '#f87171',
      border: `1px solid ${active ? '#4caf5033' : '#f8717133'}`,
    }}>
      {active ? 'Ativo' : 'Inativo'}
    </span>
  );
}

function ComboBadge() {
  return (
    <span style={{
      padding: '2px 9px', borderRadius: 'var(--r-full)', fontSize: '0.7rem', fontWeight: 700,
      background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)',
    }}>
      Combo
    </span>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{title}</p>
      <div style={{ background: 'var(--c2)', borderRadius: 'var(--r-md)', border: '1px solid var(--c3)', overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

function InfoRow({ label, value, last, mono }: { label: string; value: string; last?: boolean; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '10px 14px', borderBottom: last ? 'none' : '1px solid var(--c3)', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--t2)', width: 84, flexShrink: 0, paddingTop: 1 }}>{label}</span>
      <span style={{ fontSize: mono ? '0.78rem' : '0.85rem', fontWeight: 500, flex: 1, wordBreak: 'break-all', fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</span>
    </div>
  );
}

function ActionBtn({
  icon, onClick, label, primary, danger, success, disabled, fullWidth,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
  primary?: boolean;
  danger?: boolean;
  success?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  const bg = primary ? 'var(--roxo-v)' : danger ? 'rgba(239,68,68,0.1)' : success ? 'rgba(76,175,80,0.1)' : 'var(--c2)';
  const color = primary ? '#fff' : danger ? '#f87171' : success ? '#4caf50' : 'var(--t2)';
  const border = primary ? 'none' : `1px solid ${danger ? 'rgba(239,68,68,0.25)' : success ? 'rgba(76,175,80,0.25)' : 'var(--c3)'}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: fullWidth ? undefined : 1, width: fullWidth ? '100%' : undefined,
        padding: '9px 12px', borderRadius: 'var(--r-md)', border,
        background: bg, color, fontWeight: 600, fontSize: '0.82rem',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}
    >
      {icon} {label}
    </button>
  );
}
