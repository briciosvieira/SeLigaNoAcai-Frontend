import { useEffect, useState } from 'react';
import { Plus, Images } from 'lucide-react';
import { useAdminBanners } from '@/hooks/useAdminBanners';
import { AdminBannerCard } from '@/components/admin/AdminBannerCard';
import { AdminBannerForm } from '@/components/admin/AdminBannerForm';
import type { Banner } from '@/types/banner.types';

export function AdminBannersPage() {
  const {
    banners,
    isLoading,
    isUploading,
    loadBanners,
    uploadBannerImage,
    createBanner,
    updateBanner,
    updateBannerStatus,
    deleteBanner,
  } = useAdminBanners();

  const [showForm, setShowForm] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | undefined>(undefined);

  useEffect(() => {
    loadBanners();
  }, []);

  function handleAdd() {
    setEditBanner(undefined);
    setShowForm(true);
  }

  function handleEdit(banner: Banner) {
    setEditBanner(banner);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditBanner(undefined);
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Excluir este banner? Esta ação não pode ser desfeita.')) return;
    await deleteBanner(id);
  }

  const sorted = [...banners].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 4 }}>Banners</h1>
          <p style={{ color: 'var(--t2)', fontSize: '0.875rem' }}>
            Gerencie as imagens do carrossel da tela inicial
          </p>
        </div>
        <button
          onClick={handleAdd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            background: 'var(--roxo-v)',
            border: 'none',
            borderRadius: 'var(--r-md)',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.875rem',
            flexShrink: 0,
          }}
        >
          <Plus size={16} />
          Adicionar banner
        </button>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--t2)', fontSize: '0.9rem' }}>
          Carregando banners…
        </div>
      ) : sorted.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          border: '1px dashed var(--c3)',
          borderRadius: 'var(--r-md)',
          color: 'var(--t2)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, opacity: 0.4 }}>
            <Images size={44} />
          </div>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Nenhum banner cadastrado</p>
          <p style={{ fontSize: '0.875rem' }}>Clique em "Adicionar banner" para começar.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map((banner) => (
            <AdminBannerCard
              key={banner.id}
              banner={banner}
              onToggleStatus={updateBannerStatus}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}

      {/* Modal de formulário */}
      {showForm && (
        <AdminBannerForm
          banner={editBanner}
          onClose={handleCloseForm}
          isUploading={isUploading}
          uploadBannerImage={uploadBannerImage}
          onCreate={createBanner}
          onUpdate={updateBanner}
        />
      )}
    </div>
  );
}
