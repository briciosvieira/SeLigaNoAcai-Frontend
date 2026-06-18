import { useEffect, useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search, X } from 'lucide-react';
import { useAdminDeliveryZones, type ZoneStatusFilter } from '@/hooks/useAdminDeliveryZones';
import { usePermissions } from '@/hooks/usePermissions';
import { formatBRL } from '@/utils/currency.util';
import { parseBRLInput } from '@/utils/number.util';
import { generateSlug } from '@/utils/slug.util';
import { getErrorMessage, isForbiddenError } from '@/utils/format.util';
import type { DeliveryZone, CreateDeliveryZonePayload, UpdateDeliveryZonePayload } from '@/types/delivery-zone.types';

export function AdminDeliveryZonesPage() {
  const {
    zones, allZones, currentStore, isLoading, isSaving, error,
    searchTerm, setSearchTerm, statusFilter, setStatusFilter,
    loadZones, createZone, updateZone, updateZoneStatus, deleteZone,
  } = useAdminDeliveryZones();

  const { isAdmin, hasPermission } = usePermissions();
  const canManage = isAdmin || hasPermission('MANAGE_DELIVERY_ZONES');

  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => { loadZones(); }, []);

  async function handleDelete(id: string) {
    try {
      await deleteZone(id);
      setDeleteConfirm(null);
    } catch (err) {
      setActionError(isForbiddenError(err) ? 'Sem permissão.' : getErrorMessage(err));
      setDeleteConfirm(null);
    }
  }

  async function handleToggle(zone: DeliveryZone) {
    try {
      await updateZoneStatus(zone.id, !zone.isAvailable);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  const availableCount = allZones.filter((z) => z.isAvailable).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Zonas de entrega</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--t2)', marginTop: 2 }}>
            {allZones.length} zona{allZones.length !== 1 ? 's' : ''} · {availableCount} disponíve{availableCount !== 1 ? 'is' : 'l'}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => { setEditingZone(null); setShowForm(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'var(--roxo-v)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <Plus size={15} /> Nova zona
          </button>
        )}
      </div>

      {/* No store warning */}
      {!isLoading && !currentStore && (
        <div style={{ padding: '10px 14px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', borderRadius: 'var(--r-md)', marginBottom: 14, border: '1px solid rgba(245,158,11,0.25)', fontSize: '0.85rem' }}>
          Nenhuma loja ativa encontrada. Crie uma loja em <strong>/admin/store</strong> antes de criar zonas de entrega.
        </div>
      )}

      {actionError && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: 'var(--r-md)', marginBottom: 14, border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {actionError}
          <button onClick={() => setActionError(null)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 700, marginLeft: 10 }}>×</button>
        </div>
      )}

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: 'var(--r-md)', marginBottom: 14, border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.85rem' }}>{error}</div>
      )}

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--t2)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Buscar bairro, cidade ou estado…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 33px', border: '1px solid var(--c3)', borderRadius: 'var(--r-md)', background: 'var(--c2)', color: 'var(--txt)', fontSize: '0.875rem', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'available', 'unavailable'] as ZoneStatusFilter[]).map((f) => {
            const label = f === 'all' ? 'Todos' : f === 'available' ? 'Disponíveis' : 'Indisponíveis';
            return (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                style={{
                  padding: '7px 14px', borderRadius: 'var(--r-full)', border: '1px solid var(--c3)',
                  background: statusFilter === f ? 'var(--roxo-v)' : 'var(--c2)',
                  color: statusFilter === f ? '#fff' : 'var(--t2)',
                  fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading && <p style={{ textAlign: 'center', padding: '48px 0', color: 'var(--t2)' }}>Carregando zonas…</p>}

      {!isLoading && zones.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <MapPin size={48} color="var(--t3)" style={{ marginBottom: 12 }} />
          <p style={{ color: 'var(--t2)' }}>
            {searchTerm || statusFilter !== 'all'
              ? 'Nenhuma zona encontrada para este filtro.'
              : 'Nenhuma zona de entrega cadastrada.'}
          </p>
        </div>
      )}

      {!isLoading && zones.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {zones.map((zone) => (
            <ZoneRow
              key={zone.id}
              zone={zone}
              canManage={canManage}
              isSaving={isSaving}
              deleteConfirm={deleteConfirm === zone.id}
              onEdit={() => { setEditingZone(zone); setShowForm(true); }}
              onToggle={() => handleToggle(zone)}
              onDeleteRequest={() => setDeleteConfirm(zone.id)}
              onDeleteConfirm={() => handleDelete(zone.id)}
              onDeleteCancel={() => setDeleteConfirm(null)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <ZoneFormModal
          zone={editingZone}
          storeId={currentStore?.id ?? ''}
          isSaving={isSaving}
          onClose={() => { setShowForm(false); setEditingZone(null); }}
          onCreate={async (p) => { await createZone(p); setShowForm(false); }}
          onUpdate={async (id, p) => { await updateZone(id, p); setShowForm(false); setEditingZone(null); }}
        />
      )}
    </div>
  );
}

// ── ZoneRow ───────────────────────────────────────────────────────────────────

function ZoneRow({
  zone, canManage, isSaving, deleteConfirm,
  onEdit, onToggle, onDeleteRequest, onDeleteConfirm, onDeleteCancel,
}: {
  zone: DeliveryZone; canManage: boolean; isSaving: boolean; deleteConfirm: boolean;
  onEdit: () => void; onToggle: () => void;
  onDeleteRequest: () => void; onDeleteConfirm: () => void; onDeleteCancel: () => void;
}) {
  const fee = Number(zone.deliveryFee);
  const feeLabel = fee === 0 ? 'Grátis' : formatBRL(fee);

  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--c3)', borderRadius: 'var(--r-lg)',
      padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
      opacity: zone.isAvailable ? 1 : 0.65,
    }}>
      <MapPin size={18} color={zone.isAvailable ? 'var(--roxo-c)' : 'var(--t3)'} style={{ flexShrink: 0 }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{zone.neighborhood}</p>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, padding: '1px 7px', borderRadius: 'var(--r-full)',
            background: zone.isAvailable ? 'rgba(76,175,80,0.12)' : 'rgba(239,68,68,0.12)',
            color: zone.isAvailable ? '#4caf50' : '#f87171',
            border: `1px solid ${zone.isAvailable ? 'rgba(76,175,80,0.25)' : 'rgba(239,68,68,0.25)'}`,
          }}>
            {zone.isAvailable ? 'Disponível' : 'Indisponível'}
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--t2)', marginTop: 2 }}>
          {zone.city} · {zone.state}
        </p>
      </div>

      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        <p style={{ fontWeight: 800, color: 'var(--am)', fontSize: '0.9rem' }}>{feeLabel}</p>
        <p style={{ fontSize: '0.7rem', color: 'var(--t3)', marginTop: 1 }}>taxa de entrega</p>
      </div>

      {canManage && (
        deleteConfirm ? (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button onClick={onDeleteCancel} style={sBtn}>Não</button>
            <button onClick={onDeleteConfirm} style={{ ...sBtn, color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>
              {isSaving ? '…' : 'Sim'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <IBtn title="Editar" onClick={onEdit}><Pencil size={12} /></IBtn>
            <IBtn title={zone.isAvailable ? 'Tornar indisponível' : 'Tornar disponível'} onClick={onToggle}>
              {zone.isAvailable ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
            </IBtn>
            <IBtn title="Excluir" danger onClick={onDeleteRequest}><Trash2 size={12} /></IBtn>
          </div>
        )
      )}
    </div>
  );
}

// ── ZoneFormModal ─────────────────────────────────────────────────────────────

function ZoneFormModal({ zone, storeId, isSaving, onClose, onCreate, onUpdate }: {
  zone: DeliveryZone | null; storeId: string; isSaving: boolean;
  onClose: () => void;
  onCreate: (p: CreateDeliveryZonePayload) => Promise<void>;
  onUpdate: (id: string, p: UpdateDeliveryZonePayload) => Promise<void>;
}) {
  const isEdit = zone != null;
  const [neighborhood, setNeighborhood] = useState(zone?.neighborhood ?? '');
  const [city, setCity] = useState(zone?.city ?? '');
  const [state, setState] = useState(zone?.state ?? '');
  const [deliveryFee, setDeliveryFee] = useState(zone?.deliveryFee ?? '');
  const [isAvailable, setIsAvailable] = useState(zone?.isAvailable ?? true);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!neighborhood.trim()) { setFormError('Bairro é obrigatório.'); return; }
    if (!city.trim()) { setFormError('Cidade é obrigatória.'); return; }
    if (state.trim().length !== 2) { setFormError('Estado deve ter exatamente 2 caracteres (ex: SP).'); return; }
    if (!deliveryFee) { setFormError('Taxa de entrega é obrigatória.'); return; }

    // Convert to string for backend (which expects string and converts to Decimal)
    const feeStr = String(parseBRLInput(deliveryFee));

    setSaving(true);
    try {
      if (isEdit && zone) {
        await onUpdate(zone.id, {
          neighborhood: neighborhood.trim(),
          city: city.trim(),
          state: state.trim().toUpperCase(),
          deliveryFee: feeStr,
          isAvailable,
        });
      } else {
        if (!storeId) throw new Error('Nenhuma loja ativa encontrada. Crie uma loja primeiro.');
        await onCreate({
          neighborhood: neighborhood.trim(),
          city: city.trim(),
          state: state.trim().toUpperCase(),
          deliveryFee: feeStr,
          isAvailable,
          storeId,
        });
      }
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
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '92%', maxWidth: 480, background: 'var(--bg)', borderRadius: 'var(--r-lg)', zIndex: 1001, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: '1px solid var(--c3)' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem' }}>{isEdit ? 'Editar zona' : 'Nova zona de entrega'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {formError && (
            <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.12)', color: '#f87171', borderRadius: 'var(--r-md)', fontSize: '0.8rem' }}>{formError}</div>
          )}

          <FF label="Bairro *">
            <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Ex: Vila Mariana" className="zf-in" />
          </FF>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
            <FF label="Cidade *">
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="São Paulo" className="zf-in" />
            </FF>
            <FF label="Estado *">
              <input
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                placeholder="SP"
                maxLength={2}
                className="zf-in"
                style={{ width: 64, textAlign: 'center', letterSpacing: 2 }}
              />
            </FF>
          </div>

          <FF label="Taxa de entrega (R$) *">
            <input
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              placeholder="7,00"
              inputMode="decimal"
              className="zf-in"
            />
          </FF>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} style={{ accentColor: 'var(--roxo-v)' }} />
            Disponível para entrega
          </label>

          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 'var(--r-md)', border: '1px solid var(--c3)', background: 'var(--c2)', color: 'var(--txt)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={saving || isSaving} style={{ flex: 1, padding: '10px', borderRadius: 'var(--r-md)', border: 'none', background: 'var(--roxo-v)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', opacity: (saving || isSaving) ? 0.65 : 1 }}>
              {saving ? 'Salvando…' : isEdit ? 'Salvar' : 'Criar zona'}
            </button>
          </div>
        </form>

        <style>{`.zf-in { width: 100%; padding: 9px 12px; border: 1px solid var(--c3); border-radius: var(--r-md); background: var(--c2); color: var(--txt); font-size: 0.875rem; box-sizing: border-box; font-family: inherit; } .zf-in:focus { outline: none; border-color: var(--roxo-v); }`}</style>
      </div>
    </>
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

const fLbl: React.CSSProperties = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--t2)', marginBottom: 5 };
function FF({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={fLbl}>{label}</label>{children}</div>;
}
