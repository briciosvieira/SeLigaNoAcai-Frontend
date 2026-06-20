import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { formatBRL } from '@/utils/currency.util';
import { getErrorMessage } from '@/utils/format.util';
import type { ProductVariant, CreateProductVariantPayload, UpdateProductVariantPayload } from '@/types/product.types';

interface Props {
  productId: string;
  variants: ProductVariant[];
  canManage: boolean;
  onCreate: (productId: string, payload: CreateProductVariantPayload) => Promise<void>;
  onUpdate: (productId: string, variantId: string, payload: UpdateProductVariantPayload) => Promise<void>;
  onDelete: (productId: string, variantId: string) => Promise<void>;
}

export function AdminProductVariants({ productId, variants, canManage, onCreate, onUpdate, onDelete }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newForm, setNewForm] = useState({ name: '', price: '', isActive: true });
  const [editForm, setEditForm] = useState({ name: '', price: '', isActive: true });
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function parseBRLToNumber(value: string | number): number {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const normalized = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function startEdit(v: ProductVariant) {
    setEditingId(v.id);
    setEditForm({
      name: v.name,
      price: String(v.price),
      isActive: v.isActive,
    });
    setFormError(null);
    setIsAdding(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setFormError(null);
  }

  function startAdd() {
    setIsAdding(true);
    setNewForm({ name: '', price: '', isActive: true });
    setEditingId(null);
    setFormError(null);
  }

  async function handleCreate() {
    if (!newForm.name.trim()) { setFormError('Nome é obrigatório.'); return; }
    const price = parseBRLToNumber(newForm.price);
    if (!newForm.price || price < 0) { setFormError('Preço inválido.'); return; }
    setIsSaving(true);
    setFormError(null);
    try {
      await onCreate(productId, {
        name: newForm.name.trim(),
        price,
        isActive: newForm.isActive,
      });
      setIsAdding(false);
      setNewForm({ name: '', price: '', isActive: true });
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdate(variantId: string) {
    if (!editForm.name.trim()) { setFormError('Nome é obrigatório.'); return; }
    const price = parseBRLToNumber(editForm.price);
    if (!editForm.price || price < 0) { setFormError('Preço inválido.'); return; }
    setIsSaving(true);
    setFormError(null);
    try {
      await onUpdate(productId, variantId, {
        name: editForm.name.trim(),
        price,
        isActive: editForm.isActive,
      });
      setEditingId(null);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(variantId: string) {
    setIsSaving(true);
    try {
      await onDelete(productId, variantId);
      setDeleteId(null);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      {formError && (
        <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.12)', color: '#f87171', borderRadius: 'var(--r-md)', fontSize: '0.8rem', marginBottom: 12, border: '1px solid rgba(239,68,68,0.25)' }}>
          {formError}
        </div>
      )}

      {variants.length === 0 && !isAdding && (
        <p style={{ color: 'var(--t2)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
          Nenhuma variação cadastrada.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {variants.map((v) =>
          editingId === v.id ? (
            <VariantEditRow
              key={v.id}
              form={editForm}
              onChange={setEditForm}
              onSave={() => handleUpdate(v.id)}
              onCancel={cancelEdit}
              isSaving={isSaving}
            />
          ) : (
            <VariantRow
              key={v.id}
              variant={v}
              canManage={canManage}
              onEdit={() => startEdit(v)}
              confirmDelete={deleteId === v.id}
              onDeleteRequest={() => { setDeleteId(v.id); setFormError(null); }}
              onDeleteConfirm={() => handleDelete(v.id)}
              onDeleteCancel={() => setDeleteId(null)}
              isSaving={isSaving}
            />
          ),
        )}
      </div>

      {isAdding ? (
        <VariantEditRow
          form={newForm}
          onChange={setNewForm}
          onSave={handleCreate}
          onCancel={() => { setIsAdding(false); setFormError(null); }}
          isSaving={isSaving}
          isNew
        />
      ) : (
        canManage && (
          <button
            onClick={startAdd}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              background: 'none', border: '1px dashed var(--c3)', borderRadius: 'var(--r-md)',
              color: 'var(--roxo-c)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, width: '100%',
              justifyContent: 'center',
            }}
          >
            <Plus size={14} /> Adicionar variação
          </button>
        )
      )}
    </div>
  );
}

type VariantForm = { name: string; price: string; isActive: boolean };

function VariantEditRow({
  form, onChange, onSave, onCancel, isSaving, isNew,
}: {
  form: VariantForm;
  onChange: (f: VariantForm) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isNew?: boolean;
}) {
  return (
    <div style={{ background: 'var(--c2)', border: '1px solid var(--roxo-v)', borderRadius: 'var(--r-md)', padding: 12 }}>
      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--roxo-c)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {isNew ? 'Nova variação' : 'Editar variação'}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <label style={labelStyle}>Nome da variação *</label>
          <input className="pv-input" value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} placeholder="Ex: 300ml" />
        </div>
        <div>
          <label style={labelStyle}>Preço (R$) *</label>
          <input className="pv-input" value={form.price} onChange={(e) => onChange({ ...form, price: e.target.value })} placeholder="0,00" inputMode="decimal" />
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', paddingTop: 2 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.82rem' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => onChange({ ...form, isActive: e.target.checked })} style={{ accentColor: 'var(--roxo-v)', width: 15, height: 15 }} />
            Ativo
          </label>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '7px', borderRadius: 'var(--r-md)', border: '1px solid var(--c3)', background: 'var(--c2)', color: 'var(--t2)', cursor: 'pointer', fontSize: '0.8rem' }}>
          <X size={13} style={{ verticalAlign: 'middle' }} /> Cancelar
        </button>
        <button onClick={onSave} disabled={isSaving} style={{ flex: 1, padding: '7px', borderRadius: 'var(--r-md)', border: 'none', background: 'var(--roxo-v)', color: '#fff', cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.8rem', opacity: isSaving ? 0.6 : 1 }}>
          <Check size={13} style={{ verticalAlign: 'middle' }} /> {isSaving ? '…' : 'Salvar'}
        </button>
      </div>
      <style>{`.pv-input { width: 100%; padding: 7px 10px; border: 1px solid var(--c3); border-radius: var(--r-md); background: var(--bg); color: var(--txt); font-size: 0.82rem; box-sizing: border-box; } .pv-input:focus { outline: none; border-color: var(--roxo-v); }`}</style>
    </div>
  );
}

function VariantRow({
  variant: v, canManage, onEdit, confirmDelete, onDeleteRequest, onDeleteConfirm, onDeleteCancel, isSaving,
}: {
  variant: ProductVariant;
  canManage: boolean;
  onEdit: () => void;
  confirmDelete: boolean;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  isSaving: boolean;
}) {
  return (
    <div style={{
      background: 'var(--c2)', border: '1px solid var(--c3)', borderRadius: 'var(--r-md)',
      padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: v.isActive ? '#4caf50' : '#ef4444',
        }} />
        <span style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {v.name}
        </span>
        <span style={{ fontWeight: 700, color: 'var(--am)', fontSize: '0.875rem', flexShrink: 0 }}>
          {formatBRL(v.price)}
        </span>
      </div>
      {canManage && (
        confirmDelete ? (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#f87171' }}>Remover?</span>
            <button onClick={onDeleteCancel} style={smallBtnStyle}>Não</button>
            <button onClick={onDeleteConfirm} disabled={isSaving} style={{ ...smallBtnStyle, background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
              {isSaving ? '…' : 'Sim'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={onEdit} style={iconBtnStyle} title="Editar">
              <Pencil size={13} />
            </button>
            <button onClick={onDeleteRequest} style={{ ...iconBtnStyle, color: '#f87171' }} title="Remover">
              <Trash2 size={13} />
            </button>
          </div>
        )
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--t2)', marginBottom: 4,
};

const smallBtnStyle: React.CSSProperties = {
  padding: '3px 8px', borderRadius: 'var(--r-full)', border: '1px solid var(--c3)',
  background: 'var(--c2)', color: 'var(--t2)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
};

const iconBtnStyle: React.CSSProperties = {
  width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: 'var(--r-md)', border: '1px solid var(--c3)', background: 'none',
  color: 'var(--t2)', cursor: 'pointer',
};
