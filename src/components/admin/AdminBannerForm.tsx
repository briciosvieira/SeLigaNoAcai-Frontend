import { useState, useRef } from 'react';
import { X, Monitor, Tablet, Smartphone } from 'lucide-react';
import type { Banner, CreateBannerPayload, UpdateBannerPayload, UploadBannerResponse } from '@/types/banner.types';
import { env } from '@/config/env';

type Tab = 'desktop' | 'tablet' | 'mobile';

const TAB_CONFIG: Record<Tab, { label: string; icon: React.ReactNode; dimension: string; ratio: string }> = {
  desktop: {
    label: 'Desktop',
    icon: <Monitor size={15} />,
    dimension: '1280 × 320px',
    ratio: 'Proporção 4:1',
  },
  tablet: {
    label: 'Tablet',
    icon: <Tablet size={15} />,
    dimension: '768 × 250px',
    ratio: 'Proporção 3:1',
  },
  mobile: {
    label: 'Mobile',
    icon: <Smartphone size={15} />,
    dimension: '390 × 195px',
    ratio: 'Proporção 2:1',
  },
};

type Props = {
  banner?: Banner;
  onClose: () => void;
  isUploading: boolean;
  uploadBannerImage: (file: File) => Promise<UploadBannerResponse>;
  onCreate: (payload: CreateBannerPayload) => Promise<void>;
  onUpdate: (id: string, payload: UpdateBannerPayload) => Promise<void>;
};

export function AdminBannerForm({ banner, onClose, isUploading, uploadBannerImage, onCreate, onUpdate }: Props) {
  const isEdit = !!banner;

  const [activeTab, setActiveTab] = useState<Tab>('desktop');

  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [tabletFile, setTabletFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);

  const [desktopPreview, setDesktopPreview] = useState(
    banner ? `${env.apiUrl}${banner.imageUrl}` : '',
  );
  const [tabletPreview, setTabletPreview] = useState(
    banner?.tabletImageUrl ? `${env.apiUrl}${banner.tabletImageUrl}` : '',
  );
  const [mobilePreview, setMobilePreview] = useState(
    banner?.mobileImageUrl ? `${env.apiUrl}${banner.mobileImageUrl}` : '',
  );

  const [sortOrder, setSortOrder] = useState(banner?.sortOrder ?? 1);
  const [isActive, setIsActive] = useState(banner?.isActive ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const desktopRef = useRef<HTMLInputElement>(null);
  const tabletRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);

  function handleFile(tab: Tab, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (tab === 'desktop') { setDesktopFile(file); setDesktopPreview(preview); }
    if (tab === 'tablet')  { setTabletFile(file);  setTabletPreview(preview); }
    if (tab === 'mobile')  { setMobileFile(file);  setMobilePreview(preview); }
  }

  async function handleSave() {
    if (!isEdit && !desktopFile) {
      setError('A imagem desktop é obrigatória.');
      setActiveTab('desktop');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      let imageUrl = banner?.imageUrl ?? '';
      if (desktopFile) {
        const res = await uploadBannerImage(desktopFile);
        imageUrl = res.url;
      }

      let tabletImageUrl: string | undefined = banner?.tabletImageUrl ?? undefined;
      if (tabletFile) {
        const res = await uploadBannerImage(tabletFile);
        tabletImageUrl = res.url;
      }

      let mobileImageUrl: string | undefined = banner?.mobileImageUrl ?? undefined;
      if (mobileFile) {
        const res = await uploadBannerImage(mobileFile);
        mobileImageUrl = res.url;
      }

      const payload = {
        imageUrl,
        sortOrder,
        isActive,
        ...(tabletImageUrl ? { tabletImageUrl } : {}),
        ...(mobileImageUrl ? { mobileImageUrl } : {}),
      };

      if (isEdit && banner) {
        await onUpdate(banner.id, payload);
      } else {
        await onCreate(payload as CreateBannerPayload);
      }
      onClose();
    } catch {
      setError('Erro ao salvar banner. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  }

  const isBusy = isSaving || isUploading;

  const previews: Record<Tab, string> = {
    desktop: desktopPreview,
    tablet: tabletPreview,
    mobile: mobilePreview,
  };
  const files: Record<Tab, File | null> = {
    desktop: desktopFile,
    tablet: tabletFile,
    mobile: mobileFile,
  };
  const refs: Record<Tab, React.RefObject<HTMLInputElement | null>> = {
    desktop: desktopRef,
    tablet: tabletRef,
    mobile: mobileRef,
  };

  const cfg = TAB_CONFIG[activeTab];
  const currentPreview = previews[activeTab];
  const currentFile = files[activeTab];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--c1)',
          border: '1px solid var(--c3)',
          borderRadius: 'var(--r-xl)',
          padding: 24,
          width: '100%',
          maxWidth: 540,
          maxHeight: '92dvh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
            {isEdit ? 'Editar banner' : 'Adicionar banner'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t2)', padding: 4, display: 'flex' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Abas */}
        <div style={{
          display: 'flex',
          gap: 4,
          background: 'var(--c2)',
          borderRadius: 'var(--r-md)',
          padding: 4,
          marginBottom: 20,
        }}>
          {(Object.keys(TAB_CONFIG) as Tab[]).map((tab) => {
            const isActive = tab === activeTab;
            const hasImage = !!previews[tab];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 4px',
                  background: isActive ? 'var(--c1)' : 'transparent',
                  border: isActive ? '1px solid var(--c3)' : '1px solid transparent',
                  borderRadius: 'var(--r-sm)',
                  color: isActive ? 'var(--roxo-c)' : 'var(--t2)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  position: 'relative',
                }}
              >
                {TAB_CONFIG[tab].icon}
                {TAB_CONFIG[tab].label}
                {hasImage && (
                  <span style={{
                    position: 'absolute',
                    top: 4,
                    right: 6,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#4caf50',
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Info de dimensão */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          background: 'rgba(139,92,246,0.08)',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: 'var(--r-sm)',
          marginBottom: 20,
        }}>
          <span style={{ color: 'var(--roxo-c)', display: 'flex' }}>{cfg.icon}</span>
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--txt)' }}>
              {cfg.dimension}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--t2)', marginLeft: 8 }}>
              {cfg.ratio}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Preview + upload */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--t2)', marginBottom: 8 }}>
              Imagem {cfg.label}
              {activeTab === 'desktop' && <span style={{ color: '#fc8181', marginLeft: 3 }}>*</span>}
              {activeTab !== 'desktop' && (
                <span style={{ fontWeight: 400, marginLeft: 4, fontSize: '0.75rem' }}>(opcional)</span>
              )}
            </label>

            {currentPreview && (
              <div style={{ marginBottom: 8, borderRadius: 'var(--r-sm)', overflow: 'hidden', maxHeight: 160 }}>
                <img
                  src={currentPreview}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: 'var(--c2)' }}
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => refs[activeTab].current?.click()}
              disabled={isBusy}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--c2)',
                border: '1px dashed var(--c3)',
                borderRadius: 'var(--r-md)',
                color: 'var(--t2)',
                cursor: isBusy ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => { if (!isBusy) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--roxo-v)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--c3)'; }}
            >
              {cfg.icon}
              {currentFile?.name ?? (currentPreview ? `Trocar imagem ${cfg.label.toLowerCase()}` : `Selecionar imagem ${cfg.label.toLowerCase()}`)}
            </button>
          </div>

          {/* Inputs de arquivo ocultos */}
          <input ref={desktopRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile('desktop', e)} />
          <input ref={tabletRef}  type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile('tablet', e)} />
          <input ref={mobileRef}  type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile('mobile', e)} />

          {/* Resumo de imagens selecionadas */}
          <div style={{ display: 'flex', gap: 8 }}>
            {(['desktop', 'tablet', 'mobile'] as Tab[]).map((tab) => (
              <div key={tab} style={{
                flex: 1,
                padding: '6px 8px',
                background: previews[tab] ? 'rgba(76,175,80,0.08)' : 'var(--c2)',
                border: `1px solid ${previews[tab] ? 'rgba(76,175,80,0.25)' : 'var(--c3)'}`,
                borderRadius: 'var(--r-sm)',
                textAlign: 'center',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: previews[tab] ? '#4caf50' : 'var(--t3)',
              }}>
                {previews[tab] ? '✓' : '—'} {TAB_CONFIG[tab].label}
              </div>
            ))}
          </div>

          {/* Ordem */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--t2)', marginBottom: 6 }}>
              Ordem de exibição
            </label>
            <input
              type="number"
              min={1}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--c2)',
                border: '1px solid var(--c3)',
                borderRadius: 'var(--r-md)',
                color: 'var(--txt)',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Status */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--roxo-v)', cursor: 'pointer' }}
            />
            Banner ativo
          </label>

          {/* Erro */}
          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(229,62,62,0.1)',
              border: '1px solid rgba(229,62,62,0.3)',
              borderRadius: 'var(--r-sm)',
              color: '#fc8181',
              fontSize: '0.82rem',
            }}>
              {error}
            </div>
          )}

          {/* Ações */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              disabled={isBusy}
              style={{
                padding: '10px 20px',
                background: 'var(--c2)',
                border: '1px solid var(--c3)',
                borderRadius: 'var(--r-md)',
                color: 'var(--t2)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isBusy}
              style={{
                padding: '10px 20px',
                background: isBusy ? 'var(--c3)' : 'var(--roxo-v)',
                border: 'none',
                borderRadius: 'var(--r-md)',
                color: '#fff',
                fontWeight: 700,
                cursor: isBusy ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                minWidth: 90,
              }}
            >
              {isBusy ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
