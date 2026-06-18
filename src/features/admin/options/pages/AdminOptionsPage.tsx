import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, ChevronDown, ChevronRight, Check, X } from 'lucide-react';
import { useAdminOptions } from '@/hooks/useAdminOptions';
import { usePermissions } from '@/hooks/usePermissions';
import { formatBRL } from '@/utils/currency.util';
import { parseBRLInput } from '@/utils/number.util';
import { generateSlug } from '@/utils/slug.util';
import { getErrorMessage, isForbiddenError } from '@/utils/format.util';
import type {
  OptionGroup,
  ProductOption,
  CreateOptionGroupPayload,
  UpdateOptionGroupPayload,
  CreateProductOptionPayload,
} from '@/types/product.types';

export function AdminOptionsPage() {
  const {
    groups, isLoading, isSaving, error,
    loadGroups,
    createGroup, updateGroup, deleteGroup, toggleGroupStatus,
    createOption, updateOption, deleteOption, toggleOptionStatus,
  } = useAdminOptions();

  const { isAdmin, hasPermission } = usePermissions();
  const canManage = isAdmin || hasPermission('MANAGE_PRODUCTS');

  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<OptionGroup | null>(null);
  const [showOptionForm, setShowOptionForm] = useState<string | null>(null); // groupId
  const [editingOption, setEditingOption] = useState<{ groupId: string; option: ProductOption } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'group' | 'option'; id: string; groupId?: string } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => { loadGroups(); }, []);

  function handleEditGroup(group: OptionGroup) {
    setEditingGroup(group);
    setShowGroupForm(true);
  }

  async function handleDeleteGroup(id: string) {
    try {
      await deleteGroup(id);
      setDeleteConfirm(null);
      if (expandedGroupId === id) setExpandedGroupId(null);
    } catch (err) {
      setActionError(isForbiddenError(err) ? 'Sem permissão.' : getErrorMessage(err));
      setDeleteConfirm(null);
    }
  }

  async function handleDeleteOption(optionId: string, groupId: string) {
    try {
      await deleteOption(optionId, groupId);
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
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Adicionais</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--t2)', marginTop: 2 }}>
            Grupos de opcionais vinculados aos produtos
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => { setEditingGroup(null); setShowGroupForm(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'var(--roxo-v)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <Plus size={16} /> Novo grupo
          </button>
        )}
      </div>

      {actionError && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: 'var(--r-md)', marginBottom: 14, border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {actionError}
          <button onClick={() => setActionError(null)} style={{ marginLeft: 10, background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}>×</button>
        </div>
      )}

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: 'var(--r-md)', marginBottom: 14, border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.85rem' }}>{error}</div>
      )}

      {isLoading && <p style={{ textAlign: 'center', padding: '48px 0', color: 'var(--t2)' }}>Carregando grupos…</p>}

      {!isLoading && groups.length === 0 && !error && (
        <p style={{ textAlign: 'center', padding: '48px 0', color: 'var(--t2)' }}>Nenhum grupo cadastrado.</p>
      )}

      {groups.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {groups.map((group) => {
            const isExpanded = expandedGroupId === group.id;
            const allOpts = group.options ?? [];
            const activeOpts = allOpts.filter((o) => o.isActive);

            return (
              <div key={group.id} style={{ background: 'var(--card)', border: '1px solid var(--c3)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
                {/* Group header */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 10 }}>
                  <button
                    onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t2)', flexShrink: 0, display: 'flex' }}
                  >
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{group.name || 'Grupo sem nome'}</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                      <RequiredBadge required={group.isRequired} />
                      <span style={{ fontSize: '0.72rem', color: 'var(--t2)' }}>
                        Mín: {group.minSelected} · Máx: {group.maxSelected}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--t2)' }}>
                        {activeOpts.length} opção{activeOpts.length !== 1 ? 'ões ativas' : ' ativa'}
                      </span>
                    </div>
                  </div>

                  {!group.isActive && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-full)', background: 'rgba(239,68,68,0.12)', color: '#f87171', flexShrink: 0 }}>Inativo</span>
                  )}

                  {canManage && (
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <IconBtn title="Editar grupo" onClick={() => handleEditGroup(group)}><Pencil size={13} /></IconBtn>
                      <IconBtn
                        title={group.isActive ? 'Desativar grupo' : 'Ativar grupo'}
                        onClick={() => toggleGroupStatus(group.id, !group.isActive)}
                      >
                        {group.isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                      </IconBtn>
                      {deleteConfirm?.type === 'group' && deleteConfirm.id === group.id ? (
                        <>
                          <button onClick={() => setDeleteConfirm(null)} style={{ ...smallBtn, color: 'var(--t2)' }}>Não</button>
                          <button onClick={() => handleDeleteGroup(group.id)} style={{ ...smallBtn, color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>Sim</button>
                        </>
                      ) : (
                        <IconBtn title="Excluir grupo" danger onClick={() => setDeleteConfirm({ type: 'group', id: group.id })}>
                          <Trash2 size={13} />
                        </IconBtn>
                      )}
                    </div>
                  )}
                </div>

                {/* Expanded: options list */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--c3)' }}>
                    {allOpts.length === 0 && showOptionForm !== group.id && (
                      <p style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--t2)' }}>Nenhuma opção cadastrada.</p>
                    )}

                    {allOpts.map((opt) => (
                      <OptionRow
                        key={opt.id}
                        option={opt}
                        groupId={group.id}
                        canManage={canManage}
                        isEditingThis={editingOption?.option.id === opt.id}
                        isSaving={isSaving}
                        onToggleStatus={(id, active) => toggleOptionStatus(id, group.id, active)}
                        onEdit={() => setEditingOption({ groupId: group.id, option: opt })}
                        onCancelEdit={() => setEditingOption(null)}
                        onSaveEdit={async (payload) => {
                          await updateOption(opt.id, group.id, payload);
                          setEditingOption(null);
                        }}
                        deleteConfirm={deleteConfirm?.type === 'option' && deleteConfirm.id === opt.id}
                        onDeleteRequest={() => setDeleteConfirm({ type: 'option', id: opt.id, groupId: group.id })}
                        onDeleteConfirm={() => handleDeleteOption(opt.id, group.id)}
                        onDeleteCancel={() => setDeleteConfirm(null)}
                      />
                    ))}

                    {canManage && (
                      showOptionForm === group.id ? (
                        <OptionForm
                          groupId={group.id}
                          isSaving={isSaving}
                          onSave={async (payload) => {
                            await createOption(payload);
                            setShowOptionForm(null);
                          }}
                          onCancel={() => setShowOptionForm(null)}
                        />
                      ) : (
                        <button
                          onClick={() => setShowOptionForm(group.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '10px 16px', background: 'none', border: 'none', borderTop: '1px dashed var(--c3)', color: 'var(--roxo-c)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                        >
                          <Plus size={13} /> Adicionar opção
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Group form modal */}
      {showGroupForm && (
        <GroupFormModal
          group={editingGroup}
          isSaving={isSaving}
          onClose={() => { setShowGroupForm(false); setEditingGroup(null); }}
          onCreate={async (p) => { await createGroup(p); setShowGroupForm(false); }}
          onUpdate={async (id, p) => { await updateGroup(id, p); setShowGroupForm(false); setEditingGroup(null); }}
        />
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RequiredBadge({ required }: { required: boolean }) {
  return (
    <span style={{
      fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px', borderRadius: 'var(--r-full)',
      background: required ? 'rgba(239,68,68,0.12)' : 'rgba(76,175,80,0.12)',
      color: required ? '#f87171' : '#4caf50',
      border: `1px solid ${required ? 'rgba(239,68,68,0.25)' : 'rgba(76,175,80,0.25)'}`,
    }}>
      {required ? 'Obrigatório' : 'Opcional'}
    </span>
  );
}

const smallBtn: React.CSSProperties = {
  padding: '3px 8px', borderRadius: 'var(--r-full)', border: '1px solid var(--c3)',
  background: 'var(--c2)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
};

function IconBtn({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title?: string; danger?: boolean }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-md)', border: '1px solid var(--c3)', background: 'none', color: danger ? '#f87171' : 'var(--t2)', cursor: 'pointer' }}
    >
      {children}
    </button>
  );
}

function OptionRow({
  option, groupId, canManage, isEditingThis, isSaving,
  onToggleStatus, onEdit, onCancelEdit, onSaveEdit,
  deleteConfirm, onDeleteRequest, onDeleteConfirm, onDeleteCancel,
}: {
  option: ProductOption; groupId: string; canManage: boolean; isEditingThis: boolean; isSaving: boolean;
  onToggleStatus: (id: string, active: boolean) => void;
  onEdit: () => void; onCancelEdit: () => void;
  onSaveEdit: (p: { name?: string; description?: string | null; additionalPrice?: number; isActive?: boolean }) => Promise<void>;
  deleteConfirm: boolean; onDeleteRequest: () => void; onDeleteConfirm: () => void; onDeleteCancel: () => void;
}) {
  const [editName, setEditName] = useState(option.name);
  const [editPrice, setEditPrice] = useState(String(option.additionalPrice ?? '0'));
  const [editActive, setEditActive] = useState(option.isActive);

  if (isEditingThis) {
    return (
      <div style={{ padding: '10px 16px', background: 'rgba(139,47,201,0.06)', borderBottom: '1px solid var(--c3)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nome" className="aoi-input" />
          <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="Preço adicional" inputMode="decimal" className="aoi-input" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} style={{ accentColor: 'var(--roxo-v)' }} /> Ativo
          </label>
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            <button onClick={onCancelEdit} style={smallBtn}><X size={11} style={{ verticalAlign: 'middle' }} /> Cancelar</button>
            <button
              disabled={isSaving}
              onClick={() => onSaveEdit({
                name: editName.trim(),
                additionalPrice: parseBRLInput(editPrice),
                isActive: editActive,
              })}
              style={{ ...smallBtn, background: 'var(--roxo-v)', color: '#fff', border: 'none' }}
            >
              <Check size={11} style={{ verticalAlign: 'middle' }} /> {isSaving ? '…' : 'Salvar'}
            </button>
          </div>
        </div>
        <style>{`.aoi-input { width: 100%; padding: 6px 10px; border: 1px solid var(--c3); border-radius: var(--r-md); background: var(--bg); color: var(--txt); font-size: 0.82rem; box-sizing: border-box; } .aoi-input:focus { outline: none; border-color: var(--roxo-v); }`}</style>
      </div>
    );
  }

  const price = Number(option.additionalPrice ?? 0);
  const hasPrice = Number.isFinite(price) && price > 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '9px 16px', borderBottom: '1px solid var(--c3)', gap: 10 }}>
      {option.emoji && <span style={{ fontSize: '1rem', flexShrink: 0 }}>{option.emoji}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{option.name}</span>
        {!option.isActive && <span style={{ marginLeft: 8, fontSize: '0.68rem', color: '#f87171', fontWeight: 600 }}>(inativa)</span>}
      </div>
      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: hasPrice ? 'var(--am)' : 'var(--t2)', flexShrink: 0 }}>
        {hasPrice ? `+ ${formatBRL(price)}` : 'Grátis'}
      </span>
      {canManage && (
        deleteConfirm ? (
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={onDeleteCancel} style={smallBtn}>Não</button>
            <button onClick={onDeleteConfirm} style={{ ...smallBtn, color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>Sim</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 4 }}>
            <IconBtn title="Editar opção" onClick={onEdit}><Pencil size={12} /></IconBtn>
            <IconBtn title={option.isActive ? 'Desativar' : 'Ativar'} onClick={() => onToggleStatus(option.id, !option.isActive)}>
              {option.isActive ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
            </IconBtn>
            <IconBtn title="Excluir opção" danger onClick={onDeleteRequest}><Trash2 size={12} /></IconBtn>
          </div>
        )
      )}
    </div>
  );
}

function OptionForm({ groupId, isSaving, onSave, onCancel }: {
  groupId: string; isSaving: boolean;
  onSave: (p: CreateProductOptionPayload) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [err, setErr] = useState('');

  async function handleSave() {
    if (!name.trim()) { setErr('Nome é obrigatório.'); return; }
    setErr('');
    try {
      await onSave({
        optionGroupId: groupId,
        name: name.trim(),
        additionalPrice: parseBRLInput(price),
        isActive: true,
      });
      setName('');
      setPrice('');
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  }

  return (
    <div style={{ padding: '10px 16px', background: 'rgba(139,47,201,0.06)', borderTop: '1px solid var(--c3)' }}>
      {err && <p style={{ fontSize: '0.75rem', color: '#f87171', marginBottom: 6 }}>{err}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
          placeholder="Nome da opção *"
          className="aoi-input"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Preço adicional (0 = grátis)"
          inputMode="decimal"
          className="aoi-input"
        />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '7px', borderRadius: 'var(--r-md)', border: '1px solid var(--c3)', background: 'var(--c2)', color: 'var(--t2)', cursor: 'pointer', fontSize: '0.8rem' }}>
          Cancelar
        </button>
        <button onClick={handleSave} disabled={isSaving} style={{ flex: 1, padding: '7px', borderRadius: 'var(--r-md)', border: 'none', background: 'var(--roxo-v)', color: '#fff', fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: '0.8rem', opacity: isSaving ? 0.7 : 1 }}>
          {isSaving ? '…' : 'Adicionar'}
        </button>
      </div>
      <style>{`.aoi-input { width: 100%; padding: 6px 10px; border: 1px solid var(--c3); border-radius: var(--r-md); background: var(--bg); color: var(--txt); font-size: 0.82rem; box-sizing: border-box; } .aoi-input:focus { outline: none; border-color: var(--roxo-v); }`}</style>
    </div>
  );
}

function GroupFormModal({ group, isSaving, onClose, onCreate, onUpdate }: {
  group: OptionGroup | null; isSaving: boolean;
  onClose: () => void;
  onCreate: (p: CreateOptionGroupPayload) => Promise<void>;
  onUpdate: (id: string, p: UpdateOptionGroupPayload) => Promise<void>;
}) {
  const isEdit = group != null;
  const [name, setName] = useState(group?.name ?? '');
  const [description, setDescription] = useState(group?.description ?? '');
  const [minSelected, setMinSelected] = useState(String(group?.minSelected ?? 0));
  const [maxSelected, setMaxSelected] = useState(String(group?.maxSelected ?? 1));
  const [isRequired, setIsRequired] = useState(group?.isRequired ?? false);
  const [isActive, setIsActive] = useState(group?.isActive ?? true);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) { setFormError('Nome é obrigatório.'); return; }
    const min = parseInt(minSelected, 10);
    const max = parseInt(maxSelected, 10);
    if (isNaN(min) || isNaN(max) || min < 0 || max < 1 || min > max) {
      setFormError('Valores de mínimo/máximo inválidos.'); return;
    }

    const payload: CreateOptionGroupPayload = {
      name: name.trim(),
      slug: generateSlug(name.trim()),
      selectionType: max === 1 ? 'SINGLE' : 'MULTIPLE',
      description: description.trim() || null,
      minSelected: min,
      maxSelected: max,
      isRequired,
      isActive,
    };

    setSaving(true);
    try {
      if (isEdit && group) await onUpdate(group.id, payload as UpdateOptionGroupPayload);
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
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '92%', maxWidth: 480, background: 'var(--bg)', borderRadius: 'var(--r-lg)', zIndex: 1001, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: '1px solid var(--c3)' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem' }}>{isEdit ? 'Editar grupo' : 'Novo grupo de adicionais'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {formError && (
            <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.12)', color: '#f87171', borderRadius: 'var(--r-md)', fontSize: '0.8rem' }}>
              {formError}
            </div>
          )}
          <FField label="Nome *">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Frutas" className="agf-input" />
          </FField>
          <FField label="Descrição">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição opcional" className="agf-input" rows={2} style={{ resize: 'vertical' }} />
          </FField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FField label="Mín. escolhas">
              <input type="number" value={minSelected} onChange={(e) => setMinSelected(e.target.value)} min={0} className="agf-input" />
            </FField>
            <FField label="Máx. escolhas">
              <input type="number" value={maxSelected} onChange={(e) => setMaxSelected(e.target.value)} min={1} className="agf-input" />
            </FField>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--t2)', marginTop: -4 }}>
            Máx = 1 → seleção única · Máx {'>'} 1 → múltipla escolha
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.875rem' }}>
              <input type="checkbox" checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} style={{ accentColor: 'var(--roxo-v)' }} /> Obrigatório
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.875rem' }}>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={{ accentColor: 'var(--roxo-v)' }} /> Ativo
            </label>
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 'var(--r-md)', border: '1px solid var(--c3)', background: 'var(--c2)', color: 'var(--txt)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={saving || isSaving} style={{ flex: 1, padding: '10px', borderRadius: 'var(--r-md)', border: 'none', background: 'var(--roxo-v)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', opacity: (saving || isSaving) ? 0.6 : 1 }}>
              {saving ? 'Salvando…' : isEdit ? 'Salvar' : 'Criar grupo'}
            </button>
          </div>
        </form>
        <style>{`.agf-input { width: 100%; padding: 9px 12px; border: 1px solid var(--c3); border-radius: var(--r-md); background: var(--c2); color: var(--txt); font-size: 0.875rem; box-sizing: border-box; font-family: inherit; } .agf-input:focus { outline: none; border-color: var(--roxo-v); }`}</style>
      </div>
    </>
  );
}

const fieldLbl: React.CSSProperties = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--t2)', marginBottom: 5 };
function FField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={fieldLbl}>{label}</label>{children}</div>;
}
