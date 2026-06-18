import { useState } from 'react';
import { Link2, Link2Off } from 'lucide-react';
import { formatBRL } from '@/utils/currency.util';
import type { OptionGroup, ProductOptionGroupRelation } from '@/types/product.types';

interface Props {
  relations: ProductOptionGroupRelation[];
  availableGroups: OptionGroup[];
  isCombo: boolean;
  isLoading?: boolean;
  isSaving?: boolean;
  onLink: (optionGroupId: string) => Promise<void>;
  onUnlink: (relationId: string) => Promise<void>;
}

export function AdminProductOptionGroups({
  relations, availableGroups, isCombo, isLoading, isSaving, onLink, onUnlink,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const linkedGroupIds = new Set(relations.map((r) => r.optionGroupId));
  const unlinkedGroups = availableGroups.filter((g) => !linkedGroupIds.has(g.id) && g.isActive);

  async function handleUnlink(relationId: string) {
    setUnlinkingId(relationId);
    setActionError(null);
    try {
      await onUnlink(relationId);
    } catch {
      setActionError('Erro ao remover grupo. Tente novamente.');
    } finally {
      setUnlinkingId(null);
    }
  }

  async function handleLink(optionGroupId: string) {
    setShowPicker(false);
    setActionError(null);
    try {
      await onLink(optionGroupId);
    } catch {
      setActionError('Erro ao vincular grupo. Tente novamente.');
    }
  }

  if (isLoading) {
    return (
      <p style={{ color: 'var(--t2)', fontSize: '0.85rem', padding: '24px 0', textAlign: 'center' }}>
        Carregando adicionais…
      </p>
    );
  }

  if (isCombo) {
    return (
      <div style={{
        padding: '10px 14px', background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--r-md)',
        fontSize: '0.82rem', color: '#f59e0b',
      }}>
        Produto Combo não possui adicionais selecionáveis. A seleção é feita pela descrição do combo.
      </div>
    );
  }

  const allLinked = unlinkedGroups.length === 0 && availableGroups.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--t2)' }}>
          {relations.length === 0
            ? 'Nenhum grupo vinculado'
            : `${relations.length} grupo${relations.length > 1 ? 's' : ''} vinculado${relations.length > 1 ? 's' : ''}`}
        </p>
        <button
          onClick={() => setShowPicker((v) => !v)}
          disabled={isSaving || allLinked}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 'var(--r-md)',
            background: 'var(--roxo-v)', color: '#fff',
            border: 'none', fontWeight: 600, fontSize: '0.8rem',
            cursor: isSaving || allLinked ? 'not-allowed' : 'pointer',
            opacity: isSaving || allLinked ? 0.5 : 1,
          }}
        >
          <Link2 size={13} />
          {allLinked ? 'Todos vinculados' : 'Vincular grupo'}
        </button>
      </div>

      {/* Group picker */}
      {showPicker && unlinkedGroups.length > 0 && (
        <div style={{
          background: 'var(--c1)', border: '1px solid var(--c3)',
          borderRadius: 'var(--r-md)', overflow: 'hidden',
        }}>
          <p style={{
            fontSize: '0.72rem', fontWeight: 700, color: 'var(--t2)',
            padding: '10px 14px 8px', borderBottom: '1px solid var(--c3)',
            textTransform: 'uppercase', letterSpacing: 0.6,
          }}>
            Escolha um grupo para vincular
          </p>
          {unlinkedGroups.map((g, idx) => (
            <button
              key={g.id}
              onClick={() => handleLink(g.id)}
              disabled={isSaving}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '10px 14px',
                background: 'none', border: 'none',
                borderBottom: idx < unlinkedGroups.length - 1 ? '1px solid var(--c3)' : 'none',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                color: 'var(--txt)', fontSize: '0.85rem', textAlign: 'left',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--c2)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{g.name}</p>
                {g.description && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--t2)', marginTop: 1 }}>{g.description}</p>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--t2)', flexShrink: 0, marginLeft: 12 }}>
                {(g.options ?? []).filter((o) => o.isActive).length} opções
              </span>
            </button>
          ))}
          <div style={{ padding: '8px 14px', borderTop: '1px solid var(--c3)' }}>
            <button
              onClick={() => setShowPicker(false)}
              style={{ background: 'none', border: 'none', color: 'var(--t2)', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {actionError && (
        <div style={{
          padding: '8px 12px', background: 'rgba(239,68,68,0.1)',
          color: '#f87171', borderRadius: 'var(--r-md)',
          fontSize: '0.8rem', border: '1px solid rgba(239,68,68,0.25)',
        }}>
          {actionError}
        </div>
      )}

      {/* Empty state */}
      {relations.length === 0 && !showPicker && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <p style={{ color: 'var(--t2)', fontSize: '0.85rem' }}>
            Nenhum grupo de adicionais vinculado a este produto.
          </p>
          <p style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--t3)' }}>
            Clique em "Vincular grupo" para adicionar.
          </p>
        </div>
      )}

      {/* Group cards */}
      {relations.map((rel) => (
        <GroupCard
          key={rel.id}
          relation={rel}
          isUnlinking={unlinkingId === rel.id}
          onUnlink={() => handleUnlink(rel.id)}
        />
      ))}
    </div>
  );
}

function GroupCard({
  relation, isUnlinking, onUnlink,
}: {
  relation: ProductOptionGroupRelation;
  isUnlinking: boolean;
  onUnlink: () => void;
}) {
  const group = relation.optionGroup;
  const activeOptions = (group.options ?? []).filter((o) => o.isActive);

  return (
    <div style={{
      background: 'var(--c2)', border: '1px solid var(--c3)',
      borderRadius: 'var(--r-md)', overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 14px',
        borderBottom: activeOptions.length > 0 ? '1px solid var(--c3)' : 'none',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>
            {group.name?.trim() || 'Grupo sem nome'}
          </p>
          {group.description && (
            <p style={{ fontSize: '0.75rem', color: 'var(--t2)', marginTop: 2 }}>
              {group.description}
            </p>
          )}
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <RequiredBadge required={relation.isRequired} />
            <span style={{ fontSize: '0.72rem', color: 'var(--t2)' }}>
              Mín: {relation.minSelected} · Máx: {relation.maxSelected}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--t2)' }}>
            {activeOptions.length} opção{activeOptions.length !== 1 ? 'ões' : ''}
          </span>
          <button
            onClick={onUnlink}
            disabled={isUnlinking}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 'var(--r-sm)',
              background: 'rgba(239,68,68,0.08)', color: '#f87171',
              border: '1px solid rgba(239,68,68,0.2)',
              fontSize: '0.72rem', fontWeight: 600,
              cursor: isUnlinking ? 'not-allowed' : 'pointer',
              opacity: isUnlinking ? 0.5 : 1,
            }}
          >
            <Link2Off size={11} />
            {isUnlinking ? 'Removendo…' : 'Remover'}
          </button>
        </div>
      </div>

      {activeOptions.length > 0 && (
        <div>
          {activeOptions.map((option, idx) => {
            const price = Number(option.additionalPrice ?? 0);
            const hasPrice = Number.isFinite(price) && price > 0;
            const isLast = idx === activeOptions.length - 1;
            return (
              <div
                key={option.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 14px', gap: 10,
                  borderBottom: isLast ? 'none' : '1px solid var(--c3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                  {option.emoji && (
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>{option.emoji}</span>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>{option.name}</p>
                    {option.description && (
                      <p style={{ fontSize: '0.72rem', color: 'var(--t2)', marginTop: 1 }}>
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>
                <span style={{
                  fontSize: '0.82rem', fontWeight: 700, flexShrink: 0,
                  color: hasPrice ? 'var(--am)' : 'var(--t2)',
                }}>
                  {hasPrice ? `+ ${formatBRL(price)}` : 'Grátis'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RequiredBadge({ required }: { required: boolean }) {
  return (
    <span style={{
      fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px',
      borderRadius: 'var(--r-full)',
      background: required ? 'rgba(239,68,68,0.12)' : 'rgba(76,175,80,0.12)',
      color: required ? '#f87171' : '#4caf50',
      border: `1px solid ${required ? 'rgba(239,68,68,0.25)' : 'rgba(76,175,80,0.25)'}`,
    }}>
      {required ? 'Obrigatório' : 'Opcional'}
    </span>
  );
}
