import { useEffect, useRef, useState } from 'react';
import { Store, Building2, Upload, Pencil, Trash2, ToggleLeft, ToggleRight, X, Check } from 'lucide-react';
import { useAdminStore } from '@/hooks/useAdminStore';
import { usePermissions } from '@/hooks/usePermissions';
import { formatBRL } from '@/utils/currency.util';
import { safeText } from '@/utils/safe-text.util';
import { generateSlug } from '@/utils/slug.util';
import { getImageUrl } from '@/utils/image-url.util';
import { getErrorMessage, isForbiddenError } from '@/utils/format.util';
import type { Store as StoreType, CreateStorePayload, UpdateStorePayload } from '@/types/store.types';
import { AdminStoreAvailabilityPanel } from '../components/AdminStoreAvailabilityPanel';

export function AdminStorePage() {
  const {
    store, setStore, isLoading, isSaving, isUploading, error,
    loadStore, createStore, updateStore, deleteStore, uploadLogo,
  } = useAdminStore();

  const { isAdmin } = usePermissions();

  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => { loadStore(); }, [loadStore]);

  async function handleDelete(id: string) {
    try {
      await deleteStore(id);
      setDeleteConfirm(null);
    } catch (err) {
      setActionError(isForbiddenError(err) ? 'Sem permissão.' : getErrorMessage(err));
      setDeleteConfirm(null);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Loja</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--t2)', marginTop: 2 }}>
            Gerencie os dados da loja, logo e status
          </p>
        </div>
        {isAdmin && !store && (
          <button
            onClick={() => { setEditingStore(null); setShowForm(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'var(--roxo-v)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <Store size={15} /> Nova loja
          </button>
        )}
      </div>

      {actionError && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: 'var(--r-md)', marginBottom: 14, border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {actionError}
          <button onClick={() => setActionError(null)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 700, marginLeft: 10 }}>×</button>
        </div>
      )}

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: 'var(--r-md)', marginBottom: 14, border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.85rem' }}>{error}</div>
      )}

      {isLoading && <p style={{ textAlign: 'center', padding: '48px 0', color: 'var(--t2)' }}>Carregando…</p>}

      {!isLoading && !store && !error && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Building2 size={48} color="var(--t3)" style={{ marginBottom: 12 }} />
          <p style={{ color: 'var(--t2)', marginBottom: 16 }}>Nenhuma loja cadastrada.</p>
          {isAdmin && (
            <button
              onClick={() => { setEditingStore(null); setShowForm(true); }}
              style={{ padding: '10px 20px', background: 'var(--roxo-v)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', fontWeight: 700, cursor: 'pointer' }}
            >
              Criar loja
            </button>
          )}
        </div>
      )}

      {!isLoading && store && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <StoreCard
            store={store}
            isAdmin={isAdmin}
            isSaving={isSaving}
            isUploading={isUploading}
            deleteConfirm={deleteConfirm === store.id}
            onEdit={() => { setEditingStore(store); setShowForm(true); }}
            onDeleteRequest={() => setDeleteConfirm(store.id)}
            onDeleteConfirm={() => handleDelete(store.id)}
            onDeleteCancel={() => setDeleteConfirm(null)}
            onToggleActive={() => updateStore({ isActive: !store.isActive })}
            onUploadLogo={uploadLogo}
            onLogoUploaded={(url) => updateStore({ logoUrl: url })}
          />
          <AdminStoreAvailabilityPanel store={store} onStoreUpdated={setStore} />
        </div>
      )}

      {showForm && (
        <StoreFormModal
          store={editingStore}
          isSaving={isSaving}
          onClose={() => { setShowForm(false); setEditingStore(null); }}
          onCreate={async (p) => { await createStore(p); setShowForm(false); }}
          onUpdate={async (p) => { await updateStore(p); setShowForm(false); setEditingStore(null); }}
        />
      )}
    </div>
  );
}

// ── StoreCard ─────────────────────────────────────────────────────────────────

function StoreCard({
  store, isAdmin, isSaving, isUploading, deleteConfirm,
  onEdit, onDeleteRequest, onDeleteConfirm, onDeleteCancel,
  onToggleActive, onUploadLogo, onLogoUploaded,
}: {
  store: StoreType; isAdmin: boolean; isSaving: boolean; isUploading: boolean;
  deleteConfirm: boolean;
  onEdit: () => void; onDeleteRequest: () => void; onDeleteConfirm: () => void; onDeleteCancel: () => void;
  onToggleActive: () => void;
  onUploadLogo: (file: File) => Promise<string>;
  onLogoUploaded: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const logoSrc = getImageUrl(store.logoUrl);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await onUploadLogo(file);
      onLogoUploaded(url);
    } catch {
      // error handled by hook
    }
    e.target.value = '';
  }

  const deliveryRange =
    store.minDeliveryMinutes || store.maxDeliveryMinutes
      ? `${store.minDeliveryMinutes ?? '?'}–${store.maxDeliveryMinutes ?? '?'} min`
      : null;

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--c3)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 16px 12px', gap: 14 }}>
        {/* Logo */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div
            onClick={() => isAdmin && fileRef.current?.click()}
            style={{
              width: 72, height: 72, borderRadius: 'var(--r-md)',
              background: 'var(--c2)', border: '1px solid var(--c3)',
              overflow: 'hidden', cursor: isAdmin ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {logoSrc ? (
              <img src={logoSrc} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Building2 size={28} color="var(--t3)" />
            )}
            {isUploading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-md)' }}>
                <span style={{ fontSize: '0.65rem', color: '#fff', fontWeight: 700 }}>…</span>
              </div>
            )}
          </div>
          {isAdmin && (
            <div style={{ position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, background: 'var(--roxo-v)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)', cursor: 'pointer' }}
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={11} color="#fff" />
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleLogoChange} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1rem' }}>{store.name || '—'}</h2>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-full)',
              background: store.isActive ? 'rgba(76,175,80,0.12)' : 'rgba(239,68,68,0.12)',
              color: store.isActive ? '#4caf50' : '#f87171',
              border: `1px solid ${store.isActive ? 'rgba(76,175,80,0.25)' : 'rgba(239,68,68,0.25)'}`,
            }}>
              {store.isActive ? 'Ativa' : 'Inativa'}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--t3)', marginTop: 1 }}>slug: {store.slug ?? '—'}</p>
        </div>

        {/* Actions */}
        {isAdmin && (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <IBtn title="Editar" onClick={onEdit}><Pencil size={13} /></IBtn>
            <IBtn title={store.isActive ? 'Desativar' : 'Ativar'} onClick={onToggleActive}>
              {store.isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
            </IBtn>
            {deleteConfirm ? (
              <>
                <button onClick={onDeleteCancel} style={sBtn}>Não</button>
                <button onClick={onDeleteConfirm} style={{ ...sBtn, color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>{isSaving ? '…' : 'Sim'}</button>
              </>
            ) : (
              <IBtn danger title="Excluir" onClick={onDeleteRequest}><Trash2 size={13} /></IBtn>
            )}
          </div>
        )}
      </div>

      {/* Details grid */}
      <div className="store-info-grid">
        <InfoRow label="WhatsApp" value={store.whatsappNumber} />
        <InfoRow label="iFood">
          {store.ifoodUrl ? (
            <a href={store.ifoodUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--roxo-c)', textDecoration: 'underline' }}>
              Abrir iFood
            </a>
          ) : (
            <span style={{ color: 'var(--t3)' }}>—</span>
          )}
        </InfoRow>
        <InfoRow label="Pix" value={store.pixKey ? `${store.pixKey} (${store.pixKeyType ?? '?'})` : null} />
        <InfoRow label="Avaliação" value={store.rating ? `${store.rating} / 5` : null} />
        <InfoRow label="Tempo de entrega" value={deliveryRange} />
        <InfoRow label="Pedido mínimo" value={formatBRL(Number(store.minimumOrderAmount ?? 0))} />
      </div>

      <style>{`
        .store-info-grid {
          padding: 0 16px 16px;
          display: grid;
          grid-template-columns: repeat(5, minmax(160px, 1fr));
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .store-info-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .store-info-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {isAdmin && (
        <div style={{ padding: '8px 16px 12px', borderTop: '1px solid var(--c3)' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--t3)', lineHeight: 1.4 }}>
            Clique no logo para trocar · Desativar a loja oculta do cardápio público até ser reativada
          </p>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, children }: { label: string; value?: string | null | undefined; children?: React.ReactNode }) {
  return (
    <div style={{ minWidth: 0, overflow: 'hidden' }}>
      <span style={{ fontSize: '0.7rem', color: 'var(--t3)', fontWeight: 600 }}>{label}</span>
      <div style={{ fontSize: '0.82rem', color: (value || children) ? 'var(--txt)' : 'var(--t3)', marginTop: 1, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
        {children ? children : safeText(value)}
      </div>
    </div>
  );
}

const sBtn: React.CSSProperties = {
  padding: '3px 8px', borderRadius: 'var(--r-full)', border: '1px solid var(--c3)',
  background: 'var(--c2)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
};

function IBtn({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title?: string; danger?: boolean }) {
  return (
    <button title={title} onClick={onClick}
      style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-md)', border: '1px solid var(--c3)', background: 'none', color: danger ? '#f87171' : 'var(--t2)', cursor: 'pointer' }}
    >
      {children}
    </button>
  );
}

// ── StoreFormModal ────────────────────────────────────────────────────────────

function StoreFormModal({ store, isSaving, onClose, onCreate, onUpdate }: {
  store: StoreType | null; isSaving: boolean;
  onClose: () => void;
  onCreate: (p: CreateStorePayload) => Promise<void>;
  onUpdate: (p: UpdateStorePayload) => Promise<void>;
}) {
  const isEdit = store != null;
  const [name, setName] = useState(store?.name ?? '');
  const [slug, setSlug] = useState(store?.slug ?? '');
  const [whatsappNumber, setWhatsappNumber] = useState(store?.whatsappNumber ?? '');
  const [ifoodUrl, setIfoodUrl] = useState(store?.ifoodUrl ?? '');
  const [pixKey, setPixKey] = useState(store?.pixKey ?? '');
  const [pixKeyType, setPixKeyType] = useState(store?.pixKeyType ?? '');
  const [rating, setRating] = useState(store?.rating ?? '');
  const [minDelivery, setMinDelivery] = useState(String(store?.minDeliveryMinutes ?? ''));
  const [maxDelivery, setMaxDelivery] = useState(String(store?.maxDeliveryMinutes ?? ''));
  const [minOrder, setMinOrder] = useState(store?.minimumOrderAmount ?? '');
  const [isActive, setIsActive] = useState(store?.isActive ?? true);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleNameChange(v: string) {
    setName(v);
    if (!isEdit) setSlug(generateSlug(v));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) { setFormError('Nome é obrigatório.'); return; }
    if (!slug.trim()) { setFormError('Slug é obrigatório.'); return; }

    const payload: CreateStorePayload = {
      name: name.trim(),
      slug: slug.trim(),
      whatsappNumber: whatsappNumber.trim() || null,
      ifoodUrl: ifoodUrl.trim() || null,
      pixKey: pixKey.trim() || null,
      pixKeyType: pixKeyType.trim() || null,
      rating: rating ? Number(rating) : null,
      minDeliveryMinutes: minDelivery ? parseInt(minDelivery, 10) : null,
      maxDeliveryMinutes: maxDelivery ? parseInt(maxDelivery, 10) : null,
      minimumOrderAmount: minOrder ? Number(String(minOrder).replace(',', '.')) : null,
      isActive,
    };

    setSaving(true);
    try {
      if (isEdit) await onUpdate(payload);
      else await onCreate(payload);
      onClose();
    } catch (err) {
      setFormError(isForbiddenError(err) ? 'Sem permissão.' : getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '92%', maxWidth: 560, maxHeight: '88dvh', overflowY: 'auto', background: 'var(--bg)', borderRadius: 'var(--r-lg)', zIndex: 1001, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: '1px solid var(--c3)', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 1 }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem' }}>{isEdit ? 'Editar loja' : 'Nova loja'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {formError && (
            <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.12)', color: '#f87171', borderRadius: 'var(--r-md)', fontSize: '0.8rem' }}>{formError}</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FF label="Nome *">
              <input value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Se Liga no Açaí" className="sf-in" />
            </FF>
            <FF label="Slug *">
              <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="se-liga-no-acai" className="sf-in" />
            </FF>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FF label="WhatsApp">
              <input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="(11) 99999-9999" className="sf-in" />
            </FF>
            <FF label="Link iFood">
              <input value={ifoodUrl} onChange={(e) => setIfoodUrl(e.target.value)} placeholder="https://ifood.com.br/..." className="sf-in" />
            </FF>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FF label="Chave Pix">
              <input value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="email, CPF, telefone…" className="sf-in" />
            </FF>
            <FF label="Tipo Pix">
              <input value={pixKeyType} onChange={(e) => setPixKeyType(e.target.value)} placeholder="CPF, EMAIL, PHONE…" className="sf-in" />
            </FF>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <FF label="Tempo mín. (min)">
              <input type="number" value={minDelivery} onChange={(e) => setMinDelivery(e.target.value)} min={0} placeholder="30" className="sf-in" />
            </FF>
            <FF label="Tempo máx. (min)">
              <input type="number" value={maxDelivery} onChange={(e) => setMaxDelivery(e.target.value)} min={0} placeholder="60" className="sf-in" />
            </FF>
            <FF label="Pedido mínimo (R$)">
              <input value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="0,00" inputMode="decimal" className="sf-in" />
            </FF>
          </div>

          <FF label="Avaliação (0–5)">
            <input type="number" value={rating} onChange={(e) => setRating(e.target.value)} min={0} max={5} step={0.1} placeholder="4.8" className="sf-in" style={{ maxWidth: 160 }} />
          </FF>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={{ accentColor: 'var(--roxo-v)' }} />
            Loja ativa (visível no cardápio)
          </label>

          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 'var(--r-md)', border: '1px solid var(--c3)', background: 'var(--c2)', color: 'var(--txt)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={saving || isSaving} style={{ flex: 1, padding: '10px', borderRadius: 'var(--r-md)', border: 'none', background: 'var(--roxo-v)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', opacity: (saving || isSaving) ? 0.65 : 1 }}>
              {saving ? 'Salvando…' : isEdit ? 'Salvar' : 'Criar loja'}
            </button>
          </div>
        </form>

        <style>{`.sf-in { width: 100%; padding: 9px 12px; border: 1px solid var(--c3); border-radius: var(--r-md); background: var(--c2); color: var(--txt); font-size: 0.875rem; box-sizing: border-box; font-family: inherit; } .sf-in:focus { outline: none; border-color: var(--roxo-v); }`}</style>
      </div>
    </>
  );
}

const fLbl: React.CSSProperties = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--t2)', marginBottom: 5 };
function FF({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={fLbl}>{label}</label>{children}</div>;
}
