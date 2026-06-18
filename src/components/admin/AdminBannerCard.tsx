import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import type { Banner } from '@/types/banner.types';
import { env } from '@/config/env';

type Props = {
  banner: Banner;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onEdit: (banner: Banner) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
};

export function AdminBannerCard({ banner, onToggleStatus, onEdit, onDelete, isLoading }: Props) {
  const imgSrc = `${env.apiUrl}${banner.imageUrl}`;

  return (
    <div style={{
      display: 'flex',
      gap: 16,
      background: 'var(--c1)',
      border: '1px solid var(--c3)',
      borderRadius: 'var(--r-md)',
      padding: 16,
      alignItems: 'center',
    }}>
      {/* Preview */}
      <div style={{
        width: 128,
        height: 76,
        borderRadius: 'var(--r-sm)',
        overflow: 'hidden',
        flexShrink: 0,
        background: 'var(--c2)',
      }}>
        <img
          src={imgSrc}
          alt="Preview banner"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '2px 10px',
            borderRadius: 'var(--r-full)',
            background: banner.isActive ? 'rgba(40,167,69,0.15)' : 'rgba(128,128,128,0.12)',
            color: banner.isActive ? '#4caf50' : 'var(--t2)',
            border: `1px solid ${banner.isActive ? 'rgba(40,167,69,0.3)' : 'rgba(128,128,128,0.2)'}`,
          }}>
            {banner.isActive ? 'Ativo' : 'Inativo'}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--t2)', fontWeight: 600 }}>
            Ordem: {banner.sortOrder}
          </span>
        </div>
        {banner.mobileImageUrl && (
          <p style={{ fontSize: '0.72rem', color: 'var(--t3)' }}>
            Versão mobile cadastrada
          </p>
        )}
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <ActionBtn
          title={banner.isActive ? 'Desativar' : 'Ativar'}
          onClick={() => onToggleStatus(banner.id, !banner.isActive)}
          disabled={isLoading}
          color={banner.isActive ? 'var(--t2)' : '#4caf50'}
        >
          {banner.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
        </ActionBtn>

        <ActionBtn
          title="Editar"
          onClick={() => onEdit(banner)}
          disabled={isLoading}
          color="var(--roxo-c)"
        >
          <Pencil size={15} />
        </ActionBtn>

        <ActionBtn
          title="Excluir"
          onClick={() => onDelete(banner.id)}
          disabled={isLoading}
          color="#ff6b6b"
        >
          <Trash2 size={15} />
        </ActionBtn>
      </div>
    </div>
  );
}

function ActionBtn({
  children,
  title,
  onClick,
  disabled,
  color,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  color: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: 7,
        background: 'var(--c2)',
        border: '1px solid var(--c3)',
        borderRadius: 'var(--r-sm)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {children}
    </button>
  );
}
