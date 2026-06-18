import { useState } from 'react';
import { Plus, Search, Tag, ToggleLeft, ToggleRight, Pencil, Trash2, Percent, Gift } from 'lucide-react';
import { useAdminPromotions } from '@/hooks/useAdminPromotions';
import type { PromotionFilter } from '@/hooks/useAdminPromotions';
import { PromotionFormModal } from '../components/PromotionFormModal';
import { formatBRL } from '@/utils/currency.util';
import type { Promotion, PromotionType } from '@/types/promotion.types';

export function AdminPromotionsPage() {
  const {
    promotions, filteredPromotions, products,
    isLoading, isSaving,
    filter, setFilter, searchTerm, setSearchTerm,
    createPromotion, updatePromotion, togglePromotionStatus, deletePromotion,
  } = useAdminPromotions();

  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const totalActive = promotions.filter((p) => p.isActive).length;
  const totalInactive = promotions.filter((p) => !p.isActive).length;
  const totalBuyXGetY = promotions.filter((p) => p.type === 'BUY_X_GET_Y').length;
  const totalPercent = promotions.filter((p) => p.type === 'PERCENTAGE_DISCOUNT').length;
  const totalCoupons = promotions.filter((p) => p.type === 'COUPON_PERCENTAGE_DISCOUNT').length;

  function handleEdit(promo: Promotion) {
    setEditingPromotion(promo);
    setShowForm(true);
  }

  function handleNew() {
    setEditingPromotion(null);
    setShowForm(true);
  }

  async function handleSave(payload: Parameters<typeof createPromotion>[0]) {
    if (editingPromotion) {
      await updatePromotion(editingPromotion.id, payload);
    } else {
      await createPromotion(payload);
    }
  }

  async function handleDelete(id: string) {
    await deletePromotion(id);
    setConfirmDeleteId(null);
  }

  const FILTERS: { value: PromotionFilter; label: string }[] = [
    { value: 'ALL', label: 'Todas' },
    { value: 'ACTIVE', label: 'Ativas' },
    { value: 'INACTIVE', label: 'Inativas' },
    { value: 'BUY_X_GET_Y', label: 'Compre X leve Y' },
    { value: 'PERCENTAGE_DISCOUNT', label: 'Desconto %' },
    { value: 'COUPON_PERCENTAGE_DISCOUNT', label: 'Cupons' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Promoções</h1>
        <button
          onClick={handleNew}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'var(--roxo-v)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
        >
          <Plus size={16} /> Nova promoção
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <SummaryCard label="Total" value={promotions.length} color="var(--txt)" />
        <SummaryCard label="Ativas" value={totalActive} color="#22c55e" />
        <SummaryCard label="Inativas" value={totalInactive} color="var(--t2)" />
        <SummaryCard label="Compre X Leve Y" value={totalBuyXGetY} color="var(--roxo-c)" />
        <SummaryCard label="Desconto %" value={totalPercent} color="var(--am)" />
        <SummaryCard label="Cupons" value={totalCoupons} color="#22c55e" />
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--t2)', pointerEvents: 'none' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar promoção ou produto…"
            style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 'var(--r-md)', border: '1px solid var(--c3)', background: 'var(--c2)', color: 'var(--txt)', fontSize: '0.875rem', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--r-full)', fontSize: '0.8rem', fontWeight: 600,
                border: `1px solid ${filter === f.value ? 'var(--roxo-v)' : 'var(--c3)'}`,
                background: filter === f.value ? 'var(--roxo-v)' : 'transparent',
                color: filter === f.value ? '#fff' : 'var(--t2)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <p style={{ textAlign: 'center', padding: '48px 0', color: 'var(--t2)' }}>Carregando promoções…</p>
      )}

      {/* Empty */}
      {!isLoading && filteredPromotions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Tag size={40} style={{ opacity: 0.2, margin: '0 auto 12px', display: 'block' }} />
          <p style={{ color: 'var(--t2)' }}>
            {searchTerm || filter !== 'ALL'
              ? 'Nenhuma promoção encontrada para os filtros aplicados.'
              : 'Nenhuma promoção cadastrada. Crie a primeira!'}
          </p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && filteredPromotions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filteredPromotions.map((promo) => (
            <PromotionCard
              key={promo.id}
              promotion={promo}
              onEdit={() => handleEdit(promo)}
              onToggle={() => togglePromotionStatus(promo)}
              onDelete={() => setConfirmDeleteId(promo.id)}
              confirmingDelete={confirmDeleteId === promo.id}
              onConfirmDelete={() => handleDelete(promo.id)}
              onCancelDelete={() => setConfirmDeleteId(null)}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <PromotionFormModal
          promotion={editingPromotion}
          products={products}
          isSaving={isSaving}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingPromotion(null); }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                       */
/* ------------------------------------------------------------------ */

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: 'var(--c2)', border: '1px solid var(--c3)', borderRadius: 'var(--r-lg)', padding: '14px 16px' }}>
      <p style={{ fontSize: '0.72rem', color: 'var(--t2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: 900, color }}>{value}</p>
    </div>
  );
}

function PromotionTypeBadge({ type }: { type: PromotionType }) {
  if (type === 'BUY_X_GET_Y') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 'var(--r-full)', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(168,85,247,0.15)', color: 'var(--roxo-c)', border: '1px solid rgba(168,85,247,0.3)' }}>
        <Gift size={11} /> Compre X Leve Y
      </span>
    );
  }
  if (type === 'COUPON_PERCENTAGE_DISCOUNT') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 'var(--r-full)', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
        <Tag size={11} /> Cupom
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 'var(--r-full)', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
      <Percent size={11} /> Desconto %
    </span>
  );
}

function PromotionCard({
  promotion, onEdit, onToggle, onDelete,
  confirmingDelete, onConfirmDelete, onCancelDelete,
}: {
  promotion: Promotion;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  confirmingDelete: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  const pct =
    promotion.type === 'PERCENTAGE_DISCOUNT' || promotion.type === 'COUPON_PERCENTAGE_DISCOUNT'
      ? Number(promotion.discountPercent ?? 0)
      : null;

  const buyProductName = promotion.buyProduct?.name ?? '—';
  const rewardProductName = promotion.rewardProduct?.name;

  const endsAtDate = promotion.endsAt ? new Date(promotion.endsAt) : null;
  const isExpired = endsAtDate ? endsAtDate < new Date() : false;

  return (
    <div style={{ background: 'var(--card)', border: `1px solid ${isExpired ? 'rgba(239,68,68,0.3)' : 'var(--c3)'}`, borderRadius: 'var(--r-lg)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{promotion.name}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <PromotionTypeBadge type={promotion.type} />
            <StatusBadge active={promotion.isActive} expired={isExpired} />
          </div>
        </div>
      </div>

      {/* Description */}
      {promotion.description && (
        <p style={{ fontSize: '0.78rem', color: 'var(--t2)', lineHeight: 1.4 }}>{promotion.description}</p>
      )}

      {/* Rule */}
      <div style={{ background: 'var(--c2)', borderRadius: 'var(--r-md)', padding: '10px 12px', fontSize: '0.82rem' }}>
        {promotion.type === 'COUPON_PERCENTAGE_DISCOUNT' ? (
          <p>
            <span style={{ color: 'var(--t2)' }}>Cupom </span>
            <strong style={{ color: '#22c55e' }}>{promotion.couponCode ?? '—'}</strong>
            <span style={{ color: 'var(--t2)' }}> · </span>
            <strong style={{ color: '#22c55e' }}>{pct ?? 0}% OFF</strong>
            {(promotion.eligibleProducts?.length ?? 0) > 0 && (
              <>
                <span style={{ color: 'var(--t2)' }}> em </span>
                <strong>{promotion.eligibleProducts!.length} produto{promotion.eligibleProducts!.length !== 1 ? 's' : ''}</strong>
              </>
            )}
          </p>
        ) : promotion.type === 'PERCENTAGE_DISCOUNT' ? (
          <p>
            <span style={{ color: 'var(--t2)' }}>Compre </span>
            <strong style={{ color: 'var(--am)' }}>{promotion.buyQuantity}×</strong>
            <span style={{ color: 'var(--t2)' }}> de </span>
            <strong>{buyProductName}</strong>
            <span style={{ color: 'var(--t2)' }}> → </span>
            <strong style={{ color: '#22c55e' }}>{pct}% OFF</strong>
          </p>
        ) : (
          <p>
            <span style={{ color: 'var(--t2)' }}>Compre </span>
            <strong style={{ color: 'var(--am)' }}>{promotion.buyQuantity}×</strong>
            <span style={{ color: 'var(--t2)' }}> de </span>
            <strong>{buyProductName}</strong>
            <span style={{ color: 'var(--t2)' }}> → ganhe </span>
            <strong style={{ color: 'var(--roxo-c)' }}>{promotion.rewardQuantity}×</strong>
            <span style={{ color: 'var(--t2)' }}> de </span>
            <strong>{rewardProductName ?? '—'}</strong>
          </p>
        )}
      </div>

      {/* Dates */}
      {(promotion.startsAt || promotion.endsAt) && (
        <p style={{ fontSize: '0.72rem', color: isExpired ? '#f87171' : 'var(--t3)' }}>
          {promotion.startsAt && `De ${new Date(promotion.startsAt).toLocaleDateString('pt-BR')} `}
          {promotion.endsAt && `até ${new Date(promotion.endsAt).toLocaleDateString('pt-BR')}`}
          {isExpired && ' · Expirada'}
        </p>
      )}

      {/* Buy product price */}
      {promotion.buyProduct?.basePrice != null && (
        <p style={{ fontSize: '0.75rem', color: 'var(--t2)' }}>
          Preço: <strong style={{ color: 'var(--am)' }}>{formatBRL(promotion.buyProduct.basePrice)}</strong>
        </p>
      )}

      {/* Actions */}
      {confirmingDelete ? (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--r-md)', padding: 10 }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f87171', marginBottom: 8 }}>Excluir esta promoção?</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onCancelDelete} style={{ flex: 1, padding: '7px', borderRadius: 'var(--r-md)', border: '1px solid var(--c3)', background: 'var(--c2)', color: 'var(--t2)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
              Cancelar
            </button>
            <button onClick={onConfirmDelete} style={{ flex: 1, padding: '7px', borderRadius: 'var(--r-md)', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
              Excluir
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <ActionBtn icon={<Pencil size={13} />} label="Editar" onClick={onEdit} />
          <ActionBtn
            icon={promotion.isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
            label={promotion.isActive ? 'Desativar' : 'Ativar'}
            onClick={onToggle}
            danger={promotion.isActive}
            success={!promotion.isActive}
          />
          <ActionBtn icon={<Trash2 size={13} />} label="Excluir" onClick={onDelete} danger />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ active, expired }: { active: boolean; expired: boolean }) {
  const color = expired ? '#f87171' : active ? '#22c55e' : 'var(--t2)';
  const bg = expired ? 'rgba(239,68,68,0.12)' : active ? 'rgba(34,197,94,0.12)' : 'rgba(148,163,184,0.12)';
  const border = expired ? 'rgba(239,68,68,0.25)' : active ? 'rgba(34,197,94,0.25)' : 'rgba(148,163,184,0.2)';
  const label = expired ? 'Expirada' : active ? 'Ativa' : 'Inativa';
  return (
    <span style={{ padding: '2px 9px', borderRadius: 'var(--r-full)', fontSize: '0.7rem', fontWeight: 700, background: bg, color, border: `1px solid ${border}` }}>
      {label}
    </span>
  );
}

function ActionBtn({ icon, label, onClick, danger, success }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean; success?: boolean }) {
  const bg = danger ? 'rgba(239,68,68,0.08)' : success ? 'rgba(34,197,94,0.08)' : 'var(--c2)';
  const color = danger ? '#f87171' : success ? '#22c55e' : 'var(--t2)';
  const border = danger ? 'rgba(239,68,68,0.2)' : success ? 'rgba(34,197,94,0.2)' : 'var(--c3)';
  return (
    <button
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 'var(--r-md)', border: `1px solid ${border}`, background: bg, color, fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}
    >
      {icon} {label}
    </button>
  );
}
