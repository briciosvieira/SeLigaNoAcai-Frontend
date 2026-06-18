import { useState, useRef, useEffect } from 'react';
import { X, Monitor, Smartphone } from 'lucide-react';
import { getImageUrl } from '@/utils/image-url.util';
import { getErrorMessage, isForbiddenError } from '@/utils/format.util';
import { generateSlug } from '@/utils/slug.util';
import { env } from '@/config/env';
import type { Product, Category, CreateProductPayload, UpdateProductPayload } from '@/types/product.types';

// ── Config de abas de imagem (igual ao padrão de banners) ──────────────────
type ImgTab = 'desktop' | 'mobile';

const TAB_CONFIG: Record<ImgTab, { label: string; icon: React.ReactNode; dimension: string; ratio: string }> = {
  desktop: {
    label: 'Desktop & Tablet',
    icon: <Monitor size={15} />,
    dimension: '640 × 1360px',
    ratio: 'Proporção 1:2.1',
  },
  mobile: {
    label: 'Mobile',
    icon: <Smartphone size={15} />,
    dimension: '750 × 390px',
    ratio: 'Proporção 2:1',
  },
};

// ── Props ──────────────────────────────────────────────────────────────────
interface Props {
  product?: Product | null;
  categories: Category[];
  isUploading: boolean;
  isSaving: boolean;
  onClose: () => void;
  onCreate: (payload: CreateProductPayload) => Promise<void>;
  onUpdate: (id: string, payload: UpdateProductPayload) => Promise<void>;
  onUploadImage: (file: File) => Promise<string | null>;
}

type FormData = {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  basePrice: string;
  isActive: boolean;
};

function parsePriceInput(value: string): number {
  return Number(
    value
      .replace(/\./g, '')
      .replace(',', '.')
      .replace(/[^0-9.]/g, ''),
  );
}

// ── Componente ─────────────────────────────────────────────────────────────
export function AdminProductForm({
  product, categories, isUploading, isSaving, onClose, onCreate, onUpdate, onUploadImage,
}: Props) {
  const isEdit = product != null;

  const desktopFileRef = useRef<HTMLInputElement>(null);
  const mobileFileRef  = useRef<HTMLInputElement>(null);

  // Aba ativa
  const [activeTab, setActiveTab] = useState<ImgTab>('desktop');

  // Imagens — URL salva + preview local
  const [desktopUrl, setDesktopUrl]         = useState<string | null>(product?.imageUrl ?? null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(getImageUrl(product?.imageUrl));
  const [mobileUrl, setMobileUrl]           = useState<string | null>(product?.mobileImageUrl ?? null);
  const [mobilePreview, setMobilePreview]   = useState<string | null>(getImageUrl(product?.mobileImageUrl));

  const [uploadErr, setUploadErr]                 = useState<string | null>(null);
  const [isUploadingLocal, setIsUploadingLocal]   = useState(false);

  // Formulário
  const [form, setForm] = useState<FormData>({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    categoryId: product?.categoryId ?? '',
    basePrice: product?.basePrice != null ? String(product.basePrice) : '',
    isActive: product?.isActive ?? true,
  });

  const [slugManual, setSlugManual] = useState(isEdit);
  const [formError, setFormError]   = useState<string | null>(null);
  const [isSavingLocal, setIsSavingLocal] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name ?? '',
        slug: product.slug ?? '',
        description: product.description ?? '',
        categoryId: product.categoryId ?? '',
        basePrice: product.basePrice != null ? String(product.basePrice) : '',
        isActive: product.isActive ?? true,
      });
      setSlugManual(true);
      setDesktopUrl(product.imageUrl ?? null);
      setDesktopPreview(getImageUrl(product.imageUrl));
      setMobileUrl(product.mobileImageUrl ?? null);
      setMobilePreview(getImageUrl(product.mobileImageUrl));
    }
  }, [product?.id]);

  function handleNameChange(value: string) {
    const next: FormData = { ...form, name: value };
    if (!slugManual) next.slug = generateSlug(value);
    setForm(next);
  }

  function handleSlugChange(value: string) {
    setSlugManual(true);
    setForm({ ...form, slug: value });
  }

  async function handleFileSelect(tab: ImgTab, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    if (tab === 'desktop') setDesktopPreview(localPreview);
    else setMobilePreview(localPreview);

    setUploadErr(null);
    setIsUploadingLocal(true);
    try {
      const url = await onUploadImage(file);
      if (url) {
        const full = url.startsWith('http') ? url : `${env.apiUrl}${url}`;
        if (tab === 'desktop') { setDesktopUrl(url); setDesktopPreview(full); }
        else                   { setMobileUrl(url);  setMobilePreview(full); }
      } else {
        setUploadErr('Falha ao enviar imagem. Tente novamente.');
        if (tab === 'desktop') setDesktopPreview(getImageUrl(product?.imageUrl));
        else setMobilePreview(getImageUrl(product?.mobileImageUrl));
      }
    } finally {
      setIsUploadingLocal(false);
      e.target.value = '';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim())   { setFormError('Nome é obrigatório.'); return; }
    if (!form.categoryId)    { setFormError('Selecione uma categoria.'); return; }
    if (!form.basePrice)     { setFormError('Preço base é obrigatório.'); return; }

    const basePrice = parsePriceInput(form.basePrice);
    if (isNaN(basePrice) || basePrice < 0) { setFormError('Preço inválido.'); return; }

    const slug = form.slug?.trim() || generateSlug(form.name);

    const payload: CreateProductPayload = {
      name:           form.name.trim(),
      slug,
      description:    form.description.trim() || null,
      categoryId:     form.categoryId,
      imageUrl:       desktopUrl ?? null,
      mobileImageUrl: mobileUrl ?? null,
      basePrice,
      isActive:       form.isActive,
    };

    setIsSavingLocal(true);
    try {
      if (isEdit && product) {
        await onUpdate(product.id, payload as UpdateProductPayload);
      } else {
        await onCreate(payload);
      }
      onClose();
    } catch (err) {
      setFormError(
        isForbiddenError(err)
          ? 'Você não tem permissão para esta ação.'
          : getErrorMessage(err),
      );
    } finally {
      setIsSavingLocal(false);
    }
  }

  const saving    = isSavingLocal || isSaving;
  const uploading = isUploadingLocal || isUploading;

  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const isComboCategory = selectedCategory
    ? `${selectedCategory.name} ${selectedCategory.slug}`
        .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes('combo')
    : false;

  const cfg = TAB_CONFIG[activeTab];
  const currentPreview = activeTab === 'desktop' ? desktopPreview : mobilePreview;
  const currentRef     = activeTab === 'desktop' ? desktopFileRef : mobileFileRef;

  const desktopHasImg = !!desktopPreview;
  const mobileHasImg  = !!mobilePreview;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000 }} />

      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '94%', maxWidth: 560, maxHeight: '92dvh',
        background: 'var(--bg)', borderRadius: 'var(--r-lg)', zIndex: 1001,
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 14px', borderBottom: '1px solid var(--c3)', flexShrink: 0 }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.05rem' }}>{isEdit ? 'Editar produto' : 'Novo produto'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {formError && (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.82rem', fontWeight: 600 }}>
              {formError}
            </div>
          )}

          {/* ── Imagens com abas ── */}
          <div>
            <label style={lbl}>Imagens do produto</label>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--c2)', borderRadius: 'var(--r-md)', padding: 4, marginBottom: 12 }}>
              {(Object.keys(TAB_CONFIG) as ImgTab[]).map((tab) => {
                const active = tab === activeTab;
                const hasImg = tab === 'desktop' ? desktopHasImg : mobileHasImg;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 6, padding: '7px 4px',
                      background: active ? 'var(--c1)' : 'transparent',
                      border: active ? '1px solid var(--c3)' : '1px solid transparent',
                      borderRadius: 'var(--r-sm)',
                      color: active ? 'var(--roxo-c)' : 'var(--t2)',
                      fontWeight: active ? 700 : 500, fontSize: '0.78rem',
                      cursor: 'pointer', transition: 'all 0.15s', position: 'relative',
                    }}
                  >
                    {TAB_CONFIG[tab].icon}
                    {TAB_CONFIG[tab].label}
                    {hasImg && (
                      <span style={{ position: 'absolute', top: 4, right: 6, width: 6, height: 6, borderRadius: '50%', background: '#4caf50' }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Info de dimensão */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 13px',
              background: 'rgba(139,92,246,0.08)',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: 'var(--r-sm)', marginBottom: 10,
            }}>
              <span style={{ color: 'var(--roxo-c)', display: 'flex' }}>{cfg.icon}</span>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--txt)' }}>{cfg.dimension}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--t2)', marginLeft: 8 }}>{cfg.ratio}</span>
              </div>
            </div>

            {/* Preview */}
            {currentPreview && (
              <div style={{ marginBottom: 8, borderRadius: 'var(--r-sm)', overflow: 'hidden', maxHeight: 150 }}>
                <img
                  src={currentPreview}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: 'var(--c2)' }}
                />
              </div>
            )}

            {/* Botão de upload */}
            <button
              type="button"
              onClick={() => !uploading && currentRef.current?.click()}
              disabled={uploading}
              style={{
                width: '100%', padding: '10px 14px',
                background: 'var(--c2)', border: '1px dashed var(--c3)',
                borderRadius: 'var(--r-md)', color: 'var(--t2)',
                cursor: uploading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, fontSize: '0.875rem', fontWeight: 500,
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => { if (!uploading) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--roxo-v)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--c3)'; }}
            >
              {cfg.icon}
              {uploading
                ? 'Enviando…'
                : currentPreview
                  ? `Trocar imagem ${cfg.label.toLowerCase()}`
                  : `Selecionar imagem ${cfg.label.toLowerCase()}`}
            </button>

            {/* Inputs ocultos */}
            <input ref={desktopFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileSelect('desktop', e)} />
            <input ref={mobileFileRef}  type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileSelect('mobile', e)} />

            {uploadErr && <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: 4 }}>{uploadErr}</p>}

            {/* Resumo das imagens */}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {(['desktop', 'mobile'] as ImgTab[]).map((tab) => {
                const has = tab === 'desktop' ? desktopHasImg : mobileHasImg;
                return (
                  <div key={tab} style={{
                    flex: 1, padding: '5px 8px',
                    background: has ? 'rgba(76,175,80,0.08)' : 'var(--c2)',
                    border: `1px solid ${has ? 'rgba(76,175,80,0.25)' : 'var(--c3)'}`,
                    borderRadius: 'var(--r-sm)',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <span style={{ color: has ? '#4caf50' : 'var(--t3)', fontSize: '0.7rem' }}>
                      {has ? '✓' : '○'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: has ? 'var(--txt)' : 'var(--t2)', fontWeight: has ? 600 : 400 }}>
                      {TAB_CONFIG[tab].label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nome */}
          <FField label="Nome *">
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Nome do produto"
              className="apf-input"
              required
            />
          </FField>

          {/* Slug */}
          <FField label="Slug (URL)">
            <input
              type="text"
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="gerado-automaticamente"
              className="apf-input"
              style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
            />
            <p style={{ fontSize: '0.7rem', color: 'var(--t2)', marginTop: 4 }}>
              Gerado automaticamente pelo nome. Edite somente se necessário.
            </p>
          </FField>

          {/* Descrição */}
          <FField label={isComboCategory ? 'Descrição / itens inclusos no combo' : 'Descrição'}>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={isComboCategory ? 'Ex: 2 açaís de 500ml + 2 complementos' : 'Descrição opcional…'}
              className="apf-input"
              rows={3}
              style={{ resize: 'vertical', minHeight: 72 }}
            />
          </FField>

          {/* Categoria */}
          <FField label="Categoria *">
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="apf-input"
              required
            >
              <option value="">— Selecionar categoria —</option>
              {categories.filter((c) => c.isActive).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FField>

          {/* Preço */}
          <FField label="Preço base (R$) *">
            <input
              type="text"
              value={form.basePrice}
              onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
              placeholder="0,00"
              inputMode="decimal"
              className="apf-input"
            />
          </FField>

          {/* Ativo */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              style={{ accentColor: 'var(--roxo-v)', width: 16, height: 16 }}
            />
            Produto ativo
          </label>

          {/* Footer */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '11px', borderRadius: 'var(--r-md)', border: '1px solid var(--c3)', background: 'var(--c2)', color: 'var(--txt)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              style={{ flex: 1, padding: '11px', borderRadius: 'var(--r-md)', border: 'none', background: 'var(--roxo-v)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: saving || uploading ? 'not-allowed' : 'pointer', opacity: saving || uploading ? 0.6 : 1 }}
            >
              {saving ? 'Salvando…' : uploading ? 'Aguardando upload…' : isEdit ? 'Salvar alterações' : 'Criar produto'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .apf-input {
          width: 100%; padding: 10px 14px; border-radius: var(--r-md);
          border: 1px solid var(--c3); background: var(--c2); color: var(--txt);
          font-size: 0.875rem; transition: border-color 0.15s; box-sizing: border-box;
          font-family: inherit;
        }
        .apf-input:focus { outline: none; border-color: var(--roxo-v); }
      `}</style>
    </>
  );
}

const lbl: React.CSSProperties = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--t2)', marginBottom: 6,
};

function FField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      {children}
    </div>
  );
}
